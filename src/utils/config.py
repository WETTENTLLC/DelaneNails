"""
Configuration management for the application.
"""
import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class Config:
    """Configuration manager for the application."""
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize configuration.
        
        Args:
            config_path: Path to the configuration file (JSON)
        """
        self.config_path = config_path or os.environ.get(
            "CONFIG_PATH",
            str(Path(__file__).parent.parent.parent / "config" / "config.json")
        )
        self.config = {}
        self.load_config()
        
    def load_config(self) -> None:
        """Load configuration from file."""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as config_file:
                    self.config = json.load(config_file)
                logger.info(f"Configuration loaded from {self.config_path}")
            else:
                logger.warning(f"No configuration file found at {self.config_path}")
                # Create default config directory if it doesn't exist
                os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
                self._create_default_config()
        except Exception as e:
            logger.error(f"Error loading configuration: {str(e)}")
            self._create_default_config()
            
    def _create_default_config(self) -> None:
        """Create default configuration file."""
        default_config = {
            "openai": {
                "model": "gpt-4",
                "temperature": 0.7
            },
            "app": {
                "log_level": "INFO",
                "debug_mode": False
            }
        }
        
        try:
            with open(self.config_path, 'w') as config_file:
                json.dump(default_config, config_file, indent=2)
            self.config = default_config
            logger.info(f"Default configuration created at {self.config_path}")
        except Exception as e:
            logger.error(f"Error creating default configuration: {str(e)}")
            
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value.
        
        Args:
            key: Configuration key (can be nested with dots, e.g., 'openai.model')
            default: Default value if key doesn't exist
            
        Returns:
            Configuration value
        """
        try:
            keys = key.split('.')
            value = self.config
            for k in keys:
                value = value.get(k)
                if value is None:
                    return default
            return value
        except Exception as e:
            logger.error(f"Error getting config value '{key}': {str(e)}")
            return default
            
    def set(self, key: str, value: Any) -> None:
        """
        Set configuration value.
        
        Args:
            key: Configuration key (can be nested with dots, e.g., 'openai.model')
            value: Value to set
        """
        try:
            keys = key.split('.')
            config = self.config
            for k in keys[:-1]:
                if k not in config:
                    config[k] = {}
                config = config[k]
            config[keys[-1]] = value
            self._save_config()
        except Exception as e:
            logger.error(f"Error setting config value '{key}': {str(e)}")
            
    def _save_config(self) -> None:
        """Save configuration to file."""
        try:
            with open(self.config_path, 'w') as config_file:
                json.dump(self.config, config_file, indent=2)
            logger.debug(f"Configuration saved to {self.config_path}")
        except Exception as e:
            logger.error(f"Error saving configuration: {str(e)}")
