// src/config/constants.js - Purificadora San Juan
const WHATSAPP_API = {
  BASE_URL: 'https://graph.facebook.com/v18.0',
  MESSAGING_PRODUCT: 'whatsapp'
};

const HTTP_STATUS = {
  OK: 200,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_ERROR: 500
};

const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  DOCUMENT: 'document'
};

const INTENT_KEYWORDS = {
  GREETING: ['hola', 'buenos', 'buenas', 'hi', 'hello', 'ola', 'saludos'],
  ORDER: [
    'pedido', 'pedir', 'comprar', 'ordenar', 'solicitar', 'quiero', 'necesito',
    '1', 'garrafon', 'garrafa', 'llenar', 'llenado', 'agua', 'hacer pedido'
  ],
  TRACKING: [
    'rastrear', 'rastreo', 'seguimiento', 'track', 'donde esta', 'estatus',
    '2', 'buscar', 'ubicar', 'seguir', 'psj', 'numero de orden'
  ],
  PRICES: [
    'precio', 'costo', 'cuanto', 'tarifa', 'precios', 'costos', 'lista',
    '3', 'vale', 'cobran', 'cobras'
  ],
  INFO: [
    'informacion', 'info', 'servicios', 'que hacen', 'general', 'empresa',
    '4', 'acerca', 'sobre', 'horarios', 'cobertura', 'zona'
  ],
  HUMAN: [
    'persona', 'humano', 'operador', 'agente', 'hablar con alguien',
    '5', 'representante', 'ejecutivo', 'atencion', 'soporte'
  ]
};

const BOT_CONFIG = {
  NAME: 'H2O',
  COMPANY: 'Purificadora San Juan',
  BUSINESS_TYPE: 'Purificadora de Agua',
  LOCATION: 'México',
  TIMEZONE: 'México (GMT-6)',
  BUSINESS_HOURS: {
    WEEKDAYS: '8:00 AM - 7:00 PM',
    SATURDAY: '8:00 AM - 4:00 PM',
    SUNDAY: '9:00 AM - 2:00 PM'
  }
};

// Variables de entorno requeridas
const REQUIRED_ENV_VARS = [
  'VERIFY_TOKEN',
  'WHATSAPP_TOKEN',
  'PHONE_NUMBER_ID',
  'WHATSAPP_BUSINESS_ACCOUNT_ID'
];

// Variables de entorno opcionales
const OPTIONAL_ENV_VARS = [
  'NODE_ENV',
  'PORT'
];

module.exports = {
  WHATSAPP_API,
  HTTP_STATUS,
  MESSAGE_TYPES,
  INTENT_KEYWORDS,
  BOT_CONFIG,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS
};