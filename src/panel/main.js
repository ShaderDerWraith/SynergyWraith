// synergy.js - Główny kod panelu z systemem ID konta (ORYGINALNY WYGLĄD)
(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded v2.2');

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
        version: "2.2",
        releaseDate: "2024-01-15",
        patchNotes: [
            "Przywrócono oryginalny wygląd panelu",
            "Dodano automatyczne wykrywanie ID konta",
            "Poprawiono strukturę repozytorium",
            "Nowy system licencji w przygotowaniu",
            "Ulepszone wykrywanie konta z API gry"
        ]
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
    // 🔹 GŁÓWNE FUNKCJE PANELU - ORYGINALNY WYGLĄD
    // =========================================================================

    // 🔹 Wstrzyknij CSS - ORYGINALNY WYGLĄD
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
/* 🔹 BASE STYLES 🔹 */
#swPanelToggle {
    position: fixed;
    top: 70px;
    left: 70px;
    width: 50px;
    height: 50px;
    background: transparent;
    border: 3px solid #00ff00;
    border-radius: 50%;
    cursor: grab;
    z-index: 1000000;
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.9);
    color: white;
    font-weight: bold;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-shadow: 0 0 5px black;
    transition: all 0.2s ease;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    overflow: hidden;
}

#swPanelToggle.dragging {
    cursor: grabbing;
    transform: scale(1.15);
    box-shadow: 0 0 30px rgba(255, 50, 50, 1.2);
    border: 3px solid #ffff00;
    z-index: 1000001;
}

#swPanelToggle:hover:not(.dragging) {
    transform: scale(1.08);
    box-shadow: 0 0 25px rgba(255, 30, 30, 1);
    cursor: grab;
}

#swPanelToggle:active:not(.dragging) {
    transform: scale(1.05);
    transition: transform 0.1s ease;
}

/* Save indication animation */
@keyframes savePulse {
    0% { 
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.9);
        border-color: #00ff00;
    }
    50% { 
        box-shadow: 0 0 35px rgba(0, 255, 0, 1.2);
        border-color: #00ff00;
        transform: scale(1.05);
    }
    100% { 
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.9);
        border-color: #00ff00;
    }
}

#swPanelToggle.saved {
    animation: savePulse 1.5s ease-in-out;
}

/* Prevent text selection during drag */
#swPanelToggle.dragging::selection {
    background: transparent;
}

#swPanelToggle.dragging::-moz-selection {
    background: transparent;
}

/* 🔹 MAIN PANEL - ORYGINALNY WYGLĄD 🔹 */
#swAddonsPanel {
    position: fixed;
    top: 140px;
    left: 70px;
    width: 640px;
    min-height: 580px;
    background: linear-gradient(135deg, #0a0a0a, #121212);
    border: 3px solid #00ff00;
    border-radius: 10px;
    color: #ffffff;
    z-index: 999999;
    box-shadow: 0 0 30px rgba(255, 0, 0, 0.6), inset 0 0 20px rgba(0, 255, 0, 0.1);
    backdrop-filter: blur(10px);
    display: none;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    overflow: hidden;
    resize: both;
    min-width: 640px;
    max-width: 900px;
}

/* Neonowy efekt na krawędziach */
#swAddonsPanel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    padding: 2px;
    background: linear-gradient(45deg, #00ff00, #ff0000, #00ff00);
    -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: -1;
}

#swPanelHeader {
    background: linear-gradient(to right, #1a1a1a, #222222);
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid #00ff00;
    cursor: grab;
    position: relative;
    overflow: hidden;
    font-size: 18px;
    font-weight: bold;
    color: #00ff00;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

#swPanelHeader::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.1), transparent);
    animation: shine 3s infinite;
}

@keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
}

.sw-tab-content {
    padding: 15px;
    background: rgba(10, 10, 10, 0.9);
    height: calc(100% - 120px);
    overflow-y: auto;
}

