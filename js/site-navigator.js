/**
 * Site Navigator - Provides guided tours and navigation assistance
 */
const SiteNavigator = {
    tourActive: false,
    currentPage: '',
    tourPoints: {},
    voiceEnabled: false,
    
    init: function(config = {}) {
        console.log('Initializing Site Navigator...');
        this.voiceEnabled = config.voiceEnabled !== undefined ? config.voiceEnabled : true;
        
        // Detect current page
        this.detectCurrentPage();
        
        // Initialize tour data for all pages
        this.initTourPoints();
        
        // Add tour toggle button to NailAide if it exists
        this.addTourToggleToNailAide();
        
        // Listen for page changes (if using SPA architecture)
        this.listenForPageChanges();
        
        console.log(`Site Navigator initialized on page: ${this.currentPage}`);
        return this;
    },
    
    detectCurrentPage: function() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop().split('.')[0];
        this.currentPage = pageName || 'index';
        console.log(`Current page detected as: ${this.currentPage}`);
    },
    
    initTourPoints: function() {
        // Define tour points for each page
        this.tourPoints = {
            'index': [
                {
                    element: '.hero-section',
                    title: 'Welcome Section',
                    description: 'This is the introduction to Delane\'s Natural Nail Care, highlighting our commitment to quality.',
                    position: 'bottom'
                },
                {
                    element: '#pivot',
                    title: '2025 Vision',
                    description: 'Learn about our exciting plans to expand into a full Medi Spa experience by 2025.',
                    position: 'top'
                },
                {
                    element: '#testimonials',
                    title: 'Client Experiences',
                    description: 'Read what our satisfied clients have to say about their experiences with us.',
                    position: 'left'
                },
                {
                    element: '#our-team',
                    title: 'Our Team',
                    description: 'Meet the skilled professionals who make your nail care experience exceptional.',
                    position: 'top'
                }
            ],
            'services': [
                {
                    element: '.services-intro',
                    title: 'Our Services',
                    description: 'Discover our range of professional nail care and wellness services.',
                    position: 'bottom'
                },
                {
                    element: '#nail-services',
                    title: 'Nail Care',
                    description: 'Explore our signature nail treatments, from basic care to luxury experiences.',
                    position: 'right'
                },
                {
                    element: '#medi-spa-services',
                    title: 'Medi Spa Treatments',
                    description: 'Our advanced wellness treatments combine health and beauty for a complete experience.',
                    position: 'left'
                }
            ],
            'about': [
                {
                    element: '.about-intro',
                    title: 'About Us',
                    description: 'Learn the story behind Delane\'s Natural Nail Care and our commitment to excellence.',
                    position: 'bottom'
                },
                {
                    element: '.mission-statement',
                    title: 'Our Mission',
                    description: 'Discover our core values and what drives us to provide exceptional service.',
                    position: 'right'
                }
            ],
            'shop': [
                {
                    element: '.shop-intro',
                    title: 'Our Shop',
                    description: 'Browse our curated selection of high-quality nail care and wellness products.',
                    position: 'bottom'
                },
                {
                    element: '#truth-freedom',
                    title: 'Truth & Freedom Polish Line',
                    description: 'Our exclusive nail polish line that celebrates women and supports our nonprofit initiatives.',
                    position: 'top'
                }
            ]
        };
    },
    
    addTourToggleToNailAide: function() {
        // Check if NailAide exists and is initialized
        if (typeof NailAide !== 'undefined' && NailAide.config) {
            // Add method to NailAide to start/stop tour
            NailAide.startPageTour = () => {
                this.startTour();
            };
            
            NailAide.stopPageTour = () => {
                this.stopTour();
            };
            
            // Add knowledge of tour commands to NailAide processing
            const originalProcessMessage = NailAide.processMessage;
            NailAide.processMessage = function(message) {
                const lowerMessage = message.toLowerCase();
                
                // Check for tour-related keywords
                if (lowerMessage.includes('tour') || 
                    lowerMessage.includes('guide me') || 
                    lowerMessage.includes('show me around') ||
                    lowerMessage.includes('explain this page')) {
                    
                    this.addMessage("I'd be happy to give you a tour of this page! Starting the guided tour now.", 'assistant');
                    SiteNavigator.startTour();
                    return;
                }
                
                // Check for stop tour keywords
                if (this.tourActive && 
                    (lowerMessage.includes('stop tour') || 
                     lowerMessage.includes('end tour') || 
                     lowerMessage.includes('cancel tour'))) {
                    
                    this.addMessage("I've ended the tour. Is there anything else you'd like to know?", 'assistant');
                    SiteNavigator.stopTour();
                    return;
                }
                
                // Otherwise, process as normal
                originalProcessMessage.call(this, message);
            };
            
            console.log('Tour toggle feature added to NailAide');
        } else {
            console.warn('NailAide not found or not initialized, cannot add tour toggle');
        }
    },
    
    listenForPageChanges: function() {
        // For single page applications - listen for route changes
        window.addEventListener('popstate', () => {
            this.detectCurrentPage();
            if (this.tourActive) {
                this.stopTour();
                this.startTour(); // Restart tour for new page
            }
        });
    },
    
    startTour: function() {
        if (this.tourActive) return;
        
        console.log(`Starting tour for ${this.currentPage} page`);
        this.tourActive = true;
        
        // Create a tour indicator
        const tourIndicator = document.createElement('div');
        tourIndicator.className = 'tour-mode-active';
        tourIndicator.id = 'tour-indicator';
        tourIndicator.innerHTML = 'Tour Mode Active <button id="end-tour-btn">✕</button>';
        document.body.appendChild(tourIndicator);
        
        document.getElementById('end-tour-btn').addEventListener('click', () => {
            this.stopTour();
        });
        
        // Get tour points for current page
        const points = this.tourPoints[this.currentPage] || [];
        
        if (points.length === 0) {
            this.announceNoTourPoints();
            return;
        }
        
        // Start the tour
        this.showTourPoint(0, points);
    },
    
    showTourPoint: function(index, points) {
        if (index >= points.length || !this.tourActive) {
            this.endTour();
            return;
        }
        
        const point = points[index];
        const element = document.querySelector(point.element);
        
        if (!element) {
            console.warn(`Tour point element not found: ${point.element}`);
            this.showTourPoint(index + 1, points);
            return;
        }
        
        // Highlight the element
        const originalOutline = element.style.outline;
        const originalPosition = element.style.position;
        const originalZIndex = element.style.zIndex;
        
        element.style.outline = '3px solid #9333ea';
        element.style.position = 'relative';
        element.style.zIndex = '1000';
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tour-tooltip';
        tooltip.innerHTML = `
            <h3>${point.title}</h3>
            <p>${point.description}</p>
            <div class="tour-controls">
                ${index > 0 ? '<button class="tour-prev">← Previous</button>' : ''}
                <span>${index + 1} of ${points.length}</span>
                ${index < points.length - 1 ? '<button class="tour-next">Next →</button>' : '<button class="tour-end">Finish Tour</button>'}
            </div>
        `;
        
        // Position tooltip relative to element
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '10001';
        tooltip.style.backgroundColor = 'white';
        tooltip.style.padding = '15px';
        tooltip.style.borderRadius = '8px';
        tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        tooltip.style.maxWidth = '300px';
        
        // Position based on specified position
        switch (point.position) {
            case 'top':
                tooltip.style.bottom = `${window.innerHeight - rect.top + 10}px`;
                tooltip.style.left = `${rect.left + rect.width / 2 - 150}px`;
                break;
            case 'right':
                tooltip.style.top = `${rect.top + rect.height / 2 - 50}px`;
                tooltip.style.left = `${rect.right + 10}px`;
                break;
            case 'bottom':
                tooltip.style.top = `${rect.bottom + 10}px`;
                tooltip.style.left = `${rect.left + rect.width / 2 - 150}px`;
                break;
            case 'left':
                tooltip.style.top = `${rect.top + rect.height / 2 - 50}px`;
                tooltip.style.right = `${window.innerWidth - rect.left + 10}px`;
                break;
        }
        
        document.body.appendChild(tooltip);
        
        // Speak the description if voice is enabled
        if (this.voiceEnabled && typeof VoiceAssistant !== 'undefined') {
            VoiceAssistant.speak(point.description);
        }
        
        // Add event listeners
        if (index > 0) {
            tooltip.querySelector('.tour-prev').addEventListener('click', () => {
                element.style.outline = originalOutline;
                element.style.position = originalPosition;
                element.style.zIndex = originalZIndex;
                tooltip.remove();
                this.showTourPoint(index - 1, points);
            });
        }
        
        if (index < points.length - 1) {
            tooltip.querySelector('.tour-next').addEventListener('click', () => {
                element.style.outline = originalOutline;
                element.style.position = originalPosition;
                element.style.zIndex = originalZIndex;
                tooltip.remove();
                this.showTourPoint(index + 1, points);
            });
        } else {
            tooltip.querySelector('.tour-end').addEventListener('click', () => {
                element.style.outline = originalOutline;
                element.style.position = originalPosition;
                element.style.zIndex = originalZIndex;
                tooltip.remove();
                this.endTour();
            });
        }
    },
    
    stopTour: function() {
        this.tourActive = false;
        
        // Remove tour indicator
        const indicator = document.getElementById('tour-indicator');
        if (indicator) indicator.remove();
        
        // Remove any tooltips
        const tooltips = document.querySelectorAll('.tour-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
        
        // Remove element highlights
        document.querySelectorAll('[style*="outline: 3px solid #9333ea"]').forEach(element => {
            element.style.outline = '';
            element.style.position = '';
            element.style.zIndex = '';
        });
        
        console.log('Tour stopped');
    },
    
    endTour: function() {
        this.stopTour();
        
        // Announcement that tour is complete
        if (typeof NailAide !== 'undefined') {
            NailAide.addMessage("Tour complete! If you'd like to know more about anything specific, just ask.", 'assistant');
        }
        
        if (this.voiceEnabled && typeof VoiceAssistant !== 'undefined') {
            VoiceAssistant.speak("Tour complete! If you'd like to know more about anything specific, just ask.");
        }
    },
    
    announceNoTourPoints: function() {
        if (typeof NailAide !== 'undefined') {
            NailAide.addMessage(`I don't have specific tour points for this page yet, but I'm happy to answer any questions you have about Delane's Natural Nail Care.`, 'assistant');
        }
        
        if (this.voiceEnabled && typeof VoiceAssistant !== 'undefined') {
            VoiceAssistant.speak(`I don't have specific tour points for this page yet, but I'm happy to answer any questions you have about Delane's Natural Nail Care.`);
        }
        
        this.stopTour();
    }
};

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        SiteNavigator.init();
    }, 2000); // Wait for other scripts to load
});
