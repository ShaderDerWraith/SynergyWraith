// synergy.js - Główny kod panelu z nowymi ustawieniami
(function() {
    'use strict';

    console.log('🚀 SynergyWraith Panel v1.5 loaded');

    // 🔹 Konfiguracja
    const CONFIG = {
        PANEL_POSITION: "sw_panel_position",
        PANEL_VISIBLE: "sw_panel_visible",
        TOGGLE_BTN_POSITION: "sw_toggle_button_position",
        KCS_ICONS_ENABLED: "kcs_icons_enabled",
        FAVORITE_ADDONS: "sw_favorite_addons",
        FONT_SIZE: "sw_panel_font_size",
        BACKGROUND_VISIBLE: "sw_panel_background",
        LICENSE_LIST_URL: "https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/LICENSE"
    };

    // 🔹 Lista dostępnych dodatków
    const ADDONS = [
        {
            id: 'kcs-icons',
            name: 'KCS i Zwój Ikony',
            description: 'Pokazuje ikony potworów na Kamieniach i Zwojach Czerwonego Smoka',
            enabled: true,
            favorite: false
        },
        {
            id: 'auto-looter',
            name: 'Auto Looter',
            description: 'Automatycznie zbiera przedmioty z potworów',
            enabled: false,
            favorite: false
        },
        {
            id: 'quest-helper',
            name: 'Pomocnik Questów',
            description: 'Wskazuje lokalizację zadań i wymagane przedmioty',
            enabled: false,
            favorite: false
        },
        {
            id: 'enhanced-stats',
            name: 'Rozszerzone Statystyki',
            description: 'Pokazuje szczegółowe statystyki postaci i przedmiotów',
            enabled: false,
            favorite: false
        },
        {
            id: 'trade-helper',
            name: 'Asystent Handlu',
            description: 'Pomaga w handlu, wyświetla ceny rynkowe',
            enabled: false,
            favorite: false
        },
        {
            id: 'combat-log',
            name: 'Dziennik Walki',
            description: 'Szczegółowy log obrażeń i efektów w walce',
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
    let currentAddons = [...ADDONS];

    // 🔹 Funkcja zapobiegająca zmianom rozmiaru
    function preventPanelResize() {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        // Ustaw stałe wymiary
        panel.style.minWidth = '400px'; // Zwiększono szerokość
        panel.style.maxWidth = '400px';
        panel.style.width = '400px';
        panel.style.resize = 'none';
        
        // Obserwuj zmiany w DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Przywróć oryginalne style jeśli zostały zmienione
                    panel.style.minWidth = '400px';
                    panel.style.maxWidth = '400px';
                    panel.style.width = '400px';
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
                        item.style.maxHeight = '40px';
                    });
                }
            });
        });
        
        innerObserver.observe(panel, { childList: true, subtree: true });
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

/* 🔹 MAIN PANEL - WIĘKSZY 🔹 */
#swAddonsPanel {
    position: fixed;
    top: 140px;
    left: 70px;
    width: 400px; /* Zwiększono szerokość */
    min-height: 500px; /* Minimalna wysokość */
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
    font-size: 12px; /* Bazowy rozmiar czcionki */
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
    height: calc(100% - 90px); /* Wysokość dostosowana do zawartości */
    overflow-y: auto; /* Scrollowanie wewnątrz zakładki */
}

/* 🔹 TABS STYLES 🔹 */
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
    margin: 0 5px;
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
    padding: 15px;
    height: 100%;
    overflow: hidden;
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

.tabcontent h3 {
    margin: 0 0 15px 0;
    color: #00ff00;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid #333;
    padding-bottom: 8px;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
    position: relative;
}

.tabcontent h3::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 50px;
    height: 1px;
    background: #ff0000;
    box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

/* 🔹 SEKCJE DODATKÓW Z PRZEŁĄCZNIKAMI 🔹 */
.addons-section {
    margin-bottom: 20px;
    border: 1px solid #333;
    border-radius: 6px;
    overflow: hidden;
}

.section-header {
    background: rgba(20, 20, 20, 0.8);
    padding: 10px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    border-bottom: 1px solid transparent;
}

.section-header:hover {
    background: rgba(30, 30, 30, 0.9);
}

.section-title {
    color: #00ff00;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-count {
    background: rgba(0, 255, 0, 0.2);
    color: #00ff00;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: bold;
}

