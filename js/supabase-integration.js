/**
 * Supabase Integration for DelaneNails
 * Handles database connections and content retrieval
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class SupabaseManager {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseKey = process.env.SUPABASE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn('Supabase URL or key not found in environment. Some features will be limited.');
      this.isConnected = false;
      return;
    }
    
    try {
      this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
      this.isConnected = true;
      console.log('Supabase client initialized');
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error.message);
      this.isConnected = false;
    }
  }
  
  async getWebsiteContent() {
    if (!this.isConnected) {
      console.log('Supabase not connected. Using static content.');
      return require('./ai-data/website-content');
    }
    
    try {
      // For now, just return the static content
      // This will be expanded later to fetch from Supabase
      return require('./ai-data/website-content');
    } catch (error) {
      console.error('Error fetching website content:', error.message);
      return require('./ai-data/website-content');
    }
  }
  
  async logAIInteraction(question, answer, context) {
    if (!this.isConnected) return;
    
    try {
      // Log interaction to Supabase
      await this.supabase
        .from('ai_interactions')
        .insert({
          question,
          answer,
          context: JSON.stringify(context),
          created_at: new Date().toISOString()
        });
      
      console.log('AI interaction logged');
    } catch (error) {
      console.warn('Failed to log AI interaction:', error.message);
    }
  }
  
  async logAIError(question, error) {
    if (!this.isConnected) return;
    
    try {
      await this.supabase
        .from('ai_errors')
        .insert({
          question,
          error_message: error.message,
          error_stack: error.stack,
          created_at: new Date().toISOString()
        });
      
      console.log('AI error logged');
    } catch (logError) {
      console.warn('Failed to log AI error:', logError.message);
    }
  }
  
  async saveTestResults(results) {
    if (!this.isConnected) return;
    
    try {
      await this.supabase
        .from('ai_test_results')
        .insert({
          timestamp: new Date().toISOString(),
          results: results
        });
      
      console.log('Test results saved to Supabase');
    } catch (error) {
      console.warn('Failed to save test results:', error.message);
    }
  }
}

// Singleton instance
let instance = null;

function getSupabaseManager() {
  if (!instance) {
    instance = new SupabaseManager();
  }
  return instance;
}

module.exports = { getSupabaseManager };
