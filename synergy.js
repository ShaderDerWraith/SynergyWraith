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
        TOGGLE_BTN_POSITION: "sw_toggle_button_position",
        KCS_ICONS_ENABLED: "kcs_icons_enabled"
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
        
        // Najpierw tworzymy przycisk, ale nie inicjujemy jeszcze przeciągania
        const toggleBtn = createToggleButton();
        
        // Ładujemy zapisany stan (w tym pozycję przycisku)
        loadSavedState();
        
        // Teraz inicjujemy przeciąganie przycisku z załadowaną pozycją
        if (toggleBtn) {
            setupToggleDrag(toggleBtn);
        }
        
        createMainPanel();
        setupEventListeners();
        setupTabs();
        setupDrag();
        
        checkLicenseOnStart();
        
        // 🔹 ZAŁADUJ DODATKI PO INICJALIZACJI PANELU
        loadAddons();
    }

    function createToggleButton() {
        // Usuń stary przycisk jeśli istnieje
        const oldToggle = document.getElementById('swPanelToggle');
        if (oldToggle) oldToggle.remove();
        
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij dwukrotnie - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
        
        // Użyj obrazka zamiast tekstu
        toggleBtn.innerHTML = `
            <img src="https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/icon.jpg" 
                 alt="SW" 
                 style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
        `;
        
        // Ustaw domyślną pozycję (zostanie nadpisana przez loadSavedState jeśli istnieje zapisana pozycja)
        toggleBtn.style.position = 'fixed';
        toggleBtn.style.width = '50px';
        toggleBtn.style.height = '50px';
        toggleBtn.style.zIndex = '999998';
        toggleBtn.style.cursor = 'grab';
        toggleBtn.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.9)';
        toggleBtn.style.border = '3px solid #00ff00';
        toggleBtn.style.borderRadius = '50%';
        toggleBtn.style.overflow = 'hidden';
        toggleBtn.style.transition = 'transform 0.2s, box-shadow 0.2s, border 0.2s';
        
        document.body.appendChild(toggleBtn);
        console.log('✅ Toggle button created');
        
        return toggleBtn;
    }

    function setupToggleDrag(toggleBtn) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        let clickCount = 0;
        let clickTimer = null;
        let animationFrame = null;
        
        // Pobierz aktualną pozycję przycisku (już załadowaną z zapisanych ustawień)
        let currentX = parseInt(toggleBtn.style.left) || 70;
        let currentY = parseInt(toggleBtn.style.top) || 70;
        
        // Ustaw pozycję na podstawie zmiennych currentX/Y
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
            document.addEventListener('mouseleave', onMouseUp);
            
            e.preventDefault();
        });

        function onMouseMove(e) {
            if (!isDragging) {
                startDragging();
            }
            
            if (isDragging) {
                // Anuluj poprzednią animację jeśli istnieje
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                
                // Oblicz nową pozycję
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                const newLeft = initialLeft + deltaX;
                const newTop = initialTop + deltaY;
                
                const maxX = window.innerWidth - toggleBtn.offsetWidth;
                const maxY = window.innerHeight - toggleBtn.offsetHeight;
                
                currentX = Math.max(0, Math.min(newLeft, maxX));
                currentY = Math.max(0, Math.min(newTop, maxY));
                
                // Użyj requestAnimationFrame dla płynności
                animationFrame = requestAnimationFrame(() => {
                    toggleBtn.style.left = currentX + 'px';
                    toggleBtn.style.top = currentY + 'px';
                });
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

        function onMouseUp(e) {
            // Usuń nasłuchiwacze
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mouseleave', onMouseUp);
            
            // Anuluj animację jeśli istnieje
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
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
                left: currentX + 'px',
                top: currentY + 'px'
            });
            
            console.log('💾 Saved button position:', {
                left: currentX + 'px',
                top: currentY + 'px'
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
                        <label class="switch">
                            <input type="checkbox" id="kcsIconsToggle">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div style="color: #8899aa; font-size: 12px;">Pokazuje ikony potworów na Kamieniach i Zwojach Czerwonego Smoka</div>
                </div>
                <!-- Dodane miejsce na komunikaty dla dodatków -->
                <div id="swAddonsMessage" style="margin-top: 10px; padding: 10px; border-radius: 5px; display: none;"></div>
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
                
                <!-- Potwierdzenie resetowania -->
                <div id="swResetConfirmation" style="display: none; background: rgba(40, 40, 50, 0.6); border: 1px solid #393945; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
                    <p style="color: #ccddee; margin-top: 0;">Czy na pewno chcesz zresetować ustawienia?</p>
                    <div style="display: flex; gap: 10px;">
                        <button id="swResetConfirm" style="flex: 1; padding: 8px; background: linear-gradient(to right, #ff5555, #ff3366); border: none; border-radius: 5px; color: white; cursor: pointer;">
                            Tak, resetuj
                        </button>
                        <button id="swResetCancel" style="flex: 1; padding: 8px; background: linear-gradient(to right, #555, #333); border: none; border-radius: 5px; color: white; cursor: pointer;">
                            Anuluj
                        </button>
                    </div>
                </div>
                
                <button id="swResetButton" style="width: 100%; padding: 10px; background: linear-gradient(to right, #ff5555, #ff3366); border: none; border-radius: 5px; color: white; cursor: pointer; font-weight: 600;">
                    Resetuj Ustawienia
                </button>
                <div id="swResetMessage" style="margin-top: 10px; padding: 10px; border-radius: 5px; display: none;"></div>
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
        const resetConfirm = document.getElementById('swResetConfirm');
        const resetCancel = document.getElementById('swResetCancel');
        const resetConfirmation = document.getElementById('swResetConfirmation');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                // Pokaż potwierdzenie zamiast używać confirm
                resetConfirmation.style.display = 'block';
                resetBtn.style.display = 'none';
            });
        }
        
        if (resetConfirm) {
            resetConfirm.addEventListener('click', function() {
                // Zachowaj klucz licencji i status weryfikacji
                const licenseKey = SW.GM_getValue(CONFIG.LICENSE_KEY);
                const licenseVerified = SW.GM_getValue(CONFIG.LICENSE_VERIFIED);
                
                // Usuń tylko ustawienia pozycji i widoczności
                SW.GM_deleteValue(CONFIG.PANEL_POSITION);
                SW.GM_deleteValue(CONFIG.PANEL_VISIBLE);
                SW.GM_deleteValue(CONFIG.TOGGLE_BTN_POSITION);
                SW.GM_deleteValue(CONFIG.KCS_ICONS_ENABLED);
                
                // Przywróć klucz licencji i status jeśli istnieją
                if (licenseKey) {
                    SW.GM_setValue(CONFIG.LICENSE_KEY, licenseKey);
                }
                if (licenseVerified) {
                    SW.GM_setValue(CONFIG.LICENSE_VERIFIED, licenseVerified);
                }
                
                // Pokaż komunikat w panelu
                const resetMessage = document.getElementById('swResetMessage');
                if (resetMessage) {
                    resetMessage.textContent = 'Ustawienia zresetowane. Proszę odświeżyć grę, aby zmiany zostały zastosowane.';
                    resetMessage.style.background = 'rgba(0, 204, 255, 0.1)';
                    resetMessage.style.color = '#00ccff';
                    resetMessage.style.border = '1px solid #00ccff';
                    resetMessage.style.display = 'block';
                    
                    // Ukryj komunikat po 5 sekundach
                    setTimeout(() => {
                        resetMessage.style.display = 'none';
                    }, 5000);
                }
                
                // Ukryj potwierdzenie i pokaż przycisk resetowania
                resetConfirmation.style.display = 'none';
                resetBtn.style.display = 'block';
            });
        }
        
        if (resetCancel) {
            resetCancel.addEventListener('click', function() {
                // Ukryj potwierdzenie i pokaż przycisk resetowania
                resetConfirmation.style.display = 'none';
                resetBtn.style.display = 'block';
            });
        }

        // Obsługa suwaka KCS Icons
        const kcsToggle = document.getElementById('kcsIconsToggle');
        if (kcsToggle) {
            kcsToggle.addEventListener('change', function() {
                const isEnabled = this.checked;
                SW.GM_setValue(CONFIG.KCS_ICONS_ENABLED, isEnabled);
                
                // Pokaż komunikat o konieczności odświeżenia w panelu
                const message = isEnabled ? 
                    'KCS Icons włączony. Odśwież grę, aby zmiana została zastosowana.' : 
                    'KCS Icons wyłączony. Odśwież grę, aby zmiana została zastosowana.';
                
                // Użyj istniejącego elementu do wyświetlania komunikatów
                const messageEl = document.getElementById('swAddonsMessage');
                if (messageEl) {
                    messageEl.textContent = message;
                    messageEl.style.background = 'rgba(0, 204, 255, 0.1)';
                    messageEl.style.color = '#00ccff';
                    messageEl.style.border = '1px solid #00ccff';
                    messageEl.style.display = 'block';
                    
                    // Ukryj komunikat po 5 sekundach
                    setTimeout(() => {
                        messageEl.style.display = 'none';
                    }, 5000);
                }
                
                console.log('💾 KCS Icons ' + (isEnabled ? 'włączony' : 'wyłączony') + ' - wymagane odświeżenie gry');
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
                SW.GM_setValue(CONFIG.LICENSE_VERIFIED, true);
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
        
        // Sprawdź czy KCS Icons jest włączony
        const isKcsEnabled = SW.GM_getValue(CONFIG.KCS_ICONS_ENABLED, true);
        
        if (isKcsEnabled) {
            console.log('✅ KCS Icons włączony, uruchamiam dodatek...');
            initKCSIcons();
        } else {
            console.log('⏩ KCS Icons jest wyłączony, pomijam ładowanie');
        }
    }

    function loadSavedState() {
        if (!SW || !SW.GM_getValue) return;
        
        // Załaduj zapisaną pozycję PRZYCISKU
        const savedBtnPosition = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn && savedBtnPosition) {
            toggleBtn.style.left = savedBtnPosition.left;
            toggleBtn.style.top = savedBtnPosition.top;
            console.log('📍 Loaded button position:', savedBtnPosition);
        } else if (toggleBtn) {
            // Ustaw domyślną pozycję tylko jeśli nie ma zapisanej
            toggleBtn.style.left = '70px';
            toggleBtn.style.top = '70px';
        }
        
        // Załaduj zapisaną pozycję PANELU
        const savedPosition = SW.GM_getValue(CONFIG.PANEL_POSITION);
        const panel = document.getElementById('swAddonsPanel');
        if (panel && savedPosition) {
            panel.style.left = savedPosition.left;
            panel.style.top = savedPosition.top;
        } else if (panel) {
            panel.style.left = '70px';
            panel.style.top = '140px';
        }
        
        // Załaduj zapisaną widoczność
        const isVisible = SW.GM_getValue(CONFIG.PANEL_VISIBLE, false);
        if (panel) {
            panel.style.display = isVisible ? 'block' : 'none';
        }
        
        // Załaduj zapisany klucz licencyjny
        const savedKey = SW.GM_getValue(CONFIG.LICENSE_KEY, '');
        const licenseInput = document.getElementById('swLicenseInput');
        if (licenseInput && savedKey) {
            licenseInput.value = savedKey;
        }
        
        // Sprawdź status licencji
        const isVerified = SW.GM_getValue(CONFIG.LICENSE_VERIFIED, false);
        const statusEl = document.getElementById('swLicenseStatus');
        if (statusEl) {
            if (isVerified) {
                statusEl.textContent = 'Aktywna';
                statusEl.style.color = '#00ffaa';
            } else {
                statusEl.textContent = 'Nieaktywna';
                statusEl.style.color = '#ff3366';
            }
        }
        
        // Załaduj stan suwaka KCS Icons
        const kcsToggle = document.getElementById('kcsIconsToggle');
        if (kcsToggle) {
            const isKcsEnabled = SW.GM_getValue(CONFIG.KCS_ICONS_ENABLED, true);
            kcsToggle.checked = isKcsEnabled;
            console.log('📍 KCS Icons state loaded:', isKcsEnabled);
        }
        
        console.log('✅ Saved state loaded');
    }

    function checkLicenseOnStart() {
        if (SW && SW.GM_getValue) {
            const isVerified = SW.GM_getValue(CONFIG.LICENSE_VERIFIED, false);
            if (isVerified) {
                console.log('📋 Licencja zweryfikowana, ładuję dodatki...');
                loadAddons();
            }
        }
    }

    // 🔹 DODATEK KCS ICONS - OSADZONY KOD Z TAMPERMONKEY
    function initKCSIcons() {
        'use strict';
        console.log("✅ Dodatek KCS Icons załadowany");

        // ... (tutaj pozostała część funkcji initKCSIcons) ...
    }

    console.log('🎯 Starting panel initialization...');
    initPanel();
    console.log('✅ SynergyWraith panel ready!');

})();
