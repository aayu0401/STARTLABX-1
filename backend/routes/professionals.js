const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all professionals
router.get('/', (req, res) => {
    try {
        const db = getDatabase();
        const professionals = db.prepare(`
            SELECT p.*, u.name, u.email, u.avatar_url
            FROM professionals p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.score DESC
        `).all();

        res.json({ professionals });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get professional by ID
router.get('/:id', (req, res) => {
    try {
        const db = getDatabase();
        const professional = db.prepare(`
            SELECT p.*, u.name, u.email, u.avatar_url, u.bio
            FROM professionals p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `).get(req.params.id);

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        res.json({ professional });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create/Update professional profile
router.post('/', authenticateToken, (req, res) => {
    try {
        const { role, experience, rate, skills, availability } = req.body;
        const db = getDatabase();

        const existing = db.prepare('SELECT * FROM professionals WHERE user_id = ?').get(req.user.id);

        if (existing) {
            db.prepare(`
                UPDATE professionals 
                SET role = ?, experience = ?, rate = ?, skills = ?, availability = ?
                WHERE user_id = ?
            `).run(role, experience, rate, JSON.stringify(skills), availability ? 1 : 0, req.user.id);

            const updated = db.prepare('SELECT * FROM professionals WHERE user_id = ?').get(req.user.id);
            return res.json({ message: 'Profile updated', professional: updated });
        }

        const id = uuidv4();
        db.prepare(`
            INSERT INTO professionals (id, user_id, role, experience, rate, skills, availability)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, req.user.id, role, experience, rate, JSON.stringify(skills), availability ? 1 : 0);

        const professional = db.prepare('SELECT * FROM professionals WHERE id = ?').get(id);
        res.status(201).json({ message: 'Profile created', professional });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
