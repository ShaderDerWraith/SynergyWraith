// synergy.js - Główny kod panelu
(function() {
    'use strict';

    console.log('🚀 SynergyWraith Panel v1.0 loaded');

    // 🔹 Konfiguracja
    const CONFIG = {
        LICENSE_KEY: "sw_license_key",
        LICENSE_VERIFIED: "sw_license_verified",
        PANEL_POSITION: "sw_panel_position"
    };

    // 🔹 Odwołanie do globalnego obiektu
    const SW = window.synergyWraith;
    
    if (!SW) {
        console.error('❌ SynergyWraith not initialized');
        return;
    }

    // 🔹 Główne funkcje
    function initPanel() {
        console.log('✅ Initializing panel...');
        
        createToggleButton();
        createMainPanel();
        loadSavedState();
        setupEventListeners();
        setupTabs();
        setupDrag();
        
        checkLicenseOnStart();
    }

    function createToggleButton() {
    if (document.getElementById('swPanelToggle')) return;
    
    const toggleBtn = document.createElement("div");
    toggleBtn.id = "swPanelToggle";
    toggleBtn.title = "Kliknij dwukrotnie, aby otworzyć/ukryć panel";
    toggleBtn.style.cssText = `
        position: fixed !important;
        top: 50px !important;
        left: 50px !important;
        width: 50px !important;
        height: 50px !important;
        background: linear-gradient(45deg, #ff0000, #ff3333) !important;
        border: 3px solid #00ff00 !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        z-index: 1000000 !important;
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.9) !important;
        color: white !important;
        font-weight: bold !important;
        font-size: 20px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-shadow: 0 0 5px black !important;
    `;
    toggleBtn.textContent = "SW";
    document.body.appendChild(toggleBtn);
}
    function createMainPanel() {
        if (document.getElementById('swAddonsPanel')) return;
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        panel.style.cssText = `
            position: fixed;
            top: 120px;
            left: 50px;
            width: 350px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 3px solid #00ccff;
            border-radius: 10px;
            color: #ffffff;
            z-index: 999999;
            box-shadow: 0 0 30px rgba(0, 204, 255, 0.6);
            backdrop-filter: blur(10px);
            display: none;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        panel.innerHTML = `
            <div id="swPanelHeader" style="background: linear-gradient(to right, #2a2a3a, #232330); padding: 12px; text-align: center; border-bottom: 1px solid #393945; cursor: grab;">
                <strong style="color: #a0a0ff;">SYNERGY WRAITH PANEL</strong>
            </div>
            
            <div style="display: flex; background: linear-gradient(to bottom, #2c2c3c, #252532); border-bottom: 1px solid #393945; padding: 0 5px;">
                <button class="sw-tab active" data-tab="addons" style="flex: 1; background: none; border: none; padding: 12px; color: #00ccff; cursor: pointer; border-bottom: 2px solid #00ccff;">Dodatki</button>
                <button class="sw-tab" data-tab="status" style="flex: 1; background: none; border: none; padding: 12px; color: #8899aa; cursor: pointer;">Status</button>
                <button class="sw-tab" data-tab="settings" style="flex: 1; background: none; border: none; padding: 12px; color: #8899aa; cursor: pointer;">Ustawienia</button>
            </div>

            <div class="sw-tab-content" id="swTabAddons" style="padding: 15px; display: block;">
                <h3 style="color: #00ccff; margin-top: 0;">Aktywne Dodatki</h3>
                <div style="background: rgba(40, 40, 50, 0.6); border: 1px solid #393945; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: #ccddee;">KCS i Zwój Ikony</span>
                        <label style="position: relative; display: inline-block; width: 36px; height: 18px;">
                            <input type="checkbox" checked style="opacity: 0; width: 0; height: 0;">
                            <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #00ccff; border-radius: 18px; transition: .3s;"></span>
                        </label>
                    </div>
                    <div style="color: #8899aa; font-size: 12px;">Pokazuje ikony potworów na Kamieniach i Zwojach Czerwonego Smoka</div>
                </div>
            </div>

            <div class="sw-tab-content" id="swTabStatus" style="padding: 15px; display: none;">
                <h3 style="color: #00ccff; margin-top: 0;">Weryfikacja Dostępu</h3>
                <input type="text" id="swLicenseInput" placeholder="Wprowadź klucz licencyjny..." 
                    style="width: 100%; padding: 10px; margin: 10px 0; background: rgba(40, 40, 50, 0.6); border: 1px solid #393945; border-radius: 5px; color: #ccddee;">
                <button onclick="window.synergyVerifyLicense()" 
                    style="width: 100%; padding: 10px; background: linear-gradient(to right, #00ccff, #0099ff); border: none; border-radius: 5px; color: white; cursor: pointer; font-weight: 600;">
                    Aktywuj Dostęp
                </button>
                <div id="swLicenseMessage" style="margin-top: 10px; padding: 10px; border-radius: 5px;"></div>
                
                <div style="margin-top: 20px; background: rgba(40, 40, 50, 0.6); border: 1px solid #393945; border-radius: 6px; padding: 15px;">
                    <div style="color: #00ccff; font-weight: bold; border-bottom: 1px solid #393945; padding-bottom: 8px; text-align: center;">Status Licencji</div>
                    <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                        <span style="color: #8899aa;">Status:</span>
                        <span id="swLicenseStatus" style="color: #ff3366; font-weight: bold;">Nieaktywna</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                        <span style="color: #8899aa;">Użytkownik:</span>
                        <span style="color: #00ffaa; font-weight: bold;">-</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                        <span style="color: #8899aa;">Wygasa:</span>
                        <span style="color: #00ffaa; font-weight: bold;">-</span>
                    </div>
                </div>
            </div>

            <div class="sw-tab-content" id="swTabSettings" style="padding: 15px; display: none;">
                <h3 style="color: #00ccff; margin-top: 0;">Ustawienia Panelu</h3>
                
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="color: #ccddee; font-size: 13px;">Zablokuj pozycję panelu</span>
                        <label style="position: relative; display: inline-block; width: 36px; height: 18px;">
                            <input type="checkbox" id="swLockPosition" style="opacity: 0; width: 0; height: 0;">
                            <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #393945; border-radius: 18px; transition: .3s;"></span>
                        </label>
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="color: #ccddee; font-size: 13px;">Pokazuj powiadomienia</span>
                        <label style="position: relative; display: inline-block; width: 36px; height: 18px;">
                            <input type="checkbox" id="swShowNotifications" checked style="opacity: 0; width: 0; height: 0;">
                            <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #00ccff; border-radius: 18px; transition: .3s;"></span>
                        </label>
                    </div>
                </div>

                <button id="swResetSettings" style="width: 100%; padding: 10px; background: linear-gradient(to right, #ff5555, #ff3366); border: none; border-radius: 5px; color: white; cursor: pointer; font-weight: 600; margin-top: 10px;">
                    Resetuj Ustawienia
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
    }

    function setupTabs() {
        const tabs = document.querySelectorAll('.sw-tab');
        const tabContents = document.querySelectorAll('.sw-tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // Ukryj wszystkie zakładki
                tabContents.forEach(content => {
                    content.style.display = 'none';
                });
                
                // Usuń aktywną klasę z wszystkich przycisków
                tabs.forEach(t => {
                    t.style.color = '#8899aa';
                    t.style.borderBottom = 'none';
                });
                
                // Pokaż wybraną zakładkę
                document.getElementById('swTab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).style.display = 'block';
                
                // Oznacz aktywny przycisk
                this.style.color = '#00ccff';
                this.style.borderBottom = '2px solid #00ccff';
            });
        });
    }

    function setupDrag() {
        const header = document.getElementById('swPanelHeader');
        const panel = document.getElementById('swAddonsPanel');
        const lockCheckbox = document.getElementById('swLockPosition');
        
        if (!header || !panel) return;
        
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', function(e) {
            if (lockCheckbox && lockCheckbox.checked) return;
            
            isDragging = true;
            const rect = panel.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            panel.style.opacity = '0.9';
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDrag);
        });

        function onDrag(e) {
            if (!isDragging) return;
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
        }

        function stopDrag() {
            isDragging = false;
            panel.style.opacity = '1';
            
            // Zapisz pozycję
            if (SW && SW.GM_setValue) {
                SW.GM_setValue(CONFIG.PANEL_POSITION, {
                    left: panel.style.left,
                    top: panel.style.top
                });
            }
            
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
        }
    }

    function setupEventListeners() {
        // Podwójny klik na przycisk
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('dblclick', function() {
                const panel = document.getElementById('swAddonsPanel');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                }
            });
        }

        // Reset ustawień
        const resetBtn = document.getElementById('swResetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) {
                    if (SW && SW.GM_deleteValue) {
                        SW.GM_deleteValue(CONFIG.LICENSE_KEY);
                        SW.GM_deleteValue(CONFIG.LICENSE_VERIFIED);
                        SW.GM_deleteValue(CONFIG.PANEL_POSITION);
                        alert('Ustawienia zresetowane. Strona zostanie odświeżona.');
                        setTimeout(() => location.reload(), 1000);
                    }
                }
            });
        }
    }

    // 🔹 Globalna funkcja do weryfikacji
    window.synergyVerifyLicense = function() {
        const licenseKey = document.getElementById('swLicenseInput').value.trim();
        const messageEl = document.getElementById('swLicenseMessage');
        const statusEl = document.getElementById('swLicenseStatus');
        
        if (!licenseKey) {
            showMessage('❌ Wprowadź klucz licencyjny', 'error');
            return;
        }

        showMessage('🔐 Weryfikowanie...', 'info');
        
        setTimeout(() => {
            const validKeys = ["TEST-KEY-123", "SYNERGY-2024", "DEV-ACCESS", "SYNERGY-2024-001"];
            if (validKeys.includes(licenseKey)) {
                if (SW && SW.GM_setValue) {
                    SW.GM_setValue(CONFIG.LICENSE_KEY, licenseKey);
                    SW.GM_setValue(CONFIG.LICENSE_VERIFIED, 'true');
                }
                showMessage('✅ Licencja aktywowana!', 'success');
                statusEl.textContent = 'Aktywna';
                statusEl.style.color = '#00ffaa';
                loadAddons();
            } else {
                showMessage('❌ Nieprawidłowy klucz', 'error');
            }
        }, 1000);
    };

    function showMessage(message, type) {
        const messageEl = document.getElementById('swLicenseMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.style.background = type === 'success' ? 'rgba(0,255,170,0.1)' : 
                                      type === 'info' ? 'rgba(0,204,255,0.1)' : 'rgba(255,50,100,0.1)';
            messageEl.style.color = type === 'success' ? '#00ffaa' : 
                                 type === 'info' ? '#00ccff' : '#ff3366';
            messageEl.style.border = `1px solid ${type === 'success' ? '#00ffaa' : 
                                 type === 'info' ? '#00ccff' : '#ff3366'}`;
        }
    }

    function loadAddons() {
        console.log('🔓 Ładowanie dodatków...');
        if (SW && SW.GM_xmlhttpRequest) {
            SW.GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://shaderderwraith.github.io/SynergyWraith/addons/kcs-icons.js?v=' + Date.now(),
                onload: function(response) {
                    if (response.status === 200) {
                        const script = document.createElement('script');
                        script.textContent = response.responseText;
                        document.head.appendChild(script);
                        console.log('✅ Dodatek kcs-icons załadowany');
                    }
                }
            });
        }
    }

    function loadSavedState() {
        if (!SW || !SW.GM_getValue) return;
        
        // Załaduj zapisaną pozycję
        const savedPosition = SW.GM_getValue(CONFIG.PANEL_POSITION);
        const panel = document.getElementById('swAddonsPanel');
        if (panel && savedPosition) {
            panel.style.left = savedPosition.left;
            panel.style.top = savedPosition.top;
        }
        
        // Załaduj zapisany klucz licencyjny
        const savedKey = SW.GM_getValue(CONFIG.LICENSE_KEY, '');
        if (savedKey) {
            document.getElementById('swLicenseInput').value = savedKey;
        }
        
        // Sprawdź status licencji
        const isVerified = SW.GM_getValue(CONFIG.LICENSE_VERIFIED, 'false') === 'true';
        if (isVerified) {
            document.getElementById('swLicenseStatus').textContent = 'Aktywna';
            document.getElementById('swLicenseStatus').style.color = '#00ffaa';
        }
    }

    function checkLicenseOnStart() {
        if (SW && SW.GM_getValue) {
            const isVerified = SW.GM_getValue(CONFIG.LICENSE_VERIFIED, 'false') === 'true';
            if (isVerified) {
                console.log('📋 Licencja zweryfikowana, ładuję dodatki...');
                loadAddons();
            }
        }
    }

    // 🔹 Start panelu
    setTimeout(() => {
        initPanel();
        console.log('🎯 SynergyWraith panel ready!');
    }, 1000);

})();
