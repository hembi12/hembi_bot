// src/utils/logger.js
class Logger {
    static info(message, data = null) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ℹ️  ${message}`, data ? data : '');
    }
  
    static success(message, data = null) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ✅ ${message}`, data ? data : '');
    }
  
    static error(message, error = null) {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] ❌ ${message}`, error ? error : '');
    }
  
    static warning(message, data = null) {
      const timestamp = new Date().toISOString();
      console.warn(`[${timestamp}] ⚠️  ${message}`, data ? data : '');
    }
  
    static webhook(message, data = null) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 📋 WEBHOOK: ${message}`, data ? data : '');
    }
  
    static message(message, data = null) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 💬 MESSAGE: ${message}`, data ? data : '');
    }
  
    static bot(message, data = null) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🤖 BOT: ${message}`, data ? data : '');
    }
  
    static api(message, data = null) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 📤 API: ${message}`, data ? data : '');
    }
  }
  
  module.exports = Logger;