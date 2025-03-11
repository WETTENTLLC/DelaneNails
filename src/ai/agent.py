"""
AI Agent to handle customer interactions, scheduling, emails, and calls.
"""
import logging
import re
import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta

from src.config import Config
from src.google_services.calendar import GoogleCalendar
from src.google_services.gmail import GmailService
from src.integrations.booksy import BooksyAPI
from src.services.notification import NotificationService
from src.services.voice_service import VoiceService

logger = logging.getLogger(__name__)

class AIAgent:
    """
    AI Agent that orchestrates services and handles customer interactions.
    """
    
    def __init__(self):
        """Initialize the AI agent with all required services."""
        logger.info("Initializing AI Agent")
        
        # Initialize services
        self.calendar = GoogleCalendar()
        self.gmail = GmailService()
        self.booksy = BooksyAPI()
        self.notification = NotificationService()
        self.voice = VoiceService()
        
        # Set up admin email for notifications
        self.admin_email = Config.get("NOTIFICATION_EMAIL", "maecity@aol.com")
        
        # Track active conversations
        self.active_conversations = {}
        
        logger.info("AI Agent initialized successfully")
        
    def process_email(self, email_id: str) -> bool:
        """
        Process an incoming email and respond appropriately.
        
        Args:
            email_id: The ID of the email to process
            
        Returns:
            True if processed successfully, False otherwise
        """
        try:
            # Get email details
            service = self.gmail._get_service()
            email = service.users().messages().get(userId='me', id=email_id, format='full').execute()
            
            # Extract headers
            headers = {}
            for header in email['payload']['headers']:
                headers[header['name'].lower()] = header['value']
                
            # Get sender and subject
            sender = headers.get('from', '')
            subject = headers.get('subject', '')
            
            logger.info(f"Processing email from {sender} with subject: {subject}")
            
            # Get email content
            plain_text, html_text = self.gmail.get_email_content(email)
            
            # Analyze email content and determine intent
            intent, extracted_data = self._analyze_email_intent(plain_text, subject)
            
            # Handle based on intent
            response = self._handle_email_by_intent(intent, extracted_data, sender, subject, email_id)
            
            # Mark as read
            self.gmail.mark_as_read(email_id)
            
            # Send notification about the processed email
            self.notification.send_system_alert(
                alert_type="Email Processed",
                details=f"From: {sender}\nSubject: {subject}\nIntent: {intent}",
                admin_email=self.admin_email
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing email: {str(e)}")
            return False
            
    def _analyze_email_intent(self, content: str, subject: str) -> Tuple[str, Dict[str, Any]]:
        """
        Analyze email content to determine customer intent.
        
        Args:
            content: Email body text
            subject: Email subject
            
        Returns:
            Tuple of (intent_type, extracted_data)
        """
        # In a real implementation, this would use NLP/AI to determine intent
        # For demonstration, using simple keyword matching
        
        content = content.lower()
        subject = subject.lower()
        combined_text = f"{subject} {content}"
        
        # Default intent
        intent = "general_inquiry"
        extracted_data = {}
        
        # Check for booking/appointment intent
        booking_keywords = ["book", "appointment", "schedule", "reservation"]
        if any(word in combined_text for word in booking_keywords):
            intent = "booking_request"
            
            # Extract potential dates (simplified regex pattern)
            date_matches = re.findall(r'(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)', combined_text)
            if date_matches:
                extracted_data["potential_dates"] = date_matches
                
            # Extract potential services
            services = ["manicure", "pedicure", "nail art", "gel", "acrylic", "waxing"]
            found_services = [s for s in services if s in combined_text]
            if found_services:
                extracted_data["services"] = found_services
                
        # Check for cancellation/rescheduling
        reschedule_keywords = ["reschedule", "change appointment", "move my appointment"]
        if any(word in combined_text for word in reschedule_keywords):
            intent = "reschedule_request"
            
        cancel_keywords = ["cancel", "cancelation", "cancel my appointment"]
        if any(word in combined_text for word in cancel_keywords):
            intent = "cancellation_request"
            
        # Check for information inquiries
        info_keywords = ["hours", "location", "address", "directions", "price", "cost"]
        if any(word in combined_text for word in info_keywords):
            intent = "information_request"
            
            if "hours" in combined_text or "time" in combined_text:
                extracted_data["info_type"] = "business_hours"
            elif "location" in combined_text or "address" in combined_text or "directions" in combined_text:
                extracted_data["info_type"] = "location"
            elif "price" in combined_text or "cost" in combined_text:
                extracted_data["info_type"] = "pricing"
                
        logger.info(f"Analyzed intent: {intent} with data: {extracted_data}")
        return intent, extracted_data
        
    def _handle_email_by_intent(self, intent: str, data: Dict[str, Any], 
                              sender: str, subject: str, email_id: str) -> bool:
        """
        Handle an email based on the detected intent.
        
        Args:
            intent: Detected intent
            data: Extracted data
            sender: Email sender
            subject: Email subject
            email_id: Email ID
            
        Returns:
            True if handled successfully
        """
        # Prepare response based on intent
        if intent == "booking_request":
            # For booking requests, provide available times and booking instructions
            response_body = self._generate_booking_response(data)
            subject_prefix = "RE: Appointment Request - "
            
        elif intent == "reschedule_request":
            # For reschedule requests
            response_body = (
                "Thank you for contacting DelaneNails about rescheduling your appointment.\n\n"
                "To confirm your request to reschedule, please provide:\n"
                "1. Your name\n"
                "2. Your current appointment date and time\n"
                "3. Your preferred new date and time options\n\n"
                "Alternatively, you can call us at (123) 456-7890 for immediate assistance with rescheduling.\n\n"
                "Thank you for your patience.\n\n"
                "Best regards,\n"
                "DelaneNails AI Assistant"
            )
            subject_prefix = "RE: Rescheduling - "
            
        elif intent == "cancellation_request":
            # For cancellation requests
            response_body = (
                "Thank you for contacting DelaneNails about cancelling your appointment.\n\n"
                "To confirm your cancellation, please reply with:\n"
                "1. Your name\n"
                "2. Your appointment date and time\n\n"
                "Please note our cancellation policy: appointments must be cancelled at least 24 hours in advance "
                "to avoid a cancellation fee.\n\n"
                "If you have any questions, please call us at (123) 456-7890.\n\n"
                "Best regards,\n"
                "DelaneNails AI Assistant"
            )
            subject_prefix = "RE: Cancellation - "
            
        elif intent == "information_request":
            # For information requests
            info_type = data.get("info_type", "general")
            response_body = self._generate_information_response(info_type)
            subject_prefix = "RE: Information - "
            
        else:
            # For general inquiries
            response_body = (
                "Thank you for contacting DelaneNails. We have received your message and will respond shortly.\n\n"
                "If you need immediate assistance, please call us at (123) 456-7890 during business hours:\n"
                "Monday-Friday: 9:00 AM - 7:00 PM\n"
                "Saturday: 9:00 AM - 6:00 PM\n"
                "Sunday: 10:00 AM - 5:00 PM\n\n"
                "Best regards,\n"
                "DelaneNails AI Assistant"
            )
            subject_prefix = "RE: "
            
        # Send the response
        try:
            self.gmail.reply_to_email(
                message_id=email_id,
                reply_body=response_body
            )
            
            logger.info(f"Sent email response for intent: {intent}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email response: {str(e)}")
            return False
            
    def _generate_booking_response(self, data: Dict[str, Any]) -> str:
        """Generate a response for booking requests."""
        # Get actual available times from Booksy if possible
        available_slots = []
        services_list = []
        
        try:
            # Get services
            services = self.booksy.get_services()
            services_list = [f"- {service['name']} (${service['price']})" for service in services[:5]]
            
            # Get some available slots if dates were provided
            if data.get("potential_dates"):
                # Convert the first date to a datetime
                # This is simplistic - in a real app you'd parse dates better
                try:
                    date_str = data["potential_dates"][0]
                    date_parts = re.split(r'[/\-]', date_str)
                    if len(date_parts) >= 2:
                        month, day = int(date_parts[0]), int(date_parts[1])
                        target_date = datetime(datetime.now().year, month, day)
                        
                        # Get slots for first service
                        if services:
                            slots = self.booksy.get_available_slots(services[0]['id'], target_date)
                            for slot in slots[:3]:
                                slot_time = datetime.fromisoformat(slot['start_time'].replace('Z', '+00:00'))
                                available_slots.append(slot_time.strftime('%I:%M %p'))
                except Exception as e:
                    logger.error(f"Error parsing date: {str(e)}")
        except Exception as e:
            logger.error(f"Error getting Booksy data: {str(e)}")
        
        # If we couldn't get real data, provide some generic options
        if not services_list:
            services_list = [
                "- Manicure ($25+)",
                "- Pedicure ($35+)",
                "- Gel Polish ($30+)",
                "- Full Set Acrylics ($45+)",
                "- Nail Art ($5+ per nail)"
            ]
            
        if not available_slots:
            # Generate generic availability
            now = datetime.now()
            available_slots = [
                (now + timedelta(days=1)).strftime('%A, %B %d: 10:00 AM, 2:30 PM'),
                (now + timedelta(days=2)).strftime('%A, %B %d: 11:30 AM, 3:00 PM, 5:15 PM'),
                (now + timedelta(days=3)).strftime('%A, %B %d: 9:30 AM, 1:00 PM, 4:45 PM')
            ]
            
        # Craft the response
        response = (
            "Thank you for your interest in booking an appointment with DelaneNails!\n\n"
            "Based on your request, here are some available appointment times:\n\n"
        )
        
        for slot in available_slots:
            response += f"- {slot}\n"
            
        response += (
            "\nWe offer the following services:\n\n"
        )
        
        for service in services_list:
            response += f"{service}\n"
            
        response += (
            "\nTo book your appointment, you can:\n"
            "1. Reply to this email with your preferred date, time, and service\n"
            "2. Call us at (123) 456-7890\n"
            "3. Book online at https://booksy.com/delanenails\n\n"
            "We look forward to seeing you soon!\n\n"
            "Best regards,\n"
            "DelaneNails AI Assistant"
        )
        
        return response
        
    def _generate_information_response(self, info_type: str) -> str:
        """Generate a response for information requests."""
        if info_type == "business_hours":
            return (
                "Thank you for inquiring about our business hours.\n\n"
                "DelaneNails is open:\n"
                "Monday-Friday: 9:00 AM - 7:00 PM\n"
                "Saturday: 9:00 AM - 6:00 PM\n"
                "Sunday: 10:00 AM - 5:00 PM\n\n"
                "If you would like to book an appointment, please call us at (123) 456-7890 "
                "or book online at https://booksy.com/delanenails\n\n"
                "Best regards,\n"
                "DelaneNails AI Assistant"
            )
        elif info_type == "location":
            return (
                "Thank you for inquiring about our location.\n\n"
                "DelaneNails is located at:\n"
                "123 Main Street\n"
                "Anytown, CA 90210\n\n"
                "We are in the Main Street Shopping Center, next to Starbucks.\n"
                "Convenient parking is available in front of the salon.\n\n"
                "If you have any questions or would like to book an appointment, "
                "please call us at (123) 456-7890.\n\n"
                "Best regards,\n"
                "DelaneNails AI Assistant"
            )
        elif info_type == "pricing":
            return (
                "Thank you for inquiring about our services and pricing.\n\n"
                "Here are our most popular services:\n\n"
                "Manicures:\n"
                "- Regular Manicure: $25\n"
                "- Gel Manicure: $35\n"
                "- Deluxe Manicure: $45\n\n"
                "Pedicures:\n"
                "- Regular Pedicure: $35\n"
                "- Deluxe Pedicure: $50\n"
                "- Delane Signature Pedicure: $65\n\n"
                "Nail Enhancements:\n"
                "- Full Set Acrylic: $45+\n"
                "- Acrylic Fill: $30+\n"
                "- Nail Art: $5+ per nail\n\n"
                "For a complete list of services and prices, please visit our website "
                "or call us at (123) 456-7890.\n\n"
                "Best regards,\n"
                "DelaneNails AI Assistant"
            )
        else:
            return (
                "Thank you for contacting DelaneNails.\n\n"
                "We've received your inquiry and will get back to you shortly with the information you requested. "
                "If you need immediate assistance, please call us at (123) 456-7890 during business hours:\n\n"
                "Monday-Friday: 9:00 AM - 7:00 PM\n"
                "Saturday: 9:00 AM - 6:00 PM\n"
                "Sunday: 10:00 AM - 5:00 PM\n\n"
                "Best regards,\n"
                "DelaneNails AI Assistant"
            )
            
    def handle_incoming_call(self, caller_number: str) -> str:
        """
        Handle an incoming phone call.
        
        Args:
            caller_number: The caller's phone number
            
        Returns:
            TwiML for the call response
        """
        # This would normally be handled by a web endpoint that Twilio calls
        twiml = self.voice.handle_incoming_call_twiml()
        
        # Log and notify about the call
        logger.info(f"Handling incoming call from {caller_number}")
        self.notification.send_system_alert(
            alert_type="Incoming Call",
            details=f"From: {caller_number}\nTime: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            admin_email=self.admin_email
        )
        
        return twiml
        
    def process_call_menu_selection(self, caller_number: str, digit_pressed: str) -> str:
        """
        Process a menu selection during a call.
        
        Args:
            caller_number: The caller's phone number
            digit_pressed: The digit pressed by the caller
            
        Returns:
            TwiML response for the selection
        """
        # This would normally be handled by a web endpoint
        from twilio.twiml.voice_response import VoiceResponse, Gather
        
        response = VoiceResponse()
        
        if digit_pressed == "1":  # Book appointment
            # Start booking flow
            gather = Gather(num_digits=1, action="/voice/booking-service", method="POST")
            gather.say(
                "To book an appointment, please select the service you are interested in. "
                "For manicure, press 1. For pedicure, press 2. For nail enhancements, press 3. "
                "For all other services, press 4.",
                voice="female"
            )
            response.append(gather)
            
        elif digit_pressed == "2":  # Check/modify existing appointment
            # Prompt for confirmation info
            gather = Gather(num_digits=10, action="/voice/verify-phone", method="POST", timeout=15)
            gather.say(
                "To verify your appointment, please enter the phone number used for booking, "
                "starting with area code.",
                voice="female"
            )
            response.append(gather)
            
        elif digit_pressed == "3":  # Business hours & location
            response.say(
                "Our salon is open Monday through Friday from 9 A.M. to 7 P.M., "
                "Saturday from 9 A.M. to 6 P.M., and Sunday from 10 A.M. to 5 P.M. "
                "We are located at 123 Main Street in Anytown. "
                "Would you like to book an appointment now?",
                voice="female"
            )
            
            gather = Gather(num_digits=1, action="/voice/booking-choice", method="POST")
            gather.say("Press 1 for yes, or 2 to end this call.", voice="female")
            response.append(gather)
            
        elif digit_pressed == "4":  # Other inquiries
            response.say(
                "For other inquiries, we'll connect you with a member of our team. "
                "Please hold while we transfer you.",
                voice="female"
            )
            # In a real implementation, this would transfer to a human
            response.dial(Config.get("BUSINESS_PHONE", "+18001234567"))
            
        else:
            # Invalid selection
            response.say(
                "Sorry, I didn't understand your selection. Let's try again.",
                voice="female"
            )
            gather = Gather(num_digits=1, action="/voice/menu-selection", method="POST")
            gather.say(
                "For booking a new appointment, press 1. "
                "To check or modify an existing appointment, press 2. "
                "For business hours and location, press 3. "
                "For all other inquiries, press 4.",
                voice="female"
            )
            response.append(gather)
            
        # Log the selection
        logger.info(f"Call menu selection {digit_pressed} from {caller_number}")
        
        return str(response)
        
    def check_for_unread_emails(self) -> int:
        """
        Check for and process unread emails.
        
        Returns:
            Number of emails processed
        """
        try:
            # Get unread emails
            unread_emails = self.gmail.get_unread_emails(max_results=10)
            
            processed_count = 0
            for email in unread_emails:
                success = self.process_email(email['id'])
                if success:
                    processed_count += 1
                    
            logger.info(f"Processed {processed_count} unread emails")
            return processed_count
            
        except Exception as e:
            logger.error(f"Error checking unread emails: {str(e)}")
            return 0
            
    def generate_daily_report(self) -> None:
        """Generate and send a daily activity report."""
        try:
            # Get today's date
            today = datetime.now().strftime("%Y-%m-%d")
            
            # Get appointments for today from Booksy
            today_dt = datetime.