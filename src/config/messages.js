// src/config/messages.js - Purificadora San Juan
const { BOT_CONFIG } = require('./constants');

const PREDEFINED_MESSAGES = {
  saludo: `¡Hola! 👋 Soy *${BOT_CONFIG.NAME}* el asistente de *${BOT_CONFIG.COMPANY}*. ¿En qué te puedo ayudar?\n\n` +
          `🚚 *Hacer un pedido*\n` +
          `📍 *Rastrear mi pedido*\n` +
          `💰 *Consultar precios*\n` +
          `❓ *Información general*\n` +
          `👨‍💼 *Hablar con una persona*\n\n` +
          `Solo escribe lo que necesitas o elige una opción.`,

  pedido: '🚚 *¡Perfecto! Vamos a hacer tu pedido*\n\n' +
          '💧 *Nuestro servicio:*\n\n' +
          '🥤 *Llenado de Garrafón* - $15 MXN\n' +
          '   (Traes tu garrafón, lo llenamos con agua purificada)\n\n' +
          '🎯 *¿Cuántos garrafones quieres llenar?*\n' +
          'Ejemplo: "3 garrafones" o "quiero llenar 5"\n\n' +
          '🚚 *Servicio a domicilio disponible*\n' +
          '⏰ *Atención* todos los días',

  rastreo: '📍 *Rastrear tu pedido*\n\n' +
           '🔍 Para rastrear tu pedido, necesito el número de orden.\n\n' +
           '📝 *Formato:* PSJ + números\n' +
           '💬 *Ejemplo:* PSJ12345678901\n\n' +
           '¿Cuál es tu número de orden?',

  precios: '💰 *Precios - Purificadora San Juan*\n\n' +
           '💧 *Servicio de llenado:*\n\n' +
           '🥤 *Llenado de Garrafón* - $15 MXN\n' +
           '   • Traes tu garrafón\n' +
           '   • Lo llenamos con agua 100% purificada\n' +
           '   • Proceso de ozonización incluido\n\n' +
           '🚚 *Servicio a domicilio:*\n' +
           '   • Recogemos tus garrafones\n' +
           '   • Los llenamos en planta\n' +
           '   • Te los entregamos llenos\n' +
           '   • Costo adicional según zona\n\n' +
           '⏰ *Horario:* Todos los días\n\n' +
           '¿Cuántos garrafones necesitas llenar?',

  informacion: '❓ *Información General - Purificadora San Juan*\n\n' +
               '💧 *Sobre nosotros:*\n' +
               '• Agua 100% purificada y ozonizada\n' +
               '• Más de 15 años de experiencia\n' +
               '• Certificaciones de calidad\n' +
               '• Servicio a domicilio\n\n' +
               '🏪 *Cobertura:*\n' +
               '• Ciudad de México\n' +
               '• Estado de México\n' +
               '• Entrega el mismo día\n\n' +
               '🕐 *Horarios de entrega:*\n' +
               `• Lunes a Viernes: ${BOT_CONFIG.BUSINESS_HOURS.WEEKDAYS}\n` +
               `• Sábados: ${BOT_CONFIG.BUSINESS_HOURS.SATURDAY}\n` +
               `• Domingos: ${BOT_CONFIG.BUSINESS_HOURS.SUNDAY}\n\n` +
               '¿Necesitas algo más específico?',

  humano: '👨‍💼 *Contacto con Agente Humano*\n\n' +
          '🔄 Te estoy conectando con uno de nuestros agentes...\n\n' +
          '⏰ *Horarios de atención:*\n' +
          `• Lunes a Viernes: ${BOT_CONFIG.BUSINESS_HOURS.WEEKDAYS}\n` +
          `• Sábados: ${BOT_CONFIG.BUSINESS_HOURS.SATURDAY}\n` +
          `• Domingos: ${BOT_CONFIG.BUSINESS_HOURS.SUNDAY}\n\n` +
          '📱 *También puedes contactarnos:*\n' +
          '• WhatsApp: Este mismo número\n' +
          '• Teléfono: 55 1234 5678\n\n' +
          '💬 En breve un agente te responderá...',
  
  ayuda: `🤖 *Menú de ${BOT_CONFIG.NAME}*\n\n` +
         `Puedo ayudarte con:\n` +
         `🚚 *Pedido* - Hacer un pedido nuevo\n` +
         `📍 *Rastrear* - Seguimiento de tu pedido\n` +
         `💰 *Precios* - Consultar nuestras tarifas\n` +
         `❓ *Información* - Datos generales\n` +
         `👨‍💼 *Persona* - Contactar a un agente\n\n` +
         `Solo escribe la palabra clave que te interese.`,
  
  horarios: '🕐 *Horarios de Atención*\n\n' +
            `📅 Lunes a Viernes: ${BOT_CONFIG.BUSINESS_HOURS.WEEKDAYS}\n` +
            `📅 Sábados: ${BOT_CONFIG.BUSINESS_HOURS.SATURDAY}\n` +
            `📅 Domingos: ${BOT_CONFIG.BUSINESS_HOURS.SUNDAY}\n\n` +
            `Zona horaria: ${BOT_CONFIG.TIMEZONE}\n\n` +
            '💧 ¡Agua pura siempre disponible!',
  
  despedida: '¡Gracias por contactar a *Purificadora San Juan*! 💧\n\n' +
             '¿Hay algo más en lo que pueda ayudarte?\n\n' +
             'Si necesitas hacer un pedido o hablar con nuestro equipo, ' +
             'estaremos disponibles en nuestros horarios de atención.',
  
  default: 'Gracias por tu mensaje. 📝\n\n' +
           'Te he conectado con nuestro equipo de *Purificadora San Juan* ' +
           'que te responderá pronto.\n\n' +
           'Mientras tanto, puedes escribir *"hola"* para ver todas nuestras opciones.'
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