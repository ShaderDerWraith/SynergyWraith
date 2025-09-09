// synergy.js - Główny kod panelu
(function() {
    'use strict';

    console.log('🚀 SynergyWraith Panel v1.0 loaded');

    // 🔹 Konfiguracja
    const CONFIG = {
    LICENSE_KEY: "sw_license_key",
    LICENSE_VERIFIED: "sw_license_verified", 
    PANEL_POSITION: "sw_panel_position",
    PANEL_VISIBLE: "sw_panel_visible",
    TOGGLE_BTN_POSITION: "sw_toggle_button_position" // DODAJ TEN KLUCZ
};

    // 🔹 Safe fallback - jeśli synergyWraith nie istnieje
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
            GM_xmlhttpRequest: ({ method, url, onload, onerror }) => {
                fetch(url, { method })
                    .then(response => onload({ status: response.status, responseText: response.text() }))
                    .catch(onerror);
            }
        };
    }

    const SW = window.synergyWraith;

    // 🔹 Główne funkcje
    function initPanel() {
        console.log('✅ Initializing panel...');
        
        createToggleButton();
        createMainPanel();
        setupEventListeners();
        setupTabs();
        setupDrag();
        loadSavedState();
        
        checkLicenseOnStart();
    }

    function createToggleButton() {
    // Usuń stary przycisk jeśli istnieje
    const oldToggle = document.getElementById('swPanelToggle');
    if (oldToggle) oldToggle.remove();
    
    const toggleBtn = document.createElement("div");
    toggleBtn.id = "swPanelToggle";
    toggleBtn.title = "Kliknij dwukrotnie - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
    toggleBtn.innerHTML = "SW";
    toggleBtn.style.cssText = `
        position: fixed !important;
        top: 70px !important;
        left: 70px !important;
        width: 50px !important;
        height: 50px !important;
        background: linear-gradient(45deg, #ff0000, #ff3333) !important;
        border: 3px solid #00ff00 !important;
        border-radius: 50% !important;
        cursor: grab !important;
        z-index: 1000000 !important;
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.9) !important;
        color: white !important;
        font-weight: bold !important;
        font-size: 20px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-shadow: 0 0 5px black !important;
        transition: transform 0.2s ease !important;
        user-select: none !important;
    `;
    document.body.appendChild(toggleBtn);
    console.log('✅ Toggle button created');
    
    // Dodaj przeciąganie przycisku
    setupToggleDrag(toggleBtn);
    
    return toggleBtn;
}

