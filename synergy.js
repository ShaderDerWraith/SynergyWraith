// synergy.js - Główny kod panelu z nowymi ustawieniami
(function() {
    'use strict';

    console.log('🚀 SynergyWraith Panel v1.2 loaded');

    // 🔹 Konfiguracja
    const CONFIG = {
        PANEL_POSITION: "sw_panel_position",
        PANEL_VISIBLE: "sw_panel_visible",
        TOGGLE_BTN_POSITION: "sw_toggle_button_position",
        KCS_ICONS_ENABLED: "kcs_icons_enabled",
        FONT_SIZE: "sw_panel_font_size",
        BACKGROUND_VISIBLE: "sw_panel_background",
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

/* 🔹 MAIN PANEL 🔹 */
#swAddonsPanel {
    position: fixed;
    top: 140px;
    left: 70px;
    width: 350px;
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
    font-size: 12px;
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

/* 🔹 ADDONS LIST - UPROSZCZONY 🔹 */
.addon {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 8px;
    transition: all 0.3s ease;
}

.addon-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5px;
}

.addon-title {
    font-weight: 600;
    color: #00ff00;
    font-size: 12px;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.addon-description {
    color: #aaaaaa;
    font-size: 11px;
    line-height: 1.3;
    margin-bottom: 5px;
}

/* 🔹 SWITCH STYLE - ZMNIEJSZONY 🔹 */
.switch {
    position: relative;
    display: inline-block;
    width: 32px;
    height: 16px;
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
    border-radius: 16px;
    border: 1px solid #555;
}

.slider:before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    left: 2px;
    bottom: 2px;
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
    transform: translateX(16px);
    background-color: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
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
    margin-bottom: 15px;
    padding: 12px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.settings-label {
    display: block;
    color: #00ff00;
    font-size: 12px;
    margin-bottom: 8px;
    font-weight: 600;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

/* 🔹 ROZMIAR CZCIONKI - SUWAK 🔹 */
.font-size-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
}

.font-size-slider {
    flex: 1;
    -webkit-appearance: none;
    height: 6px;
    background: #333;
    border-radius: 3px;
    outline: none;
}

.font-size-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
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
    font-size: 12px;
    min-width: 30px;
    text-align: center;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
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
    font-size: 12px;
    font-weight: 600;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.background-toggle {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 18px;
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
    border-radius: 18px;
    border: 1px solid #555;
}

.background-toggle-slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 2px;
    bottom: 2px;
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
    transform: translateX(18px);
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
    gap: 8px;
    width: 100%;
    padding: 10px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #333;
    border-radius: 6px;
    color: #ff0000;
    cursor: pointer;
    font-weight: 600;
    font-size: 12px;
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
    font-size: 14px;
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
    box-shadow: 0 0 30px rgba(255, 0, 0, 0.6);
}

#swAddonsPanel.transparent-background .sw-tab-content,
#swAddonsPanel.transparent-background .addon,
#swAddonsPanel.transparent-background .settings-item,
#swAddonsPanel.transparent-background .license-status-container {
    background: rgba(10, 10, 10, 0.9);
    backdrop-filter: blur(5px);
}

#swAddonsPanel.transparent-background .tab-container {
    background: rgba(20, 20, 20, 0.9);
}

/* 🔹 RESPONSYWNOŚĆ 🔹 */
@media (max-width: 400px) {
    #swAddonsPanel {
        width: 300px;
        left: 10px;
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

/* 🔹 SCROLLBAR STYLES 🔹 */
.admin-list::-webkit-scrollbar,
.usage-log::-webkit-scrollbar {
    width: 8px;
}

.admin-list::-webkit-scrollbar-track,
.usage-log::-webkit-scrollbar-track {
    background: rgba(20, 20, 20, 0.8);
    border-radius: 4px;
}

.admin-list::-webkit-scrollbar-thumb,
.usage-log::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #00ff00, #006600);
    border-radius: 4px;
}

