// src/services/botService.js
const Logger = require('../utils/logger');
const Validators = require('../utils/validators');
const { INTENT_KEYWORDS } = require('../config/constants');
const { PREDEFINED_MESSAGES } = require('../config/messages');

class BotService {
  detectIntent(messageText) {
    const sanitizedText = Validators.sanitizeMessage(messageText);
    
    Logger.bot(`Analizando mensaje: "${sanitizedText}"`);

    // Detectar intención basada en palabras clave
    if (this._containsKeywords(sanitizedText, INTENT_KEYWORDS.GREETING)) {
      Logger.bot('Saludo detectado');
      return 'saludo';
    }
    
    if (this._containsKeywords(sanitizedText, INTENT_KEYWORDS.HELP)) {
      Logger.bot('Solicitud de ayuda detectada');
      return 'ayuda';
    }
    
    if (this._containsKeywords(sanitizedText, INTENT_KEYWORDS.THANKS)) {
      Logger.bot('Agradecimiento detectado');
      return 'despedida';
    }
    
    if (this._containsKeywords(sanitizedText, INTENT_KEYWORDS.PRICES)) {
      Logger.bot('Consulta de precios detectada');
      return 'precios';
    }
    
    if (this._containsKeywords(sanitizedText, INTENT_KEYWORDS.SCHEDULE)) {
      Logger.bot('Consulta de horarios detectada');
      return 'horarios';
    }

    Logger.bot('Mensaje general - respuesta por defecto');
    return 'default';
  }

  getResponseMessage(intentType) {
    return PREDEFINED_MESSAGES[intentType] || PREDEFINED_MESSAGES.default;
  }

  _containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }
}

module.exports = BotService;