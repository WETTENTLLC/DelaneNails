class IntentDetector {
    constructor() {
        // Define intent patterns with keywords and phrases
        this.intentPatterns = {
            greeting: {
                keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
                threshold: 1
            },
            booking: {
                keywords: ['book', 'appointment', 'schedule', 'reservation', 'booking', 'reserve'],
                threshold: 1
            },
            service_inquiry: {
                keywords: ['service', 'treatment', 'offer', 'manicure', 'pedicure', 'facial', 'nail', 'spa'],
                threshold: 1
            },
            pricing: {
                keywords: ['price', 'cost', 'fee', 'how much', 'expensive', 'cheap'],
                threshold: 1
            },
            hours: {
                keywords: ['hour', 'time', 'open', 'close', 'schedule', 'when'],
                threshold: 1
            },
            location: {
                keywords: ['location', 'address', 'where', 'place', 'building', 'direction'],
                threshold: 1
            },
            find_information: {
                keywords: ['info', 'about', 'tell me about', 'what is', 'details', 'information'],
                threshold: 1
            },
            farewell: {
                keywords: ['bye', 'goodbye', 'see you', 'talk later', 'thanks'],
                threshold: 1
            },
            help: {
                keywords: ['help', 'assist', 'support', 'guidance', 'confused'],
                threshold: 1
            },
            navigation: {
                keywords: ['go to', 'navigate', 'show me', 'take me to', 'page'],
                threshold: 1
            },
            // New intent patterns
            product_inquiry: {
                keywords: ['product', 'polish', 'buy', 'purchase', 'sell', 'sale', 'online', 'shop', 'truth', 'freedom'],
                threshold: 1
            },
            dnnc_inquiry: {
                keywords: ['dnnc', 'steps to success', 'nonprofit', 'charity', 'vision 2025', 'initiative'],
                threshold: 1
            },
            advanced_pedicure: {
                keywords: ['advanced pedicure', 'therapeutic', 'diabetic', 'foot health', 'athlete', 'special pedicure'],
                threshold: 1
            }
        };
    }

    async detectIntent(message) {
        if (!message) return 'unknown';
        
        const lowerMessage = message.toLowerCase();
        let highestScore = 0;
        let detectedIntent = 'unknown';
        
        // Check for question patterns
        const isQuestion = this.isQuestionPattern(lowerMessage);
        
        // Score each intent based on keyword matches
        for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
            let score = 0;
            
            for (const keyword of pattern.keywords) {
                if (lowerMessage.includes(keyword)) {
                    score++;
                }
            }
            
            // Apply question boost for certain intents
            if (isQuestion && ['service_inquiry', 'pricing', 'hours', 'location', 'find_information', 'product_inquiry', 'dnnc_inquiry'].includes(intent)) {
                score += 0.5;
            }
            
            // Check if score meets threshold and is higher than previous scores
            if (score >= pattern.threshold && score > highestScore) {
                highestScore = score;
                detectedIntent = intent;
            }
        }
        
        // Check for specific topics that might be missed by general keywords
        if (this.containsProductKeywords(lowerMessage)) {
            detectedIntent = 'product_inquiry';
        } else if (this.containsDnncKeywords(lowerMessage)) {
            detectedIntent = 'dnnc_inquiry';
        } else if (this.containsAdvancedPedicureKeywords(lowerMessage)) {
            detectedIntent = 'advanced_pedicure';
        } else if (this.hasBookingIntent(lowerMessage) && (detectedIntent === 'unknown' || highestScore < 2)) {
            detectedIntent = 'booking';
        }
        
        // For messages that are clearly questions but didn't match specific intents
        if (isQuestion && detectedIntent === 'unknown') {
            return 'find_information';
        }
        
        return detectedIntent;
    }
    
    isQuestionPattern(message) {
        return message.includes('?') || 
               /^(what|where|when|how|who|why|is|are|can|could|do|does|did)/i.test(message);
    }
    
    hasBookingIntent(message) {
        const bookingPhrases = [
            'want to book', 
            'need an appointment',
            'schedule a',
            'get my nails done',
            'make a reservation',
            'book me',
            'available time',
            'available slot',
            'appointment time',
            'when can i come in'
        ];
        
        return bookingPhrases.some(phrase => message.includes(phrase));
    }
    
    containsProductKeywords(message) {
        const productKeywords = [
            'products', 'sell', 'purchase', 'buy', 'online shop', 
            'truth freedom', 'polish', 'strengthener', 'cuticle oil',
            'hand cream', 'nail care', 'at home', 'retail', 'new products'
        ];
        
        return productKeywords.some(keyword => message.includes(keyword));
    }
    
    containsDnncKeywords(message) {
        const dnncKeywords = [
            'dnnc', 'steps to success', 'vision 2025', 'nonprofit',
            'women empowerment', 'mentorship', 'initiative', 'charity'
        ];
        
        return dnncKeywords.some(keyword => message.includes(keyword));
    }
    
    containsAdvancedPedicureKeywords(message) {
        const advancedPedicureKeywords = [
            'advanced pedicure', 'therapeutic', 'diabetic foot', 
            'foot health', 'athlete pedicure', 'special pedicure'
        ];
        
        return advancedPedicureKeywords.some(keyword => message.includes(keyword));
    }
}

// Export the intent detector
window.IntentDetector = IntentDetector;
