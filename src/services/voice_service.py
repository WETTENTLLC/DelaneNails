"""
Voice processing service for speech-to-text and text-to-speech conversion.
"""
import logging
import base64
from typing import Dict, Any, Optional, Tuple
import os
import tempfile
import asyncio

import google.cloud.speech as speech
import google.cloud.texttospeech as tts
from google.oauth2 import service_account

from src.config import Config

logger = logging.getLogger(__name__)

class VoiceService:
    """Service for handling speech processing tasks."""
    
    def __init__(self):
        """Initialize voice service with necessary credentials."""
        self.config = Config()
        
        # Setup Google Cloud credentials
        credentials_json = self.config.get("GOOGLE_CREDENTIALS_JSON")
        if credentials_json:
            self.credentials = service_account.Credentials.from_service_account_info(credentials_json)
        else:
            self.credentials = None
            logger.warning("Google Cloud credentials not found, using application default credentials")
        
        # Initialize clients
        self.speech_client = speech.SpeechClient(credentials=self.credentials)
        self.tts_client = tts.TextToSpeechClient(credentials=self.credentials)
        
        logger.info("Voice service initialized")
    
    async def speech_to_text(self, audio_content: bytes, 
                           language_code: str = "en-US") -> Dict[str, Any]:
        """
        Convert speech audio to text.
        
        Args:
            audio_content: Raw audio bytes
            language_code: Language of the audio
            
        Returns:
            Dict with transcription results
        """
        logger.info(f"Processing speech to text, content size: {len(audio_content)} bytes")
        
        # Run in a separate thread to prevent blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, self._process_speech, audio_content, language_code
        )
        
        return result
    
    def _process_speech(self, audio_content: bytes, language_code: str) -> Dict[str, Any]:
        """Process speech synchronously (to be run in executor)."""
        try:
            audio = speech.RecognitionAudio(content=audio_content)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=language_code,
                enable_automatic_punctuation=True,
                model="phone_call"  # Optimized for phone calls
            )
            
            response = self.speech_client.recognize(config=config, audio=audio)
            
            results = []
            for result in response.results:
                alternative = result.alternatives[0]
                results.append({
                    "transcript": alternative.transcript,
                    "confidence": alternative.confidence
                })
            
            if results:
                return {
                    "success": True,
                    "results": results,
                    "text": results[0]["transcript"],
                    "confidence": results[0]["confidence"]
                }
            else:
                return {
                    "success": False,
                    "error": "No speech detected",
                    "results": [],
                    "text": "",
                    "confidence": 0.0
                }
                
        except Exception as e:
            logger.error(f"Error in speech recognition: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "results": [],
                "text": "",
                "confidence": 0.0
            }
    
    async def text_to_speech(self, text: str, voice_name: str = "en-US-Wavenet-F",
                           voice_gender: Optional[str] = None) -> Dict[str, Any]:
        """
        Convert text to speech audio.
        
        Args:
            text: Text to convert to speech
            voice_name: Voice name to use
            voice_gender: Optional gender override (MALE, FEMALE, NEUTRAL)
            
        Returns:
            Dict with audio content and metadata
        """
        logger.info(f"Converting text to speech: '{text[:50]}...' using voice {voice_name}")
        
        # Run in a separate thread to prevent blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, self._synthesize_speech, text, voice_name, voice_gender
        )
        
        return result
    
    def _synthesize_speech(self, text: str, voice_name: str, 
                          voice_gender: Optional[str] = None) -> Dict[str, Any]:
        """Synthesize speech synchronously (to be run in executor)."""
        try:
            # Set the text input to be synthesized
            synthesis_input = tts.SynthesisInput(text=text)
            
            # Parse voice name to get language code
            lang_code = voice_name.split("-")[0] + "-" + voice_name.split("-")[1]
            
            # Set gender if specified
            if voice_gender:
                gender_enum = None
                if voice_gender.upper() == "MALE":
                    gender_enum = tts.SsmlVoiceGender.MALE
                elif voice_gender.upper() == "FEMALE":
                    gender_enum = tts.SsmlVoiceGender.FEMALE
                else:
                    gender_enum = tts.SsmlVoiceGender.NEUTRAL
                
                voice = tts.VoiceSelectionParams(
                    language_code=lang_code,
                    name=voice_name,
                    ssml_gender=gender_enum
                )
            else:
                voice = tts.VoiceSelectionParams(
                    language_code=lang_code,
                    name=voice_name
                )
            
            # Select the type of audio file to return
            audio_config = tts.AudioConfig(
                audio_encoding=tts.AudioEncoding.MP3,
                speaking_rate=1.0,
                pitch=0.0
            )
            
            # Perform the text-to-speech request
            response = self.tts_client.synthesize_speech(
                input=synthesis_input, 
                voice=voice, 
                audio_config=audio_config
            )
            
            return {
                "success": True,
                "audio_content": response.audio_content,
                "audio_base64": base64.b64encode(response.audio_content).decode(),
                "content_type": "audio/mp3"
            }
            
        except Exception as e:
            logger.error(f"Error in speech synthesis: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "audio_content": None,
                "audio_base64": None
            }
