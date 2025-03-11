"""
Google Calendar API integration.
"""
import logging
import os
import datetime
import json
from pathlib import Path
from typing import Dict, List, Optional, Any

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Import the Config class
try:
    from src.config import Config
except ImportError:
    # Handle case where this module is run directly
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent.parent))
    from src.config import Config

logger = logging.getLogger(__name__)

class GoogleCalendar:
    """
    Client for interacting with Google Calendar API.
    
    To set up credentials:
    1. Go to the Google Cloud Console (https://console.cloud.google.com/)
    2. Create a project and enable the Google Calendar API
    3. Create OAuth 2.0 credentials (Download as credentials.json)
    4. Place the credentials.json file in the path specified by credentials_path
    5. The first time you run the authenticate() method, it will open a browser
       window to authorize your application
    """
    
    # Define the scopes for calendar access
    SCOPES = ['https://www.googleapis.com/auth/calendar']
    
    def __init__(self, credentials_path: Optional[str] = None, token_path: Optional[str] = None):
        """
        Initialize the Google Calendar client.
        
        Args:
            credentials_path: Path to the credentials.json file
            token_path: Path to the token.json file
        """
        # Get credentials paths from Config if not provided
        google_creds = Config.get_google_credentials()
        
        self.credentials_path = credentials_path or google_creds["credentials_path"]
        self.token_path = token_path or google_creds["token_path"]
        
        logger.info(f"Using credentials at: {self.credentials_path}")
        logger.info(f"Using token at: {self.token_path}")
        
        # Also try to get API key if available (for public data operations)
        self.api_key = Config.get_google_api_key()
        
        self.credentials = None
        self.service = None
        
    def check_credentials_exist(self) -> bool:
        """Check if the credentials file exists."""
        if not os.path.exists(self.credentials_path):
            logger.error(f"Credentials file not found at: {self.credentials_path}")
            logger.info("Please download your OAuth credentials from Google Cloud Console and save as credentials.json")
            return False
        return True
        
    def authenticate(self) -> None:
        """Authenticate with Google Calendar API."""
        if not self.check_credentials_exist():
            raise FileNotFoundError(
                f"Google API credentials not found at {self.credentials_path}. "
                f"Please follow setup instructions in the README.md file."
            )
            
        try:
            # Check if token.json exists with valid credentials
            if os.path.exists(self.token_path):
                try:
                    with open(self.token_path, 'r') as token_file:
                        token_data = json.load(token_file)
                    self.credentials = Credentials.from_authorized_user_info(
                        info=token_data,
                        scopes=self.SCOPES
                    )
                except (json.JSONDecodeError, ValueError) as e:
                    logger.warning(f"Token file is invalid, will re-authenticate: {e}")
                    self.credentials = None
            
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
            self.service = build('calendar', 'v3', credentials=self.credentials)
            logger.info("Successfully authenticated with Google Calendar")
            
        except HttpError as e:
            logger.error(f"Google API HTTP error: {e}")
            raise
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            raise
            
    def list_upcoming_events(self, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        List upcoming calendar events.
        
        Args:
            max_results: Maximum number of events to return
            
        Returns:
            List of calendar events
        """
        if not self.service:
            self.authenticate()
            
        try:
            now = datetime.datetime.utcnow().isoformat() + 'Z'
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=now,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            logger.info(f"Retrieved {len(events)} upcoming events")
            return events
            
        except Exception as e:
            logger.error(f"Error listing events: {str(e)}")
            return []
            
    def create_event(self, 
                     summary: str,
                     start_time: datetime.datetime,
                     end_time: datetime.datetime,
                     description: str = None,
                     location: str = None) -> Dict[str, Any]:
        """
        Create a calendar event.
        
        Args:
            summary: Event title
            start_time: Event start time
            end_time: Event end time
            description: Event description
            location: Event location
            
        Returns:
            Created event details
        """
        if not self.service:
            self.authenticate()
            
        try:
            event = {
                'summary': summary,
                'start': {
                    'dateTime': start_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_time.isoformat(),
                    'timeZone': 'UTC',
                }
            }
            
            if description:
                event['description'] = description
                
            if location:
                event['location'] = location
                
            created_event = self.service.events().insert(
                calendarId='primary',
                body=event
            ).execute()
            
            logger.info(f"Event created: {created_event.get('htmlLink')}")
            return created_event
            
        except Exception as e:
            logger.error(f"Error creating event: {str(e)}")
            raise
