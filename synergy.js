// panel.js - Główny kod panelu
(function() {
    'use strict';

    // 🔹 Odwołanie do globalnego obiektu
    const SW = window.synergyWraith;
    
    if (!SW) {
        console.error('❌ SynergyWraith nie został zainicjalizowany');
        return;
    }

    console.log('🚀 SynergyWraith Panel v1.0');

    // 🔹 Konfiguracja
    const CONFIG = {
        PANEL_POS_KEY: "sw_panel_position",
        PANEL_VISIBLE_KEY: "sw_panel_visible",
        LICENSE_KEY: "sw_license_key",
        LICENSE_VERIFIED: "sw_license_verified"
    };

    // 🔹 Główne funkcje
    function initPanel() {
        console.log('✅ Inicjalizacja panelu...');
        
        createToggleButton();
        createMainPanel();
        loadSavedState();
        setupEventListeners();
        
        checkLicenseOnStart();
        console.log('🎯 Panel gotowy');
    }

    function createToggleButton() {
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.innerHTML = `
            <style>
                #swPanelToggle {
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
                }
                #swPanelToggle:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 15px rgba(100, 100, 255, 0.4);
                }
            </style>
        `;
        document.body.appendChild(toggleBtn);
    }

    function createMainPanel() {
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        panel.innerHTML = `
            <style>
                #swAddonsPanel {
                    position: fixed;
                    top: 80px;
                    left: 20px;
                    width: 320px;
                    background: rgba(25, 25, 35, 0.98);
                    border: 1px solid #444;
                    border-radius: 8px;
                    color: #e0e0e0;
                    z-index: 999999;
                    font-family: 'Segoe UI', sans-serif;
                    box-shadow: 0 5px 25px rgba(0,0,0,0.6);
                    backdrop-filter: blur(10px);
                }
                .sw-tab-content { padding: 15px; }
                .sw-license-input { 
                    width: 100%; 
                    padding: 10px; 
                    margin: 10px 0; 
                    background: rgba(40, 40, 50, 0.6);
                    border: 1px solid #393945;
                    border-radius: 5px;
                    color: #ccddee;
                }
            </style>
            <div style="background: linear-gradient(to right, #2a2a3a, #232330); padding: 12px; text-align: center; border-bottom: 1px solid #393945;">
                <strong>SYNERGY WRAITH</strong>
            </div>
            <div class="sw-tab-content">
                <h3>Aktywacja Licencji</h3>
                <input type="text" class="sw-license-input" id="swLicenseInput" placeholder="Wprowadź klucz licencyjny...">
                <button onclick="verifyLicense()" style="width:100%; padding:10px; background:#00ccff; border:none; border-radius:5px; color:white; cursor:pointer;">
                    Aktywuj Dostęp
                </button>
                <div id="swLicenseMessage" style="margin-top:10px; padding:10px; border-radius:5px;"></div>
            </div>
        `;
        document.body.appendChild(panel);
    }

    function verifyLicense() {
        const licenseKey = document.getElementById('swLicenseInput').value.trim();
        const messageEl = document.getElementById('swLicenseMessage');
        
        if (!licenseKey) {
            showMessage('❌ Wprowadź klucz licencyjny', 'error');
            return;
        }

        showMessage('🔐 Weryfikowanie...', 'info');
        
        // Tutaj dodaj swoją logikę weryfikacji
        setTimeout(() => {
            const validKeys = ["TEST-KEY-123", "SYNERGY-2024", "DEV-ACCESS"];
            if (validKeys.includes(licenseKey)) {
                SW.GM_setValue(CONFIG.LICENSE_KEY, licenseKey);
                SW.GM_setValue(CONFIG.LICENSE_VERIFIED, 'true');
                showMessage('✅ Licencja aktywowana!', 'success');
                loadAddons();
            } else {
                showMessage('❌ Nieprawidłowy klucz', 'error');
            }
        }, 1000);
    }

    function showMessage(message, type) {
        const messageEl = document.getElementById('swLicenseMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.style.background = type === 'success' ? 'rgba(0,255,170,0.1)' : 'rgba(255,50,100,0.1)';
            messageEl.style.color = type === 'success' ? '#00ffaa' : '#ff3366';
            messageEl.style.border = `1px solid ${type === 'success' ? '#00ffaa' : '#ff3366'}`;
        }
    }

    function loadAddons() {
        console.log('🔓 Ładowanie dodatków...');
        // Tutaj dodaj ładowanie swoich dodatków
        loadAddonScript('kcs-icons');
    }

    function loadAddonScript(addonName) {
        const script = document.createElement('script');
        script.src = `https://shaderderwraith.github.io/SynergyWraith/addons/${addonName}.js?v=${Date.now()}`;
        script.onload = function() {
            console.log(`✅ Dodatek ${addonName} załadowany`);
        };
        script.onerror = function() {
            console.error(`❌ Błąd ładowania dodatku: ${addonName}`);
        };
        document.head.appendChild(script);
    }

    function checkLicenseOnStart() {
        const isVerified = SW.GM_getValue(CONFIG.LICENSE_VERIFIED, 'false') === 'true';
        if (isVerified) {
            console.log('📋 Licencja zweryfikowana, ładuję dodatki...');
            loadAddons();
        }
    }

    function loadSavedState() {
        // Wczytaj zapisane ustawienia
        const savedKey = SW.GM_getValue(CONFIG.LICENSE_KEY, '');
        if (savedKey) {
            document.getElementById('swLicenseInput').value = savedKey;
        }
    }

    function setupEventListeners() {
        // Podstawowe event listeners
        document.getElementById('swPanelToggle').addEventListener('dblclick', function() {
            const panel = document.getElementById('swAddonsPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
    }

    // 🔹 Start panelu gdy DOM jest gotowy
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        setTimeout(initPanel, 1000);
    }

})();
