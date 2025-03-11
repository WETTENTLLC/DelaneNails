class ChatIntegration {
    constructor() {
        this.intentDetector = new IntentDetector();
        this.knowledgeBase = new KnowledgeBase();
        this.contextManager = new ContextManager();
        this.siteNavigator = new SiteNavigator();
        this.responseGenerator = new ResponseGenerator(
            this.knowledgeBase, 
            this.contextManager, 
            this.siteNavigator
        );
        
        this.messageProcessor = new MessageProcessor();
        this.setupEventListeners();
        this.enableVoiceInput();
    }
    
    setupEventListeners() {
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');
        
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const message = chatInput.value.trim();
                if (message) {
                    this.handleUserMessage(message);
                    chatInput.value = '';
                }
            });
        }
        
        // Add a welcome message when chat widget is opened
        const chatWidget = document.querySelector('.chat-widget');
        if (chatWidget) {
            const chatToggle = document.querySelector('.chat-toggle');
            if (chatToggle) {
                chatToggle.addEventListener('click', () => {
                    if (chatWidget.classList.contains('hidden')) {
                        setTimeout(() => {
                            if (this.contextManager.getContext().conversationHistory.length === 0) {
                                this.addBotMessage(this.responseGenerator.getRandomGreeting());
                            }
                        }, 500);
                    }
                    chatWidget.classList.toggle('hidden');
                });
            }
        }
    }
    
    handleUserMessage(message) {
        // Add user message to chat
        this.addUserMessage(message);
        
        // Process the message
        this.processMessage(message);
    }
    
    async processMessage(message) {
        try {
            // Detect intent
            const intent = await this.intentDetector.detectIntent(message);
            
            // Generate response
            const response = this.responseGenerator.generateResponse(intent, message);
            
            // Add bot response to chat
            setTimeout(() => {
                this.addBotMessage(response);
            }, 500); // Small delay for natural feeling
            
        } catch (error) {
            console.error('Error processing message:', error);
            this.addBotMessage("I'm sorry, I encountered an error. Please try again.");
        }
    }
    
    addUserMessage(message) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    addBotMessage(message) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        
        // Check if message contains HTML
        if (message.includes('<a')) {
            messageElement.innerHTML = message;
        } else {
            messageElement.textContent = message;
        }
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Read message aloud if speech synthesis is enabled
        if (window.speechSynthesis && localStorage.getItem('speechEnabled') === 'true') {
            this.speakMessage(message.replace(/<[^>]*>?/gm, '')); // Remove HTML tags for speech
        }
    }
    
    enableVoiceInput() {
        // Check if browser supports speech recognition
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            
            const voiceButton = document.createElement('button');
            voiceButton.className = 'voice-input-button';
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceButton.title = "Speak your message";
            
            const chatForm = document.getElementById('chat-form');
            if (chatForm) {
                chatForm.appendChild(voiceButton);
                
                voiceButton.addEventListener('click', () => {
                    recognition.start();
                    voiceButton.classList.add('listening');
                    voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                });
                
                recognition.onresult = (event) => {
                    const speechResult = event.results[0][0].transcript;
                    document.getElementById('chat-input').value = speechResult;
                    voiceButton.classList.remove('listening');
                    voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
                    
                    // Auto-submit if confidence is high
                    if (event.results[0][0].confidence > 0.8) {
                        setTimeout(() => {
                            document.getElementById('chat-form').dispatchEvent(new Event('submit'));
                        }, 500);
                    }
                };
                
                recognition.onend = () => {
                    voiceButton.classList.remove('listening');
                    voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
                };
                
                recognition.onerror = (event) => {
                    console.error('Speech recognition error', event.error);
                    voiceButton.classList.remove('listening');
                    voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
                };
            }
            
            // Add speech toggle button
            const speechToggle = document.createElement('button');
            speechToggle.className = 'speech-toggle';
            speechToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            speechToggle.title = "Toggle text-to-speech";
            
            // Check saved preference
            if (localStorage.getItem('speechEnabled') === 'true') {
                speechToggle.classList.add('active');
            } else {
                speechToggle.classList.remove('active');
                localStorage.setItem('speechEnabled', 'false');
            }
            
            const chatHeader = document.querySelector('.chat-header');
            if (chatHeader) {
                chatHeader.appendChild(speechToggle);
                
                speechToggle.addEventListener('click', () => {
                    if (speechToggle.classList.contains('active')) {
                        speechToggle.classList.remove('active');
                        localStorage.setItem('speechEnabled', 'false');
                    } else {
                        speechToggle.classList.add('active');
                        localStorage.setItem('speechEnabled', 'true');
                        // Speak a test message
                        this.speakMessage("Text to speech is now enabled");
                    }
                });
            }
        }
    }
    
    speakMessage(message) {
        if (window.speechSynthesis) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.lang = 'en-US';
            
            // Try to use a female voice if available
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => 
                voice.name.includes('female') || 
                voice.name.includes('Samantha') || 
                voice.name.includes('Victoria')
            );
            
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        }
    }
    
    displaySuggestions(suggestions) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages || !suggestions || suggestions.length === 0) return;
        
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'suggestions-container';
        
        suggestions.forEach(suggestion => {
            const suggestionButton = document.createElement('button');
            suggestionButton.className = 'suggestion-button';
            suggestionButton.textContent = suggestion;
            suggestionButton.addEventListener('click', () => {
                document.getElementById('chat-input').value = suggestion;
                document.getElementById('chat-form').dispatchEvent(new Event('submit'));
            });
            suggestionsContainer.appendChild(suggestionButton);
        });
        
        chatMessages.appendChild(suggestionsContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    checkAccessibility() {
        // Add ARIA labels to chat elements
        const chatToggle = document.querySelector('.chat-toggle');
        if (chatToggle) {
            chatToggle.setAttribute('aria-label', 'Toggle chat assistant');
            chatToggle.setAttribute('role', 'button');
        }
        
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.setAttribute('aria-label', 'Type your message here');
        }
        
        const chatSubmit = document.querySelector('#chat-form button[type="submit"]');
        if (chatSubmit) {
            chatSubmit.setAttribute('aria-label', 'Send message');
        }
        
        const voiceButton = document.querySelector('.voice-input-button');
        if (voiceButton) {
            voiceButton.setAttribute('aria-label', 'Speak your message');
        }
        
        const speechToggle = document.querySelector('.speech-toggle');
        if (speechToggle) {
            speechToggle.setAttribute('aria-label', 'Toggle text-to-speech');
        }
    }
}

// Initialize the chat integration when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const chatIntegration = new ChatIntegration();
});