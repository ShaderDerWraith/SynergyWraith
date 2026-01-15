// synergy.js - Główny kod panelu Synergy (v3.1.1 - Fixed Admin Edition)
(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v3.1.1 (Fixed Admin Edition)');

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
        SHORTCUTS_CONFIG: "sw_shortcuts_config"
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
        version: "3.1.1",
        releaseDate: "2024-01-20",
        patchNotes: [
            "NAPRAWIONE: Przyciski w zakładce dodatków",
            "NAPRAWIONE: Panel administratora",
            "Dodano datę ważności zamiast dni",
            "Uproszczone zarządzanie kluczami",
            "Dodano scroll w sekcji admin"
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
    let activeCategories = {
        enabled: true,
        disabled: true,
        favorites: true
    };
    let searchQuery = '';
    let panelShortcut = 'Ctrl+A';
    let isShortcutInputFocused = false;
    let shortcutKeys = [];
    let isCheckingLicense = false;
    let isAdmin = false;
    let panelInitialized = false;
    let addonShortcuts = {};

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

    function saveAddonShortcuts() {
        SW.GM_setValue(CONFIG.SHORTCUTS_CONFIG, addonShortcuts);
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
    // 🔹 CSS - Z POPRAWIONYMI PRZYCISKAMI I SCROLLEM
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

            /* 🔹 ADDONS LIST - POPRAWIONE 🔹 */
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
                font-size: 14px;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .addon-description {
                color: #ff9966;
                font-size: 12px;
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

            /* 🔹 PRZYCISK ULUBIONYCH - POPRAWIONY 🔹 */
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

            /* 🔹 PRZEŁĄCZNIK - POPRAWIONY 🔹 */
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

            /* 🔹 SHORTCUTS TAB 🔹 */
            .shortcut-item {
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
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
                font-size: 14px;
                margin-bottom: 5px;
            }

            .shortcut-desc {
                color: #ff9966;
                font-size: 12px;
            }

            .shortcut-input-container {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .shortcut-display {
                padding: 8px 12px;
                background: rgba(30, 0, 0, 0.8);
                border: 1px solid #660000;
                border-radius: 4px;
                color: #ffcc00;
                font-size: 12px;
                font-weight: bold;
                min-width: 100px;
                text-align: center;
                letter-spacing: 1px;
            }

            .shortcut-set-btn {
                padding: 8px 15px;
                background: linear-gradient(to right, #660000, #990000);
                border: 1px solid #ff3300;
                border-radius: 4px;
                color: #ffcc00;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .shortcut-set-btn:hover {
                background: linear-gradient(to right, #990000, #cc0000);
                color: #ffffff;
            }

            .shortcut-clear-btn {
                padding: 8px 12px;
                background: linear-gradient(to right, #660000, #990000);
                border: 1px solid #ff3300;
                border-radius: 4px;
                color: #ff9966;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.3s ease;
            }

            .shortcut-clear-btn:hover {
                background: linear-gradient(to right, #990000, #cc0000);
                color: #ffffff;
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
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .license-header {
                color: #ffcc00;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 20px;
                border-bottom: 1px solid #ff3300;
                padding-bottom: 10px;
                text-align: center;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
            }

            .license-status-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                font-size: 13px;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 51, 0, 0.3);
            }

            .license-status-item:last-child { border-bottom: none; margin-bottom: 0; }

            .license-status-label {
                color: #ff9966;
                font-weight: 600;
                white-space: nowrap;
            }

            .license-status-value {
                font-weight: 600;
                text-align: right;
                color: #ffcc00;
                max-width: 200px;
                word-break: break-all;
                font-size: 13px;
            }

            .license-status-valid { color: #00ff00 !important; text-shadow: 0 0 5px rgba(0, 255, 0, 0.5); }
            .license-status-invalid { color: #ff3300 !important; text-shadow: 0 0 5px rgba(255, 51, 0, 0.5); }
            .license-status-connected { color: #00ff00 !important; text-shadow: 0 0 5px rgba(0, 255, 0, 0.5); }
            .license-status-disconnected { color: #ff3300 !important; text-shadow: 0 0 5px rgba(255, 51, 0, 0.5); }

            /* 🔹 SETTINGS TAB 🔹 */
            .settings-item {
                margin-bottom: 20px;
                padding: 15px;
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 6px;
                transition: all 0.3s ease;
            }

            .settings-label {
                display: block;
                color: #ffcc00;
                font-size: 13px;
                margin-bottom: 10px;
                font-weight: 600;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
            }

            .shortcut-input-container {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 15px;
                padding: 0 10px;
            }

            .shortcut-input-label {
                color: #ffcc00;
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
            }

            .shortcut-input {
                flex: 1;
                padding: 10px 15px;
                background: rgba(51, 0, 0, 0.8);
                border: 1px solid #660000;
                border-radius: 6px;
                color: #ffcc00;
                font-size: 13px;
                text-align: center;
                width: 120px;
                transition: all 0.3s ease;
                font-weight: bold;
                letter-spacing: 1px;
            }

            .shortcut-input:focus {
                outline: none;
                border-color: #ff3300;
                box-shadow: 0 0 10px rgba(255, 51, 0, 0.5);
                background: rgba(102, 0, 0, 0.9);
            }

            .shortcut-set-btn-panel {
                padding: 10px 20px;
                background: linear-gradient(to right, #660000, #990000);
                border: 1px solid #ff3300;
                color: #ffcc00;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .shortcut-set-btn-panel:hover {
                background: linear-gradient(to right, #990000, #cc0000);
                color: #ffffff;
            }

            /* 🔹 INFO TAB 🔹 */
            .info-container {
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 8px;
                padding: 25px;
                text-align: center;
            }

            .info-header {
                color: #ffcc00;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
                border-bottom: 1px solid #ff3300;
                padding-bottom: 10px;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
            }

            .info-content {
                color: #ff9966;
                font-size: 14px;
                line-height: 1.6;
                min-height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .info-placeholder {
                color: #ff9966;
                font-size: 13px;
                font-style: italic;
                opacity: 0.7;
            }

            /* 🔹 ADMIN PANEL Z SCROLLEM 🔹 */
            #admin .sw-tab-content {
                height: calc(100% - 120px);
                overflow-y: auto;
            }

            /* 🔹 SCROLLBAR 🔹 */
            .sw-tab-content::-webkit-scrollbar {
                width: 8px;
            }

            .sw-tab-content::-webkit-scrollbar-track {
                background: rgba(51, 0, 0, 0.8);
                border-radius: 4px;
            }

            .sw-tab-content::-webkit-scrollbar-thumb {
                background: linear-gradient(to bottom, #ff3300, #ff6600);
                border-radius: 4px;
            }

            .sw-tab-content::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(to bottom, #ff6600, #ff9900);
            }

            /* 🔹 BADGE 🔹 */
            .premium-badge {
                display: inline-block;
                background: linear-gradient(to right, #ff9900, #ffcc00);
                color: #330000;
                font-size: 10px;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 4px;
                margin-right: 6px;
                text-shadow: none;
            }

            /* 🔹 MESSAGES 🔹 */
            .license-message {
                padding: 10px 15px;
                border-radius: 6px;
                margin: 10px 0;
                font-size: 12px;
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

            /* 🔹 BUTTONS 🔹 */
            .refresh-button-container {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #660000;
            }

            .refresh-button {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #660000, #990000);
                border: 1px solid #ff3300;
                border-radius: 6px;
                color: #ffcc00;
                cursor: pointer;
                font-weight: 600;
                font-size: 13px;
                transition: all 0.3s ease;
            }

            .refresh-button:hover {
                background: linear-gradient(135deg, #990000, #cc0000);
                color: #ffffff;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ CSS injected with all fixes');
    }

    // 🔹 Tworzenie przycisku przełączania Z IKONĄ
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
                <button class="tablink" data-tab="activate">Aktywuj</button>
                <button class="tablink" data-tab="settings">Ustawienia</button>
                <button class="tablink" data-tab="info">Info</button>
                <button class="tablink admin-tab" data-tab="admin" style="display:none;">👑 Admin</button>
            </div>

            <!-- ZAKŁADKA DODATKI -->
            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div class="search-container">
                        <input type="text" class="search-input" id="searchAddons" placeholder="Wyszukaj dodatki..." 
                               style="width:100%; padding:10px; background:rgba(51,0,0,0.8); border:1px solid #660000; 
                                      border-radius:6px; color:#ffcc00; margin-bottom:15px;">
                    </div>
                    
                    <div class="addon-list" id="addon-list">
                        <!-- Lista dodatków będzie dodana dynamicznie -->
                    </div>
                    
                    <div class="refresh-button-container">
                        <button class="refresh-button" id="swRefreshButton">Odśwież Panel</button>
                    </div>
                    
                    <div id="swAddonsMessage" class="license-message" style="display: none;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA SKRÓTY -->
            <div id="shortcuts" class="tabcontent">
                <div class="sw-tab-content">
                    <div style="margin-bottom:20px; padding:15px; background:linear-gradient(135deg, rgba(51,0,0,0.8), rgba(102,0,0,0.8)); border-radius:8px; border:1px solid #660000;">
                        <h3 style="color:#ffcc00; margin-top:0; margin-bottom:10px; font-size:14px;">🎯 Skróty klawiszowe do dodatków</h3>
                        <p style="color:#ff9966; font-size:12px; margin:0;">
                            Ustaw własne skróty klawiszowe dla każdego dodatku. Kliknij "Ustaw skrót" i wciśnij kombinację klawiszy.
                        </p>
                    </div>
                    
                    <div id="shortcuts-list">
                        <!-- Skróty będą dodane dynamicznie -->
                    </div>
                    
                    <div id="shortcutsMessage" class="license-message" style="display:none; margin-top:15px;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA LICENCJA -->
            <div id="license" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="license-container">
                        <div class="license-header">Status Licencji</div>
                        <div class="license-status-item">
                            <span class="license-status-label">ID Konta:</span>
                            <span id="swAccountId" class="license-status-value">Szukam ID konta...</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Status Licencji:</span>
                            <span id="swLicenseStatus" class="license-status-invalid">Nieaktywna</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Ważna do:</span>
                            <span id="swLicenseExpiry" class="license-status-value">-</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Pozostało dni:</span>
                            <span id="swLicenseDaysLeft" class="license-status-value">-</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Połączenie:</span>
                            <span id="swServerStatus" class="license-status-connected">Aktywne</span>
                        </div>
                    </div>
                    
                    <div style="padding:15px; background:rgba(255,51,0,0.1); border-radius:6px; margin:15px 0;">
                        <strong style="color:#ffcc00;">ℹ️ Informacja:</strong>
                        <p style="margin:5px 0; color:#ff9966; font-size:12px;">
                            Premium dodatki pojawią się automatycznie po uzyskaniu licencji.<br>
                            System automatycznie sprawdza status co 5 minut.
                        </p>
                    </div>
                    
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>

            <!-- ZAKŁADKA AKTYWUJ -->
            <div id="activate" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="license-container">
                        <div class="license-header">Aktywacja Licencji</div>
                        
                        <div style="margin:20px 0;">
                            <label style="display:block; color:#ffcc00; margin-bottom:10px; font-weight:bold;">
                                Wprowadź klucz licencji:
                            </label>
                            <input type="text" id="licenseKeyInput" 
                                   style="width:100%; padding:12px; background:rgba(30,0,0,0.8); 
                                          border:1px solid #ff3300; border-radius:6px; 
                                          color:#ffffff; font-size:14px; text-align:center;"
                                   placeholder="XXXX-XXXX-XXXX-XXXX">
                            <small style="color:#ff9966; display:block; margin-top:5px;">
                                Klucz otrzymasz po zakupie premium
                            </small>
                        </div>
                        
                        <button id="activateLicenseBtn" 
                                style="width:100%; padding:15px; background:linear-gradient(to right, #006600, #008800);
                                       border:1px solid #00cc00; border-radius:6px; color:#ffffff;
                                       font-weight:bold; font-size:14px; cursor:pointer; margin:15px 0;">
                            🔓 Aktywuj Licencję
                        </button>
                        
                        <div id="activationResult" style="display:none; padding:15px; border-radius:6px; margin-top:15px; text-align:center; font-size:13px;"></div>
                    </div>
                </div>
            </div>

            <!-- ZAKŁADKA USTAWIENIA -->
            <div id="settings" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="settings-item">
                        <div class="font-size-container">
                            <label class="settings-label">Rozmiar czcionki panelu:</label>
                            <input type="range" min="10" max="18" value="12" class="font-size-slider" id="fontSizeSlider">
                            <span class="font-size-value" id="fontSizeValue">12px</span>
                        </div>
                    </div>
                    
                    <div class="settings-item">
                        <div class="opacity-container">
                            <label class="settings-label">Przeźroczystość panelu:</label>
                            <input type="range" min="30" max="100" value="90" class="opacity-slider" id="opacitySlider">
                            <span class="opacity-value" id="opacityValue">90%</span>
                        </div>
                    </div>
                    
                    <div class="settings-item">
                        <div class="shortcut-input-container">
                            <span class="shortcut-input-label">Skrót do otwierania panelu:</span>
                            <input type="text" class="shortcut-input" id="panelShortcutInput" value="Ctrl+A" readonly>
                            <button class="shortcut-set-btn-panel" id="panelShortcutSetBtn">Ustaw skrót</button>
                        </div>
                    </div>
                    
                    <div style="margin-top:25px; padding-top:20px; border-top:1px solid #660000;">
                        <button style="width:100%; padding:14px; background:linear-gradient(135deg, rgba(51,0,0,0.8), rgba(102,0,0,0.8)); 
                                border:1px solid #660000; border-radius:6px; color:#ff3300; cursor:pointer; font-weight:600; font-size:14px;" 
                                id="swResetButton">
                            ↻ Resetuj wszystkie ustawienia
                        </button>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top:15px; padding:12px; border-radius:6px; display:none;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA INFO -->
            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="info-container">
                        <div class="info-header">Informacje o panelu</div>
                        <div class="info-content">
                            <div style="text-align: left;">
                                <h3 style="color:#ffcc00; margin-top:0;">Wersja ${VERSION_INFO.version}</h3>
                                <p style="color:#ff9966;">Data wydania: ${VERSION_INFO.releaseDate}</p>
                                <h4 style="color:#ffcc00;">Co nowego:</h4>
                                <ul style="color:#ff9966; padding-left:20px;">
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
                    <div style="background:linear-gradient(135deg, rgba(0,51,0,0.8), rgba(0,102,0,0.8)); border:1px solid #00cc00; border-radius:8px; padding:20px; margin-bottom:20px;">
                        <div style="color:#00ff00; font-size:16px; font-weight:bold; margin-bottom:15px; text-align:center;">
                            👑 Panel Administratora
                        </div>
                        <div style="color:#00cc99; font-size:12px; text-align:center; margin-bottom:15px;">
                            Zarządzaj licencjami i generuj klucze dostępu
                        </div>
                    </div>
                    
                    <div style="margin-bottom:20px; padding:20px; background:rgba(0,50,0,0.2); border:1px solid #00aa00; border-radius:8px;">
                        <h3 style="color:#00ff00; margin-top:0; margin-bottom:15px;">➕ Stwórz Nową Licencję</h3>
                        
                        <div style="margin-bottom:15px;">
                            <label style="display:block; color:#00cc00; font-size:12px; margin-bottom:5px;">Data ważności:</label>
                            <input type="date" id="adminLicenseExpiry" 
                                   style="width:100%; padding:10px; background:rgba(0,40,0,0.8); border:1px solid #008800; color:#00ff00; border-radius:4px;">
                        </div>
                        
                        <div style="margin-bottom:15px;">
                            <label style="display:block; color:#00cc00; font-size:12px; margin-bottom:5px;">Dodatki premium (oddzielone przecinkiem):</label>
                            <input type="text" id="adminLicenseAddons" placeholder="auto-looter, quest-helper, combat-log"
                                   style="width:100%; padding:10px; background:rgba(0,40,0,0.8); border:1px solid #008800; color:#00ff00; border-radius:4px;"
                                   value="all">
                        </div>
                        
                        <div style="margin-bottom:20px;">
                            <label style="display:block; color:#00cc00; font-size:12px; margin-bottom:5px;">Notatka (opcjonalnie):</label>
                            <input type="text" id="adminLicenseNote" placeholder="np. Dla gracza XYZ"
                                   style="width:100%; padding:10px; background:rgba(0,40,0,0.8); border:1px solid #008800; color:#00ff00; border-radius:4px;">
                        </div>
                        
                        <button id="adminCreateLicenseBtn" 
                                style="width:100%; padding:12px; background:linear-gradient(to right, #006600, #008800); 
                                       border:1px solid #00cc00; border-radius:6px; color:#ffffff; cursor:pointer; 
                                       font-weight:bold; margin-bottom:15px;">
                            🎫 Wygeneruj Klucz Licencji
                        </button>
                    </div>
                    
                    <div id="adminCreatedLicense" style="display:none; padding:20px; background:rgba(0,60,0,0.5); 
                                                          border-radius:8px; border:2px solid #00ff00; margin-bottom:20px;">
                        <div style="color:#00ff00; font-size:14px; font-weight:bold; margin-bottom:10px; text-align:center;">
                            🎫 Wygenerowany klucz licencji
                        </div>
                        <div style="padding:15px; background:rgba(0,30,0,0.8); border-radius:6px; margin-bottom:10px;">
                            <code id="adminLicenseKeyDisplay" style="color:#00ccff; font-size:16px; font-weight:bold; word-break:break-all; display:block; text-align:center;"></code>
                        </div>
                        <div style="color:#00cc99; font-size:11px; text-align:center;">
                            Skopiuj i przekaż użytkownikowi. Klucz jest jednorazowy.
                        </div>
                    </div>
                    
                    <div style="margin-bottom:15px;">
                        <button id="adminListLicensesBtn" 
                                style="width:100%; padding:12px; background:linear-gradient(to right, #006666, #008888); 
                                       border:1px solid #00cccc; border-radius:6px; color:#ffffff; cursor:pointer;
                                       font-weight:bold; font-size:14px;">
                            📋 Pokaż Wszystkie Klucze Licencji
                        </button>
                    </div>
                    
                    <div id="adminLicensesContainer" style="max-height:350px; overflow-y:auto; 
                                                             background:rgba(0,30,0,0.5); border-radius:5px; padding:10px; 
                                                             font-size:11px; display:none; border:1px solid #00aa00;">
                        <!-- Lista licencji pojawi się tutaj -->
                    </div>
                    
                    <div id="adminMessage" class="license-message" style="display:none; margin-top:15px;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        console.log('✅ Panel created with fixed admin section');
        
        initializeEventListeners();
        
        // Ustaw domyślną datę na 30 dni do przodu
        const expiryInput = document.getElementById('adminLicenseExpiry');
        if (expiryInput) {
            const defaultExpiry = new Date();
            defaultExpiry.setDate(defaultExpiry.getDate() + 30);
            expiryInput.value = defaultExpiry.toISOString().split('T')[0];
        }
    }

    // 🔹 Renderowanie listy skrótów
    function renderShortcuts() {
        const container = document.getElementById('shortcuts-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const addonsWithShortcuts = currentAddons.filter(addon => 
            addon.shortcut || addon.id in addonShortcuts || !addon.locked
        );
        
        if (addonsWithShortcuts.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:30px; color:#ff9966; font-style:italic;">
                    Brak dodatków z możliwością ustawienia skrótów
                </div>
            `;
            return;
        }
        
        addonsWithShortcuts.forEach(addon => {
            const shortcut = addonShortcuts[addon.id] || addon.shortcut || 'Brak skrótu';
            const isLocked = addon.locked;
            
            const item = document.createElement('div');
            item.className = 'shortcut-item';
            item.innerHTML = `
                <div class="shortcut-info">
                    <div class="shortcut-name">
                        ${addon.type === 'premium' ? '<span class="premium-badge">PREMIUM</span> ' : ''}
                        ${addon.name}
                        ${isLocked ? ' <span style="color:#ff3300; font-size:10px;">(Wymaga licencji)</span>' : ''}
                    </div>
                    <div class="shortcut-desc">${addon.description}</div>
                </div>
                <div class="shortcut-input-container">
                    <div class="shortcut-display" id="shortcut-display-${addon.id}">
                        ${isLocked ? 'Zablokowane' : shortcut}
                    </div>
                    ${!isLocked ? `
                        <button class="shortcut-set-btn" data-id="${addon.id}">Ustaw skrót</button>
                        <button class="shortcut-clear-btn" data-id="${addon.id}">Wyczyść</button>
                    ` : ''}
                </div>
            `;
            
            container.appendChild(item);
        });
        
        document.querySelectorAll('.shortcut-set-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const addonId = this.dataset.id;
                setAddonShortcut(addonId);
            });
        });
        
        document.querySelectorAll('.shortcut-clear-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const addonId = this.dataset.id;
                clearAddonShortcut(addonId);
            });
        });
    }

    // 🔹 Ustawianie skrótu dla dodatku
    function setAddonShortcut(addonId) {
        const display = document.getElementById(`shortcut-display-${addonId}`);
        if (!display) return;
        
        display.textContent = 'Wciśnij kombinację...';
        display.style.color = '#ffcc00';
        display.style.borderColor = '#ff3300';
        
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
            display.textContent = shortcut;
            keys = keyParts;
        };
        
        const keyUpHandler = (e) => {
            if (!isSetting) return;
            
            if (keys.length >= 2) {
                isSetting = false;
                document.removeEventListener('keydown', keyDownHandler);
                document.removeEventListener('keyup', keyUpHandler);
                
                const shortcut = keys.join('+');
                addonShortcuts[addonId] = shortcut;
                saveAddonShortcuts();
                
                display.textContent = shortcut;
                display.style.color = '#00ff00';
                display.style.borderColor = '#00cc00';
                
                showShortcutMessage(`Skrót ustawiony: ${shortcut}`, 'success');
                
                setTimeout(() => {
                    display.style.color = '#ffcc00';
                    display.style.borderColor = '#660000';
                }, 2000);
            }
        };
        
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                isSetting = false;
                document.removeEventListener('keydown', keyDownHandler);
                document.removeEventListener('keyup', keyUpHandler);
                document.removeEventListener('keydown', escapeHandler);
                
                const oldShortcut = addonShortcuts[addonId] || ADDONS.find(a => a.id === addonId)?.shortcut || 'Brak skrótu';
                display.textContent = oldShortcut;
                display.style.color = '#ffcc00';
                display.style.borderColor = '#660000';
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
                
                const oldShortcut = addonShortcuts[addonId] || ADDONS.find(a => a.id === addonId)?.shortcut || 'Brak skrótu';
                display.textContent = oldShortcut;
                display.style.color = '#ffcc00';
                display.style.borderColor = '#660000';
                
                showShortcutMessage('Czas na ustawienie skrótu minął', 'error');
            }
        }, 10000);
    }

    // 🔹 Czyszczenie skrótu
    function clearAddonShortcut(addonId) {
        delete addonShortcuts[addonId];
        saveAddonShortcuts();
        
        const display = document.getElementById(`shortcut-display-${addonId}`);
        if (display) {
            const defaultShortcut = ADDONS.find(a => a.id === addonId)?.shortcut || 'Brak skrótu';
            display.textContent = defaultShortcut;
        }
        
        showShortcutMessage('Skrót wyczyszczony', 'info');
    }

    function showShortcutMessage(message, type) {
        const messageEl = document.getElementById('shortcutsMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `license-message license-${type}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 3000);
        }
    }

    // 🔹 Ustawianie skrótu panelu
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

    // 🔹 Obsługa skrótów klawiszowych
    function setupGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            const panelShortcutParts = panelShortcut.split('+');
            const hasCtrl = panelShortcutParts.includes('Ctrl');
            const hasShift = panelShortcutParts.includes('Shift');
            const hasAlt = panelShortcutParts.includes('Alt');
            const key = panelShortcutParts[panelShortcutParts.length - 1].toUpperCase();
            
            const ctrlMatch = hasCtrl ? e.ctrlKey : !e.ctrlKey;
            const shiftMatch = hasShift ? e.shiftKey : !e.shiftKey;
            const altMatch = hasAlt ? e.altKey : !e.altKey;
            const keyMatch = e.key.toUpperCase() === key;
            
            if (ctrlMatch && shiftMatch && altMatch && keyMatch && !isShortcutInputFocused) {
                e.preventDefault();
                togglePanel();
                return;
            }
            
            Object.keys(addonShortcuts).forEach(addonId => {
                const shortcut = addonShortcuts[addonId];
                if (!shortcut) return;
                
                const parts = shortcut.split('+');
                const sHasCtrl = parts.includes('Ctrl');
                const sHasShift = parts.includes('Shift');
                const sHasAlt = parts.includes('Alt');
                const sKey = parts[parts.length - 1].toUpperCase();
                
                const sCtrlMatch = sHasCtrl ? e.ctrlKey : !e.ctrlKey;
                const sShiftMatch = sHasShift ? e.shiftKey : !e.shiftKey;
                const sAltMatch = sHasAlt ? e.altKey : !e.altKey;
                const sKeyMatch = e.key.toUpperCase() === sKey;
                
                if (sCtrlMatch && sShiftMatch && sAltMatch && sKeyMatch && !isShortcutInputFocused) {
                    e.preventDefault();
                    const addon = currentAddons.find(a => a.id === addonId);
                    if (addon && !addon.locked) {
                        toggleAddon(addonId, !addon.enabled);
                        showShortcutMessage(`${addon.name} ${addon.enabled ? 'wyłączony' : 'włączony'} (${shortcut})`, 'info');
                    }
                }
            });
        });
    }

    // 🔹 Inicjalizacja event listenerów
    function initializeEventListeners() {
        const activateBtn = document.getElementById('activateLicenseBtn');
        if (activateBtn) {
            activateBtn.addEventListener('click', handleLicenseActivation);
        }
        
        const refreshBtn = document.getElementById('swRefreshButton');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (confirm('Odświeżyć stronę?')) location.reload();
            });
        }
        
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Resetować wszystkie ustawienia?')) resetAllSettings();
            });
        }
        
        setupPanelShortcutInput();
        setupAdminEvents();
        setupTabs();
        setupDrag();
        setupGlobalShortcuts();
    }

    // 🔹 Setup zakładek
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

    // 🔹 Obsługa aktywacji licencji
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
                    showTab('addons');
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

    // 🔹 Setup event listenerów dla admina - POPRAWIONY
    function setupAdminEvents() {
        if (!isAdmin) return;
        
        // Stwórz licencję
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
                    
                    if (result.success && result.license) {
                        const displayDiv = document.getElementById('adminCreatedLicense');
                        const keyDisplay = document.getElementById('adminLicenseKeyDisplay');
                        
                        keyDisplay.textContent = result.license.key;
                        displayDiv.style.display = 'block';
                        
                        displayDiv.scrollIntoView({ behavior: 'smooth' });
                        
                        showAdminMessage(`✅ Klucz wygenerowany pomyślnie! Ważny do: ${new Date(expiry).toLocaleDateString('pl-PL')}`, 'success');
                        
                        // Czyść pola
                        document.getElementById('adminLicenseNote').value = '';
                        
                        // Automatycznie odśwież listę kluczy po 1 sekundzie
                        setTimeout(() => {
                            if (document.getElementById('adminLicensesContainer').style.display === 'block') {
                                adminListLicensesBtn.click();
                            }
                        }, 1000);
                        
                    } else {
                        showAdminMessage(`❌ Błąd: ${result.message || 'Nieznany błąd'}`, 'error');
                    }
                } catch (error) {
                    console.error('Admin create error:', error);
                    showAdminMessage(`❌ Błąd serwera: ${error.message}`, 'error');
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
        }
        
        // Pokaż wszystkie klucze licencji
        const adminListLicensesBtn = document.getElementById('adminListLicensesBtn');
        if (adminListLicensesBtn) {
            adminListLicensesBtn.addEventListener('click', async function() {
                const container = document.getElementById('adminLicensesContainer');
                container.innerHTML = '<div style="color:#00aa99; text-align:center; padding:20px;">Ładowanie kluczy...</div>';
                container.style.display = 'block';
                
                try {
                    const response = await fetch(`${BACKEND_URL}/api/admin/licenses`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${ADMIN_TOKEN}`
                        }
                    });
                    
                    const result = await response.json();
                    
                    if (result.success && result.licenses) {
                        let html = `
                            <div style="color:#00ff00; font-weight:bold; margin-bottom:10px; border-bottom:1px solid #00aa00; padding-bottom:5px;">
                                Wszystkie klucze licencji (${result.licenses.length}):
                            </div>
                        `;
                        
                        if (result.licenses.length > 0) {
                            // Sortuj po dacie ważności (najpóźniejsze najpierw)
                            result.licenses.sort((a, b) => new Date(b.expiry) - new Date(a.expiry));
                            
                            result.licenses.forEach(license => {
                                const expiry = new Date(license.expiry);
                                const now = new Date();
                                const isExpired = expiry < now;
                                const isUsed = license.used || false;
                                const isActive = !isExpired && !isUsed;
                                
                                html += `
                                    <div style="padding:10px; margin-bottom:8px; background:rgba(0,40,0,0.3); border-radius:4px; border:1px solid ${isActive ? '#00aa00' : (isUsed ? '#ffaa00' : '#aa0000')};">
                                        <div><strong style="color:#00ff00;">Klucz:</strong> ${license.key}</div>
                                        <div><strong style="color:#00ccff;">Ważny do:</strong> ${expiry.toLocaleDateString('pl-PL')} ${isExpired ? '<span style="color:#ff3300;">(WYGASŁ)</span>' : ''}</div>
                                        <div><strong style="color:#00cc99;">Status:</strong> 
                                            <span style="color:${isActive ? '#00ff00' : (isUsed ? '#ff9900' : '#ff3300')}">
                                                ${isActive ? 'AKTYWNY' : (isUsed ? 'UŻYTY' : 'WYGASŁY')}
                                            </span>
                                        </div>
                                        <div><strong>Dodatki:</strong> ${license.addons?.join(', ') || 'all'}</div>
                                        ${license.note ? `<div><strong>Notatka:</strong> ${license.note}</div>` : ''}
                                        ${license.usedBy ? `<div><strong>Użyty przez:</strong> ${license.usedBy}</div>` : ''}
                                        ${license.activatedAt ? `<div><strong>Aktywowano:</strong> ${new Date(license.activatedAt).toLocaleDateString('pl-PL')}</div>` : ''}
                                    </div>
                                `;
                            });
                        } else {
                            html += '<div style="color:#00aa99; text-align:center; padding:20px;">Brak kluczy w bazie danych</div>';
                        }
                        
                        container.innerHTML = html;
                        showAdminMessage(`Załadowano ${result.licenses.length} kluczy`, 'success');
                    } else {
                        container.innerHTML = '<div style="color:#ff6666; text-align:center; padding:20px;">Błąd ładowania kluczy</div>';
                        showAdminMessage('Błąd podczas ładowania kluczy', 'error');
                    }
                } catch (error) {
                    console.error('Admin list error:', error);
                    container.innerHTML = `<div style="color:#ff6666; text-align:center; padding:20px;">Błąd: ${error.message}</div>`;
                    showAdminMessage(`Błąd połączenia: ${error.message}`, 'error');
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
    }

    // 🔹 Renderowanie dodatków - POPRAWIONE
    function renderAddons() {
        const listContainer = document.getElementById('addon-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        if (currentAddons.length === 0) {
            listContainer.innerHTML = '<div style="text-align:center; padding:40px; color:#ff9966; font-style:italic;">Brak dostępnych dodatków</div>';
            return;
        }
        
        currentAddons.forEach(addon => {
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
                    <div style="color:#ff9966; font-size:10px; margin-top:3px;">
                        Autor: ${addon.author} | Wersja: ${addon.version}
                    </div>
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
        
        // Event listenery dla przycisków
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
        
        // Pokaż komunikat
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

    // 🔹 Setup przeciągania
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

    // 🔹 Setup przeciągania przycisku
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

    // 🔹 Toggle panelu
    function togglePanel() {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const isVisible = panel.style.display === 'block';
            panel.style.display = isVisible ? 'none' : 'block';
            SW.GM_setValue(CONFIG.PANEL_VISIBLE, !isVisible);
        }
    }

    // 🔹 Reset wszystkich ustawień
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
        renderShortcuts();
        updateAccountDisplay('Nie znaleziono');
        updateLicenseDisplay();
        
        const panelInput = document.getElementById('panelShortcutInput');
        if (panelInput) panelInput.value = 'Ctrl+A';
    }

    // 🔹 Ładowanie zapisanego stanu
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

    // 🔹 Główne funkcje panelu
    async function initPanel() {
        console.log('✅ Initializing panel v3.1.1...');
        
        injectCSS();
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        createToggleButton();
        createMainPanel();
        
        loadSavedState();
        loadAddonShortcuts();
        
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn) {
            setupToggleDrag(toggleBtn);
        }
        
        panelInitialized = true;
        
        setTimeout(async () => {
            await initAccountAndLicense();
            
            if (isAdmin) {
                toggleAdminTab(true);
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
    console.log('🎯 Starting Synergy Panel v3.1.1...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }
})();