.admin-list::-webkit-scrollbar-thumb:hover,
.usage-log::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #00ff00, #009900);
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
                <h3>Aktywne Dodatki</h3>
                <div class="addon">
                    <div class="addon-header">
                        <div>
                            <span class="addon-title">KCS i Zwój Ikony</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="kcsIconsToggle">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="addon-description">Pokazuje ikony potworów na Kamieniach i Zwojach Czerwonego Smoka</div>
                </div>
                <div id="swAddonsMessage" class="license-message" style="display: none;"></div>
            </div>

            <div id="status" class="tabcontent">
                <h3>Status Licencji</h3>
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

            <div id="settings" class="tabcontent">
                <h3>Ustawienia Panelu</h3>
                
                <div class="settings-item">
                    <div class="font-size-container">
                        <label class="settings-label">Rozmiar czcionki:</label>
                        <input type="range" min="10" max="16" value="12" class="font-size-slider" id="fontSizeSlider">
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
        `;
        
        document.body.appendChild(panel);
        console.log('✅ Panel created');
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
            if (e.target.closest('.tablink')) return; // Zapobiegaj przeciąganiu po kliknięciu w zakładkę
            
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
            fontSizeSlider.addEventListener('input', function() {
                const size = this.value;
                fontSizeValue.textContent = size + 'px';
                const panel = document.getElementById('swAddonsPanel');
                if (panel) {
                    panel.style.fontSize = size + 'px';
                }
                SW.GM_setValue(CONFIG.FONT_SIZE, size);
            });
        }

        // Widoczność tła
        const backgroundToggle = document.getElementById('backgroundToggle');
        if (backgroundToggle) {
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
                    messageEl.className = 'license-message license-info';
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

    function resetAllSettings() {
        // Resetuj wszystkie ustawienia
        SW.GM_deleteValue(CONFIG.PANEL_POSITION);
        SW.GM_deleteValue(CONFIG.PANEL_VISIBLE);
        SW.GM_deleteValue(CONFIG.TOGGLE_BTN_POSITION);
        SW.GM_deleteValue(CONFIG.FONT_SIZE);
        SW.GM_deleteValue(CONFIG.BACKGROUND_VISIBLE);
        SW.GM_deleteValue(CONFIG.KCS_ICONS_ENABLED);
        
        // Pokaż komunikat w panelu
        const resetMessage = document.getElementById('swResetMessage');
        if (resetMessage) {
            resetMessage.textContent = 'Ustawienia zresetowane! Panel zostanie odświeżony.';
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
        
        // Załaduj rozmiar czcionki
        const fontSize = SW.GM_getValue(CONFIG.FONT_SIZE, '12');
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue && panel) {
            fontSizeSlider.value = fontSize;
            fontSizeValue.textContent = fontSize + 'px';
            panel.style.fontSize = fontSize + 'px';
        }
        
        // Załaduj widoczność tła
        const backgroundVisible = SW.GM_getValue(CONFIG.BACKGROUND_VISIBLE, true);
        const backgroundToggle = document.getElementById('backgroundToggle');
        if (backgroundToggle && panel) {
            backgroundToggle.checked = backgroundVisible;
            updateBackgroundVisibility(backgroundVisible);
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

    // 🔹 Reszta funkcji pozostaje bez zmian
    function getUserAccountId() {
        // Metoda 1: Próba pobrania z localStorage Margonem
        try {
            const margonemData = localStorage.getItem('margonem_user_data');
            if (margonemData) {
                const userData = JSON.parse(margonemData);
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

        // Metoda 2: Sprawdzenie globalnych zmiennych gry
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

        // Metoda 4: Sprawdzenie elementów DOM
        const profileLinks = document.querySelectorAll('a[href*="/profile/view,"]');
        for (const link of profileLinks) {
            const match = link.href.match(/profile\/view,(\d+)/);
            if (match && match[1]) {
                console.log('✅ Znaleziono ID konta w linku do profilu:', match[1]);
                return match[1];
            }
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
                statusEl.className = 'license-status-valid';
            } else {
                statusEl.textContent = 'Nieaktywna';
                statusEl.style.color = '#ff3366';
                statusEl.className = 'license-status-invalid';
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
                            .filter(line => line && !line.startsWith('#') && !isNaN(line))
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
