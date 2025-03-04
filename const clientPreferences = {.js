const clientPreferences = {
    services: [],
    appointments: [],
    favorites: {},  // Changed to object instead of array
    settings: {
        notifications: true,
        theme: 'light'
    }
}; // Make sure there's only one closing bracket here

// Initialize client services
const initializeClient = () => {
    return clientPreferences;
};

let someArray = [1, 2, 3]; // Example array
console.log(someArray[2]); // Corrected syntax

let personalizationData = {
    preferences: ["nail art", "manicure", "pedicure"]
};

export { clientPreferences, initializeClient };
