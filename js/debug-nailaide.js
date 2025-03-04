/**
 * NailAide Widget Debugger
 * This script helps troubleshoot widget loading issues
 */

const NailAideDebugger = {
    checkFiles: function() {
        const requiredFiles = [
            'js/nailaide.js',
            'js/nailaide-telephony.js',
            'js/content/website-parser.js',
            'js/integrations/booksy-service.js',
            'js/features/feature-manager.js'
        ];
        
        console.log('--- NailAide File Check ---');
        requiredFiles.forEach(file => {
            const script = document.querySelector(`script[src="${file}"]`);
            console.log(`${file}: ${script ? '✓ Found' : '✗ Missing'}`);
        });
    },
    
    checkContainer: function() {
        const container = document.getElementById('nailaide-root');
        console.log('--- NailAide Container Check ---');
        
        if (!container) {
            console.error('Container #nailaide-root not found!');
            return false;
        }
        
        console.log('Container found');
        
        // Check visibility
        const style = window.getComputedStyle(container);
        if (style.display === 'none') {
            console.warn('Container is hidden (display: none)');
        }
        
        if (style.visibility === 'hidden') {
            console.warn('Container is hidden (visibility: hidden)');
        }
        
        if (parseInt(style.height) === 0 || parseInt(style.width) === 0) {
            console.warn('Container has zero width or height');
        }
        
        console.log(`Container position: ${style.position}`);
        console.log(`Container dimensions: ${style.width} x ${style.height}`);
        console.log(`Container z-index: ${style.zIndex}`);
        
        return true;
    },
    
    checkGlobalObjects: function() {
        console.log('--- NailAide Global Objects Check ---');
        
        if (typeof NailAide === 'undefined') {
            console.error('NailAide global object is not defined!');
        } else {
            console.log('NailAide global object found');
            console.log('Available methods:', Object.keys(NailAide));
        }
        
        if (typeof WebsiteContent === 'undefined') {
            console.error('WebsiteContent global object is not defined!');
        } else {
            console.log('WebsiteContent global object found');
        }
        
        if (typeof BooksyService === 'undefined') {
            console.error('BooksyService global object is not defined!');
        } else {
            console.log('BooksyService global object found');
        }
    },
    
    init: function() {
        console.log('=== NailAide Debugger Started ===');
        this.checkFiles();
        this.checkContainer();
        this.checkGlobalObjects();
        console.log('=== NailAide Debugger Completed ===');
    }
};

// Run debugger after page load
window.addEventListener('load', function() {
    NailAideDebugger.init();
});

/**
 * NailAide Debug Tool
 * Simple tool to debug widget display issues
 */

