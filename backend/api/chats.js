const express = require('express');
const router = express.Router();
const db = require('../db'); // PostgreSQL version
const logger = require('../services/logger');

// GET /api/chats - Listar chats del usuario
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const chats = await db.getChats(userId, 50);
    res.json({ chats });
  } catch (error) {
    logger.error('Error listando chats', { error: error.message, stack: error.stack, userId: req.user?.id });
    res.status(500).json({ error: 'Error obteniendo chats' });
  }
});

// POST /api/chats - Crear nuevo chat
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { title, messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages requeridos' });
    }

    const chat = await db.createChat(userId, title || 'Nuevo chat', messages);
    res.status(201).json({ chat });
  } catch (error) {
    logger.error('Error creando chat', { error: error.message, stack: error.stack, body: req.body });
    res.status(500).json({ error: 'Error creando chat' });
  }
});

// GET /api/chats/:id - Obtener chat específico
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const chat = await db.getChat(req.params.id, userId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat no encontrado' });
    }

    res.json({ chat });
  } catch (error) {
    logger.error('Error obteniendo chat', { error: error.message, stack: error.stack, chatId: req.params.id });
    res.status(500).json({ error: 'Error obteniendo chat' });
  }
});

// PUT /api/chats/:id - Actualizar chat (agregar mensajes)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages requeridos' });
    }

    const chat = await db.updateChat(req.params.id, userId, messages);
    if (!chat) {
      return res.status(404).json({ error: 'Chat no encontrado' });
    }

    res.json({ chat });
  } catch (error) {
    logger.error('Error actualizando chat', { error: error.message, stack: error.stack, chatId: req.params.id, body: req.body });
    res.status(500).json({ error: 'Error actualizando chat' });
  }
});

// DELETE /api/chats/:id - Eliminar chat
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    await db.deleteChat(req.params.id, userId);
    res.json({ message: 'Chat eliminado correctamente' });
  } catch (error) {
    logger.error('Error eliminando chat', { error: error.message, stack: error.stack, chatId: req.params.id });
    res.status(500).json({ error: 'Error eliminando chat' });
  }
});

module.exports = router;
