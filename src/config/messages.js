// src/config/messages.js
const { BOT_CONFIG } = require('./constants');

const PREDEFINED_MESSAGES = {
  saludo: `¡Hola! 👋 Gracias por contactar a *${BOT_CONFIG.NAME}*. ¿En qué puedo ayudarte hoy?\n\nPuedes escribir *"ayuda"* para ver nuestros servicios.`,
  
  ayuda: `🤖 *Menú de ${BOT_CONFIG.NAME} Bot*\n\n` +
         `Puedo ayudarte con:\n` +
         `• *Precios* - Consultar tarifas\n` +
         `• *Horarios* - Ver horarios de atención\n` +
         `• *Servicios* - Información de servicios\n\n` +
         `Solo escribe la palabra clave que te interese.`,
  
  precios: '💰 *Nuestros Precios*\n\n' +
           'Para obtener información detallada sobre precios, por favor contáctanos directamente.\n\n' +
           '📞 Tel: [Tu teléfono]\n' +
           '📧 Email: [Tu email]',
  
  horarios: '🕐 *Horarios de Atención*\n\n' +
            `📅 Lunes a Viernes: ${BOT_CONFIG.BUSINESS_HOURS.WEEKDAYS}\n` +
            `📅 Sábados: ${BOT_CONFIG.BUSINESS_HOURS.SATURDAY}\n` +
            `📅 Domingos: ${BOT_CONFIG.BUSINESS_HOURS.SUNDAY}\n\n` +
            `Zona horaria: ${BOT_CONFIG.TIMEZONE}`,
  
  despedida: '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?\n\nSi necesitas hablar con un humano, estaremos disponibles en nuestros horarios de atención.',
  
  default: 'Gracias por tu mensaje. 📝\n\n' +
           'Te he transferido a nuestro equipo humano que te responderá pronto.\n\n' +
           'Mientras tanto, puedes escribir *"ayuda"* para ver nuestros servicios automáticos.'
};

const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Token inválido',
  MISSING_PHONE_ID: 'Phone Number ID no disponible',
  MISSING_ACCESS_TOKEN: 'WHATSAPP_TOKEN no configurado',
  WEBHOOK_ERROR: 'Error procesando webhook',
  SEND_MESSAGE_ERROR: 'Error enviando mensaje',
  INVALID_ACCESS_TOKEN: 'Token de acceso inválido o expirado',
  INVALID_MESSAGE_FORMAT: 'Error en el formato del mensaje o número inválido'
};

const SUCCESS_MESSAGES = {
  WEBHOOK_VERIFIED: 'Webhook verificado exitosamente',
  WEBHOOK_PROCESSED: 'Webhook procesado correctamente',
  MESSAGE_SENT: 'Mensaje enviado exitosamente'
};

module.exports = {
  PREDEFINED_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};