/* 🔹 TABS STYLES - ORYGINALNY 🔹 */
.tab-container {
    display: flex;
    background: linear-gradient(to bottom, #1a1a1a, #151515);
    border-bottom: 1px solid #00ff00;
    padding: 0 5px;
}

.tablink {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 12px 5px;
    margin: 0 2px;
    transition: all 0.2s ease;
    color: #aaaaaa;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid transparent;
    position: relative;
    overflow: hidden;
}

.tablink::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: #00ff00;
    transition: width 0.3s ease;
}

.tablink:hover::before {
    width: 80%;
}

.tablink.active {
    color: #00ff00;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.tablink.active::before {
    width: 100%;
    background: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
}

.tablink:hover:not(.active) {
    color: #00ff00;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

/* 🔹 TAB CONTENT 🔹 */
.tabcontent {
    display: none;
    height: calc(100% - 50px);
    animation: fadeEffect 0.3s ease;
}

.tabcontent.active {
    display: block;
}

@keyframes fadeEffect {
    from { 
        opacity: 0; 
        transform: translateY(5px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
}

/* 🔹 ADDONS LIST - ORYGINALNY 🔹 */
.addon {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 10px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.addon:hover {
    background: rgba(40, 40, 40, 0.9);
    border-color: #00ff00;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 0, 0.1);
}

.addon-header {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.addon-title {
    font-weight: 600;
    color: #00ff00;
    font-size: 14px;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
    margin-bottom: 5px;
}

.addon-description {
    color: #aaaaaa;
    font-size: 12px;
    line-height: 1.4;
}

.addon-controls {
    display: flex;
    align-items: center;
    gap: 15px;
}

/* 🔹 FAVORITE STAR 🔹 */
.favorite-btn {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    padding: 5px;
    font-size: 18px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    width: 24px;
    height: 24px;
}

.favorite-btn:hover {
    color: #ffaa00;
    transform: scale(1.2);
}

.favorite-btn.favorite {
    color: #ffaa00;
    text-shadow: 0 0 8px rgba(255, 170, 0, 0.7);
}

/* 🔹 SWITCH STYLE - ORYGINALNY 🔹 */
.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #333;
    transition: .3s;
    border-radius: 24px;
    border: 1px solid #555;
}

.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: #00ff00;
    transition: .3s;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

input:checked + .slider {
    background-color: #003300;
    border-color: #00ff00;
}

input:checked + .slider:before {
    transform: translateX(26px);
    background-color: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
}

/* 🔹 LICENSE SYSTEM - ORYGINALNY 🔹 */
.license-container {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
}

.license-header {
    color: #00ff00;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
    text-align: center;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.license-status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 14px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(51, 51, 51, 0.5);
}

.license-status-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.license-status-label {
    color: #00ff00;
    font-weight: 600;
}

.license-status-value {
    font-weight: 600;
    text-align: right;
    max-width: 60%;
    word-break: break-all;
    font-size: 13px;
}

.license-status-valid {
    color: #00ff00 !important;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.license-status-invalid {
    color: #ff0000 !important;
    text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

.license-status-connected {
    color: #00ff00 !important;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.license-status-disconnected {
    color: #ff0000 !important;
    text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

/* 🔹 LICENSE BUTTON 🔹 */
.license-activation-container {
    text-align: center;
    margin-top: 20px;
}

.license-activation-button {
    padding: 12px 40px;
    background: linear-gradient(to right, #003300, #006600);
    color: #00ff00;
    border: 1px solid #00ff00;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    min-width: 200px;
}

.license-activation-button:hover {
    background: linear-gradient(to right, #006600, #009900);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 0, 0.3);
}

/* 🔹 MODAL AKTYWACJI LICENCJI 🔹 */
#swLicenseModal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000003;
    justify-content: center;
    align-items: center;
}

.license-modal-content {
    background: linear-gradient(135deg, #0a0a0a, #121212);
    width: 400px;
    border: 2px solid #00ff00;
    border-radius: 8px;
    padding: 25px 35px;
    position: relative;
}

.license-modal-header {
    color: #00ff00;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.license-modal-input {
    width: 100%;
    padding: 12px;
    margin: 12px 0;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    color: #00ff00;
    font-size: 13px;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.license-modal-input:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
    background: rgba(40, 40, 40, 0.9);
}

.license-modal-buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    padding: 0 15px;
}

.license-modal-button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.3s ease;
    text-transform: uppercase;
}

.license-modal-button.activate {
    background: linear-gradient(to right, #003300, #006600);
    color: #00ff00;
    border: 1px solid #00ff00;
}

.license-modal-button.activate:hover {
    background: linear-gradient(to right, #006600, #009900);
    color: #ffffff;
}

.license-modal-button.cancel {
    background: rgba(30, 30, 30, 0.8);
    color: #888;
    border: 1px solid #333;
}

.license-modal-button.cancel:hover {
    background: rgba(40, 40, 40, 0.9);
    color: #ffffff;
}

.license-modal-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: #00ff00;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.license-modal-close:hover {
    color: #ffffff;
    transform: scale(1.1);
}

/* 🔹 SETTINGS TAB - ORYGINALNY 🔹 */
.settings-item {
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.settings-item:hover {
    border-color: #00ff00;
    background: rgba(40, 40, 40, 0.9);
}

.settings-label {
    display: block;
    color: #00ff00;
    font-size: 13px;
    margin-bottom: 10px;
    font-weight: 600;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

/* 🔹 ROZMIAR CZCIONKI - ORYGINALNY 🔹 */
.font-size-container {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
}

.font-size-slider {
    flex: 1;
    -webkit-appearance: none;
    height: 8px;
    background: #333;
    border-radius: 4px;
    outline: none;
    margin: 0 15px;
}

.font-size-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    background: #00ff00;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
    transition: all 0.3s ease;
}

.font-size-slider::-webkit-slider-thumb:hover {
    background: #00cc00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
    transform: scale(1.1);
}

.font-size-value {
    color: #00ff00;
    font-weight: bold;
    font-size: 14px;
    min-width: 40px;
    text-align: center;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

/* 🔹 WIDOCZNOŚĆ TŁA - ORYGINALNY 🔹 */
.background-toggle-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    padding: 0 10px;
}

.background-toggle-label {
    color: #00ff00;
    font-size: 13px;
    font-weight: 600;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.background-toggle {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
}

.background-toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.background-toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #333;
    transition: .3s;
    border-radius: 30px;
    border: 1px solid #555;
}

.background-toggle-slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: #00ff00;
    transition: .3s;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.background-toggle input:checked + .background-toggle-slider {
    background-color: #003300;
    border-color: #00ff00;
}

.background-toggle input:checked + .background-toggle-slider:before {
    transform: translateX(30px);
    background-color: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
}

/* 🔹 SKRÓT KLAWISZOWY - ORYGINALNY 🔹 */
.shortcut-input-container {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    padding: 0 10px;
}

.shortcut-input-label {
    color: #00ff00;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
}

.shortcut-input {
    flex: 1;
    padding: 10px 15px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    color: #00ff00;
    font-size: 13px;
    text-align: center;
    width: 120px;
    transition: all 0.3s ease;
    font-weight: bold;
    letter-spacing: 1px;
}

.shortcut-input:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    background: rgba(40, 40, 40, 0.9);
}

.shortcut-set-btn {
    padding: 10px 20px;
    background: rgba(51, 17, 0, 0.8);
    border: 1px solid #00ff00;
    color: #00ff00;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.shortcut-set-btn:hover {
    background: rgba(0, 100, 0, 0.8);
    color: #ffffff;
}

/* 🔹 PRZYCISK RESETUJ USTAWIENIA 🔹 */
.reset-settings-container {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid #333;
}

.reset-settings-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 14px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    color: #ff0000;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
}

.reset-settings-button:hover {
    background: rgba(50, 30, 30, 0.9);
    border-color: #ff0000;
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3);
}

.reset-settings-button:active {
    transform: translateY(0);
}

.reset-settings-icon {
    color: #ff0000;
    font-size: 16px;
    transition: all 0.3s ease;
}

.reset-settings-button:hover .reset-settings-icon {
    transform: rotate(180deg);
    color: #ffffff;
}

/* 🔹 INFO TAB - ORYGINALNY 🔹 */
.info-container {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 8px;
    padding: 25px;
}

.info-header {
    color: #00ff00;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
    text-align: center;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.info-patch-notes {
    list-style: none;
    padding: 0;
    margin: 0;
}

.info-patch-notes li {
    color: #ccc;
    font-size: 13px;
    margin-bottom: 10px;
    padding-left: 0;
    position: relative;
    line-height: 1.5;
    text-align: left;
    display: flex;
    align-items: flex-start;
}

.info-patch-notes li:before {
    content: "•";
    color: #00ff00;
    font-size: 18px;
    font-weight: bold;
    margin-right: 10px;
    flex-shrink: 0;
    margin-top: 0;
    display: inline-block;
    line-height: 1.5;
}

.info-footer {
    color: #666;
    font-size: 12px;
    text-align: center;
    margin-top: 25px;
    padding-top: 15px;
    border-top: 1px solid #333;
    font-style: italic;
}

/* 🔹 LICENSE MESSAGE 🔹 */
.license-message {
    margin-top: 15px;
    padding: 12px;
    border-radius: 6px;
    font-size: 13px;
    text-align: center;
    border: 1px solid;
}

.license-success {
    background: rgba(0, 100, 0, 0.2);
    color: #00ff00;
    border-color: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.license-error {
    background: rgba(100, 0, 0, 0.2);
    color: #ff0000;
    border-color: #ff0000;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
}

.license-info {
    background: rgba(0, 50, 100, 0.2);
    color: #00aaff;
    border-color: #00aaff;
    box-shadow: 0 0 10px rgba(0, 170, 255, 0.3);
}

/* 🔹 SEARCH BAR - ORYGINALNY 🔹 */
.search-container {
    margin-bottom: 20px;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 12px 20px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    color: #00ff00;
    font-size: 14px;
    transition: all 0.3s ease;
    box-sizing: border-box;
    text-align: center;
}

.search-input:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
    background: rgba(40, 40, 40, 0.9);
}

.search-input::placeholder {
    color: #666;
    font-size: 13px;
    text-align: center;
}

/* 🔹 CATEGORY FILTERS - ORYGINALNY 🔹 */
.category-filters {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 20px;
    background: rgba(20, 20, 20, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    padding: 15px;
}

.category-filter-item {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 8px 15px;
    background: rgba(30, 30, 30, 0.6);
    border-radius: 4px;
    transition: all 0.3s ease;
    gap: 12px;
}

.category-filter-item:hover {
    background: rgba(40, 40, 40, 0.8);
    transform: translateY(-2px);
}

.category-filter-label {
    display: flex;
    align-items: center;
    color: #00ff00;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
}

.category-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    flex-shrink: 0;
}

.category-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.category-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #333;
    transition: .3s;
    border-radius: 20px;
    border: 1px solid #555;
}

.category-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: #00ff00;
    transition: .3s;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(0, 255, 0, 0.5);
}

.category-switch input:checked + .category-slider {
    background-color: #003300;
    border-color: #00ff00;
}

.category-switch input:checked + .category-slider:before {
    transform: translateX(20px);
    background-color: #00ff00;
    box-shadow: 0 0 6px rgba(0, 255, 0, 0.8);
}

/* 🔹 ADDON LIST CONTAINER 🔹 */
.addon-list {
    max-height: 350px;
    overflow-y: auto;
    margin-bottom: 20px;
}

.addon-list-empty {
    text-align: center;
    color: #666;
    font-size: 13px;
    padding: 30px 10px;
    font-style: italic;
    background: rgba(30, 30, 30, 0.5);
    border-radius: 6px;
    margin: 10px 0;
}

/* 🔹 REFRESH BUTTON 🔹 */
.refresh-button-container {
    text-align: center;
    margin-top: 15px;
    padding: 15px;
    border-top: 1px solid #333;
}

.refresh-button {
    padding: 12px 40px;
    background: linear-gradient(to right, #003300, #006600);
    color: #00ff00;
    border: 1px solid #00ff00;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    min-width: 180px;
}

.refresh-button:hover {
    background: linear-gradient(to right, #006600, #009900);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 0, 0.3);
}

/* 🔹 SHORTCUTS TAB STYLES 🔹 */
.shortcuts-container {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 8px;
    padding: 25px;
}

.shortcuts-header {
    color: #00ff00;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
    text-align: center;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    background: rgba(40, 40, 40, 0.6);
    border: 1px solid #333;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.shortcut-item:hover {
    border-color: #00ff00;
    background: rgba(50, 50, 50, 0.8);
    transform: translateY(-2px);
}

.shortcut-key {
    color: #00ff00;
    font-weight: bold;
    font-size: 14px;
    padding: 8px 12px;
    background: rgba(0, 50, 0, 0.3);
    border-radius: 4px;
    border: 1px solid #00ff00;
    min-width: 120px;
    text-align: center;
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.shortcut-description {
    color: #ccc;
    font-size: 14px;
    flex-grow: 1;
    margin-left: 20px;
}

/* 🔹 SCROLLBAR STYLES 🔹 */
.sw-tab-content::-webkit-scrollbar,
.addon-list::-webkit-scrollbar {
    width: 10px;
}

.sw-tab-content::-webkit-scrollbar-track,
.addon-list::-webkit-scrollbar-track {
    background: rgba(20, 20, 20, 0.8);
    border-radius: 5px;
}

.sw-tab-content::-webkit-scrollbar-thumb,
.addon-list::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #00ff00, #006600);
    border-radius: 5px;
    border: 2px solid rgba(20, 20, 20, 0.8);
}

.sw-tab-content::-webkit-scrollbar-thumb:hover,
.addon-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #00ff00, #009900);
}

/* 🔹 RESPONSYWNOŚĆ 🔹 */
@media (max-width: 700px) {
    #swAddonsPanel {
        width: 500px;
        min-width: 500px;
        left: 10px;
    }
    
    .category-filters {
        flex-direction: column;
        gap: 10px;
    }
    
    .category-filter-item {
        width: 100%;
    }
    
    .tablink {
        padding: 10px 3px;
        font-size: 11px;
    }
    
    .license-modal-content {
        width: 90%;
        max-width: 350px;
    }
}

/* 🔹 PANEL RESIZE HANDLE 🔹 */
#swAddonsPanel::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 15px;
    height: 15px;
    background: linear-gradient(135deg, transparent 50%, #00ff00 50%);
    cursor: nwse-resize;
    opacity: 0.5;
    transition: opacity 0.3s ease;
}

#swAddonsPanel:hover::after {
    opacity: 1;
}
        `;
        document.head.appendChild(style);
        console.log('✅ CSS injected (original look)');
    }

    // 🔹 Główne funkcje
    async function initPanel() {
        console.log('✅ Initializing panel (original look)...');
        
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
        
        // Ładujemy zapisany stan
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

    // 🔹 Tworzenie głównego panelu - ORYGINALNY WYGLĄD
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        panel.innerHTML = `
            <div id="swPanelHeader">
                <strong>SYNERGY</strong>
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
                <button class="tablink" data-tab="license">Licencja</button>
                <button class="tablink" data-tab="settings">Ustawienia</button>
                <button class="tablink" data-tab="shortcuts">Skróty klawiszowe</button>
                <button class="tablink" data-tab="info">Informacje</button>
            </div>

            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div class="search-container">
                        <input type="text" class="search-input" id="searchAddons" placeholder="Wyszukaj dodatki...">
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
                            Odśwież Panel
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

            <div id="settings" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="settings-item">
                        <div class="font-size-container">
                            <label class="settings-label">Rozmiar czcionki panelu:</label>
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
                            <span class="shortcut-input-label">Skrót klawiszowy do panelu:</span>
                            <input type="text" class="shortcut-input" id="shortcutInput" value="Ctrl+A" readonly>
                            <button class="shortcut-set-btn" id="shortcutSetBtn">Ustaw skrót</button>
                        </div>
                    </div>
                    
                    <div class="reset-settings-container">
                        <button class="reset-settings-button" id="swResetButton">
                            <span class="reset-settings-icon">↻</span>
                            Resetuj wszystkie ustawienia
                        </button>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top: 15px; padding: 12px; border-radius: 6px; display: none;"></div>
                </div>
            </div>

            <div id="shortcuts" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="shortcuts-container">
                        <div class="shortcuts-header">Skróty klawiszowe</div>
                        <div class="shortcuts-list">
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + A</span>
                                <span class="shortcut-description">Otwórz/ukryj panel Synergy</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">ESC</span>
                                <span class="shortcut-description">Zamknij panel</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">F5</span>
                                <span class="shortcut-description">Odśwież panel</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + F</span>
                                <span class="shortcut-description">Wyszukaj dodatki</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + S</span>
                                <span class="shortcut-description">Zapisz ustawienia</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + R</span>
                                <span class="shortcut-description">Resetuj ustawienia</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="info-container">
                        <div class="info-header">Historia zmian v${VERSION_INFO.version}</div>
                        
                        <div class="info-patch-notes">
                            ${VERSION_INFO.patchNotes.map(note => `<li>${note}</li>`).join('')}
                        </div>
                        
                        <div class="info-footer">
                            © 2024 Synergy Panel • Wszelkie prawa zastrzeżone
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        renderAddons();
        updateFilterSwitches();
        console.log('✅ Panel created (original look)');
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
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
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
        document.removeEventListener('keydown', handleKeyboardShortcut);
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
            shortcutInput.style.borderColor = '#00ff00';
            shortcutInput.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
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
            
            if (e.target.type === 'checkbox' && e.target.closest('.addon')) {
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

    // 🔹 Renderowanie dodatków - ORYGINALNY
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
                const div = document.createElement('div');
                div.className = 'addon';
                div.dataset.id = addon.id;
                
                if (addon.enabled) div.classList.add('enabled');
                if (addon.favorite) div.classList.add('favorite');
                
                div.innerHTML = `
                    <div class="addon-header">
                        <div class="addon-title">${addon.name}</div>
                        <div class="addon-description">${addon.description}</div>
                    </div>
                    <div class="addon-controls">
                        <button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" data-id="${addon.id}" title="${addon.favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}">
                            ★
                        </button>
                        <label class="switch">
                            <input type="checkbox" ${addon.enabled ? 'checked' : ''} data-id="${addon.id}">
                            <span class="slider"></span>
                        </label>
                    </div>
                `;
                
                listContainer.appendChild(div);
            });
        } else {
            listContainer.innerHTML = '<div class="addon-list-empty">Brak dodatków spełniających kryteria wyszukiwania</div>';
        }
    }

    // 🔹 Aktualizacja rozmiaru czcionki
    function updatePanelFontSize(size) {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        panel.style.cssText = panel.style.cssText.replace(/font-size:[^;]+;/g, '');
        panel.style.setProperty('font-size', size + 'px', 'important');
        
        const allElements = panel.querySelectorAll('*');
        allElements.forEach(element => {
            element.style.cssText = element.style.cssText.replace(/font-size:[^;]+;/g, '');
            element.style.setProperty('font-size', size + 'px', 'important');
        });
        
        console.log('📏 Font size updated to:', size + 'px');
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

    // 🔹 Inicjalizacja KCS Icons
    function initKCSIcons() {
        console.log('🔄 Initializing KCS Icons addon...');
        // Logika dodatku
    }

    // 🔹 Start panelu
    console.log('🎯 Waiting for DOM to load...');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('✅ DOM loaded, initializing panel...');
            initPanel();
            console.log('✅ Synergy panel ready!');
        });
    } else {
        console.log('✅ DOM already loaded, initializing panel...');
        initPanel();
        console.log('✅ Synergy panel ready!');
    }
})();