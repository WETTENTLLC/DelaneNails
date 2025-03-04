/**
 * NailAide AI - Enhanced Natural Language Processing for NailAide
 * Provides more intelligent responses and context management for the chatbot
 */

const NailAideAI = {
    // Conversation context
    context: {
        topics: [],
        lastIntent: null,
        userPreferences: {},
        conversationHistory: [],
        entityMentions: {}
    },
    
    // Load dependencies
    init: function() {
        console.log('Initializing NailAide AI...');
        
        // Check for Knowledge Base
        if (typeof KnowledgeBase === 'undefined') {
            console.error('Knowledge Base not found, trying to load...');
            this.loadScript('js/knowledge-base.js');
        }
        
        return this;
    },
    
    loadScript: function(src) {
        const script = document.createElement('script');
        script.src = src;
        document.head.appendChild(script);
    },
    
    // Analyze user message and determine intent
    analyzeMessage: function(message) {
        const lowerMessage = message.toLowerCase();
        
        // Update conversation history
        this.updateConversationHistory('user', message);
        
        const analysis = {
            intent: this.detectIntent(lowerMessage),
            entities: this.extractEntities(lowerMessage),
            sentiment: this.analyzeSentiment(lowerMessage),
            questionType: this.detectQuestionType(lowerMessage)
        };
        
        // Update context with new information
        this.updateContext(analysis);
        
        return analysis;
    },
    
    // Detect primary intent from user message
    detectIntent: function(message) {
        // Check for booking intent
        if (message.includes('book') || 
            message.includes('appointment') || 
            message.includes('schedule') ||
            message.includes('reserve')) {
            return 'booking';
        }
        
        // Check for hours intent
        if (message.includes('hour') || 
            message.includes('open') || 
            message.includes('close') ||
            message.includes('when') && message.includes('open')) {
            return 'hours';
        }
        
        // Check for service inquiry
        if (message.includes('service') || 
            message.includes('offer') ||
            message.includes('provide') ||
            message.includes('manicure') ||
            message.includes('pedicure') ||
            message.includes('nail')) {
            return 'services';
        }
        
        // Check for price inquiry
        if (message.includes('price') || 
            message.includes('cost') ||
            message.includes('how much')) {
            return 'pricing';
        }
        
        // Check for product inquiry
        if (message.includes('product') || 
            message.includes('polish') ||
            message.includes('purchase') ||
            message.includes('buy') ||
            message.includes('sell')) {
            return 'products';
        }
        
        // Check for contact information
        if (message.includes('contact') || 
            message.includes('phone') ||
            message.includes('email') ||
            message.includes('call') ||
            message.includes('reach')) {
            return 'contact';
        }
        
        // Check for location/directions
        if (message.includes('location') || 
            message.includes('address') ||
            message.includes('where') ||
            message.includes('direction')) {
            return 'location';
        }
        
        // Check for greeting
        if (message.includes('hello') || 
            message.includes('hi') ||
            message.includes('hey') ||
            message.match(/^(good|morning|afternoon|evening)/) ||
            message.length < 10) {
            return 'greeting';
        }
        
        // Check for help request
        if (message.includes('help') || 
            message.includes('assist') ||
            message.includes('support') ||
            message.includes('guidance')) {
            return 'help';
        }
        
        // Check for tour request
        if (message.includes('tour') || 
            message.includes('show me around') ||
            message.includes('guide me')) {
            return 'tour';
        }
        
        // Check for about/founder
        if (message.includes('about') || 
            message.includes('founder') ||
            message.includes('who') && message.includes('delane') ||
            message.includes('history')) {
            return 'about';
        }
        
        // Check for thanks
        if (message.includes('thank') || 
            message.includes('appreciate') ||
            message.includes('great') && message.includes('help')) {
            return 'thanks';
        }
        
        // Check for goodbye
        if (message.includes('bye') || 
            message.includes('goodbye') ||
            message.includes('see you') ||
            message.includes('farewell')) {
            return 'goodbye';
        }
        
        // Default to general inquiry
        return 'general_inquiry';
    },
    
    // Extract entities (specific items mentioned)
    extractEntities: function(message) {
        const entities = {
            services: [],
            products: [],
            dates: [],
            times: [],
            people: []
        };
        
        // Extract service names
        if (typeof KnowledgeBase !== 'undefined') {
            // Check for nail services
            KnowledgeBase.services.nailCare.forEach(service => {
                const serviceName = service.name.toLowerCase();
                if (message.includes(serviceName.toLowerCase())) {
                    entities.services.push(service.name);
                }
            });
            
            // Check for medi spa services
            KnowledgeBase.services.mediSpa.forEach(service => {
                const serviceName = service.name.toLowerCase();
                if (message.includes(serviceName.toLowerCase())) {
                    entities.services.push(service.name);
                }
            });
            
            // Extract product names
            KnowledgeBase.products.truthFreedomPolish.forEach(product => {
                if (message.includes(product.name.toLowerCase()) || 
                    message.includes(product.color.toLowerCase())) {
                    entities.products.push(product.name);
                }
            });
            
            KnowledgeBase.products.nailCareProducts.forEach(product => {
                if (message.includes(product.name.toLowerCase())) {
                    entities.products.push(product.name);
                }
            });
        }
        
        // Extract dates using simple patterns
        const datePatterns = [
            /(?:mon|tues|wednes|thurs|fri|satur|sun)day/g,
            /(?:january|february|march|april|may|june|july|august|september|october|november|december)/g,
            /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g,
            /\b(?:next|this) (?:week|month|weekend)\b/g,
            /\btomorrow\b/g,
            /\btoday\b/g
        ];
        
        datePatterns.forEach(pattern => {
            const matches = message.match(pattern);
            if (matches) {
                entities.dates = entities.dates.concat(matches);
            }
        });
        
        // Extract times using simple patterns
        const timePatterns = [
            /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi,
            /\b(?:morning|afternoon|evening|night)\b/g,
            /\b(?:early|late)\b/g
        ];
        
        timePatterns.forEach(pattern => {
            const matches = message.match(pattern);
            if (matches) {
                entities.times = entities.times.concat(matches);
            }
        });
        
        // Extract people references
        if (message.includes('delane')) {
            entities.people.push('Delane');
        }
        
        // Remove duplicates
        for (const key in entities) {
            entities[key] = [...new Set(entities[key])];
        }
        
        return entities;
    },
    
    // Detect type of question asked (who, what, where, when, why, how)
    detectQuestionType: function(message) {
        if (message.includes('?')) {
            if (message.includes('what') || message.match(/\bwhat\b/)) return 'what';
            if (message.includes('where') || message.match(/\bwhere\b/)) return 'where';
            if (message.includes('when') || message.match(/\bwhen\b/)) return 'when';
            if (message.includes('why') || message.match(/\bwhy\b/)) return 'why';
            if (message.includes('how') || message.match(/\bhow\b/)) return 'how';
            if (message.includes('who') || message.match(/\bwho\b/)) return 'who';
            if (message.includes('can') || message.includes('could') || message.match(/\bcan i\b/)) return 'yes_no';
            return 'general_question';
        }
        return null;
    },
    
    // Simple sentiment analysis (positive/negative/neutral)
    analyzeSentiment: function(message) {
        const positiveWords = ['good', 'great', 'excellent', 'awesome', 'amazing', 'love', 'like', 'happy', 'pleased', 'thank'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'dislike', 'hate', 'unhappy', 'disappointed', 'poor'];
        
        let positiveScore = 0;
        let negativeScore = 0;
        
        // Count positive and negative word occurrences
        positiveWords.forEach(word => {
            if (message.includes(word)) positiveScore++;
        });
        
        negativeWords.forEach(word => {
            if (message.includes(word)) negativeScore++;
        });
        
        if (positiveScore > negativeScore) return 'positive';
        if (negativeScore > positiveScore) return 'negative';
        return 'neutral';
    },
    
    // Update the conversation context
    updateContext: function(analysis) {
        // Track the intent
        this.context.lastIntent = analysis.intent;
        
        // Track topics mentioned
        if (!this.context.topics.includes(analysis.intent)) {
            this.context.topics.push(analysis.intent);
        }
        
        // Track entities mentioned
        for (const entityType in analysis.entities) {
            analysis.entities[entityType].forEach(entity => {
                if (!this.context.entityMentions[entityType]) {
                    this.context.entityMentions[entityType] = [];
                }
                
                if (!this.context.entityMentions[entityType].includes(entity)) {
                    this.context.entityMentions[entityType].push(entity);
                }
            });
        }
    },
    
    // Add entry to conversation history
    updateConversationHistory: function(role, message) {
        this.context.conversationHistory.push({
            role: role,
            message: message,
            timestamp: new Date().toISOString()
        });
        
        // Limit history length
        if (this.context.conversationHistory.length > 10) {
            this.context.conversationHistory.shift();
        }
    },
    
    // Generate response based on analysis
    generateResponse: function(analysis) {
        let response = '';
        
        // Update conversation history with this analysis
        this.context.lastAnalysis = analysis;
        
        switch (analysis.intent) {
            case 'greeting':
                response = this.generateGreeting();
                break;
            case 'booking':
                response = this.generateBookingResponse(analysis);
                break;
            case 'hours':
                response = this.generateHoursResponse();
                break;
            case 'services':
                response = this.generateServicesResponse(analysis);
                break;
            case 'pricing':
                response = this.generatePricingResponse(analysis);
                break;
            case 'products':
                response = this.generateProductsResponse(analysis);
                break;
            case 'contact':
                response = this.generateContactResponse();
                break;
            case 'location':
                response = this.generateLocationResponse();
                break;
            case 'about':
                response = this.generateAboutResponse();
                break;
            case 'help':
                response = this.generateHelpResponse();
                break;
            case 'tour':
                response = "I'd be happy to give you a tour of our website! I'll highlight key features and information to help you navigate better.";
                break;
            case 'thanks':
                response = "You're welcome! It's my pleasure to assist you. If you have any other questions, feel free to ask.";
                break;
            case 'goodbye':
                response = "Thank you for chatting with me today! Have a wonderful day, and we hope to see you at Delane's Natural Nail Care & Medi Spa soon.";
                break;
            default:
                response = this.generateGeneralResponse();
        }
        
        // Update conversation history with response
        this.updateConversationHistory('assistant', response);
        
        return response;
    },
    
    // Generate greeting based on time of day
    generateGreeting: function() {
        const hour = new Date().getHours();
        let timeGreeting = "Hello";
        
        if (hour < 12) {
            timeGreeting = "Good morning";
        } else if (hour < 18) {
            timeGreeting = "Good afternoon";
        } else {
            timeGreeting = "Good evening";
        }
        
        return `${timeGreeting}! Welcome to Delane's Natural Nail Care & Medi Spa. How can I assist you today?`;
    },
    
    // Generate response about booking
    generateBookingResponse: function(analysis) {
        let response = "You can book an appointment through our online scheduling system. Would you like me to open the booking page for you?";
        
        // Check if specific services were mentioned
        if (analysis.entities.services.length > 0) {
            const service = analysis.entities.services[0];
            response = `I'd be happy to help you book a ${service}. You can make an appointment through our online scheduling system. Would you like me to open the booking page for you?`;
        }
        
        // Check if specific dates were mentioned
        if (analysis.entities.dates.length > 0) {
            const date = analysis.entities.dates[0];
            response += ` You mentioned ${date}, which I can help you select once you're on the booking page.`;
        }
        
        return response;
    },
    
    // Generate response about business hours
    generateHoursResponse: function() {
        if (typeof KnowledgeBase !== 'undefined') {
            let response = "Our business hours are:\n";
            
            for (const [day, hours] of Object.entries(KnowledgeBase.hours)) {
                response += `${day}: ${hours}\n`;
            }
            
            return response;
        }
        
        return "We're open Monday through Saturday with varying hours. Please check our website or contact us for the most current business hours.";
    },
    
    // Generate response about services
    generateServicesResponse: function(analysis) {
        if (typeof KnowledgeBase === 'undefined') {
            return "We offer a variety of nail care services including manicures, pedicures, gel applications, and more. We're also expanding into medi-spa services in 2025.";
        }
        
        // If specific services were mentioned
        if (analysis.entities.services.length > 0) {
            const serviceName = analysis.entities.services[0];
            const service = KnowledgeBase.getServiceByName(serviceName);
            
            if (service) {
                return `Our ${service.name} is ${service.price} and takes approximately ${service.duration}. ${service.description} Would you like to book this service?`;
            }
        }
        
        // General services response
        let response = "Here are some of our popular services:\n";
        
        const highlightedServices = KnowledgeBase.services.nailCare.slice(0, 4);
        highlightedServices.forEach(service => {
            response += `${service.name}: ${service.price} (${service.duration})\n`;
        });
        
        response += "\nWould you like more information about any specific service?";
        
        return response;
    },
    
    // Generate response about pricing
    generatePricingResponse: function(analysis) {
        if (typeof KnowledgeBase === 'undefined') {
            return "Our pricing varies by service. Manicures start at $35, pedicures at $50, and we have a variety of specialty services available.";
        }
        
        // If specific services were mentioned
        if (analysis.entities.services.length > 0) {
            const serviceName = analysis.entities.services[0];
            const service = KnowledgeBase.getServiceByName(serviceName);
            
            if (service) {
                return `Our ${service.name} is priced at ${service.price} for a ${service.duration} session.`;
            }
        }
        
        // If specific products were mentioned
        if (analysis.entities.products.length > 0) {
            const productName = analysis.entities.products[0];
            const product = KnowledgeBase.getProductInfo(productName);
            
            if (product) {
                return `Our ${product.name} is priced at ${product.price}.`;
            }
        }
        
        // General pricing response
        return "Here's a sample of our pricing:\n" +
               "- Natural Nail Manicure: $35 (45 min)\n" +
               "- Gel Manicure: $45 (60 min)\n" +
               "- Spa Pedicure: $50 (50 min)\n" +
               "- Deluxe Pedicure: $65 (75 min)\n" +
               "\nWould you like information about other services or products?";
    },
    
    // Generate response about products
    generateProductsResponse: function(analysis) {
        if (typeof KnowledgeBase === 'undefined') {
            return "We offer a variety of nail care products including our exclusive Truth & Freedom polish line, cuticle oils, strengtheners, and hand creams.";
        }
        
        // If specific products were mentioned
        if (analysis.entities.products.length > 0) {
            const productName = analysis.entities.products[0];
            const product = KnowledgeBase.getProductInfo(productName);
            
            if (product) {
                return `${product.name} is ${product.price}. ${product.description}`;
            }
        }
        
        // Check if they specifically asked about the Truth & Freedom line
        if (analysis.entities.products.length === 0 && 
            (analysis.message && (analysis.message.includes('truth') || analysis.message.includes('freedom')))) {
            return "Our Truth & Freedom polish line features colors named after inspirational women. Each purchase supports our nonprofit, DNNC Steps to Success, which helps women through mentorship and career advancement. The polishes are $18 each and come in beautiful shades like Eleanor (bold red), Maya (deep purple), and more.";
        }
        
        // General products response
        return "We offer several product lines:\n\n" +
               "TRUTH & FREEDOM POLISHES:\n" +
               "Our signature