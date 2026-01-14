// synergy.js - Główny kod panelu Synergy (v3.0 - Final)
(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v3.0 (Full License System + Admin)');

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
        
        // 1. Z cookies
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
        
        // 2. Z funkcji getCookie
        const userId = getCookie('user_id');
        if (userId) return userId;
        
        const mcharId = getCookie('mchar_id');
        if (mcharId) return mcharId;
        
        // 3. Z zapisanego
        const savedAccountId = SW.GM_getValue(CONFIG.ACCOUNT_ID);
        if (savedAccountId) {
            console.log('✅ Znaleziono zapisane ID:', savedAccountId);
            return savedAccountId;
        }
        
        // 4. Tymczasowe
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
            
            // Sprawdź czy admin
            isAdmin = ADMIN_ACCOUNT_IDS.includes(accountId.toString());
            SW.GM_setValue(CONFIG.ADMIN_ACCESS, isAdmin);
            
            console.log(isAdmin ? '👑 Jesteś administratorem!' : '👤 Jesteś zwykłym użytkownikiem');
            
            updateAccountDisplay(accountId);
            
            // Najpierw pokaż tylko darmowe dodatki
            loadAddonsBasedOnLicense([]);
            
            // Potem sprawdź licencję
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
                    
                    // Załaduj wszystkie dodatki (w tym premium)
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
                    
                    // TYLKO DARMOWE DODATKI
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
    // 🔹 CSS
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
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
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

#swPanelToggle:active:not(.dragging) {
    transform: scale(1.05);
    transition: transform 0.1s ease;
}

@keyframes savePulse {
    0% { 
        box-shadow: 0 0 20px rgba(255, 51, 0, 0.9);
        border-color: #ff3300;
    }
    50% { 
        box-shadow: 0 0 35px rgba(255, 102, 0, 1.2);
        border-color: #ff6600;
        transform: scale(1.05);
    }
    100% { 
        box-shadow: 0 0 20px rgba(255, 51, 0, 0.9);
        border-color: #ff3300;
    }
}

#swPanelToggle.saved {
    animation: savePulse 1.5s ease-in-out;
}

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
    box-shadow: 0 0 30px rgba(255, 51, 0, 0.8), inset 0 0 20px rgba(255, 102, 0, 0.2);
    backdrop-filter: blur(10px);
    display: none;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    overflow: hidden;
    resize: both;
    min-width: 640px;
    max-width: 900px;
    min-height: 580px;
    max-height: 800px;
    opacity: 0.9;
    transition: opacity 0.3s ease;
}

#swAddonsPanel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    padding: 2px;
    background: linear-gradient(45deg, #ff3300, #ff6600, #ff9900, #ffcc00, #ff3300);
    -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: -1;
}

#swPanelHeader {
    background: linear-gradient(to right, #330000, #660000);
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid #ff3300;
    cursor: grab;
    position: relative;
    overflow: hidden;
    font-size: 18px;
    font-weight: bold;
    color: #ffcc00;
    text-shadow: 0 0 10px rgba(255, 51, 0, 0.8);
}

#swPanelHeader::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 102, 0, 0.3), transparent);
    animation: fireShine 2s infinite;
}

@keyframes fireShine {
    0% { left: -100%; }
    100% { left: 100%; }
}

