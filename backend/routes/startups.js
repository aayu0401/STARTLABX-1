const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all startups
router.get('/', (req, res) => {
    try {
        const db = getDatabase();
        const startups = db.prepare(`
            SELECT s.*, u.name as owner_name, u.email as owner_email
            FROM startups s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `).all();

        res.json({ startups });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get startup by ID
router.get('/:id', (req, res) => {
    try {
        const db = getDatabase();
        const startup = db.prepare(`
            SELECT s.*, u.name as owner_name
            FROM startups s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ?
        `).get(req.params.id);

        if (!startup) {
            return res.status(404).json({ error: 'Startup not found' });
        }

        // Increment views
        db.prepare('UPDATE startups SET views = views + 1 WHERE id = ?').run(req.params.id);

        res.json({ startup });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create startup
router.post('/', authenticateToken, (req, res) => {
    try {
        const { name, description, stage, team_size, funding } = req.body;
        const db = getDatabase();
        const id = uuidv4();

        db.prepare(`
            INSERT INTO startups (id, user_id, name, description, stage, team_size, funding)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, req.user.id, name, description, stage, team_size || 1, funding);

        const startup = db.prepare('SELECT * FROM startups WHERE id = ?').get(id);
        res.status(201).json({ message: 'Startup created', startup });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update startup
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const db = getDatabase();
        const startup = db.prepare('SELECT * FROM startups WHERE id = ?').get(req.params.id);

        if (!startup) {
            return res.status(404).json({ error: 'Startup not found' });
        }

        if (startup.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { name, description, stage, team_size, funding, progress } = req.body;

        db.prepare(`
            UPDATE startups 
            SET name = ?, description = ?, stage = ?, team_size = ?, funding = ?, progress = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(name, description, stage, team_size, funding, progress, req.params.id);

        const updated = db.prepare('SELECT * FROM startups WHERE id = ?').get(req.params.id);
        res.json({ message: 'Startup updated', startup: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete startup
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const db = getDatabase();
        const startup = db.prepare('SELECT * FROM startups WHERE id = ?').get(req.params.id);

        if (!startup) {
            return res.status(404).json({ error: 'Startup not found' });
        }

        if (startup.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        db.prepare('DELETE FROM startups WHERE id = ?').run(req.params.id);
        res.json({ message: 'Startup deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
