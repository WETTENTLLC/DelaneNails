/**
 * Logger utility for the application
 */

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    // Add file logging option
    this.logToFile = process.env.LOG_TO_FILE === 'true';
    this.logFilePath = process.env.LOG_FILE_PATH || './logs/app.log';
    
    // Initialize file logging if enabled
    if (this.logToFile) {
      this._initFileLogging();
    }
  }

  /**
   * Check if the given log level should be logged
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Format the log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaString}`.trim();
  }

  /**
   * Initialize file logging
   * @private
   */
  _initFileLogging() {
    const fs = require('fs');
    const path = require('path');
    
    // Create logs directory if it doesn't exist
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  /**
   * Write log to file
   * @private
   */
  _writeToFile(formattedMessage) {
    if (!this.logToFile) return;
    
    const fs = require('fs');
    fs.appendFileSync(this.logFilePath, formattedMessage + '\n');
  }
  
  /**
   * Clear log files
   */
  clearLogs() {
    if (this.logToFile) {
      const fs = require('fs');
      fs.writeFileSync(this.logFilePath, '');
      this.info('Log file cleared');
    }
  }
  
  /**
   * Set log level dynamically
   */
  setLogLevel(level) {
    if (this.levels[level] !== undefined) {
      this.logLevel = level;
      this.info(`Log level set to: ${level}`);
      return true;
    }
    return false;
  }

  /**
   * Log an error message
   */
  error(message, meta = {}) {
    if (this.shouldLog('error')) {
      const formattedMessage = this.formatMessage('error', message, meta);
      console.error(formattedMessage);
      this._writeToFile(formattedMessage);
    }
  }

  /**
   * Log a warning message
   */
  warn(message, meta = {}) {
    if (this.shouldLog('warn')) {
      const formattedMessage = this.formatMessage('warn', message, meta);
      console.warn(formattedMessage);
      this._writeToFile(formattedMessage);
    }
  }

  /**
   * Log an info message
   */
  info(message, meta = {}) {
    if (this.shouldLog('info')) {
      const formattedMessage = this.formatMessage('info', message, meta);
      console.info(formattedMessage);
      this._writeToFile(formattedMessage);
    }
  }

  /**
   * Log a debug message
   */
  debug(message, meta = {}) {
    if (this.shouldLog('debug')) {
      const formattedMessage = this.formatMessage('debug', message, meta);
      console.debug(formattedMessage);
      this._writeToFile(formattedMessage);
    }
  }
}

module.exports = new Logger();
