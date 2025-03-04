/**
 * Multilingual Support Module for NailAide Assistant
 * Provides translation and language switching capabilities
 */
const MultilingualSupport = (function() {
    // Default language is English
    let currentLanguage = 'en';
    
    // Supported languages
    const supportedLanguages = {
        'en': { name: 'English', code: 'en-US' },
        'es': { name: 'Español', code: 'es-ES' },
        'fr': { name: 'Français', code: 'fr-FR' },
        'zh': { name: '中文', code: 'zh-CN' }
    };
    
    // Translation cache to avoid redundant API calls
    const translationCache = {};
    
    // Callbacks
    let callbacks = {
        onLanguageChanged: null
    };
    
    // Configuration
    let config = {
        defaultLanguage: 'en',
        translationAPIKey: null,
        useCaching: true
    };
    
    /**
     * Initialize the multilingual support module
     */
    function init(options = {}) {
        // Merge options with defaults
        config = { ...config, ...options };
        callbacks = { ...callbacks, ...options };
        
        // Set initial language
        currentLanguage = config.defaultLanguage;
        
        // If we have a translation API key, validate it
        if (config.translationAPIKey) {
            validateAPIKey()
                .then(isValid => {
                    if (!isValid) {
                        console.warn('Invalid translation API key');
                    }
                })
                .catch(err => {
                    console.error('Error validating API key:', err);
                });
        }
        
        return true;
    }
    
    /**
     * Change the current language
     */
    function setLanguage(langCode) {
        if (!supportedLanguages[langCode]) {
            console.warn(`Unsupported language: ${langCode}`);
            return false;
        }
        
        const previousLanguage = currentLanguage;
        currentLanguage = langCode;
        
        // Update voice recognition language if available
        if (typeof VoiceInteraction !== 'undefined') {
            VoiceInteraction.setLanguage(supportedLanguages[langCode].code);
        }
        
        // Call the language changed callback
        if (callbacks.onLanguageChanged) {
            callbacks.onLanguageChanged(langCode, previousLanguage);
        }
        
        return true;
    }
    
    /**
     * Translate text to the specified language
     */
    async function translate(text, targetLang = null, sourceLang = null) {
        // If no target language specified, use current language
        targetLang = targetLang || currentLanguage;
        
        // If text is in the current language, no need to translate
        if (sourceLang === targetLang) return text;
        
        // Check cache first if enabled
        const cacheKey = `${sourceLang || 'auto'}-${targetLang}-${text}`;
        if (config.useCaching && translationCache[cacheKey]) {
            return translationCache[cacheKey];
        }
        
        try {
            // If we have a translation API key, use it
            if (config.translationAPIKey) {
                const translation = await callTranslationAPI(text, targetLang, sourceLang);
                
                // Cache the result if caching is enabled
                if (config.useCaching) {
                    translationCache[cacheKey] = translation;
                }
                
                return translation;
            } else {
                // Fallback to predefined translations if available
                return getLocalTranslation(text, targetLang) || text;
            }
        } catch (err) {
            console.error('Translation error:', err);
            return text; // Return original text on error
        }
    }
    
    /**
     * Call the translation API
     */
    async function callTranslationAPI(text, targetLang, sourceLang = null) {
        // Mock API call - replace with actual API integration
        return new Promise((resolve) => {
            // Simulate API delay
            setTimeout(() => {
                // Simple mock translations for demo purposes
                if (targetLang === 'es') {
                    if (text.toLowerCase().includes('hello')) resolve('Hola');
                    if (text.toLowerCase().includes('welcome')) resolve('Bienvenido');
                    if (text.toLowerCase().includes('book')) resolve('Reservar');
                    if (text.toLowerCase().includes('appointment')) resolve('Cita');
                } else if (targetLang === 'fr') {
                    if (text.toLowerCase().includes('hello')) resolve('Bonjour');
                    if (text.toLowerCase().includes('welcome')) resolve('Bienvenue');
                    if (text.toLowerCase().includes('book')) resolve('Réserver');
                    if (text.toLowerCase().includes('appointment')) resolve('Rendez-vous');
                } else if (targetLang === 'zh') {
                    if (text.toLowerCase().includes('hello')) resolve('你好');
                    if (text.toLowerCase().includes('welcome')) resolve('欢迎');
                    if (text.toLowerCase().includes('book')) resolve('预订');
                    if (text.toLowerCase().includes('appointment')) resolve('预约');
                }
                
                // Default: return original text
                resolve(text);
            }, 100);
        });
    }
    
    /**
     * Get a local translation from predefined translations
     */
    function getLocalTranslation(text, targetLang) {
        // Predefined translations for common phrases
        const translations = {
            'Hello! How can I help you today?': {
                'es': '¡Hola! ¿Cómo puedo ayudarte hoy?',
                'fr': 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
                'zh': '你好！我今天能为你做什么？'
            },
            'Book Appointment': {
                'es': 'Reservar Cita',
                'fr': 'Prendre Rendez-vous',
                'zh': '预约'
            },
            'Our Services': {
                'es': 'Nuestros Servicios',
                'fr': 'Nos Services',
                'zh': '我们的服务'
            }
        };
        
        return translations[text] && translations[text][targetLang];
    }
    
    /**
     * Validate the API key
     */
    async function validateAPIKey() {
        // Mock validation - replace with actual API validation
        return Promise.resolve(true);
    }
    
    /**
     * Get all supported languages
     */
    function getSupportedLanguages() {
        return Object.keys(supportedLanguages).map(code => ({
            code,
            ...supportedLanguages[code]
        }));
    }
    
    /**
     * Get the current language
     */
    function getCurrentLanguage() {
        return {
            code: currentLanguage,
            ...supportedLanguages[currentLanguage]
        };
    }
    
    return {
        init,
        setLanguage,
        translate,
        getSupportedLanguages,
        getCurrentLanguage
    };
})();
