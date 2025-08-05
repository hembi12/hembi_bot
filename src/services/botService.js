// src/services/botService.js - Con manejo de pedidos
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
    
    if (this._containsKeywords(sanitizedText, INTENT_KEYWORDS.ORDER)) {
      Logger.bot('Solicitud de pedido detectada');
      return 'pedido';
    }
    
    if (this._containsKeywords(sanitizedText, INTENT_KEYWORDS.TRACKING)) {
      Logger.bot('Solicitud de rastreo detectada');
      return 'rastreo';
    }
    
    if (this._containsKeywords(sanitizedText, INTENT_KEYWORDS.PRICES)) {
      Logger.bot('Consulta de precios detectada');
      return 'precios';
    }
    
    if (this._containsKeywords(sanitizedText, INTENT_KEYWORDS.INFO)) {
      Logger.bot('Solicitud de información detectada');
      return 'informacion';
    }
    
    if (this._containsKeywords(sanitizedText, INTENT_KEYWORDS.HUMAN)) {
      Logger.bot('Solicitud de contacto humano detectada');
      return 'humano';
    }

    // Detectar si parece ser un pedido específico (números + productos)
    if (this._seemsLikeOrder(sanitizedText)) {
      Logger.bot('Mensaje parece ser un pedido específico');
      return 'pedido_especifico';
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

  _seemsLikeOrder(text) {
    // Detectar patrones como "2 garrafones", "3 botellas", etc.
    const orderPatterns = [
      /\d+\s*(garraf|botell|litro)/,
      /quiero\s*\d+/,
      /necesito\s*\d+/,
      /(dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(garraf|botell)/
    ];
    
    return orderPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Procesa un pedido específico del usuario
   * @param {string} messageText - Texto del mensaje con el pedido
   * @returns {string} - Respuesta procesada
   */
  processSpecificOrder(messageText) {
    const sanitizedText = Validators.sanitizeMessage(messageText);
    
    Logger.bot(`Procesando pedido específico: "${sanitizedText}"`);
    
    // Extraer productos y cantidades
    const orderItems = this._extractOrderItems(sanitizedText);
    
    if (orderItems.length === 0) {
      return '🤔 No pude entender tu pedido. ¿Podrías especificar qué productos quieres?\n\n' +
             'Ejemplo: "2 garrafones y 3 botellas de 1L"';
    }
    
    // Calcular total
    const total = this._calculateTotal(orderItems);
    const freeShipping = total >= 100;
    
    let response = '📋 *Tu pedido:*\n\n';
    
    orderItems.forEach(item => {
      response += `• ${item.quantity} ${item.product} - $${item.subtotal} MXN\n`;
    });
    
    response += `\n💰 *Total: $${total} MXN*\n`;
    
    if (freeShipping) {
      response += '🎉 *¡Envío GRATUITO incluido!*\n\n';
    } else {
      response += `🚚 Envío: $20 MXN (Gratis en pedidos +$100)\n`;
      response += `💰 *Total con envío: $${total + 20} MXN*\n\n`;
    }
    
    response += '✅ *Para confirmar tu pedido, necesito:*\n';
    response += '📍 Tu dirección de entrega\n';
    response += '📱 Número de contacto\n';
    response += '💳 Forma de pago (efectivo/transferencia)\n\n';
    response += '¿Podrías proporcionarme estos datos?';
    
    return response;
  }
  
  _extractOrderItems(text) {
    const items = [];
    const products = {
      'garrafon': { name: 'Garrafón 20L', price: 25 },
      'garrafa': { name: 'Garrafón 20L', price: 25 },
      'botella 1l': { name: 'Botella 1L', price: 8 },
      'botella de 1l': { name: 'Botella 1L', price: 8 },
      'botella 500ml': { name: 'Botella 500ml', price: 5 },
      'botella de 500ml': { name: 'Botella 500ml', price: 5 }
    };
    
    // Buscar patrones de cantidad + producto
    for (const [key, product] of Object.entries(products)) {
      const regex = new RegExp(`(\\d+)\\s*${key}`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          const quantity = parseInt(match.match(/\d+/)[0]);
          items.push({
            product: product.name,
            quantity: quantity,
            price: product.price,
            subtotal: quantity * product.price
          });
        });
      }
    }
    
    return items;
  }
  
  _calculateTotal(items) {
    return items.reduce((total, item) => total + item.subtotal, 0);
  }
}

module.exports = BotService;