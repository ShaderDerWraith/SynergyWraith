// synergy.js - Główny kod panelu Synergy (v4.5 - Final Edition)
(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v4.5 (Final Edition)');

    // 🔹 Konfiguracja
    const CONFIG = {
        PANEL_POSITION: "sw_panel_position",
        PANEL_VISIBLE: "sw_panel_visible",
        TOGGLE_BTN_POSITION: "sw_toggle_button_position",
        FAVORITE_ADDONS: "sw_favorite_addons",
        FONT_SIZE: "sw_panel_font_size",
        BACKGROUND_OPACITY: "sw_panel_background_opacity",
        LICENSE_EXPIRY: "sw_license_expiry",
        LICENSE_ACTIVE: "sw_license_active",
        CUSTOM_SHORTCUT: "sw_custom_shortcut",
        ACCOUNT_ID: "sw_account_id",
        LICENSE_DATA: "sw_license_data",
        ADMIN_ACCESS: "sw_admin_access",
        SHORTCUTS_CONFIG: "sw_shortcuts_config",
        SHORTCUTS_ENABLED: "sw_shortcuts_enabled"
    };

    // 🔹 Lista dostępnych dodatków
    const ADDONS = [
        {
            id: 'enhanced-stats',
            name: 'Enhanced Stats',
            description: 'Rozszerzone statystyki postaci',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false
        },
        {
            id: 'trade-helper',
            name: 'Trade Helper',
            description: 'Pomocnik handlu i aukcji',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false
        },
        {
            id: 'chat-manager',
            name: 'Chat Manager',
            description: 'Zaawansowane zarządzanie czatem',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false
        },
        {
            id: 'quest-logger',
            name: 'Quest Logger',
            description: 'Logowanie postępów w zadaniach',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false
        },
        // DODATKI PREMIUM
        {
            id: 'kcs-icons',
            name: 'KCS Icons',
            description: 'Profesjonalne ikony do interfejsu',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        },
        {
            id: 'auto-looter',
            name: 'Auto Looter',
            description: 'Inteligentny zbieracz łupów',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        },
        {
            id: 'quest-helper',
            name: 'Quest Helper',
            description: 'Pełna pomoc w zadaniach z mapą',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        },
        {
            id: 'combat-log',
            name: 'Combat Log',
            description: 'Szczegółowy log walki z analizą',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        },
        {
            id: 'auto-potion',
            name: 'Auto Potion',
            description: 'Automatyczne używanie mikstur',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        },
        {
            id: 'fishing-bot',
            name: 'Fishing Bot',
            description: 'Automatyczne łowienie ryb',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        }
    ];

    // 🔹 URL do pliku licencji
    const LICENSES_URL = 'https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/docs/licenses.json';
    const ADMIN_ACCOUNT_ID = '7411461';

    // 🔹 Safe fallback dla Tampermonkey/Greasemonkey
    if (!window.synergyWraith) {
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
            }
        };
    }

    const SW = window.synergyWraith;
    
    // 🔹 Główne zmienne
    let currentAddons = [];
    let searchQuery = '';
    let panelShortcut = 'Ctrl+A';
    let isShortcutInputFocused = false;
    let isCheckingLicense = false;
    let isAdmin = false;
    let addonShortcuts = {};
    let shortcutsEnabled = {};
    let currentFontSize = 13;
    let currentFilter = 'all';
    let userAccountId = null;
    let isLicenseVerified = false;
    let licenseData = null;
    let licenseExpiry = null;
    let serverConnected = true;

    // =========================================================================
    // 🔹 GŁÓWNE FUNKCJE PANELU
    // =========================================================================

    // 🔹 POPRAWIONE: Funkcja applyFontSize - TERAZ DZIAŁA PRAWIDŁOWO
    function applyFontSize(size) {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        const minSize = 10;
        const maxSize = 16;
        const clampedSize = Math.max(minSize, Math.min(maxSize, size));
        
        // ZAPISZ NOWĄ WARTOŚĆ
        currentFontSize = clampedSize;
        SW.GM_setValue(CONFIG.FONT_SIZE, clampedSize);
        
        // USTAW CZCIONKĘ NA CAŁYM PANELU
        panel.style.fontSize = clampedSize + 'px';
        
        // AKTUALIZUJ WSZYSTKIE ELEMENTY TEKSTOWE
        updateAllTextElements(panel, clampedSize);
        
        // AKTUALIZUJ WYŚWIETLANĄ WARTOŚĆ
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeValue) {
            fontSizeValue.textContent = clampedSize + 'px';
        }
        
        console.log('🔠 Zmieniono rozmiar czcionki na:', clampedSize + 'px');
    }

    // 🔹 NOWA: Funkcja do aktualizacji wszystkich elementów tekstowych
    function updateAllTextElements(container, newSize) {
        const textElements = container.querySelectorAll(
            'div, span, p, h1, h2, h3, h4, h5, h6, label, button:not(.font-size-btn):not(.refresh-button)'
        );
        
        textElements.forEach(el => {
            const computed = window.getComputedStyle(el);
            const currentSize = parseFloat(computed.fontSize);
            
            // Zachowaj proporcje dla większych elementów
            if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') {
                el.style.fontSize = (newSize * 1.5) + 'px';
            } else if (el.tagName === 'H4' || el.tagName === 'H5' || el.tagName === 'H6') {
                el.style.fontSize = (newSize * 1.2) + 'px';
            } else if (currentSize > 12) {
                // Zachowaj większe czcionki
                el.style.fontSize = (newSize * (currentSize / 13)) + 'px';
            } else {
                // Standardowe elementy
                el.style.fontSize = newSize + 'px';
            }
        });
    }

    // 🔹 POPRAWIONE: Funkcja applyOpacity
    function applyOpacity(opacity) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const minOpacity = 30;
            const maxOpacity = 100;
            const clampedOpacity = Math.max(minOpacity, Math.min(maxOpacity, opacity));
            
            panel.style.opacity = clampedOpacity / 100;
            SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, clampedOpacity);
            
            const opacityValueEl = document.getElementById('opacityValue');
            if (opacityValueEl) {
                opacityValueEl.textContent = clampedOpacity + '%';
            }
        }
    }

    // 🔹 Tworzenie przycisku przełączania (Z IKONĄ 🎮)
    function createToggleButton() {
        const oldToggle = document.getElementById('swPanelToggle');
        if (oldToggle) oldToggle.remove();
        
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
        toggleBtn.innerHTML = '🎮'; // IKONA WIDGETU
        
        document.body.appendChild(toggleBtn);
        console.log('✅ Toggle button created with icon');
        
        return toggleBtn;
    }

    // 🔹 Tworzenie głównego panelu (Z WSZYSTKIMI POPRAWKAMI)
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        // 🔹 GENEROWANIE HTML PANELU
        panel.innerHTML = generatePanelHTML();
        
        document.body.appendChild(panel);
        console.log('✅ Panel created - v4.5 Final');
        
        // 🔹 INICJALIZACJA
        initializeEventListeners();
        loadSettings();
        setupPanelDrag();
        setupMouseWheelSupport();
        
        // 🔹 WCZYTAJ DODATKI I STAN
        setTimeout(() => {
            loadAddonShortcuts();
            loadShortcutsEnabledState();
            restoreAddonsState();
            renderAddons();
        }, 100);
    }

    // 🔹 NOWA: Generowanie HTML panelu
    function generatePanelHTML() {
        return `
            <div id="swPanelHeader">
                <strong>SYNERGY</strong>
                ${isAdmin ? ' <span style="color:#00ff00; font-size:14px;">👑</span>' : ''}
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
                <button class="tablink" data-tab="shortcuts">Skróty</button>
                <button class="tablink" data-tab="license">Licencja</button>
                <button class="tablink" data-tab="settings">Ustawienia</button>
                <button class="tablink" data-tab="info">Info</button>
            </div>

            <!-- ZAKŁADKA DODATKI -->
            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div style="width:100%; max-width:800px; margin:0 auto 15px auto;">
                        <input type="text" id="searchAddons" placeholder="🔍 Wyszukaj dodatki..." 
                               style="width:100%; padding:12px 15px; background:rgba(51,0,0,0.8); 
                                      border:1px solid #660000; border-radius:6px; color:#ffcc00; 
                                      font-size:13px; box-sizing:border-box;">
                    </div>
                    
                    <div class="addon-filters">
                        <button class="filter-btn active" data-filter="all">Wszystkie</button>
                        <button class="filter-btn" data-filter="enabled">Włączone</button>
                        <button class="filter-btn" data-filter="disabled">Wyłączone</button>
                        <button class="filter-btn" data-filter="favorites">Ulubione</button>
                    </div>
                    
                    <div class="addon-list-container">
                        <div class="addon-list" id="addon-list"></div>
                    </div>
                    
                    <div class="refresh-button-container">
                        <button class="refresh-button" id="swSaveAndRestartButton">💾 Zapisz i odśwież grę</button>
                    </div>
                    
                    <div id="swAddonsMessage" class="license-message" style="display: none;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA SKRÓTY -->
            <div id="shortcuts" class="tabcontent">
                <div class="sw-tab-content">
                    <div style="margin-bottom:15px; padding:15px; background:linear-gradient(135deg, rgba(51,0,0,0.9), rgba(102,0,0,0.9)); border-radius:8px; border:1px solid #660000; width:100%; max-width:800px;">
                        <h3 style="color:#ffcc00; margin-top:0; margin-bottom:5px; font-size:14px; text-align:center;">Skróty klawiszowe</h3>
                        <p style="color:#ff9966; font-size:12px; margin:0; text-align:center;">
                            Skróty pokazują się tylko dla włączonych dodatków
                        </p>
                    </div>
                    
                    <div class="shortcuts-list-container">
                        <div id="shortcuts-list" style="width:100%;"></div>
                    </div>
                </div>
            </div>

            <!-- ZAKŁADKA LICENCJA -->
            <div id="license" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="license-scroll-container">
                        <div class="license-container">
                            <div class="license-header">Status Licencji</div>
                            <div class="license-status-item">
                                <span class="license-status-label">ID Konta:</span>
                                <span id="swAccountId" class="license-status-value">Ładowanie...</span>
                            </div>
                            <div class="license-status-item">
                                <span class="license-status-label">Status:</span>
                                <span id="swLicenseStatus" class="license-status-invalid">Nieaktywna</span>
                            </div>
                            <div class="license-status-item">
                                <span class="license-status-label">Ważna do:</span>
                                <span id="swLicenseExpiry" class="license-status-value">-</span>
                            </div>
                            <div class="license-status-item">
                                <span class="license-status-label">Dni pozostało:</span>
                                <span id="swLicenseDaysLeft" class="license-status-value">-</span>
                            </div>
                        </div>
                        
                        <div class="license-container">
                            <div class="license-header">Informacje o Premium</div>
                            <div style="padding:15px; color:#ffcc00; font-size:12px; text-align:center;">
                                <p>Aby uzyskać dostęp do dodatków premium, skontaktuj się z administratorem.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>

            <!-- ZAKŁADKA USTAWIENIA -->
            <div id="settings" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="scrollable-container">
                        <div class="settings-item">
                            <div class="settings-label">Rozmiar czcionki:</div>
                            <div class="font-size-controls">
                                <button class="font-size-btn" id="fontSizeDecrease">-</button>
                                <div class="font-size-display" id="fontSizeValue">13px</div>
                                <button class="font-size-btn" id="fontSizeIncrease">+</button>
                            </div>
                            <small style="color:#ff9966; font-size:11px; display:block; text-align:center;">Kliknij +/- aby zmienić (10-16px)</small>
                        </div>
                        
                        <div class="settings-item">
                            <div class="settings-label">Przeźroczystość panelu:</div>
                            <div class="slider-container">
                                <input type="range" min="30" max="100" value="90" class="opacity-slider" id="opacitySlider" step="1">
                                <span class="slider-value" id="opacityValue">90%</span>
                            </div>
                            <small style="color:#ff9966; font-size:11px; display:block; text-align:center;">30-100%</small>
                        </div>
                        
                        <div class="settings-item">
                            <div class="settings-label">Skrót do panelu:</div>
                            <div style="display:flex; gap:10px; align-items:center; margin-bottom:5px;">
                                <input type="text" id="panelShortcutInput" 
                                       style="flex:1; padding:10px; background:rgba(51,0,0,0.8); border:1px solid #660000; 
                                              border-radius:5px; color:#ffcc00; font-size:13px; text-align:center;" 
                                       value="Ctrl+A" readonly>
                                <button id="panelShortcutSetBtn">Ustaw</button>
                            </div>
                        </div>
                        
                        <div class="import-export-container">
                            <div class="settings-label">Eksport/Import ustawień:</div>
                            <div class="import-export-buttons">
                                <button class="import-export-btn" id="exportSettingsBtn">Eksportuj</button>
                                <button class="import-export-btn" id="importSettingsBtn">Importuj</button>
                            </div>
                            <textarea class="import-export-textarea" id="settingsTextarea" 
                                      placeholder="Dane pojawią się tutaj po eksporcie..."></textarea>
                        </div>
                        
                        <div style="margin-top:20px; padding-top:15px; border-top:1px solid #660000; width:100%; max-width:600px;">
                            <button id="swResetButton">🔄 Resetuj ustawienia</button>
                        </div>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top:15px; padding:12px; border-radius:6px; display:none; font-size:12px; width:100%; max-width:600px; text-align:center;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA INFO -->
            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="scrollable-container">
                        <div style="text-align:center; padding:20px; width:100%; max-width:800px; margin:0 auto;">
                            <h3 style="color:#ffcc00; margin-bottom:20px; font-size:20px;">Synergy Panel</h3>
                            
                            <div class="info-section">
                                <h4>System Dodatków</h4>
                                <p>• Darmowe dodatki: dostępne dla każdego</p>
                                <p style="color:#00ff00;">• Premium dodatki: wymagają aktywnej licencji</p>
                                <p style="color:#ff9966;">• Filtry: Wszystkie / Włączone / Wyłączone / Ulubione</p>
                            </div>
                            
                            <div class="info-section">
                                <h4>System Licencji</h4>
                                <p>• Licencje przyznawane przez administratora</p>
                                <p>• Ważność czasowa (30 dni, 90 dni, etc.)</p>
                                <p>• Automatyczne odświeżanie statusu</p>
                            </div>
                            
                            <div class="info-section">
                                <h4>Nowe Funkcje</h4>
                                <p>• Eksport/Import ustawień</p>
                                <p>• Filtry dodatków</p>
                                <p>• Skróty domyślnie wyłączone</p>
                                <p>• Płynne przesuwanie panelu</p>
                            </div>
                            
                            <div style="color:#ff9966; font-size:11px; margin-top:25px; padding:15px; 
                                        background:rgba(51,0,0,0.5); border-radius:6px;">
                                <p style="margin:5px 0;">© 2024 Synergy Panel</p>
                                <p style="margin:5px 0;">System licencji GitHub RAW</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 🔹 NOWA: Setup scrollowania środkowym przyciskiem myszy
    function setupMouseWheelSupport() {
        const scrollContainers = [
            '.addon-list-container',
            '.shortcuts-list-container',
            '.scrollable-container',
            '.license-scroll-container'
        ];
        
        // Opóźnienie inicjalizacji, aby kontenery zdążyły się załadować
        setTimeout(() => {
            scrollContainers.forEach(selector => {
                const containers = document.querySelectorAll(selector);
                containers.forEach(container => {
                    if (container) {
                        // Włącz scrollowanie
                        container.style.overflow = 'auto';
                        
                        // Zapobiegaj propagacji scrolla do body
                        container.addEventListener('wheel', function(e) {
                            if (this.scrollHeight > this.clientHeight) {
                                e.stopPropagation();
                            }
                        }, { passive: true });
                        
                        // Obsługa środkowego przycisku myszy
                        container.addEventListener('mousedown', function(e) {
                            if (e.button === 1) { // Środkowy przycisk
                                e.preventDefault();
                                this.style.cursor = 'grabbing';
                                
                                const startY = e.clientY;
                                const startScrollTop = this.scrollTop;
                                const scrollHeight = this.scrollHeight;
                                const clientHeight = this.clientHeight;
                                
                                const mouseMoveHandler = (moveEvent) => {
                                    if (scrollHeight > clientHeight) {
                                        const deltaY = moveEvent.clientY - startY;
                                        this.scrollTop = startScrollTop - deltaY;
                                        moveEvent.preventDefault();
                                    }
                                };
                                
                                const mouseUpHandler = () => {
                                    document.removeEventListener('mousemove', mouseMoveHandler);
                                    document.removeEventListener('mouseup', mouseUpHandler);
                                    this.style.cursor = '';
                                };
                                
                                document.addEventListener('mousemove', mouseMoveHandler);
                                document.addEventListener('mouseup', mouseUpHandler);
                            }
                        });
                    }
                });
            });
        }, 500);
    }

    // 🔹 POPRAWIONE: Ładowanie stanu skrótów - DOMYŚLNIE WYŁĄCZONE
    function loadShortcutsEnabledState() {
        shortcutsEnabled = SW.GM_getValue(CONFIG.SHORTCUTS_ENABLED, {});
        
        // 🔹 DLA NOWYCH SKRÓTÓW - DOMYŚLNIE WYŁĄCZONE
        Object.keys(addonShortcuts).forEach(addonId => {
            if (shortcutsEnabled[addonId] === undefined) {
                shortcutsEnabled[addonId] = false;
            }
        });
        
        saveShortcutsEnabledState();
    }

    // 🔹 NOWA: Uproszczony eksport ustawień (obfuskowany + auto-kopiowanie)
    function exportSettings() {
        try {
            // 🔹 MINIMALNE DANE - BEZ SENSITIVE INFORMATION
            const settings = {
                v: '4.5', // version
                t: Date.now(), // timestamp
                a: SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []), // addons
                s: SW.GM_getValue(CONFIG.SHORTCUTS_CONFIG, {}), // shortcuts
                se: SW.GM_getValue(CONFIG.SHORTCUTS_ENABLED, {}), // shortcuts enabled
                p: SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A'), // panel shortcut
                f: SW.GM_getValue(CONFIG.FONT_SIZE, 13), // font size
                o: SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90) // opacity
                // NIE EKSPORTUJEMY: license data, account id, admin info
            };
            
            // 🔹 OBFUSKACJA: Base64 + prosty szyfr
            const jsonString = JSON.stringify(settings);
            const base64 = btoa(unescape(encodeURIComponent(jsonString)));
            
            // Odwróć string i zamień znaki dla dodatkowej obfuskacji
            let obfuscated = base64.split('').reverse().join('')
                .replace(/=/g, '_')
                .replace(/\+/g, '-')
                .replace(/\//g, '.');
            
            // Dodaj checksum dla weryfikacji
            const checksum = obfuscated.length.toString(36);
            obfuscated = checksum + ':' + obfuscated;
            
            const textarea = document.getElementById('settingsTextarea');
            if (textarea) {
                textarea.value = obfuscated;
                
                // 🔹 AUTOMATYCZNE KOPIOWANIE DO SCHOWKA
                textarea.select();
                textarea.setSelectionRange(0, 99999);
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        showLicenseMessage('✅ Ustawienia wyeksportowane i skopiowane do schowka!', 'success');
                    } else {
                        showLicenseMessage('✅ Ustawienia wyeksportowane! Skopiuj tekst ręcznie.', 'info');
                    }
                } catch (err) {
                    showLicenseMessage('✅ Ustawienia wyeksportowane! Skopiuj tekst ręcznie.', 'info');
                }
            }
            
        } catch (error) {
            console.error('❌ Błąd eksportu:', error);
            showLicenseMessage('❌ Błąd eksportu ustawień', 'error');
        }
    }

    // 🔹 NOWA: Import obfuskowanych ustawień
    function importSettings() {
        const textarea = document.getElementById('settingsTextarea');
        if (!textarea || !textarea.value.trim()) {
            showLicenseMessage('❌ Brak danych do importu', 'error');
            return;
        }
        
        try {
            let obfuscated = textarea.value.trim();
            
            // 🔹 DEKODOWANIE OBFUSKACJI
            // Sprawdź checksum
            const parts = obfuscated.split(':');
            if (parts.length !== 2) {
                throw new Error('Nieprawidłowy format danych');
            }
            
            const checksum = parts[0];
            let data = parts[1];
            
            // Przywróć oryginalne znaki
            data = data.replace(/_/g, '=')
                      .replace(/-/g, '+')
                      .replace(/\./g, '/')
                      .split('').reverse().join('');
            
            // Sprawdź długość
            if (parseInt(checksum, 36) !== data.length) {
                throw new Error('Dane uszkodzone - nieprawidłowa checksum');
            }
            
            // Dekoduj Base64
            const decoded = decodeURIComponent(escape(atob(data)));
            const settings = JSON.parse(decoded);
            
            if (!settings.v) {
                throw new Error('Brak informacji o wersji');
            }
            
            if (settings.v !== '4.5') {
                if (!confirm(`To ustawienia z wersji ${settings.v}. Kontynuować import?`)) {
                    return;
                }
            }
            
            // 🔹 IMPORT DANYCH
            if (settings.a) SW.GM_setValue(CONFIG.FAVORITE_ADDONS, settings.a);
            if (settings.s) SW.GM_setValue(CONFIG.SHORTCUTS_CONFIG, settings.s);
            if (settings.se) SW.GM_setValue(CONFIG.SHORTCUTS_ENABLED, settings.se);
            if (settings.p) SW.GM_setValue(CONFIG.CUSTOM_SHORTCUT, settings.p);
            if (settings.f) SW.GM_setValue(CONFIG.FONT_SIZE, settings.f);
            if (settings.o) SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, settings.o);
            
            showLicenseMessage('✅ Ustawienia zaimportowane! Odświeżanie...', 'success');
            setTimeout(() => location.reload(), 2000);
            
        } catch (error) {
            console.error('❌ Błąd importu:', error);
            showLicenseMessage('❌ Nieprawidłowy format danych importu', 'error');
        }
    }

    // 🔹 Inicjalizacja event listenerów
    function initializeEventListeners() {
        // Przycisk zapisz i odśwież
        const saveRestartBtn = document.getElementById('swSaveAndRestartButton');
        if (saveRestartBtn) {
            saveRestartBtn.addEventListener('click', () => {
                saveAddonsState();
                showLicenseMessage('✅ Zapisano ustawienia! Odświeżanie gry...', 'success');
                setTimeout(() => location.reload(), 1500);
            });
        }
        
        // Reset ustawień
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) {
                    resetAllSettings();
                }
            });
        }
        
        // 🔹 PRZYCISKI ZMIANY CZCIONKI
        const fontSizeDecrease = document.getElementById('fontSizeDecrease');
        const fontSizeIncrease = document.getElementById('fontSizeIncrease');
        
        if (fontSizeDecrease) {
            fontSizeDecrease.addEventListener('click', function() {
                applyFontSize(currentFontSize - 1);
            });
        }
        
        if (fontSizeIncrease) {
            fontSizeIncrease.addEventListener('click', function() {
                applyFontSize(currentFontSize + 1);
            });
        }
        
        // 🔹 SUWAK PRZEŹROCZYSTOŚCI
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        if (opacitySlider && opacityValue) {
            opacitySlider.addEventListener('input', function() {
                const opacity = parseInt(this.value);
                opacityValue.textContent = opacity + '%';
                applyOpacity(opacity);
            });
        }
        
        // 🔹 FILTRY DODATKÓW
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderAddons();
            });
        });
        
        // 🔹 EKSPORT/IMPORT USTAWIEN
        const exportBtn = document.getElementById('exportSettingsBtn');
        const importBtn = document.getElementById('importSettingsBtn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', exportSettings);
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', importSettings);
        }
        
        // Wyszukiwanie dodatków
        const searchInput = document.getElementById('searchAddons');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchQuery = this.value.toLowerCase();
                renderAddons();
            });
        }
        
        // 🔹 SKRÓT PANELU
        setupPanelShortcutInput();
        
        // 🔹 ZAKŁADKI
        setupTabs();
        
        // 🔹 GLOBALNE SKRÓTY
        setupGlobalShortcuts();
    }
    // 🔹 Setup przeciągania PANELU (CAŁEGO)
    function setupPanelDrag() {
        const panel = document.getElementById('swAddonsPanel');
        const header = document.getElementById('swPanelHeader');
        
        if (!panel) return;
        
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;

        // 🔹 Obszar chwytania: nagłówek + górna część panelu (90px)
        const startDrag = (e) => {
            // Sprawdź czy kliknięto w obszar chwytania (nagłówek lub 30px pod)
            const rect = panel.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            
            if (clickY <= 90) { // Nagłówek + dodatkowy obszar
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                initialLeft = parseInt(panel.style.left) || 70;
                initialTop = parseInt(panel.style.top) || 140;
                
                panel.classList.add('dragging');
                panel.style.cursor = 'grabbing';
                
                document.addEventListener('mousemove', onDrag);
                document.addEventListener('mouseup', stopDrag);
                
                e.preventDefault();
                e.stopPropagation();
            }
        };

        function onDrag(e) {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;
            
            // Ograniczenia - nie wychodź poza ekran
            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;
            
            newLeft = Math.max(0, Math.min(newLeft, maxX));
            newTop = Math.max(0, Math.min(newTop, maxY));
            
            // Ustaw pozycję
            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
            
            e.preventDefault();
        }

        function stopDrag() {
            if (!isDragging) return;
            
            isDragging = false;
            panel.classList.remove('dragging');
            panel.style.cursor = '';
            
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
            
            // Zapisz pozycję
            SW.GM_setValue(CONFIG.PANEL_POSITION, {
                left: panel.style.left,
                top: panel.style.top
            });
        }

        // 🔹 Event listeners dla myszy
        panel.addEventListener('mousedown', startDrag);
        
        // 🔹 Zapobiegaj domyślnemu zachowaniu przeciągania
        panel.addEventListener('dragstart', (e) => e.preventDefault());
    }

    // 🔹 Setup przeciągania przycisku (PŁYNNIEJSZE)
    function setupToggleDrag(toggleBtn) {
        if (!toggleBtn) return;
        
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        
        // Ustaw początkowe pozycje z zapisanych
        const savedPos = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        if (savedPos) {
            toggleBtn.style.left = savedPos.left;
            toggleBtn.style.top = savedPos.top;
        } else {
            toggleBtn.style.left = '70px';
            toggleBtn.style.top = '70px';
        }

        toggleBtn.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return; // Tylko lewy przycisk
            
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = toggleBtn.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            
            const dragTimer = setTimeout(() => {
                isDragging = true;
                toggleBtn.classList.add('dragging');
                toggleBtn.style.cursor = 'grabbing';
            }, 100); // Opóźnienie, aby odróżnić kliknięcie od przeciągania
            
            function onMouseMove(e) {
                if (!isDragging) return;
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                let newLeft = initialLeft + deltaX;
                let newTop = initialTop + deltaY;
                
                // Ograniczenia - nie wychodź poza ekran
                const maxX = window.innerWidth - toggleBtn.offsetWidth;
                const maxY = window.innerHeight - toggleBtn.offsetHeight;
                
                newLeft = Math.max(0, Math.min(newLeft, maxX));
                newTop = Math.max(0, Math.min(newTop, maxY));
                
                toggleBtn.style.left = newLeft + 'px';
                toggleBtn.style.top = newTop + 'px';
                
                e.preventDefault();
            }

            function onMouseUp() {
                clearTimeout(dragTimer);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                
                if (isDragging) {
                    isDragging = false;
                    toggleBtn.classList.remove('dragging');
                    toggleBtn.style.cursor = '';
                    toggleBtn.classList.add('saved');
                    
                    SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, {
                        left: toggleBtn.style.left,
                        top: toggleBtn.style.top
                    });
                    
                    setTimeout(() => toggleBtn.classList.remove('saved'), 1500);
                } else {
                    // Kliknięcie - otwórz/zamknij panel
                    togglePanel();
                }
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // 🔹 Toggle panelu
    function togglePanel() {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const isVisible = panel.style.display === 'block';
            panel.style.display = isVisible ? 'none' : 'block';
            SW.GM_setValue(CONFIG.PANEL_VISIBLE, !isVisible);
        }
    }

    // 🔹 Setup skrótu panelu
    function setupPanelShortcutInput() {
        const input = document.getElementById('panelShortcutInput');
        const setBtn = document.getElementById('panelShortcutSetBtn');
        
        if (!input || !setBtn) return;
        
        const savedShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        panelShortcut = savedShortcut;
        input.value = panelShortcut;
        
        setBtn.addEventListener('click', function() {
            input.value = 'Wciśnij kombinację...';
            input.style.borderColor = '#ff3300';
            input.style.boxShadow = '0 0 10px rgba(255, 51, 0, 0.5)';
            
            let keys = [];
            let isSetting = true;
            
            const keyDownHandler = (e) => {
                if (!isSetting) return;
                e.preventDefault();
                e.stopPropagation();
                
                const keyParts = [];
                if (e.ctrlKey) keyParts.push('Ctrl');
                if (e.shiftKey) keyParts.push('Shift');
                if (e.altKey) keyParts.push('Alt');
                
                const mainKey = e.key.toUpperCase();
                if (!['CONTROL', 'SHIFT', 'ALT', 'META'].includes(mainKey)) {
                    keyParts.push(mainKey);
                }
                
                const shortcut = keyParts.join('+');
                input.value = shortcut;
                keys = keyParts;
            };
            
            const keyUpHandler = (e) => {
                if (!isSetting) return;
                
                if (keys.length >= 2) {
                    isSetting = false;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    
                    panelShortcut = keys.join('+');
                    SW.GM_setValue(CONFIG.CUSTOM_SHORTCUT, panelShortcut);
                    
                    input.value = panelShortcut;
                    input.style.borderColor = '#00cc00';
                    input.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
                    
                    const messageEl = document.getElementById('swResetMessage');
                    if (messageEl) {
                        messageEl.textContent = `✅ Skrót ustawiony: ${panelShortcut}`;
                        messageEl.style.background = 'rgba(0, 255, 0, 0.1)';
                        messageEl.style.color = '#00ff00';
                        messageEl.style.border = '1px solid #00ff00';
                        messageEl.style.display = 'block';
                        setTimeout(() => messageEl.style.display = 'none', 3000);
                    }
                    
                    setTimeout(() => {
                        input.style.borderColor = '#660000';
                        input.style.boxShadow = 'none';
                    }, 2000);
                }
            };
            
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    isSetting = false;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    document.removeEventListener('keydown', escapeHandler);
                    
                    input.value = panelShortcut;
                    input.style.borderColor = '#660000';
                    input.style.boxShadow = 'none';
                }
            };
            
            document.addEventListener('keydown', keyDownHandler);
            document.addEventListener('keyup', keyUpHandler);
            document.addEventListener('keydown', escapeHandler);
            
            setTimeout(() => {
                if (isSetting) {
                    isSetting = false;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    document.removeEventListener('keydown', escapeHandler);
                    
                    input.value = panelShortcut;
                    input.style.borderColor = '#660000';
                    input.style.boxShadow = 'none';
                }
            }, 10000);
        });
    }

    // 🔹 Setup zakładek
    function setupTabs() {
        const tabs = document.querySelectorAll('.tablink');
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const tabName = this.getAttribute('data-tab');
                showTab(tabName);
                
                if (tabName === 'shortcuts') {
                    setTimeout(renderShortcuts, 100);
                }
            });
        });
    }

    function showTab(tabName) {
        const tabContents = document.querySelectorAll('.tabcontent');
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        const tabs = document.querySelectorAll('.tablink');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        const tabToShow = document.getElementById(tabName);
        if (tabToShow) {
            tabToShow.classList.add('active');
            tabToShow.style.display = 'flex';
        }
        
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        }
    }

    // 🔹 Setup globalnych skrótów
    function setupGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (isShortcutInputFocused) return;
            
            const panelShortcutParts = panelShortcut.split('+');
            const hasCtrl = panelShortcutParts.includes('Ctrl');
            const hasShift = panelShortcutParts.includes('Shift');
            const hasAlt = panelShortcutParts.includes('Alt');
            const key = panelShortcutParts[panelShortcutParts.length - 1].toUpperCase();
            
            const ctrlMatch = hasCtrl ? e.ctrlKey : !e.ctrlKey;
            const shiftMatch = hasShift ? e.shiftKey : !e.shiftKey;
            const altMatch = hasAlt ? e.altKey : !e.altKey;
            const keyMatch = e.key.toUpperCase() === key;
            
            if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                e.preventDefault();
                togglePanel();
                return;
            }
            
            // 🔹 Skróty dla dodatków (tylko jeśli włączone)
            Object.keys(addonShortcuts).forEach(addonId => {
                const shortcut = addonShortcuts[addonId];
                if (!shortcut || shortcutsEnabled[addonId] !== true) return;
                
                const parts = shortcut.split('+');
                const sHasCtrl = parts.includes('Ctrl');
                const sHasShift = parts.includes('Shift');
                const sHasAlt = parts.includes('Alt');
                const sKey = parts[parts.length - 1].toUpperCase();
                
                const sCtrlMatch = sHasCtrl ? e.ctrlKey : !e.ctrlKey;
                const sShiftMatch = sHasShift ? e.shiftKey : !e.shiftKey;
                const sAltMatch = sHasAlt ? e.altKey : !e.altKey;
                const sKeyMatch = e.key.toUpperCase() === sKey;
                
                if (sCtrlMatch && sShiftMatch && sAltMatch && sKeyMatch) {
                    e.preventDefault();
                    const addon = currentAddons.find(a => a.id === addonId);
                    if (addon && addon.enabled && !addon.locked) {
                        toggleAddon(addonId, false);
                        showShortcutMessage(`⚠️ ${addon.name} wyłączony (${shortcut})`, 'info');
                    }
                }
            });
        });
    }

    // 🔹 Renderowanie dodatków z FILTRAMI
    function renderAddons() {
        const listContainer = document.getElementById('addon-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        // 🔹 FILTROWANIE DODATKÓW
        let filteredAddons = currentAddons.filter(addon => !addon.hidden);
        
        switch(currentFilter) {
            case 'enabled':
                filteredAddons = filteredAddons.filter(addon => addon.enabled);
                break;
            case 'disabled':
                filteredAddons = filteredAddons.filter(addon => !addon.enabled);
                break;
            case 'favorites':
                filteredAddons = filteredAddons.filter(addon => addon.favorite);
                break;
        }
        
        // 🔹 WYSZUKIWANIE
        if (searchQuery) {
            filteredAddons = filteredAddons.filter(addon => 
                addon.name.toLowerCase().includes(searchQuery) || 
                addon.description.toLowerCase().includes(searchQuery)
            );
        }
        
        if (filteredAddons.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center; padding:40px; color:#ff9966; font-style:italic; font-size:12px; width:100%;">
                    ${searchQuery || currentFilter !== 'all' ? 'Nie znaleziono dodatków' : 'Brak dostępnych dodatków'}
                </div>
            `;
            return;
        }
        
        // 🔹 RENDEROWANIE
        filteredAddons.forEach(addon => {
            const div = document.createElement('div');
            div.className = 'addon';
            div.dataset.id = addon.id;
            
            div.innerHTML = `
                <div class="addon-header">
                    <div class="addon-title">
                        ${addon.type === 'premium' ? '<span class="premium-badge">PREMIUM</span> ' : ''}
                        ${addon.name}
                        ${addon.locked ? ' <span style="color:#ff3300; font-size:10px;">(Wymaga licencji)</span>' : ''}
                    </div>
                    <div class="addon-description">${addon.description}</div>
                </div>
                <div class="addon-controls">
                    <button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" 
                            data-id="${addon.id}"
                            title="${addon.locked ? 'Wymaga licencji' : 'Dodaj do ulubionych'}"
                            ${addon.locked ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        ★
                    </button>
                    <label class="addon-switch" title="${addon.locked ? 'Wymaga licencji' : 'Włącz/Wyłącz'}">
                        <input type="checkbox" 
                               ${addon.enabled ? 'checked' : ''} 
                               ${addon.locked ? 'disabled' : ''}
                               data-id="${addon.id}">
                        <span class="addon-switch-slider"></span>
                    </label>
                </div>
            `;
            
            listContainer.appendChild(div);
        });
        
        // 🔹 EVENT LISTENERS
        document.querySelectorAll('.favorite-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const addonId = this.dataset.id;
                if (addonId) toggleFavorite(addonId);
            });
        });
        
        document.querySelectorAll('.addon-switch input:not(:disabled)').forEach(checkbox => {
            checkbox.addEventListener('change', function(e) {
                e.stopPropagation();
                const addonId = this.dataset.id;
                if (addonId) toggleAddon(addonId, this.checked);
            });
        });
    }

    // 🔹 Renderowanie skrótów (DOMYŚLNIE WYŁĄCZONE)
    function renderShortcuts() {
        const container = document.getElementById('shortcuts-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const enabledAddons = currentAddons.filter(addon => 
            addon.enabled && !addon.locked && !addon.hidden
        );
        
        if (enabledAddons.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:30px; color:#ff9966; font-style:italic; font-size:12px; width:100%;">
                    Brak włączonych dodatków. Włącz dodatek w zakładce "Dodatki".
                </div>
            `;
            return;
        }
        
        enabledAddons.forEach(addon => {
            const shortcut = addonShortcuts[addon.id] || 'Brak skrótu';
            const isEnabled = shortcutsEnabled[addon.id] === true; // DOMYŚLNIE FALSE
            
            const item = document.createElement('div');
            item.className = 'shortcut-item';
            item.innerHTML = `
                <div class="shortcut-info">
                    <div class="shortcut-name">
                        ${addon.type === 'premium' ? '<span class="premium-badge">PREMIUM</span> ' : ''}
                        ${addon.name}
                    </div>
                    <div class="shortcut-desc">${addon.description}</div>
                </div>
                <div class="shortcut-controls">
                    <div class="shortcut-display" id="shortcut-display-${addon.id}">
                        ${shortcut}
                    </div>
                    <button class="shortcut-set-btn" data-id="${addon.id}">Ustaw</button>
                    <button class="shortcut-clear-btn" data-id="${addon.id}">Wyczyść</button>
                    <label class="shortcut-toggle" title="${isEnabled ? 'Wyłącz skrót' : 'Włącz skrót'}">
                        <input type="checkbox" ${isEnabled ? 'checked' : ''} data-id="${addon.id}" class="shortcut-toggle-input">
                        <span class="shortcut-toggle-slider"></span>
                    </label>
                </div>
            `;
            
            container.appendChild(item);
        });
        
        // 🔹 EVENT LISTENERS DLA SKRÓTÓW
        document.querySelectorAll('.shortcut-set-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const addonId = this.dataset.id;
                setAddonShortcut(addonId);
            });
        });
        
        document.querySelectorAll('.shortcut-clear-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const addonId = this.dataset.id;
                clearAddonShortcut(addonId);
            });
        });
        
        document.querySelectorAll('.shortcut-toggle-input').forEach(toggle => {
            toggle.addEventListener('change', function() {
                const addonId = this.dataset.id;
                toggleShortcutEnabled(addonId, this.checked);
            });
        });
    }

    // 🔹 Przełączanie ulubionych
    function toggleFavorite(addonId) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        
        currentAddons[addonIndex].favorite = !currentAddons[addonIndex].favorite;
        saveAddonsState();
        
        // Jeśli jesteśmy w filtrze ulubionych, odśwież
        if (currentFilter === 'favorites') {
            renderAddons();
        } else {
            // Tylko zaktualizuj przycisk
            const btn = document.querySelector(`.favorite-btn[data-id="${addonId}"]`);
            if (btn) {
                btn.classList.toggle('favorite');
            }
        }
    }

    // 🔹 Przełączanie dodatków
    function toggleAddon(addonId, isEnabled) {
        const addon = currentAddons.find(a => a.id === addonId);
        if (!addon || addon.locked) return;
        
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        currentAddons[addonIndex].enabled = isEnabled;
        saveAddonsState();
        
        const messageEl = document.getElementById('swAddonsMessage');
        if (messageEl) {
            messageEl.textContent = `${addon.name} ${isEnabled ? 'włączony' : 'wyłączony'}`;
            messageEl.className = `license-message license-${isEnabled ? 'success' : 'info'}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 3000);
        }
        
        // 🔹 SKRÓTY: Nowo włączony dodatek NIE MA automatycznie włączonego skrótu
        if (isEnabled) {
            // Dla nowo włączonego dodatku upewnij się, że skrót jest wyłączony
            if (shortcutsEnabled[addonId] === undefined) {
                shortcutsEnabled[addonId] = false;
                saveShortcutsEnabledState();
            }
        }
        
        // Jeśli jesteśmy w zakładce skrótów, odśwież
        if (document.getElementById('shortcuts').classList.contains('active')) {
            renderShortcuts();
        }
    }

    // 🔹 Zapisywanie stanu dodatków
    function saveAddonsState() {
        const addonsToSave = currentAddons.map(addon => ({
            id: addon.id,
            enabled: addon.enabled || false,
            favorite: addon.favorite || false
        }));
        SW.GM_setValue(CONFIG.FAVORITE_ADDONS, addonsToSave);
    }

    // 🔹 Przywracanie stanu dodatków
    function restoreAddonsState() {
        const savedAddons = SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []);
        currentAddons = ADDONS.map(addon => {
            const savedAddon = savedAddons.find(a => a.id === addon.id);
            if (savedAddon) {
                return {
                    ...addon,
                    enabled: savedAddon.enabled || false,
                    favorite: savedAddon.favorite || false
                };
            }
            return { ...addon, enabled: false, favorite: false };
        });
    }

    // 🔹 Ładowanie skrótów
    function loadAddonShortcuts() {
        addonShortcuts = SW.GM_getValue(CONFIG.SHORTCUTS_CONFIG, {});
    }

    function saveAddonShortcuts() {
        SW.GM_setValue(CONFIG.SHORTCUTS_CONFIG, addonShortcuts);
    }

    function saveShortcutsEnabledState() {
        SW.GM_setValue(CONFIG.SHORTCUTS_ENABLED, shortcutsEnabled);
    }

    // 🔹 Ustawianie skrótu dla dodatku
    function setAddonShortcut(addonId) {
        const display = document.getElementById(`shortcut-display-${addonId}`);
        if (!display) return;
        
        display.textContent = 'Wciśnij kombinację...';
        display.style.color = '#ffcc00';
        display.style.borderColor = '#ff3300';
        
        let keys = [];
        let isSetting = true;
        
        const keyDownHandler = (e) => {
            if (!isSetting) return;
            e.preventDefault();
            e.stopPropagation();
            
            const keyParts = [];
            if (e.ctrlKey) keyParts.push('Ctrl');
            if (e.shiftKey) keyParts.push('Shift');
            if (e.altKey) keyParts.push('Alt');
            
            const mainKey = e.key.toUpperCase();
            if (!['CONTROL', 'SHIFT', 'ALT', 'META'].includes(mainKey)) {
                keyParts.push(mainKey);
            }
            
            const shortcut = keyParts.join('+');
            display.textContent = shortcut;
            keys = keyParts;
        };
        
        const keyUpHandler = (e) => {
            if (!isSetting) return;
            
            if (keys.length >= 2) {
                isSetting = false;
                document.removeEventListener('keydown', keyDownHandler);
                document.removeEventListener('keyup', keyUpHandler);
                
                const shortcut = keys.join('+');
                addonShortcuts[addonId] = shortcut;
                saveAddonShortcuts();
                
                // 🔹 NOWY SKRÓT - DOMYŚLNIE WYŁĄCZONY
                shortcutsEnabled[addonId] = false;
                saveShortcutsEnabledState();
                
                display.textContent = shortcut;
                display.style.color = '#00ff00';
                display.style.borderColor = '#00cc00';
                
                showShortcutMessage(`✅ Skrót ustawiony: ${shortcut} (domyślnie wyłączony)`, 'success');
                
                setTimeout(() => {
                    display.style.color = '#ffcc00';
                    display.style.borderColor = '#660000';
                }, 2000);
            }
        };
        
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                isSetting = false;
                document.removeEventListener('keydown', keyDownHandler);
                document.removeEventListener('keyup', keyUpHandler);
                document.removeEventListener('keydown', escapeHandler);
                
                const oldShortcut = addonShortcuts[addonId] || 'Brak skrótu';
                display.textContent = oldShortcut;
                display.style.color = '#ffcc00';
                display.style.borderColor = '#660000';
            }
        };
        
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        document.addEventListener('keydown', escapeHandler);
        
        setTimeout(() => {
            if (isSetting) {
                isSetting = false;
                document.removeEventListener('keydown', keyDownHandler);
                document.removeEventListener('keyup', keyUpHandler);
                document.removeEventListener('keydown', escapeHandler);
                
                const oldShortcut = addonShortcuts[addonId] || 'Brak skrótu';
                display.textContent = oldShortcut;
                display.style.color = '#ffcc00';
                display.style.borderColor = '#660000';
                
                showShortcutMessage('⏰ Czas minął', 'error');
            }
        }, 10000);
    }

    // 🔹 Czyszczenie skrótu
    function clearAddonShortcut(addonId) {
        delete addonShortcuts[addonId];
        delete shortcutsEnabled[addonId];
        
        saveAddonShortcuts();
        saveShortcutsEnabledState();
        
        const display = document.getElementById(`shortcut-display-${addonId}`);
        if (display) {
            display.textContent = 'Brak skrótu';
        }
        
        showShortcutMessage('Skrót wyczyszczony', 'info');
    }

    // 🔹 Przełączanie włączenia skrótu
    function toggleShortcutEnabled(addonId, enabled) {
        shortcutsEnabled[addonId] = enabled;
        saveShortcutsEnabledState();
        showShortcutMessage(enabled ? '✅ Skrót włączony' : '⚠️ Skrót wyłączony', 'info');
    }

    // 🔹 Wyświetlanie wiadomości dla skrótów
    function showShortcutMessage(message, type) {
        const messageEl = document.getElementById('shortcutsMessage') || createShortcutsMessageElement();
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `license-message license-${type}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 3000);
        }
    }

    function createShortcutsMessageElement() {
        const shortcutsTab = document.getElementById('shortcuts');
        if (!shortcutsTab) return null;
        
        const messageEl = document.createElement('div');
        messageEl.id = 'shortcutsMessage';
        messageEl.className = 'license-message';
        messageEl.style.display = 'none';
        messageEl.style.marginTop = '10px';
        messageEl.style.width = '100%';
        messageEl.style.maxWidth = '800px';
        
        const content = shortcutsTab.querySelector('.sw-tab-content');
        if (content) {
            content.appendChild(messageEl);
        }
        
        return messageEl;
    }

    // 🔹 Ładowanie ustawień
    function loadSettings() {
        // Czcionka
        const savedFontSize = parseInt(SW.GM_getValue(CONFIG.FONT_SIZE, 13));
        currentFontSize = savedFontSize;
        applyFontSize(savedFontSize);
        
        // Przeźroczystość
        const savedOpacity = parseInt(SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90));
        applyOpacity(savedOpacity);
        
        // Skrót panelu
        const savedShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        panelShortcut = savedShortcut;
        const panelInput = document.getElementById('panelShortcutInput');
        if (panelInput) panelInput.value = panelShortcut;
    }

    // 🔹 Ładowanie zapisanego stanu
    function loadSavedState() {
        // Przycisk toggle
        const savedBtnPosition = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn && savedBtnPosition) {
            toggleBtn.style.left = savedBtnPosition.left;
            toggleBtn.style.top = savedBtnPosition.top;
        }
        
        // Pozycja panelu
        const savedPosition = SW.GM_getValue(CONFIG.PANEL_POSITION);
        const panel = document.getElementById('swAddonsPanel');
        if (panel && savedPosition) {
            panel.style.left = savedPosition.left;
            panel.style.top = savedPosition.top;
        }
        
        // Widoczność panelu
        const isVisible = SW.GM_getValue(CONFIG.PANEL_VISIBLE, false);
        if (panel) {
            panel.style.display = isVisible ? 'block' : 'none';
        }
    }

    // 🔹 Reset wszystkich ustawień
    function resetAllSettings() {
        Object.keys(CONFIG).forEach(key => {
            SW.GM_deleteValue(CONFIG[key]);
        });
        
        // Reset zmiennych
        currentAddons = ADDONS.map(addon => ({
            ...addon,
            enabled: addon.type === 'free' ? false : false,
            favorite: false,
            locked: addon.type === 'premium',
            hidden: addon.type === 'premium'
        }));
        
        userAccountId = null;
        isLicenseVerified = false;
        licenseData = null;
        licenseExpiry = null;
        isAdmin = false;
        addonShortcuts = {};
        shortcutsEnabled = {};
        panelShortcut = 'Ctrl+A';
        currentFontSize = 13;
        currentFilter = 'all';
        
        const resetMessage = document.getElementById('swResetMessage');
        if (resetMessage) {
            resetMessage.textContent = '✅ Wszystkie ustawienia zresetowane! Strona zostanie odświeżona...';
            resetMessage.style.background = 'rgba(255, 102, 0, 0.1)';
            resetMessage.style.color = '#ff6600';
            resetMessage.style.border = '1px solid #ff6600';
            resetMessage.style.display = 'block';
            setTimeout(() => location.reload(), 2000);
        }
    }

    // =========================================================================
    // 🔹 SYSTEM KONTA I LICENCJI (SKRÓCONY)
    // =========================================================================

    async function initAccountAndLicense() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Symulacja pobrania ID konta
        const accountId = await getAccountId();
        console.log('👤 ID konta:', accountId);
        
        if (accountId) {
            userAccountId = accountId;
            SW.GM_setValue(CONFIG.ACCOUNT_ID, accountId);
            
            isAdmin = checkIfAdmin(accountId);
            SW.GM_setValue(CONFIG.ADMIN_ACCESS, isAdmin);
            
            updateAccountDisplay(accountId);
            await checkAndUpdateLicense(accountId);
        } else {
            updateAccountDisplay('Nie znaleziono');
        }
    }

    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) return cookieValue;
        }
        return null;
    }

    async function getAccountId() {
        try {
            const userId = getCookie('user_id');
            if (userId) return userId;
            
            const mcharId = getCookie('mchar_id');
            if (mcharId) return mcharId;
            
            const savedAccountId = SW.GM_getValue(CONFIG.ACCOUNT_ID);
            if (savedAccountId) return savedAccountId;
            
            const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            SW.GM_setValue(CONFIG.ACCOUNT_ID, tempId);
            return tempId;
        } catch (e) {
            const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            SW.GM_setValue(CONFIG.ACCOUNT_ID, tempId);
            return tempId;
        }
    }

    function checkIfAdmin(accountId) {
        if (!accountId) return false;
        return accountId.toString() === ADMIN_ACCOUNT_ID;
    }

    async function checkAndUpdateLicense(accountId) {
        if (isCheckingLicense) return;
        isCheckingLicense = true;
        
        try {
            const result = await checkLicenseForAccount(accountId);
            
            if (result.success) {
                if (result.hasLicense && !result.expired && !result.used) {
                    isLicenseVerified = true;
                    licenseData = result;
                    licenseExpiry = result.expiry ? new Date(result.expiry) : null;
                    
                    SW.GM_setValue(CONFIG.LICENSE_ACTIVE, true);
                    SW.GM_setValue(CONFIG.LICENSE_EXPIRY, licenseExpiry?.toISOString());
                    SW.GM_setValue(CONFIG.LICENSE_DATA, licenseData);
                    
                    loadAddonsBasedOnLicense(result.addons || ['all']);
                    showLicenseMessage(`✅ Licencja aktywna! Ważna do: ${licenseExpiry ? licenseExpiry.toLocaleDateString('pl-PL') : 'bezterminowo'}`, 'success');
                } else {
                    isLicenseVerified = false;
                    licenseData = null;
                    licenseExpiry = null;
                    
                    SW.GM_setValue(CONFIG.LICENSE_ACTIVE, false);
                    SW.GM_deleteValue(CONFIG.LICENSE_EXPIRY);
                    SW.GM_deleteValue(CONFIG.LICENSE_DATA);
                    
                    loadAddonsBasedOnLicense([]);
                    
                    if (result.expired) {
                        showLicenseMessage('❌ Licencja wygasła. Dostęp tylko do darmowych dodatków.', 'error');
                    } else if (result.used) {
                        showLicenseMessage('⚠️ Licencja została już użyta. Dostęp tylko do darmowych dodatków.', 'error');
                    } else {
                        showLicenseMessage('ℹ️ Brak aktywnej licencji. Dostęp tylko do darmowych dodatków.', 'info');
                    }
                }
            } else {
                console.error('❌ Błąd licencji:', result.error);
                serverConnected = false;
                loadAddonsBasedOnLicense([]);
                showLicenseMessage('⚠️ Problem z połączeniem. Używam zapisanych ustawień.', 'info');
            }
        } catch (error) {
            console.error('❌ Błąd:', error);
            loadAddonsBasedOnLicense([]);
        } finally {
            isCheckingLicense = false;
            updateLicenseDisplay();
        }
    }

    async function checkLicenseForAccount(accountId) {
        try {
            if (checkIfAdmin(accountId)) {
                return {
                    success: true,
                    hasLicense: true,
                    expired: false,
                    used: false,
                    expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    daysLeft: 365,
                    addons: ['all'],
                    type: 'premium',
                    accountId: accountId,
                    source: 'admin'
                };
            }

            // Dla uproszczenia - zawsze zwracamy brak licencji (możesz dodać prawdziwe sprawdzanie)
            return {
                success: true,
                hasLicense: false,
                expired: false,
                used: false,
                message: 'Brak aktywnej licencji',
                accountId: accountId,
                source: 'local'
            };

        } catch (error) {
            console.error('❌ Błąd podczas sprawdzania licencji:', error);
            return {
                success: false,
                error: error.message,
                hasLicense: false
            };
        }
    }

    function loadAddonsBasedOnLicense(allowedAddons = []) {
        const isPremiumAllowed = isLicenseVerified || isAdmin;
        
        currentAddons = ADDONS.map(addon => {
            const isFree = addon.type === 'free';
            const isPremium = addon.type === 'premium';
            
            return {
                ...addon,
                enabled: false,
                favorite: addon.favorite || false,
                hidden: isPremium && !isPremiumAllowed,
                locked: isPremium && !isPremiumAllowed
            };
        });
        
        restoreAddonsState();
        
        if (document.getElementById('addon-list')) {
            renderAddons();
        }
    }

    function updateAccountDisplay(accountId) {
        const accountEl = document.getElementById('swAccountId');
        if (accountEl) {
            accountEl.innerHTML = `${accountId} <span class="copy-icon" title="Kopiuj do schowka">📋</span>`;
            accountEl.className = 'license-status-value';
            
            const copyIcon = accountEl.querySelector('.copy-icon');
            if (copyIcon) {
                copyIcon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    navigator.clipboard.writeText(accountId).then(() => {
                        showLicenseMessage('✅ ID konta skopiowane do schowka', 'success');
                    }).catch(err => {
                        console.error('Błąd kopiowania: ', err);
                        showLicenseMessage('❌ Nie udało się skopiować ID', 'error');
                    });
                });
            }
        }
    }

    function updateLicenseDisplay() {
        const statusEl = document.getElementById('swLicenseStatus');
        const expiryEl = document.getElementById('swLicenseExpiry');
        const daysEl = document.getElementById('swLicenseDaysLeft');
        
        if (statusEl) {
            statusEl.textContent = isLicenseVerified ? 'Aktywna' : 'Nieaktywna';
            statusEl.className = isLicenseVerified ? 'license-status-valid' : 'license-status-invalid';
        }
        
        if (expiryEl) {
            expiryEl.textContent = licenseExpiry ? licenseExpiry.toLocaleDateString('pl-PL') : '-';
        }
        
        if (daysEl) {
            if (licenseData && licenseData.daysLeft !== undefined) {
                daysEl.textContent = `${licenseData.daysLeft} dni`;
                daysEl.className = licenseData.daysLeft < 7 ? 'license-status-warning' : 'license-status-valid';
            } else {
                daysEl.textContent = '-';
            }
        }
    }

    function showLicenseMessage(message, type = 'info') {
        const messageEl = document.getElementById('swLicenseMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `license-message license-${type}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 5000);
        }
    }

    // =========================================================================
    // 🔹 INICJALIZACJA PANELU
    // =========================================================================

    async function initPanel() {
        console.log('✅ Initializing Synergy Panel v4.5...');
        
        // Poczekaj na załadowanie DOM
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Stwórz przycisk i panel
        const toggleBtn = createToggleButton();
        createMainPanel();
        
        // Załaduj zapisany stan
        loadSavedState();
        
        // Setup przeciągania
        if (toggleBtn) {
            setupToggleDrag(toggleBtn);
        }
        
        // Inicjalizacja konta i licencji
        setTimeout(async () => {
            await initAccountAndLicense();
            
            // Renderuj dodatki i skróty
            renderAddons();
            renderShortcuts();
            
            // Periodyczne sprawdzanie licencji
            setInterval(() => {
                if (userAccountId) checkAndUpdateLicense(userAccountId);
            }, 5 * 60 * 1000);
        }, 1000);
    }

    // 🔹 Start panelu
    console.log('🎯 Starting Synergy Panel v4.5...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }

})();