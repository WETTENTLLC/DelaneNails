"""
Main entry point for the Delane Nails booking system.
"""
import os
from src.agent import BookingAgent

def main():
    """Run the booking agent in interactive mode."""
    print("Starting Delane Nails booking system...")
    
    # Create agent (use mocks for development)
    use_mock = os.getenv("USE_MOCK_API", "True").lower() == "true"
    agent = BookingAgent(use_mock_api=use_mock)
    
    print("\n" + "=" * 50)
    print("Welcome to Delane Nails Booking System")
    print("Type 'exit' or 'quit' to end the conversation.")
    print("=" * 50 + "\n")
    
    # Greet the user
    response = agent.process_message("hello")
    print(f"Agent: {response}")
    
    # Main conversation loop
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() in ["exit", "quit", "bye"]:
            print("\nAgent: Thank you for using Delane Nails booking system. Goodbye!")
            break
        
        response = agent.process_message(user_input)
        print(f"\nAgent: {response}")

if __name__ == "__main__":
    main()
