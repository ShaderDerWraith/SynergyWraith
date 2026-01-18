// synergy.js - Główny kod panelu Synergy (v4.4 - Fixed Edition)
(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v4.4 (Fixed Edition)');

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
        SHORTCUTS_ENABLED: "sw_shortcuts_enabled",
        ADMIN_LICENSES: "sw_admin_licenses",
        PANEL_SETTINGS_EXPORT: "sw_panel_settings_export"
    };

    // 🔹 Lista dostępnych dodatków
    let ADDONS = [
        {
            id: 'enhanced-stats',
            name: 'Enhanced Stats',
            description: 'Rozszerzone statystyki postaci',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false,
            shortcut: null
        },
        {
            id: 'trade-helper',
            name: 'Trade Helper',
            description: 'Pomocnik handlu i aukcji',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false,
            shortcut: null
        },
        {
            id: 'chat-manager',
            name: 'Chat Manager',
            description: 'Zaawansowane zarządzanie czatem',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false,
            shortcut: null
        },
        {
            id: 'quest-logger',
            name: 'Quest Logger',
            description: 'Logowanie postępów w zadaniach',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false,
            shortcut: null
        },
        // DODATKI PREMIUM
        {
            id: 'kcs-icons',
            name: 'KCS Icons',
            description: 'Profesjonalne ikony KCS do interfejsu',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true,
            shortcut: null
        },
        {
            id: 'auto-looter',
            name: 'Auto Looter',
            description: 'Inteligentny zbieracz łupów',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true,
            shortcut: null
        },
        {
            id: 'quest-helper',
            name: 'Quest Helper',
            description: 'Pełna pomoc w zadaniach z mapą',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true,
            shortcut: null
        },
        {
            id: 'combat-log',
            name: 'Combat Log',
            description: 'Szczegółowy log walki z analizą',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true,
            shortcut: null
        },
        {
            id: 'auto-potion',
            name: 'Auto Potion',
            description: 'Automatyczne używanie mikstur',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true,
            shortcut: null
        },
        {
            id: 'fishing-bot',
            name: 'Fishing Bot',
            description: 'Automatyczne łowienie ryb',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true,
            shortcut: null
        }
    ];

    // 🔹 URL do pliku licencji
    const LICENSES_URL = 'https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/docs/licenses.json';
    
    // ⭐ ID admina
    const ADMIN_ACCOUNT_ID = '7411461';

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
    let currentFontSize = 12;
    let currentFilter = 'all'; // 'all', 'enabled', 'disabled', 'favorites'

    // =========================================================================
    // 🔹 FUNKCJE LICENCJI
    // =========================================================================

    // 🔹 Pobierz licencje z GitHub RAW
    async function getLicensesFromGitHub() {
        try {
            console.log('📄 Pobieram licencje z:', LICENSES_URL);
            const timestamp = Date.now();
            
            const response = await fetch(`${LICENSES_URL}?t=${timestamp}`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.error('❌ Błąd HTTP:', response.status, response.statusText);
                return null;
            }
            
            const text = await response.text();
            console.log('📋 Otrzymano odpowiedź:', text.substring(0, 200) + '...');
            
            let cleanedText = text.trim();
            
            if (cleanedText.charCodeAt(0) === 0xFEFF) {
                cleanedText = cleanedText.substring(1);
            }
            
            cleanedText = cleanedText.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
            
            try {
                const licenses = JSON.parse(cleanedText);
                console.log('✅ Poprawnie sparsowano licencje');
                return licenses;
            } catch (parseError) {
                console.error('❌ Błąd parsowania JSON:', parseError);
                
                const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
                if (arrayMatch) {
                    try {
                        const licenses = JSON.parse(arrayMatch[0]);
                        console.log('✅ Wyciągnięto tablicę z tekstu');
                        return licenses;
                    } catch (e2) {
                        console.error('❌ Nie udało się wyciągnąć tablicy');
                    }
                }
                
                return null;
            }
            
        } catch (error) {
            console.error('❌ Nie można pobrać licencji:', error.message);
            return null;
        }
    }

    // 🔹 Sprawdź czy użytkownik jest adminem
    function checkIfAdmin(accountId) {
        if (!accountId) return false;
        return accountId.toString() === ADMIN_ACCOUNT_ID;
    }

    // 🔹 Sprawdź licencję dla konta
    async function checkLicenseForAccount(accountId) {
        try {
            console.log('🔍 Sprawdzam licencję dla:', accountId);
            
            if (checkIfAdmin(accountId)) {
                console.log('👑 To jest konto admina - zawsze premium');
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 10);
                
                return {
                    success: true,
                    hasLicense: true,
                    expired: false,
                    used: false,
                    expiry: expiryDate.toISOString(),
                    daysLeft: 3650,
                    addons: ['all'],
                    type: 'premium',
                    accountId: accountId,
                    source: 'admin'
                };
            }

            const licenses = await getLicensesFromGitHub();
            
            if (!licenses) {
                console.log('📭 Nie udało się pobrać licencji');
                return {
                    success: true,
                    hasLicense: false,
                    message: 'Brak połączenia z serwerem licencji',
                    accountId: accountId,
                    source: 'github'
                };
            }
            
            if (!Array.isArray(licenses)) {
                console.log('❌ Licencje nie są tablicą:', typeof licenses);
                return {
                    success: true,
                    hasLicense: false,
                    message: 'Nieprawidłowy format licencji',
                    accountId: accountId,
                    source: 'github'
                };
            }
            
            if (licenses.length === 0) {
                console.log('📭 Brak licencji w pliku');
                return {
                    success: true,
                    hasLicense: false,
                    message: 'Brak licencji w systemie',
                    accountId: accountId,
                    source: 'github'
                };
            }

            const accountIdStr = accountId.toString();
            console.log('🔎 Szukam licencji dla:', accountIdStr);
            console.log('📋 Dostępne ID:', licenses.map(l => l.userId));
            
            const license = licenses.find(l => {
                if (!l.userId) return false;
                return l.userId.toString() === accountIdStr;
            });

            if (!license) {
                console.log('❌ Brak licencji dla ID:', accountIdStr);
                return {
                    success: true,
                    hasLicense: false,
                    message: 'Brak aktywnej licencji',
                    accountId: accountId,
                    source: 'github'
                };
            }

            const now = new Date();
            const expiry = new Date(license.expiry);
            const isExpired = expiry < now;
            
            const status = license.status || 'active';
            const isActive = status === 'active' && !isExpired;
            
            const daysLeft = isActive ? Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))) : 0;

            console.log('📊 Status licencji:', {
                userId: license.userId,
                status: status,
                isActive,
                isExpired,
                expiry: expiry.toLocaleDateString(),
                now: now.toLocaleDateString(),
                daysLeft
            });

            return {
                success: true,
                hasLicense: isActive,
                expired: isExpired,
                used: license.used || false,
                expiry: license.expiry,
                daysLeft: daysLeft,
                addons: ['all'],
                type: 'premium',
                accountId: accountId,
                source: 'github',
                licenseData: license
            };

        } catch (error) {
            console.error('❌ Błąd podczas sprawdzania licencji:', error);
            return {
                success: false,
                error: error.message,
                hasLicense: false
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
        console.log('👤 ID konta:', accountId);
        
        if (accountId) {
            userAccountId = accountId;
            SW.GM_setValue(CONFIG.ACCOUNT_ID, accountId);
            
            isAdmin = checkIfAdmin(accountId);
            SW.GM_setValue(CONFIG.ADMIN_ACCESS, isAdmin);
            
            updateAccountDisplay(accountId);
            await checkAndUpdateLicense(accountId);
            
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
            console.log('📋 Wynik licencji:', result);
            
            if (result.success) {
                if (result.hasLicense && !result.expired && !result.used) {
                    isLicenseVerified = true;
                    licenseData = result;
                    licenseExpiry = result.expiry ? new Date(result.expiry) : null;
                    
                    SW.GM_setValue(CONFIG.LICENSE_ACTIVE, true);
                    SW.GM_setValue(CONFIG.LICENSE_EXPIRY, licenseExpiry?.toISOString());
                    SW.GM_setValue(CONFIG.LICENSE_DATA, licenseData);
                    
                    loadAddonsBasedOnLicense(result.addons || ['all']);
                    showLicenseMessage(`✅ Licencja aktywna! Ważna do: ${licenseExpiry ? licenseExpiry.toLocaleDateString('pl-PL') : 'bezterminowo'}`, 'success');
                } else {
                    isLicenseVerified = false;
                    licenseData = null;
                    licenseExpiry = null;
                    
                    SW.GM_setValue(CONFIG.LICENSE_ACTIVE, false);
                    SW.GM_deleteValue(CONFIG.LICENSE_EXPIRY);
                    SW.GM_deleteValue(CONFIG.LICENSE_DATA);
                    
                    loadAddonsBasedOnLicense([]);
                    
                    if (result.expired) {
                        showLicenseMessage('❌ Licencja wygasła. Dostęp tylko do darmowych dodatków.', 'error');
                    } else if (result.used) {
                        showLicenseMessage('⚠️ Licencja została już użyta. Dostęp tylko do darmowych dodatków.', 'error');
                    } else {
                        showLicenseMessage('ℹ️ Brak aktywnej licencji. Dostęp tylko do darmowych dodatków.', 'info');
                    }
                }
            } else {
                console.error('❌ Błąd licencji:', result.error);
                serverConnected = false;
                loadAddonsBasedOnLicense([]);
                showLicenseMessage('⚠️ Problem z połączeniem. Używam zapisanych ustawień.', 'info');
            }
        } catch (error) {
            console.error('❌ Błąd:', error);
            loadAddonsBasedOnLicense([]);
        } finally {
            isCheckingLicense = false;
            updateLicenseDisplay();
        }
    }

    function loadAddonsBasedOnLicense(allowedAddons = []) {
        console.log('📦 Ładowanie dodatków:', {
            isLicenseVerified,
            allowedAddons
        });
        
        const isPremiumAllowed = isLicenseVerified;
        
        currentAddons = ADDONS.map(addon => {
            const isFree = addon.type === 'free';
            const isPremium = addon.type === 'premium';
            
            return {
                ...addon,
                enabled: false,
                favorite: addon.favorite || false,
                hidden: isPremium && !isPremiumAllowed,
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
        // 🔹 Domyślnie włącz wszystkie skróty
        Object.keys(addonShortcuts).forEach(addonId => {
            if (shortcutsEnabled[addonId] === undefined) {
                shortcutsEnabled[addonId] = true;
            }
        });
        saveShortcutsEnabledState();
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
            accountEl.innerHTML = `${accountId} <span class="copy-icon" title="Kopiuj do schowka">📋</span>`;
            accountEl.className = 'license-status-value';
            
            const copyIcon = accountEl.querySelector('.copy-icon');
            if (copyIcon) {
                copyIcon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    navigator.clipboard.writeText(accountId).then(() => {
                        showLicenseMessage('✅ ID konta skopiowane do schowka', 'success');
                    }).catch(err => {
                        console.error('Błąd kopiowania: ', err);
                        showLicenseMessage('❌ Nie udało się skopiować ID', 'error');
                    });
                });
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
            expiryEl.textContent = licenseExpiry ? licenseExpiry.toLocaleDateString('pl-PL') : '-';
        }
        
        if (serverEl) {
            serverEl.textContent = serverConnected ? 'Aktywne' : 'Brak połączenia';
            serverEl.className = serverConnected ? 'license-status-connected' : 'license-status-disconnected';
        }
        
        if (daysEl) {
            if (licenseData && licenseData.daysLeft !== undefined) {
                daysEl.textContent = `${licenseData.daysLeft} dni`;
                daysEl.className = licenseData.daysLeft < 7 ? 'license-status-warning' : 'license-status-valid';
            } else {
                daysEl.textContent = '-';
            }
        }
    }

    // 🔹 POPRAWIONA: Funkcja applyFontSize - PRZYCISKI GÓRA/DÓŁ
    function applyFontSize(size, updateSlider = false) {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        const minSize = 10;
        const maxSize = 16;
        const clampedSize = Math.max(minSize, Math.min(maxSize, size));
        
        currentFontSize = clampedSize;
        panel.style.fontSize = clampedSize + 'px';
        
        SW.GM_setValue(CONFIG.FONT_SIZE, clampedSize);
        
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeValue) {
            fontSizeValue.textContent = clampedSize + 'px';
        }
        
        if (updateSlider) {
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            if (fontSizeSlider) {
                fontSizeSlider.value = clampedSize;
            }
        }
        
        console.log('🔠 Zmieniono rozmiar czcionki na:', clampedSize + 'px');
    }

    // 🔹 POPRAWIONA: Funkcja applyOpacity
    function applyOpacity(opacity) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const minOpacity = 30;
            const maxOpacity = 100;
            const clampedOpacity = Math.max(minOpacity, Math.min(maxOpacity, opacity));
            
            panel.style.opacity = clampedOpacity / 100;
            
            SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, clampedOpacity);
            
            const opacityValueEl = document.getElementById('opacityValue');
            if (opacityValueEl) {
                opacityValueEl.textContent = clampedOpacity + '%';
            }
            
            const opacitySlider = document.getElementById('opacitySlider');
            if (opacitySlider) {
                opacitySlider.value = clampedOpacity;
            }
        }
    }

    // 🔹 Tworzenie przycisku przełączania (TYLKO TEKST)
    function createToggleButton() {
        const oldToggle = document.getElementById('swPanelToggle');
        if (oldToggle) oldToggle.remove();
        
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
        toggleBtn.innerHTML = 'SYNERGY'; // TYLKO TEKST
        
        document.body.appendChild(toggleBtn);
        console.log('✅ Toggle button created (text only)');
        
        return toggleBtn;
    }

    // 🔹 Tworzenie głównego panelu (Z WSZYSTKIMI POPRAWKAMI)
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        panel.innerHTML = `
            <div id="swPanelHeader">
                <strong>SYNERGY PANEL v4.4</strong>
                ${isAdmin ? ' <span style="color:#00ff00; font-size:14px;">👑</span>' : ''}
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">🎮 Dodatki</button>
                <button class="tablink" data-tab="shortcuts">⌨️ Skróty</button>
                <button class="tablink" data-tab="license">🔐 Licencja</button>
                <button class="tablink" data-tab="settings">⚙️ Ustawienia</button>
                <button class="tablink" data-tab="info">ℹ️ Info</button>
            </div>

            <!-- ZAKŁADKA DODATKI - Z SCROLLEM I FILTRAMI -->
            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div style="width:100%; max-width:800px; margin:0 auto 15px auto;">
                        <input type="text" id="searchAddons" placeholder="🔍 Wyszukaj dodatki..." 
                               style="width:100%; padding:10px 15px; background:rgba(51,0,0,0.8); 
                                      border:1px solid #660000; border-radius:6px; color:#ffcc00; 
                                      font-size:12px; box-sizing:border-box;">
                    </div>
                    
                    <div class="addon-filters">
                        <button class="filter-btn active" data-filter="all">Wszystkie</button>
                        <button class="filter-btn" data-filter="enabled">Włączone</button>
                        <button class="filter-btn" data-filter="disabled">Wyłączone</button>
                        <button class="filter-btn" data-filter="favorites">Ulubione</button>
                    </div>
                    
                    <div class="addon-list-container">
                        <div class="addon-list" id="addon-list">
                            <!-- Lista dodatków będzie dodana dynamicznie -->
                        </div>
                    </div>
                    
                    <div class="refresh-button-container">
                        <button class="refresh-button" id="swSaveAndRestartButton">💾 Zapisz i odśwież grę</button>
                    </div>
                    
                    <div id="swAddonsMessage" class="license-message" style="display: none;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA SKRÓTY - Z SCROLLEM -->
            <div id="shortcuts" class="tabcontent">
                <div class="sw-tab-content">
                    <div style="margin-bottom:15px; padding:15px; background:linear-gradient(135deg, rgba(51,0,0,0.9), rgba(102,0,0,0.9)); border-radius:8px; border:1px solid #660000; width:100%; max-width:800px;">
                        <h3 style="color:#ffcc00; margin-top:0; margin-bottom:5px; font-size:14px; text-align:center;">⌨️ Skróty klawiszowe</h3>
                        <p style="color:#ff9966; font-size:12px; margin:0; text-align:center;">
                            Skróty pokazują się tylko dla włączonych dodatków
                        </p>
                    </div>
                    
                    <div class="shortcuts-list-container">
                        <div id="shortcuts-list" style="width:100%;">
                            <!-- Skróty będą dodane dynamicznie -->
                        </div>
                    </div>
                    
                    <div id="shortcutsMessage" class="license-message" style="display:none; margin-top:10px; width:100%; max-width:800px;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA LICENCJA - Z SCROLLEM -->
            <div id="license" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="scrollable-content">
                        <div class="license-container">
                            <div class="license-header">📊 Status Licencji</div>
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
                                <span class="license-status-label">Dni pozostało:</span>
                                <span id="swLicenseDaysLeft" class="license-status-value">-</span>
                            </div>
                        </div>
                        
                        <div class="license-container" style="margin-top:15px;">
                            <div class="license-header">🎫 Informacje o Premium</div>
                            <div style="padding:15px; color:#ffcc00; font-size:12px; text-align:center;">
                                <p>Aby uzyskać dostęp do dodatków premium, skontaktuj się z administratorem.</p>
                                <p style="color:#ff9966; font-size:11px; margin-top:10px;">
                                    Licencje przyznawane są czasowo (np. 30 dni).
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>

            <!-- ZAKŁADKA USTAWIENIA - Z SCROLLEM I EKSPORT/IMPORT -->
            <div id="settings" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="scrollable-content">
                        <div class="settings-item">
                            <div class="settings-label">📝 Rozmiar czcionki:</div>
                            <div class="font-size-controls">
                                <button class="font-size-btn" id="fontSizeDecrease" title="Zmniejsz czcionkę">-</button>
                                <div class="font-size-display" id="fontSizeValue">12px</div>
                                <button class="font-size-btn" id="fontSizeIncrease" title="Zwiększ czcionkę">+</button>
                            </div>
                            <small style="color:#ff9966; font-size:11px; display:block; text-align:center;">Kliknij +/- aby zmienić (10-16px)</small>
                        </div>
                        
                        <div class="settings-item">
                            <div class="settings-label">🎨 Przeźroczystość panelu:</div>
                            <div class="slider-container">
                                <input type="range" min="30" max="100" value="90" class="opacity-slider" id="opacitySlider" step="1">
                                <span class="slider-value" id="opacityValue">90%</span>
                            </div>
                            <small style="color:#ff9966; font-size:11px; display:block; text-align:center;">30-100%</small>
                        </div>
                        
                        <div class="settings-item">
                            <div class="settings-label">⌨️ Skrót do panelu:</div>
                            <div style="display:flex; gap:10px; align-items:center; margin-bottom:5px;">
                                <input type="text" id="panelShortcutInput" 
                                       style="flex:1; padding:10px; background:rgba(51,0,0,0.8); border:1px solid #660000; 
                                              border-radius:5px; color:#ffcc00; font-size:12px; text-align:center;" 
                                       value="Ctrl+A" readonly>
                                <button id="panelShortcutSetBtn">Ustaw</button>
                            </div>
                            <small style="color:#ff9966; font-size:11px; display:block; text-align:center;">Kliknij "Ustaw" i wciśnij kombinację</small>
                        </div>
                        
                        <div class="import-export-container">
                            <div class="settings-label">📥📤 Eksport/Import ustawień:</div>
                            <div class="import-export-buttons">
                                <button class="import-export-btn" id="exportSettingsBtn">Eksportuj</button>
                                <button class="import-export-btn" id="importSettingsBtn">Importuj</button>
                            </div>
                            <textarea class="import-export-textarea" id="settingsTextarea" 
                                      placeholder="Wklej tutaj dane do importu lub zobacz wyeksportowane ustawienia..."></textarea>
                        </div>
                        
                        <div style="margin-top:20px; padding-top:15px; border-top:1px solid #660000; width:100%; max-width:600px;">
                            <button id="swResetButton">🔄 Resetuj ustawienia</button>
                        </div>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top:15px; padding:12px; border-radius:6px; display:none; font-size:12px; width:100%; max-width:600px; text-align:center;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA INFO - RESPONSYWNA -->
            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="scrollable-content">
                        <div style="text-align:center; padding:20px; width:100%; max-width:800px;">
                            <h3 style="color:#ffcc00; margin-bottom:20px; font-size:20px;">ℹ️ Synergy Panel v4.4</h3>
                            
                            <div style="background:linear-gradient(135deg, rgba(51,0,0,0.9), rgba(102,0,0,0.9)); 
                                        border:1px solid #660000; border-radius:8px; padding:20px; margin-bottom:15px;">
                                <h4 style="color:#ff9966; margin-top:0; font-size:16px;">🎮 System Dodatków</h4>
                                <p style="color:#ffcc00; font-size:12px; margin:8px 0;">
                                    • Darmowe dodatki: dostępne dla każdego
                                </p>
                                <p style="color:#00ff00; font-size:12px; margin:8px 0;">
                                    • Premium dodatki: wymagają aktywnej licencji
                                </p>
                                <p style="color:#ff9966; font-size:11px; margin:8px 0;">
                                    • Filtry: Wszystkie / Włączone / Wyłączone / Ulubione
                                </p>
                            </div>
                            
                            <div style="background:linear-gradient(135deg, rgba(51,0,0,0.9), rgba(102,0,0,0.9)); 
                                        border:1px solid #660000; border-radius:8px; padding:20px; margin-bottom:15px;">
                                <h4 style="color:#ff9966; margin-top:0; font-size:16px;">🔐 System Licencji</h4>
                                <p style="color:#ffcc00; font-size:12px; margin:8px 0;">
                                    • Licencje przyznawane przez administratora
                                </p>
                                <p style="color:#ffcc00; font-size:12px; margin:8px 0;">
                                    • Ważność czasowa (30 dni, 90 dni, etc.)
                                </p>
                                <p style="color:#ffcc00; font-size:12px; margin:8px 0;">
                                    • Automatyczne odświeżanie statusu
                                </p>
                            </div>
                            
                            <div style="background:linear-gradient(135deg, rgba(51,0,0,0.9), rgba(102,0,0,0.9)); 
                                        border:1px solid #660000; border-radius:8px; padding:20px; margin-bottom:15px;">
                                <h4 style="color:#ff9966; margin-top:0; font-size:16px;">⚙️ Nowe Funkcje</h4>
                                <p style="color:#ffcc00; font-size:12px; margin:8px 0;">
                                    • Eksport/Import ustawień jako tekst
                                </p>
                                <p style="color:#ffcc00; font-size:12px; margin:8px 0;">
                                    • Filtry dodatków
                                </p>
                                <p style="color:#ffcc00; font-size:12px; margin:8px 0;">
                                    • Skróty domyślnie włączone
                                </p>
                                <p style="color:#ffcc00; font-size:12px; margin:8px 0;">
                                    • Płynniejsze przesuwanie panelu
                                </p>
                            </div>
                            
                            <div style="color:#ff9966; font-size:11px; margin-top:25px; padding:15px; 
                                        background:rgba(51,0,0,0.5); border-radius:6px;">
                                <p style="margin:5px 0;">© 2024 Synergy Panel | Wersja 4.4</p>
                                <p style="margin:5px 0;">System licencji GitHub RAW</p>
                                <p style="margin:5px 0;">Fixed Edition - Wszystkie poprawki</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        console.log('✅ Panel created - v4.4');
        
        initializeEventListeners();
        loadSettings();
        
        // 🔹 Inicjalizacja przeciągania CAŁEGO PANELU
        setupPanelDrag();
    }

    // 🔹 Renderowanie dodatków z FILTRAMI
    function renderAddons() {
        const listContainer = document.getElementById('addon-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        let filteredAddons = currentAddons.filter(addon => !addon.hidden);
        
        // 🔹 FILTROWANIE
        switch(currentFilter) {
            case 'enabled':
                filteredAddons = filteredAddons.filter(addon => addon.enabled);
                break;
            case 'disabled':
                filteredAddons = filteredAddons.filter(addon => !addon.enabled);
                break;
            case 'favorites':
                filteredAddons = filteredAddons.filter(addon => addon.favorite);
                break;
            // 'all' - wszystkie
        }
        
        // 🔹 WYSZUKIWANIE
        if (searchQuery) {
            filteredAddons = filteredAddons.filter(addon => 
                addon.name.toLowerCase().includes(searchQuery) || 
                addon.description.toLowerCase().includes(searchQuery)
            );
        }
        
        if (filteredAddons.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center; padding:40px; color:#ff9966; font-style:italic; font-size:12px; width:100%;">
                    ${searchQuery || currentFilter !== 'all' ? 'Nie znaleziono dodatków' : 'Brak dostępnych dodatków'}
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
                            title="${addon.locked ? 'Wymaga licencji' : 'Dodaj do ulubionych'}"
                            ${addon.locked ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
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
        
        // 🔹 EVENT LISTENERS dla przycisków ulubionych
        document.querySelectorAll('.favorite-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const addonId = this.dataset.id;
                if (addonId) toggleFavorite(addonId);
            });
        });
        
        // 🔹 EVENT LISTENERS dla przełączników
        document.querySelectorAll('.addon-switch input:not(:disabled)').forEach(checkbox => {
            checkbox.addEventListener('change', function(e) {
                e.stopPropagation();
                const addonId = this.dataset.id;
                if (addonId) toggleAddon(addonId, this.checked);
            });
        });
    }

    // 🔹 Renderowanie skrótów (DOMYŚLNIE WŁĄCZONE)
    function renderShortcuts() {
        const container = document.getElementById('shortcuts-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const enabledAddons = currentAddons.filter(addon => 
            addon.enabled && !addon.locked && !addon.hidden
        );
        
        if (enabledAddons.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:30px; color:#ff9966; font-style:italic; font-size:12px; width:100%;">
                    Brak włączonych dodatków. Włącz dodatek w zakładce "Dodatki".
                </div>
            `;
            return;
        }
        
        enabledAddons.forEach(addon => {
            const shortcut = addonShortcuts[addon.id] || 'Brak skrótu';
            const isEnabled = shortcutsEnabled[addon.id] !== false;
            
            const item = document.createElement('div');
            item.className = 'shortcut-item';
            item.innerHTML = `
                <div class="shortcut-info">
                    <div class="shortcut-name">
                        ${addon.type === 'premium' ? '<span class="premium-badge">PREMIUM</span> ' : ''}
                        ${addon.name}
                    </div>
                    <div class="shortcut-desc">${addon.description}</div>
                </div>
                <div class="shortcut-controls">
                    <div class="shortcut-display" id="shortcut-display-${addon.id}">
                        ${shortcut}
                    </div>
                    <button class="shortcut-set-btn" data-id="${addon.id}">Ustaw</button>
                    <button class="shortcut-clear-btn" data-id="${addon.id}">Wyczyść</button>
                    <label class="shortcut-toggle" title="${isEnabled ? 'Wyłącz skrót' : 'Włącz skrót'}">
                        <input type="checkbox" ${isEnabled ? 'checked' : ''} data-id="${addon.id}" class="shortcut-toggle-input">
                        <span class="shortcut-toggle-slider"></span>
                    </label>
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
        
        document.querySelectorAll('.shortcut-toggle-input').forEach(toggle => {
            toggle.addEventListener('change', function() {
                const addonId = this.dataset.id;
                toggleShortcutEnabled(addonId, this.checked);
            });
        });
    }

    function toggleFavorite(addonId) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        
        currentAddons[addonIndex].favorite = !currentAddons[addonIndex].favorite;
        saveAddonsState();
        renderAddons();
        
        // 🔹 Jeśli jesteśmy w filtrze ulubionych, odśwież
        if (currentFilter === 'favorites') {
            renderAddons();
        }
    }

    function toggleAddon(addonId, isEnabled) {
        const addon = currentAddons.find(a => a.id === addonId);
        if (!addon || addon.locked) return;
        
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        currentAddons[addonIndex].enabled = isEnabled;
        saveAddonsState();
        
        const messageEl = document.getElementById('swAddonsMessage');
        if (messageEl) {
            messageEl.textContent = `${addon.name} ${isEnabled ? 'włączony' : 'wyłączony'}`;
            messageEl.className = `license-message license-${isEnabled ? 'success' : 'info'}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 3000);
        }
        
        // 🔹 Jeśli jesteśmy w zakładce skrótów, odśwież
        if (document.getElementById('shortcuts').classList.contains('active')) {
            renderShortcuts();
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

    function clearAddonShortcut(addonId) {
        delete addonShortcuts[addonId];
        saveAddonShortcuts();
        
        const display = document.getElementById(`shortcut-display-${addonId}`);
        if (display) {
            display.textContent = 'Brak skrótu';
        }
        
        shortcutsEnabled[addonId] = false;
        saveShortcutsEnabledState();
        
        showShortcutMessage('Skrót wyczyszczony', 'info');
    }

    function toggleShortcutEnabled(addonId, enabled) {
        shortcutsEnabled[addonId] = enabled;
        saveShortcutsEnabledState();
        showShortcutMessage(enabled ? '✅ Skrót włączony' : '⚠️ Skrót wyłączony', 'info');
    }

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
                
                shortcutsEnabled[addonId] = true;
                saveShortcutsEnabledState();
                
                display.textContent = shortcut;
                display.style.color = '#00ff00';
                display.style.borderColor = '#00cc00';
                
                showShortcutMessage(`✅ Skrót ustawiony: ${shortcut}`, 'success');
                
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
                
                const oldShortcut = addonShortcuts[addonId] || 'Brak skrótu';
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
                
                const oldShortcut = addonShortcuts[addonId] || 'Brak skrótu';
                display.textContent = oldShortcut;
                display.style.color = '#ffcc00';
                display.style.borderColor = '#660000';
                
                showShortcutMessage('⏰ Czas minął', 'error');
            }
        }, 10000);
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

    // 🔹 Setup skrótu panelu
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
                        messageEl.textContent = `✅ Skrót ustawiony: ${panelShortcut}`;
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

    // 🔹 Setup globalnych skrótów
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
                if (!shortcut || shortcutsEnabled[addonId] === false) return;
                
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
                    if (addon && addon.enabled && !addon.locked) {
                        toggleAddon(addonId, false);
                        showShortcutMessage(`⚠️ ${addon.name} wyłączony (${shortcut})`, 'info');
                    }
                }
            });
        });
    }

    // 🔹 Inicjalizacja event listenerów
    function initializeEventListeners() {
        // Przycisk zapisz i odśwież
        const saveRestartBtn = document.getElementById('swSaveAndRestartButton');
        if (saveRestartBtn) {
            saveRestartBtn.addEventListener('click', () => {
                saveAddonsState();
                showLicenseMessage('✅ Zapisano ustawienia! Odświeżanie gry...', 'success');
                setTimeout(() => location.reload(), 1500);
            });
        }
        
        // Reset ustawień
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) {
                    resetAllSettings();
                }
            });
        }
        
        // 🔹 PRZYCISKI ZMIANY CZCIONKI (GÓRA/DÓŁ)
        const fontSizeDecrease = document.getElementById('fontSizeDecrease');
        const fontSizeIncrease = document.getElementById('fontSizeIncrease');
        
        if (fontSizeDecrease) {
            fontSizeDecrease.addEventListener('click', function() {
                applyFontSize(currentFontSize - 1);
            });
        }
        
        if (fontSizeIncrease) {
            fontSizeIncrease.addEventListener('click', function() {
                applyFontSize(currentFontSize + 1);
            });
        }
        
        // 🔹 SUWAK PRZEŹROCZYSTOŚCI
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        if (opacitySlider && opacityValue) {
            opacitySlider.addEventListener('input', function() {
                const opacity = parseInt(this.value);
                opacityValue.textContent = opacity + '%';
                applyOpacity(opacity);
            });
        }
        
        // 🔹 FILTRY DODATKÓW
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderAddons();
            });
        });
        
        // 🔹 EKSPORT/IMPORT USTAWIEN
        const exportBtn = document.getElementById('exportSettingsBtn');
        const importBtn = document.getElementById('importSettingsBtn');
        const settingsTextarea = document.getElementById('settingsTextarea');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', exportSettings);
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', importSettings);
        }
        
        setupPanelShortcutInput();
        setupTabs();
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

    // 🔹 Eksport ustawień
    function exportSettings() {
        const settings = {
            version: '4.4',
            timestamp: new Date().toISOString(),
            addons: SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []),
            shortcuts: SW.GM_getValue(CONFIG.SHORTCUTS_CONFIG, {}),
            shortcutsEnabled: SW.GM_getValue(CONFIG.SHORTCUTS_ENABLED, {}),
            panelShortcut: SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A'),
            fontSize: SW.GM_getValue(CONFIG.FONT_SIZE, 12),
            opacity: SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90),
            licenseData: SW.GM_getValue(CONFIG.LICENSE_DATA, null)
        };
        
        const jsonString = JSON.stringify(settings, null, 2);
        const textarea = document.getElementById('settingsTextarea');
        if (textarea) {
            textarea.value = jsonString;
            showLicenseMessage('✅ Ustawienia wyeksportowane! Skopiuj tekst powyżej.', 'success');
        }
    }

    // 🔹 Import ustawień
    function importSettings() {
        const textarea = document.getElementById('settingsTextarea');
        if (!textarea || !textarea.value.trim()) {
            showLicenseMessage('❌ Brak danych do importu', 'error');
            return;
        }
        
        try {
            const settings = JSON.parse(textarea.value);
            
            if (settings.version !== '4.4') {
                if (!confirm('To ustawienia z innej wersji. Kontynuować?')) {
                    return;
                }
            }
            
            if (settings.addons) SW.GM_setValue(CONFIG.FAVORITE_ADDONS, settings.addons);
            if (settings.shortcuts) SW.GM_setValue(CONFIG.SHORTCUTS_CONFIG, settings.shortcuts);
            if (settings.shortcutsEnabled) SW.GM_setValue(CONFIG.SHORTCUTS_ENABLED, settings.shortcutsEnabled);
            if (settings.panelShortcut) SW.GM_setValue(CONFIG.CUSTOM_SHORTCUT, settings.panelShortcut);
            if (settings.fontSize) SW.GM_setValue(CONFIG.FONT_SIZE, settings.fontSize);
            if (settings.opacity) SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, settings.opacity);
            
            showLicenseMessage('✅ Ustawienia zaimportowane! Odświeżanie...', 'success');
            setTimeout(() => location.reload(), 2000);
            
        } catch (error) {
            console.error('❌ Błąd importu:', error);
            showLicenseMessage('❌ Nieprawidłowy format danych JSON', 'error');
        }
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

    // 🔹 Setup przeciągania PANELU (CAŁEGO)
    function setupPanelDrag() {
        const panel = document.getElementById('swAddonsPanel');
        
        if (!panel) return;
        
        let isDragging = false;
        let offsetX, offsetY;

        // 🔹 Obszar chwytania: nagłówek + górna część panelu
        panel.addEventListener('mousedown', function(e) {
            // Sprawdź czy kliknięto w obszar chwytania (góra panelu)
            const rect = panel.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            
            // Obszar chwytania: 50px od góry
            if (clickY <= 50) {
                isDragging = true;
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                panel.classList.add('dragging');
                document.addEventListener('mousemove', onPanelDrag);
                document.addEventListener('mouseup', stopPanelDrag);
                e.preventDefault();
            }
        });

        function onPanelDrag(e) {
            if (!isDragging) return;
            
            // Oblicz nową pozycję
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;
            
            // Ograniczenia - nie wychodź poza ekran
            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;
            
            newLeft = Math.max(0, Math.min(newLeft, maxX));
            newTop = Math.max(0, Math.min(newTop, maxY));
            
            // Ustaw pozycję z płynnym przesunięciem
            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
        }

        function stopPanelDrag() {
            if (!isDragging) return;
            
            isDragging = false;
            panel.classList.remove('dragging');
            document.removeEventListener('mousemove', onPanelDrag);
            document.removeEventListener('mouseup', stopPanelDrag);
            
            // Zapisz pozycję
            SW.GM_setValue(CONFIG.PANEL_POSITION, {
                left: panel.style.left,
                top: panel.style.top
            });
        }
    }

    // 🔹 Setup przeciągania przycisku (PŁYNNIEJSZE)
    function setupToggleDrag(toggleBtn) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        
        let currentX = parseInt(toggleBtn.style.left) || 70;
        let currentY = parseInt(toggleBtn.style.top) || 70;
        
        // Ustaw początkowe pozycje
        toggleBtn.style.left = currentX + 'px';
        toggleBtn.style.top = currentY + 'px';

        toggleBtn.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = currentX;
            initialTop = currentY;
            
            const dragStartTimer = setTimeout(() => {
                if (!isDragging) {
                    isDragging = true;
                    toggleBtn.classList.add('dragging');
                }
            }, 100);
            
            function onMouseMove(e) {
                if (!isDragging) return;
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                const newLeft = initialLeft + deltaX;
                const newTop = initialTop + deltaY;
                
                const maxX = window.innerWidth - toggleBtn.offsetWidth;
                const maxY = window.innerHeight - toggleBtn.offsetHeight;
                
                currentX = Math.max(0, Math.min(newLeft, maxX));
                currentY = Math.max(0, Math.min(newTop, maxY));
                
                // 🔹 PŁYNNIEJSZE PRZESUWANIE
                toggleBtn.style.left = currentX + 'px';
                toggleBtn.style.top = currentY + 'px';
                toggleBtn.style.transform = 'translate(-50%, -50%)';
            }

            function onMouseUp() {
                clearTimeout(dragStartTimer);
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
                    // Kliknięcie - otwórz/zamknij panel
                    togglePanel();
                }
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
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

    // 🔹 Ładowanie ustawień
    function loadSettings() {
        const savedFontSize = parseInt(SW.GM_getValue(CONFIG.FONT_SIZE, 12));
        currentFontSize = savedFontSize;
        applyFontSize(savedFontSize, true);
        
        const savedOpacity = parseInt(SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90));
        applyOpacity(savedOpacity);
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
            locked: false,
            hidden: false
        }));
        
        userAccountId = null;
        isLicenseVerified = false;
        licenseData = null;
        licenseExpiry = null;
        isAdmin = false;
        addonShortcuts = {};
        shortcutsEnabled = {};
        panelShortcut = 'Ctrl+A';
        currentFontSize = 12;
        currentFilter = 'all';
        
        const resetMessage = document.getElementById('swResetMessage');
        if (resetMessage) {
            resetMessage.textContent = '✅ Wszystkie ustawienia zresetowane! Strona zostanie odświeżona...';
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
        console.log('✅ Initializing panel v4.4...');
        
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
            
            renderAddons();
            renderShortcuts();
            
            setInterval(() => {
                if (userAccountId) checkAndUpdateLicense(userAccountId);
            }, 5 * 60 * 1000);
        }, 1000);
    }

    // 🔹 Start panelu
    console.log('🎯 Starting Synergy Panel v4.4...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }
})();