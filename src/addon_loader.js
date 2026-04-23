// addon_loader.js - Poprawiony loader
(function() {
    'use strict';
    console.log('🔄 Synergy Auto Addon Loader v3');

    const ADDONS_BASE_URL = 'https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/src/addons/';
    const loadedAddons = new Set();

    function getEnabledAddons() {
        try {
            const saved = localStorage.getItem('sw_favorite_addons');
            if (saved) {
                const addons = JSON.parse(saved);
                return addons.filter(a => a.enabled).map(a => a.id);
            }
        } catch(e) {}
        return [];
    }

    async function loadAddon(addonId) {
        if (loadedAddons.has(addonId)) return;
        try {
            const url = `${ADDONS_BASE_URL}${addonId}.js?v=${Date.now()}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const code = await response.text();
            
            // Wykonaj kod w kontekście strony (tak jak normalny skrypt)
            const script = document.createElement('script');
            script.textContent = code;
            (document.head || document.documentElement).appendChild(script);
            script.remove(); // opcjonalnie usuń po wykonaniu
            
            loadedAddons.add(addonId);
            console.log(`✅ Dodatek załadowany: ${addonId}`);
        } catch(e) {
            console.error(`❌ Błąd ładowania ${addonId}:`, e);
        }
    }

    function monitor() {
        setInterval(() => {
            const enabled = getEnabledAddons();
            enabled.forEach(id => {
                if (!loadedAddons.has(id)) loadAddon(id);
            });
        }, 3000); // co 3 sekundy
    }

    // Uruchom po załadowaniu DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(monitor, 1000);
        });
    } else {
        setTimeout(monitor, 1000);
    }
})();