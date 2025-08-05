// src/services/botService.js - Flujo completo de pedidos
const Logger = require('../utils/logger');
const Validators = require('../utils/validators');
const ConversationStates = require('../utils/conversationStates');
const { INTENT_KEYWORDS } = require('../config/constants');
const { PREDEFINED_MESSAGES } = require('../config/messages');

class BotService {
  constructor() {
    this.conversationStates = new ConversationStates();
    
    // Limpiar estados antiguos cada 5 minutos
    setInterval(() => {
      this.conversationStates.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Procesa un mensaje considerando el estado de la conversación
   */
  processMessage(messageText, userId) {
    const userState = this.conversationStates.getState(userId);
    const sanitizedText = Validators.sanitizeMessage(messageText);
    
    Logger.bot(`Procesando mensaje de ${userId} en estado: ${userState.state}`);
    
    // Si está en medio de un proceso de pedido, continuar ese flujo
    if (userState.state !== ConversationStates.STATES.IDLE) {
      return this._handleOrderFlow(sanitizedText, userId, userState);
    }
    
    // Si no está en un flujo específico, detectar intención normal
    const intent = this.detectIntent(messageText);
    
    if (intent === 'pedido_especifico') {
      return this._startOrderProcess(sanitizedText, userId);
    }
    
    return this.getResponseMessage(intent);
  }

  detectIntent(messageText) {
    const sanitizedText = Validators.sanitizeMessage(messageText);
    
    Logger.bot(`Analizando mensaje: "${sanitizedText}"`);

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

  /**
   * Inicia el proceso de pedido con items específicos
   */
  _startOrderProcess(messageText, userId) {
    const orderItems = this._extractOrderItems(messageText);
    
    if (orderItems.length === 0) {
      return '🤔 No pude entender tu pedido. ¿Podrías especificar qué productos quieres?\n\n' +
             'Ejemplo: "2 garrafones y 3 botellas de 1L"';
    }
    
    // Guardar items del pedido
    this.conversationStates.saveOrderData(userId, { items: orderItems });
    
    // Cambiar estado para recopilar dirección
    this.conversationStates.setState(userId, ConversationStates.STATES.COLLECTING_ADDRESS);
    
    // Mostrar resumen y solicitar dirección
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
    
    response += '✅ *Para continuar, necesito tu dirección de entrega:*\n\n';
    response += '📍 Por favor envía tu dirección completa:\n';
    response += 'Calle, número, colonia, código postal, ciudad\n\n';
    response += '📝 Ejemplo: "Av. Insurgentes 123, Col. Roma Norte, 06700, CDMX"';
    
    return response;
  }

  /**
   * Maneja el flujo de recopilación de datos del pedido
   */
  _handleOrderFlow(messageText, userId, userState) {
    const sanitizedText = messageText.trim();
    
    switch (userState.state) {
      case ConversationStates.STATES.COLLECTING_ADDRESS:
        return this._handleAddressCollection(sanitizedText, userId);
        
      case ConversationStates.STATES.COLLECTING_PHONE:
        return this._handlePhoneCollection(sanitizedText, userId);
        
      case ConversationStates.STATES.COLLECTING_PAYMENT:
        return this._handlePaymentCollection(sanitizedText, userId);
        
      case ConversationStates.STATES.CONFIRMING_ORDER:
        return this._handleOrderConfirmation(sanitizedText, userId);
        
      default:
        this.conversationStates.clearState(userId);
        return 'Ha ocurrido un error. Por favor inicia tu pedido nuevamente.';
    }
  }

  _handleAddressCollection(address, userId) {
    if (address.length < 10) {
      return '📍 La dirección parece muy corta. ¿Podrías enviar la dirección completa?\n\n' +
             'Incluye: calle, número, colonia, código postal y ciudad';
    }
    
    // Guardar dirección
    this.conversationStates.saveOrderData(userId, { address });
    
    // Cambiar a recopilar teléfono
    this.conversationStates.setState(userId, ConversationStates.STATES.COLLECTING_PHONE);
    
    return '✅ *Dirección recibida:*\n' +
           `📍 ${address}\n\n` +
           '📱 *Ahora necesito tu número de teléfono de contacto:*\n\n' +
           '💬 Envía tu número para confirmaciones y seguimiento del pedido\n' +
           '📝 Ejemplo: 55 1234 5678';
  }

  _handlePhoneCollection(phone, userId) {
    // Validar formato básico de teléfono
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (cleanPhone.length < 10) {
      return '📱 El número parece incompleto. ¿Podrías enviar tu número completo?\n\n' +
             '📝 Ejemplo: 55 1234 5678 o 5551234567';
    }
    
    // Guardar teléfono
    this.conversationStates.saveOrderData(userId, { phone });
    
    // Cambiar a método de pago
    this.conversationStates.setState(userId, ConversationStates.STATES.COLLECTING_PAYMENT);
    
    return '✅ *Teléfono recibido:*\n' +
           `📱 ${phone}\n\n` +
           '💳 *¿Cómo prefieres pagar?*\n\n' +
           '1️⃣ *Efectivo* - Pago al recibir\n' +
           '2️⃣ *Transferencia* - BBVA/OXXO\n' +
           '3️⃣ *Tarjeta* - Pago con terminal\n\n' +
           '💬 Escribe el número o nombre del método que prefieres';
  }

  _handlePaymentCollection(payment, userId) {
    const sanitizedPayment = Validators.sanitizeMessage(payment);
    let paymentMethod = '';
    
    if (sanitizedPayment.includes('1') || sanitizedPayment.includes('efectivo')) {
      paymentMethod = 'Efectivo al recibir';
    } else if (sanitizedPayment.includes('2') || sanitizedPayment.includes('transferencia')) {
      paymentMethod = 'Transferencia bancaria';
    } else if (sanitizedPayment.includes('3') || sanitizedPayment.includes('tarjeta')) {
      paymentMethod = 'Tarjeta (terminal)';
    } else {
      return '❌ No entendí el método de pago. Por favor elige:\n\n' +
             '1️⃣ Efectivo\n' +
             '2️⃣ Transferencia\n' +
             '3️⃣ Tarjeta\n\n' +
             'Escribe el número o nombre del método';
    }
    
    // Guardar método de pago
    this.conversationStates.saveOrderData(userId, { paymentMethod });
    
    // Cambiar a confirmación
    this.conversationStates.setState(userId, ConversationStates.STATES.CONFIRMING_ORDER);
    
    // Mostrar resumen completo para confirmación
    const orderData = this.conversationStates.getOrderData(userId);
    const total = this._calculateTotal(orderData.items);
    const freeShipping = total >= 100;
    const finalTotal = freeShipping ? total : total + 20;
    
    let response = '📋 *RESUMEN DE TU PEDIDO*\n\n';
    
    response += '🛒 *Productos:*\n';
    orderData.items.forEach(item => {
      response += `• ${item.quantity} ${item.product} - $${item.subtotal}\n`;
    });
    
    response += `\n📍 *Dirección:* ${orderData.address}\n`;
    response += `📱 *Teléfono:* ${orderData.phone}\n`;
    response += `💳 *Pago:* ${paymentMethod}\n\n`;
    
    response += `💰 *Total: $${finalTotal} MXN*\n`;
    if (freeShipping) response += '🎉 *Envío incluido*\n';
    
    response += '\n✅ *¿Confirmas tu pedido?*\n\n';
    response += '👍 Escribe *"confirmar"* para procesar\n';
    response += '❌ Escribe *"cancelar"* para anular\n';
    response += '✏️ Escribe *"modificar"* para cambiar algo';
    
    return response;
  }

  _handleOrderConfirmation(confirmation, userId) {
    const sanitizedConfirmation = Validators.sanitizeMessage(confirmation);
    
    if (sanitizedConfirmation.includes('confirmar') || sanitizedConfirmation.includes('si') || sanitizedConfirmation.includes('sí')) {
      // Generar número de orden
      const orderNumber = this.conversationStates.generateOrderNumber();
      
      // Limpiar estado
      this.conversationStates.clearState(userId);
      
      return '🎉 *¡PEDIDO CONFIRMADO!*\n\n' +
             `📄 *Número de orden:* ${orderNumber}\n\n` +
             '✅ Tu pedido ha sido enviado a nuestro equipo\n' +
             '🚚 *Tiempo de entrega:* 2-4 horas\n' +
             '📱 Te contactaremos para confirmar la entrega\n\n' +
             '💧 *¡Gracias por elegir Purificadora San Juan!*\n\n' +
             `🔍 Puedes rastrear tu pedido con: ${orderNumber}`;
    }
    
    if (sanitizedConfirmation.includes('cancelar') || sanitizedConfirmation.includes('anular')) {
      this.conversationStates.clearState(userId);
      
      return '❌ *Pedido cancelado*\n\n' +
             '😊 No hay problema, puedes hacer un nuevo pedido cuando gustes.\n\n' +
             '💬 Escribe *"hola"* para ver el menú principal';
    }
    
    if (sanitizedConfirmation.includes('modificar')) {
      // Volver al inicio del proceso manteniendo algunos datos
      this.conversationStates.setState(userId, ConversationStates.STATES.COLLECTING_ADDRESS);
      
      return '✏️ *Modificando pedido...*\n\n' +
             '¿Qué te gustaría cambiar?\n\n' +
             '📍 Para cambiar dirección, envía la nueva dirección\n' +
             '📱 Para cambiar teléfono, escribe "teléfono: [nuevo número]"\n' +
             '💳 Para cambiar pago, escribe "pago: [método]"\n' +
             '🛒 Para cambiar productos, escribe "productos: [nuevo pedido]"';
    }
    
    return '❓ No entendí tu respuesta. Por favor escribe:\n\n' +
           '✅ *"confirmar"* - Para procesar el pedido\n' +
           '❌ *"cancelar"* - Para anular el pedido\n' +
           '✏️ *"modificar"* - Para cambiar algo';
  }

  _containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  _seemsLikeOrder(text) {
    const orderPatterns = [
      /\d+\s*(garraf|botell|litro)/,
      /quiero\s*\d+/,
      /necesito\s*\d+/,
      /(dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(garraf|botell)/
    ];
    
    return orderPatterns.some(pattern => pattern.test(text));
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