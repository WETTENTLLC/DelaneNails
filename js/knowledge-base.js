/**
 * Knowledge Base for NailAide
 * Contains structured information about services, products, and common questions
 */

const KnowledgeBase = {
    // Core information
    businessInfo: {
        name: "Delane's Natural Nail Care & Medi Spa",
        slogan: "Relaxing, Private, Professional, and Clean",
        about: "Delane's Natural Nail Care & Medi Spa is dedicated to providing high-quality, health-focused nail care in a clean, relaxing environment. We prioritize natural nail health and personal attention.",
        owner: "Delane",
        founded: "2018",
        missionStatement: "To provide exceptional nail care services while maintaining the highest standards of cleanliness and professionalism, helping every client feel valued and beautiful."
    },
    
    // Services information
    services: {
        nailCare: [
            {
                name: "Natural Nail Manicure",
                price: "$35",
                duration: "45 min",
                description: "Our signature manicure focuses on natural nail health with gentle cuticle care, precise shaping, and your choice of polish. Includes a relaxing hand massage."
            },
            {
                name: "Gel Manicure",
                price: "$45",
                duration: "60 min",
                description: "Long-lasting, chip-free gel polish applied to your natural nails with meticulous care. Includes cuticle work, shaping, and hand massage."
            },
            {
                name: "Spa Pedicure",
                price: "$50",
                duration: "50 min",
                description: "Rejuvenate tired feet with our spa pedicure including a soothing soak, exfoliation, callus care, and relaxing foot massage."
            },
            {
                name: "Deluxe Pedicure",
                price: "$65",
                duration: "75 min",
                description: "Our premium pedicure experience with extended massage, paraffin treatment, and specialized products for ultimate relaxation and foot renewal."
            },
            {
                name: "Polish Change",
                price: "$20",
                duration: "20 min",
                description: "Quick polish change for hands or feet with your choice of color from our salon collection."
            },
            {
                name: "Nail Art",
                price: "From $5 per nail",
                duration: "Varies",
                description: "Custom nail art designs from simple accents to elaborate creations. Price varies based on complexity."
            }
        ],
        
        mediSpa: [
            {
                name: "Facial Treatment",
                price: "$85",
                duration: "60 min",
                description: "Personalized facial treatment addressing your specific skin concerns. Includes cleansing, exfoliation, mask, and facial massage."
            },
            {
                name: "Wellness Consultation",
                price: "$60",
                duration: "45 min",
                description: "One-on-one consultation to discuss your wellness goals and create a personalized plan."
            }
        ]
    },
    
    // Products information
    products: {
        truthFreedomPolish: [
            {
                name: "Eleanor",
                color: "Bold Red",
                price: "$18",
                description: "A timeless, powerful red named after Eleanor Roosevelt, symbolizing courage and conviction."
            },
            {
                name: "Maya",
                color: "Deep Purple",
                price: "$18",
                description: "A rich, inspirational purple shade named after Maya Angelou, representing wisdom and creativity."
            },
            {
                name: "Rosa",
                color: "Soft Pink",
                price: "$18",
                description: "A gentle yet determined pink named after Rosa Parks, symbolizing quiet strength and dignity."
            },
            {
                name: "Amelia",
                color: "Sky Blue",
                price: "$18",
                description: "An adventurous blue named after Amelia Earhart, representing courage to explore new horizons."
            }
        ],
        
        nailCareProducts: [
            {
                name: "Cuticle Oil Pen",
                price: "$12",
                description: "Nourishing cuticle oil in a convenient pen applicator to hydrate and strengthen nails."
            },
            {
                name: "Nail Strengthener",
                price: "$16",
                description: "Fortifying treatment that helps prevent splitting and breaking of natural nails."
            },
            {
                name: "Hand Cream",
                price: "$15",
                description: "Luxurious hand cream with shea butter and essential oils for soft, hydrated skin."
            }
        ]
    },
    
    // Hours information
    hours: {
        Monday: "10:00 AM - 6:00 PM",
        Tuesday: "10:00 AM - 6:00 PM",
        Wednesday: "10:00 AM - 6:00 PM",
        Thursday: "10:00 AM - 6:00 PM",
        Friday: "10:00 AM - 6:00 PM",
        Saturday: "9:00 AM - 5:00 PM",
        Sunday: "Closed"
    },
    
    // Contact information
    contactInfo: {
        phone: "(123) 456-7890",
        email: "info@delanesnailcare.com",
        address: "123 Spa Lane, Beauty City, USA",
        website: "www.delanesnaturalnailcare.com",
        bookingUrl: "https://delanesnaturalnailcare.booksy.com/"
    },
    
    // FAQ information
    faqs: [
        {
            question: "Do you take walk-ins?",
            answer: "We welcome walk-ins but strongly recommend booking an appointment to ensure availability. Our weekends tend to be particularly busy."
        },
        {
            question: "How far in advance should I book?",
            answer: "For weekday appointments, we recommend booking 2-3 days in advance. For weekends, 1-2 weeks advance booking is suggested, especially for groups."
        },
        {
            question: "What health and safety measures do you follow?",
            answer: "We prioritize your health with hospital-grade sterilization of all tools, single-use items when possible, and regular sanitization of all surfaces. Our staff is fully vaccinated and follows strict hygiene protocols."
        },
        {
            question: "Can I purchase a gift card?",
            answer: "Yes! Gift cards are available in any denomination and can be purchased in-store or through our website."
        },
        {
            question: "What is your cancellation policy?",
            answer: "We request at least 24 hours notice for cancellations. Late cancellations or no-shows may incur a 50% service fee."
        },
        {
            question: "Do you offer services for children?",
            answer: "Yes, we offer kid-friendly services for children ages 10 and up, accompanied by an adult."
        },
        {
            question: "What is the Truth & Freedom polish line?",
            answer: "Truth & Freedom is our exclusive nail polish line named after inspirational women throughout history. A portion of all sales goes to our nonprofit, DNNC Steps to Success, which empowers women through mentorship and career advancement."
        }
    ],
    
    // Steps to Success information
    stepsToSuccess: {
        about: "DNNC Steps to Success is our nonprofit initiative designed to help women overcome barriers to professional success through mentorship, education, and support.",
        mission: "To empower women to achieve financial independence and career fulfillment through targeted support and education.",
        programs: [
            {
                name: "Mentorship Program",
                description: "Connecting women with experienced professionals in their field of interest for one-on-one guidance."
            },
            {
                name: "Career Skills Workshops",
                description: "Regular workshops covering resume building, interview techniques, professional communication, and more."
            },
            {
                name: "Financial Literacy Education",
                description: "Courses designed to build understanding of personal finance, budgeting, and investment basics."
            }
        ],
        howToSupport: "You can support Steps to Success by purchasing our Truth & Freedom polish line, making a direct donation through our website, or volunteering your time and expertise as a mentor."
    },
    
    // 2025 Vision
    vision2025: {
        summary: "In 2025, Delane's Natural Nail Care will expand into a full Medi Spa experience, integrating beauty, health, and wellness into one cohesive experience.",
        newServices: [
            "Personalized skin treatments",
            "Holistic wellness consultations",
            "Nutritional guidance",
            "Stress reduction therapies"
        ],
        goals: [
            "Create an integrated approach to beauty and wellness",
            "Expand our professional team to include licensed healthcare providers",
            "Develop a line of wellness products to complement our beauty offerings",
            "Provide a more comprehensive self-care experience for our clients"
        ]
    },
    
    // Helper functions
    getServiceByName: function(name) {
        const lowerName = name.toLowerCase();
        
        // Search nail care services
        for (const service of this.services.nailCare) {
            if (service.name.toLowerCase().includes(lowerName)) {
                return service;
            }
        }
        
        // Search medi spa services
        for (const service of this.services.mediSpa) {
            if (service.name.toLowerCase().includes(lowerName)) {
                return service;
            }
        }
        
        return null;
    },
    
    findFAQ: function(query) {
        const lowerQuery = query.toLowerCase();
        const matches = [];
        
        for (const faq of this.faqs) {
            // Check if query is in question or answer
            if (faq.question.toLowerCase().includes(lowerQuery) || 
                faq.answer.toLowerCase().includes(lowerQuery)) {
                matches.push(faq);
            }
        }
        
        return matches;
    },
    
    getProductInfo: function(productName) {
        const lowerName = productName.toLowerCase();
        
        // Check Truth & Freedom polish line
        for (const polish of this.products.truthFreedomPolish) {
            if (polish.name.toLowerCase().includes(lowerName) || 
                polish.color.toLowerCase().includes(lowerName)) {
                return polish;
            }
        }
        
        // Check nail care products
        for (const product of this.products.nailCareProducts) {
            if (product.name.toLowerCase().includes(lowerName)) {
                return product;
            }
        }
        
        return null;
    }
};

// Make available globally
window.KnowledgeBase = KnowledgeBase;
