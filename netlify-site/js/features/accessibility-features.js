/**
 * Accessibility Features Module for NailAide Assistant
 * Provides accessibility enhancements for users with disabilities
 */
const AccessibilityFeatures = (function() {
    // Active accessibility features
    const activeFeatures = {
        highContrast: false,
        largeText: false,
        screenReader: false
    };
    
    // CSS class names for different features
    const featureClasses = {
        highContrast: 'nailaide-high-contrast',
        largeText: 'nailaide-large-text',
        screenReader: 'nailaide-screen-reader-mode'
    };
    
    // Callbacks
    let callbacks = {
        onToggleHighContrast: null,
        onToggleTextSize: null,
        onToggleScreenReader: null
    };
    
    // Initialize module
    function init(options = {}) {
        // Merge callbacks with defaults
        callbacks = { ...callbacks, ...options };
        
        // Load user preferences from local storage
        loadPreferences();
        
        // Apply any initially active features
        applyActiveFeatures();
        
        return true;
    }
    
    // Load saved accessibility preferences
    function loadPreferences() {
        try {
            const savedPrefs = localStorage.getItem('nailaide-accessibility');
            if (savedPrefs) {
                const prefs = JSON.parse(savedPrefs);
                
                // Only apply valid features
                for (const key in activeFeatures) {
                    if (typeof prefs[key] === 'boolean') {
                        activeFeatures[key] = prefs[key];
                    }
                }
            }
        } catch (err) {
            console.error('Error loading accessibility preferences:', err);
        }
    }
    
    // Save current accessibility preferences
    function savePreferences() {
        try {
            localStorage.setItem('nailaide-accessibility', JSON.stringify(activeFeatures));
        } catch (err) {
            console.error('Error saving accessibility preferences:', err);
        }
    }
    
    // Apply all active accessibility features
    function applyActiveFeatures() {
        for (const feature in activeFeatures) {
            if (activeFeatures[feature]) {
                applyFeature(feature, true);
            }
        }
    }
    
    // Toggle an accessibility feature
    function toggleFeature(feature) {
        if (!(feature in activeFeatures)) {
            console.warn(`Unknown accessibility feature: ${feature}`);
            return false;
        }
        
        const newState = !activeFeatures[feature];
        activeFeatures[feature] = newState;
        
        applyFeature(feature, newState);
        savePreferences();
        
        return newState;
    }
    
    // Apply a specific feature
    function applyFeature(feature, state) {
        const rootElement = document.documentElement;
        const className = featureClasses[feature];
        
        if (state) {
            rootElement.classList.add(className);
        } else {
            rootElement.classList.remove(className);
        }
        
        // Call appropriate callback
        if (feature === 'highContrast' && callbacks.onToggleHighContrast) {
            callbacks.onToggleHighContrast(state);
        } else if (feature === 'largeText' && callbacks.onToggleTextSize) {
            callbacks.onToggleTextSize(state);
        } else if (feature === 'screenReader' && callbacks.onToggleScreenReader) {
            callbacks.onToggleScreenReader(state);
        }
    }
    
    // Toggle high contrast mode
    function toggleHighContrast() {
        return toggleFeature('highContrast');
    }
    
    // Toggle large text mode
    function toggleLargeText() {
        return toggleFeature('largeText');
    }
    
    // Toggle screen reader compatibility mode
    function toggleScreenReader() {
        return toggleFeature('screenReader');
    }
    
    // Get status of all features
    function getFeatureStatus() {
        return { ...activeFeatures };
    }
    
    // Public API
    return {
        init,
        toggleHighContrast,
        toggleLargeText,
        toggleScreenReader,
        getFeatureStatus
    };
})();
