// Fixed version of client-personalization.js
const clientPreferences = {
    services: [],
    appointments: [],
    favorites: {},  // Changed to object instead of array
    settings: {
        notifications: true,
        theme: 'light'
    }
};

// Initialize client services
const initializeClient = () => {
    return clientPreferences;
};

let personalizationData = {
    preferences: ["nail art", "manicure", "pedicure"]
};

export { clientPreferences, initializeClient };
