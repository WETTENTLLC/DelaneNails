/**
 * Conversation Context Manager for NailAide
 * Tracks conversation state, user preferences, and history for more natural interactions
 */

const ConversationContext = {
    // Main context store
    context: {
        // Basic user info
        user: {
            name: null,
            preferredName: null,
            visitCount: 0,
            preferences: {}
        },
        
        // Conversation tracking
        conversation: {
            history: [],
            lastTopics: [],
            lastMentionedEntities: {},
            sentimentHistory: [],
            unansweredQuestions: []
        },
        
        // Session information
        session: {
            startTime: null,
            messageCount: 0,
            activeTopics: new Set(),
            lastResponseTime: null,
            interactionSummary: {}
        }
    },
    
    // Initialize context manager
    init: function() {
        console.log('Initializing Conversation Context Manager...');
        
        // Set session start time
        this.context.session.startTime = new Date().toISOString();
        
        // Try to load persisted context from localStorage
        this.loadPersistedContext();
        
        return this;
    },
    
    // Load any previously saved context from localStorage
    loadPersistedContext: function() {
        try {
            const savedContext = localStorage.getItem('nailaide_user_context');
            if (savedContext) {
                const parsedContext = JSON.parse(savedContext);
                // Only restore user preferences, not the entire conversation
                if (parsedContext && parsedContext.user) {
                    this.context.user = parsedContext.user;
                    // Increment visit count
                    this.context.user.visitCount++;
                    console.log(`Loaded persisted context for user: ${this.context.user.name || 'anonymous'}`);
                    console.log(`Visit count: ${this.context.user.visitCount}`);
                }
            }
        } catch (error) {
            console.error('Error loading persisted context:', error);
        }
    },
    
    // Save current user context to localStorage
    persistContext: function() {
        try {
            // Only persist user information, not the entire conversation
            const contextToSave = {
                user: this.context.user,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('nailaide_user_context', JSON.stringify(contextToSave));
        } catch (error) {
            console.error('Error persisting context:', error);
        }
    },
    
    // Process incoming message and update context
    processIncomingMessage: function(message, analysis = null) {
        // Increment message count
        this.context.session.messageCount++;
        
        // Add to history
        this.addToHistory('user', message);
        
        // Extract user name if present
        this.extractUserName(message);
        
        // Update context with analysis if provided
        if (analysis) {
            this.updateFromAnalysis(analysis);
        }
        
        // Return current context state
        return this.getCurrentState();
    },
    
    // Update context based on response being sent
    processOutgoingResponse: function(response, responseMetadata = {}) {
        // Add to history
        this.addToHistory('assistant', response);
        
        // Update session info
        this.context.session.lastResponseTime = new Date().toISOString();
        
        // Save context periodically
        if (this.context.session.messageCount % 5 === 0) {
            this.persistContext();
        }
    },
    
    // Add a message to conversation history
    addToHistory: function(role, message) {
        const entry = {
            role: role,
            content: message,
            timestamp: new Date().toISOString()
        };
        
        this.context.conversation.history.push(entry);
        
        // Keep history to a reasonable size
        if (this.context.conversation.history.length > 20) {
            this.context.conversation.history.shift();
        }
    },
    
    // Extract and save user name from message
    extractUserName: function(message) {
        if (!this.context.user.name) {
            // Pattern matching for name introduction
            const patterns = [
                /my name is ([A-Za-z]+)/i,
                /I(?:'|')?m ([A-Za-z]+)/i,
                /([A-Za-z]+) here/i,
                /this is ([A-Za-z]+)/i,
                /call me ([A-Za-z]+)/i
            ];
            
            for (const pattern of patterns) {
                const match = message.match(pattern);
                if (match && match[1]) {
                    const name = match[1];
                    // Set name if it looks valid (not too short, not a common word)
                    if (name.length >= 2 && !this.isCommonWord(name)) {
                        this.context.user.name = name;
                        console.log(`Extracted user name: ${name}`);
                        break;
                    }
                }
            }
        }
    },
    
    // Check if a word is too common to be a name
    isCommonWord: function(word) {
        const commonWords = ['hi', 'hey', 'just', 'here', 'now', 'yes', 'no', 'maybe', 'sure', 'ok', 'okay'];
        return commonWords.includes(word.toLowerCase());
    },
    
    // Update context from message analysis
    updateFromAnalysis: function(analysis) {
        // Track intent/topics
        if (analysis.intent) {
            this.context.session.activeTopics.add(analysis.intent);
            
            // Track last topics (keep most recent 3)
            this.context.conversation.lastTopics.unshift(analysis.intent);
            if (this.context.conversation.lastTopics.length > 3) {
                this.context.conversation.lastTopics.pop();
            }
        }
        
        // Track entities
        if (analysis.entities) {
            Object.entries(analysis.entities).forEach(([type, entities]) => {
                if (!this.context.conversation.lastMentionedEntities[type]) {
                    this.context.conversation.lastMentionedEntities[type] = [];
                }
                
                // Add unique entities
                entities.forEach(entity => {
                    if (!this.context.conversation.lastMentionedEntities[type].includes(entity)) {
                        this.context.conversation.lastMentionedEntities[type].push(entity);
                    }
                });
            });
        }
        
        // Track sentiment
        if (analysis.sentiment) {
            this.context.conversation.sentimentHistory.push(analysis.sentiment);
            // Keep sentiment history to a reasonable size
            if (this.context.conversation.sentimentHistory.length > 10) {
                this.context.conversation.sentimentHistory.shift();
            }
        }
        
        // Track if question was asked but not answered
        if (analysis.questionType && !analysis.answeredQuestion) {
            this.context.conversation.unansweredQuestions.push({
                question: analysis.originalMessage,
                timestamp: new Date().toISOString(),
                type: analysis.questionType
            });
        }
    },
    
    // Get current conversational context state for response generation
    getCurrentState: function() {
        return {
            // User greeting info
            userGreeting: this.generateGreeting(),
            
            // Recency and relevance indicators
            isReturningUser: this.context.user.visitCount > 1,
            timeSinceLastMessage: this.getTimeSinceLastMessage(),
            
            // Topic continuity information
            activeTopics: Array.from(this.context.session.activeTopics),
            lastMentionedEntities: this.context.conversation.lastMentionedEntities,
            lastTopics: this.context.conversation.lastTopics,
            currentSentiment: this.getCurrentSentiment(),
            
            // Overall context
            userName: this.context.user.name,
            hasUserName: !!this.context.user.name,
            conversationDepth: this.context.session.messageCount,
            overallSentiment: this.getOverallSentiment(),
            hasUnansweredQuestions: this.context.conversation.unansweredQuestions.length > 0,
            unansweredQuestion: this.context.conversation.unansweredQuestions[this.context.conversation.unansweredQuestions.length - 1]
        };
    },
    
    // Generate appropriate greeting based on context
    generateGreeting: function() {
        const hour = new Date().getHours();
        let timeGreeting = '';
        
        if (hour < 12) {
            timeGreeting = "Good morning";
        } else if (hour < 18) {
            timeGreeting = "Good afternoon";
        } else {
            timeGreeting = "Good evening";
        }
        
        if (this.context.user.name) {
            return `${timeGreeting}, ${this.context.user.name}`;
        }
        
        return timeGreeting;
    },
    
    // Get time elapsed since last message
    getTimeSinceLastMessage: function() {
        if (!this.context.session.lastResponseTime) return null;
        
        const lastResponseTime = new Date(this.context.session.lastResponseTime);
        const now = new Date();
        const elapsedMs = now - lastResponseTime;
        return elapsedMs;
    },
    
    // Get most recent sentiment
    getCurrentSentiment: function() {
        if (this.context.conversation.sentimentHistory.length > 0) {
            return this.context.conversation.sentimentHistory[this.context.conversation.sentimentHistory.length - 1];
        }
        return 'neutral';
    },
    
    // Calculate overall sentiment trend
    getOverallSentiment: function() {
        if (this.context.conversation.sentimentHistory.length === 0) {
            return 'neutral';
        }
        
        const counts = {
            positive: 0,
            negative: 0,
            neutral: 0
        };
        
        this.context.conversation.sentimentHistory.forEach(sentiment => {
            counts[sentiment]++;
        });
        
        if (counts.positive > counts.negative && counts.positive > counts.neutral) {
            return 'positive';
        } else if (counts.negative > counts.positive && counts.negative > counts.neutral) {
            return 'negative';
        } else {
            return 'neutral';
        }
    },
    
    // Save user preference
    setUserPreference: function(category, value) {
        if (!this.context.user.preferences) {
            this.context.user.preferences = {};
        }
        
        this.context.user.preferences[category] = value;
        console.log(`Set user preference: ${category} = ${value}`);
        
        // Save updated preferences
        this.persistContext();
    },
    
    // Get previously saved user preference
    getUserPreference: function(category, defaultValue = null) {
        if (this.context.user.preferences && this.context.user.preferences[category] !== undefined) {
            return this.context.user.preferences[category];
        }
        return defaultValue;
    }
};

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        ConversationContext.init();
    }, 1200);
});

// Make available globally
window.ConversationContext = ConversationContext;
