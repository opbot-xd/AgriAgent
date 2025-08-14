import os
from googletrans import Translator
import google.generativeai as genai
from openai import OpenAI
from typing import Dict, List, Optional
import logging
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.translator = Translator()
        
        # Configure Gemini
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        self.gemini_model = genai.GenerativeModel('gemini-pro')
        
        # Initialize Dhenu AI client
        self.dhenu_client = OpenAI(
            base_url="https://api.dhenu.ai/v1",
            api_key=os.getenv('DHENU_API_KEY')
        )

    async def detect_language(self, text: str) -> str:
        """Detect the language of the given text"""
        try:
            if not text.strip():
                return 'en'
            detected = self.translator.detect(text)
            return detected.lang
        except Exception as e:
            logger.error(f"Language detection error: {str(e)}")
            return 'en'  # Default to English if detection fails
            
    async def translate_text(self, text: str, target_lang: str, source_lang: str = 'auto') -> str:
        """
        Translate text to target language
        
        Args:
            text: Text to translate
            target_lang: Target language code (e.g., 'hi', 'es')
            source_lang: Source language code (default: 'auto' for auto-detection)
        """
        try:
            if not text.strip() or target_lang == source_lang:
                return text
                
            translation = self.translator.translate(text, dest=target_lang, src=source_lang)
            return translation.text
        except Exception as e:
            logger.error(f"Translation error: {str(e)}")
            return text  # Return original text if translation fails

    async def get_gemini_response(self, prompt: str, context: Dict) -> str:
        """Get response from Gemini model"""
        try:
            # Prepare context for the prompt
            weather = context.get('weather', {})
            weather_str = self.format_weather(weather)
            context_str = f"""
            Context:
            - Crop: {context.get('crop_name', 'Not specified')}
            - Location: {context.get('location', 'Not specified')}
            - Weather: {weather_str}
            - Previous messages: {len(context.get('messages', []))} messages
            
            Question: {prompt}
            """
            
            response = await self.gemini_model.generate_content_async(context_str)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return "I'm sorry, I encountered an error processing your request with Gemini."

    async def get_dhenu_response(self, prompt: str, context: Dict) -> str:
        """Get response from Dhenu AI model"""
        try:
            # Prepare context for the prompt
            weather = context.get('weather', {})
            weather_str = self.format_weather(weather)
            context_str = f"""
            Context:
            - Crop: {context.get('crop_name', 'Not specified')}
            - Location: {context.get('location', 'Not specified')}
            - Weather: {weather_str}
            - Previous messages: {len(context.get('messages', []))} messages
            """
            
            # Format messages for Dhenu AI
            messages = [{"role": "system", "content": f"You are an agricultural assistant. {context_str}"}]
            messages.extend([{"role": msg["role"], "content": msg["content"]} 
                          for msg in context.get('messages', [])[-5:]])  # Last 5 messages for context
            # Add the current user message
            messages.append({"role": "user", "content": prompt})
            # Call Dhenu AI
            response = self.dhenu_client.chat.completions.create(
                model="dhenu2-in-8b-preview",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Dhenu AI API error: {str(e)}")
            return "I apologize, but I'm having trouble connecting to the Dhenu AI assistant."

    async def get_enhanced_response(self, prompt: str, dhenu_response: str, context: Dict) -> str:
        """Get enhanced response from Gemini using Dhenu's advice as context"""
        try:
            # Prepare enhanced prompt for Gemini
            weather = context.get('weather', {})
            weather_str = self.format_weather(weather)
            enhanced_prompt = f"""
            You are an agricultural expert assistant. Below is some advice from another AI model (Dhenu AI) 
            about the following agricultural query. Please analyze this advice and provide a comprehensive, 
            well-structured response that combines the best insights.
            
            User's Question: {prompt}
            
            Context:
            - Crop: {context.get('crop_name', 'Not specified')}
            - Location: {context.get('location', 'Not specified')}
            - Weather: {weather_str}
            
            Dhenu AI's Advice:
            {dhenu_response}
            
            Please provide a detailed response that:
            1. Acknowledges the user's question
            2. Incorporates the most relevant points from Dhenu's advice
            3. Adds any additional insights or clarifications
            4. Is well-structured and easy to understand
            5. Is tailored for the specified crop and location when relevant
            """
            
            response = await self.gemini_model.generate_content_async(enhanced_prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error getting enhanced response: {str(e)}")
            return dhenu_response  # Fallback to Dhenu's response if enhancement fails

    async def get_location_name(self, lat: float, lng: float) -> str:
        """Convert coordinates to location name using Nominatim"""
        try:
            url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json"
            headers = {
                "User-Agent": "AgriAgent/1.0 (your-email@example.com)"
            }
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Try to get the most specific location name available
            address = data.get('address', {})
            return address.get('county') or address.get('state') or data.get('display_name', 'Unknown Location')
        except Exception as e:
            logger.error(f"Error getting location: {str(e)}")
            return "Unknown Location"

    async def get_weather(self, lat: float, lng: float) -> dict:
        """Fetch weather data from OpenWeatherMap API for given coordinates."""
        try:
            WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
            if not WEATHER_API_KEY:
                logger.error("WEATHER_API_KEY not set in environment.")
                return {"error": "Weather API key not configured."}
            import httpx
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={WEATHER_API_KEY}&units=metric"
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(url)
                if resp.status_code != 200:
                    logger.error(f"Weather API error: {resp.text}")
                    return {"error": "Weather API error", "details": resp.text}
                return resp.json()
        except Exception as e:
            logger.error(f"Exception fetching weather: {str(e)}")
            return {"error": "Exception fetching weather", "details": str(e)}

    def format_weather(self, weather: dict) -> str:
        """Format weather dictionary into a readable string for context."""
        if not weather or 'error' in weather:
            return weather.get('error', 'No weather data available') if isinstance(weather, dict) else 'No weather data available'
        desc = weather.get('weather', [{}])[0].get('description', '')
        temp = weather.get('main', {}).get('temp', '')
        humidity = weather.get('main', {}).get('humidity', '')
        wind = weather.get('wind', {}).get('speed', '')
        return f"{desc}, Temperature: {temp}°C, Humidity: {humidity}%, Wind Speed: {wind} m/s"

    async def process_chat(self, request_data: Dict) -> Dict:
        """Process chat request through the pipeline with language handling"""
        try:
            # Extract user message and location
            user_message = request_data.get('message', '').strip()
            if not user_message:
                return {"error": "No message provided"}
            
            # Get location details
            location = request_data.get('location', {})
            lat = location.get('lat')
            lng = location.get('lng')
            
            if not all([lat, lng]):
                location_name = "Unknown Location"
                weather_data = {"error": "No coordinates provided"}
            else:
                location_name = await self.get_location_name(lat, lng)
                weather_data = await self.get_weather(lat, lng)
            
            # Detect the original language of the user's message
            original_language = await self.detect_language(user_message)
            
            # Translate user message to English for processing
            if original_language != 'en':
                user_message_en = await self.translate_text(
                    text=user_message,
                    target_lang='en',
                    source_lang=original_language
                )
            else:
                user_message_en = user_message
            
            # Prepare context for LLMs
            context = {
                'crop_name': request_data.get('crop_name') or 'Not specifified see in the message/context itself',
                'location': location_name,
                'weather': weather_data,
                'messages': [{'role': 'user', 'content': user_message_en}]
            }
            
            # Get response from Dhenu AI
            dhenu_response = await self.get_dhenu_response(user_message_en, context)
            
            # Get enhanced response from Gemini using Dhenu's response as context
            final_response_en = await self.get_enhanced_response(
                prompt=user_message_en,
                dhenu_response=dhenu_response,
                context=context
            )
            
            # Translate the final response back to the original language if needed
            if original_language != 'en':
                final_response = await self.translate_text(
                    text=final_response_en,
                    target_lang=original_language,
                    source_lang='en'
                )
                
                # Also translate Dhenu's advice for the sources
                dhenu_advice_translated = await self.translate_text(
                    text=dhenu_response,
                    target_lang=original_language,
                    source_lang='en'
                )
            else:
                final_response = final_response_en
                dhenu_advice_translated = dhenu_response
            
            return {
                "response": final_response,
                "language": original_language,
                "sources": {
                    "original_language": original_language,
                    "dhenu_advice": dhenu_advice_translated,
                    "english_response": final_response_en  # Include English version for reference
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing chat: {str(e)}")
            return {"error": "An error occurred while processing your request"}
