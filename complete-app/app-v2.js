/*
 * STARTLABX Enhanced Platform v2.0
 * Advanced Architecture with Modular Components
 */

// ========== ENHANCED STATE MANAGEMENT ==========
class StateManager {
    constructor() {
        this.state = {
            currentScreen: 'splash',
            user: null,
            isAuthenticated: false,
            role: null,
            theme: 'dark',
            loading: false,

            // Enhanced data structures
            startups: this.generateStartups(),
            professionals: this.generateProfessionals(),
            posts: this.generatePosts(),
            messages: [],
            notifications: this.generateNotifications(),
            stats: { connections: 127, matches: 45, projects: 8, messages: 234, revenue: 15420 },
            tasks: {
                todo: ['Setup repository', 'Define schema', 'Create wireframes', 'Research competitors'],
                doing: ['Develop API', 'Design database', 'Build frontend'],
                done: ['Design UI', 'Setup project', 'Team formation']
            },

            // New features
            searchQuery: '',
            filters: { role: 'all', skills: [], availability: 'all' },
            activeChat: null,
            typingUsers: new Set(),
            onlineUsers: new Set(['user1', 'user2', 'user3']),
            selectedItems: new Set()
        };

        this.listeners = new Map();
        this.loadFromStorage();
    }

    generateStartups() {
        return [
            { id: 1, name: 'TechVenture AI', stage: 'Seed', description: 'AI-powered analytics platform for startups', progress: 65, views: 342, team: 4, funding: '$500K' },
            { id: 2, name: 'HealthSync', stage: 'Series A', description: 'Healthcare collaboration and telemedicine', progress: 78, views: 521, team: 8, funding: '$2M' },
            { id: 3, name: 'EcoTrack', stage: 'MVP', description: 'Sustainability tracking and carbon footprint', progress: 45, views: 189, team: 3, funding: '$100K' },
            { id: 4, name: 'FinFlow', stage: 'Seed', description: 'Financial management for SMBs', progress: 55, views: 267, team: 5, funding: '$750K' },
            { id: 5, name: 'EduConnect', stage: 'Pre-seed', description: 'Online education marketplace', progress: 30, views: 145, team: 2, funding: '$50K' }
        ];
    }

    generateProfessionals() {
        return [
            { id: 1, name: 'Sarah Chen', role: 'Full Stack Developer', score: 95, skills: ['React', 'Node.js', 'Python', 'AWS'], experience: '5 years', rate: '$120/hr', available: true },
            { id: 2, name: 'Mike Johnson', role: 'UI/UX Designer', score: 88, skills: ['Figma', 'Design Systems', 'Prototyping'], experience: '4 years', rate: '$90/hr', available: true },
            { id: 3, name: 'Alex Kumar', role: 'Data Scientist', score: 92, skills: ['ML', 'Python', 'TensorFlow', 'Analytics'], experience: '6 years', rate: '$150/hr', available: false },
            { id: 4, name: 'Emily Rodriguez', role: 'Product Manager', score: 90, skills: ['Agile', 'Strategy', 'Analytics'], experience: '7 years', rate: '$110/hr', available: true },
            { id: 5, name: 'David Park', role: 'DevOps Engineer', score: 87, skills: ['Docker', 'Kubernetes', 'CI/CD'], experience: '5 years', rate: '$130/hr', available: true }
        ];
    }

    generatePosts() {
        return [
            { id: 1, author: 'John Doe', avatar: '👨‍💼', content: 'Just launched our MVP! 🚀 Looking for early adopters and feedback.', likes: 45, comments: 12, time: '2h ago', liked: false },
            { id: 2, author: 'Jane Smith', avatar: '👩‍💻', content: 'Seeking a technical co-founder for a FinTech startup. DM if interested!', likes: 23, comments: 8, time: '5h ago', liked: false },
            { id: 3, author: 'Bob Wilson', avatar: '👨‍🔬', content: 'Our team just raised $2M in seed funding! Grateful for the journey 🙏', likes: 67, comments: 15, time: '1d ago', liked: true }
        ];
    }

