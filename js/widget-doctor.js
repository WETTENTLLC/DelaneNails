/**
 * NailAide Widget Doctor
 * Helps diagnose and fix issues with the NailAide widget
 */

(function() {
    window.widgetDoctor = {
        diagnose: function() {
            console.log('Running widget diagnostics...');
            
            // Check if root element exists
            const root = document.getElementById('nailaide-root');
            if (!root) {
                console.error('[Widget Doctor] Root element missing');
                this.fix('createRoot');
                return false;
            }
            
            // Check CSS properties
            const rootStyles = window.getComputedStyle(root);
            if (rootStyles.position !== 'fixed' || 
                parseInt(rootStyles.zIndex) < 9999 ||
                rootStyles.pointerEvents === 'none') {
                console.error('[Widget Doctor] Root element has incorrect styles');
                this.fix('fixStyles');
                return false;
            }
            
            // All checks passed
            console.log('[Widget Doctor] Widget container looks healthy');
            return true;
        },
        
        fix: function(issue) {
            console.log(`[Widget Doctor] Attempting to fix: ${issue}`);
            
            switch(issue) {
                case 'createRoot':
                    const newRoot = document.createElement('div');
                    newRoot.id = 'nailaide-root';
                    document.body.appendChild(newRoot);
                    console.log('[Widget Doctor] Created new root element');
                    break;
                    
                case 'fixStyles':
                    const root = document.getElementById('nailaide-root');
                    if (root) {
                        root.style.position = 'fixed';
                        root.style.bottom = '20px';
                        root.style.right = '20px';
                        root.style.zIndex = '999999';
                        root.style.width = '350px';
                        root.style.height = '500px';
                        root.style.background = 'transparent';
                        root.style.pointerEvents = 'auto';
                        console.log('[Widget Doctor] Fixed root element styles');
                    }
                    break;
                    
                default:
                    console.warn('[Widget Doctor] Unknown issue: ' + issue);
            }
        }
    };
    
    // Run diagnostics when script loads
    setTimeout(() => {
        window.widgetDoctor.diagnose();
    }, 1000);
})();
