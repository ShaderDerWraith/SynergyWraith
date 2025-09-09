// ==UserScript==
// @name         SynergyWraith - Panel Dodatków
// @version      1.5
// @description  Zaawansowany panel dodatków do Margonem
// @author       ShaderDerWraith
// @updateURL    https://shaderderwraith.github.io/SynergyWraith/synergywraith.user.js
// @icon         https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/icon.jpg
// @match        http*://*.margonem.pl/*
// @match        http*://*.margonem.com/*
// @exclude      http*://margonem.*/*
// @exclude      http*://www.margonem.*/*
// @exclude      http*://new.margonem.*/*
// @exclude      http*://forum.margonem.*/*
// @exclude      http*://commons.margonem.*/*
// @exclude      http*://dev-commons.margonem.*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @connect      shaderderwraith.github.io
// @connect      raw.githubusercontent.com
// @run-at       document-body
// ==/UserScript==

(function () {
    'use strict';
    
    console.log('🚀 SynergyWraith loader started');
    
    // 🔹 Konfiguracja
    const BASE_URL = 'https://shaderderwraith.github.io/SynergyWraith/';
    const CACHE_BUSTER = '?v=' + Date.now();
    
    // 🔹 Globalny obiekt
    const synergyWraith = {};
    window.synergyWraith = synergyWraith;
    
    // 🔹 Safe storage
    if (typeof GM_setValue !== 'undefined') {
        synergyWraith.GM_getValue = GM_getValue;
        synergyWraith.GM_setValue = GM_setValue;
        synergyWraith.GM_deleteValue = GM_deleteValue;
        synergyWraith.GM_listValues = GM_listValues;
    }
    
    synergyWraith.GM_xmlhttpRequest = GM_xmlhttpRequest;

    // 🔹 Ładuj CSS
    function loadCSS() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: BASE_URL + 'panel.css' + CACHE_BUSTER,
            onload: function(response) {
                if (response.status === 200) {
                    const style = document.createElement('style');
                    style.textContent = response.responseText;
                    document.head.appendChild(style);
                    console.log('✅ CSS loaded');
                }
            }
        });
    }

    // 🔹 Ładuj JS
    function loadJS() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: BASE_URL + 'synergy.js' + CACHE_BUSTER,
            onload: function(response) {
                if (response.status === 200) {
                    const script = document.createElement('script');
                    script.textContent = response.responseText;
                    document.head.appendChild(script);
                    console.log('✅ JS loaded');
                }
            }
        });
    }

    // 🔹 Start ładowania
    function init() {
        console.log('🎯 Loading SynergyWraith from GitHub Pages');
        loadCSS();
        loadJS();
    }

    // 🔹 Czekaj na gotowość DOM
    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

})();
