"""
Configuration settings for the DelaneNails application.
"""
import os
from typing import Dict, Any
import json
from pathlib import Path

class Config:
    """Configuration manager for DelaneNails application."""
    
    def __init__(self, config_file: str = None):
        """
        Initialize configuration from environment variables and config file.
        
        Args:
            config_file: Path to JSON configuration file (optional)
        """
        # Default configuration
        self.settings = {
            # API settings
            "api_host": "0.0.0.0",
            "api_port": 8000,
            "api_debug": True,
            
            # External API settings
            "use_mock_api": True,
            "external_api_url": "https://api.nailsalon.example",
            "api_key": "",
            
            # Database settings
            "db_type": "sqlite",
            "db_path": "delane_nails.db",
            
            # Email settings
            "smtp_host": "smtp.example.com",
            "smtp_port": 587,
            "smtp_username": "",
            "smtp_password": "",
            "from_email": "appointments@delanenails.com",
            
            # SMS settings
            "sms_provider": "twilio",
            "twilio_account_sid": "",
            "twilio_auth_token": "",
            "twilio_phone_number": "",
            
            # Business settings
            "business_name": "Delane Nails",
            "business_phone": "",
            "business_email": "info@delanenails.com",
            "business_address": "123 Main St, Anytown, USA",
            "business_hours": {
                "monday": "9:00-17:00",
                "tuesday": "9:00-17:00",
                "wednesday": "9:00-17:00",
                "thursday": "9:00-17:00",
                "friday": "9:00-17:00",
                "saturday": "9:00-17:00",
                "sunday": "closed"
            },
            
            # Web interface settings
            "web_host": "0.0.0.0",
            "web_port": 5000,
            "web_debug": True
        }
        
        # Load from config file if provided
        if config_file:
            self._load_from_file(config_file)
            
        # Override with environment variables
        self._load_from_env()
    
    def _load_from_file(self, config_file: str) -> None:
        """Load configuration from JSON file."""
        config_path = Path(config_file)
        if config_path.exists():
            with open(config_path, 'r') as f:
                file_config = json.load(f)
                self.settings.update(file_config)
    
    def _load_from_env(self) -> None:
        """Load configuration from environment variables."""
        # API settings
        if os.getenv("API_HOST"):
            self.settings["api_host"] = os.getenv("API_HOST")
        if os.getenv("API_PORT"):
            self.settings["api_port"] = int(os.getenv("API_PORT"))
        if os.getenv("API_DEBUG"):
            self.settings["api_debug"] = os.getenv("API_DEBUG").lower() == "true"
            
        # External API settings
        if os.getenv("USE_MOCK_API"):
            self.settings["use_mock_api"] = os.getenv("USE_MOCK_API").lower() == "true"
        if os.getenv("EXTERNAL_API_URL"):
            self.settings["external_api_url"] = os.getenv("EXTERNAL_API_URL")
        if os.getenv("API_KEY"):
            self.settings["api_key"] = os.getenv("API_KEY")
            
        # Database settings
        if os.getenv("DB_TYPE"):
            self.settings["db_type"] = os.getenv("DB_TYPE")
        if os.getenv("DB_PATH"):
            self.settings["db_path"] = os.getenv("DB_PATH")
            
        # Other settings follow the same pattern...
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get a configuration value."""
        return self.settings.get(key, default)
    
    def __getitem__(self, key: str) -> Any:
        """Allow dictionary-style access to configuration."""
        return self.settings[key]
    
    def to_dict(self) -> Dict[str, Any]:
        """Export configuration as a dictionary."""
        return self.settings.copy()


# Create a singleton instance
config = Config()
