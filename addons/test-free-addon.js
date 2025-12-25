// 📁 addons/test-free-addon.js
// Darmowy dodatek testowy (nie wymaga licencji)

(function() {
    'use strict';
    
    const ADDON_ID = 'test-free-addon';
    const ADDON_NAME = 'Testowy Dodatek Darmowy';
    
    console.log(`🚀 ${ADDON_NAME} loading...`);
    
    // Sprawdź czy dodatek jest włączony
    if (window.SynergyWraithAPI && !window.SynergyWraithAPI.isAddonEnabled(ADDON_ID)) {
        console.log(`⏸️ ${ADDON_NAME}: Addon is disabled`);
        return;
    }
    
    console.log(`✅ ${ADDON_NAME}: Free addon - no license required`);
    
    // Główny kod darmowego dodatku
    function initFreeAddon() {
        console.log(`🎮 ${ADDON_NAME}: Initializing free features...`);
        
        // Dodaj darmowy przycisk
        const freeButton = document.createElement('button');
        freeButton.textContent = '🆓 Darmowy Dodatek';
        freeButton.style.cssText = `
            position: fixed;
            bottom: 140px;
            right: 20px;
            padding: 10px 15px;
            background: linear-gradient(to right, #003311, #006622);
            color: #00ff00;
            border: 1px solid #00ff00;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            z-index: 99997;
            font-size: 12px;
        `;
        
        freeButton.onclick = function() {
            alert('To jest darmowy dodatek! Nie wymaga licencji.');
        };
        
        document.body.appendChild(freeButton);
        console.log(`✅ ${ADDON_NAME}: Free button added`);
    }
    
    // Funkcja czyszcząca
    window[`cleanup_${ADDON_ID}`] = function() {
        console.log(`🧹 ${ADDON_NAME}: Cleaning up...`);
        // Usuń przycisk
        const button = document.querySelector('button');
        if (button && button.textContent.includes('Darmowy')) {
            button.remove();
        }
    };
    
    // Start
    try {
        setTimeout(initFreeAddon, 1500);
        console.log(`✅ ${ADDON_NAME}: Loaded successfully!`);
    } catch (error) {
        console.error(`❌ ${ADDON_NAME}: Error:`, error);
    }
    
})();
