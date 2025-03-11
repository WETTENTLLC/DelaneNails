"""
Email service for sending various types of emails.
"""
import logging
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Any, Optional, Union

from src.config import Config

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending emails."""
    
    def __init__(self):
        """Initialize email service with necessary configuration."""
        self.config = Config()
        
        # Email server settings
        self.smtp_server = self.config.get("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(self.config.get("SMTP_PORT", 587))
        self.smtp_username = self.config.get("SMTP_USERNAME", "")
        self.smtp_password = self.config.get("SMTP_PASSWORD", "")
        self.sender_email = self.config.get("SENDER_EMAIL", self.smtp_username)
        self.sender_name = self.config.get("SENDER_NAME", "Delane Nails")
        
        # Verify credentials
        if not self.smtp_username or not self.smtp_password:
            logger.warning("SMTP credentials not properly configured")
        
        logger.info("Email service initialized")
    
    async def send_email(self, to_email: str, subject: str, 
                       html_content: str, cc: Optional[List[str]] = None,
                       bcc: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Send an email.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: Email body in HTML format
            cc: Carbon copy recipients
            bcc: Blind carbon copy recipients
            
        Returns:
            Dict with email sending status
        """
        logger.info(f"Sending email to {to_email}, subject: {subject}")
        
        if not self.smtp_username or not self.smtp_password:
            logger.error("Cannot send email: SMTP credentials not configured")
            return {
                "success": False,
                "error": "SMTP credentials not configured"
            }
        
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{self.sender_name} <{self.sender_email}>"
        message["To"] = to_email
        
        if cc:
            message["Cc"] = ", ".join(cc)
        if bcc:
            message["Bcc"] = ", ".join(bcc)
        
        # Add HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        try:
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(self.smtp_username, self.smtp_password)
                
                recipients = [to_email]
                if cc:
                    recipients.extend(cc)
                if bcc:
                    recipients.extend(bcc)
                
                server.sendmail(self.sender_email, recipients, message.as_string())
            
            logger.info(f"Email sent successfully to {to_email}")
            return {
                "success": True,
                "to": to_email,
                "subject": subject,
                "cc": cc,
                "bcc": bcc
            }
            
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "to": to_email,
                "subject": subject
            }
    
    async def send_template_email(self, to_email: str, template_name: str,
                                template_data: Dict[str, Any], subject: str,
                                cc: Optional[List[str]] = None,
                                bcc: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Send an email using a template.
        
        Args:
            to_email: Recipient email address
            template_name: Name of the email template
            template_data: Data to fill the template
            subject: Email subject
            cc: Carbon copy recipients
            bcc: Blind carbon copy recipients
            
        Returns:
            Dict with email sending status
        """
        logger.info(f"Sending template email '{template_name}' to {to_email}")
        
        # In a real system, this would load an HTML template from files or a database
        # and populate it with the provided data.
        # For this example, we'll use a simple template string with placeholders
        
        if template_name == "appointment_confirmation":
            html_content = self._render_appointment_confirmation(template_data)
        elif template_name == "reminder":
            html_content = self._render_reminder(template_data)
        elif template_name == "welcome":
            html_content = self._render_welcome(template_data)
        else:
            logger.error(f"Unknown email template: {template_name}")
            return {
                "success": False,
                "error": f"Unknown email template: {template_name}"
            }
        
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            cc=cc,
            bcc=bcc
        )
    
    def _render_appointment_confirmation(self, data: Dict[str, Any]) -> str:
        """Render appointment confirmation email template."""
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #d14d72;">Your appointment is confirmed!</h2>
                <p>Thank you for booking with Delane Nails. We're looking forward to seeing you!</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Service:</strong> {data.get('service_name', 'Nail Service')}</p>
                    <p><strong>Date:</strong> {data.get('date', 'Scheduled date')}</p>
                    <p><strong>Time:</strong> {data.get('time', 'Scheduled time')}</p>
                    <p><strong>Staff:</strong> {data.get('staff_name', 'Assigned Specialist')}</p>
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
    
    def _render_reminder(self, data: Dict[str, Any]) -> str:
        """Render appointment reminder email template."""
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #d14d72;">Your appointment is tomorrow!</h2>
                <p>This is a friendly reminder about your upcoming appointment with Delane Nails.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Service:</strong> {data.get('service_name', 'Nail Service')}</p>
                    <p><strong>Date:</strong> {data.get('date', 'Tomorrow')}</p>
                    <p><strong>Time:</strong> {data.get('time', 'Scheduled time')}</p>
                    <p><strong>Staff:</strong> {data.get('staff_name', 'Assigned Specialist')}</p>
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
    
    def _render_welcome(self, data: Dict[str, Any]) -> str:
        """Render welcome email template."""
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #d14d72;">Welcome to Delane Nails!</h2>
                <p>Dear {data.get('name', 'Valued Customer')},</p>
                <p>Thank you for creating an account with Delane Nails. We're excited to have you join our community!</p>
                
                <p>With your account, you can:</p>
                <ul>
                    <li>Book appointments easily</li>
                    <li>View your appointment history</li>
                    <li>Receive exclusive offers and updates</li>
                </ul>
                
                <div style="margin-top: 30px;">
                    <a href="{data.get('login_url', '#')}" style="background-color: #d14d72; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Your Account</a>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 0.9em; color: #777;">If you have any questions, please don't hesitate to contact us at (404) 555-1234.</p>
                </div>
            </div>
        </body>
        </html>
        """