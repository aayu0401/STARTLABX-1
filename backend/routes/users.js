const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get user profile
router.get('/:id', (req, res) => {
    try {
        const db = getDatabase();
        const user = db.prepare('SELECT id, email, name, role, avatar_url, bio, skills FROM users WHERE id = ?').get(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.put('/:id', authenticateToken, (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { name, bio, skills } = req.body;
        const db = getDatabase();

        db.prepare(`
            UPDATE users 
            SET name = ?, bio = ?, skills = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(name, bio, JSON.stringify(skills), req.params.id);

        const updated = db.prepare('SELECT id, email, name, role, avatar_url, bio, skills FROM users WHERE id = ?').get(req.params.id);
        res.json({ message: 'Profile updated', user: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
