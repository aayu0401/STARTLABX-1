const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get user connections
router.get('/', authenticateToken, (req, res) => {
    try {
        const db = getDatabase();
        const connections = db.prepare(`
            SELECT c.*, 
                   u1.name as user1_name, u1.email as user1_email,
                   u2.name as user2_name, u2.email as user2_email
            FROM connections c
            JOIN users u1 ON c.user_id_1 = u1.id
            JOIN users u2 ON c.user_id_2 = u2.id
            WHERE c.user_id_1 = ? OR c.user_id_2 = ?
            ORDER BY c.created_at DESC
        `).all(req.user.id, req.user.id);

        res.json({ connections });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send connection request
router.post('/', authenticateToken, (req, res) => {
    try {
        const { user_id } = req.body;
        const db = getDatabase();
        const id = uuidv4();

        db.prepare(`
            INSERT INTO connections (id, user_id_1, user_id_2, status)
            VALUES (?, ?, ?, 'pending')
        `).run(id, req.user.id, user_id);

        // Create notification
        const notifId = uuidv4();
        db.prepare(`
            INSERT INTO notifications (id, user_id, type, content, icon)
            VALUES (?, ?, 'connection', 'New connection request', 'person_add')
        `).run(notifId, user_id);

        res.status(201).json({ message: 'Connection request sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accept/Reject connection
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const { status } = req.body;
        const db = getDatabase();

        db.prepare('UPDATE connections SET status = ? WHERE id = ?').run(status, req.params.id);

        res.json({ message: `Connection ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
