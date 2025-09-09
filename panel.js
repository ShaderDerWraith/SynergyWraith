// panel.js
(function() {
    'use strict';
    console.log("✅ Panel dodatków załadowany");

    // 🔹 SAFE STORAGE - użyj GM_ functions zamiast localStorage
    function safeSetItem(key, value) {
        try {
            if (typeof GM_setValue !== 'undefined') {
                GM_setValue(key, value);
            } else {
                localStorage.setItem(key, value);
            }
            return true;
        } catch (e) {
            console.warn('Cannot use storage, using fallback:', e);
            return false;
        }
    }

    function safeGetItem(key, defaultValue = null) {
        try {
            if (typeof GM_getValue !== 'undefined') {
                return GM_getValue(key, defaultValue);
            } else {
                const value = localStorage.getItem(key);
                return value !== null ? value : defaultValue;
            }
        } catch (e) {
            console.warn('Cannot read storage, using fallback:', e);
            return defaultValue;
        }
    }

    function safeRemoveItem(key) {
        try {
            if (typeof GM_deleteValue !== 'undefined') {
                GM_deleteValue(key);
            } else {
                localStorage.removeItem(key);
            }
            return true;
        } catch (e) {
            console.warn('Cannot remove from storage:', e);
            return false;
        }
    }

    // 🔹 CONFIGURATION
    const CONFIG = {
        PANEL_POS_KEY: "addons_panel_position",
        PANEL_VISIBLE_KEY: "addons_panel_visible",
        TOGGLE_BTN_POS_KEY: "addons_toggleBtn_position",
        ADDONS_CONFIG_KEY: "addons_config",
        LICENSE_KEY: "user_license_key",
        LICENSE_VERIFIED: "license_verified"
    };

    // 🔹 ADDONS DEFINITION (PUSTE - DODASZ PÓŹNIEJ)
    const AVAILABLE_ADDONS = {
        // Tutaj później dodasz swoje dodatki
    };

    // 🔹 MAIN INITIALIZATION
        function initPanel() {
        console.log("✅ Panel dodatków załadowany");
        console.log("🔍 Debug info:");
        console.log("- License verified:", safeGetItem(CONFIG.LICENSE_VERIFIED, 'false'));
        console.log("- License key:", safeGetItem(CONFIG.LICENSE_KEY, 'none'));
        console.log("- Available addons:", Object.keys(AVAILABLE_ADDONS).length);
        
        createToggleButton();
        createMainPanel();
        loadSavedState();
        setupEventListeners();
        setupTabs();
        checkLicenseOnStart();
    }

    // 🔹 CREATE ELEMENTS
    function createToggleButton() {
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "myPanelToggle";
        toggleBtn.textContent = "";
        toggleBtn.title = "Przeciągnij, aby przenieść. Kliknij dwukrotnie, aby otworzyć/ukryć panel.";
        document.body.appendChild(toggleBtn);
        window.toggleBtn = toggleBtn;
    }

    function createMainPanel() {
        const panel = document.createElement("div");
        panel.id = "myAddonsPanel";
        panel.innerHTML = generatePanelHTML();
        document.body.appendChild(panel);
        window.panel = panel;
    }

    function generatePanelHTML() {
        return `
            <div id="myAddonsPanelHeader">SYNERGY WRAITH PANEL</div>
            <div id="myAddonsPanelContent">
                <div class="tab-container">
                    <button class="tablink active" data-tab="addons">Dodatki</button>
                    <button class="tablink" data-tab="status">Status</button>
                    <button class="tablink" data-tab="settings">Ustawienia</button>
                </div>

                <div id="addons" class="tabcontent" style="display:block;">
                    <h3>Aktywne Moduły</h3>
                    <div id="addons-list">
                        ${generateAddonsList()}
                    </div>
                </div>

                <div id="status" class="tabcontent">
                    <h3>Weryfikacja Dostępu</h3>
                    <div class="license-container">
                        <input type="text" class="license-input" id="licenseKeyInput" 
                               placeholder="Wprowadź klucz licencyjny...">
                        <button class="license-button" id="verifyLicense">Aktywuj Dostęp</button>
                        <div id="licenseMessage" class="license-message"></div>
                    </div>
                    
                    <!-- STATUS LICENCJI -->
                    <div class="license-status-container">
                        <div class="license-status-header">Status Licencji</div>
                        <div class="license-status-item">
                            <span class="license-status-label">Status:</span>
                            <span class="license-status-value" id="licenseStatusText">Nieaktywna</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Użytkownik:</span>
                            <span class="license-status-value" id="licenseUserText">-</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Wygasa:</span>
                            <span class="license-status-value" id="licenseExpiryText">-</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Klucz:</span>
                            <span class="license-status-value" id="licenseKeyText">-</span>
                        </div>
                    </div>
                </div>

                <div id="settings" class="tabcontent">
                    <h3>Ustawienia Panelu</h3>
                    <div class="settings-item">
                        <label class="settings-label">Zablokuj pozycję przycisku</label>
                        <label class="switch">
                            <input type="checkbox" id="lockPosition">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <label class="settings-label">Pokazuj powiadomienia</label>
                        <label class="switch">
                            <input type="checkbox" id="showNotifications" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <button id="reset-settings">Resetuj Ustawienia</button>
                </div>
            </div>
        `;
    }

    function generateAddonsList() {
        if (Object.keys(AVAILABLE_ADDONS).length === 0) {
            return '<div class="license-message">Brak dostępnych dodatków. Aktywuj licencję.</div>';
        }
        
        let html = '';
        for (const [id, addon] of Object.entries(AVAILABLE_ADDONS)) {
            html += `
                <div class="addon" data-addon-id="${id}">
                    <div class="addon-header">
                        <div>
                            <span class="addon-title">${addon.name}</span>
                            <button class="addon-settings-btn" data-addon-id="${id}" title="Ustawienia dodatku">
                                ⚙️
                            </button>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="${id}" data-addon-id="${id}">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="addon-description">${addon.description}</div>
                    
                    <!-- PANEL USTAWIEŃ DODATKU -->
                    <div class="addon-settings-panel" id="settings-${id}">
                        <h4>Ustawienia: ${addon.name}</h4>
                        <div class="settings-row">
                            <span class="settings-label">Key Bind:</span>
                            <span class="settings-value">F2</span>
                        </div>
                        <div class="settings-row">
                            <span class="settings-label">Widoczność:</span>
                            <span class="settings-value">80%</span>
                        </div>
                    </div>
                </div>
            `;
        }
        return html;
    }

    // 🔹 LICENSE SYSTEM
    function checkLicenseOnStart() {
        const isVerified = safeGetItem(CONFIG.LICENSE_VERIFIED, 'false') === 'true';
        const savedKey = safeGetItem(CONFIG.LICENSE_KEY, '');
        
        updateLicenseStatus(isVerified);
        
        if (isVerified && savedKey) {
            console.log('📋 Licencja zweryfikowana, sprawdzam...');
            validateLicenseWithYourSystem(savedKey).then(result => {
                if (result.success) {
                    console.log('✅ Licencja nadal aktualna');
                    updateLicenseStatus(true);
                    loadAddonsForVerifiedUser();
                } else {
                    console.log('❌ Licencja wygasła');
                    safeRemoveItem(CONFIG.LICENSE_VERIFIED);
                    updateLicenseStatus(false);
                }
            });
        } else if (savedKey) {
            verifyLicense(savedKey);
        }
    }

    function verifyLicense(licenseKey) {
        console.log('🔐 Rozpoczynam weryfikację klucza:', licenseKey);
        showLicenseMessage('🔐 Weryfikowanie klucza...', 'success');
        
        validateLicenseWithYourSystem(licenseKey).then(result => {
            console.log('📋 Wynik weryfikacji:', result.success);
            
            if (result.success) {
                console.log('✅ Licencja poprawna!');
                safeSetItem(CONFIG.LICENSE_VERIFIED, 'true');
                safeSetItem(CONFIG.LICENSE_KEY, licenseKey);
                safeSetItem('license_user', result.user || 'Unknown User');
                safeSetItem('license_expires', result.expires || '2024-12-31');
                
                showLicenseMessage('✅ Licencja aktywowana pomyślnie!', 'success');
                updateLicenseStatus(true);
                loadAddonsForVerifiedUser();
                
            } else {
                console.log('❌ Licencja nieprawidłowa');
                safeRemoveItem(CONFIG.LICENSE_VERIFIED);
                safeRemoveItem('license_user');
                safeRemoveItem('license_expires');
                updateLicenseStatus(false);
                showLicenseMessage('❌ Nieprawidłowy klucz licencyjny', 'error');
            }
        }).catch(error => {
            console.error('💥 Błąd podczas weryfikacji:', error);
            showLicenseMessage('⚠️ Błąd podczas weryfikacji. Spróbuj ponownie.', 'error');
        });
    }

    function validateLicenseWithYourSystem(licenseKey) {
        return new Promise((resolve) => {
            console.log('🔐 Próba weryfikacji klucza:', licenseKey);
            
            // 🔹 BEZPOŚREDNIA WERYFIKACJA
            const VALID_LICENSES = {
                "SYNERGY-2024-001": { active: true, user: "Test User 1", expires: "2024-12-31" },
                "SYNERGY-2024-002": { active: true, user: "Test User 2", expires: "2024-12-31" },
                "SYNERGY-2024-003": { active: true, user: "Test User 3", expires: "2024-12-31" },
                "TEST-KEY-12345":   { active: true, user: "Tester", expires: "2024-12-31" },
                "DEV-ACCESS-777":   { active: true, user: "Developer", expires: "2024-12-31" },
                "BETA-TESTER-888":  { active: true, user: "Beta Tester", expires: "2024-12-31" }
            };
            
            setTimeout(() => {
                const licenseInfo = VALID_LICENSES[licenseKey];
                if (licenseInfo && licenseInfo.active) {
                    console.log('✅ Klucz poprawny dla:', licenseInfo.user);
                    resolve({ 
                        success: true, 
                        user: licenseInfo.user, 
                        expires: licenseInfo.expires,
                        key: licenseKey
                    });
                } else {
                    console.log('❌ Klucz nieprawidłowy');
                    resolve({ 
                        success: false, 
                        message: "Invalid or inactive license key" 
                    });
                }
            }, 500);
        });
    }

        function loadAddonsForVerifiedUser() {
        console.log('🔓 Licencja zweryfikowana - ładuję dodatki...');
        
        // 🔹 DODAJ DODATEK DO LISTY DOSTĘPNYCH
        AVAILABLE_ADDONS.kcs_icons = {
            name: "KCS i Zwój Ikony",
            description: "Pokazuje ikony potworów na Kamieniach i Zwojach Czerwonego Smoka",
            default: true
        };
        
        // 🔹 REGENERUJ LISTĘ DODATKÓW
        const addonsList = document.getElementById('addons-list');
        if (addonsList) {
            addonsList.innerHTML = generateAddonsList();
            
            // 🔹 PONOWNIE INIT EVENT LISTENERÓW
            setupAddonsToggle();
            setupAddonHeaders();
            setupAddonSettingsButtons();
            
            // 🔹 WCZYTAJ ZAPISANY STAN DODATKÓW
            const config = JSON.parse(safeGetItem(CONFIG.ADDONS_CONFIG_KEY, '{}'));
            for (const [addonId, addon] of Object.entries(AVAILABLE_ADDONS)) {
                const checkbox = document.getElementById(addonId);
                if (checkbox) {
                    const isEnabled = config[addonId] !== undefined ? config[addonId] : addon.default;
                    checkbox.checked = isEnabled;
                    
                    // 🔹 NATYCHMIAST ZAŁADUJ DODATEK JEŚLI JEST WŁĄCZONY
                    if (isEnabled) {
                        console.log(`🚀 Ładuję dodatek: ${addonId}`);
                        loadAddonScript(addonId);
                    }
                }
            }
        }
        
        updateLicenseStatus(true);
    }

        function updateLicenseStatus(isValid) {
        // 🔹 USUŃ status z lewej strony (floating indicator)
        let statusElement = document.getElementById('licenseStatusIndicator');
        if (statusElement) {
            statusElement.remove();
        }

                // 🔹 DEBUG: Sprawdź czy dodatek się załadował
    function checkAddonLoaded(addonId) {
        return new Promise((resolve) => {
            let checkCount = 0;
            const maxChecks = 10;
            
            const checkInterval = setInterval(() => {
                checkCount++;
                
                // Sprawdź czy funkcje dodatku są dostępne
                if (window[addonId + '_loaded'] || 
                    document.querySelector(`script[src*="${addonId}.js"]`)) {
                    clearInterval(checkInterval);
                    console.log(`✅ Dodatek ${addonId} załadowany pomyślnie`);
                    resolve(true);
                }
                
                if (checkCount >= maxChecks) {
                    clearInterval(checkInterval);
                    console.log(`❌ Dodatek ${addonId} nie załadował się w czasie`);
                    resolve(false);
                }
            }, 500);
        });
    }
        // 🔹 TYLKO aktualizuj status w zakładce
        const statusText = document.getElementById('licenseStatusText');
        const userText = document.getElementById('licenseUserText');
        const expiryText = document.getElementById('licenseExpiryText');
        const keyText = document.getElementById('licenseKeyText');
        
        if (isValid) {
            const user = safeGetItem('license_user', 'Unknown User');
            const expires = safeGetItem('license_expires', '2024-12-31');
            const key = safeGetItem(CONFIG.LICENSE_KEY, '');
            
            if (statusText) {
                statusText.textContent = 'Aktywna';
                statusText.className = 'license-status-value license-status-valid';
                userText.textContent = user;
                expiryText.textContent = expires;
                keyText.textContent = key.substring(0, 4) + '...' + key.substring(key.length - 4);
            }
            
        } else {
            if (statusText) {
                statusText.textContent = 'Nieaktywna';
                statusText.className = 'license-status-value license-status-invalid';
                userText.textContent = '-';
                expiryText.textContent = '-';
                keyText.textContent = '-';
            }
        }
    }

    function showLicenseMessage(message, type) {
        const messageElement = document.getElementById('licenseMessage');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `license-message license-${type}`;
            
            if (type === 'success') {
                setTimeout(() => {
                    messageElement.textContent = '';
                    messageElement.className = 'license-message';
                }, 3000);
            }
        }
    }

    // 🔹 STATE MANAGEMENT
    function loadSavedState() {
        loadPanelPosition();
        loadToggleButtonPosition();
        loadAddonsConfig();
        loadPanelVisibility();
        
        const savedKey = safeGetItem(CONFIG.LICENSE_KEY, '');
        if (savedKey) {
            const input = document.getElementById('licenseKeyInput');
            if (input) input.value = savedKey;
        }
    }

    function loadPanelPosition() {
        const savedPos = safeGetItem(CONFIG.PANEL_POS_KEY, '');
        if (savedPos) {
            try {
                const { top, left } = JSON.parse(savedPos);
                panel.style.top = top;
                panel.style.left = left;
            } catch (e) {
                console.error("Błąd wczytywania pozycji panelu:", e);
            }
        }
    }

    function loadToggleButtonPosition() {
        const savedPos = safeGetItem(CONFIG.TOGGLE_BTN_POS_KEY, '');
        if (savedPos) {
            try {
                const { top, left } = JSON.parse(savedPos);
                toggleBtn.style.top = top;
                toggleBtn.style.left = left;
            } catch (e) {
                console.error("Błąd wczytywania pozycji przycisku:", e);
            }
        }
    }

    function loadAddonsConfig() {
        if (Object.keys(AVAILABLE_ADDONS).length === 0) return;
        
        const savedConfig = JSON.parse(safeGetItem(CONFIG.ADDONS_CONFIG_KEY, '{}'));
        
        for (const [id, addon] of Object.entries(AVAILABLE_ADDONS)) {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                const isEnabled = savedConfig[id] !== undefined ? savedConfig[id] : addon.default;
                checkbox.checked = isEnabled;
                
                if (isEnabled) {
                    loadAddonScript(id);
                }
            }
        }
    }

    function loadPanelVisibility() {
        const savedVisible = safeGetItem(CONFIG.PANEL_VISIBLE_KEY, '');
        panel.style.display = savedVisible === "true" ? "block" : "none";
    }

    // 🔹 ADDONS LOADING
            function loadAddonScript(addonId) {
        const config = JSON.parse(safeGetItem(CONFIG.ADDONS_CONFIG_KEY, '{}'));
        if (!config[addonId]) {
            console.log(`⏭️ Dodatek ${addonId} jest wyłączony, pomijam ładowanie`);
            return;
        }

        const baseUrl = `https://shaderderwraith.github.io/SynergyWraith/addons/`;
        const scriptUrl = `${baseUrl}${addonId}.js?t=${Date.now()}`;
        
        if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
            console.log(`📦 Ładowanie dodatku: ${addonId}`);
            
            // 🔹 DODAJ OPOŹNIENIE - nie ładuj od razu
            setTimeout(() => {
                const script = document.createElement('script');
                script.src = scriptUrl;
                
                script.onload = function() {
                    console.log(`✅ Dodatek ${addonId} załadowany`);
                    window[addonId + '_loaded'] = true;
                };
                
                script.onerror = function() {
                    console.error(`❌ Nie udało się załadować dodatku: ${addonId}`);
                };
                
                document.head.appendChild(script);
            }, 3000); // 🔹 3 sekundy opóźnienia
        }
    }

    // 🔹 EVENT HANDLERS
    function setupEventListeners() {
        setupDoubleClick();
        setupPanelDrag();
        setupToggleButtonDrag();
        setupAddonsToggle();
        setupResetButton();
        setupAddonHeaders();
        setupLicenseVerification();
        setupAddonSettingsButtons();
    }

    function setupDoubleClick() {
        let clickTimer = null;
        toggleBtn.addEventListener('click', () => {
            if (clickTimer !== null) {
                clearTimeout(clickTimer);
                clickTimer = null;
                togglePanel();
            } else {
                clickTimer = setTimeout(() => clickTimer = null, 300);
            }
        });
    }

    function togglePanel() {
        const isVisible = panel.style.display === "block";
        panel.style.display = isVisible ? "none" : "block";
        safeSetItem(CONFIG.PANEL_VISIBLE_KEY, (!isVisible).toString());
    }

    function setupPanelDrag() {
        const header = document.getElementById("myAddonsPanelHeader");
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener("mousedown", (e) => {
            isDragging = true;
            panel.classList.add('dragging');
            const rect = panel.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            document.addEventListener("mousemove", onPanelDrag);
            document.addEventListener("mouseup", stopPanelDrag);
            e.preventDefault();
        });

        function onPanelDrag(e) {
            if (!isDragging) return;
            panel.style.left = (e.clientX - offsetX) + "px";
            panel.style.top = (e.clientY - offsetY) + "px";
        }

        function stopPanelDrag() {
            if (!isDragging) return;
            isDragging = false;
            panel.classList.remove('dragging');
            safeSetItem(CONFIG.PANEL_POS_KEY, JSON.stringify({
                top: panel.style.top,
                left: panel.style.left
            }));
            document.removeEventListener("mousemove", onPanelDrag);
            document.removeEventListener("mouseup", stopPanelDrag);
        }
    }

    function setupToggleButtonDrag() {
        let isDragging = false;
        let offsetX, offsetY;

        toggleBtn.addEventListener("mousedown", (e) => {
            isDragging = true;
            toggleBtn.classList.add('dragging');
            const rect = toggleBtn.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            document.addEventListener("mousemove", onToggleDrag);
            document.addEventListener("mouseup", stopToggleDrag);
            e.preventDefault();
        });

        function onToggleDrag(e) {
            if (!isDragging) return;
            toggleBtn.style.left = (e.clientX - offsetX) + "px";
            toggleBtn.style.top = (e.clientY - offsetY) + "px";
        }

        function stopToggleDrag() {
            if (!isDragging) return;
            isDragging = false;
            toggleBtn.classList.remove('dragging');
            safeSetItem(CONFIG.TOGGLE_BTN_POS_KEY, JSON.stringify({
                top: toggleBtn.style.top,
                left: toggleBtn.style.left
            }));
            document.removeEventListener("mousemove", onToggleDrag);
            document.removeEventListener("mouseup", stopToggleDrag);
        }
    }

    function setupAddonsToggle() {
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"][data-addon-id]')) {
                const addonId = e.target.dataset.addonId;
                const isEnabled = e.target.checked;
                
                const config = JSON.parse(safeGetItem(CONFIG.ADDONS_CONFIG_KEY, '{}'));
                config[addonId] = isEnabled;
                safeSetItem(CONFIG.ADDONS_CONFIG_KEY, JSON.stringify(config));
                
                console.log(`🔧 Dodatek ${addonId}: ${isEnabled ? 'WŁĄCZONY' : 'WYŁĄCZONY'}`);
                
                if (isEnabled) {
                    loadAddonScript(addonId);
                }
            }
        });
    }

    function setupAddonHeaders() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('addon-header')) {
                const addon = e.target.closest('.addon');
                addon.classList.toggle('expanded');
            }
        });
    }

    function setupAddonSettingsButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('addon-settings-btn')) {
                const addonId = e.target.dataset.addonId;
                const settingsPanel = document.getElementById(`settings-${addonId}`);
                if (settingsPanel) {
                    settingsPanel.classList.toggle('visible');
                    
                    document.querySelectorAll('.addon-settings-panel').forEach(panel => {
                        if (panel.id !== `settings-${addonId}`) {
                            panel.classList.remove('visible');
                        }
                    });
                }
            }
        });
    }

    function setupLicenseVerification() {
        const verifyBtn = document.getElementById('verifyLicense');
        const licenseInput = document.getElementById('licenseKeyInput');
        
        if (verifyBtn && licenseInput) {
            verifyBtn.addEventListener('click', () => {
                const licenseKey = licenseInput.value.trim();
                if (licenseKey) {
                    verifyLicense(licenseKey);
                } else {
                    showLicenseMessage('❌ Wprowadź klucz licencyjny', 'error');
                }
            });

            licenseInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    verifyBtn.click();
                }
            });
        }
    }

    function setupResetButton() {
        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) {
                    const keys = [
                        CONFIG.PANEL_POS_KEY,
                        CONFIG.PANEL_VISIBLE_KEY,
                        CONFIG.TOGGLE_BTN_POS_KEY,
                        CONFIG.ADDONS_CONFIG_KEY,
                        CONFIG.LICENSE_KEY,
                        CONFIG.LICENSE_VERIFIED,
                        'license_user',
                        'license_expires'
                    ];
                    
                    keys.forEach(key => safeRemoveItem(key));
                    
                    alert('Ustawienia zresetowane. Strona zostanie odświeżona.');
                    setTimeout(() => location.reload(), 1000);
                }
            });
        }
    }

    // 🔹 TAB SYSTEM
    function setupTabs() {
        const tabContainer = document.querySelector('.tab-container');
        if (tabContainer) {
            tabContainer.addEventListener('click', (e) => {
                if (e.target.matches('.tablink')) {
                    openTab(e.target.dataset.tab);
                }
            });
        }
    }

    function openTab(tabName) {
        document.querySelectorAll('.tabcontent').forEach(tab => {
            tab.style.display = 'none';
        });
        
        document.querySelectorAll('.tablink').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const tab = document.getElementById(tabName);
        const tabButton = document.querySelector(`.tablink[data-tab="${tabName}"]`);
        
        if (tab) tab.style.display = 'block';
        if (tabButton) tabButton.classList.add('active');
    }

    // 🔹 START THE PANEL
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }

})();
