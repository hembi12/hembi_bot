// api/webhook.js - Endpoint principal con dotenv
// Cargar variables de entorno PRIMERO
require('dotenv').config();

const WebhookHandler = require('../src/handlers/webhookHandler');
const Logger = require('../src/utils/logger');
const Validators = require('../src/utils/validators');
const { HTTP_STATUS } = require('../src/config/constants');

// Validar variables de entorno al iniciar
const envValidation = Validators.validateEnvironmentVars();
if (envValidation.isValid) {
  Logger.success(`Variables de entorno configuradas: ${envValidation.configured.length}/${envValidation.configured.length + envValidation.missing.length}`);
  Logger.info('Variables configuradas:', envValidation.configured);
} else {
  Logger.error('Variables de entorno faltantes:', envValidation.missing);
  Logger.warning('El bot funcionará parcialmente pero no podrá enviar mensajes');
}

// Mostrar información del entorno
const envInfo = Validators.getEnvironmentInfo();
Logger.info('Información del entorno:', {
  nodeEnv: envInfo.nodeEnv,
  nodeVersion: envInfo.nodeVersion,
  platform: envInfo.platform,
  hasTokens: envInfo.hasVerifyToken && envInfo.hasWhatsAppToken
});

const webhookHandler = new WebhookHandler();

module.exports = async (req, res) => {
  const { method } = req;
  
  Logger.info(`${method} request recibido en /webhook`);
  
  try {
    switch (method) {
      case 'GET':
        return await webhookHandler.handleGet(req, res);
        
      case 'POST':
        return await webhookHandler.handlePost(req, res);
        
      default:
        Logger.warning(`Método no permitido: ${method}`);
        return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ 
          error: 'Método no permitido',
          allowed: ['GET', 'POST'],
          received: method 
        });
    }
  } catch (error) {
    Logger.error('Error no manejado en webhook:', error);
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};