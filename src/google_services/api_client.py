"""
Generic Google API client that uses API key authentication.
For APIs that don't need OAuth2 user consent/credentials.
"""
import logging
from typing import Any, Optional, Dict

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from src.config import Config

logger = logging.getLogger(__name__)

class GoogleApiClient:
    """
    Client for accessing Google APIs using an API key.
    This is for APIs that don't require OAuth2 user authentication.
    """
    
    # Map of API identifiers to their service names and versions
    AVAILABLE_APIS = {
        'calendar': ('calendar', 'v3'),
        'sheets': ('sheets', 'v4'),
        'gmail': ('gmail', 'v1'),
        'storage': ('storage', 'v1'),
        'cloud_storage': ('storage', 'v1'),
        'monitoring': ('monitoring', 'v3'),
        'logging': ('logging', 'v2'),
        'datastore': ('datastore', 'v1'),
        'cloudsql': ('sqladmin', 'v1beta4'),
        'dataplex': ('dataplex', 'v1'),
        'analytics_hub': ('analyticshub', 'v1'),
        'dataform': ('dataform', 'v1beta1'),
        'service_management': ('servicemanagement', 'v1'),
        'service_usage': ('serviceusage', 'v1'),
    }
    
    def __init__(self, api_name: str, api_version: Optional[str] = None, api_key: Optional[str] = None):
        """
        Initialize the API client.
        
        Args:
            api_name: The name or identifier of the API
            api_version: The version of the API (if None, uses default from AVAILABLE_APIS)
            api_key: Your Google API key. If None, will be loaded from config.
        """
        # Handle using identifiers from AVAILABLE_APIS
        if api_name in self.AVAILABLE_APIS and api_version is None:
            self.api_name, self.api_version = self.AVAILABLE_APIS[api_name]
        else:
            self.api_name = api_name
            self.api_version = api_version or 'v1'
            
        self.api_key = api_key or Config.get_google_api_key()
        
        if not self.api_key:
            logger.error("No API key provided or found in environment variables")
            raise ValueError("API key is required")
        
        self.service = None
    
    def build_service(self) -> Any:
        """
        Build and return the service object for the specified API.
        
        Returns:
            The service object for the API
        """
        try:
            self.service = build(
                self.api_name, 
                self.api_version, 
                developerKey=self.api_key
            )
            logger.info(f"Successfully built service for {self.api_name} {self.api_version}")
            return self.service
        
        except HttpError as e:
            logger.error(f"HTTP error building service: {e}")
            raise
        
        except Exception as e:
            logger.error(f"Error building service: {e}")
            raise
    
    def get_service(self) -> Any:
        """
        Get the service object, building it if necessary.
        
        Returns:
            The service object for the API
        """
        if not self.service:
            self.build_service()
        return self.service

    @classmethod
    def list_available_apis(cls) -> Dict[str, tuple]:
        """List all available APIs supported by this client."""
        return cls.AVAILABLE_APIS

# Convenience functions for commonly used APIs
def get_calendar_client():
    """Get a Calendar API client."""
    return GoogleApiClient('calendar')

def get_sheets_client():
    """Get a Sheets API client."""
    return GoogleApiClient('sheets')

def get_gmail_client():
    """Get a Gmail API client."""
    return GoogleApiClient('gmail')

def get_storage_client():
    """Get a Cloud Storage API client."""
    return GoogleApiClient('storage')