function setupToggleDrag(toggleBtn) {
    let isDragging = false;
    let isClick = false;
    let startX, startY;
    let initialLeft, initialTop;
    let dragTimeout;

    toggleBtn.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return; // Tylko lewy przycisk myszy
        
        isClick = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = parseInt(toggleBtn.style.left) || 70;
        initialTop = parseInt(toggleBtn.style.top) || 70;
        
        // Czekaj na ruch - jeśli użytkownik przesunie mysz, to przeciąganie
        dragTimeout = setTimeout(() => {
            if (isClick) {
                startDragging();
                isClick = false;
            }
        }, 150); // 150ms threshold dla przeciągania
        
        e.preventDefault();
    });

    function startDragging() {
    isDragging = true;
    isClick = false;
    
    // Zmień wygląd podczas przeciągania
    toggleBtn.style.cursor = 'grabbing';
    toggleBtn.style.transform = 'scale(1.1)';
    toggleBtn.style.boxShadow = '0 0 25px rgba(255, 100, 100, 1)';
    toggleBtn.style.border = '3px solid #ffff00';
    toggleBtn.classList.add('dragging'); // DODAJ KLASĘ
    
    // Dodaj nasłuchiwacze
    document.addEventListener('mousemove', onToggleDrag);
    document.addEventListener('mouseup', stopToggleDrag);
    document.addEventListener('mouseleave', stopToggleDrag);
}
    
    function startDragging() {
        isDragging = true;
        isClick = false;
        
        // Zmień wygląd podczas przeciągania
        toggleBtn.style.cursor = 'grabbing';
        toggleBtn.style.transform = 'scale(1.1)';
        toggleBtn.style.boxShadow = '0 0 25px rgba(255, 100, 100, 1)';
        toggleBtn.style.border = '3px solid #ffff00';
        
        // Dodaj nasłuchiwacze
        document.addEventListener('mousemove', onToggleDrag);
        document.addEventListener('mouseup', stopToggleDrag);
        document.addEventListener('mouseleave', stopToggleDrag);
    }

    function onToggleDrag(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Oblicz nową pozycję
        const newLeft = initialLeft + deltaX;
        const newTop = initialTop + deltaY;
        
        // Ogranicz do obszaru ekranu
        const maxX = window.innerWidth - toggleBtn.offsetWidth;
        const maxY = window.innerHeight - toggleBtn.offsetHeight;
        
        toggleBtn.style.left = Math.max(0, Math.min(newLeft, maxX)) + 'px';
        toggleBtn.style.top = Math.max(0, Math.min(newTop, maxY)) + 'px';
    }

    function stopToggleDrag() {
        if (dragTimeout) clearTimeout(dragTimeout);
        
        if (!isDragging && !isClick) return;
        
        if (isDragging) {
            // Zakończ przeciąganie
            isDragging = false;
            
            // Przywróć wygląd
            toggleBtn.style.cursor = 'grab';
            toggleBtn.style.transform = 'scale(1)';
            toggleBtn.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.9)';
            toggleBtn.style.border = '3px solid #00ff00';
            
            // Zapisz pozycję
            SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, {
                left: toggleBtn.style.left,
                top: toggleBtn.style.top
            });
            
            console.log('💾 Saved button position:', {
                left: toggleBtn.style.left,
                top: toggleBtn.style.top
            });
        }
        
        // Usuń nasłuchiwacze
        document.removeEventListener('mousemove', onToggleDrag);
        document.removeEventListener('mouseup', stopToggleDrag);
        document.removeEventListener('mouseleave', stopToggleDrag);
        
        isClick = false;
    }

    // Obsługa podwójnego kliknięcia
    let lastClickTime = 0;
    toggleBtn.addEventListener('click', function(e) {
        if (isDragging) {
            e.preventDefault();
            return;
        }
        
        const currentTime = new Date().getTime();
        const isDoubleClick = (currentTime - lastClickTime) < 300; // 300ms threshold
        
        if (isDoubleClick) {
            // Podwójny klik - toggle panel
            const panel = document.getElementById('swAddonsPanel');
            if (panel) {
                const isVisible = panel.style.display === 'block';
                panel.style.display = isVisible ? 'none' : 'block';
                SW.GM_setValue(CONFIG.PANEL_VISIBLE, !isVisible);
                console.log('🎯 Panel toggled:', !isVisible);
            }
            lastClickTime = 0;
        } else {
            lastClickTime = currentTime;
        }
        
        e.preventDefault();
    });

    // Zapobiegaj domyślnej akcji dla myszy
    toggleBtn.addEventListener('mouseup', function(e) {
        if (isDragging) {
            e.preventDefault();
        }
    });

    console.log('✅ Improved toggle drag functionality added');
}

    function onToggleDrag(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Oblicz nową pozycję
        const newLeft = initialLeft + deltaX;
        const newTop = initialTop + deltaY;
        
        // Ogranicz do obszaru ekranu
        const maxX = window.innerWidth - toggleBtn.offsetWidth;
        const maxY = window.innerHeight - toggleBtn.offsetHeight;
        
        toggleBtn.style.left = Math.max(0, Math.min(newLeft, maxX)) + 'px';
        toggleBtn.style.top = Math.max(0, Math.min(newTop, maxY)) + 'px';
    }

    function stopToggleDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Przywróć wygląd
        toggleBtn.style.cursor = 'grab';
        toggleBtn.style.transform = 'scale(1)';
        toggleBtn.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.9)';
        toggleBtn.style.border = '3px solid #00ff00';
        
        // Zapisz pozycję
        SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, {
            left: toggleBtn.style.left,
            top: toggleBtn.style.top
        });
        
        console.log('💾 Saved button position:', {
            left: toggleBtn.style.left,
            top: toggleBtn.style.top
        });
        
        // Usuń nasłuchiwacze
        document.removeEventListener('mousemove', onToggleDrag);
        document.removeEventListener('mouseup', stopToggleDrag);
        document.removeEventListener('mouseleave', stopToggleDrag);
    }

    // Podwójny klik do otwierania panelu
    let clickTimer = null;
    toggleBtn.addEventListener('click', function(e) {
        if (isDragging) return; // Ignoruj kliknięcia podczas przeciągania
        
        if (clickTimer !== null) {
            clearTimeout(clickTimer);
            clickTimer = null;
            // Double click - toggle panel
            const panel = document.getElementById('swAddonsPanel');
            if (panel) {
                const isVisible = panel.style.display === 'block';
                panel.style.display = isVisible ? 'none' : 'block';
                SW.GM_setValue(CONFIG.PANEL_VISIBLE, !isVisible);
            }
        } else {
            clickTimer = setTimeout(() => {
                clickTimer = null;
            }, 300);
        }
    });

    console.log('✅ Toggle drag functionality added');
}
    function createMainPanel() {
        // Usuń stary panel jeśli istnieje
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        panel.style.cssText = `
            position: fixed;
            top: 140px;
            left: 70px;
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
                <button id="swVerifyButton" 
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
                </div>
            </div>

            <div class="sw-tab-content" id="swTabSettings" style="padding: 15px; display: none;">
                <h3 style="color: #00ccff; margin-top: 0;">Ustawienia Panelu</h3>
                <button id="swResetButton" style="width: 100%; padding: 10px; background: linear-gradient(to right, #ff5555, #ff3366); border: none; border-radius: 5px; color: white; cursor: pointer; font-weight: 600;">
                    Resetuj Ustawienia
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        console.log('✅ Panel created');
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
                
                // Usuń aktywną klasę
                tabs.forEach(t => {
                    t.style.color = '#8899aa';
                    t.style.borderBottom = 'none';
                });
                
                // Pokaż wybraną zakładkę
                const tabId = 'swTab' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.style.display = 'block';
                }
                
                // Oznacz aktywny przycisk
                this.style.color = '#00ccff';
                this.style.borderBottom = '2px solid #00ccff';
            });
        });
        console.log('✅ Tabs setup complete');
    }

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
            SW.GM_setValue(CONFIG.PANEL_POSITION, {
                left: panel.style.left,
                top: panel.style.top
            });
            
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
        }
        console.log('✅ Drag setup complete');
    }

    function setupEventListeners() {
        // Podwójny klik na przycisk
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('dblclick', function() {
                const panel = document.getElementById('swAddonsPanel');
                if (panel) {
                    const isVisible = panel.style.display === 'block';
                    panel.style.display = isVisible ? 'none' : 'block';
                    SW.GM_setValue(CONFIG.PANEL_VISIBLE, !isVisible);
                }
            });
        }

        // Weryfikacja licencji
        const verifyBtn = document.getElementById('swVerifyButton');
        if (verifyBtn) {
            verifyBtn.addEventListener('click', verifyLicense);
        }

        // Reset ustawień
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (confirm('Czy na pewno chcesz zresetować ustawienia?')) {
                    SW.GM_deleteValue(CONFIG.LICENSE_KEY);
                    SW.GM_deleteValue(CONFIG.LICENSE_VERIFIED);
                    SW.GM_deleteValue(CONFIG.PANEL_POSITION);
                    SW.GM_deleteValue(CONFIG.PANEL_VISIBLE);
                    alert('Ustawienia zresetowane. Odśwież stronę.');
                }
            });
        }
        console.log('✅ Event listeners setup complete');
    }

    function verifyLicense() {
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
    }

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
        SW.GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/addons/kcs-icons.js?v=' + Date.now(),
            onload: function(response) {
                if (response.status === 200) {
                    const script = document.createElement('script');
                    script.textContent = response.responseText;
                    document.head.appendChild(script);
                    console.log('✅ Dodatek kcs-icons załadowany');
                }
            },
            onerror: function(error) {
                console.error('❌ Błąd ładowania dodatku:', error);
            }
        });
    }

    function loadSavedState() {
    // Załaduj zapisaną pozycję PRZYCISKU
    const savedBtnPosition = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
    const toggleBtn = document.getElementById('swPanelToggle');
    if (toggleBtn && savedBtnPosition) {
        toggleBtn.style.left = savedBtnPosition.left || '70px';
        toggleBtn.style.top = savedBtnPosition.top || '70px';
        console.log('📍 Loaded button position:', savedBtnPosition);
    }
    
    // Reszta funkcji (panel position, license, etc.) pozostaje bez zmian
    const savedPosition = SW.GM_getValue(CONFIG.PANEL_POSITION);
    const panel = document.getElementById('swAddonsPanel');
    if (panel && savedPosition) {
        panel.style.left = savedPosition.left || '70px';
        panel.style.top = savedPosition.top || '140px';
    }
    
    const isVisible = SW.GM_getValue(CONFIG.PANEL_VISIBLE, 'false') === 'true';
    if (panel) {
        panel.style.display = isVisible ? 'block' : 'none';
    }
    
    const savedKey = SW.GM_getValue(CONFIG.LICENSE_KEY, '');
    const licenseInput = document.getElementById('swLicenseInput');
    if (licenseInput && savedKey) {
        licenseInput.value = savedKey;
    }
    
    const isVerified = SW.GM_getValue(CONFIG.LICENSE_VERIFIED, 'false') === 'true';
    const statusEl = document.getElementById('swLicenseStatus');
    if (statusEl && isVerified) {
        statusEl.textContent = 'Aktywna';
        statusEl.style.color = '#00ffaa';
    }
    
    console.log('✅ Saved state loaded');
}

    function checkLicenseOnStart() {
        const isVerified = SW.GM_getValue(CONFIG.LICENSE_VERIFIED, 'false') === 'true';
        if (isVerified) {
            console.log('📋 Licencja zweryfikowana, ładuję dodatki...');
            loadAddons();
        }
    }

    // 🔹 Start panelu
    console.log('🎯 Starting panel initialization...');
    initPanel();
    console.log('✅ SynergyWraith panel ready!');

})();
