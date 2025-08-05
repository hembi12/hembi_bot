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

  /**
   * Maneja un mensaje entrante individual
   * @param {Object} message - Objeto del mensaje de WhatsApp
   * @param {Object} value - Datos del webhook de WhatsApp
   */
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
      // Procesar mensaje considerando estado de conversación
      const responseMessage = this.botService.processMessage(text.body, from);
      
      // Enviar respuesta
      await this.whatsappService.sendTextMessage(from, responseMessage, phoneNumberId);
      
      Logger.success(`Respuesta enviada - Tipo: ${intent}`);
      
    } catch (error) {
      Logger.error('Error procesando mensaje', error.message);
      
      // En caso de error, intentar enviar mensaje de error al usuario
      try {
        const errorMessage = 'Disculpa, hubo un problema técnico. Un agente te contactará pronto.';
        await this.whatsappService.sendTextMessage(from, errorMessage, phoneNumberId);
      } catch (sendError) {
        Logger.error('No se pudo enviar mensaje de error', sendError.message);
      }
      
      throw error;
    }
  }

  /**
   * Procesa múltiples mensajes del webhook
   * @param {Array} messages - Array de mensajes de WhatsApp
   * @param {Object} value - Datos del webhook de WhatsApp
   */
  async processMessages(messages, value) {
    if (!Validators.hasMessages(value)) {
      Logger.warning('No hay mensajes para procesar');
      return;
    }

    Logger.message(`${messages.length} mensaje(s) encontrado(s)`);
    
    for (const message of messages) {
      try {
        Logger.message('Datos del mensaje:', {
          id: message.id,
          from: message.from,
          timestamp: new Date(message.timestamp * 1000).toISOString(),
          type: message.type,
          text: message.text?.body || 'Sin texto'
        });
        
        await this.handleIncomingMessage(message, value);
        
      } catch (error) {
        Logger.error(`Error procesando mensaje ${message.id}:`, error.message);
        // Continuar con el siguiente mensaje en caso de error
        continue;
      }
    }
  }

  /**
   * Maneja estados de mensajes (entregado, leído, etc.)
   * @param {Array} statuses - Array de estados de mensaje
   */
  async processMessageStatuses(statuses) {
    if (!statuses || statuses.length === 0) {
      return;
    }

    Logger.message(`${statuses.length} estado(s) de mensaje recibido(s)`);
    
    for (const status of statuses) {
      Logger.message('Estado del mensaje:', {
        id: status.id,
        status: status.status,
        timestamp: new Date(status.timestamp * 1000).toISOString(),
        recipient_id: status.recipient_id
      });
      
      // Aquí puedes agregar lógica para manejar diferentes estados
      // como 'sent', 'delivered', 'read', 'failed'
    }
  }

  /**
   * Verifica si un mensaje es un duplicado basado en su ID
   * @param {string} messageId - ID del mensaje
   * @returns {boolean} - True si es duplicado
   */
  isDuplicateMessage(messageId) {
    // Implementar cache simple en memoria (en producción usar Redis)
    if (!this.processedMessages) {
      this.processedMessages = new Set();
    }

    if (this.processedMessages.has(messageId)) {
      Logger.warning(`Mensaje duplicado detectado: ${messageId}`);
      return true;
    }

    this.processedMessages.add(messageId);
    
    // Limpiar cache periódicamente (mantener solo últimos 1000 mensajes)
    if (this.processedMessages.size > 1000) {
      const oldMessages = Array.from(this.processedMessages).slice(0, 500);
      oldMessages.forEach(id => this.processedMessages.delete(id));
    }

    return false;
  }

  /**
   * Maneja diferentes tipos de contenido multimedia
   * @param {Object} message - Mensaje con contenido multimedia
   * @param {Object} value - Datos del webhook
   */
  async handleMediaMessage(message, value) {
    const { from, type } = message;
    const phoneNumberId = value.metadata?.phone_number_id;

    Logger.message(`Mensaje multimedia recibido - Tipo: ${type}`);

    try {
      let responseMessage;
      
      switch (type) {
        case 'image':
          responseMessage = 'Gracias por la imagen. Un agente la revisará y te contactará pronto.';
          break;
        case 'audio':
          responseMessage = 'Gracias por el audio. Un agente lo escuchará y te contactará pronto.';
          break;
        case 'video':
          responseMessage = 'Gracias por el video. Un agente lo revisará y te contactará pronto.';
          break;
        case 'document':
          responseMessage = 'Gracias por el documento. Un agente lo revisará y te contactará pronto.';
          break;
        default:
          responseMessage = 'Gracias por tu mensaje. Un agente te contactará pronto.';
      }

      await this.whatsappService.sendTextMessage(from, responseMessage, phoneNumberId);
      Logger.success(`Respuesta automática enviada para mensaje tipo: ${type}`);

    } catch (error) {
      Logger.error(`Error manejando mensaje multimedia tipo ${type}:`, error.message);
      throw error;
    }
  }
}

module.exports = MessageHandler;