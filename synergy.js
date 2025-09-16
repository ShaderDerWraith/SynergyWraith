// synergy.js - Główny kod panelu
(function() {
    'use strict';

    console.log('🚀 SynergyWraith Panel v1.0 loaded');

    // 🔹 Konfiguracja
    const CONFIG = {
        PANEL_POSITION: "sw_panel_position",
        PANEL_VISIBLE: "sw_panel_visible",
        TOGGLE_BTN_POSITION: "sw_toggle_button_position",
        KCS_ICONS_ENABLED: "kcs_icons_enabled",
        LICENSE_LIST_URL: "https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/LICENSE"
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
    let isLicenseVerified = false;
    let userAccountId = null;

    // 🔹 Główne funkcje
    async function initPanel() {
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
        
        // Sprawdzamy licencję i dopiero potem ładujemy dodatki
        await checkLicenseOnStart();
        
        // 🔹 ZAŁADUJ DODATKI PO WERYFIKACJI LICENCJI
        if (isLicenseVerified) {
            loadAddons();
        }
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
        
        // Ustaw domyślną pozycję (zostanie nadpisana przez loadSavedState jeśli istnieje zapisana pozycję)
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

        // Dodaj nasłuchiwanie kliknięcia
        toggleBtn.addEventListener('click', handleClick);

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
            <div id="swPanelHeader" style="background: linear-gradient(to right, #2a2a3a, #232330; padding: 12px; text-align: center; border-bottom: 1px solid #393945; cursor: grab;">
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
                <h3 style="color: #00ccff; margin-top: 0;">Status Licencji</h3>
                <div style="background: rgba(40, 40, 50, 0.6); border: 1px solid #393945; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
                    <p style="color: #ccddee; margin-top: 0; text-align: center;">Weryfikacja licencji odbywa się automatycznie</p>
                </div>
                <div id="swLicenseMessage" style="margin-top: 10px; padding: 10px; border-radius: 5px;"></div>
                
                <div style="margin-top: 20px; background: rgba(40, 40, 50, 0.6); border: 1px solid #393945; border-radius: 6px; padding: 15px;">
                    <div style="color: #00ccff; font-weight: bold; border-bottom: 1px solid #393945; padding-bottom: 8px; text-align: center;">Status Licencji</div>
                    <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                        <span style="color: #8899aa;">Status:</span>
                        <span id="swLicenseStatus" style="color: #ff3366; font-weight: bold;">Weryfikacja...</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                        <span style="color: #8899aa;">ID Konta:</span>
                        <span id="swAccountId" style="color: #8899aa; font-weight: bold;">-</span>
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
                
                <button id="swResetButton" style="width: 100%; padding: 10px; background: linear-gradient(to right, #ff5555, #ff3366; border: none; border-radius: 5px; color: white; cursor: pointer; font-weight: 600;">
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
        // Resetowanie ustawień
        const resetBtn = document.getElementById('swResetButton');
        const resetConfirm = document.getElementById('swResetConfirm');
        const resetCancel = document.getElementById('swResetCancel');
        const resetConfirmation = document.getElementById('swResetConfirmation');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                resetConfirmation.style.display = 'block';
                resetBtn.style.display = 'none';
            });
        }
        
        if (resetConfirm) {
            resetConfirm.addEventListener('click', function() {
                // Usuń tylko ustawienia pozycji i widoczności panelu
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
                    
                    setTimeout(() => {
                        resetMessage.style.display = 'none';
                    }, 5000);
                }
                
                resetConfirmation.style.display = 'none';
                resetBtn.style.display = 'block';
                
                loadSavedState();
            });
        }
        
        if (resetCancel) {
            resetCancel.addEventListener('click', function() {
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
                
                const message = isEnabled ? 
                    'KCS Icons włączony. Odśwież grę, aby zmiana została zastosowana.' : 
                    'KCS Icons wyłączony. Odśwież grę, aby zmiana została zastosowana.';
                
                const messageEl = document.getElementById('swAddonsMessage');
                if (messageEl) {
                    messageEl.textContent = message;
                    messageEl.style.background = 'rgba(0, 204, 255, 0.1)';
                    messageEl.style.color = '#00ccff';
                    messageEl.style.border = '1px solid #00ccff';
                    messageEl.style.display = 'block';
                    
                    setTimeout(() => {
                        messageEl.style.display = 'none';
                    }, 5000);
                }
                
                console.log('💾 KCS Icons ' + (isEnabled ? 'włączony' : 'wyłączony') + ' - wymagane odświeżenie gry');
            });
        }

        console.log('✅ Event listeners setup complete');
    }

    function getUserAccountId() {
        // Metoda 1: Próba pobrania z localStorage Margonem (najbardziej niezawodne)
        try {
            const margonemData = localStorage.getItem('margonem_user_data');
            if (margonemData) {
                const userData = JSON.parse(margonemData);
                // Sprawdzamy różne możliwe klucze dla ID konta
                if (userData.account_id) {
                    console.log('✅ Znaleziono ID konta w localStorage (account_id):', userData.account_id);
                    return userData.account_id;
                }
                if (userData.user_id) {
                    console.log('✅ Znaleziono ID konta w localStorage (user_id):', userData.user_id);
                    return userData.user_id;
                }
                if (userData.id) {
                    console.log('✅ Znaleziono ID konta w localStorage (id):', userData.id);
                    return userData.id;
                }
            }
        } catch (e) {
            console.warn('❌ Nie udało się pobrać danych z localStorage Margonem:', e);
        }

        // Metoda 2: Sprawdzenie globalnych zmiennych gry (jeśli jesteśmy w grze)
        if (typeof g !== 'undefined' && g.user) {
            if (g.user.account_id) {
                console.log('✅ Znaleziono ID konta w globalnym obiekcie g.user:', g.user.account_id);
                return g.user.account_id;
            }
            if (g.user.id) {
                console.log('✅ Znaleziono ID konta w globalnym obiekcie g.user:', g.user.id);
                return g.user.id;
            }
        }

        // Metoda 3: Parsowanie URL strony profilu
        if (window.location.href.includes('margonem.pl/profile')) {
            const match = window.location.href.match(/profile\/view,(\d+)/);
            if (match && match[1]) {
                console.log('✅ Znaleziono ID konta w URL:', match[1]);
                return match[1];
            }
        }

        // Metoda 4: Sprawdzenie elementów DOM (linki do profilu)
        const profileLinks = document.querySelectorAll('a[href*="/profile/view,"]');
        for (const link of profileLinks) {
            const match = link.href.match(/profile\/view,(\d+)/);
            if (match && match[1]) {
                console.log('✅ Znaleziono ID konta w linku do profilu:', match[1]);
                return match[1];
            }
        }

        // Metoda 5: Sprawdzenie w sessionStorage
        try {
            const sessionData = sessionStorage.getItem('margonem_user_data');
            if (sessionData) {
                const userData = JSON.parse(sessionData);
                if (userData.account_id) {
                    console.log('✅ Znaleziono ID konta w sessionStorage:', userData.account_id);
                    return userData.account_id;
                }
            }
        } catch (e) {
            console.warn('❌ Nie udało się pobrać danych z sessionStorage:', e);
        }

        // Metoda 6: Sprawdzenie w cookies
        try {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'margonem_user_data' && value) {
                    try {
                        const userData = JSON.parse(decodeURIComponent(value));
                        if (userData.account_id) {
                            console.log('✅ Znaleziono ID konta w cookies:', userData.account_id);
                            return userData.account_id;
                        }
                    } catch (e) {
                        console.warn('❌ Błąd parsowania danych z cookies:', e);
                    }
                }
            }
        } catch (e) {
            console.warn('❌ Nie udało się pobrać danych z cookies:', e);
        }

        console.error('❌ Nie udało się pobrać ID konta z żadnego źródła');
        return null;
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

    function updateLicenseStatus(isVerified, accountId) {
        const statusEl = document.getElementById('swLicenseStatus');
        const accountIdEl = document.getElementById('swAccountId');
        
        if (statusEl) {
            if (isVerified) {
                statusEl.textContent = 'Aktywna';
                statusEl.style.color = '#00ffaa';
            } else {
                statusEl.textContent = 'Nieaktywna';
                statusEl.style.color = '#ff3366';
            }
        }
        
        if (accountIdEl) {
            accountIdEl.textContent = accountId || '-';
            accountIdEl.style.color = isVerified ? '#00ffaa' : '#ff3366';
        }
    }

    function fetchLicenseList() {
        return new Promise((resolve, reject) => {
            SW.GM_xmlhttpRequest({
                method: 'GET',
                url: CONFIG.LICENSE_LIST_URL + '?t=' + Date.now(),
                onload: function(response) {
                    if (response.status === 200) {
                        const lines = response.responseText.split('\n');
                        const accounts = lines
                            .map(line => line.trim())
                            .filter(line => line && !line.startsWith('#') && !isNaN(line)) // Pomijanie komentarzy i nie-liczb
                            .map(line => parseInt(line))
                            .filter(id => !isNaN(id));
                        resolve(accounts);
                    } else {
                        reject(new Error('Nie udało się pobrać listy licencji'));
                    }
                },
                onerror: function(error) {
                    reject(error);
                }
            });
        });
    }

    async function verifyAccount() {
        const accountId = getUserAccountId();
        userAccountId = accountId;
        
        if (!accountId) {
            showMessage('❌ Nie udało się pobrać ID konta. Upewnij się, że jesteś zalogowany.', 'error');
            updateLicenseStatus(false, null);
            return false;
        }

        console.log('🔍 Weryfikuję licencję dla ID konta:', accountId);

        try {
            const allowedAccounts = await fetchLicenseList();
            console.log('📋 Lista dozwolonych kont:', allowedAccounts);
            
            const isAllowed = allowedAccounts.includes(parseInt(accountId));
            console.log('✅ Wynik weryfikacji:', isAllowed);

            if (isAllowed) {
                showMessage('✅ Licencja aktywna! Dostęp przyznany.', 'success');
                updateLicenseStatus(true, accountId);
                isLicenseVerified = true;
                return true;
            } else {
                showMessage('❌ Brak dostępu do panelu.', 'error');
                updateLicenseStatus(false, accountId);
                isLicenseVerified = false;
                return false;
            }
        } catch (error) {
            console.error('❌ Błąd podczas weryfikacji licencji:', error);
            showMessage('❌ Błąd podczas weryfikacji licencji.', 'error');
            updateLicenseStatus(false, accountId);
            isLicenseVerified = false;
            return false;
        }
    }

    function loadAddons() {
        console.log('🔓 Ładowanie dodatków...');
        
        if (!isLicenseVerified) {
            console.log('⏩ Licencja niezweryfikowana, pomijam ładowanie dodatków');
            return;
        }
        
        // Sprawdź czy KCS Icons jest włączony
        const isKcsEnabled = SW.GM_getValue(CONFIG.KCS_ICONS_ENABLED, true);
        
        if (isKcsEnabled) {
            console.log('✅ KCS Icons włączony, uruchamiam dodatek...');
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
        
        // Załaduj stan suwaka KCS Icons
        const kcsToggle = document.getElementById('kcsIconsToggle');
        if (kcsToggle) {
            const isKcsEnabled = SW.GM_getValue(CONFIG.KCS_ICONS_ENABLED, true);
            kcsToggle.checked = isKcsEnabled;
            console.log('📍 KCS Icons state loaded:', isKcsEnabled);
        }
        
        console.log('✅ Saved state loaded');
    }

    async function checkLicenseOnStart() {
        console.log('🔍 Checking license on start...');
        return await verifyAccount();
    }

    // 🔹 DODATEK KCS ICONS - OSADZONY KOD
    function initKCSIcons() {
        'use strict';
        console.log("✅ Dodatek KCS Icons załadowany");

        // --- PEŁNA LISTA MONSTERMAPPINGS ---
        const monsterMappings = {
            // Elity 2
            "Kryjówka Dzikich Kotów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/st-puma.gif",
            "Las Tropicieli": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/kotolak_lowca.gif",
            // ... (reszta mappingów)
        };

        const CACHE_KEY = 'kcsMonsterIconCache_v0.1';
        const ICON_CLASS_NAME = 'kcs-monster-icon';
        let isEnabled = true;
        let tooltipObserver = null;
        let dynamicItemObserver = null;

        // 🔹 Główne funkcje dodatku
        const kcsIconsAddon = {
            enable: function() {
                if (isEnabled) return;
                isEnabled = true;
                this.start();
                console.log("✅ KCS Icons włączony");
            },

            disable: function() {
                if (!isEnabled) return;
                isEnabled = false;
                this.stop();
                console.log("❌ KCS Icons wyłączony");
            },

            start: function() {
                if (tooltipObserver || dynamicItemObserver) {
                    this.stop();
                }

                this.setupObservers();
                this.applyIconsFromCache();
            },

            stop: function() {
                if (tooltipObserver) {
                    tooltipObserver.disconnect();
                    tooltipObserver = null;
                }

                if (dynamicItemObserver) {
                    dynamicItemObserver.disconnect();
                    dynamicItemObserver = null;
                }

                // Usuń wszystkie ikony
                document.querySelectorAll(`.${ICON_CLASS_NAME}`).forEach(icon => icon.remove());
            },

            setupObservers: function() {
                // Observer dla tooltipów
                tooltipObserver = new MutationObserver((mutationsList) => {
                    if (!isEnabled) return;
                    
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach(node => {
                                if (node.nodeType === Node.ELEMENT_NODE && 
                                    (node.classList.contains('tip-wrapper') || node.classList.contains('tooltip'))) {
                                    this.processTooltip(node);
                                }
                            });
                        }
                    }
                });

                // Observer dla dynamicznie dodawanych itemów
                dynamicItemObserver = new MutationObserver((mutationsList) => {
                    if (!isEnabled) return;
                    
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            let newItemsFound = false;
                            mutation.addedNodes.forEach(node => {
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    if (node.matches('.item, .inventory-item, .eq-item, [class*="item"]') || 
                                        node.querySelector('.item, .inventory-item, .eq-item, [class*="item"]')) {
                                        newItemsFound = true;
                                    }
                                }
                            });
                            if (newItemsFound) {
                                this.applyIconsFromCache();
                            }
                        }
                    }
                });

                // Rozpocznij obserwację
                tooltipObserver.observe(document.body, { childList: true, subtree: true });
                dynamicItemObserver.observe(document.body, { childList: true, subtree: true });
            },

            getCache: function() {
                try {
                    return SW.GM_getValue(CACHE_KEY, {});
                } catch (e) {
                    console.error("[KCS Icons] Error reading cache:", e);
                    return {};
                }
            },

            saveCache: function(cache) {
                try {
                    SW.GM_setValue(CACHE_KEY, cache);
                } catch (e) {
                    console.error("[KCS Icons] Error saving cache:", e);
                }
            },

            getMapNameFromTooltipText: function(text) {
                if (!text) return null;
                const mapRegex = /Teleportuje gracza na mapę:\s*([\s\S]+?)\s*\(\s*\d+,\s*\d+\s*\)\.?/;
                const match = text.match(mapRegex);
                if (match && match[1]) {
                    return match[1].trim().replace(/\n/g, ' ');
                }
                return null;
            },

            addMonsterIcon: function(itemElement, monsterImgUrl) {
                if (!itemElement || !isEnabled) return;

                let existingIcon = itemElement.querySelector(`.${ICON_CLASS_NAME}`);
                if (existingIcon) {
                    if (existingIcon.src === monsterImgUrl) {
                        return;
                    }
                    existingIcon.remove();
                }

                const img = document.createElement('img');
                img.src = monsterImgUrl;
                img.classList.add(ICON_CLASS_NAME);
                img.style.position = 'absolute';
                img.style.bottom = '2px';
                img.style.right = '2px';
                img.style.width = '32px';
                img.style.height = '32px';
                img.style.zIndex = '5';
                img.style.pointerEvents = 'none';
                img.style.borderRadius = '3px';
                img.style.border = '1px solid rgba(0, 0, 0, 0.3)';
                
                itemElement.style.position = 'relative';
                itemElement.appendChild(img);
            },

            processTooltip: function(tooltipNode) {
                if (!isEnabled) return;
                
                const itemDivInTooltip = tooltipNode.querySelector('.item-head .item, .item-container, [class*="item"]');
                if (!itemDivInTooltip) return;

                const itemNameElement = tooltipNode.querySelector('.item-name, .name, [class*="name"]');
                if (!itemNameElement) return;

                const itemName = itemNameElement.textContent;
                if (!(itemName.includes("Kamień Czerwonego Smoka") || 
                      itemName.includes("Zwój Czerwonego Smoka") || 
                      itemName.includes("Niepozorny Kamień Czerwonego Smoka") ||  
                      itemName.includes("Ulotny zwój czerwonego smoka"))) {
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

                const mapTextElement = tooltipNode.querySelector('.item-tip-section.s-7, .item-description, .item-properties');
                if (!mapTextElement) return;

                const rawMapText = mapTextElement.textContent;
                const parsedMapName = this.getMapNameFromTooltipText(rawMapText);

                if (parsedMapName && monsterMappings[parsedMapName]) {
                    const monsterImgUrl = monsterMappings[parsedMapName];
                    const inventoryItem = document.querySelector(`.item.item-id-${itemId}, [class*="item-id-${itemId}"]`);
                    if (inventoryItem) {
                        this.addMonsterIcon(inventoryItem, monsterImgUrl);
                        const cache = this.getCache();
                        if (cache[itemId] !== monsterImgUrl) {
                            cache[itemId] = monsterImgUrl;
                            this.saveCache(cache);
                        }
                    }
                }
            },

            applyIconsFromCache: function() {
                if (!isEnabled) return;
                
                const cache = this.getCache();
                if (Object.keys(cache).length === 0) return;

                const itemSelectors = [
                    '.item', '.inventory-item', '.eq-item',
                    '[class*="item"]', '[data-type="item"]'
                ];

                let allItems = [];
                itemSelectors.forEach(selector => {
                    const items = document.querySelectorAll(selector);
                    if (items.length > 0) {
                        allItems = [...allItems, ...items];
                    }
                });

                allItems.forEach(itemElement => {
                    let itemId = null;
                    for (const cls of itemElement.classList) {
                        if (cls.startsWith('item-id-')) {
                            itemId = cls.substring('item-id-'.length);
                            break;
                        }
                    }
                    if (itemId && cache[itemId]) {
                        this.addMonsterIcon(itemElement, cache[itemId]);
                    }
                });
            },

            init: function() {
                console.log("🎮 Sprawdzam czy gra jest załadowana...");

                // Sprawdź czy gra jest gotowa
                const gameSelectors = [
                    '.items', '.inventory', '.eq', '.item-list',
                    '#eq', '#items', '#inventory',
                    '[class*="item"]', '[class*="eq"]'
                ];

                for (const selector of gameSelectors) {
                    if (document.querySelector(selector)) {
                        console.log("🎯 Gra załadowana! Inicjalizacja dodatku...");
                        this.start();
                        return true;
                    }
                }
                
                console.log("⏳ Gra nie jest jeszcze gotowa, czekam...");
                return false;
            }
        };

        // 🔹 Udostępnij dodatek globalnie
        window.kcsIconsAddon = kcsIconsAddon;

        // 🔹 Sprawdź zapisany stan i zainicjuj
        let savedState = true;
        try {
            savedState = SW.GM_getValue('kcs_icons_enabled', true);
        } catch (e) {
            console.error("Błąd odczytu stanu dodatku:", e);
        }

        isEnabled = savedState;

        // 🔹 CZEKAJ NA PEŁNE ZAŁADOWANIE STRONY
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(() => {
                    if (isEnabled) {
                        kcsIconsAddon.init();
                    }
                }, 2000);
            });
        } else {
            setTimeout(() => {
                if (isEnabled) {
                    kcsIconsAddon.init();
                }
            }, 1000);
        }
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
