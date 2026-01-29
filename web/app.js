// ===== STATE MANAGEMENT =====
const state = {
    currentScreen: 'splash',
    user: null,
    isAuthenticated: false,
    role: null,
    messages: [],
    kanbanTasks: {
        todo: ['Setup repo', 'Define schema', 'Create wireframes'],
        doing: ['Develop API', 'Design database'],
        done: ['Design UI', 'Setup project']
    },
    aiReplies: [],
    notifications: [
        { id: 1, text: 'New match found! TechVenture AI is interested', time: '2 min ago', read: false, icon: 'star' },
        { id: 2, text: 'Message from John: "Let\'s discuss the project"', time: '1 hour ago', read: false, icon: 'message' },
        { id: 3, text: 'Profile updated successfully', time: '3 hours ago', read: true, icon: 'check_circle' },
        { id: 4, text: 'New connection request from Sarah', time: '5 hours ago', read: true, icon: 'person_add' }
    ],
    stats: {
        connections: 127,
        matches: 45,
        projects: 8,
        messages: 234
    },
    searchQuery: ''
};

// ===== ROUTER =====
function navigate(screen) {
    state.currentScreen = screen;
    render();
}

// ===== API SERVICE =====
const API_BASE = 'http://localhost:8080';

async function apiCall(endpoint, options = {}) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (state.isAuthenticated && state.user?.token) {
            headers['Authorization'] = `Bearer ${state.user.token}`;
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) throw new Error('API call failed');
        return await response.json();
    } catch (error) {
        console.warn('API call failed, using mock data:', error);
        return null;
    }
}

// ===== MOCK DATA =====
function getMockData(type) {
    const mockData = {
        founderStartups: [
            { name: 'TechVenture AI', stage: 'Seed', description: 'AI-powered analytics' },
            { name: 'HealthSync', stage: 'Series A', description: 'Healthcare platform' },
            { name: 'EcoTrack', stage: 'MVP', description: 'Sustainability tracker' }
        ],
        professionalMatches: [
            { startupName: 'TechVenture AI', score: 95, role: 'CTO' },
            { startupName: 'HealthSync', score: 87, role: 'Lead Developer' },
            { startupName: 'EcoTrack', score: 78, role: 'Full Stack Engineer' }
        ]
    };
    return mockData[type] || [];
}

// ===== AUTHENTICATION =====
async function login(email, password) {
    const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    if (data) {
        state.user = data;
        state.isAuthenticated = true;
        state.role = data.role;
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
    } else {
        // Mock login for testing
        state.user = { token: 'mock-token', email };
        state.isAuthenticated = true;
        state.role = email.includes('founder') ? 'FOUNDER' : 'PROFESSIONAL';
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('role', state.role);
    }

    navigate('dashboard');
}

function logout() {
    state.user = null;
    state.isAuthenticated = false;
    state.role = null;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('login');
}

// ===== SCREEN COMPONENTS =====

// Splash Screen
function SplashScreen() {
    setTimeout(() => navigate('onboarding'), 2000);

    return `
        <div class="screen-center fade-in">
            <div class="text-center">
                <h1 class="text-gradient" style="font-size: 3.5rem; margin-bottom: 1rem;">
                    STARTLABX
                </h1>
                <div class="spinner"></div>
            </div>
        </div>
    `;
}

