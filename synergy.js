// synergy.js - Główny kod panelu z nowymi ustawieniami
(function() {
    'use strict';

    console.log('🚀 SynergyWraith Panel loaded');

    // 🔹 Konfiguracja
    const CONFIG = {
        PANEL_POSITION: "sw_panel_position",
        PANEL_VISIBLE: "sw_panel_visible",
        PANEL_SIZE: "sw_panel_size", // Dodano zapis rozmiaru panelu
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
        CUSTOM_SHORTCUT: "sw_custom_shortcut"
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
            "Dodano wyszukiwarkę dodatków",
            "Dodano konfigurowalne skróty klawiszowe",
            "Nowa zakładka 'Skróty'",
            "Nowa zakładka 'Informacje'",
            "Rozszerzona sekcja licencji",
            "Przycisk zamykania panelu",
            "Ulepszenia interfejsu",
            "Możliwość zmiany rozmiaru panelu"
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

/* 🔹 FIRE ANIMATION 🔹 */
@keyframes fireBorder {
    0%, 100% {
        border-color: #ff3300;
        box-shadow: 
            0 0 15px rgba(255, 50, 0, 0.8),
            0 0 30px rgba(255, 100, 0, 0.6),
            inset 0 0 15px rgba(255, 50, 0, 0.3);
    }
    25% {
        border-color: #ff6600;
        box-shadow: 
            0 0 20px rgba(255, 100, 0, 0.9),
            0 0 35px rgba(255, 150, 0, 0.7),
            inset 0 0 20px rgba(255, 100, 0, 0.4);
    }
    50% {
        border-color: #ff9900;
        box-shadow: 
            0 0 18px rgba(255, 150, 0, 0.85),
            0 0 32px rgba(255, 200, 0, 0.65),
            inset 0 0 18px rgba(255, 150, 0, 0.35);
    }
    75% {
        border-color: #ffcc00;
        box-shadow: 
            0 0 22px rgba(255, 200, 0, 0.95),
            0 0 38px rgba(255, 255, 0, 0.75),
            inset 0 0 22px rgba(255, 200, 0, 0.45);
    }
}

@keyframes fireText {
    0%, 100% {
        color: #ff3300;
        text-shadow: 
            0 0 5px rgba(255, 50, 0, 0.8),
            0 0 10px rgba(255, 100, 0, 0.6),
            0 0 15px rgba(255, 50, 0, 0.4);
    }
    25% {
        color: #ff6600;
        text-shadow: 
            0 0 6px rgba(255, 100, 0, 0.9),
            0 0 12px rgba(255, 150, 0, 0.7),
            0 0 18px rgba(255, 100, 0, 0.5);
    }
    50% {
        color: #ff9900;
        text-shadow: 
            0 0 7px rgba(255, 150, 0, 0.85),
            0 0 14px rgba(255, 200, 0, 0.65),
            0 0 21px rgba(255, 150, 0, 0.45);
    }
    75% {
        color: #ffcc00;
        text-shadow: 
            0 0 8px rgba(255, 200, 0, 0.95),
            0 0 16px rgba(255, 255, 0, 0.75),
            0 0 24px rgba(255, 200, 0, 0.55);
    }
}

/* 🔹 MAIN PANEL - ZMIENNY ROZMIAR 🔹 */
#swAddonsPanel {
    position: fixed;
    top: 140px;
    left: 70px;
    width: 700px;
    height: 580px;
    min-width: 400px !important;
    min-height: 300px !important;
    max-width: 1200px !important;
    max-height: 800px !important;
    background: linear-gradient(135deg, #0a0a0a, #121212);
    border: 2px solid #ff3300;
    border-radius: 8px;
    color: #ffffff;
    z-index: 1000002;
    backdrop-filter: blur(10px);
    display: none;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    overflow: hidden;
    font-size: 12px;
    animation: fireBorder 8s infinite ease-in-out;
    box-sizing: border-box !important;
    resize: none !important;
    user-select: none;
}

/* Neonowy efekt na krawędziach */
#swAddonsPanel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 6px;
    padding: 1px;
    background: linear-gradient(45deg, #ff3300, #ff9900, #ff3300);
    -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: -1;
    animation: fireBorder 8s infinite ease-in-out;
}

/* 🔹 RESIZE HANDLE - PRAWY DOLNY RÓG 🔹 */
#swResizeHandle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nwse-resize;
    z-index: 1000003;
    background: linear-gradient(135deg, #ff3300, #ff9900);
    border-radius: 4px 0 0 0;
    opacity: 0.7;
    transition: all 0.3s ease;
}

#swResizeHandle:hover {
    opacity: 1;
    transform: scale(1.1);
}

#swResizeHandle.resizing {
    background: linear-gradient(135deg, #ffff00, #ff9900);
    opacity: 1;
    transform: scale(1.2);
}

/* Resize indicator */
#swResizeIndicator {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background: rgba(0, 0, 0, 0.7);
    color: #ff9900;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: bold;
    pointer-events: none;
    z-index: 1000004;
    display: none;
    border: 1px solid #ff9900;
}

#swPanelHeader {
    background: linear-gradient(to right, #1a1a1a, #222222);
    padding: 20px 40px 20px 12px;
    text-align: center;
    border-bottom: 1px solid #ff3300;
    cursor: grab;
    position: relative;
    overflow: hidden;
    height: 60px !important;
    box-sizing: border-box !important;
    flex-shrink: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
}

#swPanelHeader strong {
    font-size: 20px;
    letter-spacing: 2px;
    animation: fireText 8s infinite ease-in-out;
    font-weight: 800;
    text-transform: uppercase;
}

