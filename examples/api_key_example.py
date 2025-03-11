"""
Examples demonstrating how to use your Google API key with available services.
This shows basic initialization of various Google APIs enabled for your key.
"""
import os
import sys
import logging
from pathlib import Path

# Add the project root directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from src.config import Config
from googleapiclient.discovery import build

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Run examples for different Google APIs."""
    # Get API key from configuration
    api_key = Config.get_google_api_key()
    
    if not api_key:
        logger.error("No Google API key found in configuration")
        return
    
    logger.info("API key found. Key starts with: " + api_key[:8] + "...")
    
    # Test initializing different APIs
    apis_to_test = [
        # API name, API version
        ("calendar", "v3"),
        ("sheets", "v4"),
        ("gmail", "v1"),
        ("storage", "v1"),
        ("monitoring", "v3"),
        ("logging", "v2"),
        ("datastore", "v1"),
        ("cloudsql", "v1beta4"),
    ]
    
    successful_apis = []
    failed_apis = []
    
    for api_name, api_version in apis_to_test:
        try:
            logger.info(f"Testing {api_name} API...")
            service = build(api_name, api_version, developerKey=api_key)
            successful_apis.append(f"{api_name} v{api_version}")
        except Exception as e:
            logger.error(f"Error initializing {api_name} API: {e}")
            failed_apis.append(f"{api_name} v{api_version}")
    
    logger.info(f"Successfully initialized APIs: {', '.join(successful_apis)}")
    if failed_apis:
        logger.warning(f"Failed to initialize APIs: {', '.join(failed_apis)}")
        logger.warning("Note: Some APIs might require OAuth2 authentication instead of API key")

if __name__ == "__main__":
    main()
