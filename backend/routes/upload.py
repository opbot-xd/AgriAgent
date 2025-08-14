from fastapi import FastAPI, UploadFile, File, Form, Query
import requests
import google.generativeai as genai
import os
from dotenv import load_dotenv
from datetime import datetime
import json
import re
load_dotenv()
from fastapi import APIRouter

router = APIRouter(tags=["Upload"])
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NGROK_URL = os.getenv("NGROK_URL")  # Example: https://xxxx.ngrok-free.app
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")  # e.g., OpenWeatherMap API key
print(WEATHER_API_KEY)
genai.configure(api_key=GEMINI_API_KEY)

from fastapi.middleware.cors import CORSMiddleware





from google.cloud import texttospeech
import base64



def get_weather(coords: str = Query(...)):
    # coords is something like "29.0587757,76.085601"
    lat_str, lon_str = coords.split(",")
    lat = float(lat_str.strip())
    lon = float(lon_str.strip())

    api_key = WEATHER_API_KEY
    print(api_key)
    url = (
        f"https://api.openweathermap.org/data/2.5/weather?"
        f"lat={lat}&lon={lon}&appid={api_key}&units=metric"
    )

    resp = requests.get(url)
    print(resp)
    return resp.json()

@router.post("/")
async def upload_crop_image(
    file: UploadFile = File(...),
    location: str = Form(...),
    language: str = Form(...)
):
    """
    Uploads an image, gets disease prediction, fetches weather, 
    sends everything to Gemini, and returns structured JSON.
    """
    # 1️⃣ Send image to disease detection model
    files = {"file": (file.filename, file.file, file.content_type)}
    print(NGROK_URL)
    flask_response = requests.post(f"{NGROK_URL}/predict", files=files, timeout=60)

    if flask_response.status_code != 200:
        return {"error": f"Model API error: {flask_response.text}"}

    disease_result = flask_response.json()

    # 2️⃣ Get weather info
    weather_data = get_weather(location)
    print(weather_data)
    if "error" in weather_data:
        return weather_data

    temperature = weather_data["main"]["temp"]
    humidity = weather_data["main"]["humidity"]
    weather_desc = weather_data["weather"][0]["description"]

    # 3️⃣ Current date
    current_date = datetime.now().strftime("%Y-%m-%d")

    # 4️⃣ Build prompt for Gemini
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

    # 5️⃣ Call Gemini
    model = genai.GenerativeModel("gemini-1.5-flash")
    print(model)
    gemini_response = model.generate_content(prompt)
    raw_text = gemini_response.text

# Remove ```json and ``` backticks if present
    clean_text = re.sub(r"```(?:json)?\n?", "", raw_text)  # remove opening ```
    clean_text = clean_text.replace("```", "") 
    try:
        ai_data = json.loads(clean_text)
    except Exception:
        ai_data = {"error": "Invalid AI response", "raw": raw_text, "exception": str(e)}

    return {
    "query": f"Disease prediction for uploaded crop image: {file.filename}",
    "response": ai_data.get("description", "No description provided"),
    "confidence": ai_data.get("confidence", 0),
    "recommendations": ai_data.get("recommendations", []),
    #"audio_response": generate_audio(ai_data.get("description", "No description provided")),

    "weather_data": {
        "location": location,
        "temperature": weather_data.get("main", {}).get("temp"),
        "humidity": weather_data.get("main", {}).get("humidity"),
        "description": weather_data.get("weather", [{}])[0].get("description", ""),
        "wind_speed": weather_data.get("wind", {}).get("speed")
    },

    # optional market info if available
    "market_data": None,
    "sources": None,
    "error": None
    }