/* 🔹 PRZYCISK ZAMYKANIA 🔹 */
#swPanelClose {
    position: absolute !important;
    top: 15px !important;
    right: 15px !important;
    width: 30px !important;
    height: 30px !important;
    background: rgba(255, 51, 0, 0.2) !important;
    border: 1px solid #ff3300 !important;
    border-radius: 4px !important;
    color: #ff3300 !important;
    cursor: pointer !important;
    font-size: 16px !important;
    font-weight: bold !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s ease !important;
    z-index: 1000 !important;
}

#swPanelClose:hover {
    background: rgba(255, 51, 0, 0.4) !important;
    color: #ffffff !important;
    transform: scale(1.1) !important;
    box-shadow: 0 0 10px rgba(255, 51, 0, 0.8) !important;
}

#swPanelClose:active {
    transform: scale(0.95) !important;
}

/* 🔹 KONTENER ZAKŁADEK 🔹 */
.tab-container {
    display: flex;
    background: linear-gradient(to bottom, #1a1a1a, #151515);
    border-bottom: 1px solid #ff3300;
    padding: 0 5px;
    height: 40px !important;
    flex-shrink: 0 !important;
    box-sizing: border-box !important;
    align-items: center;
}

.tablink {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 10px 5px;
    margin: 0 2px;
    transition: all 0.3s ease;
    color: #aaaaaa;
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid transparent;
    position: relative;
    overflow: hidden;
    height: 100% !important;
    box-sizing: border-box !important;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tablink::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: #ff3300;
    transition: width 0.3s ease;
}

.tablink:hover::before {
    width: 80%;
}

.tablink.active {
    color: #ff9900;
    text-shadow: 0 0 8px rgba(255, 153, 0, 0.5);
}

.tablink.active::before {
    width: 100%;
    background: #ff9900;
    box-shadow: 0 0 8px rgba(255, 153, 0, 0.8);
}

.tablink:hover:not(.active) {
    color: #ff6600;
    text-shadow: 0 0 4px rgba(255, 102, 0, 0.3);
}

/* 🔹 ZAKŁADKI CONTENT - RESIZABLE LAYOUT 🔹 */
.tabcontent {
    display: none;
    height: calc(100% - 100px) !important;
    overflow: hidden;
    position: relative;
    box-sizing: border-box !important;
}

.tabcontent.active {
    display: block;
    animation: fadeEffect 0.3s ease;
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

/* 🔹 ZAKŁADKA DODATKÓW 🔹 */
#addons .sw-tab-content {
    padding: 15px;
    background: rgba(10, 10, 10, 0.9);
    height: 100% !important;
    overflow: hidden;
    display: flex !important;
    flex-direction: column !important;
    box-sizing: border-box !important;
}

/* 🔹 WYSZUKIWARKA DODATKÓW 🔹 */
.search-container {
    margin-bottom: 15px;
    position: relative;
    flex-shrink: 0 !important;
}

.search-input {
    width: 100%;
    padding: 14px 20px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    color: #ff9900;
    font-size: 15px;
    transition: all 0.3s ease;
    box-sizing: border-box !important;
    height: 50px;
    text-align: center;
}

.search-input:focus {
    outline: none;
    border-color: #ff9900;
    box-shadow: 0 0 15px rgba(255, 153, 0, 0.5);
    background: rgba(40, 40, 40, 0.9);
}

.search-input::placeholder {
    color: #666;
    font-size: 14px;
    text-align: center;
}

/* 🔹 CATEGORY FILTERS 🔹 */
.category-filters {
    display: flex;
    justify-content: space-between;
    gap: 5px;
    margin-bottom: 15px;
    background: rgba(20, 20, 20, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    padding: 10px 30px;
    flex-shrink: 0 !important;
    box-sizing: border-box !important;
}

.category-filter-item {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 5px 10px;
    background: rgba(30, 30, 30, 0.6);
    border-radius: 4px;
    transition: all 0.3s ease;
    gap: 15px;
    box-sizing: border-box !important;
}

.category-filter-item:hover {
    background: rgba(40, 40, 40, 0.8);
    transform: translateY(-2px);
}

.category-filter-label {
    display: flex;
    align-items: center;
    color: #ff9900;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
}

/* 🔹 PRZEŁĄCZNIKI FILTRÓW 🔹 */
.category-switch {
    position: relative;
    display: inline-block;
    width: 35px;
    height: 18px;
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
    border-radius: 18px;
    border: 1px solid #555;
}

.category-slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 2px;
    bottom: 2px;
    background-color: #ff9900;
    transition: .3s;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(255, 153, 0, 0.5);
}

.category-switch input:checked + .category-slider {
    background-color: #331100;
    border-color: #ff9900;
}

.category-switch input:checked + .category-slider:before {
    transform: translateX(17px);
    background-color: #ff9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.8);
}

/* 🔹 ADDONS LIST 🔹 */
.addon-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1 !important;
    overflow-y: auto !important;
    overflow-x: hidden;
    padding: 0 10px;
    margin-bottom: 10px;
    min-height: 0 !important;
    box-sizing: border-box !important;
}