// Create debug namespace
window.NailAideDebug = {
    isDebugMode: false,
    
    // Toggle debug mode
    toggleDebug: function() {
        this.isDebugMode = !this.isDebugMode;
        document.body.classList.toggle('debug-highlight', this.isDebugMode);
        
        const container = document.getElementById('nailaide-root');
        if (container) {
            if (this.isDebugMode) {
                container.dataset.originalBorder = container.style.border || '';
                container.style.border = '3px dashed red';
                this.showDebugInfo();
            } else {
                container.style.border = container.dataset.originalBorder || '';
                this.hideDebugInfo();
            }
        }
        
        console.log(`NailAide Debug Mode: ${this.isDebugMode ? 'ON' : 'OFF'}`);
    },
    
    // Show debug info overlay
    showDebugInfo: function() {
        const container = document.getElementById('nailaide-root');
        if (!container) return;
        
        let debugInfo = document.createElement('div');
        debugInfo.id = 'nailaide-debug-info';
        debugInfo.style.position = 'fixed';
        debugInfo.style.top = '10px';
        debugInfo.style.left = '10px';
        debugInfo.style.backgroundColor = 'rgba(0,0,0,0.8)';
        debugInfo.style.color = 'white';
        debugInfo.style.padding = '15px';
        debugInfo.style.borderRadius = '5px';
        debugInfo.style.zIndex = '2147483647';
        debugInfo.style.maxWidth = '400px';
        debugInfo.style.fontSize = '12px';
        debugInfo.style.fontFamily = 'monospace';
        
        // Get container computed style
        const style = window.getComputedStyle(container);
        
        // Add information
        debugInfo.innerHTML = `
            <h3>NailAide Widget Debug</h3>
            <ul>
                <li>Container exists: ✅</li>
                <li>Position: ${style.position}</li>
                <li>Z-Index: ${style.zIndex}</li>
                <li>Width: ${style.width}</li>
                <li>Height: ${style.height}</li>
                <li>Visibility: ${style.visibility}</li>
                <li>Display: ${style.display}</li>
                <li>Opacity: ${style.opacity}</li>
                <li>Pointer Events: ${style.pointerEvents}</li>
                <li>Bottom: ${style.bottom}</li>
                <li>Right: ${style.right}</li>
            </ul>
            <h4>Chat Button</h4>
            <div id="nailaide-debug-button-status">Checking...</div>
        `;
        
        document.body.appendChild(debugInfo);
        
        // Check chat button status after a moment
        setTimeout(() => {
            const buttonStatus = document.getElementById('nailaide-debug-button-status');
            if (!buttonStatus) return;
            
            const chatButton = document.querySelector('.nailaide-chat-button');
            if (chatButton) {
                const buttonStyle = window.getComputedStyle(chatButton);
                buttonStatus.innerHTML = `
                    <ul>
                        <li>Button exists: ✅</li>
                        <li>Display: ${buttonStyle.display}</li>
                        <li>Visibility: ${buttonStyle.visibility}</li>
                        <li>Opacity: ${buttonStyle.opacity}</li>
                        <li>Z-Index: ${buttonStyle.zIndex}</li>
                        <li>Width: ${buttonStyle.width}</li>
                        <li>Height: ${buttonStyle.height}</li>
                    </ul>
                `;
            } else {
                buttonStatus.innerHTML = '❌ Chat button not found in DOM!';
                buttonStatus.style.color = 'red';
            }
        }, 1000);
    },
    
    // Hide debug info overlay
    hideDebugInfo: function() {
        const debugInfo = document.getElementById('nailaide-debug-info');
        if (debugInfo) {
            debugInfo.remove();
        }
    },
    
    // Fix common issues
    applyQuickFixes: function() {
        console.log('Applying quick fixes...');
        
        const container = document.getElementById('nailaide-root');
        if (!container) {
            console.error('Container not found, cannot apply fixes');
            return false;
        }
        
        // Apply critical CSS fixes
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.width = '350px';
        container.style.height = '500px';
        container.style.zIndex = '2147483647';  // Max z-index
        container.style.pointerEvents = 'auto';
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        
        // Force widget initialization
        if (typeof NailAide !== 'undefined' && typeof WidgetDoctor !== 'undefined') {
            WidgetDoctor.runWidget();
            return true;
        }
        
        return false;
    },
    
    // Initialize debug tools
    init: function() {
        console.log('Initializing NailAide Debug Tools');
        
        // Add keyboard shortcut (Ctrl+Alt+D) for toggling debug mode
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'd') {
                this.toggleDebug();
            }
        });
        
        // Add a small indicator in corner
        const indicator = document.createElement('div');
        indicator.id = 'nailaide-debug-indicator';
        indicator.textContent = 'NAD';
        indicator.style.position = 'fixed';
        indicator.style.top = '5px';
        indicator.style.right = '5px';
        indicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
        indicator.style.color = 'white';
        indicator.style.padding = '3px 5px';
        indicator.style.fontSize = '10px';
        indicator.style.borderRadius = '3px';
        indicator.style.cursor = 'pointer';
        indicator.style.zIndex = '2147483646';
        
        indicator.addEventListener('click', () => this.toggleDebug());
        document.body.appendChild(indicator);
        
        console.log('Debug tools initialized. Press Ctrl+Alt+D or click NAD indicator to toggle debug mode');
    }
};

// Initialize debug tools after page load
window.addEventListener('load', function() {
    if (window.NailAideDebug) {
        window.NailAideDebug.init();
    }
});
