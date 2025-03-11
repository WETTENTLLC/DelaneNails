"""
Example script demonstrating how to use the Google Calendar integration.
"""
import os
import logging
import datetime
import sys
from pathlib import Path

# Add the project root directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from src.google_services.calendar import GoogleCalendar
from src.config import Config

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Run the Google Calendar example."""
    # Get credentials paths from environment or default config
    creds = Config.get_google_credentials()
    
    # Print credential paths
    logger.info(f"Using credentials file: {creds['credentials_path']}")
    logger.info(f"Using token file: {creds['token_path']}")
    
    # Check if credentials file exists
    if not os.path.exists(creds['credentials_path']):
        logger.error(
            f"Credentials file not found at {creds['credentials_path']}. "
            f"Please download your credentials from Google Cloud Console."
        )
        return
    
    # Initialize the calendar client
    calendar = GoogleCalendar(
        credentials_path=creds['credentials_path'],
        token_path=creds['token_path']
    )
    
    try:
        # Authenticate
        calendar.authenticate()
        
        # List upcoming events
        logger.info("Getting upcoming events...")
        events = calendar.list_upcoming_events(max_results=5)
        
        if events:
            logger.info(f"Found {len(events)} upcoming events:")
            for event in events:
                start = event.get('start', {}).get('dateTime', event.get('start', {}).get('date'))
                logger.info(f"- {start}: {event.get('summary')}")
        else:
            logger.info("No upcoming events found.")
            
        # Create a test event (uncomment to test)
        # start_time = datetime.datetime.now() + datetime.timedelta(days=1)
        # end_time = start_time + datetime.timedelta(hours=1)
        # calendar.create_event(
        #     summary="Test Event",
        #     start_time=start_time,
        #     end_time=end_time,
        #     description="This is a test event created by the example script",
        #     location="DelaneNails Salon"
        # )
        
    except Exception as e:
        logger.error(f"Error in calendar example: {e}")

if __name__ == "__main__":
    main()