.addon-list-empty {
    text-align: center !important;
    color: #666 !important;
    font-size: 12px !important;
    padding: 20px 10px !important;
    font-style: italic !important;
    background: rgba(30, 30, 30, 0.5) !important;
    border-radius: 6px !important;
    margin: 5px 0 !important;
    flex-shrink: 0 !important;
}

.addon-item {
    background: rgba(30, 30, 30, 0.8) !important;
    border: 1px solid #333 !important;
    border-radius: 6px !important;
    padding: 10px 25px !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    min-height: 45px !important;
    max-height: 45px !important;
    overflow: hidden !important;
    width: 100%;
    box-sizing: border-box !important;
    flex-shrink: 0 !important;
}

.addon-item:hover {
    background: rgba(40, 40, 40, 0.9) !important;
    border-color: #ff6600 !important;
    transform: translateX(5px);
}

.addon-item-header {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 !important;
    min-height: auto !important;
    overflow: hidden !important;
    padding-right: 30px;
    padding-left: 15px;
    max-width: 75%;
}

.addon-item-title {
    font-weight: 600 !important;
    color: #ff9900 !important;
    font-size: 13px !important;
    text-shadow: 0 0 3px rgba(255, 153, 0, 0.3) !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    line-height: 1.3 !important;
    margin-bottom: 2px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

.addon-item-description {
    color: #888 !important;
    font-size: 10px !important;
    line-height: 1.2 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 1 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    padding-left: 8px;
}

.addon-item-actions {
    display: flex !important;
    align-items: center !important;
    gap: 20px !important;
    flex-shrink: 0 !important;
    margin-right: 5px;
}

/* 🔹 FAVORITE STAR 🔹 */
.favorite-btn {
    background: none !important;
    border: none !important;
    color: #888 !important;
    cursor: pointer !important;
    padding: 3px !important;
    font-size: 14px !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 3px !important;
    width: 20px !important;
    height: 20px !important;
    min-width: 20px !important;
    min-height: 20px !important;
}

.favorite-btn:hover {
    color: #ffaa00 !important;
    transform: scale(1.1) !important;
}

.favorite-btn.favorite {
    color: #ffaa00 !important;
    text-shadow: 0 0 5px rgba(255, 170, 0, 0.5) !important;
}

/* 🔹 SWITCH STYLE 🔹 */
.switch {
    position: relative !important;
    display: inline-block !important;
    width: 35px !important;
    height: 18px !important;
    flex-shrink: 0 !important;
    margin-left: 10px;
}

.switch input {
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
}

.slider {
    position: absolute !important;
    cursor: pointer !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background-color: #333 !important;
    transition: .3s !important;
    border-radius: 18px !important;
    border: 1px solid #555 !important;
}

.slider:before {
    position: absolute !important;
    content: "" !important;
    height: 14px !important;
    width: 14px !important;
    left: 2px !important;
    bottom: 2px !important;
    background-color: #ff9900 !important;
    transition: .3s !important;
    border-radius: 50% !important;
    box-shadow: 0 0 4px rgba(255, 153, 0, 0.5) !important;
}

input:checked + .slider {
    background-color: #331100 !important;
    border-color: #ff9900 !important;
}

input:checked + .slider:before {
    transform: translateX(17px) !important;
    background-color: #ff9900 !important;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.8) !important;
}

/* 🔹 PRZYCISK ODŚWIEŻ 🔹 */
.refresh-button-container {
    text-align: center;
    margin-top: 10px;
    padding: 10px;
    border-top: 1px solid #333;
}

.refresh-button {
    padding: 10px 30px;
    background: linear-gradient(to right, #331100, #662200);
    color: #ff9900;
    border: 1px solid #ff9900;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    min-width: 150px;
}

.refresh-button:hover {
    background: linear-gradient(to right, #662200, #993300);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 153, 0, 0.3);
}

/* 🔹 INNE ZAKŁADKI 🔹 */
#license .sw-tab-content,
#settings .sw-tab-content,
#shortcuts .sw-tab-content,
#info .sw-tab-content {
    padding: 15px;
    background: rgba(10, 10, 10, 0.9);
    height: 100% !important;
    overflow-y: auto !important;
    overflow-x: hidden;
    box-sizing: border-box !important;
    display: block !important;
}

/* 🔹 LICENSE SYSTEM 🔹 */
.license-container {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 8px;
    padding: 25px 40px;
    margin-bottom: 20px;
}

.license-header {
    color: #ff9900;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
    text-align: center;
    text-shadow: 0 0 5px rgba(255, 153, 0, 0.3);
}

.license-status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 13px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(51, 51, 51, 0.5);
}

.license-status-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.license-status-label {
    color: #ff9900;
    font-weight: 600;
    padding-left: 20px;
}

.license-status-value {
    font-weight: 600;
    text-align: right;
    max-width: 60%;
    word-break: break-all;
    font-size: 12px;
    padding-right: 20px;
}

.license-status-valid {
    color: #ff9900 !important;
    text-shadow: 0 0 5px rgba(255, 153, 0, 0.5);
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

/* 🔹 PRZYCISK AKTYWACJI LICENCJI 🔹 */
.license-activation-container {
    text-align: center;
    margin-top: 20px;
    padding: 0 20px;
}

.license-activation-button {
    padding: 12px 30px;
    background: linear-gradient(to right, #331100, #662200);
    color: #ff9900;
    border: 1px solid #ff9900;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    min-width: 200px;
}

.license-activation-button:hover {
    background: linear-gradient(to right, #662200, #993300);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 153, 0, 0.3);
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
    border: 2px solid #ff3300;
    border-radius: 8px;
    padding: 25px 35px;
    position: relative;
    animation: fireBorder 8s infinite ease-in-out;
}

.license-modal-header {
    color: #ff9900;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    text-shadow: 0 0 5px rgba(255, 153, 0, 0.3);
}

.license-modal-input {
    width: 100%;
    padding: 12px;
    margin: 12px 0;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    color: #ff9900;
    font-size: 13px;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.license-modal-input:focus {
    outline: none;
    border-color: #ff9900;
    box-shadow: 0 0 15px rgba(255, 153, 0, 0.5);
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
    background: linear-gradient(to right, #331100, #662200);
    color: #ff9900;
    border: 1px solid #ff9900;
}

.license-modal-button.activate:hover {
    background: linear-gradient(to right, #662200, #993300);
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
    color: #ff3300;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.license-modal-close:hover {
    color: #ffffff;
    transform: scale(1.1);
}

/* 🔹 SETTINGS TAB 🔹 */
.settings-item {
    margin-bottom: 15px;
    padding: 18px 30px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.settings-label {
    display: block;
    color: #ff9900;
    font-size: 13px;
    margin-bottom: 12px;
    font-weight: 600;
    text-shadow: 0 0 5px rgba(255, 153, 0, 0.3);
    padding-left: 15px;
}

/* 🔹 SKRÓT KLAWISZOWY - INPUT 🔹 */
.shortcut-input-container {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    padding: 0 15px;
}

.shortcut-input-label {
    color: #ff9900;
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
    color: #ff9900;
    font-size: 13px;
    text-align: center;
    width: 130px;
    transition: all 0.3s ease;
    font-weight: bold;
    letter-spacing: 1px;
}

.shortcut-input:focus {
    outline: none;
    border-color: #ff9900;
    box-shadow: 0 0 10px rgba(255, 153, 0, 0.5);
    background: rgba(40, 40, 40, 0.9);
}

/* 🔹 ROZMIAR CZCIONKI 🔹 */
.font-size-container {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    padding: 0 15px;
}

.font-size-slider {
    flex: 1;
    -webkit-appearance: none;
    height: 8px;
    background: #333;
    border-radius: 4px;
    outline: none;
    margin: 0 20px;
}

.font-size-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: #ff9900;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(255, 153, 0, 0.5);
    transition: all 0.3s ease;
}

.font-size-slider::-webkit-slider-thumb:hover {
    background: #ff6600;
    box-shadow: 0 0 10px rgba(255, 153, 0, 0.8);
    transform: scale(1.1);
}

.font-size-value {
    color: #ff9900;
    font-weight: bold;
    font-size: 13px;
    min-width: 40px;
    text-align: center;
    text-shadow: 0 0 5px rgba(255, 153, 0, 0.3);
    padding-right: 15px;
}

/* 🔹 WIDOCZNOŚĆ TŁA 🔹 */
.background-toggle-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    padding: 0 15px;
}

.background-toggle-label {
    color: #ff9900;
    font-size: 13px;
    font-weight: 600;
    text-shadow: 0 0 5px rgba(255, 153, 0, 0.3);
}

.background-toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
    margin-right: 0;
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
    border-radius: 24px;
    border: 1px solid #555;
}

.background-toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: #ff9900;
    transition: .3s;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(255, 153, 0, 0.5);
}

.background-toggle input:checked + .background-toggle-slider {
    background-color: #331100;
    border-color: #ff9900;
}

.background-toggle input:checked + .background-toggle-slider:before {
    transform: translateX(26px);
    background-color: #ff9900;
    box-shadow: 0 0 10px rgba(255, 153, 0, 0.8);
}

/* 🔹 ZAKŁADKA SKRÓTÓW 🔹 */
.shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 15px;
}

.shortcut-item {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    padding: 14px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
}

.shortcut-item:hover {
    background: rgba(40, 40, 40, 0.9);
    border-color: #ff6600;
}

.shortcut-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.shortcut-name {
    color: #ff9900;
    font-size: 13px;
    font-weight: 600;
}

.shortcut-description {
    color: #888;
    font-size: 11px;
}

.shortcut-key {
    background: rgba(51, 17, 0, 0.8);
    color: #ff9900;
    padding: 6px 22px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid #ff9900;
    text-shadow: 0 0 3px rgba(255, 153, 0, 0.3);
    min-width: 100px;
    text-align: center;
}

/* 🔹 ZAKŁADKA INFORMACJI - POPRAWIONE WYRÓWNANIE BULLETA 🔹 */
.info-container {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 8px;
    padding: 25px 30px;
    margin: 0 10px;
}

.info-header {
    color: #ff9900;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
    text-align: center;
    text-shadow: 0 0 5px rgba(255, 153, 0, 0.3);
}

.info-patch-notes {
    list-style: none;
    padding: 0;
    margin: 0;
}

.info-patch-notes li {
    color: #ccc;
    font-size: 12px;
    margin-bottom: 8px;
    padding-left: 0;
    position: relative;
    line-height: 1.4;
    text-align: left;
    display: flex;
    align-items: center;
    min-height: 20px;
}

.info-patch-notes li:before {
    content: "•";
    color: #ff9900;
    font-size: 20px;
    font-weight: bold;
    margin-right: 10px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    line-height: 1;
    transform: translateY(-1px);
}

.info-footer {
    color: #666;
    font-size: 11px;
    text-align: center;
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid #333;
    font-style: italic;
}

/* 🔹 PRZYCISK RESETUJ USTAWIENIA 🔹 */
.reset-settings-container {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #333;
    padding: 15px 15px 0;
}

.reset-settings-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 12px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    color: #ff3300;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
}

.reset-settings-button:hover {
    background: rgba(50, 30, 30, 0.9);
    border-color: #ff3300;
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 51, 0, 0.3);
}

.reset-settings-button:active {
    transform: translateY(0);
}

.reset-settings-icon {
    color: #ff3300;
    font-size: 16px;
    transition: all 0.3s ease;
}

.reset-settings-button:hover .reset-settings-icon {
    transform: rotate(180deg);
    color: #ffffff;
}

/* 🔹 DODATKOWE STYLE DLA PANELU BEZ TŁA 🔹 */
#swAddonsPanel.transparent-background {
    background: transparent !important;
    backdrop-filter: none !important;
    border: 2px solid #ff3300 !important;
    animation: fireBorder 8s infinite ease-in-out !important;
}

