// synergy.js - Główny kod panelu
(function() {
    'use strict';

    console.log('🚀 SynergyWraith Panel v1.0 loaded');

    // 🔹 Konfiguracja
    const CONFIG = {
        LICENSE_KEY: "sw_license_key",
        LICENSE_VERIFIED: "sw_license_verified"
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
        
        checkLicenseOnStart();
    }

    function createToggleButton() {
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij dwukrotnie, aby otworzyć/ukryć panel";
        toggleBtn.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            width: 40px;
            height: 40px;
            background: rgba(20, 20, 20, 0.95) url('https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/icon.jpg') center/70% no-repeat;
            border: 2px solid #444;
            border-radius: 50%;
            cursor: pointer;
            z-index: 1000000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.7);
            transition: all 0.2s ease;
        `;
        document.body.appendChild(toggleBtn);
    }

    function createMainPanel() {
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            left: 20px;
            width: 320px;
            background: rgba(25, 25, 35, 0.98);
            border: 1px solid #444;
            border-radius: 8px;
            color: #e0e0e0;
            z-index: 999999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            box-shadow: 0 5px 25px rgba(0,0,0,0.6);
            backdrop-filter: blur(10px);
            display: none;
        `;
        
        panel.innerHTML = `
            <div style="background: linear-gradient(to right, #2a2a3a, #232330); padding: 12px; text-align: center; border-bottom: 1px solid #393945; cursor: grab;">
                <strong style="color: #a0a0ff;">SYNERGY WRAITH PANEL</strong>
            </div>
            <div style="padding: 15px;">
                <h3 style="color: #00ccff; margin-top: 0;">Aktywacja Licencji</h3>
                <input type="text" id="swLicenseInput" placeholder="Wprowadź klucz licencyjny..." 
                    style="width: 100%; padding: 10px; margin: 10px 0; background: rgba(40, 40, 50, 0.6); border: 1px solid #393945; border-radius: 5px; color: #ccddee;">
                <button onclick="window.synergyVerifyLicense()" 
                    style="width: 100%; padding: 10px; background: linear-gradient(to right, #00ccff, #0099ff); border: none; border-radius: 5px; color: white; cursor: pointer;">
                    Aktywuj Dostęp
                </button>
                <div id="swLicenseMessage" style="margin-top: 10px; padding: 10px; border-radius: 5px;"></div>
                
                <div style="margin-top: 20px; background: rgba(40, 40, 50, 0.6); border: 1px solid #393945; border-radius: 6px; padding: 15px;">
                    <div style="color: #00ccff; font-weight: bold; border-bottom: 1px solid #393945; padding-bottom: 8px; text-align: center;">Status Licencji</div>
                    <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                        <span style="color: #8899aa;">Status:</span>
                        <span id="swLicenseStatus" style="color: #ff3366; font-weight: bold;">Nieaktywna</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
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
        
        // Symulacja weryfikacji
        setTimeout(() => {
            const validKeys = ["TEST-KEY-123", "SYNERGY-2024", "DEV-ACCESS", "SYNERGY-2024-001"];
            if (validKeys.includes(licenseKey)) {
                SW.GM_setValue(CONFIG.LICENSE_KEY, licenseKey);
                SW.GM_setValue(CONFIG.LICENSE_VERIFIED, 'true');
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
        loadAddonScript('kcs-icons');
    }

    function loadAddonScript(addonName) {
        SW.GM_xmlhttpRequest({
            method: 'GET',
            url: `https://shaderderwraith.github.io/SynergyWraith/addons/${addonName}.js?v=${Date.now()}`,
            onload: function(response) {
                if (response.status === 200) {
                    const script = document.createElement('script');
                    script.textContent = response.responseText;
                    document.head.appendChild(script);
                    console.log(`✅ Dodatek ${addonName} załadowany`);
                }
            }
        });
    }

    function checkLicenseOnStart() {
        const isVerified = SW.GM_getValue(CONFIG.LICENSE_VERIFIED, 'false') === 'true';
        if (isVerified) {
            console.log('📋 Licencja zweryfikowana, ładuję dodatki...');
            const licenseKey = SW.GM_getValue(CONFIG.LICENSE_KEY, '');
            document.getElementById('swLicenseInput').value = licenseKey;
            document.getElementById('swLicenseStatus').textContent = 'Aktywna';
            document.getElementById('swLicenseStatus').style.color = '#00ffaa';
            loadAddons();
        }
    }

    function loadSavedState() {
        const savedKey = SW.GM_getValue(CONFIG.LICENSE_KEY, '');
        if (savedKey) {
            document.getElementById('swLicenseInput').value = savedKey;
        }
    }

    function setupEventListeners() {
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('dblclick', function() {
                const panel = document.getElementById('swAddonsPanel');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                }
            });
        }
    }

    // 🔹 Start panelu
    initPanel();
    console.log('🎯 SynergyWraith panel ready!');

})();