    generateNotifications() {
        return [
            { id: 1, text: 'New match found! TechVenture AI is interested in your profile', time: '2 min ago', read: false, icon: 'star', type: 'match' },
            { id: 2, text: 'Sarah Chen sent you a message', time: '1 hour ago', read: false, icon: 'message', type: 'message' },
            { id: 3, text: 'Profile updated successfully', time: '3 hours ago', read: true, icon: 'check_circle', type: 'success' },
            { id: 4, text: 'New connection request from David Park', time: '5 hours ago', read: true, icon: 'person_add', type: 'connection' },
            { id: 5, text: 'Your startup was viewed 15 times today', time: '1d ago', read: true, icon: 'visibility', type: 'info' }
        ];
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
        this.saveToStorage();
        this.emit('stateChange', this.state);
    }

    saveToStorage() {
        try {
            localStorage.setItem('startlabx_state', JSON.stringify({
                user: this.state.user,
                isAuthenticated: this.state.isAuthenticated,
                role: this.state.role,
                theme: this.state.theme
            }));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('startlabx_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state = { ...this.state, ...data };
                if (this.state.isAuthenticated) {
                    this.state.currentScreen = 'dashboard';
                }
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }
}

const stateManager = new StateManager();

// ========== UTILITY FUNCTIONS ==========
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
    },

    formatTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// ========== ROUTER ==========
function navigate(screen, params = {}) {
    stateManager.update({ currentScreen: screen, ...params });
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
                    <p style="font-size: 0.875rem; color: var(--text-tertiary); margin: 0;">${startup.team} team members • ${startup.funding}</p>
                </div>
                <span class="badge badge-primary">${startup.stage}</span>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">${startup.description}</p>
            <div class="flex items-center gap-2 mb-3">
                <span class="badge badge-outline">
                    <span class="material-icons" style="font-size: 14px;">visibility</span>
                    ${startup.views} views
                </span>
                <span class="badge badge-outline">
                    <span class="material-icons" style="font-size: 14px;">trending_up</span>
                    ${startup.progress}% complete
                </span>
            </div>
            <div class="mb-3">
                <div class="flex justify-between mb-1">
                    <span style="font-size: 0.875rem; color: var(--text-tertiary);">Progress</span>
                    <span style="font-size: 0.875rem; color: var(--color-primary); font-weight: 600;">${startup.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${startup.progress}%;"></div>
                </div>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-primary" style="flex: 1;" onclick="utils.showToast('Opening ${startup.name} details')">
                    <span class="material-icons" style="font-size: 18px;">edit</span>
                    Edit
                </button>
                <button class="btn btn-secondary" style="flex: 1;" onclick="navigate('analytics', {startupId: ${startup.id}})">
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
                    <p style="font-size: 0.875rem; color: var(--text-tertiary); margin: 0;">${pro.experience} • ${pro.rate}</p>
                </div>
                <span class="badge badge-success">${pro.score}%</span>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">${pro.role}</p>
            <div class="flex gap-1 mb-3" style="flex-wrap: wrap;">
                ${pro.skills.map(skill => `<span class="badge badge-outline">${skill}</span>`).join('')}
            </div>
            <div class="flex items-center gap-2 mb-3">
                <span class="badge ${pro.available ? 'badge-success' : 'badge-outline'}">
                    <span class="material-icons" style="font-size: 14px;">${pro.available ? 'check_circle' : 'schedule'}</span>
                    ${pro.available ? 'Available' : 'Busy'}
                </span>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-primary" style="flex: 1;" onclick="utils.showToast('Connection request sent to ${pro.name}', 'success')">
                    <span class="material-icons" style="font-size: 18px;">person_add</span>
                    Connect
                </button>
                <button class="btn btn-secondary" onclick="navigate('profile', {userId: ${pro.id}})">
                    <span class="material-icons" style="font-size: 18px;">visibility</span>
                </button>
            </div>
        </div>
    `,

    postCard: (post) => `
        <div class="glass-card mb-3 fade-in">
            <div class="flex items-center gap-2 mb-3">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    ${post.avatar}
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0; font-size: 1rem;">${post.author}</h4>
                    <span style="font-size: 0.875rem; color: var(--text-tertiary);">${post.time}</span>
                </div>
                <button class="btn-icon-sm btn-secondary">
                    <span class="material-icons">more_vert</span>
                </button>
            </div>
            <p style="margin-bottom: 1rem; line-height: 1.6;">${post.content}</p>
            <div class="flex gap-4">
                <button class="flex items-center gap-1" style="background: none; border: none; color: ${post.liked ? 'var(--color-error)' : 'var(--text-secondary)'}; cursor: pointer; padding: 0.5rem; border-radius: var(--radius-md); transition: all 0.3s;" 
                        onclick="toggleLike(${post.id})">
                    <span class="material-icons" style="font-size: 20px;">${post.liked ? 'favorite' : 'favorite_border'}</span>
                    <span style="font-weight: 500;">${post.likes}</span>
                </button>
                <button class="flex items-center gap-1" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.5rem; border-radius: var(--radius-md); transition: all 0.3s;">
                    <span class="material-icons" style="font-size: 20px;">comment</span>
                    <span style="font-weight: 500;">${post.comments}</span>
                </button>
                <button class="flex items-center gap-1" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.5rem; border-radius: var(--radius-md); transition: all 0.3s;">
                    <span class="material-icons" style="font-size: 20px;">share</span>
                </button>
            </div>
        </div>
    `
};

// ========== ENHANCED SCREENS ==========
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
        const pages = [
            { icon: 'rocket_launch', title: 'Build Startups Together', desc: 'Connect with talented professionals and visionary founders to bring your ideas to life' },
            { icon: 'auto_awesome', title: 'AI-Powered Matching', desc: 'Our smart algorithms find your perfect co-founder, team member, or opportunity' },
            { icon: 'trending_up', title: 'Launch Faster', desc: 'Access powerful tools, resources, and a thriving community to accelerate your startup journey' }
        ];

        let currentPage = 0;

        setTimeout(() => {
            const btn = document.getElementById('onboarding-next');
            if (btn) {
                btn.onclick = () => {
                    if (currentPage < 2) {
                        currentPage++;
                        updatePage();
                    } else {
                        navigate('login');
                    }
                };
            }

            function updatePage() {
                const page = pages[currentPage];
                document.getElementById('onboarding-content').innerHTML = `
                    <div class="fade-in">
                        <span class="material-icons float" style="font-size: 140px; color: var(--color-primary); margin-bottom: 2rem;">${page.icon}</span>
                        <h2 style="margin-bottom: 1rem;">${page.title}</h2>
                        <p style="font-size: 1.125rem; max-width: 500px; margin: 0 auto; color: var(--text-secondary);">${page.desc}</p>
                    </div>
                `;
                btn.textContent = currentPage === 2 ? 'Get Started' : 'Next';
                document.querySelectorAll('.dot').forEach((dot, i) => {
                    dot.style.background = i === currentPage ? 'var(--gradient-primary)' : 'var(--glass-border)';
                    dot.style.width = i === currentPage ? '24px' : '8px';
                });
            }
        }, 100);

        return `
            <div class="screen-center">
                <div class="container text-center">
                    <div id="onboarding-content" style="min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div class="fade-in">
                            <span class="material-icons float" style="font-size: 140px; color: var(--color-primary); margin-bottom: 2rem;">${pages[0].icon}</span>
                            <h2 style="margin-bottom: 1rem;">${pages[0].title}</h2>
                            <p style="font-size: 1.125rem; max-width: 500px; margin: 0 auto; color: var(--text-secondary);">${pages[0].desc}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; justify-content: center; margin: 2rem 0;">
                        <div class="dot" style="width: 24px; height: 8px; border-radius: var(--radius-full); background: var(--gradient-primary); transition: all 0.3s;"></div>
                        <div class="dot" style="width: 8px; height: 8px; border-radius: 50%; background: var(--glass-border); transition: all 0.3s;"></div>
                        <div class="dot" style="width: 8px; height: 8px; border-radius: 50%; background: var(--glass-border); transition: all 0.3s;"></div>
                    </div>
                    <button id="onboarding-next" class="btn btn-primary btn-lg">Next</button>
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-secondary btn-sm" onclick="navigate('login')">Skip</button>
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
                    const btn = document.getElementById('login-btn');
                    btn.disabled = true;
                    btn.innerHTML = '<div class="spinner-sm"></div> Logging in...';

                    setTimeout(() => {
                        stateManager.update({
                            user: { email, name: email.split('@')[0] },
                            isAuthenticated: true,
                            role: email.includes('founder') ? 'FOUNDER' : 'PROFESSIONAL'
                        });
                        utils.showToast('Welcome back!', 'success');
                        navigate('dashboard');
                    }, 1000);
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
                                <div class="input-with-icon">
                                    <span class="material-icons">email</span>
                                    <input type="email" id="email" class="form-input" placeholder="your@email.com" required value="founder@startlabx.com">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <div class="input-with-icon">
                                    <span class="material-icons">lock</span>
                                    <input type="password" class="form-input" placeholder="••••••••" required value="password">
                                </div>
                            </div>
                            <div class="flex justify-between items-center mb-3">
                                <label class="flex items-center gap-2" style="cursor: pointer;">
                                    <input type="checkbox" style="width: 18px; height: 18px;">
                                    <span style="font-size: 0.875rem; color: var(--text-secondary);">Remember me</span>
                                </label>
                                <a href="#" style="font-size: 0.875rem;">Forgot password?</a>
                            </div>
                            <button type="submit" id="login-btn" class="btn btn-primary w-full">Login</button>
                        </form>
                        <div class="text-center mt-4">
                            <p style="font-size: 0.875rem; color: var(--text-tertiary);">
                                Don't have an account? <a href="#" onclick="utils.showToast('Signup feature coming soon!')">Sign up</a>
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

        return `
            <div class="screen">
                <div class="container">
                    <div class="fade-in">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <h1 class="mb-1">Welcome Back, ${state.user?.name || 'User'}! 👋</h1>
                                <p style="margin: 0; color: var(--text-secondary);">Here's what's happening with your ${isFounder ? 'startups' : 'opportunities'}</p>
                            </div>
                            <button class="btn btn-primary" onclick="navigate('${isFounder ? 'marketplace' : 'social'}')">
                                <span class="material-icons">add</span>
                                ${isFounder ? 'New Startup' : 'Explore'}
                            </button>
                        </div>
                        
                        <div class="grid grid-4 mb-4">
                            ${components.statCard('business', state.stats.projects, 'Active Projects', 'primary', 0)}
                            ${components.statCard('people', state.stats.connections, 'Connections', 'accent', 0.1)}
                            ${components.statCard('trending_up', state.stats.matches, 'Matches', 'success', 0.2)}
                            ${isFounder ? components.statCard('attach_money', '$' + (state.stats.revenue / 1000).toFixed(1) + 'K', 'Revenue', 'warning', 0.3) : components.statCard('message', state.stats.messages, 'Messages', 'secondary', 0.3)}
                        </div>
                        
                        <div class="flex justify-between items-center mb-3">
                            <h2 style="margin: 0;">${isFounder ? 'My Startups' : 'Top Matches'}</h2>
                            <div class="flex gap-2">
                                <button class="btn btn-secondary btn-sm">
                                    <span class="material-icons" style="font-size: 18px;">filter_list</span>
                                    Filter
                                </button>
                                <button class="btn btn-secondary btn-sm">
                                    <span class="material-icons" style="font-size: 18px;">sort</span>
                                    Sort
                                </button>
                            </div>
                        </div>
                        
                        <div class="grid grid-2">
                            ${items.slice(0, 4).map((item, i) =>
            isFounder ? components.startupCard(item, i) : components.professionalCard(item, i)
        ).join('')}
                        </div>
                        
                        ${items.length > 4 ? `
                            <div class="text-center mt-4">
                                <button class="btn btn-secondary" onclick="navigate('${isFounder ? 'projects' : 'marketplace'}')">
                                    View All ${items.length} ${isFounder ? 'Startups' : 'Professionals'}
                                </button>
                            </div>
                        ` : ''}
                    </div>
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
                    
                    <div class="glass-card mb-4">
                        <div class="flex gap-2 mb-3">
                            <div class="input-with-icon" style="flex: 1;">
                                <span class="material-icons">search</span>
                                <input type="text" class="form-input" placeholder="Search by name, role, or skills..." 
                                       oninput="handleSearch(event)" value="${state.searchQuery}">
                            </div>
                            <button class="btn btn-primary">
                                <span class="material-icons">search</span>
                                Search
                            </button>
                        </div>
                        
                        <div class="flex gap-2" style="flex-wrap: wrap;">
                            <button class="badge badge-outline" style="cursor: pointer;">All Roles</button>
                            <button class="badge badge-outline" style="cursor: pointer;">Developers</button>
                            <button class="badge badge-outline" style="cursor: pointer;">Designers</button>
                            <button class="badge badge-outline" style="cursor: pointer;">Product</button>
                            <button class="badge badge-outline" style="cursor: pointer;">Marketing</button>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center mb-3">
                        <p style="margin: 0; color: var(--text-secondary);">Found ${state.professionals.length} professionals</p>
                        <div class="flex gap-2">
                            <button class="btn btn-secondary btn-sm">
                                <span class="material-icons">view_module</span>
                            </button>
                            <button class="btn btn-secondary btn-sm">
                                <span class="material-icons">view_list</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-3">
                        ${state.professionals.map((pro, i) => components.professionalCard(pro, i)).join('')}
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
                    
                    <div class="glass-card mb-4">
                        <div class="flex gap-2">
                            <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--gradient-primary);"></div>
                            <input type="text" class="form-input" placeholder="What's on your mind?" style="flex: 1;" 
                                   onclick="utils.showToast('Post creation coming soon!')">
                            <button class="btn btn-primary">
                                <span class="material-icons">send</span>
                            </button>
                        </div>
                    </div>
                    
                    ${state.posts.map(post => components.postCard(post)).join('')}
                </div>
            </div>
        `;
    },

    analytics: () => {
        const state = stateManager.state;
        return `
            <div class="screen">
                <div class="container">
                    <h1 class="mb-4">Analytics Dashboard</h1>
                    
                    <div class="grid grid-4 mb-4">
                        ${components.statCard('visibility', '12.5K', 'Total Views', 'primary', 0)}
                        ${components.statCard('people', '342', 'Engagements', 'accent', 0.1)}
                        ${components.statCard('trending_up', '+23%', 'Growth', 'success', 0.2)}
                        ${components.statCard('schedule', '4.2m', 'Avg. Time', 'warning', 0.3)}
                    </div>
                    
                    <div class="grid grid-2 mb-4">
                        <div class="glass-card">
                            <h3 class="mb-3">Growth Metrics</h3>
                            <div style="height: 250px; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); border-radius: var(--radius-md);">
                                <div class="text-center">
                                    <span class="material-icons" style="font-size: 64px; color: var(--text-tertiary); margin-bottom: 1rem;">show_chart</span>
                                    <p style="color: var(--text-tertiary);">Chart visualization</p>
                                </div>
                            </div>
                        </div>
                        <div class="glass-card">
                            <h3 class="mb-3">Engagement Rate</h3>
                            <div style="height: 250px; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); border-radius: var(--radius-md);">
                                <div class="text-center">
                                    <span class="material-icons" style="font-size: 64px; color: var(--text-tertiary); margin-bottom: 1rem;">pie_chart</span>
                                    <p style="color: var(--text-tertiary);">Chart visualization</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="glass-card">
                        <h3 class="mb-3">Recent Activity</h3>
                        <div class="flex flex-col gap-2">
                            ${[
                { icon: 'visibility', text: 'Your profile was viewed 45 times', time: '2h ago' },
                { icon: 'favorite', text: 'Your post received 23 likes', time: '5h ago' },
                { icon: 'comment', text: '8 new comments on your startup', time: '1d ago' }
            ].map(activity => `
                                <div class="flex items-center gap-3 p-3" style="background: var(--bg-secondary); border-radius: var(--radius-md);">
                                    <span class="material-icons" style="color: var(--color-primary);">${activity.icon}</span>
                                    <div style="flex: 1;">
                                        <p style="margin: 0;">${activity.text}</p>
                                        <span style="font-size: 0.875rem; color: var(--text-tertiary);">${activity.time}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    projects: () => {
        const state = stateManager.state;
        return `
            <div class="screen">
                <div class="container">
                    <div class="flex justify-between items-center mb-4">
                        <h1 style="margin: 0;">Project Board</h1>
                        <button class="btn btn-primary" onclick="utils.showToast('Add task feature coming soon!')">
                            <span class="material-icons">add</span>
                            Add Task
                        </button>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem;">
                        ${Object.entries(state.tasks).map(([key, tasks]) => `
                            <div class="glass-card" style="min-width: 320px; max-width: 320px;">
                                <div class="flex justify-between items-center mb-3">
                                    <h3 style="margin: 0;">${key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                                    <span class="badge badge-outline">${tasks.length}</span>
                                </div>
                                <div class="flex flex-col gap-2">
                                    ${tasks.map((task, i) => `
                                        <div class="card fade-in" style="padding: 1rem; cursor: move; animation-delay: ${i * 0.05}s;" draggable="true">
                                            <div class="flex items-start gap-2">
                                                <input type="checkbox" style="margin-top: 2px;">
                                                <p style="margin: 0; flex: 1;">${task}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <button class="btn btn-secondary w-full mt-3" onclick="utils.showToast('Add task to ${key}')">
                                    <span class="material-icons" style="font-size: 18px;">add</span>
                                    Add Task
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    aitools: () => {
        const tools = [
            { icon: 'psychology', title: 'AI Copilot', desc: 'Get instant startup advice and guidance', color: 'primary' },
            { icon: 'lightbulb', title: 'Idea Validator', desc: 'Validate your business idea with AI', color: 'warning' },
            { icon: 'slideshow', title: 'Pitch Deck Generator', desc: 'Create professional pitch decks', color: 'accent' },
            { icon: 'map', title: 'MVP Planner', desc: 'Plan your minimum viable product', color: 'success' },
            { icon: 'description', title: 'Contract Generator', desc: 'Generate legal contracts instantly', color: 'secondary' },
            { icon: 'auto_awesome', title: 'Smart Matching', desc: 'AI-powered team matching algorithm', color: 'primary' }
        ];

        return `
            <div class="screen">
                <div class="container">
                    <h1 class="mb-2">AI-Powered Tools</h1>
                    <p class="mb-4" style="color: var(--text-secondary);">Leverage artificial intelligence to accelerate your startup journey</p>
                    
                    <div class="grid grid-2">
                        ${tools.map((tool, i) => `
                            <div class="glass-card slide-in" style="animation-delay: ${i * 0.1}s; cursor: pointer;" 
                                 onclick="utils.showModal('${tool.title}', '<p>This AI tool will help you ${tool.desc.toLowerCase()}. Feature coming soon!</p>', [{label: 'Got it', primary: true, onClick: 'utils.closeModal()'}])">
                                <div class="flex items-start gap-3">
                                    <div style="width: 64px; height: 64px; border-radius: var(--radius-lg); background: var(--gradient-${tool.color}); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <span class="material-icons" style="font-size: 32px; color: white;">${tool.icon}</span>
                                    </div>
                                    <div style="flex: 1;">
                                        <h3 class="mb-1">${tool.title}</h3>
                                        <p style="color: var(--text-secondary); margin: 0; font-size: 0.875rem;">${tool.desc}</p>
                                    </div>
                                    <span class="material-icons" style="color: var(--text-tertiary);">arrow_forward</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    profile: () => {
        const state = stateManager.state;
        return `
            <div class="screen">
                <div class="container" style="max-width: 800px;">
                    <h1 class="mb-4">Profile Settings</h1>
                    
                    <div class="glass-card mb-4">
                        <div class="flex items-center gap-4 mb-4">
                            <div style="width: 96px; height: 96px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; font-size: 48px;">
                                👤
                            </div>
                            <div style="flex: 1;">
                                <h3 style="margin-bottom: 0.5rem;">${state.user?.name || 'User'}</h3>
                                <p style="margin: 0; color: var(--text-secondary);">${state.user?.email}</p>
                            </div>
                            <button class="btn btn-secondary">
                                <span class="material-icons">photo_camera</span>
                                Change Photo
                            </button>
                        </div>
                    </div>
                    
                    <div class="glass-card mb-4">
                        <h3 class="mb-3">Personal Information</h3>
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" class="form-input" value="${state.user?.name || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" value="${state.user?.email || ''}" disabled>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Bio</label>
                            <textarea class="form-textarea" placeholder="Tell us about yourself..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Skills</label>
                            <input type="text" class="form-input" placeholder="React, Node.js, Python...">
                        </div>
                        <button class="btn btn-primary" onclick="utils.showToast('Profile updated successfully!', 'success')">
                            <span class="material-icons">save</span>
                            Save Changes
                        </button>
                    </div>
                    
                    <div class="glass-card mb-4">
                        <h3 class="mb-3">Preferences</h3>
                        <div class="flex justify-between items-center mb-3 p-3" style="background: var(--bg-secondary); border-radius: var(--radius-md);">
                            <div>
                                <h4 style="margin: 0; margin-bottom: 0.25rem;">Email Notifications</h4>
                                <p style="margin: 0; font-size: 0.875rem; color: var(--text-tertiary);">Receive email updates</p>
                            </div>
                            <input type="checkbox" checked style="width: 48px; height: 24px;">
                        </div>
                        <div class="flex justify-between items-center p-3" style="background: var(--bg-secondary); border-radius: var(--radius-md);">
                            <div>
                                <h4 style="margin: 0; margin-bottom: 0.25rem;">Dark Mode</h4>
                                <p style="margin: 0; font-size: 0.875rem; color: var(--text-tertiary);">Use dark theme</p>
                            </div>
                            <input type="checkbox" checked style="width: 48px; height: 24px;">
                        </div>
                    </div>
                    
                    <button onclick="logout()" class="btn btn-secondary w-full">
                        <span class="material-icons">logout</span>
                        Logout
                    </button>
                </div>
            </div>
        `;
    },

    notifications: () => {
        const state = stateManager.state;
        return `
            <div class="screen">
                <div class="container" style="max-width: 800px;">
                    <div class="flex justify-between items-center mb-4">
                        <h1 style="margin: 0;">Notifications</h1>
                        <button class="btn btn-secondary btn-sm" onclick="markAllRead()">
                            <span class="material-icons" style="font-size: 18px;">done_all</span>
                            Mark all read
                        </button>
                    </div>
                    
                    ${state.notifications.map((notif, i) => `
                        <div class="glass-card mb-2 fade-in" style="animation-delay: ${i * 0.05}s; opacity: ${notif.read ? 0.7 : 1}; cursor: pointer;" 
                             onclick="markAsRead(${notif.id})">
                            <div class="flex justify-between items-center">
                                <div class="flex gap-3 items-center" style="flex: 1;">
                                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center;">
                                        <span class="material-icons" style="color: white; font-size: 20px;">${notif.icon}</span>
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="margin: 0; font-weight: ${notif.read ? 400 : 600};">${notif.text}</p>
                                        <span style="font-size: 0.875rem; color: var(--text-tertiary);">${notif.time}</span>
                                    </div>
                                </div>
                                ${!notif.read ? '<div style="width: 10px; height: 10px; background: var(--color-primary); border-radius: 50%;"></div>' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    subscription: () => {
        const plans = [
            { name: 'Free', price: '$0', features: ['Basic matching', '5 connections/month', 'Community access', 'Email support'], color: 'secondary' },
            { name: 'Pro', price: '$29', features: ['Advanced matching', 'Unlimited connections', 'AI Tools access', 'Priority support', 'Analytics dashboard'], popular: true, color: 'primary' },
            { name: 'Enterprise', price: '$99', features: ['Everything in Pro', 'Team collaboration', 'Custom integrations', 'Dedicated manager', 'White-label option'], color: 'accent' }
        ];

        return `
            <div class="screen">
                <div class="container">
                    <div class="text-center mb-4">
                        <h1 class="mb-2">Choose Your Plan</h1>
                        <p style="color: var(--text-secondary);">Unlock premium features to accelerate your startup journey</p>
                    </div>
                    
                    <div class="grid grid-3">
                        ${plans.map((plan, i) => `
                            <div class="glass-card slide-in" style="animation-delay: ${i * 0.1}s; ${plan.popular ? 'border: 2px solid var(--color-primary); transform: scale(1.05);' : ''}">
                                ${plan.popular ? '<div class="badge badge-primary mb-3">Most Popular</div>' : ''}
                                <h3 class="mb-2">${plan.name}</h3>
                                <div class="mb-4">
                                    <span style="font-size: 3rem; font-weight: 700; background: var(--gradient-${plan.color}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${plan.price}</span>
                                    <span style="color: var(--text-tertiary);">/month</span>
                                </div>
                                <ul style="list-style: none; margin-bottom: 2rem;">
                                    ${plan.features.map(f => `
                                        <li style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                                            <span class="material-icons" style="font-size: 20px; color: var(--color-success);">check_circle</span>
                                            <span>${f}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                                <button class="btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} w-full" 
                                        onclick="utils.showToast('${plan.name === 'Free' ? 'You are on the Free plan' : 'Upgrade to ' + plan.name + ' plan'}', '${plan.name === 'Free' ? 'info' : 'success'}')">
                                    ${plan.name === 'Free' ? 'Current Plan' : 'Upgrade to ' + plan.name}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
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
function toggleLike(postId) {
    const posts = stateManager.state.posts;
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        stateManager.update({ posts });
        render();
    }
}

function markAsRead(notifId) {
    const notifications = stateManager.state.notifications;
    const notif = notifications.find(n => n.id === notifId);
    if (notif && !notif.read) {
        notif.read = true;
        stateManager.update({ notifications });
        render();
    }
}

function markAllRead() {
    const notifications = stateManager.state.notifications.map(n => ({ ...n, read: true }));
    stateManager.update({ notifications });
    utils.showToast('All notifications marked as read', 'success');
    render();
}

function handleSearch(event) {
    stateManager.update({ searchQuery: event.target.value });
}

function logout() {
    stateManager.update({
        user: null,
        isAuthenticated: false,
        role: null,
        currentScreen: 'login'
    });
    localStorage.clear();
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
    console.log('✅ STARTLABX Enhanced Platform v2.0 Loaded!');
    console.log('📊 Features: Advanced State Management, Event System, Enhanced UI');
}

// ========== GLOBAL EXPORTS ==========
window.navigate = navigate;
window.logout = logout;
window.toggleLike = toggleLike;
window.markAsRead = markAsRead;
window.markAllRead = markAllRead;
window.handleSearch = handleSearch;
window.utils = utils;

// ========== START APP ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
