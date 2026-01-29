# 🚀 How to Run STARTLABX Application

## Quick Start (Easiest Way)

**Double-click:** `START_APP.bat`

This will automatically:
1. ✅ Start backend server on port 3000
2. ✅ Start frontend server on port 8000  
3. ✅ Open browser to http://localhost:8000

---

## Manual Start

### Step 1: Start Backend

Open Terminal/PowerShell and run:
```bash
cd backend
npm install  # Only needed first time
node server.js
```

**Expected output:**
```
✅ Database initialized successfully!
✅ Database indexes created!
🚀 STARTLABX API Server Running
Port: 3000
Environment: development
URL: http://localhost:3000
```

### Step 2: Start Frontend

Open a **NEW** Terminal/PowerShell and run:
```bash
cd frontend
python -m http.server 8000
```

**OR** if you don't have Python:
```bash
cd frontend
npx http-server -p 8000
```

### Step 3: Open Browser

Navigate to: **http://localhost:8000**

---

## Verify It's Working

### Backend Health Check
Open browser or use curl:
```
http://localhost:3000/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 123.45,
  "environment": "development",
  "database": "ok",
  "version": "3.0.0"
}
```

### Frontend
- Should show landing page
- Click "Get Started" to register
- Login works
- Dashboard loads

---

## Troubleshooting

### Backend won't start?

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Need Node.js 18 or higher

2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Check port 3000 is free:**
   ```bash
   netstat -ano | findstr :3000
   ```
   If something is using it, change PORT in `.env`

4. **Check .env file exists:**
   ```bash
   cd backend
   # Should have .env file
   ```

### Frontend won't load?

1. **Check backend is running:**
   - Visit http://localhost:3000/health
   - Should return JSON

2. **Check browser console (F12):**
   - Look for errors
   - Check API calls

3. **Verify Python/http-server:**
   ```bash
   python --version
   # OR
   npx http-server --version
   ```

### Database errors?

- SQLite file is created automatically
- Check `backend/database.sqlite` exists
- For production, use PostgreSQL

---

## What You'll See

### Landing Page
- Beautiful hero section
- 6 feature cards
- "Get Started" button

### After Registration/Login
- Dashboard with stats
- Activity timeline
- Quick actions
- AI insights

### Navigation
- **Marketplace** - Browse projects
- **Network** - Find professionals  
- **Messages** - Chat with users
- **AI Tools** - 9 AI features

---

## Test the API

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test1234\",\"name\":\"Test User\",\"role\":\"FOUNDER\"}"
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test1234\"}"
```

### Get Projects
```bash
curl http://localhost:3000/api/projects
```

---

## Stop the Servers

### If using START_APP.bat
- Close the two command windows that opened

### If started manually
- Press `Ctrl+C` in each terminal
- Or close the terminal windows

---

## Next Steps

1. ✅ **Test the app** - Try all features
2. ✅ **Create accounts** - Register as Founder and Professional
3. ✅ **Explore features** - Marketplace, Network, Messages, AI Tools
4. ✅ **Customize** - Update colors, branding in `frontend/styles.css`
5. ✅ **Deploy** - Follow `PRODUCTION_DEPLOYMENT.md`

---

## 🎉 You're Ready!

Your STARTLABX platform is running!

**Access it:** http://localhost:8000

**API:** http://localhost:3000

**Health:** http://localhost:3000/health

---

*Enjoy your production-ready startup platform!* 🚀
