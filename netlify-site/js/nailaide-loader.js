/**
 * NailAide Component Loader
 * Handles loading of all required components in the correct order
 */

const NailAideLoader = (function() {
    // Configuration
    const config = {
        debug: true,
        basePath: '/js/',
        modules: {
            // Core components (required)
            core: [
                { name: 'nailaide-config', path: 'nailaide-config.js', required: true },
                { name: 'nailaide-standalone', path: 'nailaide-standalone.js', required: true }
            ],
            // Booking & availability integration
            availability: [
                { name: 'booksy-integration', path: 'booksy-integration.js', required: false },
                { name: 'nailaide-availability', path: 'nailaide-availability.js', required: false }
            ],
            // Debug tools
            debug: [
                { name: 'debug-nailaide', path: 'debug-nailaide.js', required: false },
                { name: 'nailaide-integration-check', path: 'nailaide-integration-check.js', required: false }
            ]
        },
        // Script loading timeout in milliseconds
        timeout: 5000
    };
    
    // Track loaded modules
    const loadedModules = {};
    
    // Logging function
    function log(message, type = 'info') {
        if (config.debug) {
            const styles = {
                info: 'color: #0288d1; font-weight: bold',
                error: 'color: #d32f2f; font-weight: bold',
                success: 'color: #388e3c; font-weight: bold',
                warning: 'color: #f57c00; font-weight: bold'
            };
            
            console.log(`%c[NailAide Loader ${type.toUpperCase()}] ${message}`, styles[type] || styles.info);
        }
    }
    
    // Load a single script
    function loadScript(script) {
        return new Promise((resolve, reject) => {
            // Don't load if already loaded
            if (loadedModules[script.name]) {
                log(`Module ${script.name} already loaded, skipping`, 'info');
                resolve(script.name);
                return;
            }
            
            log(`Loading module: ${script.name}`, 'info');
            
            const scriptElement = document.createElement('script');
            scriptElement.src = config.basePath + script.path;
            
            // Add timeout
            const timeoutId = setTimeout(() => {
                reject(new Error(`Loading ${script.name} timed out after ${config.timeout}ms`));
            }, config.timeout);
            
            // Success handler
            scriptElement.onload = () => {
                clearTimeout(timeoutId);
                loadedModules[script.name] = true;
                log(`Module loaded: ${script.name}`, 'success');
                resolve(script.name);
            };
            
            // Error handler
            scriptElement.onerror = () => {
                clearTimeout(timeoutId);
                const error = new Error(`Failed to load ${script.name}`);
                
                if (script.required) {
                    log(`Required module failed to load: ${script.name}`, 'error');
                    reject(error);
                } else {
                    log(`Optional module failed to load: ${script.name}`, 'warning');
                    resolve(null); // Don't fail on optional modules
                }
            };
            
            document.body.appendChild(scriptElement);
        });
    }
    
    // Load a group of scripts in parallel
    function loadModuleGroup(groupName) {
        const modules = config.modules[groupName] || [];
        
        if (modules.length === 0) {
            log(`No modules found in group: ${groupName}`, 'warning');
            return Promise.resolve([]);
        }
        
        log(`Loading module group: ${groupName}`, 'info');
        
        const loadPromises = modules.map(script => loadScript(script));
        return Promise.all(loadPromises)
            .then(results => {
                log(`Module group loaded: ${groupName}`, 'success');
                return results.filter(Boolean);
            });
    }
    
    // Load all components in the correct order
    function loadAllComponents() {
        log('Starting component loading sequence', 'info');
        
        // First load core scripts
        return loadModuleGroup('core')
            .then(() => {
                // Then load availability modules
                return loadModuleGroup('availability');
            })
            .then(() => {
                // Finally load debug tools
                return loadModuleGroup('debug');
            })
            .then(() => {
                log('All components loaded successfully', 'success');
                
                // Initialize connections if integration check exists
                if (window.NailAideIntegrationCheck) {
                    window.NailAideIntegrationCheck.initializeConnections();
                    window.NailAideIntegrationCheck.runChecks();
                }
                
                return loadedModules;
            })
            .catch(error => {
                log(`Error loading components: ${error.message}`, 'error');
                console.error(error);
                throw error;
            });
    }
    
    // Public API
    return {
        loadAllComponents,
        loadModuleGroup,
        getLoadedModules: () => ({ ...loadedModules }),
        setBasePath: (path) => {
            config.basePath = path.endsWith('/') ? path : path + '/';
            log(`Base path set to: ${config.basePath}`, 'info');
        },
        setDebug: (debug) => {
            config.debug = !!debug;
        }
    };
})();

// Auto-initialize when script is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create root element if needed
    if (!document.getElementById('nailaide-root')) {
        const root = document.createElement('div');
        root.id = 'nailaide-root';
        document.body.appendChild(root);
    }
    
    // Load all components
    NailAideLoader.loadAllComponents()
        .catch(error => {
            console.error('Failed to initialize NailAide:', error);
            // Show visible error for users
            const errorMessage = document.createElement('div');
            errorMessage.style.position = 'fixed';
            errorMessage.style.bottom = '20px';
            errorMessage.style.right = '20px';
            errorMessage.style.background = '#f44336';
            errorMessage.style.color = 'white';
            errorMessage.style.padding = '10px 15px';
            errorMessage.style.borderRadius = '4px';
            errorMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            errorMessage.style.zIndex = '999999';
            errorMessage.textContent = 'Failed to load chat assistant. Please refresh the page.';
            document.body.appendChild(errorMessage);
        });
});