.sw-tab-content {
    padding: 15px;
    background: rgba(26, 0, 0, 0.9);
    height: calc(100% - 120px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
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
    overflow: hidden;
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

.tablink:hover::before {
    width: 80%;
}

.tablink.active {
    color: #ffcc00;
    text-shadow: 0 0 10px rgba(255, 102, 0, 0.8);
}

.tablink.active::before {
    width: 100%;
    background: #ff3300;
    box-shadow: 0 0 10px rgba(255, 51, 0, 0.8);
}

.tablink:hover:not(.active) {
    color: #ff6600;
    text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
}

/* 🔹 TAB CONTENT 🔹 */
.tabcontent {
    display: none;
    flex: 1;
    overflow: hidden;
    animation: fadeEffect 0.3s ease;
}

.tabcontent.active {
    display: flex;
    flex-direction: column;
}

@keyframes fadeEffect {
    from { 
        opacity: 0; 
        transform: translateY(5px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
}

/* 🔹 ADDONS LIST 🔹 */
.addon {
    background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
    border: 1px solid #660000;
    border-radius: 8px;
    padding: 12px 15px;
    margin-bottom: 10px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 70px;
    max-height: 70px;
    box-sizing: border-box;
    cursor: pointer;
}

.addon::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 69, 0, 0.2);
    border-radius: 8px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.addon:hover::before {
    opacity: 1;
}

.addon:hover {
    transform: translateY(-3px);
    border-color: #ff4500;
    box-shadow: 0 10px 25px rgba(255, 69, 0, 0.6);
    z-index: 2;
    background: linear-gradient(135deg, rgba(139, 0, 0, 0.9), rgba(255, 69, 0, 0.9));
}

.addon:hover .addon-title {
    color: #ffffff;
    text-shadow: 0 0 15px rgba(255, 69, 0, 0.8);
}

.addon:hover .addon-description {
    color: #ffffff;
}

.addon:hover .favorite-btn {
    color: #ff8c00;
    transform: scale(1.2);
}

.addon-header {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    z-index: 1;
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
    transition: all 0.3s ease;
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
    transition: all 0.3s ease;
}

.addon-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    z-index: 1;
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
    flex-shrink: 0;
    z-index: 2;
}

.favorite-btn:hover {
    color: #ffcc00;
    transform: scale(1.3);
}

.favorite-btn.favorite {
    color: #ffcc00;
    text-shadow: 0 0 8px rgba(255, 204, 0, 0.7);
}

/* 🔹 SWITCH 🔹 */
.addon-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
    flex-shrink: 0;
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

.license-status-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

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

.license-status-valid {
    color: #00ff00 !important;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.license-status-invalid {
    color: #ff3300 !important;
    text-shadow: 0 0 5px rgba(255, 51, 0, 0.5);
}

.license-status-connected {
    color: #00ff00 !important;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.license-status-disconnected {
    color: #ff3300 !important;
    text-shadow: 0 0 5px rgba(255, 51, 0, 0.5);
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

.settings-item:hover {
    border-color: #ff3300;
    background: linear-gradient(135deg, rgba(102, 0, 0, 0.9), rgba(153, 0, 0, 0.9));
}

.settings-label {
    display: block;
    color: #ffcc00;
    font-size: 13px;
    margin-bottom: 10px;
    font-weight: 600;
    text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
}

/* 🔹 ROZMIAR CZCIONKI 🔹 */
.font-size-container {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
}

.font-size-slider {
    flex: 1;
    -webkit-appearance: none;
    height: 8px;
    background: #660000;
    border-radius: 4px;
    outline: none;
    margin: 0 15px;
}

.font-size-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #ff6600, #ff3300);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(255, 51, 0, 0.5);
    transition: all 0.3s ease;
}

.font-size-slider::-webkit-slider-thumb:hover {
    background: linear-gradient(135deg, #ff9900, #ff6600);
    box-shadow: 0 0 10px rgba(255, 102, 0, 0.8);
    transform: scale(1.1);
}

.font-size-value {
    color: #ffcc00;
    font-weight: bold;
    font-size: 14px;
    min-width: 40px;
    text-align: center;
    text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
}

/* 🔹 PRZEŹROCZYSTOŚĆ PANELU 🔹 */
.opacity-container {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
}

.opacity-slider {
    flex: 1;
    -webkit-appearance: none;
    height: 8px;
    background: linear-gradient(to right, rgba(255, 51, 0, 0.3), rgba(255, 51, 0, 0.9));
    border-radius: 4px;
    outline: none;
    margin: 0 15px;
}

.opacity-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #ff6600, #ff3300);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(255, 51, 0, 0.5);
    transition: all 0.3s ease;
}

.opacity-slider::-webkit-slider-thumb:hover {
    background: linear-gradient(135deg, #ff9900, #ff6600);
    box-shadow: 0 0 10px rgba(255, 102, 0, 0.8);
    transform: scale(1.1);
}

.opacity-value {
    color: #ffcc00;
    font-weight: bold;
    font-size: 14px;
    min-width: 40px;
    text-align: center;
    text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
}

/* 🔹 SKRÓT KLAWISZOWY 🔹 */
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

.shortcut-set-btn {
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

.shortcut-set-btn:hover {
    background: linear-gradient(to right, #990000, #cc0000);
    color: #ffffff;
}

/* 🔹 PRZYCISK RESETUJ USTAWIENIA 🔹 */
.reset-settings-container {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid #660000;
}

.reset-settings-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, rgba(51, 0, 0, 0.8), rgba(102, 0, 0, 0.8));
    border: 1px solid #660000;
    border-radius: 6px;
    color: #ff3300;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
}

.reset-settings-button:hover {
    background: linear-gradient(135deg, rgba(102, 0, 0, 0.9), rgba(153, 0, 0, 0.9));
    border-color: #ff3300;
    color: #ffcc00;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 51, 0, 0.3);
}

.reset-settings-button:active {
    transform: translateY(0);
}

.reset-settings-icon {
    color: #ff3300;
    font-size: 16px;
    transition: all 0.3s ease;
}

.reset-settings-button:hover .reset-settings-icon {
    transform: rotate(180deg);
    color: #ffcc00;
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
    text-align: left;
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
    margin-top: 0;
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

/* 🔹 LICENSE MESSAGE 🔹 */
.license-message {
    margin-top: 15px;
    padding: 12px;
    border-radius: 6px;
    font-size: 13px;
    text-align: center;
    border: 1px solid;
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

/* 🔹 SEARCH BAR 🔹 */
.search-container {
    margin-bottom: 15px;
    position: relative;
}

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

.search-input::placeholder {
    color: #ff9966;
    font-size: 12px;
    text-align: center;
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

.category-filter-item:hover {
    background: rgba(102, 0, 0, 0.8);
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

.category-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

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
    scrollbar-width: thin;
    scrollbar-color: #ff3300 rgba(51, 0, 0, 0.8);
}

.addon-list::-webkit-scrollbar {
    width: 6px;
}

.addon-list::-webkit-scrollbar-track {
    background: rgba(51, 0, 0, 0.8);
    border-radius: 3px;
}

.addon-list::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #ff3300, #ff6600);
    border-radius: 3px;
}

.addon-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #ff6600, #ff9900);
}

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

/* 🔹 REFRESH BUTTON - ZAWSZE WIDOCZNY! 🔹 */
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

.addon.locked .addon-title {
    color: #666 !important;
    text-shadow: none !important;
}

.addon.locked .addon-description {
    color: #666 !important;
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

#swLicenseDaysLeft {
    font-weight: bold;
    margin-left: 5px;
}

/* 🔹 LICENSE INFO CONTAINER 🔹 */
.license-info-container {
    text-align: center;
    margin: 15px 0;
    padding: 10px;
    background: rgba(255,51,0,0.1);
    border-radius: 6px;
    border: 1px solid rgba(255,51,0,0.3);
}

.license-info-container strong {
    color: #ffcc00;
    font-size: 13px;
}

.license-info-container p {
    color: #ff9966;
    font-size: 12px;
    margin: 5px 0;
    line-height: 1.4;
}

/* 🔹 ADMIN SECTION - NIE WIDOCZNE DLA NORMALNYCH UŻYTKOWNIKÓW 🔹 */
.admin-tab {
    display: none !important;
}

.admin-visible .admin-tab {
    display: flex !important;
}

.admin-panel {
    background: linear-gradient(135deg, rgba(0, 51, 0, 0.8), rgba(0, 102, 0, 0.8)) !important;
    border: 1px solid #00cc00 !important;
}

.admin-header {
    color: #00ff00 !important;
    border-bottom: 1px solid #00cc00 !important;
}

.admin-button {
    background: linear-gradient(to right, #006600, #008800) !important;
    border: 1px solid #00cc00 !important;
    color: #ffffff !important;
}

.admin-button:hover {
    background: linear-gradient(to right, #008800, #00aa00) !important;
    border-color: #00ff00 !important;
}

.admin-input {
    background: rgba(0, 40, 0, 0.8) !important;
    border: 1px solid #008800 !important;
    color: #00ff00 !important;
}

.admin-input:focus {
    border-color: #00ff00 !important;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3) !important;
}

/* 🔹 PANEL RESIZE HANDLE 🔹 */
#swAddonsPanel::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 15px;
    height: 15px;
    background: linear-gradient(135deg, transparent 50%, #ff3300 50%);
    cursor: nwse-resize;
    opacity: 0.5;
    transition: opacity 0.3s ease;
}

#swAddonsPanel:hover::after {
    opacity: 1;
}

/* 🔹 RESPONSYWNOŚĆ 🔹 */
@media (max-width: 700px) {
    #swAddonsPanel {
        width: 500px;
        min-width: 500px;
        left: 10px;
    }
    
    .category-filters {
        flex-direction: column;
        gap: 8px;
    }
    
    .category-filter-item {
        width: 100%;
    }
    
    .tablink {
        padding: 10px 3px;
        font-size: 11px;
    }
}
        `;
        document.head.appendChild(style);
        console.log('✅ CSS injected');
    }

    // 🔹 Tworzenie przycisku przełączania
    function createToggleButton() {
        const oldToggle = document.getElementById('swPanelToggle');
        if (oldToggle) oldToggle.remove();
        
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij dwukrotnie - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
        
        toggleBtn.innerHTML = `
            <img src="https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/public/icon.jpg" 
                 alt="SW" 
                 style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
        `;
        
        document.body.appendChild(toggleBtn);
        console.log('✅ Toggle button created');
        
        return toggleBtn;
    }
    // 🔹 Tworzenie głównego panelu
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        // HTML panelu
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
            </div>

            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div class="search-container">
                        <input type="text" class="search-input" id="searchAddons" placeholder="Wyszukaj dodatki...">
                    </div>
                    
                    <div class="category-filters">
                        <div class="category-filter-item">
                            <div class="category-filter-label">
                                <span>Włączone</span>
                            </div>
                            <label class="category-switch">
                                <input type="checkbox" id="filter-enabled" checked>
                                <span class="category-slider"></span>
                            </label>
                        </div>
                        <div class="category-filter-item">
                            <div class="category-filter-label">
                                <span>Wyłączone</span>
                            </div>
                            <label class="category-switch">
                                <input type="checkbox" id="filter-disabled" checked>
                                <span class="category-slider"></span>
                            </label>
                        </div>
                        <div class="category-filter-item">
                            <div class="category-filter-label">
                                <span>Ulubione</span>
                            </div>
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
                        <button class="refresh-button" id="swRefreshButton">
                            Odśwież Panel
                        </button>
                    </div>
                    
                    <div id="swAddonsMessage" class="license-message" style="display: none;"></div>
                </div>
            </div>

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
                    
                    <div class="license-info-container">
                        <strong>ℹ️ Informacja:</strong>
                        <p>
                            Premium dodatki pojawią się automatycznie po uzyskaniu licencji.<br>
                            System automatycznie sprawdza status co 5 minut.
                        </p>
                    </div>
                    
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>

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
                    
                    <div style="margin-top: 20px; padding: 15px; background: rgba(255,51,0,0.1); 
                                border-radius: 6px; border: 1px solid rgba(255,51,0,0.3);">
                        <strong style="color:#ffcc00;">ℹ️ Jak zdobyć licencję?</strong>
                        <p style="color:#ff9966; font-size: 12px; margin-top: 10px;">
                            1. Skontaktuj się z administratorem<br>
                            2. Odbierz unikalny klucz licencji<br>
                            3. Aktywuj go tutaj<br>
                            4. Ciesz się wszystkimi dodatkami!
                        </p>
                    </div>
                </div>
            </div>

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
                            <span class="shortcut-input-label">Skrót klawiszowy do panelu:</span>
                            <input type="text" class="shortcut-input" id="shortcutInput" value="Ctrl+A" readonly>
                            <button class="shortcut-set-btn" id="shortcutSetBtn">Ustaw skrót</button>
                        </div>
                    </div>
                    
                    <div class="reset-settings-container">
                        <button class="reset-settings-button" id="swResetButton">
                            <span class="reset-settings-icon">↻</span>
                            Resetuj wszystkie ustawienia
                        </button>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top: 15px; padding: 12px; border-radius: 6px; display: none;"></div>
                </div>
            </div>

            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="info-container">
                        <div class="info-header">Historia zmian v${VERSION_INFO.version}</div>
                        
                        <div class="info-patch-notes">
                            ${VERSION_INFO.patchNotes.map(note => `<li>${note}</li>`).join('')}
                        </div>
                        
                        <div class="info-footer">
                            © 2024 Synergy Panel • Wszelkie prawa zastrzeżone
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        renderAddons();
        updateFilterSwitches();
        console.log('✅ Panel created');
        
        // Dodaj event listener dla aktywacji licencji
        document.getElementById('activateLicenseBtn').addEventListener('click', handleLicenseActivation);
        
        // Jeśli jesteś adminem, dodaj zakładkę admina
        if (isAdmin) {
            addAdminTab();
        }
    }

    // 🔹 Dodaj zakładkę admina (tylko jeśli jesteś adminem)
    function addAdminTab() {
        const tabContainer = document.querySelector('.tab-container');
        const panel = document.getElementById('swAddonsPanel');
        
        if (!tabContainer || !panel) return;
        
        // Dodaj przycisk zakładki admina
        const adminTabBtn = document.createElement('button');
        adminTabBtn.className = 'tablink admin-tab';
        adminTabBtn.setAttribute('data-tab', 'admin');
        adminTabBtn.innerHTML = '👑 Admin';
        adminTabBtn.style.color = '#00ff00';
        adminTabBtn.style.fontWeight = 'bold';
        tabContainer.appendChild(adminTabBtn);
        
        // Dodaj zawartość zakładki admina
        const adminContent = document.createElement('div');
        adminContent.id = 'admin';
        adminContent.className = 'tabcontent';
        adminContent.innerHTML = `
            <div class="sw-tab-content">
                <div class="license-container" style="background: linear-gradient(135deg, rgba(0,51,0,0.8), rgba(0,102,0,0.8)); border-color: #00cc00;">
                    <div class="license-header" style="color:#00ff00; border-color: #00cc00;">👑 Panel Administratora</div>
                    <div class="license-status-item">
                        <span class="license-status-label">Twoje ID:</span>
                        <span id="swAdminAccountId" class="license-status-valid">${userAccountId || 'Ładowanie...'}</span>
                    </div>
                    <div class="license-status-item">
                        <span class="license-status-label">Status:</span>
                        <span class="license-status-valid">Administrator</span>
                    </div>
                </div>
                
                <div style="margin: 20px 0; padding: 20px; background: rgba(0,50,0,0.2); border: 1px solid #00aa00; border-radius: 8px;">
                    <h3 style="color:#00ff00; margin-top: 0; margin-bottom: 15px;">➕ Stwórz Nową Licencję</h3>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color:#00cc00; font-size: 12px; margin-bottom: 5px;">Typ licencji:</label>
                        <select id="adminLicenseType" style="width: 100%; padding: 8px; background: rgba(0,40,0,0.8); border: 1px solid #008800; color: #00ff00; border-radius: 4px;">
                            <option value="premium">Premium (30 dni)</option>
                            <option value="trial">Trial (7 dni)</option>
                            <option value="lifetime">Lifetime</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color:#00cc00; font-size: 12px; margin-bottom: 5px;">Czas trwania (dni):</label>
                        <input type="number" id="adminLicenseDays" value="30" min="1" max="365" 
                               style="width: 100%; padding: 8px; background: rgba(0,40,0,0.8); border: 1px solid #008800; color: #00ff00; border-radius: 4px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color:#00cc00; font-size: 12px; margin-bottom: 5px;">Notatka (opcjonalnie):</label>
                        <input type="text" id="adminLicenseNote" placeholder="np. Dla gracza XYZ"
                               style="width: 100%; padding: 8px; background: rgba(0,40,0,0.8); border: 1px solid #008800; color: #00ff00; border-radius: 4px;">
                    </div>
                    
                    <button id="adminCreateLicenseBtn" 
                            style="width: 100%; padding: 12px; background: linear-gradient(to right, #006600, #008800); 
                                   border: 1px solid #00cc00; border-radius: 6px; color: #ffffff; cursor: pointer; 
                                   font-weight: bold; margin-bottom: 15px;">
                        🎫 Wygeneruj Klucz Licencji
                    </button>
                    
                    <div id="adminCreatedLicense" style="display: none; padding: 15px; background: rgba(0,60,0,0.5); 
                                                          border-radius: 6px; border: 1px solid #00ff00; margin-top: 15px;">
                        <strong style="color:#00ff00;">🎫 Wygenerowany klucz:</strong><br>
                        <code id="adminLicenseKeyDisplay" style="color:#00ccff; font-size: 16px; font-weight: bold; word-break: break-all;"></code><br>
                        <small style="color:#00cc99;">Skopiuj i przekaż użytkownikowi</small>
                    </div>
                </div>
                
                <div style="margin: 20px 0; padding: 20px; background: rgba(0,50,0,0.2); border: 1px solid #00aa00; border-radius: 8px;">
                    <h3 style="color:#00ff00; margin-top: 0; margin-bottom: 15px;">📋 Zarządzaj Licencjami</h3>
                    
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button id="adminListLicensesBtn" 
                                style="flex: 1; padding: 10px; background: linear-gradient(to right, #006600, #008800); 
                                       border: 1px solid #00cc00; border-radius: 6px; color: #ffffff; cursor: pointer;">
                            📋 Pokaż Wszystkie Klucze
                        </button>
                        <button id="adminListActiveBtn" 
                                style="flex: 1; padding: 10px; background: linear-gradient(to right, #006666, #008888); 
                                       border: 1px solid #00cccc; border-radius: 6px; color: #ffffff; cursor: pointer;">
                            👤 Pokaż Aktywne Licencje
                        </button>
                    </div>
                    
                    <div id="adminLicensesContainer" style="max-height: 300px; overflow-y: auto; 
                                                             background: rgba(0,30,0,0.5); border-radius: 5px; padding: 10px; 
                                                             font-size: 11px; display: none;">
                        <!-- Lista licencji pojawi się tutaj -->
                    </div>
                </div>
                
                <div id="adminMessage" class="license-message" style="display: none;"></div>
            </div>
        `;
        
        panel.appendChild(adminContent);
        
        // Dodaj event listenery dla admina
        setupAdminEvents();
        
        console.log('✅ Admin tab added (visible only to you)');
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
        
        // Zmień tekst przycisku
        activateBtn.textContent = 'Aktywuję...';
        activateBtn.disabled = true;
        activateBtn.style.opacity = '0.7';
        
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
                
                // Zapisz klucz
                SW.GM_setValue(CONFIG.LICENSE_KEY, licenseKey);
                
                // Odśwież panel
                setTimeout(() => {
                    checkAndUpdateLicense(userAccountId);
                    showTab('addons'); // Przełącz na zakładkę dodatków
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
            activateBtn.style.opacity = '1';
        }
    }

    // 🔹 Setup event listenerów dla admina
    function setupAdminEvents() {
        if (!isAdmin) return;
        
        // Stwórz licencję
        document.getElementById('adminCreateLicenseBtn').addEventListener('click', async function() {
            const type = document.getElementById('adminLicenseType').value;
            const days = parseInt(document.getElementById('adminLicenseDays').value) || 30;
            const note = document.getElementById('adminLicenseNote').value.trim();
            
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
                        type: type,
                        days: days,
                        note: note
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const displayDiv = document.getElementById('adminCreatedLicense');
                    const keyDisplay = document.getElementById('adminLicenseKeyDisplay');
                    
                    keyDisplay.textContent = result.license.key;
                    displayDiv.style.display = 'block';
                    
                    showAdminMessage(`✅ Klucz wygenerowany!`, 'success');
                } else {
                    showAdminMessage(`❌ Błąd: ${result.message}`, 'error');
                }
                
            } catch (error) {
                showAdminMessage(`❌ Błąd: ${error.message}`, 'error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
        
        // Pokaż wszystkie klucze
        document.getElementById('adminListLicensesBtn').addEventListener('click', async function() {
            const container = document.getElementById('adminLicensesContainer');
            container.innerHTML = '<div style="color:#00aa99; text-align:center; padding:20px;">Ładowanie...</div>';
            container.style.display = 'block';
            
            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/licenses`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    let html = `
                        <div style="color:#00ff00; font-weight:bold; margin-bottom:10px; border-bottom:1px solid #00aa00; padding-bottom:5px;">
                            Klucze licencji (${result.totalKeys}):
                        </div>
                    `;
                    
                    if (result.licenses && result.licenses.length > 0) {
                        result.licenses.forEach(license => {
                            const expiry = new Date(license.expiry);
                            const now = new Date();
                            const isActive = !license.used && expiry > now;
                            
                            html += `
                                <div style="padding: 10px; margin-bottom: 8px; background: rgba(0,40,0,0.3); border-radius: 4px; border: 1px solid ${isActive ? '#00aa00' : '#666666'};">
                                    <div><strong style="color:#00ff00;">Klucz:</strong> ${license.key}</div>
                                    <div><strong style="color:#00ccff;">Typ:</strong> ${license.type} | <strong>Dni:</strong> ${Math.ceil((expiry - now) / (1000*60*60*24))}</div>
                                    <div><strong style="color:#00cc99;">Status:</strong> 
                                        <span style="color:${isActive ? '#00ff00' : '#ff6666'}">
                                            ${isActive ? 'AKTYWNY' : (license.used ? 'UŻYTY' : 'WYGASŁY')}
                                        </span>
                                    </div>
                                    ${license.note ? `<div><strong>Notatka:</strong> ${license.note}</div>` : ''}
                                    ${license.usedBy ? `<div><strong>Użyty przez:</strong> ${license.usedBy}</div>` : ''}
                                </div>
                            `;
                        });
                    } else {
                        html += '<div style="color:#00aa99; text-align:center; padding:20px;">Brak kluczy</div>';
                    }
                    
                    container.innerHTML = html;
                    showAdminMessage(`Załadowano ${result.totalKeys} kluczy`, 'success');
                } else {
                    container.innerHTML = '<div style="color:#ff6666; text-align:center; padding:20px;">Błąd ładowania</div>';
                }
                
            } catch (error) {
                container.innerHTML = `<div style="color:#ff6666; text-align:center; padding:20px;">Błąd: ${error.message}</div>`;
            }
        });
        
        // Pokaż aktywne licencje
        document.getElementById('adminListActiveBtn').addEventListener('click', async function() {
            const container = document.getElementById('adminLicensesContainer');
            container.innerHTML = '<div style="color:#00aa99; text-align:center; padding:20px;">Ładowanie...</div>';
            container.style.display = 'block';
            
            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/licenses`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    let html = `
                        <div style="color:#00ff00; font-weight:bold; margin-bottom:10px; border-bottom:1px solid #00aa00; padding-bottom:5px;">
                            Aktywne licencje (${result.totalActive}):
                        </div>
                    `;
                    
                    if (result.activeLicenses && result.activeLicenses.length > 0) {
                        result.activeLicenses.forEach(license => {
                            const expiry = new Date(license.expiry);
                            const now = new Date();
                            const daysLeft = Math.ceil((expiry - now) / (1000*60*60*24));
                            
                            html += `
                                <div style="padding: 10px; margin-bottom: 8px; background: rgba(0,40,0,0.3); border-radius: 4px; border: 1px solid #00aa00;">
                                    <div><strong style="color:#00ff00;">Konto:</strong> ${license.accountId}</div>
                                    <div><strong style="color:#00ccff;">Ważna do:</strong> ${expiry.toLocaleDateString('pl-PL')} (${daysLeft} dni)</div>
                                    <div><strong style="color:#00cc99;">Dodatki:</strong> ${license.addons.join(', ')}</div>
                                    <div><strong>Aktywowana:</strong> ${new Date(license.activatedAt).toLocaleDateString('pl-PL')}</div>
                                </div>
                            `;
                        });
                    } else {
                        html += '<div style="color:#00aa99; text-align:center; padding:20px;">Brak aktywnych licencji</div>';
                    }
                    
                    container.innerHTML = html;
                    showAdminMessage(`Załadowano ${result.totalActive} aktywnych licencji`, 'success');
                } else {
                    container.innerHTML = '<div style="color:#ff6666; text-align:center; padding:20px;">Błąd ładowania</div>';
                }
                
            } catch (error) {
                container.innerHTML = `<div style="color:#ff6666; text-align:center; padding:20px;">Błąd: ${error.message}</div>`;
            }
        });
    }

    function showAdminMessage(text, type = 'info') {
        const messageEl = document.getElementById('adminMessage');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.className = `license-message license-${type}`;
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

    function showTab(tabName) {
        const tabs = document.querySelectorAll('.tablink');
        const tabContents = document.querySelectorAll('.tabcontent');
        
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        const tabToShow = document.getElementById(tabName);
        if (tabToShow) {
            tabToShow.classList.add('active');
        }
        
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
        
        const sortedAddons = [...currentAddons].sort((a, b) => {
            if (a.favorite && !b.favorite) return -1;
            if (!a.favorite && b.favorite) return 1;
            if (a.enabled && !b.enabled) return -1;
            if (!a.enabled && b.enabled) return 1;
            return a.name.localeCompare(b.name);
        });
        
        const filteredAddons = sortedAddons.filter(addon => {
            const showEnabled = activeCategories.enabled && addon.enabled;
            const showDisabled = activeCategories.disabled && !addon.enabled;
            const showFavorites = activeCategories.favorites && addon.favorite;
            
            const categoryMatch = showEnabled || showDisabled || showFavorites;
            
            const searchMatch = searchQuery === '' || 
                addon.name.toLowerCase().includes(searchQuery) || 
                addon.description.toLowerCase().includes(searchQuery);
            
            return categoryMatch && searchMatch;
        });
        
        if (filteredAddons.length > 0) {
            filteredAddons.forEach(addon => {
                const div = document.createElement('div');
                div.className = 'addon';
                div.dataset.id = addon.id;
                
                if (addon.locked) {
                    div.classList.add('locked');
                }
                
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
                            <button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" data-id="${addon.id}" title="${addon.favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}">
                                ★
                            </button>
                            <label class="addon-switch">
                                <input type="checkbox" ${addon.enabled ? 'checked' : ''} data-id="${addon.id}">
                                <span class="addon-switch-slider"></span>
                            </label>
                        ` : `
                            <button class="favorite-btn" style="color:#666; cursor:default;" title="Wymaga aktywnej licencji">
                                ★
                            </button>
                            <label class="addon-switch">
                                <input type="checkbox" disabled>
                                <span class="addon-switch-slider" style="background-color:#333;"></span>
                            </label>
                        `}
                    </div>
                `;
                
                listContainer.appendChild(div);
            });
        } else {
            listContainer.innerHTML = '<div class="addon-list-empty">Brak dodatków spełniających kryteria wyszukiwania</div>';
        }
    }

    // 🔹 Obsługa przeciągania przycisku
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
                toggleBtn.classList.add('saved');
                
                SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, {
                    left: currentX + 'px',
                    top: currentY + 'px'
                });
                
                setTimeout(() => {
                    toggleBtn.classList.remove('saved');
                }, 1500);
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

        toggleBtn.addEventListener('click', handleClick);
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

    // 🔹 Setup przeciągania panelu
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
            panel.style.opacity = '0.9';
            document.addEventListener('mousemove', onPanelDrag);
            document.addEventListener('mouseup', stopPanelDrag);
        });

        function onPanelDrag(e) {
            if (!isDragging) return;
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
        }

        function stopPanelDrag() {
            if (!isDragging) return;
            isDragging = false;
            panel.style.opacity = '1';
            
            SW.GM_setValue(CONFIG.PANEL_POSITION, {
                left: panel.style.left,
                top: panel.style.top
            });
            
            document.removeEventListener('mousemove', onPanelDrag);
            document.removeEventListener('mouseup', stopPanelDrag);
        }
    }

    // 🔹 Setup skrótu klawiszowego
    function setupKeyboardShortcut() {
        document.removeEventListener('keydown', handleKeyboardShortcut);
        document.addEventListener('keydown', handleKeyboardShortcut);
    }

    function handleKeyboardShortcut(e) {
        if (isShortcutInputFocused) return;
        
        const shortcutParts = customShortcut.split('+');
        const hasCtrl = shortcutParts.includes('Ctrl');
        const key = shortcutParts[shortcutParts.length - 1].toUpperCase();
        
        const ctrlMatch = hasCtrl ? e.ctrlKey : true;
        const keyMatch = e.key.toUpperCase() === key;
        
        if (ctrlMatch && keyMatch) {
            e.preventDefault();
            e.stopPropagation();
            
            const toggleBtn = document.getElementById('swPanelToggle');
            if (toggleBtn) {
                toggleBtn.click();
                toggleBtn.click();
            }
        }
    }

    // 🔹 Ustawianie nowego skrótu klawiszowego
    function setupShortcutInput() {
        const shortcutInput = document.getElementById('shortcutInput');
        const shortcutSetBtn = document.getElementById('shortcutSetBtn');
        
        if (!shortcutInput || !shortcutSetBtn) return;
        
        const savedShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        customShortcut = savedShortcut;
        shortcutInput.value = customShortcut;
        
        shortcutSetBtn.addEventListener('click', function() {
            isShortcutInputFocused = true;
            shortcutInput.style.borderColor = '#ff3300';
            shortcutInput.style.boxShadow = '0 0 10px rgba(255, 51, 0, 0.5)';
            shortcutInput.value = 'Wciśnij kombinację klawiszy...';
            shortcutKeys = [];
            
            const keyDownHandler = function(e) {
                if (e.repeat) return;
                const key = e.key.toUpperCase();
                
                if (e.ctrlKey && !shortcutKeys.includes('Ctrl')) {
                    shortcutKeys.push('Ctrl');
                }
                
                if (key.length === 1 && /[A-Z0-9]/.test(key) && !shortcutKeys.includes(key)) {
                    shortcutKeys.push(key);
                }
                
                if (shortcutKeys.length > 0) {
                    shortcutInput.value = shortcutKeys.join('+');
                }
            };
            
            const keyUpHandler = function(e) {
                const key = e.key.toUpperCase();
                
                if (key.length === 1 && /[A-Z0-9]/.test(key)) {
                    if (shortcutKeys.includes('Ctrl') && shortcutKeys.length >= 2) {
                        customShortcut = shortcutKeys.join('+');
                        shortcutInput.value = customShortcut;
                        SW.GM_setValue(CONFIG.CUSTOM_SHORTCUT, customShortcut);
                        setupKeyboardShortcut();
                        
                        document.removeEventListener('keydown', keyDownHandler);
                        document.removeEventListener('keyup', keyUpHandler);
                        isShortcutInputFocused = false;
                        shortcutInput.style.borderColor = '#660000';
                        shortcutInput.style.boxShadow = 'none';
                        
                        const messageEl = document.getElementById('swResetMessage');
                        if (messageEl) {
                            messageEl.textContent = `Skrót ustawiony na: ${customShortcut}`;
                            messageEl.style.background = 'rgba(255, 51, 0, 0.1)';
                            messageEl.style.color = '#ff3300';
                            messageEl.style.border = '1px solid #ff3300';
                            messageEl.style.display = 'block';
                            
                            setTimeout(() => {
                                messageEl.style.display = 'none';
                            }, 3000);
                        }
                    } else {
                        shortcutInput.value = 'Musi zawierać Ctrl + klawisz';
                        setTimeout(() => {
                            shortcutInput.value = customShortcut;
                            document.removeEventListener('keydown', keyDownHandler);
                            document.removeEventListener('keyup', keyUpHandler);
                            isShortcutInputFocused = false;
                            shortcutInput.style.borderColor = '#660000';
                            shortcutInput.style.boxShadow = 'none';
                        }, 1500);
                    }
                }
                
                if (e.key === 'Escape') {
                    shortcutInput.value = customShortcut;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    isShortcutInputFocused = false;
                    shortcutInput.style.borderColor = '#660000';
                    shortcutInput.style.boxShadow = 'none';
                }
            };
            
            document.addEventListener('keydown', keyDownHandler);
            document.addEventListener('keyup', keyUpHandler);
            
            setTimeout(() => {
                if (isShortcutInputFocused) {
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    isShortcutInputFocused = false;
                    shortcutInput.value = customShortcut;
                    shortcutInput.style.borderColor = '#660000';
                    shortcutInput.style.boxShadow = 'none';
                }
            }, 10000);
        });
    }

    // 🔹 Setup event listenerów
    function setupEventListeners() {
        // Rozmiar czcionki
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            const savedSize = SW.GM_getValue(CONFIG.FONT_SIZE, '12');
            fontSizeSlider.value = savedSize;
            fontSizeValue.textContent = savedSize + 'px';
            
            fontSizeSlider.addEventListener('input', function() {
                const size = this.value;
                fontSizeValue.textContent = size + 'px';
                updatePanelFontSize(size);
                SW.GM_setValue(CONFIG.FONT_SIZE, size);
            });
        }

        // Przeźroczystość panelu
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        if (opacitySlider && opacityValue) {
            const savedOpacity = SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, '90');
            opacitySlider.value = savedOpacity;
            opacityValue.textContent = savedOpacity + '%';
            
            opacitySlider.addEventListener('input', function() {
                const opacity = this.value;
                opacityValue.textContent = opacity + '%';
                updatePanelOpacity(opacity);
                SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, opacity);
            });
        }

        // Skrót klawiszowy
        setupShortcutInput();

        // Przycisk odśwież
        const refreshBtn = document.getElementById('swRefreshButton');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                if (confirm('Czy na pewno chcesz odświeżyć stronę? Wszystkie niezapisane zmiany zostaną utracone.')) {
                    location.reload();
                }
            });
        }

        // Resetowanie ustawień
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) {
                    resetAllSettings();
                }
            });
        }

        // Filtry kategorii
        const filterEnabled = document.getElementById('filter-enabled');
        const filterDisabled = document.getElementById('filter-disabled');
        const filterFavorites = document.getElementById('filter-favorites');
        
        if (filterEnabled) {
            filterEnabled.addEventListener('change', function() {
                activeCategories.enabled = this.checked;
                saveCategoriesState();
                renderAddons();
            });
        }
        
        if (filterDisabled) {
            filterDisabled.addEventListener('change', function() {
                activeCategories.disabled = this.checked;
                saveCategoriesState();
                renderAddons();
            });
        }
        
        if (filterFavorites) {
            filterFavorites.addEventListener('change', function() {
                activeCategories.favorites = this.checked;
                saveCategoriesState();
                renderAddons();
            });
        }

        // Wyszukiwarka
        const searchInput = document.getElementById('searchAddons');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchQuery = this.value.toLowerCase();
                renderAddons();
            });
        }

        // Delegowane nasłuchiwanie dla dodatków
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('favorite-btn') || e.target.closest('.favorite-btn')) {
                const btn = e.target.classList.contains('favorite-btn') ? e.target : e.target.closest('.favorite-btn');
                const addonId = btn.dataset.id;
                if (addonId) {
                    toggleFavorite(addonId);
                }
            }
            
            if (e.target.type === 'checkbox' && e.target.closest('.addon-switch')) {
                const checkbox = e.target;
                const addonId = checkbox.dataset.id;
                const isEnabled = checkbox.checked;
                if (addonId) {
                    toggleAddon(addonId, isEnabled);
                }
            }
        });
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

    // 🔹 Aktualizacja rozmiaru czcionki
    function updatePanelFontSize(size) {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        panel.style.cssText = panel.style.cssText.replace(/font-size:[^;]+;/g, '');
        panel.style.setProperty('font-size', size + 'px', 'important');
        
        const allElements = panel.querySelectorAll('*');
        allElements.forEach(element => {
            element.style.cssText = element.style.cssText.replace(/font-size:[^;]+;/g, '');
            element.style.setProperty('font-size', size + 'px', 'important');
        });
    }

    // 🔹 Aktualizacja przeźroczystości panelu
    function updatePanelOpacity(opacity) {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        const opacityValue = opacity / 100;
        panel.style.opacity = opacityValue;
    }

    // 🔹 Toggle ulubionych
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

    // 🔹 Toggle dodatków
    function toggleAddon(addonId, isEnabled) {
        const addon = currentAddons.find(a => a.id === addonId);
        
        if (!addon) return;
        
        if (addon.locked && isEnabled) {
            const messageEl = document.getElementById('swAddonsMessage');
            if (messageEl) {
                messageEl.textContent = 'Ten dodatek wymaga aktywnej licencji premium!';
                messageEl.className = 'license-message license-error';
                messageEl.style.display = 'block';
                
                setTimeout(() => {
                    messageEl.style.display = 'none';
                }, 5000);
            }
            
            const checkbox = document.querySelector(`[data-id="${addonId}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
            
            showLicenseMessage('Ten dodatek wymaga aktywnej licencji premium!', 'error');
            return;
        }
        
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        currentAddons[addonIndex].enabled = isEnabled;
        
        saveAddonsState();
        
        if (addonId === 'kcs-icons') {
            SW.GM_setValue(CONFIG.KCS_ICONS_ENABLED, isEnabled);
            
            const message = isEnabled ? 
                'KCS Icons włączony. Odśwież grę, aby zmiana została zastosowana.' : 
                'KCS Icons wyłączony. Odśwież grę, aby zmiana została zastosowana.';
            
            const messageEl = document.getElementById('swAddonsMessage');
            if (messageEl) {
                messageEl.textContent = message;
                messageEl.className = 'license-message license-info';
                messageEl.style.display = 'block';
                
                setTimeout(() => {
                    messageEl.style.display = 'none';
                }, 5000);
            }
        }
        
        renderAddons();
    }

    // 🔹 Zapisz stan dodatków
    function saveAddonsState() {
        const addonsToSave = currentAddons.map(addon => ({
            id: addon.id,
            enabled: addon.enabled,
            favorite: addon.favorite
        }));
        
        SW.GM_setValue(CONFIG.FAVORITE_ADDONS, addonsToSave);
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
        
        activeCategories = {
            enabled: true,
            disabled: true,
            favorites: true
        };
        
        customShortcut = 'Ctrl+A';
        searchQuery = '';
        userAccountId = null;
        isLicenseVerified = false;
        licenseData = null;
        licenseExpiry = null;
        isAdmin = false;
        
        const resetMessage = document.getElementById('swResetMessage');
        if (resetMessage) {
            resetMessage.textContent = 'Ustawienia zresetowane! Licencja usunięta.';
            resetMessage.style.background = 'rgba(255, 102, 0, 0.1)';
            resetMessage.style.color = '#ff6600';
            resetMessage.style.border = '1px solid #ff6600';
            resetMessage.style.display = 'block';
            
            setTimeout(() => {
                resetMessage.style.display = 'none';
            }, 5000);
        }
        
        loadSavedState();
        updateFilterSwitches();
        renderAddons();
        updateAccountDisplay('Nie znaleziono');
        updateLicenseDisplay();
        
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.value = '12';
            fontSizeValue.textContent = '12px';
            updatePanelFontSize('12');
        }
        
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        if (opacitySlider && opacityValue) {
            opacitySlider.value = '90';
            opacityValue.textContent = '90%';
            updatePanelOpacity('90');
        }
        
        const shortcutInput = document.getElementById('shortcutInput');
        if (shortcutInput) {
            shortcutInput.value = 'Ctrl+A';
        }
        
        const searchInput = document.getElementById('searchAddons');
        if (searchInput) {
            searchInput.value = '';
        }
        
        setupKeyboardShortcut();
        setupShortcutInput();
        
        if (userAccountId) {
            setTimeout(() => checkAndUpdateLicense(userAccountId), 1000);
        }
    }

    // 🔹 Ładowanie zapisanego stanu
    function loadSavedState() {
        if (!SW || !SW.GM_getValue) return;
        
        const savedBtnPosition = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn && savedBtnPosition) {
            toggleBtn.style.left = savedBtnPosition.left;
            toggleBtn.style.top = savedBtnPosition.top;
        } else if (toggleBtn) {
            toggleBtn.style.left = '70px';
            toggleBtn.style.top = '70px';
        }
        
        const savedPosition = SW.GM_getValue(CONFIG.PANEL_POSITION);
        const panel = document.getElementById('swAddonsPanel');
        if (panel && savedPosition) {
            panel.style.left = savedPosition.left;
            panel.style.top = savedPosition.top;
        } else if (panel) {
            panel.style.left = '70px';
            panel.style.top = '140px';
        }
        
        const isVisible = SW.GM_getValue(CONFIG.PANEL_VISIBLE, false);
        if (panel) {
            panel.style.display = isVisible ? 'block' : 'none';
        }
        
        const savedSize = SW.GM_getValue(CONFIG.FONT_SIZE, '12');
        updatePanelFontSize(savedSize);
        
        const savedOpacity = SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, '90');
        updatePanelOpacity(savedOpacity);
    }

    // 🔹 Ładowanie stanu dodatków
    function loadAddonsState() {
        const favoriteIds = SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []);
        const kcsEnabled = SW.GM_getValue(CONFIG.KCS_ICONS_ENABLED, false);
        
        currentAddons = currentAddons.map(addon => {
            const savedAddon = favoriteIds.find(a => a.id === addon.id);
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

    // 🔹 Ładowanie kategorii
    function loadCategoriesState() {
        const savedCategories = SW.GM_getValue(CONFIG.ACTIVE_CATEGORIES, {
            enabled: true,
            disabled: true,
            favorites: true
        });
        
        activeCategories = { ...savedCategories };
    }

    // 🔹 Zapisywanie kategorii
    function saveCategoriesState() {
        SW.GM_setValue(CONFIG.ACTIVE_CATEGORIES, activeCategories);
    }

    // 🔹 Update przełączników filtrów
    function updateFilterSwitches() {
        const enabledFilter = document.getElementById('filter-enabled');
        const disabledFilter = document.getElementById('filter-disabled');
        const favoritesFilter = document.getElementById('filter-favorites');
        
        if (enabledFilter) enabledFilter.checked = activeCategories.enabled;
        if (disabledFilter) disabledFilter.checked = activeCategories.disabled;
        if (favoritesFilter) favoritesFilter.checked = activeCategories.favorites;
    }

    // 🔹 Ładowanie ustawień
    function loadSettings() {
        customShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
    }

    // 🔹 Główne funkcje panelu
    async function initPanel() {
        console.log('✅ Initializing panel v3.0...');
        
        injectCSS();
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        loadCategoriesState();
        loadSettings();
        
        createToggleButton();
        createMainPanel();
        
        loadSavedState();
        
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn) {
            setupToggleDrag(toggleBtn);
        }
        
        setupEventListeners();
        setupTabs();
        setupDrag();
        setupKeyboardShortcut();
        
        panelInitialized = true;
        
        // Inicjalizuj konto i licencję
        setTimeout(async () => {
            await initAccountAndLicense();
            
            // Automatyczne odświeżanie statusu licencji co 5 minut
            setInterval(() => {
                if (userAccountId) {
                    checkAndUpdateLicense(userAccountId);
                }
            }, 5 * 60 * 1000);
        }, 1000);
    }

    // 🔹 Start panelu
    console.log('🎯 Starting Synergy Panel v3.0...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('✅ DOM loaded, initializing panel...');
            initPanel();
            console.log('✅ Synergy panel ready!');
        });
    } else {
        console.log('✅ DOM already loaded, initializing panel...');
        initPanel();
        console.log('✅ Synergy panel ready!');
    }
})();