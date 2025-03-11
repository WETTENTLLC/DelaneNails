"""
Example demonstrating how to use Google Sheets API with DelaneNails.
This shows both read and write operations.
"""
import os
import sys
import logging
from pathlib import Path
from datetime import datetime

# Add the project root directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from src.google_services.sheets import GoogleSheets
from src.config import Config

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Replace with your actual Google Sheet ID
# (The long string in the URL of your spreadsheet)
SAMPLE_SPREADSHEET_ID = "your_spreadsheet_id_here"

def main():
    """Run the Google Sheets API example."""
    # Initialize the Sheets client
    sheets = GoogleSheets(spreadsheet_id=SAMPLE_SPREADSHEET_ID)
    
    # READ EXAMPLE: Read data from the sheet
    # This works with API key for public sheets or OAuth for private sheets
    try:
        # Try reading with API key first (public sheets only)
        logger.info("Reading sheet data with API key...")
        values = sheets.read_range("Sheet1!A1:D10", use_oauth=False)
        
        if not values:
            logger.info("No data found or sheet not public.")
        else:
            logger.info("Data retrieved successfully using API key:")
            for row in values[:5]:  # Show first 5 rows
                logger.info(row)
    except Exception as e:
        logger.error(f"Error reading with API key (sheet might not be public): {e}")
        
        # Try reading with OAuth as fallback
        try:
            logger.info("Reading sheet data with OAuth...")
            values = sheets.read_range("Sheet1!A1:D10", use_oauth=True)
            
            if not values:
                logger.info("No data found.")
            else:
                logger.info("Data retrieved successfully using OAuth:")
                for row in values[:5]:  # Show first 5 rows
                    logger.info(row)
        except Exception as oauth_error:
            logger.error(f"Error reading with OAuth: {oauth_error}")
    
    # WRITE EXAMPLE: Append a new row to the sheet
    # This requires OAuth authentication
    try:
        logger.info("Appending a new row to the sheet...")
        new_row = [
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Example Client",
            "Manicure",
            "$45.00"
        ]
        
        # Uncomment to actually write to your sheet
        # updated_cells = sheets.append_row("Sheet1!A:D", new_row)
        # logger.info(f"Appended new row with {updated_cells} cells")
        
        logger.info("Write example prepared (not executed)")
        logger.info(f"Row that would be written: {new_row}")
        logger.info("To actually write data, uncomment the relevant code in this script")
        
    except Exception as e:
        logger.error(f"Error writing to sheet: {e}")

if __name__ == "__main__":
    main()
