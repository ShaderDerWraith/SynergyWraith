// 📁 addons/test-licensed-addon.js
// Przykładowy dodatek testowy wymagający licencji

(function() {
    'use strict';
    
    const ADDON_ID = 'test-licensed-addon';
    const ADDON_NAME = 'Testowy Dodatek Premium';
    
    console.log(`🚀 ${ADDON_NAME} loading...`);
    
    // 🔹 Sprawdź API
    if (!window.SynergyWraithAPI) {
        console.error(`❌ ${ADDON_NAME}: SynergyWraithAPI not found!`);
        return;
    }
    
    // 🔹 Sprawdź czy dodatek jest włączony
    if (!window.SynergyWraithAPI.isAddonEnabled(ADDON_ID)) {
        console.log(`⏸️ ${ADDON_NAME}: Addon is disabled`);
        return;
    }
    
    // 🔹 Sprawdź licencję
    const licenseCheck = window.SynergyWraithAPI.checkLicense(ADDON_ID);
    
    if (!licenseCheck.valid) {
        console.error(`❌ ${ADDON_NAME}: License check failed - ${licenseCheck.message}`);
        
        // Pokaż overlay z błędem
        showLicenseError(licenseCheck.message);
        return;
    }
    
    console.log(`✅ ${ADDON_NAME}: License valid! Account: ${licenseCheck.accountId}, Days left: ${licenseCheck.daysLeft}`);
    
    // 🔹 Zaloguj start
    window.SynergyWraithAPI.logActivity(ADDON_ID, 'addon_started', {
        licenseValid: true,
        daysLeft: licenseCheck.daysLeft,
        timestamp: new Date().toISOString()
    });
    
    // ============================================
    // 🔹 GŁÓWNY KOD DODATKU
    // ============================================
    
    function initTestAddon() {
        console.log(`🎮 ${ADDON_NAME}: Initializing test features...`);
        
        // 1. Darmowa funkcja (działa zawsze)
        addTestButton();
        
        // 2. Premium funkcja (wymaga licencji)
        const premiumResult = window.SynergyWraithAPI.requireLicense(ADDON_ID, function() {
            console.log(`✨ ${ADDON_NAME}: Executing premium feature...`);
            return addPremiumFeature();
        });
        
        if (premiumResult) {
            console.log(`✅ ${ADDON_NAME}: Premium feature executed successfully`);
        }
        
        // 3. Inna premium funkcja z parametrami
        const anotherResult = window.SynergyWraithAPI.requireLicense(ADDON_ID, function() {
            return showPremiumInfo(licenseCheck);
        });
    }
    
    // 🔹 Darmowa funkcja - przycisk testowy
    function addTestButton() {
        const button = document.createElement('button');
        button.textContent = '🎮 Test Dodatek';
        button.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            padding: 10px 15px;
            background: linear-gradient(to right, #331100, #662200);
            color: #ff9900;
            border: 1px solid #ff9900;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            z-index: 99999;
            font-size: 12px;
        `;
        
        button.onclick = function() {
            window.SynergyWraithAPI.showToast(
                `${ADDON_NAME} aktywny! Licencja ważna jeszcze ${licenseCheck.daysLeft} dni`,
                'info'
            );
            
            // Zaloguj kliknięcie
            window.SynergyWraithAPI.logActivity(ADDON_ID, 'test_button_clicked');
        };
        
        document.body.appendChild(button);
        console.log(`✅ ${ADDON_NAME}: Test button added`);
    }
    
    // 🔹 Premium funkcja - tylko z licencją
    function addPremiumFeature() {
        // Dodaj premium element do UI
        const premiumBadge = document.createElement('div');
        premiumBadge.textContent = '⭐ PREMIUM';
        premiumBadge.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 8px 12px;
            background: linear-gradient(to right, #ff9900, #ff6600);
            color: #000;
            border-radius: 4px;
            font-weight: bold;
            z-index: 99998;
            font-size: 11px;
            box-shadow: 0 0 10px rgba(255, 153, 0, 0.5);
        `;
        
        document.body.appendChild(premiumBadge);
        console.log(`✨ ${ADDON_NAME}: Premium badge added`);
        
        return { success: true, feature: 'premium_badge' };
    }
    
    // 🔹 Inna premium funkcja
    function showPremiumInfo(license) {
        console.log(`📊 ${ADDON_NAME}: Showing premium info...`);
        
        // Możesz tu dodać więcej premium funkcjonalności
        window.SynergyWraithAPI.logActivity(ADDON_ID, 'premium_info_shown', {
            daysLeft: license.daysLeft,
            accountId: license.accountId
        });
        
        return true;
    }
    
    // 🔹 Funkcja czyszcząca
    window[`cleanup_${ADDON_ID}`] = function() {
        console.log(`🧹 ${ADDON_NAME}: Cleaning up...`);
        
        // Usuń dodane elementy
        const elements = document.querySelectorAll('[data-test-addon]');
        elements.forEach(el => el.remove());
        
        window.SynergyWraithAPI.logActivity(ADDON_ID, 'addon_cleanup');
    };
    
    // 🔹 Pokaż błąd licencji
    function showLicenseError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(20, 0, 0, 0.95);
            color: #ff6666;
            padding: 30px;
            border-radius: 10px;
            border: 2px solid #ff0000;
            z-index: 999999;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
        `;
        
        errorDiv.innerHTML = `
            <h3 style="color: #ff0000; margin-bottom: 15px;">⚠️ ${ADDON_NAME}</h3>
            <p style="margin-bottom: 10px;">Ten dodatek wymaga aktywnej licencji!</p>
            <p style="margin-bottom: 20px; font-size: 14px;">${message}</p>
            <button onclick="document.getElementById('swLicenseModal').style.display='flex'; this.parentElement.remove();" 
                    style="padding: 10px 20px; background: #ff0000; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                Aktywuj Licencję
            </button>
            <button onclick="this.parentElement.remove()" 
                    style="padding: 10px 20px; background: #333; color: #ccc; border: none; border-radius: 5px; cursor: pointer;">
                Zamknij
            </button>
        `;
        
        document.body.appendChild(errorDiv);
    }
    
    // 🔹 Start dodatku
    try {
        setTimeout(() => {
            initTestAddon();
            console.log(`✅ ${ADDON_NAME}: Initialized successfully!`);
        }, 1000);
    } catch (error) {
        console.error(`❌ ${ADDON_NAME}: Error:`, error);
        window.SynergyWraithAPI.logActivity(ADDON_ID, 'addon_error', { error: error.message });
    }
    
})();
