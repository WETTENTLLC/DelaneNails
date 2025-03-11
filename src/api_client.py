"""
API client for the nail salon booking system.
Can work with both mock data and real API endpoints.
"""
from datetime import datetime
from typing import Dict, List, Any, Optional
import os
import requests

from src.mocks import MockResponses

class NailSalonAPI:
    """Client for nail salon booking API."""
    
    def __init__(self, use_mock: bool = False, api_base_url: Optional[str] = None):
        """
        Initialize the API client.
        
        Args:
            use_mock: If True, use mock responses instead of real API calls
            api_base_url: Base URL for the API (only used when use_mock is False)
        """
        self.use_mock = use_mock
        self.api_base_url = api_base_url or os.getenv("NAIL_SALON_API_URL", "https://api.nailsalon.example")
        
    def get_available_slots(self, service_id: Optional[str] = None, 
                          start_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        Get available appointment slots.
        
        Args:
            service_id: Optional ID of the service to find slots for
            start_date: Optional start date to search from
            
        Returns:
            List of available appointment slots
        """
        if self.use_mock:
            return MockResponses.available_slots(service_id, start_date)
            
        params = {}
        if service_id:
            params["service_id"] = service_id
        if start_date:
            params["start_date"] = start_date.strftime("%Y-%m-%d")
            
        response = requests.get(f"{self.api_base_url}/slots", params=params)
        response.raise_for_status()
        return response.json()
    
    def get_services(self) -> List[Dict[str, Any]]:
        """
        Get available services.
        
        Returns:
            List of service details
        """
        if self.use_mock:
            return MockResponses.services()
            
        response = requests.get(f"{self.api_base_url}/services")
        response.raise_for_status()
        return response.json()
    
    def book_appointment(self, service_id: str, slot_id: str, 
                       customer_details: Dict[str, str]) -> Dict[str, Any]:
        """
        Book an appointment.
        
        Args:
            service_id: ID of the service to book
            slot_id: ID of the time slot to book
            customer_details: Details of the customer
            
        Returns:
            Details of the booked appointment
        """
        if self.use_mock:
            return MockResponses.book_appointment(service_id, slot_id, customer_details)
            
        payload = {
            "service_id": service_id,
            "slot_id": slot_id,
            "customer_details": customer_details
        }
        response = requests.post(f"{self.api_base_url}/appointments", json=payload)
        response.raise_for_status()
        return response.json()
    
    def get_appointment(self, appointment_id: str) -> Dict[str, Any]:
        """
        Get details of an appointment.
        
        Args:
            appointment_id: ID of the appointment
            
        Returns:
            Appointment details
        """
        if self.use_mock:
            return MockResponses.get_appointment(appointment_id)
            
        response = requests.get(f"{self.api_base_url}/appointments/{appointment_id}")
        response.raise_for_status()
        return response.json()
    
    def cancel_appointment(self, appointment_id: str) -> Dict[str, Any]:
        """
        Cancel an appointment.
        
        Args:
            appointment_id: ID of the appointment to cancel
            
        Returns:
            Confirmation of cancellation
        """
        if self.use_mock:
            return MockResponses.cancel_appointment(appointment_id)
            
        response = requests.delete(f"{self.api_base_url}/appointments/{appointment_id}")
        response.raise_for_status()
        return response.json()
