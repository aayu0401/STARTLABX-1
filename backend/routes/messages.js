const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// ========== DIRECT MESSAGES ==========

// Get conversations for a user
router.get('/conversations', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;

        // Get unique conversations
        const conversations = db.prepare(`
            SELECT DISTINCT
                CASE 
                    WHEN sender_id = ? THEN receiver_id
                    ELSE sender_id
                END as other_user_id,
                u.name as other_user_name,
                u.avatar_url,
                (SELECT content FROM messages 
                 WHERE (sender_id = ? AND receiver_id = other_user_id) 
                    OR (sender_id = other_user_id AND receiver_id = ?)
                 ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM messages 
                 WHERE (sender_id = ? AND receiver_id = other_user_id) 
                    OR (sender_id = other_user_id AND receiver_id = ?)
                 ORDER BY created_at DESC LIMIT 1) as last_message_time,
                (SELECT COUNT(*) FROM messages 
                 WHERE sender_id = other_user_id AND receiver_id = ? AND read = 0) as unread_count
            FROM messages m
            LEFT JOIN users u ON u.id = CASE 
                WHEN m.sender_id = ? THEN m.receiver_id
                ELSE m.sender_id
            END
            WHERE sender_id = ? OR receiver_id = ?
            ORDER BY last_message_time DESC
        `).all(userId, userId, userId, userId, userId, userId, userId, userId, userId);

        res.json({ conversations });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Get messages between two users
router.get('/direct/:otherUserId', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.otherUserId;

        const messages = db.prepare(`
            SELECT m.*, 
                   sender.name as sender_name,
                   sender.avatar_url as sender_avatar
            FROM messages m
            LEFT JOIN users sender ON m.sender_id = sender.id
            WHERE (sender_id = ? AND receiver_id = ?)
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `).all(userId, otherUserId, otherUserId, userId);

        // Mark messages as read
        db.prepare(`
            UPDATE messages 
            SET read = 1 
            WHERE sender_id = ? AND receiver_id = ? AND read = 0
        `).run(otherUserId, userId);

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Send direct message
router.post('/direct', authenticateToken, (req, res) => {
    try {
        const { receiver_id, content, type } = req.body;

        if (!receiver_id || !content) {
            return res.status(400).json({ error: { message: 'Missing required fields' } });
        }

        const result = db.prepare(`
            INSERT INTO messages (sender_id, receiver_id, content, type)
            VALUES (?, ?, ?, ?)
        `).run(req.user.id, receiver_id, content, type || 'TEXT');

        const message = db.prepare(`
            SELECT m.*, 
                   sender.name as sender_name,
                   sender.avatar_url as sender_avatar
            FROM messages m
            LEFT JOIN users sender ON m.sender_id = sender.id
            WHERE m.id = ?
        `).get(result.lastInsertRowid);

        // Create notification
        db.prepare(`
            INSERT INTO notifications (id, user_id, type, title, message)
            VALUES (?, ?, 'MESSAGE', 'New Message', ?)
        `).run(
            `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            receiver_id,
            `${req.user.name} sent you a message`
        );

        res.status(201).json({ message });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== CHANNELS ==========

// Get channels for a startup
router.get('/channels/startup/:startupId', authenticateToken, (req, res) => {
    try {
        const channels = db.prepare(`
            SELECT * FROM channels
            WHERE startup_id = ?
            ORDER BY created_at DESC
        `).all(req.params.startupId);

        res.json({ channels });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Get messages in a channel
router.get('/channels/:channelId/messages', authenticateToken, (req, res) => {
    try {
        const messages = db.prepare(`
            SELECT m.*, 
                   sender.name as sender_name,
                   sender.avatar_url as sender_avatar
            FROM messages m
            LEFT JOIN users sender ON m.sender_id = sender.id
            WHERE m.channel_id = ?
            ORDER BY created_at ASC
        `).all(req.params.channelId);

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Create channel
router.post('/channels', authenticateToken, (req, res) => {
    try {
        const { startup_id, name, description, type, members } = req.body;

        if (!startup_id || !name) {
            return res.status(400).json({ error: { message: 'Missing required fields' } });
        }

        const result = db.prepare(`
            INSERT INTO channels (startup_id, name, description, type, members)
            VALUES (?, ?, ?, ?, ?)
        `).run(startup_id, name, description, type || 'PUBLIC', JSON.stringify(members || []));

        const channel = db.prepare('SELECT * FROM channels WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({ channel });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Send message to channel
router.post('/channels/:channelId/messages', authenticateToken, (req, res) => {
    try {
        const { content, type } = req.body;

        if (!content) {
            return res.status(400).json({ error: { message: 'Content is required' } });
        }

        const result = db.prepare(`
            INSERT INTO messages (sender_id, channel_id, content, type)
            VALUES (?, ?, ?, ?)
        `).run(req.user.id, req.params.channelId, content, type || 'TEXT');

        const message = db.prepare(`
            SELECT m.*, 
                   sender.name as sender_name,
                   sender.avatar_url as sender_avatar
            FROM messages m
            LEFT JOIN users sender ON m.sender_id = sender.id
            WHERE m.id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json({ message });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Mark messages as read
router.put('/messages/:messageId/read', authenticateToken, (req, res) => {
    try {
        db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(req.params.messageId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

module.exports = router;
