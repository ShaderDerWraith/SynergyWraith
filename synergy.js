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
        TOGGLE_BTN_POSITION: "sw_toggle_button_position"
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
                    .then(response => response.text().then(text => onload({ status: response.status, responseText: text })))
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
        document.body.appendChild(toggleBtn);
        console.log('✅ Toggle button created');
        
        // Dodaj przeciąganie przycisku
        setupToggleDrag(toggleBtn);
        
        return toggleBtn;
    }

    function setupToggleDrag(toggleBtn) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        let clickCount = 0;
        let clickTimer = null;

        toggleBtn.addEventListener('mousedown', function(e) {
            console.log('mousedown on toggle button');
            if (e.button !== 0) return;
            
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = parseInt(toggleBtn.style.left) || 70;
            initialTop = parseInt(toggleBtn.style.top) || 70;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('mouseleave', onMouseUp);
            
            e.preventDefault();
        });

        function onMouseMove(e) {
            console.log('mousemove');
            if (!isDragging) {
                // Rozpocznij przeciąganie natychmiast po ruchu myszy
                startDragging();
            }
            
            if (isDragging) {
                onToggleDrag(e);
            }
        }

        function startDragging() {
            isDragging = true;
            
            toggleBtn.style.cursor = 'grabbing';
            toggleBtn.style.transform = 'scale(1.15)';
            toggleBtn.style.boxShadow = '0 0 30px rgba(255, 50, 50, 1.2)';
            toggleBtn.style.border = '3px solid #ffff00';
            toggleBtn.classList.add('dragging');
            
            clickCount = 0;
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
            }
        }

        function onToggleDrag(e) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newLeft = initialLeft + deltaX;
            const newTop = initialTop + deltaY;
            
            const maxX = window.innerWidth - toggleBtn.offsetWidth;
            const maxY = window.innerHeight - toggleBtn.offsetHeight;
            
            toggleBtn.style.left = Math.max(0, Math.min(newLeft, maxX)) + 'px';
            toggleBtn.style.top = Math.max(0, Math.min(newTop, maxY)) + 'px';
        }

        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mouseleave', onMouseUp);
            
            if (isDragging) {
                stopDragging();
            } else {
                handleClick();
            }
        }

        function stopDragging() {
            isDragging = false;
            
            toggleBtn.style.cursor = 'grab';
            toggleBtn.style.transform = 'scale(1)';
            toggleBtn.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.9)';
            toggleBtn.style.border = '3px solid #00ff00';
            toggleBtn.classList.remove('dragging');
            toggleBtn.classList.add('saved');
            
            SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, {
                left: toggleBtn.style.left,
                top: toggleBtn.style.top
            });
            
            console.log('💾 Saved button position:', {
                left: toggleBtn.style.left,
                top: toggleBtn.style.top
            });
            
            setTimeout(() => {
                toggleBtn.classList.remove('saved');
            }, 1500);
        }

        function handleClick() {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                clickCount = 0;
                togglePanel();
            }
        }

        function togglePanel() {
            const panel = document.getElementById('swAddonsPanel');
            if (panel) {
                const isVisible = panel.style.display === 'block';
                panel.style.display = isVisible ? 'none' : 'block';
                SW.GM_setValue(CONFIG.PANEL_VISIBLE, !isVisible);
                console.log('🎯 Panel toggled:', !isVisible);
            }
        }

        console.log('✅ Advanced toggle drag functionality added');
    }

    function createMainPanel() {
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
            
            <div style="display: flex; background: linear-gradient(to bottom, #2c2c3c, #252532; border-bottom: 1px solid #393945; padding: 0 5px;">
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
                
                tabContents.forEach(content => {
                    content.style.display = 'none';
                });
                
                tabs.forEach(t => {
                    t.style.color = '#8899aa';
                    t.style.borderBottom = 'none';
                });
                
                const tabContent = document.getElementById('swTab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
                if (tabContent) {
                    tabContent.style.display = 'block';
                }
                
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
            document.addEventListener('mousemove', onPanelDrag);
            document.addEventListener('mouseup', stopPanelDrag);
        });

        function onPanelDrag(e) {
            if (!isDragging) return;
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
        }

        function stopPanelDrag() {
            if (!isDragging) return;
            isDragging = false;
            panel.style.opacity = '1';
            
            SW.GM_setValue(CONFIG.PANEL_POSITION, {
                left: panel.style.left,
                top: panel.style.top
            });
            
            document.removeEventListener('mousemove', onPanelDrag);
            document.removeEventListener('mouseup', stopPanelDrag);
        }
        console.log('✅ Panel drag setup complete');
    }

    function setupEventListeners() {
        const verifyBtn = document.getElementById('swVerifyButton');
        if (verifyBtn) {
            verifyBtn.addEventListener('click', verifyLicense);
        }

        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (confirm('Czy na pewno chcesz zresetować ustawienia?')) {
                    SW.GM_deleteValue(CONFIG.LICENSE_KEY);
                    SW.GM_deleteValue(CONFIG.LICENSE_VERIFIED);
                    SW.GM_deleteValue(CONFIG.PANEL_POSITION);
                    SW.GM_deleteValue(CONFIG.PANEL_VISIBLE);
                    SW.GM_deleteValue(CONFIG.TOGGLE_BTN_POSITION);
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
                if (statusEl) {
                    statusEl.textContent = 'Aktywna';
                    statusEl.style.color = '#00ffaa';
                }
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
        if (SW && SW.GM_xmlhttpRequest) {
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
    }

    function loadSavedState() {
        if (!SW || !SW.GM_getValue) return;
        
        const savedBtnPosition = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn && savedBtnPosition) {
            toggleBtn.style.left = savedBtnPosition.left || '70px';
            toggleBtn.style.top = savedBtnPosition.top || '70px';
            console.log('📍 Loaded button position:', savedBtnPosition);
        }
        
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
        if (SW && SW.GM_getValue) {
            const isVerified = SW.GM_getValue(CONFIG.LICENSE_VERIFIED, 'false') === 'true';
            if (isVerified) {
                console.log('📋 Licencja zweryfikowana, ładuję dodatki...');
                loadAddons();
            }
        }
    }

    console.log('🎯 Starting panel initialization...');
    initPanel();
    console.log('✅ SynergyWraith panel ready!');

})();
