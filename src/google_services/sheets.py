"""
Google Sheets API integration for DelaneNails.
"""
import logging
import os
from typing import List, Dict, Any, Optional

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from src.config import Config

logger = logging.getLogger(__name__)

class GoogleSheets:
    """Client for interacting with Google Sheets API."""
    
    def __init__(self, spreadsheet_id: Optional[str] = None, credentials_path: Optional[str] = None):
        """
        Initialize the Google Sheets client.
        
        Args:
            spreadsheet_id: The ID of the spreadsheet to work with
            credentials_path: Path to OAuth2 credentials file
        """
        self.spreadsheet_id = spreadsheet_id
        self.credentials_path = credentials_path
        self.api_key = Config.get_google_api_key()
        self.service = None
        
        # Get Google credentials paths
        google_creds = Config.get_google_credentials()
        self.credentials_path = credentials_path or google_creds["credentials_path"]
        self.token_path = google_creds["token_path"]

    def build_service_with_api_key(self):
        """Build the service using API key (limited read-only access)."""
        try:
            self.service = build('sheets', 'v4', developerKey=self.api_key)
            logger.info("Successfully built Sheets service with API key")
            return self.service
        except Exception as e:
            logger.error(f"Error building Sheets service with API key: {e}")
            raise

    def build_service_with_oauth(self):
        """Build the service using OAuth2 credentials (full access)."""
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        import json
        
        SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
        
        try:
            creds = None
            # Check if token file exists
            if os.path.exists(self.token_path):
                with open(self.token_path, 'r') as token:
                    creds = Credentials.from_authorized_user_info(
                        info=json.load(token),
                        scopes=SCOPES
                    )
            
            # If no valid credentials, authenticate
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_path, SCOPES
                    )
                    creds = flow.run_local_server(port=0)
                
                # Save credentials for next run
                with open(self.token_path, 'w') as token:
                    token.write(json.dumps(json.loads(creds.to_json())))
            
            # Build service
            self.service = build('sheets', 'v4', credentials=creds)
            logger.info("Successfully built Sheets service with OAuth")
            return self.service
            
        except Exception as e:
            logger.error(f"Error building Sheets service with OAuth: {e}")
            raise

    def get_service(self, use_oauth: bool = True):
        """
        Get the Sheets service, building it if necessary.
        
        Args:
            use_oauth: Whether to use OAuth (True) or API key (False)
        
        Returns:
            The Sheets service
        """
        if self.service:
            return self.service
            
        if use_oauth:
            return self.build_service_with_oauth()
        else:
            return self.build_service_with_api_key()

    def read_range(self, range_name: str, use_oauth: bool = False) -> List[List[Any]]:
        """
        Read data from a range in a spreadsheet.
        
        Args:
            range_name: The A1 notation of the range to read
            use_oauth: Whether to use OAuth instead of API key
            
        Returns:
            The values from the range
        """
        if not self.spreadsheet_id:
            raise ValueError("spreadsheet_id is required")
            
        service = self.get_service(use_oauth=use_oauth)
        
        try:
            result = service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=range_name
            ).execute()
            
            values = result.get('values', [])
            logger.info(f"Read {len(values)} rows from sheet")
            return values
            
        except HttpError as e:
            logger.error(f"HTTP error reading from sheet: {e}")
            raise
        except Exception as e:
            logger.error(f"Error reading from sheet: {e}")
            raise

    def write_range(self, range_name: str, values: List[List[Any]]) -> int:
        """
        Write data to a range in a spreadsheet.
        
        Args:
            range_name: The A1 notation of the range to write
            values: The data to write
            
        Returns:
            Number of cells updated
        """
        if not self.spreadsheet_id:
            raise ValueError("spreadsheet_id is required")
            
        # Write operations require OAuth
        service = self.get_service(use_oauth=True)
        
        try:
            body = {
                'values': values
            }
            result = service.spreadsheets().values().update(
                spreadsheetId=self.spreadsheet_id,
                range=range_name,
                valueInputOption='RAW',
                body=body
            ).execute()
            
            updated_cells = result.get('updatedCells', 0)
            logger.info(f"Updated {updated_cells} cells in sheet")
            return updated_cells
            
        except HttpError as e:
            logger.error(f"HTTP error writing to sheet: {e}")
            raise
        except Exception as e:
            logger.error(f"Error writing to sheet: {e}")
            raise

    def append_row(self, sheet_range: str, values: List[Any]) -> int:
        """
        Append a row to a spreadsheet.
        
        Args:
            sheet_range: The A1 notation of the range to append to
            values: The row data to append
            
        Returns:
            Number of cells updated
        """
        if not self.spreadsheet_id:
            raise ValueError("spreadsheet_id is required")
            
        # Append operations require OAuth
        service = self.get_service(use_oauth=True)
        
        try:
            body = {
                'values': [values]  # Wrap in list for single row
            }
            result = service.spreadsheets().values().append(
                spreadsheetId=self.spreadsheet_id,
                range=sheet_range,
                valueInputOption='RAW',
                insertDataOption='INSERT_ROWS',
                body=body
            ).execute()
            
            updated_cells = result.get('updates', {}).get('updatedCells', 0)
            logger.info(f"Appended row with {updated_cells} cells to sheet")
            return updated_cells
            
        except HttpError as e:
            logger.error(f"HTTP error appending to sheet: {e}")
            raise
        except Exception as e:
            logger.error(f"Error appending to sheet: {e}")
            raise
