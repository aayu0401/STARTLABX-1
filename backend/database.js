let Database, db;

try {
    Database = require('better-sqlite3');
    const path = require('path');
    const fs = require('fs');
    const dbPath = process.env.DB_PATH || './database.sqlite';
    db = new Database(dbPath);
    console.log('✅ Using SQLite database');
} catch (error) {
    console.log('⚠️  better-sqlite3 not available, using mock database');
    // Create a mock database object for development
    db = {
        pragma: () => { },
        exec: () => { },
        prepare: (sql) => ({
            run: (...params) => ({ lastInsertRowid: Date.now() }),
            get: (...params) => null,
            all: (...params) => []
        }),
        close: () => { }
    };
}

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
    console.log('🗄️  Initializing database...');

    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('FOUNDER', 'PROFESSIONAL')),
            avatar_url TEXT,
            bio TEXT,
            skills TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Startups table
    db.exec(`
        CREATE TABLE IF NOT EXISTS startups (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            stage TEXT,
            team_size INTEGER DEFAULT 1,
            funding TEXT,
            progress INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Professionals table
    db.exec(`
        CREATE TABLE IF NOT EXISTS professionals (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL,
            experience TEXT,
            rate TEXT,
            skills TEXT,
            availability BOOLEAN DEFAULT 1,
            score INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Posts table
    db.exec(`
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            likes TEXT DEFAULT '[]',
            comments TEXT DEFAULT '[]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Connections table
    db.exec(`
        CREATE TABLE IF NOT EXISTS connections (
            id TEXT PRIMARY KEY,
            user_id_1 TEXT NOT NULL,
            user_id_2 TEXT NOT NULL,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Notifications table
    db.exec(`
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Equity Offers table
    db.exec(`
        CREATE TABLE IF NOT EXISTS equity_offers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            startup_id TEXT NOT NULL,
            professional_id TEXT NOT NULL,
            equity_percentage REAL NOT NULL,
            vesting_period INTEGER DEFAULT 48,
            cliff_period INTEGER DEFAULT 12,
            role TEXT,
            salary REAL DEFAULT 0,
            status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
            FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Cap Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS cap_table (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            startup_id TEXT NOT NULL,
            stakeholder_id TEXT NOT NULL,
            stakeholder_type TEXT CHECK(stakeholder_type IN ('FOUNDER', 'EMPLOYEE', 'INVESTOR', 'ADVISOR')),
            equity_percentage REAL NOT NULL,
            vesting_start DATETIME,
            vesting_end DATETIME,
            cliff_months INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
            FOREIGN KEY (stakeholder_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Messages table (for real-time chat)
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id TEXT NOT NULL,
            receiver_id TEXT,
            channel_id INTEGER,
            content TEXT NOT NULL,
            type TEXT DEFAULT 'TEXT' CHECK(type IN ('TEXT', 'FILE', 'IMAGE', 'SYSTEM')),
            read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Channels table (for team communication)
    db.exec(`
        CREATE TABLE IF NOT EXISTS channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            startup_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            type TEXT DEFAULT 'PUBLIC' CHECK(type IN ('PUBLIC', 'PRIVATE', 'DIRECT')),
            members TEXT DEFAULT '[]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE
        )
    `);

    // Projects table (for marketplace)
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            startup_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            equity_offered REAL,
            salary_offered REAL DEFAULT 0,
            required_skills TEXT,
            milestones TEXT DEFAULT '[]',
            status TEXT DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED')),
            deadline DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE
        )
    `);

    // Portfolios table (for professionals)
    db.exec(`
        CREATE TABLE IF NOT EXISTS portfolios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            images TEXT DEFAULT '[]',
            links TEXT DEFAULT '[]',
            skills_used TEXT DEFAULT '[]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create indexes for performance
    console.log('📊 Creating database indexes...');
    
    // User indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    
    // Startup indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_startups_stage ON startups(stage)');
    
    // Professional indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_professionals_availability ON professionals(availability)');
    
    // Message indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)');
    
    // Connection indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_connections_user1 ON connections(user_id_1)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_connections_user2 ON connections(user_id_2)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status)');
    
    // Project indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_projects_startup ON projects(startup_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at)');
    
    // Equity indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_equity_startup ON equity_offers(startup_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_equity_professional ON equity_offers(professional_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_equity_status ON equity_offers(status)');
    
    // Notification indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)');
    
    console.log('✅ Database initialized successfully!');
    console.log('✅ Database indexes created!');
}

// Get database instance
function getDatabase() {
    return db;
}

// Close database connection
function closeDatabase() {
    db.close();
}

module.exports = db;
module.exports.initializeDatabase = initializeDatabase;
module.exports.getDatabase = getDatabase;
module.exports.closeDatabase = closeDatabase;
