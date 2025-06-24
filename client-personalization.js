const clientPreferences = {
    services: [],
    appointments: [],
    favorites: {},  // Object instead of array to prevent syntax errors
    settings: {
        notifications: true,
        theme: 'light'
    }
};

// Initialize client services
const initializeClient = () => {
    return clientPreferences;
};

// Fix for the personalization data
let personalizationData = {
    preferences: ["nail art", "manicure", "pedicure"]
};

// Export for module usage
export { clientPreferences, initializeClient };
