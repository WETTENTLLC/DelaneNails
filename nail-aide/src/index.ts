import NailAide from 'nailaide';

// Assuming NailAide has a method called 'init'
const config: NailAide.Config = {
    apiKey: '8048717a-c465-41dc-8fbe-53cad1fb1c48',
    businessName: 'Your Business Name',
    businessType: 'Your Business Type',
    primaryColor: '#ff0000',
    position: 'bottom-right',
    welcomeMessage: 'Welcome to our service!',
    bookingUrl: 'https://yourbookingurl.com',
    endpoint: 'https://api.delanenails.com/v1'
};

if (NailAide && typeof NailAide.init === 'function') {
    NailAide.init(config);
} else {
    console.error('NailAide.init is not a function or NailAide module is not loaded correctly.');
}
