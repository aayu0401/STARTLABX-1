const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseUtil = require('../utils/response.util');
const logger = require('../utils/logger.util');

// Register
router.post('/register', validateRegister, asyncHandler(async (req, res) => {
    const { email, password, name, role } = req.body;

    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (existing) {
        return ResponseUtil.conflict(res, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12); // Increased rounds for production
    const userId = uuidv4();

    db.prepare(`
        INSERT INTO users (id, email, password_hash, name, role)
        VALUES (?, ?, ?, ?, ?)
    `).run(userId, email, passwordHash, name, role);

    const token = jwt.sign({ id: userId, email, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    logger.info(`New user registered: ${email} (${role})`);

    ResponseUtil.created(res, {
        token,
        user: { id: userId, email, name, role }
    }, 'User registered successfully');
}));

// Login
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
        logger.warning(`Failed login attempt for email: ${email}`);
        return ResponseUtil.unauthorized(res, 'Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
        logger.warning(`Failed login attempt for email: ${email}`);
        return ResponseUtil.unauthorized(res, 'Invalid credentials');
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`User logged in: ${email}`);

    ResponseUtil.success(res, {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar_url: user.avatar_url
        }
    }, 'Login successful');
}));

// Get current user
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
    const db = getDatabase();
    const user = db.prepare('SELECT id, email, name, role, avatar_url, bio, skills, created_at FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
        return ResponseUtil.notFound(res, 'User not found');
    }

    ResponseUtil.success(res, { user }, 'User retrieved successfully');
}));

module.exports = router;
