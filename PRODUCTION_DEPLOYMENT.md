# 🚀 STARTLABX - Production Deployment Guide

Complete guide to deploying STARTLABX to production.

---

## 📋 Pre-Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Generate strong JWT_SECRET (min 32 characters)
- [ ] Set NODE_ENV=production
- [ ] Configure CORS with production frontend URL
- [ ] Set up database (SQLite for small scale, PostgreSQL recommended for production)
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all endpoints
- [ ] Load testing

---

## 🔧 Environment Configuration

### 1. Backend `.env` Setup

Copy `.env.example` to `.env` and configure:

```bash
# Production Server
PORT=3000
NODE_ENV=production

# Database (SQLite for small scale)
DB_PATH=./database.sqlite

# For PostgreSQL (recommended for production):
# DATABASE_URL=postgresql://user:password@host:5432/startlabx

# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET=<your-strong-random-secret-min-32-chars>
JWT_EXPIRES_IN=7d

# CORS - Your production frontend domain(s)
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting (stricter for production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

### 2. Frontend Configuration

Update `frontend/app.js` CONFIG object or use environment variables:

```javascript
const CONFIG = {
    API_BASE_URL: process.env.API_BASE_URL || 'https://api.yourdomain.com/api',
    // ... rest of config
};
```

---

## 🐳 Deployment Options

### Option 1: Railway.app (Recommended - Easiest)

**Backend:**
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `cd backend && railway init`
4. Set environment variables in Railway dashboard
5. Deploy: `railway up`

**Frontend:**
1. Use Railway static hosting or Vercel/Netlify
2. Set environment variable: `API_BASE_URL=https://your-backend.railway.app/api`
3. Deploy

### Option 2: Heroku

**Backend:**
```bash
cd backend
heroku create startlabx-api
heroku addons:create heroku-postgresql:hobby-dev  # Optional: PostgreSQL
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set FRONTEND_URL=https://yourdomain.com
git push heroku main
```

**Frontend:**
- Deploy to Vercel, Netlify, or Heroku static hosting
- Set `API_BASE_URL` environment variable

### Option 3: Docker

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Build & Run:**
```bash
cd backend
docker build -t startlabx-api .
docker run -p 3000:3000 --env-file .env startlabx-api
```

**Docker Compose (with PostgreSQL):**
```yaml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/startlabx
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=startlabx
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Option 4: AWS/GCP/Azure

**AWS (EC2 + RDS):**
1. Launch EC2 instance (Ubuntu 22.04)
2. Install Node.js 18+
3. Set up RDS PostgreSQL instance
4. Clone repo and configure `.env`
5. Use PM2: `pm2 start server.js --name startlabx-api`
6. Configure Nginx reverse proxy
7. Set up SSL with Let's Encrypt

**GCP (Cloud Run):**
1. Build container: `gcloud builds submit --tag gcr.io/PROJECT/startlabx-api`
2. Deploy: `gcloud run deploy startlabx-api --image gcr.io/PROJECT/startlabx-api`
3. Set environment variables in Cloud Run console

---

## 🔒 Security Checklist

- [x] Helmet.js security headers configured
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] JWT authentication implemented
- [x] Password hashing (bcrypt, 12 rounds)
- [x] Input validation middleware
- [x] SQL injection protection (parameterized queries)
- [x] Error handling (no stack traces in production)
- [ ] HTTPS/SSL enabled
- [ ] Database backups configured
- [ ] API keys stored securely (not in code)
- [ ] Regular security updates

---

## 📊 Monitoring & Logging

### Health Checks

- **Health:** `GET /health` - Returns server status
- **Readiness:** `GET /ready` - Returns database readiness

### Logging

The app uses a custom logger utility. For production, consider:

1. **Winston** (structured logging)
2. **Sentry** (error tracking)
3. **DataDog** / **New Relic** (APM)

Example Winston setup:
```javascript
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

---

## 🗄️ Database Setup

### SQLite (Development/Small Scale)

Already configured. Database file: `backend/database.sqlite`

**Backup:**
```bash
cp database.sqlite database.sqlite.backup
```

### PostgreSQL (Production Recommended)

1. Install PostgreSQL
2. Create database: `CREATE DATABASE startlabx;`
3. Update `.env`: `DATABASE_URL=postgresql://user:pass@host:5432/startlabx`
4. Run migrations (if you add a migration system)

**Connection Pooling:**
```javascript
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
```

---

## 🚀 Performance Optimization

### Backend

1. **Database Indexes** - Already added for common queries
2. **Connection Pooling** - For PostgreSQL
3. **Caching** - Consider Redis for frequently accessed data
4. **CDN** - For static assets
5. **Compression** - Add `compression` middleware

```javascript
const compression = require('compression');
app.use(compression());
```

### Frontend

1. **Minification** - Minify JS/CSS for production
2. **Code Splitting** - Lazy load routes/components
3. **Image Optimization** - Compress images
4. **Caching** - Set appropriate cache headers
5. **Service Worker** - For offline support

---

## 📈 Scaling Considerations

### Horizontal Scaling

- Use load balancer (Nginx, AWS ALB)
- Stateless API design (already implemented)
- Shared database (PostgreSQL recommended)
- Session storage (Redis for JWT blacklist if needed)

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Add caching layer (Redis)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm test  # If you add tests
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🧪 Testing Before Production

1. **Load Testing:**
   ```bash
   npm install -g artillery
   artillery quick --count 10 --num 50 http://localhost:3000/health
   ```

2. **Security Testing:**
   - OWASP ZAP
   - npm audit
   - Check for exposed secrets

3. **Functionality Testing:**
   - Test all API endpoints
   - Test authentication flows
   - Test error scenarios

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Errors:**
- Check database is running
- Verify connection string
- Check firewall rules

**CORS Errors:**
- Verify FRONTEND_URL in `.env`
- Check CORS middleware configuration

**Rate Limiting:**
- Adjust `RATE_LIMIT_MAX_REQUESTS` if needed
- Check if behind proxy (may need `trust proxy`)

**JWT Errors:**
- Verify JWT_SECRET is set
- Check token expiration
- Ensure token is sent in Authorization header

---

## ✅ Post-Deployment

1. Monitor `/health` endpoint
2. Set up uptime monitoring (UptimeRobot, Pingdom)
3. Configure error alerts (Sentry, etc.)
4. Set up database backups
5. Document API endpoints for team
6. Set up analytics (Google Analytics, etc.)

---

## 🎉 You're Live!

Your STARTLABX platform is now production-ready and deployed!

**Next Steps:**
- Monitor performance
- Gather user feedback
- Iterate and improve
- Scale as needed

---

*For support, check the main README.md or open an issue.*
