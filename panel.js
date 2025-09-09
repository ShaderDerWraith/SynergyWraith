// panel.js
(function() {
    'use strict';
    console.log("✅ Panel dodatków załadowany");

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
        // przykład: 
        // autoheal: { name: "Auto Heal", description: "Automatyczne leczenie", default: false }
    };

    // 🔹 MAIN INITIALIZATION
    function initPanel() {
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
                        <!-- Tutaj dodasz więcej ustawień w przyszłości -->
                    </div>
                </div>
            `;
        }
        return html;
    }

    // 🔹 LICENSE SYSTEM
    function checkLicenseOnStart() {
        const isVerified = localStorage.getItem(CONFIG.LICENSE_VERIFIED) === 'true';
        const savedKey = localStorage.getItem(CONFIG.LICENSE_KEY);
        
        if (isVerified && savedKey) {
            showLicenseMessage('Licencja zweryfikowana pomyślnie!', 'success');
            loadAddonsForVerifiedUser();
        } else if (savedKey) {
            // Klucz jest zapisany, ale niezweryfikowany - spróbuj ponownie
            verifyLicense(savedKey);
        }
    }

    function verifyLicense(licenseKey) {
        showLicenseMessage('🔐 Weryfikowanie klucza...', 'success');
        
        validateLicenseWithYourSystem(licenseKey).then(isValid => {
            if (isValid) {
                localStorage.setItem(CONFIG.LICENSE_VERIFIED, 'true');
                localStorage.setItem(CONFIG.LICENSE_KEY, licenseKey);
                showLicenseMessage('✅ Licencja aktywowana pomyślnie!', 'success');
                loadAddonsForVerifiedUser();
            } else {
                localStorage.removeItem(CONFIG.LICENSE_VERIFIED);
                showLicenseMessage('❌ Nieprawidłowy klucz licencyjny', 'error');
            }
        }).catch(error => {
            console.error("License validation error:", error);
            showLicenseMessage('⚠️ Błąd podczas weryfikacji. Spróbuj ponownie.', 'error');
        });
    }

    function validateLicenseWithYourSystem(licenseKey) {
        // 🔹 TYMACZASOWA WERYFIKACJA - korzysta z symulowanego serwera
        return new Promise((resolve) => {
            // Dynamicznie ładujemy nasz symulowany serwer
            if (window.validateLicense) {
                // Jeśli funkcja jest już załadowana (np. z license-server.js)
                window.validateLicense(licenseKey).then(result => {
                    resolve(result.success);
                });
            } else {
                // Fallback: symulacja lokalna jeśli serwer nie jest dostępny
                console.warn("License server not loaded, using fallback validation");
                const validKeys = ['SYNERGY-2024-001', 'SYNERGY-2024-002', 'TEST-KEY-12345'];
                setTimeout(() => {
                    resolve(validKeys.includes(licenseKey));
                }, 500);
            }
        });
    }

    function showLicenseMessage(message, type) {
        const messageElement = document.getElementById('licenseMessage');
        messageElement.textContent = message;
        messageElement.className = `license-message license-${type}`;
        
        // Auto-ukrywanie wiadomości sukcesu
        if (type === 'success') {
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = 'license-message';
            }, 3000);
        }
    }

    function loadAddonsForVerifiedUser() {
        // 🔹 TUTAJ MOŻESZ DODAĆ LOGIKĘ ŁADOWANIA DODATKÓW
        // Dla zweryfikowanego użytkownika
        console.log('Ładuję dodatki dla zweryfikowanego użytkownika...');
        
        // Przykład: możesz dynamicznie dodać dodatki do AVAILABLE_ADDONS
        // i zregenerować listę
    }

    // 🔹 STATE MANAGEMENT
    function loadSavedState() {
        loadPanelPosition();
        loadToggleButtonPosition();
        loadAddonsConfig();
        loadPanelVisibility();
        
        // Załaduj zapisany klucz licencyjny
        const savedKey = localStorage.getItem(CONFIG.LICENSE_KEY);
        if (savedKey) {
            document.getElementById('licenseKeyInput').value = savedKey;
        }
    }

    function loadPanelPosition() {
        const savedPos = localStorage.getItem(CONFIG.PANEL_POS_KEY);
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
        const savedPos = localStorage.getItem(CONFIG.TOGGLE_BTN_POS_KEY);
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
        
        const savedConfig = localStorage.getItem(CONFIG.ADDONS_CONFIG_KEY);
        const config = savedConfig ? JSON.parse(savedConfig) : {};
        
        for (const [id, addon] of Object.entries(AVAILABLE_ADDONS)) {
            const isEnabled = config[id] !== undefined ? config[id] : addon.default;
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = isEnabled;
                if (isEnabled) {
                    loadAddonScript(id);
                }
            }
        }
    }

    function loadPanelVisibility() {
        const savedVisible = localStorage.getItem(CONFIG.PANEL_VISIBLE_KEY);
        panel.style.display = savedVisible === "true" ? "block" : "none";
    }

    // 🔹 ADDONS LOADING
    function loadAddonScript(addonId) {
        const baseUrl = `https://shaderderwraith.github.io/SynergyWraith/addons/`;
        const scriptUrl = `${baseUrl}${addonId}.js?t=${Date.now()}`;
        
        if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.onerror = () => console.error(`Nie udało się załadować dodatku: ${addonId}`);
            document.head.appendChild(script);
            console.log(`✅ Załadowano dodatek: ${addonId}`);
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
        localStorage.setItem(CONFIG.PANEL_VISIBLE_KEY, (!isVisible).toString());
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
            localStorage.setItem(CONFIG.PANEL_POS_KEY, JSON.stringify({
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
            localStorage.setItem(CONFIG.TOGGLE_BTN_POS_KEY, JSON.stringify({
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
                
                const config = JSON.parse(localStorage.getItem(CONFIG.ADDONS_CONFIG_KEY) || '{}');
                config[addonId] = isEnabled;
                localStorage.setItem(CONFIG.ADDONS_CONFIG_KEY, JSON.stringify(config));
                
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
                settingsPanel.classList.toggle('visible');
                
                // Optional: Zamknij inne otwarte panele
                document.querySelectorAll('.addon-settings-panel').forEach(panel => {
                    if (panel.id !== `settings-${addonId}`) {
                        panel.classList.remove('visible');
                    }
                });
            }
        });
    }

    function setupLicenseVerification() {
        document.getElementById('verifyLicense').addEventListener('click', () => {
            const licenseKey = document.getElementById('licenseKeyInput').value.trim();
            if (licenseKey) {
                verifyLicense(licenseKey);
            } else {
                showLicenseMessage('❌ Wprowadź klucz licencyjny', 'error');
            }
        });

        // Enter key support
        document.getElementById('licenseKeyInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('verifyLicense').click();
            }
        });
    }

    function setupResetButton() {
        document.getElementById('reset-settings')?.addEventListener('click', () => {
            if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) {
                localStorage.clear();
                alert('Ustawienia zresetowane. Strona zostanie odświeżona.');
                setTimeout(() => location.reload(), 1000);
            }
        });
    }

    // 🔹 TAB SYSTEM
    function setupTabs() {
        document.querySelector('.tab-container').addEventListener('click', (e) => {
            if (e.target.matches('.tablink')) {
                openTab(e.target.dataset.tab);
            }
        });
    }

    function openTab(tabName) {
        document.querySelectorAll('.tabcontent').forEach(tab => {
            tab.style.display = 'none';
        });
        
        document.querySelectorAll('.tablink').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(tabName).style.display = 'block';
        document.querySelector(`.tablink[data-tab="${tabName}"]`).classList.add('active');
    }

    // 🔹 START THE PANEL
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }

})();
