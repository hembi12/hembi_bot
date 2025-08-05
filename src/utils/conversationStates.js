// src/utils/conversationStates.js
const Logger = require('./logger');

class ConversationStates {
  constructor() {
    // Almacenamiento en memoria (en producción usar Redis)
    this.userStates = new Map();
    this.userOrders = new Map();
  }

  /**
   * Estados posibles de conversación
   */
  static STATES = {
    IDLE: 'idle',                    // Sin conversación activa
    COLLECTING_ADDRESS: 'collecting_address',    // Esperando dirección
    COLLECTING_PHONE: 'collecting_phone',        // Esperando teléfono
    COLLECTING_PAYMENT: 'collecting_payment',    // Esperando método de pago
    CONFIRMING_ORDER: 'confirming_order'         // Confirmando pedido final
  };

  /**
   * Establece el estado de un usuario
   */
  setState(userId, state, data = {}) {
    Logger.bot(`Usuario ${userId} cambió a estado: ${state}`);
    
    this.userStates.set(userId, {
      state,
      timestamp: Date.now(),
      ...data
    });
  }

  /**
   * Obtiene el estado actual de un usuario
   */
  getState(userId) {
    const userState = this.userStates.get(userId);
    
    if (!userState) {
      return {
        state: ConversationStates.STATES.IDLE,
        timestamp: Date.now()
      };
    }

    // Limpiar estados antiguos (más de 30 minutos)
    if (Date.now() - userState.timestamp > 30 * 60 * 1000) {
      this.clearState(userId);
      return {
        state: ConversationStates.STATES.IDLE,
        timestamp: Date.now()
      };
    }

    return userState;
  }

  /**
   * Limpia el estado de un usuario
   */
  clearState(userId) {
    Logger.bot(`Limpiando estado del usuario ${userId}`);
    this.userStates.delete(userId);
    this.userOrders.delete(userId);
  }

  /**
   * Guarda la información del pedido del usuario
   */
  saveOrderData(userId, orderData) {
    const existing = this.userOrders.get(userId) || {};
    const updated = { ...existing, ...orderData };
    
    this.userOrders.set(userId, updated);
    Logger.bot(`Datos de pedido guardados para ${userId}:`, updated);
  }

  /**
   * Obtiene los datos del pedido del usuario
   */
  getOrderData(userId) {
    return this.userOrders.get(userId) || {};
  }

  /**
   * Verifica si todos los datos del pedido están completos
   */
  isOrderComplete(userId) {
    const orderData = this.getOrderData(userId);
    
    return !!(
      orderData.items &&
      orderData.address &&
      orderData.phone &&
      orderData.paymentMethod
    );
  }

  /**
   * Genera número de orden único
   */
  generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PSJ${timestamp}${random}`;
  }

  /**
   * Limpieza periódica de estados antiguos
   */
  cleanup() {
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    
    for (const [userId, state] of this.userStates.entries()) {
      if (now - state.timestamp > thirtyMinutes) {
        this.clearState(userId);
      }
    }
  }
}

module.exports = ConversationStates;