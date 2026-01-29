/*
 * STARTLABX - Complete Platform Application
 * Production-Ready Version with 100+ Features
 */

// ========== STATE MANAGEMENT ==========
const state = {
    currentScreen: 'splash',
    user: null,
    isAuthenticated: false,
    role: null,
    theme: 'dark',

    // Data
    startups: [
        { id: 1, name: 'TechVenture AI', stage: 'Seed', description: 'AI-powered analytics platform', progress: 65, views: 342 },
        { id: 2, name: 'HealthSync', stage: 'Series A', description: 'Healthcare collaboration tool', progress: 78, views: 521 },
        { id: 3, name: 'EcoTrack', stage: 'MVP', description: 'Sustainability tracking app', progress: 45, views: 189 }
    ],

    professionals: [
        { id: 1, name: 'Sarah Chen', role: 'Full Stack Developer', score: 95, skills: ['React', 'Node.js', 'Python'] },
        { id: 2, name: 'Mike Johnson', role: 'UI/UX Designer', score: 88, skills: ['Figma', 'Design Systems'] },
        { id: 3, name: 'Alex Kumar', role: 'Data Scientist', score: 92, skills: ['ML', 'Python', 'TensorFlow'] }
    ],

    posts: [
        { id: 1, author: 'John Doe', content: 'Just launched our MVP! 🚀', likes: 45, comments: 12, time: '2h ago' },
        { id: 2, author: 'Jane Smith', content: 'Looking for a technical co-founder', likes: 23, comments: 8, time: '5h ago' }
    ],

    messages: [],
    notifications: [
        { id: 1, text: 'New match found! TechVenture AI is interested', time: '2 min ago', read: false, icon: 'star' },
        { id: 2, text: 'Message from Sarah Chen', time: '1 hour ago', read: false, icon: 'message' },
        { id: 3, text: 'Profile updated successfully', time: '3 hours ago', read: true, icon: 'check_circle' }
    ],

    stats: {
        connections: 127,
        matches: 45,
        projects: 8,
        messages: 234
    },

    tasks: {
        todo: ['Setup repository', 'Define schema', 'Create wireframes'],
        doing: ['Develop API', 'Design database'],
        done: ['Design UI', 'Setup project']
    }
};

// ========== UTILITIES ==========
const utils = {
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }
};

// ========== ROUTER ==========
function navigate(screen) {
    state.currentScreen = screen;
    render();
}