#swAddonsPanel.transparent-background::before {
    display: none !important;
}

#swAddonsPanel.transparent-background #swPanelHeader,
#swAddonsPanel.transparent-background .tab-container,
#swAddonsPanel.transparent-background .sw-tab-content,
#swAddonsPanel.transparent-background .addon-item,
#swAddonsPanel.transparent-background .settings-item,
#swAddonsPanel.transparent-background .license-container,
#swAddonsPanel.transparent-background .category-filters,
#swAddonsPanel.transparent-background .info-container,
#swAddonsPanel.transparent-background .shortcut-item {
    background: transparent !important;
    backdrop-filter: blur(5px) !important;
}

#swAddonsPanel.transparent-background .tab-container {
    background: rgba(20, 20, 20, 0.9) !important;
}

/* 🔹 RESET STYLI GRY 🔹 */
#swAddonsPanel * {
    box-sizing: border-box !important;
    margin: 0 !important;
    padding: 0 !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
    line-height: 1.3 !important;
}

/* 🔹 ZAPOBIEGANIE ROZCIĄGANIU - LIGHT 🔹 */
#swAddonsPanel {
    resize: none !important;
}

/* 🔹 FIX DLA INPUTÓW 🔹 */
#swAddonsPanel input[type="checkbox"] {
    width: 16px !important;
    height: 16px !important;
    min-width: 16px !important;
    min-height: 16px !important;
}

