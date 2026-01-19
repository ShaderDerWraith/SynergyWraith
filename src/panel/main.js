// ==UserScript==
// @name         Synergy Panel v4.6 - Final Edition (Fixed)
// @namespace    http://tampermonkey.net/
// @version      4.6.4
// @description  Zaawansowany panel dodatków do gry z systemem licencji
// @author       ShaderDerWraith
// @match        *://*/*
// @icon         https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/public/icon.jpg
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v4.6.4 (Improved Scrolling Edition)');

    // 🔹 Dodanie CSS
    const panelCSS = `
        /* 🔹 BASE STYLES - POPRAWIONE 🔹 */
        #swPanelToggle {
            position: fixed;
            top: 70px;
            left: 70px;
            width: 50px;
            height: 50px;
            background: url('https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/public/icon.jpg') center/cover no-repeat;
            border: 2px solid #ff3300;
            border-radius: 50%;
            cursor: grab;
            z-index: 1000000;
            box-shadow: 0 0 20px rgba(255, 51, 0, 0.9);
            color: white;
            font-weight: bold;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-shadow: 0 0 5px black;
            transition: all 0.2s ease;
            user-select: none;
            overflow: hidden;
            padding: 0;
            margin: 0;
            line-height: 1;
            background-color: transparent !important;
        }

        #swPanelToggle.dragging {
            cursor: grabbing;
            transform: scale(1.1);
            box-shadow: 0 0 30px rgba(255, 102, 0, 1);
            border: 2px solid #ffcc00;
            z-index: 1000001;
        }

        #swPanelToggle:hover:not(.dragging) {
            transform: scale(1.05);
            box-shadow: 0 0 25px rgba(255, 102, 0, 1);
            cursor: grab;
        }

        #swPanelToggle.saved {
            animation: savePulse 1.5s ease-in-out;
        }

        @keyframes savePulse {
            0% { 
                box-shadow: 0 0 20px rgba(255, 51, 0, 0.9);
                border-color: #ff3300;
            }
            50% { 
                box-shadow: 0 0 35px rgba(255, 153, 0, 1);
                border-color: #ffcc00;
                transform: scale(1.05);
            }
            100% { 
                box-shadow: 0 0 20px rgba(255, 51, 0, 0.9);
                border-color: #ff3300;
            }
        }

        /* 🔹 MAIN PANEL - WIĘKSZY, BEZ WERSJI 🔹 */
        #swAddonsPanel {
            position: fixed;
            top: 140px;
            left: 70px;
            width: 720px;
            height: 660px;
            background: linear-gradient(135deg, 
                rgba(26, 0, 0, 0.98), 
                rgba(51, 0, 0, 0.98), 
                rgba(102, 0, 0, 0.98));
            border: 2px solid #ff3300;
            border-radius: 12px;
            color: #ffffff;
            z-index: 999999;
            box-shadow: 
                0 0 35px rgba(255, 51, 0, 0.8),
                inset 0 0 60px rgba(255, 51, 0, 0.1);
            backdrop-filter: blur(12px);
            display: none;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            min-width: 600px;
            min-height: 500px;
            max-width: 1200px;
            max-height: 900px;
            resize: both;
            font-size: 13px;
            cursor: default;
        }

        #swAddonsPanel.dragging {
            cursor: grabbing;
        }

        /* 🔹 NAGŁÓWEK - TYLKO "SYNERGY" 🔹 */
        #swPanelHeader {
            background: linear-gradient(to right, 
                rgba(51, 0, 0, 0.95), 
                rgba(102, 0, 0, 0.95), 
                rgba(153, 0, 0, 0.95));
            padding: 16px;
            text-align: center;
            border-bottom: 2px solid #ff3300;
            cursor: move;
            font-size: 26px;
            font-weight: bold;
            color: #ffcc00;
            text-shadow: 
                0 0 12px rgba(255, 51, 0, 0.8),
                0 0 24px rgba(255, 51, 0, 0.6);
            user-select: none;
            position: relative;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* 🔹 OBSZAR DO CHWYTANIA - CAŁY NAGŁÓWEK I 30px POD 🔹 */
        #swAddonsPanel::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 90px;
            cursor: move;
            z-index: 1000;
        }

        /* 🔹 TABS - BEZ IKON 🔹 */
        .tab-container {
            display: flex;
            background: linear-gradient(to bottom, 
                rgba(51, 0, 0, 0.95), 
                rgba(38, 0, 0, 0.95));
            border-bottom: 1px solid #ff3300;
            padding: 0 5px;
            justify-content: center;
            height: 46px;
        }

        .tablink {
            background: none;
            border: none;
            outline: none;
            cursor: pointer;
            padding: 12px 20px;
            margin: 0 3px;
            transition: all 0.3s ease;
            color: #ff9966;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid transparent;
            position: relative;
            min-width: 90px;
            text-align: center;
            text-decoration: none;
        }

        .tablink::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 2px;
            background: #ff3300;
            transition: width 0.3s ease;
        }

        .tablink:hover::after { 
            width: 80%; 
        }

        .tablink.active { 
            color: #ffcc00; 
            text-shadow: 0 0 8px rgba(255, 102, 0, 0.8); 
        }

        .tablink.active::after { 
            width: 100%; 
            background: linear-gradient(to right, #ff3300, #ffcc00, #ff3300);
            box-shadow: 0 0 10px rgba(255, 102, 0, 0.8);
        }

        .tablink:hover:not(.active) { 
            color: #ff6600; 
        }

        /* 🔹 TAB CONTENT - SCROLLOWANIE W KAŻDEJ ZAKŁADCE 🔹 */
        .tabcontent {
            display: none;
            flex: 1;
            overflow: hidden;
            flex-direction: column;
            position: relative;
            height: calc(100% - 106px);
        }

        .tabcontent.active {
            display: flex;
        }

        .sw-tab-content {
            padding: 15px;
            background: rgba(26, 0, 0, 0.7);
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: hidden;
            position: relative;
            flex: 1;
            min-height: 0;
        }

        /* 🔹 DODATKI - SCROLL DZIAŁAJĄCY, PRZYCISK NIE UCIĘTY 🔹 */
        .addon-list-container {
            width: 100%;
            max-width: 800px;
            flex: 1 1 auto !important; /* FLEX-GROW FLEX-SHRINK FLEX-BASIS */
            overflow-y: auto !important;
            overflow-x: hidden;
            margin-bottom: 10px;
            padding-right: 10px;
            scrollbar-width: thin;
            scrollbar-color: #ff3300 rgba(51, 0, 0, 0.5);
            height: auto;
            min-height: 0 !important; /* WYMUSZENIE MOŻLIWOŚCI KURCZENIA */
            max-height: none !important; /* USUNIĘCIE STAŁEJ WYSOKOŚCI */
            position: relative;
            display: flex;
            flex-direction: column;
        }

        /* WYMUSZENIE WIDOCZNOŚCI SCROLLA */
        .addon-list-container::-webkit-scrollbar {
            width: 12px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        .addon-list-container::-webkit-scrollbar-track {
            background: rgba(51, 0, 0, 0.5) !important;
            border-radius: 8px !important;
            border: 1px solid #660000 !important;
        }

        .addon-list-container::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #ff3300, #ff6600) !important;
            border-radius: 8px !important;
            border: 1px solid #ff9900 !important;
        }

        .addon-list {
            width: 100%;
            flex: 1;
            min-height: 0;
        }

        .addon {
            background: linear-gradient(135deg, 
                rgba(51, 0, 0, 0.9), 
                rgba(102, 0, 0, 0.9));
            border: 1px solid #660000;
            border-radius: 8px;
            padding: 16px 18px;
            margin-bottom: 12px;
            transition: all 0.3s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 65px;
            box-sizing: border-box;
            width: 100%;
        }

        .addon:hover {
            transform: translateY(-3px);
            border-color: #ff3300;
            box-shadow: 0 6px 18px rgba(255, 51, 0, 0.4);
            background: linear-gradient(135deg, 
                rgba(102, 0, 0, 0.95), 
                rgba(153, 0, 0, 0.95));
        }

        .addon-header {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;
            margin-right: 20px;
        }

        .addon-title {
            font-weight: 700;
            color: #ffcc00;
            font-size: 14px;
            margin-bottom: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .addon-description {
            color: #ff9966;
            font-size: 12px;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .addon-controls {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
        }

        /* 🔹 PRZYCISK ULUBIONYCH 🔹 */
        .favorite-btn {
            background: transparent;
            border: none;
            font-size: 18px;
            color: #666666;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            transition: all 0.3s ease;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }

        .favorite-btn:hover {
            color: #ff9900;
            background: rgba(255, 153, 0, 0.1);
        }

        .favorite-btn.favorite {
            color: #ffcc00;
            text-shadow: 0 0 12px rgba(255, 204, 0, 0.8);
        }

        /* 🔹 ADDON SWITCH 🔹 */
        .addon-switch {
            position: relative;
            display: inline-block;
            width: 48px;
            height: 26px;
        }

        .addon-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .addon-switch-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #330000;
            border: 1px solid #660000;
            transition: .4s;
            border-radius: 34px;
        }

        .addon-switch-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 2px;
            background-color: #ff3300;
            transition: .4s;
            border-radius: 50%;
        }

        .addon-switch input:checked + .addon-switch-slider {
            background-color: #006600;
            border-color: #00cc00;
        }

        .addon-switch input:checked + .addon-switch-slider:before {
            transform: translateX(21px);
            background-color: #00ff00;
        }

        .addon-switch input:disabled + .addon-switch-slider {
            background-color: #333333;
            border-color: #666666;
            cursor: not-allowed;
        }

        .addon-switch input:disabled + .addon-switch-slider:before {
            background-color: #666666;
        }

        /* 🔹 FILTRY DODATKÓW 🔹 */
        .addon-filters {
            display: flex;
            gap: 12px;
            margin-bottom: 18px;
            width: 100%;
            max-width: 800px;
            justify-content: center;
            flex-wrap: wrap;
            flex-shrink: 0;
        }

        .filter-btn {
            padding: 10px 18px;
            background: linear-gradient(135deg, #330000, #660000);
            border: 1px solid #660000;
            border-radius: 6px;
            color: #ff9966;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
            min-width: 110px;
        }

        .filter-btn:hover {
            background: linear-gradient(135deg, #660000, #990000);
            color: #ffcc00;
            transform: translateY(-2px);
        }

        .filter-btn.active {
            background: linear-gradient(135deg, #990000, #cc0000);
            border-color: #ff3300;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(255, 51, 0, 0.5);
            transform: translateY(-2px);
        }

        /* 🔹 PRZYCISK ZAPISZ - POPRAWIONE: NIE UCIĘTY, ZAWSZE WIDOCZNY 🔹 */
        #addons {
            position: relative;
            min-height: 100%;
            padding-bottom: 0;
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
        }

        #addons .sw-tab-content {
            padding-bottom: 15px !important; /* NORMALNY PADDING */
        }

        .refresh-button-container {
            margin-top: auto !important;
            padding: 15px !important;
            background: linear-gradient(to top, 
                rgba(26, 0, 0, 0.98),
                rgba(51, 0, 0, 0.98)) !important;
            border-top: 2px solid #660000 !important;
            z-index: 1000 !important;
            box-sizing: border-box !important;
            border-radius: 0 0 8px 8px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: 100% !important;
            /* USUNIĘTE: position: absolute !important; bottom: 0 !important; left: 0 !important; right: 0 !important; */
            flex-shrink: 0;
            position: relative !important; /* ZMIENIONE: relative zamiast absolute */
            margin-top: 10px !important;
        }

        .refresh-button {
            width: 100% !important;
            padding: 14px !important;
            background: linear-gradient(135deg, #006600, #008800) !important;
            border: 1px solid #00cc00 !important;
            border-radius: 8px !important;
            color: #ffffff !important;
            cursor: pointer !important;
            font-weight: 700 !important;
            font-size: 13px !important;
            transition: all 0.3s ease !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            display: block !important;
            box-sizing: border-box !important;
            text-align: center !important;
            margin: 0 !important;
        }

        .refresh-button:hover {
            background: linear-gradient(135deg, #008800, #00aa00) !important;
            transform: translateY(-3px) !important;
            box-shadow: 0 6px 18px rgba(0, 255, 0, 0.4) !important;
        }

        /* 🔹 SHORTCUTS LIST 🔹 */
        .shortcuts-list-container {
            width: 100%;
            max-width: 800px;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            margin-bottom: 10px;
            padding-right: 10px;
            scrollbar-width: thin;
            scrollbar-color: #ff3300 rgba(51, 0, 0, 0.5);
            min-height: 350px;
            height: calc(100% - 60px);
        }

        .shortcut-item {
            background: linear-gradient(135deg, 
                rgba(51, 0, 0, 0.9), 
                rgba(102, 0, 0, 0.9));
            border: 1px solid #660000;
            border-radius: 8px;
            padding: 16px 18px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
            flex-wrap: wrap;
        }

        .shortcut-item:hover {
            border-color: #ff4500;
            background: linear-gradient(135deg, 
                rgba(102, 0, 0, 0.95), 
                rgba(153, 0, 0, 0.95));
        }

        .shortcut-info {
            flex: 1;
            min-width: 220px;
            margin-right: 20px;
            margin-bottom: 12px;
        }

        .shortcut-name {
            font-weight: 700;
            color: #ffcc00;
            font-size: 14px;
            margin-bottom: 6px;
        }

        .shortcut-desc {
            color: #ff9966;
            font-size: 12px;
        }

        .shortcut-controls {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
            flex-wrap: wrap;
        }

        .shortcut-display {
            padding: 8px 12px;
            background: rgba(30, 0, 0, 0.8);
            border: 1px solid #660000;
            border-radius: 5px;
            color: #ffcc00;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 0.5px;
            min-width: 100px;
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* 🔹 PRZYCISKI SKRÓTÓW 🔹 */
        .shortcut-set-btn, .shortcut-clear-btn {
            padding: 8px 14px;
            background: linear-gradient(135deg, #660000, #990000);
            border: 1px solid #ff3300;
            border-radius: 5px;
            color: #ffcc00;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
            min-width: 70px;
        }

        .shortcut-set-btn:hover, .shortcut-clear-btn:hover {
            background: linear-gradient(135deg, #990000, #cc0000);
            color: #ffffff;
            transform: translateY(-3px);
            box-shadow: 0 6px 18px rgba(255, 51, 0, 0.3);
        }

        .shortcut-clear-btn {
            min-width: 80px;
        }

        /* 🔹 SKRÓTY TOGGLE - DOMYŚLNIE WYŁĄCZONE 🔹 */
        .shortcut-toggle {
            position: relative;
            display: inline-block;
            width: 48px;
            height: 26px;
        }

        .shortcut-toggle input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .shortcut-toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #330000;
            border: 1px solid #660000;
            transition: .4s;
            border-radius: 34px;
        }

        .shortcut-toggle-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 2px;
            background-color: #ff3300;
            transition: .4s;
            border-radius: 50%;
            transform: translateX(3px);
        }

        .shortcut-toggle input:checked + .shortcut-toggle-slider {
            background-color: #006600;
            border-color: #00cc00;
        }

        .shortcut-toggle input:checked + .shortcut-toggle-slider:before {
            transform: translateX(21px);
            background-color: #00ff00;
        }

        .shortcut-toggle input:not(:checked) + .shortcut-toggle-slider {
            background-color: #330000;
            border-color: #660000;
        }

        .shortcut-toggle input:not(:checked) + .shortcut-toggle-slider:before {
            background-color: #ff3300;
        }

        /* 🔹 LICENCJA - SCROLLOWANIE BEZ UCINANIA 🔹 */
        .license-scroll-container {
            width: 100%;
            max-width: 800px;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            margin-bottom: 10px;
            padding-right: 10px;
            scrollbar-width: thin;
            scrollbar-color: #ff3300 rgba(51, 0, 0, 0.5);
            height: auto;
            min-height: 320px;
        }

        .license-container {
            background: linear-gradient(135deg, 
                rgba(51, 0, 0, 0.9), 
                rgba(102, 0, 0, 0.9));
            border: 1px solid #660000;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            width: 100%;
            max-width: 800px;
            box-sizing: border-box;
            word-wrap: break-word;
        }

        .license-header {
            color: #ffcc00;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 2px solid #ff3300;
            padding-bottom: 10px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .license-status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 13px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 51, 0, 0.3);
        }

        .license-status-item:last-child { 
            border-bottom: none; 
            margin-bottom: 0; 
        }

        .license-status-label {
            color: #ff9966;
            font-weight: 600;
            white-space: nowrap;
            font-size: 13px;
            min-width: 120px;
        }

        .license-status-value {
            font-weight: 600;
            text-align: right;
            color: #ffcc00;
            max-width: 200px;
            word-break: break-word;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            flex: 1;
            margin-left: 20px;
        }

        .copy-icon {
            cursor: pointer;
            color: #ffcc00;
            font-size: 14px;
            transition: all 0.3s ease;
            opacity: 0.8;
            flex-shrink: 0;
        }

        .copy-icon:hover {
            opacity: 1;
            color: #ffffff;
            transform: scale(1.1);
        }

        .license-status-valid { 
            color: #00ff00 !important; 
            text-shadow: 0 0 8px rgba(0, 255, 0, 0.6);
        }
        .license-status-invalid { 
            color: #ff3300 !important; 
            text-shadow: 0 0 8px rgba(255, 51, 0, 0.6);
        }
        .license-status-connected { 
            color: #00ff00 !important; 
        }
        .license-status-disconnected { 
            color: #ff3300 !important; 
        }
        .license-status-warning { 
            color: #ffcc00 !important; 
            text-shadow: 0 0 8px rgba(255, 204, 0, 0.6);
        }

        /* 🔹 SETTINGS - NOWY SYSTEM ZMIANY CZCIONKI 🔹 */
        .settings-item {
            margin-bottom: 20px;
            padding: 18px;
            background: linear-gradient(135deg, 
                rgba(51, 0, 0, 0.9), 
                rgba(102, 0, 0, 0.9));
            border: 1px solid #660000;
            border-radius: 10px;
            width: 100%;
            max-width: 800px;
            box-sizing: border-box;
        }

        .settings-label {
            display: block;
            color: #ffcc00;
            font-size: 14px;
            margin-bottom: 12px;
            font-weight: 700;
            text-align: center;
        }

        /* NOWY SYSTEM ZMIANY CZCIONKI - NATYCHMIASTOWE DZIAŁANIE */
        .font-size-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 12px;
        }

        .font-size-btn {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #660000, #990000);
            border: 1px solid #ff3300;
            border-radius: 6px;
            color: #ffcc00;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            user-select: none;
            padding: 0;
        }

        .font-size-btn:hover {
            background: linear-gradient(135deg, #990000, #cc0000);
            border-color: #ff6600;
            transform: translateY(-3px);
            box-shadow: 0 6px 18px rgba(255, 51, 0, 0.4);
        }

        .font-size-btn:active {
            transform: translateY(0);
        }

        .font-size-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: linear-gradient(135deg, #330000, #660000);
            border-color: #660000;
        }

        .font-size-btn:disabled:hover {
            transform: none;
            box-shadow: none;
        }

        .font-size-display {
            min-width: 70px;
            padding: 10px;
            background: rgba(51, 0, 0, 0.8);
            border: 1px solid #660000;
            border-radius: 6px;
            color: #ffcc00;
            font-size: 15px;
            font-weight: bold;
            text-align: center;
            transition: none !important;
            animation: none !important;
        }

        .font-size-display.warning {
            color: #ff3300;
            border-color: #ff3300;
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        /* 🔹 SUWAK PRZEŹROCZYSTOŚCI 🔹 */
        .slider-container {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 12px;
        }

        .slider-value {
            min-width: 50px;
            text-align: center;
            color: #ffcc00;
            font-weight: bold;
            font-size: 13px;
        }

        .opacity-slider {
            flex: 1;
            -webkit-appearance: none;
            height: 8px;
            background: linear-gradient(to right, #330000, #660000);
            border-radius: 5px;
            border: 1px solid #660000;
            outline: none;
        }

        .opacity-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ff3300;
            cursor: pointer;
            border: 2px solid #ffcc00;
            box-shadow: 0 0 10px rgba(255, 51, 0, 0.8);
        }

        .opacity-slider::-webkit-slider-thumb:hover {
            background: #ff6600;
            transform: scale(1.1);
        }

        /* 🔹 PRZYCISK USTAW SKRÓT 🔹 */
        #panelShortcutSetBtn {
            padding: 10px 18px;
            background: linear-gradient(135deg, #660000, #990000);
            border: 1px solid #ff3300;
            border-radius: 6px;
            color: #ffffff;
            cursor: pointer;
            font-size: 12px;
            font-weight: 700;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            white-space: nowrap;
            min-width: 80px;
        }

        #panelShortcutSetBtn:hover {
            background: linear-gradient(135deg, #990000, #cc0000);
            border-color: #ff6600;
            transform: translateY(-3px);
            box-shadow: 0 6px 18px rgba(255, 51, 0, 0.4);
        }

        /* 🔹 EKSPORT/IMPORT - OBFUSKOWANY TEKST 🔹 */
        .import-export-container {
            width: 100%;
            max-width: 800px;
            margin-top: 20px;
            padding: 20px;
            background: linear-gradient(135deg, 
                rgba(51, 0, 0, 0.9), 
                rgba(102, 0, 0, 0.9));
            border: 1px solid #660000;
            border-radius: 10px;
            box-sizing: border-box;
        }

        .import-export-buttons {
            display: flex;
            gap: 12px;
            margin-bottom: 15px;
        }

        .import-export-btn {
            flex: 1;
            padding: 12px;
            background: linear-gradient(135deg, #660000, #990000);
            border: 1px solid #ff3300;
            border-radius: 6px;
            color: #ffffff;
            cursor: pointer;
            font-weight: 700;
            font-size: 12px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .import-export-btn:hover {
            background: linear-gradient(135deg, #990000, #cc0000);
            border-color: #ff6600;
            transform: translateY(-3px);
            box-shadow: 0 6px 18px rgba(255, 51, 0, 0.3);
        }

        .import-export-textarea {
            width: 100%;
            height: 120px;
            padding: 12px;
            background: rgba(26, 0, 0, 0.8);
            border: 1px solid #660000;
            border-radius: 6px;
            color: #ffcc00;
            font-size: 11px;
            font-family: 'Courier New', monospace;
            resize: vertical;
            box-sizing: border-box;
            outline: none;
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.4;
        }

        .import-export-textarea:focus {
            border-color: #ff3300;
            box-shadow: 0 0 15px rgba(255, 51, 0, 0.5);
        }

        /* 🔹 INFO - SYMETRYCZNE OKIENKA, BEZ ROZCIĄGANIA 🔹 */
        #info .sw-tab-content {
            overflow: hidden !important;
            position: relative !important;
            height: 100% !important;
        }

        .info-section {
            background: linear-gradient(135deg, 
                rgba(51, 0, 0, 0.9), 
                rgba(102, 0, 0, 0.9));
            border: 1px solid #660000;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 18px;
            width: 100%;
            max-width: 800px;
            box-sizing: border-box;
            text-align: left;
            min-width: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .info-section h4 {
            color: #ff9966;
            margin-top: 0;
            font-size: 16px;
            margin-bottom: 16px;
            border-bottom: 2px solid #660000;
            padding-bottom: 10px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-section p {
            color: #ffcc00;
            font-size: 13px;
            line-height: 1.6;
            margin: 12px 0;
            padding-left: 10px;
            position: relative;
        }

        .info-section p::before {
            content: "•";
            color: #ff6600;
            font-size: 16px;
            position: absolute;
            left: 0;
            top: 0;
        }

        .info-section p[style*="color:#00ff00"]::before {
            color: #00ff00;
        }

        .info-section p[style*="color:#ff9966"]::before {
            color: #ff9966;
        }

        /* 🔹 SCROLLBAR - DZIAŁAJĄCY NA WSZYSTKO 🔹 */
        .scrollable-container {
            width: 100% !important;
            max-width: 800px !important;
            flex: 1 !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            margin-bottom: 10px !important;
            padding-right: 10px !important;
            scroll-behavior: smooth !important;
            scrollbar-width: thin !important;
            scrollbar-color: #ff3300 rgba(51, 0, 0, 0.5) !important;
            height: calc(100% - 60px) !important;
            min-height: 300px !important;
            position: relative !important;
        }

        #info .scrollable-container {
            height: calc(100% - 30px) !important;
            max-height: none !important;
        }

        .scrollable-container::-webkit-scrollbar,
        .addon-list-container::-webkit-scrollbar,
        .shortcuts-list-container::-webkit-scrollbar,
        .license-scroll-container::-webkit-scrollbar {
            width: 12px;
            height: 12px;
        }

        .scrollable-container::-webkit-scrollbar-track,
        .addon-list-container::-webkit-scrollbar-track,
        .shortcuts-list-container::-webkit-scrollbar-track,
        .license-scroll-container::-webkit-scrollbar-track {
            background: rgba(51, 0, 0, 0.5);
            border-radius: 8px;
            border: 1px solid #660000;
        }

        .scrollable-container::-webkit-scrollbar-thumb,
        .addon-list-container::-webkit-scrollbar-thumb,
        .shortcuts-list-container::-webkit-scrollbar-thumb,
        .license-scroll-container::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #ff3300, #ff6600);
            border-radius: 8px;
            border: 1px solid #ff9900;
            transition: all 0.3s ease;
        }

        .scrollable-container::-webkit-scrollbar-thumb:hover,
        .addon-list-container::-webkit-scrollbar-thumb:hover,
        .shortcuts-list-container::-webkit-scrollbar-thumb:hover,
        .license-scroll-container::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #ff6600, #ff9900);
            border-color: #ffcc00;
            transform: scale(1.05);
        }

        /* 🔹 MESSAGES 🔹 */
        .license-message {
            padding: 12px 15px;
            border-radius: 8px;
            margin: 10px 0;
            font-size: 12px;
            display: none;
            width: 100%;
            max-width: 800px;
            text-align: center;
            box-sizing: border-box;
        }

        .license-success {
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid #00ff00;
            color: #00ff00;
        }

        .license-error {
            background: rgba(255, 51, 0, 0.1);
            border: 1px solid #ff3300;
            color: #ff3300;
        }

        .license-info {
            background: rgba(255, 153, 0, 0.1);
            border: 1px solid #ff9900;
            color: #ff9900;
        }

        /* 🔹 RESET BUTTON 🔹 */
        #swResetButton {
            padding: 14px;
            background: linear-gradient(135deg, 
                rgba(102, 0, 0, 0.9), 
                rgba(153, 0, 0, 0.9));
            border: 1px solid #ff3300;
            border-radius: 8px;
            color: #ffffff;
            cursor: pointer;
            font-weight: 700;
            font-size: 13px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            display: block;
            box-sizing: border-box;
        }

        #swResetButton:hover {
            background: linear-gradient(135deg, 
                rgba(153, 0, 0, 0.9), 
                rgba(204, 0, 0, 0.9));
            border-color: #ff6600;
            transform: translateY(-3px);
            box-shadow: 0 6px 18px rgba(255, 51, 0, 0.4);
        }

        /* 🔹 SEARCH INPUT 🔹 */
        #searchAddons {
            width: 100%;
            max-width: 800px;
            padding: 12px 16px;
            background: rgba(51, 0, 0, 0.8);
            border: 1px solid #660000;
            border-radius: 8px;
            color: #ffcc00;
            font-size: 13px;
            box-sizing: border-box;
            outline: none;
            transition: all 0.3s ease;
            margin-bottom: 15px;
            flex-shrink: 0;
        }

        #searchAddons:focus {
            border-color: #ff3300;
            box-shadow: 0 0 15px rgba(255, 51, 0, 0.5);
            background: rgba(102, 0, 0, 0.9);
        }

        #searchAddons::placeholder {
            color: #ff9966;
            opacity: 0.8;
        }

        /* 🔹 PREMIUM BADGE 🔹 */
        .premium-badge {
            display: inline-block;
            background: linear-gradient(45deg, #ff9900, #ffcc00);
            color: #330000;
            font-size: 10px;
            font-weight: bold;
            padding: 3px 8px;
            border-radius: 4px;
            margin-right: 8px;
            text-shadow: none;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* 🔹 RESPONSYWNOŚĆ 🔹 */
        @media (max-width: 900px) {
            #swAddonsPanel {
                width: 90vw !important;
                min-width: 320px;
                max-width: 95vw;
                height: 80vh !important;
                min-height: 400px;
            }
            
            .refresh-button-container {
                padding: 12px !important;
            }
            
            .refresh-button {
                padding: 12px !important;
                font-size: 12px !important;
            }
            
            .info-section {
                padding: 15px;
                margin-left: 5px;
                margin-right: 5px;
                width: calc(100% - 10px);
            }
            
            .info-section h4 {
                font-size: 14px;
                padding: 8px;
            }
            
            .info-section p {
                font-size: 12px;
                line-height: 1.4;
            }
            
            .addon-list-container {
                max-height: none !important;
                flex: 1 1 auto !important;
            }
        }

        @media (max-height: 600px) {
            #swAddonsPanel {
                height: 70vh !important;
                min-height: 350px;
            }
            
            .addon-list-container {
                min-height: 150px !important;
                max-height: none !important;
            }
            
            .refresh-button-container {
                padding: 10px !important;
            }
            
            .refresh-button {
                padding: 10px !important;
                font-size: 11px !important;
            }
        }

        /* 🔹 ANIMACJE 🔹 */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .addon, .shortcut-item, .license-container, .settings-item, .info-section {
            animation: fadeIn 0.3s ease-out;
        }

        /* 🔹 FOCUS STATES 🔹 */
        .font-size-btn:focus,
        .filter-btn:focus,
        .shortcut-set-btn:focus,
        .shortcut-clear-btn:focus,
        .import-export-btn:focus,
        #panelShortcutSetBtn:focus,
        #swResetButton:focus,
        .refresh-button:focus {
            outline: 2px solid #ffcc00;
            outline-offset: 2px;
        }
        
        /* 🔹 POPRAWKI DLA SCROLLOWANIA PRZY SKALOWANIU 🔹 */
        #addons .sw-tab-content {
            display: flex !important;
            flex-direction: column !important;
            min-height: 0 !important;
            flex: 1 !important;
        }
        
        #addons .sw-tab-content > *:not(.addon-list-container):not(.refresh-button-container) {
            flex-shrink: 0 !important;
        }
    `;

    // Wstrzyknięcie CSS
    const style = document.createElement('style');
    style.textContent = panelCSS;
    document.head.appendChild(style);

    // 🔹 Konfiguracja
    const CONFIG = {
        PANEL_POSITION: "sw_panel_position",
        PANEL_VISIBLE: "sw_panel_visible",
        TOGGLE_BTN_POSITION: "sw_toggle_button_position",
        FAVORITE_ADDONS: "sw_favorite_addons",
        FONT_SIZE: "sw_panel_font_size",
        BACKGROUND_OPACITY: "sw_panel_background_opacity",
        LICENSE_EXPIRY: "sw_license_expiry",
        LICENSE_ACTIVE: "sw_license_active",
        CUSTOM_SHORTCUT: "sw_custom_shortcut",
        ACCOUNT_ID: "sw_account_id",
        LICENSE_DATA: "sw_license_data",
        ADMIN_ACCESS: "sw_admin_access",
        SHORTCUTS_CONFIG: "sw_shortcuts_config",
        SHORTCUTS_ENABLED: "sw_shortcuts_enabled"
    };

    // 🔹 Lista dostępnych dodatków
    const ADDONS = [
        {
            id: 'enhanced-stats',
            name: 'Enhanced Stats',
            description: 'Rozszerzone statystyki postaci',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false
        },
        {
            id: 'trade-helper',
            name: 'Trade Helper',
            description: 'Pomocnik handlu i aukcji',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false
        },
        {
            id: 'chat-manager',
            name: 'Chat Manager',
            description: 'Zaawansowane zarządzanie czatem',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false
        },
        {
            id: 'quest-logger',
            name: 'Quest Logger',
            description: 'Logowanie postępów w zadaniach',
            type: 'free',
            enabled: false,
            favorite: false,
            hidden: false
        },
        // DODATKI PREMIUM
        {
            id: 'kcs-icons',
            name: 'KCS Icons',
            description: 'Profesjonalne ikony do interfejsu',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        },
        {
            id: 'auto-looter',
            name: 'Auto Looter',
            description: 'Inteligentny zbieracz łupów',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        },
        {
            id: 'quest-helper',
            name: 'Quest Helper',
            description: 'Pełna pomoc w zadaniach z mapą',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        },
        {
            id: 'combat-log',
            name: 'Combat Log',
            description: 'Szczegółowy log walki z analizą',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        },
        {
            id: 'auto-potion',
            name: 'Auto Potion',
            description: 'Automatyczne używanie mikstur',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        },
        {
            id: 'fishing-bot',
            name: 'Fishing Bot',
            description: 'Automatyczne łowienie ryb',
            type: 'premium',
            enabled: false,
            favorite: false,
            hidden: true
        }
    ];

    // 🔹 Safe fallback dla Tampermonkey/Greasemonkey
    if (!window.synergyWraith) {
        window.synergyWraith = {
            GM_getValue: (key, defaultValue) => {
                try {
                    const value = localStorage.getItem(key);
                    return value ? JSON.parse(value) : defaultValue;
                } catch (e) {
                    return defaultValue;
                }
            },
            GM_setValue: (key, value) => {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    return false;
                }
            },
            GM_deleteValue: (key) => {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        };
    }

    const SW = window.synergyWraith;
    
    // 🔹 Główne zmienne
    let currentAddons = [];
    let searchQuery = '';
    let panelShortcut = 'Ctrl+A';
    let isShortcutInputFocused = false;
    let isCheckingLicense = false;
    let isAdmin = false;
    let addonShortcuts = {};
    let shortcutsEnabled = {};
    let currentFontSize = 13;
    let currentFilter = 'all';
    let userAccountId = null;
    let isLicenseVerified = false;
    let licenseData = null;
    let licenseExpiry = null;
    let serverConnected = true;

    // =========================================================================
    // 🔹 GŁÓWNE FUNKCJE PANELU
    // =========================================================================

    // 🔹 POPRAWIONE: Funkcja applyFontSize - NATYCHMIASTOWE DZIAŁANIE Z ZAPISEM
    function applyFontSize(size, skipSave = false) {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        const minSize = 10;
        const maxSize = 16;
        
        // NATYCHMIASTOWA BLOKADA
        const clampedSize = Math.max(minSize, Math.min(maxSize, size));
        
        // ZAPISZ NOWĄ WARTOŚĆ
        currentFontSize = clampedSize;
        
        if (!skipSave) {
            SW.GM_setValue(CONFIG.FONT_SIZE, clampedSize);
        }
        
        // NATYCHMIASTOWA AKTUALIZACJA PANELU
        panel.style.fontSize = clampedSize + 'px';
        
        // NATYCHMIASTOWA AKTUALIZACJA WYŚWIETLANIA
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeValue) {
            fontSizeValue.textContent = clampedSize + 'px';
            
            // WIZUALNA INDIKACJA BLOKADY
            if (clampedSize === minSize || clampedSize === maxSize) {
                fontSizeValue.classList.add('warning');
                setTimeout(() => fontSizeValue.classList.remove('warning'), 1000);
            } else {
                fontSizeValue.classList.remove('warning');
            }
        }
        
        // AKTUALIZUJ STAN PRZYCISKÓW
        updateFontSizeButtons(clampedSize);
        
        console.log('🔠 Zmieniono rozmiar czcionki na:', clampedSize + 'px');
    }

    // 🔹 NOWA: Funkcja aktualizacji przycisków czcionki
    function updateFontSizeButtons(currentSize) {
        const minSize = 10;
        const maxSize = 16;
        
        const decreaseBtn = document.getElementById('fontSizeDecrease');
        const increaseBtn = document.getElementById('fontSizeIncrease');
        
        if (decreaseBtn) {
            decreaseBtn.disabled = currentSize <= minSize;
            decreaseBtn.title = currentSize <= minSize ? 'Minimalny rozmiar (10px)' : 'Zmniejsz czcionkę';
        }
        
        if (increaseBtn) {
            increaseBtn.disabled = currentSize >= maxSize;
            increaseBtn.title = currentSize >= maxSize ? 'Maksymalny rozmiar (16px)' : 'Zwiększ czcionkę';
        }
    }

    // 🔹 POPRAWIONE: Funkcja applyOpacity
    function applyOpacity(opacity, skipSave = false) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const minOpacity = 30;
            const maxOpacity = 100;
            const clampedOpacity = Math.max(minOpacity, Math.min(maxOpacity, opacity));
            
            panel.style.opacity = clampedOpacity / 100;
            
            if (!skipSave) {
                SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, clampedOpacity);
            }
            
            const opacityValueEl = document.getElementById('opacityValue');
            if (opacityValueEl) {
                opacityValueEl.textContent = clampedOpacity + '%';
            }
        }
    }

    // 🔹 POPRAWIONE: Tworzenie przycisku przełączania (Z IKONĄ Z GITHUB)
    function createToggleButton() {
        const oldToggle = document.getElementById('swPanelToggle');
        if (oldToggle) oldToggle.remove();
        
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
        toggleBtn.innerHTML = '';
        
        document.body.appendChild(toggleBtn);
        console.log('✅ Toggle button created with GitHub icon');
        
        return toggleBtn;
    }

    // 🔹 Tworzenie głównego panelu
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        // 🔹 GENEROWANIE HTML PANELU
        panel.innerHTML = generatePanelHTML();
        
        document.body.appendChild(panel);
        console.log('✅ Panel created - v4.6.4 Improved Scrolling');
        
        // 🔹 INICJALIZACJA
        initializeEventListeners();
        loadSettings();
        setupPanelDrag();
        
        return panel;
    }

    // 🔹 NOWA: Generowanie HTML panelu
    function generatePanelHTML() {
        return `
            <div id="swPanelHeader">
                <strong>SYNERGY</strong>
                ${isAdmin ? ' <span style="color:#00ff00; font-size:14px;">👑</span>' : ''}
            </div>
            
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
                <button class="tablink" data-tab="shortcuts">Skróty</button>
                <button class="tablink" data-tab="license">Licencja</button>
                <button class="tablink" data-tab="settings">Ustawienia</button>
                <button class="tablink" data-tab="info">Info</button>
            </div>

            <!-- ZAKŁADKA DODATKI -->
            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div style="width:100%; max-width:800px; margin:0 auto 15px auto; flex-shrink: 0;">
                        <input type="text" id="searchAddons" placeholder="🔍 Wyszukaj dodatki..." 
                               style="width:100%; padding:12px 15px; background:rgba(51,0,0,0.8); 
                                      border:1px solid #660000; border-radius:6px; color:#ffcc00; 
                                      font-size:13px; box-sizing:border-box;">
                    </div>
                    
                    <div class="addon-filters">
                        <button class="filter-btn active" data-filter="all">Wszystkie</button>
                        <button class="filter-btn" data-filter="enabled">Włączone</button>
                        <button class="filter-btn" data-filter="disabled">Wyłączone</button>
                        <button class="filter-btn" data-filter="favorites">Ulubione</button>
                    </div>
                    
                    <div class="addon-list-container">
                        <div class="addon-list" id="addon-list"></div>
                    </div>
                    
                    <div class="refresh-button-container">
                        <button class="refresh-button" id="swSaveAndRestartButton">💾 Zapisz i odśwież grę</button>
                    </div>
                    
                    <div id="swAddonsMessage" class="license-message" style="display: none;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA SKRÓTY -->
            <div id="shortcuts" class="tabcontent">
                <div class="sw-tab-content">
                    <div style="margin-bottom:15px; padding:15px; background:linear-gradient(135deg, rgba(51,0,0,0.9), rgba(102,0,0,0.9)); border-radius:8px; border:1px solid #660000; width:100%; max-width:800px;">
                        <h3 style="color:#ffcc00; margin-top:0; margin-bottom:5px; font-size:14px; text-align:center;">Skróty klawiszowe</h3>
                        <p style="color:#ff9966; font-size:12px; margin:0; text-align:center;">
                            Skróty pokazują się tylko dla włączonych dodatków
                        </p>
                    </div>
                    
                    <div class="shortcuts-list-container">
                        <div id="shortcuts-list" style="width:100%;"></div>
                    </div>
                </div>
            </div>

            <!-- ZAKŁADKA LICENCJA -->
            <div id="license" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="license-scroll-container">
                        <div class="license-container">
                            <div class="license-header">Status Licencji</div>
                            <div class="license-status-item">
                                <span class="license-status-label">ID Konta:</span>
                                <span id="swAccountId" class="license-status-value">Ładowanie...</span>
                            </div>
                            <div class="license-status-item">
                                <span class="license-status-label">Status:</span>
                                <span id="swLicenseStatus" class="license-status-invalid">Nieaktywna</span>
                            </div>
                            <div class="license-status-item">
                                <span class="license-status-label">Ważna do:</span>
                                <span id="swLicenseExpiry" class="license-status-value">-</span>
                            </div>
                            <div class="license-status-item">
                                <span class="license-status-label">Dni pozostało:</span>
                                <span id="swLicenseDaysLeft" class="license-status-value">-</span>
                            </div>
                        </div>
                        
                        <div class="license-container">
                            <div class="license-header">Informacje o Premium</div>
                            <div style="padding:15px; color:#ffcc00; font-size:12px; text-align:center;">
                                <p>Aby uzyskać dostęp do dodatków premium, skontaktuj się z administratorem.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>

            <!-- ZAKŁADKA USTAWIENIA -->
            <div id="settings" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="scrollable-container">
                        <div class="settings-item">
                            <div class="settings-label">Rozmiar czcionki:</div>
                            <div class="font-size-controls">
                                <button class="font-size-btn" id="fontSizeDecrease">-</button>
                                <div class="font-size-display" id="fontSizeValue">13px</div>
                                <button class="font-size-btn" id="fontSizeIncrease">+</button>
                            </div>
                            <small style="color:#ff9966; font-size:11px; display:block; text-align:center;">Kliknij +/- aby zmienić (10-16px)</small>
                        </div>
                        
                        <div class="settings-item">
                            <div class="settings-label">Przeźroczystość panelu:</div>
                            <div class="slider-container">
                                <input type="range" min="30" max="100" value="90" class="opacity-slider" id="opacitySlider" step="1">
                                <span class="slider-value" id="opacityValue">90%</span>
                            </div>
                            <small style="color:#ff9966; font-size:11px; display:block; text-align:center;">30-100%</small>
                        </div>
                        
                        <div class="settings-item">
                            <div class="settings-label">Skrót do panelu:</div>
                            <div style="display:flex; gap:10px; align-items:center; margin-bottom:5px;">
                                <input type="text" id="panelShortcutInput" 
                                       style="flex:1; padding:10px; background:rgba(51,0,0,0.8); border:1px solid #660000; 
                                              border-radius:5px; color:#ffcc00; font-size:13px; text-align:center;" 
                                       value="Ctrl+A" readonly>
                                <button id="panelShortcutSetBtn">Ustaw</button>
                            </div>
                        </div>
                        
                        <div class="import-export-container">
                            <div class="settings-label">Eksport/Import ustawień:</div>
                            <div class="import-export-buttons">
                                <button class="import-export-btn" id="exportSettingsBtn">Eksportuj</button>
                                <button class="import-export-btn" id="importSettingsBtn">Importuj</button>
                            </div>
                            <textarea class="import-export-textarea" id="settingsTextarea" 
                                      placeholder="Dane pojawią się tutaj po eksporcie..."></textarea>
                        </div>
                        
                        <div style="margin:20px auto 0 auto; padding-top:15px; border-top:1px solid #660000; width:100%; max-width:600px; text-align:center;">
                            <button id="swResetButton">🔄 Resetuj ustawienia</button>
                        </div>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top:15px; padding:12px; border-radius:6px; display:none; font-size:12px; width:100%; max-width:600px; text-align:center;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA INFO -->
            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="scrollable-container">
                        <div style="text-align:center; padding:20px; width:100%; max-width:800px; margin:0 auto;">
                            <h3 style="color:#ffcc00; margin-bottom:20px; font-size:20px;">Synergy Panel</h3>
                            
                            <div class="info-section">
                                <h4>System Dodatków</h4>
                                <p>• Darmowe dodatki: dostępne dla każdego</p>
                                <p style="color:#00ff00;">• Premium dodatki: wymagają aktywnej licencji</p>
                                <p style="color:#ff9966;">• Filtry: Wszystkie / Włączone / Wyłączone / Ulubione</p>
                            </div>
                            
                            <div class="info-section">
                                <h4>System Licencji</h4>
                                <p>• Licencje przyznawane przez administratora</p>
                                <p>• Ważność czasowa (30 dni, 90 dni, etc.)</p>
                                <p>• Automatyczne odświeżanie statusu</p>
                            </div>
                            
                            <div class="info-section {
        color: #ffcc00;
        font-size: 13px;
        line-height: 1.6;
        margin: 12px 0;
        padding-left: 10px;
        position: relative;
    }

    .info-section p::before {
        content: "•";
        color: #ff6600;
        font-size: 16px;
        position: absolute;
        left: 0;
        top: 0;
    }

    .info-section p[style*="color:#00ff00"]::before {
        color: #00ff00;
    }

    .info-section p[style*="color:#ff9966"]::before {
        color: #ff9966;
    }">
                                <h4>Nowe Funkcje</h4>
                                <p>• Eksport/Import ustawień</p>
                                <p>• Filtry dodatków</p>
                                <p>• Skróty domyślnie wyłączone</p>
                                <p>• Płynne przesuwanie panelu</p>
                            </div>
                            
                            <div style="color:#ff9966; font-size:11px; margin-top:25px; padding:15px; 
                                        background:rgba(51,0,0,0.5); border-radius:6px;">
                                <p style="margin:5px 0;">© 2024 Synergy Panel</p>
                                <p style="margin:5px 0;">System licencji GitHub RAW</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 🔹 NOWA: Funkcja poprawiająca scrollowanie w zakładce dodatków
    function improveAddonsScrolling() {
        console.log('🔄 Poprawianie scrollowania w zakładce dodatków...');
        
        const addonsTab = document.getElementById('addons');
        if (!addonsTab) return;
        
        // Upewnij się, że kontener z listą dodatków ma odpowiednie właściwości flex
        const addonListContainer = addonsTab.querySelector('.addon-list-container');
        const addonList = addonsTab.querySelector('#addon-list');
        
        if (addonListContainer && addonList) {
            // Wymusz właściwości flex
            addonListContainer.style.flex = '1 1 auto';
            addonListContainer.style.minHeight = '0';
            addonListContainer.style.maxHeight = 'none';
            
            addonList.style.flex = '1';
            addonList.style.minHeight = '0';
            
            console.log('✅ Poprawiono właściwości scrollowania dla dodatków');
        }
        
        // Dodaj obsługę resize okna
        window.addEventListener('resize', function() {
            setTimeout(() => {
                if (addonListContainer) {
                    addonListContainer.style.maxHeight = 'none';
                    addonListContainer.style.flex = '1 1 auto';
                    
                    // Wymuś przeliczenie layoutu
                    addonListContainer.style.display = 'none';
                    void addonListContainer.offsetHeight;
                    addonListContainer.style.display = '';
                }
            }, 100);
        });
    }

    // 🔹 UPROSZCZONE: Funkcja scrollowania jak na normalnej stronie
    function setupNormalScrolling() {
        console.log('🖱️ Konfiguracja normalnego scrollowania...');
        
        const setupScrollForElement = (element) => {
            if (!element) return;
            
            // WŁĄCZ NORMALNY SCROLL
            element.style.overflowY = 'auto';
            element.style.overflowX = 'hidden';
            
            // 🔹 POZWÓŁ NA NORMALNE SCROLLOWANIE KÓŁKIEM MYSZY
            // Przeglądarka automatycznie obsłuży scrollowanie wewnątrz kontenera
            // gdy kursor jest nad nim
            
            // 🔹 ZAPOBIEGAJ TYLKO PRZENOSZENIU SCROLLOWANIA NA STRONĘ GDY KONTENER MOŻE SCROLLOWAĆ
            element.addEventListener('wheel', function(e) {
                // Jeśli kontener może scrollować w danym kierunku, nie pozwól na scrollowanie strony
                if (this.scrollHeight > this.clientHeight) {
                    const isAtTop = this.scrollTop === 0;
                    const isAtBottom = this.scrollTop + this.clientHeight >= this.scrollHeight;
                    
                    // Jeśli scrollujemy w górę, a nie jesteśmy na górze kontenera
                    if (e.deltaY < 0 && !isAtTop) {
                        e.stopPropagation();
                    }
                    // Jeśli scrollujemy w dół, a nie jesteśmy na dole kontenera
                    else if (e.deltaY > 0 && !isAtBottom) {
                        e.stopPropagation();
                    }
                    // W przeciwnym razie pozwól na scrollowanie strony
                }
            }, { passive: false });
        };
        
        // Ustaw dla wszystkich kontenerów z scrollowaniem
        setTimeout(() => {
            const scrollableElements = [
                document.querySelector('.addon-list-container'),
                document.querySelector('.shortcuts-list-container'),
                document.querySelector('.license-scroll-container'),
                document.querySelector('.scrollable-container')
            ];
            
            scrollableElements.forEach(setupScrollForElement);
            
            // Dodatkowo dla wszystkich elementów z klasą .scrollable-container
            document.querySelectorAll('.scrollable-container').forEach(setupScrollForElement);
            
            console.log('✅ Konfiguracja normalnego scrollowania zakończona');
        }, 500);
    }

    // 🔹 NOWA: Funkcja wymuszenia widoczności scrolla
    function forceScrollVisibility() {
        const containers = [
            '.addon-list-container',
            '.shortcuts-list-container',
            '.license-scroll-container',
            '.scrollable-container'
        ];
        
        containers.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                // Wymuś ponowne obliczenie layoutu
                container.style.display = 'none';
                void container.offsetHeight;
                container.style.display = '';
                
                // Wymuś widoczność scrolla
                container.style.overflowY = 'auto';
                container.style.overflowX = 'hidden';
                
                // Dla addon-list-container usuń max-height
                if (selector === '.addon-list-container') {
                    container.style.maxHeight = 'none';
                    container.style.flex = '1 1 auto';
                    container.style.minHeight = '0';
                }
            }
        });
    }

    // 🔹 POPRAWIONE: Setup przeciągania PANELU
    function setupPanelDrag() {
        const panel = document.getElementById('swAddonsPanel');
        const header = document.getElementById('swPanelHeader');
        
        if (!panel) return;
        
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;

        const startDrag = (e) => {
            const rect = panel.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            
            if (clickY <= 90) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                initialLeft = parseInt(panel.style.left) || 70;
                initialTop = parseInt(panel.style.top) || 140;
                
                panel.classList.add('dragging');
                panel.style.cursor = 'grabbing';
                
                document.addEventListener('mousemove', onDrag);
                document.addEventListener('mouseup', stopDrag);
                
                e.preventDefault();
                e.stopPropagation();
            }
        };

        function onDrag(e) {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;
            
            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;
            
            newLeft = Math.max(0, Math.min(newLeft, maxX));
            newTop = Math.max(0, Math.min(newTop, maxY));
            
            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
            
            e.preventDefault();
        }

        function stopDrag() {
            if (!isDragging) return;
            
            isDragging = false;
            panel.classList.remove('dragging');
            panel.style.cursor = '';
            
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
            
            SW.GM_setValue(CONFIG.PANEL_POSITION, {
                left: panel.style.left,
                top: panel.style.top
            });
        }

        panel.addEventListener('mousedown', startDrag);
        panel.addEventListener('dragstart', (e) => e.preventDefault());
    }

    // 🔹 Setup przeciągania przycisku
    function setupToggleDrag(toggleBtn) {
        if (!toggleBtn) return;
        
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        
        const savedPos = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        if (savedPos) {
            toggleBtn.style.left = savedPos.left;
            toggleBtn.style.top = savedPos.top;
        } else {
            toggleBtn.style.left = '70px';
            toggleBtn.style.top = '70px';
        }

        toggleBtn.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = toggleBtn.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            
            const dragTimer = setTimeout(() => {
                isDragging = true;
                toggleBtn.classList.add('dragging');
                toggleBtn.style.cursor = 'grabbing';
            }, 100);
            
            function onMouseMove(e) {
                if (!isDragging) return;
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                let newLeft = initialLeft + deltaX;
                let newTop = initialTop + deltaY;
                
                const maxX = window.innerWidth - toggleBtn.offsetWidth;
                const maxY = window.innerHeight - toggleBtn.offsetHeight;
                
                newLeft = Math.max(0, Math.min(newLeft, maxX));
                newTop = Math.max(0, Math.min(newTop, maxY));
                
                toggleBtn.style.left = newLeft + 'px';
                toggleBtn.style.top = newTop + 'px';
                
                e.preventDefault();
            }

            function onMouseUp() {
                clearTimeout(dragTimer);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                
                if (isDragging) {
                    isDragging = false;
                    toggleBtn.classList.remove('dragging');
                    toggleBtn.style.cursor = '';
                    toggleBtn.classList.add('saved');
                    
                    SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, {
                        left: toggleBtn.style.left,
                        top: toggleBtn.style.top
                    });
                    
                    setTimeout(() => toggleBtn.classList.remove('saved'), 1500);
                } else {
                    togglePanel();
                }
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // 🔹 Toggle panelu
    function togglePanel() {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const isVisible = panel.style.display === 'block';
            panel.style.display = isVisible ? 'none' : 'block';
            SW.GM_setValue(CONFIG.PANEL_VISIBLE, !isVisible);
        }
    }

    // 🔹 Setup skrótu panelu
    function setupPanelShortcutInput() {
        const input = document.getElementById('panelShortcutInput');
        const setBtn = document.getElementById('panelShortcutSetBtn');
        
        if (!input || !setBtn) return;
        
        const savedShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        panelShortcut = savedShortcut;
        input.value = panelShortcut;
        
        setBtn.addEventListener('click', function() {
            input.value = 'Wciśnij kombinację...';
            input.style.borderColor = '#ff3300';
            input.style.boxShadow = '0 0 10px rgba(255, 51, 0, 0.5)';
            
            let keys = [];
            let isSetting = true;
            
            const keyDownHandler = (e) => {
                if (!isSetting) return;
                e.preventDefault();
                e.stopPropagation();
                
                const keyParts = [];
                if (e.ctrlKey) keyParts.push('Ctrl');
                if (e.shiftKey) keyParts.push('Shift');
                if (e.altKey) keyParts.push('Alt');
                
                const mainKey = e.key.toUpperCase();
                if (!['CONTROL', 'SHIFT', 'ALT', 'META'].includes(mainKey)) {
                    keyParts.push(mainKey);
                }
                
                const shortcut = keyParts.join('+');
                input.value = shortcut;
                keys = keyParts;
            };
            
            const keyUpHandler = (e) => {
                if (!isSetting) return;
                
                if (keys.length >= 2) {
                    isSetting = false;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    
                    panelShortcut = keys.join('+');
                    SW.GM_setValue(CONFIG.CUSTOM_SHORTCUT, panelShortcut);
                    
                    input.value = panelShortcut;
                    input.style.borderColor = '#00cc00';
                    input.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
                    
                    const messageEl = document.getElementById('swResetMessage');
                    if (messageEl) {
                        messageEl.textContent = `✅ Skrót ustawiony: ${panelShortcut}`;
                        messageEl.style.background = 'rgba(0, 255, 0, 0.1)';
                        messageEl.style.color = '#00ff00';
                        messageEl.style.border = '1px solid #00ff00';
                        messageEl.style.display = 'block';
                        setTimeout(() => messageEl.style.display = 'none', 3000);
                    }
                    
                    setTimeout(() => {
                        input.style.borderColor = '#660000';
                        input.style.boxShadow = 'none';
                    }, 2000);
                }
            };
            
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    isSetting = false;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    document.removeEventListener('keydown', escapeHandler);
                    
                    input.value = panelShortcut;
                    input.style.borderColor = '#660000';
                    input.style.boxShadow = 'none';
                }
            };
            
            document.addEventListener('keydown', keyDownHandler);
            document.addEventListener('keyup', keyUpHandler);
            document.addEventListener('keydown', escapeHandler);
            
            setTimeout(() => {
                if (isSetting) {
                    isSetting = false;
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    document.removeEventListener('keydown', escapeHandler);
                    
                    input.value = panelShortcut;
                    input.style.borderColor = '#660000';
                    input.style.boxShadow = 'none';
                }
            }, 10000);
        });
    }

    // 🔹 Setup zakładek
    function setupTabs() {
        const tabs = document.querySelectorAll('.tablink');
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const tabName = this.getAttribute('data-tab');
                showTab(tabName);
                
                if (tabName === 'shortcuts') {
                    setTimeout(renderShortcuts, 100);
                }
                
                if (tabName === 'addons') {
                    setTimeout(() => {
                        improveAddonsScrolling();
                        forceScrollVisibility();
                    }, 50);
                } else {
                    // Inicjalizuj scroll dla nowo otwartej zakładki
                    setTimeout(() => {
                        forceScrollVisibility();
                    }, 50);
                }
            });
        });
    }

    function showTab(tabName) {
        const tabContents = document.querySelectorAll('.tabcontent');
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        const tabs = document.querySelectorAll('.tablink');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        const tabToShow = document.getElementById(tabName);
        if (tabToShow) {
            tabToShow.classList.add('active');
            tabToShow.style.display = 'flex';
        }
        
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        }
    }

    // 🔹 Setup globalnych skrótów
    function setupGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (isShortcutInputFocused) return;
            
            const panelShortcutParts = panelShortcut.split('+');
            const hasCtrl = panelShortcutParts.includes('Ctrl');
            const hasShift = panelShortcutParts.includes('Shift');
            const hasAlt = panelShortcutParts.includes('Alt');
            const key = panelShortcutParts[panelShortcutParts.length - 1].toUpperCase();
            
            const ctrlMatch = hasCtrl ? e.ctrlKey : !e.ctrlKey;
            const shiftMatch = hasShift ? e.shiftKey : !e.shiftKey;
            const altMatch = hasAlt ? e.altKey : !e.altKey;
            const keyMatch = e.key.toUpperCase() === key;
            
            if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                e.preventDefault();
                togglePanel();
                return;
            }
            
            Object.keys(addonShortcuts).forEach(addonId => {
                const shortcut = addonShortcuts[addonId];
                if (!shortcut || shortcutsEnabled[addonId] !== true) return;
                
                const parts = shortcut.split('+');
                const sHasCtrl = parts.includes('Ctrl');
                const sHasShift = parts.includes('Shift');
                const sHasAlt = parts.includes('Alt');
                const sKey = parts[parts.length - 1].toUpperCase();
                
                const sCtrlMatch = sHasCtrl ? e.ctrlKey : !e.ctrlKey;
                const sShiftMatch = sHasShift ? e.shiftKey : !e.shiftKey;
                const sAltMatch = sHasAlt ? e.altKey : !e.altKey;
                const sKeyMatch = e.key.toUpperCase() === sKey;
                
                if (sCtrlMatch && sShiftMatch && sAltMatch && sKeyMatch) {
                    e.preventDefault();
                    const addon = currentAddons.find(a => a.id === addonId);
                    if (addon && addon.enabled && !addon.locked) {
                        toggleAddon(addonId, false);
                        showShortcutMessage(`⚠️ ${addon.name} wyłączony (${shortcut})`, 'info');
                    }
                }
            });
        });
    }

    // 🔹 Ładowanie stanu skrótów
    function loadShortcutsEnabledState() {
        shortcutsEnabled = SW.GM_getValue(CONFIG.SHORTCUTS_ENABLED, {});
        
        Object.keys(addonShortcuts).forEach(addonId => {
            if (shortcutsEnabled[addonId] === undefined) {
                shortcutsEnabled[addonId] = false;
            }
        });
        
        saveShortcutsEnabledState();
    }

    // 🔹 Uproszczony eksport ustawień
    function exportSettings() {
        try {
            const settings = {
                v: '4.6',
                t: Date.now(),
                a: SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []),
                s: SW.GM_getValue(CONFIG.SHORTCUTS_CONFIG, {}),
                se: SW.GM_getValue(CONFIG.SHORTCUTS_ENABLED, {}),
                p: SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A'),
                f: SW.GM_getValue(CONFIG.FONT_SIZE, 13),
                o: SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90)
            };
            
            const jsonString = JSON.stringify(settings);
            const base64 = btoa(unescape(encodeURIComponent(jsonString)));
            
            let obfuscated = base64.split('').reverse().join('')
                .replace(/=/g, '_')
                .replace(/\+/g, '-')
                .replace(/\//g, '.');
            
            const checksum = obfuscated.length.toString(36);
            obfuscated = checksum + ':' + obfuscated;
            
            const textarea = document.getElementById('settingsTextarea');
            if (textarea) {
                textarea.value = obfuscated;
                
                textarea.select();
                textarea.setSelectionRange(0, 99999);
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        showLicenseMessage('✅ Ustawienia wyeksportowane i skopiowane do schowka!', 'success');
                    } else {
                        showLicenseMessage('✅ Ustawienia wyeksportowane! Skopiuj tekst ręcznie.', 'info');
                    }
                } catch (err) {
                    showLicenseMessage('✅ Ustawienia wyeksportowane! Skopiuj tekst ręcznie.', 'info');
                }
            }
            
        } catch (error) {
            console.error('❌ Błąd eksportu:', error);
            showLicenseMessage('❌ Błąd eksportu ustawień', 'error');
        }
    }

    // 🔹 Import obfuskowanych ustawień
    function importSettings() {
        const textarea = document.getElementById('settingsTextarea');
        if (!textarea || !textarea.value.trim()) {
            showLicenseMessage('❌ Brak danych do importu', 'error');
            return;
        }
        
        try {
            let obfuscated = textarea.value.trim();
            
            const parts = obfuscated.split(':');
            if (parts.length !== 2) {
                throw new Error('Nieprawidłowy format danych');
            }
            
            const checksum = parts[0];
            let data = parts[1];
            
            data = data.replace(/_/g, '=')
                      .replace(/-/g, '+')
                      .replace(/\./g, '/')
                      .split('').reverse().join('');
            
            if (parseInt(checksum, 36) !== data.length) {
                throw new Error('Dane uszkodzone - nieprawidłowa checksum');
            }
            
            const decoded = decodeURIComponent(escape(atob(data)));
            const settings = JSON.parse(decoded);
            
            if (!settings.v) {
                throw new Error('Brak informacji o wersji');
            }
            
            if (settings.v !== '4.6') {
                if (!confirm(`To ustawienia z wersji ${settings.v}. Kontynuować import?`)) {
                    return;
                }
            }
            
            if (settings.a) SW.GM_setValue(CONFIG.FAVORITE_ADDONS, settings.a);
            if (settings.s) SW.GM_setValue(CONFIG.SHORTCUTS_CONFIG, settings.s);
            if (settings.se) SW.GM_setValue(CONFIG.SHORTCUTS_ENABLED, settings.se);
            if (settings.p) SW.GM_setValue(CONFIG.CUSTOM_SHORTCUT, settings.p);
            if (settings.f) SW.GM_setValue(CONFIG.FONT_SIZE, settings.f);
            if (settings.o) SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, settings.o);
            
            showLicenseMessage('✅ Ustawienia zaimportowane! Odświeżanie...', 'success');
            setTimeout(() => location.reload(), 2000);
            
        } catch (error) {
            console.error('❌ Błąd importu:', error);
            showLicenseMessage('❌ Nieprawidłowy format danych importu', 'error');
        }
    }

    // 🔹 Inicjalizacja event listenerów
    function initializeEventListeners() {
        // Przycisk zapisz i odśwież
        const saveRestartBtn = document.getElementById('swSaveAndRestartButton');
        if (saveRestartBtn) {
            saveRestartBtn.addEventListener('click', () => {
                saveAddonsState();
                showLicenseMessage('✅ Zapisano ustawienia! Odświeżanie gry...', 'success');
                setTimeout(() => location.reload(), 1500);
            });
        }
        
        // Reset ustawień
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) {
                    resetAllSettings();
                }
            });
        }
        
        // 🔹 PRZYCISKI ZMIANY CZCIONKI - NATYCHMIASTOWE DZIAŁANIE Z BLOKADĄ
        const fontSizeDecrease = document.getElementById('fontSizeDecrease');
        const fontSizeIncrease = document.getElementById('fontSizeIncrease');
        
        if (fontSizeDecrease) {
            fontSizeDecrease.addEventListener('click', function() {
                if (!this.disabled) {
                    applyFontSize(currentFontSize - 1);
                }
            });
        }
        
        if (fontSizeIncrease) {
            fontSizeIncrease.addEventListener('click', function() {
                if (!this.disabled) {
                    applyFontSize(currentFontSize + 1);
                }
            });
        }
        
        // 🔹 SUWAK PRZEŹROCZYSTOŚCI
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        if (opacitySlider && opacityValue) {
            opacitySlider.addEventListener('input', function() {
                const opacity = parseInt(this.value);
                opacityValue.textContent = opacity + '%';
                applyOpacity(opacity);
            });
        }
        
        // 🔹 FILTRY DODATKÓW
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderAddons();
            });
        });
        
        // 🔹 EKSPORT/IMPORT USTAWIEN
        const exportBtn = document.getElementById('exportSettingsBtn');
        const importBtn = document.getElementById('importSettingsBtn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', exportSettings);
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', importSettings);
        }
        
        // Wyszukiwanie dodatków
        const searchInput = document.getElementById('searchAddons');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchQuery = this.value.toLowerCase();
                renderAddons();
            });
        }
        
        // 🔹 SKRÓT PANELU
        setupPanelShortcutInput();
        
        // 🔹 ZAKŁADKI
        setupTabs();
        
        // 🔹 GLOBALNE SKRÓTY
        setupGlobalShortcuts();
        
        // 🔹 POPRAW SCROLLOWANIE W DODATKACH
        setTimeout(() => {
            improveAddonsScrolling();
            setupNormalScrolling();
            forceScrollVisibility();
        }, 1000);
    }

    // 🔹 Renderowanie dodatków z FILTRAMI
    function renderAddons() {
        const listContainer = document.getElementById('addon-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        let filteredAddons = currentAddons.filter(addon => !addon.hidden);
        
        switch(currentFilter) {
            case 'enabled':
                filteredAddons = filteredAddons.filter(addon => addon.enabled);
                break;
            case 'disabled':
                filteredAddons = filteredAddons.filter(addon => !addon.enabled);
                break;
            case 'favorites':
                filteredAddons = filteredAddons.filter(addon => addon.favorite);
                break;
        }
        
        if (searchQuery) {
            filteredAddons = filteredAddons.filter(addon => 
                addon.name.toLowerCase().includes(searchQuery) || 
                addon.description.toLowerCase().includes(searchQuery)
            );
        }
        
        if (filteredAddons.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center; padding:40px; color:#ff9966; font-style:italic; font-size:12px; width:100%;">
                    ${searchQuery || currentFilter !== 'all' ? 'Nie znaleziono dodatków' : 'Brak dostępnych dodatków'}
                </div>
            `;
            return;
        }
        
        filteredAddons.forEach(addon => {
            const div = document.createElement('div');
            div.className = 'addon';
            div.dataset.id = addon.id;
            
            div.innerHTML = `
                <div class="addon-header">
                    <div class="addon-title">
                        ${addon.type === 'premium' ? '<span class="premium-badge">PREMIUM</span> ' : ''}
                        ${addon.name}
                        ${addon.locked ? ' <span style="color:#ff3300; font-size:10px;">(Wymaga licencji)</span>' : ''}
                    </div>
                    <div class="addon-description">${addon.description}</div>
                </div>
                <div class="addon-controls">
                    <button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" 
                            data-id="${addon.id}"
                            title="${addon.locked ? 'Wymaga licencji' : 'Dodaj do ulubionych'}"
                            ${addon.locked ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        ★
                    </button>
                    <label class="addon-switch" title="${addon.locked ? 'Wymaga licencji' : 'Włącz/Wyłącz'}">
                        <input type="checkbox" 
                               ${addon.enabled ? 'checked' : ''} 
                               ${addon.locked ? 'disabled' : ''}
                               data-id="${addon.id}">
                        <span class="addon-switch-slider"></span>
                    </label>
                </div>
            `;
            
            listContainer.appendChild(div);
        });
        
        document.querySelectorAll('.favorite-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const addonId = this.dataset.id;
                if (addonId) toggleFavorite(addonId);
            });
        });
        
        document.querySelectorAll('.addon-switch input:not(:disabled)').forEach(checkbox => {
            checkbox.addEventListener('change', function(e) {
                e.stopPropagation();
                const addonId = this.dataset.id;
                if (addonId) toggleAddon(addonId, this.checked);
            });
        });
        
        setTimeout(() => {
            improveAddonsScrolling();
            forceScrollVisibility();
        }, 100);
    }

    // 🔹 POPRAWIONE: Renderowanie skrótów (POKAZUJE WŁĄCZONE DODATKI)
    function renderShortcuts() {
        const container = document.getElementById('shortcuts-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        // POKAZUJ TYLKO WŁĄCZONE DODATKI
        const enabledAddons = currentAddons.filter(addon => 
            addon.enabled && !addon.hidden && !addon.locked
        );
        
        if (enabledAddons.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:30px; color:#ff9966; font-style:italic; font-size:12px; width:100%;">
                    Brak włączonych dodatków. Włącz dodatek w zakładce "Dodatki".
                </div>
            `;
            return;
        }
        
        enabledAddons.forEach(addon => {
            const shortcut = addonShortcuts[addon.id] || 'Brak skrótu';
            const isEnabled = shortcutsEnabled[addon.id] === true;
            
            const item = document.createElement('div');
            item.className = 'shortcut-item';
            item.innerHTML = `
                <div class="shortcut-info">
                    <div class="shortcut-name">
                        ${addon.type === 'premium' ? '<span class="premium-badge">PREMIUM</span> ' : ''}
                        ${addon.name}
                    </div>
                    <div class="shortcut-desc">${addon.description}</div>
                </div>
                <div class="shortcut-controls">
                    <div class="shortcut-display" id="shortcut-display-${addon.id}">
                        ${shortcut}
                    </div>
                    <button class="shortcut-set-btn" data-id="${addon.id}">Ustaw</button>
                    <button class="shortcut-clear-btn" data-id="${addon.id}">Wyczyść</button>
                    <label class="shortcut-toggle" title="${isEnabled ? 'Wyłącz skrót' : 'Włącz skrót'}">
                        <input type="checkbox" ${isEnabled ? 'checked' : ''} data-id="${addon.id}" class="shortcut-toggle-input">
                        <span class="shortcut-toggle-slider"></span>
                    </label>
                </div>
            `;
            
            container.appendChild(item);
        });
        
        document.querySelectorAll('.shortcut-set-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const addonId = this.dataset.id;
                setAddonShortcut(addonId);
            });
        });
        
        document.querySelectorAll('.shortcut-clear-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const addonId = this.dataset.id;
                clearAddonShortcut(addonId);
            });
        });
        
        document.querySelectorAll('.shortcut-toggle-input').forEach(toggle => {
            toggle.addEventListener('change', function() {
                const addonId = this.dataset.id;
                toggleShortcutEnabled(addonId, this.checked);
            });
        });
    }

    // 🔹 Przełączanie ulubionych
    function toggleFavorite(addonId) {
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        if (addonIndex === -1) return;
        
        currentAddons[addonIndex].favorite = !currentAddons[addonIndex].favorite;
        saveAddonsState();
        
        if (currentFilter === 'favorites') {
            renderAddons();
        } else {
            const btn = document.querySelector(`.favorite-btn[data-id="${addonId}"]`);
            if (btn) {
                btn.classList.toggle('favorite');
            }
        }
    }

    // 🔹 Przełączanie dodatków
    function toggleAddon(addonId, isEnabled) {
        const addon = currentAddons.find(a => a.id === addonId);
        if (!addon || addon.locked) return;
        
        const addonIndex = currentAddons.findIndex(a => a.id === addonId);
        currentAddons[addonIndex].enabled = isEnabled;
        saveAddonsState();
        
        const messageEl = document.getElementById('swAddonsMessage');
        if (messageEl) {
            messageEl.textContent = `${addon.name} ${isEnabled ? 'włączony' : 'wyłączony'}`;
            messageEl.className = `license-message license-${isEnabled ? 'success' : 'info'}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 3000);
        }
        
        if (isEnabled) {
            if (shortcutsEnabled[addonId] === undefined) {
                shortcutsEnabled[addonId] = false;
                saveShortcutsEnabledState();
            }
        }
        
        if (document.getElementById('shortcuts').classList.contains('active')) {
            renderShortcuts();
        }
    }

    // 🔹 Zapisywanie stanu dodatków
    function saveAddonsState() {
        const addonsToSave = currentAddons.map(addon => ({
            id: addon.id,
            enabled: addon.enabled || false,
            favorite: addon.favorite || false
        }));
        SW.GM_setValue(CONFIG.FAVORITE_ADDONS, addonsToSave);
    }

    // 🔹 Przywracanie stanu dodatków
    function restoreAddonsState() {
        const savedAddons = SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []);
        currentAddons = ADDONS.map(addon => {
            const savedAddon = savedAddons.find(a => a.id === addon.id);
            if (savedAddon) {
                return {
                    ...addon,
                    enabled: savedAddon.enabled || false,
                    favorite: savedAddon.favorite || false
                };
            }
            return { ...addon, enabled: false, favorite: false };
        });
    }

    // 🔹 Ładowanie skrótów
    function loadAddonShortcuts() {
        addonShortcuts = SW.GM_getValue(CONFIG.SHORTCUTS_CONFIG, {});
    }

    function saveAddonShortcuts() {
        SW.GM_setValue(CONFIG.SHORTCUTS_CONFIG, addonShortcuts);
    }

    function saveShortcutsEnabledState() {
        SW.GM_setValue(CONFIG.SHORTCUTS_ENABLED, shortcutsEnabled);
    }

    // 🔹 Ustawianie skrótu dla dodatku
    function setAddonShortcut(addonId) {
        const display = document.getElementById(`shortcut-display-${addonId}`);
        if (!display) return;
        
        display.textContent = 'Wciśnij kombinację...';
        display.style.color = '#ffcc00';
        display.style.borderColor = '#ff3300';
        
        let keys = [];
        let isSetting = true;
        
        const keyDownHandler = (e) => {
            if (!isSetting) return;
            e.preventDefault();
            e.stopPropagation();
            
            const keyParts = [];
            if (e.ctrlKey) keyParts.push('Ctrl');
            if (e.shiftKey) keyParts.push('Shift');
            if (e.altKey) keyParts.push('Alt');
            
            const mainKey = e.key.toUpperCase();
            if (!['CONTROL', 'SHIFT', 'ALT', 'META'].includes(mainKey)) {
                keyParts.push(mainKey);
            }
            
            const shortcut = keyParts.join('+');
            display.textContent = shortcut;
            keys = keyParts;
        };
        
        const keyUpHandler = (e) => {
            if (!isSetting) return;
            
            if (keys.length >= 2) {
                isSetting = false;
                document.removeEventListener('keydown', keyDownHandler);
                document.removeEventListener('keyup', keyUpHandler);
                
                const shortcut = keys.join('+');
                addonShortcuts[addonId] = shortcut;
                saveAddonShortcuts();
                
                shortcutsEnabled[addonId] = false;
                saveShortcutsEnabledState();
                
                display.textContent = shortcut;
                display.style.color = '#00ff00';
                display.style.borderColor = '#00cc00';
                
                showShortcutMessage(`✅ Skrót ustawiony: ${shortcut} (domyślnie wyłączony)`, 'success');
                
                setTimeout(() => {
                    display.style.color = '#ffcc00';
                    display.style.borderColor = '#660000';
                }, 2000);
            }
        };
        
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                isSetting = false;
                document.removeEventListener('keydown', keyDownHandler);
                document.removeEventListener('keyup', keyUpHandler);
                document.removeEventListener('keydown', escapeHandler);
                
                const oldShortcut = addonShortcuts[addonId] || 'Brak skrótu';
                display.textContent = oldShortcut;
                display.style.color = '#ffcc00';
                display.style.borderColor = '#660000';
            }
        };
        
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        document.addEventListener('keydown', escapeHandler);
        
        setTimeout(() => {
            if (isSetting) {
                isSetting = false;
                document.removeEventListener('keydown', keyDownHandler);
                document.removeEventListener('keyup', keyUpHandler);
                document.removeEventListener('keydown', escapeHandler);
                
                const oldShortcut = addonShortcuts[addonId] || 'Brak skrótu';
                display.textContent = oldShortcut;
                display.style.color = '#ffcc00';
                display.style.borderColor = '#660000';
                
                showShortcutMessage('⏰ Czas minął', 'error');
            }
        }, 10000);
    }

    // 🔹 Czyszczenie skrótu
    function clearAddonShortcut(addonId) {
        delete addonShortcuts[addonId];
        delete shortcutsEnabled[addonId];
        
        saveAddonShortcuts();
        saveShortcutsEnabledState();
        
        const display = document.getElementById(`shortcut-display-${addonId}`);
        if (display) {
            display.textContent = 'Brak skrótu';
        }
        
        showShortcutMessage('Skrót wyczyszczony', 'info');
    }

    // 🔹 Przełączanie włączenia skrótu
    function toggleShortcutEnabled(addonId, enabled) {
        shortcutsEnabled[addonId] = enabled;
        saveShortcutsEnabledState();
        showShortcutMessage(enabled ? '✅ Skrót włączony' : '⚠️ Skrót wyłączony', 'info');
    }

    // 🔹 Wyświetlanie wiadomości dla skrótów
    function showShortcutMessage(message, type) {
        const messageEl = document.getElementById('shortcutsMessage') || createShortcutsMessageElement();
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `license-message license-${type}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 3000);
        }
    }

    function createShortcutsMessageElement() {
        const shortcutsTab = document.getElementById('shortcuts');
        if (!shortcutsTab) return null;
        
        const messageEl = document.createElement('div');
        messageEl.id = 'shortcutsMessage';
        messageEl.className = 'license-message';
        messageEl.style.display = 'none';
        messageEl.style.marginTop = '10px';
        messageEl.style.width = '100%';
        messageEl.style.maxWidth = '800px';
        
        const content = shortcutsTab.querySelector('.sw-tab-content');
        if (content) {
            content.appendChild(messageEl);
        }
        
        return messageEl;
    }

    // 🔹 POPRAWIONE: Ładowanie ustawień z ZAPISEM wartości
    function loadSettings() {
        const savedFontSize = parseInt(SW.GM_getValue(CONFIG.FONT_SIZE, 13));
        currentFontSize = savedFontSize;
        
        // Zastosuj czcionkę natychmiast (skipSave=true żeby nie zapisywać ponownie)
        applyFontSize(savedFontSize, true);
        
        const savedOpacity = parseInt(SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90));
        applyOpacity(savedOpacity, true);
        
        const savedShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        panelShortcut = savedShortcut;
        const panelInput = document.getElementById('panelShortcutInput');
        if (panelInput) panelInput.value = panelShortcut;
        
        // Ustaw wartości w inputach
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeValue) fontSizeValue.textContent = savedFontSize + 'px';
        
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        if (opacitySlider && opacityValue) {
            opacitySlider.value = savedOpacity;
            opacityValue.textContent = savedOpacity + '%';
        }
        
        updateFontSizeButtons(currentFontSize);
    }

    // 🔹 Ładowanie zapisanego stanu
    function loadSavedState() {
        const savedBtnPosition = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        const toggleBtn = document.getElementById('swPanelToggle');
        if (toggleBtn && savedBtnPosition) {
            toggleBtn.style.left = savedBtnPosition.left;
            toggleBtn.style.top = savedBtnPosition.top;
        }
        
        const savedPosition = SW.GM_getValue(CONFIG.PANEL_POSITION);
        const panel = document.getElementById('swAddonsPanel');
        if (panel && savedPosition) {
            panel.style.left = savedPosition.left;
            panel.style.top = savedPosition.top;
        }
        
        const isVisible = SW.GM_getValue(CONFIG.PANEL_VISIBLE, false);
        if (panel) {
            panel.style.display = isVisible ? 'block' : 'none';
        }
    }

    // 🔹 Reset wszystkich ustawień
    function resetAllSettings() {
        Object.keys(CONFIG).forEach(key => {
            SW.GM_deleteValue(CONFIG[key]);
        });
        
        currentAddons = ADDONS.map(addon => ({
            ...addon,
            enabled: addon.type === 'free' ? false : false,
            favorite: false,
            locked: addon.type === 'premium',
            hidden: addon.type === 'premium'
        }));
        
        userAccountId = null;
        isLicenseVerified = false;
        licenseData = null;
        licenseExpiry = null;
        isAdmin = false;
        addonShortcuts = {};
        shortcutsEnabled = {};
        panelShortcut = 'Ctrl+A';
        currentFontSize = 13;
        currentFilter = 'all';
        
        const resetMessage = document.getElementById('swResetMessage');
        if (resetMessage) {
            resetMessage.textContent = '✅ Wszystkie ustawienia zresetowane! Strona zostanie odświeżona...';
            resetMessage.style.background = 'rgba(255, 102, 0, 0.1)';
            resetMessage.style.color = '#ff6600';
            resetMessage.style.border = '1px solid #ff6600';
            resetMessage.style.display = 'block';
            setTimeout(() => location.reload(), 2000);
        }
    }

    // =========================================================================
    // 🔹 SYSTEM KONTA I LICENCJI
    // =========================================================================

    async function initAccountAndLicense() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const accountId = await getAccountId();
        console.log('👤 ID konta:', accountId);
        
        if (accountId) {
            userAccountId = accountId;
            SW.GM_setValue(CONFIG.ACCOUNT_ID, accountId);
            
            isAdmin = checkIfAdmin(accountId);
            SW.GM_setValue(CONFIG.ADMIN_ACCESS, isAdmin);
            
            updateAccountDisplay(accountId);
            await checkAndUpdateLicense(accountId);
        } else {
            updateAccountDisplay('Nie znaleziono');
        }
    }

    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) return cookieValue;
        }
        return null;
    }

    async function getAccountId() {
        try {
            const userId = getCookie('user_id');
            if (userId) return userId;
            
            const mcharId = getCookie('mchar_id');
            if (mcharId) return mcharId;
            
            const savedAccountId = SW.GM_getValue(CONFIG.ACCOUNT_ID);
            if (savedAccountId) return savedAccountId;
            
            const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            SW.GM_setValue(CONFIG.ACCOUNT_ID, tempId);
            return tempId;
        } catch (e) {
            const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            SW.GM_setValue(CONFIG.ACCOUNT_ID, tempId);
            return tempId;
        }
    }

    function checkIfAdmin(accountId) {
        if (!accountId) return false;
        return accountId.toString() === '7411461';
    }

    async function checkAndUpdateLicense(accountId) {
        if (isCheckingLicense) return;
        isCheckingLicense = true;
        
        try {
            const result = await checkLicenseForAccount(accountId);
            
            if (result.success) {
                if (result.hasLicense && !result.expired && !result.used) {
                    isLicenseVerified = true;
                    licenseData = result;
                    licenseExpiry = result.expiry ? new Date(result.expiry) : null;
                    
                    SW.GM_setValue(CONFIG.LICENSE_ACTIVE, true);
                    SW.GM_setValue(CONFIG.LICENSE_EXPIRY, licenseExpiry?.toISOString());
                    SW.GM_setValue(CONFIG.LICENSE_DATA, licenseData);
                    
                    loadAddonsBasedOnLicense(result.addons || ['all']);
                    showLicenseMessage(`✅ Licencja aktywna! Ważna do: ${licenseExpiry ? licenseExpiry.toLocaleDateString('pl-PL') : 'bezterminowo'}`, 'success');
                } else {
                    isLicenseVerified = false;
                    licenseData = null;
                    licenseExpiry = null;
                    
                    SW.GM_setValue(CONFIG.LICENSE_ACTIVE, false);
                    SW.GM_deleteValue(CONFIG.LICENSE_EXPIRY);
                    SW.GM_deleteValue(CONFIG.LICENSE_DATA);
                    
                    loadAddonsBasedOnLicense([]);
                    
                    if (result.expired) {
                        showLicenseMessage('❌ Licencja wygasła. Dostęp tylko do darmowych dodatków.', 'error');
                    } else if (result.used) {
                        showLicenseMessage('⚠️ Licencja została już użyta. Dostęp tylko do darmowych dodatków.', 'error');
                    } else {
                        showLicenseMessage('ℹ️ Brak aktywnej licencji. Dostęp tylko do darmowych dodatków.', 'info');
                    }
                }
            } else {
                console.error('❌ Błąd licencji:', result.error);
                serverConnected = false;
                loadAddonsBasedOnLicense([]);
                showLicenseMessage('⚠️ Problem z połączeniem. Używam zapisanych ustawień.', 'info');
            }
        } catch (error) {
            console.error('❌ Błąd:', error);
            loadAddonsBasedOnLicense([]);
        } finally {
            isCheckingLicense = false;
            updateLicenseDisplay();
        }
    }

    async function checkLicenseForAccount(accountId) {
        try {
            if (checkIfAdmin(accountId)) {
                return {
                    success: true,
                    hasLicense: true,
                    expired: false,
                    used: false,
                    expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    daysLeft: 365,
                    addons: ['all'],
                    type: 'premium',
                    accountId: accountId,
                    source: 'admin'
                };
            }

            return {
                success: true,
                hasLicense: false,
                expired: false,
                used: false,
                message: 'Brak aktywnej licencji',
                accountId: accountId,
                source: 'local'
            };

        } catch (error) {
            console.error('❌ Błąd podczas sprawdzania licencji:', error);
            return {
                success: false,
                error: error.message,
                hasLicense: false
            };
        }
    }

    function loadAddonsBasedOnLicense(allowedAddons = []) {
        const isPremiumAllowed = isLicenseVerified || isAdmin;
        
        currentAddons = ADDONS.map(addon => {
            const isFree = addon.type === 'free';
            const isPremium = addon.type === 'premium';
            
            return {
                ...addon,
                enabled: false,
                favorite: addon.favorite || false,
                hidden: isPremium && !isPremiumAllowed,
                locked: isPremium && !isPremiumAllowed
            };
        });
        
        restoreAddonsState();
        loadAddonShortcuts();
        loadShortcutsEnabledState();
        
        if (document.getElementById('addon-list')) {
            renderAddons();
        }
    }

    function updateAccountDisplay(accountId) {
        const accountEl = document.getElementById('swAccountId');
        if (accountEl) {
            accountEl.innerHTML = `${accountId} <span class="copy-icon" title="Kopiuj do schowka">📋</span>`;
            accountEl.className = 'license-status-value';
            
            const copyIcon = accountEl.querySelector('.copy-icon');
            if (copyIcon) {
                copyIcon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    navigator.clipboard.writeText(accountId).then(() => {
                        showLicenseMessage('✅ ID konta skopiowane do schowka', 'success');
                    }).catch(err => {
                        console.error('Błąd kopiowania: ', err);
                        showLicenseMessage('❌ Nie udało się skopiować ID', 'error');
                    });
                });
            }
        }
    }

    function updateLicenseDisplay() {
        const statusEl = document.getElementById('swLicenseStatus');
        const expiryEl = document.getElementById('swLicenseExpiry');
        const daysEl = document.getElementById('swLicenseDaysLeft');
        
        if (statusEl) {
            statusEl.textContent = isLicenseVerified ? 'Aktywna' : 'Nieaktywna';
            statusEl.className = isLicenseVerified ? 'license-status-valid' : 'license-status-invalid';
        }
        
        if (expiryEl) {
            expiryEl.textContent = licenseExpiry ? licenseExpiry.toLocaleDateString('pl-PL') : '-';
        }
        
        if (daysEl) {
            if (licenseData && licenseData.daysLeft !== undefined) {
                daysEl.textContent = `${licenseData.daysLeft} dni`;
                daysEl.className = licenseData.daysLeft < 7 ? 'license-status-warning' : 'license-status-valid';
            } else {
                daysEl.textContent = '-';
            }
        }
    }

    function showLicenseMessage(message, type = 'info') {
        const messageEl = document.getElementById('swLicenseMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `license-message license-${type}`;
            messageEl.style.display = 'block';
            setTimeout(() => messageEl.style.display = 'none', 5000);
        }
    }

    // =========================================================================
    // 🔹 INICJALIZACJA PANELU
    // =========================================================================

    async function initPanel() {
        console.log('✅ Initializing Synergy Panel v4.6.4...');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const toggleBtn = createToggleButton();
        createMainPanel();
        
        loadSavedState();
        
        if (toggleBtn) {
            setupToggleDrag(toggleBtn);
        }
        
        // 🔹 Ustaw normalne scrollowanie
        setTimeout(() => {
            setupNormalScrolling();
            improveAddonsScrolling();
        }, 300);
        
        setTimeout(async () => {
            await initAccountAndLicense();
            
            renderAddons();
            renderShortcuts();
            
            setTimeout(() => {
                forceScrollVisibility();
                updateFontSizeButtons(currentFontSize);
                improveAddonsScrolling();
            }, 500);
            
            // Obsługa zmiany rozmiaru okna
            window.addEventListener('resize', function() {
                setTimeout(() => {
                    improveAddonsScrolling();
                    forceScrollVisibility();
                }, 100);
            });
            
            setInterval(() => {
                if (userAccountId) checkAndUpdateLicense(userAccountId);
            }, 5 * 60 * 1000);
        }, 1000);
    }

    // 🔹 Start panelu
    console.log('🎯 Starting Synergy Panel v4.6.4...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }

})();