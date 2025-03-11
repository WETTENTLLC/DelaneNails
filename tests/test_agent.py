"""
Test suite for the AI Agent core functionality.
"""
import pytest
import json
import asyncio
from datetime import datetime
from unittest.mock import MagicMock, patch

from src.agent import Agent, RequestType


@pytest.fixture
def agent():
    """Create an agent with mocked dependencies for testing."""
    with patch('src.agent.BooksyAPI'), \
         patch('src.agent.VoiceService'), \
         patch('src.agent.NotificationService'), \
         patch('src.agent.EmailService'), \
         patch('src.agent.Config'), \
         patch('src.agent.openai'):
        agent = Agent()
        # Mock conversation to avoid actual API calls
        agent.conversation = MagicMock()
        return agent


@pytest.mark.asyncio
async def test_identify_request_type(agent):
    """Test the request type identification."""
    # Setup
    agent._identify_request_type = Agent._identify_request_type  # Keep original method
    
    # Test appointment request
    request_data = {"message": "I'd like to schedule a manicure for next Friday"}
    result = agent._identify_request_type(request_data, "web")
    assert result == RequestType.APPOINTMENT
    
    # Test inquiry
    request_data = {"message": "What services do you offer?"}
    result = agent._identify_request_type(request_data, "web")
    assert result == RequestType.INQUIRY
    
    # Test complaint
    request_data = {"message": "I'm not happy with my recent pedicure, the polish is already chipping"}
    result = agent._identify_request_type(request_data, "web")
    assert result == RequestType.COMPLAINT


@pytest.mark.asyncio
async def test_extract_appointment_details(agent):
    """Test extraction of appointment details."""
    # Setup mock response
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(text=json.dumps({
        "service_type": "gel manicure",
        "preferred_date": "2023-12-25",
        "preferred_time": "2:00 PM",
        "customer_name": "Jane Doe",
        "phone": "555-123-4567",
        "email": "jane@example.com"
    }))]
    agent.openai.Completion.create.return_value = mock_response
    
    # Test
    request_data = {"message": "I'd like to book a gel manicure on Christmas at 2pm. My name is Jane Doe."}
    details = agent._extract_appointment_details(request_data, "web")
    
    # Assert
    assert details.get("service_id") == "mani002"  # From the mapping
    assert "preferred_date" in details
    assert details.get("customer_name") == "Jane Doe"
    assert details.get("email") == "jane@example.com"


@pytest.mark.asyncio
async def test_handle_inquiry(agent):
    """Test handling inquiry requests."""
    # Setup mock for services
    agent.booksy.get_services.return_value = [
        {"id": "mani001", "name": "Basic Manicure", "price": 25.00},
        {"id": "mani002", "name": "Gel Manicure", "price": 40.00}
    ]
    
    # Test hours inquiry
    request_data = {"message": "What are your opening hours?"}
    agent._extract_inquiry_type = MagicMock(return_value="hours")
    response = await agent._handle_inquiry(request_data, "web")
    
    assert response["response_type"] == "text"
    assert "open" in response["message"].lower()
    
    # Test services inquiry
    agent._extract_inquiry_type = MagicMock(return_value="services")
    response = await agent._handle_inquiry(request_data, "web")
    
    assert response["response_type"] == "text"
    assert "services" in response["message"].lower()
    assert "services" in response["data"]


@pytest.mark.asyncio
async def test_process_voice_input(agent):
    """Test processing voice input."""
    # Setup mocks
    speech_result = {
        "success": True,
        "text": "I want to book a manicure",
        "confidence": 0.95
    }
    agent.voice_service.speech_to_text = MagicMock(return_value=asyncio.Future())
    agent.voice_service.speech_to_text.return_value.set_result(speech_result)
    
    agent.process_request = MagicMock(return_value=asyncio.Future())
    agent.process_request.return_value.set_result({
        "response_type": "voice",
        "message": "I can help you book a manicure. What date works for you?",
        "action": "gather_date_info"
    })
    
    tts_result = {
        "success": True,
        "audio_content": b"fake_audio_data",
        "audio_base64": "base64_encoded_audio"
    }
    agent.voice_service.text_to_speech = MagicMock(return_value=asyncio.Future())
    agent.voice_service.text_to_speech.return_value.set_result(tts_result)
    
    # Test
    result = await agent.process_voice_input(b"fake_audio_input")
    
    # Assertions
    assert result["response_type"] == "voice"
    assert "audio_base64" in result
    assert result["transcription"] == "I want to book a manicure"
