// addon_loader.js - Automatyczne ładowanie dodatków z folderu addons
(function() {
    'use strict';
    
    console.log('🔄 Synergy Auto Addon Loader');
    
    const ADDONS_BASE_URL = 'https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/src/addons/';
    const loadedAddons = new Set();
    
    // 🔹 Sprawdź które dodatki są włączone
    function getEnabledAddons() {
        try {
            const saved = localStorage.getItem('sw_favorite_addons');
            if (saved) {
                const addons = JSON.parse(saved);
                return addons.filter(a => a.enabled).map(a => a.id);
            }
        } catch (e) {}
        return [];
    }
    
    // 🔹 Załaduj dodatek
    async function loadAddon(addonId) {
        if (loadedAddons.has(addonId)) {
            console.log(`⏩ Addon ${addonId} już załadowany`);
            return;
        }
        
        try {
            console.log(`📦 Ładowanie dodatku: ${addonId}`);
            
            const response = await fetch(`${ADDONS_BASE_URL}${addonId}.js?v=${Date.now()}`);
            
            if (response.ok) {
                const code = await response.text();
                
                // Wykonaj kod dodatku
                const script = document.createElement('script');
                script.textContent = code;
                document.head.appendChild(script);
                
                loadedAddons.add(addonId);
                console.log(`✅ Dodatek załadowany: ${addonId}`);
                
                // Zapisz w pamięci, że dodatek jest aktywny
                if (window.synergyWraith) {
                    window.synergyWraith.activeAddons = window.synergyWraith.activeAddons || [];
                    window.synergyWraith.activeAddons.push(addonId);
                }
            } else {
                console.error(`❌ Nie znaleziono dodatku: ${addonId}`);
            }
        } catch (error) {
            console.error(`❌ Błąd ładowania dodatku ${addonId}:`, error);
        }
    }
    
    // 🔹 Monitoruj zmiany włączonych dodatków
    function monitorAddonChanges() {
        let lastEnabled = [];
        
        setInterval(() => {
            const enabled = getEnabledAddons();
            
            // Sprawdź które dodatki trzeba załadować
            enabled.forEach(addonId => {
                if (!loadedAddons.has(addonId)) {
                    loadAddon(addonId);
                }
            });
            
            // Sprawdź które dodatki trzeba wyłączyć (opcjonalnie)
            // Możesz dodać funkcję unloadAddon jeśli potrzebujesz
            
            lastEnabled = enabled;
        }, 2000); // Sprawdzaj co 2 sekundy
    }
    
    // 🔹 Start
    function init() {
        console.log('🎯 Starting auto addon loader...');
        
        // Poczekaj na załadowanie panelu
        setTimeout(() => {
            monitorAddonChanges();
            
            // Załaduj początkowo włączone dodatki
            setTimeout(() => {
                const enabled = getEnabledAddons();
                enabled.forEach(addonId => {
                    loadAddon(addonId);
                });
            }, 1000);
        }, 3000);
    }
    
    // Start po załadowaniu strony
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 🔹 Eksport funkcji dla panelu
    window.synergyAddonLoader = {
        loadAddon: loadAddon,
        unloadAddon: function(addonId) {
            console.log(`Unloading ${addonId}...`);
            // Tu możesz dodać logikę wyłączania dodatków
        },
        getLoadedAddons: function() {
            return Array.from(loadedAddons);
        }
    };
})();