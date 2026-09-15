class ResponseGenerator {
    constructor(knowledgeBase, contextManager, siteNavigator) {
        this.knowledgeBase = knowledgeBase;
        this.contextManager = contextManager;
        this.siteNavigator = siteNavigator;
        this.productsKnowledge = new ProductsKnowledge();
        this.dnncInitiatives = new DnncInitiatives();
        
        // Define response templates
        this.templates = {
            greeting: [
                "Hello! Welcome to Delane's Natural Nail Care. How can I help you today?",
                "Hi there! I'm NailAide, the virtual assistant for Delane's. What can I do for you?",
                "Welcome! I'm here to help with any questions about our nail care services. What would you like to know?"
            ],
            booking: [
                "I'd be happy to help you book an appointment! You can schedule directly through our online booking system.",
                "Great! We'd love to book you in. You can make an appointment online or call us at {phone}.",
                "Booking an appointment is easy! Simply visit our appointments page or give us a call."
            ],
            service_inquiry: [
                "We offer a variety of nail care services including manicures, pedicures, and more. What specific service are you interested in?",
                "Delane's offers many natural nail care services. Is there a particular treatment you'd like to learn more about?",
                "Our services range from basic manicures to deluxe spa pedicures. Which service would you like details about?"
            ],
            pricing: [
                "Our pricing varies depending on the service. Natural manicures start at $35, and pedicures at $50. What service are you interested in?",
                "I'd be happy to provide pricing information. Could you let me know which service you're interested in?",
                "Our services are priced based on the treatment length and products used. Which service pricing would you like to know about?"
            ],
            hours: [
                "We're open Monday through Friday from 10am to 6pm, and Saturday from 9am to 5pm. We're closed on Sundays.",
                "Our salon hours are 10-6 Monday to Friday, and 9-5 on Saturdays. We take the day off on Sundays!",
                "Delane's is open weekdays 10am-6pm and Saturdays 9am-5pm. We're closed on Sundays."
            ],
            location: [
                "We're located at {address}. Would you like directions?",
                "Our salon is at {address}. Is there anything specific you'd like to know about our location?",
                "You can find us at {address}. We're easy to find with plenty of parking available!"
            ],
            farewell: [
                "Thank you for chatting with us! Have a wonderful day!",
                "It was a pleasure helping you today. Don't hesitate to reach out if you have more questions!",
                "Thanks for stopping by our chat! We hope to see you at the salon soon!"
            ],
            help: [
                "I can help with information about our services, pricing, booking appointments, hours, and location. What would you like to know?",
                "I'm here to assist with any questions about Delane's Natural Nail Care. How can I help you today?",
                "I can provide details about our salon services, help you book, or answer questions. What do you need?"
            ],
            unknown: [
                "I'm not sure I understand. Could you please rephrase your question?",
                "I didn't quite catch that. How else can I help you with our nail services?",
                "I'm still learning! Could you try asking your question another way?"
            ],
            navigation: [
                "I can help you navigate our website. Which page would you like to visit?",
                "I'll be happy to direct you to the right page. Which section are you looking for?",
                "Let me show you around our website. What information are you looking for specifically?"
            ],
            find_information: [
                "I'll help you find that information. What specifically would you like to know about?",
                "I can provide information about our services, hours, location, and more. What details are you looking for?",
                "I'd be happy to help you find the information you need. Could you be more specific about what you're looking for?"
            ],
            product_inquiry: [
                "We offer a variety of nail care products that you can purchase in our salon or online. What type of products are you interested in?",
                "Our product line includes the Truth & Freedom polish collection, nail care essentials, and our new advanced care treatments. Which would you like to hear about?",
                "We have several product lines available for purchase, including our exclusive polish collection. Is there something specific you're looking for?"
            ],
            dnnc_inquiry: [
                "DNNC stands for Delane's Natural Nail Care. Beyond our salon services, we have several initiatives including Steps to Success and Vision 2025. What would you like to know more about?",
                "Our DNNC initiatives include our nonprofit Steps to Success program and our Vision 2025 expansion plan. Which aspect interests you?",
                "DNNC encompasses both our salon and our community initiatives. Would you like to learn about our Steps to Success nonprofit or our Vision 2025 expansion plans?"
            ],
            advanced_pedicure: [
                "Our Advanced Pedicure Program offers specialized treatments addressing specific foot health concerns, including therapeutic relief, diabetic foot care, and athletic recovery pedicures.",
                "We have several specialized advanced pedicures that focus on foot health beyond aesthetics, including options for diabetic care and athletic recovery.",
                "Our Advanced Pedicure Program is designed for clients with specific foot health needs, with treatments performed by certified specialists. Would you like details on a specific treatment?"
            ]
        };
    }

    generateResponse(intent, messageText) {
        // Update context with the detected intent and message
        const topic = this.contextManager.detectTopic(messageText);
        
        let response = "";
        
        // Generate response based on intent
        switch (intent) {
            case 'greeting':
                response = this.getRandomTemplate('greeting');
                break;
                
            case 'booking':
                response = this.enhanceResponse(
                    this.getRandomTemplate('booking'),
                    this.knowledgeBase.getContactInfo()
                );
                
                // Add booking link
                response += " <a href='" + this.knowledgeBase.data.contactInfo.bookingUrl + 
                           "' target='_blank' class='booking-link'>Book Now</a>";
                break;
                
            case 'service_inquiry':
                // Try to identify which service they're asking about
                const serviceInfo = this.extractServiceInformation(messageText);
                if (serviceInfo) {
                    response = this.formatServiceInfo(serviceInfo);
                } else {
                    response = this.getRandomTemplate('service_inquiry');
                    
                    // Add a link to services page
                    response += " " + this.siteNavigator.createNavigationLink("services");
                }
                break;
                
            case 'pricing':
                response = this.getRandomTemplate('pricing');
                response += " " + this.siteNavigator.createNavigationLink("services");
                break;
                
            case 'hours':
                response = this.getRandomTemplate('hours');
                break;
                
            case 'location':
                response = this.enhanceResponse(
                    this.getRandomTemplate('location'),
                    this.knowledgeBase.getContactInfo()
                );
                break;
                
            case 'farewell':
                response = this.getRandomTemplate('farewell');
                break;
                
            case 'help':
                response = this.getRandomTemplate('help');
                break;
                
            case 'navigation':
                // Check if user wants to navigate to a specific page
                const navSuggestion = this.siteNavigator.getNavigationSuggestion(intent, messageText);
                if (navSuggestion) {
                    response = navSuggestion.message + " " + 
                               this.siteNavigator.createNavigationLink(navSuggestion.page);
                } else {
                    response = this.getRandomTemplate('navigation');
                }
                break;
                
            case 'find_information':
                // Check FAQ first
                const faqResults = this.knowledgeBase.searchFAQ(messageText);
                if (faqResults && faqResults.length > 0) {
                    response = faqResults[0].answer;
                } else {
                    // Try to find topic-specific information
                    const navSuggestion = this.siteNavigator.getNavigationSuggestion(intent, messageText);
                    if (navSuggestion) {
                        response = navSuggestion.message + " " + 
                                   this.siteNavigator.createNavigationLink(navSuggestion.page);
                    } else {
                        response = this.getRandomTemplate('find_information');
                    }
                }
                break;
                
            case 'product_inquiry':
                // Check if asking about a specific product category or new products
                if (messageText.toLowerCase().includes('new') && messageText.toLowerCase().includes('product')) {
                    const newProducts = this.productsKnowledge.getNewProducts();
                    response = this.productsKnowledge.formatProductsResponse(newProducts);
                } else if (messageText.toLowerCase().includes('truth') || messageText.toLowerCase().includes('freedom')) {
                    const specificProducts = this.productsKnowledge.getSpecificProducts(messageText);
                    response = this.productsKnowledge.formatProductsResponse(specificProducts);
                } else {
                    response = this.getRandomTemplate('product_inquiry');
                }
                break;
                
            case 'dnnc_inquiry':
                response = this.getRandomTemplate('dnnc_inquiry');
                break;
                
            default:
                response = this.getRandomTemplate('unknown');
        }
        
        // Update conversation context
        this.contextManager.updateContext(intent, messageText, response);
        
        return response;
    }
    
    getRandomTemplate(templateName) {
        const templates = this.templates[templateName];
        if (!templates || templates.length === 0) {
            return "I'm here to help with Delane's Natural Nail Care services.";
        }
        
        return templates[Math.floor(Math.random() * templates.length)];
    }
    
    enhanceResponse(template, data) {
        if (!data) return template;
        
        let response = template;
        
        // Replace placeholders with actual data
        if (data.phone) {
            response = response.replace('{phone}', data.phone);
        }
        
        if (data.address) {
            response = response.replace('{address}', data.address);
        }
        
        if (data.email) {
            response = response.replace('{email}', data.email);
        }
        
        return response;
    }
    
    extractServiceInformation(message) {
        // Check for specific service names in the message
        const lowerMessage = message.toLowerCase();
        const serviceTypes = {
            'manicure': this.knowledgeBase.data.services.nailCare.filter(s => s.name.toLowerCase().includes('manicure')),
            'pedicure': this.knowledgeBase.data.services.nailCare.filter(s => s.name.toLowerCase().includes('pedicure')),
            'gel': this.knowledgeBase.data.services.nailCare.filter(s => s.name.toLowerCase().includes('gel')),
            'polish': this.knowledgeBase.data.services.nailCare.filter(s => s.name.toLowerCase().includes('polish')),
            'art': this.knowledgeBase.data.services.nailCare.filter(s => s.name.toLowerCase().includes('art')),
            'facial': this.knowledgeBase.data.services.mediSpa.filter(s => s.name.toLowerCase().includes('facial')),
            'wellness': this.knowledgeBase.data.services.mediSpa.filter(s => s.name.toLowerCase().includes('wellness'))
        };
        
        for (const [keyword, services] of Object.entries(serviceTypes)) {
            if (lowerMessage.includes(keyword) && services.length > 0) {
                return services[0];
            }
        }
        
        return null;
    }
    
    formatServiceInfo(serviceInfo) {
        if (!serviceInfo) return null;
        
        return `Our ${serviceInfo.name} is ${serviceInfo.price} and takes about ${serviceInfo.duration}. ${serviceInfo.description} Would you like to book this service?`;
    }
    
    getRandomGreeting() {
        const greetings = [
            "Hello! I'm NailAide, your virtual assistant for Delane's Natural Nail Care. How can I help you today?",
            "Welcome to Delane's Natural Nail Care! I'm here to help with information about our services, appointments, or answer any questions you might have.",
            "Hi there! I'm NailAide, ready to assist with all things nail care at Delane's. What can I help you with today?"
        ];
        
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
}

// Export the response generator
window.ResponseGenerator = ResponseGenerator;
