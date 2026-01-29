// ============================================
// STARTLABX - Complete Application
// Premium Frontend with All Features
// ============================================

// Configuration
const CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : `${window.location.protocol}//${window.location.hostname}:${window.location.port || ''}/api`,
    APP_NAME: 'STARTLABX',
    VERSION: '3.0.0',
    STORAGE_KEY: 'startlabx_auth'
};

// ============================================
// STATE MANAGEMENT
// ============================================
class StateManager {
    constructor() {
        this.state = {
            user: null,
            isAuthenticated: false,
            currentView: 'landing',
            notifications: [],
            loading: false,
            marketplaceProjects: [],
            networkProfessionals: [],
            messagesConversations: [],
            activeConversation: null,
            activeConversationMessages: []
        };
        this.listeners = [];
    }

    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notify();
    }

    getState() {
        return { ...this.state };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

const state = new StateManager();

// ============================================
// API SERVICE
// ============================================
class APIService {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: this.getHeaders(),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Handle non-JSON responses
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
            }

            if (!response.ok) {
                // Handle standardized error responses
                const errorMessage = data.message || data.error?.message || `Request failed (${response.status})`;
                const error = new Error(errorMessage);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please try again.');
            }
            
            // Network errors - don't throw, just log for auth check
            if (!error.status && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
                console.warn('Backend not available:', error.message);
                throw new Error('Backend not available');
            }
            
            throw error;
        }
    }

    // Auth
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async getCurrentUser() {
        const response = await this.request('/auth/me');
        // Backend returns {user: {...}} format
        return response;
    }

    // Users
    async getUser(id) {
        return this.request(`/users/${id}`);
    }

    async updateUser(id, data) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Startups
    async getStartups() {
        return this.request('/startups');
    }

    async getStartup(id) {
        return this.request(`/startups/${id}`);
    }

    async createStartup(data) {
        return this.request('/startups', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Professionals
    async getProfessionals() {
        return this.request('/professionals');
    }

    // Connections
    async getConnections() {
        return this.request('/connections');
    }

    async requestConnection(data) {
        return this.request('/connections', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Posts
    async getPosts() {
        return this.request('/posts');
    }

    async createPost(data) {
        return this.request('/posts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async likePost(id) {
        return this.request(`/posts/${id}/like`, {
            method: 'POST'
        });
    }

    // Equity
    async getEquityOffers(type, id) {
        return this.request(`/equity/offers/${type}/${id}`);
    }

    async createEquityOffer(data) {
        return this.request('/equity/offers', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateOfferStatus(id, status) {
        return this.request(`/equity/offers/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async getCapTable(startupId) {
        return this.request(`/equity/cap-table/${startupId}`);
    }

    // Messages
    async getConversations() {
        return this.request('/messages/conversations');
    }

    async getDirectMessages(userId) {
        return this.request(`/messages/direct/${userId}`);
    }

    async sendDirectMessage(data) {
        return this.request('/messages/direct', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Projects
    async getProjects(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/projects?${params}`);
    }

    async createProject(data) {
        return this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // AI Tools
    async aiCopilot({ message, context }) {
        return this.request('/ai/copilot', {
            method: 'POST',
            body: JSON.stringify({ message, context })
        });
    }

    async validateIdea(data) {
        return this.request('/ai/validate-idea', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async generatePitchDeck(data) {
        return this.request('/ai/pitch-deck', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async generateMVPPlan(data) {
        return this.request('/ai/mvp-plan', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async generateContract(data) {
        return this.request('/ai/contract', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async smartMatch(data) {
        return this.request('/ai/smart-match', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async generateBusinessModel(data) {
        return this.request('/ai/business-model', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async marketResearch(data) {
        return this.request('/ai/market-research', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async growthStrategy(data) {
        return this.request('/ai/growth-strategy', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Analytics
    async getDashboardAnalytics() {
        return this.request('/analytics/dashboard');
    }

    // Notifications
    async getNotifications() {
        return this.request('/notifications');
    }

    async markNotificationRead(id) {
        return this.request(`/notifications/${id}/read`, {
            method: 'PUT'
        });
    }
}

const api = new APIService(CONFIG.API_BASE_URL);

// ============================================
// UI COMPONENTS
// ============================================
class UIComponents {
    static showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        }[type];

        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    static showModal(title, content, actions = []) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const actionsHTML = actions.map(action =>
            `<button class="btn ${action.class || 'btn-primary'}" onclick="${action.onclick}">${action.label}</button>`
        ).join('');

        backdrop.innerHTML = `
            <div class="modal">
                <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${actions.length ? `<div class="modal-footer">${actionsHTML}</div>` : ''}
            </div>
        `;

        document.getElementById('modal-container').appendChild(backdrop);

        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.remove();
            }
        });
    }

    static createNavbar(user) {
        if (!user) {
            return `
                <div class="navbar">
                    <div class="navbar-container">
                        <a href="#" class="navbar-brand" onclick="app.navigate('landing')">
                            <i class="fas fa-rocket"></i>
                            <span>STARTLABX</span>
                        </a>
                        <div class="navbar-actions">
                            <button class="btn btn-outline" onclick="app.navigate('login')">Login</button>
                            <button class="btn btn-primary" onclick="app.navigate('register')">Get Started</button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="navbar">
                <div class="navbar-container">
                    <a href="#" class="navbar-brand" onclick="app.navigate('dashboard')">
                        <i class="fas fa-rocket"></i>
                        <span>STARTLABX</span>
                    </a>
                    
                    <div class="navbar-search">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search startups, professionals, projects..." />
                    </div>
                    
                    <ul class="navbar-menu">
                        <li><a href="#" onclick="app.navigate('dashboard')"><i class="fas fa-home"></i> Dashboard</a></li>
                        <li><a href="#" onclick="app.navigate('marketplace')"><i class="fas fa-briefcase"></i> Marketplace</a></li>
                        <li><a href="#" onclick="app.navigate('network')"><i class="fas fa-users"></i> Network</a></li>
                        <li><a href="#" onclick="app.navigate('messages')"><i class="fas fa-comments"></i> Messages</a></li>
                        <li><a href="#" onclick="app.navigate('ai-tools')"><i class="fas fa-robot"></i> AI Tools</a></li>
                    </ul>
                    
                    <div class="navbar-actions">
                        <button class="btn btn-icon btn-glass" onclick="app.navigate('notifications')">
                            <i class="fas fa-bell"></i>
                        </button>
                        <button class="btn btn-icon btn-glass" onclick="app.navigate('profile')">
                            <i class="fas fa-user"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="app.logout()">Logout</button>
                    </div>
                </div>
            </div>
        `;
    }

    static createStatCard(icon, label, value, trend) {
        const trendHTML = trend ? `
            <div class="stat-trend ${trend.direction}">
                <i class="fas fa-arrow-${trend.direction === 'up' ? 'up' : 'down'}"></i>
                ${trend.value}
            </div>
        ` : '';

        return `
            <div class="stat-card animate-slideUp">
                <div class="stat-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-label">${label}</div>
                    <div class="stat-value">${value}</div>
                    ${trendHTML}
                </div>
            </div>
        `;
    }

    static createCard(title, subtitle, content, footer) {
        return `
            <div class="card animate-slideUp">
                <div class="card-header">
                    <h3 class="card-title">${title}</h3>
                    ${subtitle ? `<p class="card-subtitle">${subtitle}</p>` : ''}
                </div>
                <div class="card-body">
                    ${content}
                </div>
                ${footer ? `<div class="card-footer">${footer}</div>` : ''}
            </div>
        `;
    }
}

// ============================================
// VIEWS
// ============================================
class Views {
    static landing() {
        return `
            <div class="landing-page">
                <div class="hero-section text-center" style="padding: 100px 20px;">
                    <h1 class="animate-slideDown" style="font-size: 4rem; font-weight: 900; color: white; margin-bottom: 1.5rem; font-family: var(--font-display);">
                        Build Your Startup<br/>With Equity, Not Cash
                    </h1>
                    <p class="animate-slideUp" style="font-size: 1.5rem; color: rgba(255,255,255,0.9); margin-bottom: 3rem; max-width: 800px; margin-left: auto; margin-right: auto;">
                        The ultimate platform connecting founders with top talent through equity-based collaboration
                    </p>
                    <div class="animate-scaleIn" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary btn-lg" onclick="app.navigate('register')">
                            <i class="fas fa-rocket"></i> Get Started Free
                        </button>
                        <button class="btn btn-outline btn-lg" onclick="app.navigate('login')">
                            <i class="fas fa-sign-in-alt"></i> Sign In
                        </button>
                    </div>
                </div>

                <div class="features-section" style="margin-top: 100px;">
                    <h2 class="text-center" style="font-size: 3rem; color: white; margin-bottom: 3rem; font-weight: 800;">
                        Everything You Need to Succeed
                    </h2>
                    <div class="grid grid-cols-3" style="gap: 2rem;">
                        ${UIComponents.createCard(
            '<i class="fas fa-chart-line"></i> Equity Management',
            'Complete Cap Table Control',
            '<ul style="color: rgba(255,255,255,0.9); line-height: 2;"><li>Create & manage equity offers</li><li>Track vesting schedules</li><li>Calculate dilution & exits</li><li>Real-time cap table</li></ul>',
            ''
        )}
                        ${UIComponents.createCard(
            '<i class="fas fa-comments"></i> Real-Time Communication',
            'Discord-Style Messaging',
            '<ul style="color: rgba(255,255,255,0.9); line-height: 2;"><li>Direct messages</li><li>Team channels</li><li>Read receipts</li><li>File sharing</li></ul>',
            ''
        )}
                        ${UIComponents.createCard(
            '<i class="fas fa-robot"></i> AI-Powered Tools',
            '9 Intelligent Features',
            '<ul style="color: rgba(255,255,255,0.9); line-height: 2;"><li>AI Copilot & Advisor</li><li>Idea Validator</li><li>Pitch Deck Generator</li><li>Smart Matching</li></ul>',
            ''
        )}
                        ${UIComponents.createCard(
            '<i class="fas fa-briefcase"></i> Advanced Marketplace',
            'Find Top Talent',
            '<ul style="color: rgba(255,255,255,0.9); line-height: 2;"><li>Equity-based projects</li><li>Skills filtering</li><li>Portfolio showcase</li><li>Milestone tracking</li></ul>',
            ''
        )}
                        ${UIComponents.createCard(
            '<i class="fas fa-users"></i> Professional Network',
            'LinkedIn-Style Connections',
            '<ul style="color: rgba(255,255,255,0.9); line-height: 2;"><li>Rich profiles</li><li>Connection requests</li><li>Social feed</li><li>Recommendations</li></ul>',
            ''
        )}
                        ${UIComponents.createCard(
            '<i class="fas fa-shield-alt"></i> Enterprise Security',
            'Bank-Level Protection',
            '<ul style="color: rgba(255,255,255,0.9); line-height: 2;"><li>JWT authentication</li><li>Encrypted data</li><li>Rate limiting</li><li>GDPR compliant</li></ul>',
            ''
        )}
                    </div>
                </div>

                <div class="cta-section text-center" style="margin-top: 100px; padding: 80px 20px; background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border-radius: 2rem;">
                    <h2 style="font-size: 3rem; color: white; margin-bottom: 1.5rem; font-weight: 800;">
                        Ready to Build Your Dream Team?
                    </h2>
                    <p style="font-size: 1.25rem; color: rgba(255,255,255,0.9); margin-bottom: 2rem;">
                        Join thousands of founders and professionals collaborating through equity
                    </p>
                    <button class="btn btn-secondary btn-lg" onclick="app.navigate('register')">
                        <i class="fas fa-rocket"></i> Start Building Now
                    </button>
                </div>
            </div>
        `;
    }

    static login() {
        return `
            <div class="auth-page" style="max-width: 500px; margin: 100px auto;">
                <div class="card card-glass">
                    <div class="card-header text-center">
                        <h1 class="card-title" style="font-size: 2.5rem;">
                            <i class="fas fa-rocket"></i> Welcome Back
                        </h1>
                        <p class="card-subtitle">Sign in to continue to STARTLABX</p>
                    </div>
                    <div class="card-body">
                        <form onsubmit="app.handleLogin(event)">
                            <div class="form-group">
                                <label class="form-label">Email Address</label>
                                <input type="email" name="email" class="form-input" placeholder="you@example.com" required />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <input type="password" name="password" class="form-input" placeholder="••••••••" required />
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">
                                <i class="fas fa-sign-in-alt"></i> Sign In
                            </button>
                        </form>
                    </div>
                    <div class="card-footer text-center">
                        <p style="color: rgba(255,255,255,0.8);">
                            Don't have an account? 
                            <a href="#" onclick="app.navigate('register')" style="color: white; font-weight: 600;">Sign Up</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    static register() {
        return `
            <div class="auth-page" style="max-width: 600px; margin: 50px auto;">
                <div class="card card-glass">
                    <div class="card-header text-center">
                        <h1 class="card-title" style="font-size: 2.5rem;">
                            <i class="fas fa-rocket"></i> Join STARTLABX
                        </h1>
                        <p class="card-subtitle">Create your account and start building</p>
                    </div>
                    <div class="card-body">
                        <form onsubmit="app.handleRegister(event)">
                            <div class="grid grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">First Name</label>
                                    <input type="text" name="firstName" class="form-input" placeholder="John" required />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Last Name</label>
                                    <input type="text" name="lastName" class="form-input" placeholder="Doe" required />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email Address</label>
                                <input type="email" name="email" class="form-input" placeholder="you@example.com" required />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <input type="password" name="password" class="form-input" placeholder="••••••••" required />
                            </div>
                            <div class="form-group">
                                <label class="form-label">I am a...</label>
                                <select name="role" class="form-select" required>
                                    <option value="">Select your role</option>
                                    <option value="FOUNDER">Founder - I'm building a startup</option>
                                    <option value="PROFESSIONAL">Professional - I want to join startups</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">
                                <i class="fas fa-user-plus"></i> Create Account
                            </button>
                        </form>
                    </div>
                    <div class="card-footer text-center">
                        <p style="color: rgba(255,255,255,0.8);">
                            Already have an account? 
                            <a href="#" onclick="app.navigate('login')" style="color: white; font-weight: 600;">Sign In</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    static dashboard(user, analytics) {
        const stats = analytics || {
            connections: 0,
            projects: 0,
            messages: 0,
            equity: 0
        };

        return `
            <div class="dashboard-page">
                <div class="page-header" style="margin-bottom: 2rem;">
                    <h1 style="font-size: 3rem; color: white; font-weight: 800; margin-bottom: 0.5rem;">
                        Welcome back, ${user.name}! 👋
                    </h1>
                    <p style="font-size: 1.25rem; color: rgba(255,255,255,0.8);">
                        Here's what's happening with your startup ecosystem
                    </p>
                </div>

                <div class="grid grid-cols-4" style="margin-bottom: 3rem;">
                    ${UIComponents.createStatCard('fa-users', 'Connections', stats.connections, { direction: 'up', value: '+12%' })}
                    ${UIComponents.createStatCard('fa-briefcase', 'Active Projects', stats.projects, { direction: 'up', value: '+8%' })}
                    ${UIComponents.createStatCard('fa-comments', 'Messages', stats.messages, { direction: 'up', value: '+24%' })}
                    ${UIComponents.createStatCard('fa-chart-pie', 'Equity Value', `$${stats.equity}`, { direction: 'up', value: '+15%' })}
                </div>

                <div class="grid grid-cols-2">
                    <div>
                        ${UIComponents.createCard(
            '<i class="fas fa-clock"></i> Recent Activity',
            'Your latest updates',
            `
                            <div class="activity-timeline">
                                <div class="activity-item" style="padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <div style="display: flex; gap: 1rem; align-items: start;">
                                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-gradient-1); display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-user-plus" style="color: white;"></i>
                                        </div>
                                        <div style="flex: 1;">
                                            <p style="color: white; font-weight: 600; margin-bottom: 0.25rem;">New connection request</p>
                                            <p style="color: rgba(255,255,255,0.7); font-size: 0.875rem;">Sarah Johnson wants to connect</p>
                                            <p style="color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-top: 0.25rem;">2 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="activity-item" style="padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <div style="display: flex; gap: 1rem; align-items: start;">
                                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-gradient-3); display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-briefcase" style="color: white;"></i>
                                        </div>
                                        <div style="flex: 1;">
                                            <p style="color: white; font-weight: 600; margin-bottom: 0.25rem;">Project milestone completed</p>
                                            <p style="color: rgba(255,255,255,0.7); font-size: 0.875rem;">MVP Development - Phase 1</p>
                                            <p style="color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-top: 0.25rem;">5 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="activity-item" style="padding: 1rem 0;">
                                    <div style="display: flex; gap: 1rem; align-items: start;">
                                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-gradient-4); display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-chart-pie" style="color: white;"></i>
                                        </div>
                                        <div style="flex: 1;">
                                            <p style="color: white; font-weight: 600; margin-bottom: 0.25rem;">Equity offer accepted</p>
                                            <p style="color: rgba(255,255,255,0.7); font-size: 0.875rem;">CTO position - 5% equity</p>
                                            <p style="color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-top: 0.25rem;">1 day ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `,
            '<a href="#" onclick="app.navigate(\'activity\')" style="color: white; font-weight: 600;">View All Activity <i class="fas fa-arrow-right"></i></a>'
        )}
                    </div>

                    <div>
                        ${UIComponents.createCard(
            '<i class="fas fa-rocket"></i> Quick Actions',
            'Get things done faster',
            `
                            <div class="quick-actions" style="display: grid; gap: 1rem;">
                                <button class="btn btn-primary" onclick="app.navigate('create-project')" style="justify-content: flex-start;">
                                    <i class="fas fa-plus-circle"></i> Create New Project
                                </button>
                                <button class="btn btn-accent" onclick="app.navigate('equity-offer')" style="justify-content: flex-start;">
                                    <i class="fas fa-handshake"></i> Send Equity Offer
                                </button>
                                <button class="btn btn-secondary" onclick="app.navigate('ai-tools')" style="justify-content: flex-start;">
                                    <i class="fas fa-robot"></i> Use AI Tools
                                </button>
                                <button class="btn btn-success" onclick="app.navigate('marketplace')" style="justify-content: flex-start;">
                                    <i class="fas fa-search"></i> Find Talent
                                </button>
                            </div>
                            `,
            ''
        )}

                        <div style="margin-top: 2rem;">
                            ${UIComponents.createCard(
            '<i class="fas fa-lightbulb"></i> AI Insights',
            'Powered by AI',
            `
                                <div style="color: rgba(255,255,255,0.9); line-height: 1.8;">
                                    <p style="margin-bottom: 1rem;">💡 <strong>Tip:</strong> Your startup profile is 85% complete. Add your pitch deck to increase visibility by 40%.</p>
                                    <p style="margin-bottom: 1rem;">📈 <strong>Trend:</strong> Fintech startups are seeing 3x more applications this month.</p>
                                    <p>🎯 <strong>Match:</strong> We found 12 professionals that match your requirements.</p>
                                </div>
                                `,
            '<button class="btn btn-outline btn-sm" onclick="app.navigate(\'ai-tools\')">Explore AI Tools</button>'
        )}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static aiTools() {
        return `
            <div class="ai-tools-page">
                <div class="page-header text-center" style="margin-bottom: 3rem;">
                    <h1 style="font-size: 3rem; color: white; font-weight: 800; margin-bottom: 0.5rem;">
                        <i class="fas fa-robot"></i> AI-Powered Tools
                    </h1>
                    <p style="font-size: 1.25rem; color: rgba(255,255,255,0.8);">
                        Intelligent features to accelerate your startup journey
                    </p>
                </div>

                <div class="grid grid-cols-3">
                    ${this.createAIToolCard(
            'fa-comments',
            'AI Copilot',
            'Get instant advice and guidance',
            'Ask questions about funding, team building, MVP development, and more',
            'copilot'
        )}
                    ${this.createAIToolCard(
            'fa-lightbulb',
            'Idea Validator',
            'Validate your business idea',
            'Get comprehensive analysis with viability score, strengths, and recommendations',
            'validator'
        )}
                    ${this.createAIToolCard(
            'fa-presentation',
            'Pitch Deck Generator',
            'Create professional pitch decks',
            'Generate 12-slide investor-ready presentations in minutes',
            'pitch-deck'
        )}
                    ${this.createAIToolCard(
            'fa-tasks',
            'MVP Planner',
            'Plan your MVP development',
            'Get 4-phase roadmap with tasks, deliverables, and success metrics',
            'mvp-planner'
        )}
                    ${this.createAIToolCard(
            'fa-file-contract',
            'Contract Generator',
            'Generate legal documents',
            'Create NDAs, co-founder agreements, and offer letters',
            'contracts'
        )}
                    ${this.createAIToolCard(
            'fa-users-cog',
            'Smart Matching',
            'Find perfect team members',
            'AI-powered matching based on skills and experience',
            'matching'
        )}
                    ${this.createAIToolCard(
            'fa-chart-line',
            'Business Model',
            'Design revenue strategy',
            'Get recommendations for pricing, revenue streams, and unit economics',
            'business-model'
        )}
                    ${this.createAIToolCard(
            'fa-search-dollar',
            'Market Research',
            'Analyze your market',
            'TAM/SAM/SOM calculations, trends, and competitor analysis',
            'market-research'
        )}
                    ${this.createAIToolCard(
            'fa-rocket',
            'Growth Strategy',
            'Plan your growth',
            'Channel recommendations and 6-month growth timeline',
            'growth-strategy'
        )}
                </div>
            </div>
        `;
    }

    static createAIToolCard(icon, title, subtitle, description, toolId) {
        return UIComponents.createCard(
            `<i class="fas ${icon}"></i> ${title}`,
            subtitle,
            `<p style="color: rgba(255,255,255,0.8); line-height: 1.6;">${description}</p>`,
            `<button class="btn btn-primary" onclick="app.openAITool('${toolId}')">
                <i class="fas fa-magic"></i> Launch Tool
            </button>`
        );
    }

    static marketplace(projects = [], loading = false) {
        return `
            <div class="marketplace-page">
                <div class="page-header" style="margin-bottom: 2rem;">
                    <h1 style="font-size: 3rem; color: white; font-weight: 800; margin-bottom: 0.5rem;">
                        <i class="fas fa-briefcase"></i> Marketplace
                    </h1>
                    <p style="font-size: 1.25rem; color: rgba(255,255,255,0.8);">
                        Discover equity-based opportunities and top talent
                    </p>
                </div>

                <div class="marketplace-filters" style="margin-bottom: 2rem;">
                    <div class="card card-glass">
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <input type="text" class="form-input" placeholder="Search projects..." style="flex: 1; min-width: 300px;" />
                            <select class="form-select" style="min-width: 200px;">
                                <option>All Skills</option>
                                <option>Frontend Development</option>
                                <option>Backend Development</option>
                                <option>UI/UX Design</option>
                                <option>Marketing</option>
                            </select>
                            <select class="form-select" style="min-width: 200px;">
                                <option>All Equity Ranges</option>
                                <option>0-1%</option>
                                <option>1-5%</option>
                                <option>5-10%</option>
                                <option>10%+</option>
                            </select>
                            <button class="btn btn-primary" onclick="app.reloadMarketplace()">
                                <i class="fas fa-filter"></i> Refresh
                            </button>
                        </div>
                    </div>
                </div>

                ${
                    loading
                        ? '<p style="color: rgba(255,255,255,0.8);">Loading projects...</p>'
                        : projects.length === 0
                            ? '<p style="color: rgba(255,255,255,0.8);">No projects found yet. Create the first one from your dashboard.</p>'
                            : `<div class="grid grid-cols-2">
                                ${projects.map(p => Views.createProjectCardFromData(p)).join('')}
                               </div>`
                }
            </div>
        `;
    }

    static createProjectCard(title, company, equity, skills, description, status) {
        const skillBadges = skills.map(skill =>
            `<span style="background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem;">${skill}</span>`
        ).join('');

        return UIComponents.createCard(
            title,
            `<i class="fas fa-building"></i> ${company}`,
            `
            <div style="margin-bottom: 1rem;">
                <div style="display: inline-block; background: var(--bg-gradient-4); padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; margin-bottom: 1rem;">
                    <i class="fas fa-chart-pie"></i> ${equity}
                </div>
            </div>
            <p style="color: rgba(255,255,255,0.9); margin-bottom: 1rem; line-height: 1.6;">${description}</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
                ${skillBadges}
            </div>
            `,
            `
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-primary" style="flex: 1;">
                    <i class="fas fa-paper-plane"></i> Apply Now
                </button>
                <button class="btn btn-outline">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
            `
        );
    }

    static createProjectCardFromData(project) {
        const title = project.title;
        const company = project.startup_name || 'Startup';
        const equity = project.equity_offered ? `${project.equity_offered}% equity` : 'Equity-based';
        let skills = [];
        try {
            skills = JSON.parse(project.required_skills || '[]');
        } catch {
            skills = [];
        }
        const description = project.description || '';
        const status = project.status || 'OPEN';
        return Views.createProjectCard(title, company, equity, skills, description, status);
    }

    static network(professionals = [], loading = false) {
        return `
            <div class="network-page">
                <div class="page-header" style="margin-bottom: 2rem;">
                    <h1 style="font-size: 3rem; color: white; font-weight: 800; margin-bottom: 0.5rem;">
                        <i class="fas fa-users"></i> Network
                    </h1>
                    <p style="font-size: 1.25rem; color: rgba(255,255,255,0.8);">
                        Discover professionals open to equity-based opportunities
                    </p>
                </div>
                ${
                    loading
                        ? '<p style="color: rgba(255,255,255,0.8);">Loading professionals...</p>'
                        : professionals.length === 0
                            ? '<p style="color: rgba(255,255,255,0.8);">No professionals found yet.</p>'
                            : `<div class="grid grid-cols-3" style="gap: 1.5rem;">
                                ${professionals.map(p => Views.createProfessionalCard(p)).join('')}
                               </div>`
                }
            </div>
        `;
    }

    static createProfessionalCard(pro) {
        let skills = [];
        try {
            skills = JSON.parse(pro.skills || '[]');
        } catch {
            skills = [];
        }
        const skillBadges = skills.slice(0, 6).map(skill =>
            `<span style="background: rgba(255,255,255,0.15); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem;">${skill}</span>`
        ).join('');

        const name = pro.name || 'Professional';
        const role = pro.role || pro.title || 'Contributor';
        const experience = pro.experience || `${pro.experience_years || 0}+ years`;
        const rate = pro.rate || pro.hourly_rate || null;

        const subtitleParts = [role];
        if (experience) subtitleParts.push(experience);
        if (rate) subtitleParts.push(`$${rate}/hr`);

        const subtitle = subtitleParts.join(' • ');

        return UIComponents.createCard(
            `<i class="fas fa-user-circle"></i> ${name}`,
            subtitle,
            `
                <p style="color: rgba(255,255,255,0.85); margin-bottom: 0.75rem;">
                    ${pro.bio || 'Open to collaborating with early-stage startups on an equity basis.'}
                </p>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.75rem;">
                    ${skillBadges}
                </div>
            `,
            `
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary" style="flex: 1;" onclick="app.startConversation('${pro.user_id}')">
                        <i class="fas fa-comments"></i> Message
                    </button>
                    <button class="btn btn-outline" onclick="app.sendConnectionRequest('${pro.user_id}')">
                        <i class="fas fa-user-plus"></i>
                    </button>
                </div>
            `
        );
    }

    static messages(conversations = [], loading = false) {
        return `
            <div class="messages-page">
                <div class="page-header" style="margin-bottom: 2rem;">
                    <h1 style="font-size: 3rem; color: white; font-weight: 800; margin-bottom: 0.5rem;">
                        <i class="fas fa-comments"></i> Messages
                    </h1>
                    <p style="font-size: 1.25rem; color: rgba(255,255,255,0.8);">
                        Stay in sync with your co-founders and collaborators
                    </p>
                </div>
                ${
                    loading
                        ? '<p style="color: rgba(255,255,255,0.8);">Loading conversations...</p>'
                        : conversations.length === 0
                            ? '<p style="color: rgba(255,255,255,0.8);">No conversations yet. Start by messaging someone from the Network tab.</p>'
                            : `<div class="card card-glass">
                                <div class="card-body">
                                    ${conversations.map(c => Views.createConversationRow(c)).join('')}
                                </div>
                               </div>`
                }
            </div>
        `;
    }

    static createConversationRow(c) {
        const name = c.other_user_name || 'User';
        const last = c.last_message || 'No messages yet.';
        const unread = c.unread_count || 0;
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <div>
                    <p style="color: white; font-weight: 600; margin-bottom: 0.2rem;">${name}</p>
                    <p style="color: rgba(255,255,255,0.75); font-size: 0.9rem;">${last}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    ${unread > 0 ? `<span style="background: var(--color-accent); padding: 0.1rem 0.5rem; border-radius: 999px; font-size: 0.75rem;">${unread} new</span>` : ''}
                    <button class="btn btn-outline btn-sm" onclick="app.openConversation('${c.other_user_id}', '${name.replace(/'/g, "\\'")}')">
                        Open
                    </button>
                </div>
            </div>
        `;
    }
}

// ============================================
// APPLICATION CLASS
// ============================================
class Application {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Check authentication
            const token = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (token) {
            try {
                const response = await api.getCurrentUser();
                // Backend returns {success: true, data: {user: {...}}, message: "..."}
                const user = response.data?.user || response.user || response.data;
                if (user && user.id) {
                    state.setState({
                        user: user,
                        isAuthenticated: true,
                        currentView: 'dashboard'
                    });
                } else {
                    throw new Error('Invalid user data');
                }
            } catch (error) {
                console.log('Auth check failed (this is normal for new users):', error.message);
                localStorage.removeItem(CONFIG.STORAGE_KEY);
                state.setState({
                    user: null,
                    isAuthenticated: false,
                    currentView: 'landing'
                });
            }
            } else {
                state.setState({
                    currentView: 'landing'
                });
            }

            // Subscribe to state changes
            state.subscribe((newState) => {
                this.render(newState);
            });

            // Initial render
            this.render(state.getState());
        } catch (error) {
            console.error('Initialization error:', error);
            // Show landing page on error
            state.setState({
                currentView: 'landing'
            });
            this.render(state.getState());
        } finally {
            // Always hide loading screen after initialization (even on error)
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                    loadingScreen.style.transition = 'opacity 0.5s ease-out';
                    setTimeout(() => {
                        loadingScreen.classList.add('hidden');
                    }, 500);
                }
            }, 300);
        }
    }

    render(currentState) {
        const { user, currentView, marketplaceProjects, networkProfessionals, messagesConversations, loading } = currentState;

        // Render navigation
        document.getElementById('main-nav').innerHTML = UIComponents.createNavbar(user);

        // Render content
        let content = '';
        switch (currentView) {
            case 'landing':
                content = Views.landing();
                break;
            case 'login':
                content = Views.login();
                break;
            case 'register':
                content = Views.register();
                break;
            case 'dashboard':
                content = Views.dashboard(user, {});
                break;
            case 'ai-tools':
                content = Views.aiTools();
                break;
            case 'marketplace':
                content = Views.marketplace(marketplaceProjects, loading);
                break;
            case 'network':
                content = Views.network(networkProfessionals, loading);
                break;
            case 'messages':
                content = Views.messages(messagesConversations, loading);
                break;
            default:
                content = Views.landing();
        }

        document.getElementById('main-content').innerHTML = content;
    }

    navigate(view) {
        switch (view) {
            case 'marketplace':
                this.loadMarketplace();
                break;
            case 'network':
                this.loadNetwork();
                break;
            case 'messages':
                this.loadMessages();
                break;
            default:
                state.setState({ currentView: view });
                window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email')?.trim();
        const password = formData.get('password');

        // Validation
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            UIComponents.showToast('Please enter a valid email address', 'error');
            return;
        }
        if (!password) {
            UIComponents.showToast('Password is required', 'error');
            return;
        }

        const credentials = { email, password };

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

        try {
            const response = await api.login(credentials);
            localStorage.setItem(CONFIG.STORAGE_KEY, response.data?.token || response.token);
            state.setState({
                user: response.data?.user || response.user,
                isAuthenticated: true,
                currentView: 'dashboard'
            });
            UIComponents.showToast('Welcome back!', 'success');
        } catch (error) {
            const errorMsg = error.data?.message || error.message || 'Login failed';
            UIComponents.showToast(errorMsg, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        // Client-side validation
        const firstName = formData.get('firstName')?.trim();
        const lastName = formData.get('lastName')?.trim();
        const email = formData.get('email')?.trim();
        const password = formData.get('password');
        const role = formData.get('role');

        // Validation
        if (!firstName || firstName.length < 2) {
            UIComponents.showToast('First name must be at least 2 characters', 'error');
            return;
        }
        if (!lastName || lastName.length < 2) {
            UIComponents.showToast('Last name must be at least 2 characters', 'error');
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            UIComponents.showToast('Please enter a valid email address', 'error');
            return;
        }
        if (!password || password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            UIComponents.showToast('Password must be at least 8 characters with uppercase, lowercase, and number', 'error');
            return;
        }
        if (!role) {
            UIComponents.showToast('Please select your role', 'error');
            return;
        }

        const userData = {
            name: `${firstName} ${lastName}`,
            email,
            password,
            role
        };

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

        try {
            const response = await api.register(userData);
            localStorage.setItem(CONFIG.STORAGE_KEY, response.data?.token || response.token);
            state.setState({
                user: response.data?.user || response.user,
                isAuthenticated: true,
                currentView: 'dashboard'
            });
            UIComponents.showToast('Account created successfully!', 'success');
        } catch (error) {
            const errorMsg = error.data?.message || error.message || 'Registration failed';
            UIComponents.showToast(errorMsg, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        state.setState({
            user: null,
            isAuthenticated: false,
            currentView: 'landing'
        });
        UIComponents.showToast('Logged out successfully', 'success');
    }

    async loadMarketplace() {
        state.setState({ loading: true, currentView: 'marketplace' });
        try {
            const { projects } = await api.getProjects();
            state.setState({ marketplaceProjects: projects || [], loading: false });
        } catch (error) {
            state.setState({ loading: false });
            UIComponents.showToast(error.message || 'Failed to load projects', 'error');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async reloadMarketplace() {
        await this.loadMarketplace();
    }

    async loadNetwork() {
        state.setState({ loading: true, currentView: 'network' });
        try {
            const { professionals } = await api.getProfessionals();
            state.setState({ networkProfessionals: professionals || [], loading: false });
        } catch (error) {
            state.setState({ loading: false });
            UIComponents.showToast(error.message || 'Failed to load professionals', 'error');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async loadMessages() {
        state.setState({ loading: true, currentView: 'messages' });
        try {
            const { conversations } = await api.getConversations();
            state.setState({ messagesConversations: conversations || [], loading: false });
        } catch (error) {
            state.setState({ loading: false });
            UIComponents.showToast(error.message || 'Failed to load conversations', 'error');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async openConversation(otherUserId, otherUserName) {
        try {
            const { messages } = await api.getDirectMessages(otherUserId);
            UIComponents.showModal(
                `Chat with ${otherUserName}`,
                `
                    <div style="max-height: 400px; overflow-y: auto; margin-bottom: 1rem;">
                        ${messages.map(m => `
                            <div style="margin-bottom: 0.75rem; text-align: ${m.sender_id === (state.getState().user?.id) ? 'right' : 'left'};">
                                <div style="display: inline-block; max-width: 80%; padding: 0.5rem 0.75rem; border-radius: 0.75rem; background: ${m.sender_id === (state.getState().user?.id) ? 'var(--bg-gradient-1)' : 'rgba(255,255,255,0.12)'}; color: white;">
                                    <div style="font-size: 0.8rem; opacity: 0.8; margin-bottom: 0.15rem;">
                                        ${m.sender_name || ''}
                                    </div>
                                    <div>${m.content}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <form id="direct-message-form" class="form">
                        <div class="form-group">
                            <textarea name="content" class="form-textarea" rows="2" placeholder="Type a message..." required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            <i class="fas fa-paper-plane"></i> Send
                        </button>
                    </form>
                `
            );

            const form = document.getElementById('direct-message-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const content = formData.get('content');
                if (!content) return;
                try {
                    await api.sendDirectMessage({ receiver_id: otherUserId, content });
                    UIComponents.showToast('Message sent', 'success');
                    document.querySelector('.modal-backdrop').remove();
                    this.loadMessages();
                } catch (error) {
                    UIComponents.showToast(error.message || 'Failed to send message', 'error');
                }
            });
        } catch (error) {
            UIComponents.showToast(error.message || 'Failed to open conversation', 'error');
        }
    }

    async startConversation(userId) {
        await this.openConversation(userId, 'Professional');
    }

    async sendConnectionRequest(userId) {
        try {
            await api.requestConnection({ user_id: userId });
            UIComponents.showToast('Connection request sent', 'success');
        } catch (error) {
            UIComponents.showToast(error.message || 'Failed to send connection request', 'error');
        }
    }

    openAITool(toolId) {
        const { user } = state.getState();
        if (!user) {
            UIComponents.showToast('Please log in to use AI tools.', 'warning');
            this.navigate('login');
            return;
        }

        switch (toolId) {
            case 'copilot': {
                UIComponents.showModal(
                    'AI Copilot',
                    `
                    <form id="ai-copilot-form" class="form">
                        <div class="form-group">
                            <label class="form-label">What do you need help with?</label>
                            <textarea name="message" class="form-textarea" rows="4" placeholder="Ask about funding, team, MVP, marketing..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Focus Area (optional)</label>
                            <select name="category" class="form-select">
                                <option value="">Auto-detect</option>
                                <option value="funding">Funding</option>
                                <option value="team">Team & Hiring</option>
                                <option value="mvp">MVP & Product</option>
                                <option value="marketing">Marketing & Growth</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            <i class="fas fa-paper-plane"></i> Get Advice
                        </button>
                        <div id="ai-copilot-result" style="margin-top: 1.5rem; display: none;">
                            <h3 style="color: white; margin-bottom: 0.75rem;">Response</h3>
                            <pre style="white-space: pre-wrap; color: rgba(255,255,255,0.9); font-family: var(--font-body);"></pre>
                            <div id="ai-copilot-suggestions" style="margin-top: 1rem;"></div>
                        </div>
                    </form>
                    `
                );

                const form = document.getElementById('ai-copilot-form');
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const message = formData.get('message');
                    const category = formData.get('category') || undefined;

                    const resultContainer = document.getElementById('ai-copilot-result');
                    const pre = resultContainer.querySelector('pre');
                    const suggestionsEl = document.getElementById('ai-copilot-suggestions');

                    pre.textContent = 'Thinking...';
                    resultContainer.style.display = 'block';
                    suggestionsEl.innerHTML = '';

                    try {
                        const { response, suggestions } = await api.aiCopilot({
                            message,
                            context: category ? { category } : {}
                        });

                        pre.textContent = response;
                        if (Array.isArray(suggestions) && suggestions.length) {
                            suggestionsEl.innerHTML = `
                                <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">Suggested follow-up questions:</p>
                                <ul style="color: rgba(255,255,255,0.9); padding-left: 1.25rem; list-style: disc;">
                                    ${suggestions.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            `;
                        }
                    } catch (error) {
                        pre.textContent = error.message || 'Something went wrong. Please try again.';
                    }
                });
                break;
            }
            case 'validator': {
                UIComponents.showModal(
                    'Idea Validator',
                    `
                    <form id="ai-validator-form" class="form">
                        <div class="form-group">
                            <label class="form-label">Your Startup Idea</label>
                            <textarea name="idea" class="form-textarea" rows="3" placeholder="Describe your idea..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Industry</label>
                            <input type="text" name="industry" class="form-input" placeholder="e.g. Fintech, SaaS, Marketplace" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Target Market</label>
                            <input type="text" name="targetMarket" class="form-input" placeholder="e.g. Early-stage startups in Europe" />
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            <i class="fas fa-brain"></i> Validate Idea
                        </button>
                        <div id="ai-validator-result" style="margin-top: 1.5rem; display: none;">
                            <h3 style="color: white; margin-bottom: 0.75rem;">Validation Result</h3>
                            <div id="ai-validator-content" style="color: rgba(255,255,255,0.9); line-height: 1.8;"></div>
                        </div>
                    </form>
                    `
                );

                const form = document.getElementById('ai-validator-form');
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const payload = {
                        idea: formData.get('idea'),
                        industry: formData.get('industry'),
                        targetMarket: formData.get('targetMarket')
                    };

                    const resultContainer = document.getElementById('ai-validator-result');
                    const contentEl = document.getElementById('ai-validator-content');

                    resultContainer.style.display = 'block';
                    contentEl.innerHTML = '<p>Analyzing your idea...</p>';

                    try {
                        const { validation } = await api.validateIdea(payload);
                        contentEl.innerHTML = `
                            <p><strong>Score:</strong> ${validation.score}/100 (${validation.viability} viability)</p>
                            <p><strong>Market Size:</strong> ${validation.marketSize}</p>
                            <p><strong>Strengths:</strong></p>
                            <ul style="padding-left: 1.25rem; list-style: disc;">
                                ${validation.strengths.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                            <p><strong>Weaknesses:</strong></p>
                            <ul style="padding-left: 1.25rem; list-style: disc;">
                                ${validation.weaknesses.map(w => `<li>${w}</li>`).join('')}
                            </ul>
                            <p><strong>Recommendations:</strong></p>
                            <ul style="padding-left: 1.25rem; list-style: disc;">
                                ${validation.recommendations.map(r => `<li>${r}</li>`).join('')}
                            </ul>
                            <p><strong>Next 8 Weeks:</strong></p>
                            <ul style="padding-left: 1.25rem; list-style: disc;">
                                ${validation.nextSteps.map(n => `<li>${n}</li>`).join('')}
                            </ul>
                        `;
                    } catch (error) {
                        contentEl.innerHTML = `<p>${error.message || 'Something went wrong. Please try again.'}</p>`;
                    }
                });
                break;
            }
            default:
                UIComponents.showToast('This AI tool is coming soon in the UI.', 'info');
        }
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================
let app;

// Initialize app with error handling
try {
    app = new Application();
    window.app = app;
} catch (error) {
    console.error('Failed to initialize application:', error);
    // Fallback: Hide loading screen and show landing page
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: white;">
                    <h1>Welcome to STARTLABX</h1>
                    <p>There was an error loading the app. Please refresh the page.</p>
                    <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
                </div>
            `;
        }
    }, 1000);
}

// Fallback: Always hide loading screen after 3 seconds max
setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        console.warn('Loading screen timeout - forcing hide');
        loadingScreen.classList.add('hidden');
    }
}, 3000);
