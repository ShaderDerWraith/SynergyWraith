// ==UserScript==
// @name         SynergyWraith - Panel Dodatków
// @version      1.0
// @description  Zaawansowany panel dodatków do Margonem
// @author       YourName
// @updateURL    https://shaderderwraith.github.io/SynergyWraith/synergywraith.user.js
// @icon         https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/icon.jpg
// @match        https://*.margonem.pl/*
// @match        https://*.margonem.com/*
// @exclude      https://margonem.*/*
// @exclude      https://www.margonem.*/*
// @exclude      https://forum.margonem.*/*
// @exclude      https://commons.margonem.*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_deleteValue
// @grant        GM_listValues
// @connect      github.io
// @connect      raw.githubusercontent.com
// @run-at       document-body
// ==/UserScript==

(function () {
    'use strict';

    const GLOBAL = true;
    const CACHE_TOKEN = 'sw_cache_token';
    
    // 🔹 Globalny obiekt dla panelu
    const synergyWraith = {};
    window.synergyWraith = synergyWraith;

    // 🔹 Safe storage - działa zarówno w Tampermonkey jak i normalnie
    if (GLOBAL && typeof GM_setValue !== 'undefined') {
        synergyWraith.GM_getValue = GM_getValue;
        synergyWraith.GM_setValue = GM_setValue;
        synergyWraith.GM_deleteValue = GM_deleteValue;
        synergyWraith.GM_listValues = GM_listValues;
    } else {
        synergyWraith.GM_getValue = function (key, defaultValue = null) {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        };
        
        synergyWraith.GM_setValue = function (key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                return false;
            }
        };
        
        synergyWraith.GM_deleteValue = function (key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        };
        
        synergyWraith.GM_listValues = function () {
            try {
                return Object.keys(localStorage);
            } catch (e) {
                return [];
            }
        };
    }

    synergyWraith.GM_xmlhttpRequest = GM_xmlhttpRequest;
    synergyWraith.GM_info = typeof GM_info !== 'undefined' ? GM_info : { script: { version: '1.0' } };

    // 🔹 Cache buster dla aktualizacji
    let cacheToken = synergyWraith.GM_getValue(CACHE_TOKEN);
    if (!cacheToken) {
        cacheToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
        synergyWraith.GM_setValue(CACHE_TOKEN, cacheToken);
    }

    // 🔹 Funkcja do ładowania zasobów
    function getResourceUrl(resource) {
        return `https://shaderderwraith.github.io/SynergyWraith/${resource}?v=${cacheToken}`;
    }

    // 🔹 Ładowanie CSS
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = getResourceUrl('panel.css');
    document.head.appendChild(style);

    // 🔹 Ładowanie głównego skryptu
    const script = document.createElement('script');
    script.src = getResourceUrl('synergy.js');
    script.onload = function() {
        console.log('✅ SynergyWraith panel załadowany');
    };
    script.onerror = function() {
        console.error('❌ Błąd ładowania panelu SynergyWraith');
    };
    document.head.appendChild(script);

})();
