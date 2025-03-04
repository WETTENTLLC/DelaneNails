/**
 * NailAide Salon AI - Specialized nail care and salon expertise
 * Enhances NailAide with industry-specific knowledge and features
 */

const NailAideSalonAI = {
    customerName: null,
    consultationInProgress: false,
    consultationStep: 0,
    consultationData: {},
    appointmentContext: {},
    
    init: function() {
        console.log('Initializing NailAide Salon AI Extension...');
        
        // Check for dependencies
        this.checkDependencies();
        
        // Initialize realtime data feed
        this.initRealtimeData();
        
        return this;
    },
    
    checkDependencies: function() {
        // Ensure KnowledgeBase is loaded
        if (typeof KnowledgeBase === 'undefined') {
            console.warn('KnowledgeBase not found, loading...');
            this.loadScript('js/knowledge-base.js');
        }
        
        // Ensure NailAideAI is loaded 
        if (typeof NailAideAI === 'undefined') {
            console.warn('NailAideAI not found, loading...');
            this.loadScript('js/nailaide-ai.js');
        }
    },
    
    loadScript: function(src) {
        const script = document.createElement('script');
        script.src = src;
        document.head.appendChild(script);
    },
    
    // Get active personality traits
    getPersonalityTraits: function() {
        return {
            friendly: true,
            professional: true,
            enthusiastic: true,
            knowledgeable: true,
            helpful: true
        };
    },
    
    // Process message with salon expertise
    processMessage: function(message, userData = {}) {
        // Extract customer name if provided
        this.extractCustomerInfo(message, userData);
        
        // Check if consultation is in progress
        if (this.consultationInProgress) {
            return this.continueConsultation(message);
        }
        
        // Analyze the message
        const analysis = this.analyzeMessageWithSalonContext(message);
        
        // Generate appropriate response based on intent
        return this.generateSalonResponse(analysis, message);
    },
    
    // Extract customer info from message or user data
    extractCustomerInfo: function(message, userData) {
        if (userData && userData.name) {
            this.customerName = userData.name;
            return;
        }
        
        // Try to extract name from message
        const namePatterns = [
            /my name is ([A-Za-z]+)/i,
            /I(?:'|')?m ([A-Za-z]+)/i,
            /([A-Za-z]+) here/i
        ];
        
        for (const pattern of namePatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                this.customerName = match[1];
                break;
            }
        }
    },
    
    // Analyze message with salon-specific context
    analyzeMessageWithSalonContext: function(message) {
        // If NailAideAI exists, use its analysis function
        if (typeof NailAideAI !== 'undefined') {
            const baseAnalysis = NailAideAI.analyzeMessage(message);
            
            // Enhance with salon-specific intents
            baseAnalysis.salonIntent = this.detectSalonIntent(message);
            
            return baseAnalysis;
        }
        
        // Fallback analysis if NailAideAI is not available
        return {
            intent: this.detectBasicIntent(message),
            salonIntent: this.detectSalonIntent(message),
            entities: this.extractSalonEntities(message),
            sentiment: this.detectBasicSentiment(message)
        };
    },
    
    // Detect salon-specific intents
    detectSalonIntent: function(message) {
        const lowerMessage = message.toLowerCase();
        
        // Nail consultation intent
        if (lowerMessage.includes('nail design') || 
            lowerMessage.includes('design consultation') ||
            lowerMessage.includes('nail art') ||
            lowerMessage.includes('nail style') ||
            lowerMessage.includes('recommend design') ||
            (lowerMessage.includes('recommend') && lowerMessage.includes('nail'))) {
            return 'nail_consultation';
        }
        
        // Virtual tour intent
        if (lowerMessage.includes('virtual tour') ||
            lowerMessage.includes('show me around') ||
            lowerMessage.includes('show me the salon') ||
            lowerMessage.includes('salon tour')) {
            return 'virtual_tour';
        }
        
        // Product recommendation intent
        if (lowerMessage.includes('recommend') && 
            (lowerMessage.includes('product') || lowerMessage.includes('polish'))) {
            return 'product_recommendation';
        }
        
        // Nail health question intent
        if (lowerMessage.includes('nail health') ||
            lowerMessage.includes('brittle') ||
            lowerMessage.includes('breaking') ||
            lowerMessage.includes('strong nails') ||
            lowerMessage.includes('healthy nails')) {
            return 'nail_health';
        }
        
        // Trend question intent
        if (lowerMessage.includes('trend') ||
            lowerMessage.includes('popular') ||
            lowerMessage.includes('in style') ||
            lowerMessage.includes('fashionable')) {
            return 'nail_trends';
        }
        
        return null;
    },
    
    // Basic intent detection (fallback)
    detectBasicIntent: function(message) {
        // Basic intent detection if NailAideAI is not available
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
            return 'booking';
        }
        
        if (lowerMessage.includes('service') || lowerMessage.includes('offer')) {
            return 'services';
        }
        
        // Additional basic intents
        // ... other intent checks ...
        
        return 'general_inquiry';
    },
    
    // Extract salon-specific entities
    extractSalonEntities: function(message) {
        const entities = {
            nailTypes: [],
            nailShapes: [],
            colors: [],
            designs: [],
            occasions: []
        };
        
        const lowerMessage = message.toLowerCase();
        
        // Extract nail types
        const nailTypes = ['acrylic', 'gel', 'dip powder', 'shellac', 'regular polish', 'natural'];
        nailTypes.forEach(type => {
            if (lowerMessage.includes(type.toLowerCase())) {
                entities.nailTypes.push(type);
            }
        });
        
        // Extract nail shapes
        const nailShapes = ['square', 'round', 'oval', 'almond', 'stiletto', 'coffin', 'ballerina'];
        nailShapes.forEach(shape => {
            if (lowerMessage.includes(shape.toLowerCase())) {
                entities.nailShapes.push(shape);
            }
        });
        
        // Extract colors
        const colors = ['red', 'pink', 'blue', 'green', 'purple', 'black', 'white', 'nude', 'french'];
        colors.forEach(color => {
            if (lowerMessage.includes(color.toLowerCase())) {
                entities.colors.push(color);
            }
        });
        
        // Extract design preferences
        const designs = ['glitter', 'rhinestone', 'minimalist', 'floral', 'geometric', 'ombre'];
        designs.forEach(design => {
            if (lowerMessage.includes(design.toLowerCase())) {
                entities.designs.push(design);
            }
        });
        
        // Extract occasions
        const occasions = ['wedding', 'birthday', 'party', 'everyday', 'work', 'vacation'];
        occasions.forEach(occasion => {
            if (lowerMessage.includes(occasion.toLowerCase())) {
                entities.occasions.push(occasion);
            }
        });
        
        return entities;
    },
    
    // Basic sentiment detection (fallback)
    detectBasicSentiment: function(message) {
        const lowerMessage = message.toLowerCase();
        
        const positiveWords = ['good', 'great', 'love', 'like', 'happy', 'beautiful', 'wonderful'];
        const negativeWords = ['bad', 'hate', 'dislike', 'disappointed', 'unhappy', 'ugly'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        positiveWords.forEach(word => {
            if (lowerMessage.includes(word)) positiveCount++;
        });
        
        negativeWords.forEach(word => {
            if (lowerMessage.includes(word)) negativeCount++;
        });
        
        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    },
    
    // Generate salon-specific response
    generateSalonResponse: function(analysis, originalMessage) {
        // If a salon-specific intent was detected, handle it
        if (analysis.salonIntent) {
            switch (analysis.salonIntent) {
                case 'nail_consultation':
                    return this.startNailConsultation();
                
                case 'virtual_tour':
                    return this.generateVirtualTourResponse();
                
                case 'product_recommendation':
                    return this.generateProductRecommendation(analysis.entities);
                    
                case 'nail_health':
                    return this.generateNailHealthAdvice(analysis.entities);
                    
                case 'nail_trends':
                    return this.generateTrendsResponse();
            }
        }
        
        // If no salon-specific intent, use regular intent
        switch (analysis.intent) {
            case 'booking':
                return this.generateBookingResponse(analysis);
                
            case 'services':
                return this.generateServicesResponse(analysis);
                
            case 'pricing':
                return this.generatePricingResponse(analysis);
                
            // Add other intent handlers
            
            default:
                // Fallback to the generic response with nail care flair
                return this.generateGenericResponse(originalMessage);
        }
    },
    
    // Start a nail design consultation
    startNailConsultation: function() {
        this.consultationInProgress = true;
        this.consultationStep = 1;
        this.consultationData = {};
        
        const greeting = this.customerName ? 
            `Great, ${this.customerName}! I'd be happy to help with a nail design consultation. ` : 
            `Great! I'd be happy to help with a nail design consultation. `;
            
        return greeting + "Let's find the perfect nail design for you. First, what kind of nail service are you interested in? (Regular polish, Gel, Dip Powder, Acrylic, etc.)";
    },
    
    // Continue a nail consultation
    continueConsultation: function(message) {
        switch (this.consultationStep) {
            case 1: // Nail type
                this.consultationData.nailType = message;
                this.consultationStep++;
                return "Great choice! Now, what nail shape are you considering? (Square, Round, Oval, Almond, Coffin, etc.)";
                
            case 2: // Nail shape
                this.consultationData.nailShape = message;
                this.consultationStep++;
                return "Perfect! What colors are you interested in?";
                
            case 3: // Colors
                this.consultationData.colors = message;
                this.consultationStep++;
                return "Lovely! Is this for a special occasion, or for everyday wear?";
                
            case 4: // Occasion
                this.consultationData.occasion = message;
                this.consultationStep++;
                return "Do you prefer minimal designs, or something more elaborate with art, rhinestones, etc.?";
                
            case 5: // Design complexity
                this.consultationData.complexity = message;
                this.consultationStep = 0;
                this.consultationInProgress = false;
                
                // Generate recommendation based on collected data
                return this.generateNailRecommendation();
        }
    },
    
    // Generate a nail recommendation based on consultation
    generateNailRecommendation: function() {
        const data = this.consultationData;
        
        // Introduction
        let response = "Based on our consultation, here's what I recommend:\n\n";
        
        // Nail type recommendation
        response += `For your ${data.nailType.toLowerCase()} service with a ${data.nailShape.toLowerCase()} shape, `;
        
        // Color recommendation based on occasion
        if (data.occasion.toLowerCase().includes("wedding") || 
            data.occasion.toLowerCase().includes("formal")) {
            response += "I suggest elegant, neutral tones that will complement your formal attire. ";
            if (data.colors.toLowerCase().includes("nude") || 
                data.colors.toLowerCase().includes("pink") || 
                data.colors.toLowerCase().includes("white")) {
                response += `The ${data.colors.toLowerCase()} shades you mentioned would be perfect! `;
            } else {
                response += "Perhaps a classic French manicure or soft nude with subtle shimmer. ";
            }
        } else if (data.occasion.toLowerCase().includes("everyday") || 
                  data.occasion.toLowerCase().includes("work")) {
            response += "I recommend polished, versatile colors that work well in professional settings. ";
            if (data.colors) {
                response += `Your preference for ${data.colors.toLowerCase()} is excellent for daily wear. `;
            }
        } else {
            response += `for your ${data.occasion.toLowerCase()}, I think ${data.colors.toLowerCase()} would be stunning. `;
        }
        
        // Design complexity
        if (data.complexity.toLowerCase().includes("minimal") || 
            data.complexity.toLowerCase().includes("simple")) {
            response += "For a minimalist approach, consider a solid color with perhaps an accent nail or subtle design on 1-2 fingers. ";
            
            // Add specific service from our menu
            response += "Our Natural Nail Manicure would be perfect for this look.";
        } else {
            response += "For a more elaborate design, we could incorporate nail art with ";
            
            if (data.colors.toLowerCase().includes("glitter") || 
                data.complexity.toLowerCase().includes("glitter")) {
                response += "glitter accents, ";
            }
            
            if (data.complexity.toLowerCase().includes("rhinestone") || 
                data.complexity.toLowerCase().includes("stone")) {
                response += "tasteful rhinestone placement, ";
            }
            
            response += "or custom hand-painted designs. ";
            
            // Add specific service from our menu
            response += "I'd recommend our Deluxe Nail Art service for this look.";
        }
        
        // Booking suggestion
        response += "\n\nWould you like to book an appointment to get this nail design?";
        
        return response;
    },
    
    // Generate virtual tour response
    generateVirtualTourResponse: function() {
        return "I'd be happy to give you a virtual tour of our salon! Delane's Natural Nail Care offers a relaxing, private environment designed for your comfort. We have:\n\n" +
               "1) A welcoming reception area with our Truth & Freedom polish display\n" +
               "2) Private manicure stations with ergonomic seating\n" +
               "3) Comfortable pedicure chairs with massaging features\n" +
               "4) Our exclusive retail section featuring nail care products\n" +
               "5) Coming in 2025: Our new Medi Spa section integrating wellness services\n\n" +
               "Would you like more details about any specific area of the salon?";
    },
    
    // Generate product recommendation based on extracted entities
    generateProductRecommendation: function(entities) {
        let productType = "general nail care products";
        let specificConcern = "";
        
        // Check for nail types to determine appropriate products
        if (entities.nailTypes.includes("natural")) {
            productType = "strengthening products";
            
            return `For natural nails, I recommend our Nail Strengthener ($16), which helps prevent splitting and breaking. We also have a nourishing Cuticle Oil Pen ($12) that's perfect for daily use to maintain healthy nails and cuticles. These products will help keep your natural nails in their best condition. Would you like more specific recommendations?`;
            
        } else if (entities.nailTypes.includes("gel") || entities.nailTypes.includes("shellac")) {
            productType = "gel nail care";
            
            return `For maintaining gel nails, I recommend our specialized Cuticle Oil Pen ($12) which helps keep the cuticles healthy without compromising your gel application. After removal, our Hand Cream ($15) with shea butter helps restore moisture to your hands and nails. Would you like to know more about either of these products?`;
        }
        
        // Default recommendation
        return `I'd be happy to recommend some nail care products! Our most popular items include:\n\n` +
               `- Cuticle Oil Pen ($12): Perfect for on-the-go nail hydration\n` +
               `- Nail Strengthener ($16): Helps prevent splitting and breakage\n` +
               `- Hand Cream ($15): Rich in shea butter and essential oils\n` +
               `- Truth & Freedom Polish Collection ($18 each): Our signature polish line\n\n` +
               `Do any of these interest you, or do you have specific nail concerns I can help address?`;
    },
    
    // Generate nail health advice
    generateNailHealthAdvice: function(entities) {
        // General nail health advice
        const generalAdvice = "For overall nail health, I recommend a consistent routine of:\n\n" +
                             "1) Regular hydration with cuticle oil\n" +
                             "2) Using a quality nail strengthener\n" +
                             "3) Taking breaks between gel or acrylic applications\n" +
                             "4) Gentle filing in one direction rather than sawing\n" +
                             "5) Protecting your hands with gloves when using cleaning products\n\n";
        
        // Check for specific concerns
        if (entities.nailTypes.includes("brittle") || entities.nailTypes.includes("breaking")) {
            return generalAdvice + "For brittle or breaking nails, our Nail Strengthener ($16) can be very helpful. It creates a protective barrier while delivering nutrients to your natural nails. Would you like to know more about this product?";
        }
        
        return generalAdvice + "We offer several products that can help maintain your nail health, including our Cuticle Oil Pen ($12) and Nail Strengthener ($16). Would you like more specific advice about any particular nail concern?";
    },
    
    // Generate trending designs information
    generateTrendsResponse: function() {
        const currentSeason = this.getCurrentSeason();
        let trendsResponse = "";
        
        if (currentSeason === "spring") {
            trendsResponse = "This spring, we're seeing lots of pastel colors, floral nail art, and minimalist designs with negative space. Light blues, lavenders, and soft pinks are particularly popular.";
        } else if (currentSeason === "summer") {
            trendsResponse = "Summer trends include bright neon colors, tropical designs, chrome finishes, and ocean-inspired blues and turquoise shades. Fruit nail art is also making a big comeback!";
        } else if (currentSeason === "fall") {
            trendsResponse = "Fall trends are all about warm tones like burnt orange, deep burgundy, and olive green. Matte finishes and minimal geometric designs are also very popular this season.";
        } else if (currentSeason === "winter") {
            trendsResponse = "Winter nail trends feature deep jewel tones, metallics, and glitter accents. We're also seeing a lot of velvet-effect nails and subtle shimmer finishes.";
        }
        
        return `${trendsResponse}\n\nOur most requested trend right now is ${this.getCurrentTrendingStyle()}. Would you like to see some design ideas or book an appointment to try one of these trends?`;
    },
    
    // Get current season for trend recommendations
    getCurrentSeason: function() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return "spring";
        if (month >= 5 && month <= 7) return "summer";
        if (month >= 8 && month <= 10) return "fall";
        return "winter";
    },
    
    // Get current trending style
    getCurrentTrendingStyle: function() {
        const trendingStyles = [
            "chrome finish nails with minimal art",
            "velvet-effect nails in rich jewel tones",
            "gradient French tips with modern color combinations",
            "negative space designs with geometric accents"
        ];
        
        const randomIndex = Math.floor(Math.random() * trendingStyles.length);
        return trendingStyles[randomIndex];
    },
    
    // Generate booking response with appointment context
    generateBookingResponse: function(analysis) {
        let response = "I'd be happy to help you book an appointment! ";
        
        // Check if specific services were mentioned
        if (analysis.entities && analysis.entities.services && analysis.entities.services.length > 0) {
            const service = analysis.entities.services[0];
            response += `For your ${service}, `;
        }
        
        response += "you can schedule through our online booking system.";
        
        // Check if specific dates were mentioned
        if (analysis.entities && analysis.entities.dates && analysis.entities.dates.length > 0) {
            const date = analysis.entities.dates[0];
            response += ` I see you're interested in ${date}. `;
        }
        
        // Add personalized closing if we have customer name
        if (this.customerName) {
            response += ` ${this.customerName}, would you like me to open the booking page for you?`;
        } else {
            response += " Would you like me to open the booking page for you?";
        }
        
        return response;
    },
    
    // Generate services response with current information
    generateServicesResponse: function(analysis) {
        // Try to use KnowledgeBase if available
        if (typeof KnowledgeBase !== 'undefined') {
            let response = "Here are our current nail care services:\n\n";
            
            // Add nail care services
            KnowledgeBase.services.nailCare.forEach(service => {
                response += `• ${service.name}: ${service.price} (${service.duration})\n`;
            });
            
            // Add information about our 2025 expansion
            response += "\nExciting news! In 2025, we'll be expanding to include Medi Spa services for a more comprehensive wellness experience.";
            
            // Add personalized touch
            if (this.customerName) {
                response += `\n\n${this.customerName}, is there a particular service you'd like more information about?`;
            } else {
                response += "\n\nIs there a particular service you'd like more information about?";
            }
            
            return response;
        }
        
        // Fallback if KnowledgeBase is not available
        return "We offer a variety of nail care services including manicures, pedicures, gel applications, nail art, and more. Our services range from $20 for a basic polish change to $65+ for our deluxe treatments. Would you like information about a specific service?";
    },
    
    // Generate pricing response with current information
    generatePricingResponse: function(analysis) {
        // Check for specific service pricing questions
        if (analysis.entities && analysis.entities.services && analysis.entities.services.length > 0) {
            const serviceName = analysis.entities.services[0];
            
            // Try to use KnowledgeBase if available
            if (typeof KnowledgeBase !== 'undefined') {
                const service = KnowledgeBase.getServiceByName(serviceName);
                
                if (service) {
                    return `Our ${service.name} is currently priced at ${service.price} for a ${service.duration} service. ${service.description} Would you like to book this service?`;
                }
            }
        }
        
        // General pricing information
        let response = "Our services are priced as follows:\n\n" +
                     "• Natural Nail Manicure: $35 (45 min)\n" +
                     "• Gel Manicure: $45 (60 min)\n" +
                     "• Spa Pedicure: $50 (50 min)\n" +
                     "• Deluxe Pedicure: $65 (75 min)\n" +
                     "• Polish Change: $20 (20 min)\n" +
                     "• Nail Art: From $5 per nail\n\n";
                     
        // Add personalized touch
        if (this.customerName) {
            response += `${this.customerName}, would you like details about pricing for any other service?`;
        } else {
            response += "Would you like details about pricing for any other service?";
        }
        
        return response;
    },
    
    // Generate generic response with nail care flair
    generateGenericResponse: function(message) {
        const personalTouch = this.customerName ? `, ${this.customerName}` : "";
        
        return `Thank you for your message${personalTouch}. I'm here to help with all your nail care needs, including appointment scheduling, service information, nail health advice, and product recommendations. How can I assist you with your nail care journey today?`;
    },
    
    // Initialize real-time data feed
    initRealtimeData: function() {
        // In a real implementation, this would connect to various data sources
        console.log('Initializing real-time data connections...');
        
        // Set up timers to periodically check for updates
        setInterval(this.checkForUpdates, 3600000); // Check hourly
    },
    
    // Check for data updates
    checkForUpdates: function() {
        // In a real implementation, this would refresh various data caches
        console.log('Checking for salon data updates...');
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        NailAideSalonAI.init();
    }, 1000);
});

// Make available globally
window.NailAideSalonAI = NailAideSalonAI;
