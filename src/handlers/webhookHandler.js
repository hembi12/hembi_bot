// src/handlers/webhookHandler.js
const Logger = require('../utils/logger');
const Validators = require('../utils/validators');
const MessageHandler = require('./messageHandler');
const { HTTP_STATUS } = require('../config/constants');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/messages');

class WebhookHandler {
  constructor() {
    this.messageHandler = new MessageHandler();
    this.requestCount = 0;
    this.startTime = Date.now();
  }

  /**
   * Maneja las peticiones GET para verificación del webhook
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async handleGet(req, res) {
    const { query } = req;
    const verifyToken = process.env.VERIFY_TOKEN;
    
    this.requestCount++;
    Logger.webhook('Solicitud de verificación recibida');
    Logger.webhook(`Request #${this.requestCount}`);
    
    const validation = Validators.validateWebhookVerification(query, verifyToken);
    
    Logger.webhook('Estado de verificación:', {
      mode: validation.mode,
      hasToken: validation.hasToken,
      hasChallenge: validation.hasChallenge,
      tokenConfigured: validation.tokenConfigured
    });
    
    if (validation.isValid) {
      Logger.success(SUCCESS_MESSAGES.WEBHOOK_VERIFIED);
      Logger.webhook(`Challenge respondido: ${query['hub.challenge']}`);
      
      return res.status(HTTP_STATUS.OK).send(query['hub.challenge']);
    } else {
      Logger.error(ERROR_MESSAGES.INVALID_TOKEN);
      Logger.webhook('Detalles de verificación fallida:', {
        expectedMode: 'subscribe',
        receivedMode: validation.mode,
        tokenMatch: validation.hasToken && verifyToken ? 'Token presente pero no coincide' : 'Token ausente'
      });
      
      return res.status(HTTP_STATUS.FORBIDDEN).json({ 
        error: ERROR_MESSAGES.INVALID_TOKEN,
        details: 'Verificación de webhook fallida'
      });
    }
  }

  /**
   * Maneja las peticiones POST con datos del webhook
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async handlePost(req, res) {
    const { body } = req;
    
    this.requestCount++;
    Logger.webhook('POST recibido');
    Logger.webhook(`Request #${this.requestCount}`);
    Logger.webhook('Payload recibido:', JSON.stringify(body, null, 2));
    
    try {
      // Validar que es un webhook de WhatsApp Business
      if (!Validators.isValidWhatsAppWebhook(body)) {
        Logger.warning('Objeto no reconocido:', body?.object);
        
        // Respondemos OK para evitar que Meta reintente
        return res.status(HTTP_STATUS.OK).json({ 
          message: 'Objeto no es whatsapp_business_account, pero OK',
          received_object: body?.object || 'undefined'
        });
      }

      Logger.success('Objeto WhatsApp Business Account confirmado');
      
      // Procesar las entradas del webhook
      const processResult = await this._processWebhookEntries(body.entry || []);
      
      // Responder rápidamente a Meta (< 20 segundos)
      const response = {
        success: true,
        message: SUCCESS_MESSAGES.WEBHOOK_PROCESSED,
        timestamp: new Date().toISOString(),
        processed: processResult
      };
      
      Logger.success('Webhook procesado exitosamente', processResult);
      return res.status(HTTP_STATUS.OK).json(response);
      
    } catch (error) {
      Logger.error(ERROR_MESSAGES.WEBHOOK_ERROR, {
        message: error.message,
        stack: error.stack,
        body: JSON.stringify(body, null, 2)
      });
      
      // Responder con error pero mantener conexión
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
        error: 'Error interno del servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Procesa las entradas del webhook de WhatsApp
   * @param {Array} entries - Array de entradas del webhook
   * @returns {Object} - Resumen del procesamiento
   */
  async _processWebhookEntries(entries) {
    if (!entries || entries.length === 0) {
      Logger.warning('No hay entradas para procesar');
      return {
        entriesProcessed: 0,
        messagesProcessed: 0,
        statusesProcessed: 0,
        errors: 0
      };
    }

    let totalMessages = 0;
    let totalStatuses = 0;
    let totalErrors = 0;

    Logger.webhook(`Procesando ${entries.length} entrada(s)`);

    for (const entry of entries) {
      try {
        Logger.webhook(`Procesando entry ID: ${entry.id}`);
        
        if (!entry.changes || entry.changes.length === 0) {
          Logger.warning(`Entry ${entry.id} no tiene cambios`);
          continue;
        }

        // Procesar cada cambio en la entrada
        for (const change of entry.changes) {
          const { field, value } = change;
          
          Logger.webhook(`Procesando cambio - Campo: ${field}`);
          
          try {
            const changeResult = await this._processWebhookChange(field, value);
            totalMessages += changeResult.messages;
            totalStatuses += changeResult.statuses;
            
          } catch (changeError) {
            Logger.error(`Error procesando cambio en campo ${field}:`, changeError.message);
            totalErrors++;
          }
        }
        
      } catch (entryError) {
        Logger.error(`Error procesando entry ${entry.id}:`, entryError.message);
        totalErrors++;
      }
    }

    return {
      entriesProcessed: entries.length,
      messagesProcessed: totalMessages,
      statusesProcessed: totalStatuses,
      errors: totalErrors
    };
  }

