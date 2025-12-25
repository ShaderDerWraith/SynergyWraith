// ==UserScript==
// @name         Synergy Wraith - KCS Icons
// @namespace    http://synergywraith.com/
// @version      1.0
// @description  Premium icons for Tribal Wars (requires Synergy Wraith license)
// @author       SynergyWraith
// @match        *://*.tribalwars.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    const ADDON_ID = 'kcs-icons';
    
    // Wait for Synergy Wraith API
    function waitForAPI(maxAttempts = 50, interval = 200) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const checkAPI = setInterval(() => {
                attempts++;
                
                if (window.SynergyWraithAPI) {
                    clearInterval(checkAPI);
                    resolve(window.SynergyWraithAPI);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkAPI);
                    reject(new Error('SynergyWraithAPI not found'));
                }
            }, interval);
        });
    }
    
    // Main addon initialization
    async function initAddon() {
        try {
            console.log(`🚀 ${ADDON_ID}: Checking license...`);
            
            // Wait for API
            const api = await waitForAPI();
            
            // Check license
            const license = api.checkLicense(ADDON_ID);
            
            if (!license.valid) {
                console.error(`❌ ${ADDON_ID}: License required!`);
                showLicenseError();
                return;
            }
            
            console.log(`✅ ${ADDON_ID}: License valid! Days left: ${license.daysLeft}`);
            
            // Execute premium feature with license verification
            const result = api.requireLicense(ADDON_ID, function() {
                return initializeKCS();
            });
            
            if (result) {
                console.log(`✅ ${ADDON_ID}: Successfully initialized`);
            }
            
        } catch (error) {
            console.error(`❌ ${ADDON_ID}: Error:`, error);
        }
    }
    
    // Premium feature (only with license)
    function initializeKCS() {
        console.log(`✨ ${ADDON_ID}: Initializing premium icons...`);
        
        // Your KCS Icons code here
        // For example:
        // - Replace village icons
        // - Add custom building icons
        // - Modify UI graphics
        
        return { success: true, message: 'KCS Icons activated' };
    }
    
    // Show license error
    function showLicenseError() {
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
            <h3 style="color: #ff0000; margin-bottom: 15px;">⚠️ KCS Icons</h3>
            <p style="margin-bottom: 10px;">This premium addon requires an active Synergy Wraith license!</p>
            <button onclick="document.getElementById('swLicenseModal').style.display='flex'; this.parentElement.remove();" 
                    style="padding: 10px 20px; background: #ff0000; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Activate License
            </button>
        `;
        
        document.body.appendChild(errorDiv);
    }
    
    // Start addon
    setTimeout(initAddon, 2000);
    
})();
