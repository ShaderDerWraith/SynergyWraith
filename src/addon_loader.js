// addon_loader.js - Automatyczne ładowanie dodatków z folderu addons
(function() {
    'use strict';
    
    console.log('🔄 Synergy Auto Addon Loader v2');
    
    const ADDONS_BASE_URL = 'https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/src/addons/';
    const loadedAddons = new Set();
    
    // 🔹 Sprawdź które dodatki są włączone (z panelu)
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
    
    // 🔹 Załaduj dodatek (z rejestracją w panelu)
    async function loadAddon(addonId) {
        if (loadedAddons.has(addonId)) return;
        
        try {
            const url = `${ADDONS_BASE_URL}${addonId}.js?v=${Date.now()}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const code = await response.text();
            
            // Wyciągnij metadane z nagłówka skryptu
            const nameMatch = code.match(/@name\s+(.+)/);
            const descMatch = code.match(/@description\s+(.+)/);
            const addonName = nameMatch ? nameMatch[1].trim() : addonId;
            const addonDesc = descMatch ? descMatch[1].trim() : 'Brak opisu';
            
            // Sprawdź, czy dodatek jest już zarejestrowany w panelu (przez manifest)
            // Jeśli nie – dodaj go tymczasowo (opcjonalne, ale manifest już to robi)
            // Tutaj tylko wykonujemy kod dodatku
            const script = document.createElement('script');
            script.textContent = code;
            document.head.appendChild(script);
            
            loadedAddons.add(addonId);
            console.log(`✅ Dodatek załadowany: ${addonName} (${addonId})`);
            
        } catch (error) {
            console.error(`❌ Błąd ładowania dodatku ${addonId}:`, error);
        }
    }
    
    // 🔹 Monitoruj zmiany włączonych dodatków
    function monitorAddonChanges() {
        setInterval(() => {
            const enabled = getEnabledAddons();
            enabled.forEach(addonId => {
                if (!loadedAddons.has(addonId)) {
                    loadAddon(addonId);
                }
            });
        }, 2000);
    }
    
    // Start
    function init() {
        console.log('🎯 Auto addon loader started');
        setTimeout(() => {
            monitorAddonChanges();
            // Załaduj początkowo włączone
            setTimeout(() => {
                const enabled = getEnabledAddons();
                enabled.forEach(loadAddon);
            }, 1000);
        }, 3000);
    }
    
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();