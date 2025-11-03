// Endpoints para las 3 Mejoras Críticas
// Archivo: backend/routes/premium-features.js

const express = require('express');
const router = express.Router();

// Middleware para obtener servicios
const getServices = (req, res, next) => {
  req.dbPersistence = req.app.locals.dbPersistence;
  req.voiceService = req.app.locals.voiceService;
  req.streamingService = req.app.locals.streamingService;
  next();
};

router.use(getServices);

// === MEJORA 1: DATABASE PERSISTENCE ENDPOINTS ===

// Crear usuario
router.post('/users', async (req, res) => {
  try {
    const { email, name, role = 'user' } = req.body;
    const user = await req.dbPersistence.createUser(email, name, role);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener usuario por email
router.get('/users/:email', async (req, res) => {
  try {
    const user = await req.dbPersistence.getUserByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Crear sesión de chat
router.post('/chat-sessions', async (req, res) => {
  try {
    const { userId, title, neuraId } = req.body;
    const session = await req.dbPersistence.createChatSession(userId, title, neuraId);
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Guardar mensaje de chat
router.post('/chat-messages', async (req, res) => {
  try {
    const { sessionId, role, content, metadata, tokens, cost } = req.body;
    const message = await req.dbPersistence.saveChatMessage(sessionId, role, content, metadata, tokens, cost);
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener historial de chat
router.get('/chat-history/:userId', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const history = await req.dbPersistence.getChatHistory(req.params.userId, parseInt(limit));
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener mensajes de una sesión
router.get('/chat-messages/:sessionId', async (req, res) => {
  try {
    const messages = await req.dbPersistence.getChatMessages(req.params.sessionId);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Métricas de uso
router.get('/metrics/:userId', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const metrics = await req.dbPersistence.getUsageMetrics(req.params.userId, parseInt(days));
    const neuraStats = await req.dbPersistence.getNeuraUsageStats(req.params.userId, parseInt(days));
    res.json({ success: true, metrics, neuraStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === MEJORA 2: VOICE SERVICE ENDPOINTS ===

// Speech-to-Text
router.post('/voice/stt', async (req, res) => {
  try {
    const { audioData, language = 'auto', options = {} } = req.body;
    
    // Convertir base64 a buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    const result = await req.voiceService.speechToText(audioBuffer, language, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Text-to-Speech
router.post('/voice/tts', async (req, res) => {
  try {
    const { text, language = 'es', voice = 'auto', options = {} } = req.body;
    
    const result = await req.voiceService.textToSpeech(text, language, voice, options);
    
    if (result.success) {
      // Enviar audio como base64
      res.json({
        success: true,
        audioData: result.audioBuffer.toString('base64'),
        voice: result.voice,
        language: result.language,
        duration: result.duration,
        provider: result.provider
      });
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Procesar comando de voz
router.post('/voice/command', async (req, res) => {
  try {
    const { audioData, context = {} } = req.body;
    
    // Convertir base64 a buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    const result = await req.voiceService.processVoiceCommand(audioBuffer, context);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Detectar idioma
router.post('/voice/detect-language', async (req, res) => {
  try {
    const { audioData } = req.body;
    
    // Convertir base64 a buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    const language = await req.voiceService.detectLanguage(audioBuffer);
    res.json({ success: true, language });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check de voice service
router.get('/voice/health', async (req, res) => {
  try {
    const health = await req.voiceService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === MEJORA 3: REAL-TIME STREAMING ENDPOINTS ===

// Establecer conexión SSE
router.get('/streaming/sse/:userId/:sessionId', (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const connection = req.streamingService.setupSSEConnection(res, userId, sessionId);
    res.json({ success: true, connectionId: connection.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar streaming de respuesta AI
router.post('/streaming/ai-response', async (req, res) => {
  try {
    const { userId, sessionId, prompt, neuraId, context = {} } = req.body;
    
    const streamId = await req.streamingService.streamAIResponse(userId, sessionId, prompt, neuraId, context);
    res.json({ success: true, streamId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unirse a sala de chat
router.post('/streaming/join-room', (req, res) => {
  try {
    const { userId, roomId } = req.body;
    const result = req.streamingService.joinChatRoom(userId, roomId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Salir de sala de chat
router.post('/streaming/leave-room', (req, res) => {
  try {
    const { userId, roomId } = req.body;
    const result = req.streamingService.leaveChatRoom(userId, roomId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Indicador de escritura
router.post('/streaming/typing', (req, res) => {
  try {
    const { userId, roomId, isTyping } = req.body;
    const result = req.streamingService.setTypingIndicator(userId, roomId, isTyping);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar presencia
router.post('/streaming/presence', (req, res) => {
  try {
    const { userId, status, activity } = req.body;
    const result = req.streamingService.updateUserPresence(userId, status, activity);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Métricas de streaming
router.get('/streaming/metrics', (req, res) => {
  try {
    const metrics = req.streamingService.getMetrics();
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check de streaming
router.get('/streaming/health', (req, res) => {
  try {
    const health = req.streamingService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === HEALTH CHECK GENERAL ===
router.get('/health', async (req, res) => {
  try {
    const dbHealth = await req.dbPersistence.healthCheck();
    const voiceHealth = await req.voiceService.healthCheck();
    const streamingHealth = req.streamingService.healthCheck();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        voice: voiceHealth,
        streaming: streamingHealth
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

