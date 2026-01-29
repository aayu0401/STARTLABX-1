// Frontend Utility Functions
// Form Validation, Error Handling, etc.

class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePassword(password) {
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return re.test(password);
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validateLength(value, min, max) {
        const len = value ? value.trim().length : 0;
        return len >= min && len <= max;
    }

    static validateForm(formData, rules) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData.get(field);
            
            if (rule.required && !this.validateRequired(value)) {
                errors[field] = `${field} is required`;
                continue;
            }
            
            if (value && rule.email && !this.validateEmail(value)) {
                errors[field] = 'Invalid email format';
                continue;
            }
            
            if (value && rule.password && !this.validatePassword(value)) {
                errors[field] = 'Password must be at least 8 characters with uppercase, lowercase, and number';
                continue;
            }
            
            if (value && rule.minLength && !this.validateLength(value, rule.minLength, rule.maxLength || 1000)) {
                errors[field] = `Must be ${rule.minLength}-${rule.maxLength || 1000} characters`;
                continue;
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

class ErrorHandler {
    static handle(error, context = '') {
        console.error(`[ErrorHandler] ${context}:`, error);
        
        let message = 'An unexpected error occurred';
        
        if (error.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        } else if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.errors && Array.isArray(error.errors)) {
            message = error.errors.map(e => e.msg || e.message).join(', ');
        }
        
        return message;
    }
    
    static showError(message, duration = 5000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

class LoadingManager {
    static show(elementId = 'main-content') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; color: rgba(255,255,255,0.9);">
                    <div class="loading-spinner" style="width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
                    <p>Loading...</p>
                </div>
            `;
        }
    }
    
    static hide() {
        // Loading will be replaced by actual content
    }
}

class StorageManager {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }
    
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }
    
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }
    
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FormValidator, ErrorHandler, LoadingManager, StorageManager };
}
