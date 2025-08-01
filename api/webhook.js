// api/webhook.js
const axios = require('axios');

module.exports = async (req, res) => {
  const { method, query, body } = req;
  
  console.log(`${method} request recibido en /webhook`);
  
  if (method === 'GET') {
    // Verificación del webhook por Meta
    const verifyToken = process.env.VERIFY_TOKEN;
    const hubToken = query['hub.verify_token'];
    const challenge = query['hub.challenge'];
    const mode = query['hub.mode'];
    
    console.log('📋 Verificación webhook:', { 
      mode, 
      hubToken: hubToken ? 'presente' : 'ausente',
      challenge: challenge ? 'presente' : 'ausente',
      tokenConfigured: verifyToken ? 'configurado' : 'no configurado'
    });
    
    if (mode === 'subscribe' && hubToken === verifyToken) {
      console.log('✅ Webhook verificado exitosamente');
      return res.status(200).send(challenge);
    } else {
      console.log('❌ Token de verificación incorrecto');
      return res.status(403).json({ error: 'Token inválido' });
    }
  }
  
  if (method === 'POST') {
    console.log('📨 POST recibido');
    
    try {
      // Verificar que viene de WhatsApp Business
      if (body?.object === 'whatsapp_business_account') {
        console.log('✅ Objeto WhatsApp Business Account confirmado');
        
        // Procesar cada entrada
        if (body.entry && body.entry.length > 0) {
          for (const entry of body.entry) {
            console.log(`📍 Entry:`, entry.id);
            
            // Procesar cada cambio
            if (entry.changes && entry.changes.length > 0) {
              for (const change of entry.changes) {
                const { field, value } = change;
                console.log(`🔄 Cambio - Campo:`, field);
                
                // Procesar mensajes entrantes
                if (value?.messages && value.messages.length > 0) {
                  console.log(`💬 ${value.messages.length} mensaje(s) encontrado(s)`);
                  
                  for (const message of value.messages) {
                    console.log(`📨 Mensaje:`, {
                      id: message.id,
                      from: message.from,
                      timestamp: new Date(message.timestamp * 1000).toISOString(),
                      type: message.type,
                      text: message.text?.body || 'Sin texto'
                    });
                    
                    // Procesar el mensaje y responder
                    await handleIncomingMessage(message, value);
                  }
                }
              }
            }
          }
        }
        
        return res.status(200).json({ 
          success: true, 
          message: 'Webhook procesado correctamente',
          timestamp: new Date().toISOString()
        });
        
      } else {
        console.log('⚠️ Objeto no reconocido:', body?.object);
        return res.status(200).json({ 
          message: 'Objeto no es whatsapp_business_account, pero OK'
        });
      }
      
    } catch (error) {
      console.error('❌ Error procesando webhook:', error.message);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  }
  
  return res.status(405).json({ 
    error: 'Método no permitido',
    allowed: ['GET', 'POST'],
    received: method 
  });
};

// Función para manejar mensajes entrantes
async function handleIncomingMessage(message, value) {
  const { from, text, type, id } = message;
  const phoneNumberId = value.metadata?.phone_number_id;
  
  console.log('🤖 Procesando mensaje:');
  console.log(`👤 De: ${from}`);
  console.log(`📝 Tipo: ${type}`);
  console.log(`💬 Contenido: ${text?.body || 'Sin texto'}`);
  console.log(`📞 Phone Number ID: ${phoneNumberId}`);
  
  // Solo responder a mensajes de texto
  if (text?.body && phoneNumberId) {
    const messageText = text.body.toLowerCase().trim();
    
    console.log(`🔍 Analizando mensaje: "${messageText}"`);
    
    // Respuestas automáticas
    if (messageText.includes('hola') || messageText.includes('buenos') || messageText.includes('buenas')) {
      console.log('👋 Saludo detectado - enviando respuesta de bienvenida');
      await sendMessage(from, 'saludo', phoneNumberId);
    } 
    else if (messageText.includes('ayuda') || messageText.includes('help') || messageText.includes('menu')) {
      console.log('❓ Solicitud de ayuda detectada');
      await sendMessage(from, 'ayuda', phoneNumberId);
    }
    else if (messageText.includes('gracias') || messageText.includes('thank')) {
      console.log('🙏 Agradecimiento detectado');
      await sendMessage(from, 'despedida', phoneNumberId);
    }
    else if (messageText.includes('precio') || messageText.includes('costo') || messageText.includes('cuanto')) {
      console.log('💰 Consulta de precios detectada');
      await sendMessage(from, 'precios', phoneNumberId);
    }
    else if (messageText.includes('horario') || messageText.includes('hora') || messageText.includes('cuando')) {
      console.log('🕐 Consulta de horarios detectada');
      await sendMessage(from, 'horarios', phoneNumberId);
    }
    else {
      console.log('💭 Mensaje general - enviando respuesta por defecto');
      await sendMessage(from, 'default', phoneNumberId);
    }
  } else {
    console.log(`📎 Mensaje de tipo ${type} (sin texto) - no se responde automáticamente`);
  }
}

// Función para enviar respuestas automáticas
async function sendMessage(to, replyType, phoneNumberId) {
  const accessToken = process.env.WHATSAPP_TOKEN;
  
  if (!accessToken) {
    console.error('❌ WHATSAPP_TOKEN no configurado');
    return;
  }
  
  if (!phoneNumberId) {
    console.error('❌ phoneNumberId no disponible');
    return;
  }
  
  // Mensajes predefinidos
  const replies = {
    saludo: '¡Hola! 👋 Gracias por contactar a *Hembi*. ¿En qué puedo ayudarte hoy?\n\nPuedes escribir *"ayuda"* para ver nuestros servicios.',
    
    ayuda: `🤖 *Menú de Hembi Bot*\n\n` +
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
              '📅 Lunes a Viernes: 9:00 AM - 6:00 PM\n' +
              '📅 Sábados: 9:00 AM - 2:00 PM\n' +
              '📅 Domingos: Cerrado\n\n' +
              'Zona horaria: México (GMT-6)',
    
    despedida: '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?\n\nSi necesitas hablar con un humano, estaremos disponibles en nuestros horarios de atención.',
    
    default: 'Gracias por tu mensaje. 📝\n\n' +
             'Te he transferido a nuestro equipo humano que te responderá pronto.\n\n' +
             'Mientras tanto, puedes escribir *"ayuda"* para ver nuestros servicios automáticos.'
  };
  
  const replyMessage = replies[replyType] || replies.default;
  
  try {
    console.log(`📤 Enviando respuesta tipo: ${replyType} a ${to}`);
    console.log(`💬 Mensaje: "${replyMessage}"`);
    
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: replyMessage
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Mensaje enviado exitosamente:', response.data);
    
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('🔑 Token de acceso inválido o expirado');
    } else if (error.response?.status === 400) {
      console.error('📋 Error en el formato del mensaje o número inválido');
    }
  }
}