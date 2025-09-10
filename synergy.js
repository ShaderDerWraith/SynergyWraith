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
        
        // Tworzymy panel główny przed ładowaniem stanu
        createMainPanel();
        
        // Ładujemy zapisany stan (w tym pozycję przycisku)
        loadSavedState();
        
        // Teraz inicjujemy przeciąganie przycisku z załadowaną pozycją
        if (toggleBtn) {
            setupToggleDrag(toggleBtn);
        }
        
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
                // Usuń tylko ustawienia pozycji i widoczności panelu
                // NIE usuwać ustawień dodatków (KCS_ICONS_ENABLED)
                SW.GM_deleteValue(CONFIG.PANEL_POSITION);
                SW.GM_deleteValue(CONFIG.PANEL_VISIBLE);
                SW.GM_deleteValue(CONFIG.TOGGLE_BTN_POSITION);
                
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
                
                // Odśwież stan panelu, aby pokazać zresetowane ustawienia
                loadSavedState();
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
                // Zapisz klucz i status
                const setKeyResult = SW.GM_setValue(CONFIG.LICENSE_KEY, licenseKey);
                const setVerifiedResult = SW.GM_setValue(CONFIG.LICENSE_VERIFIED, true);
                console.log('Zapis klucza:', setKeyResult, 'Zapis statusu:', setVerifiedResult);
                
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
        
        // Sprawdź czy licencja jest zweryfikowana
        const isVerified = SW.GM_getValue(CONFIG.LICENSE_VERIFIED, false);
        if (!isVerified) {
            console.log('⏩ Licencja niezweryfikowana, pomijam ładowanie dodatków');
            return;
        }
        
        // Sprawdź czy KCS Icons jest włączony
        const isKcsEnabled = SW.GM_getValue(CONFIG.KCS_ICONS_ENABLED, true);
        
        if (isKcsEnabled) {
            console.log('✅ KCS Icons włączony, uruchamiam dodatek...');
            // Dodaj niewielkie opóźnienie, aby upewnić się, że DOM jest w pełni załadowany
            setTimeout(initKCSIcons, 100);
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
        console.log('Zapisany klucz:', savedKey);
        const licenseInput = document.getElementById('swLicenseInput');
        if (licenseInput && savedKey) {
            licenseInput.value = savedKey;
            console.log('Ustawiono klucz w inputcie:', licenseInput.value);
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

        // --- PEŁNA LISTA MONSTERMAPPINGS ---
        const monsterMappings = {
        // Elity 2
        "Kryjówka Dzikich Kotów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/st-puma.gif", //mushita
        "Las Tropicieli": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/kotolak_lowca.gif", //kotolak
        "Przeklęta Strażnica - podziemia p.2 s.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/demonszef.gif", //shae phu 1
        "Przeklęta Strażnica - podziemia p.2 s.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/demonszef.gif", //shae phu 2
        "Schowek na łupy": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zbir-e2-zorg.gif", //zorg
        "Podmokła Dolina": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/gobbloker.gif", //wladca rzek ?? PROBLEM CO Z NIZSZYM I TYM
        "Jaskinia Pogardy": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gobsamurai.gif", //gobbos ?? NIE DA SIE TAM USTAWIC WIEC TO CO WYZEJ I CHUJ
        "Pieczara Kwiku - sala 2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dzik.gif", //dzik
        "Stary Kupiecki Trakt": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zbir-szczet.gif", //alias
        "Skalne Turnie": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tollok_shimger.gif", //tollok maly
        "Stare Wyrobisko p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/razuglag.gif", //razuglag
        "Mokra Grota p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/glut_agar.gif", //agar
        "Lazurytowa Grota p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/kobold07.gif", //kobold
        "Kopalnia Kapiącego Miodu p.2 - sala Owadziej Matki": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zadlak-e2-owadzia-matka.gif", //pszczola
        "Wioska Gnolli": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gnoll11.gif", //vari kruger
        "Jaskinia Gnollich Szamanów - Komnata Kozuga": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gnoll12.gif", //koza
        "Kamienna Jaskinia - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/kam_olbrzym-b.gif", //jotun
        "Głębokie Skałki p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tollok_jask_atamatu.gif", //atamatu
        "Krypty Dusz Śniegu p.2 - komnata Lisza": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/lisz_demilisze.gif", //lisz
        "Krypty Dusz Śniegu p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/lisz_demilisze.gif", //lisz mapa przed(tylko to dziala chyba)
        "Erem Czarnego Słońca p.5": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/nieu_mnich_grabarz.gif", //grab
        "Świątynia Andarum - zbrojownia": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/magaz_zbrojmistrz.gif", //zbroj
        "Firnowa Grota p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wlochacze_wielka_stopa.gif", //stopa
        "Wylęgarnia Choukkerów p.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dlawiciel5.gif", //chouker 1
        "Wylęgarnia Choukkerów p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dlawiciel5.gif", //chouker 2
        "Kopalnia Margorii": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/nadzorczyni_krasnoludow.gif", //nadzorka
        "Margoria": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krasnolud_boss.gif", //morthen
        "Grota Samotnych Dusz p.6": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/ugrape2.gif", //ohyd
        "Zapomniany Święty Gaj p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/lesne_widmo.gif", //widmo
        "Kamienna Strażnica - wsch. baszta zasypany tunel": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goplana.gif", //gopa
        "Kamienna Strażnica - tunel ➝ Sanktuarium": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goplana.gif", //gopa mapa w srodku(chyba tylko to dziala)
        "Zagrzybiałe Ścieżki p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gnom_figlid.gif", //gnom
        "Dolina Centaurów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/cent-zyfryd.gif", //cent
        "Las Dziwów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/kambion.gif", //kambion
        "Podziemia Zniszczonej Wieży p.5": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/moloch-jertek.gif", //jertek
        "Zabłocona Jama p.2 - Sala Duszącej Stęchlizny": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/blotniaki_milosnik_lowcow.gif", //milek lowcow
        "Zabłocona Jama p.2 - Sala Błotnistych Odmętów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/blotniaki_milosnik_rycerzy.gif", //milek rycy
        "Zabłocona Jama p.2 - Sala Magicznego Błota": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/blotniaki_milosnik_magii.gif", //milek magii
        "Skalne Cmentarzysko p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/alghul-czaszka-1a.gif", //lowca czaszek
        "Piramida Pustynnego Władcy p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/mumia-ozirus.gif", //ozirus
        "Jama Morskiej Macki p.1 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/osmiornica-1b.gif", //morski
        "Wyspa Rem": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krab_big3.gif", //krab 1
        "Opuszczony statek - pokład pod rufą": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krab_big3.gif", //krab 2
        "Twierdza Rogogłowych - Sala Byka": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/ingotia_minotaur-7a.gif", //byk
        "Piaskowa Pułapka - Grota Piaskowej Śmierci": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/stworzyciel.gif", //stworek
        "Wulkan Politraki p.1 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/magradit_ifryt.gif", //ifryt
        "Ukryta Grota Morskich Diabłów - skarbiec": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/pirat5b.gif", //henry
        "Ukryta Grota Morskich Diabłów - siedziba": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/pirat-2b.gif", //helga
        "Ukryta Grota Morskich Diabłów - magazyn": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/pirat01.gif", //jack
        "Piaszczysta Grota p.1 - sala 2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/piaskowy_potwor-6a.gif", //eol
        "Kopalnia Żółtego Kruszcu p.2 - sala 1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/grubber-ochlaj.gif", //gruber
        "Kuźnia Worundriela p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/worundriel02.gif", //worek mapa przed
        "Kuźnia Worundriela - Komnata Żaru": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/worundriel02.gif", //worek mapa z e2
        "Chata wójta Fistuły": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goral-e2-wojt-fistula.gif", //wojt
        "Babi Wzgórek": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goral-e2-tesciowa-rumcajsa.gif", //tesciowa
        "Cenotaf Berserkerów p.1 - sala 2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/amuno.gif", //amuno
        "Mała Twierdza - sala główna": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/fodug_zolash.gif", //fodug
        "Lokum Złych Goblinów - warsztat": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goons_asterus-1a.gif", //goons
        "Labolatorium Adariel": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tri_adariel.gif", //adariel
        "Grota Orczych Szamanów p.3 s.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/r_orc_sheba.gif", //sheba
        "Grota Orczej Hordy p.2 s.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/orkczd.gif", //burek
        "Nawiedzone Kazamaty p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/duch_wladcy_kl.gif", //dwk
        "Sala Rady Orków": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/praork_woj_1a.gif", //wez tu kurwa ustaw 3 e2 na 1 mapie XD????
        "Kryształowa Grota - Sala Smutku": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krolowa-sniegu.gif", //sniezka
        "Sala Królewska": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/prakrolowa.gif", //imagine tu kcsa ustawiac ale ok gruba
        "Drzewo Dusz p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/chryzoprenia-1a.gif", //drzewa
        "Ogrza Kawerna p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/ogr_stalowy_pazur-1a.gif", //ogr
        "Skarpa Trzech Słów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zmutowana-roslinka.gif", // pieknotka
        "Starodrzew Przedwiecznych p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/cerasus-1a.gif", //cera
        "Zalana Grota": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/forbol03.gif", //czemp
        "Krypty Bezsennych p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/thuz-patr1.gif", //torunia
        "Przysiółek Valmirów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/draki-breheret-1b.gif", //breh
        "Szlamowe Kanały p.2 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/mysiur_myswiorowy_krol-1a.gif", //szczur
        "Przerażające Sypialnie": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-sadolia.gif", //sado
        "Sale Rozdzierania": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-bergermona.gif", //berga
        "Sala Skaryfikacji Grzeszników": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-sataniel.gif", //sat
        "Tajemnicza Siedziba": "https://micc.garmory-cdn.cloud/obrazki/npc/hum/sekta-wdowiec1b.gif", //problem znow tak samo jak z sk xDD???
        "Sala Tysiąca Świec": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-zufulus.gif", //zuf
        "Ołtarz Pajęczej Bogini": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/marlloth.gif", //marloth
        "Grota Błotnej Magii": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok5.gif", //mocny
        "Grota porośniętych Stalagmitów - sala główna ": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok5.gif", //mocny(chyba tylko to dziala)
        "Arachnitopia p5": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/regina-e2.gif", //pajak
        "Jaszczurze Korytarze p.4 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok_roz.gif", //panc
        "Jaszczurze Korytarze p.3 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok_roz.gif", //panc(chyba dziala)
        "Krzaczasta grota - korytarz": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/silvanasus.gif", //szczurokrzak
        "Krzaczasta grota - sala główna": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/silvanasus.gif", //szczurokrzak srodek(chyba dziala)
        "Źródło Zakorzenionego Ludu": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dendroculus.gif", //dendro
        "Złota Góra p.2 s.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/bolita.gif", //bolita
        "Niecka Xiuh Atl": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maho-cuaitl.gif", //ciut
        "Potępione Zamczysko - sala ofiarna": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tri2_witch_e2.gif", //sybilka
        "Zachodni Mictlan p.8": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/mahoplowca.gif", //yaotl
        "Wschodni Mictlan p.8": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/quetzalcoatl.gif", //p9
        "Katakumby Gwałtownej Śmierci": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/chopesh2.gif", //chopesz
        "Grobowiec Seta": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/szkiel_set.gif", //set
        "Świątynia Hebrehotha - sala czciciela": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/bar_smokoszef.gif", //chaged
        "Świątynia Hebrehotha - sala ofiary": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/bar_smoczyca.gif", //vaera
        "Urwisko Vapora": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/terrorzaur_pus.gif", //dino 1
        "Jaskinia Smoczej Paszczy p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/terrorzaur_pus.gif", //dino 2
        "Drzewo życia p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/nymphemonia.gif", //nymfa
        "Sala Mroźnych Szeptów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wl-mrozu01.gif", //zorin
        "Sala Mroźnych Strzał": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wl-mrozu02.gif", //furion
        "Sala Lodowej Magii": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wl-mrozu03.gif", //art

        // Tytani
        "Mroczna Pieczara p.0": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/dziewicza_orlica.gif", //orlica
        "Grota Caerbannoga": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/zabojczy_krolik.gif", //kic
        "Bandyckie Chowisko": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/renegat_baulus.gif", //rene
        "Wulkan Politraki - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/archdemon.gif", //arcy
        "Lokum Złych Goblinów p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/versus-zoons.gif", //zoons
        "Jaskinia Ulotnych Wspomnień": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/lowcz-wspo-driady.gif", //lowka
        "Więzienie Demonów": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/przyz_demon_sekta.gif", //przyzy
        "Grota Jaszczurzych Koszmarów p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/maddok-tytan.gif", //magua
        "Teotihuacan - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/tezcatlipoca.gif", //teza
        "Sekretne Przejście Kapłanów": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/hebrehoth_smokoludzie.gif", //barbatos
        "Przejście Władców Mrozu": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/ice_king.gif", //tanroth

        // Kolosi
        "Pradawne Wzgórze Przodków": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/mamlambo_final2.gif", //lambo
        "Pieczara Szaleńców - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/bazyliszek.gif", //regulus
        "Zmarzlina Amaimona Soplorękiego - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/soploreki.gif", //sopel
        "Głębia Przeklętych Fal - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-wodnik.gif", //umibozu
        "Przepaść Zadumy - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-wazka.gif", //vashka
        "Czeluść Chimerycznej Natury - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/hydrokora.gif", //hydra
        "Grobowiec Przeklętego Krakania - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolkrucz.gif", //lulek
        "Grota Przebiegłego Tkacza - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-pajak.gif", //arach
        "Grota Martwodrzewów - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-dendro.gif", //reuzen
        "Katakumby Antycznego Gniewu - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-drakolisz.gif", //drako
    };

        const CACHE_KEY = 'kcsMonsterIconCache_v0.1';
        const ICON_CLASS_NAME = 'kcs-monster-icon';

        function getCache() {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                return cached ? JSON.parse(cached) : {};
            } catch (e) {
                console.error("[KCS Icons] Error reading cache:", e);
                return {};
            }
        }

        function saveCache(cache) {
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            } catch (e) {
                console.error("[KCS Icons] Error saving cache:", e);
            }
        }

        function getMapNameFromTooltipText(text) {
            if (!text) return null;
            const mapRegex = /Teleportuje gracza na mapę:\s*([\s\S]+?)\s*\(\s*\d+,\s*\d+\s*\)\.?/;
            const match = text.match(mapRegex);
            if (match && match[1]) {
                return match[1].trim().replace(/\n/g, ' ');
            }
            return null;
        }

        function addMonsterIcon(itemElement, monsterImgUrl) {
            if (!itemElement) return;

            let existingIcon = itemElement.querySelector(`img.${ICON_CLASS_NAME}`);
            if (existingIcon) {
                if (existingIcon.src === monsterImgUrl) {
                    itemElement.dataset.monsterIconAdded = 'true';
                    return;
                } else {
                    console.log(`[KCS Icons] Zmieniono URL ikony dla itemu. Aktualizowanie.`);
                    existingIcon.remove();
                }
            }

            const currentPosition = window.getComputedStyle(itemElement).position;
            if (currentPosition === 'static') {
                itemElement.style.position = 'relative';
            }

            const img = document.createElement('img');
            img.src = monsterImgUrl;
            img.classList.add(ICON_CLASS_NAME);
            img.style.position = 'absolute';
            img.style.bottom = '0px';
            img.style.right = '0px';
            img.style.width = '32px';
            img.style.height = '32px';
            img.style.zIndex = '10';
            img.style.pointerEvents = 'none';
            img.style.borderRadius = '2px';
            itemElement.appendChild(img);

            // Podnieś timer (cooldown) nad ikonę potwora
            const cooldownDiv = itemElement.querySelector('div.cooldown');
            if (cooldownDiv) {
                const cdCurrentPosition = window.getComputedStyle(cooldownDiv).position;
                if (cdCurrentPosition === 'static') {
                    cooldownDiv.style.position = 'relative';
                }
                cooldownDiv.style.zIndex = '11';
            }

            // Podnieś ilość (amount) nad ikonę potwora dla Zwojów
            const amountDiv = itemElement.querySelector('div.amount');
            if (amountDiv) {
                const amountCurrentPosition = window.getComputedStyle(amountDiv).position;
                if (amountCurrentPosition === 'static') {
                    amountDiv.style.position = 'relative';
                }
                amountDiv.style.zIndex = '11';
            }

            itemElement.dataset.monsterIconAdded = 'true';
            const itemIdForLog = itemElement.className.match(/item-id-(\d+)/)?.[1] || 'nieznany';
            console.log(`[KCS Icons] Added icon to item ${itemIdForLog}`);
        }

        const tooltipObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('tip-wrapper')) {
                            const tooltipNode = node;
                            const itemDivInTooltip = tooltipNode.querySelector('.item-head .item');
                            if (!itemDivInTooltip) return;

                            const itemNameElement = tooltipNode.querySelector('.item-name');
                            if (!itemNameElement) return;

                            const itemName = itemNameElement.textContent;
                            if (!(itemName.includes("Kamień Czerwonego Smoka") || itemName.includes("Zwój Czerwonego Smoka") || itemName.includes("Niepozorny Kamień Czerwonego Smoka") || itemName.includes("Ulotny zwój czerwonego smoka"))) {
                                return;
                            }

                            let itemId = null;
                            for (const cls of itemDivInTooltip.classList) {
                                if (cls.startsWith('item-id-')) {
                                    itemId = cls.substring('item-id-'.length);
                                    break;
                                }
                            }
                            if (!itemId) return;

                            const mapTextElement = tooltipNode.querySelector('.item-tip-section.s-7');
                            if (!mapTextElement) return;

                            const rawMapText = mapTextElement.textContent;
                            const parsedMapName = getMapNameFromTooltipText(rawMapText);

                            if (parsedMapName && monsterMappings[parsedMapName]) {
                                const monsterImgUrl = monsterMappings[parsedMapName];
                                const inventoryItem = document.querySelector(`.item.item-id-${itemId}`);
                                if (inventoryItem) {
                                    addMonsterIcon(inventoryItem, monsterImgUrl);
                                    const cache = getCache();
                                    if (cache[itemId] !== monsterImgUrl) {
                                        cache[itemId] = monsterImgUrl;
                                        saveCache(cache);
                                        console.log(`[KCS Icons] Przedmiot ${itemId} ("${itemName}" -> "${parsedMapName}") zapisany/zaktualizowany w cache.`);
                                    }
                                }
                            } else if (parsedMapName) {
                                console.log(`[KCS Icons] Mapa "${parsedMapName}" (z przedmiotu "${itemName}") nie znaleziona w monsterMappings.`);
                            }
                        }
                    });
                }
            }
        });

        function applyIconsFromCache() {
            const cache = getCache();
            if (Object.keys(cache).length === 0) {
                return;
            }
            console.log('[KCS Icons] Applying icons from cache');
            const allItems = document.querySelectorAll('.item[class*="item-id-"]');
            allItems.forEach(itemElement => {
                let itemId = null;
                for (const cls of itemElement.classList) {
                    if (cls.startsWith('item-id-')) {
                        itemId = cls.substring('item-id-'.length);
                        break;
                    }
                }
                if (itemId && cache[itemId]) {
                    addMonsterIcon(itemElement, cache[itemId]);
                }
            });
        }

        const dynamicItemObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    let potentiallyNewItems = false;
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches('.item[class*="item-id-"]') || node.querySelector('.item[class*="item-id-"]')) {
                                potentiallyNewItems = true;
                            }
                        }
                    });
                    if (potentiallyNewItems) {
                        console.log('[KCS Icons] New items detected, applying cache');
                        applyIconsFromCache();
                    }
                }
            }
        });

        // Rozpocznij obserwację
        console.log('[KCS Icons] Starting observers');
        tooltipObserver.observe(document.body, { childList: true, subtree: true });
        dynamicItemObserver.observe(document.body, { childList: true, subtree: true });

        // Zastosuj ikony z cache
        applyIconsFromCache();

        console.log('[KCS Icons] Skrypt v0.6 (KCS + Zwoje) załadowany.');
    }

    console.log('🎯 Waiting for DOM to load...');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('✅ DOM loaded, initializing panel...');
            initPanel();
            console.log('✅ SynergyWraith panel ready!');
        });
    } else {
        console.log('✅ DOM already loaded, initializing panel...');
        initPanel();
        console.log('✅ SynergyWraith panel ready!');
    }
})();
