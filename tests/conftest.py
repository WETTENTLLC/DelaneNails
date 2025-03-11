"""
Test configuration and shared fixtures.
"""
import os
import sys
import pytest
from pathlib import Path

# Add project root to Python path to ensure imports work
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Set test environment variables
os.environ["OPENAI_API_KEY"] = "test_openai_key"
os.environ["BOOKSY_API_KEY"] = "test_booksy_key"
os.environ["BOOKSY_BUSINESS_ID"] = "test_business_id"