  /**
   * Procesa un cambio específico del webhook
   * @param {string} field - Campo que cambió
   * @param {Object} value - Datos del cambio
   * @returns {Object} - Contadores de procesamiento
   */
  async _processWebhookChange(field, value) {
    let messagesProcessed = 0;
    let statusesProcessed = 0;

    switch (field) {
      case 'messages':
        if (Validators.hasMessages(value)) {
          Logger.webhook(`Procesando ${value.messages.length} mensajes`);
          await this.messageHandler.processMessages(value.messages, value);
          messagesProcessed = value.messages.length;
        }
        break;

      case 'message_status':
        if (value.statuses && value.statuses.length > 0) {
          Logger.webhook(`Procesando ${value.statuses.length} estados de mensaje`);
          await this.messageHandler.processMessageStatuses(value.statuses);
          statusesProcessed = value.statuses.length;
        }
        break;

      default:
        Logger.webhook(`Campo no manejado específicamente: ${field}`);
        
        // Intentar procesar mensajes en cualquier campo
        if (Validators.hasMessages(value)) {
          await this.messageHandler.processMessages(value.messages, value);
          messagesProcessed = value.messages.length;
        }
        
        // Intentar procesar estados en cualquier campo
        if (value.statuses && value.statuses.length > 0) {
          await this.messageHandler.processMessageStatuses(value.statuses);
          statusesProcessed = value.statuses.length;
        }
        break;
    }

    return {
      messages: messagesProcessed,
      statuses: statusesProcessed
    };
  }

  /**
   * Obtiene estadísticas del webhook
   * @returns {Object} - Estadísticas del handler
   */
  getStats() {
    const uptime = Date.now() - this.startTime;
    
    return {
      requestCount: this.requestCount,
      uptimeMs: uptime,
      uptimeHours: Math.round(uptime / (1000 * 60 * 60) * 100) / 100,
      averageRequestsPerHour: Math.round((this.requestCount / (uptime / (1000 * 60 * 60))) * 100) / 100,
      startTime: new Date(this.startTime).toISOString()
    };
  }

  /**
   * Valida la integridad del payload del webhook
   * @param {Object} body - Payload del webhook
   * @returns {Object} - Resultado de validación
   */
  validateWebhookPayload(body) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validar estructura básica
    if (!body) {
      validation.isValid = false;
      validation.errors.push('Body del webhook vacío');
      return validation;
    }

    if (!body.object) {
      validation.isValid = false;
      validation.errors.push('Campo "object" faltante');
    }

    if (!body.entry || !Array.isArray(body.entry)) {
      validation.warnings.push('Campo "entry" faltante o no es array');
    }

    // Validar entradas
    if (body.entry && body.entry.length > 0) {
      body.entry.forEach((entry, index) => {
        if (!entry.id) {
          validation.warnings.push(`Entry ${index} sin ID`);
        }
        
        if (!entry.changes || !Array.isArray(entry.changes)) {
          validation.warnings.push(`Entry ${index} sin cambios`);
        }
      });
    }

    return validation;
  }

  /**
   * Maneja peticiones de health check
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async handleHealthCheck(req, res) {
    const stats = this.getStats();
    const envValidation = Validators.validateEnvironmentVars();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Hembi WhatsApp Bot',
      version: '1.0.0',
      environment: {
        node_version: process.version,
        platform: process.platform,
        memory_usage: process.memoryUsage(),
        env_vars_valid: envValidation.isValid,
        missing_env_vars: envValidation.missing
      },
      stats
    };

    Logger.info('Health check solicitado', stats);
    
    return res.status(HTTP_STATUS.OK).json(health);
  }
}

module.exports = WebhookHandler;