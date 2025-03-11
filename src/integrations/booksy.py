"""
Booksy API integration for real-time appointment scheduling.
"""
import logging
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

from src.config import Config

logger = logging.getLogger(__name__)

class BooksyAPI:
    """Client for interacting with Booksy's scheduling API."""
    
    BASE_URL = "https://api.booksy.com/api/v2"
    
    def __init__(self, api_key: Optional[str] = None, business_id: Optional[str] = None):
        """
        Initialize the Booksy API client.
        
        Args:
            api_key: Booksy API key
            business_id: Booksy Business ID
        """
        self.api_key = api_key or Config.get("BOOKSY_API_KEY")
        self.business_id = business_id or Config.get("BOOKSY_BUSINESS_ID")
        
        if not self.api_key:
            raise ValueError("Booksy API key is required")
        if not self.business_id:
            raise ValueError("Booksy Business ID is required")
            
        logger.info(f"Initialized Booksy API client for business ID: {self.business_id}")
        
    def _get_headers(self) -> Dict[str, str]:
        """Return headers for API requests."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
    def get_available_slots(self, service_id: str, start_date: datetime, 
                            end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        Get available appointment slots for a service.
        
        Args:
            service_id: ID of the service
            start_date: Start date for availability search
            end_date: End date for availability search (defaults to 7 days from start)
            
        Returns:
            List of available time slots
        """
        if end_date is None:
            end_date = start_date + timedelta(days=7)
            
        endpoint = f"{self.BASE_URL}/businesses/{self.business_id}/availability"
        
        params = {
            "service_id": service_id,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d")
        }
        
        try:
            response = requests.get(
                endpoint, 
                headers=self._get_headers(),
                params=params
            )
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Retrieved {len(data.get('slots', []))} available slots")
            return data.get("slots", [])
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching available slots: {str(e)}")
            return []
    
    def get_services(self) -> List[Dict[str, Any]]:
        """
        Get list of available services.
        
        Returns:
            List of services with details
        """
        endpoint = f"{self.BASE_URL}/businesses/{self.business_id}/services"
        
        try:
            response = requests.get(endpoint, headers=self._get_headers())
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Retrieved {len(data.get('services', []))} services")
            return data.get("services", [])
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching services: {str(e)}")
            return []
            
    def create_appointment(self, service_id: str, staff_id: str, 
                          start_time: datetime, customer_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new appointment.
        
        Args:
            service_id: ID of the service
            staff_id: ID of the staff member
            start_time: Appointment start time
            customer_info: Customer details (name, email, phone)
            
        Returns:
            Created appointment details or error
        """
        endpoint = f"{self.BASE_URL}/businesses/{self.business_id}/appointments"
        
        data = {
            "service_id": service_id,
            "staff_id": staff_id,
            "start_time": start_time.isoformat(),
            "customer": customer_info
        }
        
        try:
            response = requests.post(
                endpoint,
                headers=self._get_headers(),
                json=data
            )
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Created appointment ID: {result.get('id')}")
            
            # Send notification about new appointment
            from src.services.notification import NotificationService
            notification = NotificationService()
            notification.send_appointment_confirmation(
                email=customer_info.get("email"),
                appointment_details=result,
                admin_email="maecity@aol.com"
            )
            
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error creating appointment: {str(e)}")
            raise
            
    def update_appointment(self, appointment_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing appointment.
        
        Args:
            appointment_id: ID of the appointment to update
            updates: Fields to update
            
        Returns:
            Updated appointment details
        """
        endpoint = f"{self.BASE_URL}/businesses/{self.business_id}/appointments/{appointment_id}"
        
        try:
            response = requests.patch(
                endpoint,
                headers=self._get_headers(),
                json=updates
            )
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Updated appointment ID: {appointment_id}")
            
            # Send notification about updated appointment
            from src.services.notification import NotificationService
            notification = NotificationService()
            notification.send_appointment_update(
                appointment_details=result,
                admin_email="maecity@aol.com"
            )
            
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error updating appointment: {str(e)}")
            raise
            
    def get_appointments(self, start_date: datetime, 
                        end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        Get appointments in a date range.
        
        Args:
            start_date: Start date for appointment search
            end_date: End date for appointment search (defaults to same day as start)
            
        Returns:
            List of appointments
        """
        if end_date is None:
            end_date = start_date
            
        endpoint = f"{self.BASE_URL}/businesses/{self.business_id}/appointments"
        
        params = {
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d")
        }
        
        try:
            response = requests.get(
                endpoint,
                headers=self._get_headers(),
                params=params
            )
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Retrieved {len(data.get('appointments', []))} appointments")
            return data.get("appointments", [])
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching appointments: {str(e)}")
            return []
