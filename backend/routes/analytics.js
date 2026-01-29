const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get dashboard analytics
router.get('/dashboard', authenticateToken, (req, res) => {
    try {
        const db = getDatabase();

        // Get counts
        const startupCount = db.prepare('SELECT COUNT(*) as count FROM startups WHERE user_id = ?').get(req.user.id);
        const connectionCount = db.prepare('SELECT COUNT(*) as count FROM connections WHERE (user_id_1 = ? OR user_id_2 = ?) AND status = "accepted"').get(req.user.id, req.user.id);
        const postCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(req.user.id);

        // Get total views
        const views = db.prepare('SELECT SUM(views) as total FROM startups WHERE user_id = ?').get(req.user.id);

        res.json({
            stats: {
                projects: startupCount.count,
                connections: connectionCount.count,
                posts: postCount.count,
                views: views.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get startup analytics
router.get('/startup/:id', authenticateToken, (req, res) => {
    try {
        const db = getDatabase();
        const startup = db.prepare('SELECT * FROM startups WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);

        if (!startup) {
            return res.status(404).json({ error: 'Startup not found' });
        }

        res.json({
            analytics: {
                views: startup.views,
                progress: startup.progress,
                team_size: startup.team_size,
                created_at: startup.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
