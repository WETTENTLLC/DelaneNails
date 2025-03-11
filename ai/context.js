/**
 * Context Management for NailAide
 * Manages user conversation context
 */

// Simple in-memory context store
// In production, this should be replaced with a database
const contextStore = new Map();

// Maximum context age in milliseconds (30 minutes)
const MAX_CONTEXT_AGE = 30 * 60 * 1000;

class ContextManager {
  /**
   * Get user context
   * @param {string} userId - User identifier
   * @returns {object|null} User context or null if not found
   */
  getContext(userId) {
    if (!userId) return null;
    
    const userContext = contextStore.get(userId);
    
    if (!userContext) return null;
    
    // Check if context is expired
    const now = Date.now();
    if (now - userContext.lastUpdated > MAX_CONTEXT_AGE) {
      // Context expired, remove it and return null
      contextStore.delete(userId);
      return null;
    }
    
    return userContext;
  }
  
  /**
   * Update user context
   * @param {string} userId - User identifier
   * @param {object} contextData - Context data to update
   * @returns {object} Updated context
   */
  updateContext(userId, contextData) {
    if (!userId) {
      throw new Error('User ID is required to update context');
    }
    
    const currentContext = this.getContext(userId) || {};
    const updatedContext = {
      ...currentContext,
      ...contextData,
      lastUpdated: Date.now()
    };
    
    contextStore.set(userId, updatedContext);
    
    return updatedContext;
  }
  
  /**
   * Clear user context
   * @param {string} userId - User identifier
   * @returns {boolean} True if context was cleared
   */
  clearContext(userId) {
    if (!userId) return false;
    
    return contextStore.delete(userId);
  }
  
  /**
   * Clean up expired contexts
   */
  cleanupExpiredContexts() {
    const now = Date.now();
    
    for (const [userId, context] of contextStore.entries()) {
      if (now - context.lastUpdated > MAX_CONTEXT_AGE) {
        contextStore.delete(userId);
      }
    }
  }
  
  /**
   * Get context store statistics
   * @returns {object} Statistics about the context store
   */
  getStats() {
    return {
      totalContexts: contextStore.size,
      oldestContext: [...contextStore.values()]
        .reduce((oldest, context) => 
          context.lastUpdated < oldest ? context.lastUpdated : oldest, 
          Date.now()
        )
    };
  }
}

// Start periodic cleanup
setInterval(() => {
  module.exports.cleanupExpiredContexts();
}, 5 * 60 * 1000); // Clean up every 5 minutes

module.exports = new ContextManager();
