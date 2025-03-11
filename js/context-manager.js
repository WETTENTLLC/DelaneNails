class ContextManager {
    constructor() {
        this.currentContext = {
            topic: null,
            lastIntent: null,
            conversationHistory: [],
            userPreferences: {},
            currentPage: window.location.pathname
        };
    }

    updateContext(intent, messageText, response) {
        this.currentContext.lastIntent = intent;
        this.currentContext.conversationHistory.push({
            user: messageText,
            assistant: response,
            timestamp: new Date().toISOString()
        });

        // Limit history length to prevent memory issues
        if (this.currentContext.conversationHistory.length > 10) {
            this.currentContext.conversationHistory.shift();
        }
        
        // Update current page if it changed
        this.currentContext.currentPage = window.location.pathname;
        
        return this.currentContext;
    }

    detectTopic(messageText) {
        // Simple topic detection based on keywords
        const topicKeywords = {
            'appointment': 'booking',
            'schedule': 'booking',
            'book': 'booking',
            'service': 'services',
            'treatment': 'services',
            'price': 'pricing',
            'cost': 'pricing',
            'hour': 'business_hours',
            'open': 'business_hours',
            'contact': 'contact',
            'location': 'contact'
        };

        for (const [keyword, topic] of Object.entries(topicKeywords)) {
            if (messageText.toLowerCase().includes(keyword)) {
                this.currentContext.topic = topic;
                return topic;
            }
        }
        
        return this.currentContext.topic; // Return existing topic if no new one is detected
    }

    getContext() {
        return this.currentContext;
    }

    reset() {
        this.currentContext = {
            topic: null,
            lastIntent: null,
            conversationHistory: [],
            userPreferences: {},
            currentPage: window.location.pathname
        };
    }
}

// Export the context manager
window.ContextManager = ContextManager;
