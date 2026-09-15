/**
 * Message Processor for NailAide
 * Handles the entire pipeline of processing user messages and generating responses
 */

class MessageProcessor {
    constructor() {
        this.stopWords = [
            'a', 'an', 'the', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
            'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
            'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
            'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
            'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
            'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will',
            'just', 'should', 'now'
        ];
    }
    
    preprocess(message) {
        if (!message) return '';
        
        // Remove extra whitespace
        let processed = message.trim().replace(/\s+/g, ' ');
        
        // Convert to lowercase
        processed = processed.toLowerCase();
        
        // Remove punctuation (except question marks which are useful for intent detection)
        processed = processed.replace(/[.,;:#!$%^&*()-+={}[\]|\\/<>'"`~]/g, '');
        
        return processed;
    }
    
    extractKeywords(message) {
        if (!message) return [];
        
        const processed = this.preprocess(message);
        const words = processed.split(' ').filter(word => word.length > 2 && !this.stopWords.includes(word));
        
        // Count word frequencies
        const wordFrequency = {};
        words.forEach(word => {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
        
        // Sort by frequency
        return Object.entries(wordFrequency)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
    }
    
    detectEntities(message) {
        const entities = {
            serviceTypes: [],
            dates: [],
            times: [],
            people: []
        };
        
        if (!message) return entities;
        
        const processed = message.toLowerCase();
        
        // Detect service types
        const serviceTypes = [
            'manicure', 'pedicure', 'gel', 'polish', 'nail art', 
            'facial', 'wellness', 'spa', 'massage', 'treatment'
        ];
        
        serviceTypes.forEach(service => {
            if (processed.includes(service)) {
                entities.serviceTypes.push(service);
            }
        });
        
        // Simple date detection
        const datePatterns = [
            /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
            /\b(next|this) (week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
            /\b\d{1,2}[-/]\d{1,2}([-/]\d{2,4})?\b/,  // MM/DD/YYYY or DD/MM/YYYY
            /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(st|nd|rd|th)?\b/i
        ];
        
        datePatterns.forEach(pattern => {
            const match = processed.match(pattern);
            if (match) {
                entities.dates.push(match[0]);
            }
        });
        
        // Simple time detection
        const timePatterns = [
            /\b\d{1,2}:\d{2}\s*(am|pm)?\b/i,  // 10:30 am
            /\b\d{1,2}\s*(am|pm)\b/i,  // 10 am
            /\b(morning|afternoon|evening|night)\b/i
        ];
        
        timePatterns.forEach(pattern => {
            const match = processed.match(pattern);
            if (match) {
                entities.times.push(match[0]);
            }
        });
        
        // Simple person count detection
        const peoplePatterns = [
            /\b(me and|with|for) (\d+|my|a|one|two|three|four|five) (people|person|friend|friends|family|guest|guests)\b/i,
            /\bgroup of (\d+|a few|several)\b/i
        ];
        
        peoplePatterns.forEach(pattern => {
            const match = processed.match(pattern);
            if (match) {
                entities.people.push(match[0]);
            }
        });
        
        return entities;
    }
    
    extractQuestionType(message) {
        if (!message) return 'general';
        
        const processed = message.toLowerCase();
        
        if (processed.match(/\b(what|which)\b/)) return 'what';
        if (processed.match(/\b(where|location)\b/)) return 'where';
        if (processed.match(/\b(when|time|hours)\b/)) return 'when';
        if (processed.match(/\b(how|process)\b/)) return 'how';
        if (processed.match(/\b(why|reason)\b/)) return 'why';
        if (processed.match(/\b(who|staff|technician)\b/)) return 'who';
        if (processed.match(/\b(can i|is it possible)\b/)) return 'possibility';
        
        if (processed.includes('?')) return 'general_question';
        
        return 'statement';
    }
}

// Export the message processor
window.MessageProcessor = MessageProcessor;