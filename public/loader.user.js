// ==UserScript==
// @name         SynergyWraith - Panel Dodatków
// @version      3.5
// @description  Zaawansowany panel dodatków do Margonem z systemem licencji
// @author       ShaderDerWraith
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/public/loader.user.js
// @icon         https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/public/icon.jpg
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
// @connect      synergy-licenses.lozu-oo.workers.dev
// @run-at       document-body
// ==/UserScript==

(function () {
    'use strict';
    
    console.log('🚀 SynergyWraith loader started - v3.5');
    
    const BASE_URL = 'https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/src/';
    const TIMESTAMP = Date.now();
    
    const synergyWraith = {};
    window.synergyWraith = synergyWraith;
    
    if (typeof GM_setValue !== 'undefined') {
        synergyWraith.GM_getValue = GM_getValue;
        synergyWraith.GM_setValue = GM_setValue;
        synergyWraith.GM_deleteValue = GM_deleteValue;
        synergyWraith.GM_listValues = GM_listValues;
    }
    
    synergyWraith.GM_xmlhttpRequest = GM_xmlhttpRequest;

    function loadJS() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: BASE_URL + 'panel/main.js?v=' + TIMESTAMP,
            onload: function(response) {
                if (response.status === 200) {
                    const script = document.createElement('script');
                    script.textContent = response.responseText;
                    document.head.appendChild(script);
                    console.log('✅ JS loaded from GitHub');
                } else {
                    console.error('❌ Failed to load JS:', response.status);
                }
            },
            onerror: function(error) {
                console.error('❌ Error loading JS:', error);
            }
        });
    }

    function loadCSS() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: BASE_URL + 'panel/panel.css?v=' + TIMESTAMP,
            onload: function(response) {
                if (response.status === 200) {
                    const style = document.createElement('style');
                    style.textContent = response.responseText;
                    document.head.appendChild(style);
                    console.log('✅ CSS loaded from GitHub');
                }
            }
        });
    }

    function init() {
        console.log('🎯 Loading from GitHub');
        loadCSS();
        loadJS();
    }

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

})();