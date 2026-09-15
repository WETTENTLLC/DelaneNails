/**
 * NailAide Cleanup Script
 * Ensures clean loading of the widget by removing any previous instances
 */

(function() {
    console.log('Running NailAide cleanup...');
    
    // Function to clean up widget
    function cleanupWidget() {
        // Remove any existing chat windows or dialogs
        const existingDialogs = document.querySelectorAll('.nailaide-dialog, .nailaide-chat-window');
        existingDialogs.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        // Clear any event listeners by cloning and replacing buttons
        const chatButtons = document.querySelectorAll('.nailaide-chat-button, #emergency-chat-button');
        chatButtons.forEach(button => {
            if (button && button.parentNode) {
                const clone = button.cloneNode(true);
                button.parentNode.replaceChild(clone, button);
            }
        });
        
        // Reset any global variables that might conflict
        if (window.nailAideInit) window.nailAideInit = null;
        if (window.nailAideConfig) window.nailAideConfig = null;
        
        // Remove any lingering event listeners
        window.removeEventListener('nailaide-ready', window.nailAideReadyHandler);
        
        console.log('NailAide cleanup complete');
    }
    
    // Export cleanup function for reuse
    window.nailAideCleanup = cleanupWidget;
    
    // Run cleanup
    cleanupWidget();
})();
