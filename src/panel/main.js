// synergy.js - Główny kod panelu Synergy (v3.7 - Final Fix Edition)
(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v3.7 (Final Fix Edition)');

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
        ADMIN_LICENSES: "sw_admin_licenses"
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
            hidden: true,
            shortcut: null
        }
    ];

    // 🔹 Backend URL - Cloudflare Worker
    const BACKEND_URL = 'https://synergy-licenses.lozu-oo.workers.dev';
    
    // 🔹 URL do pliku licencji na GitHub Pages
    const LICENSES_URL = 'https://shaderderwraith.github.io/SynergyWraith/licenses.json';
    
    // ⭐⭐⭐ ZMIEŃ TUTAJ: wpisz swoje ID konta z gry
    const ADMIN_ACCOUNT_IDS = ['7411461'];

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
    let adminLicenses = [];

    // =========================================================================
    // 🔹 FUNKCJE ADMINISTRACYJNE - SYSTEM LOKALNY + GITHUB PAGES
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

    // 🔹 Pobierz licencje z GitHub Pages
    async function getLicensesFromGitHubPages() {
        try {
            const response = await fetch(`${LICENSES_URL}?t=${Date.now()}`);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.warn('⚠️ Nie można pobrać licencji z GitHub Pages, używam lokalnych:', error.message);
            return SW.GM_getValue(CONFIG.ADMIN_LICENSES, []);
        }
    }

    // 🔹 Zapisz licencje lokalnie
    function saveLicensesLocally(licenses) {
        adminLicenses = licenses;
        SW.GM_setValue(CONFIG.ADMIN_LICENSES, licenses);
        return true;
    }

    // 🔹 Nadaj licencję (tylko lokalnie)
    async function grantLicense(userId, expiryDate) {
        try {
            let licenses = await getLicensesFromGitHubPages();
            
            const existingIndex = licenses.findIndex(l => l.userId === userId);
            
            const licenseData = {
                userId: userId,
                expiry: expiryDate,
                grantedAt: new Date().toISOString(),
                adminId: userAccountId,
                status: 'active'
            };
            
            if (existingIndex !== -1) {
                licenses[existingIndex] = licenseData;
            } else {
                licenses.push(licenseData);
            }
            
            saveLicensesLocally(licenses);
            
            showAdminInstructions(userId, expiryDate, existingIndex !== -1 ? 'updated' : 'added');
            
            return true;
        } catch (error) {
            console.error('❌ Błąd nadawania licencji:', error);
            showAdminMessage(`Błąd: ${error.message}`, 'error');
            return false;
        }
    }

    // 🔹 Odbierz licencję (tylko lokalnie)
    async function revokeLicense(userId) {
        try {
            let licenses = await getLicensesFromGitHubPages();
            
            licenses = licenses.map(license => {
                if (license.userId === userId) {
                    return {
                        ...license,
                        status: 'revoked',
                        revokedAt: new Date().toISOString()
                    };
                }
                return license;
            });
            
            saveLicensesLocally(licenses);
            
            showAdminMessage(`Licencja oznaczona jako odebrana dla ${userId}`, 'success');
            return true;
        } catch (error) {
            console.error('❌ Błąd odbierania licencji:', error);
            showAdminMessage(`Błąd: ${error.message}`, 'error');
            return false;
        }
    }

    // 🔹 Pokaż instrukcję ręcznego dodania do pliku
    function showAdminInstructions(userId, expiryDate, action = 'added') {
        const expiryFormatted = new Date(expiryDate).toLocaleDateString('pl-PL');
        const licenseJson = JSON.stringify({
            userId: userId,
            expiry: new Date(expiryDate).toISOString(),
            grantedAt: new Date().toISOString(),
            adminId: userAccountId,
            status: 'active'
        }, null, 2);
        
        const message = `
✅ Licencja ${action === 'added' ? 'dodana' : 'zaktualizowana'} lokalnie!

Aby dodać ją do pliku licenses.json:
1. Otwórz plik docs/licenses.json w GitHub
2. Dodaj ten wpis do tablicy:

${licenseJson}

3. Zachowaj format JSON
4. Zatwierdź zmiany

ID użytkownika: ${userId}
Ważna do: ${expiryFormatted}
        `;
        
        const resultDiv = document.getElementById('adminGrantResult');
        const messageDiv = document.getElementById('adminGrantMessage');
        
        if (resultDiv && messageDiv) {
            resultDiv.style.display = 'block';
            messageDiv.textContent = message;
            messageDiv.style.color = '#00ff00';
            
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        navigator.clipboard.writeText(licenseJson).then(() => {
            console.log('✅ JSON skopiowany do schowka');
        });
    }

    // =========================================================================
    // 🔹 FUNKCJE LICENCJI
    // =========================================================================

    async function checkLicenseForAccount(accountId) {
        try {
            if (isAdmin) {
                const localLicenses = SW.GM_getValue(CONFIG.ADMIN_LICENSES, []);
                const localLicense = localLicenses.find(l => l.userId === accountId && l.status === 'active');
                
                if (localLicense) {
                    const expiryDate = new Date(localLicense.expiry);
                    const now = new Date();
                    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                    const isExpired = expiryDate < now;
                    
                    return {
                        success: true,
                        hasLicense: !isExpired,
                        expired: isExpired,
                        used: false,
                        expiry: localLicense.expiry,
                        daysLeft: daysLeft > 0 ? daysLeft : 0,
                        addons: ['all'],
                        type: 'premium',
                        accountId: accountId,
                        source: 'local'
                    };
                }
            }
            
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
            accountEl.innerHTML = `${accountId} <span class="copy-icon" title="Kopiuj do schowka">📋</span>`;
            accountEl.className = accountId && accountId !== 'Nie znaleziono' ? 
                'license-status-valid' : 'license-status-invalid';
            
            const copyIcon = accountEl.querySelector('.copy-icon');
            if (copyIcon) {
                copyIcon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    navigator.clipboard.writeText(accountId).then(() => {
                        showLicenseMessage('ID konta skopiowane do schowka', 'success');
                    }).catch(err => {
                        console.error('Błąd kopiowania: ', err);
                        showLicenseMessage('Nie udało się skopiować ID', 'error');
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
                daysEl.className = licenseData.daysLeft < 7 ? 'license-status-invalid' : 'license-status-valid';
            } else {
                daysEl.textContent = '-';
            }
        }
    }

    // 🔹 POPRAWIONA: Funkcja applyFontSize - działa na cały panel
    function applyFontSize(size) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const minSize = 10;
            const maxSize = 16;
            const clampedSize = Math.max(minSize, Math.min(maxSize, size));
            
            panel.style.fontSize = clampedSize + 'px';
            
            const allElements = panel.querySelectorAll('*:not(#swPanelHeader)');
            allElements.forEach(el => {
                el.style.fontSize = 'inherit';
            });
            
            SW.GM_setValue(CONFIG.FONT_SIZE, clampedSize);
            
            const fontSizeValue = document.getElementById('fontSizeValue');
            if (fontSizeValue) {
                fontSizeValue.textContent = clampedSize + 'px';
            }
            
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            if (fontSizeSlider) {
                fontSizeSlider.value = clampedSize;
            }
        }
    }

    // 🔹 POPRAWIONA: Funkcja applyOpacity - wpływa na CAŁY panel
    function applyOpacity(opacity) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const minOpacity = 30;
            const maxOpacity = 100;
            const clampedOpacity = Math.max(minOpacity, Math.min(maxOpacity, opacity));
            
            const opacityValue = clampedOpacity / 100;
            
            panel.style.background = `linear-gradient(135deg, 
                rgba(26, 0, 0, ${opacityValue}), 
                rgba(51, 0, 0, ${opacityValue}), 
                rgba(102, 0, 0, ${opacityValue}))`;
            
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
                <strong>SYNERGY</strong>
                ${isAdmin ? ' <span style="color:#00ff00; font-size:11px;">(ADMIN)</span>' : ''}
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
                <button class="tablink" data-tab="shortcuts">Skróty</button>
                <button class="tablink" data-tab="license">Licencja</button>
                <button class="tablink" data-tab="settings">Ustawienia</button>
                <button class="tablink admin-tab" data-tab="admin" style="display:none;">Admin</button>
            </div>

            <!-- ZAKŁADKA DODATKI -->
            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div style="margin-bottom:10px;">
                        <input type="text" id="searchAddons" placeholder="Wyszukaj dodatki..." 
                               style="width:100%; padding:8px; background:rgba(51,0,0,0.8); border:1px solid #660000; 
                                      border-radius:4px; color:#ffcc00; font-size:11px; box-sizing: border-box;">
                    </div>
                    
                    <div class="addon-list" id="addon-list" style="flex:1; overflow-y:auto;">
                        <!-- Lista dodatków będzie dodana dynamicznie -->
                    </div>
                    
                    <div class="refresh-button-container">
                        <button class="refresh-button" id="swSaveAndRestartButton">Zapisz i odśwież grę</button>
                    </div>
                    
                    <div id="swAddonsMessage" class="license-message" style="display: none; font-size: 10px;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA SKRÓTY -->
            <div id="shortcuts" class="tabcontent">
                <div class="sw-tab-content scrollable">
                    <div style="margin-bottom:15px; padding:10px; background:linear-gradient(135deg, rgba(51,0,0,0.8), rgba(102,0,0,0.8)); border-radius:6px; border:1px solid #660000;">
                        <h3 style="color:#ffcc00; margin-top:0; margin-bottom:5px; font-size:12px;">Skróty klawiszowe</h3>
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
                <div class="sw-tab-content scrollable">
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
                            Aktywuj Licencję
                        </button>
                        
                        <div id="activationResult" style="display:none; padding:6px; border-radius:4px; margin-top:6px; font-size:10px; text-align:center;"></div>
                    </div>
                    
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>

            <!-- ZAKŁADKA USTAWIENIA -->
            <div id="settings" class="tabcontent">
                <div class="sw-tab-content scrollable">
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
                        <small style="color:#ff9966; font-size:10px;">30-100%</small>
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
                            Resetuj ustawienia
                        </button>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top:10px; padding:8px; border-radius:4px; display:none; font-size:10px;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA ADMIN -->
            <div id="admin" class="tabcontent">
                <div class="sw-tab-content scrollable">
                    <div style="padding:8px; background:linear-gradient(135deg, rgba(0,51,0,0.8), rgba(0,102,0,0.8)); border:1px solid #00cc00; border-radius:5px; margin-bottom:8px;">
                        <div style="color:#00ff00; font-size:11px; font-weight:bold; text-align:center;">Panel Administratora</div>
                        <div style="color:#00cc00; font-size:9px; text-align:center; margin-top:3px;">System lokalny + GitHub Pages</div>
                    </div>
                    
                    <div class="admin-section">
                        <h3>Zarządzanie Licencjami</h3>
                        <div style="color:#00aa00; font-size:9px; margin-bottom:8px; padding:5px; background:rgba(0,40,0,0.3); border-radius:3px;">
                            Licencje zapisywane lokalnie. Aby dodać do pliku, skopiuj JSON poniżej.
                        </div>
                        
                        <div class="admin-input-group">
                            <label class="admin-label">ID Użytkownika:</label>
                            <input type="text" id="adminUserId" class="admin-input" placeholder="Wpisz ID konta">
                        </div>
                        
                        <div class="admin-input-group">
                            <label class="admin-label">Data ważności:</label>
                            <input type="date" id="adminLicenseExpiry" class="admin-input">
                        </div>
                        
                        <button id="adminGrantLicenseBtn" class="admin-button">
                            Dodaj Licencję (lokalnie)
                        </button>
                        
                        <button id="adminRevokeLicenseBtn" class="admin-button" style="background:linear-gradient(to right, #660000, #990000);">
                            Oznacz jako Odebraną
                        </button>
                    </div>
                    
                    <div id="adminGrantResult" style="display:none; padding:8px; background:rgba(0,60,0,0.5); 
                                                          border-radius:5px; border:1px solid #00ff00; margin-bottom:8px;">
                        <div style="color:#00ff00; font-size:10px; font-weight:bold; margin-bottom:4px; text-align:center;">
                            Instrukcja
                        </div>
                        <div id="adminGrantMessage" style="padding:5px; background:rgba(0,30,0,0.8); border-radius:3px; margin-bottom:3px; font-size:10px; white-space: pre-line; max-height: 150px; overflow-y: auto;"></div>
                        <button id="copyJsonBtn" style="width:100%; padding:5px; background:linear-gradient(to right, #006666, #008888); border:1px solid #00cccc; border-radius:3px; color:#ffffff; font-size:9px; cursor:pointer; margin-top:5px;">
                            Kopiuj JSON do schowka
                        </button>
                    </div>
                    
                    <div class="admin-section">
                        <h3>Lista Licencji (GitHub Pages)</h3>
                        <div style="color:#00aa00; font-size:9px; margin-bottom:5px;">
                            Pobierane z: shaderderwraith.github.io/SynergyWraith/licenses.json
                        </div>
                        
                        <button id="adminListLicensesBtn" class="admin-button" style="background:linear-gradient(to right, #006666, #008888);">
                            Odśwież Listę
                        </button>
                        
                        <div id="adminLicensesContainer" style="display:none; margin-top:8px;">
                            <!-- Lista licencji pojawi się tutaj -->
                        </div>
                    </div>
                    
                    <div id="adminMessage" class="license-message" style="display:none; margin-top:8px;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        console.log('✅ Panel created - FINAL FIX VERSION');
        
        initializeEventListeners();
        
        const expiryInput = document.getElementById('adminLicenseExpiry');
        if (expiryInput) {
            const defaultExpiry = new Date();
            defaultExpiry.setDate(defaultExpiry.getDate() + 30);
            expiryInput.value = defaultExpiry.toISOString().split('T')[0];
            expiryInput.min = new Date().toISOString().split('T')[0];
        }
        
        loadSettings();
    }
    // 🔹 POPRAWIONA: Renderowanie skrótów
    function renderShortcuts() {
        const container = document.getElementById('shortcuts-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const enabledAddons = currentAddons.filter(addon => 
            addon.enabled && !addon.locked
        );
        
        if (enabledAddons.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:20px; color:#ff9966; font-style:italic; font-size:11px;">
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

    function toggleShortcutEnabled(addonId, enabled) {
        shortcutsEnabled[addonId] = enabled;
        saveShortcutsEnabledState();
        showShortcutMessage(enabled ? 'Skrót włączony' : 'Skrót wyłączony', 'info');
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
                
                showShortcutMessage('Czas minął', 'error');
            }
        }, 10000);
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
                        messageEl.textContent = `Skrót ustawiony: ${panelShortcut}`;
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
                        showShortcutMessage(`${addon.name} wyłączony (${shortcut})`, 'info');
                    }
                }
            });
        });
    }

    // 🔹 Inicjalizacja event listenerów
    function initializeEventListeners() {
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
        
        // SUWAKI
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.addEventListener('input', function() {
                const size = parseInt(this.value);
                fontSizeValue.textContent = size + 'px';
                applyFontSize(size);
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

    // 🔹 Obsługa aktywacji licencji
    async function handleLicenseActivation() {
        const licenseKeyInput = document.getElementById('licenseKeyInput');
        const activateBtn = document.getElementById('activateLicenseBtn');
        const resultDiv = document.getElementById('activationResult');
        
        if (!licenseKeyInput || !activateBtn || !resultDiv) return;
        
        const licenseKey = licenseKeyInput.value.trim();
        
        if (!licenseKey || licenseKey.length < 10) {
            resultDiv.textContent = 'Wprowadź poprawny klucz';
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
                resultDiv.innerHTML = `✅ Licencja aktywowana!<br>Dodatki premium dostępne.`;
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
            activateBtn.textContent = 'Aktywuj Licencję';
            activateBtn.disabled = false;
        }
    }

    // 🔹 Setup event listenerów dla admina
    function setupAdminEvents() {
        if (!isAdmin) return;
        
        // Przycisk kopiowania JSON
        const copyJsonBtn = document.getElementById('copyJsonBtn');
        if (copyJsonBtn) {
            copyJsonBtn.addEventListener('click', function() {
                const messageDiv = document.getElementById('adminGrantMessage');
                if (messageDiv) {
                    const text = messageDiv.textContent;
                    const jsonMatch = text.match(/\{[^}]+\}/);
                    if (jsonMatch) {
                        navigator.clipboard.writeText(jsonMatch[0]).then(() => {
                            showAdminMessage('JSON skopiowany do schowka!', 'success');
                        });
                    }
                }
            });
        }
        
        // Nadaj licencję
        const grantBtn = document.getElementById('adminGrantLicenseBtn');
        if (grantBtn) {
            grantBtn.addEventListener('click', async function() {
                const userId = document.getElementById('adminUserId').value.trim();
                const expiry = document.getElementById('adminLicenseExpiry').value;
                
                if (!userId) {
                    showAdminMessage('Wpisz ID użytkownika!', 'error');
                    return;
                }
                
                if (!expiry) {
                    showAdminMessage('Wybierz datę ważności!', 'error');
                    return;
                }
                
                const btn = this;
                const originalText = btn.textContent;
                btn.textContent = 'Dodaję...';
                btn.disabled = true;
                
                try {
                    await grantLicense(userId, expiry);
                } catch (error) {
                    console.error('Admin grant error:', error);
                    showAdminMessage(`Błąd: ${error.message}`, 'error');
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
        }
        
        // Odbierz licencję
        const revokeBtn = document.getElementById('adminRevokeLicenseBtn');
        if (revokeBtn) {
            revokeBtn.addEventListener('click', async function() {
                const userId = document.getElementById('adminUserId').value.trim();
                
                if (!userId) {
                    showAdminMessage('Wpisz ID użytkownika!', 'error');
                    return;
                }
                
                if (!confirm(`Czy na pewno chcesz oznaczyć licencję użytkownika ${userId} jako odebraną?`)) {
                    return;
                }
                
                const btn = this;
                const originalText = btn.textContent;
                btn.textContent = 'Oznaczam...';
                btn.disabled = true;
                
                try {
                    await revokeLicense(userId);
                    
                    setTimeout(() => {
                        const listBtn = document.getElementById('adminListLicensesBtn');
                        if (listBtn) listBtn.click();
                    }, 1000);
                } catch (error) {
                    console.error('Admin revoke error:', error);
                    showAdminMessage(`Błąd: ${error.message}`, 'error');
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
        }
        
        // Pokaż listę licencji
        const adminListLicensesBtn = document.getElementById('adminListLicensesBtn');
        if (adminListLicensesBtn) {
            adminListLicensesBtn.addEventListener('click', async function() {
                const container = document.getElementById('adminLicensesContainer');
                container.innerHTML = '<div style="color:#00aa99; text-align:center; padding:10px; font-size:10px;">Ładowanie licencji z GitHub Pages...</div>';
                container.style.display = 'block';
                
                const btn = this;
                const originalText = btn.textContent;
                btn.textContent = 'Ładuję...';
                btn.disabled = true;
                
                try {
                    const licenses = await getLicensesFromGitHubPages();
                    
                    let html = '';
                    
                    if (licenses.length > 0) {
                        licenses.sort((a, b) => new Date(b.expiry) - new Date(a.expiry));
                        
                        licenses.forEach(license => {
                            const expiry = new Date(license.expiry);
                            const now = new Date();
                            const isExpired = expiry < now;
                            const grantedDate = new Date(license.grantedAt);
                            
                            let statusColor = '#00ff00';
                            let statusText = 'AKTYWNA';
                            
                            if (license.status === 'revoked') {
                                statusColor = '#ff9900';
                                statusText = 'ODEBRANA';
                            } else if (isExpired) {
                                statusColor = '#ff3300';
                                statusText = 'WYGASŁA';
                            } else if (license.status === 'expired') {
                                statusColor = '#ff3300';
                                statusText = 'WYGASŁA';
                            }
                            
                            html += `
                                <div class="license-key-item ${isExpired ? 'expired' : ''}">
                                    <div><strong style="color:#00ff00;">ID:</strong> ${license.userId}</div>
                                    <div><strong style="color:#00ccff;">Ważna do:</strong> ${expiry.toLocaleDateString('pl-PL')}</div>
                                    <div><strong style="color:#00cc99;">Nadana:</strong> ${grantedDate.toLocaleDateString('pl-PL')}</div>
                                    <div><strong style="color:#00cc99;">Status:</strong> 
                                        <span style="color:${statusColor}">${statusText}</span>
                                    </div>
                                    <div style="font-size:8px; color:#00aa99; margin-top:3px;">
                                        ID admina: ${license.adminId || 'nieznany'}
                                    </div>
                                </div>
                            `;
                        });
                        
                        html += `<div style="color:#00aa99; font-size:9px; text-align:center; padding:5px; margin-top:5px;">
                                    Łącznie: ${licenses.length} licencji
                                </div>`;
                    } else {
                        html = '<div style="color:#00aa99; text-align:center; padding:20px; font-size:10px;">Brak licencji w pliku</div>';
                    }
                    
                    container.innerHTML = html;
                    showAdminMessage(`Załadowano ${licenses.length} licencji z GitHub Pages`, 'success');
                } catch (error) {
                    container.innerHTML = `<div style="color:#ff6666; text-align:center; padding:10px; font-size:10px;">Błąd: ${error.message}</div>`;
                    showAdminMessage(`Błąd: ${error.message}`, 'error');
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
                } else if (tabName === 'admin') {
                    setTimeout(() => {
                        const listBtn = document.getElementById('adminListLicensesBtn');
                        if (listBtn) listBtn.click();
                    }, 500);
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

    // 🔹 Renderowanie dodatków
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
                <div style="text-align:center; padding:30px; color:#ff9966; font-style:italic; font-size:11px;">
                    ${searchQuery ? 'Nie znaleziono dodatków' : 'Brak dostępnych dodatków'}
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
                        ${addon.locked ? ' <span style="color:#ff3300; font-size:9px;">(Wymaga licencji)</span>' : ''}
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
            messageEl.className = `license-message license-${isEnabled ? 'success' : 'info'}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 3000);
        }
        
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

    // 🔹 Ładowanie ustawień
    function loadSettings() {
        const savedFontSize = parseInt(SW.GM_getValue(CONFIG.FONT_SIZE, 12));
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.value = savedFontSize;
            fontSizeValue.textContent = savedFontSize + 'px';
            applyFontSize(savedFontSize);
        }
        
        const savedOpacity = parseInt(SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90));
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        
        if (opacitySlider && opacityValue) {
            opacitySlider.value = savedOpacity;
            opacityValue.textContent = savedOpacity + '%';
            applyOpacity(savedOpacity);
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
        console.log('✅ Initializing panel v3.7 - FINAL FIX VERSION...');
        
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
            
            setInterval(() => {
                if (userAccountId) checkAndUpdateLicense(userAccountId);
            }, 5 * 60 * 1000);
        }, 1000);
    }

    // 🔹 Start panelu
    console.log('🎯 Starting Synergy Panel v3.7 - FINAL FIX VERSION...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }
})();