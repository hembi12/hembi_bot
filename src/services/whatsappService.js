// src/services/whatsappService.js
const axios = require('axios');
const Logger = require('../utils/logger');
const { WHATSAPP_API, HTTP_STATUS } = require('../config/constants');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/messages');

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_TOKEN;
  }

  async sendTextMessage(to, message, phoneNumberId) {
    if (!this.accessToken) {
      Logger.error(ERROR_MESSAGES.MISSING_ACCESS_TOKEN);
      throw new Error(ERROR_MESSAGES.MISSING_ACCESS_TOKEN);
    }

    if (!phoneNumberId) {
      Logger.error(ERROR_MESSAGES.MISSING_PHONE_ID);
      throw new Error(ERROR_MESSAGES.MISSING_PHONE_ID);
    }

    const url = `${WHATSAPP_API.BASE_URL}/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: WHATSAPP_API.MESSAGING_PRODUCT,
      to: to,
      type: "text",
      text: {
        body: message
      }
    };

    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };

    try {
      Logger.api(`Enviando mensaje a ${to}`);
      Logger.api(`Contenido: "${message}"`);

      const response = await axios.post(url, payload, { headers });
      
      Logger.success(SUCCESS_MESSAGES.MESSAGE_SENT, response.data);
      return response.data;

    } catch (error) {
      this._handleSendError(error);
      throw error;
    }
  }

  _handleSendError(error) {
    Logger.error(ERROR_MESSAGES.SEND_MESSAGE_ERROR, error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      Logger.error(ERROR_MESSAGES.INVALID_ACCESS_TOKEN);
    } else if (error.response?.status === 400) {
      Logger.error(ERROR_MESSAGES.INVALID_MESSAGE_FORMAT);
    }
  }
}

module.exports = WhatsAppService;