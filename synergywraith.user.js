// ==UserScript==
// @name         SynergyWraith - Panel Dodatków
// @version      1.8
// @description  Zaawansowany panel dodatków do Margonem
// @author       ShaderDerWraith
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/synergywraith.user.js
// @icon         https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/icon.jpg
// @match        http*://*.margonem.pl/*
// @match        http*://*.margonem.com/*
// @exclude      http*://margonem.*/*
// @exclude      http*://www.margonem.*/*
// @exclude      http*://new.margonem.*/*
// @exclude      http*://forum.margonem.*/*
// @exclude      http*://commons.margonem.*/*
// @exclude      http*://dev-commons.margonem.*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @connect      raw.githubusercontent.com
// @connect      github.com
// @run-at       document-body
// ==/UserScript==

(function() {
    'use strict';

    console.log('🚀 Synergy Wraith v2.3 - Premium Gaming Panel');

    // 🔹 ZASZYFROWANA BAZA KLUCZY LICENCYJNYCH
    // (Base64 encoded JSON z kluczami i datami)
    const ENCRYPTED_LICENSE_KEYS = {
        // Testowe klucze (wygasają za 7, 30 dni itd.)
        "TEST-7DAYS": btoa(JSON.stringify({expiry: getFutureDate(7), type: "test"})),
        "TEST-30DAYS": btoa(JSON.stringify({expiry: getFutureDate(30), type: "test"})),
        "TEST-90DAYS": btoa(JSON.stringify({expiry: getFutureDate(90), type: "test"})),
        
        // Stałe klucze premium (do 2026)
        "SYNERGY-PREMIUM-2026": btoa(JSON.stringify({expiry: "2026-12-31", type: "premium"})),
        "SYNERGY-ULTIMATE-2027": btoa(JSON.stringify({expiry: "2027-12-31", type: "ultimate"})),
        
        // Klucze wygasłe (do testów)
        "EXPIRED-TEST": btoa(JSON.stringify({expiry: "2023-01-01", type: "expired"})),
        
        // Zabezpieczenie przed reverse engineering - fałszywe klucze
        "FAKE-KEY-001": btoa(JSON.stringify({expiry: "2024-01-01", type: "fake"})),
        "FAKE-KEY-002": btoa(JSON.stringify({expiry: "2024-02-01", type: "fake"})),
    };

    function getFutureDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    function decodeLicenseKey(encryptedKey) {
        try {
            const decoded = atob(encryptedKey);
            return JSON.parse(decoded);
        } catch (e) {
            return null;
        }
    }

    // 🔹 KONFIGURACJA
    const CONFIG = {
        PANEL_POSITION: "sw_panel_position",
        PANEL_VISIBLE: "sw_panel_visible",
        PANEL_SIZE: "sw_panel_size",
        TOGGLE_BTN_POSITION: "sw_toggle_button_position",
        KCS_ICONS_ENABLED: "kcs_icons_enabled",
        FAVORITE_ADDONS: "sw_favorite_addons",
        FONT_SIZE: "sw_panel_font_size",
        BACKGROUND_VISIBLE: "sw_panel_background",
        ACTIVE_CATEGORIES: "sw_active_categories",
        LICENSE_KEY: "sw_license_key",
        LICENSE_EXPIRY: "sw_license_expiry",
        LICENSE_ACTIVE: "sw_license_active",
        SHORTCUT_KEY: "sw_shortcut_key",
        CUSTOM_SHORTCUT: "sw_custom_shortcut",
        LICENSE_DAYS_LEFT: "sw_license_days_left"
    };

    // 🔹 DODATKI
    const ADDONS = [
        {
            id: 'kcs-icons',
            name: 'KCS Icons',
            description: 'Dodaje ikony do interfejsu gry',
            enabled: false,
            favorite: false,
            requiresLicense: true,
            addonFile: 'kcs-icons.js',
            category: 'ui'
        },
        {
            id: 'auto-looter',
            name: 'Auto Looter',
            description: 'Automatycznie zbiera loot po walce',
            enabled: false,
            favorite: false,
            requiresLicense: true,
            addonFile: 'auto-looter.js',
            category: 'automation'
        },
        {
            id: 'quest-helper',
            name: 'Quest Helper',
            description: 'Pomocnik zadań i misji',
            enabled: false,
            favorite: false,
            requiresLicense: false,
            addonFile: 'quest-helper.js',
            category: 'assistant'
        },
        {
            id: 'enhanced-stats',
            name: 'Enhanced Stats',
            description: 'Rozszerzone statystyki gracza',
            enabled: false,
            favorite: false,
            requiresLicense: true,
            addonFile: 'enhanced-stats.js',
            category: 'stats'
        },
        {
            id: 'trade-helper',
            name: 'Trade Helper',
            description: 'Inteligentny pomocnik handlu',
            enabled: false,
            favorite: false,
            requiresLicense: true,
            addonFile: 'trade-helper.js',
            category: 'trade'
        },
        {
            id: 'combat-log',
            name: 'Combat Log+',
            description: 'Zaawansowany log walki',
            enabled: false,
            favorite: false,
            requiresLicense: true,
            addonFile: 'combat-log.js',
            category: 'combat'
        }
    ];

    // 🔹 Safe storage fallback
    const SW = {
        GM_getValue: (key, defaultValue) => {
            try {
                const value = GM_getValue(key);
                return value !== undefined ? JSON.parse(value) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },
        GM_setValue: (key, value) => {
            try {
                GM_setValue(key, JSON.stringify(value));
                return true;
            } catch (e) {
                return false;
            }
        },
        GM_deleteValue: (key) => {
            try {
                GM_deleteValue(key);
                return true;
            } catch (e) {
                return false;
            }
        },
        GM_listValues: () => {
            try {
                return GM_listValues();
            } catch (e) {
                return [];
            }
        }
    };

    // 🔹 GŁÓWNE ZMIENNE
    let isLicenseVerified = false;
    let userAccountId = null;
    let licenseExpiry = null;
    let licenseDaysLeft = 0;
    let currentAddons = [...ADDONS];
    let activeCategories = { enabled: true, disabled: true, favorites: true };
    let searchQuery = '';
    let customShortcut = 'A';
    let isShortcutInputFocused = false;

    // 🔹 STYLES (injected via GM_addStyle)
    const PANEL_STYLES = `
/* 🔹 BASE STYLES 🔹 */
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
    color: white !important;
    font-weight: bold !important;
    font-size: 20px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-shadow: 0 0 5px black !important;
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
    cursor: grab !important;
}

@keyframes fireBorder {
    0%, 100% { border-color: #ff3300; }
    25% { border-color: #ff6600; }
    50% { border-color: #ff9900; }
    75% { border-color: #ffcc00; }
}

#swAddonsPanel {
    position: fixed !important;
    top: 140px !important;
    left: 70px !important;
    width: 700px !important;
    height: 580px !important;
    min-width: 400px !important;
    min-height: 300px !important;
    max-width: 1200px !important;
    max-height: 800px !important;
    background: linear-gradient(135deg, #0a0a0a, #121212) !important;
    border: 2px solid #ff3300 !important;
    border-radius: 8px !important;
    color: #ffffff !important;
    z-index: 1000002 !important;
    backdrop-filter: blur(10px) !important;
    display: none !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
    overflow: hidden !important;
    font-size: 12px !important;
    animation: fireBorder 8s infinite ease-in-out !important;
    box-sizing: border-box !important;
    resize: none !important;
    user-select: none !important;
}

/* ... (TUTAJ WSZYSTKO CO Z CSS Z WCZEŚNIEJSZEGO KODU - SKRÓCONE DLA CZYTELNOŚCI) ... */

/* 🔹 RESPONSYWNOŚĆ 🔹 */
@media (max-width: 750px) {
    #swAddonsPanel {
        width: 550px !important;
        min-width: 400px !important;
        max-width: 550px !important;
        left: 10px !important;
        height: 500px !important;
        min-height: 300px !important;
        max-height: 500px !important;
    }
}
    `;

    // 🔹 INJECT STYLES
    GM_addStyle(PANEL_STYLES);

    // 🔹 MAIN INITIALIZATION
    function initPanel() {
        console.log('✅ Initializing Synergy Wraith Panel...');
        
        // Load settings
        loadAddonsState();
        loadCategoriesState();
        loadSettings();
        
        // Create UI elements
        createToggleButton();
        createMainPanel();
        createLicenseModal();
        
        // Load saved state
        loadSavedState();
        
        // Setup event listeners
        setupEventListeners();
        setupTabs();
        setupDrag();
        setupResize();
        setupKeyboardShortcut();
        
        // Check license
        checkLicenseOnStart();
        
        // Load enabled addons
        if (isLicenseVerified) {
            loadEnabledAddons();
        }
        
        console.log('✅ Synergy Wraith Panel ready!');
    }

    // 🔹 CREATE TOGGLE BUTTON
    function createToggleButton() {
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Double-click: Toggle panel | Drag: Move position";
        toggleBtn.innerHTML = 'SW';
        
        // Drag functionality
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        
        toggleBtn.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = parseInt(toggleBtn.style.left) || 70;
            initialTop = parseInt(toggleBtn.style.top) || 70;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            
            e.preventDefault();
        });
        
        function onMouseMove(e) {
            if (!isDragging) {
                // Start dragging after 5px movement
                if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
                    isDragging = true;
                    toggleBtn.classList.add('dragging');
                }
            }
            
            if (isDragging) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                const newLeft = initialLeft + deltaX;
                const newTop = initialTop + deltaY;
                
                // Boundary check
                const maxX = window.innerWidth - toggleBtn.offsetWidth;
                const maxY = window.innerHeight - toggleBtn.offsetHeight;
                
                toggleBtn.style.left = Math.max(0, Math.min(newLeft, maxX)) + 'px';
                toggleBtn.style.top = Math.max(0, Math.min(newTop, maxY)) + 'px';
            }
        }
        
        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            if (isDragging) {
                toggleBtn.classList.remove('dragging');
                SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, {
                    left: toggleBtn.style.left,
                    top: toggleBtn.style.top
                });
            } else {
                // Single click - toggle panel
                togglePanel();
            }
        }
        
        // Double click also toggles
        toggleBtn.addEventListener('dblclick', togglePanel);
        
        document.body.appendChild(toggleBtn);
        return toggleBtn;
    }

    // 🔹 CREATE MAIN PANEL
    function createMainPanel() {
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        panel.innerHTML = `
            <div id="swPanelHeader">
                <strong>SYNERGY WRAITH v2.3</strong>
                <button id="swPanelClose" title="Close panel">×</button>
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Addons</button>
                <button class="tablink" data-tab="license">License</button>
                <button class="tablink" data-tab="settings">Settings</button>
                <button class="tablink" data-tab="info">Info</button>
            </div>

            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div class="search-container">
                        <input type="text" class="search-input" id="searchAddons" placeholder="Search addons...">
                    </div>
                    
                    <div class="category-filters">
                        <div class="category-filter-item">
                            <span>Enabled</span>
                            <label class="category-switch">
                                <input type="checkbox" id="filter-enabled" checked>
                                <span class="category-slider"></span>
                            </label>
                        </div>
                        <div class="category-filter-item">
                            <span>Disabled</span>
                            <label class="category-switch">
                                <input type="checkbox" id="filter-disabled" checked>
                                <span class="category-slider"></span>
                            </label>
                        </div>
                        <div class="category-filter-item">
                            <span>Favorites</span>
                            <label class="category-switch">
                                <input type="checkbox" id="filter-favorites" checked>
                                <span class="category-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="addon-list" id="addon-list"></div>
                    
                    <div class="refresh-button-container">
                        <button class="refresh-button" id="swRefreshButton">Refresh</button>
                    </div>
                </div>
            </div>

            <div id="license" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="license-container">
                        <div class="license-header">License Status</div>
                        <div class="license-status-item">
                            <span class="license-status-label">Status:</span>
                            <span id="swLicenseStatus" class="license-status-invalid">Inactive</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Account ID:</span>
                            <span id="swAccountId" class="license-status-value">-</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Expires:</span>
                            <span id="swLicenseExpiry" class="license-status-value">-</span>
                        </div>
                    </div>
                    
                    <div class="license-activation-container">
                        <button class="license-activation-button" id="swActivateLicense">
                            Activate License
                        </button>
                    </div>
                    
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>

            <div id="settings" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="settings-item">
                        <div class="font-size-container">
                            <label class="settings-label">Font size:</label>
                            <input type="range" min="10" max="18" value="12" class="font-size-slider" id="fontSizeSlider">
                            <span class="font-size-value" id="fontSizeValue">12px</span>
                        </div>
                    </div>
                    
                    <div class="settings-item">
                        <div class="shortcut-input-container">
                            <span class="shortcut-input-label">Panel shortcut:</span>
                            <input type="text" class="shortcut-input" id="shortcutInput" value="Ctrl+A" readonly>
                            <button class="shortcut-set-btn" id="shortcutSetBtn">Set shortcut</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="info-container">
                        <div class="info-header">Synergy Wraith v2.3</div>
                        <div class="info-patch-notes">
                            <li>Term license system</li>
                            <li>Encrypted key storage</li>
                            <li>Addon API with license verification</li>
                            <li>Premium addons require active license</li>
                            <li>Free addons available for all</li>
                        </div>
                        <div class="info-footer">
                            © 2024 Synergy Wraith • All rights reserved
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        renderAddons();
        return panel;
    }

    // 🔹 CREATE LICENSE MODAL
    function createLicenseModal() {
        const modal = document.createElement("div");
        modal.id = "swLicenseModal";
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000003;
            justify-content: center;
            align-items: center;
        `;
        
        modal.innerHTML = `
            <div class="license-modal-content">
                <button class="license-modal-close" id="swLicenseModalClose">×</button>
                <div class="license-modal-header">License Activation</div>
                <input type="text" class="license-modal-input" id="swLicenseKeyInput" placeholder="Enter license key...">
                <div class="license-modal-buttons">
                    <button class="license-modal-button cancel" id="swLicenseModalCancel">Cancel</button>
                    <button class="license-modal-button activate" id="swLicenseModalActivate">Activate</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    // 🔹 TOGGLE PANEL VISIBILITY
    function togglePanel() {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
            SW.GM_setValue(CONFIG.PANEL_VISIBLE, panel.style.display === 'block');
        }
    }

    // 🔹 ACTIVATE LICENSE
    function activateLicense(licenseKey) {
        console.log('🔐 Activating license:', licenseKey);
        
        if (!ENCRYPTED_LICENSE_KEYS[licenseKey]) {
            showLicenseMessage('Invalid license key', 'error');
            return;
        }
        
        const licenseData = decodeLicenseKey(ENCRYPTED_LICENSE_KEYS[licenseKey]);
        if (!licenseData) {
            showLicenseMessage('License decoding error', 'error');
            return;
        }
        
        // Check if license is fake
        if (licenseData.type === 'fake') {
            showLicenseMessage('Invalid license key (fake)', 'error');
            return;
        }
        
        const expiryDate = new Date(licenseData.expiry);
        const now = new Date();
        
        if (expiryDate <= now) {
            showLicenseMessage('License has expired', 'error');
            return;
        }
        
        // Calculate days left
        const diffTime = expiryDate - now;
        licenseDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Activate license
        isLicenseVerified = true;
        userAccountId = 'USER_' + licenseKey.substr(-8).toUpperCase();
        licenseExpiry = expiryDate;
        
        // Save to storage
        SW.GM_setValue(CONFIG.LICENSE_KEY, licenseKey);
        SW.GM_setValue(CONFIG.LICENSE_ACTIVE, true);
        SW.GM_setValue(CONFIG.LICENSE_EXPIRY, expiryDate.toISOString());
        SW.GM_setValue(CONFIG.LICENSE_DAYS_LEFT, licenseDaysLeft);
        
        // Update display
        updateLicenseDisplay();
        showLicenseMessage(`License activated! Valid until: ${expiryDate.toLocaleDateString()} (${licenseDaysLeft} days)`, 'success');
        
        // Load any premium addons that are enabled
        loadEnabledAddons();
    }

    // 🔹 CHECK LICENSE ON START
    function checkLicenseOnStart() {
        const savedKey = SW.GM_getValue(CONFIG.LICENSE_KEY);
        const savedActive = SW.GM_getValue(CONFIG.LICENSE_ACTIVE, false);
        const savedExpiry = SW.GM_getValue(CONFIG.LICENSE_EXPIRY);
        
        if (savedKey && savedActive && savedExpiry) {
            const expiryDate = new Date(savedExpiry);
            const now = new Date();
            
            if (expiryDate > now) {
                isLicenseVerified = true;
                userAccountId = 'USER_' + savedKey.substr(-8).toUpperCase();
                licenseExpiry = expiryDate;
                
                // Calculate days left
                const diffTime = expiryDate - now;
                licenseDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } else {
                // License expired
                isLicenseVerified = false;
                showLicenseMessage('Your license has expired', 'warning');
            }
        }
        
        updateLicenseDisplay();
    }

    // 🔹 LOAD ENABLED ADDONS
    function loadEnabledAddons() {
        console.log('🔓 Loading enabled addons...');
        
        currentAddons.forEach(addon => {
            if (addon.enabled) {
                if (addon.requiresLicense && !isLicenseVerified) {
                    console.log(`⏸️ Skipping ${addon.id}: License required but not active`);
                    addon.enabled = false;
                    return;
                }
                
                console.log(`📁 Loading addon: ${addon.id}`);
                // In a real scenario, you would load the addon script here
                // For example: loadAddonScript(addon.addonFile);
            }
        });
    }

    // 🔹 RENDER ADDONS LIST
    function renderAddons() {
        const listContainer = document.getElementById('addon-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        currentAddons.forEach(addon => {
            const item = document.createElement('div');
            item.className = 'addon-item';
            item.innerHTML = `
                <div class="addon-item-header">
                    <div class="addon-item-title">
                        ${addon.name}
                        ${addon.requiresLicense ? '<span style="color:#ff9900; font-size:10px;">[PREMIUM]</span>' : ''}
                    </div>
                    <div class="addon-item-description">${addon.description}</div>
                </div>
                <div class="addon-item-actions">
                    <button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" data-id="${addon.id}">★</button>
                    <label class="switch">
                        <input type="checkbox" ${addon.enabled ? 'checked' : ''} data-id="${addon.id}">
                        <span class="slider"></span>
                    </label>
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    // 🔹 UPDATE LICENSE DISPLAY
    function updateLicenseDisplay() {
        const statusEl = document.getElementById('swLicenseStatus');
        const accountEl = document.getElementById('swAccountId');
        const expiryEl = document.getElementById('swLicenseExpiry');
        
        if (statusEl) {
            statusEl.textContent = isLicenseVerified ? 'Active' : 'Inactive';
            statusEl.className = isLicenseVerified ? 'license-status-valid' : 'license-status-invalid';
        }
        
        if (accountEl) {
            accountEl.textContent = userAccountId || '-';
        }
        
        if (expiryEl) {
            if (licenseExpiry) {
                expiryEl.textContent = licenseExpiry.toLocaleDateString();
            } else {
                expiryEl.textContent = '-';
            }
        }
    }

    // 🔹 SHOW LICENSE MESSAGE
    function showLicenseMessage(message, type = 'info') {
        const messageEl = document.getElementById('swLicenseMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `license-message license-${type}`;
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

    // 🔹 LOAD/SAVE FUNCTIONS
    function loadAddonsState() {
        const favoriteIds = SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []);
        const kcsEnabled = SW.GM_getValue(CONFIG.KCS_ICONS_ENABLED, false);
        
        currentAddons = ADDONS.map(addon => ({
            ...addon,
            enabled: addon.id === 'kcs-icons' ? kcsEnabled : false,
            favorite: favoriteIds.includes(addon.id)
        }));
    }

    function loadCategoriesState() {
        const savedCategories = SW.GM_getValue(CONFIG.ACTIVE_CATEGORIES, {
            enabled: true,
            disabled: true,
            favorites: true
        });
        activeCategories = { ...savedCategories };
    }

    function loadSettings() {
        customShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
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
        if (panel) {
            panel.style.display = isVisible ? 'block' : 'none';
        }
    }

    // 🔹 SETUP EVENT LISTENERS
    function setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('swPanelClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', togglePanel);
        }
        
        // License activation
        const activateBtn = document.getElementById('swActivateLicense');
        const modal = document.getElementById('swLicenseModal');
        const modalActivateBtn = document.getElementById('swLicenseModalActivate');
        
        if (activateBtn && modal) {
            activateBtn.addEventListener('click', () => {
                modal.style.display = 'flex';
            });
        }
        
        if (modalActivateBtn) {
            modalActivateBtn.addEventListener('click', () => {
                const keyInput = document.getElementById('swLicenseKeyInput');
                if (keyInput && keyInput.value.trim()) {
                    activateLicense(keyInput.value.trim());
                    modal.style.display = 'none';
                    keyInput.value = '';
                }
            });
        }
        
        // Modal close/cancel
        const modalCloseBtn = document.getElementById('swLicenseModalClose');
        const modalCancelBtn = document.getElementById('swLicenseModalCancel');
        
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        if (modalCancelBtn) {
            modalCancelBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Search input
        const searchInput = document.getElementById('searchAddons');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchQuery = this.value.toLowerCase();
                // Implement search filtering here
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('swRefreshButton');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                location.reload();
            });
        }
        
        // Addon toggles (delegated)
        document.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox' && e.target.dataset.id) {
                const addonId = e.target.dataset.id;
                const isEnabled = e.target.checked;
                toggleAddon(addonId, isEnabled);
            }
        });
        
        // Favorite buttons (delegated)
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('favorite-btn') || e.target.closest('.favorite-btn')) {
                const btn = e.target.classList.contains('favorite-btn') ? e.target : e.target.closest('.favorite-btn');
                const addonId = btn.dataset.id;
                toggleFavorite(addonId);
            }
        });
    }

    // 🔹 TOGGLE ADDON
    function toggleAddon(addonId, isEnabled) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        
        const addon = currentAddons[addonIndex];
        
        // Check license for premium addons
        if (isEnabled && addon.requiresLicense && !isLicenseVerified) {
            showLicenseMessage(`"${addon.name}" requires an active license!`, 'error');
            currentAddons[addonIndex].enabled = false;
            renderAddons();
            return;
        }
        
        currentAddons[addonIndex].enabled = isEnabled;
        
        // Save KCS Icons state
        if (addonId === 'kcs-icons') {
            SW.GM_setValue(CONFIG.KCS_ICONS_ENABLED, isEnabled);
        }
        
        renderAddons();
    }

    // 🔹 TOGGLE FAVORITE
    function toggleFavorite(addonId) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        
        currentAddons[addonIndex].favorite = !currentAddons[addonIndex].favorite;
        
        const favoriteIds = currentAddons
            .filter(a => a.favorite)
            .map(a => a.id);
        SW.GM_setValue(CONFIG.FAVORITE_ADDONS, favoriteIds);
        
        renderAddons();
    }

    // 🔹 SETUP TABS
    function setupTabs() {
        const tabs = document.querySelectorAll('.tablink');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding content
                const tabContents = document.querySelectorAll('.tabcontent');
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                const activeContent = document.getElementById(tabName);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
    }

    // 🔹 SETUP DRAG
    function setupDrag() {
        const header = document.getElementById('swPanelHeader');
        const panel = document.getElementById('swAddonsPanel');
        
        if (!header || !panel) return;
        
        let isDragging = false;
        let offsetX, offsetY;
        
        header.addEventListener('mousedown', function(e) {
            if (e.target.id === 'swPanelClose') return;
            
            isDragging = true;
            const rect = panel.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDrag);
        });
        
        function onDrag(e) {
            if (!isDragging) return;
            
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
        }
        
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
            
            // Save position
            SW.GM_setValue(CONFIG.PANEL_POSITION, {
                left: panel.style.left,
                top: panel.style.top
            });
        }
    }

    // 🔹 SETUP RESIZE
    function setupResize() {
        // Basic resize implementation
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        // You can add resize handles here if needed
    }

    // 🔹 SETUP KEYBOARD SHORTCUT
    function setupKeyboardShortcut() {
        document.addEventListener('keydown', function(e) {
            if (isShortcutInputFocused) return;
            
            if (e.ctrlKey && e.key.toUpperCase() === 'A') {
                e.preventDefault();
                togglePanel();
            }
        });
    }

    // 🔹 INITIALIZE WHEN PAGE LOADS
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }

    // 🔹 EXPOSE API FOR ADDONS
    window.SynergyWraithAPI = {
        checkLicense: function(addonId) {
            return {
                valid: isLicenseVerified,
                message: isLicenseVerified ? 'License active' : 'License required',
                daysLeft: licenseDaysLeft,
                accountId: userAccountId
            };
        },
        
        requireLicense: function(addonId, callback) {
            if (!isLicenseVerified) {
                console.error(`❌ ${addonId}: License required`);
                return false;
            }
            return callback();
        }
    };

    console.log('✅ Synergy Wraith userscript loaded successfully');

})();
