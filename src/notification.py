"""
Notification service for sending appointment reminders and handling callbacks.
"""
import logging
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

from src.config import config

# Initialize logging
logger = logging.getLogger(__name__)

class NotificationService:
    """Service for sending notifications and managing callbacks."""
    
    def __init__(self):
        """Initialize the notification service."""
        self.smtp_host = config.get("smtp_host")
        self.smtp_port = config.get("smtp_port")
        self.smtp_username = config.get("smtp_username")
        self.smtp_password = config.get("smtp_password")
        self.from_email = config.get("from_email")
        
        # SMS settings
        self.sms_provider = config.get("sms_provider")
        
        # If using Twilio
        if self.sms_provider == "twilio":
            try:
                from twilio.rest import Client
                self.twilio_client = Client(
                    config.get("twilio_account_sid"),
                    config.get("twilio_auth_token")
                )
                self.twilio_phone_number = config.get("twilio_phone_number")
            except ImportError:
                logger.warning("Twilio package not found. SMS notifications will not work.")
                self.twilio_client = None
    
    async def send_appointment_confirmation(self, appointment: Dict[str, Any]) -> bool:
        """
        Send appointment confirmation to customer.
        
        Args:
            appointment: Appointment details
            
        Returns:
            True if successful, False otherwise
        """
        customer_email = appointment.get("customer_email")
        if not customer_email:
            logger.warning("No customer email found for appointment confirmation")
            return False
        
        # Format appointment details
        appointment_time = datetime.fromisoformat(appointment["start_time"].replace("Z", "+00:00"))
        formatted_time = appointment_time.strftime("%A, %B %d at %I:%M %p")
        
        subject = f"Appointment Confirmation - {config.get('business_name')}"
        body = f"""
        Dear {appointment.get('customer_name')},
        
        Your appointment has been confirmed for {formatted_time}.
        
        Service: {appointment.get('service_name')}
        Appointment ID: {appointment.get('appointment_id')}
        
        If you need to cancel or reschedule, please contact us at {config.get('business_phone')}
        or reply to this email.
        
        Thank you for choosing {config.get('business_name')}!
        
        Best regards,
        The {config.get('business_name')} Team
        """
        
        # Try to send email
        success = await self._send_email(customer_email, subject, body)
        
        # If email has phone and email failed, try SMS
        if not success and appointment.get("customer_phone"):
            sms_body = (f"Your appointment at {config.get('business_name')} has been confirmed for "
                       f"{formatted_time}. ID: {appointment.get('appointment_id')}")
            success = await self._send_sms(appointment["customer_phone"], sms_body)
        
        return success
    
    async def send_appointment_reminder(self, appointment: Dict[str, Any]) -> bool:
        """
        Send appointment reminder to customer.
        
        Args:
            appointment: Appointment details
            
        Returns:
            True if successful, False otherwise
        """
        customer_email = appointment.get("customer_email")
        appointment_time = datetime.fromisoformat(appointment["start_time"].replace("Z", "+00:00"))
        formatted_time = appointment_time.strftime("%A, %B %d at %I:%M %p")
        
        subject = f"Appointment Reminder - {config.get('business_name')}"
        body = f"""
        Dear {appointment.get('customer_name')},
        
        This is a reminder that you have an appointment scheduled for {formatted_time}.
        
        Service: {appointment.get('service_name')}
        Appointment ID: {appointment.get('appointment_id')}
        
        If you need to cancel or reschedule, please contact us at {config.get('business_phone')}
        at least 24 hours in advance.
        
        We look forward to seeing you!
        
        Best regards,
        The {config.get('business_name')} Team
        """
        
        # Try to send email if we have an email address
        success = False
        if customer_email:
            success = await self._send_email(customer_email, subject, body)
        
        # Send SMS reminder regardless of email status (if we have a phone number)
        if appointment.get("customer_phone"):
            sms_body = (f"Reminder: You have an appointment at {config.get('business_name')} on "
                       f"{formatted_time}. ID: {appointment.get('appointment_id')}")
            sms_success = await self._send_sms(appointment["customer_phone"], sms_body)
            
            # If email failed but SMS succeeded, mark as success
            if not success and sms_success:
                success = True
        
        return success
    
    async def schedule_callback(self, customer_info: Dict[str, str], issue_summary: str) -> bool:
        """
        Schedule a callback for a customer.
        
        Args:
            customer_info: Customer contact information
            issue_summary: Brief description of the issue
            
        Returns:
            True if callback was scheduled, False otherwise
        """
        # In a real system, this would add to a database or task queue
        # For now, just send an internal notification
        staff_email = config.get("business_email")
        subject = f"Callback Request - {customer_info.get('name')}"
        body = f"""
        A customer has requested a callback:
        
        Name: {customer_info.get('name')}
        Phone: {customer_info.get('phone')}
        Email: {customer_info.get('email', 'Not provided')}
        
        Issue: {issue_summary}
        
        Please contact the customer as soon as possible.
        """
        
        success = await self._send_email(staff_email, subject, body)
        return success
    
    async def _send_email(self, to_email: str, subject: str, body: str) -> bool:
        """
        Send an email.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body
            
        Returns:
            True if successful, False otherwise
        """
        if not self.smtp_host or not self.smtp_username or not self.smtp_password:
            logger.warning("SMTP settings not configured. Email will not be sent.")
            return False
            
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.from_email
            message["To"] = to_email
            
            # Add plain text part
            text_part = MIMEText(body, "plain")
            message.attach(text_part)
            
            # Create a secure connection and send
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.from_email, to_email, message.as_string())
                
            logger.info(f"Email sent to {to_email}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False
    
    async def _send_sms(self, to_phone: str, message: str) -> bool:
        """
        Send an SMS message.
        
        Args:
            to_phone: Recipient phone number
            message: SMS message
            
        Returns:
            True if successful, False otherwise
        """
        # If Twilio not configured, return False
        if self.sms_provider == "twilio" and not self.twilio_client:
            logger.warning("Twilio not configured. SMS will not be sent.")
            return False
            
        try:
            if self.sms_provider == "twilio":
                # Format phone number if needed
                if not to_phone.startswith("+"):
                    to_phone = f"+1{to_phone}"  # Assuming US numbers
                    
                # Send via Twilio
                sms = self.twilio_client.messages.create(
                    body=message,
                    from_=self.twilio_phone_number,
                    to=to_phone
                )
                logger.info(f"SMS sent to {to_phone}: {sms.sid}")
                return True
            else:
                logger.warning(f"SMS provider {self.sms_provider} not supported")
                return False
        except Exception as e:
            logger.error(f"Error sending SMS: {str(e)}")
            return False
