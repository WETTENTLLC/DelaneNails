"""
Basic tests for the DelaneNails system.
"""
import pytest
import os
import sys

# Add the project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.api_client import NailSalonAPI
from src.agent import BookingAgent

def test_api_client_mock():
    """Test NailSalonAPI with mock data."""
    api = NailSalonAPI(use_mock=True)
    
    # Test getting services
    services = api.get_services()
    assert len(services) > 0
    assert "name" in services[0]
    assert "price" in services[0]
    
    # Test getting slots
    slots = api.get_available_slots()
    assert len(slots) > 0
    assert "start_time" in slots[0]
    
    # Test booking appointment
    customer_details = {
        "name": "Test User",
        "email": "test@example.com",
        "phone": "555-1234"
    }
    appointment = api.book_appointment(
        service_id=services[0]["id"],
        slot_id=slots[0]["id"],
        customer_details=customer_details
    )
    
    assert appointment["customer_name"] == "Test User"
    assert "appointment_id" in appointment
    
    # Test getting appointment
    appt = api.get_appointment(appointment["appointment_id"])
    assert appt["status"] == "confirmed"
    
    # Test canceling appointment
    result = api.cancel_appointment(appointment["appointment_id"])
    assert result["status"] == "canceled"

def test_booking_agent():
    """Test BookingAgent conversation flow."""
    agent = BookingAgent(use_mock_api=True)
    
    # Test greeting
    response = agent.process_message("hello")
    assert "Welcome to Delane Nails" in response
    
    # Test listing services
    response = agent.process_message("what services do you offer?")
    assert "Here are the services we offer" in response
    
    # Starting booking flow would require mock inputs, which is complex
    # for a basic test. Just verify the conversation state is initialized.
    response = agent.process_message("I want to book an appointment")
    assert "book" in agent.conversation_state
    assert agent.conversation_state["book"]["stage"] == "service_selection"

if __name__ == "__main__":
    print("Running basic tests...")
    test_api_client_mock()
    test_booking_agent()
    print("All tests passed!")
