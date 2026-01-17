// synergy.js - Główny kod panelu Synergy (v3.6 - Final Edition)
(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v3.6 (Final Edition)');

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

    // ⭐⭐⭐ ZMIEŃ TUTAJ: wpisz swoje ID konta z gry
    const ADMIN_ACCOUNT_IDS = ['7411461'];

    // ⭐⭐⭐ ZMIEŃ TUTAJ: jeśli w Cloudflare zmieniłeś ADMIN_TOKEN
    const ADMIN_TOKEN = 'SYNERGY_ADMIN_2024_SECRET';

    // 🔹 NOWE: GitHub dla licencji admina
    const GITHUB_API = 'https://api.github.com/repos/ShaderDerWraith/SynergyWraith/contents';
    const GITHUB_TOKEN = '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'; // ⭐⭐⭐ WPROWADŹ SWÓJ TOKEN GITHUB TUTAJ

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
    // 🔹 FUNKCJE ADMINISTRACYJNE - NOWY SYSTEM GITHUB
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

    // 🔹 NOWE: Pobierz licencje z GitHub
    async function getLicensesFromGitHub() {
        if (!GITHUB_TOKEN) {
            console.error('❌ Brak tokenu GitHub');
            showAdminMessage('Brak tokenu GitHub. Ustaw GITHUB_TOKEN w kodzie.', 'error');
            return [];
        }
        
        try {
            const response = await fetch(`${GITHUB_API}/backend/licenses.json`, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.status === 404) {
                // Plik nie istnieje, zwróć pustą tablicę
                return [];
            }
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const data = await response.json();
            const content = atob(data.content); // Dekoduj base64
            return JSON.parse(content);
        } catch (error) {
            console.error('❌ Błąd pobierania licencji z GitHub:', error);
            showAdminMessage(`Błąd: ${error.message}`, 'error');
            return [];
        }
    }

    // 🔹 NOWE: Zapisz licencje do GitHub
    async function saveLicensesToGitHub(licenses) {
        if (!GITHUB_TOKEN) {
            console.error('❌ Brak tokenu GitHub');
            showAdminMessage('Brak tokenu GitHub. Ustaw GITHUB_TOKEN w kodzie.', 'error');
            return false;
        }
        
        try {
            // Najpierw pobierz aktualny plik, aby uzyskać sha
            let sha = '';
            try {
                const getResponse = await fetch(`${GITHUB_API}/backend/licenses.json`, {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (getResponse.ok) {
                    const data = await getResponse.json();
                    sha = data.sha;
                }
            } catch (e) {
                // Plik nie istnieje, sha pozostanie puste
            }
            
            const content = btoa(JSON.stringify(licenses, null, 2));
            const payload = {
                message: `Update licenses: ${new Date().toISOString()}`,
                content: content,
                sha: sha || undefined
            };
            
            const response = await fetch(`${GITHUB_API}/backend/licenses.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Błąd zapisywania licencji do GitHub:', error);
            showAdminMessage(`Błąd: ${error.message}`, 'error');
            return false;
        }
    }

    // 🔹 NOWE: Nadaj licencję (zapis do GitHub)
    async function grantLicense(userId, expiryDate) {
        try {
            const licenses = await getLicensesFromGitHub();
            
            // Sprawdź czy użytkownik już ma licencję
            const existingIndex = licenses.findIndex(l => l.userId === userId);
            
            const licenseData = {
                userId: userId,
                expiry: expiryDate,
                grantedAt: new Date().toISOString(),
                adminId: userAccountId,
                status: 'active'
            };
            
            if (existingIndex !== -1) {
                // Zaktualizuj istniejącą licencję
                licenses[existingIndex] = licenseData;
                showAdminMessage(`Zaktualizowano licencję dla ${userId}`, 'info');
            } else {
                // Dodaj nową licencję
                licenses.push(licenseData);
                showAdminMessage(`Nadano licencję dla ${userId}`, 'success');
            }
            
            // Zapisz do GitHub
            const success = await saveLicensesToGitHub(licenses);
            if (success) {
                // Aktualizuj listę
                setTimeout(() => {
                    const listBtn = document.getElementById('adminListLicensesBtn');
                    if (listBtn) listBtn.click();
                }, 1000);
            }
            
            return success;
        } catch (error) {
            console.error('❌ Błąd nadawania licencji:', error);
            showAdminMessage(`Błąd: ${error.message}`, 'error');
            return false;
        }
    }

    // 🔹 NOWE: Odbierz licencję
    async function revokeLicense(userId) {
        try {
            const licenses = await getLicensesFromGitHub();
            const initialLength = licenses.length;
            
            // Usuń licencję użytkownika
            const filteredLicenses = licenses.filter(l => l.userId !== userId);
            
            if (filteredLicenses.length === initialLength) {
                showAdminMessage(`Nie znaleziono licencji dla ${userId}`, 'error');
                return false;
            }
            
            // Zapisz do GitHub
            const success = await saveLicensesToGitHub(filteredLicenses);
            if (success) {
                showAdminMessage(`Odebrano licencję od ${userId}`, 'success');
                // Aktualizuj listę
                setTimeout(() => {
                    const listBtn = document.getElementById('adminListLicensesBtn');
                    if (listBtn) listBtn.click();
                }, 1000);
            }
            
            return success;
        } catch (error) {
            console.error('❌ Błąd odbierania licencji:', error);
            showAdminMessage(`Błąd: ${error.message}`, 'error');
            return false;
        }
    }

    // =========================================================================
    // 🔹 FUNKCJE LICENCJI (Cloudflare)
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

    // 🔹 POPRAWIONA: Funkcja updateAccountDisplay z ikoną kopiowania
    function updateAccountDisplay(accountId) {
        const accountEl = document.getElementById('swAccountId');
        if (accountEl) {
            accountEl.innerHTML = `${accountId} <span class="copy-icon" title="Kopiuj do schowka">📋</span>`;
            accountEl.className = accountId && accountId !== 'Nie znaleziono' ? 
                'license-status-valid' : 'license-status-invalid';
            
            // Dodajemy event listener do ikony kopiowania
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

    // 🔹 Tworzenie głównego panelu - Z AKTUALIZACJAMI
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

            <!-- ZAKŁADKA SKRÓTY - Z POPRAWIONYM PRZEŁĄCZNIKIEM -->
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

            <!-- ZAKŁADKA ADMIN - NOWY SYSTEM GITHUB -->
            <div id="admin" class="tabcontent">
                <div class="sw-tab-content scrollable">
                    <div style="padding:8px; background:linear-gradient(135deg, rgba(0,51,0,0.8), rgba(0,102,0,0.8)); border:1px solid #00cc00; border-radius:5px; margin-bottom:8px;">
                        <div style="color:#00ff00; font-size:11px; font-weight:bold; text-align:center;">Panel Administratora</div>
                        <div style="color:#00cc00; font-size:9px; text-align:center; margin-top:3px;">System zarządzania licencjami</div>
                    </div>
                    
                    <div class="admin-section">
                        <h3>Zarządzanie Licencjami</h3>
                        
                        <div class="admin-input-group">
                            <label class="admin-label">ID Użytkownika:</label>
                            <input type="text" id="adminUserId" class="admin-input" placeholder="Wpisz ID konta">
                        </div>
                        
                        <div class="admin-input-group">
                            <label class="admin-label">Data ważności:</label>
                            <input type="date" id="adminLicenseExpiry" class="admin-input">
                        </div>
                        
                        <button id="adminGrantLicenseBtn" class="admin-button">
                            Nadaj Licencję
                        </button>
                        
                        <button id="adminRevokeLicenseBtn" class="admin-button" style="background:linear-gradient(to right, #660000, #990000);">
                            Odbierz Licencję
                        </button>
                    </div>
                    
                    <div id="adminGrantResult" style="display:none; padding:8px; background:rgba(0,60,0,0.5); 
                                                          border-radius:5px; border:1px solid #00ff00; margin-bottom:8px;">
                        <div style="color:#00ff00; font-size:10px; font-weight:bold; margin-bottom:4px; text-align:center;">
                            Wynik operacji
                        </div>
                        <div id="adminGrantMessage" style="padding:5px; background:rgba(0,30,0,0.8); border-radius:3px; margin-bottom:3px; font-size:10px; text-align:center;"></div>
                    </div>
                    
                    <div class="admin-section">
                        <h3>Lista Aktywnych Licencji</h3>
                        
                        <button id="adminListLicensesBtn" class="admin-button" style="background:linear-gradient(to right, #006666, #008888);">
                            Odśwież Listę
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
        
        const expiryInput = document.getElementById('adminLicenseExpiry');
        if (expiryInput) {
            const defaultExpiry = new Date();
            defaultExpiry.setDate(defaultExpiry.getDate() + 30);
            expiryInput.value = defaultExpiry.toISOString().split('T')[0];
            expiryInput.min = new Date().toISOString().split('T')[0];
        }
        
        loadSettings();
    }
    // 🔹 POPRAWIONA: Funkcja applyFontSize - działa na cały panel
    function applyFontSize(size) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const minSize = 10;
            const maxSize = 16;
            const clampedSize = Math.max(minSize, Math.min(maxSize, size));
            
            // Ustawiamy czcionkę dla całego panelu
            panel.style.fontSize = clampedSize + 'px';
            
            // Ustawiamy czcionkę dla wszystkich elementów wewnątrz panelu
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
            
            // Ustaw tło z przeźroczystością
            panel.style.background = `linear-gradient(135deg, 
                rgba(26, 0, 0, ${opacityValue}), 
                rgba(51, 0, 0, ${opacityValue}), 
                rgba(102, 0, 0, ${opacityValue}))`;
            
            // Zapisujemy wartość
            SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, clampedOpacity);
            
            // Aktualizujemy wyświetlaną wartość
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

    // 🔹 POPRAWIONA: Renderowanie skrótów z lepszym przełącznikiem
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
        
        // SUWAKI - POPRAWIONE
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

    // 🔹 NOWE: Setup event listenerów dla admina (GitHub)
    function setupAdminEvents() {
        if (!isAdmin) return;
        
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
                btn.textContent = 'Nadaję...';
                btn.disabled = true;
                
                try {
                    const success = await grantLicense(userId, expiry);
                    
                    const resultDiv = document.getElementById('adminGrantResult');
                    const messageDiv = document.getElementById('adminGrantMessage');
                    
                    if (success) {
                        resultDiv.style.display = 'block';
                        messageDiv.textContent = `Licencja nadana dla ${userId}\nWaży do: ${new Date(expiry).toLocaleDateString('pl-PL')}`;
                        messageDiv.style.color = '#00ff00';
                        
                        document.getElementById('adminUserId').value = '';
                    } else {
                        resultDiv.style.display = 'block';
                        messageDiv.textContent = 'Błąd podczas nadawania licencji';
                        messageDiv.style.color = '#ff3300';
                    }
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
                
                if (!confirm(`Czy na pewno chcesz odebrać licencję użytkownikowi ${userId}?`)) {
                    return;
                }
                
                const btn = this;
                const originalText = btn.textContent;
                btn.textContent = 'Odbieram...';
                btn.disabled = true;
                
                try {
                    const success = await revokeLicense(userId);
                    
                    const resultDiv = document.getElementById('adminGrantResult');
                    const messageDiv = document.getElementById('adminGrantMessage');
                    
                    if (success) {
                        resultDiv.style.display = 'block';
                        messageDiv.textContent = `Licencja odebrana od ${userId}`;
                        messageDiv.style.color = '#00ff00';
                        
                        document.getElementById('adminUserId').value = '';
                    } else {
                        resultDiv.style.display = 'block';
                        messageDiv.textContent = 'Błąd podczas odbierania licencji';
                        messageDiv.style.color = '#ff3300';
                    }
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
                container.innerHTML = '<div style="color:#00aa99; text-align:center; padding:10px; font-size:10px;">Ładowanie licencji...</div>';
                container.style.display = 'block';
                
                const btn = this;
                const originalText = btn.textContent;
                btn.textContent = 'Ładuję...';
                btn.disabled = true;
                
                try {
                    const licenses = await getLicensesFromGitHub();
                    
                    let html = '';
                    
                    if (licenses.length > 0) {
                        licenses.sort((a, b) => new Date(b.expiry) - new Date(a.expiry));
                        
                        licenses.forEach(license => {
                            const expiry = new Date(license.expiry);
                            const now = new Date();
                            const isExpired = expiry < now;
                            
                            html += `
                                <div class="license-key-item ${isExpired ? 'expired' : ''}">
                                    <div><strong style="color:#00ff00;">ID:</strong> ${license.userId}</div>
                                    <div><strong style="color:#00ccff;">Ważna do:</strong> ${expiry.toLocaleDateString('pl-PL')}</div>
                                    <div><strong style="color:#00cc99;">Status:</strong> 
                                        <span style="color:${isExpired ? '#ff3300' : '#00ff00'}">${isExpired ? 'WYGASŁA' : 'AKTYWNA'}</span>
                                    </div>
                                </div>
                            `;
                        });
                    } else {
                        html = '<div style="color:#00aa99; text-align:center; padding:10px; font-size:10px;">Brak aktywnych licencji</div>';
                    }
                    
                    container.innerHTML = html;
                    showAdminMessage(`Załadowano ${licenses.length} licencji`, 'success');
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

    // 🔹 Reszta funkcji pozostaje bez zmian (renderAddons, toggleFavorite, toggleAddon, saveAddonsState, setupDrag, setupToggleDrag, togglePanel, loadSettings, resetAllSettings, loadSavedState, initPanel)

    // 🔹 UWAGA: Musisz w linii 45 w main.js wprowadzić swój token GitHub:
    // const GITHUB_TOKEN = 'twój_token_github_tutaj';

    // 🔹 UWAGA: Musisz stworzyć plik backend/licenses.json w swoim repozytorium z początkową zawartością: []