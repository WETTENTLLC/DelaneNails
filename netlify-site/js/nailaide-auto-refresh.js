/**
 * NailAide Auto-Refresh Manager
 * Keeps availability data fresh by refreshing at regular intervals
 */

const NailAideAutoRefresh = (function() {
    // Configuration
    const config = {
        // Default refresh interval in minutes
        defaultRefreshInterval: 5,
        
        // Current interval in milliseconds
        refreshInterval: 5 * 60 * 1000,
        
        // Whether auto-refresh is enabled
        enabled: true,
        
        // Debug mode
        debug: false
    };
    
    // Track refresh timer
    let refreshTimer = null;
    
    // Last refresh timestamp
    let lastRefreshTime = 0;
    
    // Logging helper
    function log(message) {
        if (config.debug) {
            console.log(`[NailAide Refresh] ${message}`);
        }
    }
    
    // Initialize from configuration
    function initFromConfig() {
        if (window.NAILAIDE_CONFIG && window.NAILAIDE_CONFIG.availability) {
            const availConfig = window.NAILAIDE_CONFIG.availability;
            
            if (typeof availConfig.refreshInterval === 'number') {
                setRefreshInterval(availConfig.refreshInterval);
            }
            
            if (typeof availConfig.autoRefreshEnabled === 'boolean') {
                config.enabled = availConfig.autoRefreshEnabled;
            }
        }
    }
    
    // Set refresh interval in minutes
    function setRefreshInterval(minutes) {
        if (typeof minutes !== 'number' || minutes < 1) {
            console.warn(`Invalid refresh interval: ${minutes}. Using default.`);
            minutes = config.defaultRefreshInterval;
        }
        
        config.refreshInterval = minutes * 60 * 1000;
        log(`Refresh interval set to ${minutes} minutes`);
        
        // Reset timer if already running
        if (refreshTimer) {
            stopRefresh();
            startRefresh();
        }
    }
    
    // Start auto-refresh timer
    function startRefresh() {
        if (!config.enabled) {
            log('Auto-refresh is disabled');
            return;
        }
        
        if (refreshTimer) {
            log('Refresh timer already running');
            return;
        }
        
        log(`Starting auto-refresh every ${config.refreshInterval / 60000} minutes`);
        
        // Do an initial refresh
        refreshNow();
        
        // Set up recurring refresh
        refreshTimer = setInterval(() => {
            refreshNow();
        }, config.refreshInterval);
    }
    
    // Stop auto-refresh timer
    function stopRefresh() {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
            log('Auto-refresh stopped');
        }
    }
    
    // Refresh availability data immediately
    function refreshNow() {
        log('Refreshing availability data...');
        lastRefreshTime = Date.now();
        
        // Check if Booksy integration is available
        if (!window.BooksyIntegration) {
            log('BooksyIntegration not available, cannot refresh');
            return Promise.reject(new Error('BooksyIntegration not available'));
        }
        
        return window.BooksyIntegration.refreshCache()
            .then(data => {
                log('Availability data refreshed successfully');
                return data;
            })
            .catch(error => {
                console.error('Failed to refresh availability data:', error);
                return null;
            });
    }
    
    // Get time since last refresh in seconds
    function getTimeSinceRefresh() {
        if (lastRefreshTime === 0) {
            return null; // Never refreshed
        }
        
        return Math.floor((Date.now() - lastRefreshTime) / 1000);
    }
    
    // Initialize
    function init() {
        log('Initializing auto-refresh manager');
        initFromConfig();
        
        // Start refresh timer after short delay to allow all components to load
        setTimeout(() => {
            startRefresh();
        }, 3000);
    }
    
    // Initialize when script loads if Booksy integration is available
    if (window.BooksyIntegration) {
        init();
    } else {
        // Wait for Booksy integration to load
        window.addEventListener('load', function() {
            if (window.BooksyIntegration) {
                init();
            } else {
                log('BooksyIntegration not available after page load');
            }
        });
    }
    
    // Public API
    return {
        startRefresh,
        stopRefresh,
        refreshNow,
        setRefreshInterval,
        getTimeSinceRefresh,
        isEnabled: () => config.enabled,
        enable: () => {
            config.enabled = true;
            if (!refreshTimer) startRefresh();
            log('Auto-refresh enabled');
        },
        disable: () => {
            config.enabled = false;
            stopRefresh();
            log('Auto-refresh disabled');
        },
        setDebug: (debug) => {
            config.debug = debug;
        },
        getStatus: () => ({
            enabled: config.enabled,
            interval: config.refreshInterval / 60000, // in minutes
            running: !!refreshTimer,
            lastRefresh: lastRefreshTime,
            timeSinceRefresh: getTimeSinceRefresh()
        })
    };
})();

// Make the module available globally
window.NailAideAutoRefresh = NailAideAutoRefresh;
