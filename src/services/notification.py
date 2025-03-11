"""
Notification service for sending alerts and reminders.
"""
import logging
import json
from typing import Dict, Any, List, Optional, Union
import asyncio
from datetime import datetime, timedelta

import twilio.rest
from twilio.base.exceptions import TwilioRestException

from src.config import Config
from src.services.email_service import EmailService

logger = logging.getLogger(__name__)

class NotificationService:
    """Service for sending notifications via email, SMS, etc."""
    
    def __init__(self):
        """Initialize notification service."""
        self.config = Config()
        
        # Initialize Twilio for SMS
        twilio_account_sid = self.config.get("TWILIO_ACCOUNT_SID")
        twilio_auth_token = self.config.get("TWILIO_AUTH_TOKEN")
        
        if twilio_account_sid and twilio_auth_token:
            self.twilio_client = twilio.rest.Client(twilio_account_sid, twilio_auth_token)
            self.twilio_phone = self.config.get("TWILIO_PHONE_NUMBER")
        else:
            self.twilio_client = None
            self.twilio_phone = None
            logger.warning("Twilio credentials not found, SMS notifications disabled")
        
        # Initialize email service
        self.email_service = EmailService()
        
        # Staff notification settings
        self.staff_emails = self.config.get("STAFF_EMAILS", ["maecity@aol.com"])
        self.owner_phone = self.config.get("OWNER_PHONE")
        
        logger.info("Notification service initialized")
    
    async def send_appointment_confirmation(self, email: str, appointment_details: Dict[str, Any],
                                          admin_email: Optional[str] = None) -> Dict[str, Any]:
        """
        Send appointment confirmation to customer and optionally to admin.
        
        Args:
            email: Customer email
            appointment_details: Appointment information
            admin_email: Optional admin email for notification
            
        Returns:
            Dict with notification status
        """
        logger.info(f"Sending appointment confirmation to {email}")
        
        # Format appointment date/time
        start_time = appointment_details.get("start_time", "")
        if isinstance(start_time, str):
            try:
                dt = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
                formatted_date = dt.strftime("%A, %B %d, %Y")
                formatted_time = dt.strftime("%-I:%M %p")
            except ValueError:
                formatted_date = start_time.split("T")[0]
                formatted_time = start_time.split("T")[1].split("+")[0]
        else:
            formatted_date = "Scheduled date"
            formatted_time = "Scheduled time"
        
        # Prepare customer email
        subject = "Your Appointment Confirmation - Delane Nails"
        
        message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #d14d72;">Your appointment is confirmed!</h2>
                <p>Thank you for booking with Delane Nails. We're looking forward to seeing you!</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Service:</strong> {appointment_details.get('service_name', 'Nail Service')}</p>
                    <p><strong>Date:</strong> {formatted_date}</p>
                    <p><strong>Time:</strong> {formatted_time}</p>
                    <p><strong>Staff:</strong> {appointment_details.get('staff_name', 'Assigned Specialist')}</p>
                </div>
                
                <p><strong>Address:</strong> 123 Main Street, Suite 101, Atlanta, GA 30303</p>
                <p><strong>Phone:</strong> (404) 555-1234</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 0.9em; color: #777;">Need to reschedule? Please call us at least 24 hours in advance.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send to customer
        customer_result = await self.email_service.send_email(
            to_email=email,
            subject=subject,
            html_content=message
        )
        
        # Send to admin if specified
        admin_result = None
        if admin_email:
            admin_subject = f"New Appointment: {appointment_details.get('service_name', 'Service')} on {formatted_date}"
            admin_message = f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #d14d72;">New Appointment Booked</h2>
                    <p>A new appointment has been scheduled:</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Customer:</strong> {appointment_details.get('customer_name', 'Customer')}</p>
                        <p><strong>Email:</strong> {email}</p>
                        <p><strong>Phone:</strong> {appointment_details.get('customer_phone', 'N/A')}</p>
                        <p><strong>Service:</strong> {appointment_details.get('service_name', 'Nail Service')}</p>
                        <p><strong>Date:</strong> {formatted_date}</p>
                        <p><strong>Time:</strong> {formatted_time}</p>
                        <p><strong>Staff:</strong> {appointment_details.get('staff_name', 'Assigned Specialist')}</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            admin_result = await self.email_service.send_email(
                to_email=admin_email,
                subject=admin_subject,
                html_content=admin_message
            )
        
        return {
            "customer_notification": customer_result,
            "admin_notification": admin_result
        }
    
    async def send_appointment_reminder(self, email: str, phone: Optional[str], 
                                      appointment_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send appointment reminder via email and/or SMS.
        
        Args:
            email: Customer email
            phone: Customer phone number (optional)
            appointment_details: Appointment information
            
        Returns:
            Dict with notification status
        """
        logger.info(f"Sending appointment reminder to {email}")
        results = {}
        
        # Format appointment date/time
        start_time = appointment_details.get("start_time", "")
        if isinstance(start_time, str):
            try:
                dt = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
                formatted_date = dt.strftime("%A, %B %d, %Y")
                formatted_time = dt.strftime("%-I:%M %p")
            except ValueError:
                formatted_date = start_time.split("T")[0]
                formatted_time = start_time.split("T")[1].split("+")[0]
        else:
            formatted_date = "tomorrow"
            formatted_time = "scheduled time"
        
        # Send email reminder
        template_data = {
            "service_name": appointment_details.get("service_name", "Nail Service"),
            "date": formatted_date,
            "time": formatted_time,
            "staff_name": appointment_details.get("staff_name", "your nail specialist")
        }
        
        email_result = await self.email_service.send_template_email(
            to_email=email,
            template_name="reminder",
            template_data=template_data,
            subject="Reminder: Your Appointment Tomorrow - Delane Nails"
        )
        results["email"] = email_result
        
        # Send SMS reminder if phone is provided and Twilio is configured
        if phone and self.twilio_client and self.twilio_phone:
            try:
                sms_message = f"Reminder: Your appointment at Delane Nails is tomorrow, {formatted_date} at {formatted_time}. Call (404) 555-1234 if you need to reschedule."
                
                message = self.twilio_client.messages.create(
                    body=sms_message,
                    from_=self.twilio_phone,
                    to=phone
                )
                
                results["sms"] = {
                    "success": True,
                    "message_id": message.sid
                }
                logger.info(f"SMS reminder sent to {phone}")
                
            except TwilioRestException as e:
                logger.error(f"Error sending SMS reminder: {str(e)}")
                results["sms"] = {
                    "success": False,
                    "error": str(e)
                }
        
        return results
    
    async def send_staff_alert(self, subject: str, message: str, 
                             priority: bool = False) -> Dict[str, Any]:
        """
        Send alert to staff members.
        
        Args:
            subject: Alert subject
            message: Alert message
            priority: Whether this is a high-priority alert
            
        Returns:
            Dict with notification status
        """
        logger.info(f"Sending staff alert: {subject}")
        results = {}
        
        # Send email to all staff
        staff_subject = f"{'[URGENT] ' if priority else ''}{subject}"
        
        email_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: {'#ff0000' if priority else '#d14d72'};">{staff_subject}</h2>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p>{message}</p>
                </div>
                <p>Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
            </div>
        </body>
        </html>
        """
        
        # Send to all staff emails
        for staff_email in self.staff_emails:
            email_result = await self.email_service.send_email(
                to_email=staff_email,
                subject=staff_subject,
                html_content=email_content
            )
            results[staff_email] = email_result
        
        # For high priority, also send SMS to owner if configured
        if priority and self.owner_phone and self.twilio_client and self.twilio_phone:
            try:
                sms_message = f"URGENT: {subject}"
                
                message = self.twilio_client.messages.create(
                    body=sms_message,
                    from_=self.twilio_phone,
                    to=self.owner_phone
                )
                
                results["sms"] = {
                    "success": True,
                    "message_id": message.sid
                }
                logger.info(f"Urgent SMS alert sent to owner")
                
            except TwilioRestException as e:
                logger.error(f"Error sending SMS alert: {str(e)}")
                results["sms"] = {
                    "success": False,
                    "error": str(e)
                }
        
        return results
    
    async def schedule_callback(self, customer_info: Dict[str, Any], 
                              issue_summary: str) -> Dict[str, Any]:
        """
        Schedule a callback from staff to customer.
        
        Args:
            customer_info: Customer contact information
            issue_summary: Summary of the issue
            
        Returns:
            Dict with scheduling status
        """
        logger.info(f"Scheduling callback for customer {customer_info.get('name', 'Unknown')}")
        
        # Send staff notification
        subject = f"Customer Callback Request"
        message = f"""
        A customer has requested a callback:
        
        Name: {customer_info.get('name', 'Not provided')}
        Phone: {customer_info.get('phone', 'Not provided')}
        Email: {customer_info.get('email', 'Not provided')}
        
        Issue Summary: {issue_summary}
        
        Please contact this customer as soon as possible.
        """
        
        alert_result = await self.send_staff_alert(subject=subject, message=message, priority=True)
        
        # Send confirmation to customer
        if customer_info.get("email"):
            email_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #d14d72;">We'll be in touch soon</h2>
                    <p>Dear {customer_info.get('name', 'Valued Customer')},</p>
                    <p>Thank you for your message. A member of our team will contact you shortly.</p>
                    <p>If you need immediate assistance, please call us at (404) 555-1234.</p>
                </div>
            </body>
            </html>
            """
            
            customer_result = await self.email_service.send_email(
                to_email=customer_info["email"],
                subject="Your callback request - Delane Nails",
                html_content=email_content
            )
        else:
            customer_result = {"success": False, "error": "No customer email provided"}
        
        return {
            "staff_notification": alert_result,
            "customer_confirmation": customer_result
        }
