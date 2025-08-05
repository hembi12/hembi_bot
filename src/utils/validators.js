// src/utils/validators.js
const { REQUIRED_ENV_VARS } = require('../config/constants');

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
    const missing = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
    
    return {
      isValid: missing.length === 0,
      missing,
      configured: REQUIRED_ENV_VARS.filter(varName => !!process.env[varName])
    };
  }

  static sanitizeMessage(text) {
    return text?.toLowerCase().trim() || '';
  }

  static validatePhoneNumber(phoneNumber) {
    // Validar formato de número de teléfono básico
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber?.replace(/\s/g, ''));
  }

  static validatePhoneNumberId(phoneNumberId) {
    // Validar que el Phone Number ID sea numérico
    return /^\d+$/.test(phoneNumberId);
  }

  static getEnvironmentInfo() {
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      phoneNumberId: process.env.PHONE_NUMBER_ID,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      hasVerifyToken: !!process.env.VERIFY_TOKEN,
      hasWhatsAppToken: !!process.env.WHATSAPP_TOKEN,
      platform: process.platform,
      nodeVersion: process.version
    };
  }
}

module.exports = Validators;