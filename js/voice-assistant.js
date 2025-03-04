/**
 * Voice Assistant for NailAide
 * Adds speech recognition and text-to-speech capabilities
 */

const VoiceAssistant = {
    recognition: null,
    synthesis: window.speechSynthesis,
    isListening: false,
    voices: [],
    selectedVoice: null,
    language: 'en-US',
    parentApp: null,
    
    init: function(parentApp) {
        this.parentApp = parentApp;
        console.log('Initializing voice assistant...');
        
        // Initialize Web Speech API
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = this.language;
            
            // Set up recognition event handlers
            this.setupRecognitionEvents();
            
            console.log('Speech recognition initialized');
        } else {
            console.error('Speech recognition not supported in this browser');
        }
        
        // Initialize text-to-speech
        if ('speechSynthesis' in window) {
            // Get available voices
            this.loadVoices();
            
            // If voices aren't available immediately, wait for them
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
            }
            
            console.log('Speech synthesis initialized');
        } else {
            console.error('Speech synthesis not supported in this browser');
        }
    },
    
    loadVoices: function() {
        this.voices = this.synthesis.getVoices();
        
        // Select default voice based on language
        if (this.voices.length > 0) {
            // Try to find a voice that matches the current language
            this.selectedVoice = this.voices.find(voice => 
                voice.lang.includes(this.language.substring(0, 2)) && 
                voice.localService
            );
            
            // Fallback to the first available voice if no match
            if (!this.selectedVoice) {
                this.selectedVoice = this.voices[0];
            }
            
            console.log(`Selected voice: ${this.selectedVoice.name}`);
        } else {
            console.warn('No voices available for speech synthesis');
        }
    },
    
    setupRecognitionEvents: function() {
        if (!this.recognition) return;
        
        this.recognition.onstart = () => {
            console.log('Voice recognition started');
            this.isListening = true;
            this.updateVoiceButton(true);
        };
        
        this.recognition.onend = () => {
            console.log('Voice recognition ended');
            this.isListening = false;
            this.updateVoiceButton(false);
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            console.log('Recognized:', transcript);
            
            // Add the transcript to the input field and send
            if (this.parentApp) {
                this.parentApp.handleVoiceInput(transcript);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceButton(false);
            
            // Show error message if appropriate
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                if (this.parentApp) {
                    this.parentApp.addMessage(`Sorry, I couldn't understand. Please try again.`, 'assistant');
                }
            }
        };
    },
    
    startListening: function() {
        if (!this.recognition) {
            console.error('Speech recognition not initialized');
            return;
        }
        
        try {
            this.recognition.start();
            console.log('Starting voice recognition...');
        } catch (error) {
            console.error('Error starting recognition:', error);
            
            // If already listening, stop and restart
            if (error.name === 'InvalidStateError') {
                this.recognition.stop();
                setTimeout(() => {
                    this.startListening();
                }, 100);
            }
        }
    },
    
    stopListening: function() {
        if (!this.recognition) return;
        
        try {
            this.recognition.stop();
            console.log('Stopping voice recognition...');
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    },
    
    toggleListening: function() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    },
    
    speak: function(text) {
        if (!this.synthesis) {
            console.error('Speech synthesis not supported');
            return;
        }
        
        // Cancel any current speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set the voice if available
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        
        utterance.lang = this.language;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        console.log(`Speaking: "${text}"`);
        this.synthesis.speak(utterance);
    },
    
    setLanguage: function(language) {
        this.language = language;
        
        // Update recognition language
        if (this.recognition) {
            this.recognition.lang = language;
        }
        
        // Find appropriate voice for the language
        this.loadVoices();
        
        console.log(`Language set to: ${language}`);
    },
    
    updateVoiceButton: function(isActive) {
        const voiceButton = document.querySelector('.voice-button');
        if (voiceButton) {
            if (isActive) {
                voiceButton.classList.add('active');
                voiceButton.setAttribute('title', 'Tap to stop listening');
                voiceButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>';
            } else {
                voiceButton.classList.remove('active');
                voiceButton.setAttribute('title', 'Tap to start voice input');
                voiceButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>';
            }
        }
    }
};

// Make available globally
window.VoiceAssistant = VoiceAssistant;
