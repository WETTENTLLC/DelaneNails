"""
Mock responses for testing the agent without external API calls.
"""
from typing import Dict, List, Any
from datetime import datetime, timedelta

class MockResponses:
    """Container for mock API responses."""
    
    @staticmethod
    def available_slots(service_id: str = None, start_date: datetime = None) -> List[Dict[str, Any]]:
        """Generate mock available appointment slots."""
        if start_date is None:
            start_date = datetime.now()
        
        # Generate slots for the next 7 days
        slots = []
        for day_offset in range(7):
            current_date = start_date + timedelta(days=day_offset)
            
            # Generate 8 slots per day (9am to 5pm)
            for hour in range(9, 17):
                slot_time = current_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                
                # Skip slots in the past
                if slot_time < datetime.now():
                    continue
                    
                slot = {
                    "id": f"slot_{slot_time.strftime('%Y%m%d%H%M')}",
                    "start_time": slot_time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "end_time": (slot_time + timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%S"),
                    "available": True,
                    "service_id": service_id or "default-service"
                }
                slots.append(slot)
        
        return slots
    
    @staticmethod
    def services() -> List[Dict[str, Any]]:
        """Return mock services offered."""
        return [
            {
                "id": "service-001",
                "name": "Manicure",
                "description": "Basic manicure service",
                "duration": 60,
                "price": 35.00
            },
            {
                "id": "service-002",
                "name": "Pedicure",
                "description": "Basic pedicure service",
                "duration": 45,
                "price": 40.00
            },
            {
                "id": "service-003",
                "name": "Gel Nails",
                "description": "Gel nail application",
                "duration": 75,
                "price": 55.00
            },
            {
                "id": "service-004",
                "name": "Nail Art",
                "description": "Custom nail art designs",
                "duration": 90,
                "price": 65.00
            }
        ]
    
    @staticmethod
    def book_appointment(service_id: str, slot_id: str, customer_details: Dict[str, str]) -> Dict[str, Any]:
        """Mock booking an appointment."""
        # Extract date and time from the slot ID
        date_time_str = slot_id.replace("slot_", "")
        year = int(date_time_str[0:4])
        month = int(date_time_str[4:6])
        day = int(date_time_str[6:8])
        hour = int(date_time_str[8:10])
        minute = int(date_time_str[10:12])
        
        appointment_time = datetime(year, month, day, hour, minute)
        
        return {
            "appointment_id": f"appt-{slot_id}",
            "service_id": service_id,
            "status": "confirmed",
            "start_time": appointment_time.strftime("%Y-%m-%dT%H:%M:%S"),
            "end_time": (appointment_time + timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%S"),
            "customer_name": customer_details.get("name", ""),
            "customer_email": customer_details.get("email", ""),
            "customer_phone": customer_details.get("phone", "")
        }
    
    @staticmethod
    def get_appointment(appointment_id: str) -> Dict[str, Any]:
        """Mock retrieving appointment details."""
        # Just a basic mock that assumes the appointment exists
        return {
            "appointment_id": appointment_id,
            "status": "confirmed",
            "service_name": "Manicure",
            "start_time": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%S"),
            "customer_name": "Test Customer"
        }
    
    @staticmethod
    def cancel_appointment(appointment_id: str) -> Dict[str, Any]:
        """Mock canceling an appointment."""
        return {
            "appointment_id": appointment_id,
            "status": "canceled",
            "message": "Appointment successfully canceled"
        }