/* 🔹 FIX DLA PRZYCISKÓW 🔹 */
#swAddonsPanel button {
    min-height: 30px !important;
    max-height: 40px !important;
}

/* 🔹 SCROLLBAR STYLES 🔹 */
.sw-tab-content::-webkit-scrollbar,
.addon-list::-webkit-scrollbar {
    width: 12px !important;
}

.sw-tab-content::-webkit-scrollbar-track,
.addon-list::-webkit-scrollbar-track {
    background: rgba(20, 20, 20, 0.8) !important;
    border-radius: 6px !important;
}

.sw-tab-content::-webkit-scrollbar-thumb,
.addon-list::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #ff9900, #993300) !important;
    border-radius: 6px !important;
    border: 2px solid rgba(20, 20, 20, 0.8) !important;
}

.sw-tab-content::-webkit-scrollbar-thumb:hover,
.addon-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #ffcc00, #cc6600) !important;
}

/* 🔹 OBSŁUGA KÓŁKA MYSZY 🔹 */
.addon-list {
    scroll-behavior: smooth !important;
    will-change: scroll-position !important;
    transform: translateZ(0) !important;
    backface-visibility: hidden !important;
    -webkit-font-smoothing: antialiased !important;
}

/* 🔹 OPTYMALIZACJA WYDAJNOŚCI 🔹 */
.addon-item {
    transform: translateZ(0) !important;
    will-change: transform !important;
    contain: content !important;
}

