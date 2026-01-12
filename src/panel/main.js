// synergy.js - Główny kod panelu z systemem ID konta
(function() {
    'use strict';

    console.log('🚀 SynergyWraith Panel loaded v2.0');

    // 🔹 Konfiguracja
    const CONFIG = {
        PANEL_POSITION: "sw_panel_position",
        PANEL_VISIBLE: "sw_panel_visible",
        TOGGLE_BTN_POSITION: "sw_toggle_button_position",
        KCS_ICONS_ENABLED: "kcs_icons_enabled",
        FAVORITE_ADDONS: "sw_favorite_addons",
        FONT_SIZE: "sw_panel_font_size",
        BACKGROUND_VISIBLE: "sw_panel_background",
        ACTIVE_CATEGORIES: "sw_active_categories",
        LICENSE_KEY: "sw_license_key",
        LICENSE_EXPIRY: "sw_license_expiry",
        LICENSE_ACTIVE: "sw_license_active",
        SHORTCUT_KEY: "sw_shortcut_key",
        CUSTOM_SHORTCUT: "sw_custom_shortcut",
        ACCOUNT_ID: "sw_account_id"
    };

    // 🔹 Lista dostępnych dodatków
    const ADDONS = [
        {
            id: 'kcs-icons',
            name: 'KCS Icons',
            description: 'Dodaje ikony do interfejsu gry',
            enabled: false,
            favorite: false
        },
        {
            id: 'auto-looter',
            name: 'Auto Looter',
            description: 'Automatycznie zbiera loot',
            enabled: false,
            favorite: false
        },
        {
            id: 'quest-helper',
            name: 'Quest Helper',
            description: 'Pomocnik zadań',
            enabled: false,
            favorite: false
        },
        {
            id: 'enhanced-stats',
            name: 'Enhanced Stats',
            description: 'Rozszerzone statystyki',
            enabled: false,
            favorite: false
        },
        {
            id: 'trade-helper',
            name: 'Trade Helper',
            description: 'Pomocnik handlu',
            enabled: false,
            favorite: false
        },
        {
            id: 'combat-log',
            name: 'Combat Log',
            description: 'Rozszerzony log walki',
            enabled: false,
            favorite: false
        }
    ];

    // 🔹 Informacje o wersji
    const VERSION_INFO = {
        version: "2.0",
        releaseDate: "2024-01-15",
        patchNotes: [
            "Dodano automatyczne wykrywanie ID konta",
            "Poprawiono strukturę repozytorium",
            "Nowy system licencji w przygotowaniu",
            "Ulepszone wykrywanie konta z API gry",
            "Lepsza organizacja kodu"
        ]
    };

    // 🔹 Skróty klawiszowe dla dodatków
    const DEFAULT_SHORTCUTS = [
        { addonId: 'kcs-icons', shortcut: 'Ctrl+Shift+I', description: 'Przełącz ikony' },
        { addonId: 'auto-looter', shortcut: 'Ctrl+L', description: 'Szybki loot' },
        { addonId: 'quest-helper', shortcut: 'Ctrl+Q', description: 'Pokaż zadania' },
        { addonId: 'trade-helper', shortcut: 'Ctrl+T', description: 'Otwórz handel' }
    ];

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
    let licenseExpiry = null;
    let serverConnected = true;
    let currentAddons = [...ADDONS];
    let activeCategories = {
        enabled: true,
        disabled: true,
        favorites: true
    };
    let searchQuery = '';
    let customShortcut = 'A';
    let isShortcutInputFocused = false;
    let shortcutKeys = [];

    // =========================================================================
    // 🔹 FUNKCJE DO POBRANIA ID KONTA
    // =========================================================================

    // Funkcja 1: Pobierz ID konta z różnych źródeł
    async function getAccountId() {
        console.log('🔍 Szukam ID konta...');
        
        // Metoda 1: Z cookies (działa na wszystkich poddomenach)
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'user_id') {
                console.log('✅ Znaleziono w cookie user_id:', value);
                return value;
            }
            if (name === 'mchar_id') {
                console.log('✅ Znaleziono w cookie mchar_id:', value);
                return value;
            }
        }
        
        // Metoda 2: Z URL (jeśli jesteśmy na stronie profilu)
        const urlMatch = window.location.href.match(/profile\/view,(\d+)/);
        if (urlMatch && urlMatch[1]) {
            console.log('✅ Znaleziono w URL:', urlMatch[1]);
            return urlMatch[1];
        }
        
        // Metoda 3: Spróbuj z API gry (jeśli jesteśmy w grze)
        try {
            // Sprawdź czy jesteśmy na stronie gry (ma engine)
            if (typeof Engine !== 'undefined' && Engine.characterList) {
                const chars = Engine.characterList.list;
                if (chars && chars.length > 0) {
                    // Wszystkie postacie mają to samo ID konta w tle
                    console.log('✅ Znaleziono przez Engine.characterList');
                    return `char_${chars[0].id}`;
                }
            }
        } catch (e) {
            console.log('⚠️ Engine.characterList nie dostępny');
        }
        
        // Metoda 4: Spróbuj pobrać przez hs3 token (async)
        try {
            const hs3Match = document.cookie.match(/hs3=([^;]+)/);
            if (hs3Match && hs3Match[1]) {
                console.log('🔄 Próbuję pobrać przez API z hs3...');
                const accountId = await fetchAccountIdFromAPI(hs3Match[1]);
                if (accountId) {
                    return accountId;
                }
            }
        } catch (e) {
            console.log('⚠️ Nie udało się pobrać przez API');
        }
        
        // Metoda 5: Spróbuj znaleźć w localStorage
        try {
            const savedAccountId = SW.GM_getValue(CONFIG.ACCOUNT_ID);
            if (savedAccountId) {
                console.log('✅ Znaleziono zapisane ID konta:', savedAccountId);
                return savedAccountId;
            }
        } catch (e) {
            console.log('⚠️ Nie znaleziono zapisanego ID');
        }
        
        console.log('❌ Nie znaleziono ID konta');
        return null;
    }

    // Funkcja 2: Pobierz ID konta przez API (async)
    async function fetchAccountIdFromAPI(hs3Token) {
        try {
            const response = await fetch(`https://public-api.margonem.pl/account/charlist?hs3=${hs3Token}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                // API zwraca listę postaci - możemy użyć ID pierwszej
                const accountId = data[0].id;
                console.log('✅ Pobrano z API:', accountId);
                return accountId;
            }
        } catch (error) {
            console.error('❌ Błąd przy pobieraniu z API:', error);
        }
        return null;
    }

    // Funkcja 3: Inicjalizacja konta i licencji
    async function initAccountAndLicense() {
        const accountId = await getAccountId();
        if (accountId) {
            console.log('🎮 TWOJE ID KONTA TO:', accountId);
            console.log('💡 Zapisz to ID:', accountId);
            
            // Zapisz do zmiennej globalnej
            userAccountId = accountId;
            
            // Zapisz do storage
            SW.GM_setValue(CONFIG.ACCOUNT_ID, accountId);
            
            // Zaktualizuj wyświetlanie w panelu
            updateAccountDisplay(accountId);
            
            // Sprawdź licencję dla tego konta
            await checkLicenseForAccount(accountId);
        } else {
            console.log('⚠️ Nie udało się znaleźć ID konta');
            updateAccountDisplay('Nie znaleziono');
        }
    }

    // Funkcja 4: Aktualizuj wyświetlanie ID konta w panelu
    function updateAccountDisplay(accountId) {
        const accountEl = document.getElementById('swAccountId');
        if (accountEl) {
            accountEl.textContent = accountId;
            if (accountId && accountId !== 'Nie znaleziono') {
                accountEl.classList.remove('license-status-invalid');
                accountEl.classList.add('license-status-valid');
            } else {
                accountEl.classList.remove('license-status-valid');
                accountEl.classList.add('license-status-invalid');
            }
        }
    }

    // Funkcja 5: Sprawdź licencję dla konta (tymczasowa)
    async function checkLicenseForAccount(accountId) {
        console.log('🔐 Sprawdzam licencję dla konta:', accountId);
        
        // Tymczasowo - ustaw jako aktywną dla testów
        isLicenseVerified = true;
        licenseExpiry = new Date();
        licenseExpiry.setMonth(licenseExpiry.getMonth() + 1); // +1 miesiąc
        
        SW.GM_setValue(CONFIG.LICENSE_ACTIVE, true);
        SW.GM_setValue(CONFIG.LICENSE_EXPIRY, licenseExpiry.toISOString());
        
        updateLicenseDisplay();
        console.log('✅ Licencja tymczasowo aktywowana na 1 miesiąc');
    }

    // =========================================================================
    // 🔹 GŁÓWNE FUNKCJE PANELU
    // =========================================================================

    // 🔹 Funkcja zapobiegająca zmianom rozmiaru
    function preventPanelResize() {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        // Ustaw stałe wymiary
        panel.style.minWidth = '640px';
        panel.style.maxWidth = '640px';
        panel.style.width = '640px';
        panel.style.resize = 'none';
        
        // Obserwuj zmiany w DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Przywróć oryginalne style jeśli zostały zmienione
                    panel.style.minWidth = '640px';
                    panel.style.maxWidth = '640px';
                    panel.style.width = '640px';
                    panel.style.resize = 'none';
                }
            });
        });
        
        observer.observe(panel, { attributes: true, attributeFilter: ['style'] });
        
        // Również obserwuj zmiany w elementach wewnątrz
        const innerObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // Resetuj style po dodaniu nowych elementów
                    document.querySelectorAll('.addon-item').forEach(item => {
                        item.style.minHeight = 'auto';
                        item.style.maxHeight = '50px';
                    });
                }
            });
        });
        
        innerObserver.observe(panel, { childList: true, subtree: true });
    }

    // 🔹 Aktualizacja rozmiaru czcionki dla całego panelu
    function updatePanelFontSize(size) {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        // Usuń wszystkie poprzednie style font-size
        panel.style.cssText = panel.style.cssText.replace(/font-size:[^;]+;/g, '');
        
        // Ustaw nowy rozmiar czcionki z !important
        panel.style.setProperty('font-size', size + 'px', 'important');
        
        // Również ustaw dla wszystkich elementów wewnątrz panelu
        const allElements = panel.querySelectorAll('*');
        allElements.forEach(element => {
            element.style.cssText = element.style.cssText.replace(/font-size:[^;]+;/g, '');
            element.style.setProperty('font-size', size + 'px', 'important');
        });
        
        console.log('📏 Font size updated to:', size + 'px');
    }

    // 🔹 Wstrzyknij CSS
    function injectCSS() {
        // CSS jest już wstrzykiwany przez loader, więc ta funkcja jest pusta
        console.log('✅ CSS already injected by loader');
    }
    // 🔹 Dodaj obsługę scrollowania myszką dla listy dodatków
    function setupMouseWheelScrolling() {
        const addonList = document.getElementById('addon-list');
        if (!addonList) return;
        
        let isScrolling = false;
        
        addonList.addEventListener('wheel', function(e) {
            const isScrollable = this.scrollHeight > this.clientHeight;
            const isAtTop = this.scrollTop === 0;
            const isAtBottom = this.scrollTop + this.clientHeight >= this.scrollHeight - 1;
            
            if (isScrollable) {
                const isScrollingDown = e.deltaY > 0;
                const isScrollingUp = e.deltaY < 0;
                
                if (isAtTop && isScrollingUp) {
                    return;
                }
                if (isAtBottom && isScrollingDown) {
                    return;
                }
                
                e.preventDefault();
                
                if (!isScrolling) {
                    isScrolling = true;
                    
                    requestAnimationFrame(() => {
                        const scrollAmount = e.deltaY * 0.8;
                        this.scrollTop += scrollAmount;
                        
                        setTimeout(() => {
                            isScrolling = false;
                        }, 16);
                    });
                }
            }
        }, { passive: false });
        
        console.log('✅ Enhanced mouse wheel scrolling enabled');
    }

    // 🔹 Główne funkcje
    async function initPanel() {
        console.log('✅ Initializing panel...');
        
        // Wstrzyknij CSS
        injectCSS();
        
        // Ładujemy zapisane ustawienia
        loadAddonsState();
        loadCategoriesState();
        loadSettings();
        
        // Inicjalizuj konto i licencję
        await initAccountAndLicense();
        
        // Tworzymy elementy
        createToggleButton();
        createMainPanel();
        createLicenseModal();
        
        // 🔹 Zapobiegaj zmianom rozmiaru
        preventPanelResize();
        
        // 🔹 Dodaj obsługę scrollowania myszką
        setTimeout(() => {
            setupMouseWheelScrolling();
        }, 500);
        
        // Ładujemy zapisany stan (w tym pozycję przycisku)
        loadSavedState();
        
        // Inicjujemy przeciąganie
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn) {
            setupToggleDrag(toggleBtn);
        }
        
        setupEventListeners();
        setupTabs();
        setupDrag();
        setupKeyboardShortcut();
        
        // 🔹 ZAŁADUJ DODATKI PO WERYFIKACJI LICENCJI
        if (isLicenseVerified) {
            loadEnabledAddons();
        }
    }

    // 🔹 Tworzenie przycisku przełączania
    function createToggleButton() {
        const oldToggle = document.getElementById('swPanelToggle');
        if (oldToggle) oldToggle.remove();
        
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij dwukrotnie - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
        
        toggleBtn.innerHTML = `
            <img src="https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/public/icon.jpg" 
                 alt="SW" 
                 style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
        `;
        
        document.body.appendChild(toggleBtn);
        console.log('✅ Toggle button created');
        
        return toggleBtn;
    }

    // 🔹 Tworzenie głównego panelu
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        panel.innerHTML = `
            <div id="swPanelHeader">
                <strong>SYNERGY WRAITH v2.0</strong>
                <button id="swPanelClose" title="Zamknij panel">×</button>
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
                <button class="tablink" data-tab="license">Licencja</button>
                <button class="tablink" data-tab="shortcuts">Skróty</button>
                <button class="tablink" data-tab="settings">Ustawienia</button>
                <button class="tablink" data-tab="info">Informacje</button>
            </div>

            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div class="search-container">
                        <input type="text" class="search-input" id="searchAddons" placeholder="Szukaj dodatków...">
                    </div>
                    
                    <div class="category-filters">
                        <div class="category-filter-item">
                            <div class="category-filter-label">
                                <span>Włączone</span>
                            </div>
                            <label class="category-switch">
                                <input type="checkbox" id="filter-enabled" checked>
                                <span class="category-slider"></span>
                            </label>
                        </div>
                        <div class="category-filter-item">
                            <div class="category-filter-label">
                                <span>Wyłączone</span>
                            </div>
                            <label class="category-switch">
                                <input type="checkbox" id="filter-disabled" checked>
                                <span class="category-slider"></span>
                            </label>
                        </div>
                        <div class="category-filter-item">
                            <div class="category-filter-label">
                                <span>Ulubione</span>
                            </div>
                            <label class="category-switch">
                                <input type="checkbox" id="filter-favorites" checked>
                                <span class="category-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="addon-list" id="addon-list">
                        <!-- Lista dodatków zostanie dodana dynamicznie -->
                    </div>
                    
                    <div class="refresh-button-container">
                        <button class="refresh-button" id="swRefreshButton">
                            Odśwież
                        </button>
                    </div>
                    
                    <div id="swAddonsMessage" class="license-message" style="display: none;"></div>
                </div>
            </div>

            <div id="license" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="license-container">
                        <div class="license-header">Status Licencji</div>
                        <div class="license-status-item">
                            <span class="license-status-label">ID Konta:</span>
                            <span id="swAccountId" class="license-status-value">Ładowanie...</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Status Licencji:</span>
                            <span id="swLicenseStatus" class="license-status-invalid">Nieaktywna</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Ważna do:</span>
                            <span id="swLicenseExpiry" class="license-status-value">-</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Połączenie:</span>
                            <span id="swServerStatus" class="license-status-connected">Aktywne</span>
                        </div>
                    </div>
                    
                    <div class="license-activation-container">
                        <button class="license-activation-button" id="swActivateLicense">
                            Aktywuj Licencję
                        </button>
                    </div>
                    
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>

            <div id="shortcuts" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="info-container">
                        <div class="info-header">Skróty Klawiszowe</div>
                        <div class="info-section">
                            <div class="shortcuts-list" id="shortcuts-list">
                                <!-- Skróty zostaną dodane dynamicznie -->
                            </div>
                        </div>
                        <div class="info-footer">
                            Skróty są dostępne tylko dla włączonych dodatków
                        </div>
                    </div>
                </div>
            </div>

            <div id="settings" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="settings-item">
                        <div class="font-size-container">
                            <label class="settings-label">Rozmiar czcionki:</label>
                            <input type="range" min="10" max="18" value="12" class="font-size-slider" id="fontSizeSlider">
                            <span class="font-size-value" id="fontSizeValue">12px</span>
                        </div>
                    </div>
                    
                    <div class="settings-item">
                        <div class="background-toggle-container">
                            <span class="background-toggle-label">Widoczność tła panelu</span>
                            <label class="background-toggle">
                                <input type="checkbox" id="backgroundToggle" checked>
                                <span class="background-toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-item">
                        <div class="shortcut-input-container">
                            <span class="shortcut-input-label">Skrót do widgetu:</span>
                            <input type="text" class="shortcut-input" id="shortcutInput" value="Ctrl+A" readonly>
                            <button class="shortcut-set-btn" id="shortcutSetBtn" style="padding: 8px 15px; background: rgba(51, 17, 0, 0.8); border: 1px solid #ff9900; color: #ff9900; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Ustaw skrót</button>
                        </div>
                    </div>
                    
                    <div class="reset-settings-container">
                        <button class="reset-settings-button" id="swResetButton">
                            <span class="reset-settings-icon">↻</span>
                            Resetuj wszystkie ustawienia
                        </button>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top: 10px; padding: 10px; border-radius: 6px; display: none;"></div>
                </div>
            </div>

            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="info-container">
                        <div class="info-header">Historia zmian v2.0</div>
                        
                        <div class="info-patch-notes">
                            ${VERSION_INFO.patchNotes.map(note => `<li>${note}</li>`).join('')}
                        </div>
                        
                        <div class="info-footer">
                            © 2024 Synergy Wraith Panel • Wszelkie prawa zastrzeżone
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        renderAddons();
        updateFilterSwitches();
        renderShortcuts();
        console.log('✅ Panel created');
    }

    // 🔹 Tworzenie modalu licencji
    function createLicenseModal() {
        const modal = document.createElement("div");
        modal.id = "swLicenseModal";
        
        modal.innerHTML = `
            <div class="license-modal-content">
                <button class="license-modal-close" id="swLicenseModalClose">×</button>
                <div class="license-modal-header">Aktywacja Licencji</div>
                <input type="text" class="license-modal-input" id="swLicenseKeyInput" placeholder="Wpisz kod licencji...">
                <div class="license-modal-buttons">
                    <button class="license-modal-button cancel" id="swLicenseModalCancel">Anuluj</button>
                    <button class="license-modal-button activate" id="swLicenseModalActivate">Aktywuj</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('✅ License modal created');
    }

    // 🔹 Update wyświetlania licencji
    function updateLicenseDisplay() {
        const statusEl = document.getElementById('swLicenseStatus');
        const expiryEl = document.getElementById('swLicenseExpiry');
        const serverEl = document.getElementById('swServerStatus');
        
        if (statusEl) {
            statusEl.textContent = isLicenseVerified ? 'Aktywna' : 'Nieaktywna';
            statusEl.className = isLicenseVerified ? 'license-status-valid' : 'license-status-invalid';
        }
        
        if (expiryEl) {
            if (licenseExpiry) {
                const now = new Date();
                const diffTime = licenseExpiry - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                expiryEl.textContent = `${diffDays} dni`;
            } else {
                expiryEl.textContent = '-';
            }
        }
        
        if (serverEl) {
            serverEl.textContent = serverConnected ? 'Aktywne' : 'Brak połączenia';
            serverEl.className = serverConnected ? 'license-status-connected' : 'license-status-disconnected';
        }
    }

    // 🔹 Aktywacja licencji
    function activateLicense(licenseKey) {
        console.log('🔐 Activating license:', licenseKey);
        
        // Symulacja aktywacji licencji
        isLicenseVerified = true;
        licenseExpiry = new Date();
        licenseExpiry.setFullYear(licenseExpiry.getFullYear() + 1);
        
        SW.GM_setValue(CONFIG.LICENSE_KEY, licenseKey);
        SW.GM_setValue(CONFIG.LICENSE_ACTIVE, true);
        SW.GM_setValue(CONFIG.LICENSE_EXPIRY, licenseExpiry.toISOString());
        
        updateLicenseDisplay();
        loadEnabledAddons();
        
        const messageEl = document.getElementById('swLicenseMessage');
        if (messageEl) {
            messageEl.textContent = 'Licencja aktywowana pomyślnie!';
            messageEl.className = 'license-message license-success';
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

    // 🔹 Obsługa przeciągania przycisku
    function setupToggleDrag(toggleBtn) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        let clickCount = 0;
        let clickTimer = null;
        let animationFrame = null;
        
        let currentX = parseInt(toggleBtn.style.left) || 70;
        let currentY = parseInt(toggleBtn.style.top) || 70;
        
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
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                const newLeft = initialLeft + deltaX;
                const newTop = initialTop + deltaY;
                
                const maxX = window.innerWidth - toggleBtn.offsetWidth;
                const maxY = window.innerHeight - toggleBtn.offsetHeight;
                
                currentX = Math.max(0, Math.min(newLeft, maxX));
                currentY = Math.max(0, Math.min(newTop, maxY));
                
                animationFrame = requestAnimationFrame(() => {
                    toggleBtn.style.left = currentX + 'px';
                    toggleBtn.style.top = currentY + 'px';
                });
            }
        }

        function startDragging() {
            isDragging = true;
            
            toggleBtn.style.cursor = 'grabbing';
            toggleBtn.classList.add('dragging');
            
            clickCount = 0;
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
            }
        }

        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mouseleave', onMouseUp);
            
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
            toggleBtn.classList.remove('dragging');
            toggleBtn.classList.add('saved');
            
            SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, {
                left: currentX + 'px',
                top: currentY + 'px'
            });
            
            console.log('💾 Saved button position');
            
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

        // Dodaj nasłuchiwanie kliknięcia
        toggleBtn.addEventListener('click', handleClick);

        console.log('✅ Advanced toggle drag functionality added');
    }

    // 🔹 Setup zakładek
    function setupTabs() {
        const tabs = document.querySelectorAll('.tablink');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const tabName = this.getAttribute('data-tab');
                
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const tabContents = document.querySelectorAll('.tabcontent');
                tabContents.forEach(content => content.classList.remove('active'));
                
                const tabContent = document.getElementById(tabName);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });
        
        console.log('✅ Tabs setup complete');
    }
    // 🔹 Setup przeciągania panelu
    function setupDrag() {
        const header = document.getElementById('swPanelHeader');
        const panel = document.getElementById('swAddonsPanel');
        
        if (!header || !panel) return;
        
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', function(e) {
            if (e.target.closest('.tablink') || e.target.id === 'swPanelClose') return;
            
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

    // 🔹 Setup skrótu klawiszowego
    function setupKeyboardShortcut() {
        // Usuń poprzednie nasłuchiwania
        document.removeEventListener('keydown', handleKeyboardShortcut);
        
        // Dodaj nowe nasłuchiwanie
        document.addEventListener('keydown', handleKeyboardShortcut);
        
        console.log(`✅ Keyboard shortcut setup: ${customShortcut || 'brak'}`);
    }

    // 🔹 Obsługa skrótu klawiszowego
    function handleKeyboardShortcut(e) {
        if (isShortcutInputFocused) return;
        
        const shortcutParts = customShortcut.split('+');
        const hasCtrl = shortcutParts.includes('Ctrl');
        const hasShift = shortcutParts.includes('Shift');
        const key = shortcutParts[shortcutParts.length - 1].toUpperCase();
        
        const ctrlMatch = hasCtrl ? e.ctrlKey : true;
        const shiftMatch = hasShift ? e.shiftKey : true;
        const keyMatch = e.key.toUpperCase() === key;
        
        if (ctrlMatch && shiftMatch && keyMatch) {
            const blockedShortcuts = ['P', 'S', 'O', 'N', 'W', 'T', 'U', 'I'];
            if (hasCtrl && blockedShortcuts.includes(key)) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            const toggleBtn = document.getElementById('swPanelToggle');
            if (toggleBtn) {
                toggleBtn.click();
                toggleBtn.click();
            }
        }
    }

    // 🔹 Ustawianie nowego skrótu klawiszowego
    function setupShortcutInput() {
        const shortcutInput = document.getElementById('shortcutInput');
        const shortcutSetBtn = document.getElementById('shortcutSetBtn');
        
        if (!shortcutInput || !shortcutSetBtn) return;
        
        const savedShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        customShortcut = savedShortcut;
        shortcutInput.value = customShortcut;
        
        shortcutSetBtn.addEventListener('click', function() {
            isShortcutInputFocused = true;
            shortcutInput.style.borderColor = '#ff9900';
            shortcutInput.style.boxShadow = '0 0 10px rgba(255, 153, 0, 0.5)';
            shortcutInput.value = 'Wciśnij kombinację klawiszy...';
            shortcutKeys = [];
            
            const keyDownHandler = function(e) {
                if (e.repeat) return;
                const key = e.key.toUpperCase();
                
                if (e.ctrlKey && !shortcutKeys.includes('Ctrl')) {
                    shortcutKeys.push('Ctrl');
                }
                if (e.shiftKey && !shortcutKeys.includes('Shift')) {
                    shortcutKeys.push('Shift');
                }
                
                if (key.length === 1 && /[A-Z0-9]/.test(key) && !shortcutKeys.includes(key)) {
                    shortcutKeys.push(key);
                }
                
                if (shortcutKeys.length > 0) {
                    shortcutInput.value = shortcutKeys.join('+');
                }
            };
            
            const keyUpHandler = function(e) {
                const key = e.key.toUpperCase();
                
                if (key.length === 1 && /[A-Z0-9]/.test(key)) {
                    if (shortcutKeys.includes('Ctrl') && shortcutKeys.length >= 2) {
                        customShortcut = shortcutKeys.join('+');
                        shortcutInput.value = customShortcut;
                        SW.GM_setValue(CONFIG.CUSTOM_SHORTCUT, customShortcut);
                        setupKeyboardShortcut();
                        
                        document.removeEventListener('keydown', keyDownHandler);
                        document.removeEventListener('keyup', keyUpHandler);
                        isShortcutInputFocused = false;
                        shortcutInput.style.borderColor = '#333';
                        shortcutInput.style.boxShadow = 'none';
                        
                        const messageEl = document.getElementById('swResetMessage');
                        if (messageEl) {
                            messageEl.textContent = `Skrót ustawiony na: ${customShortcut}`;
                            messageEl.style.background = 'rgba(0, 255, 0, 0.1)';
                            messageEl.style.color = '#00ff00';
                            messageEl.style.border = '1px solid #00ff00';
                            messageEl.style.display = 'block';
                            
                            setTimeout(() => {
                                messageEl.style.display = 'none';
                            }, 3000);
                        }
                    } else {
                        shortcutInput.value = 'Musi zawierać Ctrl + klawisz';
                        setTimeout(() => {
                            shortcutInput.value = customShortcut;
                            document.removeEventListener('keydown', keyDownHandler);
                            document.removeEventListener('keyup', keyUpHandler);
                            isShortcutInputFocused = false;
                            shortcutInput.style.borderColor = '#333';
                            shortcutInput.style.boxShadow = 'none';
                        }, 1500);
                    }
                }
                
                if (e.key === 'Escape') {
                    shortcutInput.value = customShortcut;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    isShortcutInputFocused = false;
                    shortcutInput.style.borderColor = '#333';
                    shortcutInput.style.boxShadow = 'none';
                }
            };
            
            document.addEventListener('keydown', keyDownHandler);
            document.addEventListener('keyup', keyUpHandler);
            
            setTimeout(() => {
                if (isShortcutInputFocused) {
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    isShortcutInputFocused = false;
                    shortcutInput.value = customShortcut;
                    shortcutInput.style.borderColor = '#333';
                    shortcutInput.style.boxShadow = 'none';
                }
            }, 10000);
        });
    }

    // 🔹 Setup event listenerów
    function setupEventListeners() {
        // Rozmiar czcionki
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            const savedSize = SW.GM_getValue(CONFIG.FONT_SIZE, '12');
            fontSizeSlider.value = savedSize;
            fontSizeValue.textContent = savedSize + 'px';
            updatePanelFontSize(savedSize);
            
            fontSizeSlider.addEventListener('input', function() {
                const size = this.value;
                fontSizeValue.textContent = size + 'px';
                updatePanelFontSize(size);
                SW.GM_setValue(CONFIG.FONT_SIZE, size);
            });
        }

        // Widoczność tła
        const backgroundToggle = document.getElementById('backgroundToggle');
        if (backgroundToggle) {
            const isVisible = SW.GM_getValue(CONFIG.BACKGROUND_VISIBLE, true);
            backgroundToggle.checked = isVisible;
            updateBackgroundVisibility(isVisible);
            
            backgroundToggle.addEventListener('change', function() {
                const isVisible = this.checked;
                SW.GM_setValue(CONFIG.BACKGROUND_VISIBLE, isVisible);
                updateBackgroundVisibility(isVisible);
            });
        }

        // Skrót klawiszowy
        setupShortcutInput();

        // Przycisk odśwież
        const refreshBtn = document.getElementById('swRefreshButton');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                if (confirm('Czy na pewno chcesz odświeżyć stronę? Wszystkie niezapisane zmiany zostaną utracone.')) {
                    location.reload();
                }
            });
        }

        // Resetowanie ustawień
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) {
                    resetAllSettings();
                }
            });
        }

        // Filtry kategorii
        const filterEnabled = document.getElementById('filter-enabled');
        const filterDisabled = document.getElementById('filter-disabled');
        const filterFavorites = document.getElementById('filter-favorites');
        
        if (filterEnabled) {
            filterEnabled.addEventListener('change', function() {
                activeCategories.enabled = this.checked;
                saveCategoriesState();
                renderAddons();
            });
        }
        
        if (filterDisabled) {
            filterDisabled.addEventListener('change', function() {
                activeCategories.disabled = this.checked;
                saveCategoriesState();
                renderAddons();
            });
        }
        
        if (filterFavorites) {
            filterFavorites.addEventListener('change', function() {
                activeCategories.favorites = this.checked;
                saveCategoriesState();
                renderAddons();
            });
        }

        // Wyszukiwarka
        const searchInput = document.getElementById('searchAddons');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchQuery = this.value.toLowerCase();
                renderAddons();
            });
        }

        // Przycisk zamykania panelu
        const closeBtn = document.getElementById('swPanelClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                togglePanel();
            });
        }

        // Modal licencji
        const activateBtn = document.getElementById('swActivateLicense');
        const modalCloseBtn = document.getElementById('swLicenseModalClose');
        const modalCancelBtn = document.getElementById('swLicenseModalCancel');
        const modalActivateBtn = document.getElementById('swLicenseModalActivate');
        const modal = document.getElementById('swLicenseModal');

        if (activateBtn && modal) {
            activateBtn.addEventListener('click', function() {
                modal.style.display = 'flex';
            });
        }

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        }

        if (modalCancelBtn) {
            modalCancelBtn.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        }

        if (modalActivateBtn) {
            modalActivateBtn.addEventListener('click', function() {
                const licenseKeyInput = document.getElementById('swLicenseKeyInput');
                if (licenseKeyInput && licenseKeyInput.value.trim()) {
                    activateLicense(licenseKeyInput.value.trim());
                    modal.style.display = 'none';
                    licenseKeyInput.value = '';
                } else {
                    alert('Proszę wpisać kod licencji!');
                }
            });
        }

        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // Enter w inpucie modala
        const licenseKeyInput = document.getElementById('swLicenseKeyInput');
        if (licenseKeyInput) {
            licenseKeyInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    modalActivateBtn.click();
                }
            });
        }

        // Delegowane nasłuchiwanie dla dodatków
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('favorite-btn') || e.target.closest('.favorite-btn')) {
                const btn = e.target.classList.contains('favorite-btn') ? e.target : e.target.closest('.favorite-btn');
                const addonId = btn.dataset.id;
                toggleFavorite(addonId);
            }
            
            if (e.target.type === 'checkbox' && e.target.closest('.addon-item')) {
                const addonId = e.target.dataset.id;
                const isEnabled = e.target.checked;
                toggleAddon(addonId, isEnabled);
            }
        });

        console.log('✅ Event listeners setup complete');
    }

    // 🔹 Toggle panelu
    function togglePanel() {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const isVisible = panel.style.display === 'block';
            panel.style.display = isVisible ? 'none' : 'block';
            SW.GM_setValue(CONFIG.PANEL_VISIBLE, !isVisible);
            console.log('🎯 Panel toggled:', !isVisible);
        }
    }

    // 🔹 Renderowanie dodatków z wyszukiwaniem
    function renderAddons() {
        const listContainer = document.getElementById('addon-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        const sortedAddons = [...currentAddons].sort((a, b) => a.name.localeCompare(b.name));
        
        const filteredAddons = sortedAddons.filter(addon => {
            const showEnabled = activeCategories.enabled && addon.enabled;
            const showDisabled = activeCategories.disabled && !addon.enabled;
            const showFavorites = activeCategories.favorites && addon.favorite;
            
            const categoryMatch = showEnabled || showDisabled || showFavorites;
            
            const searchMatch = searchQuery === '' || 
                addon.name.toLowerCase().includes(searchQuery) || 
                addon.description.toLowerCase().includes(searchQuery);
            
            return categoryMatch && searchMatch;
        });
        
        if (filteredAddons.length > 0) {
            filteredAddons.forEach(addon => {
                listContainer.appendChild(createAddonElement(addon));
            });
        } else {
            listContainer.innerHTML = '<div class="addon-list-empty">Brak dodatków spełniających kryteria wyszukiwania</div>';
        }
    }

    // 🔹 Tworzenie elementu dodatku
    function createAddonElement(addon) {
        const div = document.createElement('div');
        div.className = 'addon-item';
        div.dataset.id = addon.id;
        
        if (addon.enabled) div.classList.add('enabled');
        if (addon.favorite) div.classList.add('favorite');
        
        div.innerHTML = `
            <div class="addon-item-header">
                <div class="addon-item-title">
                    ${addon.name}
                </div>
                <div class="addon-item-description">
                    ${addon.description}
                </div>
            </div>
            <div class="addon-item-actions">
                <button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" data-id="${addon.id}" title="${addon.favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}">
                    ★
                </button>
                <label class="switch">
                    <input type="checkbox" ${addon.enabled ? 'checked' : ''} data-id="${addon.id}">
                    <span class="slider"></span>
                </label>
            </div>
        `;
        
        return div;
    }

    // 🔹 Renderowanie skrótów
    function renderShortcuts() {
        const shortcutsList = document.getElementById('shortcuts-list');
        if (!shortcutsList) return;
        
        shortcutsList.innerHTML = '';
        
        DEFAULT_SHORTCUTS.forEach(shortcut => {
            const addon = currentAddons.find(a => a.id === shortcut.addonId);
            if (addon && addon.enabled) {
                const shortcutItem = document.createElement('div');
                shortcutItem.className = 'shortcut-item';
                
                shortcutItem.innerHTML = `
                    <div class="shortcut-info">
                        <div class="shortcut-name">${addon.name}</div>
                        <div class="shortcut-description">${shortcut.description}</div>
                    </div>
                    <div class="shortcut-key">${shortcut.shortcut}</div>
                `;
                
                shortcutsList.appendChild(shortcutItem);
            }
        });
        
        if (shortcutsList.children.length === 0) {
            shortcutsList.innerHTML = '<div class="addon-list-empty">Brak aktywnych skrótów. Włącz dodatki aby zobaczyć ich skróty.</div>';
        }
    }

    // 🔹 Toggle ulubionych
    function toggleFavorite(addonId) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        
        currentAddons[addonIndex].favorite = !currentAddons[addonIndex].favorite;
        
        const favoriteIds = currentAddons
            .filter(a => a.favorite)
            .map(a => a.id);
        SW.GM_setValue(CONFIG.FAVORITE_ADDONS, favoriteIds);
        
        renderAddons();
        console.log(`⭐ Toggle favorite for ${addonId}`);
    }

    // 🔹 Toggle dodatków
    function toggleAddon(addonId, isEnabled) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        
        currentAddons[addonIndex].enabled = isEnabled;
        
        if (addonId === 'kcs-icons') {
            SW.GM_setValue(CONFIG.KCS_ICONS_ENABLED, isEnabled);
            
            const message = isEnabled ? 
                'KCS Icons włączony. Odśwież grę, aby zmiana została zastosowana.' : 
                'KCS Icons wyłączony. Odśwież grę, aby zmiana została zastosowana.';
            
            const messageEl = document.getElementById('swAddonsMessage');
            if (messageEl) {
                messageEl.textContent = message;
                messageEl.className = 'license-message license-info';
                messageEl.style.display = 'block';
                
                setTimeout(() => {
                    messageEl.style.display = 'none';
                }, 5000);
            }
            
            console.log('💾 KCS Icons ' + (isEnabled ? 'włączony' : 'wyłączony'));
            
            if (isLicenseVerified && isEnabled) {
                setTimeout(initKCSIcons, 100);
            }
        }
        
        renderAddons();
        renderShortcuts();
        console.log(`🔧 Toggle ${addonId}: ${isEnabled ? 'enabled' : 'disabled'}`);
    }

    // 🔹 Reset wszystkich ustawień
    function resetAllSettings() {
        SW.GM_deleteValue(CONFIG.PANEL_POSITION);
        SW.GM_deleteValue(CONFIG.PANEL_VISIBLE);
        SW.GM_deleteValue(CONFIG.TOGGLE_BTN_POSITION);
        SW.GM_deleteValue(CONFIG.FONT_SIZE);
        SW.GM_deleteValue(CONFIG.BACKGROUND_VISIBLE);
        SW.GM_deleteValue(CONFIG.KCS_ICONS_ENABLED);
        SW.GM_deleteValue(CONFIG.FAVORITE_ADDONS);
        SW.GM_deleteValue(CONFIG.ACTIVE_CATEGORIES);
        SW.GM_deleteValue(CONFIG.CUSTOM_SHORTCUT);
        SW.GM_deleteValue(CONFIG.ACCOUNT_ID);
        
        currentAddons = ADDONS.map(addon => ({
            ...addon,
            enabled: addon.id === 'kcs-icons' ? true : false,
            favorite: false
        }));
        
        activeCategories = {
            enabled: true,
            disabled: true,
            favorites: true
        };
        
        customShortcut = 'Ctrl+A';
        searchQuery = '';
        userAccountId = null;
        isLicenseVerified = false;
        
        const resetMessage = document.getElementById('swResetMessage');
        if (resetMessage) {
            resetMessage.textContent = 'Ustawienia zresetowane!';
            resetMessage.style.background = 'rgba(255, 102, 0, 0.1)';
            resetMessage.style.color = '#ff6600';
            resetMessage.style.border = '1px solid #ff6600';
            resetMessage.style.display = 'block';
            
            setTimeout(() => {
                resetMessage.style.display = 'none';
            }, 5000);
        }
        
        loadSavedState();
        updateFilterSwitches();
        renderAddons();
        renderShortcuts();
        updateAccountDisplay('Nie znaleziono');
        updateLicenseDisplay();
        
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.value = '12';
            fontSizeValue.textContent = '12px';
            updatePanelFontSize('12');
        }
        
        const backgroundToggle = document.getElementById('backgroundToggle');
        if (backgroundToggle) {
            backgroundToggle.checked = true;
            updateBackgroundVisibility(true);
        }
        
        const shortcutInput = document.getElementById('shortcutInput');
        if (shortcutInput) {
            shortcutInput.value = 'Ctrl+A';
        }
        
        const searchInput = document.getElementById('searchAddons');
        if (searchInput) {
            searchInput.value = '';
        }
        
        setupKeyboardShortcut();
        setupShortcutInput();
    }

    // 🔹 Update widoczności tła
    function updateBackgroundVisibility(isVisible) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            if (isVisible) {
                panel.classList.remove('transparent-background');
            } else {
                panel.classList.add('transparent-background');
            }
        }
    }

    // 🔹 Ładowanie zapisanego stanu
    function loadSavedState() {
        if (!SW || !SW.GM_getValue) return;
        
        const savedBtnPosition = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn && savedBtnPosition) {
            toggleBtn.style.left = savedBtnPosition.left;
            toggleBtn.style.top = savedBtnPosition.top;
        } else if (toggleBtn) {
            toggleBtn.style.left = '70px';
            toggleBtn.style.top = '70px';
        }
        
        const savedPosition = SW.GM_getValue(CONFIG.PANEL_POSITION);
        const panel = document.getElementById('swAddonsPanel');
        if (panel && savedPosition) {
            panel.style.left = savedPosition.left;
            panel.style.top = savedPosition.top;
        } else if (panel) {
            panel.style.left = '70px';
            panel.style.top = '140px';
        }
        
        const isVisible = SW.GM_getValue(CONFIG.PANEL_VISIBLE, false);
        if (panel) {
            panel.style.display = isVisible ? 'block' : 'none';
        }
        
        const savedSize = SW.GM_getValue(CONFIG.FONT_SIZE, '12');
        updatePanelFontSize(savedSize);
        
        console.log('✅ Saved state loaded');
    }

    // 🔹 Ładowanie stanu dodatków
    function loadAddonsState() {
        const favoriteIds = SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []);
        const kcsEnabled = SW.GM_getValue(CONFIG.KCS_ICONS_ENABLED, true);
        
        currentAddons = ADDONS.map(addon => ({
            ...addon,
            enabled: addon.id === 'kcs-icons' ? kcsEnabled : false,
            favorite: favoriteIds.includes(addon.id)
        }));
        
        console.log('✅ Addons state loaded');
    }

    // 🔹 Ładowanie kategorii
    function loadCategoriesState() {
        const savedCategories = SW.GM_getValue(CONFIG.ACTIVE_CATEGORIES, {
            enabled: true,
            disabled: true,
            favorites: true
        });
        
        activeCategories = { ...savedCategories };
        console.log('✅ Categories state loaded');
    }

    // 🔹 Zapisywanie kategorii
    function saveCategoriesState() {
        SW.GM_setValue(CONFIG.ACTIVE_CATEGORIES, activeCategories);
        console.log('💾 Categories saved');
    }

    // 🔹 Update przełączników filtrów
    function updateFilterSwitches() {
        const enabledFilter = document.getElementById('filter-enabled');
        const disabledFilter = document.getElementById('filter-disabled');
        const favoritesFilter = document.getElementById('filter-favorites');
        
        if (enabledFilter) enabledFilter.checked = activeCategories.enabled;
        if (disabledFilter) disabledFilter.checked = activeCategories.disabled;
        if (favoritesFilter) favoritesFilter.checked = activeCategories.favorites;
    }

    // 🔹 Ładowanie ustawień
    function loadSettings() {
        customShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        console.log('✅ Settings loaded, shortcut:', customShortcut);
    }

    // 🔹 Ładowanie włączonych dodatków
    function loadEnabledAddons() {
        console.log('🔓 Ładowanie dodatków...');
        
        if (!isLicenseVerified) {
            console.log('⏩ Licencja niezweryfikowana, pomijam ładowanie dodatków');
            return;
        }
        
        const kcsAddon = currentAddons.find(a => a.id === 'kcs-icons');
        if (kcsAddon && kcsAddon.enabled) {
            console.log('✅ KCS Icons włączony, uruchamiam dodatek...');
            setTimeout(initKCSIcons, 100);
        } else {
            console.log('⏩ KCS Icons jest wyłączony, pomijam ładowanie');
        }
    }

    // 🔹 Inicjalizacja KCS Icons (przykładowa funkcja)
    function initKCSIcons() {
        console.log('🔄 Initializing KCS Icons addon...');
        // Tutaj prawdziwa logika inicjalizacji dodatku
    }

    // 🔹 Start panelu
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