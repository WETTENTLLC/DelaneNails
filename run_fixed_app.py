"""
Script to run the fixed version of the Delane Nails web application.
"""
import os
import sys

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from src.web_simple_fixed import start_simple_web_server
    print("Starting Delane Nails web application (fixed version)...")
    start_simple_web_server()
except ImportError as e:
    print(f"Error importing required modules: {str(e)}")
    print("Please make sure you've installed the required packages:")
    print("  pip install flask requests")
except Exception as e:
    print(f"Error starting the application: {str(e)}")
