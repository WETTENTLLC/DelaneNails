const VoiceInteraction = {
    languages: {
        en: { voice: 'en-US', recognition: 'en-US' },
        es: { voice: 'es-ES', recognition: 'es-ES' },
        vi: { voice: 'vi-VN', recognition: 'vi-VN' }
    },

    async initialize(language = 'en') {
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.lang = this.languages[language].recognition;
        this.synthesis = window.speechSynthesis;
    },

    startListening() {
        this.recognition.start();
        return new Promise((resolve) => {
            this.recognition.onresult = (event) => {
                resolve(event.results[event.results.length - 1][0].transcript);
            };
        });
    }
};
