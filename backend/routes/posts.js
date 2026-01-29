const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all posts (feed)
router.get('/', (req, res) => {
    try {
        const db = getDatabase();
        const posts = db.prepare(`
            SELECT p.*, u.name as author_name, u.avatar_url
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 50
        `).all();

        res.json({ posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create post
router.post('/', authenticateToken, (req, res) => {
    try {
        const { content } = req.body;
        const db = getDatabase();
        const id = uuidv4();

        db.prepare(`
            INSERT INTO posts (id, user_id, content)
            VALUES (?, ?, ?)
        `).run(id, req.user.id, content);

        const post = db.prepare(`
            SELECT p.*, u.name as author_name
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `).get(id);

        res.status(201).json({ message: 'Post created', post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like post
router.post('/:id/like', authenticateToken, (req, res) => {
    try {
        const db = getDatabase();
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        let likes = JSON.parse(post.likes || '[]');
        const index = likes.indexOf(req.user.id);

        if (index > -1) {
            likes.splice(index, 1);
        } else {
            likes.push(req.user.id);
        }

        db.prepare('UPDATE posts SET likes = ? WHERE id = ?').run(JSON.stringify(likes), req.params.id);

        res.json({ message: 'Like toggled', likes: likes.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Comment on post
router.post('/:id/comment', authenticateToken, (req, res) => {
    try {
        const { content } = req.body;
        const db = getDatabase();
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        let comments = JSON.parse(post.comments || '[]');
        comments.push({
            id: uuidv4(),
            user_id: req.user.id,
            content,
            created_at: new Date().toISOString()
        });

        db.prepare('UPDATE posts SET comments = ? WHERE id = ?').run(JSON.stringify(comments), req.params.id);

        res.json({ message: 'Comment added', comments: comments.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
