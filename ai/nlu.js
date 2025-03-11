/**
 * Natural Language Understanding module
 * Processes user input to extract meaning
 */
const natural = require('natural');
const { stopwords } = require('./utils/stopwords');

// Initialize tokenizer
const tokenizer = new natural.WordTokenizer();

// Initialize stemmer
const stemmer = natural.PorterStemmer;

class NLU {
  /**
   * Process the user input
   * @param {string} input - User message
   * @returns {object} Processed input data
   */
  processInput(input) {
    if (!input || typeof input !== 'string') {
      return { 
        original: '',
        tokens: [],
        stems: [],
        normalized: ''
      };
    }
    
    // Convert to lowercase
    const lowercased = input.toLowerCase();
    
    // Tokenize the input
    const tokens = tokenizer.tokenize(lowercased);
    
    // Remove stopwords
    const filteredTokens = tokens.filter(token => !stopwords.includes(token));
    
    // Stem the filtered tokens
    const stems = filteredTokens.map(token => stemmer.stem(token));
    
    // Create normalized text
    const normalized = filteredTokens.join(' ');
    
    return {
      original: input,
      tokens: tokens,
      stems: stems,
      normalized: normalized
    };
  }
  
  /**
   * Extract dates from text
   * @param {string} text - Text to extract dates from
   * @returns {Array} Extracted dates
   */
  extractDates(text) {
    const dateRegexes = [
      // MM/DD/YYYY or MM-DD-YYYY
      /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](20\d{2}|\d{2})\b/g,
      // Month name formats
      /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(20\d{2}|\d{2})?\b/gi,
      // Today, tomorrow, etc.
      /\b(?:today|tomorrow|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi,
    ];
    
    let matches = [];
    
    dateRegexes.forEach(regex => {
      const found = text.match(regex);
      if (found) matches = matches.concat(found);
    });
    
    return matches;
  }
  
  /**
   * Extract time from text
   * @param {string} text - Text to extract time from
   * @returns {Array} Extracted times
   */
  extractTimes(text) {
    const timeRegexes = [
      // HH:MM format (12 or 24 hour)
      /\b([01]?[0-9]|2[0-3]):([0-5][0-9])\s*(am|pm)?\b/gi,
      // X o'clock, X AM/PM
      /\b(?:[0-9]|1[0-2])\s*(?:o'clock|am|pm)\b/gi,
      // noon, midnight
      /\b(?:noon|midnight)\b/gi
    ];
    
    let matches = [];
    
    timeRegexes.forEach(regex => {
      const found = text.match(regex);
      if (found) matches = matches.concat(found);
    });
    
    return matches;
  }
}

module.exports = new NLU();
