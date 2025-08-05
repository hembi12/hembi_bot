// src/services/whatsappService.js
const axios = require('axios');
const Logger = require('../utils/logger');
const Validators = require('../utils/validators');
const { WHATSAPP_API, HTTP_STATUS } = require('../config/constants');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/messages');

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_TOKEN;
    this.defaultPhoneNumberId = process.env.PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    // Validar configuración al inicializar
    this._validateConfiguration();
  }

  _validateConfiguration() {
    const issues = [];
    
    if (!this.accessToken) {
      issues.push('WHATSAPP_TOKEN no configurado');
    }
    
    if (!this.defaultPhoneNumberId) {
      issues.push('PHONE_NUMBER_ID no configurado');
    } else if (!Validators.validatePhoneNumberId(this.defaultPhoneNumberId)) {
      issues.push('PHONE_NUMBER_ID tiene formato inválido');
    }
    
    if (!this.businessAccountId) {
      issues.push('WHATSAPP_BUSINESS_ACCOUNT_ID no configurado');
    }
    
    if (issues.length > 0) {
      Logger.warning('Problemas de configuración de WhatsApp Service:', issues);
    } else {
      Logger.success('WhatsApp Service configurado correctamente', {
        phoneNumberId: this.defaultPhoneNumberId,
        businessAccountId: this.businessAccountId
      });
    }
  }

  async sendTextMessage(to, message, phoneNumberId = null) {
    // Usar phoneNumberId del parámetro o el por defecto
    const finalPhoneNumberId = phoneNumberId || this.defaultPhoneNumberId;
    
    if (!this.accessToken) {
      Logger.error(ERROR_MESSAGES.MISSING_ACCESS_TOKEN);
      throw new Error(ERROR_MESSAGES.MISSING_ACCESS_TOKEN);
    }

    if (!finalPhoneNumberId) {
      Logger.error(ERROR_MESSAGES.MISSING_PHONE_ID);
      throw new Error(ERROR_MESSAGES.MISSING_PHONE_ID);
    }

    if (!Validators.validatePhoneNumber(to)) {
      Logger.error('Número de teléfono destinatario inválido:', to);
      throw new Error('Número de teléfono destinatario inválido');
    }

    const url = `${WHATSAPP_API.BASE_URL}/${finalPhoneNumberId}/messages`;
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
      Logger.api(`Phone Number ID: ${finalPhoneNumberId}`);
      Logger.api(`Contenido: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);

      const response = await axios.post(url, payload, { headers });
      
      Logger.success(SUCCESS_MESSAGES.MESSAGE_SENT, {
        messageId: response.data.messages?.[0]?.id,
        to: to,
        status: response.data.messages?.[0]?.message_status
      });
      
      return response.data;

    } catch (error) {
      this._handleSendError(error, to, finalPhoneNumberId);
      throw error;
    }
  }

  async sendTemplateMessage(to, templateName, languageCode = 'es', components = [], phoneNumberId = null) {
    const finalPhoneNumberId = phoneNumberId || this.defaultPhoneNumberId;
    
    if (!this.accessToken || !finalPhoneNumberId) {
      throw new Error('Configuración incompleta para enviar template');
    }

    const url = `${WHATSAPP_API.BASE_URL}/${finalPhoneNumberId}/messages`;
    const payload = {
      messaging_product: WHATSAPP_API.MESSAGING_PRODUCT,
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: components
      }
    };

    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };

    try {
      Logger.api(`Enviando template "${templateName}" a ${to}`);
      
      const response = await axios.post(url, payload, { headers });
      
      Logger.success('Template enviado exitosamente', {
        messageId: response.data.messages?.[0]?.id,
        templateName,
        to
      });
      
      return response.data;

    } catch (error) {
      this._handleSendError(error, to, finalPhoneNumberId);
      throw error;
    }
  }

  async getBusinessProfile(phoneNumberId = null) {
    const finalPhoneNumberId = phoneNumberId || this.defaultPhoneNumberId;
    
    if (!this.accessToken || !finalPhoneNumberId) {
      throw new Error('Configuración incompleta para obtener perfil');
    }

    const url = `${WHATSAPP_API.BASE_URL}/${finalPhoneNumberId}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`
    };

    try {
      Logger.api(`Obteniendo perfil del negocio: ${finalPhoneNumberId}`);
      
      const response = await axios.get(url, { headers });
      
      Logger.success('Perfil obtenido exitosamente', response.data);
      return response.data;

    } catch (error) {
      Logger.error('Error obteniendo perfil del negocio:', error.response?.data || error.message);
      throw error;
    }
  }

  _handleSendError(error, to, phoneNumberId) {
    const errorData = error.response?.data;
    const statusCode = error.response?.status;
    
    Logger.error(ERROR_MESSAGES.SEND_MESSAGE_ERROR, {
      to,
      phoneNumberId,
      status: statusCode,
      error: errorData || error.message
    });
    
    if (statusCode === 401) {
      Logger.error(ERROR_MESSAGES.INVALID_ACCESS_TOKEN);
    } else if (statusCode === 400) {
      Logger.error(ERROR_MESSAGES.INVALID_MESSAGE_FORMAT);
      
      // Detalles específicos del error 400
      if (errorData?.error?.error_data?.details) {
        Logger.error('Detalles del error:', errorData.error.error_data.details);
      }
    } else if (statusCode === 403) {
      Logger.error('Acceso prohibido - Verificar permisos del token');
    } else if (statusCode === 429) {
      Logger.error('Rate limit excedido - Demasiadas peticiones');
    }
  }

  getConfiguration() {
    return {
      hasAccessToken: !!this.accessToken,
      phoneNumberId: this.defaultPhoneNumberId,
      businessAccountId: this.businessAccountId,
      apiVersion: 'v18.0'
    };
  }
}

module.exports = WhatsAppService;