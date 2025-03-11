/**
 * NailAide Integration Check
 * Verifies that all components are properly loaded and working together
 */

const NailAideIntegrationCheck = (function() {
    const moduleDependencies = {
        'BooksyIntegration': {
            required: true,
            methods: ['getAvailability', 'checkWalkInPossibility', 'getAvailableSlots']
        },
        'NailAideAvailability': {
            required: true,
            methods: ['detectAvailabilityQuestion', 'generateAvailabilityResponse']
        },
        'NailAideConfig': {
            required: false,
            properties: ['bookingUrl', 'availability']
        }
    };
    
    function runChecks() {
        console.log('Running NailAide integration checks...');
        const results = {
            modulesPresent: checkModulesExist(),
            methodsAvailable: checkMethodsExist(),
            configValid: checkConfig()
        };
        
        const allPassed = Object.values(results).every(result => result.status === 'pass');
        
        console.log(`Integration check ${allPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
        return {
            passed: allPassed,
            results: results
        };
    }
    
    function checkModulesExist() {
        const missingModules = [];
        
        for (const moduleName in moduleDependencies) {
            if (!window[moduleName]) {
                if (moduleDependencies[moduleName].required) {
                    missingModules.push(moduleName);
                } else {
                    console.warn(`Optional module ${moduleName} not found`);
                }
            }
        }
        
        if (missingModules.length > 0) {
            console.error(`Missing required modules: ${missingModules.join(', ')}`);
            return {
                status: 'fail',
                missing: missingModules
            };
        }
        
        return {
            status: 'pass'
        };
    }
    
    function checkMethodsExist() {
        const missingMethods = {};
        
        for (const moduleName in moduleDependencies) {
            if (!window[moduleName]) continue;
            
            const module = window[moduleName];
            const expectedMethods = moduleDependencies[moduleName].methods || [];
            
            for (const method of expectedMethods) {
                if (typeof module[method] !== 'function') {
                    if (!missingMethods[moduleName]) {
                        missingMethods[moduleName] = [];
                    }
                    missingMethods[moduleName].push(method);
                }
            }
        }
        
        if (Object.keys(missingMethods).length > 0) {
            console.error('Missing required methods:', missingMethods);
            return {
                status: 'fail',
                missing: missingMethods
            };
        }
        
        return {
            status: 'pass'
        };
    }
    
    function checkConfig() {
        // Check if we have a valid configuration
        if (!window.NAILAIDE_CONFIG) {
            console.warn('NAILAIDE_CONFIG not found, will use default values');
            return {
                status: 'warn',
                message: 'Configuration not found'
            };
        }
        
        const config = window.NAILAIDE_CONFIG;
        
        // Check critical values
        if (!config.bookingUrl) {
            console.error('Missing booking URL in config');
            return {
                status: 'fail',
                message: 'Missing booking URL'
            };
        }
        
        return {
            status: 'pass'
        };
    }
    
    // Initialize connections between modules if needed
    function initializeConnections() {
        console.log('Initializing module connections...');
        
        // Make sure the config is available to BooksyIntegration if exists
        if (window.BooksyIntegration && window.NAILAIDE_CONFIG) {
            if (window.NAILAIDE_CONFIG.booksyBusinessId) {
                console.log('Setting Booksy business ID from config');
                BooksyIntegration.setBusinessId(window.NAILAIDE_CONFIG.booksyBusinessId);
            }
        }
        
        // Set booking URL for availability module if needed
        if (window.NailAideAvailability && window.NAILAIDE_CONFIG) {
            window.NailAideAvailability.setBookingUrl(window.NAILAIDE_CONFIG.bookingUrl);
        }
        
        console.log('Module connections initialized');
        return true;
    }
    
    // Public API
    return {
        runChecks,
        initializeConnections,
        // Allow force-loading modules if needed
        loadDependencies: function() {
            console.log('Attempting to load missing dependencies...');
            return new Promise((resolve, reject) => {
                const scripts = [
                    { name: 'booksy-integration', path: 'js/booksy-integration.js' },
                    { name: 'nailaide-availability', path: 'js/nailaide-availability.js' }
                ];
                
                let loaded = 0;
                scripts.forEach(script => {
                    if (!window[script.name]) {
                        const scriptElem = document.createElement('script');
                        scriptElem.src = script.path;
                        scriptElem.onload = () => {
                            loaded++;
                            if (loaded === scripts.length) {
                                resolve(true);
                            }
                        };
                        scriptElem.onerror = () => {
                            reject(new Error(`Failed to load ${script.path}`));
                        };
                        document.body.appendChild(scriptElem);
                    } else {
                        loaded++;
                        if (loaded === scripts.length) {
                            resolve(true);
                        }
                    }
                });
            });
        }
    };
})();

// Make the module available globally
window.NailAideIntegrationCheck = NailAideIntegrationCheck;
