import asyncio
from fastapi import UploadFile, File, Form, APIRouter
from io import BytesIO
import base64
import re
import json
from datetime import datetime
import httpx
from gtts import gTTS
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(tags=["Upload"])
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NGROK_URL = os.getenv("NGROK_URL")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")
genai.configure(api_key=GEMINI_API_KEY)
API_URL=os.getenv("HF_API_URL")

# -------------------------
# TTS in-memory
# -------------------------
from io import BytesIO
from gtts import gTTS
import base64

def generate_audio(text: str, language: str = "en") -> str:
    if not text.strip():
        return ""  # empty text, return empty string

    try:
        buf = BytesIO()
        tts = gTTS(text=text, lang=language)
        tts.write_to_fp(buf)
        buf.seek(0)  # important: rewind to start before reading
        audio_b64 = base64.b64encode(buf.read()).decode("utf-8")
        return audio_b64
    except Exception as e:
        print("TTS generation error:", e)
        return ""
'''
def generate_audio(text: str, language: str = "en") -> str:
    try:
        buf = BytesIO()
        tts = gTTS(text=text, lang=language)
        tts.write_to_fp(buf)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")
    except Exception as e:
        print("TTS error:", e)
        return ""
        '''

# -------------------------
# Async API calls
# -------------------------
async def get_weather(coords: str):
    lat_str, lon_str = coords.split(",")
    lat = float(lat_str.strip())
    lon = float(lon_str.strip())
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            return {"error": "Weather API error", "details": resp.text}
        return resp.json()


async def get_disease(file: UploadFile):
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": file.content_type or "image/jpeg"   # 👈 specify image type
    }
  
    # Read file content as bytes
    image_bytes = await file.read()

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            API_URL,
            headers=headers,
            content=image_bytes   # 👈 raw binary
        )

        if resp.status_code != 200:
            return {
                "error": "HuggingFace API error",
                "status_code": resp.status_code,
                "details": resp.text
            }

        return resp.json()

def call_gemini(disease_result, weather_data, location, language):
    current_date = datetime.now().strftime("%Y-%m-%d")
    temperature = weather_data.get("main", {}).get("temp", 0)
    humidity = weather_data.get("main", {}).get("humidity", 0)
    weather_desc = weather_data.get("weather", [{}])[0].get("description", "")

    prompt = f"""
    The crop disease detection model found the following disease:
    {disease_result}
    language: {language}
    Location: {location}
    Date: {current_date}
    Weather: {weather_desc}, Temperature: {temperature}°C, Humidity: {humidity}%

    Please analyze the disease and weather conditions in the given language and return JSON in this exact format:
    {{
      "disease": "<disease name>",
      "confidence": <float between 0-1>,
      "description": "<short disease description>",
      "recommendations": [
        "Recommendation 1",
        "Recommendation 2"
      ],
      "location": "{location}",
      "date": "{current_date}",
      "temperature": {temperature},
      "humidity": {humidity},
      "weather": "{weather_desc}"
    }}
    """
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    raw_text = response.text

    # Clean JSON
    clean_text = re.sub(r"```(?:json)?\n?", "", raw_text).replace("```", "")
    try:
        return json.loads(clean_text)
    except Exception as e:
        return {"error": "Invalid AI response", "raw": raw_text, "exception": str(e)}

# -------------------------
# Endpoint
# -------------------------
@router.post("/")
async def upload_crop_image(file: UploadFile = File(...), location: str = Form(...), language: str = Form(...)):
    # 1️⃣ Run disease detection and weather fetch in parallel
    disease_task = asyncio.create_task(get_disease(file))
    weather_task = asyncio.create_task(get_weather(location))
    disease_result, weather_data = await asyncio.gather(disease_task, weather_task)

    # Check errors
    if "error" in disease_result:
        return disease_result
    if "error" in weather_data:
        return weather_data

    # 2️⃣ Gemini depends on both results
    gemini_data = call_gemini(disease_result, weather_data, location, language)

    # 3️⃣ Generate audio (can later move to background task)
    audio_b64 = generate_audio(gemini_data.get("description", "No description provided"), language)

    return {
        "query": f"Disease prediction for uploaded crop image: {file.filename}",
        "response": gemini_data.get("description", "No description provided"),
        "confidence": gemini_data.get("confidence", 0),
        "recommendations": gemini_data.get("recommendations", []),
        "audio_response": audio_b64,
       # "weather_data": weather_data,
       "weather_data": { "location": location, "temperature": weather_data.get("main", {}).get("temp"), "humidity": weather_data.get("main", {}).get("humidity"), "description": weather_data.get("weather", [{}])[0].get("description", ""), "wind_speed": weather_data.get("wind", {}).get("speed") },
        "market_data": None,
        "sources": None,
        "error": None
    }
