"""
Gmail API integration for email handling.
"""
import base64
import logging
import os
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Any, Optional, Tuple

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from src.config import Config

logger = logging.getLogger(__name__)

class GmailService:
    """Client for sending and receiving emails via Gmail API."""
    
    # Define the scopes for Gmail access
    SCOPES = ['https://www.googleapis.com/auth/gmail.modify',
              'https://www.googleapis.com/auth/gmail.compose']
    
    def __init__(self, credentials_path: Optional[str] = None, token_path: Optional[str] = None):
        """
        Initialize the Gmail service client.
        
        Args:
            credentials_path: Path to OAuth credentials JSON file
            token_path: Path to OAuth token JSON file
        """
        # Get credentials paths from Config if not provided
        google_creds = Config.get_google_credentials()
        
        self.credentials_path = credentials_path or google_creds["credentials_path"]
        self.token_path = token_path or google_creds["token_path"]
        
        self.credentials = None
        self.service = None
        
    def authenticate(self) -> None:
        """Authenticate with Gmail API."""
        if not os.path.exists(self.credentials_path):
            raise FileNotFoundError(f"OAuth credentials not found at {self.credentials_path}")
            
        try:
            # Check if token.json exists with valid credentials
            if os.path.exists(self.token_path):
                with open(self.token_path, 'r') as token_file:
                    token_data = json.load(token_file)
                self.credentials = Credentials.from_authorized_user_info(
                    info=token_data,
                    scopes=self.SCOPES
                )
            
            # If credentials don't exist or are invalid, authenticate
            if not self.credentials or not self.credentials.valid:
                if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                    self.credentials.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_path, self.SCOPES
                    )
                    self.credentials = flow.run_local_server(port=0)
                
                # Save the credentials for future use
                token_dir = os.path.dirname(self.token_path)
                if not os.path.exists(token_dir):
                    os.makedirs(token_dir, exist_ok=True)
                    
                with open(self.token_path, 'w') as token:
                    token.write(json.dumps(json.loads(self.credentials.to_json())))
            
            # Build the service
            self.service = build('gmail', 'v1', credentials=self.credentials)
            logger.info("Successfully authenticated with Gmail API")
            
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            raise
    
    def _get_service(self):
        """Get the Gmail service, authenticating if necessary."""
        if not self.service:
            self.authenticate()
        return self.service
    
    def send_email(self, to: str, subject: str, body: str, 
                  html_body: Optional[str] = None, cc: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Send an email.
        
        Args:
            to: Recipient email address
            subject: Email subject
            body: Plain text email body
            html_body: HTML email body (optional)
            cc: CC recipients (optional)
            
        Returns:
            Response from the Gmail API
        """
        service = self._get_service()
        
        message = MIMEMultipart('alternative')
        message['to'] = to
        message['subject'] = subject
        
        if cc:
            message['cc'] = ', '.join(cc)
        
        # Add plain text body
        message.attach(MIMEText(body, 'plain'))
        
        # Add HTML body if provided
        if html_body:
            message.attach(MIMEText(html_body, 'html'))
        
        # Encode the message
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        try:
            send_message = service.users().messages().send(
                userId="me", 
                body={'raw': encoded_message}
            ).execute()
            
            logger.info(f"Email sent to {to}, message ID: {send_message['id']}")
            return send_message
            
        except HttpError as error:
            logger.error(f"Error sending email: {error}")
            raise
    
    def get_unread_emails(self, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Get unread emails.
        
        Args:
            max_results: Maximum number of emails to retrieve
            
        Returns:
            List of unread emails
        """
        service = self._get_service()
        
        try:
            # Search for unread emails
            response = service.users().messages().list(
                userId="me",
                q="is:unread",
                maxResults=max_results
            ).execute()
            
            messages = response.get('messages', [])
            
            if not messages:
                logger.info("No unread emails found")
                return []
            
            # Get full message details for each message ID
            detailed_messages = []
            for message in messages:
                msg = service.users().messages().get(
                    userId="me", 
                    id=message['id'],
                    format='full'
                ).execute()
                detailed_messages.append(msg)
                
            logger.info(f"Retrieved {len(detailed_messages)} unread emails")
            return detailed_messages
            
        except HttpError as error:
            logger.error(f"Error retrieving emails: {error}")
            return []
    
    def reply_to_email(self, message_id: str, reply_body: str, 
                      html_reply_body: Optional[str] = None) -> Dict[str, Any]:
        """
        Reply to an email.
        
        Args:
            message_id: ID of the message to reply to
            reply_body: Plain text reply body
            html_reply_body: HTML reply body (optional)
            
        Returns:
            Response from the Gmail API
        """
        service = self._get_service()
        
        try:
            # Get the original message to extract headers
            original = service.users().messages().get(userId="me", id=message_id).execute()
            
            # Extract headers from original message
            headers = {}
            for header in original['payload']['headers']:
                headers[header['name'].lower()] = header['value']
            
            # Create reply message
            message = MIMEMultipart('alternative')
            message['to'] = headers.get('from', '')
            message['subject'] = f"Re: {headers.get('subject', '')}" 
            message['In-Reply-To'] = headers.get('message-id', '')
            message['References'] = headers.get('message-id', '')
            
            # Add plain text body
            message.attach(MIMEText(reply_body, 'plain'))
            
            # Add HTML body if provided
            if html_reply_body:
                message.attach(MIMEText(html_reply_body, 'html'))
            
            # Encode the message
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            # Send the reply
            send_message = service.users().messages().send(
                userId="me", 
                body={'raw': encoded_message, 'threadId': original['threadId']}
            ).execute()
            
            logger.info(f"Email reply sent, message ID: {send_message['id']}")
            return send_message
            
        except HttpError as error:
            logger.error(f"Error replying to email: {error}")
            raise
    
    def mark_as_read(self, message_id: str) -> Dict[str, Any]:
        """
        Mark an email as read.
        
        Args:
            message_id: ID of the message to mark as read
            
        Returns:
            Response from the Gmail API
        """
        service = self._get_service()
        
        try:
            return service.users().messages().modify(
                userId="me",
                id=message_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            
        except HttpError as error:
            logger.error(f"Error marking email as read: {error}")
            raise
    
    def get_email_content(self, message: Dict[str, Any]) -> Tuple[str, str]:
        """
        Extract plain text and HTML content from an email message.
        
        Args:
            message: Gmail API message object
            
        Returns:
            Tuple of (plain_text, html_text)
        """
        plain_text = ""
        html_text = ""
        
        if 'payload' not in message:
            return plain_text, html_text
            
        def get_text_from_part(part):
            """Extract text from a message part."""
            if part.get('mimeType') == 'text/plain':
                data = part.get('body', {}).get('data', '')
                if data:
                    return base64.urlsafe_b64decode(data).decode('utf-8')
            return ""
            
        def get_html_from_part(part):
            """Extract HTML from a message part."""
            if part.get('mimeType') == 'text/html':
                data = part.get('body', {}).get('data', '')
                if data:
                    return base64.urlsafe_b64decode(data).decode('utf-8')
            return ""
        
        # Check for multipart message
        if 'parts' in message['payload']:
            for part in message['payload']['parts']:
                plain_part = get_text_from_part(part)
                if plain_part:
                    plain_text = plain_part
                    
                html_part = get_html_from_part(part)
                if html_part:
                    html_text = html_part
                    
                # Handle nested parts
                if 'parts' in part:
                    for subpart in part['parts']:
                        if not plain_text:
                            plain_text = get_text_from_part(subpart)
                        if not html_text:
                            html_text = get_html_from_part(subpart)
        else:
            # Simple message
            if message['payload'].get('mimeType') == 'text/plain':
                data = message['payload'].get('body', {}).get('data', '')
                if data:
                    plain_text = base64.urlsafe_b64decode(data).decode('utf-8')
            elif message['payload'].get('mimeType') == 'text/html':
                data = message['payload'].get('body', {}).get('data', '')
                if data:
                    html_text = base64.urlsafe_b64decode(data).decode('utf-8')
                    
        return plain_text, html_text
