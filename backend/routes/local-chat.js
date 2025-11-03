const express = require('express');
const LocalChatService = require('../services/localChatService');
const router = express.Router();

const chatService = new LocalChatService();

// Crear nuevo chat
router.post('/create', async (req, res) => {
    try {
        const { userId, neuraId, department, initialMessage } = req.body;
        
        if (!userId || neuraId === undefined || !department) {
            return res.status(400).json({ 
                error: 'Faltan campos requeridos: userId, neuraId, department' 
            });
        }

        const chat = chatService.createChat(userId, neuraId, department, initialMessage);
        res.json(chat);
    } catch (error) {
        console.error('Error creando chat:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Agregar mensaje a chat
router.post('/:chatId/messages', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { role, content, neuraId, department } = req.body;
        
        if (!role || !content) {
            return res.status(400).json({ 
                error: 'Faltan campos requeridos: role, content' 
            });
        }

        const message = chatService.addMessage(chatId, role, content, neuraId, department);
        res.json(message);
    } catch (error) {
        console.error('Error agregando mensaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener mensajes de un chat
router.get('/:chatId/messages', async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = chatService.getChatMessages(chatId);
        res.json(messages);
    } catch (error) {
        console.error('Error obteniendo mensajes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener todos los chats de un usuario
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const chats = chatService.getUserChats(userId);
        res.json(chats);
    } catch (error) {
        console.error('Error obteniendo chats de usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar chat
router.delete('/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const success = chatService.deleteChat(chatId);
        
        if (success) {
            res.json({ message: 'Chat eliminado correctamente' });
        } else {
            res.status(404).json({ error: 'Chat no encontrado' });
        }
    } catch (error) {
        console.error('Error eliminando chat:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener estadísticas de chat
router.get('/user/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = chatService.getChatStats(userId);
        res.json(stats);
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Buscar mensajes
router.get('/search/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { q: query, limit = 50 } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
        }

        const messages = chatService.searchMessages(userId, query, parseInt(limit));
        res.json(messages);
    } catch (error) {
        console.error('Error buscando mensajes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Exportar chat
router.get('/:chatId/export', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { format = 'json' } = req.query;
        
        const exportData = chatService.exportChat(chatId, format);
        
        // Configurar headers según el formato
        const contentType = {
            'json': 'application/json',
            'csv': 'text/csv',
            'markdown': 'text/markdown'
        }[format] || 'application/json';

        const filename = `chat-export-${chatId}.${format}`;
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(exportData);
    } catch (error) {
        console.error('Error exportando chat:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
