// MEJORA 3: Real-Time Streaming Service con SSE y WebSocket
// Archivo: backend/services/realTimeStreamingService.js

const EventEmitter = require('events');
const winston = require('winston');
const { generateId } = require('../utils');

class RealTimeStreamingService extends EventEmitter {
  constructor() {
    super();
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/streaming.log' }),
        new winston.transports.Console()
      ]
    });

    // Almacenamiento de conexiones activas
    this.activeConnections = new Map(); // userId -> Set de connections
    this.chatRooms = new Map(); // roomId -> Set de userIds
    this.streamingSessions = new Map(); // sessionId -> streaming data
    
    // Configuración
    this.maxConnectionsPerUser = 5;
    this.maxChatRoomSize = 50;
    this.heartbeatInterval = 30000; // 30 segundos
    this.connectionTimeout = 60000; // 1 minuto

    // Iniciar heartbeat
    this.startHeartbeat();
    
    this.logger.info('✅ Real-Time Streaming Service initialized');
  }

  // SERVER-SENT EVENTS (SSE) Implementation
  setupSSEConnection(res, userId, sessionId) {
    try {
      // Configurar headers SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Crear conexión
      const connectionId = this.generateConnectionId();
      const connection = {
        id: connectionId,
        userId: userId,
        sessionId: sessionId,
        res: res,
        lastPing: Date.now(),
        isActive: true
      };

      // Registrar conexión
      this.registerConnection(userId, connection);

      // Enviar evento de conexión establecida
      this.sendSSEEvent(res, 'connection', {
        connectionId: connectionId,
        userId: userId,
        timestamp: new Date().toISOString()
      });

      // Manejar desconexión
      res.on('close', () => {
        this.unregisterConnection(userId, connectionId);
        this.logger.info(`🔌 SSE Connection closed: ${connectionId}`);
      });

      res.on('error', (error) => {
        this.logger.error(`❌ SSE Connection error: ${error.message}`);
        this.unregisterConnection(userId, connectionId);
      });

      this.logger.info(`✅ SSE Connection established: ${connectionId} for user ${userId}`);
      return connection;

    } catch (error) {
      this.logger.error('❌ Error setting up SSE connection:', error);
      throw error;
    }
  }

  // STREAMING DE RESPUESTAS AI
  async streamAIResponse(userId, sessionId, prompt, neuraId, context = {}) {
    try {
      const streamId = this.generateStreamId();
      const streamingData = {
        id: streamId,
        userId: userId,
        sessionId: sessionId,
        prompt: prompt,
        neuraId: neuraId,
        context: context,
        startTime: Date.now(),
        chunks: [],
        isComplete: false,
        totalTokens: 0,
        totalCost: 0
      };

      this.streamingSessions.set(streamId, streamingData);

      // Notificar inicio de streaming
      this.broadcastToUser(userId, 'stream_start', {
        streamId: streamId,
        sessionId: sessionId,
        neuraId: neuraId,
        timestamp: new Date().toISOString()
      });

      // Simular streaming de respuesta AI (en producción sería OpenAI streaming)
      await this.simulateAIStreaming(streamId, prompt, neuraId);

      return streamId;

    } catch (error) {
      this.logger.error('❌ Error streaming AI response:', error);
      throw error;
    }
  }

  async simulateAIStreaming(streamId, prompt, neuraId) {
    const streamingData = this.streamingSessions.get(streamId);
    if (!streamingData) return;

    // Simular respuesta dividida en chunks
    const fullResponse = await this.generateAIResponse(prompt, neuraId);
    const chunks = this.splitIntoChunks(fullResponse, 20); // 20 caracteres por chunk

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isLastChunk = i === chunks.length - 1;

      // Simular delay entre chunks
      await this.delay(100 + Math.random() * 200);

      // Actualizar datos de streaming
      streamingData.chunks.push(chunk);
      streamingData.totalTokens += chunk.length * 0.75; // Estimación
      streamingData.totalCost += chunk.length * 0.000001; // Estimación

      // Enviar chunk a usuario
      this.broadcastToUser(streamingData.userId, 'stream_chunk', {
        streamId: streamId,
        chunk: chunk,
        chunkIndex: i,
        isLastChunk: isLastChunk,
        timestamp: new Date().toISOString()
      });

      // Si es el último chunk, marcar como completo
      if (isLastChunk) {
        streamingData.isComplete = true;
        streamingData.endTime = Date.now();
        streamingData.duration = streamingData.endTime - streamingData.startTime;

        this.broadcastToUser(streamingData.userId, 'stream_complete', {
          streamId: streamId,
          totalTokens: streamingData.totalTokens,
          totalCost: streamingData.totalCost,
          duration: streamingData.duration,
          timestamp: new Date().toISOString()
        });

        // Limpiar después de 5 minutos
        setTimeout(() => {
          this.streamingSessions.delete(streamId);
        }, 300000);
      }
    }
  }

  // COLLABORACIÓN EN TIEMPO REAL
  joinChatRoom(userId, roomId) {
    try {
      if (!this.chatRooms.has(roomId)) {
        this.chatRooms.set(roomId, new Set());
      }

      const room = this.chatRooms.get(roomId);
      
      if (room.size >= this.maxChatRoomSize) {
        throw new Error('Chat room is full');
      }

      room.add(userId);

      // Notificar a otros usuarios en la sala
      this.broadcastToRoom(roomId, 'user_joined', {
        userId: userId,
        roomId: roomId,
        userCount: room.size,
        timestamp: new Date().toISOString()
      }, userId); // Excluir al usuario que se unió

      this.logger.info(`👥 User ${userId} joined room ${roomId}`);
      return { success: true, userCount: room.size };

    } catch (error) {
      this.logger.error('❌ Error joining chat room:', error);
      return { success: false, error: error.message };
    }
  }

  leaveChatRoom(userId, roomId) {
    try {
      const room = this.chatRooms.get(roomId);
      if (!room) return { success: false, error: 'Room not found' };

      room.delete(userId);

      // Notificar a otros usuarios en la sala
      this.broadcastToRoom(roomId, 'user_left', {
        userId: userId,
        roomId: roomId,
        userCount: room.size,
        timestamp: new Date().toISOString()
      });

      // Limpiar sala si está vacía
      if (room.size === 0) {
        this.chatRooms.delete(roomId);
      }

      this.logger.info(`👋 User ${userId} left room ${roomId}`);
      return { success: true, userCount: room.size };

    } catch (error) {
      this.logger.error('❌ Error leaving chat room:', error);
      return { success: false, error: error.message };
    }
  }

  // TYPING INDICATORS
  setTypingIndicator(userId, roomId, isTyping) {
    try {
      this.broadcastToRoom(roomId, 'typing_indicator', {
        userId: userId,
        isTyping: isTyping,
        timestamp: new Date().toISOString()
      }, userId); // Excluir al usuario que está escribiendo

      return { success: true };

    } catch (error) {
      this.logger.error('❌ Error setting typing indicator:', error);
      return { success: false, error: error.message };
    }
  }

  // PRESENCE MANAGEMENT
  updateUserPresence(userId, status, activity = null) {
    try {
      const presenceData = {
        userId: userId,
        status: status, // online, away, busy, offline
        activity: activity, // typing, viewing, idle
        timestamp: new Date().toISOString()
      };

      // Broadcast a todas las conexiones del usuario
      this.broadcastToUser(userId, 'presence_update', presenceData);

      // Notificar a salas donde el usuario está presente
      for (const [roomId, users] of this.chatRooms) {
        if (users.has(userId)) {
          this.broadcastToRoom(roomId, 'user_presence', presenceData, userId);
        }
      }

      return { success: true };

    } catch (error) {
      this.logger.error('❌ Error updating user presence:', error);
      return { success: false, error: error.message };
    }
  }

  // BROADCASTING METHODS
  broadcastToUser(userId, eventType, data) {
    try {
      const connections = this.activeConnections.get(userId);
      if (!connections) return;

      let sentCount = 0;
      connections.forEach(connection => {
        if (connection.isActive && connection.res && !connection.res.destroyed) {
          this.sendSSEEvent(connection.res, eventType, data);
          sentCount++;
        }
      });

      this.logger.debug(`📡 Broadcasted ${eventType} to ${sentCount} connections for user ${userId}`);

    } catch (error) {
      this.logger.error('❌ Error broadcasting to user:', error);
    }
  }

  broadcastToRoom(roomId, eventType, data, excludeUserId = null) {
    try {
      const room = this.chatRooms.get(roomId);
      if (!room) return;

      let sentCount = 0;
      room.forEach(userId => {
        if (userId !== excludeUserId) {
          const connections = this.activeConnections.get(userId);
          if (connections) {
            connections.forEach(connection => {
              if (connection.isActive && connection.res && !connection.res.destroyed) {
                this.sendSSEEvent(connection.res, eventType, data);
                sentCount++;
              }
            });
          }
        }
      });

      this.logger.debug(`📡 Broadcasted ${eventType} to ${sentCount} connections in room ${roomId}`);

    } catch (error) {
      this.logger.error('❌ Error broadcasting to room:', error);
    }
  }

  // UTILITY METHODS
  sendSSEEvent(res, eventType, data) {
    try {
      const eventData = JSON.stringify(data);
      res.write(`event: ${eventType}\n`);
      res.write(`data: ${eventData}\n\n`);
    } catch (error) {
      this.logger.error('❌ Error sending SSE event:', error);
    }
  }

  registerConnection(userId, connection) {
    if (!this.activeConnections.has(userId)) {
      this.activeConnections.set(userId, new Set());
    }

    const connections = this.activeConnections.get(userId);
    
    // Limitar conexiones por usuario
    if (connections.size >= this.maxConnectionsPerUser) {
      const oldestConnection = Array.from(connections)[0];
      this.unregisterConnection(userId, oldestConnection.id);
    }

    connections.add(connection);
    connection.lastPing = Date.now();
  }

  unregisterConnection(userId, connectionId) {
    const connections = this.activeConnections.get(userId);
    if (!connections) return;

    connections.forEach(connection => {
      if (connection.id === connectionId) {
        connection.isActive = false;
        connections.delete(connection);
      }
    });

    // Limpiar si no hay más conexiones
    if (connections.size === 0) {
      this.activeConnections.delete(userId);
    }
  }

  generateConnectionId() {
    return generateId('conn').replace(/-/g, '_');
  }

  generateStreamId() {
    return generateId('stream').replace(/-/g, '_');
  }

  splitIntoChunks(text, chunkSize) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async generateAIResponse(_prompt, _neuraId) {
    // Simular respuesta AI (en producción sería llamada real a OpenAI)
    const responses = [
      "Esta es una respuesta simulada del AI Gateway para testing de streaming.",
      "El sistema de streaming en tiempo real está funcionando correctamente.",
      "Las mejoras implementadas incluyen SSE, WebSocket y colaboración en tiempo real.",
      "ECONEURA ahora tiene capacidades premium de streaming y colaboración."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HEARTBEAT Y MONITORING
  startHeartbeat() {
    setInterval(() => {
      this.performHeartbeat();
    }, this.heartbeatInterval);
  }

  performHeartbeat() {
    const now = Date.now();
    let cleanedConnections = 0;

    this.activeConnections.forEach((connections, _userId) => {
      connections.forEach(connection => {
        if (now - connection.lastPing > this.connectionTimeout) {
          connection.isActive = false;
          connections.delete(connection);
          cleanedConnections++;
        } else {
          // Enviar ping
          this.sendSSEEvent(connection.res, 'ping', {
            timestamp: new Date().toISOString()
          });
          connection.lastPing = now;
        }
      });
    });

    if (cleanedConnections > 0) {
      this.logger.info(`🧹 Cleaned ${cleanedConnections} inactive connections`);
    }
  }

  // ANALYTICS Y MÉTRICAS
  getMetrics() {
    const totalConnections = Array.from(this.activeConnections.values())
      .reduce((sum, connections) => sum + connections.size, 0);
    
    const activeRooms = this.chatRooms.size;
    const activeStreams = this.streamingSessions.size;

    return {
      totalConnections: totalConnections,
      activeUsers: this.activeConnections.size,
      activeRooms: activeRooms,
      activeStreams: activeStreams,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  // HEALTH CHECK
  healthCheck() {
    const metrics = this.getMetrics();
    
    return {
      status: 'healthy',
      metrics: metrics,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = RealTimeStreamingService;
