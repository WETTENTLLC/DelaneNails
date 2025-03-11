"""
FastAPI REST API for DelaneNails services.
"""
import logging
import json
import base64
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.agent import BookingAgent
from src.config import config

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="DelaneNails API",
    description="API for DelaneNails salon services and virtual assistant",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the AI agent
agent = BookingAgent(use_mock_api=config.get("use_mock_api", True))

# Define request/response models
class TextRequestModel(BaseModel):
    message: str
    customer_info: Optional[Dict[str, Any]] = None
    reference_id: Optional[str] = None
    channel: str = "web"

class AppointmentRequestModel(BaseModel):
    service_id: str
    preferred_date: Optional[datetime] = None
    preferred_time: Optional[str] = None
    customer_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

class CallbackRequestModel(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    issue_summary: str
    urgency: str = "normal"

@app.get("/")
async def root():
    """API health check endpoint."""
    return {"status": "online", "version": "1.0.0"}

@app.post("/api/chat")
async def chat(request: TextRequestModel):
    """
    Process a text-based chat request.
    """
    try:
        # Call the synchronous process_message method instead of async process_request
        response = agent.process_message(request.message)
        return {"response": response}
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice")
async def voice(audio: UploadFile = File(...)):
    """
    Process voice input.
    """
    try:
        # For now, just return a mock response
        return {
            "success": True,
            "message": "Voice processing feature is under development.",
            "text": "This is a placeholder for voice transcription."
        }
    except Exception as e:
        logger.error(f"Error processing voice input: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/appointments")
async def create_appointment(request: AppointmentRequestModel):
    """
    Book a new appointment.
    """
    try:
        # Use direct booking method instead of async process_request
        customer_details = {
            "name": request.customer_name,
            "phone": request.phone,
            "email": request.email
        }
        
        # Convert preferred_date and time to slot_id format if provided
        slot_id = None
        if request.preferred_date and request.preferred_time:
            date_str = request.preferred_date.strftime("%Y%m%d")
            time_parts = request.preferred_time.split(":")
            hour = time_parts[0].zfill(2)
            minute = time_parts[1].zfill(2) if len(time_parts) > 1 else "00"
            slot_id = f"slot_{date_str}{hour}{minute}"
        
        if not slot_id:
            return {"error": "Missing date or time information"}
            
        # Book the appointment
        result = agent.api.book_appointment(
            service_id=request.service_id,
            slot_id=slot_id,
            customer_details=customer_details
        )
        
        return result
    except Exception as e:
        logger.error(f"Error creating appointment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/callback")
async def request_callback(request: CallbackRequestModel, background_tasks: BackgroundTasks):
    """
    Request a callback from staff.
    """
    try:
        # Schedule the callback
        customer_info = {
            "name": request.name,
            "phone": request.phone,
            "email": request.email
        }
        
        # Use background task to avoid blocking
        background_tasks.add_task(
            agent.notification_service.schedule_callback,
            customer_info=customer_info,
            issue_summary=request.issue_summary
        )
        
        return {
            "success": True,
            "message": "Callback request received. Our staff will contact you shortly."
        }
    except Exception as e:
        logger.error(f"Error scheduling callback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/send-reminders")
async def send_reminders(background_tasks: BackgroundTasks):
    """
    Trigger sending of appointment reminders.
    """
    # Simple mock response as this feature relies on notification service
    return {
        "success": True,
        "message": "Reminder functionality is available in the full version."
    }

if __name__ == "__main__":
    # Run the API server
    uvicorn.run("src.api:app", host="0.0.0.0", port=8000, reload=True)