.section-toggle {
    background: none;
    border: none;
    color: #00ff00;
    cursor: pointer;
    font-size: 18px;
    transition: transform 0.3s ease;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.section-content {
    background: rgba(10, 10, 10, 0.9);
    padding: 15px;
    max-height: 300px; /* Maksymalna wysokość przed scrollowaniem */
    overflow-y: auto;
}

/* 🔹 ADDONS LIST - KOMPAKTOWY 🔹 */
.addon-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.addon-list-empty {
    text-align: center !important;
    color: #666 !important;
    font-size: 12px !important;
    padding: 20px !important;
    font-style: italic !important;
}

.addon-item {
    background: rgba(30, 30, 30, 0.8) !important;
    border: 1px solid #333 !important;
    border-radius: 5px !important;
    padding: 10px 12px !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    min-height: 50px !important;
    max-height: none !important;
    overflow: hidden !important;
}

.addon-item:hover {
    background: rgba(40, 40, 40, 0.9) !important;
    border-color: #444 !important;
}

.addon-item-header {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 !important;
    min-height: auto !important;
}

.addon-item-title {
    font-weight: 600 !important;
    color: #00ff00 !important;
    font-size: 13px !important;
    text-shadow: 0 0 3px rgba(0, 255, 0, 0.3) !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    line-height: 1.3 !important;
    margin-bottom: 4px !important;
}

.addon-item-description {
    color: #888 !important;
    font-size: 11px !important;
    line-height: 1.2 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
}

.addon-item-actions {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    flex-shrink: 0 !important;
}

/* 🔹 FAVORITE STAR 🔹 */
.favorite-btn {
    background: none !important;
    border: none !important;
    color: #888 !important;
    cursor: pointer !important;
    padding: 4px !important;
    font-size: 16px !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 4px !important;
    width: 24px !important;
    height: 24px !important;
    min-width: 24px !important;
    min-height: 24px !important;
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
    width: 40px !important;
    height: 20px !important;
    flex-shrink: 0 !important;
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
    border-radius: 20px !important;
    border: 1px solid #555 !important;
}

.slider:before {
    position: absolute !important;
    content: "" !important;
    height: 16px !important;
    width: 16px !important;
    left: 2px !important;
    bottom: 2px !important;
    background-color: #00ff00 !important;
    transition: .3s !important;
    border-radius: 50% !important;
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.5) !important;
}

input:checked + .slider {
    background-color: #003300 !important;
    border-color: #00ff00 !important;
}

input:checked + .slider:before {
    transform: translateX(20px) !important;
    background-color: #00ff00 !important;
    box-shadow: 0 0 8px rgba(0, 255, 0, 0.8) !important;
}

/* 🔹 LICENSE SYSTEM 🔹 */
.license-container {
    text-align: center;
    padding: 20px 0;
}

.license-input {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 5px;
    color: #00ff00;
    font-size: 12px;
    transition: all 0.3s ease;
}

.license-input:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
    background: rgba(40, 40, 40, 0.9);
}

