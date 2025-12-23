// synergy.js - Panel z działającym przeciąganiem
(function() {
    'use strict';

    console.log('🚀 SynergyWraith Panel v1.6 loaded');

    // 🔹 Konfiguracja
    const CONFIG = {
        PANEL_POSITION: "sw_panel_position",
        PANEL_VISIBLE: "sw_panel_visible",
        TOGGLE_BTN_POSITION: "sw_toggle_button_position",
        KCS_ICONS_ENABLED: "kcs_icons_enabled",
        FAVORITE_ADDONS: "sw_favorite_addons",
        BACKGROUND_VISIBLE: "sw_panel_background",
        LICENSE_LIST_URL: "https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/LICENSE"
    };

    // 🔹 Lista dostępnych dodatków
    const ADDONS = [
        {
            id: 'kcs-icons',
            name: 'KCS i Zwój Ikony',
            description: 'Pokazuje ikony potworów na Kamieniach i Zwojach Czerwonego Smoka',
            enabled: true,
            favorite: false
        },
        {
            id: 'auto-looter',
            name: 'Auto Looter',
            description: 'Automatycznie zbiera przedmioty z potworów',
            enabled: false,
            favorite: false
        },
        {
            id: 'quest-helper',
            name: 'Pomocnik Questów',
            description: 'Wskazuje lokalizację zadań i wymagane przedmioty',
            enabled: false,
            favorite: false
        }
    ];

    // 🔹 Safe fallback
    if (!window.synergyWraith) {
        console.warn('⚠️ synergyWraith not found, creating fallback');
        window.synergyWraith = {
            GM_getValue: (key, defaultValue) => {
                try {
                    const value = localStorage.getItem(key);
                    return value ? JSON.parse(value) : defaultValue;
                } catch (e) {
                    return defaultValue;
                }
            },
            GM_setValue: (key, value) => {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    return false;
                }
            },
            GM_deleteValue: (key) => {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            GM_listValues: () => {
                try {
                    return Object.keys(localStorage);
                } catch (e) {
                    return [];
                }
            },
            GM_xmlhttpRequest: ({ method, url, onload, onerror }) => {
                fetch(url, { method })
                    .then(response => response.text().then(text => onload({ status: response.status, responseText: text })))
                    .catch(onerror);
            }
        };
    }

    const SW = window.synergyWraith;
    let isLicenseVerified = false;
    let userAccountId = null;
    let currentAddons = [...ADDONS];

    // 🔹 FUNKCJA INJEKCJI CSS - POPRAWIONA
    function injectIsolatedCSS() {
        const style = document.createElement('style');
        style.setAttribute('data-synergy', 'isolated');
        
        style.textContent = `
/* ========== TOGGLE BUTTON - BEZ RESETU ========== */
#swPanelToggle {
    position: fixed !important;
    top: 70px !important;
    left: 70px !important;
    width: 50px !important;
    height: 50px !important;
    background: transparent !important;
    border: 3px solid #00ff00 !important;
    border-radius: 50% !important;
    cursor: grab !important;
    z-index: 1000000 !important;
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.9) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.2s ease !important;
    user-select: none !important;
    overflow: hidden !important;
}

#swPanelToggle.dragging {
    cursor: grabbing !important;
    transform: scale(1.15) !important;
    box-shadow: 0 0 30px rgba(255, 50, 50, 1.2) !important;
    border: 3px solid #ffff00 !important;
    z-index: 1000001 !important;
}

#swPanelToggle:hover:not(.dragging) {
    transform: scale(1.08) !important;
    box-shadow: 0 0 25px rgba(255, 30, 30, 1) !important;
}

#swPanelToggle img {
    width: 100% !important;
    height: 100% !important;
    border-radius: 50% !important;
    object-fit: cover !important;
    pointer-events: none !important;
}

/* ========== MAIN PANEL ========== */
#swAddonsPanel {
    position: fixed !important;
    top: 140px !important;
    left: 70px !important;
    width: 320px !important;
    min-width: 320px !important;
    max-width: 320px !important;
    background: linear-gradient(135deg, #0a0a0a, #121212) !important;
    border: 3px solid #00ff00 !important;
    border-radius: 10px !important;
    color: #ffffff !important;
    z-index: 999999 !important;
    box-shadow: 0 0 30px rgba(255, 0, 0, 0.6), inset 0 0 20px rgba(0, 255, 0, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    display: none !important;
    overflow: hidden !important;
    font-size: 11px !important;
    line-height: 1.2 !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
}

/* Neon border effect */
#swAddonsPanel::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    border-radius: 8px !important;
    padding: 2px !important;
    background: linear-gradient(45deg, #00ff00, #ff0000, #00ff00) !important;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) !important;
    -webkit-mask-composite: xor !important;
    mask-composite: exclude !important;
    pointer-events: none !important;
    z-index: -1 !important;
}

#swPanelHeader {
    background: linear-gradient(to right, #1a1a1a, #222222) !important;
    padding: 8px 12px !important;
    text-align: center !important;
    border-bottom: 1px solid #00ff00 !important;
    cursor: grab !important;
    position: relative !important;
    overflow: hidden !important;
    font-size: 12px !important;
    font-weight: bold !important;
    color: #ffffff !important;
}

#swPanelHeader::after {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: -100% !important;
    width: 100% !important;
    height: 100% !important;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.1), transparent) !important;
    animation: shine 3s infinite !important;
}

@keyframes shine {
    0% { left: -100% !important; }
    100% { left: 100% !important; }
}

/* ========== TABS ========== */
.tab-container {
    display: flex !important;
    background: linear-gradient(to bottom, #1a1a1a, #151515) !important;
    border-bottom: 1px solid #00ff00 !important;
    padding: 0 3px !important;
    width: 100% !important;
}

.tablink {
    flex: 1 !important;
    background: none !important;
    border: none !important;
    outline: none !important;
    cursor: pointer !important;
    padding: 8px 3px !important;
    margin: 0 2px !important;
    transition: all 0.2s ease !important;
    color: #aaaaaa !important;
    font-weight: 600 !important;
    font-size: 10px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.3px !important;
    border-bottom: 2px solid transparent !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
}

.tablink.active {
    color: #00ff00 !important;
    border-bottom: 2px solid #00ff00 !important;
}

.tablink:hover:not(.active) {
    color: #00ff00 !important;
}

/* ========== TAB CONTENT ========== */
.tabcontent {
    display: none !important;
    padding: 10px !important;
    background: rgba(10, 10, 10, 0.9) !important;
    width: 100% !important;
}

.tabcontent.active {
    display: block !important;
}

.tabcontent h3 {
    margin: 0 0 10px 0 !important;
    color: #00ff00 !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    border-bottom: 1px solid #333 !important;
    padding-bottom: 5px !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
}

/* ========== ADDONS CATEGORIES ========== */
.addon-categories {
    display: flex !important;
    background: rgba(20, 20, 20, 0.8) !important;
    border: 1px solid #333 !important;
    border-radius: 4px !important;
    padding: 3px !important;
    margin-bottom: 10px !important;
    gap: 1px !important;
    width: 100% !important;
}

.addon-category {
    flex: 1 !important;
    background: none !important;
    border: none !important;
    padding: 6px 2px !important;
    color: #888 !important;
    font-size: 9px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    border-radius: 3px !important;
    transition: all 0.3s ease !important;
    text-transform: uppercase !important;
    letter-spacing: 0.3px !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
}

.addon-category.active {
    color: #00ff00 !important;
    background: rgba(0, 255, 0, 0.15) !important;
}

.addon-category:hover {
    color: #00ff00 !important;
    background: rgba(0, 255, 0, 0.1) !important;
}

/* ========== ADDONS LIST ========== */
.addon-category-content {
    display: none !important;
    max-height: 180px !important;
    overflow-y: auto !important;
    padding-right: 3px !important;
    width: 100% !important;
}

.addon-category-content.active {
    display: block !important;
}

.addon-list-empty {
    text-align: center !important;
    color: #666 !important;
    font-size: 10px !important;
    padding: 10px !important;
    font-style: italic !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
}

/* 🔥 ADDON ITEM - STAŁY ROZMIAR */
.addon-item {
    background: rgba(30, 30, 30, 0.8) !important;
    border: 1px solid #333 !important;
    border-radius: 4px !important;
    padding: 6px 8px !important;
    margin-bottom: 5px !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    height: 32px !important;
    overflow: hidden !important;
    width: 100% !important;
}

.addon-item-header {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    flex: 1 !important;
    min-height: 20px !important;
    max-height: 20px !important;
}

.addon-item-title {
    font-weight: 600 !important;
    color: #00ff00 !important;
    font-size: 10px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-width: 160px !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
}

.addon-item-actions {
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
}

/* ========== FAVORITE BUTTON ========== */
.favorite-btn {
    background: none !important;
    border: none !important;
    color: #888 !important;
    cursor: pointer !important;
    padding: 1px !important;
    font-size: 10px !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
}

.favorite-btn.favorite {
    color: #ffaa00 !important;
}

/* ========== SWITCH ========== */
.switch {
    position: relative !important;
    display: inline-block !important;
    width: 24px !important;
    height: 12px !important;
    min-width: 24px !important;
    max-width: 24px !important;
}

.switch input {
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
    position: absolute !important;
}

.slider {
    position: absolute !important;
    cursor: pointer !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background-color: #333 !important;
    transition: .3s !important;
    border-radius: 12px !important;
    border: 1px solid #555 !important;
}

.slider:before {
    position: absolute !important;
    content: "" !important;
    height: 8px !important;
    width: 8px !important;
    left: 2px !important;
    bottom: 2px !important;
    background-color: #00ff00 !important;
    transition: .3s !important;
    border-radius: 50% !important;
}

input:checked + .slider {
    background-color: #003300 !important;
    border-color: #00ff00 !important;
}

input:checked + .slider:before {
    transform: translateX(12px) !important;
}

/* ========== SETTINGS ========== */
.settings-item {
    margin-bottom: 10px !important;
    padding: 8px !important;
    background: rgba(30, 30, 30, 0.8) !important;
    border: 1px solid #333 !important;
    border-radius: 4px !important;
    width: 100% !important;
}

.background-toggle-container {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    margin-bottom: 10px !important;
    width: 100% !important;
}

.background-toggle-label {
    color: #00ff00 !important;
    font-size: 10px !important;
    font-weight: 600 !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
}

.background-toggle {
    position: relative !important;
    display: inline-block !important;
    width: 30px !important;
    height: 14px !important;
    min-width: 30px !important;
}

.background-toggle-slider {
    position: absolute !important;
    cursor: pointer !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background-color: #333 !important;
    transition: .3s !important;
    border-radius: 14px !important;
    border: 1px solid #555 !important;
}

.background-toggle-slider:before {
    position: absolute !important;
    content: "" !important;
    height: 10px !important;
    width: 10px !important;
    left: 2px !important;
    bottom: 2px !important;
    background-color: #00ff00 !important;
    transition: .3s !important;
    border-radius: 50% !important;
}

#backgroundToggle:checked + .background-toggle-slider {
    background-color: #003300 !important;
    border-color: #00ff00 !important;
}

#backgroundToggle:checked + .background-toggle-slider:before {
    transform: translateX(16px) !important;
}

/* ========== SCROLLBAR ========== */
.addon-category-content::-webkit-scrollbar {
    width: 4px !important;
}

.addon-category-content::-webkit-scrollbar-track {
    background: rgba(20, 20, 20, 0.8) !important;
}

.addon-category-content::-webkit-scrollbar-thumb {
    background: #00ff00 !important;
    border-radius: 2px !important;
}
        `;
        
        document.head.appendChild(style);
        console.log('✅ Fixed CSS injected');
    }

    // 🔹 INICJALIZACJA
    async function initPanel() {
        console.log('✅ Initializing panel...');
        
        // 1. Wstrzyknij CSS
        injectIsolatedCSS();
        
        // 2. Załaduj stan
        loadAddonsState();
        
        // 3. Utwórz elementy
        createToggleButton();
        createMainPanel();
        loadSavedState();
        
        // 4. Ustaw przeciąganie widgetu
        setupToggleDrag();
        
        // 5. Ustaw pozostałe eventy
        setupEventListeners();
        setupTabs();
        setupDrag();
        
        // 6. Sprawdź licencję
        await checkLicenseOnStart();
        
        if (isLicenseVerified) {
            loadEnabledAddons();
        }
    }

    // 🔹 UTWÓRZ WIDGET - POPRAWIONE
    function createToggleButton() {
        const oldToggle = document.getElementById('swPanelToggle');
        if (oldToggle) oldToggle.remove();
        
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij dwukrotnie - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
        
        const img = document.createElement("img");
        img.src = "https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/icon.jpg";
        img.alt = "SW";
        
        toggleBtn.appendChild(img);
        document.body.appendChild(toggleBtn);
        
        return toggleBtn;
    }

    // 🔹 PRZECIĄGANIE WIDGETU - POPRAWIONE
    function setupToggleDrag() {
        const toggleBtn = document.getElementById('swPanelToggle');
        if (!toggleBtn) return;
        
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        let clickCount = 0;
        let clickTimer = null;
        
        // Ustaw początkową pozycję
        const savedBtnPosition = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        let currentX = savedBtnPosition ? parseInt(savedBtnPosition.left) : 70;
        let currentY = savedBtnPosition ? parseInt(savedBtnPosition.top) : 70;
        
        toggleBtn.style.left = currentX + 'px';
        toggleBtn.style.top = currentY + 'px';

        // 💡 WAŻNE: Używamy 'mousedown' zamiast 'click' dla przeciągania
        toggleBtn.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return; // Tylko lewy przycisk
            
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = currentX;
            initialTop = currentY;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            
            e.preventDefault();
        });

        function onMouseMove(e) {
            if (!isDragging) {
                isDragging = true;
                toggleBtn.style.cursor = 'grabbing';
                toggleBtn.classList.add('dragging');
                clickCount = 0;
                if (clickTimer) {
                    clearTimeout(clickTimer);
                    clickTimer = null;
                }
            }
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newLeft = initialLeft + deltaX;
            const newTop = initialTop + deltaY;
            
            const maxX = window.innerWidth - toggleBtn.offsetWidth;
            const maxY = window.innerHeight - toggleBtn.offsetHeight;
            
            currentX = Math.max(0, Math.min(newLeft, maxX));
            currentY = Math.max(0, Math.min(newTop, maxY));
            
            toggleBtn.style.left = currentX + 'px';
            toggleBtn.style.top = currentY + 'px';
        }

        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            if (isDragging) {
                isDragging = false;
                toggleBtn.style.cursor = 'grab';
                toggleBtn.classList.remove('dragging');
                
                SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, {
                    left: currentX + 'px',
                    top: currentY + 'px'
                });
            } else {
                handleClick();
            }
        }

        function handleClick() {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                clickCount = 0;
                togglePanel();
            }
        }

        function togglePanel() {
            const panel = document.getElementById('swAddonsPanel');
            if (panel) {
                const isVisible = panel.style.display === 'block';
                panel.style.display = isVisible ? 'none' : 'block';
                SW.GM_setValue(CONFIG.PANEL_VISIBLE, !isVisible);
            }
        }

        // 💡 DODATKOWO: Obsługa kliknięcia na widget
        toggleBtn.addEventListener('click', function(e) {
            // Zapobiegaj uruchomieniu handleClick jeśli było przeciąganie
            if (!isDragging) {
                handleClick();
            }
        });
        
        console.log('✅ Toggle drag setup complete');
    }

    // 🔹 POZOSTAŁE FUNKCJE (bez zmian strukturalnych)
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        panel.innerHTML = `
            <div id="swPanelHeader">
                <strong>SYNERGY WRAITH PANEL</strong>
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
                <button class="tablink" data-tab="status">Status</button>
                <button class="tablink" data-tab="settings">Ustawienia</button>
            </div>

            <div id="addons" class="tabcontent active">
                <h3>Dodatki</h3>
                
                <div class="addon-categories">
                    <button class="addon-category active" data-category="enabled">Włączone</button>
                    <button class="addon-category" data-category="disabled">Wyłączone</button>
                    <button class="addon-category" data-category="favorites">Ulubione</button>
                </div>
                
                <div id="addon-enabled" class="addon-category-content active"></div>
                <div id="addon-disabled" class="addon-category-content"></div>
                <div id="addon-favorites" class="addon-category-content"></div>
                
                <div id="swAddonsMessage" style="display:none;"></div>
            </div>

            <div id="status" class="tabcontent">
                <h3>Status Licencji</h3>
                <div class="license-status-container">
                    <div class="license-status-header">Status Licencji</div>
                    <div class="license-status-item">
                        <span class="license-status-label">Status:</span>
                        <span id="swLicenseStatus" class="license-status-invalid">Weryfikacja...</span>
                    </div>
                    <div class="license-status-item">
                        <span class="license-status-label">ID Konta:</span>
                        <span id="swAccountId" class="license-status-value">-</span>
                    </div>
                </div>
                <div id="swLicenseMessage"></div>
            </div>

            <div id="settings" class="tabcontent">
                <h3>Ustawienia Panelu</h3>
                
                <div class="settings-item">
                    <div class="background-toggle-container">
                        <span class="background-toggle-label">Widoczność tła panelu</span>
                        <label class="background-toggle">
                            <input type="checkbox" id="backgroundToggle" checked>
                            <span class="background-toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="reset-settings-container">
                    <button class="reset-settings-button" id="swResetButton">
                        <span class="reset-settings-icon">↻</span>
                        Resetuj wszystkie ustawienia
                    </button>
                </div>
                
                <div id="swResetMessage" style="display:none;"></div>
            </div>
        `;
        
        document.body.appendChild(panel);
        renderAddons();
    }

    function renderAddons() {
        const containers = {
            enabled: document.getElementById('addon-enabled'),
            disabled: document.getElementById('addon-disabled'),
            favorites: document.getElementById('addon-favorites')
        };
        
        Object.values(containers).forEach(container => {
            if (container) container.innerHTML = '';
        });
        
        let counts = { enabled: 0, disabled: 0, favorites: 0 };
        
        currentAddons.forEach(addon => {
            const element = document.createElement('div');
            element.className = 'addon-item';
            element.dataset.id = addon.id;
            
            element.innerHTML = `
                <div class="addon-item-header">
                    <div>
                        <div class="addon-item-title" title="${addon.description}">
                            ${addon.name}
                        </div>
                    </div>
                    <div class="addon-item-actions">
                        <button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" 
                                data-id="${addon.id}" 
                                title="${addon.favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}">
                            ★
                        </button>
                        <label class="switch">
                            <input type="checkbox" ${addon.enabled ? 'checked' : ''} data-id="${addon.id}">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            `;
            
            if (addon.favorite) {
                containers.favorites.appendChild(element.cloneNode(true));
                counts.favorites++;
            }
            
            if (addon.enabled) {
                containers.enabled.appendChild(element.cloneNode(true));
                counts.enabled++;
            } else {
                containers.disabled.appendChild(element.cloneNode(true));
                counts.disabled++;
            }
        });
        
        // Update category buttons
        const enabledBtn = document.querySelector('.addon-category[data-category="enabled"]');
        const disabledBtn = document.querySelector('.addon-category[data-category="disabled"]');
        const favoritesBtn = document.querySelector('.addon-category[data-category="favorites"]');
        
        if (enabledBtn) enabledBtn.textContent = counts.enabled > 0 ? `Włączone (${counts.enabled})` : 'Włączone';
        if (disabledBtn) disabledBtn.textContent = counts.disabled > 0 ? `Wyłączone (${counts.disabled})` : 'Wyłączone';
        if (favoritesBtn) favoritesBtn.textContent = counts.favorites > 0 ? `Ulubione (${counts.favorites})` : 'Ulubione';
    }

    function setupTabs() {
        document.querySelectorAll('.tablink').forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.stopPropagation();
                const tabName = this.dataset.tab;
                
                document.querySelectorAll('.tablink').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tabcontent').forEach(c => c.classList.remove('active'));
                
                this.classList.add('active');
                const tabContent = document.getElementById(tabName);
                if (tabContent) tabContent.classList.add('active');
            });
        });

        document.querySelectorAll('.addon-category').forEach(category => {
            category.addEventListener('click', function(e) {
                e.stopPropagation();
                const categoryName = this.dataset.category;
                
                document.querySelectorAll('.addon-category').forEach(c => c.classList.remove('active'));
                document.querySelectorAll('.addon-category-content').forEach(c => c.classList.remove('active'));
                
                this.classList.add('active');
                const categoryContent = document.getElementById(`addon-${categoryName}`);
                if (categoryContent) categoryContent.classList.add('active');
            });
        });
    }

    function setupDrag() {
        const header = document.getElementById('swPanelHeader');
        const panel = document.getElementById('swAddonsPanel');
        
        if (!header || !panel) return;
        
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', function(e) {
            if (e.target.closest('.tablink') || e.target.closest('.addon-category')) return;
            
            isDragging = true;
            const rect = panel.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            document.addEventListener('mousemove', onPanelDrag);
            document.addEventListener('mouseup', stopPanelDrag);
        });

        function onPanelDrag(e) {
            if (!isDragging) return;
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
        }

        function stopPanelDrag() {
            isDragging = false;
            SW.GM_setValue(CONFIG.PANEL_POSITION, {
                left: panel.style.left,
                top: panel.style.top
            });
            
            document.removeEventListener('mousemove', onPanelDrag);
            document.removeEventListener('mouseup', stopPanelDrag);
        }
    }

    function setupEventListeners() {
        const backgroundToggle = document.getElementById('backgroundToggle');
        if (backgroundToggle) {
            backgroundToggle.addEventListener('change', function() {
                SW.GM_setValue(CONFIG.BACKGROUND_VISIBLE, this.checked);
                updateBackgroundVisibility(this.checked);
            });
        }

        document.getElementById('swResetButton').addEventListener('click', function() {
            if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) {
                resetAllSettings();
            }
        });

        document.addEventListener('click', function(e) {
            if (e.target.closest('.favorite-btn')) {
                const btn = e.target.closest('.favorite-btn');
                toggleFavorite(btn.dataset.id);
            }
            
            if (e.target.type === 'checkbox' && e.target.closest('.addon-item')) {
                toggleAddon(e.target.dataset.id, e.target.checked);
            }
        });
    }

    function toggleFavorite(addonId) {
        const addon = currentAddons.find(a => a.id === addonId);
        if (!addon) return;
        
        addon.favorite = !addon.favorite;
        SW.GM_setValue(CONFIG.FAVORITE_ADDONS, 
            currentAddons.filter(a => a.favorite).map(a => a.id)
        );
        renderAddons();
    }

    function toggleAddon(addonId, isEnabled) {
        const addon = currentAddons.find(a => a.id === addonId);
        if (!addon) return;
        
        addon.enabled = isEnabled;
        
        if (addonId === 'kcs-icons') {
            SW.GM_setValue(CONFIG.KCS_ICONS_ENABLED, isEnabled);
            
            const messageEl = document.getElementById('swAddonsMessage');
            if (messageEl) {
                messageEl.textContent = `KCS Icons ${isEnabled ? 'włączony' : 'wyłączony'}. Odśwież grę.`;
                messageEl.style.cssText = `
                    display: block !important;
                    font-size: 9px !important;
                    padding: 5px !important;
                    margin-top: 8px !important;
                    background: rgba(0,255,0,0.1) !important;
                    color: #00ff00 !important;
                    border-radius: 3px !important;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                `;
                setTimeout(() => messageEl.style.display = 'none', 3000);
            }
            
            if (isLicenseVerified && isEnabled) {
                setTimeout(() => {
                    if (window.initKCSIcons) window.initKCSIcons();
                }, 100);
            }
        }
        
        renderAddons();
    }

    function updateBackgroundVisibility(isVisible) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            if (isVisible) {
                panel.classList.remove('transparent-background');
            } else {
                panel.classList.add('transparent-background');
            }
        }
    }

    function loadSavedState() {
        const savedBtnPosition = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn && savedBtnPosition) {
            toggleBtn.style.left = savedBtnPosition.left;
            toggleBtn.style.top = savedBtnPosition.top;
        }
        
        const savedPosition = SW.GM_getValue(CONFIG.PANEL_POSITION);
        const panel = document.getElementById('swAddonsPanel');
        if (panel && savedPosition) {
            panel.style.left = savedPosition.left;
            panel.style.top = savedPosition.top;
        }
        
        const isVisible = SW.GM_getValue(CONFIG.PANEL_VISIBLE, false);
        if (panel) panel.style.display = isVisible ? 'block' : 'none';
        
        const backgroundVisible = SW.GM_getValue(CONFIG.BACKGROUND_VISIBLE, true);
        const backgroundToggle = document.getElementById('backgroundToggle');
        if (backgroundToggle) {
            backgroundToggle.checked = backgroundVisible;
            updateBackgroundVisibility(backgroundVisible);
        }
    }

    function loadAddonsState() {
        const favoriteIds = SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []);
        const kcsEnabled = SW.GM_getValue(CONFIG.KCS_ICONS_ENABLED, true);
        
        currentAddons = ADDONS.map(addon => ({
            ...addon,
            enabled: addon.id === 'kcs-icons' ? kcsEnabled : false,
            favorite: favoriteIds.includes(addon.id)
        }));
    }

    function resetAllSettings() {
        SW.GM_deleteValue(CONFIG.PANEL_POSITION);
        SW.GM_deleteValue(CONFIG.PANEL_VISIBLE);
        SW.GM_deleteValue(CONFIG.TOGGLE_BTN_POSITION);
        SW.GM_deleteValue(CONFIG.BACKGROUND_VISIBLE);
        SW.GM_deleteValue(CONFIG.KCS_ICONS_ENABLED);
        SW.GM_deleteValue(CONFIG.FAVORITE_ADDONS);
        
        currentAddons = ADDONS.map(addon => ({
            ...addon,
            enabled: addon.id === 'kcs-icons',
            favorite: false
        }));
        
        const resetMsg = document.getElementById('swResetMessage');
        if (resetMsg) {
            resetMsg.textContent = 'Ustawienia zresetowane!';
            resetMsg.style.cssText = `
                display: block !important;
                font-size: 9px !important;
                padding: 5px !important;
                margin-top: 8px !important;
                background: rgba(0,255,0,0.1) !important;
                color: #00ff00 !important;
                border-radius: 3px !important;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            `;
            setTimeout(() => resetMsg.style.display = 'none', 3000);
        }
        
        loadSavedState();
        renderAddons();
    }

    // 🔹 START
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }

})();
