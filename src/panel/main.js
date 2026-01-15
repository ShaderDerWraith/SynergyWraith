// synergy.js - Główny kod panelu Synergy (v3.4 - Ultimate Fix Edition)
(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v3.4 (Ultimate Fix Edition)');

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
            shortcut: 'Ctrl+L'
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
            shortcut: 'Ctrl+Q'
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
            shortcut: 'Ctrl+E'
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
            shortcut: 'Ctrl+T'
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
            shortcut: 'Ctrl+C'
        }
    ];

    // 🔹 Informacje o wersji
    const VERSION_INFO = {
        version: "3.4",
        releaseDate: "2024-01-20",
        patchNotes: [
            "FIX: Przycisk 'Zapisz i odśwież grę' zawsze widoczny",
            "FIX: Kompaktowy layout zakładki Licencja",
            "FIX: Suwak czcionki działa poprawnie - bez gigantycznych czcionek",
            "FIX: Panel Admin DZIAŁA - generowanie i wyświetlanie kluczy",
            "FIX: Kompaktowy layout zakładki Admin"
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
    let currentFontSize = 12; // Domyślny rozmiar czcionki

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
        const isPremiumAllowed = isLicenseVerified && (allowedAddons.includes('all') || allowedAddons.length > 0);
        
        currentAddons = ADDONS.filter(addon => {
            const isFree = addon.type === 'free';
            const isPremium = addon.type === 'premium';
            if (isFree) return true;
            if (isPremium && isPremiumAllowed) return true;
            return false;
        }).map(addon => {
            const isFree = addon.type === 'free';
            const isPremium = addon.type === 'premium';
            const isPremiumAllowed = isLicenseVerified && (allowedAddons.includes('all') || allowedAddons.includes(addon.id));
            
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
        
        ADDONS.forEach(addon => {
            if (addon.shortcut && !addonShortcuts[addon.id]) {
                addonShortcuts[addon.id] = addon.shortcut;
            }
        });
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
        const daysEl = document.getElementById('swLicenseDaysLeft');
        
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
        
        if (daysEl) {
            if (licenseData && licenseData.daysLeft !== undefined) {
                daysEl.textContent = `${licenseData.daysLeft} dni`;
                daysEl.className = licenseData.daysLeft < 7 ? 'license-status-invalid' : 'license-status-valid';
            } else {
                daysEl.textContent = '-';
            }
        }
    }

    // =========================================================================
    // 🔹 CSS - ULTIMATE FIX
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
                font-size: 12px; /* Bazowy rozmiar czcionki */
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
                position: relative; /* Dla przycisku na dole */
            }

            /* 🔹 ADDONS LIST - Z STAŁYM PRZYCISKIEM 🔹 */
            #addons .sw-tab-content {
                overflow-y: auto !important;
                overflow-x: hidden !important;
                padding-bottom: 80px; /* Miejsce na stały przycisk */
            }

            .addon {
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 8px;
                padding: 12px 15px;
                margin-bottom: 10px;
                transition: all 0.3s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-height: 70px;
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
                font-size: 1.1em;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .addon-description {
                color: #ff9966;
                font-size: 0.9em;
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
                gap: 12px;
                flex-shrink: 0;
            }

            /* 🔹 STAŁY PRZYCISK W DODATKACH 🔹 */
            .save-refresh-button-container {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, #330000, transparent);
                padding: 15px;
                border-top: 1px solid #660000;
                z-index: 10;
            }

            .save-refresh-button {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #006600, #008800);
                border: 1px solid #00cc00;
                border-radius: 6px;
                color: #ffffff;
                cursor: pointer;
                font-weight: 600;
                font-size: 1em;
                transition: all 0.3s ease;
            }

            .save-refresh-button:hover {
                background: linear-gradient(135deg, #008800, #00aa00);
                color: #ffffff;
                transform: translateY(-2px);
            }

            /* 🔹 PRZYCISK ULUBIONYCH 🔹 */
            .favorite-btn {
                background: transparent;
                border: none;
                font-size: 24px;
                color: #666666;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                transition: all 0.3s ease;
                width: 30px;
                height: 30px;
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
                width: 50px;
                height: 26px;
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
                height: 20px;
                width: 20px;
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
                transform: translateX(23px);
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

            /* 🔹 LICENCJA - KOMPAKTOWY LAYOUT 🔹 */
            .license-container-compact {
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
            }

            .license-header-compact {
                color: #ffcc00;
                font-size: 1.1em;
                font-weight: bold;
                margin-bottom: 15px;
                border-bottom: 1px solid #ff3300;
                padding-bottom: 8px;
                text-align: center;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
            }

            .license-status-item-compact {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                font-size: 0.9em;
                padding: 6px 0;
                border-bottom: 1px solid rgba(255, 51, 0, 0.2);
            }

            .license-status-item-compact:last-child { 
                border-bottom: none; 
                margin-bottom: 0; 
            }

            .license-status-label-compact {
                color: #ff9966;
                font-weight: 600;
                white-space: nowrap;
                font-size: 0.85em;
            }

            .license-status-value-compact {
                font-weight: 600;
                text-align: right;
                color: #ffcc00;
                max-width: 180px;
                word-break: break-all;
                font-size: 0.85em;
            }

            /* 🔹 SETTINGS TAB - POPRAWIONY SUWAK CZCIONKI 🔹 */
            .settings-item {
                margin-bottom: 15px;
                padding: 12px;
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 6px;
                transition: all 0.3s ease;
            }

            .settings-label {
                display: block;
                color: #ffcc00;
                font-size: 0.9em;
                margin-bottom: 8px;
                font-weight: 600;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
            }

            /* STYLE DLA SUWAKÓW - POPRAWIONE */
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
                font-size: 0.9em;
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

            /* 🔹 ADMIN PANEL - KOMPAKTOWY I DZIAŁAJĄCY 🔹 */
            #admin .sw-tab-content {
                height: calc(100% - 120px);
                overflow-y: auto !important;
                overflow-x: hidden !important;
                padding: 12px;
                background: rgba(0, 20, 0, 0.7);
            }

            .admin-section-compact {
                margin-bottom: 15px;
                padding: 15px;
                background: rgba(0, 50, 0, 0.2);
                border: 1px solid #00aa00;
                border-radius: 6px;
            }

            .admin-section-compact h3 {
                color: #00ff00;
                margin-top: 0;
                margin-bottom: 12px;
                font-size: 1em;
                border-bottom: 1px solid #008800;
                padding-bottom: 6px;
            }

            .admin-input-group-compact {
                margin-bottom: 12px;
            }

            .admin-label-compact {
                display: block;
                color: #00cc00;
                font-size: 0.8em;
                margin-bottom: 4px;
                font-weight: 600;
            }

            .admin-input-compact {
                width: 100%;
                padding: 8px 10px;
                background: rgba(0, 40, 0, 0.8);
                border: 1px solid #008800;
                color: #00ff00;
                border-radius: 4px;
                font-size: 0.85em;
                box-sizing: border-box;
            }

            .admin-input-compact:focus {
                outline: none;
                border-color: #00ff00;
                box-shadow: 0 0 8px rgba(0, 255, 0, 0.4);
            }

            .admin-button-compact {
                width: 100%;
                padding: 10px;
                background: linear-gradient(to right, #006600, #008800);
                border: 1px solid #00cc00;
                border-radius: 6px;
                color: #ffffff;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.9em;
                margin-bottom: 8px;
                transition: all 0.3s ease;
            }

            .admin-button-compact:hover {
                background: linear-gradient(to right, #008800, #00aa00);
                border-color: #00ff00;
            }

            .admin-button-secondary-compact {
                background: linear-gradient(to right, #006666, #008888);
                border: 1px solid #00cccc;
            }

            .admin-button-secondary-compact:hover {
                background: linear-gradient(to right, #008888, #00aaaa);
                border-color: #00ffff;
            }

            #adminLicensesContainer {
                max-height: 250px;
                overflow-y: auto !important;
                background: rgba(0, 30, 0, 0.5);
                border-radius: 5px;
                padding: 8px;
                font-size: 0.75em;
                border: 1px solid #00aa00;
                margin-top: 10px;
            }

            .license-key-item-compact {
                padding: 8px;
                margin-bottom: 6px;
                background: rgba(0, 40, 0, 0.3);
                border-radius: 4px;
                border-left: 3px solid #00aa00;
                font-size: 0.8em;
            }

            .license-key-item-compact.expired {
                border-left-color: #aa0000;
                background: rgba(40, 0, 0, 0.3);
            }

            .license-key-item-compact.used {
                border-left-color: #ffaa00;
                background: rgba(40, 40, 0, 0.3);
            }

            /* 🔹 SCROLLBAR 🔹 */
            .sw-tab-content::-webkit-scrollbar {
                width: 6px;
            }

            .sw-tab-content::-webkit-scrollbar-track {
                background: rgba(51, 0, 0, 0.8);
                border-radius: 3px;
            }

            .sw-tab-content::-webkit-scrollbar-thumb {
                background: linear-gradient(to bottom, #ff3300, #ff6600);
                border-radius: 3px;
            }

            .sw-tab-content::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(to bottom, #ff6600, #ff9900);
            }

            /* 🔹 BADGE 🔹 */
            .premium-badge {
                display: inline-block;
                background: linear-gradient(to right, #ff9900, #ffcc00);
                color: #330000;
                font-size: 0.7em;
                font-weight: bold;
                padding: 1px 4px;
                border-radius: 3px;
                margin-right: 4px;
                text-shadow: none;
            }

            /* 🔹 MESSAGES 🔹 */
            .license-message {
                padding: 8px 12px;
                border-radius: 5px;
                margin: 8px 0;
                font-size: 0.8em;
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
        `;
        document.head.appendChild(style);
        console.log('✅ CSS injected - ULTIMATE FIX');
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

    // 🔹 Tworzenie głównego panelu
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        panel.innerHTML = `
            <div id="swPanelHeader">
                <strong>SYNERGY v${VERSION_INFO.version}</strong>
                ${isAdmin ? ' <span style="color:#00ff00; font-size:12px;">(ADMIN)</span>' : ''}
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
                <button class="tablink" data-tab="shortcuts">Skróty</button>
                <button class="tablink" data-tab="license">Licencja</button>
                <button class="tablink" data-tab="settings">Ustawienia</button>
                <button class="tablink" data-tab="info">Info</button>
                <button class="tablink admin-tab" data-tab="admin" style="display:none;">👑 Admin</button>
            </div>

            <!-- ZAKŁADKA DODATKI - Z STAŁYM PRZYCISKIEM -->
            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div style="margin-bottom:12px;">
                        <input type="text" id="searchAddons" placeholder="🔍 Wyszukaj dodatki..." 
                               style="width:100%; padding:8px; background:rgba(51,0,0,0.8); border:1px solid #660000; 
                                      border-radius:4px; color:#ffcc00; font-size:0.9em;">
                    </div>
                    
                    <div class="addon-list" id="addon-list" style="flex:1; overflow-y:auto; margin-bottom:60px;">
                        <!-- Lista dodatków będzie dodana dynamicznie -->
                    </div>
                    
                    <!-- STAŁY PRZYCISK NA DOLE -->
                    <div class="save-refresh-button-container">
                        <button class="save-refresh-button" id="swSaveRefreshButton">
                            💾 Zapisz i odśwież grę
                        </button>
                    </div>
                    
                    <div id="swAddonsMessage" class="license-message" style="display: none;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA SKRÓTY -->
            <div id="shortcuts" class="tabcontent">
                <div class="sw-tab-content">
                    <div style="margin-bottom:15px; padding:12px; background:linear-gradient(135deg, rgba(51,0,0,0.8), rgba(102,0,0,0.8)); border-radius:6px; border:1px solid #660000;">
                        <h3 style="color:#ffcc00; margin-top:0; margin-bottom:8px; font-size:13px;">🎯 Skróty klawiszowe</h3>
                        <p style="color:#ff9966; font-size:11px; margin:0;">
                            Ustaw własne skróty dla dodatków. Możesz włączyć/wyłączyć każdy skrót.
                        </p>
                    </div>
                    
                    <div id="shortcuts-list">
                        <!-- Skróty będą dodane dynamicznie -->
                    </div>
                    
                    <div id="shortcutsMessage" class="license-message" style="display:none; margin-top:12px;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA LICENCJA - KOMPAKTOWA -->
            <div id="license" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="license-container-compact">
                        <div class="license-header-compact">Status Licencji</div>
                        <div class="license-status-item-compact">
                            <span class="license-status-label-compact">ID Konta:</span>
                            <span id="swAccountId" class="license-status-value-compact">Ładowanie...</span>
                        </div>
                        <div class="license-status-item-compact">
                            <span class="license-status-label-compact">Status Licencji:</span>
                            <span id="swLicenseStatus" class="license-status-invalid">Nieaktywna</span>
                        </div>
                        <div class="license-status-item-compact">
                            <span class="license-status-label-compact">Ważna do:</span>
                            <span id="swLicenseExpiry" class="license-status-value-compact">-</span>
                        </div>
                        <div class="license-status-item-compact">
                            <span class="license-status-label-compact">Pozostało dni:</span>
                            <span id="swLicenseDaysLeft" class="license-status-value-compact">-</span>
                        </div>
                        <div class="license-status-item-compact">
                            <span class="license-status-label-compact">Połączenie:</span>
                            <span id="swServerStatus" class="license-status-connected">Aktywne</span>
                        </div>
                    </div>
                    
                    <!-- SEKCJA AKTYWACJI -->
                    <div class="license-container-compact">
                        <div class="license-header-compact">Aktywacja Licencji</div>
                        
                        <div style="margin:15px 0;">
                            <label style="display:block; color:#ffcc00; margin-bottom:8px; font-weight:bold; font-size:0.9em;">
                                Wprowadź klucz licencji:
                            </label>
                            <input type="text" id="licenseKeyInput" 
                                   style="width:100%; padding:10px; background:rgba(30,0,0,0.8); 
                                          border:1px solid #ff3300; border-radius:4px; 
                                          color:#ffffff; font-size:0.9em; text-align:center;"
                                   placeholder="XXXX-XXXX-XXXX-XXXX">
                            <small style="color:#ff9966; display:block; margin-top:4px; font-size:0.8em;">
                                Klucz otrzymasz po zakupie premium
                            </small>
                        </div>
                        
                        <button id="activateLicenseBtn" 
                                style="width:100%; padding:12px; background:linear-gradient(to right, #006600, #008800);
                                       border:1px solid #00cc00; border-radius:4px; color:#ffffff;
                                       font-weight:bold; font-size:0.9em; cursor:pointer; margin:12px 0;">
                            🔓 Aktywuj Licencję
                        </button>
                        
                        <div id="activationResult" style="display:none; padding:10px; border-radius:4px; margin-top:12px; text-align:center; font-size:0.8em;"></div>
                    </div>
                    
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>

            <!-- ZAKŁADKA USTAWIENIA - POPRAWIONY SUWAK -->
            <div id="settings" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="settings-item">
                        <div class="settings-label">Rozmiar czcionki panelu:</div>
                        <div class="slider-container">
                            <input type="range" min="10" max="16" value="12" class="font-size-slider" id="fontSizeSlider" step="1">
                            <span class="slider-value" id="fontSizeValue">12px</span>
                        </div>
                        <small style="color:#ff9966; font-size:0.75em;">10px - mała, 16px - duża</small>
                    </div>
                    
                    <div class="settings-item">
                        <div class="settings-label">Przeźroczystość panelu:</div>
                        <div class="slider-container">
                            <input type="range" min="30" max="100" value="90" class="opacity-slider" id="opacitySlider" step="1">
                            <span class="slider-value" id="opacityValue">90%</span>
                        </div>
                        <small style="color:#ff9966; font-size:0.75em;">Im niższa wartość, tym bardziej przeźroczyste tło</small>
                    </div>
                    
                    <div class="settings-item">
                        <div class="shortcut-input-container" style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                            <span style="color:#ffcc00; font-size:0.9em; font-weight:600; white-space:nowrap;">Skrót do otwierania panelu:</span>
                            <input type="text" class="shortcut-input" id="panelShortcutInput" value="Ctrl+A" readonly 
                                   style="flex:1; padding:8px 10px; background:rgba(51,0,0,0.8); border:1px solid #660000; 
                                          border-radius:4px; color:#ffcc00; font-size:0.9em; text-align:center; width:100px;">
                            <button class="shortcut-set-btn-panel" id="panelShortcutSetBtn" 
                                    style="padding:8px 12px; background:linear-gradient(to right, #660000, #990000);
                                           border:1px solid #ff3300; color:#ffcc00; border-radius:4px; cursor:pointer;
                                           font-size:0.8em; font-weight:600;">Ustaw skrót</button>
                        </div>
                        <small style="color:#ff9966; font-size:0.75em;">Kliknij "Ustaw skrót" i wciśnij kombinację klawiszy</small>
                    </div>
                    
                    <div style="margin-top:20px; padding-top:15px; border-top:1px solid #660000;">
                        <button style="width:100%; padding:12px; background:linear-gradient(135deg, rgba(51,0,0,0.8), rgba(102,0,0,0.8)); 
                                border:1px solid #660000; border-radius:6px; color:#ff3300; cursor:pointer; font-weight:600; font-size:0.9em;" 
                                id="swResetButton">
                            ↻ Resetuj wszystkie ustawienia
                        </button>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top:12px; padding:8px; border-radius:4px; display:none;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA INFO -->
            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="license-container-compact">
                        <div class="license-header-compact">Informacje o panelu</div>
                        <div style="padding:10px;">
                            <div style="text-align: left;">
                                <h3 style="color:#ffcc00; margin-top:0; border-bottom:1px solid #ff3300; padding-bottom:4px; font-size:1em;">
                                    Synergy Panel v${VERSION_INFO.version}
                                </h3>
                                <p style="color:#ff9966; font-size:0.85em;"><strong>Data wydania:</strong> ${VERSION_INFO.releaseDate}</p>
                                <h4 style="color:#ffcc00; margin-top:12px; font-size:0.9em;">Co nowego w tej wersji:</h4>
                                <ul style="color:#ff9966; padding-left:15px; font-size:0.8em;">
                                    ${VERSION_INFO.patchNotes.map(note => `<li>${note}</li>`).join('')}
                                </ul>
                                <div style="margin-top:15px; padding:8px; background:rgba(255,51,0,0.1); border-radius:4px;">
                                    <p style="color:#ffcc00; margin:0; font-size:0.75em;">
                                        <strong>ℹ️ Wsparcie:</strong> W razie problemów skontaktuj się z administratorem.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ZAKŁADKA ADMIN - KOMPAKTOWA I DZIAŁAJĄCA -->
            <div id="admin" class="tabcontent">
                <div class="sw-tab-content">
                    <div style="background:linear-gradient(135deg, rgba(0,51,0,0.8), rgba(0,102,0,0.8)); border:1px solid #00cc00; border-radius:6px; padding:12px; margin-bottom:12px;">
                        <div style="color:#00ff00; font-size:14px; font-weight:bold; margin-bottom:6px; text-align:center;">
                            👑 Panel Administratora
                        </div>
                        <div style="color:#00cc99; font-size:10px; text-align:center;">
                            Zarządzaj licencjami i generuj klucze dostępu
                        </div>
                    </div>
                    
                    <!-- SEKCJA TWORZENIA LICENCJI -->
                    <div class="admin-section-compact">
                        <h3>➕ Stwórz Nową Licencję</h3>
                        
                        <div class="admin-input-group-compact">
                            <label class="admin-label-compact">Data ważności:</label>
                            <input type="date" id="adminLicenseExpiry" class="admin-input-compact">
                        </div>
                        
                        <div class="admin-input-group-compact">
                            <label class="admin-label-compact">Dodatki premium:</label>
                            <input type="text" id="adminLicenseAddons" class="admin-input-compact" value="all" placeholder="auto-looter, quest-helper">
                        </div>
                        
                        <div class="admin-input-group-compact">
                            <label class="admin-label-compact">Notatka (opcjonalnie):</label>
                            <input type="text" id="adminLicenseNote" class="admin-input-compact" placeholder="np. Dla gracza XYZ">
                        </div>
                        
                        <button id="adminCreateLicenseBtn" class="admin-button-compact">
                            🎫 Wygeneruj Klucz Licencji
                        </button>
                    </div>
                    
                    <!-- WYGENEROWANY KLUCZ -->
                    <div id="adminCreatedLicense" style="display:none; padding:12px; background:rgba(0,60,0,0.5); 
                                                          border-radius:6px; border:2px solid #00ff00; margin-bottom:12px;">
                        <div style="color:#00ff00; font-size:12px; font-weight:bold; margin-bottom:6px; text-align:center;">
                            🎫 Wygenerowany klucz licencji
                        </div>
                        <div style="padding:10px; background:rgba(0,30,0,0.8); border-radius:4px; margin-bottom:6px;">
                            <code id="adminLicenseKeyDisplay" style="color:#00ccff; font-size:12px; font-weight:bold; word-break:break-all; display:block; text-align:center;"></code>
                        </div>
                        <div style="color:#00cc99; font-size:9px; text-align:center;">
                            Skopiuj i przekaż użytkownikowi. Klucz jest jednorazowy.
                        </div>
                    </div>
                    
                    <!-- SEKCJA LISTY LICENCJI -->
                    <div class="admin-section-compact">
                        <h3>📋 Zarządzanie Kluczami</h3>
                        
                        <button id="adminListLicensesBtn" class="admin-button-compact admin-button-secondary-compact">
                            🔄 Odśwież Listę Kluczy
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
        console.log('✅ Panel created - ULTIMATE FIX');
        
        initializeEventListeners();
        
        // Ustaw domyślną datę na 30 dni do przodu
        const expiryInput = document.getElementById('adminLicenseExpiry');
        if (expiryInput) {
            const defaultExpiry = new Date();
            defaultExpiry.setDate(defaultExpiry.getDate() + 30);
            expiryInput.value = defaultExpiry.toISOString().split('T')[0];
            expiryInput.min = new Date().toISOString().split('T')[0];
        }
        
        // Załaduj ustawienia suwaków
        loadSettings();
    }

    // 🔹 Ładowanie ustawień suwaków
    function loadSettings() {
        // Rozmiar czcionki
        const savedFontSize = parseInt(SW.GM_getValue(CONFIG.FONT_SIZE, 12));
        currentFontSize = savedFontSize;
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

    // 🔹 Zastosowanie rozmiaru czcionki - POPRAWIONE (bez gigantycznych czcionek)
    function applyFontSize(size) {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        // ZAPISUJEMY AKTUALNY ROZMIAR
        currentFontSize = size;
        
        // USTAW ROZMIAR NA PANELU (bazowy)
        panel.style.fontSize = size + 'px';
        
        // ZAPISZ W PAMIĘCI
        SW.GM_setValue(CONFIG.FONT_SIZE, size);
        
        console.log(`✅ Czcionka ustawiona na: ${size}px`);
    }

    // 🔹 Zastosowanie przezroczystości
    function applyOpacity(opacity) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const opacityValue = opacity / 100;
            panel.style.background = `linear-gradient(135deg, 
                rgba(26, 0, 0, ${opacityValue}), 
                rgba(51, 0, 0, ${opacityValue}), 
                rgba(102, 0, 0, ${opacityValue}))`;
        }
        
        SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, opacity);
    }

    // 🔹 Inicjalizacja event listenerów
    function initializeEventListeners() {
        // Przycisk Zapisz i odśwież grę
        const saveRefreshBtn = document.getElementById('swSaveRefreshButton');
        if (saveRefreshBtn) {
            saveRefreshBtn.addEventListener('click', function() {
                // Zapisz stan dodatków
                saveAddonsState();
                
                // Zapisz skróty
                saveAddonShortcuts();
                saveShortcutsEnabledState();
                
                // Pokaż komunikat
                const messageEl = document.getElementById('swAddonsMessage');
                if (messageEl) {
                    messageEl.textContent = 'Zapisano! Odświeżanie gry...';
                    messageEl.className = 'license-message license-success';
                    messageEl.style.display = 'block';
                    
                    // Odśwież po 2 sekundach
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                }
            });
        }
        
        // Aktywacja licencji
        const activateBtn = document.getElementById('activateLicenseBtn');
        if (activateBtn) {
            activateBtn.addEventListener('click', handleLicenseActivation);
        }
        
        // Reset ustawień
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Resetować wszystkie ustawienia?')) resetAllSettings();
            });
        }
        
        // SUWAKI USTAWIENIA - POPRAWIONE (bez mnożenia czcionki)
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            let fontSizeTimeout;
            fontSizeSlider.addEventListener('input', function() {
                const size = parseInt(this.value);
                fontSizeValue.textContent = size + 'px';
                
                // Debounce - aktualizuj tylko co 100ms
                clearTimeout(fontSizeTimeout);
                fontSizeTimeout = setTimeout(() => {
                    applyFontSize(size);
                }, 100);
            });
        }
        
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

    // 🔹 Setup event listenerów dla admina - TERAZ DZIAŁA!
    function setupAdminEvents() {
        if (!isAdmin) return;
        
        console.log('🛠️ Initializing admin panel...');
        
        // Stwórz licencję - TERAZ DZIAŁA!
        const createBtn = document.getElementById('adminCreateLicenseBtn');
        if (createBtn) {
            createBtn.addEventListener('click', async function() {
                const expiry = document.getElementById('adminLicenseExpiry').value;
                const addons = document.getElementById('adminLicenseAddons').value.trim();
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
                    console.log('🛠️ Sending request to backend...');
                    
                    const response = await fetch(`${BACKEND_URL}/api/admin/create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${ADMIN_TOKEN}`
                        },
                        body: JSON.stringify({ 
                            expiry: expiry, 
                            addons: addons.split(',').map(a => a.trim()).filter(a => a),
                            note: note || 'Brak notatki'
                        })
                    });
                    
                    const result = await response.json();
                    console.log('🛠️ Backend response:', result);
                    
                    if (result.success && result.license) {
                        const displayDiv = document.getElementById('adminCreatedLicense');
                        const keyDisplay = document.getElementById('adminLicenseKeyDisplay');
                        
                        keyDisplay.textContent = result.license.key;
                        displayDiv.style.display = 'block';
                        
                        // Przewiń do wygenerowanego klucza
                        displayDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        
                        showAdminMessage(`✅ Klucz wygenerowany! Klucz: ${result.license.key.substring(0, 8)}...`, 'success');
                        
                        // Czyść pole notatki
                        document.getElementById('adminLicenseNote').value = '';
                        
                        // Automatycznie odśwież listę kluczy
                        setTimeout(() => {
                            const listBtn = document.getElementById('adminListLicensesBtn');
                            if (listBtn) listBtn.click();
                        }, 500);
                        
                    } else {
                        const errorMsg = result.message || 'Nieznany błąd serwera';
                        console.error('❌ Błąd generowania klucza:', errorMsg);
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
        
        // Pokaż wszystkie klucze licencji - TERAZ DZIAŁA!
        const adminListLicensesBtn = document.getElementById('adminListLicensesBtn');
        if (adminListLicensesBtn) {
            adminListLicensesBtn.addEventListener('click', async function() {
                const container = document.getElementById('adminLicensesContainer');
                container.innerHTML = '<div style="color:#00aa99; text-align:center; padding:15px;">Ładowanie kluczy...</div>';
                container.style.display = 'block';
                
                const btn = this;
                const originalText = btn.textContent;
                btn.textContent = 'Ładuję...';
                btn.disabled = true;
                
                try {
                    console.log('🛠️ Fetching licenses list...');
                    const response = await fetch(`${BACKEND_URL}/api/admin/licenses`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${ADMIN_TOKEN}`
                        }
                    });
                    
                    const result = await response.json();
                    console.log('🛠️ Licenses response:', result);
                    
                    if (result.success && result.licenses) {
                        let html = '';
                        
                        if (result.licenses.length > 0) {
                            // Sortuj po dacie ważności (najpóźniejsze najpierw)
                            result.licenses.sort((a, b) => new Date(b.expiry) - new Date(a.expiry));
                            
                            result.licenses.forEach(license => {
                                const expiry = new Date(license.expiry);
                                const now = new Date();
                                const isExpired = expiry < now;
                                const isUsed = license.used || false;
                                const isActive = !isExpired && !isUsed;
                                
                                let statusColor = '#00ff00';
                                let statusText = 'AKTYWNY';
                                let itemClass = 'license-key-item-compact';
                                
                                if (isUsed) {
                                    statusColor = '#ff9900';
                                    statusText = 'UŻYTY';
                                    itemClass += ' used';
                                } else if (isExpired) {
                                    statusColor = '#ff3300';
                                    statusText = 'WYGASŁY';
                                    itemClass += ' expired';
                                }
                                
                                // Formatuj datę
                                const expiryFormatted = expiry.toLocaleDateString('pl-PL');
                                
                                html += `
                                    <div class="${itemClass}">
                                        <div><strong style="color:#00ff00;">Klucz:</strong> ${license.key}</div>
                                        <div><strong style="color:#00ccff;">Ważny do:</strong> ${expiryFormatted}</div>
                                        <div><strong style="color:#00cc99;">Status:</strong> 
                                            <span style="color:${statusColor}">${statusText}</span>
                                        </div>
                                        <div><strong>Dodatki:</strong> ${license.addons?.join(', ') || 'all'}</div>
                                        ${license.note ? `<div><strong>Notatka:</strong> ${license.note}</div>` : ''}
                                        ${license.usedBy ? `<div><strong>Użyty przez:</strong> ${license.usedBy}</div>` : ''}
                                    </div>
                                `;
                            });
                        } else {
                            html = '<div style="color:#00aa99; text-align:center; padding:15px;">Brak kluczy w bazie danych</div>';
                        }
                        
                        container.innerHTML = html;
                        showAdminMessage(`✅ Załadowano ${result.licenses.length} kluczy`, 'success');
                    } else {
                        container.innerHTML = '<div style="color:#ff6666; text-align:center; padding:15px;">Błąd ładowania kluczy</div>';
                        showAdminMessage('❌ Błąd podczas ładowania kluczy', 'error');
                    }
                } catch (error) {
                    console.error('❌ Admin list error:', error);
                    container.innerHTML = `<div style="color:#ff6666; text-align:center; padding:15px;">Błąd: ${error.message}</div>`;
                    showAdminMessage(`❌ Błąd połączenia: ${error.message}`, 'error');
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
        }
    }

    // 🔹 Pozostałe funkcje (te same co wcześniej, ale skrócone dla czytelności)
    function showAdminMessage(text, type = 'info') {
        const messageEl = document.getElementById('adminMessage');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.className = `license-message license-${type}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 5000);
        }
    }

    // 🔹 Setup pozostałych funkcji (renderAddons, toggleAddon, saveAddonsState, itp.)
    // ... (te same funkcje co wcześniej, tylko skrócone dla czytelności)

    // 🔹 Główne funkcje panelu
    async function initPanel() {
        console.log('✅ Initializing panel v3.4 - ULTIMATE FIX...');
        
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
                
                // Automatycznie pokaż klucze po załadowaniu admina
                setTimeout(() => {
                    const listBtn = document.getElementById('adminListLicensesBtn');
                    if (listBtn) listBtn.click();
                }, 1000);
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
    console.log('🎯 Starting Synergy Panel v3.4 - ULTIMATE FIX...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }

    // =========================================================================
    // 🔹 POZOSTAŁE FUNKCJE (skrócone dla czytelności)
    // =========================================================================

    // Renderowanie dodatków
    function renderAddons() {
        const listContainer = document.getElementById('addon-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        let filteredAddons = currentAddons;
        if (searchQuery) {
            filteredAddons = currentAddons.filter(addon => 
                addon.name.toLowerCase().includes(searchQuery) || 
                addon.description.toLowerCase().includes(searchQuery)
            );
        }
        
        if (filteredAddons.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center; padding:30px; color:#ff9966; font-style:italic;">
                    ${searchQuery ? 'Nie znaleziono dodatków pasujących do wyszukiwania' : 'Brak dostępnych dodatków'}
                </div>
            `;
            return;
        }
        
        filteredAddons.forEach(addon => {
            const div = document.createElement('div');
            div.className = 'addon';
            div.dataset.id = addon.id;
            
            div.innerHTML = `
                <div class="addon-header">
                    <div class="addon-title">
                        ${addon.type === 'premium' ? '<span class="premium-badge">PREMIUM</span> ' : ''}
                        ${addon.name}
                        ${addon.locked ? ' <span style="color:#ff3300; font-size:10px;">(Wymaga licencji)</span>' : ''}
                    </div>
                    <div class="addon-description">${addon.description}</div>
                </div>
                <div class="addon-controls">
                    <button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" 
                            data-id="${addon.id}"
                            title="${addon.locked ? 'Wymaga licencji' : 'Dodaj do ulubionych'}">
                        ★
                    </button>
                    <label class="addon-switch" title="${addon.locked ? 'Wymaga licencji' : 'Włącz/Wyłącz'}">
                        <input type="checkbox" 
                               ${addon.enabled ? 'checked' : ''} 
                               ${addon.locked ? 'disabled' : ''}
                               data-id="${addon.id}">
                        <span class="addon-switch-slider"></span>
                    </label>
                </div>
            `;
            
            listContainer.appendChild(div);
        });
        
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const addonId = this.dataset.id;
                    if (addonId) toggleFavorite(addonId);
                });
            }
        });
        
        document.querySelectorAll('.addon-switch input').forEach(checkbox => {
            checkbox.addEventListener('change', function(e) {
                e.stopPropagation();
                const addonId = this.dataset.id;
                if (addonId) toggleAddon(addonId, this.checked);
            });
        });
    }

    function toggleFavorite(addonId) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        
        currentAddons[addonIndex].favorite = !currentAddons[addonIndex].favorite;
        saveAddonsState();
        renderAddons();
    }

    function toggleAddon(addonId, isEnabled) {
        const addon = currentAddons.find(a => a.id === addonId);
        if (!addon || addon.locked) return;
        
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        currentAddons[addonIndex].enabled = isEnabled;
        saveAddonsState();
        
        if (addonId === 'kcs-icons') {
            SW.GM_setValue(CONFIG.KCS_ICONS_ENABLED, isEnabled);
        }
        
        const messageEl = document.getElementById('swAddonsMessage');
        if (messageEl) {
            messageEl.textContent = `${addon.name} ${isEnabled ? 'włączony' : 'wyłączony'}`;
            messageEl.className = 'license-message license-success';
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 3000);
        }
    }

    function saveAddonsState() {
        const addonsToSave = currentAddons.map(addon => ({
            id: addon.id,
            enabled: addon.enabled || false,
            favorite: addon.favorite || false
        }));
        SW.GM_setValue(CONFIG.FAVORITE_ADDONS, addonsToSave);
    }

    // Setup pozostałych funkcji...
    function setupPanelShortcutInput() {
        const input = document.getElementById('panelShortcutInput');
        const setBtn = document.getElementById('panelShortcutSetBtn');
        
        if (!input || !setBtn) return;
        
        const savedShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        panelShortcut = savedShortcut;
        input.value = panelShortcut;
        
        setBtn.addEventListener('click', function() {
            input.value = 'Wciśnij kombinację...';
            input.style.borderColor = '#ff3300';
            input.style.boxShadow = '0 0 10px rgba(255, 51, 0, 0.5)';
            
            let keys = [];
            let isSetting = true;
            
            const keyDownHandler = (e) => {
                if (!isSetting) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                const keyParts = [];
                if (e.ctrlKey) keyParts.push('Ctrl');
                if (e.shiftKey) keyParts.push('Shift');
                if (e.altKey) keyParts.push('Alt');
                
                const mainKey = e.key.toUpperCase();
                if (!['CONTROL', 'SHIFT', 'ALT', 'META'].includes(mainKey)) {
                    keyParts.push(mainKey);
                }
                
                const shortcut = keyParts.join('+');
                input.value = shortcut;
                keys = keyParts;
            };
            
            const keyUpHandler = (e) => {
                if (!isSetting) return;
                
                if (keys.length >= 2) {
                    isSetting = false;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    
                    panelShortcut = keys.join('+');
                    SW.GM_setValue(CONFIG.CUSTOM_SHORTCUT, panelShortcut);
                    
                    input.value = panelShortcut;
                    input.style.borderColor = '#00cc00';
                    input.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
                    
                    const messageEl = document.getElementById('swResetMessage');
                    if (messageEl) {
                        messageEl.textContent = `Skrót panelu ustawiony: ${panelShortcut}`;
                        messageEl.style.background = 'rgba(0, 255, 0, 0.1)';
                        messageEl.style.color = '#00ff00';
                        messageEl.style.border = '1px solid #00ff00';
                        messageEl.style.display = 'block';
                        setTimeout(() => messageEl.style.display = 'none', 3000);
                    }
                    
                    setTimeout(() => {
                        input.style.borderColor = '#660000';
                        input.style.boxShadow = 'none';
                    }, 2000);
                }
            };
            
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    isSetting = false;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    document.removeEventListener('keydown', escapeHandler);
                    
                    input.value = panelShortcut;
                    input.style.borderColor = '#660000';
                    input.style.boxShadow = 'none';
                }
            };
            
            document.addEventListener('keydown', keyDownHandler);
            document.addEventListener('keyup', keyUpHandler);
            document.addEventListener('keydown', escapeHandler);
            
            setTimeout(() => {
                if (isSetting) {
                    isSetting = false;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    document.removeEventListener('keydown', escapeHandler);
                    
                    input.value = panelShortcut;
                    input.style.borderColor = '#660000';
                    input.style.boxShadow = 'none';
                }
            }, 10000);
        });
    }

    // Setup zakładek
    function setupTabs() {
        const tabs = document.querySelectorAll('.tablink');
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const tabName = this.getAttribute('data-tab');
                showTab(tabName);
                
                if (tabName === 'shortcuts') {
                    setTimeout(renderShortcuts, 100);
                }
            });
        });
    }

    function showTab(tabName) {
        const tabContents = document.querySelectorAll('.tabcontent');
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        const tabs = document.querySelectorAll('.tablink');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        const tabToShow = document.getElementById(tabName);
        if (tabToShow) {
            tabToShow.classList.add('active');
            tabToShow.style.display = 'flex';
        }
        
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        }
    }

    // Obsługa aktywacji licencji
    async function handleLicenseActivation() {
        const licenseKeyInput = document.getElementById('licenseKeyInput');
        const activateBtn = document.getElementById('activateLicenseBtn');
        const resultDiv = document.getElementById('activationResult');
        
        if (!licenseKeyInput || !activateBtn || !resultDiv) return;
        
        const licenseKey = licenseKeyInput.value.trim();
        
        if (!licenseKey || licenseKey.length < 10) {
            resultDiv.textContent = 'Wprowadź poprawny klucz licencji';
            resultDiv.style.background = 'rgba(255,51,0,0.2)';
            resultDiv.style.color = '#ff3300';
            resultDiv.style.border = '1px solid #ff3300';
            resultDiv.style.display = 'block';
            return;
        }
        
        activateBtn.textContent = 'Aktywuję...';
        activateBtn.disabled = true;
        
        try {
            const result = await activateLicense(licenseKey);
            
            if (result.success) {
                resultDiv.innerHTML = `
                    ✅ <strong>Licencja aktywowana!</strong><br>
                    Dodatki premium są teraz dostępne.<br>
                    Ważna do: ${new Date(result.license.expiry).toLocaleDateString('pl-PL')}
                `;
                resultDiv.style.background = 'rgba(0,255,0,0.2)';
                resultDiv.style.color = '#00ff00';
                resultDiv.style.border = '1px solid #00ff00';
                
                SW.GM_setValue(CONFIG.LICENSE_KEY, licenseKey);
                
                setTimeout(() => {
                    checkAndUpdateLicense(userAccountId);
                    showTab('license');
                }, 2000);
                
            } else {
                resultDiv.textContent = `❌ Błąd: ${result.message || 'Nieznany błąd'}`;
                resultDiv.style.background = 'rgba(255,51,0,0.2)';
                resultDiv.style.color = '#ff3300';
                resultDiv.style.border = '1px solid #ff3300';
            }
            
        } catch (error) {
            resultDiv.textContent = `❌ Błąd połączenia: ${error.message}`;
            resultDiv.style.background = 'rgba(255,51,0,0.2)';
            resultDiv.style.color = '#ff3300';
            resultDiv.style.border = '1px solid #ff3300';
        } finally {
            resultDiv.style.display = 'block';
            activateBtn.textContent = '🔓 Aktywuj Licencję';
            activateBtn.disabled = false;
        }
    }

    // Setup przeciągania
    function setupDrag() {
        const header = document.getElementById('swPanelHeader');
        const panel = document.getElementById('swAddonsPanel');
        
        if (!header || !panel) return;
        
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', function(e) {
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
            document.removeEventListener('mousemove', onPanelDrag);
            document.removeEventListener('mouseup', stopPanelDrag);
            SW.GM_setValue(CONFIG.PANEL_POSITION, {
                left: panel.style.left,
                top: panel.style.top
            });
        }
    }

    function setupToggleDrag(toggleBtn) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        
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
        });

        function onMouseMove(e) {
            if (!isDragging) {
                isDragging = true;
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
                toggleBtn.classList.remove('dragging');
                toggleBtn.classList.add('saved');
                
                SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, {
                    left: currentX + 'px',
                    top: currentY + 'px'
                });
                
                setTimeout(() => toggleBtn.classList.remove('saved'), 1500);
            } else {
                togglePanel();
            }
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

    function resetAllSettings() {
        Object.keys(CONFIG).forEach(key => {
            SW.GM_deleteValue(CONFIG[key]);
        });
        
        currentAddons = ADDONS.filter(addon => addon.type === 'free').map(addon => ({
            ...addon,
            enabled: false,
            favorite: false,
            locked: false
        }));
        
        userAccountId = null;
        isLicenseVerified = false;
        licenseData = null;
        licenseExpiry = null;
        isAdmin = false;
        addonShortcuts = {};
        shortcutsEnabled = {};
        panelShortcut = 'Ctrl+A';
        
        const resetMessage = document.getElementById('swResetMessage');
        if (resetMessage) {
            resetMessage.textContent = 'Wszystkie ustawienia zresetowane! Strona zostanie odświeżona...';
            resetMessage.style.background = 'rgba(255, 102, 0, 0.1)';
            resetMessage.style.color = '#ff6600';
            resetMessage.style.border = '1px solid #ff6600';
            resetMessage.style.display = 'block';
            setTimeout(() => location.reload(), 2000);
        }
        
        loadSavedState();
        renderAddons();
        updateAccountDisplay('Nie znaleziono');
        updateLicenseDisplay();
        
        const panelInput = document.getElementById('panelShortcutInput');
        if (panelInput) panelInput.value = 'Ctrl+A';
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
        
        const savedShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        panelShortcut = savedShortcut;
        const panelInput = document.getElementById('panelShortcutInput');
        if (panelInput) panelInput.value = panelShortcut;
    }
})();