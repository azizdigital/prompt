/**
 * PromptForge OIM - Main Application
 * Entry point and app initialization
 */

const App = {
    /**
     * Initialize the application
     */
    init() {
        console.log('🚀 PromptForge OIM initializing...');
        
        // Check if running as PWA
        this.checkPWAStatus();
        
        // Initialize settings if first time
        this.initializeSettings();
        
        // Setup event listeners
        this.setupGlobalEventListeners();
        
        // Render initial view
        this.renderInitialView();
        
        // Register service worker
        this.registerServiceWorker();
        
        console.log('✅ PromptForge OIM ready!');
    },

    /**
     * Check PWA installation status
     */
    checkPWAStatus() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('✅ Running as PWA');
        } else {
            console.log('ℹ️ Running in browser');
        }
    },

    /**
     * Initialize settings on first run
     */
    initializeSettings() {
        const settings = Storage.getSettings();
        
        // Check if settings exist, if not use defaults
        if (!settings.oimName) {
            const defaultSettings = Storage.getDefaultSettings();
            Storage.saveSettings(defaultSettings);
            console.log('✅ Default settings initialized');
        }
    },

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.handleBack();
            });
        }
        
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }
        
        // Handle browser back button
        window.addEventListener('popstate', (e) => {
            if (e.state) {
                this.handleNavigation(e.state);
            } else {
                UI.renderHome();
            }
        });
        
        // Handle online/offline status
        window.addEventListener('online', () => {
            Utils.showToast('✅ Back online', 'success');
        });
        
        window.addEventListener('offline', () => {
            Utils.showToast('📵 Offline mode - All features still work!', 'info');
        });
        
        // Handle app install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('💾 Install prompt available');
            // Could show custom install button here
        });
        
        // Prevent accidental form submission on Enter
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
                // Allow Enter in textareas, but prevent in other inputs
                if (e.target.tagName === 'INPUT') {
                    e.preventDefault();
                }
            }
        });
    },

    /**
     * Render initial view
     */
    renderInitialView() {
        // Check if there's a last visited category
        const lastCategory = Storage.getLastCategory();
        
        if (lastCategory && window.location.hash === '') {
            // Could restore last category, but for now just show home
            UI.renderHome();
        } else if (window.location.hash) {
            // Handle deep links
            this.handleDeepLink(window.location.hash);
        } else {
            // Default to home
            UI.renderHome();
        }
    },

    /**
     * Handle deep links (e.g., #category/oim-ops)
     */
    handleDeepLink(hash) {
        const parts = hash.substring(1).split('/');
        
        if (parts[0] === 'category' && parts[1]) {
            UI.renderCategory(parts[1]);
        } else if (parts[0] === 'prompt' && parts[1]) {
            UI.renderPromptForm(parts[1]);
        } else {
            UI.renderHome();
        }
    },

    /**
     * Handle back navigation
     */
    handleBack() {
        // Simple back - go to home
        // Could implement proper navigation stack later
        UI.renderHome();
        window.history.pushState({ view: 'home' }, '', '#');
    },

    /**
     * Handle navigation with state
     */
    handleNavigation(state) {
        if (state.view === 'home') {
            UI.renderHome();
        } else if (state.view === 'category' && state.categoryId) {
            UI.renderCategory(state.categoryId);
        } else if (state.view === 'prompt' && state.promptId) {
            UI.renderPromptForm(state.promptId);
        } else {
            UI.renderHome();
        }
    },

    /**
     * Show settings modal/screen
     */
    showSettings() {
        const settings = Storage.getSettings();
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal-backdrop" id="settingsModal">
                <div class="modal-content" style="max-width: 600px; background: var(--color-bg-secondary); border-radius: var(--radius-xl); padding: var(--spacing-xl); max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl);">
                        <h2 style="font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary);">⚙️ Settings</h2>
                        <button id="closeSettingsBtn" class="btn-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="settingsForm">
                        <div class="form-group">
                            <label class="form-label">OIM Name</label>
                            <input type="text" name="oimName" class="form-input" value="${settings.oimName}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">OIM Title</label>
                            <input type="text" name="oimTitle" class="form-input" value="${settings.oimTitle}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Default Platform</label>
                            <select name="platform" class="form-select" required>
                                <option value="IbA" ${settings.platform === 'IbA' ? 'selected' : ''}>IbA</option>
                                <option value="IbB" ${settings.platform === 'IbB' ? 'selected' : ''}>IbB</option>
                                <option value="IbC" ${settings.platform === 'IbC' ? 'selected' : ''}>IbC</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Boss Name (Default)</label>
                            <input type="text" name="bossName" class="form-input" value="${settings.bossName}">
                        </div>
                        
                        <div style="margin-top: var(--spacing-xl); padding-top: var(--spacing-xl); border-top: 1px solid var(--color-border);">
                            <h3 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-md);">Data Management</h3>
                            
                            <button type="button" id="exportDataBtn" class="btn btn-secondary btn-block mb-md">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                </svg>
                                Export Data
                            </button>
                            
                            <button type="button" id="importDataBtn" class="btn btn-secondary btn-block mb-md">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                                </svg>
                                Import Data
                            </button>
                            <input type="file" id="importFileInput" accept=".json" style="display: none;">
                            
                            <button type="button" id="clearHistoryBtn" class="btn btn-outline btn-block mb-md" style="border-color: var(--color-warning); color: var(--color-warning);">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                                Clear History
                            </button>
                            
                            <button type="button" id="clearAllDataBtn" class="btn btn-outline btn-block" style="border-color: var(--color-error); color: var(--color-error);">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                                </svg>
                                Clear All Data
                            </button>
                        </div>
                        
                        <div style="margin-top: var(--spacing-xl); padding-top: var(--spacing-xl); border-top: 1px solid var(--color-border);">
                            <button type="submit" class="btn btn-primary btn-block">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                                Save Settings
                            </button>
                        </div>
                    </form>
                    
                    <div style="margin-top: var(--spacing-xl); padding-top: var(--spacing-xl); border-top: 1px solid var(--color-border); text-align: center;">
                        <p style="font-size: var(--font-size-sm); color: var(--color-text-tertiary);">PromptForge OIM v1.0</p>
                        <p style="font-size: var(--font-size-xs); color: var(--color-text-tertiary); margin-top: var(--spacing-xs);">© 2025 Aziz Mohamad</p>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add styles for modal
        const style = document.createElement('style');
        style.textContent = `
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(10, 14, 39, 0.9);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: var(--spacing-lg);
                animation: fadeIn 0.2s ease-out;
            }
            
            .modal-content {
                animation: slideUp 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        
        // Setup event listeners for settings
        this.setupSettingsEventListeners();
    },

    /**
     * Setup settings modal event listeners
     */
    setupSettingsEventListeners() {
        const modal = document.getElementById('settingsModal');
        const closeBtn = document.getElementById('closeSettingsBtn');
        const settingsForm = document.getElementById('settingsForm');
        
        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Save settings
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = new FormData(settingsForm);
                const newSettings = {
                    oimName: formData.get('oimName'),
                    oimTitle: formData.get('oimTitle'),
                    platform: formData.get('platform'),
                    bossName: formData.get('bossName'),
                    darkMode: true,
                    showTooltips: true
                };
                
                Storage.saveSettings(newSettings);
                Utils.showToast('Settings saved successfully!', 'success');
                modal.remove();
            });
        }
        
        // Export data
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const data = Storage.exportData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `promptforge-backup-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                Utils.showToast('Data exported successfully!', 'success');
            });
        }
        
        // Import data
        const importBtn = document.getElementById('importDataBtn');
        const importFileInput = document.getElementById('importFileInput');
        
        if (importBtn && importFileInput) {
            importBtn.addEventListener('click', () => {
                importFileInput.click();
            });
            
            importFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        Storage.importData(data);
                        Utils.showToast('Data imported successfully!', 'success');
                        modal.remove();
                        UI.renderHome(); // Refresh view
                    } catch (error) {
                        Utils.showToast('Error importing data. Invalid file format.', 'error');
                    }
                };
                reader.readAsText(file);
            });
        }
        
        // Clear history
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                    Storage.clearHistory();
                    Utils.showToast('History cleared!', 'success');
                }
            });
        }
        
        // Clear all data
        const clearAllDataBtn = document.getElementById('clearAllDataBtn');
        if (clearAllDataBtn) {
            clearAllDataBtn.addEventListener('click', () => {
                if (confirm('⚠️ WARNING: This will delete ALL data including settings, favorites, and history. Are you absolutely sure?')) {
                    if (confirm('Last chance! This action cannot be undone. Proceed?')) {
                        Storage.clearAll();
                        Utils.showToast('All data cleared!', 'success');
                        modal.remove();
                        UI.renderHome();
                    }
                }
            });
        }
    },

/**
     * Register service worker for PWA
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            // Use relative path for GitHub Pages compatibility
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('✅ Service Worker registered:', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                Utils.showToast('New version available! Refresh to update.', 'info', 5000);
                            }
                        });
                    });
                })
                .catch(error => {
                    console.log('❌ Service Worker registration failed:', error);
                });
        }
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