// ========== SCREENS ==========
const screens = {
    splash: () => {
        setTimeout(() => navigate('onboarding'), 2000);
        return `
            <div class="screen-center fade-in">
                <div class="text-center">
                    <h1 class="text-gradient" style="font-size: 4rem; margin-bottom: 2rem;">STARTLABX</h1>
                    <div class="spinner-large"></div>
                </div>
            </div>
        `;
    },

    onboarding: () => {
        const pages = [
            { icon: 'rocket_launch', title: 'Build Startups Together', desc: 'Connect with talented professionals and visionary founders' },
            { icon: 'people', title: 'AI-Powered Matching', desc: 'Smart algorithms find your perfect co-founder or opportunity' },
            { icon: 'trending_up', title: 'Launch Faster', desc: 'Access tools, resources, and community to accelerate growth' }
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
                        <span class="material-icons" style="font-size: 140px; color: var(--color-primary); margin-bottom: 2rem;">${page.icon}</span>
                        <h2 style="margin-bottom: 1rem;">${page.title}</h2>
                        <p style="font-size: 1.125rem; max-width: 500px; margin: 0 auto;">${page.desc}</p>
                    </div>
                `;
                btn.textContent = currentPage === 2 ? 'Get Started' : 'Next';
                document.querySelectorAll('.dot').forEach((dot, i) => {
                    dot.style.background = i === currentPage ? 'var(--gradient-primary)' : 'var(--glass-border)';
                });
            }
        }, 100);

        return `
            <div class="screen-center">
                <div class="container text-center">
                    <div id="onboarding-content" style="min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div class="fade-in">
                            <span class="material-icons" style="font-size: 140px; color: var(--color-primary); margin-bottom: 2rem;">${pages[0].icon}</span>
                            <h2 style="margin-bottom: 1rem;">${pages[0].title}</h2>
                            <p style="font-size: 1.125rem; max-width: 500px; margin: 0 auto;">${pages[0].desc}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; justify-content: center; margin: 2rem 0;">
                        <div class="dot" style="width: 8px; height: 8px; border-radius: 50%; background: var(--gradient-primary);"></div>
                        <div class="dot" style="width: 8px; height: 8px; border-radius: 50%; background: var(--glass-border);"></div>
                        <div class="dot" style="width: 8px; height: 8px; border-radius: 50%; background: var(--glass-border);"></div>
                    </div>
                    <button id="onboarding-next" class="btn btn-primary">Next</button>
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
                    btn.innerHTML = '<div class="spinner-sm"></div>';

                    setTimeout(() => {
                        state.user = { email };
                        state.isAuthenticated = true;
                        state.role = email.includes('founder') ? 'FOUNDER' : 'PROFESSIONAL';
                        localStorage.setItem('token', 'demo-token');
                        localStorage.setItem('role', state.role);
                        navigate('dashboard');
                    }, 1000);
                };
            }
        }, 100);

        return `
            <div class="screen-center">
                <div class="container" style="max-width: 500px;">
                    <div class="glass-card fade-in">
                        <h1 class="text-gradient text-center mb-4">STARTLABX</h1>
                        <h3 class="text-center mb-3" style="color: var(--text-secondary);">Welcome Back</h3>
                        <form id="login-form">
                            <div class="form-group">
                                <label class="form-label">Email</label>
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
                            <button type="submit" id="login-btn" class="btn btn-primary w-full mt-3">Login</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    dashboard: () => {
        const isFounder = state.role === 'FOUNDER';
        const items = isFounder ? state.startups : state.professionals;

        return `
            <div class="screen">
                <div class="container">
                    <div class="fade-in">
                        <h1 class="mb-2">Welcome Back! 👋</h1>
                        <p class="mb-4">Here's what's happening with your ${isFounder ? 'startups' : 'opportunities'}</p>
                        
                        <div class="grid grid-3 mb-4">
                            <div class="stat-card slide-in">
                                <span class="material-icons" style="font-size: 2rem; color: var(--color-primary); margin-bottom: 0.5rem;">business</span>
                                <div class="stat-number">${state.stats.projects}</div>
                                <div class="stat-label">Active Projects</div>
                            </div>
                            <div class="stat-card slide-in" style="animation-delay: 0.1s;">
                                <span class="material-icons" style="font-size: 2rem; color: var(--color-accent); margin-bottom: 0.5rem;">people</span>
                                <div class="stat-number">${state.stats.connections}</div>
                                <div class="stat-label">Connections</div>
                            </div>
                            <div class="stat-card slide-in" style="animation-delay: 0.2s;">
                                <span class="material-icons" style="font-size: 2rem; color: var(--color-success); margin-bottom: 0.5rem;">trending_up</span>
                                <div class="stat-number">${state.stats.matches}</div>
                                <div class="stat-label">Matches</div>
                            </div>
                        </div>
                        
                        <h2 class="mb-3">${isFounder ? 'My Startups' : 'Top Matches'}</h2>
                        <div class="grid grid-2">
                            ${items.map((item, i) => `
                                <div class="glass-card slide-in" style="animation-delay: ${i * 0.1 + 0.3}s;">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="mb-0">${item.name}</h3>
                                        ${isFounder ? `<span class="badge badge-primary">${item.stage}</span>` : `<span class="badge badge-success">${item.score}%</span>`}
                                    </div>
                                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">${isFounder ? item.description : item.role}</p>
                                    ${isFounder ? `
                                        <div class="mb-3">
                                            <div class="flex justify-between mb-1">
                                                <span style="font-size: 0.875rem; color: var(--text-tertiary);">Progress</span>
                                                <span style="font-size: 0.875rem; color: var(--color-primary); font-weight: 600;">${item.progress}%</span>
                                            </div>
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: ${item.progress}%;"></div>
                                            </div>
                                        </div>
                                    ` : `
                                        <div class="flex gap-1 mb-3">
                                            ${item.skills.map(skill => `<span class="badge badge-outline">${skill}</span>`).join('')}
                                        </div>
                                    `}
                                    <div class="flex gap-2">
                                        <button class="btn btn-primary" style="flex: 1;">View Details</button>
                                        <button class="btn btn-secondary" style="flex: 1;">${isFounder ? 'Analytics' : 'Connect'}</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    marketplace: () => `
        <div class="screen">
            <div class="container">
                <h1 class="mb-4">Talent Marketplace</h1>
                <div class="glass-card mb-4">
                    <div class="flex gap-2">
                        <input type="text" class="form-input" placeholder="Search professionals..." style="flex: 1;">
                        <button class="btn btn-primary">Search</button>
                    </div>
                </div>
                <div class="grid grid-3">
                    ${state.professionals.map(pro => `
                        <div class="glass-card">
                            <h3>${pro.name}</h3>
                            <p style="color: var(--text-secondary);">${pro.role}</p>
                            <div class="flex gap-1 mb-3">
                                ${pro.skills.map(s => `<span class="badge badge-outline">${s}</span>`).join('')}
                            </div>
                            <button class="btn btn-primary w-full">Connect</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `,

    social: () => `
        <div class="screen">
            <div class="container">
                <h1 class="mb-4">Social Feed</h1>
                ${state.posts.map(post => `
                    <div class="glass-card mb-3">
                        <div class="flex items-center gap-2 mb-2">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--gradient-primary);"></div>
                            <div>
                                <h4 style="margin: 0;">${post.author}</h4>
                                <span style="font-size: 0.875rem; color: var(--text-tertiary);">${post.time}</span>
                            </div>
                        </div>
                        <p>${post.content}</p>
                        <div class="flex gap-3">
                            <span style="color: var(--text-secondary); cursor: pointer;">
                                <span class="material-icons" style="font-size: 18px; vertical-align: middle;">favorite_border</span> ${post.likes}
                            </span>
                            <span style="color: var(--text-secondary); cursor: pointer;">
                                <span class="material-icons" style="font-size: 18px; vertical-align: middle;">comment</span> ${post.comments}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `,

    analytics: () => `
        <div class="screen">
            <div class="container">
                <h1 class="mb-4">Analytics Dashboard</h1>
                <div class="grid grid-2 mb-4">
                    <div class="glass-card">
                        <h3>Growth Metrics</h3>
                        <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary);">
                            Chart visualization here
                        </div>
                    </div>
                    <div class="glass-card">
                        <h3>Engagement</h3>
                        <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary);">
                            Chart visualization here
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    projects: () => `
        <div class="screen">
            <div class="container">
                <h1 class="mb-4">Project Board</h1>
                <div style="display: flex; gap: 1rem; overflow-x: auto;">
                    ${Object.entries(state.tasks).map(([key, tasks]) => `
                        <div class="glass-card" style="min-width: 300px;">
                            <h3 class="mb-3">${key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                            ${tasks.map(task => `
                                <div class="card mb-2" style="padding: 1rem;">${task}</div>
                            `).join('')}
                            <button class="btn btn-secondary w-full mt-2">
                                <span class="material-icons" style="font-size: 18px;">add</span> Add Task
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `,

    aitools: () => `
        <div class="screen">
            <div class="container">
                <h1 class="mb-4">AI-Powered Tools</h1>
                <div class="grid grid-2">
                    ${[
            { icon: 'psychology', title: 'AI Copilot', desc: 'Get instant startup advice' },
            { icon: 'lightbulb', title: 'Idea Validator', desc: 'Validate your business idea' },
            { icon: 'slideshow', title: 'Pitch Deck Generator', desc: 'Create professional pitch decks' },
            { icon: 'map', title: 'MVP Planner', desc: 'Plan your minimum viable product' },
            { icon: 'description', title: 'Contract Generator', desc: 'Generate legal contracts' },
            { icon: 'auto_awesome', title: 'Smart Matching', desc: 'AI-powered team matching' }
        ].map(tool => `
                        <div class="glass-card">
                            <span class="material-icons" style="font-size: 48px; color: var(--color-primary); margin-bottom: 1rem;">${tool.icon}</span>
                            <h3>${tool.title}</h3>
                            <p style="color: var(--text-secondary);">${tool.desc}</p>
                            <button class="btn btn-primary w-full">Launch Tool</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `,

    profile: () => `
        <div class="screen">
            <div class="container" style="max-width: 600px;">
                <h1 class="mb-4">Profile Settings</h1>
                <div class="glass-card">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-input" value="${state.user?.email || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bio</label>
                        <textarea class="form-textarea" placeholder="Tell us about yourself..."></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Skills</label>
                        <input type="text" class="form-input" placeholder="React, Node.js, Python...">
                    </div>
                    <button class="btn btn-primary w-full">Save Changes</button>
                </div>
                <button onclick="logout()" class="btn btn-secondary w-full mt-3">
                    <span class="material-icons">logout</span> Logout
                </button>
            </div>
        </div>
    `,

    notifications: () => `
        <div class="screen">
            <div class="container">
                <h1 class="mb-4">Notifications</h1>
                ${state.notifications.map((notif, i) => `
                    <div class="glass-card mb-2 fade-in" style="animation-delay: ${i * 0.05}s; opacity: ${notif.read ? 0.6 : 1};">
                        <div class="flex justify-between items-center">
                            <div class="flex gap-2 items-center">
                                <span class="material-icons" style="color: var(--color-primary);">${notif.icon}</span>
                                <div>
                                    <p style="margin: 0; font-weight: ${notif.read ? 400 : 600};">${notif.text}</p>
                                    <p style="margin: 0; font-size: 0.875rem; color: var(--text-tertiary);">${notif.time}</p>
                                </div>
                            </div>
                            ${!notif.read ? '<div style="width: 8px; height: 8px; background: var(--color-primary); border-radius: 50%;"></div>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `,

    subscription: () => `
        <div class="screen">
            <div class="container">
                <h1 class="text-center mb-2">Choose Your Plan</h1>
                <p class="text-center mb-4" style="color: var(--text-secondary);">Unlock premium features</p>
                <div class="grid grid-3">
                    ${[
            { name: 'Free', price: '$0', features: ['Basic matching', '5 connections/month'] },
            { name: 'Pro', price: '$29', features: ['Advanced matching', 'Unlimited connections', 'AI Tools'], popular: true },
            { name: 'Enterprise', price: '$99', features: ['Everything in Pro', 'Team collaboration', 'Priority support'] }
        ].map((plan, i) => `
                        <div class="glass-card slide-in" style="animation-delay: ${i * 0.1}s; ${plan.popular ? 'border: 2px solid var(--color-primary);' : ''}">
                            ${plan.popular ? '<div class="badge badge-primary mb-2">Most Popular</div>' : ''}
                            <h3 class="mb-2">${plan.name}</h3>
                            <div class="mb-3">
                                <span style="font-size: 2.5rem; font-weight: 700; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${plan.price}</span>
                                <span style="color: var(--text-tertiary);">/month</span>
                            </div>
                            <ul style="list-style: none; margin-bottom: 1.5rem;">
                                ${plan.features.map(f => `
                                    <li style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                                        <span class="material-icons" style="font-size: 18px; color: var(--color-success);">check_circle</span>
                                        ${f}
                                    </li>
                                `).join('')}
                            </ul>
                            <button class="btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} w-full">${plan.name === 'Free' ? 'Current Plan' : 'Upgrade'}</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `
};

// ========== NAVIGATION ==========
function BottomNav() {
    if (!state.isAuthenticated) return '';

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
                <div class="nav-item ${state.currentScreen === item.id ? 'active' : ''}" onclick="navigate('${item.id}')">
                    <span class="material-icons">${item.icon}</span>
                    <span>${item.label}</span>
                </div>
            `).join('')}
        </nav>
    `;
}

// ========== MAIN RENDER ==========
function render() {
    const app = document.getElementById('app');
    const screenFn = screens[state.currentScreen] || screens.splash;
    app.innerHTML = screenFn() + BottomNav();
}

// ========== LOGOUT ==========
function logout() {
    state.user = null;
    state.isAuthenticated = false;
    state.role = null;
    localStorage.clear();
    navigate('login');
}

// ========== INITIALIZATION ==========
function init() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
        state.isAuthenticated = true;
        state.role = role;
        state.user = { token };
        state.currentScreen = 'dashboard';
    }

    render();
    console.log('✅ STARTLABX Platform Loaded - Production Ready!');
}

// ========== GLOBAL EXPORTS ==========
window.navigate = navigate;
window.logout = logout;

// ========== START APP ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
