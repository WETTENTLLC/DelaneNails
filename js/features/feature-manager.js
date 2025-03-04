const FeatureManager = {
    init: async function() {
        // Initialize all features
        await Promise.all([
            VisualPreview.loadGalleryData(),
            VoiceInteraction.initialize(),
            ARPreview.initialize(),
            ClientPersonalization.init(),
            WebsiteContent.initialize()
        ]);
        
        this.setupFeatureBar();
        console.log('All features initialized');
    },

    setupFeatureBar() {
        const featureBar = document.createElement('div');
        featureBar.className = 'feature-bar';
        featureBar.innerHTML = `
            <div class="feature-icons">
                <button class="voice-btn" title="Voice Control">🎤</button>
                <button class="ar-btn" title="AR Preview">🖼️</button>
                <button class="gallery-btn" title="Service Gallery">👁️</button>
                <button class="lang-btn" title="Change Language">🌍</button>
            </div>
        `;

        // Add feature handlers
        featureBar.querySelector('.voice-btn').onclick = () => VoiceInteraction.startListening();
        featureBar.querySelector('.ar-btn').onclick = () => ARPreview.showPreview();
        featureBar.querySelector('.gallery-btn').onclick = () => VisualPreview.showGallery();
        featureBar.querySelector('.lang-btn').onclick = () => this.toggleLanguage();

        return featureBar;
    },

    toggleLanguage() {
        const languages = ['en', 'es', 'vi'];
        const currentLang = localStorage.getItem('preferred_language') || 'en';
        const nextLang = languages[(languages.indexOf(currentLang) + 1) % languages.length];
        localStorage.setItem('preferred_language', nextLang);
        VoiceInteraction.setLanguage(nextLang);
    }
};
