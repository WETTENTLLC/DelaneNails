class SiteNavigator {
    constructor() {
        this.siteMap = {
            home: "/index.html",
            services: "/services.html",
            gallery: "/gallery.html",
            appointments: "/appointments.html",
            about: "/about.html",
            contact: "/contact.html",
            faq: "/faq.html"
        };
    }

    navigateTo(pageName) {
        const normalizedPageName = pageName.toLowerCase().replace(/\s+/g, "");
        
        // Check for direct matches
        if (this.siteMap[normalizedPageName]) {
            window.location.href = this.siteMap[normalizedPageName];
            return true;
        }
        
        // Check for partial matches or synonyms
        const pageMapping = {
            "book": "appointments",
            "schedule": "appointments",
            "reservation": "appointments",
            "service": "services",
            "treatment": "services",
            "nail": "services",
            "photo": "gallery",
            "picture": "gallery",
            "image": "gallery",
            "example": "gallery",
            "info": "about",
            "location": "contact",
            "hour": "contact",
            "direction": "contact",
            "phone": "contact",
            "question": "faq",
            "help": "faq"
        };
        
        for (const [synonym, page] of Object.entries(pageMapping)) {
            if (normalizedPageName.includes(synonym)) {
                window.location.href = this.siteMap[page];
                return true;
            }
        }
        
        return false;
    }

    getNavigationSuggestion(intent, messageText) {
        if (intent === "find_information" || intent === "book_appointment") {
            const lowerMessage = messageText.toLowerCase();
            
            if (lowerMessage.includes("service") || lowerMessage.includes("offer") || 
                lowerMessage.includes("treatment") || lowerMessage.includes("nail")) {
                return {
                    page: "services",
                    message: "You might want to check our services page for detailed information."
                };
            }
            
            if (lowerMessage.includes("book") || lowerMessage.includes("appointment") || 
                lowerMessage.includes("schedule") || lowerMessage.includes("reservation")) {
                return {
                    page: "appointments",
                    message: "Would you like to go to our appointments page to book a session?"
                };
            }
            
            if (lowerMessage.includes("photo") || lowerMessage.includes("picture") || 
                lowerMessage.includes("example") || lowerMessage.includes("gallery")) {
                return {
                    page: "gallery",
                    message: "Check out our gallery page to see examples of our work."
                };
            }
            
            if (lowerMessage.includes("contact") || lowerMessage.includes("location") || 
                lowerMessage.includes("address") || lowerMessage.includes("phone")) {
                return {
                    page: "contact",
                    message: "You can find our contact information on the contact page."
                };
            }
        }
        
        return null;
    }
    
    createNavigationLink(pageName) {
        const normalizedPageName = pageName.toLowerCase().replace(/\s+/g, "");
        if (this.siteMap[normalizedPageName]) {
            return `<a href="${this.siteMap[normalizedPageName]}" class="nav-suggestion">Click here to visit our ${pageName} page</a>`;
        }
        return "";
    }
}

// Export the site navigator
window.SiteNavigator = SiteNavigator;
