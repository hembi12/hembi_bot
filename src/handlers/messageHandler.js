// src/handlers/messageHandler.js
const Logger = require('../utils/logger');
const Validators = require('../utils/validators');
const WhatsAppService = require('../services/whatsappService');
const BotService = require('../services/botService');

class MessageHandler {
  constructor() {
    this.whatsappService = new WhatsAppService();
    this.botService = new BotService();
  }

  async handleIncomingMessage(message, value) {
    const { from, text, type, id } = message;
    const phoneNumberId = value.metadata?.phone_number_id;
    
    Logger.message('Procesando mensaje entrante');
    Logger.message(`De: ${from}`);
    Logger.message(`Tipo: ${type}`);
    Logger.message(`Contenido: ${text?.body || 'Sin texto'}`);
    Logger.message(`Phone Number ID: ${phoneNumberId}`);
    
    // Solo procesar mensajes de texto
    if (!Validators.isTextMessage(message) || !phoneNumberId) {
      Logger.warning(`Mensaje de tipo ${type} (sin texto) - no se procesa automáticamente`);
      return;
    }

    try {
      // Detectar intención del usuario
      const intent = this.botService.detectIntent(text.body);
      
      // Obtener respuesta apropiada
      const responseMessage = this.botService.getResponseMessage(intent);
      
      // Enviar respuesta
      await this.whatsappService.sendTextMessage(from, responseMessage, phoneNumberId);
      
      Logger.success(`Respuesta enviada - Tipo: ${intent}`);
      
    } catch (error) {
      Logger.error('Error procesando mensaje', error.message);
      throw error;
    }
  }

  async processMessages(messages, value) {
    if (!Validators.hasMessages(value)) {
      return;
    }

    Logger.message(`${messages.length} mensaje(s) encontrado(s)`);
    
    for (const message of messages) {
      Logger.message('Datos del mensaje:', {
        id: message.id,
        from: message.from,
        timestamp: new Date(message.timestamp * 1000).toISOString(),
        type: message.type,
        text: message.text?.body || 'Sin texto'
      });
      
      await this.handleIncomingMessage(message, value);
    }
  }
}

module.exports = MessageHandler;