// synergy.js - Główny kod panelu z kompaktowym wyglądem
(function() {
    'use strict';

    console.log('🚀 SynergyWraith Panel v1.4 loaded');

    // 🔹 Konfiguracja - USUNIĘTO ZAPISYWANIE ROZMIARU CZCIONKI
    const CONFIG = {
        PANEL_POSITION: "sw_panel_position",
        PANEL_VISIBLE: "sw_panel_visible",
        TOGGLE_BTN_POSITION: "sw_toggle_button_position",
        KCS_ICONS_ENABLED: "kcs_icons_enabled",
        FAVORITE_ADDONS: "sw_favorite_addons",
        // USUNIĘTO: FONT_SIZE: "sw_panel_font_size",
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

    // 🔹 Safe fallback - jeśli synergyWraith nie istnieje
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

    // 🔹 Wstrzyknij CSS - ZMODYFIKOWANY DLA KOMPAKTOWOŚCI
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
/* 🔹 BASE STYLES 🔹 */
#swPanelToggle {
    position: fixed;
    top: 70px;
    left: 70px;
    width: 50px;
    height: 50px;
    background: transparent;
    border: 3px solid #00ff00;
    border-radius: 50%;
    cursor: grab;
    z-index: 1000000;
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.9);
    color: white;
    font-weight: bold;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-shadow: 0 0 5px black;
    transition: all 0.2s ease;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    overflow: hidden;
}

#swPanelToggle.dragging {
    cursor: grabbing;
    transform: scale(1.15);
    box-shadow: 0 0 30px rgba(255, 50, 50, 1.2);
    border: 3px solid #ffff00;
    z-index: 1000001;
}

#swPanelToggle:hover:not(.dragging) {
    transform: scale(1.08);
    box-shadow: 0 0 25px rgba(255, 30, 30, 1);
    cursor: grab;
}

#swPanelToggle:active:not(.dragging) {
    transform: scale(1.05);
    transition: transform 0.1s ease;
}

/* Save indication animation */
@keyframes savePulse {
    0% { 
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.9);
        border-color: #00ff00;
    }
    50% { 
        box-shadow: 0 0 35px rgba(0, 255, 0, 1.2);
        border-color: #00ff00;
        transform: scale(1.05);
    }
    100% { 
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.9);
        border-color: #00ff00;
    }
}

#swPanelToggle.saved {
    animation: savePulse 1.5s ease-in-out;
}

/* 🔹 MAIN PANEL - STAŁY ROZMIAR 🔹 */
#swAddonsPanel {
    position: fixed;
    top: 140px;
    left: 70px;
    width: 320px !important; /* STAŁA SZEROKOŚĆ */
    background: linear-gradient(135deg, #0a0a0a, #121212);
    border: 3px solid #00ff00;
    border-radius: 10px;
    color: #ffffff;
    z-index: 999999;
    box-shadow: 0 0 30px rgba(255, 0, 0, 0.6), inset 0 0 20px rgba(0, 255, 0, 0.1);
    backdrop-filter: blur(10px);
    display: none;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    overflow: hidden;
    font-size: 11px !important; /* STAŁY ROZMIAR CZCIONKI */
    line-height: 1.2;
}

/* Neonowy efekt na krawędziach */
#swAddonsPanel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    padding: 2px;
    background: linear-gradient(45deg, #00ff00, #ff0000, #00ff00);
    -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: -1;
}

#swPanelHeader {
    background: linear-gradient(to right, #1a1a1a, #222222);
    padding: 8px 12px !important;
    text-align: center;
    border-bottom: 1px solid #00ff00;
    cursor: grab;
    position: relative;
    overflow: hidden;
    font-size: 12px !important;
}

#swPanelHeader::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.1), transparent);
    animation: shine 3s infinite;
}

@keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
}

.sw-tab-content {
    padding: 10px !important;
    background: rgba(10, 10, 10, 0.9);
}

