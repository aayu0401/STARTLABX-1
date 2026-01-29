/*
 * STARTLABX Integrated Platform v3.0
 * Full-Stack with Backend API Integration
 */

// ========== CONFIGURATION ==========
const API_BASE_URL = 'http://localhost:3000/api';

// ========== API SERVICE ==========
class APIService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(email, password, name, role) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, role })
        });
        if (data.token) this.setToken(data.token);
        return data;
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (data.token) this.setToken(data.token);
        return data;
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    // Startups
    async getStartups() {
        return await this.request('/startups');
    }

    async getStartup(id) {
        return await this.request(`/startups/${id}`);
    }

    async createStartup(data) {
        return await this.request('/startups', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateStartup(id, data) {
        return await this.request(`/startups/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Professionals
    async getProfessionals() {
        return await this.request('/professionals');
    }

    // Posts
    async getPosts() {
        return await this.request('/posts');
    }

    async createPost(content) {
        return await this.request('/posts', {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    async likePost(id) {
        return await this.request(`/posts/${id}/like`, {
            method: 'POST'
        });
    }

    // Connections
    async getConnections() {
        return await this.request('/connections');
    }

    async sendConnectionRequest(user_id) {
        return await this.request('/connections', {
            method: 'POST',
            body: JSON.stringify({ user_id })
        });
    }

    // Notifications
    async getNotifications() {
        return await this.request('/notifications');
    }

    async markNotificationRead(id) {
        return await this.request(`/notifications/${id}/read`, {
            method: 'PUT'
        });
    }

    async markAllNotificationsRead() {
        return await this.request('/notifications/read-all', {
            method: 'PUT'
        });
    }

    // Analytics
    async getDashboardStats() {
        return await this.request('/analytics/dashboard');
    }

    // AI Tools
    async aiCopilot(query) {
        return await this.request('/ai/copilot', {
            method: 'POST',
            body: JSON.stringify({ query })
        });
    }

    async validateIdea(idea, industry, targetMarket) {
        return await this.request('/ai/validate', {
            method: 'POST',
            body: JSON.stringify({ idea, industry, targetMarket })
        });
    }

    async generatePitchDeck(startupName, description) {
        return await this.request('/ai/pitch-deck', {
            method: 'POST',
            body: JSON.stringify({ startupName, description })
        });
    }

    async generateMVPPlan(idea, budget, timeline) {
        return await this.request('/ai/mvp-plan', {
            method: 'POST',
            body: JSON.stringify({ idea, budget, timeline })
        });
    }

    async generateContract(type, parties, terms) {
        return await this.request('/ai/contract', {
            method: 'POST',
            body: JSON.stringify({ type, parties, terms })
        });
    }

    async smartMatch(skills, role, experience) {
        return await this.request('/ai/match', {
            method: 'POST',
            body: JSON.stringify({ skills, role, experience })
        });
    }
}

const api = new APIService();

// ========== STATE MANAGEMENT ==========
class StateManager {
    constructor() {
        this.state = {
            currentScreen: 'splash',
            user: null,
            isAuthenticated: false,
            role: null,
            theme: 'dark',
            loading: false,

            // Data from API
            startups: [],
            professionals: [],
            posts: [],
            notifications: [],
            connections: [],
            stats: { connections: 0, matches: 0, projects: 0, messages: 0 },

            // UI state
            searchQuery: '',
            selectedItems: new Set()
        };

        this.listeners = new Map();
        this.checkAuth();
    }

    async checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const data = await api.getCurrentUser();
                this.update({
                    user: data.user,
                    isAuthenticated: true,
                    role: data.user.role,
                    currentScreen: 'dashboard'
                });
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('auth_token');
            }
        }
    }

    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    update(updates) {
        this.state = { ...this.state, ...updates };
        this.emit('stateChange', this.state);
    }

    async loadDashboardData() {
        try {
            this.update({ loading: true });

            const [startupsData, professionalsData, statsData] = await Promise.all([
                api.getStartups(),
                api.getProfessionals(),
                api.getDashboardStats()
            ]);

            this.update({
                startups: startupsData.startups || [],
                professionals: professionalsData.professionals || [],
                stats: statsData.stats || this.state.stats,
                loading: false
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            utils.showToast('Failed to load data', 'error');
            this.update({ loading: false });
        }
    }

    async loadSocialFeed() {
        try {
            const data = await api.getPosts();
            this.update({ posts: data.posts || [] });
        } catch (error) {
            console.error('Failed to load posts:', error);
            utils.showToast('Failed to load feed', 'error');
        }
    }

    async loadNotifications() {
        try {
            const data = await api.getNotifications();
            this.update({ notifications: data.notifications || [] });
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }
}

const stateManager = new StateManager();

// ========== UTILITIES ==========
const utils = {
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fade-in`;
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="material-icons">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
                <span>${message}</span>
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    },

    showModal(title, content, actions = []) {
        const container = document.getElementById('modal-container');
        container.innerHTML = `
            <div class="modal-backdrop" onclick="utils.closeModal()">
                <div class="modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="utils.closeModal()">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                    <div class="modal-body">${content}</div>
                    ${actions.length ? `
                        <div class="modal-footer">
                            ${actions.map(action => `
                                <button class="btn ${action.primary ? 'btn-primary' : 'btn-secondary'}" 
                                        onclick="${action.onClick}">
                                    ${action.label}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    closeModal() {
        document.getElementById('modal-container').innerHTML = '';
    }
};

// ========== ROUTER ==========
function navigate(screen, params = {}) {
    stateManager.update({ currentScreen: screen, ...params });

    // Load data based on screen
    if (screen === 'dashboard' && stateManager.state.isAuthenticated) {
        stateManager.loadDashboardData();
    } else if (screen === 'social') {
        stateManager.loadSocialFeed();
    } else if (screen === 'notifications') {
        stateManager.loadNotifications();
    }

    render();
    window.scrollTo(0, 0);
}

// ========== COMPONENT LIBRARY ==========
const components = {
    statCard: (icon, number, label, color = 'primary', delay = 0) => `
        <div class="stat-card slide-in" style="animation-delay: ${delay}s;">
            <span class="material-icons" style="font-size: 2rem; color: var(--color-${color}); margin-bottom: 0.5rem;">${icon}</span>
            <div class="stat-number">${number}</div>
            <div class="stat-label">${label}</div>
        </div>
    `,

    startupCard: (startup, index) => `
        <div class="glass-card slide-in" style="animation-delay: ${index * 0.1 + 0.3}s;">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="mb-1">${startup.name}</h3>
                    <p style="font-size: 0.875rem; color: var(--text-tertiary); margin: 0;">
                        ${startup.team_size || 1} team • ${startup.funding || 'Bootstrapped'}
                    </p>
                </div>
                <span class="badge badge-primary">${startup.stage || 'Idea'}</span>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">${startup.description || 'No description'}</p>
            <div class="flex items-center gap-2 mb-3">
                <span class="badge badge-outline">
                    <span class="material-icons" style="font-size: 14px;">visibility</span>
                    ${startup.views || 0} views
                </span>
                <span class="badge badge-outline">
                    <span class="material-icons" style="font-size: 14px;">trending_up</span>
                    ${startup.progress || 0}% complete
                </span>
            </div>
            <div class="mb-3">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${startup.progress || 0}%;"></div>
                </div>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-primary" style="flex: 1;" onclick="editStartup('${startup.id}')">
                    <span class="material-icons" style="font-size: 18px;">edit</span>
                    Edit
                </button>
                <button class="btn btn-secondary" style="flex: 1;">
                    <span class="material-icons" style="font-size: 18px;">analytics</span>
                    Analytics
                </button>
            </div>
        </div>
    `,

    professionalCard: (pro, index) => `
        <div class="glass-card slide-in" style="animation-delay: ${index * 0.1 + 0.3}s;">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="mb-1">${pro.name}</h3>
                    <p style="font-size: 0.875rem; color: var(--text-tertiary); margin: 0;">
                        ${pro.experience || 'N/A'} • ${pro.rate || 'Rate not set'}
                    </p>
                </div>
                <span class="badge badge-success">${pro.score || 0}%</span>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">${pro.role}</p>
            <div class="flex gap-1 mb-3" style="flex-wrap: wrap;">
                ${(JSON.parse(pro.skills || '[]')).slice(0, 4).map(skill =>
        `<span class="badge badge-outline">${skill}</span>`
    ).join('')}
            </div>
            <div class="flex gap-2">
                <button class="btn btn-primary" style="flex: 1;" onclick="connectWith('${pro.user_id}')">
                    <span class="material-icons" style="font-size: 18px;">person_add</span>
                    Connect
                </button>
                <button class="btn btn-secondary">
                    <span class="material-icons" style="font-size: 18px;">visibility</span>
                </button>
            </div>
        </div>
    `,

    postCard: (post) => `
        <div class="glass-card mb-3 fade-in">
            <div class="flex items-center gap-2 mb-3">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    👤
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0; font-size: 1rem;">${post.author_name || 'User'}</h4>
                    <span style="font-size: 0.875rem; color: var(--text-tertiary);">${new Date(post.created_at).toLocaleString()}</span>
                </div>
            </div>
            <p style="margin-bottom: 1rem; line-height: 1.6;">${post.content}</p>
            <div class="flex gap-4">
                <button class="flex items-center gap-1" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.5rem; border-radius: var(--radius-md);" 
                        onclick="likePost('${post.id}')">
                    <span class="material-icons" style="font-size: 20px;">favorite_border</span>
                    <span style="font-weight: 500;">${JSON.parse(post.likes || '[]').length}</span>
                </button>
                <button class="flex items-center gap-1" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.5rem;">
                    <span class="material-icons" style="font-size: 20px;">comment</span>
                    <span style="font-weight: 500;">${JSON.parse(post.comments || '[]').length}</span>
                </button>
            </div>
        </div>
    `
};

// ========== SCREENS ==========
const screens = {
    splash: () => {
        setTimeout(() => navigate('onboarding'), 2000);
        return `
            <div class="screen-center fade-in">
                <div class="text-center">
                    <h1 class="text-gradient float" style="font-size: 4rem; margin-bottom: 2rem;">STARTLABX</h1>
                    <p style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 2rem;">Building the future, together</p>
                    <div class="spinner-large"></div>
                </div>
            </div>
        `;
    },

    onboarding: () => {
        // Same as before - keeping it concise
        return `
            <div class="screen-center">
                <div class="container text-center">
                    <div class="fade-in">
                        <span class="material-icons float" style="font-size: 140px; color: var(--color-primary); margin-bottom: 2rem;">rocket_launch</span>
                        <h2 style="margin-bottom: 1rem;">Build Startups Together</h2>
                        <p style="font-size: 1.125rem; max-width: 500px; margin: 0 auto 3rem; color: var(--text-secondary);">
                            Connect with talented professionals and visionary founders
                        </p>
                        <button class="btn btn-primary btn-lg" onclick="navigate('login')">Get Started</button>
                    </div>
                </div>
            </div>
        `;
    },

    login: () => {
        setTimeout(() => {
            const form = document.getElementById('login-form');
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    const btn = document.getElementById('login-btn');

                    btn.disabled = true;
                    btn.innerHTML = '<div class="spinner-sm"></div> Logging in...';

                    try {
                        const data = await api.login(email, password);
                        stateManager.update({
                            user: data.user,
                            isAuthenticated: true,
                            role: data.user.role
                        });
                        utils.showToast('Welcome back!', 'success');
                        navigate('dashboard');
                    } catch (error) {
                        utils.showToast(error.message, 'error');
                        btn.disabled = false;
                        btn.innerHTML = 'Login';
                    }
                };
            }
        }, 100);

        return `
            <div class="screen-center">
                <div class="container" style="max-width: 500px;">
                    <div class="glass-card fade-in">
                        <div class="text-center mb-4">
                            <h1 class="text-gradient mb-2">STARTLABX</h1>
                            <h3 style="color: var(--text-secondary); font-weight: 500;">Welcome Back</h3>
                        </div>
                        <form id="login-form">
                            <div class="form-group">
                                <label class="form-label">Email Address</label>
                                <input type="email" id="email" class="form-input" placeholder="your@email.com" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <input type="password" id="password" class="form-input" placeholder="••••••••" required>
                            </div>
                            <button type="submit" id="login-btn" class="btn btn-primary w-full">Login</button>
                        </form>
                        <div class="text-center mt-4">
                            <p style="font-size: 0.875rem; color: var(--text-tertiary);">
                                Don't have an account? <a href="#" onclick="navigate('register')">Sign up</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    dashboard: () => {
        const state = stateManager.state;
        const isFounder = state.role === 'FOUNDER';
        const items = isFounder ? state.startups : state.professionals;

        if (state.loading) {
            return `
                <div class="screen-center">
                    <div class="spinner-large"></div>
                    <p style="margin-top: 1rem; color: var(--text-secondary);">Loading dashboard...</p>
                </div>
            `;
        }

        // Sample activity data
        const activities = [
            { title: 'New connection request', description: 'Sarah Chen wants to connect with you', time: '2 hours ago', icon: 'person_add' },
            { title: 'Project milestone completed', description: 'MVP Development Phase 1 completed', time: '5 hours ago', icon: 'check_circle' },
            { title: 'New match found', description: 'AI found 3 new potential collaborators', time: '1 day ago', icon: 'stars' },
            { title: 'Equity offer received', description: 'TechStart Inc. sent you an equity offer', time: '2 days ago', icon: 'trending_up' }
        ];

        return `
            <div class="screen">
                <!-- Enhanced Header with Search -->
                <div class="header-enhanced">
                    <div class="header-content">
                        <h2 style="margin: 0; font-size: 1.25rem;">STARTLABX</h2>
                        <div class="search-bar">
                            <span class="material-icons">search</span>
                            <input type="text" placeholder="Search startups, professionals, or projects...">
                        </div>
                        <div class="quick-actions-header">
                            <button class="btn-icon btn-secondary">
                                <span class="material-icons">notifications</span>
                            </button>
                            <button class="btn-icon btn-secondary" onclick="navigate('profile')">
                                <span class="material-icons">account_circle</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="container" style="margin-top: var(--space-xl);">
                    <!-- Breadcrumbs -->
                    <div class="breadcrumbs fade-in">
                        <div class="breadcrumb-item">
                            <span class="material-icons" style="font-size: 18px;">home</span>
                            Home
                        </div>
                        <span class="breadcrumb-separator">›</span>
                        <div class="breadcrumb-item active">Dashboard</div>
                    </div>

                    <div class="fade-in">
                        <!-- Welcome Section -->
                        <div class="flex justify-between items-center mb-4" style="margin-top: var(--space-xl);">
                            <div>
                                <h1 class="mb-1">Welcome Back, ${state.user?.name || 'User'}! 👋</h1>
                                <p style="margin: 0; color: var(--text-secondary);">Here's what's happening with your ${isFounder ? 'startups' : 'projects'} today</p>
                            </div>
                            <button class="btn btn-primary" onclick="navigate('${isFounder ? 'marketplace' : 'social'}')">
                                <span class="material-icons">add</span>
                                ${isFounder ? 'New Startup' : 'Find Projects'}
                            </button>
                        </div>
                        
                        <!-- Enhanced Stat Cards -->
                        <div class="grid grid-4 mb-4">
                            <div class="stat-card-enhanced slide-in" style="animation-delay: 0s;">
                                <div class="stat-card-header">
                                    <div class="stat-card-icon">
                                        <span class="material-icons" style="color: var(--color-primary);">business</span>
                                    </div>
                                    <span class="stat-change positive">
                                        <span class="material-icons" style="font-size: 14px;">trending_up</span>
                                        +12%
                                    </span>
                                </div>
                                <div class="stat-value">${state.stats.projects || items.length}</div>
                                <div class="stat-label" style="color: var(--text-secondary); font-size: 0.875rem;">Active Projects</div>
                            </div>

                            <div class="stat-card-enhanced slide-in" style="animation-delay: 0.1s;">
                                <div class="stat-card-header">
                                    <div class="stat-card-icon">
                                        <span class="material-icons" style="color: var(--color-accent);">people</span>
                                    </div>
                                    <span class="stat-change positive">
                                        <span class="material-icons" style="font-size: 14px;">trending_up</span>
                                        +8%
                                    </span>
                                </div>
                                <div class="stat-value">${state.stats.connections || 24}</div>
                                <div class="stat-label" style="color: var(--text-secondary); font-size: 0.875rem;">Connections</div>
                            </div>

                            <div class="stat-card-enhanced slide-in" style="animation-delay: 0.2s;">
                                <div class="stat-card-header">
                                    <div class="stat-card-icon">
                                        <span class="material-icons" style="color: var(--color-success);">stars</span>
                                    </div>
                                    <span class="stat-change positive">
                                        <span class="material-icons" style="font-size: 14px;">trending_up</span>
                                        +15%
                                    </span>
                                </div>
                                <div class="stat-value">${state.stats.matches || 18}</div>
                                <div class="stat-label" style="color: var(--text-secondary); font-size: 0.875rem;">AI Matches</div>
                            </div>

                            <div class="stat-card-enhanced slide-in" style="animation-delay: 0.3s;">
                                <div class="stat-card-header">
                                    <div class="stat-card-icon">
                                        <span class="material-icons" style="color: var(--color-secondary);">message</span>
                                    </div>
                                    <span class="stat-change negative">
                                        <span class="material-icons" style="font-size: 14px;">trending_down</span>
                                        -3%
                                    </span>
                                </div>
                                <div class="stat-value">${state.stats.messages || 42}</div>
                                <div class="stat-label" style="color: var(--text-secondary); font-size: 0.875rem;">Messages</div>
                            </div>
                        </div>

                        <!-- Main Content Grid -->
                        <div class="grid grid-2" style="gap: var(--space-xl); align-items: start;">
                            <!-- Left Column: Projects/Startups -->
                            <div>
                                <h2 class="mb-3">${isFounder ? 'My Startups' : 'Top Matches'}</h2>
                                
                                ${items.length === 0 ? `
                                    <div class="glass-card text-center p-4">
                                        <span class="material-icons" style="font-size: 64px; color: var(--text-tertiary); margin-bottom: 1rem;">inbox</span>
                                        <p style="color: var(--text-secondary);">No ${isFounder ? 'startups' : 'matches'} yet</p>
                                        <button class="btn btn-primary mt-3" onclick="navigate('${isFounder ? 'marketplace' : 'social'}')">
                                            Get Started
                                        </button>
                                    </div>
                                ` : `
                                    <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
                                        ${items.slice(0, 3).map((item, i) =>
            isFounder ? components.startupCard(item, i) : components.professionalCard(item, i)
        ).join('')}
                                    </div>
                                    ${items.length > 3 ? `
                                        <button class="btn btn-secondary" style="width: 100%; margin-top: var(--space-lg);" onclick="navigate('${isFounder ? 'projects' : 'marketplace'}')">
                                            View All (${items.length})
                                        </button>
                                    ` : ''}
                                `}
                            </div>

                            <!-- Right Column: Activity Timeline -->
                            <div>
                                <h2 class="mb-3">Recent Activity</h2>
                                <div class="activity-timeline">
                                    ${activities.map((activity, i) => `
                                        <div class="timeline-item" style="animation-delay: ${i * 0.1}s;">
                                            <div class="timeline-dot"></div>
                                            <div class="timeline-content">
                                                <div class="timeline-header">
                                                    <div>
                                                        <div class="timeline-title">
                                                            <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 0.5rem;">${activity.icon}</span>
                                                            ${activity.title}
                                                        </div>
                                                        <div class="timeline-description">${activity.description}</div>
                                                    </div>
                                                    <div class="timeline-time">${activity.time}</div>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>

                                <!-- View All Activity Button -->
                                <button class="btn btn-secondary" style="width: 100%; margin-top: var(--space-lg);">
                                    <span class="material-icons">history</span>
                                    View All Activity
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions Floating Panel -->
                <div class="quick-actions-panel">
                    <h6 style="margin-bottom: var(--space-md); font-size: 0.75rem; color: var(--text-tertiary);">QUICK ACTIONS</h6>
                    <button class="quick-action-btn" onclick="navigate('aitools')">
                        <span class="material-icons">psychology</span>
                        AI Copilot
                    </button>
                    <button class="quick-action-btn" onclick="navigate('marketplace')">
                        <span class="material-icons">search</span>
                        Find Talent
                    </button>
                    <button class="quick-action-btn" onclick="navigate('social')">
                        <span class="material-icons">post_add</span>
                        Create Post
                    </button>
                    <button class="quick-action-btn" onclick="navigate('analytics')">
                        <span class="material-icons">analytics</span>
                        View Analytics
                    </button>
                </div>
            </div>
        `;
    },

    marketplace: () => {
        const state = stateManager.state;
        return `
            <div class="screen">
                <div class="container">
                    <h1 class="mb-4">Talent Marketplace</h1>
                    <div class="grid grid-3">
                        ${state.professionals.length === 0 ? `
                            <div class="glass-card text-center p-4">
                                <p style="color: var(--text-secondary);">Loading professionals...</p>
                            </div>
                        ` : state.professionals.map((pro, i) => components.professionalCard(pro, i)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    social: () => {
        const state = stateManager.state;
        return `
            <div class="screen">
                <div class="container" style="max-width: 800px;">
                    <h1 class="mb-4">Social Feed</h1>
                    ${state.posts.length === 0 ? `
                        <div class="glass-card text-center p-4">
                            <p style="color: var(--text-secondary);">No posts yet</p>
                        </div>
                    ` : state.posts.map(post => components.postCard(post)).join('')}
                </div>
            </div>
        `;
    },

    // AI Tools Screen
    aitools: () => {
        const tools = [
            { id: 'copilot', icon: 'psychology', title: 'AI Copilot', desc: 'Get instant startup advice', color: 'primary' },
            { id: 'validator', icon: 'lightbulb', title: 'Idea Validator', desc: 'Validate your business idea', color: 'warning' },
            { id: 'pitchdeck', icon: 'slideshow', title: 'Pitch Deck', desc: 'Generate pitch deck outline', color: 'accent' },
            { id: 'mvp', icon: 'map', title: 'MVP Planner', desc: 'Plan your MVP roadmap', color: 'success' },
            { id: 'contract', icon: 'description', title: 'Contracts', desc: 'Generate legal templates', color: 'secondary' },
            { id: 'matching', icon: 'auto_awesome', title: 'Smart Matching', desc: 'AI-powered team matching', color: 'primary' }
        ];

        return `
            <div class="screen">
                <div class="container">
                    <div class="fade-in">
                        <h1 class="mb-2">AI-Powered Tools</h1>
                        <p class="mb-4" style="color: var(--text-secondary);">Leverage AI to accelerate your startup journey</p>
                        
                        <div class="grid grid-2">
                            ${tools.map((tool, i) => `
                                <div class="ai-tool-card slide-in" style="animation-delay: ${i * 0.1}s;" onclick="openAITool('${tool.id}')">
                                    <div class="ai-tool-icon ${tool.color}">
                                        <span class="material-icons" style="color: white; font-size: 32px;">${tool.icon}</span>
                                    </div>
                                    <h3 class="mb-1">${tool.title}</h3>
                                    <p style="color: var(--text-secondary); margin: 0; font-size: 0.875rem;">${tool.desc}</p>
                                    <div style="margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; color: var(--color-${tool.color}); font-weight: 600;">
                                        <span>Try it now</span>
                                        <span class="material-icons" style="font-size: 18px;">arrow_forward</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Other screens simplified for space
    profile: () => `<div class="screen"><div class="container"><h1>Profile</h1><button onclick="logout()" class="btn btn-secondary">Logout</button></div></div>`,
    notifications: () => `<div class="screen"><div class="container"><h1>Notifications</h1></div></div>`,
    projects: () => `<div class="screen"><div class="container"><h1>Projects</h1></div></div>`,
    analytics: () => `<div class="screen"><div class="container"><h1>Analytics</h1></div></div>`,
    subscription: () => `<div class="screen"><div class="container"><h1>Subscription</h1></div></div>`
};

// ========== NAVIGATION ==========
function BottomNav() {
    if (!stateManager.state.isAuthenticated) return '';

    const navItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Home' },
        { id: 'marketplace', icon: 'store', label: 'Marketplace' },
        { id: 'social', icon: 'groups', label: 'Social' },
        { id: 'aitools', icon: 'psychology', label: 'AI Tools' },
        { id: 'profile', icon: 'person', label: 'Profile' }
    ];

    return `
        <nav class="bottom-nav">
            ${navItems.map(item => `
                <div class="nav-item ${stateManager.state.currentScreen === item.id ? 'active' : ''}" onclick="navigate('${item.id}')">
                    <span class="material-icons">${item.icon}</span>
                    <span>${item.label}</span>
                </div>
            `).join('')}
        </nav>
    `;
}

// ========== EVENT HANDLERS ==========
async function likePost(postId) {
    try {
        await api.likePost(postId);
        await stateManager.loadSocialFeed();
        render();
    } catch (error) {
        utils.showToast('Failed to like post', 'error');
    }
}

async function connectWith(userId) {
    try {
        await api.sendConnectionRequest(userId);
        utils.showToast('Connection request sent!', 'success');
    } catch (error) {
        utils.showToast(error.message, 'error');
    }
}

function editStartup(id) {
    utils.showToast('Edit feature coming soon!');
}

// AI Tool Functions
function openAITool(toolId) {
    const toolScreens = {
        'copilot': showAICopilot,
        'validator': showIdeaValidator,
        'pitchdeck': showPitchDeck,
        'mvp': showMVPPlanner,
        'contract': showContractGenerator,
        'matching': showSmartMatching
    };

    if (toolScreens[toolId]) {
        toolScreens[toolId]();
    }
}

function showAICopilot() {
    const content = `
        <div class="ai-chat-container">
            <div class="ai-chat-header">
                <span class="material-icons">psychology</span>
                <div>
                    <h3 style="margin: 0;">AI Startup Copilot</h3>
                    <p style="margin: 0; font-size: 0.875rem; opacity: 0.9;">Ask me anything about startups</p>
                </div>
            </div>
            <div class="ai-chat-messages" id="ai-chat-messages">
                <div class="ai-message ai">
                    <div class="ai-message-avatar">🤖</div>
                    <div class="ai-message-content">
                        Hi! I'm your AI Startup Copilot. I can help you with funding, team building, MVP development, marketing, and more. What would you like to know?
                    </div>
                </div>
            </div>
            <div class="ai-chat-input">
                <input type="text" id="ai-query" class="form-input" placeholder="Ask me anything..." onkeypress="if(event.key==='Enter') sendAIQuery()">
                <button class="btn btn-primary" onclick="sendAIQuery()">
                    <span class="material-icons">send</span>
                </button>
            </div>
        </div>
    `;
    utils.showModal('AI Copilot', content);
}

async function sendAIQuery() {
    const input = document.getElementById('ai-query');
    const query = input.value.trim();
    if (!query) return;

    const messagesDiv = document.getElementById('ai-chat-messages');

    // Add user message
    messagesDiv.innerHTML += `
        <div class="ai-message user">
            <div class="ai-message-avatar">👤</div>
            <div class="ai-message-content">${query}</div>
        </div>
    `;

    input.value = '';

    // Show thinking
    messagesDiv.innerHTML += `
        <div class="ai-message ai" id="ai-thinking">
            <div class="ai-message-avatar">🤖</div>
            <div class="ai-thinking">
                <div class="ai-thinking-dot"></div>
                <div class="ai-thinking-dot"></div>
                <div class="ai-thinking-dot"></div>
            </div>
        </div>
    `;

    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
        const data = await api.aiCopilot(query);
        document.getElementById('ai-thinking').remove();

        messagesDiv.innerHTML += `
            <div class="ai-message ai">
                <div class="ai-message-avatar">🤖</div>
                <div class="ai-message-content">${data.response}</div>
            </div>
        `;

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        document.getElementById('ai-thinking').remove();
        utils.showToast('Failed to get AI response', 'error');
    }
}

function showIdeaValidator() {
    const content = `
        <div style="max-width: 600px;">
            <div class="form-group">
                <label class="form-label">Describe your startup idea</label>
                <textarea id="idea-input" class="form-textarea" rows="4" placeholder="E.g., A platform that connects freelance developers with startups..."></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Industry</label>
                <input type="text" id="industry-input" class="form-input" placeholder="E.g., SaaS, FinTech, HealthTech">
            </div>
            <div class="form-group">
                <label class="form-label">Target Market</label>
                <input type="text" id="market-input" class="form-input" placeholder="E.g., Small businesses, Developers">
            </div>
            <button class="btn btn-primary w-full" onclick="validateIdea()">Validate Idea</button>
            <div id="validation-result" style="margin-top: 2rem;"></div>
        </div>
    `;
    utils.showModal('Idea Validator', content);
}

async function validateIdea() {
    const idea = document.getElementById('idea-input').value;
    const industry = document.getElementById('industry-input').value;
    const market = document.getElementById('market-input').value;

    if (!idea) {
        utils.showToast('Please describe your idea', 'error');
        return;
    }

    const resultDiv = document.getElementById('validation-result');
    resultDiv.innerHTML = '<div class="spinner-large"></div>';

    try {
        const data = await api.validateIdea(idea, industry, market);
        const v = data.validation;

        resultDiv.innerHTML = `
            <div class="validation-score">
                <div class="validation-score-circle">
                    <div class="validation-score-number">${v.score}</div>
                    <div class="validation-score-label">Score</div>
                </div>
                <h3 style="text-align: center; margin-bottom: 0.5rem;">${v.viability} Viability</h3>
                <p style="text-align: center; color: var(--text-secondary);">${v.marketSize}</p>
            </div>
            
            <div class="validation-section">
                <h3><span class="material-icons" style="color: var(--color-success);">check_circle</span> Strengths</h3>
                <ul class="validation-list strengths">
                    ${v.strengths.map(s => `<li><span class="material-icons" style="font-size: 18px;">check</span> ${s}</li>`).join('')}
                </ul>
            </div>
            
            <div class="validation-section">
                <h3><span class="material-icons" style="color: var(--color-warning);">warning</span> Weaknesses</h3>
                <ul class="validation-list weaknesses">
                    ${v.weaknesses.map(w => `<li><span class="material-icons" style="font-size: 18px;">info</span> ${w}</li>`).join('')}
                </ul>
            </div>
            
            <div class="validation-section">
                <h3><span class="material-icons" style="color: var(--color-primary);">tips_and_updates</span> Recommendations</h3>
                <ul class="validation-list">
                    ${v.recommendations.map(r => `<li><span class="material-icons" style="font-size: 18px;">arrow_forward</span> ${r}</li>`).join('')}
                </ul>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = '';
        utils.showToast('Failed to validate idea', 'error');
    }
}

function showPitchDeck() {
    const content = `
        <div style="max-width: 600px;">
            <div class="form-group">
                <label class="form-label">Startup Name</label>
                <input type="text" id="startup-name" class="form-input" placeholder="Your startup name">
            </div>
            <div class="form-group">
                <label class="form-label">Brief Description</label>
                <textarea id="startup-desc" class="form-textarea" rows="3" placeholder="What does your startup do?"></textarea>
            </div>
            <button class="btn btn-primary w-full" onclick="generatePitchDeck()">Generate Pitch Deck</button>
            <div id="pitch-result" style="margin-top: 2rem;"></div>
        </div>
    `;
    utils.showModal('Pitch Deck Generator', content);
}

async function generatePitchDeck() {
    const name = document.getElementById('startup-name').value;
    const desc = document.getElementById('startup-desc').value;

    if (!name) {
        utils.showToast('Please enter startup name', 'error');
        return;
    }

    const resultDiv = document.getElementById('pitch-result');
    resultDiv.innerHTML = '<div class="spinner-large"></div>';

    try {
        const data = await api.generatePitchDeck(name, desc);
        const deck = data.pitchDeck;

        resultDiv.innerHTML = `
            <h3 class="mb-3">Your Pitch Deck Outline</h3>
            <div class="pitch-deck-slides">
                ${deck.slides.map((slide, i) => `
                    <div class="pitch-slide">
                        <div class="pitch-slide-number">Slide ${i + 1}</div>
                        <div class="pitch-slide-title">${slide.title}</div>
                        <div class="pitch-slide-content">${slide.content}</div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 2rem; padding: 1.5rem; background: var(--bg-elevated); border-radius: var(--radius-lg);">
                <h4 class="mb-2">💡 Pro Tips</h4>
                <ul style="margin: 0; padding-left: 1.5rem;">
                    ${deck.tips.map(tip => `<li style="margin-bottom: 0.5rem;">${tip}</li>`).join('')}
                </ul>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = '';
        utils.showToast('Failed to generate pitch deck', 'error');
    }
}

function showMVPPlanner() {
    const content = `
        <div style="max-width: 600px;">
            <div class="form-group">
                <label class="form-label">Your Idea</label>
                <textarea id="mvp-idea" class="form-textarea" rows="3" placeholder="Describe your MVP idea..."></textarea>
            </div>
            <button class="btn btn-primary w-full" onclick="generateMVPPlan()">Generate MVP Plan</button>
            <div id="mvp-result" style="margin-top: 2rem;"></div>
        </div>
    `;
    utils.showModal('MVP Planner', content);
}

async function generateMVPPlan() {
    const idea = document.getElementById('mvp-idea').value;

    if (!idea) {
        utils.showToast('Please describe your idea', 'error');
        return;
    }

    const resultDiv = document.getElementById('mvp-result');
    resultDiv.innerHTML = '<div class="spinner-large"></div>';

    try {
        const data = await api.generateMVPPlan(idea);
        const plan = data.plan;

        resultDiv.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 class="mb-2">Your MVP Roadmap</h3>
                <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;">
                    <div><strong>Timeline:</strong> ${plan.timeline}</div>
                    <div><strong>Budget:</strong> ${plan.budget}</div>
                    <div><strong>Team:</strong> ${plan.team}</div>
                </div>
            </div>
            
            <div class="mvp-timeline">
                ${plan.phases.map((phase, i) => `
                    <div class="mvp-phase">
                        <div class="mvp-phase-header">
                            <div class="mvp-phase-name">${phase.name}</div>
                            <div class="mvp-phase-duration">${phase.duration}</div>
                        </div>
                        <ul class="mvp-tasks">
                            ${phase.tasks.map(task => `<li>${task}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = '';
        utils.showToast('Failed to generate MVP plan', 'error');
    }
}

function showContractGenerator() {
    const content = `
        <div style="max-width: 600px;">
            <div class="form-group">
                <label class="form-label">Contract Type</label>
                <select id="contract-type" class="form-input">
                    <option value="nda">Non-Disclosure Agreement (NDA)</option>
                    <option value="cofounder">Co-Founder Agreement</option>
                    <option value="advisor">Advisor Agreement</option>
                    <option value="employment">Employment Agreement</option>
                </select>
            </div>
            <button class="btn btn-primary w-full" onclick="generateContract()">Generate Contract</button>
            <div id="contract-result" style="margin-top: 2rem;"></div>
        </div>
    `;
    utils.showModal('Contract Generator', content);
}

async function generateContract() {
    const type = document.getElementById('contract-type').value;
    const resultDiv = document.getElementById('contract-result');
    resultDiv.innerHTML = '<div class="spinner-large"></div>';

    try {
        const data = await api.generateContract(type);

        resultDiv.innerHTML = `
            <div class="contract-preview">
                <div class="contract-header">
                    <div class="contract-title">${type.toUpperCase().replace('-', ' ')} AGREEMENT</div>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                </div>
                <div style="white-space: pre-wrap; line-height: 1.8;">${data.contract}</div>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: var(--color-warning); color: white; border-radius: var(--radius-md);">
                <strong>⚠️ Legal Disclaimer:</strong> ${data.disclaimer}
            </div>
            <button class="btn btn-secondary w-full" style="margin-top: 1rem;" onclick="utils.showToast('Download feature coming soon!')">Download PDF</button>
        `;
    } catch (error) {
        resultDiv.innerHTML = '';
        utils.showToast('Failed to generate contract', 'error');
    }
}

function showSmartMatching() {
    utils.showToast('Smart Matching feature coming soon!');
}

function logout() {
    api.setToken(null);
    stateManager.update({
        user: null,
        isAuthenticated: false,
        role: null,
        currentScreen: 'login'
    });
    utils.showToast('Logged out successfully', 'success');
    render();
}

// ========== MAIN RENDER ==========
function render() {
    const app = document.getElementById('app');
    const screenFn = screens[stateManager.state.currentScreen] || screens.splash;
    app.innerHTML = screenFn() + BottomNav();
}

// ========== INITIALIZATION ==========
function init() {
    render();

    // Subscribe to state changes
    stateManager.subscribe('stateChange', () => {
        render();
    });

    console.log('✅ STARTLABX Integrated Platform v3.0 Loaded!');
    console.log('📡 API Base URL:', API_BASE_URL);
    console.log('🔐 Authenticated:', stateManager.state.isAuthenticated);
}

// ========== GLOBAL EXPORTS ==========
window.navigate = navigate;
window.logout = logout;
window.likePost = likePost;
window.connectWith = connectWith;
window.editStartup = editStartup;
window.utils = utils;
window.api = api;
window.stateManager = stateManager;

// ========== START APP ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
