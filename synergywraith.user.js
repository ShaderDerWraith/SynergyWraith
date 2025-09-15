// ==UserScript==
// @name         SynergyWraith - Panel Dodatków
// @version      1.7
// @description  Zaawansowany panel dodatków do Margonem
// @author       ShaderDerWraith
// @license      MIT
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
// @connect      raw.githubusercontent.com
// @connect      github.com
// @run-at       document-body
// ==/UserScript==

(function () {
    'use strict';
    
    console.log('🚀 SynergyWraith loader started - v1.7');
    
    // 🔹 UŻYJ RAW GITHUB URL zamiast GitHub Pages
    const BASE_URL = 'https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/';
    const TIMESTAMP = Date.now();
    
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
            url: BASE_URL + 'panel.css?v=' + TIMESTAMP,
            onload: function(response) {
                if (response.status === 200) {
                    const style = document.createElement('style');
                    style.textContent = response.responseText;
                    document.head.appendChild(style);
                    console.log('✅ CSS loaded from RAW GitHub');
                }
            }
        });
    }

    // 🔹 Ładuj JS
    function loadJS() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: BASE_URL + 'synergy.js?v=' + TIMESTAMP,
            onload: function(response) {
                if (response.status === 200) {
                    const script = document.createElement('script');
                    script.textContent = response.responseText;
                    document.head.appendChild(script);
                    console.log('✅ JS loaded from RAW GitHub');
                }
            }
        });
    }

    // 🔹 Start ładowania
    function init() {
        console.log('🎯 Loading from RAW GitHub');
        loadCSS();
        loadJS();
    }

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

})();
