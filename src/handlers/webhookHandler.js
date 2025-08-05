// src/handlers/webhookHandler.js
const Logger = require('../utils/logger');
const Validators = require('../utils/validators');
const MessageHandler = require('./messageHandler');
const { HTTP_STATUS } = require('../config/constants');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/messages');

class WebhookHandler {
  constructor() {
    this.messageHandler = new MessageHandler();
  }

  async handleGet(req, res) {
    const { query } = req;
    const verifyToken = process.env.VERIFY_TOKEN;
    
    Logger.webhook('Solicitud de verificación recibida');
    
    const validation = Validators.validateWebhookVerification(query, verifyToken);
    
    Logger.webhook('Estado de verificación:', {
      mode: validation.mode,
      hasToken: validation.hasToken,
      hasChallenge: validation.hasChallenge,
      tokenConfigured: validation.tokenConfigured
    });
    
    if (validation.isValid) {
      Logger.success(SUCCESS_MESSAGES.WEBHOOK_VERIFIED);
      return res.status(HTTP_STATUS.OK).send(query['hub.challenge']);
    } else {
      Logger.error(ERROR_MESSAGES.INVALID_TOKEN);
      return res.status(HTTP_STATUS.FORBIDDEN).json({ 
        error: ERROR_MESSAGES.INVALID_TOKEN 
      });
    }
  }

  async handlePost(req, res) {
    const { body } = req;
    
    Logger.webhook('POST recibido');
    
    try {
      if (!Validators.isValidWhatsAppWebhook(body)) {
        Logger.warning('Objeto no reconocido:', body?.object);
        return res.status(HTTP_STATUS.OK).json({ 
          message: 'Objeto no es whatsapp_business_account, pero OK'
        });
      }

      Logger.success('Objeto WhatsApp Business Account confirmado');
      
      await this._processWebhookEntries(body.entry);
      
      return res.status(HTTP_STATUS.OK).json({ 
        success: true, 
        message: SUCCESS_MESSAGES.WEBHOOK_PROCESSED,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      Logger.error(ERROR_MESSAGES.WEBHOOK_ERROR, error.message);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  }

  async _processWebhookEntries(entries) {
    if (!entries || entries.length === 0) {
      return;
    }

    for (const entry of entries) {
      Logger.webhook(`Procesando entry: ${entry.id}`);
      
      if (entry.changes && entry.changes.length > 0) {
        for (const change of entry.changes) {
          const { field, value } = change;
          Logger.webhook(`Cambio - Campo: ${field}`);
          
          if (Validators.hasMessages(value)) {
            await this.messageHandler.processMessages(value.messages, value);
          }
        }
      }
    }
  }
}

module.exports = WebhookHandler;