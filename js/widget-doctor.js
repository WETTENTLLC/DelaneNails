/**
 * Widget Doctor - Enhanced diagnostic tool for NailAide widget
 * Helps identify and fix issues with the widget
 */
const WidgetDoctor = {
    diagnose: function() {
        console.log('🔍 Widget Doctor running diagnostics...');
        
        // Check for required DOM elements
        this.checkDOM();
        
        // Check for required scripts
        this.checkScripts();
        
        // Check styles
        this.checkStyles();
        
        // Apply force fixes for common issues
        this.applyForceFixesForCommonIssues();
        
        console.log('✅ Widget Doctor diagnostics complete');
        
        // Enable visual debugging mode
        this.enableDebugMode();
    },
    
    checkDOM: function() {
        console.log('Checking DOM elements...');
        
        const container = document.getElementById('nailaide-root');
        if (!container) {
            console.error('❌ Widget container #nailaide-root not found!');
            this.fixMissingContainer();
        } else {
            console.log('✅ Widget container found');
            
            // Check if container is visible
            const style = window.getComputedStyle(container);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                console.error('❌ Widget container is hidden!');
                container.style.display = 'block';
                container.style.visibility = 'visible';
                container.style.opacity = '1';
            }
            
            // Check if container has dimensions
            if (container.offsetWidth === 0 || container.offsetHeight === 0) {
                console.error('❌ Widget container has no dimensions!');
                container.style.width = '350px';
                container.style.height = '500px';
            }
            
            // Check z-index
            if (parseInt(style.zIndex) < 9000) {
                console.error('❌ Widget container has insufficient z-index!');
                container.style.zIndex = '10000';
            }
        }
    },
    
    checkScripts: function() {
        console.log('Checking required scripts...');
        
        // Check WebsiteContent dependency
        if (typeof WebsiteContent === 'undefined') {
            console.error('❌ WebsiteContent not found! Injecting website-parser.js');
            this.injectScript('js/content/website-parser.js');
        } else {
            console.log('✅ WebsiteContent found');
        }
        
        // Check BooksyService dependency
        if (typeof BooksyService === 'undefined') {
            console.error('❌ BooksyService not found! Injecting booksy-service.js');
            this.injectScript('js/integrations/booksy-service.js');
        } else {
            console.log('✅ BooksyService found');
        }
        
        // Check NailAide dependency
        if (typeof NailAide === 'undefined') {
            console.error('❌ NailAide not found! Injecting nailaide.js');
            this.injectScript('js/nailaide.js');
        } else {
            console.log('✅ NailAide found');
        }
    },
    
    checkStyles: function() {
        console.log('Checking styles...');
        
        const container = document.getElementById('nailaide-root');
        if (container) {
            // Ensure widget is visible and has a background
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.width = '350px';
            container.style.height = '500px';
            container.style.zIndex = '10000';
            container.style.pointerEvents = 'auto';
            
            // Check if nailaide.css is loaded
            let nailaideStylesheet = false;
            for (let i = 0; i < document.styleSheets.length; i++) {
                if (document.styleSheets[i].href && document.styleSheets[i].href.includes('nailaide.css')) {
                    nailaideStylesheet = true;
                    break;
                }
            }
            
            if (!nailaideStylesheet) {
                console.error('❌ NailAide stylesheet not found! Injecting CSS');
                this.injectCSS('css/nailaide.css');
            } else {
                console.log('✅ NailAide stylesheet found');
            }
        }
    },
    
    applyForceFixesForCommonIssues: function() {
        console.log('Applying force fixes for common issues...');
        
        const container = document.getElementById('nailaide-root');
        if (!container) return;
        
        // Force widget container to highest z-index
        container.style.zIndex = '2147483647'; // Maximum z-index value
        
        // Make sure pointer events work
        container.style.pointerEvents = 'auto';
        
        // Remove any possible overlay elements blocking access
        const overlays = document.querySelectorAll('div[style*="position:fixed"], div[style*="position: fixed"]');
        overlays.forEach(overlay => {
            if (overlay.id !== 'nailaide-root' && overlay.style.zIndex > 9000) {
                console.log('Found potential blocking overlay:', overlay);
                overlay.style.pointerEvents = 'none';
            }
        });
        
        // Reset any potential interfering CSS
        container.style.removeProperty('transform');
        container.style.removeProperty('transition');
        container.style.removeProperty('animation');
        
        // Force parent containers to have pointer-events auto
        let parent = container.parentElement;
        while (parent && parent !== document.body) {
            parent.style.pointerEvents = 'auto';
            parent = parent.parentElement;
        }
    },
    
    fixMissingContainer: function() {
        console.log('Creating missing container...');
        
        // Check if container already exists
        if (document.getElementById('nailaide-root')) {
            return;
        }
        
        const container = document.createElement('div');
        container.id = 'nailaide-root';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.width = '350px';
        container.style.height = '500px';
        container.style.zIndex = '2147483647'; // Maximum z-index
        container.style.pointerEvents = 'auto';
        
        document.body.appendChild(container);
        console.log('✅ Created missing container');
    },
    
    injectScript: function(src) {
        console.log(`Injecting script: ${src}`);
        
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onerror = () => console.error(`Failed to load: ${src}`);
        document.head.appendChild(script);
    },
    
    injectCSS: function(href) {
        console.log(`Injecting CSS: ${href}`);
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = href;
        link.onerror = () => console.error(`Failed to load CSS: ${href}`);
        document.head.appendChild(link);
    },
    
    enableDebugMode: function() {
        console.log('Enabling visual debug mode...');
        document.body.classList.add('debug-highlight');
        
        // Add debug button to toggle container visibility
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Toggle NailAide Debug';
        debugButton.style.position = 'fixed';
        debugButton.style.top = '10px';
        debugButton.style.right = '10px';
        debugButton.style.zIndex = '2147483646';
        debugButton.style.padding = '10px';
        debugButton.style.backgroundColor = '#ff0000';
        debugButton.style.color = '#ffffff';
        debugButton.style.border = 'none';
        debugButton.style.borderRadius = '5px';
        debugButton.style.fontWeight = 'bold';
        debugButton.style.cursor = 'pointer';
        
        debugButton.addEventListener('click', () => {
            document.body.classList.toggle('debug-highlight');
            const container = document.getElementById('nailaide-root');
            if (container) {
                container.style.border = container.style.border ? '' : '5px solid red';
            }
        });
        
        document.body.appendChild(debugButton);
    },
    
    runWidget: function() {
        console.log('Attempting to launch widget...');
        
        try {
            const container = document.getElementById('nailaide-root');
            if (!container) {
                throw new Error('Widget container not found, cannot launch widget');
            }
            
            if (typeof NailAide === 'undefined') {
                throw new Error('NailAide not defined, cannot launch widget');
            }
            
            // Initialize widget with defaults if not already done
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
            
            widget.mount();
            console.log('✅ Widget launched successfully');
            
            // Force display of chat button after a short delay
            setTimeout(() => {
                const chatButton = container.querySelector('.nailaide-chat-button');
                if (chatButton) {
                    chatButton.style.display = 'flex';
                    chatButton.style.visibility = 'visible';
                    chatButton.style.opacity = '1';
                    console.log('✅ Forced chat button visibility');
                }
            }, 1000);
        } catch (error) {
            console.error('❌ Failed to launch widget:', error);
        }
    },
    
    forceShowWidget: function() {
        const container = document.getElementById('nailaide-root');
        if (!container) {
            this.fixMissingContainer();
            setTimeout(() => this.runWidget(), 100);
            return;
        }
        
        // Clear container and start fresh
        container.innerHTML = '';
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        
        // Add basic fallback button if all else fails
        if (!document.querySelector('.nailaide-chat-button')) {
            const fallbackButton = document.createElement('div');
            fallbackButton.className = 'nailaide-fallback-button';
            fallbackButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90001C9.87812 3.30494 11.1801 2.99659 12.5 3.00001H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            fallbackButton.style.position = 'fixed';
            fallbackButton.style.bottom = '20px';
            fallbackButton.style.right = '20px';
            fallbackButton.style.width = '60px';
            fallbackButton.style.height = '60px';
            fallbackButton.style.borderRadius = '50%';
            fallbackButton.style.backgroundColor = '#9333ea';
            fallbackButton.style.display = 'flex';
            fallbackButton.style.justifyContent = 'center';
            fallbackButton.style.alignItems = 'center';
            fallbackButton.style.cursor = 'pointer';
            fallbackButton.style.zIndex = '2147483647';
            fallbackButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            
            fallbackButton.addEventListener('click', () => {
                alert('Chat is temporarily unavailable. Please try refreshing the page.');
            });
            
            container.appendChild(fallbackButton);
            console.log('✅ Added fallback chat button');
        }
    }
};

// Auto-run diagnostics when the page is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Running Widget Doctor...');
    setTimeout(() => {
        WidgetDoctor.diagnose();
        // Try to run the widget if it's not already visible
        if (!document.querySelector('#nailaide-root .nailaide-chat-button')) {
            WidgetDoctor.runWidget();
            
            // Second fallback - force show widget after a delay
            setTimeout(() => {
                if (!document.querySelector('#nailaide-root .nailaide-chat-button')) {
                    console.error('Widget still not visible after initialization. Forcing visibility...');
                    WidgetDoctor.forceShowWidget();
                }
            }, 3000);
        }
    }, 1000); // Wait a bit to ensure other scripts have loaded
});

// Add another check after window is fully loaded
window.addEventListener('load', function() {
    setTimeout(() => {
        if (!document.querySelector('#nailaide-root .nailaide-chat-button')) {
            console.error('Widget not visible after window load. Applying emergency fix...');
            WidgetDoctor.forceShowWidget();
        }
    }, 2000);
});

// Make available globally
window.WidgetDoctor = WidgetDoctor;
