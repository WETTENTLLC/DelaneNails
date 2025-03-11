"""
Command-line chat interface for NailAide.
"""
import asyncio
import logging
import os
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Set up logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# Ensure we can import from src directory
sys.path.insert(0, os.path.dirname(__file__))

# Import agent after path setup
from src.agent import Agent

class ChatSession:
    """Interactive CLI chat session with NailAide."""
    
    def __init__(self):
        """Initialize the chat session."""
        self.agent = Agent()
        self.conversation_history = []
        self.customer_info = {
            "name": "",
            "email": "",
            "phone": ""
        }
        
    async def start(self):
        """Start the chat session."""
        print("\n" + "=" * 60)
        print("Welcome to NailAide - Delane Nails Virtual Assistant")
        print("=" * 60)
        print("Type 'exit' or 'quit' to end the conversation.")
        print("Type 'voice' to switch to voice input mode.")
        print("Type 'info' to update your contact information.")
        print("\nHow can I help you today?")
        print("-" * 60)
        
        # Main chat loop
        while True:
            user_input = input("\nYou: ").strip()
            
            if user_input.lower() in ["exit", "quit"]:
                print("\nThank you for using NailAide. Have a great day!")
                break
                
            if user_input.lower() == "voice":
                print("\nVoice input is currently only available in the web interface.")
                print("Please continue typing your request.")
                continue
                
            if user_input.lower() == "info":
                await self.collect_customer_info()
                continue
                
            if not user_input:
                continue
                
            # Process the user's message
            response = await self.process_message(user_input)
            
            # Display the response
            self.display_response(response)
            
            # Optional: Add additional handling for specific actions
            action = response.get("action", "")
            if action == "display_slots":
                self.display_available_slots(response.get("data", {}).get("available_slots", []))
    
    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process a user message and get a response."""
        request_data = {
            "message": message,
            "customer_info": self.customer_info if any(self.customer_info.values()) else None
        }
        
        # Add message to history
        self.conversation_history.append({
            "role": "user",
            "content": message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Process the request
        response = await self.agent.process_request(request_data, channel="cli")
        
        # Add response to history
        self.conversation_history.append({
            "role": "assistant",
            "content": response.get("message", ""),
            "timestamp": datetime.now().isoformat()
        })
        
        return response
    
    def display_response(self, response: Dict[str, Any]):
        """Display the agent's response."""
        print(f"\nNailAide: {response.get('message', 'No response')}")
    
    def display_available_slots(self, slots):
        """Display available appointment slots in a readable format."""
        if not slots:
            print("No available slots to display.")
            return
            
        print("\nAvailable Appointment Slots:")
        print("-" * 40)
        for i, slot in enumerate(slots, 1):
            print(f"{i}. {slot.get('formatted_time')} with {slot.get('staff_name', 'Staff')}")
        print("-" * 40)
    
    async def collect_customer_info(self):
        """Collect customer information."""
        print("\n--- Contact Information ---")
        print("Please provide your contact information (press Enter to skip):")
        
        name = input("Name: ").strip()
        if name:
            self.customer_info["name"] = name
            
        email = input("Email: ").strip()
        if email:
            self.customer_info["email"] = email
            
        phone = input("Phone: ").strip()
        if phone:
            self.customer_info["phone"] = phone
            
        print("\nThank you for providing your information.")
        print(f"Name: {self.customer_info.get('name', 'Not provided')}")
        print(f"Email: {self.customer_info.get('email', 'Not provided')}")
        print(f"Phone: {self.customer_info.get('phone', 'Not provided')}")

async def main():
    """Main entry point."""
    chat = ChatSession()
    await chat.start()

if __name__ == "__main__":
    asyncio.run(main())
