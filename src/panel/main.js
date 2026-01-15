// synergy.js - Główny kod panelu Synergy (v3.0 - Fixed CSS & Admin Panel)
(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v3.0 (Fixed CSS & Admin Panel)');

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
        LICENSE_KEY: "sw_license_key"
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
            hidden: true
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
            hidden: true
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
            hidden: true
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
            hidden: false
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
            hidden: false
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
            hidden: true
        }
    ];

    // 🔹 Informacje o wersji
    const VERSION_INFO = {
        version: "3.0",
        releaseDate: "2024-01-18",
        patchNotes: [
            "Premium dodatki ukryte od początku",
            "Panel admina tylko dla wybranych ID",
            "Nowy system licencji z Cloudflare",
            "System aktywacji przez klucze",
            "Automatyczne sprawdzanie ważności"
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
    let customShortcut = 'Ctrl+A';
    let isShortcutInputFocused = false;
    let shortcutKeys = [];
    let isCheckingLicense = false;
    let isAdmin = false;
    let panelInitialized = false;

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
        const panel = document.getElementById('swAddonsPanel');
        
        if (adminTab) {
            adminTab.style.display = show ? 'flex' : 'none';
        }
        
        if (panel && show) {
            panel.classList.add('admin-visible');
        } else if (panel) {
            panel.classList.remove('admin-visible');
        }
        
        console.log(show ? '👑 Panel admina AKTYWOWANY' : '👤 Panel admina WYŁĄCZONY');
    }

    function forceAdminPanel() {
        console.log('🔓 Wymuszanie panelu admina...');
        isAdmin = true;
        toggleAdminTab(true);
        
        // Dodaj zakładkę jeśli nie istnieje
        if (!document.querySelector('.admin-tab')) {
            addAdminTab();
        }
        
        showLicenseMessage('Panel administratora WYMUSZONY', 'success');
    }

    // =========================================================================
    // 🔹 FUNKCJE LICENCJI
    // =========================================================================

    async function checkLicenseForAccount(accountId) {
        try {
            console.log(`📡 Sprawdzam licencję dla: ${accountId}`);
            
            const response = await fetch(`${BACKEND_URL}/api/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ accountId: accountId })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📡 Odpowiedź z serwera:', result);
            
            return result;
            
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
            console.log(`🔑 Aktywuję licencję: ${licenseKey}`);
            
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
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('🔑 Wynik aktywacji:', result);
            
            return result;
            
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
            if (cookieName === name) {
                return cookieValue;
            }
        }
        return null;
    }

    async function getAccountId() {
        console.log('🔍 Szukam ID konta...');
        
        try {
            const cookies = document.cookie;
            
            const userIdMatch = cookies.match(/user_id=([^;]+)/);
            if (userIdMatch && userIdMatch[1]) {
                console.log('✅ Znaleziono user_id:', userIdMatch[1]);
                return userIdMatch[1];
            }
            
            const charIdMatch = cookies.match(/mchar_id=([^;]+)/);
            if (charIdMatch && charIdMatch[1]) {
                console.log('✅ Znaleziono mchar_id:', charIdMatch[1]);
                return charIdMatch[1];
            }
        } catch (e) {
            console.log('⚠️ Błąd cookies:', e);
        }
        
        const userId = getCookie('user_id');
        if (userId) return userId;
        
        const mcharId = getCookie('mchar_id');
        if (mcharId) return mcharId;
        
        const savedAccountId = SW.GM_getValue(CONFIG.ACCOUNT_ID);
        if (savedAccountId) {
            console.log('✅ Znaleziono zapisane ID:', savedAccountId);
            return savedAccountId;
        }
        
        console.log('⚠️ Generuję tymczasowe ID');
        const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        SW.GM_setValue(CONFIG.ACCOUNT_ID, tempId);
        return tempId;
    }

    async function initAccountAndLicense() {
        console.log('🔐 Inicjalizacja konta i licencji...');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const accountId = await getAccountId();
        
        if (accountId) {
            console.log('🎮 TWOJE ID KONTA:', accountId);
            
            userAccountId = accountId;
            SW.GM_setValue(CONFIG.ACCOUNT_ID, accountId);
            
            isAdmin = checkIfAdmin(accountId);
            SW.GM_setValue(CONFIG.ADMIN_ACCESS, isAdmin);
            
            console.log(isAdmin ? '👑 Jesteś administratorem!' : '👤 Jesteś zwykłym użytkownikiem');
            
            toggleAdminTab(isAdmin);
            
            updateAccountDisplay(accountId);
            
            loadAddonsBasedOnLicense([]);
            
            await checkAndUpdateLicense(accountId);
            
        } else {
            console.log('⚠️ Nie znaleziono ID konta');
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
                    
                    console.log('✅ Licencja aktywna do:', licenseExpiry);
                    
                    loadAddonsBasedOnLicense(result.addons || ['all']);
                    
                    showLicenseMessage(`Licencja aktywna! Ważna do: ${licenseExpiry ? licenseExpiry.toLocaleDateString('pl-PL') : 'bezterminowo'}`, 'success');
                    
                } else {
                    isLicenseVerified = false;
                    licenseData = null;
                    licenseExpiry = null;
                    
                    SW.GM_setValue(CONFIG.LICENSE_ACTIVE, false);
                    SW.GM_deleteValue(CONFIG.LICENSE_EXPIRY);
                    SW.GM_deleteValue(CONFIG.LICENSE_DATA);
                    
                    console.log('⚠️ Brak licencji:', result.message);
                    
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
                    console.log('⚠️ Używam zapisanych danych (offline)');
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
        console.log('🔓 Ładowanie dodatków według licencji:', allowedAddons);
        
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

    function updateAccountDisplay(accountId) {
        const accountEl = document.getElementById('swAccountId');
        if (accountEl) {
            accountEl.textContent = accountId;
            if (accountId && accountId !== 'Nie znaleziono') {
                accountEl.classList.remove('license-status-invalid');
                accountEl.classList.add('license-status-valid');
            } else {
                accountEl.classList.remove('license-status-valid');
                accountEl.classList.add('license-status-invalid');
            }
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
            if (licenseExpiry) {
                expiryEl.textContent = licenseExpiry.toLocaleDateString('pl-PL');
            } else {
                expiryEl.textContent = '-';
            }
        }
        
        if (serverEl) {
            serverEl.textContent = serverConnected ? 'Aktywne' : 'Brak połączenia';
            serverEl.className = serverConnected ? 'license-status-connected' : 'license-status-disconnected';
        }
        
        if (daysEl && licenseData && licenseData.daysLeft !== undefined) {
            daysEl.textContent = `${licenseData.daysLeft} dni`;
            daysEl.className = licenseData.daysLeft < 7 ? 'license-status-invalid' : 'license-status-valid';
        } else if (daysEl) {
            daysEl.textContent = '-';
        }
    }

    // =========================================================================
    // 🔹 CSS - PEŁNE STYLE
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
                background: linear-gradient(135deg, #ff3300, #ff6600, #ff9900);
                border: 2px solid #ff3300;
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

            /* 🔹 MAIN PANEL 🔹 */
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
                min-width: 640px;
                max-width: 900px;
                min-height: 580px;
                max-height: 800px;
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

            /* 🔹 SW-TAB-CONTENT - KONTENER ZAWARTOŚCI 🔹 */
            .sw-tab-content {
                padding: 15px;
                background: rgba(26, 0, 0, 0.9);
                height: calc(100% - 120px);
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }

            /* 🔹 ADDONS LIST 🔹 */
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

            /* 🔹 FAVORITE STAR 🔹 */
            .favorite-btn {
                background: none;
                border: none;
                color: #ff9966;
                cursor: pointer;
                padding: 4px;
                font-size: 16px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 3px;
                width: 22px;
                height: 22px;
            }

            .favorite-btn:hover { color: #ffcc00; transform: scale(1.3); }
            .favorite-btn.favorite { color: #ffcc00; text-shadow: 0 0 8px rgba(255, 204, 0, 0.7); }

            /* 🔹 SWITCH 🔹 */
            .addon-switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
                flex-shrink: 0;
            }

            .addon-switch input { opacity: 0; width: 0; height: 0; }

            .addon-switch-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #660000;
                transition: .3s;
                border-radius: 24px;
                border: 1px solid #990000;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .addon-switch-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background: linear-gradient(135deg, #ff6600, #ff3300);
                transition: .3s;
                border-radius: 50%;
                box-shadow: 0 0 5px rgba(255, 51, 0, 0.5);
            }

            .addon-switch input:checked + .addon-switch-slider {
                background-color: #330000;
                border-color: #ff3300;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 51, 0, 0.3);
            }

            .addon-switch input:checked + .addon-switch-slider:before {
                transform: translateX(26px);
                background: linear-gradient(135deg, #ffcc00, #ff9900);
                box-shadow: 0 0 8px rgba(255, 204, 0, 0.8);
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

            /* 🔹 SEARCH BAR 🔹 */
            .search-container { margin-bottom: 15px; position: relative; }
            .search-input {
                width: 100%;
                padding: 10px 15px;
                background: rgba(51, 0, 0, 0.8);
                border: 1px solid #660000;
                border-radius: 6px;
                color: #ffcc00;
                font-size: 13px;
                transition: all 0.3s ease;
                box-sizing: border-box;
                text-align: center;
            }

            .search-input:focus {
                outline: none;
                border-color: #ff3300;
                box-shadow: 0 0 15px rgba(255, 51, 0, 0.5);
                background: rgba(102, 0, 0, 0.9);
            }

            /* 🔹 CATEGORY FILTERS 🔹 */
            .category-filters {
                display: flex;
                justify-content: space-between;
                gap: 8px;
                margin-bottom: 15px;
                background: rgba(38, 0, 0, 0.8);
                border: 1px solid #660000;
                border-radius: 6px;
                padding: 12px;
            }

            .category-filter-item {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
                padding: 6px 12px;
                background: rgba(51, 0, 0, 0.6);
                border-radius: 4px;
                transition: all 0.3s ease;
                gap: 8px;
            }

            .category-filter-label {
                display: flex;
                align-items: center;
                color: #ffcc00;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
            }

            .category-switch {
                position: relative;
                display: inline-block;
                width: 32px;
                height: 16px;
                flex-shrink: 0;
            }

            .category-switch input { opacity: 0; width: 0; height: 0; }

            .category-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #660000;
                transition: .3s;
                border-radius: 16px;
                border: 1px solid #990000;
            }

            .category-slider:before {
                position: absolute;
                content: "";
                height: 12px;
                width: 12px;
                left: 2px;
                bottom: 2px;
                background: linear-gradient(135deg, #ff6600, #ff3300);
                transition: .3s;
                border-radius: 50%;
                box-shadow: 0 0 4px rgba(255, 51, 0, 0.5);
            }

            .category-switch input:checked + .category-slider {
                background-color: #330000;
                border-color: #ff3300;
            }

            .category-switch input:checked + .category-slider:before {
                transform: translateX(16px);
                background: linear-gradient(135deg, #ffcc00, #ff9900);
                box-shadow: 0 0 6px rgba(255, 204, 0, 0.8);
            }

            /* 🔹 ADDON LIST CONTAINER 🔹 */
            .addon-list {
                flex: 1;
                overflow-y: auto;
                margin-bottom: 15px;
                padding-right: 5px;
                scroll-behavior: smooth;
            }

            .addon-list::-webkit-scrollbar { width: 6px; }
            .addon-list::-webkit-scrollbar-track { background: rgba(51, 0, 0, 0.8); border-radius: 3px; }
            .addon-list::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #ff3300, #ff6600); border-radius: 3px; }
            .addon-list::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #ff6600, #ff9900); }

            .addon-list-empty {
                text-align: center;
                color: #ff9966;
                font-size: 13px;
                padding: 30px 10px;
                font-style: italic;
                background: rgba(51, 0, 0, 0.5);
                border-radius: 6px;
                margin: 10px 0;
            }

            /* 🔹 REFRESH BUTTON 🔹 */
            .refresh-button-container {
                flex-shrink: 0;
                text-align: center;
                margin-top: auto;
                padding: 10px;
                border-top: 1px solid #660000;
                background: rgba(26, 0, 0, 0.9);
                position: sticky;
                bottom: 0;
                z-index: 10;
            }

            .refresh-button {
                padding: 10px 30px;
                background: linear-gradient(to right, #660000, #990000);
                color: #ffcc00;
                border: 1px solid #ff3300;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 13px;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
                min-width: 150px;
            }

            .refresh-button:hover {
                background: linear-gradient(to right, #990000, #cc0000);
                color: #ffffff;
                transform: translateY(-1px);
                box-shadow: 0 3px 10px rgba(255, 51, 0, 0.3);
            }

            /* 🔹 ZABLOKOWANE DODATKI 🔹 */
            .addon.locked {
                opacity: 0.6;
                background: linear-gradient(135deg, rgba(30, 0, 0, 0.8), rgba(50, 0, 0, 0.8)) !important;
                border: 1px solid #330000 !important;
            }

            .addon.locked:hover {
                transform: none !important;
                box-shadow: none !important;
                border: 1px solid #330000 !important;
                cursor: not-allowed !important;
            }

            .premium-badge {
                background: linear-gradient(135deg, #ff3300, #ff6600);
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
                margin-right: 5px;
                vertical-align: middle;
            }

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

            .font-size-container, .opacity-container {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 15px;
            }

            .font-size-slider, .opacity-slider {
                flex: 1;
                -webkit-appearance: none;
                height: 8px;
                background: #660000;
                border-radius: 4px;
                outline: none;
                margin: 0 15px;
            }

            .font-size-slider::-webkit-slider-thumb, .opacity-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #ff6600, #ff3300);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 0 5px rgba(255, 51, 0, 0.5);
                transition: all 0.3s ease;
            }

            .font-size-value, .opacity-value {
                color: #ffcc00;
                font-weight: bold;
                font-size: 14px;
                min-width: 40px;
                text-align: center;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
            }

            /* 🔹 LICENSE MESSAGE 🔹 */
            .license-message {
                margin-top: 15px;
                padding: 12px;
                border-radius: 6px;
                font-size: 13px;
                text-align: center;
                border: 1px solid;
                display: none;
            }

            .license-success {
                background: rgba(0, 100, 0, 0.2);
                color: #00ff00;
                border-color: #00ff00;
                box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
            }

            .license-error {
                background: rgba(100, 0, 0, 0.2);
                color: #ff3300;
                border-color: #ff3300;
                box-shadow: 0 0 10px rgba(255, 51, 0, 0.3);
            }

            .license-info {
                background: rgba(0, 50, 100, 0.2);
                color: #00aaff;
                border-color: #00aaff;
                box-shadow: 0 0 10px rgba(0, 170, 255, 0.3);
            }

            /* 🔹 ADMIN SECTION - NIE WIDOCZNE DLA NORMALNYCH UŻYTKOWNIKÓW 🔹 */
            .admin-tab {
                display: none !important;
                color: #00ff00 !important;
                font-weight: bold !important;
            }

            .admin-visible .admin-tab {
                display: flex !important;
            }

            /* 🔹 INFO TAB 🔹 */
            .info-container {
                background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
                border: 1px solid #660000;
                border-radius: 8px;
                padding: 25px;
            }

            .info-header {
                color: #ffcc00;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
                border-bottom: 1px solid #ff3300;
                padding-bottom: 10px;
                text-align: center;
                text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
            }

            .info-patch-notes {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .info-patch-notes li {
                color: #ff9966;
                font-size: 13px;
                margin-bottom: 10px;
                padding-left: 0;
                position: relative;
                line-height: 1.5;
                display: flex;
                align-items: flex-start;
            }

            .info-patch-notes li:before {
                content: "•";
                color: #ff3300;
                font-size: 18px;
                font-weight: bold;
                margin-right: 10px;
                flex-shrink: 0;
                display: inline-block;
                line-height: 1.5;
            }

            .info-footer {
                color: #ff9966;
                font-size: 12px;
                text-align: center;
                margin-top: 25px;
                padding-top: 15px;
                border-top: 1px solid #660000;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ CSS injected (pełne style)');
    }

    // 🔹 Tworzenie przycisku przełączania
    function createToggleButton() {
        const oldToggle = document.getElementById('swPanelToggle');
        if (oldToggle) oldToggle.remove();
        
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij dwukrotnie - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
        toggleBtn.innerHTML = `<span>S</span>`;
        document.body.appendChild(toggleBtn);
        
        return toggleBtn;
    }

    // 🔹 Tworzenie głównego panelu
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        // HTML panelu - ZAWIERA WSZYSTKIE ZAKŁADKI
        panel.innerHTML = `
            <div id="swPanelHeader">
                <strong>SYNERGY v${VERSION_INFO.version}</strong>
                ${isAdmin ? ' <span style="color:#00ff00; font-size:12px;">(ADMIN)</span>' : ''}
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
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
                        <input type="text" class="search-input" id="searchAddons" placeholder="Wyszukaj dodatki...">
                    </div>
                    
                    <div class="category-filters">
                        <div class="category-filter-item">
                            <div class="category-filter-label"><span>Włączone</span></div>
                            <label class="category-switch">
                                <input type="checkbox" id="filter-enabled" checked>
                                <span class="category-slider"></span>
                            </label>
                        </div>
                        <div class="category-filter-item">
                            <div class="category-filter-label"><span>Wyłączone</span></div>
                            <label class="category-switch">
                                <input type="checkbox" id="filter-disabled" checked>
                                <span class="category-slider"></span>
                            </label>
                        </div>
                        <div class="category-filter-item">
                            <div class="category-filter-label"><span>Ulubione</span></div>
                            <label class="category-switch">
                                <input type="checkbox" id="filter-favorites" checked>
                                <span class="category-slider"></span>
                            </label>
                        </div>
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
                    
                    <div class="license-info-container" style="padding:15px; background:rgba(255,51,0,0.1); border-radius:6px; margin:15px 0;">
                        <strong>ℹ️ Informacja:</strong>
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
                        
                        <div style="margin: 20px 0;">
                            <label style="display: block; color:#ffcc00; margin-bottom: 10px; font-weight: bold;">
                                Wprowadź klucz licencji:
                            </label>
                            <input type="text" id="licenseKeyInput" 
                                   style="width: 100%; padding: 12px; background: rgba(30,0,0,0.8); 
                                          border: 1px solid #ff3300; border-radius: 6px; 
                                          color: #ffffff; font-size: 14px; text-align: center;"
                                   placeholder="XXXX-XXXX-XXXX-XXXX">
                            <small style="color:#ff9966; display: block; margin-top: 5px;">
                                Klucz otrzymasz po zakupie premium
                            </small>
                        </div>
                        
                        <button id="activateLicenseBtn" 
                                style="width: 100%; padding: 15px; background: linear-gradient(to right, #006600, #008800);
                                       border: 1px solid #00cc00; border-radius: 6px; color: #ffffff;
                                       font-weight: bold; font-size: 14px; cursor: pointer; margin: 15px 0;">
                            🔓 Aktywuj Licencję
                        </button>
                        
                        <div id="activationResult" style="display: none; padding: 15px; border-radius: 6px; 
                                                           margin-top: 15px; text-align: center; font-size: 13px;">
                        </div>
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
                    
                    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #660000;">
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
                        <div class="info-header">Historia zmian v${VERSION_INFO.version}</div>
                        <ul class="info-patch-notes">
                            ${VERSION_INFO.patchNotes.map(note => `<li>${note}</li>`).join('')}
                        </ul>
                        <div class="info-footer">
                            © 2024 Synergy Panel • Wszelkie prawa zastrzeżone
                        </div>
                    </div>
                </div>
            </div>

            <!-- ZAKŁADKA ADMIN (Tylko dla adminów) -->
            <div id="admin" class="tabcontent">
                <div class="sw-tab-content">
                    <div style="background: linear-gradient(135deg, rgba(0,51,0,0.8), rgba(0,102,0,0.8)); border:1px solid #00cc00; border-radius:8px; padding:20px;">
                        <div style="color:#00ff00; font-size:16px; font-weight:bold; margin-bottom:20px; border-bottom:1px solid #00cc00; padding-bottom:10px; text-align:center;">
                            👑 Panel Administratora
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:13px; padding:8px 0; border-bottom:1px solid rgba(0,255,0,0.3);">
                            <span style="color:#00ff00; font-weight:600;">Twoje ID:</span>
                            <span id="swAdminAccountId" style="font-weight:600; color:#00ff00;">${userAccountId || 'Ładowanie...'}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:13px; padding:8px 0;">
                            <span style="color:#00ff00; font-weight:600;">Status:</span>
                            <span style="font-weight:600; color:#00ff00;">Administrator</span>
                        </div>
                    </div>
                    
                    <div style="margin:20px 0; padding:20px; background:rgba(0,50,0,0.2); border:1px solid #00aa00; border-radius:8px;">
                        <h3 style="color:#00ff00; margin-top:0; margin-bottom:15px;">➕ Stwórz Nową Licencję</h3>
                        
                        <div style="margin-bottom:15px;">
                            <label style="display:block; color:#00cc00; font-size:12px; margin-bottom:5px;">Typ licencji:</label>
                            <select id="adminLicenseType" style="width:100%; padding:8px; background:rgba(0,40,0,0.8); border:1px solid #008800; color:#00ff00; border-radius:4px;">
                                <option value="premium">Premium (30 dni)</option>
                                <option value="trial">Trial (7 dni)</option>
                                <option value="lifetime">Lifetime</option>
                            </select>
                        </div>
                        
                        <div style="margin-bottom:15px;">
                            <label style="display:block; color:#00cc00; font-size:12px; margin-bottom:5px;">Czas trwania (dni):</label>
                            <input type="number" id="adminLicenseDays" value="30" min="1" max="365" 
                                   style="width:100%; padding:8px; background:rgba(0,40,0,0.8); border:1px solid #008800; color:#00ff00; border-radius:4px;">
                        </div>
                        
                        <button id="adminCreateLicenseBtn" 
                                style="width:100%; padding:12px; background:linear-gradient(to right, #006600, #008800); 
                                       border:1px solid #00cc00; border-radius:6px; color:#ffffff; cursor:pointer; 
                                       font-weight:bold; margin-bottom:15px;">
                            🎫 Wygeneruj Klucz Licencji
                        </button>
                        
                        <div id="adminCreatedLicense" style="display:none; padding:15px; background:rgba(0,60,0,0.5); 
                                                              border-radius:6px; border:1px solid #00ff00; margin-top:15px;">
                            <strong style="color:#00ff00;">🎫 Wygenerowany klucz:</strong><br>
                            <code id="adminLicenseKeyDisplay" style="color:#00ccff; font-size:16px; font-weight:bold; word-break:break-all;"></code><br>
                            <small style="color:#00cc99;">Skopiuj i przekaż użytkownikowi</small>
                        </div>
                    </div>
                    
                    <div id="adminMessage" class="license-message" style="display:none;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        console.log('✅ Panel created with all tabs');
        
        // Inicjalizuj event listenery
        initializeEventListeners();
    }

    // 🔹 Inicjalizacja event listenerów
    function initializeEventListeners() {
        // Aktywacja licencji
        const activateBtn = document.getElementById('activateLicenseBtn');
        if (activateBtn) {
            activateBtn.addEventListener('click', handleLicenseActivation);
        }
        
        // Przycisk odśwież
        const refreshBtn = document.getElementById('swRefreshButton');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                if (confirm('Odświeżyć stronę?')) location.reload();
            });
        }
        
        // Reset ustawień
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (confirm('Resetować wszystkie ustawienia?')) resetAllSettings();
            });
        }
        
        // Admin events
        setupAdminEvents();
        
        // Setup zakładek
        setupTabs();
        
        // Setup przeciągania
        setupDrag();
        
        // Setup skrótu klawiszowego
        setupKeyboardShortcut();
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

    // 🔹 Setup event listenerów dla admina
    function setupAdminEvents() {
        if (!isAdmin) return;
        
        // Stwórz licencję
        const createBtn = document.getElementById('adminCreateLicenseBtn');
        if (createBtn) {
            createBtn.addEventListener('click', async function() {
                const type = document.getElementById('adminLicenseType').value;
                const days = parseInt(document.getElementById('adminLicenseDays').value) || 30;
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
                        body: JSON.stringify({ type: type, days: days })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        const displayDiv = document.getElementById('adminCreatedLicense');
                        const keyDisplay = document.getElementById('adminLicenseKeyDisplay');
                        const messageEl = document.getElementById('adminMessage');
                        
                        keyDisplay.textContent = result.license.key;
                        displayDiv.style.display = 'block';
                        
                        if (messageEl) {
                            messageEl.textContent = '✅ Klucz wygenerowany!';
                            messageEl.className = 'license-message license-success';
                            messageEl.style.display = 'block';
                            setTimeout(() => messageEl.style.display = 'none', 5000);
                        }
                    } else {
                        const messageEl = document.getElementById('adminMessage');
                        if (messageEl) {
                            messageEl.textContent = `❌ Błąd: ${result.message}`;
                            messageEl.className = 'license-message license-error';
                            messageEl.style.display = 'block';
                        }
                    }
                } catch (error) {
                    const messageEl = document.getElementById('adminMessage');
                    if (messageEl) {
                        messageEl.textContent = `❌ Błąd: ${error.message}`;
                        messageEl.className = 'license-message license-error';
                        messageEl.style.display = 'block';
                    }
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
        }
    }

    // 🔹 Setup zakładek
    function setupTabs() {
        const tabs = document.querySelectorAll('.tablink');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const tabName = this.getAttribute('data-tab');
                showTab(tabName);
            });
        });
    }

    function showTab(tabName) {
        // Ukryj wszystkie zakładki
        const tabContents = document.querySelectorAll('.tabcontent');
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        // Usuń aktywną klasę z przycisków
        const tabs = document.querySelectorAll('.tablink');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // Pokaż wybraną zakładkę
        const tabToShow = document.getElementById(tabName);
        if (tabToShow) {
            tabToShow.classList.add('active');
            tabToShow.style.display = 'flex';
        }
        
        // Aktywuj przycisk
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        }
    }

    // 🔹 Renderowanie dodatków
    function renderAddons() {
        const listContainer = document.getElementById('addon-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        if (currentAddons.length === 0) {
            listContainer.innerHTML = '<div class="addon-list-empty">Brak dostępnych dodatków</div>';
            return;
        }
        
        currentAddons.forEach(addon => {
            const div = document.createElement('div');
            div.className = 'addon' + (addon.locked ? ' locked' : '');
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
                    ${!addon.locked ? `
                        <button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" data-id="${addon.id}">
                            ★
                        </button>
                        <label class="addon-switch">
                            <input type="checkbox" ${addon.enabled ? 'checked' : ''} data-id="${addon.id}">
                            <span class="addon-switch-slider"></span>
                        </label>
                    ` : `
                        <button class="favorite-btn" style="color:#666; cursor:default;">★</button>
                        <label class="addon-switch">
                            <input type="checkbox" disabled>
                            <span class="addon-switch-slider" style="background-color:#333;"></span>
                        </label>
                    `}
                </div>
            `;
            
            listContainer.appendChild(div);
        });
        
        // Dodaj event listenery dla nowych elementów
        setupAddonEvents();
    }

    function setupAddonEvents() {
        // Ulubione
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const addonId = this.dataset.id;
                if (addonId) toggleFavorite(addonId);
            });
        });
        
        // Przełączniki
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
                // Kliknięcie - toggle panel
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

    // 🔹 Setup skrótu klawiszowego
    function setupKeyboardShortcut() {
        document.addEventListener('keydown', handleKeyboardShortcut);
    }

    function handleKeyboardShortcut(e) {
        if (isShortcutInputFocused) return;
        
        if (e.ctrlKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            togglePanel();
        }
    }

    // 🔹 Reset wszystkich ustawień
    function resetAllSettings() {
        SW.GM_deleteValue(CONFIG.PANEL_POSITION);
        SW.GM_deleteValue(CONFIG.PANEL_VISIBLE);
        SW.GM_deleteValue(CONFIG.TOGGLE_BTN_POSITION);
        SW.GM_deleteValue(CONFIG.FONT_SIZE);
        SW.GM_deleteValue(CONFIG.BACKGROUND_OPACITY);
        SW.GM_deleteValue(CONFIG.KCS_ICONS_ENABLED);
        SW.GM_deleteValue(CONFIG.FAVORITE_ADDONS);
        SW.GM_deleteValue(CONFIG.ACTIVE_CATEGORIES);
        SW.GM_deleteValue(CONFIG.CUSTOM_SHORTCUT);
        SW.GM_deleteValue(CONFIG.ACCOUNT_ID);
        SW.GM_deleteValue(CONFIG.LICENSE_ACTIVE);
        SW.GM_deleteValue(CONFIG.LICENSE_EXPIRY);
        SW.GM_deleteValue(CONFIG.LICENSE_DATA);
        SW.GM_deleteValue(CONFIG.ADMIN_ACCESS);
        SW.GM_deleteValue(CONFIG.LICENSE_KEY);
        
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
        
        const resetMessage = document.getElementById('swResetMessage');
        if (resetMessage) {
            resetMessage.textContent = 'Ustawienia zresetowane!';
            resetMessage.style.background = 'rgba(255, 102, 0, 0.1)';
            resetMessage.style.color = '#ff6600';
            resetMessage.style.border = '1px solid #ff6600';
            resetMessage.style.display = 'block';
            setTimeout(() => resetMessage.style.display = 'none', 5000);
        }
        
        loadSavedState();
        renderAddons();
        updateAccountDisplay('Nie znaleziono');
        updateLicenseDisplay();
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
    }

    // 🔹 Główne funkcje panelu
    async function initPanel() {
        console.log('✅ Initializing panel v3.0...');
        
        injectCSS();
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        createToggleButton();
        createMainPanel();
        
        loadSavedState();
        
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn) {
            setupToggleDrag(toggleBtn);
        }
        
        panelInitialized = true;
        
        // Inicjalizuj konto i licencję
        setTimeout(async () => {
            await initAccountAndLicense();
            
            // Debug: wymuś admina jeśli ID się zgadza
            if (isAdmin) {
                console.log('👑 Wykryto admina, pokazuję zakładkę...');
                toggleAdminTab(true);
                
                // Upewnij się że zakładka admina jest widoczna
                setTimeout(() => {
                    const adminTab = document.querySelector('.admin-tab');
                    if (adminTab) {
                        adminTab.style.display = 'flex';
                        console.log('✅ Zakładka admina powinna być widoczna');
                    }
                }, 1000);
            }
            
            // Automatyczne odświeżanie statusu licencji co 5 minut
            setInterval(() => {
                if (userAccountId) checkAndUpdateLicense(userAccountId);
            }, 5 * 60 * 1000);
        }, 1000);
    }

    // 🔹 Start panelu
    console.log('🎯 Starting Synergy Panel v3.0...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }
})();