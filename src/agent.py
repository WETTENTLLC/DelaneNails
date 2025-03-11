"""
Nail salon booking agent that handles conversation flow with customers.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import re
import json

from src.api_client import NailSalonAPI

class BookingAgent:
    """Agent for handling nail salon booking conversations."""
    
    def __init__(self, use_mock_api: bool = True):
        """
        Initialize the booking agent.
        
        Args:
            use_mock_api: Whether to use mock API responses
        """
        self.api = NailSalonAPI(use_mock=use_mock_api)
        self.conversation_state = {}
        self.current_context = {}
    
    def process_message(self, message: str) -> str:
        """
        Process an incoming message and return a response.
        
        Args:
            message: The message from the user
            
        Returns:
            Response to the user
        """
        # Check for intent
        intent = self._determine_intent(message)
        
        # Handle based on intent
        if intent == "greeting":
            return self._handle_greeting()
        elif intent == "book_appointment":
            return self._handle_booking_flow(message)
        elif intent == "check_appointment":
            return self._handle_appointment_check(message)
        elif intent == "cancel_appointment":
            return self._handle_appointment_cancellation(message)
        elif intent == "list_services":
            return self._handle_list_services()
        else:
            return "I'm here to help you book nail services. Would you like to schedule an appointment, check an existing appointment, or learn about our services?"
    
    def _determine_intent(self, message: str) -> str:
        """Determine the intent of the message."""
        message = message.lower()
        
        if any(word in message for word in ["hello", "hi", "hey", "greetings"]):
            return "greeting"
        elif any(word in message for word in ["book", "schedule", "appointment", "reserve"]):
            return "book_appointment"
        elif any(phrase in message for phrase in ["check appointment", "appointment status", "my booking"]):
            return "check_appointment"
        elif any(phrase in message for phrase in ["cancel appointment", "cancel booking"]):
            return "cancel_appointment"
        # Expanded service-related keywords
        elif any(word in message for word in ["service", "services", "offer", "provide", "available", "what can you do"]):
            return "list_services"
        elif "book" in self.conversation_state:
            return "book_appointment"
        elif "check" in self.conversation_state:
            return "check_appointment"
        elif "cancel" in self.conversation_state:
            return "cancel_appointment"
        else:
            return "unknown"
    
    def _handle_greeting(self) -> str:
        """Handle greeting intent."""
        return ("Hello! Welcome to Delane Nails. I can help you book an appointment, "
                "check your existing appointment, or provide information about our services. "
                "What would you like to do today?")
    
    def _handle_booking_flow(self, message: str) -> str:
        """Handle the booking flow based on current state."""
        # Initialize booking state if needed
        if "book" not in self.conversation_state:
            self.conversation_state["book"] = {"stage": "service_selection"}
            services = self.api.get_services()
            service_list = "\n".join([f"{i+1}. {s['name']} - ${s['price']} ({s['duration']} minutes)" 
                                     for i, s in enumerate(services)])
            self.current_context["services"] = services
            return f"Great! I'd be happy to help you book an appointment. Here are our services:\n\n{service_list}\n\nWhich service would you like to book?"
        
        booking_state = self.conversation_state["book"]
        
        # Handle service selection
        if booking_state["stage"] == "service_selection":
            selected_service = self._extract_service_selection(message)
            if selected_service:
                booking_state["service"] = selected_service
                booking_state["stage"] = "date_selection"
                return "Great choice! What day would you like to book your appointment? (e.g., today, tomorrow, next Monday)"
            else:
                return "I'm not sure which service you want. Please select one from the list or enter the service name."
        
        # Handle date selection
        elif booking_state["stage"] == "date_selection":
            date = self._extract_date(message)
            if date:
                booking_state["date"] = date
                booking_state["stage"] = "slot_selection"
                
                # Get available slots
                slots = self.api.get_available_slots(booking_state["service"]["id"], date)
                if not slots:
                    return f"I'm sorry, there are no available slots for {booking_state['service']['name']} on {date.strftime('%A, %B %d')}. Would you like to try a different day?"
                
                self.current_context["slots"] = slots
                slot_list = "\n".join([f"{i+1}. {self._format_time(s['start_time'])}" for i, s in enumerate(slots[:8])])
                
                return f"Here are available times for {booking_state['service']['name']} on {date.strftime('%A, %B %d')}:\n\n{slot_list}\n\nWhich time works for you?"
            else:
                return "I'm not sure which day you want. Please specify a date like 'today', 'tomorrow', or 'next Monday'."
        
        # Handle slot selection
        elif booking_state["stage"] == "slot_selection":
            slot = self._extract_slot_selection(message)
            if slot:
                booking_state["slot"] = slot
                booking_state["stage"] = "customer_details"
                return "Great! I just need a few details to complete your booking. What's your name?"
            else:
                return "I'm not sure which time slot you want. Please select one from the list or specify a time."
        
        # Handle customer details
        elif booking_state["stage"] == "customer_details":
            if "customer_name" not in booking_state:
                booking_state["customer_name"] = message
                return f"Thanks, {message}. What's your phone number?"
            elif "customer_phone" not in booking_state:
                booking_state["customer_phone"] = message
                return "And finally, what's your email address?"
            elif "customer_email" not in booking_state:
                booking_state["customer_email"] = message
                # Book the appointment
                customer_details = {
                    "name": booking_state["customer_name"],
                    "phone": booking_state["customer_phone"],
                    "email": booking_state["customer_email"]
                }
                
                try:
                    appointment = self.api.book_appointment(
                        booking_state["service"]["id"],
                        booking_state["slot"]["id"],
                        customer_details
                    )
                    
                    # Reset conversation state
                    self.conversation_state = {}
                    
                    return (f"Great! Your appointment for {booking_state['service']['name']} on "
                            f"{datetime.fromisoformat(appointment['start_time'].replace('Z', '+00:00')).strftime('%A, %B %d at %I:%M %p')} "
                            f"is confirmed. Your appointment ID is {appointment['appointment_id']}. "
                            f"We'll see you then!")
                except Exception as e:
                    return f"I'm sorry, there was an error booking your appointment: {str(e)}. Please try again."
    
    def _handle_appointment_check(self, message: str) -> str:
        """Handle checking appointment status."""
        appointment_id = self._extract_appointment_id(message)
        
        if appointment_id:
            try:
                appointment = self.api.get_appointment(appointment_id)
                return (f"Your appointment for {appointment['service_name']} on "
                        f"{datetime.fromisoformat(appointment['start_time'].replace('Z', '+00:00')).strftime('%A, %B %d at %I:%M %p')} "
                        f"is {appointment['status']}.")
            except Exception:
                return f"I couldn't find an appointment with ID {appointment_id}. Please check the ID and try again."
        else:
            self.conversation_state["check"] = {"stage": "waiting_for_id"}
            return "I'd be happy to check your appointment. Could you please provide your appointment ID?"
    
    def _handle_appointment_cancellation(self, message: str) -> str:
        """Handle cancelling an appointment."""
        appointment_id = self._extract_appointment_id(message)
        
        if appointment_id:
            try:
                result = self.api.cancel_appointment(appointment_id)
                return f"Your appointment {appointment_id} has been {result['status']}. {result.get('message', '')}"
            except Exception:
                return f"I couldn't cancel appointment {appointment_id}. Please check the ID and try again."
        else:
            self.conversation_state["cancel"] = {"stage": "waiting_for_id"}
            return "I'd be happy to cancel your appointment. Could you please provide your appointment ID?"
    
    def _handle_list_services(self) -> str:
        """Handle listing available services."""
        services = self.api.get_services()
        service_list = "\n".join([f"{s['name']} - ${s['price']} ({s['duration']} minutes): {s['description']}" 
                                 for s in services])
        return f"Here are the services we offer:\n\n{service_list}\n\nWould you like to book an appointment?"
    
    def _extract_service_selection(self, message: str) -> Optional[Dict[str, Any]]:
        """Extract service selection from message."""
        if "services" not in self.current_context:
            return None
            
        services = self.current_context["services"]
        
        # Check for number selection
        number_match = re.search(r'\b(\d+)\b', message)
        if number_match:
            selected_index = int(number_match.group(1)) - 1
            if 0 <= selected_index < len(services):
                return services[selected_index]
        
        # Check for service name
        message = message.lower()
        for service in services:
            if service["name"].lower() in message:
                return service
                
        return None
    
    def _extract_date(self, message: str) -> Optional[datetime]:
        """Extract date from message."""
        message = message.lower()
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        if "today" in message:
            return today
        elif "tomorrow" in message:
            return today + timedelta(days=1)
        elif "next week" in message:
            return today + timedelta(days=7)
            
        # Check for day names
        days = {"monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3, 
                "friday": 4, "saturday": 5, "sunday": 6}
        
        for day, day_num in days.items():
            if day in message:
                current_weekday = today.weekday()
                days_ahead = (day_num - current_weekday) % 7
                if days_ahead == 0 and "next" in message:
                    days_ahead = 7
                return today + timedelta(days=days_ahead)
                
        return None
    
    def _extract_slot_selection(self, message: str) -> Optional[Dict[str, Any]]:
        """Extract time slot selection from message."""
        if "slots" not in self.current_context:
            return None
            
        slots = self.current_context["slots"]
        
        # Check for number selection
        number_match = re.search(r'\b(\d+)\b', message)
        if number_match:
            selected_index = int(number_match.group(1)) - 1
            if 0 <= selected_index < len(slots):
                return slots[selected_index]
        
        # Check for time mention
        time_match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)?', message.lower())
        if time_match:
            hour = int(time_match.group(1))
            minute = int(time_match.group(2)) if time_match.group(2) else 0
            am_pm = time_match.group(3)
            
            if am_pm == "pm" and hour < 12:
                hour += 12
            
            for slot in slots:
                slot_time = datetime.fromisoformat(slot["start_time"].replace('Z', '+00:00'))
                if slot_time.hour == hour and slot_time.minute == minute:
                    return slot
                    
        return None
    
    def _extract_appointment_id(self, message: str) -> Optional[str]:
        """Extract appointment ID from message."""
        id_match = re.search(r'(appt-[a-z0-9-]+)', message, re.IGNORECASE)
        if id_match:
            return id_match.group(1)
        return None
    
    def _format_time(self, time_str: str) -> str:
        """Format a time string for display."""
        dt = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
        return dt.strftime("%I:%M %p")