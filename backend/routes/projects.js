const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// ========== PROJECTS ==========

// Get all projects
router.get('/', (req, res) => {
    try {
        const { status, skills } = req.query;

        let query = `
            SELECT p.*, s.name as startup_name, s.description as startup_description
            FROM projects p
            LEFT JOIN startups s ON p.startup_id = s.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }

        query += ' ORDER BY p.created_at DESC';

        const projects = db.prepare(query).all(...params);

        // Filter by skills if provided
        let filteredProjects = projects;
        if (skills) {
            const skillsArray = skills.split(',');
            filteredProjects = projects.filter(project => {
                const projectSkills = JSON.parse(project.required_skills || '[]');
                return skillsArray.some(skill =>
                    projectSkills.some(ps => ps.toLowerCase().includes(skill.toLowerCase()))
                );
            });
        }

        res.json({ projects: filteredProjects });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Get project by ID
router.get('/:id', (req, res) => {
    try {
        const project = db.prepare(`
            SELECT p.*, s.name as startup_name, s.description as startup_description,
                   u.name as founder_name, u.email as founder_email
            FROM projects p
            LEFT JOIN startups s ON p.startup_id = s.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE p.id = ?
        `).get(req.params.id);

        if (!project) {
            return res.status(404).json({ error: { message: 'Project not found' } });
        }

        res.json({ project });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Create project
router.post('/', authenticateToken, (req, res) => {
    try {
        const { startup_id, title, description, equity_offered, salary_offered, required_skills, milestones, deadline } = req.body;

        if (!startup_id || !title) {
            return res.status(400).json({ error: { message: 'Missing required fields' } });
        }

        const result = db.prepare(`
            INSERT INTO projects (startup_id, title, description, equity_offered, salary_offered, required_skills, milestones, deadline)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            startup_id,
            title,
            description,
            equity_offered || 0,
            salary_offered || 0,
            JSON.stringify(required_skills || []),
            JSON.stringify(milestones || []),
            deadline
        );

        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({ project });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Update project
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const { title, description, equity_offered, salary_offered, required_skills, milestones, status, deadline } = req.body;

        const updates = [];
        const params = [];

        if (title) {
            updates.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (equity_offered !== undefined) {
            updates.push('equity_offered = ?');
            params.push(equity_offered);
        }
        if (salary_offered !== undefined) {
            updates.push('salary_offered = ?');
            params.push(salary_offered);
        }
        if (required_skills) {
            updates.push('required_skills = ?');
            params.push(JSON.stringify(required_skills));
        }
        if (milestones) {
            updates.push('milestones = ?');
            params.push(JSON.stringify(milestones));
        }
        if (status) {
            updates.push('status = ?');
            params.push(status);
        }
        if (deadline) {
            updates.push('deadline = ?');
            params.push(deadline);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: { message: 'No fields to update' } });
        }

        params.push(req.params.id);
        db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...params);

        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);

        res.json({ project });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Delete project
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== PORTFOLIOS ==========

// Get portfolios for a user
router.get('/portfolios/user/:userId', (req, res) => {
    try {
        const portfolios = db.prepare(`
            SELECT * FROM portfolios
            WHERE user_id = ?
            ORDER BY created_at DESC
        `).all(req.params.userId);

        res.json({ portfolios });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Create portfolio
router.post('/portfolios', authenticateToken, (req, res) => {
    try {
        const { title, description, images, links, skills_used } = req.body;

        if (!title) {
            return res.status(400).json({ error: { message: 'Title is required' } });
        }

        const result = db.prepare(`
            INSERT INTO portfolios (user_id, title, description, images, links, skills_used)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            req.user.id,
            title,
            description,
            JSON.stringify(images || []),
            JSON.stringify(links || []),
            JSON.stringify(skills_used || [])
        );

        const portfolio = db.prepare('SELECT * FROM portfolios WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({ portfolio });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Update portfolio
router.put('/portfolios/:id', authenticateToken, (req, res) => {
    try {
        const { title, description, images, links, skills_used } = req.body;

        const updates = [];
        const params = [];

        if (title) {
            updates.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (images) {
            updates.push('images = ?');
            params.push(JSON.stringify(images));
        }
        if (links) {
            updates.push('links = ?');
            params.push(JSON.stringify(links));
        }
        if (skills_used) {
            updates.push('skills_used = ?');
            params.push(JSON.stringify(skills_used));
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: { message: 'No fields to update' } });
        }

        params.push(req.params.id);
        db.prepare(`UPDATE portfolios SET ${updates.join(', ')} WHERE id = ?`).run(...params);

        const portfolio = db.prepare('SELECT * FROM portfolios WHERE id = ?').get(req.params.id);

        res.json({ portfolio });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Delete portfolio
router.delete('/portfolios/:id', authenticateToken, (req, res) => {
    try {
        db.prepare('DELETE FROM portfolios WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

module.exports = router;
