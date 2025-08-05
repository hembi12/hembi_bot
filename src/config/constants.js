// src/config/constants.js
const WHATSAPP_API = {
    BASE_URL: 'https://graph.facebook.com/v18.0',
    MESSAGING_PRODUCT: 'whatsapp'
  };
  
  const HTTP_STATUS = {
    OK: 200,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    INTERNAL_ERROR: 500
  };
  
  const MESSAGE_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    AUDIO: 'audio',
    VIDEO: 'video',
    DOCUMENT: 'document'
  };
  
  const INTENT_KEYWORDS = {
    GREETING: ['hola', 'buenos', 'buenas', 'hi', 'hello'],
    HELP: ['ayuda', 'help', 'menu'],
    THANKS: ['gracias', 'thank', 'thanks'],
    PRICES: ['precio', 'costo', 'cuanto', 'tarifa'],
    SCHEDULE: ['horario', 'hora', 'cuando', 'schedule']
  };
  
  const BOT_CONFIG = {
    NAME: 'Hembi',
    TIMEZONE: 'México (GMT-6)',
    BUSINESS_HOURS: {
      WEEKDAYS: '9:00 AM - 6:00 PM',
      SATURDAY: '9:00 AM - 2:00 PM',
      SUNDAY: 'Cerrado'
    }
  };
  
  module.exports = {
    WHATSAPP_API,
    HTTP_STATUS,
    MESSAGE_TYPES,
    INTENT_KEYWORDS,
    BOT_CONFIG
  };