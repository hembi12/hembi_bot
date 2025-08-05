// src/utils/validators.js
class Validators {
    static isValidWhatsAppWebhook(body) {
      return body?.object === 'whatsapp_business_account';
    }
  
    static hasMessages(value) {
      return value?.messages && value.messages.length > 0;
    }
  
    static isTextMessage(message) {
      return message?.text?.body && message.type === 'text';
    }
  
    static validateWebhookVerification(query, verifyToken) {
      const { 'hub.mode': mode, 'hub.verify_token': hubToken, 'hub.challenge': challenge } = query;
      
      return {
        isValid: mode === 'subscribe' && hubToken === verifyToken,
        mode,
        hasToken: !!hubToken,
        hasChallenge: !!challenge,
        tokenConfigured: !!verifyToken
      };
    }
  
    static validateEnvironmentVars() {
      const requiredVars = ['VERIFY_TOKEN', 'WHATSAPP_TOKEN'];
      const missing = requiredVars.filter(varName => !process.env[varName]);
      
      return {
        isValid: missing.length === 0,
        missing
      };
    }
  
    static sanitizeMessage(text) {
      return text?.toLowerCase().trim() || '';
    }
  }
  
  module.exports = Validators;