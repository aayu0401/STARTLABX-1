require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger.util');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database
initializeDatabase();

// Security middleware - Production hardened
app.use(helmet({
    contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL?.split(',') || ['http://localhost:8000']
        : process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Rate limiting - Stricter for production
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: NODE_ENV === 'production' 
        ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50
        : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: NODE_ENV === 'production' ? 5 : 10, // Limit each IP to 5 requests per windowMs
    skipSuccessfulRequests: true
});

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/startups', require('./routes/startups'));
app.use('/api/professionals', require('./routes/professionals'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/equity', require('./routes/equity'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/projects', require('./routes/projects'));

// Enhanced health check endpoint
app.get('/health', (req, res) => {
    const db = require('./database').getDatabase();
    let dbStatus = 'ok';
    try {
        db.prepare('SELECT 1').get();
    } catch (error) {
        dbStatus = 'error';
        logger.error('Database health check failed:', error);
    }

    res.status(dbStatus === 'ok' ? 200 : 503).json({
        status: dbStatus === 'ok' ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        database: dbStatus,
        version: '3.0.0'
    });
});

// Readiness check for Kubernetes/Docker
app.get('/ready', (req, res) => {
    const db = require('./database').getDatabase();
    try {
        db.prepare('SELECT 1').get();
        res.status(200).json({ ready: true });
    } catch (error) {
        res.status(503).json({ ready: false, error: 'Database not ready' });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'STARTLABX API Server - Equity-Based Startup Platform',
        version: '2.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            startups: '/api/startups',
            professionals: '/api/professionals',
            posts: '/api/posts',
            connections: '/api/connections',
            notifications: '/api/notifications',
            analytics: '/api/analytics',
            ai: '/api/ai',
            equity: '/api/equity',
            messages: '/api/messages',
            projects: '/api/projects'
        }
    });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    const { closeDatabase } = require('./database');
    closeDatabase();
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    const { closeDatabase } = require('./database');
    closeDatabase();
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
    logger.success(`🚀 STARTLABX API Server Running`);
    logger.info(`Port: ${PORT}`);
    logger.info(`Environment: ${NODE_ENV}`);
    logger.info(`URL: http://localhost:${PORT}`);
    logger.info(`Health Check: http://localhost:${PORT}/health`);
    
    if (NODE_ENV === 'development') {
        console.log(`
╔═══════════════════════════════════════╗
║   🚀 STARTLABX API Server Running    ║
║                                       ║
║   Port: ${PORT}                        ║
║   Environment: ${NODE_ENV}            ║
║   URL: http://localhost:${PORT}        ║
╚═══════════════════════════════════════╝
        `);
    }
});

module.exports = app;

module.exports = app;
