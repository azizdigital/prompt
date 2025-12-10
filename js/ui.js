/**
 * PromptForge OIM - UI Rendering Engine
 * Handles all UI rendering and updates
 */

const UI = {
    // Default header text
    DEFAULT_TITLE: 'Aziz Prompt Forge',
    DEFAULT_SUBTITLE: 'Where Powerful Prompts Are Built',
    
    /**
     * Render home screen
     */
    renderHome() {
        const mainContent = document.getElementById('mainContent');
        
        // Update header with defaults
        document.getElementById('headerTitle').textContent = this.DEFAULT_TITLE;
        document.getElementById('headerSubtitle').textContent = this.DEFAULT_SUBTITLE;
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
                <input type="text" id="searchInput" class="search-input" placeholder="Search prompts...">
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
        
        // Most used section (if any)
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
        
        // Categories section
        html += '<div class="section-header mt-xl">';
        html += '<h2 class="section-title">📁 Categories</h2>';
        html += '</div>';
        html += '<div class="categories-grid">';
        
        PromptsData.categories.forEach(category => {
            const promptCount = PromptsData.getPromptsByCategory(category.id).length;
            html += this.renderCategoryCard(category, promptCount);
        });
        
        html += '</div>'; // End categories-grid
        html += '</div>'; // End home-screen
        
        mainContent.innerHTML = html;
        
        // Attach event listeners
        this.attachHomeEventListeners();
    },

    /**
     * Render category card
     */
    renderCategoryCard(category, promptCount) {
        return `
            <div class="category-card" data-category-id="${category.id}">
                <div class="category-header">
                    <div class="category-icon">${category.icon}</div>
                    <div class="category-info">
                        <h3 class="category-name">${category.name}</h3>
                        <span class="category-count-badge">${promptCount} prompts</span>
                    </div>
                </div>
                <p class="category-description">${category.description}</p>
            </div>
        `;
    },

    /**
     * Render prompt item (for lists)
     */
    renderPromptItem(prompt, showFavorite = false, rank = null, usageCount = null) {
        const isFavorite = Storage.isFavorite(prompt.id);
        const typeClass = prompt.type.replace('-', '');
        const typeLabel = {
            'ai-only': 'AI',
            'hybrid': 'Hybrid',
            'template-only': 'Template'
        }[prompt.type] || 'AI';
        
        let html = `
            <div class="prompt-item" data-prompt-id="${prompt.id}">
                ${rank ? `<div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text-tertiary); margin-right: var(--spacing-sm);">${rank}</div>` : ''}
                <div class="prompt-icon-badge">${prompt.icon}</div>
                <div class="prompt-content">
                    <div class="prompt-header">
                        <span class="prompt-title">${prompt.title}</span>
                        <span class="prompt-type-badge ${typeClass}">${typeLabel}</span>
                    </div>
                    <p class="prompt-description">${prompt.description}</p>
                    ${usageCount ? `<div class="prompt-meta"><span class="prompt-usage">Used ${usageCount}x</span></div>` : ''}
                </div>
                ${showFavorite || isFavorite ? `
                    <button class="btn-favorite ${isFavorite ? 'active' : ''}" data-prompt-id="${prompt.id}">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                    </button>
                ` : ''}
            </div>
        `;
        
        return html;
    },

    /**
     * Render category view (list of prompts in category)
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
        document.getElementById('headerSubtitle').textContent = `${prompts.length} prompts`;
        document.getElementById('backBtn').style.display = 'flex';
        
        // Build HTML
        let html = '<div class="category-view">';
        
        // Search within category
        html += `
            <div class="search-container">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="8" cy="8" r="6"/>
                    <path d="M14 14l4 4"/>
                </svg>
                <input type="text" id="categorySearchInput" class="search-input" placeholder="Search in ${category.name}...">
            </div>
        `;
        
        html += '<div class="prompts-list" id="promptsList">';
        
        prompts.forEach(prompt => {
            html += this.renderPromptItem(prompt, true);
        });
        
        html += '</div>';
        html += '</div>';
        
        mainContent.innerHTML = html;
        
        // Save last visited category
        Storage.saveLastCategory(categoryId);
        
        // Attach event listeners
        this.attachCategoryEventListeners(categoryId);
    },

    /**
     * Render prompt input form
     */
    renderPromptForm(promptId) {
        const prompt = PromptsData.getPromptById(promptId);
        
        if (!prompt) {
            this.renderHome();
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        
        // Update header
        document.getElementById('headerTitle').textContent = prompt.title;
        document.getElementById('headerSubtitle').textContent = prompt.description;
        document.getElementById('backBtn').style.display = 'flex';
        
        // Get platform info for auto-fill
        const platformInfo = Utils.getPlatformInfo();
        
        let html = '<div class="prompt-form-view">';
        html += '<form id="promptForm" class="prompt-form">';
        
        // Render each input field
        prompt.inputs.forEach(input => {
            html += this.renderInputField(input, platformInfo);
        });
        
        // Generate button
        html += `
            <div class="form-group mt-xl">
                <button type="submit" class="btn btn-primary btn-block">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"/>
                    </svg>
                    Generate ${prompt.type === 'template-only' ? 'Report' : 'Prompt'}
                </button>
            </div>
        `;
        
        html += '</form>';
        html += '</div>';
        
        mainContent.innerHTML = html;
        
        // Increment usage
        Storage.incrementUsage(promptId);
        
        // Attach event listeners
        this.attachFormEventListeners(prompt);
    },

    /**
     * Render input field based on type
     */
    renderInputField(input, platformInfo) {
        let html = '<div class="form-group">';
        
        // Label
        html += `<label class="form-label ${input.required ? 'form-label-required' : ''}">${input.label}</label>`;
        
        // Input based on type
        switch (input.type) {
            case 'text':
                const defaultValue = input.name === 'platform' ? platformInfo.platform : 
                                   input.name === 'reporter' ? platformInfo.oimName : '';
                html += `<input type="text" name="${input.name}" class="form-input" 
                         placeholder="${input.placeholder || ''}" 
                         value="${defaultValue}"
                         ${input.required ? 'required' : ''}>`;
                break;
                
            case 'textarea':
                html += `<textarea name="${input.name}" class="form-textarea" 
                         rows="${input.rows || 4}" 
                         placeholder="${input.placeholder || ''}" 
                         ${input.required ? 'required' : ''}></textarea>`;
                break;
                
            case 'select':
                html += `<select name="${input.name}" class="form-select" ${input.required ? 'required' : ''}>`;
                if (!input.required) html += '<option value="">-- Select --</option>';
                
                if (Array.isArray(input.options)) {
                    input.options.forEach(option => {
                        const optionValue = typeof option === 'string' ? option : option.value;
                        const optionLabel = typeof option === 'string' ? option : option.label;
                        const selected = optionValue === platformInfo.platform ? 'selected' : '';
                        html += `<option value="${optionValue}" ${selected}>${optionLabel}</option>`;
                    });
                }
                html += '</select>';
                break;
                
            case 'radio':
                html += '<div class="form-radio-group">';
                input.options.forEach(option => {
                    const checked = option.default ? 'checked' : '';
                    html += `
                        <label class="radio-option ${checked ? 'selected' : ''}">
                            <input type="radio" name="${input.name}" value="${option.value}" ${checked} ${input.required ? 'required' : ''}>
                            ${option.label}
                        </label>
                    `;
                });
                html += '</div>';
                break;
                
            case 'checkbox':
                html += '<div class="form-checkbox-group">';
                input.options.forEach(option => {
                    const checked = option.default ? 'checked' : '';
                    html += `
                        <label class="checkbox-option ${checked ? 'selected' : ''}">
                            <input type="checkbox" name="${input.name}" value="${option.value}" ${checked}>
                            ${option.label}
                        </label>
                    `;
                });
                html += '</div>';
                break;
                
            case 'date':
                const today = new Date().toISOString().split('T')[0];
                html += `<input type="date" name="${input.name}" class="form-input" value="${today}" ${input.required ? 'required' : ''}>`;
                break;
                
            case 'time':
                const now = new Date().toTimeString().split(' ')[0].substring(0, 5);
                html += `<input type="time" name="${input.name}" class="form-input" value="${now}" ${input.required ? 'required' : ''}>`;
                break;
                
            case 'datetime-local':
                const datetime = new Date().toISOString().slice(0, 16);
                html += `<input type="datetime-local" name="${input.name}" class="form-input" value="${datetime}" ${input.required ? 'required' : ''}>`;
                break;
                
            case 'number':
                html += `<input type="number" name="${input.name}" class="form-input" 
                         placeholder="${input.placeholder || ''}" 
                         ${input.required ? 'required' : ''}>`;
                break;
        }
        
        html += '</div>';
        return html;
    },

    /**
     * Render output (generated prompt or template)
     */
    renderOutput(prompt, output, isTemplate = false) {
        const mainContent = document.getElementById('mainContent');
        
        // Update header
        document.getElementById('headerTitle').textContent = prompt.title;
        document.getElementById('headerSubtitle').textContent = isTemplate ? 'Generated Report' : 'Generated Prompt';
        
        let html = '<div class="output-view">';
        
        html += `
            <div class="output-container">
                <div class="output-header">
                    <div class="output-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        ${isTemplate ? '✅ Report Ready' : '✅ Prompt Generated'}
                    </div>
                </div>
                <div class="output-content" id="outputContent">${Utils.escapeHTML(output)}</div>
                <div class="output-actions">
                    <button id="copyBtn" class="btn btn-primary">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                        </svg>
                        Copy to Clipboard
                    </button>
                    <button id="newPromptBtn" class="btn btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                        </svg>
                        New ${isTemplate ? 'Report' : 'Prompt'}
                    </button>
                </div>
            </div>
        `;
        
        // For hybrid prompts, show AI refine options
        if (prompt.type === 'hybrid' && isTemplate) {
            html += this.renderAIRefineOptions(prompt, output);
        }
        
        html += '</div>';
        
        mainContent.innerHTML = html;
        
        // Save to history
        Storage.addToHistory({
            promptId: prompt.id,
            promptTitle: prompt.title,
            output: output,
            type: isTemplate ? 'template' : 'prompt'
        });
        
        // Attach event listeners
        this.attachOutputEventListeners(prompt, output);
    },

    /**
     * Render AI refine options for hybrid prompts
     */
    renderAIRefineOptions(prompt, templateOutput) {
        if (!prompt.aiRefineOptions) return '';
        
        let html = `
            <div class="modifiers-section">
                <h3 class="modifiers-title">✨ Refine with AI</h3>
                <div class="modifiers-grid">
        `;
        
        prompt.aiRefineOptions.forEach(option => {
            html += `
                <button class="modifier-btn" data-refine-id="${option.id}">
                    <div class="modifier-icon">${option.icon}</div>
                    <div class="modifier-label">${option.name}</div>
                </button>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    },

    /**
     * Attach home screen event listeners
     */
    attachHomeEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleGlobalSearch(e.target.value);
            }, 300));
        }
        
        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const categoryId = card.dataset.categoryId;
                this.renderCategory(categoryId);
            });
        });
        
        // Prompt items
        document.querySelectorAll('.prompt-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking favorite button
                if (e.target.closest('.btn-favorite')) return;
                
                const promptId = item.dataset.promptId;
                this.renderPromptForm(promptId);
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
                if (btn.classList.contains('active')) {
                    svg.setAttribute('fill', 'currentColor');
                } else {
                    svg.setAttribute('fill', 'none');
                }
            });
        });
    },

    /**
     * Attach category view event listeners
     */
    attachCategoryEventListeners(categoryId) {
        // Category search
        const categorySearchInput = document.getElementById('categorySearchInput');
        if (categorySearchInput) {
            categorySearchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleCategorySearch(categoryId, e.target.value);
            }, 300));
        }
        
        // Prompt items
        document.querySelectorAll('.prompt-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-favorite')) return;
                const promptId = item.dataset.promptId;
                this.renderPromptForm(promptId);
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
                if (btn.classList.contains('active')) {
                    svg.setAttribute('fill', 'currentColor');
                } else {
                    svg.setAttribute('fill', 'none');
                }
            });
        });
    },

    /**
     * Attach form event listeners
     */
    attachFormEventListeners(prompt) {
        const form = document.getElementById('promptForm');
        
        // Radio buttons - visual feedback
        document.querySelectorAll('.radio-option input').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const parent = e.target.closest('.form-radio-group');
                parent.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('selected'));
                e.target.closest('.radio-option').classList.add('selected');
            });
        });
        
        // Checkbox - visual feedback
        document.querySelectorAll('.checkbox-option input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    e.target.closest('.checkbox-option').classList.add('selected');
                } else {
                    e.target.closest('.checkbox-option').classList.remove('selected');
                }
            });
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(prompt);
        });
    },

    /**
     * Attach output screen event listeners
     */
    attachOutputEventListeners(prompt, output) {
        // Copy button
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                Clipboard.copyWithFeedback(output, copyBtn);
            });
        }
        
        // New prompt button
        const newPromptBtn = document.getElementById('newPromptBtn');
        if (newPromptBtn) {
            newPromptBtn.addEventListener('click', () => {
                this.renderPromptForm(prompt.id);
            });
        }
        
        // AI refine modifiers (for hybrid prompts)
        document.querySelectorAll('.modifier-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const refineId = btn.dataset.refineId;
                this.handleAIRefine(prompt, output, refineId);
            });
        });
    },

    /**
     * Handle form submission
     */
    handleFormSubmit(prompt) {
        const form = document.getElementById('promptForm');
        const formData = new FormData(form);
        
        // Convert FormData to object
        const data = {};
        
        // Get platform info for auto-fill
        const platformInfo = Utils.getPlatformInfo();
        data.reporter = platformInfo.oimName;
        data.date = Utils.formatDate();
        data.time = Utils.formatTime();
        data.timestamp = Utils.formatDateTime();
        
        // Process each input
        prompt.inputs.forEach(input => {
            if (input.type === 'checkbox') {
                // For checkboxes, get all checked values
                const checkedValues = [];
                formData.getAll(input.name).forEach(val => {
                    if (val) checkedValues.push(val);
                });
                data[input.name] = checkedValues.join(', ');
            } else {
                data[input.name] = formData.get(input.name) || '';
            }
        });
        
        // Validate required fields
        const requiredFields = prompt.inputs
            .filter(input => input.required)
            .map(input => input.name);
        
        const validation = Utils.validateForm(data, requiredFields);
        
        if (!validation.isValid) {
            Utils.showToast('Please fill all required fields', 'error');
            return;
        }
        
        // Generate output based on prompt type
        let output = '';
        
        if (prompt.type === 'template-only' || prompt.type === 'hybrid') {
            // Fill template
            output = Utils.replaceTemplateVars(prompt.template, data);
            this.renderOutput(prompt, output, true);
        } else if (prompt.type === 'ai-only') {
            // Generate AI prompt
            output = Utils.replaceTemplateVars(prompt.aiPrompt, data);
            this.renderOutput(prompt, output, false);
        }
    },

    /**
     * Handle AI refine for hybrid prompts
     */
    handleAIRefine(prompt, templateOutput, refineId) {
        const refineOption = prompt.aiRefineOptions.find(opt => opt.id === refineId);
        
        if (!refineOption) return;
        
        // Replace {template} with actual template output
        const aiPrompt = refineOption.prompt.replace('{template}', templateOutput);
        
        // Show the AI prompt for user to copy
        this.renderOutput(prompt, aiPrompt, false);
        
        Utils.showToast(`AI refinement prompt generated for: ${refineOption.name}`, 'success');
    },

    /**
     * Handle global search
     */
    handleGlobalSearch(query) {
        if (!query || query.trim() === '') {
            this.renderHome();
            return;
        }
        
        const results = Utils.searchObjects(
            PromptsData.prompts,
            query,
            ['title', 'description', 'category']
        );
        
        const mainContent = document.getElementById('mainContent');
        
        let html = '<div class="search-results">';
        html += `<h2 class="section-title">Search Results for "${Utils.escapeHTML(query)}" <span class="section-count">${results.length}</span></h2>`;
        
        if (results.length === 0) {
            html += '<p style="text-align: center; color: var(--color-text-secondary); padding: 2rem;">No prompts found. Try different keywords.</p>';
        } else {
            html += '<div class="prompts-list">';
            results.forEach(prompt => {
                html += this.renderPromptItem(prompt, true);
            });
            html += '</div>';
        }
        
        html += '</div>';
        mainContent.innerHTML = html;
        
        this.attachHomeEventListeners();
    },

    /**
     * Handle category search
     */
    handleCategorySearch(categoryId, query) {
        const prompts = PromptsData.getPromptsByCategory(categoryId);
        
        const results = query && query.trim() !== '' 
            ? Utils.searchObjects(prompts, query, ['title', 'description'])
            : prompts;
        
        const promptsList = document.getElementById('promptsList');
        
        if (!promptsList) return;
        
        let html = '';
        
        if (results.length === 0) {
            html = '<p style="text-align: center; color: var(--color-text-secondary); padding: 2rem;">No prompts found in this category.</p>';
        } else {
            results.forEach(prompt => {
                html += this.renderPromptItem(prompt, true);
            });
        }
        
        promptsList.innerHTML = html;
        
        // Re-attach listeners for new items
        this.attachCategoryEventListeners(categoryId);
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
