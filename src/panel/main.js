// synergy.js - Główny kod panelu z wykrywaniem ID konta (ORYGINALNY WYGLĄD)
(function() {
    'use strict';

    console.log('🚀 SynergyWraith Panel loaded');

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
    // 🔹 FUNKCJE DO POBRANIA ID KONTA (JEDYNA NOWA FUNKCJONALNOŚĆ)
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
    }

    // Funkcja 2: Pobierz ID konta przez API (async)
    async function fetchAccountIdFromAPI(hs3Token) {
        try {
            const response = await fetch(`https://public-api.margonem.pl/account/charlist?hs3=${hs3Token}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
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
            
            userAccountId = accountId;
            SW.GM_setValue(CONFIG.ACCOUNT_ID, accountId);
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
        
        isLicenseVerified = true;
        licenseExpiry = new Date();
        licenseExpiry.setMonth(licenseExpiry.getMonth() + 1);
        
        SW.GM_setValue(CONFIG.LICENSE_ACTIVE, true);
        SW.GM_setValue(CONFIG.LICENSE_EXPIRY, licenseExpiry.toISOString());
        
        updateLicenseDisplay();
        console.log('✅ Licencja tymczasowo aktywowana na 1 miesiąc');
    }

    // =========================================================================
    // 🔹 ORYGINALNE FUNKCJE PANELU (NIE ZMIENIONE)
    // =========================================================================

    // 🔹 Wstrzyknij CSS
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
    width: 700px;
    height: 500px;
    background: linear-gradient(135deg, #0a0a0a, #121212);
    border: 3px solid #00ff00;
    border-radius: 15px;
    color: #ffffff;
    z-index: 999999;
    box-shadow: 0 0 40px rgba(255, 0, 0, 0.8), inset 0 0 30px rgba(0, 255, 0, 0.2);
    backdrop-filter: blur(15px);
    display: none;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    overflow: hidden;
    resize: both;
}

/* Neonowy efekt na krawędziach */
#swAddonsPanel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    padding: 3px;
    background: linear-gradient(45deg, #00ff00, #ff0000, #00ff00, #ff0000);
    -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: -1;
    animation: borderFlow 4s linear infinite;
}

@keyframes borderFlow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
}

#swPanelHeader {
    background: linear-gradient(to right, #1a1a1a, #222222);
    padding: 20px;
    text-align: center;
    border-bottom: 2px solid #00ff00;
    cursor: move;
    position: relative;
    overflow: hidden;
    user-select: none;
}

#swPanelHeader strong {
    font-size: 24px;
    letter-spacing: 3px;
    background: linear-gradient(45deg, #00ff00, #ff0000);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

#swPanelHeader::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.2), transparent);
    animation: shine 3s infinite;
}

@keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
}

.sw-tab-content {
    padding: 20px;
    background: rgba(10, 10, 10, 0.95);
    height: calc(100% - 70px);
    overflow-y: auto;
}

/* 🔹 TABS STYLES - ORYGINALNE 🔹 */
.tab-container {
    display: flex;
    background: linear-gradient(to bottom, #1a1a1a, #151515);
    border-bottom: 2px solid #00ff00;
    padding: 0 10px;
}

.tablink {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 15px 10px;
    margin: 0 5px;
    transition: all 0.3s ease;
    color: #aaaaaa;
    font-weight: 700;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 3px solid transparent;
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
    height: 3px;
    background: linear-gradient(to right, #00ff00, #ff0000);
    transition: width 0.3s ease;
}

.tablink:hover::before {
    width: 80%;
}

.tablink.active {
    color: #00ff00;
    text-shadow: 0 0 15px rgba(0, 255, 0, 0.7);
}

.tablink.active::before {
    width: 100%;
    background: linear-gradient(to right, #00ff00, #ff0000);
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
}

.tablink:hover:not(.active) {
    color: #00ff00;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.4);
}

/* 🔹 TAB CONTENT 🔹 */
.tabcontent {
    display: none;
    height: 100%;
    animation: fadeEffect 0.3s ease;
}

@keyframes fadeEffect {
    from { 
        opacity: 0; 
        transform: translateY(10px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
}

.tabcontent.active {
    display: block;
}

.tabcontent h3 {
    margin: 0 0 20px 0;
    color: #00ff00;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    position: relative;
}

.tabcontent h3::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100px;
    height: 2px;
    background: linear-gradient(to right, #00ff00, #ff0000);
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
}

/* 🔹 ADDONS LIST - ORYGINALNE 🔹 */
.addon {
    background: rgba(30, 30, 30, 0.9);
    border: 2px solid #333;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
}

.addon:hover {
    background: rgba(40, 40, 40, 0.95);
    border-color: #00ff00;
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 255, 0, 0.2);
}

.addon:hover::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #00ff00, #ff0000, #00ff00);
    border-radius: 12px;
    z-index: -1;
    animation: borderGlow 3s linear infinite;
}

@keyframes borderGlow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
}

.addon-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    cursor: pointer;
}

.addon-header > div {
    display: flex;
    align-items: center;
    gap: 15px;
}

.addon-title {
    font-weight: 700;
    color: #00ff00;
    font-size: 16px;
    text-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
}

.addon-description {
    color: #cccccc;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 10px;
    display: none;
}

.addon.expanded .addon-description {
    display: block;
}

/* 🔹 SETTINGS GEAR ICON 🔹 */
.addon-settings-btn {
    background: rgba(0, 255, 0, 0.15);
    border: 2px solid #333;
    color: #00ff00;
    cursor: pointer;
    padding: 5px 10px;
    margin-left: 10px;
    font-size: 14px;
    border-radius: 5px;
    transition: all 0.3s ease;
}

.addon-settings-btn:hover {
    color: #ffffff;
    background: rgba(0, 255, 0, 0.3);
    border-color: #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
}

.addon-settings-panel {
    display: none;
    margin-top: 15px;
    padding: 15px;
    background: rgba(20, 20, 20, 0.95);
    border: 2px solid #333;
    border-radius: 8px;
}

.addon-settings-panel.visible {
    display: block;
}

.settings-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.settings-label {
    font-size: 13px;
    color: #00ff00;
    font-weight: 600;
}

.settings-value {
    font-size: 13px;
    color: #ff5555;
    font-weight: 600;
}

/* 🔹 SWITCH STYLE - ORYGINALNY 🔹 */
.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
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
    transition: .4s;
    border-radius: 30px;
    border: 2px solid #555;
}

.slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: #00ff00;
    transition: .4s;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
}

input:checked + .slider {
    background-color: #003300;
    border-color: #00ff00;
}

input:checked + .slider:before {
    transform: translateX(30px);
    background-color: #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.9);
}

/* 🔹 LICENSE SYSTEM - ZMIENIONE TYLKO ABY POKAZAĆ ID KONTA 🔹 */
.license-container {
    text-align: center;
    padding: 30px;
    background: rgba(30, 30, 30, 0.9);
    border: 2px solid #333;
    border-radius: 15px;
    margin: 20px 0;
}

.license-input {
    width: 100%;
    padding: 15px;
    margin: 15px 0;
    background: rgba(40, 40, 40, 0.9);
    border: 2px solid #333;
    border-radius: 10px;
    color: #00ff00;
    font-size: 16px;
    transition: all 0.3s ease;
    text-align: center;
}

.license-input:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.7);
    background: rgba(50, 50, 50, 0.95);
}

.license-button {
    width: 100%;
    padding: 15px;
    background: linear-gradient(to right, #003300, #006600);
    color: #00ff00;
    border: 2px solid #00ff00;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 16px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.license-button:hover {
    background: linear-gradient(to right, #006600, #009900);
    color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 255, 0, 0.4);
}

.license-message {
    margin-top: 20px;
    padding: 15px;
    border-radius: 10px;
    font-size: 14px;
    text-align: center;
    border: 2px solid;
}

.license-success {
    background: rgba(0, 100, 0, 0.3);
    color: #00ff00;
    border-color: #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
}

.license-error {
    background: rgba(100, 0, 0, 0.3);
    color: #ff0000;
    border-color: #ff0000;
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
}

.license-info {
    background: rgba(0, 50, 100, 0.3);
    color: #00aaff;
    border-color: #00aaff;
    box-shadow: 0 0 15px rgba(0, 170, 255, 0.4);
}

/* 🔹 LICENSE STATUS IN TAB - DODANE ID KONTA 🔹 */
.license-status-container {
    background: rgba(30, 30, 30, 0.9);
    border: 2px solid #333;
    border-radius: 15px;
    padding: 25px;
    margin-top: 30px;
}

.license-status-header {
    color: #00ff00;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 25px;
    border-bottom: 2px solid #333;
    padding-bottom: 15px;
    text-align: center;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.license-status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 16px;
    padding: 15px 0;
    border-bottom: 2px solid rgba(51, 51, 51, 0.5);
}

.license-status-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.license-status-label {
    color: #00ff00;
    font-weight: 700;
    font-size: 18px;
}

.license-status-value {
    font-weight: 700;
    font-size: 18px;
    text-align: right;
    max-width: 60%;
    word-break: break-all;
}

.license-status-valid {
    color: #00ff00 !important;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
}

.license-status-invalid {
    color: #ff0000 !important;
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
}

.license-status-connected {
    color: #00ff00 !important;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
}

.license-status-disconnected {
    color: #ff0000 !important;
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
}

/* 🔹 SETTINGS TAB - ORYGINALNE 🔹 */
.settings-item {
    margin-bottom: 25px;
    padding: 20px;
    background: rgba(30, 30, 30, 0.9);
    border: 2px solid #333;
    border-radius: 15px;
    transition: all 0.3s ease;
}

.settings-item:hover {
    border-color: #00ff00;
    background: rgba(40, 40, 40, 0.95);
}

.settings-label {
    display: block;
    color: #00ff00;
    font-size: 16px;
    margin-bottom: 15px;
    font-weight: 700;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

/* 🔹 ROZMIAR CZCIONKI - SUWAK 🔹 */
.font-size-container {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 25px;
}

.font-size-slider {
    flex: 1;
    -webkit-appearance: none;
    height: 10px;
    background: #333;
    border-radius: 5px;
    outline: none;
}

.font-size-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 25px;
    height: 25px;
    background: #00ff00;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
    transition: all 0.3s ease;
}

.font-size-slider::-webkit-slider-thumb:hover {
    background: #00cc00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.9);
    transform: scale(1.2);
}

.font-size-value {
    color: #00ff00;
    font-weight: 700;
    font-size: 18px;
    min-width: 50px;
    text-align: center;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
}

/* 🔹 WIDOCZNOŚĆ TŁA - PRZEŁĄCZNIK 🔹 */
.background-toggle-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 25px;
}

.background-toggle-label {
    color: #00ff00;
    font-size: 16px;
    font-weight: 700;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
}

.background-toggle {
    position: relative;
    display: inline-block;
    width: 70px;
    height: 35px;
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
    transition: .4s;
    border-radius: 35px;
    border: 2px solid #555;
}

.background-toggle-slider:before {
    position: absolute;
    content: "";
    height: 27px;
    width: 27px;
    left: 4px;
    bottom: 4px;
    background-color: #00ff00;
    transition: .4s;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
}

.background-toggle input:checked + .background-toggle-slider {
    background-color: #003300;
    border-color: #00ff00;
}

.background-toggle input:checked + .background-toggle-slider:before {
    transform: translateX(35px);
    background-color: #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.9);
}

/* 🔹 PRZYCISK RESETUJ USTAWIENIA 🔹 */
.reset-settings-container {
    margin-top: 30px;
    padding-top: 25px;
    border-top: 2px solid #333;
}

.reset-settings-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    width: 100%;
    padding: 20px;
    background: rgba(30, 30, 30, 0.9);
    border: 2px solid #333;
    border-radius: 15px;
    color: #ff0000;
    cursor: pointer;
    font-weight: 700;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.3s ease;
}

.reset-settings-button:hover {
    background: rgba(50, 30, 30, 0.95);
    border-color: #ff0000;
    color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(255, 0, 0, 0.4);
}

.reset-settings-button:active {
    transform: translateY(0);
}

.reset-settings-icon {
    color: #ff0000;
    font-size: 20px;
    transition: all 0.3s ease;
}

.reset-settings-button:hover .reset-settings-icon {
    transform: rotate(180deg);
    color: #ffffff;
}

/* 🔹 DODATKOWE STYLE DLA PANELU BEZ TŁA 🔹 */
#swAddonsPanel.transparent-background {
    background: transparent;
    backdrop-filter: none;
    box-shadow: 0 0 40px rgba(255, 0, 0, 0.8);
}

#swAddonsPanel.transparent-background .sw-tab-content,
#swAddonsPanel.transparent-background .addon,
#swAddonsPanel.transparent-background .settings-item,
#swAddonsPanel.transparent-background .license-status-container,
#swAddonsPanel.transparent-background .license-container {
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(10px);
}

#swAddonsPanel.transparent-background .tab-container {
    background: rgba(20, 20, 20, 0.95);
}

/* 🔹 OPCJE W TYTUŁACH DODATKÓW 🔹 */
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
    font-size: 20px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    width: 30px;
    height: 30px;
    min-width: 30px;
    min-height: 30px;
}

.favorite-btn:hover {
    color: #ffaa00;
    transform: scale(1.2);
}

.favorite-btn.favorite {
    color: #ffaa00;
    text-shadow: 0 0 10px rgba(255, 170, 0, 0.7);
}

/* 🔹 BUTTONS 🔹 */
#reset-settings {
    width: 100%;
    padding: 15px;
    background: linear-gradient(to right, #660000, #990000);
    color: #ff0000;
    border: 2px solid #ff0000;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.3s ease;
    margin-top: 15px;
}

#reset-settings:hover {
    background: linear-gradient(to right, #990000, #cc0000);
    color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(255, 0, 0, 0.5);
}

/* 🔹 SCROLLBAR STYLES 🔹 */
.sw-tab-content::-webkit-scrollbar {
    width: 12px;
}

.sw-tab-content::-webkit-scrollbar-track {
    background: rgba(20, 20, 20, 0.9);
    border-radius: 6px;
}

.sw-tab-content::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #00ff00, #006600);
    border-radius: 6px;
    border: 2px solid rgba(20, 20, 20, 0.9);
}

.sw-tab-content::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #00ff00, #009900);
}

/* 🔹 ANIMACJE DODATKOWE 🔹 */
@keyframes pulse {
    0% { box-shadow: 0 0 10px rgba(0, 255, 0, 0.7); }
    50% { box-shadow: 0 0 30px rgba(0, 255, 0, 0.9); }
    100% { box-shadow: 0 0 10px rgba(0, 255, 0, 0.7); }
}

.addon.active {
    animation: pulse 2s infinite;
}

/* 🔹 RESPONSYWNOŚĆ 🔹 */
@media (max-width: 800px) {
    #swAddonsPanel {
        width: 550px;
        left: 50%;
        transform: translateX(-50%);
    }
    
    .tablink {
        padding: 12px 8px;
        font-size: 12px;
    }
    
    .license-status-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
    
    .license-status-value {
        max-width: 100%;
        text-align: left;
    }
}

@media (max-width: 600px) {
    #swAddonsPanel {
        width: 450px;
    }
    
    .tablink {
        padding: 10px 5px;
        font-size: 11px;
    }
}

/* 🔹 KATEGORIE FILTRÓW 🔹 */
.category-filters {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 25px;
    background: rgba(20, 20, 20, 0.9);
    border: 2px solid #333;
    border-radius: 15px;
    padding: 15px;
}

.category-filter-item {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 10px 15px;
    background: rgba(30, 30, 30, 0.7);
    border-radius: 10px;
    transition: all 0.3s ease;
    gap: 15px;
}

.category-filter-item:hover {
    background: rgba(40, 40, 40, 0.9);
    transform: translateY(-3px);
}

.category-filter-label {
    display: flex;
    align-items: center;
    color: #00ff00;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
}

/* 🔹 PRZEŁĄCZNIKI FILTRÓW 🔹 */
.category-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 25px;
    flex-shrink: 0;
    margin-left: 0;
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
    border-radius: 25px;
    border: 2px solid #555;
}

.category-slider:before {
    position: absolute;
    content: "";
    height: 19px;
    width: 19px;
    left: 3px;
    bottom: 3px;
    background-color: #00ff00;
    transition: .3s;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(0, 255, 0, 0.7);
}

.category-switch input:checked + .category-slider {
    background-color: #003300;
    border-color: #00ff00;
}

.category-switch input:checked + .category-slider:before {
    transform: translateX(25px);
    background-color: #00ff00;
    box-shadow: 0 0 12px rgba(0, 255, 0, 0.9);
}

/* 🔹 WYSZUKIWARKA 🔹 */
.search-container {
    margin-bottom: 25px;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 18px 25px;
    background: rgba(30, 30, 30, 0.9);
    border: 2px solid #333;
    border-radius: 15px;
    color: #00ff00;
    font-size: 18px;
    transition: all 0.3s ease;
    box-sizing: border-box;
    text-align: center;
}

.search-input:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 25px rgba(0, 255, 0, 0.7);
    background: rgba(40, 40, 40, 0.95);
}

.search-input::placeholder {
    color: #666;
    font-size: 16px;
    text-align: center;
}

/* 🔹 LISTA DODATKÓW 🔹 */
.addon-list {
    max-height: 350px;
    overflow-y: auto;
    margin-bottom: 25px;
}

.addon-list-empty {
    text-align: center;
    color: #666;
    font-size: 16px;
    padding: 30px 20px;
    font-style: italic;
    background: rgba(30, 30, 30, 0.6);
    border-radius: 15px;
    margin: 10px 0;
}

/* 🔹 PRZYCISK ODŚWIEŻ 🔹 */
.refresh-button-container {
    text-align: center;
    margin-top: 20px;
    padding: 20px;
    border-top: 2px solid #333;
}

.refresh-button {
    padding: 18px 40px;
    background: linear-gradient(to right, #003300, #006600);
    color: #00ff00;
    border: 2px solid #00ff00;
    border-radius: 15px;
    cursor: pointer;
    font-weight: 700;
    font-size: 18px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 2px;
    min-width: 200px;
}

.refresh-button:hover {
    background: linear-gradient(to right, #006600, #009900);
    color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 255, 0, 0.4);
}

/* 🔹 INFORMACJE TAB 🔹 */
.info-container {
    background: rgba(30, 30, 30, 0.9);
    border: 2px solid #333;
    border-radius: 15px;
    padding: 30px;
}

.info-header {
    color: #00ff00;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 30px;
    border-bottom: 2px solid #333;
    padding-bottom: 20px;
    text-align: center;
    text-shadow: 0 0 15px rgba(0, 255, 0, 0.7);
}

.info-patch-notes {
    list-style: none;
    padding: 0;
    margin: 0;
}

.info-patch-notes li {
    color: #cccccc;
    font-size: 16px;
    margin-bottom: 15px;
    padding-left: 0;
    position: relative;
    line-height: 1.6;
    text-align: left;
    display: flex;
    align-items: flex-start;
}

.info-patch-notes li:before {
    content: "►";
    color: #00ff00;
    font-size: 18px;
    font-weight: bold;
    margin-right: 15px;
    flex-shrink: 0;
    margin-top: 2px;
    display: inline-block;
}

.info-footer {
    color: #666;
    font-size: 14px;
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #333;
    font-style: italic;
}

/* 🔹 SHORTCUT INPUT 🔹 */
.shortcut-input-container {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 25px;
    padding: 0 10px;
}

.shortcut-input-label {
    color: #00ff00;
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
}

.shortcut-input {
    flex: 1;
    padding: 15px 20px;
    background: rgba(30, 30, 30, 0.9);
    border: 2px solid #333;
    border-radius: 10px;
    color: #00ff00;
    font-size: 18px;
    text-align: center;
    width: 150px;
    transition: all 0.3s ease;
    font-weight: 700;
    letter-spacing: 1px;
}

.shortcut-input:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.7);
    background: rgba(40, 40, 40, 0.95);
}

/* 🔹 MODAL AKTYWACJI LICENCJI 🔹 */
#swLicenseModal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 1000003;
    justify-content: center;
    align-items: center;
}

.license-modal-content {
    background: linear-gradient(135deg, #0a0a0a, #121212);
    width: 500px;
    border: 3px solid #00ff00;
    border-radius: 20px;
    padding: 40px 50px;
    position: relative;
    animation: borderFlow 4s linear infinite;
}

.license-modal-header {
    color: #00ff00;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 30px;
    text-align: center;
    text-shadow: 0 0 15px rgba(0, 255, 0, 0.7);
}

.license-modal-input {
    width: 100%;
    padding: 20px;
    margin: 20px 0;
    background: rgba(30, 30, 30, 0.9);
    border: 2px solid #333;
    border-radius: 15px;
    color: #00ff00;
    font-size: 18px;
    transition: all 0.3s ease;
    box-sizing: border-box;
    text-align: center;
}

.license-modal-input:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 25px rgba(0, 255, 0, 0.7);
    background: rgba(40, 40, 40, 0.95);
}

.license-modal-buttons {
    display: flex;
    gap: 20px;
    margin-top: 30px;
    padding: 0 20px;
}

.license-modal-button {
    flex: 1;
    padding: 20px;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    font-weight: 700;
    font-size: 18px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.license-modal-button.activate {
    background: linear-gradient(to right, #003300, #006600);
    color: #00ff00;
    border: 2px solid #00ff00;
}

.license-modal-button.activate:hover {
    background: linear-gradient(to right, #006600, #009900);
    color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 255, 0, 0.4);
}

.license-modal-button.cancel {
    background: rgba(30, 30, 30, 0.9);
    color: #888;
    border: 2px solid #333;
}

.license-modal-button.cancel:hover {
    background: rgba(40, 40, 40, 0.95);
    color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
}

.license-modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: #00ff00;
    font-size: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.license-modal-close:hover {
    color: #ffffff;
    background: rgba(0, 255, 0, 0.2);
    transform: scale(1.1);
}
        `;
        document.head.appendChild(style);
        console.log('✅ CSS injected');
    }

    // 🔹 Główne funkcje panelu (NIE ZMIENIONE)
    async function initPanel() {
        console.log('✅ Initializing panel...');
        
        injectCSS();
        loadAddonsState();
        loadCategoriesState();
        loadSettings();
        
        // DODANE: Inicjalizuj konto i licencję
        await initAccountAndLicense();
        
        createToggleButton();
        createMainPanel();
        createLicenseModal();
        loadSavedState();
        
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn) setupToggleDrag(toggleBtn);
        
        setupEventListeners();
        setupTabs();
        setupDrag();
        setupKeyboardShortcut();
        
        if (isLicenseVerified) loadEnabledAddons();
    }

    // 🔹 Tworzenie przycisku przełączania (NIE ZMIENIONE)
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

    // 🔹 Tworzenie głównego panelu (NIE ZMIENIONE, tylko dodane ID konta w licencji)
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        panel.innerHTML = `
            <div id="swPanelHeader">
                <strong>SYNERGY WRAITH</strong>
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
                <button class="tablink" data-tab="license">Licencja</button>
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
                    <div class="license-status-container">
                        <div class="license-status-header">Status Licencji</div>
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
                            <button class="shortcut-set-btn" id="shortcutSetBtn">Ustaw skrót</button>
                        </div>
                    </div>
                    
                    <div class="reset-settings-container">
                        <button class="reset-settings-button" id="swResetButton">
                            <span class="reset-settings-icon">↻</span>
                            Resetuj wszystkie ustawienia
                        </button>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top: 20px; padding: 15px; border-radius: 10px; display: none;"></div>
                </div>
            </div>

            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="info-container">
                        <div class="info-header">Informacje o Panelu</div>
                        
                        <div class="info-patch-notes">
                            <li>Panel Synergy Wraith v2.0</li>
                            <li>Dodano automatyczne wykrywanie ID konta</li>
                            <li>Nowy system licencji w przygotowaniu</li>
                            <li>Możliwość zarządzania dodatkami</li>
                            <li>Konfigurowalne ustawienia wyglądu</li>
                            <li>Obsługa skrótów klawiszowych</li>
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
        console.log('✅ Panel created');
    }

    // 🔹 Update wyświetlania licencji (DODANE: updateAccountDisplay już jest)
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

    // 🔹 Reszta oryginalnych funkcji (NIE ZMIENIONE - skrócone dla czytelności)
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
    }

    function setupToggleDrag(toggleBtn) {
        let isDragging = false, startX, startY, initialLeft, initialTop;
        let clickCount = 0, clickTimer = null, animationFrame = null;
        let currentX = parseInt(toggleBtn.style.left) || 70;
        let currentY = parseInt(toggleBtn.style.top) || 70;
        toggleBtn.style.left = currentX + 'px';
        toggleBtn.style.top = currentY + 'px';

        toggleBtn.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            startX = e.clientX; startY = e.clientY;
            initialLeft = currentX; initialTop = currentY;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        });

        function onMouseMove(e) {
            if (!isDragging) startDragging();
            if (isDragging) {
                if (animationFrame) cancelAnimationFrame(animationFrame);
                const deltaX = e.clientX - startX, deltaY = e.clientY - startY;
                const newLeft = initialLeft + deltaX, newTop = initialTop + deltaY;
                const maxX = window.innerWidth - toggleBtn.offsetWidth, maxY = window.innerHeight - toggleBtn.offsetHeight;
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
            if (clickTimer) clearTimeout(clickTimer);
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            if (animationFrame) cancelAnimationFrame(animationFrame);
            if (isDragging) stopDragging();
            else handleClick();
        }

        function stopDragging() {
            isDragging = false;
            toggleBtn.style.cursor = 'grab';
            toggleBtn.classList.remove('dragging');
            toggleBtn.classList.add('saved');
            SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, { left: currentX + 'px', top: currentY + 'px' });
            setTimeout(() => toggleBtn.classList.remove('saved'), 1500);
        }

        function handleClick() {
            clickCount++;
            if (clickCount === 1) {
                clickTimer = setTimeout(() => clickCount = 0, 300);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                clickCount = 0;
                togglePanel();
            }
        }

        toggleBtn.addEventListener('click', handleClick);
    }

    function setupTabs() {
        document.querySelectorAll('.tablink').forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const tabName = this.getAttribute('data-tab');
                document.querySelectorAll('.tablink').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                document.querySelectorAll('.tabcontent').forEach(content => content.classList.remove('active'));
                const tabContent = document.getElementById(tabName);
                if (tabContent) tabContent.classList.add('active');
            });
        });
    }

    function setupDrag() {
        const header = document.getElementById('swPanelHeader');
        const panel = document.getElementById('swAddonsPanel');
        if (!header || !panel) return;
        let isDragging = false, offsetX, offsetY;
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
            SW.GM_setValue(CONFIG.PANEL_POSITION, { left: panel.style.left, top: panel.style.top });
            document.removeEventListener('mousemove', onPanelDrag);
            document.removeEventListener('mouseup', stopPanelDrag);
        }
    }

    function setupKeyboardShortcut() {
        document.removeEventListener('keydown', handleKeyboardShortcut);
        document.addEventListener('keydown', handleKeyboardShortcut);
    }

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
            const toggleBtn = document.getElementById('swPanelToggle');
            if (toggleBtn) { toggleBtn.click(); toggleBtn.click(); }
        }
    }

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
            shortcutInput.value = 'Wciśnij kombinację klawiszy...';
            shortcutKeys = [];
            
            const keyDownHandler = function(e) {
                if (e.repeat) return;
                const key = e.key.toUpperCase();
                if (e.ctrlKey && !shortcutKeys.includes('Ctrl')) shortcutKeys.push('Ctrl');
                if (e.shiftKey && !shortcutKeys.includes('Shift')) shortcutKeys.push('Shift');
                if (key.length === 1 && /[A-Z0-9]/.test(key) && !shortcutKeys.includes(key)) shortcutKeys.push(key);
                if (shortcutKeys.length > 0) shortcutInput.value = shortcutKeys.join('+');
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
                    } else {
                        shortcutInput.value = 'Musi zawierać Ctrl + klawisz';
                        setTimeout(() => {
                            shortcutInput.value = customShortcut;
                            document.removeEventListener('keydown', keyDownHandler);
                            document.removeEventListener('keyup', keyUpHandler);
                            isShortcutInputFocused = false;
                            shortcutInput.style.borderColor = '#333';
                        }, 1500);
                    }
                }
                if (e.key === 'Escape') {
                    shortcutInput.value = customShortcut;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    isShortcutInputFocused = false;
                    shortcutInput.style.borderColor = '#333';
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
                }
            }, 10000);
        });
    }

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
        if (refreshBtn) refreshBtn.addEventListener('click', function() {
            if (confirm('Czy na pewno chcesz odświeżyć stronę?')) location.reload();
        });

        // Resetowanie ustawień
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) resetBtn.addEventListener('click', function() {
            if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) resetAllSettings();
        });

        // Filtry kategorii
        ['filter-enabled', 'filter-disabled', 'filter-favorites'].forEach(id => {
            const filter = document.getElementById(id);
            if (filter) filter.addEventListener('change', function() {
                activeCategories[this.id.replace('filter-', '')] = this.checked;
                saveCategoriesState();
                renderAddons();
            });
        });

        // Wyszukiwarka
        const searchInput = document.getElementById('searchAddons');
        if (searchInput) searchInput.addEventListener('input', function() {
            searchQuery = this.value.toLowerCase();
            renderAddons();
        });

        // Modal licencji
        const activateBtn = document.getElementById('swActivateLicense');
        const modal = document.getElementById('swLicenseModal');
        if (activateBtn && modal) activateBtn.addEventListener('click', () => modal.style.display = 'flex');
        
        ['swLicenseModalClose', 'swLicenseModalCancel'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', () => modal.style.display = 'none');
        });
        
        const modalActivateBtn = document.getElementById('swLicenseModalActivate');
        if (modalActivateBtn) modalActivateBtn.addEventListener('click', function() {
            const licenseKeyInput = document.getElementById('swLicenseKeyInput');
            if (licenseKeyInput && licenseKeyInput.value.trim()) {
                activateLicense(licenseKeyInput.value.trim());
                modal.style.display = 'none';
                licenseKeyInput.value = '';
            } else alert('Proszę wpisać kod licencji!');
        });

        if (modal) modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Enter w inpucie modala
        const licenseKeyInput = document.getElementById('swLicenseKeyInput');
        if (licenseKeyInput) licenseKeyInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') modalActivateBtn.click();
        });

        // Delegowane nasłuchiwanie dla dodatków
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('favorite-btn') || e.target.closest('.favorite-btn')) {
                const btn = e.target.classList.contains('favorite-btn') ? e.target : e.target.closest('.favorite-btn');
                toggleFavorite(btn.dataset.id);
            }
            if (e.target.type === 'checkbox' && e.target.closest('.addon')) {
                toggleAddon(e.target.dataset.id, e.target.checked);
            }
        });
    }

    function togglePanel() {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const isVisible = panel.style.display === 'block';
            panel.style.display = isVisible ? 'none' : 'block';
            SW.GM_setValue(CONFIG.PANEL_VISIBLE, !isVisible);
        }
    }

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
            const searchMatch = searchQuery === '' || addon.name.toLowerCase().includes(searchQuery) || addon.description.toLowerCase().includes(searchQuery);
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
                        <div>
                            <span class="addon-title">${addon.name}</span>
                        </div>
                        <div class="addon-controls">
                            <button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" data-id="${addon.id}">
                                ★
                            </button>
                            <label class="switch">
                                <input type="checkbox" ${addon.enabled ? 'checked' : ''} data-id="${addon.id}">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="addon-description">${addon.description}</div>
                `;
                listContainer.appendChild(div);
            });
        } else {
            listContainer.innerHTML = '<div class="addon-list-empty">Brak dodatków spełniających kryteria</div>';
        }
    }

    function toggleFavorite(addonId) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        currentAddons[addonIndex].favorite = !currentAddons[addonIndex].favorite;
        SW.GM_setValue(CONFIG.FAVORITE_ADDONS, currentAddons.filter(a => a.favorite).map(a => a.id));
        renderAddons();
    }

    function toggleAddon(addonId, isEnabled) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        currentAddons[addonIndex].enabled = isEnabled;
        if (addonId === 'kcs-icons') {
            SW.GM_setValue(CONFIG.KCS_ICONS_ENABLED, isEnabled);
            const messageEl = document.getElementById('swAddonsMessage');
            if (messageEl) {
                messageEl.textContent = isEnabled ? 'KCS Icons włączony' : 'KCS Icons wyłączony';
                messageEl.className = 'license-message license-info';
                messageEl.style.display = 'block';
                setTimeout(() => messageEl.style.display = 'none', 5000);
            }
            if (isLicenseVerified && isEnabled) setTimeout(initKCSIcons, 100);
        }
        renderAddons();
    }

    function activateLicense(licenseKey) {
        console.log('🔐 Activating license:', licenseKey);
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
            setTimeout(() => messageEl.style.display = 'none', 5000);
        }
    }