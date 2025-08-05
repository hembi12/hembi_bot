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
          '💧 *Nuestros productos disponibles:*\n\n' +
          '1️⃣ *Garrafón 20L* - $25 MXN\n' +
          '2️⃣ *Botella 1L* - $8 MXN\n' +
          '3️⃣ *Botella 500ml* - $5 MXN\n\n' +
          '🎯 *¿Qué te gustaría pedir?*\n' +
          'Ejemplo: "2 garrafones y 5 botellas de 1L"\n\n' +
          '🚚 *Envío gratuito* en pedidos de $100 o más\n' +
          '⏰ *Entrega* el mismo día en CDMX',
  
  // Mantenemos los otros mensajes por ahora (los actualizaremos después)
  ayuda: `🤖 *Menú de ${BOT_CONFIG.NAME}*\n\n` +
         `Puedo ayudarte con:\n` +
         `🚚 *Pedido* - Hacer un pedido nuevo\n` +
         `📍 *Rastrear* - Seguimiento de tu pedido\n` +
         `💰 *Precios* - Consultar nuestras tarifas\n` +
         `❓ *Información* - Datos generales\n` +
         `👨‍💼 *Persona* - Contactar a un agente\n\n` +
         `Solo escribe la palabra clave que te interese.`,
  
  precios: '💰 *Nuestros Precios*\n\n' +
           'Agua purificada de la mejor calidad:\n\n' +
           '🚰 Garrafón 20L: $25 MXN\n' +
           '🚰 Botella 1L: $8 MXN\n' +
           '🚰 Botella 500ml: $5 MXN\n\n' +
           '🚚 Envío gratuito en pedidos superiores a $100\n\n' +
           '¿Te gustaría hacer un pedido?',
  
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