// Onboarding Screen
function OnboardingScreen() {
    const pages = [
        { icon: 'rocket_launch', title: 'Build Startups Together', desc: 'Connect with talented professionals and visionary founders' },
        { icon: 'people', title: 'Match. Collaborate. Grow.', desc: 'AI-powered matching to find your perfect co-founder or opportunity' },
        { icon: 'trending_up', title: 'Launch Faster', desc: 'Access tools, resources, and a community to accelerate your startup journey' }
    ];

    let currentPage = 0;

    setTimeout(() => {
        const nextBtn = document.getElementById('onboarding-next');
        const container = document.getElementById('onboarding-content');

        if (nextBtn) {
            nextBtn.onclick = () => {
                if (currentPage < 2) {
                    currentPage++;
                    updateOnboardingPage();
                } else {
                    navigate('login');
                }
            };
        }

        function updateOnboardingPage() {
            const page = pages[currentPage];
            container.innerHTML = `
                <div class="fade-in">
                    <span class="material-icons" style="font-size: 140px; color: var(--accent-purple); margin-bottom: 2rem;">
                        ${page.icon}
                    </span>
                    <h2 style="margin-bottom: 1rem;">${page.title}</h2>
                    <p style="font-size: 1.125rem; max-width: 500px; margin: 0 auto;">
                        ${page.desc}
                    </p>
                </div>
            `;
            nextBtn.textContent = currentPage === 2 ? 'Get Started' : 'Next';

            // Update dots
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
                        <span class="material-icons" style="font-size: 140px; color: var(--accent-purple); margin-bottom: 2rem;">
                            ${pages[0].icon}
                        </span>
                        <h2 style="margin-bottom: 1rem;">${pages[0].title}</h2>
                        <p style="font-size: 1.125rem; max-width: 500px; margin: 0 auto;">
                            ${pages[0].desc}
                        </p>
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
}

// Login Screen
function LoginScreen() {
    setTimeout(() => {
        const form = document.getElementById('login-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const btn = document.getElementById('login-btn');

                btn.disabled = true;
                btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>';

                await login(email, password);
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
                        <div class="input-group">
                            <label class="input-label">Email</label>
                            <div class="input-with-icon">
                                <span class="material-icons">email</span>
                                <input type="email" id="email" class="input-field" placeholder="your@email.com" required value="test@example.com">
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label class="input-label">Password</label>
                            <div class="input-with-icon">
                                <span class="material-icons">lock</span>
                                <input type="password" id="password" class="input-field" placeholder="••••••••" required value="password">
                            </div>
                        </div>
                        
                        <button type="submit" id="login-btn" class="btn btn-primary w-full mt-3">
                            Login
                        </button>
                    </form>
                    
                    <p class="text-center mt-3" style="font-size: 0.875rem; color: var(--text-tertiary);">
                        Demo: Use any email (include "founder" for founder role)
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Founder Dashboard
function FounderDashboard() {
    const startups = getMockData('founderStartups');

    return `
        <div class="screen">
            <div class="container">
                <div class="fade-in">
                    <h1 class="mb-2">My Startups</h1>
                    <p class="mb-4">Manage and grow your ventures</p>
                    
                    <div class="grid grid-2">
                        ${startups.map((startup, i) => `
                            <div class="glass-card slide-in" style="animation-delay: ${i * 0.1}s;">
                                <div class="card-gradient">
                                    <h3 class="mb-2">${startup.name}</h3>
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="badge badge-gradient">${startup.stage}</span>
                                    </div>
                                    <p style="color: var(--text-secondary);">${startup.description}</p>
                                    <button class="btn btn-secondary mt-3 w-full">View Details</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button class="btn btn-primary mt-4">
                        <span class="material-icons">add</span>
                        Add New Startup
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Professional Dashboard
function ProfessionalDashboard() {
    const matches = getMockData('professionalMatches');

    return `
        <div class="screen">
            <div class="container">
                <div class="fade-in">
                    <h1 class="mb-2">Your Matches</h1>
                    <p class="mb-4">Startups looking for talent like you</p>
                    
                    <div class="grid grid-2">
                        ${matches.map((match, i) => `
                            <div class="glass-card slide-in" style="animation-delay: ${i * 0.1}s;">
                                <div class="flex justify-between items-center mb-3">
                                    <h3>${match.startupName}</h3>
                                    <div class="badge badge-success" style="font-size: 1.25rem;">
                                        ${match.score}%
                                    </div>
                                </div>
                                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                                    <span class="material-icons" style="font-size: 18px; vertical-align: middle;">work</span>
                                    ${match.role}
                                </p>
                                <div class="flex gap-2">
                                    <button class="btn btn-primary" style="flex: 1;">Connect</button>
                                    <button class="btn btn-secondary" style="flex: 1;">Learn More</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Chat Screen
function ChatScreen() {
    setTimeout(() => {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if (text) {
                    state.messages.push({ text, me: true });
                    input.value = '';
                    render();

                    // Scroll to bottom
                    setTimeout(() => {
                        const container = document.getElementById('chat-messages');
                        if (container) container.scrollTop = container.scrollHeight;
                    }, 100);
                }
            };
        }
    }, 100);

    return `
        <div class="screen" style="display: flex; flex-direction: column;">
            <div class="container" style="flex: 1; display: flex; flex-direction: column;">
                <h2 class="mb-3">Chat</h2>
                
                <div id="chat-messages" style="flex: 1; overflow-y: auto; margin-bottom: 1rem; max-height: calc(100vh - 250px);">
                    ${state.messages.length === 0 ? `
                        <div class="text-center" style="padding: 3rem; color: var(--text-tertiary);">
                            <span class="material-icons" style="font-size: 64px; margin-bottom: 1rem; opacity: 0.3;">chat</span>
                            <p>No messages yet. Start a conversation!</p>
                        </div>
                    ` : state.messages.map(msg => `
                        <div class="chat-bubble ${msg.me ? 'me' : 'other'}">
                            ${msg.text}
                        </div>
                    `).join('')}
                </div>
                
                <form id="chat-form" class="flex gap-2">
                    <input type="text" id="chat-input" class="input-field" placeholder="Type a message..." style="flex: 1;">
                    <button type="submit" class="btn btn-primary btn-icon">
                        <span class="material-icons">send</span>
                    </button>
                </form>
            </div>
        </div>
    `;
}

// Kanban Board
function KanbanScreen() {
    const renderColumn = (title, tasks, key) => `
        <div class="glass-card" style="flex: 1; min-width: 250px;">
            <h3 class="mb-3">${title}</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${tasks.map(task => `
                    <div class="card" style="padding: 1rem; cursor: move;">
                        ${task}
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-secondary w-full mt-3" style="font-size: 0.875rem;">
                <span class="material-icons" style="font-size: 18px;">add</span>
                Add Task
            </button>
        </div>
    `;

    return `
        <div class="screen">
            <div class="container">
                <h1 class="mb-4">Project Board</h1>
                
                <div style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem;">
                    ${renderColumn('To Do', state.kanbanTasks.todo, 'todo')}
                    ${renderColumn('In Progress', state.kanbanTasks.doing, 'doing')}
                    ${renderColumn('Done', state.kanbanTasks.done, 'done')}
                </div>
            </div>
        </div>
    `;
}

// AI Copilot Screen
function AICopilotScreen() {
    setTimeout(() => {
        const form = document.getElementById('ai-form');
        const input = document.getElementById('ai-input');

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if (text) {
                    state.aiReplies.push(`You: ${text}`);
                    state.aiReplies.push(`AI: Here's a helpful response to "${text}". I can assist you with startup strategy, market analysis, and more!`);
                    input.value = '';
                    render();
                }
            };
        }
    }, 100);

    return `
        <div class="screen" style="display: flex; flex-direction: column;">
            <div class="container" style="flex: 1; display: flex; flex-direction: column;">
                <h2 class="mb-3">
                    <span class="material-icons" style="vertical-align: middle; margin-right: 0.5rem;">smart_toy</span>
                    AI Copilot
                </h2>
                
                <div style="flex: 1; overflow-y: auto; margin-bottom: 1rem; max-height: calc(100vh - 250px);">
                    ${state.aiReplies.length === 0 ? `
                        <div class="glass-card text-center" style="padding: 3rem;">
                            <span class="material-icons" style="font-size: 64px; color: var(--accent-purple); margin-bottom: 1rem;">psychology</span>
                            <h3 class="mb-2">AI-Powered Assistance</h3>
                            <p style="color: var(--text-secondary);">Ask me anything about your startup journey!</p>
                        </div>
                    ` : state.aiReplies.map((reply, i) => `
                        <div class="glass-card mb-2 fade-in" style="animation-delay: ${i * 0.05}s;">
                            <div class="flex gap-2">
                                <span class="material-icons" style="color: ${reply.startsWith('AI:') ? 'var(--accent-purple)' : 'var(--accent-blue)'};">
                                    ${reply.startsWith('AI:') ? 'smart_toy' : 'person'}
                                </span>
                                <p style="margin: 0;">${reply}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <form id="ai-form" class="flex gap-2">
                    <input type="text" id="ai-input" class="input-field" placeholder="Ask something..." style="flex: 1;">
                    <button type="submit" class="btn btn-primary btn-icon">
                        <span class="material-icons">send</span>
                    </button>
                </form>
            </div>
        </div>
    `;
}

// Profile Screen
function ProfileScreen() {
    setTimeout(() => {
        const form = document.getElementById('profile-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const btn = document.getElementById('save-btn');
                btn.disabled = true;
                btn.textContent = 'Saving...';

                setTimeout(() => {
                    alert('Profile updated successfully!');
                    btn.disabled = false;
                    btn.textContent = 'Save Changes';
                }, 1000);
            };
        }
    }, 100);

    return `
        <div class="screen">
            <div class="container" style="max-width: 600px;">
                <h1 class="mb-4">Profile</h1>
                
                <div class="glass-card">
                    <form id="profile-form">
                        <div class="input-group">
                            <label class="input-label">Full Name</label>
                            <input type="text" class="input-field" placeholder="John Doe" value="${state.user?.email || ''}">
                        </div>
                        
                        <div class="input-group">
                            <label class="input-label">Headline</label>
                            <input type="text" class="input-field" placeholder="Full Stack Developer | Startup Enthusiast">
                        </div>
                        
                        <div class="input-group">
                            <label class="input-label">Skills</label>
                            <textarea class="input-field" rows="4" placeholder="JavaScript, React, Node.js, Python..."></textarea>
                        </div>
                        
                        <button type="submit" id="save-btn" class="btn btn-primary w-full">
                            Save Changes
                        </button>
                    </form>
                </div>
                
                <button onclick="logout()" class="btn btn-secondary w-full mt-3">
                    <span class="material-icons">logout</span>
                    Logout
                </button>
            </div>
        </div>
    `;
}

// Notifications Screen
function NotificationsScreen() {
    return `
        <div class="screen">
            <div class="container">
                <h1 class="mb-4">Notifications</h1>
                
                ${state.notifications.map((notif, i) => `
                    <div class="glass-card mb-2 fade-in" style="animation-delay: ${i * 0.05}s; opacity: ${notif.read ? 0.6 : 1};">
                        <div class="flex justify-between items-center">
                            <div class="flex gap-2 items-center">
                                <span class="material-icons" style="color: var(--accent-purple);">
                                    ${notif.read ? 'notifications' : 'notifications_active'}
                                </span>
                                <div>
                                    <p style="margin: 0; font-weight: ${notif.read ? 400 : 600};">${notif.text}</p>
                                    <p style="margin: 0; font-size: 0.875rem; color: var(--text-tertiary);">${notif.time}</p>
                                </div>
                            </div>
                            ${!notif.read ? '<div style="width: 8px; height: 8px; background: var(--accent-purple); border-radius: 50%;"></div>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Subscription Screen
function SubscriptionScreen() {
    const plans = [
        { name: 'Free', price: '$0', features: ['Basic matching', '5 connections/month', 'Community access'] },
        { name: 'Pro', price: '$29', features: ['Advanced matching', 'Unlimited connections', 'AI Copilot', 'Priority support'], popular: true },
        { name: 'Enterprise', price: '$99', features: ['Everything in Pro', 'Team collaboration', 'Custom integrations', 'Dedicated manager'] }
    ];

    return `
        <div class="screen">
            <div class="container">
                <h1 class="text-center mb-2">Choose Your Plan</h1>
                <p class="text-center mb-4" style="color: var(--text-secondary);">Unlock premium features to accelerate your startup journey</p>
                
                <div class="grid grid-3">
                    ${plans.map((plan, i) => `
                        <div class="glass-card slide-in" style="animation-delay: ${i * 0.1}s; ${plan.popular ? 'border: 2px solid var(--accent-purple);' : ''}">
                            ${plan.popular ? '<div class="badge badge-gradient mb-2">Most Popular</div>' : ''}
                            <h3 class="mb-2">${plan.name}</h3>
                            <div class="mb-3">
                                <span style="font-size: 2.5rem; font-weight: 700; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                                    ${plan.price}
                                </span>
                                <span style="color: var(--text-tertiary);">/month</span>
                            </div>
                            <ul style="list-style: none; margin-bottom: 1.5rem;">
                                ${plan.features.map(f => `
                                    <li style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                                        <span class="material-icons" style="font-size: 18px; color: var(--accent-green);">check_circle</span>
                                        ${f}
                                    </li>
                                `).join('')}
                            </ul>
                            <button class="btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} w-full">
                                ${plan.name === 'Free' ? 'Current Plan' : 'Upgrade'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Bottom Navigation
function BottomNav() {
    if (!state.isAuthenticated) return '';

    const navItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Home' },
        { id: 'notifications', icon: 'notifications', label: 'Alerts' },
        { id: 'profile', icon: 'person', label: 'Profile' },
        { id: 'subscription', icon: 'workspace_premium', label: 'Plan' }
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

// ===== MAIN RENDER FUNCTION =====
function render() {
    const app = document.getElementById('app');
    let content = '';

    switch (state.currentScreen) {
        case 'splash':
            content = SplashScreen();
            break;
        case 'onboarding':
            content = OnboardingScreen();
            break;
        case 'login':
            content = LoginScreen();
            break;
        case 'dashboard':
            content = state.role === 'FOUNDER' ? FounderDashboard() : ProfessionalDashboard();
            break;
        case 'chat':
            content = ChatScreen();
            break;
        case 'kanban':
            content = KanbanScreen();
            break;
        case 'ai':
            content = AICopilotScreen();
            break;
        case 'profile':
            content = ProfileScreen();
            break;
        case 'notifications':
            content = NotificationsScreen();
            break;
        case 'subscription':
            content = SubscriptionScreen();
            break;
        default:
            content = SplashScreen();
    }

    app.innerHTML = content + BottomNav();
}

// ===== INITIALIZE APP =====
function init() {
    // Check for existing session
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
        state.isAuthenticated = true;
        state.role = role;
        state.user = { token };
        state.currentScreen = 'dashboard';
    }

    render();
}

// Make functions globally available
window.navigate = navigate;
window.logout = logout;

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('STARTLABX app loaded successfully!');