.license-button {
    width: 100%;
    padding: 10px;
    background: linear-gradient(to right, #003300, #006600);
    color: #00ff00;
    border: 1px solid #00ff00;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
    font-size: 12px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.license-button:hover {
    background: linear-gradient(to right, #006600, #009900);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 0, 0.3);
}

.license-message {
    margin-top: 10px;
    padding: 10px;
    border-radius: 5px;
    font-size: 12px;
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

/* 🔹 LICENSE STATUS IN TAB 🔹 */
.license-status-container {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    padding: 15px;
    margin-top: 20px;
}

.license-status-header {
    color: #00ff00;
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 15px;
    border-bottom: 1px solid #333;
    padding-bottom: 8px;
    text-align: center;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.license-status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 12px;
    padding: 5px 0;
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
}

.license-status-valid {
    color: #00ff00 !important;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.license-status-invalid {
    color: #ff0000 !important;
    text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

/* 🔹 SETTINGS TAB 🔹 */
.settings-item {
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.settings-label {
    display: block;
    color: #00ff00;
    font-size: 13px;
    margin-bottom: 10px;
    font-weight: 600;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

/* 🔹 ROZMIAR CZCIONKI - SUWAK 🔹 */
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
}

.font-size-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
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
    font-size: 13px;
    min-width: 40px;
    text-align: center;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

/* 🔹 WIDOCZNOŚĆ TŁA - PRZEŁĄCZNIK 🔹 */
.background-toggle-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
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
    width: 50px;
    height: 24px;
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
    transform: translateX(26px);
    background-color: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
}

/* 🔹 PRZYCISK RESETUJ USTAWIENIA 🔹 */
.reset-settings-container {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #333;
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
    color: #ff0000;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
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

/* 🔹 DODATKOWE STYLE DLA PANELU BEZ TŁA 🔹 */
#swAddonsPanel.transparent-background {
    background: transparent !important;
    backdrop-filter: none !important;
    box-shadow: 0 0 30px rgba(255, 0, 0, 0.6) !important;
    border: 3px solid #00ff00 !important;
}

#swAddonsPanel.transparent-background::before {
    display: none !important;
}

#swAddonsPanel.transparent-background #swPanelHeader,
#swAddonsPanel.transparent-background .tab-container,
#swAddonsPanel.transparent-background .sw-tab-content,
#swAddonsPanel.transparent-background .addon-item,
#swAddonsPanel.transparent-background .settings-item,
#swAddonsPanel.transparent-background .license-status-container,
#swAddonsPanel.transparent-background .addons-section,
#swAddonsPanel.transparent-background .section-header,
#swAddonsPanel.transparent-background .section-content {
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

/* 🔹 ZAPOBIEGANIE ROZCIĄGANIU 🔹 */
#swAddonsPanel {
    min-width: 400px !important;
    max-width: 400px !important;
    width: 400px !important;
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
.section-content::-webkit-scrollbar {
    width: 8px;
}

.sw-tab-content::-webkit-scrollbar-track,
.section-content::-webkit-scrollbar-track {
    background: rgba(20, 20, 20, 0.8);
    border-radius: 4px;
}

.sw-tab-content::-webkit-scrollbar-thumb,
.section-content::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #00ff00, #006600);
    border-radius: 4px;
}

.sw-tab-content::-webkit-scrollbar-thumb:hover,
.section-content::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #00ff00, #009900);
}

/* 🔹 RESPONSYWNOŚĆ 🔹 */
@media (max-width: 450px) {
    #swAddonsPanel {
        width: 350px !important;
        min-width: 350px !important;
        max-width: 350px !important;
        left: 10px !important;
    }
    
    .tablink {
        padding: 10px 5px;
        font-size: 11px;
    }
    
    .license-status-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 3px;
    }
    
    .license-status-value {
        max-width: 100%;
        text-align: left;
    }
    
    .font-size-container {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .font-size-slider {
        width: 100%;
    }
    
    .background-toggle-container {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}
        `;
        document.head.appendChild(style);
        console.log('✅ CSS injected');
    }

    // 🔹 Główne funkcje
    async function initPanel() {
        console.log('✅ Initializing panel...');
        
        // Wstrzyknij CSS
        injectCSS();
        
        // Ładujemy zapisane dodatki
        loadAddonsState();
        
        // Tworzymy elementy
        createToggleButton();
        createMainPanel();
        
        // 🔹 Zapobiegaj zmianom rozmiaru
        preventPanelResize();
        
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
        
        // Sprawdzamy licencję
        await checkLicenseOnStart();
        
        // 🔹 ZAŁADUJ DODATKI PO WERYFIKACJI LICENCJI
        if (isLicenseVerified) {
            loadEnabledAddons();
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
        
        panel.innerHTML = `
            <div id="swPanelHeader">
                <strong>SYNERGY WRAITH PANEL</strong>
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
                <button class="tablink" data-tab="status">Status</button>
                <button class="tablink" data-tab="settings">Ustawienia</button>
            </div>

            <div id="addons" class="tabcontent active">
                <h3>Dodatki</h3>
                <div class="sw-tab-content">
                    <div class="addons-section" id="enabled-section">
                        <div class="section-header" data-section="enabled">
                            <div class="section-title">
                                <span>Włączone</span>
                                <span class="section-count" id="enabled-count">0</span>
                            </div>
                            <button class="section-toggle">▼</button>
                        </div>
                        <div class="section-content" id="addon-enabled">
                            <!-- Włączone dodatki zostaną dodane dynamicznie -->
                        </div>
                    </div>
                    
                    <div class="addons-section" id="disabled-section">
                        <div class="section-header" data-section="disabled">
                            <div class="section-title">
                                <span>Wyłączone</span>
                                <span class="section-count" id="disabled-count">0</span>
                            </div>
                            <button class="section-toggle">▼</button>
                        </div>
                        <div class="section-content" id="addon-disabled">
                            <!-- Wyłączone dodatki zostaną dodane dynamicznie -->
                        </div>
                    </div>
                    
                    <div class="addons-section" id="favorites-section">
                        <div class="section-header" data-section="favorites">
                            <div class="section-title">
                                <span>Ulubione</span>
                                <span class="section-count" id="favorites-count">0</span>
                            </div>
                            <button class="section-toggle">▼</button>
                        </div>
                        <div class="section-content" id="addon-favorites">
                            <!-- Ulubione dodatki zostaną dodane dynamicznie -->
                        </div>
                    </div>
                </div>
                <div id="swAddonsMessage" class="license-message" style="display: none;"></div>
            </div>

            <div id="status" class="tabcontent">
                <h3>Status Licencji</h3>
                <div class="sw-tab-content">
                    <div class="license-status-container">
                        <div class="license-status-header">Status Licencji</div>
                        <div class="license-status-item">
                            <span class="license-status-label">Status:</span>
                            <span id="swLicenseStatus" class="license-status-invalid">Weryfikacja...</span>
                        </div>
                        <div class="license-status-item">
                            <span class="license-status-label">ID Konta:</span>
                            <span id="swAccountId" class="license-status-value">-</span>
                        </div>
                    </div>
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>

            <div id="settings" class="tabcontent">
                <h3>Ustawienia Panelu</h3>
                <div class="sw-tab-content">
                    <div class="settings-item">
                        <div class="font-size-container">
                            <label class="settings-label">Rozmiar czcionki:</label>
                            <input type="range" min="10" max="20" value="12" class="font-size-slider" id="fontSizeSlider">
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
                    
                    <div class="reset-settings-container">
                        <button class="reset-settings-button" id="swResetButton">
                            <span class="reset-settings-icon">↻</span>
                            Resetuj wszystkie ustawienia
                        </button>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top: 10px; padding: 10px; border-radius: 5px; display: none;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        renderAddons();
        setupSectionToggles();
        console.log('✅ Panel created');
    }

    function setupSectionToggles() {
        // Przełączanie sekcji (rozwijanie/zwijanie)
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', function(e) {
                if (e.target.classList.contains('section-toggle')) return;
                
                const section = this.parentElement;
                const content = section.querySelector('.section-content');
                const toggle = section.querySelector('.section-toggle');
                
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    toggle.textContent = '▼';
                } else {
                    content.style.display = 'none';
                    toggle.textContent = '▶';
                }
            });
        });

        // Przyciski przełączania
        document.querySelectorAll('.section-toggle').forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.stopPropagation();
                const section = this.closest('.addons-section');
                const content = section.querySelector('.section-content');
                
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    this.textContent = '▼';
                } else {
                    content.style.display = 'none';
                    this.textContent = '▶';
                }
            });
        });
    }

    function renderAddons() {
        const enabledContainer = document.getElementById('addon-enabled');
        const disabledContainer = document.getElementById('addon-disabled');
        const favoritesContainer = document.getElementById('addon-favorites');
        
        // Wyczyść kontenery
        enabledContainer.innerHTML = '';
        disabledContainer.innerHTML = '';
        favoritesContainer.innerHTML = '';
        
        // Liczniki
        let enabledCount = 0;
        let disabledCount = 0;
        let favoritesCount = 0;
        
        // Sortuj dodatki alfabetycznie
        const sortedAddons = [...currentAddons].sort((a, b) => a.name.localeCompare(b.name));
        
        // Podziel dodatki na kategorie
        const enabledAddons = sortedAddons.filter(addon => addon.enabled);
        const disabledAddons = sortedAddons.filter(addon => !addon.enabled);
        const favoriteAddons = sortedAddons.filter(addon => addon.favorite);
        
        // Renderuj włączone dodatki
        if (enabledAddons.length > 0) {
            enabledAddons.forEach(addon => {
                enabledContainer.appendChild(createAddonElement(addon));
                enabledCount++;
            });
        } else {
            enabledContainer.innerHTML = '<div class="addon-list-empty">Brak włączonych dodatków</div>';
        }
        
        // Renderuj wyłączone dodatki
        if (disabledAddons.length > 0) {
            disabledAddons.forEach(addon => {
                disabledContainer.appendChild(createAddonElement(addon));
                disabledCount++;
            });
        } else {
            disabledContainer.innerHTML = '<div class="addon-list-empty">Brak wyłączonych dodatków</div>';
        }
        
        // Renderuj ulubione dodatki
        if (favoriteAddons.length > 0) {
            favoriteAddons.forEach(addon => {
                favoritesContainer.appendChild(createAddonElement(addon));
                favoritesCount++;
            });
        } else {
            favoritesContainer.innerHTML = '<div class="addon-list-empty">Brak ulubionych dodatków</div>';
        }
        
        // Aktualizuj liczniki
        document.getElementById('enabled-count').textContent = enabledCount;
        document.getElementById('disabled-count').textContent = disabledCount;
        document.getElementById('favorites-count').textContent = favoritesCount;
    }

    function createAddonElement(addon) {
        const div = document.createElement('div');
        div.className = 'addon-item';
        div.dataset.id = addon.id;
        
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

    function setupTabs() {
        const tabs = document.querySelectorAll('.tablink');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const tabName = this.getAttribute('data-tab');
                
                // Usuń aktywny stan ze wszystkich zakładek
                tabs.forEach(t => {
                    t.classList.remove('active');
                });
                
                // Dodaj aktywny stan do klikniętej zakładki
                this.classList.add('active');
                
                // Ukryj wszystkie zakładki
                const tabContents = document.querySelectorAll('.tabcontent');
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Pokaż wybraną zakładkę
                const tabContent = document.getElementById(tabName);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
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
            if (e.target.closest('.tablink')) return;
            
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
        // Rozmiar czcionki
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            // Ustaw początkową wartość
            const savedSize = SW.GM_getValue(CONFIG.FONT_SIZE, '12');
            fontSizeSlider.value = savedSize;
            fontSizeValue.textContent = savedSize + 'px';
            
            fontSizeSlider.addEventListener('input', function() {
                const size = this.value;
                fontSizeValue.textContent = size + 'px';
                const panel = document.getElementById('swAddonsPanel');
                if (panel) {
                    // Ustaw rozmiar czcionki dla panelu
                    panel.style.fontSize = size + 'px';
                }
                SW.GM_setValue(CONFIG.FONT_SIZE, size);
            });
        }

        // Widoczność tła
        const backgroundToggle = document.getElementById('backgroundToggle');
        if (backgroundToggle) {
            // Ustaw początkowy stan
            const isVisible = SW.GM_getValue(CONFIG.BACKGROUND_VISIBLE, true);
            backgroundToggle.checked = isVisible;
            updateBackgroundVisibility(isVisible);
            
            backgroundToggle.addEventListener('change', function() {
                const isVisible = this.checked;
                SW.GM_setValue(CONFIG.BACKGROUND_VISIBLE, isVisible);
                updateBackgroundVisibility(isVisible);
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

        // Delegowane nasłuchiwanie dla dodatków
        document.addEventListener('click', function(e) {
            // Obsługa ulubionych
            if (e.target.classList.contains('favorite-btn') || e.target.closest('.favorite-btn')) {
                const btn = e.target.classList.contains('favorite-btn') ? e.target : e.target.closest('.favorite-btn');
                const addonId = btn.dataset.id;
                toggleFavorite(addonId);
            }
            
            // Obsługa przełączników
            if (e.target.type === 'checkbox' && e.target.closest('.addon-item')) {
                const addonId = e.target.dataset.id;
                const isEnabled = e.target.checked;
                toggleAddon(addonId, isEnabled);
            }
        });

        console.log('✅ Event listeners setup complete');
    }

    function toggleFavorite(addonId) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        
        currentAddons[addonIndex].favorite = !currentAddons[addonIndex].favorite;
        
        // Zapisz ulubione
        const favoriteIds = currentAddons
            .filter(a => a.favorite)
            .map(a => a.id);
        SW.GM_setValue(CONFIG.FAVORITE_ADDONS, favoriteIds);
        
        // Przerenderuj dodatki
        renderAddons();
        
        console.log(`⭐ Toggle favorite for ${addonId}: ${currentAddons[addonIndex].favorite}`);
    }

    function toggleAddon(addonId, isEnabled) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        
        currentAddons[addonIndex].enabled = isEnabled;
        
        // Dla KCS Icons dodatku
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
            
            console.log('💾 KCS Icons ' + (isEnabled ? 'włączony' : 'wyłączony') + ' - wymagane odświeżenie gry');
            
            // Jeśli licencja zweryfikowana i KCS włączony, uruchom dodatek
            if (isLicenseVerified && isEnabled) {
                setTimeout(initKCSIcons, 100);
            }
        }
        
        // Przerenderuj dodatki
        renderAddons();
        
        console.log(`🔧 Toggle ${addonId}: ${isEnabled ? 'enabled' : 'disabled'}`);
    }

    function resetAllSettings() {
        // Resetuj wszystkie ustawienia
        SW.GM_deleteValue(CONFIG.PANEL_POSITION);
        SW.GM_deleteValue(CONFIG.PANEL_VISIBLE);
        SW.GM_deleteValue(CONFIG.TOGGLE_BTN_POSITION);
        SW.GM_deleteValue(CONFIG.FONT_SIZE);
        SW.GM_deleteValue(CONFIG.BACKGROUND_VISIBLE);
        SW.GM_deleteValue(CONFIG.KCS_ICONS_ENABLED);
        SW.GM_deleteValue(CONFIG.FAVORITE_ADDONS);
        
        // Przywróć domyślne ustawienia dodatków
        currentAddons = ADDONS.map(addon => ({
            ...addon,
            enabled: addon.id === 'kcs-icons' ? true : false,
            favorite: false
        }));
        
        // Pokaż komunikat w panelu
        const resetMessage = document.getElementById('swResetMessage');
        if (resetMessage) {
            resetMessage.textContent = 'Ustawienia zresetowane!';
            resetMessage.style.background = 'rgba(0, 204, 255, 0.1)';
            resetMessage.style.color = '#00ccff';
            resetMessage.style.border = '1px solid #00ccff';
            resetMessage.style.display = 'block';
            
            setTimeout(() => {
                resetMessage.style.display = 'none';
            }, 5000);
        }
        
        // Odśwież ustawienia
        loadSavedState();
        renderAddons();
        
        // Zresetuj rozmiar czcionki i tło
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.value = '12';
            fontSizeValue.textContent = '12px';
            document.getElementById('swAddonsPanel').style.fontSize = '12px';
        }
        
        const backgroundToggle = document.getElementById('backgroundToggle');
        if (backgroundToggle) {
            backgroundToggle.checked = true;
            updateBackgroundVisibility(true);
        }
    }

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
        
        // Załaduj rozmiar czcionki (już ustawione w setupEventListeners)
        // Załaduj widoczność tła (już ustawione w setupEventListeners)
        
        console.log('✅ Saved state loaded');
    }

    function loadAddonsState() {
        // Załaduj zapisane ulubione
        const favoriteIds = SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []);
        
        // Załaduj stan KCS Icons
        const kcsEnabled = SW.GM_getValue(CONFIG.KCS_ICONS_ENABLED, true);
        
        // Aktualizuj listę dodatków
        currentAddons = ADDONS.map(addon => ({
            ...addon,
            enabled: addon.id === 'kcs-icons' ? kcsEnabled : false,
            favorite: favoriteIds.includes(addon.id)
        }));
        
        console.log('✅ Addons state loaded');
    }

    function loadEnabledAddons() {
        console.log('🔓 Ładowanie dodatków...');
        
        if (!isLicenseVerified) {
            console.log('⏩ Licencja niezweryfikowana, pomijam ładowanie dodatków');
            return;
        }
        
        // Sprawdź czy KCS Icons jest włączony
        const kcsAddon = currentAddons.find(a => a.id === 'kcs-icons');
        if (kcsAddon && kcsAddon.enabled) {
            console.log('✅ KCS Icons włączony, uruchamiam dodatek...');
            setTimeout(initKCSIcons, 100);
        } else {
            console.log('⏩ KCS Icons jest wyłączony, pomijam ładowanie');
        }
    }

    // 🔹 Przykładowe pozostałe funkcje (dla kompletności):
    async function checkLicenseOnStart() {
        console.log('🔍 Checking license on start...');
        // Tutaj byłaby logika weryfikacji licencji
        isLicenseVerified = true; // Tymczasowo ustawione na true dla testów
        console.log('✅ License verification complete');
    }

    function initKCSIcons() {
        console.log('🔄 Initializing KCS Icons addon...');
        // Tutaj byłaby logika inicjalizacji dodatku KCS Icons
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