/* 🔹 ZAPOBIEGANIE LAGOM 🔹 */
.sw-tab-content {
    transform: translateZ(0) !important;
    -webkit-overflow-scrolling: touch !important;
}

/* 🔹 USUŃ NIE POTRZEBNĄ PUSTĄ PRZESTRZEŃ 🔹 */
.sw-tab-content:after {
    content: '' !important;
    display: block !important;
    height: 0 !important;
    clear: both !important;
}

/* 🔹 STYL DLA KOMUNIKATU W DODATKACH 🔹 */
#swAddonsMessage {
    flex-shrink: 0 !important;
    margin-top: 10px !important;
    padding: 0 15px !important;
}

/* 🔹 RESPONSYWNOŚĆ 🔹 */
@media (max-width: 750px) {
    #swAddonsPanel {
        width: 550px !important;
        min-width: 400px !important;
        max-width: 550px !important;
        left: 10px !important;
        height: 500px !important;
        min-height: 300px !important;
        max-height: 500px !important;
    }
    
    .category-filters {
        flex-direction: column;
        gap: 8px;
    }
    
    .category-filter-item {
        width: 100%;
    }
    
    .tablink {
        padding: 8px 3px;
        font-size: 10px;
    }
    
    .license-modal-content {
        width: 90%;
        max-width: 350px;
    }
}
        `;
        document.head.appendChild(style);
        console.log('✅ CSS injected');
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

    // 🔹 Setup zmiany rozmiaru panelu
    function setupResize() {
        const panel = document.getElementById('swAddonsPanel');
        const resizeHandle = document.getElementById('swResizeHandle');
        const resizeIndicator = document.getElementById('swResizeIndicator');
        
        if (!panel || !resizeHandle) return;
        
        let isResizing = false;
        let startX, startY;
        let startWidth, startHeight;
        
        resizeHandle.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(getComputedStyle(panel).width, 10);
            startHeight = parseInt(getComputedStyle(panel).height, 10);
            
            resizeHandle.classList.add('resizing');
            
            if (resizeIndicator) {
                resizeIndicator.style.display = 'block';
                updateResizeIndicator();
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('mouseleave', onMouseUp);
            
            e.preventDefault();
            e.stopPropagation();
        });
        
        function onMouseMove(e) {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newWidth = startWidth + deltaX;
            let newHeight = startHeight + deltaY;
            
            // Ograniczenia rozmiaru
            const minWidth = 400;
            const minHeight = 300;
            const maxWidth = 1200;
            const maxHeight = 800;
            
            newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
            newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
            
            panel.style.width = newWidth + 'px';
            panel.style.height = newHeight + 'px';
            
            if (resizeIndicator) {
                updateResizeIndicator();
            }
            
            // Zapobiegaj zaznaczaniu tekstu podczas przeciągania
            e.preventDefault();
            e.stopPropagation();
        }
        
        function onMouseUp(e) {
            if (!isResizing) return;
            
            isResizing = false;
            resizeHandle.classList.remove('resizing');
            
            if (resizeIndicator) {
                resizeIndicator.style.display = 'none';
            }
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mouseleave', onMouseUp);
            
            // Zapisz rozmiar panelu
            SW.GM_setValue(CONFIG.PANEL_SIZE, {
                width: panel.style.width,
                height: panel.style.height
            });
            
            console.log('💾 Saved panel size');
        }
        
        function updateResizeIndicator() {
            if (!resizeIndicator) return;
            const width = parseInt(getComputedStyle(panel).width, 10);
            const height = parseInt(getComputedStyle(panel).height, 10);
            resizeIndicator.textContent = `${width}x${height}`;
        }
        
        console.log('✅ Resize functionality added');
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
        
        // Tworzymy elementy
        createToggleButton();
        createMainPanel();
        createLicenseModal();
        
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
        setupResize(); // Dodano setup resize
        setupKeyboardShortcut();
        
        // Sprawdzamy licencję
        await checkLicenseOnStart();
        
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
            <img src="https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/icon.jpg" 
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
                <strong>SYNERGY WRAITH</strong>
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
                            <span class="license-status-label">Status:</span>
                            <span id="swLicenseStatus" class="license-status-invalid">Nieaktywna</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">ID Konta:</span>
                            <span id="swAccountId" class="license-status-value">-</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">Wygaśnie:</span>
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
                        <div class="info-header">Historia zmian</div>
                        
                        <div class="info-patch-notes">
                            ${VERSION_INFO.patchNotes.map(note => `<li>${note}</li>`).join('')}
                        </div>
                        
                        <div class="info-footer">
                            © 2024 Synergy Wraith Panel • Wszelkie prawa zastrzeżone
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Dodano uchwyt do zmiany rozmiaru -->
            <div id="swResizeHandle" title="Zmień rozmiar panelu"></div>
            <div id="swResizeIndicator"></div>
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
            if (e.target.closest('.tablink') || e.target.id === 'swPanelClose' || e.target.id === 'swResizeHandle') return;
            
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

    // 🔹 Obsługa skrótu klawiszowego z zapobieganiem domyślnym akcjom przeglądarki
    function handleKeyboardShortcut(e) {
        // Ignoruj jeśli użytkownik wpisuje skrót
        if (isShortcutInputFocused) return;
        
        // Rozdzielamy zapisany skrót
        const shortcutParts = customShortcut.split('+');
        
        // Sprawdzamy czy skrót zawiera Ctrl
        const hasCtrl = shortcutParts.includes('Ctrl');
        const hasShift = shortcutParts.includes('Shift');
        const key = shortcutParts[shortcutParts.length - 1].toUpperCase();
        
        // Sprawdzamy warunki
        const ctrlMatch = hasCtrl ? e.ctrlKey : true;
        const shiftMatch = hasShift ? e.shiftKey : true;
        const keyMatch = e.key.toUpperCase() === key;
        
        if (ctrlMatch && shiftMatch && keyMatch) {
            // Blokuj domyślne akcje przeglądarki dla popularnych skrótów
            const blockedShortcuts = ['P', 'S', 'O', 'N', 'W', 'T', 'U', 'I'];
            if (hasCtrl && blockedShortcuts.includes(key)) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            const toggleBtn = document.getElementById('swPanelToggle');
            if (toggleBtn) {
                toggleBtn.click();
                toggleBtn.click(); // Podwójne kliknięcie dla toggle
            }
        }
    }

    // 🔹 Ustawianie nowego skrótu klawiszowego z obsługą Ctrl i Shift
    function setupShortcutInput() {
        const shortcutInput = document.getElementById('shortcutInput');
        const shortcutSetBtn = document.getElementById('shortcutSetBtn');
        
        if (!shortcutInput || !shortcutSetBtn) return;
        
        // Załaduj zapisany skrót
        const savedShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        customShortcut = savedShortcut;
        shortcutInput.value = customShortcut;
        
        // Nasłuchuj kliknięcie przycisku "Ustaw skrót"
        shortcutSetBtn.addEventListener('click', function() {
            isShortcutInputFocused = true;
            shortcutInput.style.borderColor = '#ff9900';
            shortcutInput.style.boxShadow = '0 0 10px rgba(255, 153, 0, 0.5)';
            shortcutInput.value = 'Wciśnij kombinację klawiszy...';
            shortcutKeys = [];
            
            // Tymczasowy nasłuchiwacz klawiatury
            const keyDownHandler = function(e) {
                // Ignoruj powtarzające się zdarzenia
                if (e.repeat) return;
                
                // Zbieraj wciśnięte klawisze
                const key = e.key.toUpperCase();
                
                // Dodaj klawisze modyfikujące
                if (e.ctrlKey && !shortcutKeys.includes('Ctrl')) {
                    shortcutKeys.push('Ctrl');
                }
                if (e.shiftKey && !shortcutKeys.includes('Shift')) {
                    shortcutKeys.push('Shift');
                }
                
                // Dodaj klawisz główny (A-Z, 0-9)
                if (key.length === 1 && /[A-Z0-9]/.test(key) && !shortcutKeys.includes(key)) {
                    shortcutKeys.push(key);
                }
                
                // Aktualizuj wyświetlany skrót
                if (shortcutKeys.length > 0) {
                    shortcutInput.value = shortcutKeys.join('+');
                }
            };
            
            const keyUpHandler = function(e) {
                const key = e.key.toUpperCase();
                
                // Jeśli puszczono klawisz główny, zakończ ustawianie
                if (key.length === 1 && /[A-Z0-9]/.test(key)) {
                    // Sprawdź czy mamy przynajmniej Ctrl i klawisz główny
                    if (shortcutKeys.includes('Ctrl') && shortcutKeys.length >= 2) {
                        customShortcut = shortcutKeys.join('+');
                        shortcutInput.value = customShortcut;
                        SW.GM_setValue(CONFIG.CUSTOM_SHORTCUT, customShortcut);
                        setupKeyboardShortcut();
                        
                        // Usuń nasłuchiwanie
                        document.removeEventListener('keydown', keyDownHandler);
                        document.removeEventListener('keyup', keyUpHandler);
                        isShortcutInputFocused = false;
                        shortcutInput.style.borderColor = '#333';
                        shortcutInput.style.boxShadow = 'none';
                        
                        // Pokaż komunikat
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
                        // Jeśli brak Ctrl, zresetuj i pokaż błąd
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
                
                // Jeśli puszczono Escape, anuluj
                if (e.key === 'Escape') {
                    shortcutInput.value = customShortcut;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    isShortcutInputFocused = false;
                    shortcutInput.style.borderColor = '#333';
                    shortcutInput.style.boxShadow = 'none';
                }
            };
            
            // Dodaj nasłuchiwanie klawiatury
            document.addEventListener('keydown', keyDownHandler);
            document.addEventListener('keyup', keyUpHandler);
            
            // Usuń nasłuchiwanie po 10 sekundach
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

        // Zamknięcie modala po kliknięciu poza nim
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
        
        // Filtruj dodatki według kategorii i wyszukiwania
        const filteredAddons = sortedAddons.filter(addon => {
            const showEnabled = activeCategories.enabled && addon.enabled;
            const showDisabled = activeCategories.disabled && !addon.enabled;
            const showFavorites = activeCategories.favorites && addon.favorite;
            
            const categoryMatch = showEnabled || showDisabled || showFavorites;
            
            // Wyszukiwanie - priorytet na nazwę, potem opis
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
        
        // Jeśli brak skrótów
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
        renderShortcuts(); // Odśwież skróty jeśli dodatek został włączony/wyłączony
        console.log(`🔧 Toggle ${addonId}: ${isEnabled ? 'enabled' : 'disabled'}`);
    }

    // 🔹 Reset wszystkich ustawień
    function resetAllSettings() {
        SW.GM_deleteValue(CONFIG.PANEL_POSITION);
        SW.GM_deleteValue(CONFIG.PANEL_VISIBLE);
        SW.GM_deleteValue(CONFIG.PANEL_SIZE); // Dodano usuwanie rozmiaru
        SW.GM_deleteValue(CONFIG.TOGGLE_BTN_POSITION);
        SW.GM_deleteValue(CONFIG.FONT_SIZE);
        SW.GM_deleteValue(CONFIG.BACKGROUND_VISIBLE);
        SW.GM_deleteValue(CONFIG.KCS_ICONS_ENABLED);
        SW.GM_deleteValue(CONFIG.FAVORITE_ADDONS);
        SW.GM_deleteValue(CONFIG.ACTIVE_CATEGORIES);
        SW.GM_deleteValue(CONFIG.CUSTOM_SHORTCUT);
        
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
        
        // Zresetuj skrót klawiszowy
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
        
        // Ładowanie zapisanego rozmiaru
        const savedSize = SW.GM_getValue(CONFIG.PANEL_SIZE);
        if (panel && savedSize) {
            panel.style.width = savedSize.width;
            panel.style.height = savedSize.height;
        }
        
        const isVisible = SW.GM_getValue(CONFIG.PANEL_VISIBLE, false);
        if (panel) {
            panel.style.display = isVisible ? 'block' : 'none';
        }
        
        const savedFontSize = SW.GM_getValue(CONFIG.FONT_SIZE, '12');
        updatePanelFontSize(savedFontSize);
        
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

    // 🔹 Aktywacja licencji
    function activateLicense(licenseKey) {
        console.log('🔐 Activating license:', licenseKey);
        
        // Symulacja aktywacji licencji
        isLicenseVerified = true;
        userAccountId = 'USER_' + Math.random().toString(36).substr(2, 9).toUpperCase();
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

    // 🔹 Update wyświetlania licencji
    function updateLicenseDisplay() {
        const statusEl = document.getElementById('swLicenseStatus');
        const accountEl = document.getElementById('swAccountId');
        const expiryEl = document.getElementById('swLicenseExpiry');
        const serverEl = document.getElementById('swServerStatus');
        
        if (statusEl) {
            statusEl.textContent = isLicenseVerified ? 'Aktywna' : 'Nieaktywna';
            statusEl.className = isLicenseVerified ? 'license-status-valid' : 'license-status-invalid';
        }
        
        if (accountEl) {
            accountEl.textContent = userAccountId || '-';
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

    // 🔹 Check licencji na starcie
    async function checkLicenseOnStart() {
        console.log('🔍 Checking license on start...');
        
        const savedKey = SW.GM_getValue(CONFIG.LICENSE_KEY);
        const savedActive = SW.GM_getValue(CONFIG.LICENSE_ACTIVE, false);
        const savedExpiry = SW.GM_getValue(CONFIG.LICENSE_EXPIRY);
        
        if (savedKey && savedActive) {
            isLicenseVerified = true;
            userAccountId = 'USER_' + savedKey.substr(0, 8).toUpperCase();
            
            if (savedExpiry) {
                licenseExpiry = new Date(savedExpiry);
                const now = new Date();
                if (licenseExpiry < now) {
                    isLicenseVerified = false;
                    console.log('⚠️ License expired');
                }
            } else {
                licenseExpiry = new Date();
                licenseExpiry.setFullYear(licenseExpiry.getFullYear() + 1);
            }
            
            // Test połączenia z serwerem
            serverConnected = true; // Symulacja
            
            console.log('✅ License verified');
        } else {
            console.log('⚠️ No valid license found');
        }
        
        updateLicenseDisplay();
        console.log('✅ License verification complete');
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
