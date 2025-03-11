class AccessibilityManager {
    constructor() {
        this.settings = {
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            textToSpeech: false,
            voiceControl: false
        };
        
        // Load saved settings
        this.loadSettings();
        
        // Set up accessibility controls when the DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.setupAccessibilityControls();
            this.applySettings();
        });
    }
    
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('accessibilitySettings');
            if (savedSettings) {
                this.settings = JSON.parse(savedSettings);
            }
            
            // Also check individual setting for text-to-speech
            if (localStorage.getItem('speechEnabled') === 'true') {
                this.settings.textToSpeech = true;
            }
        } catch (e) {
            console.error('Error loading accessibility settings:', e);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
            
            // Also save individual setting for text-to-speech for compatibility
            localStorage.setItem('speechEnabled', this.settings.textToSpeech);
        } catch (e) {
            console.error('Error saving accessibility settings:', e);
        }
    }
    
    setupAccessibilityControls() {
        // Create accessibility menu if it doesn't exist
        let accessibilityMenu = document.getElementById('accessibility-menu');
        
        if (!accessibilityMenu) {
            accessibilityMenu = document.createElement('div');
            accessibilityMenu.id = 'accessibility-menu';
            accessibilityMenu.className = 'accessibility-menu hidden';
            document.body.appendChild(accessibilityMenu);
            
            // Add accessibility menu button
            const menuButton = document.createElement('button');
            menuButton.className = 'accessibility-toggle';
            menuButton.innerHTML = '<i class="fas fa-universal-access"></i>';
            menuButton.setAttribute('aria-label', 'Accessibility Options');
            menuButton.setAttribute('title', 'Accessibility Options');
            document.body.appendChild(menuButton);
            
            menuButton.addEventListener('click', () => {
                accessibilityMenu.classList.toggle('hidden');
            });
            
            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!accessibilityMenu.contains(e.target) && !menuButton.contains(e.target)) {
                    accessibilityMenu.classList.add('hidden');
                }
            });
            
            // Add settings controls
            const settings = [
                { id: 'high-contrast', label: 'High Contrast', key: 'highContrast' },
                { id: 'large-text', label: 'Large Text', key: 'largeText' },
                { id: 'reduced-motion', label: 'Reduced Motion', key: 'reducedMotion' },
                { id: 'text-to-speech', label: 'Text to Speech', key: 'textToSpeech' },
                { id: 'voice-control', label: 'Voice Control', key: 'voiceControl' }
            ];
            
            settings.forEach(setting => {
                const controlContainer = document.createElement('div');
                controlContainer.className = 'accessibility-control';
                
                const toggle = document.createElement('input');
                toggle.type = 'checkbox';
                toggle.id = setting.id;
                toggle.checked = this.settings[setting.key];
                
                toggle.addEventListener('change', () => {
                    this.settings[setting.key] = toggle.checked;
                    this.saveSettings();
                    this.applySettings();
                });
                
                const label = document.createElement('label');
                label.htmlFor = setting.id;
                label.textContent = setting.label;
                
                controlContainer.appendChild(toggle);
                controlContainer.appendChild(label);
                accessibilityMenu.appendChild(controlContainer);
            });
            
            // Add skip to content link
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-to-content';
            skipLink.textContent = 'Skip to main content';
            document.body.prepend(skipLink);
            
            // Make sure main content is properly marked
            const mainContent = document.querySelector('main') || document.querySelector('.main-content');
            if (mainContent && !mainContent.id) {
                mainContent.id = 'main-content';
            }
        }
    }
    
    applySettings() {
        document.body.classList.toggle('high-contrast', this.settings.highContrast);
        document.body.classList.toggle('large-text', this.settings.largeText);
        document.body.classList.toggle('reduced-motion', this.settings.reducedMotion);
        
        // Apply text-to-speech setting globally
        if (this.settings.textToSpeech) {
            localStorage.setItem('speechEnabled', 'true');
        } else {
            localStorage.setItem('speechEnabled', 'false');
        }
        
        // Apply voice control setting
        if (this.settings.voiceControl) {
            // Enable voice control if supported
            this.enableVoiceControl();
        }
    }
    
    enableVoiceControl() {
        // Check if already initialized
        if (this.voiceControlEnabled) return;
        
        // Check browser support
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            console.warn('Voice control not supported in this browser');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        // Voice commands for navigation
        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            console.log('Voice command:', transcript);
            
            // Handle navigation commands
            if (transcript.includes('go to home') || transcript.includes('home page')) {
                window.location.href = '/index.html';
            } else if (transcript.includes('go to services') || transcript.includes('services page')) {
                window.location.href = '/services.html';
            } else if (transcript.includes('go to contact') || transcript.includes('contact page')) {
                window.location.href = '/contact.html';
            } else if (transcript.includes('go to gallery') || transcript.includes('gallery page')) {
                window.location.href = '/gallery.html';
            } else if (transcript.includes('open chat') || transcript.includes('chat assistant')) {
                const chatToggle = document.querySelector('.chat-toggle');
                if (chatToggle) chatToggle.click();
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            // Restart on error
            setTimeout(() => {
                recognition.start();
            }, 5000);
        };
        
        // Start voice recognition
        recognition.start();
        this.voiceControlEnabled = true;
        
        // Add voice control indicator
        const indicator = document.createElement('div');
        indicator.className = 'voice-control-indicator';
        indicator.innerHTML = '<i class="fas fa-microphone"></i><span>Voice Control Active</span>';
        document.body.appendChild(indicator);
    }
}

// Initialize the accessibility manager
window.accessibilityManager = new AccessibilityManager();