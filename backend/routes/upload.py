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

genai.configure(api_key=GEMINI_API_KEY)

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
    files = {"file": (file.filename, file.file, file.content_type)}
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(f"{NGROK_URL}/predict", files=files)
        if resp.status_code != 200:
            return {"error": "Disease model API error", "details": resp.text}
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

# from fastapi import FastAPI, UploadFile, File, Form, Query
# import requests
# import google.generativeai as genai
# import os
# from dotenv import load_dotenv
# from datetime import datetime
# import json
# import re
# load_dotenv()
# from fastapi import APIRouter

# router = APIRouter(tags=["Upload"])
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# NGROK_URL = os.getenv("NGROK_URL")  # Example: https://xxxx.ngrok-free.app
# WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")  # e.g., OpenWeatherMap API key
# print(WEATHER_API_KEY)
# genai.configure(api_key=GEMINI_API_KEY)

# from fastapi.middleware.cors import CORSMiddleware

# from gtts import gTTS
# import base64

# def generate_audio(text: str, language: str = "en") -> str:
#     """
#     Converts text to speech and returns base64-encoded MP3 audio.
#     language should be one of: 'en','hi','bn','ta','te','mr','gu','pa'
#     """
#     try:
#         tts = gTTS(text=text, lang=language)
#         tts.save("temp.mp3")
        
#         with open("temp.mp3", "rb") as f:
#             audio_base64 = base64.b64encode(f.read()).decode("utf-8")
#         return audio_base64
#     except Exception as e:
#         print("TTS generation error:", e)
#         return ""


# def get_weather(coords: str = Query(...)):
#     # coords is something like "29.0587757,76.085601"
#     lat_str, lon_str = coords.split(",")
#     lat = float(lat_str.strip())
#     lon = float(lon_str.strip())

#     api_key = WEATHER_API_KEY
#     print(api_key)
#     url = (
#         f"https://api.openweathermap.org/data/2.5/weather?"
#         f"lat={lat}&lon={lon}&appid={api_key}&units=metric"
#     )

#     resp = requests.get(url)
#     print(resp)
#     return resp.json()


# @router.post("/")
# async def upload_crop_image(
#     file: UploadFile = File(...),
#     location: str = Form(...),
#     language: str = Form(...)
# ):
#     """
#     Uploads an image, gets disease prediction, fetches weather, 
#     sends everything to Gemini, and returns structured JSON.
#     """
#     # 1️⃣ Send image to disease detection model
#     files = {"file": (file.filename, file.file, file.content_type)}
#     print(NGROK_URL)
#     flask_response = requests.post(f"{NGROK_URL}/predict", files=files, timeout=60)

#     if flask_response.status_code != 200:
#         return {"error": f"Model API error: {flask_response.text}"}

#     disease_result = flask_response.json()

#     # 2️⃣ Get weather info
#     weather_data = get_weather(location)
#     print(weather_data)
#     if "error" in weather_data:
#         return weather_data

#     temperature = weather_data["main"]["temp"]
#     humidity = weather_data["main"]["humidity"]
#     weather_desc = weather_data["weather"][0]["description"]

#     # 3️⃣ Current date
#     current_date = datetime.now().strftime("%Y-%m-%d")

#     # 4️⃣ Build prompt for Gemini
#     prompt = f"""
#     The crop disease detection model found the following disease:
#     {disease_result}
#     language: {language}
#     Location: {location}
#     Date: {current_date}
#     Weather: {weather_desc}, Temperature: {temperature}°C, Humidity: {humidity}%

#     Please analyze the disease and weather conditions in the given language and return JSON in this exact format:
#     {{
#       "disease": "<disease name>",
#       "confidence": <float between 0-1>,
#       "description": "<short disease description>",
#       "recommendations": [
#         "Recommendation 1",
#         "Recommendation 2"
#       ],
#       "location": "{location}",
#       "date": "{current_date}",
#       "temperature": {temperature},
#       "humidity": {humidity},
#       "weather": "{weather_desc}"
#     }}
#     """

#     # 5️⃣ Call Gemini
#     model = genai.GenerativeModel("gemini-1.5-flash")
#     print(model)
#     gemini_response = model.generate_content(prompt)
#     raw_text = gemini_response.text

# # Remove ```json and ``` backticks if present
#     clean_text = re.sub(r"```(?:json)?\n?", "", raw_text)  # remove opening ```
#     clean_text = clean_text.replace("```", "") 
#     try:
#         ai_data = json.loads(clean_text)
#     except Exception:
#         ai_data = {"error": "Invalid AI response", "raw": raw_text, "exception": str(e)}

#     return {
#     "query": f"Disease prediction for uploaded crop image: {file.filename}",
#     "response": ai_data.get("description", "No description provided"),
#     "confidence": ai_data.get("confidence", 0),
#     "recommendations": ai_data.get("recommendations", []),
#     "audio_response": generate_audio(ai_data.get("description", "No description provided")),

#     "weather_data": {
#         "location": location,
#         "temperature": weather_data.get("main", {}).get("temp"),
#         "humidity": weather_data.get("main", {}).get("humidity"),
#         "description": weather_data.get("weather", [{}])[0].get("description", ""),
#         "wind_speed": weather_data.get("wind", {}).get("speed")
#     },

#     # optional market info if available
#     "market_data": None,
#     "sources": None,
#     "error": None
#     }

