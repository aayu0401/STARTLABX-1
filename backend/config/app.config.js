// Application Configuration
require('dotenv').config();

module.exports = {
    // Server
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },

    // CORS
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:8000',
        credentials: true
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },

    // Pagination
    pagination: {
        defaultLimit: 20,
        maxLimit: 100
    },

    // File Upload
    upload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    }
};
