/**
 * PromptForge OIM - Utility Functions
 * Common helper functions used across the app
 */

const Utils = {
    /**
     * Format date to readable string
     */
    formatDate(date = new Date()) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    },

    /**
     * Format time to HH:MM
     */
    formatTime(date = new Date()) {
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    },

    /**
     * Format datetime for display
     */
    formatDateTime(date = new Date()) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },

    /**
     * Get current timestamp
     */
    getTimestamp() {
        return new Date().toISOString();
    },

    /**
     * Debounce function
     */
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
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Sanitize HTML to prevent XSS
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * Escape special characters in template
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Replace template variables
     */
    replaceTemplateVars(template, data) {
        let result = template;
        
        // Replace {variable} patterns
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            result = result.replace(regex, data[key] || '');
        });
        
        // Handle conditional blocks {if condition}...{endif} - FIXED (removed colon)
        result = result.replace(/\{if\s+(\w+)\}([\s\S]*?)\{endif\}/g, (match, condition, content) => {
            return data[condition] ? content : '';
        });
        
        // Handle foreach loops - FIXED (removed colon, added \s+)
        result = result.replace(/\{foreach\s+(\w+)\}([\s\S]*?)\{end\s+foreach\}/g, (match, arrayName, template) => {
            if (!Array.isArray(data[arrayName])) return '';
            return data[arrayName].map((item, index) => {
                let itemResult = template;
                itemResult = itemResult.replace(/\{index\}/g, index + 1);
                Object.keys(item).forEach(key => {
                    const regex = new RegExp(`\\{${key}\\}`, 'g');
                    itemResult = itemResult.replace(regex, item[key] || '');
                });
                return itemResult;
            }).join('\n');
        });
        
        return result;
    },

    /**
     * Truncate text with ellipsis
     */
    truncate(str, maxLength) {
        if (str.length <= maxLength) return str;
        return str.substr(0, maxLength - 3) + '...';
    },

    /**
     * Search/filter array of objects
     */
    searchObjects(objects, query, fields) {
        if (!query) return objects;
        
        const lowerQuery = query.toLowerCase();
        return objects.filter(obj => {
            return fields.some(field => {
                const value = obj[field];
                return value && value.toString().toLowerCase().includes(lowerQuery);
            });
        });
    },

    /**
     * Validate required fields
     */
    validateForm(formData, requiredFields) {
        const errors = [];
        
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                errors.push(`${field} is required`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                ${type === 'success' ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>' : ''}
                ${type === 'error' ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>' : ''}
                ${type === 'info' ? '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>' : ''}
            </svg>
            <div class="toast-message">${this.escapeHTML(message)}</div>
        `;
        
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 300ms ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Show loading overlay
     */
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'flex';
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    },

    /**
     * Smooth scroll to element
     */
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    /**
     * Get platform info for templates
     */
    getPlatformInfo() {
        return {
            platform: Storage.getSetting('platform') || 'IbA',
            oimName: Storage.getSetting('oimName') || 'Aziz Mohamad',
            oimTitle: Storage.getSetting('oimTitle') || 'OIM Irong Barat'
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
