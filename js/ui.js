/**
 * PromptForge OIM - UI Rendering Module
 * Handles all DOM manipulation and rendering
 */

const UI = {
    /**
     * Render home screen
     */
    renderHome() {
        const mainContent = document.getElementById('mainContent');
        
        // Update header
        document.getElementById('headerTitle').textContent = 'Aziz Prompt Forge';
        document.getElementById('headerSubtitle').textContent = 'Where Powerful Prompts Are Built';
        document.getElementById('backBtn').style.display = 'none';
        
        // Get favorites and usage stats
        const favorites = Storage.getFavorites();
        const mostUsed = Storage.getMostUsed(5);
        
        // Build home screen HTML
        let html = '<div class="home-screen">';
        
        // Search bar
        html += `
            <div class="search-container">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="8" cy="8" r="6"/>
                    <path d="M14 14l4 4"/>
                </svg>
                <input type="text" id="searchInput" class="search-input" placeholder="Search prompts..." autocomplete="off">
            </div>
        `;
        
        // Favorites section (if any)
        if (favorites.length > 0) {
            html += '<div class="section-header">';
            html += '<h2 class="section-title">⭐ Favorites <span class="section-count">' + favorites.length + '</span></h2>';
            html += '</div>';
            html += '<div class="prompts-list">';
            
            favorites.slice(0, 3).forEach(promptId => {
                const prompt = PromptsData.getPromptById(promptId);
                if (prompt) {
                    html += this.renderPromptItem(prompt, true);
                }
            });
            
            html += '</div>';
        }
        
        // Categories section FIRST
        html += '<div class="section-header mt-xl">';
        html += '<h2 class="section-title">📁 Categories</h2>';
        html += '</div>';
        html += '<div class="categories-grid">';
        
        PromptsData.categories.forEach(category => {
            const promptCount = PromptsData.getPromptsByCategory(category.id).length;
            html += this.renderCategoryCard(category, promptCount);
        });
        
        html += '</div>'; // End categories-grid
        
        // Most used section BELOW categories (if any)
        if (mostUsed.length > 0) {
            html += '<div class="section-header mt-xl">';
            html += '<h2 class="section-title">📊 Most Used This Week</h2>';
            html += '</div>';
            html += '<div class="prompts-list">';
            
            mostUsed.forEach((item, index) => {
                const prompt = PromptsData.getPromptById(item.promptId);
                if (prompt) {
                    html += this.renderPromptItem(prompt, false, index + 1, item.count);
                }
            });
            
            html += '</div>';
        }
        
        html += '</div>'; // End home-screen
        
        mainContent.innerHTML = html;
        
        // Attach event listeners
        this.attachHomeEventListeners();
    },

    /**
     * Render category view
     */
    renderCategory(categoryId) {
        const category = PromptsData.getCategoryById(categoryId);
        const prompts = PromptsData.getPromptsByCategory(categoryId);
        
        if (!category) {
            this.renderHome();
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        // Update header
        document.getElementById('headerTitle').textContent = category.name;
        document.getElementById('headerSubtitle').textContent = `${prompts.length} prompts available`;
        document.getElementById('backBtn').style.display = 'flex';
        
        // Build category view HTML
        let html = '<div class="category-view">';
        
        // Category header with description
        html += `
            <div class="category-header">
                <div class="category-icon" style="color: ${category.color}">${category.icon}</div>
                <p class="category-description">${category.description}</p>
            </div>
        `;
        
        // Search within category
        html += `
            <div class="search-container">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="8" cy="8" r="6"/>
                    <path d="M14 14l4 4"/>
                </svg>
                <input type="text" id="categorySearchInput" class="search-input" placeholder="Search in ${category.name}..." autocomplete="off">
            </div>
        `;
        
        // Prompts list
        html += '<div class="prompts-list" id="categoryPromptsList">';
        
        prompts.forEach(prompt => {
            html += this.renderPromptItem(prompt, Storage.isFavorite(prompt.id));
        });
        
        html += '</div>'; // End prompts-list
        html += '</div>'; // End category-view
        
        mainContent.innerHTML = html;
        
        // Attach event listeners
        this.attachCategoryEventListeners(categoryId);
    },

    /**
     * Render prompt form
     */
    renderPromptForm(promptId) {
        const prompt = PromptsData.getPromptById(promptId);
        
        if (!prompt) {
            this.renderHome();
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        // Update header
        const category = PromptsData.getCategoryById(prompt.category);
        document.getElementById('headerTitle').textContent = prompt.title;
        document.getElementById('headerSubtitle').textContent = category ? category.name : 'Prompt';
        document.getElementById('backBtn').style.display = 'flex';
        
        // Build form HTML
        let html = '<div class="prompt-form-view">';
        
        // Prompt info
        html += `
            <div class="prompt-info">
                <div class="prompt-info-header">
                    <span class="prompt-icon">${prompt.icon}</span>
                    <div class="prompt-type-badge ${prompt.type}">${this.getTypeLabel(prompt.type)}</div>
                </div>
                <p class="prompt-description">${prompt.description}</p>
            </div>
        `;
        
        // Form
        html += `<form id="promptForm" class="prompt-form" data-prompt-id="${prompt.id}">`;
        
        // Render inputs
        if (prompt.inputs && prompt.inputs.length > 0) {
            prompt.inputs.forEach((input, index) => {
                html += this.renderInputField(input, index);
            });
        }
        
        // Submit button
        html += `
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 10l5 5 10-10"/>
                    </svg>
                    Generate Prompt
                </button>
            </div>
        `;
        
        html += '</form>'; // End form
        html += '</div>'; // End prompt-form-view
        
        mainContent.innerHTML = html;
        
        // Attach event listeners
        this.attachFormEventListeners();
    },

    /**
     * Render individual input field
     */
    renderInputField(input, index) {
        const fieldId = `input-${input.name}-${index}`;
        let html = '<div class="form-group">';
        
        // Label with proper 'for' attribute
        html += `<label for="${fieldId}" class="form-label">`;
        html += input.label;
        if (input.required) {
            html += ' <span class="required">*</span>';
        }
        html += '</label>';
        
        // Render different input types
        switch (input.type) {
            case 'text':
            case 'email':
            case 'url':
            case 'tel':
                html += `<input 
                    type="${input.type}" 
                    id="${fieldId}"
                    name="${input.name}" 
                    class="form-input"
                    ${input.required ? 'required' : ''}
                    ${input.placeholder ? `placeholder="${input.placeholder}"` : ''}
                    ${input.value ? `value="${input.value}"` : ''}
                    autocomplete="off"
                >`;
                break;
                
            case 'number':
                html += `<input 
                    type="number" 
                    id="${fieldId}"
                    name="${input.name}" 
                    class="form-input"
                    ${input.required ? 'required' : ''}
                    ${input.placeholder ? `placeholder="${input.placeholder}"` : ''}
                    ${input.min !== undefined ? `min="${input.min}"` : ''}
                    ${input.max !== undefined ? `max="${input.max}"` : ''}
                    ${input.step !== undefined ? `step="${input.step}"` : ''}
                    ${input.value ? `value="${input.value}"` : ''}
                    autocomplete="off"
                >`;
                break;
                
            case 'textarea':
                html += `<textarea 
                    id="${fieldId}"
                    name="${input.name}" 
                    class="form-textarea"
                    ${input.required ? 'required' : ''}
                    ${input.placeholder ? `placeholder="${input.placeholder}"` : ''}
                    rows="${input.rows || 4}"
                    autocomplete="off"
                >${input.value || ''}</textarea>`;
                break;
                
            case 'select':
                html += `<select 
                    id="${fieldId}"
                    name="${input.name}" 
                    class="form-select"
                    ${input.required ? 'required' : ''}
                >`;
                
                if (!input.required) {
                    html += '<option value="">-- Select --</option>';
                }
                
                if (Array.isArray(input.options)) {
                    input.options.forEach(option => {
                        const optValue = typeof option === 'string' ? option : option.value;
                        const optLabel = typeof option === 'string' ? option : option.label;
                        const selected = input.value === optValue ? 'selected' : '';
                        html += `<option value="${optValue}" ${selected}>${optLabel}</option>`;
                    });
                }
                
                html += '</select>';
                break;
                
            case 'radio':
                html += '<div class="radio-group">';
                if (Array.isArray(input.options)) {
                    input.options.forEach((option, optIndex) => {
                        const optValue = typeof option === 'string' ? option : option.value;
                        const optLabel = typeof option === 'string' ? option : option.label;
                        const isDefault = option.default || false;
                        const radioId = `${fieldId}-opt${optIndex}`;
                        
                        html += `<label for="${radioId}" class="radio-label">`;
                        html += `<input type="radio" id="${radioId}" name="${input.name}" value="${optValue}" ${input.required ? 'required' : ''} ${isDefault ? 'checked' : ''} class="radio-input">`;
                        html += `<span class="radio-text">${optLabel}</span>`;
                        html += `</label>`;
                    });
                }
                html += '</div>';
                break;
                
            case 'checkbox':
                html += '<div class="checkbox-group">';
                if (Array.isArray(input.options)) {
                    input.options.forEach((option, optIndex) => {
                        const optValue = typeof option === 'string' ? option : option.value;
                        const optLabel = typeof option === 'string' ? option : option.label;
                        const isDefault = option.default || false;
                        const checkId = `${fieldId}-opt${optIndex}`;
                        
                        html += `<label for="${checkId}" class="checkbox-label">`;
                        html += `<input type="checkbox" id="${checkId}" name="${input.name}" value="${optValue}" ${isDefault ? 'checked' : ''} class="checkbox-input">`;
                        html += `<span class="checkbox-text">${optLabel}</span>`;
                        html += `</label>`;
                    });
                }
                html += '</div>';
                break;
                
            case 'date':
                html += `<input type="date" id="${fieldId}" name="${input.name}" class="form-input" ${input.required ? 'required' : ''}>`;
                break;
                
            case 'time':
                html += `<input type="time" id="${fieldId}" name="${input.name}" class="form-input" ${input.required ? 'required' : ''}>`;
                break;
                
            case 'datetime-local':
                html += `<input type="datetime-local" id="${fieldId}" name="${input.name}" class="form-input" ${input.required ? 'required' : ''}>`;
                break;
                
            default:
                html += `<input type="text" id="${fieldId}" name="${input.name}" class="form-input" ${input.required ? 'required' : ''} autocomplete="off">`;
        }
        
        // Help text if provided
        if (input.help) {
            html += `<small class="form-help">${input.help}</small>`;
        }
        
        html += '</div>';
        return html;
    },

    /**
     * Render output screen
     */
    renderOutput(prompt, output, formData) {
        const mainContent = document.getElementById('mainContent');
        
        // Update header
        document.getElementById('headerTitle').textContent = 'Generated Prompt';
        document.getElementById('headerSubtitle').textContent = prompt.title;
        document.getElementById('backBtn').style.display = 'flex';
        
        let html = '<div class="output-view">';
        
        // Output header
        html += `
            <div class="output-header">
                <div class="output-type-badge ${prompt.type}">${this.getTypeLabel(prompt.type)}</div>
            </div>
        `;
        
        // Output content
        html += `
            <div class="output-content">
                <pre class="output-text" id="outputText">${this.escapeHtml(output)}</pre>
            </div>
        `;
        
        // Actions
        html += `
            <div class="output-actions">
                <button id="copyOutputBtn" class="btn btn-primary">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy to Clipboard
                </button>
                <button id="newPromptBtn" class="btn btn-secondary">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5l-7 7-3-3"/>
                        <path d="M12 5l7 7"/>
                    </svg>
                    New Prompt
                </button>
            </div>
        `;
        
        // AI Refine options for hybrid prompts
        if (prompt.type === 'hybrid' && prompt.aiRefineOptions && prompt.aiRefineOptions.length > 0) {
            html += '<div class="ai-refine-section">';
            html += '<h3 class="ai-refine-title">✨ AI Refine Options</h3>';
            html += '<p class="ai-refine-description">Enhance this template with AI refinement:</p>';
            html += '<div class="ai-refine-options">';
            
            prompt.aiRefineOptions.forEach(option => {
                html += `
                    <button class="btn-ai-refine" data-option-id="${option.id}">
                        <span class="ai-refine-icon">${option.icon}</span>
                        <span class="ai-refine-name">${option.name}</span>
                    </button>
                `;
            });
            
            html += '</div>';
            html += '</div>';
        }
        
        html += '</div>'; // End output-view
        
        mainContent.innerHTML = html;
        
        // Attach event listeners
        this.attachOutputEventListeners(prompt, output, formData);
    },

    /**
     * Render category card
     */
    renderCategoryCard(category, promptCount) {
        return `
            <div class="category-card" data-category-id="${category.id}">
                <div class="category-card-icon" style="color: ${category.color}">${category.icon}</div>
                <h3 class="category-card-title">${category.name}</h3>
                <p class="category-card-count">${promptCount} prompt${promptCount !== 1 ? 's' : ''}</p>
            </div>
        `;
    },

    /**
     * Render prompt item
     */
    renderPromptItem(prompt, isFavorite, rank = null, usageCount = null) {
        const usageCountDisplay = usageCount ? ` (${usageCount})` : '';
        const rankDisplay = rank ? `<span class="prompt-rank">#${rank}</span>` : '';
        
        return `
            <div class="prompt-item" data-prompt-id="${prompt.id}">
                ${rankDisplay}
                <div class="prompt-item-icon">${prompt.icon}</div>
                <div class="prompt-item-content">
                    <h3 class="prompt-item-title">${prompt.title}${usageCountDisplay}</h3>
                    <p class="prompt-item-description">${prompt.description}</p>
                    <div class="prompt-item-meta">
                        <span class="prompt-type-badge ${prompt.type}">${this.getTypeLabel(prompt.type)}</span>
                    </div>
                </div>
                <button class="btn-favorite ${isFavorite ? 'active' : ''}" data-prompt-id="${prompt.id}">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                </button>
            </div>
        `;
    },

    /**
     * Get type label
     */
    getTypeLabel(type) {
        const labels = {
            'ai-only': 'AI Prompt',
            'hybrid': 'Hybrid',
            'template-only': 'Template'
        };
        return labels[type] || type;
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Attach home event listeners
     */
    attachHomeEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }
        
        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.dataset.categoryId;
                window.history.pushState({ view: 'category', categoryId }, '', `#category/${categoryId}`);
                this.renderCategory(categoryId);
            });
        });
        
        // Prompt items
        document.querySelectorAll('.prompt-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-favorite')) {
                    const promptId = item.dataset.promptId;
                    window.history.pushState({ view: 'prompt', promptId }, '', `#prompt/${promptId}`);
                    this.renderPromptForm(promptId);
                }
            });
        });
        
        // Favorite buttons
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const promptId = btn.dataset.promptId;
                Storage.toggleFavorite(promptId);
                btn.classList.toggle('active');
                const svg = btn.querySelector('svg');
                const isFavorite = btn.classList.contains('active');
                svg.setAttribute('fill', isFavorite ? 'currentColor' : 'none');
            });
        });
    },

    /**
     * Attach category event listeners
     */
    attachCategoryEventListeners(categoryId) {
        // Category search
        const searchInput = document.getElementById('categorySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleCategorySearch(categoryId, e.target.value);
            });
        }
        
        // Prompt items
        document.querySelectorAll('.prompt-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-favorite')) {
                    const promptId = item.dataset.promptId;
                    window.history.pushState({ view: 'prompt', promptId }, '', `#prompt/${promptId}`);
                    this.renderPromptForm(promptId);
                }
            });
        });
        
        // Favorite buttons
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const promptId = btn.dataset.promptId;
                Storage.toggleFavorite(promptId);
                btn.classList.toggle('active');
                const svg = btn.querySelector('svg');
                const isFavorite = btn.classList.contains('active');
                svg.setAttribute('fill', isFavorite ? 'currentColor' : 'none');
            });
        });
    },

    /**
     * Attach form event listeners
     */
    attachFormEventListeners() {
        const form = document.getElementById('promptForm');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const promptId = form.dataset.promptId;
            this.handleFormSubmit(e, promptId);
        });
    },

    /**
     * Handle form submission
     */
    handleFormSubmit(event, promptId) {
        event.preventDefault();
        
        const prompt = PromptsData.getPromptById(promptId);
        if (!prompt) {
            Utils.showToast('Prompt not found', 'error');
            return;
        }
        
        const form = event.target;
        const formData = new FormData(form);
        const data = {};
        
        // Collect form data
        for (let [key, value] of formData.entries()) {
            if (form.elements[key] && form.elements[key].type === 'checkbox') {
                if (!data[key]) data[key] = [];
                if (value) data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        
        // Convert checkbox arrays to strings
        Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
                data[key] = data[key].join(', ');
            }
        });
        
        // Auto-fill settings
        const settings = Storage.getSettings();
        data.reporter = data.reporter || settings.oimName || 'Aziz Mohamad';
        data.platform = data.platform || settings.platform || 'IbA';
        data.oimTitle = settings.oimTitle || 'OIM Irong Barat';
        data.bossName = settings.bossName || 'FM Azri';
        
        // Auto-fill date/time
        const now = new Date();
        if (!data.date) data.date = Utils.formatDate(now);
        if (!data.time) data.time = Utils.formatTime(now);
        if (!data.timestamp) data.timestamp = Utils.formatDateTime(now);
        if (!data.datetime) data.datetime = now.toISOString().slice(0, 16);
        
        // Generate output
        let output = '';
        
        if (prompt.type === 'ai-only') {
            output = Utils.replaceTemplateVars(prompt.aiPrompt, data);
        } else if (prompt.type === 'hybrid' || prompt.type === 'template-only') {
            if (prompt.template) {
                output = Utils.replaceTemplateVars(prompt.template, data);
            } else {
                Utils.showToast('Template not found', 'error');
                return;
            }
        }
        
        // Save history
        Storage.addToHistory({
            promptId: prompt.id,
            promptTitle: prompt.title,
            output: output.substring(0, 200) + '...',
            formData: data
        });
        
        Storage.incrementUsage(prompt.id);
        
        // Render output
        this.renderOutput(prompt, output, data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    /**
     * Attach output event listeners
     */
    attachOutputEventListeners(prompt, output, formData) {
        // Copy button
        const copyBtn = document.getElementById('copyOutputBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                Clipboard.copyWithFeedback(output, copyBtn);
            });
        }
        
        // New prompt button
        const newBtn = document.getElementById('newPromptBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                window.history.pushState({ view: 'home' }, '', '#');
                this.renderHome();
            });
        }
        
        // AI refine buttons
        document.querySelectorAll('.btn-ai-refine').forEach(btn => {
            btn.addEventListener('click', () => {
                const optionId = btn.dataset.optionId;
                const option = prompt.aiRefineOptions.find(opt => opt.id === optionId);
                if (option) {
                    const refinedPrompt = Utils.replaceTemplateVars(option.prompt, {
                        ...formData,
                        template: output
                    });
                    this.renderOutput(prompt, refinedPrompt, formData);
                    Utils.showToast('AI refinement prompt generated!', 'success');
                }
            });
        });
    },

    /**
     * Handle global search
     */
    handleGlobalSearch(query) {
        if (!query || query.trim() === '') {
            this.renderHome();
            return;
        }
        
        const allPrompts = PromptsData.prompts;
        const results = Utils.searchObjects(allPrompts, query, ['title', 'description']);
        
        // Render search results (simplified)
        const mainContent = document.getElementById('mainContent');
        let html = '<div class="search-results">';
        html += `<h2>Search Results for "${query}"</h2>`;
        html += '<div class="prompts-list">';
        
        if (results.length > 0) {
            results.forEach(prompt => {
                html += this.renderPromptItem(prompt, Storage.isFavorite(prompt.id));
            });
        } else {
            html += '<p>No prompts found.</p>';
        }
        
        html += '</div></div>';
        mainContent.innerHTML = html;
        
        this.attachHomeEventListeners();
    },

    /**
     * Handle category search
     */
    handleCategorySearch(categoryId, query) {
        const prompts = PromptsData.getPromptsByCategory(categoryId);
        const results = query ? Utils.searchObjects(prompts, query, ['title', 'description']) : prompts;
        
        const list = document.getElementById('categoryPromptsList');
        if (!list) return;
        
        list.innerHTML = '';
        results.forEach(prompt => {
            list.innerHTML += this.renderPromptItem(prompt, Storage.isFavorite(prompt.id));
        });
        
        // Reattach event listeners for new items
        this.attachCategoryEventListeners(categoryId);
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
