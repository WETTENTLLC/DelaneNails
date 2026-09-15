/**
 * FAQ Handler for NailAide
 * Provides intelligent matching and retrieval of frequently asked questions
 */

const FAQHandler = {
    faqData: [],
    initialized: false,
    
    init: function() {
        console.log('Initializing FAQ Handler...');
        
        // Load FAQ data
        this.loadFAQData();
        
        this.initialized = true;
        return this;
    },
    
    loadFAQData: function() {
        // First try to get data from KnowledgeBase if available
        if (typeof KnowledgeBase !== 'undefined' && KnowledgeBase.faqs) {
            this.faqData = KnowledgeBase.faqs;
            console.log(`Loaded ${this.faqData.length} FAQs from KnowledgeBase`);
            return;
        }
        
        // Otherwise use built-in FAQ data
        this.faqData = [
            {
                question: "Do you take walk-ins?",
                answer: "Yes, we welcome walk-ins! However, we strongly recommend booking an appointment to ensure availability, especially during weekends and peak hours."
            },
            {
                question: "How far in advance should I book?",
                answer: "For weekday appointments, we recommend booking 2-3 days in advance. For weekends, 1-2 weeks advance booking is suggested, especially for groups or multiple services."
            },
            {
                question: "What health and safety measures do you follow?",
                answer: "We prioritize your health with hospital-grade sterilization of all tools, single-use items when possible, and regular sanitization of all surfaces. Our staff follows strict hygiene protocols and is fully trained in safety procedures."
            },
            {
                question: "Can I purchase a gift card?",
                answer: "Yes! Gift cards are available in any denomination and can be purchased in-store or through our website. They make perfect presents for birthdays, anniversaries, or any special occasion."
            },
            {
                question: "What is your cancellation policy?",
                answer: "We request at least 24 hours notice for cancellations. Late cancellations or no-shows may incur a 50% service fee. We appreciate your understanding as this helps us accommodate other clients."
            },
            {
                question: "Do you offer services for children?",
                answer: "Yes, we offer kid-friendly services for children ages 10 and up, accompanied by an adult. We have special polish options that are appropriate for younger clients."
            },
            {
                question: "What is the Truth & Freedom polish line?",
                answer: "Truth & Freedom is our exclusive nail polish line named after inspirational women throughout history. Each color celebrates female achievement, and a portion of all sales goes to our nonprofit, DNNC Steps to Success, which empowers women through mentorship and career advancement."
            },
            {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, debit cards, cash, and digital payment methods like Apple Pay and Google Pay. Gift cards can also be used as payment for any service or product."
            },
            {
                question: "Do you do natural nails only?",
                answer: "While we specialize in natural nail care, we also offer other nail services including gel polish, dip powder, and nail art. Our focus is always on maintaining nail health regardless of the service you choose."
            },
            {
                question: "How long do appointments typically take?",
                answer: "Service duration varies: basic manicures take about 45 minutes, gel manicures 60 minutes, basic pedicures 50 minutes, and deluxe pedicures 75 minutes. Nail art or additional treatments may require extra time."
            },
            {
                question: "Can I bring my kids?",
                answer: "Children are welcome to accompany you, but we ask that they be supervised at all times to ensure a relaxing environment for all clients. We also offer children's nail services for ages 10 and up."
            },
            {
                question: "Do you offer private parties or group bookings?",
                answer: "Yes! We're happy to accommodate private parties for special occasions like birthdays, bridal parties, or corporate events. Please contact us at least 2-3 weeks in advance to arrange group bookings."
            }
        ];
        
        console.log(`Loaded ${this.faqData.length} built-in FAQs`);
    },
    
    findMatchingFAQs: function(query, maxResults = 3) {
        if (!this.initialized) {
            this.init();
        }
        
        if (!query || query.trim() === '') {
            return [];
        }
        
        const queryTerms = this.tokenize(query.toLowerCase());
        
        // Score each FAQ by relevance to the query
        const scoredFAQs = this.faqData.map(faq => {
            const questionTerms = this.tokenize(faq.question.toLowerCase());
            const answerTerms = this.tokenize(faq.answer.toLowerCase());
            
            // Calculate term matches in question (higher weight) and answer
            let score = 0;
            
            // Direct phrase match is highest score
            if (faq.question.toLowerCase().includes(query.toLowerCase())) {
                score += 100;
            }
            
            if (faq.answer.toLowerCase().includes(query.toLowerCase())) {
                score += 50;
            }
            
            // Term matching
            queryTerms.forEach(term => {
                if (questionTerms.includes(term)) {
                    score += 10;
                }
                
                if (answerTerms.includes(term)) {
                    score += 5;
                }
            });
            
            return {
                question: faq.question,
                answer: faq.answer,
                score: score
            };
        });
        
        // Filter out zero-score results and sort by score
        const results = scoredFAQs
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
        
        return results;
    },
    
    tokenize: function(text) {
        // Basic tokenization - split by non-word characters and filter out stop words
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'in', 'to', 'for', 'with', 'on', 'at', 'from', 'by', 'about', 'as', 'of', 'be', 'do', 'you', 'your', 'my', 'i', 'we', 'they', 'it']);
        
        return text
            .split(/\W+/)
            .filter(word => word.length > 1 && !stopWords.has(word));
    },
    
    getTopFAQForToday: function() {
        // Return a contextually relevant FAQ based on current day/time
        const now = new Date();
        const day = now.getDay(); // 0-6, where 0 is Sunday
        const hour = now.getHours(); // 0-23
        
        // Weekend near closing - suggest booking for next week
        if ((day === 5 || day === 6) && hour >= 15) {
            return this.faqData.find(faq => faq.question.includes('advance should I book'));
        }
        
        // Weekday morning - suggest walk-ins
        if (day >= 1 && day <= 5 && hour < 12) {
            return this.faqData.find(faq => faq.question.includes('walk-ins'));
        }
        
        // Default to a random important FAQ
        const importantFAQs = [0, 1, 4, 8]; // Indices of key FAQs
        const randomIndex = importantFAQs[Math.floor(Math.random() * importantFAQs.length)];
        return this.faqData[randomIndex];
    },
    
    formatFAQResponse: function(matchingFAQs) {
        if (!matchingFAQs || matchingFAQs.length === 0) {
            return null;
        }
        
        if (matchingFAQs.length === 1) {
            return matchingFAQs[0].answer;
        }
        
        // Multiple matches - create a comprehensive response
        let response = '';
        
        // First, give the best match as direct answer
        response += matchingFAQs[0].answer;
        
        // Then offer additional related information
        if (matchingFAQs.length > 1) {
            response += '\n\nI can also share more information about:';
            for (let i = 1; i < matchingFAQs.length; i++) {
                response += `\n• ${matchingFAQs[i].question}`;
            }
            response += '\n\nWould you like to know more about any of these?';
        }
        
        return response;
    },
    
    processQuestion: function(query) {
        const matchingFAQs = this.findMatchingFAQs(query);
        
        if (matchingFAQs.length > 0) {
            return {
                hasAnswer: true,
                directAnswer: matchingFAQs[0].answer,
                formattedResponse: this.formatFAQResponse(matchingFAQs),
                matchedQuestions: matchingFAQs.map(faq => faq.question),
                confidence: matchingFAQs[0].score / 100 // Normalize to 0-1 range
            };
        }
        
        return {
            hasAnswer: false,
            confidence: 0,
            formattedResponse: null
        };
    }
};

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        FAQHandler.init();
    }, 1000);
});

// Make available globally
window.FAQHandler = FAQHandler;
