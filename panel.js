// panel.js
(function() {
    'use strict';
    console.log("✅ Panel dodatków załadowany");

    // 🔹 CONFIGURATION
    const CONFIG = {
        PANEL_POS_KEY: "addons_panel_position",
        PANEL_VISIBLE_KEY: "addons_panel_visible",
        TOGGLE_BTN_POS_KEY: "addons_toggleBtn_position",
        ADDONS_CONFIG_KEY: "addons_config"
    };

    // 🔹 ADDONS DEFINITION (EASY TO ADD NEW ONES)
    const AVAILABLE_ADDONS = {
        autoheal: {
            name: "Auto Heal",
            description: "Automatycznie leczy postać gdy zdrowie spadnie poniżej ustalonego progu",
            default: false
        },
        xpbar: {
            name: "XP Bar",
            description: "Pokazuje pasek doświadczenia i szacowany czas do następnego poziomu",
            default: true
        },
        fastfight: {
            name: "Fast Fight",
            description: "Przyspiesza animacje walki i automatycznie kontynuuje walkę",
            default: false
        },
        lootnotifier: {
            name: "Loot Notifier",
            description: "Pokazuje powiadomienia o rzadkich przedmiotach",
            default: true
        }
    };

    // 🔹 MAIN INITIALIZATION
    function initPanel() {
        createToggleButton();
        createMainPanel();
        loadSavedState();
        setupEventListeners();
        setupTabs();
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
                    ${generateAddonsList()}
                </div>

                <div id="status" class="tabcontent">
                    <h3>Status Gry</h3>
                    <div class="status-item">
                        <span class="status-label">Poziom:</span>
                        <span class="status-value" id="status-level">-</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">HP:</span>
                        <span class="status-value" id="status-hp">-/-</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Mana:</span>
                        <span class="status-value" id="status-mana">-/-</span>
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
        let html = '';
        for (const [id, addon] of Object.entries(AVAILABLE_ADDONS)) {
            html += `
                <div class="addon" data-addon-id="${id}">
                    <div class="addon-header">
                        <span class="addon-title">${addon.name}</span>
                        <label class="switch">
                            <input type="checkbox" id="${id}" data-addon-id="${id}">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="addon-description">${addon.description}</div>
                </div>
            `;
        }
        return html;
    }

    // 🔹 STATE MANAGEMENT
    function loadSavedState() {
        loadPanelPosition();
        loadToggleButtonPosition();
        loadAddonsConfig();
        loadPanelVisibility();
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

    // 🔹 ADDONS LOADING (MODULAR SYSTEM)
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
                
                // Save to config
                const config = JSON.parse(localStorage.getItem(CONFIG.ADDONS_CONFIG_KEY) || '{}');
                config[addonId] = isEnabled;
                localStorage.setItem(CONFIG.ADDONS_CONFIG_KEY, JSON.stringify(config));
                
                // Load or unload addon
                if (isEnabled) {
                    loadAddonScript(addonId);
                } else {
                    console.log(`❌ Wyłączono dodatek: ${addonId}`);
                    // Tutaj możesz dodać logikę usuwania dodatku
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
        // Hide all tabs
        document.querySelectorAll('.tabcontent').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.tablink').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab and activate button
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
