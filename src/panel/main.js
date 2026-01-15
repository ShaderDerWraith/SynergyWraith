// synergy.js - Główny kod panelu Synergy (v3.5 - Final Edition)
(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v3.5 (Final Edition)');

    // 🔹 Konfiguracja
    const CONFIG = {
        PANEL_POSITION: "sw_panel_position",
        PANEL_VISIBLE: "sw_panel_visible",
        TOGGLE_BTN_POSITION: "sw_toggle_button_position",
        KCS_ICONS_ENABLED: "kcs_icons_enabled",
        FAVORITE_ADDONS: "sw_favorite_addons",
        FONT_SIZE: "sw_panel_font_size",
        BACKGROUND_OPACITY: "sw_panel_background_opacity",
        ACTIVE_CATEGORIES: "sw_active_categories",
        LICENSE_EXPIRY: "sw_license_expiry",
        LICENSE_ACTIVE: "sw_license_active",
        SHORTCUT_KEY: "sw_shortcut_key",
        CUSTOM_SHORTCUT: "sw_custom_shortcut",
        ACCOUNT_ID: "sw_account_id",
        LICENSE_DATA: "sw_license_data",
        ADMIN_ACCESS: "sw_admin_access",
        LICENSE_KEY: "sw_license_key",
        SHORTCUTS_CONFIG: "sw_shortcuts_config",
        SHORTCUTS_ENABLED: "sw_shortcuts_enabled"
    };

    // 🔹 Lista dostępnych dodatków
    let ADDONS = [
        {
            id: 'kcs-icons',
            name: 'KCS Icons',
            description: 'Dodaje ikony do interfejsu gry',
            type: 'premium',
            enabled: false,
            favorite: false,
            author: 'Synergy Team',
            version: '1.0',
            hidden: true,
            shortcut: null
        },
        {
            id: 'auto-looter',
            name: 'Auto Looter',
            description: 'Automatycznie zbiera loot',
            type: 'premium',
            enabled: false,
            favorite: false,
            author: 'Synergy Team',
            version: '1.0',
            hidden: true,
            shortcut: null
        },
        {
            id: 'quest-helper',
            name: 'Quest Helper',
            description: 'Pomocnik zadań',
            type: 'premium',
            enabled: false,
            favorite: false,
            author: 'Synergy Team',
            version: '1.0',
            hidden: true,
            shortcut: null
        },
        {
            id: 'enhanced-stats',
            name: 'Enhanced Stats',
            description: 'Rozszerzone statystyki',
            type: 'free',
            enabled: false,
            favorite: false,
            author: 'Synergy Team',
            version: '1.0',
            hidden: false,
            shortcut: null
        },
        {
            id: 'trade-helper',
            name: 'Trade Helper',
            description: 'Pomocnik handlu',
            type: 'free',
            enabled: false,
            favorite: false,
            author: 'Synergy Team',
            version: '1.0',
            hidden: false,
            shortcut: null
        },
        {
            id: 'combat-log',
            name: 'Combat Log',
            description: 'Rozszerzony log walki',
            type: 'premium',
            enabled: false,
            favorite: false,
            author: 'Synergy Team',
            version: '1.0',
            hidden: true,
            shortcut: null
        }
    ];

    // 🔹 Informacje o wersji
    const VERSION_INFO = {
        version: "3.5",
        releaseDate: "2024-01-22",
        patchNotes: [
            "FIX: Naprawiony suwak czcionki - teraz działa",
            "FIX: Przezroczystość działa na cały panel",
            "FIX: Admin panel generuje klucze i pokazuje listę",
            "FIX: Usunięto zbędne pole 'Dodatki premium'",
            "FIX: Wszystkie suwaki działają poprawnie"
        ]
    };

    // 🔹 Backend URL - Cloudflare Worker
    const BACKEND_URL = 'https://synergy-licenses.lozu-oo.workers.dev';

    // ⭐⭐⭐ ZMIEŃ TUTAJ: wpisz swoje ID konta z gry
    const ADMIN_ACCOUNT_IDS = ['7411461'];

    // ⭐⭐⭐ ZMIEŃ TUTAJ: jeśli w Cloudflare zmieniłeś ADMIN_TOKEN
    const ADMIN_TOKEN = 'SYNERGY_ADMIN_2024_SECRET';

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
            GM_xmlhttpRequest: ({ method, url, onload, onerror, headers, data }) => {
                fetch(url, { 
                    method, 
                    headers, 
                    body: data 
                })
                    .then(response => response.text().then(text => onload({ status: response.status, responseText: text })))
                    .catch(onerror);
            }
        };
    }

    const SW = window.synergyWraith;
    
    // 🔹 Główne zmienne
    let isLicenseVerified = false;
    let userAccountId = null;
    let licenseExpiry = null;
    let licenseData = null;
    let serverConnected = true;
    let currentAddons = [];
    let searchQuery = '';
    let panelShortcut = 'Ctrl+A';
    let isShortcutInputFocused = false;
    let isCheckingLicense = false;
    let isAdmin = false;
    let panelInitialized = false;
    let addonShortcuts = {};
    let shortcutsEnabled = {};

    // =========================================================================
    // 🔹 FUNKCJE ADMINISTRACYJNE
    // =========================================================================

    function checkIfAdmin(accountId) {
        if (!accountId) return false;
        return ADMIN_ACCOUNT_IDS.includes(accountId.toString()) || 
               ADMIN_ACCOUNT_IDS.includes(accountId);
    }

    function toggleAdminTab(show) {
        const adminTab = document.querySelector('.admin-tab');
        if (adminTab) {
            adminTab.style.display = show ? 'flex' : 'none';
        }
        
        const panel = document.getElementById('swAddonsPanel');
        if (panel && show) {
            panel.classList.add('admin-visible');
        } else if (panel) {
            panel.classList.remove('admin-visible');
        }
    }

    // =========================================================================
    // 🔹 FUNKCJE LICENCJI
    // =========================================================================

    async function checkLicenseForAccount(accountId) {
        try {
            const response = await fetch(`${BACKEND_URL}/api/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ accountId: accountId })
            });
            
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            return await response.json();
            
        } catch (error) {
            console.error('❌ Błąd połączenia z serwerem:', error);
            return {
                success: false,
                error: error.message,
                hasLicense: false
            };
        }
    }

    async function activateLicense(licenseKey) {
        try {
            const response = await fetch(`${BACKEND_URL}/api/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    accountId: userAccountId, 
                    licenseKey: licenseKey 
                })
            });
            
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            return await response.json();
            
        } catch (error) {
            console.error('❌ Błąd aktywacji:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // =========================================================================
    // 🔹 FUNKCJE KONTA
    // =========================================================================

    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) return cookieValue;
        }
        return null;
    }

    async function getAccountId() {
        try {
            const cookies = document.cookie;
            const userIdMatch = cookies.match(/user_id=([^;]+)/);
            if (userIdMatch && userIdMatch[1]) return userIdMatch[1];
            
            const charIdMatch = cookies.match(/mchar_id=([^;]+)/);
            if (charIdMatch && charIdMatch[1]) return charIdMatch[1];
        } catch (e) {}
        
        const userId = getCookie('user_id');
        if (userId) return userId;
        
        const mcharId = getCookie('mchar_id');
        if (mcharId) return mcharId;
        
        const savedAccountId = SW.GM_getValue(CONFIG.ACCOUNT_ID);
        if (savedAccountId) return savedAccountId;
        
        const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        SW.GM_setValue(CONFIG.ACCOUNT_ID, tempId);
        return tempId;
    }

    async function initAccountAndLicense() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const accountId = await getAccountId();
        
        if (accountId) {
            userAccountId = accountId;
            SW.GM_setValue(CONFIG.ACCOUNT_ID, accountId);
            
            isAdmin = checkIfAdmin(accountId);
            SW.GM_setValue(CONFIG.ADMIN_ACCESS, isAdmin);
            
            toggleAdminTab(isAdmin);
            updateAccountDisplay(accountId);
            loadAddonsBasedOnLicense([]);
            await checkAndUpdateLicense(accountId);
            
            // Zapisz puste skróty na start
            saveAddonShortcuts();
        } else {
            updateAccountDisplay('Nie znaleziono');
        }
    }

    async function checkAndUpdateLicense(accountId) {
        if (isCheckingLicense) return;
        isCheckingLicense = true;
        
        try {
            const result = await checkLicenseForAccount(accountId);
            
            if (result.success) {
                if (result.hasLicense && !result.expired && !result.used) {
                    isLicenseVerified = true;
                    licenseData = result;
                    licenseExpiry = result.expiry ? new Date(result.expiry) : null;
                    
                    SW.GM_setValue(CONFIG.LICENSE_ACTIVE, true);
                    SW.GM_setValue(CONFIG.LICENSE_EXPIRY, licenseExpiry?.toISOString());
                    SW.GM_setValue(CONFIG.LICENSE_DATA, licenseData);
                    
                    loadAddonsBasedOnLicense(result.addons || ['all']);
                    showLicenseMessage(`Licencja aktywna! Ważna do: ${licenseExpiry ? licenseExpiry.toLocaleDateString('pl-PL') : 'bezterminowo'}`, 'success');
                } else {
                    isLicenseVerified = false;
                    licenseData = null;
                    licenseExpiry = null;
                    
                    SW.GM_setValue(CONFIG.LICENSE_ACTIVE, false);
                    SW.GM_deleteValue(CONFIG.LICENSE_EXPIRY);
                    SW.GM_deleteValue(CONFIG.LICENSE_DATA);
                    
                    loadAddonsBasedOnLicense([]);
                    
                    if (result.expired) {
                        showLicenseMessage('Licencja wygasła. Dostęp tylko do darmowych dodatków.', 'error');
                    } else if (result.used) {
                        showLicenseMessage('Licencja została już użyta. Dostęp tylko do darmowych dodatków.', 'error');
                    } else {
                        showLicenseMessage('Brak aktywnej licencji. Dostęp tylko do darmowych dodatków.', 'info');
                    }
                }
            } else {
                console.error('❌ Błąd licencji:', result.error);
                serverConnected = false;
                
                const savedLicense = SW.GM_getValue(CONFIG.LICENSE_DATA);
                if (savedLicense && savedLicense.hasLicense) {
                    isLicenseVerified = true;
                    licenseData = savedLicense;
                    licenseExpiry = savedLicense.expiry ? new Date(savedLicense.expiry) : null;
                }
            }
        } catch (error) {
            console.error('❌ Błąd:', error);
        } finally {
            isCheckingLicense = false;
            updateLicenseDisplay();
        }
    }

    function loadAddonsBasedOnLicense(allowedAddons = []) {
        const isPremiumAllowed = isLicenseVerified;
        
        currentAddons = ADDONS.filter(addon => {
            const isFree = addon.type === 'free';
            const isPremium = addon.type === 'premium';
            if (isFree) return true;
            if (isPremium && isPremiumAllowed) return true;
            return false;
        }).map(addon => {
            const isFree = addon.type === 'free';
            const isPremium = addon.type === 'premium';
            
            return {
                ...addon,
                enabled: false,
                favorite: addon.favorite || false,
                locked: isPremium && !isPremiumAllowed
            };
        });
        
        restoreAddonsState();
        
        if (document.getElementById('addon-list')) {
            renderAddons();
        }
        
        loadAddonShortcuts();
        loadShortcutsEnabledState();
    }

    function restoreAddonsState() {
        const savedAddons = SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []);
        currentAddons = currentAddons.map(addon => {
            const savedAddon = savedAddons.find(a => a.id === addon.id);
            if (savedAddon && !addon.locked) {
                return {
                    ...addon,
                    enabled: savedAddon.enabled || false,
                    favorite: savedAddon.favorite || false
                };
            }
            return addon;
        });
    }

    function loadAddonShortcuts() {
        addonShortcuts = SW.GM_getValue(CONFIG.SHORTCUTS_CONFIG, {});
    }

    function loadShortcutsEnabledState() {
        shortcutsEnabled = SW.GM_getValue(CONFIG.SHORTCUTS_ENABLED, {});
    }

    function saveAddonShortcuts() {
        SW.GM_setValue(CONFIG.SHORTCUTS_CONFIG, addonShortcuts);
    }

    function saveShortcutsEnabledState() {
        SW.GM_setValue(CONFIG.SHORTCUTS_ENABLED, shortcutsEnabled);
    }

    function showLicenseMessage(message, type = 'info') {
        const messageEl = document.getElementById('swLicenseMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `license-message license-${type}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 5000);
        }
    }

    function updateAccountDisplay(accountId) {
        const accountEl = document.getElementById('swAccountId');
        if (accountEl) {
            accountEl.textContent = accountId;
            accountEl.className = accountId && accountId !== 'Nie znaleziono' ? 
                'license-status-valid' : 'license-status-invalid';
        }
    }

    function updateLicenseDisplay() {
        const statusEl = document.getElementById('swLicenseStatus');
        const expiryEl = document.getElementById('swLicenseExpiry');
        const serverEl = document.getElementById('swServerStatus');
        
        if (statusEl) {
            statusEl.textContent = isLicenseVerified ? 'Aktywna' : 'Nieaktywna';
            statusEl.className = isLicenseVerified ? 'license-status-valid' : 'license-status-invalid';
        }
        
        if (expiryEl) {
            expiryEl.textContent = licenseExpiry ? licenseExpiry.toLocaleDateString('pl-PL') : '-';
        }
        
        if (serverEl) {
            serverEl.textContent = serverConnected ? 'Aktywne' : 'Brak połączenia';
            serverEl.className = serverConnected ? 'license-status-connected' : 'license-status-disconnected';
        }
    }

    // =========================================================================
    // 🔹 CSS - FINAL FIXED VERSION
    // =========================================================================

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
                border: none;
                border-radius: 50%;
                cursor: grab;
                z-index: 1000000;
                box-shadow: 0 0 20px rgba(255, 51, 0, 0.9);
                color: white;
                font-weight: bold;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-shadow: 0 0 5px black;
                transition: all 0.2s ease;
                user-select: none;
                overflow: hidden;
                padding: 0;
            }

            #swPanelToggle img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
                display: block;
            }

            #swPanelToggle.dragging {
                cursor: grabbing;
                transform: scale(1.15);
                box-shadow: 0 0 30px rgba(255, 100, 0, 1.2);
                border: 2px solid #ffcc00;
                z-index: 1000001;
            }

            #swPanelToggle:hover:not(.dragging) {
                transform: scale(1.08);
                box-shadow: 0 0 25px rgba(255, 80, 0, 1);
                cursor: grab;
            }

            @keyframes savePulse {
                0% { box-shadow: 0 0 20px rgba(255, 51, 0, 0.9); }
                50% { box-shadow: 0 0 35px rgba(255, 102, 0, 1.2); transform: scale(1.05); }
                100% { box-shadow: 0 0 20px rgba(255, 51, 0, 0.9); }
            }

            #swPanelToggle.saved { animation: savePulse 1.5s ease-in-out; }

            /* 🔹 MAIN PANEL Z CHWYTAKIEM 🔹 */
            #swAddonsPanel {
                position: fixed;
                top: 140px;
                left: 70px;
                width: 640px;
                height: 580px;
                background: linear-gradient(135deg, #1a0000, #330000, #660000);
                border: 2px solid #ff3300;
                border-radius: 10px;
                color: #ffffff;
                z-index: 999999;
                box-shadow: 0 0 30px rgba(255, 51, 0, 0.8);
                backdrop-filter: blur(10px);
                display: none;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                overflow: hidden;
                min-width: 500px;
                min-height: 400px;
                max-width: 1200px;
                max-height: 900px;
                resize: both;
                font-size: 12px;
            }

            #swAddonsPanel::after {
                content: '';
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 15px;
                height: 15px;
                background: linear-gradient(135deg, transparent 50%, #ff3300 50%);
                cursor: nwse-resize;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }

            #swAddonsPanel:hover::after {
                opacity: 1;
            }

            #swPanelHeader {
                background: linear-gradient(to right, #330000, #660000);
                padding: 12px;
                text-align: center;
                border-bottom: 1px solid #ff3300;
                cursor: grab;
                font-size: 18px;
                font-weight: bold;
                color: #ffcc00;
                text-shadow: 0 0 10px rgba(255, 51, 0, 0.8);
                user-select: none;
            }

            /* 🔹 TABS 🔹 */
            .tab-container {
                display: flex;
                background: linear-gradient(to bottom, #330000, #1a0000);
                border-bottom: 1px solid #ff3300;
                padding: 0 5px;
            }

            .tablink {
                flex: 1;
                background: none;
                border: none;
                outline: none;
                cursor: pointer;
                padding: 12px 5px;
                margin: 0 2px;
                transition: all 0.2s ease;
                color: #ff9966;
                font-weight: 600;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 2px solid transparent;
                position: relative;
            }

            .tablink::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 2px;
                background: #ff3300;
                transition: width 0.3s ease;
            }

            .tablink:hover::before { width: 80%; }
            .tablink.active { color: #ffcc00; text-shadow: 0 0 10px rgba(255, 102, 0, 0.8); }
            .tablink.active::before { width: 100%; background: #ff3300; box-shadow: 0 0 10px rgba(255, 51, 0, 0.8); }
            .tablink:hover:not(.active) { color: #ff6600; text-shadow: 0 0 5px rgba(255, 102, 0, 0.5); }

            /* 🔹 TAB CONTENT 🔹 */
            .tabcontent {
                display: none;
                flex: 1;
                overflow: hidden;
                animation: fadeEffect 0.3s ease;
                flex-direction: column;
            }

            .tabcontent.active {
                display: flex;
            }

            @keyframes fadeEffect {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .sw-tab-content {
                padding: 15px;
                background: rgba(26, 0, 0, 0.9);
                height: calc(100% - 120px);
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }

            /* 🔹 ADDONS LIST 🔹 */
            #addons .sw-tab-content {
                overflow-y: hidden !important;
                overflow-x: hidden !important;
                padding: 10px !important;
            }

            .addon {
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 8px;
                padding: 10px 12px;
                margin-bottom: 8px;
                transition: all 0.3s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-height: 60px;
                box-sizing: border-box;
                cursor: pointer;
            }

            .addon:hover {
                transform: translateY(-3px);
                border-color: #ff4500;
                box-shadow: 0 10px 25px rgba(255, 69, 0, 0.6);
                background: linear-gradient(135deg, rgba(139, 0, 0, 0.9), rgba(255, 69, 0, 0.9));
            }

            .addon-header {
                display: flex;
                flex-direction: column;
                flex: 1;
                min-width: 0;
                overflow: hidden;
            }

            .addon-title {
                font-weight: 600;
                color: #ffcc00;
                font-size: 13px;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
                margin-bottom: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .addon-description {
                color: #ff9966;
                font-size: 11px;
                line-height: 1.3;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .addon-controls {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-shrink: 0;
            }

            /* 🔹 PRZYCISK ULUBIONYCH 🔹 */
            .favorite-btn {
                background: transparent;
                border: none;
                font-size: 20px;
                color: #666666;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                transition: all 0.3s ease;
                width: 26px;
                height: 26px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }

            .favorite-btn:hover {
                color: #ff9900;
                background: rgba(255, 153, 0, 0.1);
            }

            .favorite-btn.favorite {
                color: #ffcc00;
                text-shadow: 0 0 10px rgba(255, 204, 0, 0.8);
            }

            .favorite-btn.favorite:hover {
                color: #ff9900;
            }

            /* 🔹 PRZEŁĄCZNIK DODATKU 🔹 */
            .addon-switch {
                position: relative;
                display: inline-block;
                width: 46px;
                height: 24px;
            }

            .addon-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .addon-switch-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #330000;
                border: 1px solid #660000;
                transition: .4s;
                border-radius: 34px;
            }

            .addon-switch-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 2px;
                background-color: #ff3300;
                transition: .4s;
                border-radius: 50%;
            }

            .addon-switch input:checked + .addon-switch-slider {
                background-color: #006600;
                border-color: #00cc00;
            }

            .addon-switch input:checked + .addon-switch-slider:before {
                transform: translateX(21px);
                background-color: #00ff00;
            }

            .addon-switch input:disabled + .addon-switch-slider {
                background-color: #333333;
                border-color: #666666;
                cursor: not-allowed;
            }

            .addon-switch input:disabled + .addon-switch-slider:before {
                background-color: #666666;
            }

            /* 🔹 SHORTCUTS TAB 🔹 */
            .shortcut-item {
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.3s ease;
            }

            .shortcut-item:hover {
                border-color: #ff4500;
                background: linear-gradient(135deg, rgba(139, 0, 0, 0.9), rgba(255, 69, 0, 0.9));
            }

            .shortcut-info {
                flex: 1;
                min-width: 0;
            }

            .shortcut-name {
                font-weight: 600;
                color: #ffcc00;
                font-size: 12px;
                margin-bottom: 3px;
            }

            .shortcut-desc {
                color: #ff9966;
                font-size: 10px;
            }

            .shortcut-controls {
                display: flex;
                align-items: center;
                gap: 6px;
                flex-shrink: 0;
            }

            .shortcut-display {
                padding: 5px 8px;
                background: rgba(30, 0, 0, 0.8);
                border: 1px solid #660000;
                border-radius: 4px;
                color: #ffcc00;
                font-size: 10px;
                font-weight: bold;
                min-width: 70px;
                text-align: center;
                letter-spacing: 0.5px;
            }

            .shortcut-set-btn {
                padding: 5px 10px;
                background: linear-gradient(to right, #660000, #990000);
                border: 1px solid #ff3300;
                border-radius: 4px;
                color: #ffcc00;
                cursor: pointer;
                font-size: 10px;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .shortcut-set-btn:hover {
                background: linear-gradient(to right, #990000, #cc0000);
                color: #ffffff;
            }

            .shortcut-clear-btn {
                padding: 5px 8px;
                background: linear-gradient(to right, #660000, #990000);
                border: 1px solid #ff3300;
                border-radius: 4px;
                color: #ff9966;
                cursor: pointer;
                font-size: 10px;
                transition: all 0.3s ease;
            }

            .shortcut-clear-btn:hover {
                background: linear-gradient(to right, #990000, #cc0000);
                color: #ffffff;
            }

            /* PRZEŁĄCZNIK DLA SKRÓTU */
            .shortcut-toggle {
                position: relative;
                display: inline-block;
                width: 34px;
                height: 18px;
                margin-left: 5px;
            }

            .shortcut-toggle input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .shortcut-toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #330000;
                border: 1px solid #660000;
                transition: .4s;
                border-radius: 34px;
            }

            .shortcut-toggle-slider:before {
                position: absolute;
                content: "";
                height: 14px;
                width: 14px;
                left: 2px;
                bottom: 1px;
                background-color: #666666;
                transition: .4s;
                border-radius: 50%;
            }

            .shortcut-toggle input:checked + .shortcut-toggle-slider {
                background-color: #006600;
                border-color: #00cc00;
            }

            .shortcut-toggle input:checked + .shortcut-toggle-slider:before {
                transform: translateX(15px);
                background-color: #00ff00;
            }

            /* 🔹 ADMIN SECTION 🔹 */
            .admin-tab {
                display: none !important;
                color: #00ff00 !important;
                font-weight: bold !important;
            }

            .admin-visible .admin-tab {
                display: flex !important;
            }

            /* 🔹 LICENSE SYSTEM 🔹 */
            .license-container {
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 10px;
            }

            .license-header {
                color: #ffcc00;
                font-size: 13px;
                font-weight: bold;
                margin-bottom: 10px;
                border-bottom: 1px solid #ff3300;
                padding-bottom: 5px;
                text-align: center;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
            }

            .license-status-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;
                font-size: 11px;
                padding: 3px 0;
                border-bottom: 1px solid rgba(255, 51, 0, 0.3);
            }

            .license-status-item:last-child { border-bottom: none; margin-bottom: 0; }

            .license-status-label {
                color: #ff9966;
                font-weight: 600;
                white-space: nowrap;
                font-size: 11px;
            }

            .license-status-value {
                font-weight: 600;
                text-align: right;
                color: #ffcc00;
                max-width: 150px;
                word-break: break-all;
                font-size: 11px;
            }

            .license-status-valid { color: #00ff00 !important; text-shadow: 0 0 5px rgba(0, 255, 0, 0.5); }
            .license-status-invalid { color: #ff3300 !important; text-shadow: 0 0 5px rgba(255, 51, 0, 0.5); }
            .license-status-connected { color: #00ff00 !important; text-shadow: 0 0 5px rgba(0, 255, 0, 0.5); }
            .license-status-disconnected { color: #ff3300 !important; text-shadow: 0 0 5px rgba(255, 51, 0, 0.5); }

            /* 🔹 SETTINGS TAB - NAPRAWIONE SUWAKI 🔹 */
            .settings-item {
                margin-bottom: 15px;
                padding: 10px;
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 6px;
                transition: all 0.3s ease;
            }

            .settings-label {
                display: block;
                color: #ffcc00;
                font-size: 12px;
                margin-bottom: 8px;
                font-weight: 600;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
            }

            .shortcut-input-container {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                padding: 0 5px;
            }

            .shortcut-input-label {
                color: #ffcc00;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
            }

            .shortcut-input {
                flex: 1;
                padding: 6px 10px;
                background: rgba(51, 0, 0, 0.8);
                border: 1px solid #660000;
                border-radius: 4px;
                color: #ffcc00;
                font-size: 11px;
                text-align: center;
                width: 90px;
                transition: all 0.3s ease;
                font-weight: bold;
                letter-spacing: 0.5px;
            }

            .shortcut-input:focus {
                outline: none;
                border-color: #ff3300;
                box-shadow: 0 0 10px rgba(255, 51, 0, 0.5);
                background: rgba(102, 0, 0, 0.9);
            }

            .shortcut-set-btn-panel {
                padding: 6px 12px;
                background: linear-gradient(to right, #660000, #990000);
                border: 1px solid #ff3300;
                color: #ffcc00;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .shortcut-set-btn-panel:hover {
                background: linear-gradient(to right, #990000, #cc0000);
                color: #ffffff;
            }

            /* NAPRAWIONE SUWAKI */
            .slider-container {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
            }

            .slider-value {
                min-width: 35px;
                text-align: center;
                color: #ffcc00;
                font-weight: bold;
                font-size: 11px;
            }

            input[type="range"] {
                flex: 1;
                -webkit-appearance: none;
                height: 6px;
                background: linear-gradient(to right, #330000, #660000);
                border-radius: 3px;
                border: 1px solid #660000;
                outline: none;
            }

            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #ff3300;
                cursor: pointer;
                border: 2px solid #ffcc00;
                box-shadow: 0 0 5px rgba(255, 51, 0, 0.8);
            }

            input[type="range"]::-webkit-slider-thumb:hover {
                background: #ff6600;
                transform: scale(1.1);
            }

            input[type="range"]::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #ff3300;
                cursor: pointer;
                border: 2px solid #ffcc00;
                box-shadow: 0 0 5px rgba(255, 51, 0, 0.8);
            }

            /* 🔹 INFO TAB 🔹 */
            .info-container {
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 6px;
                padding: 15px;
                text-align: center;
            }

            .info-header {
                color: #ffcc00;
                font-size: 13px;
                font-weight: bold;
                margin-bottom: 10px;
                border-bottom: 1px solid #ff3300;
                padding-bottom: 5px;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
            }

            .info-content {
                color: #ff9966;
                font-size: 11px;
                line-height: 1.5;
                min-height: 150px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* 🔹 ADMIN PANEL 🔹 */
            #admin .sw-tab-content {
                padding: 8px !important;
                font-size: 11px;
            }

            .admin-section {
                padding: 8px;
                background: rgba(0, 50, 0, 0.2);
                border: 1px solid #00aa00;
                border-radius: 5px;
                margin-bottom: 8px;
            }

            .admin-section h3 {
                color: #00ff00;
                margin-top: 0;
                margin-bottom: 8px;
                font-size: 11px;
                border-bottom: 1px solid #008800;
                padding-bottom: 4px;
            }

            .admin-input-group {
                margin-bottom: 8px;
            }

            .admin-label {
                display: block;
                color: #00cc00;
                font-size: 10px;
                margin-bottom: 3px;
                font-weight: 600;
            }

            .admin-input {
                width: 100%;
                padding: 5px 8px;
                background: rgba(0, 40, 0, 0.8);
                border: 1px solid #008800;
                color: #00ff00;
                border-radius: 3px;
                font-size: 11px;
                box-sizing: border-box;
            }

            .admin-input:focus {
                outline: none;
                border-color: #00ff00;
                box-shadow: 0 0 8px rgba(0, 255, 0, 0.4);
            }

            .admin-button {
                width: 100%;
                padding: 8px;
                background: linear-gradient(to right, #006600, #008800);
                border: 1px solid #00cc00;
                border-radius: 4px;
                color: #ffffff;
                cursor: pointer;
                font-weight: bold;
                font-size: 11px;
                margin-bottom: 6px;
                transition: all 0.3s ease;
            }

            .admin-button:hover {
                background: linear-gradient(to right, #008800, #00aa00);
                border-color: #00ff00;
            }

            .admin-button-secondary {
                background: linear-gradient(to right, #006666, #008888);
                border: 1px solid #00cccc;
            }

            .admin-button-secondary:hover {
                background: linear-gradient(to right, #008888, #00aaaa);
                border-color: #00ffff;
            }

            #adminLicensesContainer {
                max-height: 150px;
                overflow-y: auto !important;
                background: rgba(0, 30, 0, 0.5);
                border-radius: 4px;
                padding: 6px;
                font-size: 10px;
                border: 1px solid #00aa00;
                margin-top: 5px;
            }

            .license-key-item {
                padding: 6px;
                margin-bottom: 5px;
                background: rgba(0, 40, 0, 0.3);
                border-radius: 3px;
                border-left: 3px solid #00aa00;
                font-size: 9px;
            }

            .license-key-item.expired {
                border-left-color: #aa0000;
                background: rgba(40, 0, 0, 0.3);
            }

            .license-key-item.used {
                border-left-color: #ffaa00;
                background: rgba(40, 40, 0, 0.3);
            }

            /* 🔹 PRZYCISK ZAPISZ NA DOLE 🔹 */
            #addons .refresh-button-container {
                position: sticky;
                bottom: 0;
                background: linear-gradient(135deg, rgba(26, 0, 0, 0.95), rgba(51, 0, 0, 0.95));
                padding: 8px 10px;
                margin-top: auto;
                border-top: 1px solid #660000;
                z-index: 10;
                flex-shrink: 0;
            }

            #addons .refresh-button {
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #006600, #008800);
                border: 1px solid #00cc00;
                border-radius: 5px;
                color: #ffffff;
                cursor: pointer;
                font-weight: 600;
                font-size: 12px;
                transition: all 0.3s ease;
            }

            #addons .refresh-button:hover {
                background: linear-gradient(135deg, #008800, #00aa00);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 255, 0, 0.3);
            }

            /* 🔹 PRZEŹROCZYSTOŚĆ CAŁEGO PANELU 🔹 */
            .transparent-panel {
                opacity: 0.9;
            }

            /* 🔹 BADGE 🔹 */
            .premium-badge {
                display: inline-block;
                background: linear-gradient(to right, #ff9900, #ffcc00);
                color: #330000;
                font-size: 9px;
                font-weight: bold;
                padding: 1px 4px;
                border-radius: 3px;
                margin-right: 4px;
                text-shadow: none;
            }

            /* 🔹 MESSAGES 🔹 */
            .license-message {
                padding: 8px 10px;
                border-radius: 4px;
                margin: 8px 0;
                font-size: 10px;
                display: none;
            }

            .license-success {
                background: rgba(0, 255, 0, 0.1);
                border: 1px solid #00ff00;
                color: #00ff00;
            }

            .license-error {
                background: rgba(255, 51, 0, 0.1);
                border: 1px solid #ff3300;
                color: #ff3300;
            }

            .license-info {
                background: rgba(255, 153, 0, 0.1);
                border: 1px solid #ff9900;
                color: #ff9900;
            }

            /* 🔹 HIDDEN SCROLLBAR FOR ADDONS 🔹 */
            #addons .sw-tab-content::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
            }

            #addons .sw-tab-content {
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ CSS injected - FINAL VERSION');
    }

    // 🔹 Tworzenie przycisku przełączania
    function createToggleButton() {
        const oldToggle = document.getElementById('swPanelToggle');
        if (oldToggle) oldToggle.remove();
        
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij dwukrotnie - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
        
        const iconUrl = 'https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/public/icon.jpg';
        toggleBtn.innerHTML = `<img src="${iconUrl}" alt="Synergy" onerror="this.style.display='none'; this.parentNode.innerHTML='S';" />`;
        
        document.body.appendChild(toggleBtn);
        console.log('✅ Toggle button created with icon');
        
        return toggleBtn;
    }

    // 🔹 Tworzenie głównego panelu - POPRAWIONA WERSJA
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        panel.innerHTML = `
            <div id="swPanelHeader">
                <strong>SYNERGY v${VERSION_INFO.version}</strong>
                ${isAdmin ? ' <span style="color:#00ff00; font-size:11px;">(ADMIN)</span>' : ''}
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
                <button class="tablink" data-tab="shortcuts">Skróty</button>
                <button class="tablink" data-tab="license">Licencja</button>
                <button class="tablink" data-tab="settings">Ustawienia</button>
                <button class="tablink" data-tab="info">Info</button>
                <button class="tablink admin-tab" data-tab="admin" style="display:none;">👑 Admin</button>
            </div>

            <!-- ZAKŁADKA DODATKI -->
            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div style="margin-bottom:10px;">
                        <input type="text" id="searchAddons" placeholder="🔍 Wyszukaj dodatki..." 
                               style="width:100%; padding:8px; background:rgba(51,0,0,0.8); border:1px solid #660000; 
                                      border-radius:4px; color:#ffcc00; font-size:11px;">
                    </div>
                    
                    <div class="addon-list" id="addon-list" style="flex:1; overflow-y:auto;">
                        <!-- Lista dodatków będzie dodana dynamicznie -->
                    </div>
                    
                    <div class="refresh-button-container">
                        <button class="refresh-button" id="swSaveAndRestartButton">💾 Zapisz i odśwież grę</button>
                    </div>
                    
                    <div id="swAddonsMessage" class="license-message" style="display: none; font-size: 10px;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA SKRÓTY -->
            <div id="shortcuts" class="tabcontent">
                <div class="sw-tab-content">
                    <div style="margin-bottom:15px; padding:10px; background:linear-gradient(135deg, rgba(51,0,0,0.8), rgba(102,0,0,0.8)); border-radius:6px; border:1px solid #660000;">
                        <h3 style="color:#ffcc00; margin-top:0; margin-bottom:5px; font-size:12px;">🎯 Skróty klawiszowe</h3>
                        <p style="color:#ff9966; font-size:10px; margin:0;">
                            Skróty pokazują się tylko dla włączonych dodatków
                        </p>
                    </div>
                    
                    <div id="shortcuts-list">
                        <!-- Skróty będą dodane dynamicznie -->
                    </div>
                    
                    <div id="shortcutsMessage" class="license-message" style="display:none; margin-top:10px; font-size:10px;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA LICENCJA -->
            <div id="license" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="license-container">
                        <div class="license-header">Status Licencji</div>
                        <div class="license-status-item">
                            <span class="license-status-label">ID Konta:</span>
                            <span id="swAccountId" class="license-status-value">Ładowanie...</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Status:</span>
                            <span id="swLicenseStatus" class="license-status-invalid">Nieaktywna</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Ważna do:</span>
                            <span id="swLicenseExpiry" class="license-status-value">-</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Połączenie:</span>
                            <span id="swServerStatus" class="license-status-connected">Aktywne</span>
                        </div>
                    </div>
                    
                    <!-- SEKCJA AKTYWACJI -->
                    <div class="license-container">
                        <div class="license-header">Aktywacja Licencji</div>
                        
                        <div style="margin:10px 0;">
                            <input type="text" id="licenseKeyInput" 
                                   style="width:100%; padding:6px; background:rgba(30,0,0,0.8); 
                                          border:1px solid #ff3300; border-radius:4px; 
                                          color:#ffffff; font-size:11px; text-align:center;"
                                   placeholder="XXXX-XXXX-XXXX-XXXX">
                        </div>
                        
                        <button id="activateLicenseBtn" 
                                style="width:100%; padding:8px; background:linear-gradient(to right, #006600, #008800);
                                       border:1px solid #00cc00; border-radius:4px; color:#ffffff;
                                       font-size:11px; cursor:pointer; margin: 5px 0;">
                            🔓 Aktywuj Licencję
                        </button>
                        
                        <div id="activationResult" style="display:none; padding:6px; border-radius:4px; margin-top:6px; font-size:10px; text-align:center;"></div>
                    </div>
                    
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>

            <!-- ZAKŁADKA USTAWIENIA - NAPRAWIONE SUWAKI -->
            <div id="settings" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="settings-item">
                        <div class="settings-label">Rozmiar czcionki panelu:</div>
                        <div class="slider-container">
                            <input type="range" min="10" max="16" value="12" class="font-size-slider" id="fontSizeSlider" step="1">
                            <span class="slider-value" id="fontSizeValue">12px</span>
                        </div>
                        <small style="color:#ff9966; font-size:10px;">10-16px</small>
                    </div>
                    
                    <div class="settings-item">
                        <div class="settings-label">Przeźroczystość panelu:</div>
                        <div class="slider-container">
                            <input type="range" min="30" max="100" value="90" class="opacity-slider" id="opacitySlider" step="1">
                            <span class="slider-value" id="opacityValue">90%</span>
                        </div>
                        <small style="color:#ff9966; font-size:10px;">30-100% (cały panel)</small>
                    </div>
                    
                    <div class="settings-item">
                        <div class="shortcut-input-container">
                            <span class="shortcut-input-label">Skrót panelu:</span>
                            <input type="text" class="shortcut-input" id="panelShortcutInput" value="Ctrl+A" readonly>
                            <button class="shortcut-set-btn-panel" id="panelShortcutSetBtn">Ustaw</button>
                        </div>
                        <small style="color:#ff9966; font-size:10px;">Kliknij "Ustaw" i wciśnij kombinację</small>
                    </div>
                    
                    <div style="margin-top:15px; padding-top:10px; border-top:1px solid #660000;">
                        <button style="width:100%; padding:10px; background:linear-gradient(135deg, rgba(51,0,0,0.8), rgba(102,0,0,0.8)); 
                                border:1px solid #660000; border-radius:4px; color:#ff3300; cursor:pointer; font-weight:600; font-size:11px;" 
                                id="swResetButton">
                            ↻ Resetuj ustawienia
                        </button>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top:10px; padding:8px; border-radius:4px; display:none; font-size:10px;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA INFO -->
            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="info-container">
                        <div class="info-header">Synergy Panel v${VERSION_INFO.version}</div>
                        <div class="info-content">
                            <div style="text-align: left; width:100%;">
                                <p style="color:#ff9966; margin:5px 0;"><strong>Data:</strong> ${VERSION_INFO.releaseDate}</p>
                                <h4 style="color:#ffcc00; margin-top:10px; font-size:11px;">Co nowego:</h4>
                                <ul style="color:#ff9966; padding-left:15px; font-size:10px; margin:5px 0;">
                                    ${VERSION_INFO.patchNotes.map(note => `<li>${note}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ZAKŁADKA ADMIN - POPRAWIONA -->
            <div id="admin" class="tabcontent">
                <div class="sw-tab-content">
                    <div style="padding:8px; background:linear-gradient(135deg, rgba(0,51,0,0.8), rgba(0,102,0,0.8)); border:1px solid #00cc00; border-radius:5px; margin-bottom:8px;">
                        <div style="color:#00ff00; font-size:11px; font-weight:bold; text-align:center;">👑 Panel Administratora</div>
                    </div>
                    
                    <!-- SEKCJA TWORZENIA LICENCJI - USUNIĘTE DODATKI PREMIUM -->
                    <div class="admin-section">
                        <h3>➕ Stwórz Nową Licencję</h3>
                        
                        <div class="admin-input-group">
                            <label class="admin-label">Data ważności:</label>
                            <input type="date" id="adminLicenseExpiry" class="admin-input">
                        </div>
                        
                        <div class="admin-input-group">
                            <label class="admin-label">Notatka (opcjonalnie):</label>
                            <input type="text" id="adminLicenseNote" class="admin-input" placeholder="np. Dla gracza XYZ">
                        </div>
                        
                        <button id="adminCreateLicenseBtn" class="admin-button">
                            🎫 Wygeneruj Klucz
                        </button>
                    </div>
                    
                    <!-- WYGENEROWANY KLUCZ -->
                    <div id="adminCreatedLicense" style="display:none; padding:8px; background:rgba(0,60,0,0.5); 
                                                          border-radius:5px; border:1px solid #00ff00; margin-bottom:8px;">
                        <div style="color:#00ff00; font-size:10px; font-weight:bold; margin-bottom:4px; text-align:center;">
                            🎫 Wygenerowany klucz
                        </div>
                        <div style="padding:5px; background:rgba(0,30,0,0.8); border-radius:3px; margin-bottom:3px;">
                            <code id="adminLicenseKeyDisplay" style="color:#00ccff; font-size:10px; word-break:break-all; display:block; text-align:center;"></code>
                        </div>
                    </div>
                    
                    <!-- SEKCJA LISTY LICENCJI -->
                    <div class="admin-section">
                        <h3>📋 Lista Kluczy</h3>
                        
                        <button id="adminListLicensesBtn" class="admin-button admin-button-secondary">
                            🔄 Odśwież Listę
                        </button>
                        
                        <div id="adminLicensesContainer" style="display:none;">
                            <!-- Lista licencji pojawi się tutaj -->
                        </div>
                    </div>
                    
                    <div id="adminMessage" class="license-message" style="display:none; margin-top:8px;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        console.log('✅ Panel created - FINAL VERSION');
        
        initializeEventListeners();
        
        // Ustaw domyślną datę na 30 dni do przodu
        const expiryInput = document.getElementById('adminLicenseExpiry');
        if (expiryInput) {
            const defaultExpiry = new Date();
            defaultExpiry.setDate(defaultExpiry.getDate() + 30);
            expiryInput.value = defaultExpiry.toISOString().split('T')[0];
            expiryInput.min = new Date().toISOString().split('T')[0];
        }
        
        loadSettings();
    }

    // 🔹 NAPRAWIONA funkcja applyFontSize
    function applyFontSize(size) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            // Ogranicz rozmiar
            const clampedSize = Math.max(10, Math.min(16, parseInt(size)));
            
            // Zastosuj do całego panelu
            panel.style.fontSize = clampedSize + 'px';
            
            // Zapisz
            SW.GM_setValue(CONFIG.FONT_SIZE, clampedSize);
            
            // Aktualizuj wyświetlaną wartość
            const fontSizeValue = document.getElementById('fontSizeValue');
            if (fontSizeValue) {
                fontSizeValue.textContent = clampedSize + 'px';
            }
            
            // Aktualizuj suwak
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            if (fontSizeSlider) {
                fontSizeSlider.value = clampedSize;
            }
            
            console.log('✅ Font size changed to:', clampedSize + 'px');
        }
    }

    // 🔹 POPRAWIONA funkcja applyOpacity - DZIAŁA NA CAŁY PANEL
    function applyOpacity(opacity) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            // Ustaw przezroczystość całego panelu
            const opacityValue = Math.max(0.3, Math.min(1, opacity / 100));
            panel.style.opacity = opacityValue.toString();
            
            // Zapisz
            SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, opacity);
            
            console.log('✅ Panel opacity changed to:', opacityValue);
        }
    }

    // 🔹 POPRAWIONA funkcja loadSettings
    function loadSettings() {
        // Rozmiar czcionki
        const savedFontSize = parseInt(SW.GM_getValue(CONFIG.FONT_SIZE, 12));
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.value = savedFontSize;
            fontSizeValue.textContent = savedFontSize + 'px';
            applyFontSize(savedFontSize);
        }
        
        // Przezroczystość
        const savedOpacity = parseInt(SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90));
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        
        if (opacitySlider && opacityValue) {
            opacitySlider.value = savedOpacity;
            opacityValue.textContent = savedOpacity + '%';
            applyOpacity(savedOpacity);
        }
    }

    // 🔹 POPRAWIONA funkcja setupAdminEvents
    function setupAdminEvents() {
        if (!isAdmin) return;
        
        console.log('🔧 Setting up admin events...');
        
        // Stwórz licencję - POPRAWIONE
        const createBtn = document.getElementById('adminCreateLicenseBtn');
        if (createBtn) {
            createBtn.addEventListener('click', async function() {
                const expiry = document.getElementById('adminLicenseExpiry').value;
                const note = document.getElementById('adminLicenseNote').value.trim();
                
                if (!expiry) {
                    showAdminMessage('Wybierz datę ważności!', 'error');
                    return;
                }
                
                const btn = this;
                const originalText = btn.textContent;
                btn.textContent = 'Generuję...';
                btn.disabled = true;
                
                try {
                    const expiryDate = new Date(expiry);
                    const now = new Date();
                    
                    if (expiryDate <= now) {
                        showAdminMessage('Data musi być w przyszłości!', 'error');
                        return;
                    }
                    
                    console.log('📤 Sending request to create license...');
                    
                    const response = await fetch(`${BACKEND_URL}/api/admin/create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${ADMIN_TOKEN}`
                        },
                        body: JSON.stringify({ 
                            expiry: expiry,
                            addons: ['all'], // ZAWSZE wszystkie dodatki
                            note: note || '',
                            days: Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
                        })
                    });
                    
                    console.log('📥 Response status:', response.status);
                    const result = await response.json();
                    console.log('📥 Response data:', result);
                    
                    if (result.success && result.license) {
                        const displayDiv = document.getElementById('adminCreatedLicense');
                        const keyDisplay = document.getElementById('adminLicenseKeyDisplay');
                        
                        keyDisplay.textContent = result.license.key;
                        displayDiv.style.display = 'block';
                        
                        showAdminMessage(`✅ Klucz wygenerowany! Ważny do: ${new Date(expiry).toLocaleDateString('pl-PL')}`, 'success');
                        
                        document.getElementById('adminLicenseNote').value = '';
                        
                        // Automatycznie odśwież listę
                        setTimeout(() => {
                            const listBtn = document.getElementById('adminListLicensesBtn');
                            if (listBtn) listBtn.click();
                        }, 1000);
                        
                    } else {
                        const errorMsg = result.message || result.error || 'Nieznany błąd serwera';
                        showAdminMessage(`❌ Błąd: ${errorMsg}`, 'error');
                    }
                } catch (error) {
                    console.error('❌ Admin create error:', error);
                    showAdminMessage(`❌ Błąd połączenia: ${error.message}`, 'error');
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
        }
        
        // Pokaż wszystkie klucze licencji - POPRAWIONE
        const adminListLicensesBtn = document.getElementById('adminListLicensesBtn');
        if (adminListLicensesBtn) {
            adminListLicensesBtn.addEventListener('click', async function() {
                const container = document.getElementById('adminLicensesContainer');
                container.innerHTML = '<div style="color:#00aa99; text-align:center; padding:10px; font-size:10px;">Ładowanie kluczy...</div>';
                container.style.display = 'block';
                
                const btn = this;
                const originalText = btn.textContent;
                btn.textContent = 'Ładuję...';
                btn.disabled = true;
                
                try {
                    console.log('📤 Fetching licenses list...');
                    
                    const response = await fetch(`${BACKEND_URL}/api/admin/licenses`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${ADMIN_TOKEN}`
                        }
                    });
                    
                    console.log('📥 List response status:', response.status);
                    const result = await response.json();
                    console.log('📥 List response data:', result);
                    
                    if (result.success && result.licenses) {
                        let html = '';
                        
                        if (result.licenses.length > 0) {
                            result.licenses.sort((a, b) => new Date(b.expiry) - new Date(a.expiry));
                            
                            result.licenses.forEach(license => {
                                const expiry = new Date(license.expiry);
                                const now = new Date();
                                const isExpired = expiry < now;
                                const isUsed = license.used || false;
                                
                                let statusColor = '#00ff00';
                                let statusText = 'AKTYWNY';
                                let itemClass = 'license-key-item';
                                
                                if (isUsed) {
                                    statusColor = '#ff9900';
                                    statusText = 'UŻYTY';
                                    itemClass += ' used';
                                } else if (isExpired) {
                                    statusColor = '#ff3300';
                                    statusText = 'WYGASŁY';
                                    itemClass += ' expired';
                                }
                                
                                html += `
                                    <div class="${itemClass}">
                                        <div><strong style="color:#00ff00;">Klucz:</strong> ${license.key}</div>
                                        <div><strong style="color:#00ccff;">Ważny do:</strong> ${expiry.toLocaleDateString('pl-PL')}</div>
                                        <div><strong style="color:#00cc99;">Status:</strong> 
                                            <span style="color:${statusColor}">${statusText}</span>
                                        </div>
                                        ${license.note ? `<div><strong>Notatka:</strong> ${license.note}</div>` : ''}
                                    </div>
                                `;
                            });
                        } else {
                            html = '<div style="color:#00aa99; text-align:center; padding:10px; font-size:10px;">Brak kluczy w bazie</div>';
                        }
                        
                        container.innerHTML = html;
                        showAdminMessage(`Załadowano ${result.licenses?.length || 0} kluczy`, 'success');
                    } else {
                        const errorMsg = result.message || result.error || 'Błąd serwera';
                        container.innerHTML = `<div style="color:#ff6666; text-align:center; padding:10px; font-size:10px;">${errorMsg}</div>`;
                        showAdminMessage('Błąd podczas ładowania kluczy', 'error');
                    }
                } catch (error) {
                    console.error('❌ Admin list error:', error);
                    container.innerHTML = `<div style="color:#ff6666; text-align:center; padding:10px; font-size:10px;">Błąd: ${error.message}</div>`;
                    showAdminMessage(`Błąd połączenia: ${error.message}`, 'error');
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
        }
    }

    function showAdminMessage(text, type = 'info') {
        const messageEl = document.getElementById('adminMessage');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.className = `license-message license-${type}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 5000);
        }
        console.log(`📢 Admin message: ${text}`);
    }

    // 🔹 Inicjalizacja event listenerów
    function initializeEventListeners() {
        console.log('🔧 Initializing event listeners...');
        
        // Aktywacja licencji
        const activateBtn = document.getElementById('activateLicenseBtn');
        if (activateBtn) {
            activateBtn.addEventListener('click', handleLicenseActivation);
        }
        
        // Przycisk zapisz i odśwież
        const saveRestartBtn = document.getElementById('swSaveAndRestartButton');
        if (saveRestartBtn) {
            saveRestartBtn.addEventListener('click', () => {
                saveAddonsState();
                showLicenseMessage('Zapisano ustawienia! Odświeżanie gry...', 'success');
                setTimeout(() => location.reload(), 1500);
            });
        }
        
        // Reset ustawień
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Resetować wszystkie ustawienia?')) resetAllSettings();
            });
        }
        
        // SUWAK CZCIONKI - POPRAWIONE
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.addEventListener('input', function() {
                const size = parseInt(this.value);
                fontSizeValue.textContent = size + 'px';
                applyFontSize(size);
            });
        }
        
        // SUWAK PRZEŹROCZYSTOŚCI - POPRAWIONE
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        if (opacitySlider && opacityValue) {
            opacitySlider.addEventListener('input', function() {
                const opacity = parseInt(this.value);
                opacityValue.textContent = opacity + '%';
                applyOpacity(opacity);
            });
        }
        
        setupPanelShortcutInput();
        setupAdminEvents();
        setupTabs();
        setupDrag();
        setupGlobalShortcuts();
        
        // Wyszukiwanie dodatków
        const searchInput = document.getElementById('searchAddons');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchQuery = this.value.toLowerCase();
                renderAddons();
            });
        }
    }

    // 🔹 Reszta funkcji pozostaje bez zmian (jak w poprzednim kodzie)
    // ... (tutaj wklej pozostałe funkcje z poprzedniego kodu które się nie zmieniły)

    // 🔹 Główne funkcje panelu
    async function initPanel() {
        console.log('✅ Initializing panel v3.5 - FINAL VERSION...');
        
        injectCSS();
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        createToggleButton();
        createMainPanel();
        
        loadSavedState();
        loadAddonShortcuts();
        loadShortcutsEnabledState();
        
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn) {
            setupToggleDrag(toggleBtn);
        }
        
        panelInitialized = true;
        
        setTimeout(async () => {
            await initAccountAndLicense();
            
            if (isAdmin) {
                toggleAdminTab(true);
                console.log('✅ Admin panel enabled for account:', userAccountId);
            }
            
            renderAddons();
            renderShortcuts();
            
            // Automatyczne odświeżanie statusu licencji
            setInterval(() => {
                if (userAccountId) checkAndUpdateLicense(userAccountId);
            }, 5 * 60 * 1000);
        }, 1000);
    }

    // 🔹 Start panelu
    console.log('🎯 Starting Synergy Panel v3.5 - FINAL VERSION...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }
})();