/**
 * NailAide Fix Script
 * This script provides additional functions to fix the NailAide widget
 * when it's not displaying correctly
 */
(function() {
    console.log('NailAide Fix Script loaded');
    
    window.NailAideFix = {
        fixWidget: function() {
            console.log('Running NailAide widget fixes...');
            
            // 1. Ensure the container exists and is visible
            this.ensureContainer();
            
            // 2. Try to fix the regular widget
            if (typeof NailAide !== 'undefined') {
                this.fixNailAide();
            } else {
                console.error('NailAide not defined, cannot fix');
            }
            
            // 3. If widget still not visible, use emergency approach
            setTimeout(() => {
                const chatButton = document.querySelector('.nailaide-chat-button, #emergency-chat-button');
                if (!chatButton || 
                    chatButton.style.display === 'none' || 
                    chatButton.style.visibility === 'hidden' || 
                    chatButton.style.opacity === '0') {
                    console.log('Chat button still not visible, using emergency approach');
                    this.createEmergencyButton();
                }
            }, 1000);
        },
        
        ensureContainer: function() {
            let container = document.getElementById('nailaide-root');
            if (!container) {
                console.log('Creating nailaide-root container');
                container = document.createElement('div');
                container.id = 'nailaide-root';
                document.body.appendChild(container);
            }
            
            // Apply critical styles
            Object.assign(container.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                width: '350px',
                height: '500px',
                zIndex: '999999',
                pointerEvents: 'auto',
                background: 'transparent'
            });
            
            return container;
        },
        
        fixNailAide: function() {
            try {
                const container = document.getElementById('nailaide-root');
                
                // Clear container to start fresh
                container.innerHTML = '';
                
                // Create a new widget instance
                const widget = NailAide.createWidget({
                    container: container,
                    theme: {
                        primaryColor: '#9333ea',
                        secondaryColor: '#f3f4f6',
                        textColor: '#1f2937',
                        buttonTextColor: '#ffffff'
                    },
                    welcomeMessage: 'Hello! How can I help you today?',
                    bookingUrl: 'https://delanesnaturalnailcare.booksy.com/',
                    debug: true
                });
                
                // Explicitly mount the widget
                widget.mount();
                
                // Force button visibility
                setTimeout(() => {
                    const chatButton = container.querySelector('.nailaide-chat-button');
                    if (chatButton) {
                        console.log('Forcing chat button visibility');
                        Object.assign(chatButton.style, {
                            display: 'flex',
                            visibility: 'visible',
                            opacity: '1',
                            backgroundColor: '#9333ea',
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px'
                        });
                    }
                }, 500);
                
                console.log('NailAide widget fixed');
                return true;
            } catch (error) {
                console.error('Error fixing NailAide:', error);
                return false;
            }
        },
        
        createEmergencyButton: function() {
            const container = this.ensureContainer();
            
            // Create a standalone button
            const emergencyButton = document.createElement('div');
            emergencyButton.id = 'emergency-fix-button';
            emergencyButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4