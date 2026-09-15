const twilioService = {
    client: null,

    init: function(accountSid, authToken) {
        // Import Twilio Client library
        const script = document.createElement('script');
        script.src = 'https://sdk.twilio.com/js/client/v1.14/twilio.min.js';
        document.head.appendChild(script);

        script.onload = () => {
            this.client = new Twilio.Device();
            this.setupDevice(accountSid, authToken);
        };
    },

    setupDevice: function(accountSid, authToken) {
        // Setup Twilio Device with your credentials
        this.client.setup(accountSid, {
            debug: true,
            warnings: true
        });

        // Event listeners
        this.client.on('ready', this.handleDeviceReady);
        this.client.on('error', this.handleDeviceError);
        this.client.on('incoming', this.handleIncomingCall);
    },

    handleDeviceReady: function() {
        console.log('Twilio device is ready for calls');
    },

    handleDeviceError: function(error) {
        console.error('Twilio device error:', error);
    },

    handleIncomingCall: function(connection) {
        // Integrate with NailAide telephony
        NailAideTelephony.handleIncomingCall(connection);
    }
};
