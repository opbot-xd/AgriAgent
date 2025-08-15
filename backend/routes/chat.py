from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Dict, List
from schemas.chat import ChatRequest
from services.chat_service import ChatService
import logging

router = APIRouter()
chat_service = ChatService()

@router.post("/chat")
async def chat_endpoint(chat_request: ChatRequest):
    """
    Process a chat message through the agricultural assistant pipeline.
    
    Request format:
    {
        "message": "How do I grow tomatoes?",
        "crop_name": "Tomato",
        "location": {"lat": 12.9716, "lng": 77.5946},  # Example: Bangalore
        "language": "en"
    }
    """
    try:
        # Convert Pydantic model to dict for processing
        request_data = chat_request.dict()
        
        # Process the chat through our service
        response = await chat_service.process_chat(request_data)
        
        if "error" in response:
            raise HTTPException(status_code=400, detail=response["error"])
            
        return JSONResponse(content={
            "response": response["response"],
            "language": response["language"],
            "sources": response.get("sources", {})
        })
        
    except Exception as e:
        logging.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="An error occurred while processing your request"
        )

@router.post("/detect-language")
async def detect_language_endpoint(request: Request):
    data = await request.json()
    text = data.get("text", "")
    lang = await chat_service.detect_language(text)
    return {"language": lang}
