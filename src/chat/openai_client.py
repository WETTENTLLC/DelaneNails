"""
Client for interacting with OpenAI's API.
"""
import logging
from openai import OpenAI
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class OpenAIClient:
    """Client to interact with OpenAI's API."""
    
    def __init__(self, api_key: str):
        """Initialize the OpenAI client with an API key."""
        self.client = OpenAI(api_key=api_key)
        logger.info("OpenAI client initialized")
        
    def chat_completion(self, 
                        messages: List[Dict[str, str]], 
                        model: str = "gpt-4", 
                        temperature: float = 0.7,
                        max_tokens: Optional[int] = None) -> Any:
        """
        Send a chat completion request to OpenAI.
        
        Args:
            messages: List of message dictionaries (role, content)
            model: OpenAI model to use
            temperature: Sampling temperature
            max_tokens: Maximum tokens in the response
            
        Returns:
            OpenAI API response
        """
        try:
            logger.debug(f"Sending chat completion request with model {model}")
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response
        except Exception as e:
            logger.error(f"Error in chat completion request: {str(e)}")
            raise
            
    def get_response_text(self, response: Any) -> str:
        """Extract the response text from an OpenAI chat completion."""
        try:
            return response.choices[0].message.content
        except (AttributeError, IndexError) as e:
            logger.error(f"Error extracting response text: {str(e)}")
            return ""