/* 🔹 TABS STYLES 🔹 */
.tab-container {
    display: flex;
    background: linear-gradient(to bottom, #1a1a1a, #151515);
    border-bottom: 1px solid #00ff00;
    padding: 0 3px !important;
}

.tablink {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 8px 3px !important;
    margin: 0 2px;
    transition: all 0.2s ease;
    color: #aaaaaa;
    font-weight: 600;
    font-size: 10px !important;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    border-bottom: 2px solid transparent;
    position: relative;
    overflow: hidden;
}

.tablink.active {
    color: #00ff00;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    border-bottom: 2px solid #00ff00;
}

.tablink:hover:not(.active) {
    color: #00ff00;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

/* 🔹 TAB CONTENT 🔹 */
.tabcontent {
    display: none;
    padding: 10px !important;
}

.tabcontent.active {
    display: block;
}

.tabcontent h3 {
    margin: 0 0 10px 0;
    color: #00ff00;
    font-size: 11px !important;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #333;
    padding-bottom: 5px;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

/* 🔹 ADDONS CATEGORIES 🔹 */
.addon-categories {
    display: flex;
    background: rgba(20, 20, 20, 0.8);
    border: 1px solid #333;
    border-radius: 4px;
    padding: 3px !important;
    margin-bottom: 10px;
    gap: 1px;
}

.addon-category {
    flex: 1;
    background: none;
    border: none;
    padding: 6px 2px !important;
    color: #888;
    font-size: 9px !important;
    font-weight: 600;
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.addon-category:hover {
    color: #00ff00;
    background: rgba(0, 255, 0, 0.1);
}

.addon-category.active {
    color: #00ff00;
    background: rgba(0, 255, 0, 0.15);
}

/* 🔹 ADDONS LIST - BARDZO KOMPAKTOWY 🔹 */
.addon-category-content {
    display: none;
    max-height: 180px;
    overflow-y: auto;
    padding-right: 3px;
}

.addon-category-content.active {
    display: block;
}

.addon-list-empty {
    text-align: center;
    color: #666;
    font-size: 10px;
    padding: 10px;
    font-style: italic;
}

.addon-item {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 4px;
    padding: 6px 8px !important;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 32px !important;
    max-height: 32px !important;
    overflow: hidden;
}

.addon-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    min-height: 20px;
}

.addon-item-title {
    font-weight: 600;
    color: #00ff00;
    font-size: 10px !important;
    text-shadow: 0 0 3px rgba(0, 255, 0, 0.3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
}

.addon-item-description {
    display: none; /* UKRYWAMY OPIS DLA KOMPAKTOWOŚCI */
}

.addon-item-actions {
    display: flex;
    align-items: center;
    gap: 4px;
}

/* 🔹 FAVORITE STAR 🔹 */
.favorite-btn {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    padding: 1px;
    font-size: 10px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.favorite-btn.favorite {
    color: #ffaa00;
}

/* 🔹 SWITCH STYLE - BARDZO MAŁY 🔹 */
.switch {
    position: relative;
    display: inline-block;
    width: 24px !important;
    height: 12px !important;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #333;
    transition: .3s;
    border-radius: 12px;
    border: 1px solid #555;
}

.slider:before {
    position: absolute;
    content: "";
    height: 8px;
    width: 8px;
    left: 2px;
    bottom: 2px;
    background-color: #00ff00;
    transition: .3s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: #003300;
    border-color: #00ff00;
}

input:checked + .slider:before {
    transform: translateX(12px);
}

/* 🔹 LICENSE STATUS 🔹 */
.license-status-container {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 4px;
    padding: 10px;
    margin-top: 10px;
}

.license-status-header {
    color: #00ff00;
    font-size: 10px;
    font-weight: bold;
    margin-bottom: 8px;
    border-bottom: 1px solid #333;
    padding-bottom: 5px;
    text-align: center;
}

.license-status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 9px;
    padding: 3px 0;
}

.license-status-label {
    color: #00ff00;
    font-weight: 600;
}

.license-status-value {
    font-weight: 600;
    text-align: right;
    max-width: 60%;
    word-break: break-all;
}

.license-status-valid {
    color: #00ff00 !important;
}

.license-status-invalid {
    color: #ff0000 !important;
}

/* 🔹 SETTINGS TAB - USUNIĘTO SUWAK CZCIONKI 🔹 */
.settings-item {
    margin-bottom: 10px;
    padding: 8px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 4px;
}

.settings-label {
    display: block;
    color: #00ff00;
    font-size: 10px;
    margin-bottom: 5px;
    font-weight: 600;
}

/* 🔹 WIDOCZNOŚĆ TŁA 🔹 */
.background-toggle-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.background-toggle-label {
    color: #00ff00;
    font-size: 10px;
    font-weight: 600;
}

.background-toggle {
    position: relative;
    display: inline-block;
    width: 30px;
    height: 14px;
}

.background-toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.background-toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #333;
    transition: .3s;
    border-radius: 14px;
    border: 1px solid #555;
}

.background-toggle-slider:before {
    position: absolute;
    content: "";
    height: 10px;
    width: 10px;
    left: 2px;
    bottom: 2px;
    background-color: #00ff00;
    transition: .3s;
    border-radius: 50%;
}

.background-toggle input:checked + .background-toggle-slider {
    background-color: #003300;
    border-color: #00ff00;
}

.background-toggle input:checked + .background-toggle-slider:before {
    transform: translateX(16px);
}

/* 🔹 PRZYCISK RESETUJ USTAWIENIA 🔹 */
.reset-settings-container {
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid #333;
}

.reset-settings-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 100%;
    padding: 8px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 4px;
    color: #ff0000;
    cursor: pointer;
    font-weight: 600;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.reset-settings-icon {
    color: #ff0000;
    font-size: 10px;
}

/* 🔹 DODATKOWE STYLE DLA PANELU BEZ TŁA 🔹 */
#swAddonsPanel.transparent-background {
    background: transparent;
    backdrop-filter: none;
}

/* 🔹 SCROLLBAR STYLES 🔹 */
.addon-category-content::-webkit-scrollbar {
    width: 4px;
}

.addon-category-content::-webkit-scrollbar-track {
    background: rgba(20, 20, 20, 0.8);
}

.addon-category-content::-webkit-scrollbar-thumb {
    background: #00ff00;
    border-radius: 2px;
}

/* 🔹 RESPONSYWNOŚĆ 🔹 */
@media (max-width: 400px) {
    #swAddonsPanel {
        width: 280px !important;
        left: 10px;
    }
}
        `;
        document.head.appendChild(style);
        console.log('✅ CSS injected with compact styles');
    }

    // 🔹 Główne funkcje
    async function initPanel() {
        console.log('✅ Initializing panel...');
        
        // Wstrzyknij CSS - TERAZ PIERWSZE!
        injectCSS();
        
        // Ładujemy zapisane dodatki
        loadAddonsState();
        
        // Tworzymy elementy
        createToggleButton();
        createMainPanel();
        
        // Ładujemy zapisany stan (BEZ zmiany rozmiaru czcionki)
        loadSavedState();
        
        // Inicjujemy przeciąganie
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn) {
            setupToggleDrag(toggleBtn);
        }
        
        setupEventListeners();
        setupTabs();
        setupDrag();
        
        // Sprawdzamy licencję
        await checkLicenseOnStart();
        
        // 🔹 ZAŁADUJ DODATKI PO WERYFIKACJI LICENCJI
        if (isLicenseVerified) {
            loadEnabledAddons();
        }
    }

    function createToggleButton() {
        const oldToggle = document.getElementById('swPanelToggle');
        if (oldToggle) oldToggle.remove();
        
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij dwukrotnie - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
        
        toggleBtn.innerHTML = `
            <img src="https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/icon.jpg" 
                 alt="SW" 
                 style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
        `;
        
        document.body.appendChild(toggleBtn);
        return toggleBtn;
    }

    function setupToggleDrag(toggleBtn) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        let clickCount = 0;
        let clickTimer = null;
        
        let currentX = parseInt(toggleBtn.style.left) || 70;
        let currentY = parseInt(toggleBtn.style.top) || 70;
        
        toggleBtn.style.left = currentX + 'px';
        toggleBtn.style.top = currentY + 'px';

        toggleBtn.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            
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

        function onMouseUp() {
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

        toggleBtn.addEventListener('click', handleClick);
    }

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
                
                <div id="swAddonsMessage" style="display:none; font-size:9px; padding:5px; margin-top:8px; background:rgba(0,255,0,0.1); color:#00ff00; border-radius:3px;"></div>
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
                <div id="swLicenseMessage" style="font-size:9px; padding:5px; margin-top:8px;"></div>
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
                
                <div id="swResetMessage" style="display:none; font-size:9px; padding:5px; margin-top:8px; background:rgba(0,255,0,0.1); color:#00ff00; border-radius:3px;"></div>
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
        
        // Wyczyść kontenery
        Object.values(containers).forEach(container => {
            container.innerHTML = '';
        });
        
        // Liczniki
        let counts = { enabled: 0, disabled: 0, favorites: 0 };
        
        currentAddons.forEach(addon => {
            const element = createAddonElement(addon);
            
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
        
        // Puste komunikaty
        if (counts.enabled === 0) {
            containers.enabled.innerHTML = '<div class="addon-list-empty">Brak włączonych dodatków</div>';
        }
        if (counts.disabled === 0) {
            containers.disabled.innerHTML = '<div class="addon-list-empty">Brak wyłączonych dodatków</div>';
        }
        if (counts.favorites === 0) {
            containers.favorites.innerHTML = '<div class="addon-list-empty">Brak ulubionych dodatków</div>';
        }
        
        // Aktualizuj przyciski
        document.querySelector('.addon-category[data-category="enabled"]').textContent = 
            counts.enabled > 0 ? `Włączone (${counts.enabled})` : 'Włączone';
        document.querySelector('.addon-category[data-category="disabled"]').textContent = 
            counts.disabled > 0 ? `Wyłączone (${counts.disabled})` : 'Wyłączone';
        document.querySelector('.addon-category[data-category="favorites"]').textContent = 
            counts.favorites > 0 ? `Ulubione (${counts.favorites})` : 'Ulubione';
    }

    function createAddonElement(addon) {
        const div = document.createElement('div');
        div.className = 'addon-item';
        div.dataset.id = addon.id;
        
        div.innerHTML = `
            <div class="addon-item-header">
                <div>
                    <div class="addon-item-title" title="${addon.description}">
                        ${addon.name}
                    </div>
                </div>
                <div class="addon-item-actions">
                    <button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" data-id="${addon.id}" title="${addon.favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}">
                        ★
                    </button>
                    <label class="switch">
                        <input type="checkbox" ${addon.enabled ? 'checked' : ''} data-id="${addon.id}">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        `;
        
        return div;
    }

    function setupTabs() {
        // Główne zakładki
        document.querySelectorAll('.tablink').forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.stopPropagation();
                const tabName = this.dataset.tab;
                
                document.querySelectorAll('.tablink').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tabcontent').forEach(c => c.classList.remove('active'));
                
                this.classList.add('active');
                document.getElementById(tabName).classList.add('active');
            });
        });

        // Kategorie dodatków
        document.querySelectorAll('.addon-category').forEach(category => {
            category.addEventListener('click', function(e) {
                e.stopPropagation();
                const categoryName = this.dataset.category;
                
                document.querySelectorAll('.addon-category').forEach(c => c.classList.remove('active'));
                document.querySelectorAll('.addon-category-content').forEach(c => c.classList.remove('active'));
                
                this.classList.add('active');
                document.getElementById(`addon-${categoryName}`).classList.add('active');
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
        // Widoczność tła
        const backgroundToggle = document.getElementById('backgroundToggle');
        if (backgroundToggle) {
            backgroundToggle.addEventListener('change', function() {
                SW.GM_setValue(CONFIG.BACKGROUND_VISIBLE, this.checked);
                updateBackgroundVisibility(this.checked);
            });
        }

        // Resetowanie ustawień
        document.getElementById('swResetButton').addEventListener('click', function() {
            if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) {
                resetAllSettings();
            }
        });

        // Delegowane nasłuchiwanie dla dodatków
        document.addEventListener('click', function(e) {
            // Ulubione
            if (e.target.closest('.favorite-btn')) {
                const btn = e.target.closest('.favorite-btn');
                toggleFavorite(btn.dataset.id);
            }
            
            // Przełączniki
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
            showAddonMessage(`KCS Icons ${isEnabled ? 'włączony' : 'wyłączony'}. Odśwież grę.`);
            
            if (isLicenseVerified && isEnabled) {
                setTimeout(initKCSIcons, 100);
            }
        }
        
        renderAddons();
    }

    function showAddonMessage(text) {
        const messageEl = document.getElementById('swAddonsMessage');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 3000);
        }
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
        
        document.getElementById('swResetMessage').textContent = 'Ustawienia zresetowane!';
        document.getElementById('swResetMessage').style.display = 'block';
        setTimeout(() => document.getElementById('swResetMessage').style.display = 'none', 3000);
        
        loadSavedState();
        renderAddons();
    }

    function updateBackgroundVisibility(isVisible) {
        const panel = document.getElementById('swAddonsPanel');
        panel.classList.toggle('transparent-background', !isVisible);
    }

    function loadSavedState() {
        // Pozycja przycisku
        const savedBtnPosition = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn && savedBtnPosition) {
            toggleBtn.style.left = savedBtnPosition.left;
            toggleBtn.style.top = savedBtnPosition.top;
        }
        
        // Pozycja panelu
        const savedPosition = SW.GM_getValue(CONFIG.PANEL_POSITION);
        const panel = document.getElementById('swAddonsPanel');
        if (panel && savedPosition) {
            panel.style.left = savedPosition.left;
            panel.style.top = savedPosition.top;
        }
        
        // Widoczność panelu
        const isVisible = SW.GM_getValue(CONFIG.PANEL_VISIBLE, false);
        if (panel) panel.style.display = isVisible ? 'block' : 'none';
        
        // Widoczność tła
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

    function loadEnabledAddons() {
        if (!isLicenseVerified) return;
        
        const kcsAddon = currentAddons.find(a => a.id === 'kcs-icons');
        if (kcsAddon && kcsAddon.enabled) {
            setTimeout(initKCSIcons, 100);
        }
    }

    // 🔹 Reszta funkcji (bez zmian dla licencji i KCS Icons)
    // ... (funkcje getUserAccountId, showMessage, updateLicenseStatus, fetchLicenseList, verifyAccount, checkLicenseOnStart, initKCSIcons)

    console.log('🎯 Waiting for DOM to load...');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }
})();
