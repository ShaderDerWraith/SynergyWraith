// ==UserScript==
// @name         Synergy Panel v4.6 - Final Edition (Fixed Button Position)
// @namespace    http://tampermonkey.net/
// @version      4.6.8
// @description  Zaawansowany panel dodatków do gry z systemem licencji - POPRAWIONA WERSJA
// @author       ShaderDerWraith
// @match        *://*/*
// @icon         https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/public/icon.jpg
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v4.6.8 (Final Fixed Version)');

    // 🔹 Dodanie CSS
    const panelCSS = `
        /* 🔹 BASE STYLES - KOMPAKTOWA WERSJA 🔹 */
        #swPanelToggle {
            position: fixed;
            top: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            background: url('https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/public/icon.jpg') center/cover no-repeat;
            border: 2px solid #ff3300;
            border-radius: 50%;
            cursor: grab;
            z-index: 1000000;
            box-shadow: 0 0 15px rgba(255, 51, 0, 0.9);
            color: white;
            font-weight: bold;
            font-size: 20px;
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
            box-shadow: 0 0 25px rgba(255, 102, 0, 1);
            border: 2px solid #ffcc00;
            z-index: 1000001;
        }

        #swPanelToggle:hover:not(.dragging) {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(255, 102, 0, 1);
            cursor: grab;
        }

        #swPanelToggle.saved {
            animation: savePulse 1.5s ease-in-out;
        }

        @keyframes savePulse {
            0% { 
                box-shadow: 0 0 15px rgba(255, 51, 0, 0.9);
                border-color: #ff3300;
            }
            50% { 
                box-shadow: 0 0 30px rgba(255, 153, 0, 1);
                border-color: #ffcc00;
                transform: scale(1.05);
            }
            100% { 
                box-shadow: 0 0 15px rgba(255, 51, 0, 0.9);
                border-color: #ff3300;
            }
        }

        /* 🔹 MAIN PANEL - KOMPAKTOWY 🔹 */
        #swAddonsPanel {
            position: fixed;
            top: 70px;
            left: 20px;
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, 
                rgba(20, 0, 0, 0.98), 
                rgba(40, 0, 0, 0.98), 
                rgba(80, 0, 0, 0.98));
            border: 2px solid #ff3300;
            border-radius: 10px;
            color: #ffffff;
            z-index: 999999;
            box-shadow: 
                0 0 25px rgba(255, 51, 0, 0.8),
                inset 0 0 40px rgba(255, 51, 0, 0.1);
            backdrop-filter: blur(10px);
            display: none;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            min-width: 450px;
            min-height: 400px;
            max-width: 800px;
            max-height: 700px;
            resize: both;
            font-size: 12px;
            cursor: default;
        }

        /* Stylizacja uchwytu zmiany rozmiaru */
        #swAddonsPanel::-webkit-resizer {
            background-color: #ff3300;
            border-radius: 3px;
            border: 1px solid #ffcc00;
            box-shadow: 0 0 8px rgba(255, 51, 0, 0.8);
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23ffcc00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>');
            background-repeat: no-repeat;
            background-position: center;
            background-size: 10px;
        }

        #swAddonsPanel.dragging {
            cursor: grabbing;
        }

        /* 🔹 NAGŁÓWEK - KOMPAKTOWY 🔹 */
        #swPanelHeader {
            background: linear-gradient(to right, 
                rgba(40, 0, 0, 0.95), 
                rgba(80, 0, 0, 0.95), 
                rgba(120, 0, 0, 0.95));
            padding: 12px;
            text-align: center;
            border-bottom: 2px solid #ff3300;
            cursor: move;
            font-size: 22px;
            font-weight: bold;
            color: #ffcc00;
            text-shadow: 
                0 0 10px rgba(255, 51, 0, 0.8),
                0 0 20px rgba(255, 51, 0, 0.6);
            user-select: none;
            position: relative;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* 🔹 OBSZAR DO CHWYTANIA 🔹 */
        #swAddonsPanel::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 75px;
            cursor: move;
            z-index: 1000;
        }

        /* 🔹 TABS - KOMPAKTOWE 🔹 */
        .tab-container {
            display: flex;
            background: linear-gradient(to bottom, 
                rgba(40, 0, 0, 0.95), 
                rgba(30, 0, 0, 0.95));
            border-bottom: 1px solid #ff3300;
            padding: 0 4px;
            justify-content: center;
            height: 40px;
        }

        .tablink {
            background: none;
            border: none;
            outline: none;
            cursor: pointer;
            padding: 10px 16px;
            margin: 0 2px;
            transition: all 0.3s ease;
            color: #ff9966;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            border-bottom: 2px solid transparent;
            position: relative;
            min-width: 80px;
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
            text-shadow: 0 0 6px rgba(255, 102, 0, 0.8); 
        }

        .tablink.active::after { 
            width: 100%; 
            background: linear-gradient(to right, #ff3300, #ffcc00, #ff3300);
            box-shadow: 0 0 8px rgba(255, 102, 0, 0.8);
        }

        .tablink:hover:not(.active) { 
            color: #ff6600; 
        }

        /* 🔹 TAB CONTENT 🔹 */
        .tabcontent {
            display: none;
            flex: 1;
            overflow: hidden;
            flex-direction: column;
            position: relative;
            height: calc(100% - 90px);
        }

        .tabcontent.active {
            display: flex;
        }

        .sw-tab-content {
            padding: 12px;
            background: rgba(20, 0, 0, 0.7);
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: hidden;
            position: relative;
            flex: 1;
            min-height: 0;
        }

        /* 🔹 DODATKI - KOMPAKTOWE 🔹 */
        .addon-list-container {
            width: 100%;
            max-width: 600px;
            flex: 1;
            overflow-y: auto !important;
            overflow-x: hidden;
            margin-bottom: 8px;
            padding-right: 8px;
            padding-bottom: 15px;
            scrollbar-width: thin;
            scrollbar-color: #ff3300 rgba(40, 0, 0, 0.5);
            height: auto;
            min-height: 180px;
            max-height: calc(100% - 150px);
            scroll-behavior: smooth;
        }

        .addon-list-container::-webkit-scrollbar {
            width: 10px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        .addon-list-container::-webkit-scrollbar-track {
            background: rgba(40, 0, 0, 0.5) !important;
            border-radius: 6px !important;
            border: 1px solid #550000 !important;
        }

        .addon-list-container::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #ff3300, #ff6600) !important;
            border-radius: 6px !important;
            border: 1px solid #ff9900 !important;
        }

        .addon-list {
            width: 100%;
        }

        .addon {
            background: linear-gradient(135deg, 
                rgba(40, 0, 0, 0.9), 
                rgba(80, 0, 0, 0.9));
            border: 1px solid #550000;
            border-radius: 6px;
            padding: 12px 14px;
            margin-bottom: 8px;
            transition: all 0.3s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 55px;
            box-sizing: border-box;
            width: 100%;
        }

        .addon:hover {
            transform: translateY(-2px);
            border-color: #ff3300;
            box-shadow: 0 4px 12px rgba(255, 51, 0, 0.4);
            background: linear-gradient(135deg, 
                rgba(80, 0, 0, 0.95), 
                rgba(120, 0, 0, 0.95));
        }

        .addon-header {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;
            margin-right: 15px;
        }

        .addon-title {
            font-weight: 700;
            color: #ffcc00;
            font-size: 13px;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .addon-description {
            color: #ff9966;
            font-size: 11px;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .addon-controls {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
        }

        /* 🔹 PRZYCISK ULUBIONYCH 🔹 */
        .favorite-btn {
            background: transparent;
            border: none;
            font-size: 16px;
            color: #666666;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            transition: all 0.3s ease;
            width: 22px;
            height: 22px;
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
            text-shadow: 0 0 10px rgba(255, 204, 0, 0.8);
        }

        /* 🔹 ADDON SWITCH 🔹 */
        .addon-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
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
            background-color: #2a0000;
            border: 1px solid #550000;
            transition: .4s;
            border-radius: 30px;
        }

        .addon-switch-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 2px;
            background-color: #ff3300;
            transition: .4s;
            border-radius: 50%;
        }

        .addon-switch input:checked + .addon-switch-slider {
            background-color: #005500;
            border-color: #00bb00;
        }

        .addon-switch input:checked + .addon-switch-slider:before {
            transform: translateX(19px);
            background-color: #00ff00;
        }

        .addon-switch input:disabled + .addon-switch-slider {
            background-color: #2a2a2a;
            border-color: #555555;
            cursor: not-allowed;
        }

        .addon-switch input:disabled + .addon-switch-slider:before {
            background-color: #555555;
        }

        /* 🔹 FILTRY DODATKÓW 🔹 */
        .addon-filters {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            width: 100%;
            max-width: 600px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .filter-btn {
            padding: 8px 15px;
            background: linear-gradient(135deg, #2a0000, #550000);
            border: 1px solid #550000;
            border-radius: 5px;
            color: #ff9966;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            white-space: nowrap;
            min-width: 100px;
        }

        .filter-btn:hover {
            background: linear-gradient(135deg, #550000, #880000);
            color: #ffcc00;
            transform: translateY(-2px);
        }

        .filter-btn.active {
            background: linear-gradient(135deg, #880000, #bb0000);
            border-color: #ff3300;
            color: #ffffff;
            box-shadow: 0 3px 10px rgba(255, 51, 0, 0.5);
            transform: translateY(-2px);
        }

        /* 🔹 PRZYCISK ZAPISZ 🔹 */
        #swSaveAndRestartButton {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #005500, #007700);
            border: 1px solid #00bb00;
            border-radius: 6px;
            color: #ffffff;
            cursor: pointer;
            font-weight: 700;
            font-size: 12px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-top: 15px;
            margin-bottom: 8px;
            display: block;
            box-sizing: border-box;
            text-align: center;
            position: relative;
            z-index: 10;
            min-height: 45px;
        }

        #swSaveAndRestartButton:hover {
            background: linear-gradient(135deg, #007700, #009900);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 255, 0, 0.4);
        }

        .save-button-container {
            width: 100%;
            max-width: 600px;
            margin: 15px auto 8px auto;
            padding-top: 12px;
            border-top: 1px solid #550000;
            text-align: center;
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 100;
            background: rgba(20, 0, 0, 0.7);
        }

        /* 🔹 SHORTCUTS LIST 🔹 */
        .shortcuts-list-container {
            width: 100%;
            max-width: 600px;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            margin-bottom: 8px;
            padding-right: 8px;
            padding-bottom: 15px;
            scrollbar-width: thin;
            scrollbar-color: #ff3300 rgba(40, 0, 0, 0.5);
            min-height: 300px;
            height: calc(100% - 50px);
            scroll-behavior: smooth;
        }

        .shortcut-item {
            background: linear-gradient(135deg, 
                rgba(40, 0, 0, 0.9), 
                rgba(80, 0, 0, 0.9));
            border: 1px solid #550000;
            border-radius: 6px;
            padding: 12px 14px;
            margin-bottom: 8px;
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
                rgba(80, 0, 0, 0.95), 
                rgba(120, 0, 0, 0.95));
        }

        .shortcut-info {
            flex: 1;
            min-width: 200px;
            margin-right: 15px;
            margin-bottom: 10px;
        }

        .shortcut-name {
            font-weight: 700;
            color: #ffcc00;
            font-size: 13px;
            margin-bottom: 4px;
        }

        .shortcut-desc {
            color: #ff9966;
            font-size: 11px;
        }

        .shortcut-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
            flex-wrap: wrap;
        }

        .shortcut-display {
            padding: 6px 10px;
            background: rgba(25, 0, 0, 0.8);
            border: 1px solid #550000;
            border-radius: 4px;
            color: #ffcc00;
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 0.4px;
            min-width: 90px;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* 🔹 PRZYCISKI SKRÓTÓW 🔹 */
        .shortcut-set-btn, .shortcut-clear-btn {
            padding: 6px 12px;
            background: linear-gradient(135deg, #550000, #880000);
            border: 1px solid #ff3300;
            border-radius: 4px;
            color: #ffcc00;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            white-space: nowrap;
            min-width: 65px;
        }

        .shortcut-set-btn:hover, .shortcut-clear-btn:hover {
            background: linear-gradient(135deg, #880000, #bb0000);
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 51, 0, 0.3);
        }

        .shortcut-clear-btn {
            min-width: 75px;
        }

        /* 🔹 SKRÓTY TOGGLE 🔹 */
        .shortcut-toggle {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
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
            background-color: #2a0000;
            border: 1px solid #550000;
            transition: .4s;
            border-radius: 30px;
        }

        .shortcut-toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 2px;
            background-color: #ff3300;
            transition: .4s;
            border-radius: 50%;
            transform: translateX(3px);
        }

        .shortcut-toggle input:checked + .shortcut-toggle-slider {
            background-color: #005500;
            border-color: #00bb00;
        }

        .shortcut-toggle input:checked + .shortcut-toggle-slider:before {
            transform: translateX(19px);
            background-color: #00ff00;
        }

        .shortcut-toggle input:not(:checked) + .shortcut-toggle-slider {
            background-color: #2a0000;
            border-color: #550000;
        }

        .shortcut-toggle input:not(:checked) + .shortcut-toggle-slider:before {
            background-color: #ff3300;
        }

        /* 🔹 LICENCJA 🔹 */
        .license-scroll-container {
            width: 100%;
            max-width: 600px;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            margin-bottom: 8px;
            padding-right: 8px;
            padding-bottom: 15px;
            scrollbar-width: thin;
            scrollbar-color: #ff3300 rgba(40, 0, 0, 0.5);
            height: auto;
            min-height: 280px;
            scroll-behavior: smooth;
        }

        .license-container {
            background: linear-gradient(135deg, 
                rgba(40, 0, 0, 0.9), 
                rgba(80, 0, 0, 0.9));
            border: 1px solid #550000;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 12px;
            width: 100%;
            max-width: 600px;
            box-sizing: border-box;
            word-wrap: break-word;
        }

        .license-header {
            color: #ffcc00;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
            border-bottom: 2px solid #ff3300;
            padding-bottom: 8px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .license-status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            font-size: 12px;
            padding: 6px 0;
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
            font-size: 12px;
            min-width: 110px;
        }

        .license-status-value {
            font-weight: 600;
            text-align: right;
            color: #ffcc00;
            max-width: 180px;
            word-break: break-word;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 6px;
            flex: 1;
            margin-left: 15px;
        }

        .copy-icon {
            cursor: pointer;
            color: #ffcc00;
            font-size: 13px;
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
            text-shadow: 0 0 6px rgba(0, 255, 0, 0.6);
        }
        .license-status-invalid { 
            color: #ff3300 !important; 
            text-shadow: 0 0 6px rgba(255, 51, 0, 0.6);
        }
        .license-status-connected { 
            color: #00ff00 !important; 
        }
        .license-status-disconnected { 
            color: #ff3300 !important; 
        }
        .license-status-warning { 
            color: #ffcc00 !important; 
            text-shadow: 0 0 6px rgba(255, 204, 0, 0.6);
        }

        /* 🔹 SETTINGS 🔹 */
        .settings-item {
            margin-bottom: 15px;
            padding: 15px;
            background: linear-gradient(135deg, 
                rgba(40, 0, 0, 0.9), 
                rgba(80, 0, 0, 0.9));
            border: 1px solid #550000;
            border-radius: 8px;
            width: 100%;
            max-width: 600px;
            box-sizing: border-box;
        }

        .settings-label {
            display: block;
            color: #ffcc00;
            font-size: 13px;
            margin-bottom: 10px;
            font-weight: 700;
            text-align: center;
        }

        .font-size-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 10px;
        }

        .font-size-btn {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #550000, #880000);
            border: 1px solid #ff3300;
            border-radius: 5px;
            color: #ffcc00;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            user-select: none;
            padding: 0;
        }

        .font-size-btn:hover {
            background: linear-gradient(135deg, #880000, #bb0000);
            border-color: #ff6600;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 51, 0, 0.4);
        }

        .font-size-btn:active {
            transform: translateY(0);
        }

        .font-size-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: linear-gradient(135deg, #2a0000, #550000);
            border-color: #550000;
        }

        .font-size-btn:disabled:hover {
            transform: none;
            box-shadow: none;
        }

        .font-size-display {
            min-width: 65px;
            padding: 8px;
            background: rgba(40, 0, 0, 0.8);
            border: 1px solid #550000;
            border-radius: 5px;
            color: #ffcc00;
            font-size: 14px;
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
            gap: 12px;
            margin-bottom: 10px;
        }

        .slider-value {
            min-width: 45px;
            text-align: center;
            color: #ffcc00;
            font-weight: bold;
            font-size: 12px;
        }

        .opacity-slider {
            flex: 1;
            -webkit-appearance: none;
            height: 6px;
            background: linear-gradient(to right, #2a0000, #550000);
            border-radius: 4px;
            border: 1px solid #550000;
            outline: none;
        }

        .opacity-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #ff3300;
            cursor: pointer;
            border: 2px solid #ffcc00;
            box-shadow: 0 0 8px rgba(255, 51, 0, 0.8);
        }

        .opacity-slider::-webkit-slider-thumb:hover {
            background: #ff6600;
            transform: scale(1.1);
        }

        /* 🔹 PRZYCISK USTAW SKRÓT 🔹 */
        #panelShortcutSetBtn {
            padding: 8px 15px;
            background: linear-gradient(135deg, #550000, #880000);
            border: 1px solid #ff3300;
            border-radius: 5px;
            color: #ffffff;
            cursor: pointer;
            font-size: 11px;
            font-weight: 700;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            white-space: nowrap;
            min-width: 70px;
        }

        #panelShortcutSetBtn:hover {
            background: linear-gradient(135deg, #880000, #bb0000);
            border-color: #ff6600;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 51, 0, 0.4);
        }

        /* 🔹 EKSPORT/IMPORT 🔹 */
        .import-export-container {
            width: 100%;
            max-width: 600px;
            margin-top: 15px;
            padding: 15px;
            background: linear-gradient(135deg, 
                rgba(40, 0, 0, 0.9), 
                rgba(80, 0, 0, 0.9));
            border: 1px solid #550000;
            border-radius: 8px;
            box-sizing: border-box;
        }

        .import-export-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 12px;
        }

        .import-export-btn {
            flex: 1;
            padding: 10px;
            background: linear-gradient(135deg, #550000, #880000);
            border: 1px solid #ff3300;
            border-radius: 5px;
            color: #ffffff;
            cursor: pointer;
            font-weight: 700;
            font-size: 11px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .import-export-btn:hover {
            background: linear-gradient(135deg, #880000, #bb0000);
            border-color: #ff6600;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 51, 0, 0.3);
        }

        .import-export-textarea {
            width: 100%;
            height: 100px;
            padding: 10px;
            background: rgba(20, 0, 0, 0.8);
            border: 1px solid #550000;
            border-radius: 5px;
            color: #ffcc00;
            font-size: 10px;
            font-family: 'Courier New', monospace;
            resize: none;
            box-sizing: border-box;
            outline: none;
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.3;
        }

        .import-export-textarea:focus {
            border-color: #ff3300;
            box-shadow: 0 0 12px rgba(255, 51, 0, 0.5);
        }

        /* 🔹 INFO 🔹 */
        #info .sw-tab-content {
            overflow: hidden !important;
            position: relative !important;
            height: 100% !important;
        }

        .info-section {
            background: linear-gradient(135deg, 
                rgba(40, 0, 0, 0.9), 
                rgba(80, 0, 0, 0.9));
            border: 1px solid #550000;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            width: 100%;
            max-width: 600px;
            box-sizing: border-box;
            text-align: left;
            min-width: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .info-section h4 {
            color: #ff9966;
            margin-top: 0;
            font-size: 14px;
            margin-bottom: 12px;
            border-bottom: 2px solid #550000;
            padding-bottom: 8px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .info-section p {
            color: #ffcc00;
            font-size: 12px;
            line-height: 1.5;
            margin: 8px 0;
            padding-left: 8px;
            position: relative;
        }

        .info-section p::before {
            content: "•";
            color: #ff6600;
            font-size: 14px;
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

        /* 🔹 SCROLLBAR 🔹 */
        .scrollable-container {
            width: 100% !important;
            max-width: 600px !important;
            flex: 1 !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            margin-bottom: 8px !important;
            padding-right: 8px !important;
            scroll-behavior: smooth !important;
            scrollbar-width: thin !important;
            scrollbar-color: #ff3300 rgba(40, 0, 0, 0.5) !important;
            height: calc(100% - 50px) !important;
            min-height: 250px !important;
            position: relative !important;
        }

        #info .scrollable-container {
            height: calc(100% - 25px) !important;
            max-height: none !important;
        }

        .scrollable-container::-webkit-scrollbar,
        .addon-list-container::-webkit-scrollbar,
        .shortcuts-list-container::-webkit-scrollbar,
        .license-scroll-container::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }

        .scrollable-container::-webkit-scrollbar-track,
        .addon-list-container::-webkit-scrollbar-track,
        .shortcuts-list-container::-webkit-scrollbar-track,
        .license-scroll-container::-webkit-scrollbar-track {
            background: rgba(40, 0, 0, 0.5);
            border-radius: 6px;
            border: 1px solid #550000;
        }

        .scrollable-container::-webkit-scrollbar-thumb,
        .addon-list-container::-webkit-scrollbar-thumb,
        .shortcuts-list-container::-webkit-scrollbar-thumb,
        .license-scroll-container::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #ff3300, #ff6600);
            border-radius: 6px;
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
            padding: 10px 12px;
            border-radius: 6px;
            margin: 8px 0;
            font-size: 11px;
            display: none;
            width: 100%;
            max-width: 600px;
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
            padding: 12px;
            background: linear-gradient(135deg, 
                rgba(80, 0, 0, 0.9), 
                rgba(120, 0, 0, 0.9));
            border: 1px solid #ff3300;
            border-radius: 6px;
            color: #ffffff;
            cursor: pointer;
            font-weight: 700;
            font-size: 12px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            width: 100%;
            max-width: 600px;
            margin: 15px auto 8px auto;
            display: block;
            box-sizing: border-box;
        }

        #swResetButton:hover {
            background: linear-gradient(135deg, 
                rgba(120, 0, 0, 0.9), 
                rgba(160, 0, 0, 0.9));
            border-color: #ff6600;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 51, 0, 0.4);
        }

        /* 🔹 SEARCH INPUT 🔹 */
        #searchAddons {
            width: 100%;
            max-width: 600px;
            padding: 10px 14px;
            background: rgba(40, 0, 0, 0.8);
            border: 1px solid #550000;
            border-radius: 6px;
            color: #ffcc00;
            font-size: 12px;
            box-sizing: border-box;
            outline: none;
            transition: all 0.3s ease;
            margin-bottom: 12px;
        }

        #searchAddons:focus {
            border-color: #ff3300;
            box-shadow: 0 0 12px rgba(255, 51, 0, 0.5);
            background: rgba(80, 0, 0, 0.9);
        }

        #searchAddons::placeholder {
            color: #ff9966;
            opacity: 0.8;
        }

        /* 🔹 PREMIUM BADGE 🔹 */
        .premium-badge {
            display: inline-block;
            background: linear-gradient(45deg, #ff9900, #ffcc00);
            color: #2a0000;
            font-size: 9px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 3px;
            margin-right: 6px;
            text-shadow: none;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        /* 🔹 RESPONSYWNOŚĆ 🔹 */
        @media (max-width: 768px) {
            #swAddonsPanel {
                width: 95vw !important;
                min-width: 350px;
                max-width: 95vw;
            }
            
            .info-section {
                padding: 12px;
                margin-left: 3px;
                margin-right: 3px;
                width: calc(100% - 6px);
            }
            
            .info-section h4 {
                font-size: 13px;
                padding: 6px;
            }
            
            .info-section p {
                font-size: 11px;
                line-height: 1.4;
            }
        }

        @media (max-height: 600px) {
            .addon-list-container {
                max-height: 200px !important;
            }
        }

        /* 🔹 ANIMACJE 🔹 */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
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
        #swSaveAndRestartButton:focus {
            outline: 2px solid #ffcc00;
            outline-offset: 2px;
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
        SHORTCUTS_ENABLED: "sw_shortcuts_enabled",
        PANEL_WIDTH: "sw_panel_width",
        PANEL_HEIGHT: "sw_panel_height"
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
    let panelResizeTimer = null;

    // =========================================================================
    // 🔹 GŁÓWNE FUNKCJE PANELU
    // =========================================================================

    // 🔹 POPRAWIONE: Funkcja applyFontSize
    function applyFontSize(size, skipSave = false) {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        const minSize = 8;
        const maxSize = 16;
        
        const clampedSize = Math.max(minSize, Math.min(maxSize, size));
        currentFontSize = clampedSize;
        
        if (!skipSave) {
            SW.GM_setValue(CONFIG.FONT_SIZE, clampedSize);
        }
        
        const allTextElements = panel.querySelectorAll('*');
        allTextElements.forEach(el => {
            if (el.tagName !== 'INPUT' && el.tagName !== 'BUTTON' && el.tagName !== 'TEXTAREA') {
                const currentStyle = window.getComputedStyle(el);
                const originalSize = parseInt(currentStyle.fontSize);
                
                if (originalSize === 13 || 
                    originalSize === 12 || 
                    originalSize === 14 ||
                    el.classList.contains('addon-title') ||
                    el.classList.contains('addon-description') ||
                    el.classList.contains('shortcut-name') ||
                    el.classList.contains('shortcut-desc') ||
                    el.classList.contains('settings-label') ||
                    el.classList.contains('license-status-label') ||
                    el.classList.contains('license-status-value') ||
                    el.classList.contains('tablink') ||
                    el.classList.contains('panel-subtitle') ||
                    el.tagName === 'SPAN' ||
                    el.tagName === 'P' ||
                    el.tagName === 'DIV' ||
                    el.tagName === 'LABEL' ||
                    el.tagName === 'H3' ||
                    el.tagName === 'H4') {
                    
                    const scaleFactor = clampedSize / 13;
                    const newSize = Math.round(originalSize * scaleFactor);
                    el.style.fontSize = newSize + 'px';
                }
            }
        });
        
        const specialElements = panel.querySelectorAll('input, button, textarea, .font-size-display, .slider-value, .shortcut-display');
        specialElements.forEach(el => {
            if (el.classList.contains('font-size-display') || el.classList.contains('slider-value')) {
                el.style.fontSize = '15px';
            } else if (el.classList.contains('shortcut-display')) {
                el.style.fontSize = clampedSize - 1 + 'px';
            } else {
                el.style.fontSize = clampedSize + 'px';
            }
        });
        
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeValue) {
            fontSizeValue.textContent = clampedSize + 'px';
            
            if (clampedSize === minSize || clampedSize === maxSize) {
                fontSizeValue.classList.add('warning');
                setTimeout(() => fontSizeValue.classList.remove('warning'), 1000);
            } else {
                fontSizeValue.classList.remove('warning');
            }
        }
        
        updateFontSizeButtons(clampedSize);
    }

    // 🔹 Funkcja aktualizacji przycisków czcionki
    function updateFontSizeButtons(currentSize) {
        const minSize = 8;
        const maxSize = 16;
        
        const decreaseBtn = document.getElementById('fontSizeDecrease');
        const increaseBtn = document.getElementById('fontSizeIncrease');
        
        if (decreaseBtn) {
            decreaseBtn.disabled = currentSize <= minSize;
            decreaseBtn.title = currentSize <= minSize ? 'Minimalny rozmiar (8px)' : 'Zmniejsz czcionkę';
        }
        
        if (increaseBtn) {
            increaseBtn.disabled = currentSize >= maxSize;
            increaseBtn.title = currentSize >= maxSize ? 'Maksymalny rozmiar (16px)' : 'Zwiększ czcionkę';
        }
    }

    // 🔹 Funkcja applyOpacity
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

    // 🔹 Funkcja zapisywania rozmiaru panelu
    function savePanelSize() {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const width = panel.offsetWidth;
            const height = panel.offsetHeight;
            
            const savedWidth = Math.max(450, Math.min(width, 800));
            const savedHeight = Math.max(400, Math.min(height, 700));
            
            SW.GM_setValue(CONFIG.PANEL_WIDTH, savedWidth);
            SW.GM_setValue(CONFIG.PANEL_HEIGHT, savedHeight);
            
            localStorage.setItem(CONFIG.PANEL_WIDTH, JSON.stringify(savedWidth));
            localStorage.setItem(CONFIG.PANEL_HEIGHT, JSON.stringify(savedHeight));
        }
    }

    // 🔹 Funkcja ładowania rozmiaru panelu
    function loadPanelSize() {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const savedWidth = SW.GM_getValue(CONFIG.PANEL_WIDTH, 500);
            const savedHeight = SW.GM_getValue(CONFIG.PANEL_HEIGHT, 500);
            
            const width = Math.max(450, Math.min(savedWidth, 800));
            const height = Math.max(400, Math.min(savedHeight, 700));
            
            panel.style.width = width + 'px';
            panel.style.height = height + 'px';
            
            setTimeout(() => {
                SW.GM_setValue(CONFIG.PANEL_WIDTH, width);
                SW.GM_setValue(CONFIG.PANEL_HEIGHT, height);
            }, 100);
        }
    }

    // 🔹 Funkcja do obsługi zmiany rozmiaru panelu
    function handlePanelResize() {
        clearTimeout(panelResizeTimer);
        panelResizeTimer = setTimeout(() => {
            savePanelSize();
        }, 300);
    }

    // 🔹 Tworzenie przycisku przełączania
    function createToggleButton() {
        const oldToggle = document.getElementById('swPanelToggle');
        if (oldToggle) oldToggle.remove();
        
        const toggleBtn = document.createElement("div");
        toggleBtn.id = "swPanelToggle";
        toggleBtn.title = "Kliknij - otwórz/ukryj panel | Przeciągnij - zmień pozycję";
        toggleBtn.innerHTML = '';
        
        document.body.appendChild(toggleBtn);
        
        return toggleBtn;
    }

    // 🔹 Tworzenie głównego panelu
    function createMainPanel() {
        const oldPanel = document.getElementById('swAddonsPanel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement("div");
        panel.id = "swAddonsPanel";
        
        panel.innerHTML = generatePanelHTML();
        
        document.body.appendChild(panel);
        
        initializeEventListeners();
        loadSettings();
        loadPanelSize();
        setupPanelDrag();
        setupSmoothScroll();
        
        return panel;
    }

    // 🔹 NOWA: Funkcja płynnego scrollowania - POPRAWIONA
    function setupSmoothScroll() {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        
        // Zmienne do obsługi scrollowania myszą
        let isMouseDown = false;
        let startY;
        let scrollTop;
        
        // Lista kontenerów do scrollowania
        const scrollContainers = [
            '.addon-list-container',
            '.shortcuts-list-container', 
            '.license-scroll-container',
            '.scrollable-container'
        ];
        
        scrollContainers.forEach(selector => {
            const containers = panel.querySelectorAll(selector);
            containers.forEach(container => {
                // Obsługa przeciągania myszą do scrollowania
                container.addEventListener('mousedown', function(e) {
                    if (e.button !== 0) return; // Tylko lewy przycisk myszy
                    
                    isMouseDown = true;
                    startY = e.pageY - container.offsetTop;
                    scrollTop = container.scrollTop;
                    container.style.cursor = 'grabbing';
                    container.style.userSelect = 'none';
                    
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                // Obsługa ruchu myszą podczas scrollowania
                container.addEventListener('mousemove', function(e) {
                    if (!isMouseDown) return;
                    
                    const y = e.pageY - container.offsetTop;
                    const walk = (y - startY) * 2; // Mnożnik dla lepszej kontroli
                    container.scrollTop = scrollTop - walk;
                    
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                // Zakończenie scrollowania
                container.addEventListener('mouseup', function() {
                    isMouseDown = false;
                    container.style.cursor = '';
                    container.style.userSelect = '';
                });
                
                container.addEventListener('mouseleave', function() {
                    isMouseDown = false;
                    container.style.cursor = '';
                    container.style.userSelect = '';
                });
                
                // Płynne scrollowanie kółkiem myszy
                container.addEventListener('wheel', function(e) {
                    // Zapobiegaj domyślnemu zachowaniu tylko jeśli kontener ma scroll
                    if (this.scrollHeight > this.clientHeight) {
                        // PŁYNNY SCROLL - użyj requestAnimationFrame dla płynności
                        e.preventDefault();
                        const target = this;
                        const delta = e.deltaY;
                        
                        function smoothScroll() {
                            const step = delta * 0.3;
                            target.scrollTop += step;
                            
                            // Kontynuuj animację jeśli nadal scrollujemy
                            if (Math.abs(step) > 0.5 && target === document.activeElement) {
                                requestAnimationFrame(smoothScroll);
                            }
                        }
                        
                        requestAnimationFrame(smoothScroll);
                    }
                }, { passive: false });
            });
        });
        
        // Obsługa zakończenia scrollowania na całym panelu
        panel.addEventListener('mouseup', function() {
            isMouseDown = false;
            const containers = panel.querySelectorAll(scrollContainers.join(','));
            containers.forEach(container => {
                container.style.cursor = '';
                container.style.userSelect = '';
            });
        });
        
        // Dodaj styl dla wskazania scrollowania
        const scrollStyle = document.createElement('style');
        scrollStyle.textContent = `
            .addon-list-container.grabbing,
            .shortcuts-list-container.grabbing,
            .license-scroll-container.grabbing,
            .scrollable-container.grabbing {
                cursor: grabbing !important;
                user-select: none !important;
            }
            
            .addon-list-container.grabbing *,
            .shortcuts-list-container.grabbing *,
            .license-scroll-container.grabbing *,
            .scrollable-container.grabbing * {
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(scrollStyle);
    }

    // 🔹 Generowanie HTML panelu
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
                    <div style="width:100%; max-width:600px; margin:0 auto 12px auto;">
                        <input type="text" id="searchAddons" placeholder="🔍 Wyszukaj dodatki..." 
                               style="width:100%; padding:10px 14px; background:rgba(40,0,0,0.8); 
                                      border:1px solid #550000; border-radius:6px; color:#ffcc00; 
                                      font-size:12px; box-sizing:border-box;">
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
                    
                    <!-- PRZYCISK ZAPISZ I ODSWIEŻ -->
                    <div class="save-button-container">
                        <button id="swSaveAndRestartButton">💾 Zapisz i odśwież grę</button>
                    </div>
                    
                    <div id="swAddonsMessage" class="license-message" style="display: none;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA SKRÓTY -->
            <div id="shortcuts" class="tabcontent">
                <div class="sw-tab-content">
                    <div style="margin-bottom:12px; padding:12px; background:linear-gradient(135deg, rgba(40,0,0,0.9), rgba(80,0,0,0.9)); border-radius:6px; border:1px solid #550000; width:100%; max-width:600px;">
                        <h3 style="color:#ffcc00; margin-top:0; margin-bottom:5px; font-size:13px; text-align:center;">Skróty klawiszowe</h3>
                        <p style="color:#ff9966; font-size:11px; margin:0; text-align:center;">
                            Skróty pokazują się tylko dla włączonych dodatków
                        </p>
                    </div>
                    
                    <div class="shortcuts-list-container">
                        <div id="shortcuts-list" style="width:100%;"></div>
                    </div>
                    
                    <div style="height:15px;"></div>
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
                            <div style="padding:12px; color:#ffcc00; font-size:11px; text-align:center;">
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
                            <small style="color:#ff9966; font-size:10px; display:block; text-align:center;">Kliknij +/- aby zmienić (8-16px)</small>
                        </div>
                        
                        <div class="settings-item">
                            <div class="settings-label">Przeźroczystość panelu:</div>
                            <div class="slider-container">
                                <input type="range" min="30" max="100" value="90" class="opacity-slider" id="opacitySlider" step="1">
                                <span class="slider-value" id="opacityValue">90%</span>
                            </div>
                            <small style="color:#ff9966; font-size:10px; display:block; text-align:center;">30-100%</small>
                        </div>
                        
                        <div class="settings-item">
                            <div class="settings-label">Skrót do panelu:</div>
                            <div style="display:flex; gap:8px; align-items:center; margin-bottom:5px;">
                                <input type="text" id="panelShortcutInput" 
                                       style="flex:1; padding:8px; background:rgba(40,0,0,0.8); border:1px solid #550000; 
                                              border-radius:4px; color:#ffcc00; font-size:12px; text-align:center;" 
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
                        
                        <!-- PRZYCISK RESETU -->
                        <div style="margin:15px auto 0 auto; padding-top:12px; border-top:1px solid #550000; width:100%; max-width:600px; text-align:center; min-height:50px; display:flex; align-items:center; justify-content:center;">
                            <button id="swResetButton">🔄 Resetuj ustawienia</button>
                        </div>
                    </div>
                    
                    <div id="swResetMessage" style="margin-top:12px; padding:10px; border-radius:5px; display:none; font-size:11px; width:100%; max-width:600px; text-align:center;"></div>
                </div>
            </div>

            <!-- ZAKŁADKA INFO -->
            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="scrollable-container">
                        <div style="text-align:center; padding:15px; width:100%; max-width:600px; margin:0 auto;">
                            <h3 style="color:#ffcc00; margin-bottom:15px; font-size:18px;">Synergy Panel</h3>
                            
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
                            
                            <div class="info-section">
                                <h4>Nowe Funkcje</h4>
                                <p>• Eksport/Import ustawień</p>
                                <p>• Filtry dodatków</p>
                                <p>• Skróty domyślnie wyłączone</p>
                                <p>• Płynne przesuwanie panelu</p>
                            </div>
                            
                            <div style="color:#ff9966; font-size:10px; margin-top:20px; padding:12px; 
                                        background:rgba(40,0,0,0.5); border-radius:5px;">
                                <p style="margin:5px 0;">© 2024 Synergy Panel</p>
                                <p style="margin:5px 0;">System licencji GitHub RAW</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 🔹 Inicjalizacja event listenerów
    function initializeEventListeners() {
        // Przycisk zapisz i odśwież
        const saveRestartBtn = document.getElementById('swSaveAndRestartButton');
        if (saveRestartBtn) {
            saveRestartBtn.addEventListener('click', () => {
                saveAddonsState();
                savePanelSize();
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
        
        // 🔹 PRZYCISKI ZMIANY CZCIONKI
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
        
        // 🔹 OBSŁUGA ZMIANY ROZMIARU PANELU
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            let resizeObserver;
            try {
                resizeObserver = new ResizeObserver(() => {
                    handlePanelResize();
                });
                resizeObserver.observe(panel);
            } catch (e) {
                panel.addEventListener('mouseup', function() {
                    handlePanelResize();
                });
                
                panel.addEventListener('resize', function() {
                    handlePanelResize();
                });
            }
            
            window.addEventListener('beforeunload', () => {
                savePanelSize();
            });
            
            panel.addEventListener('click', function(e) {
                if (e.target.classList.contains('tablink')) {
                    setTimeout(savePanelSize, 100);
                }
            });
        }
    }

    // 🔹 Setup przeciągania PANELU
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
            
            if (clickY <= 75) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                initialLeft = parseInt(panel.style.left) || 20;
                initialTop = parseInt(panel.style.top) || 70;
                
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
            
            savePanelSize();
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
            toggleBtn.style.left = '20px';
            toggleBtn.style.top = '20px';
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
            
            savePanelSize();
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
                        input.style.borderColor = '#550000';
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
                    input.style.borderColor = '#550000';
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
                    input.style.borderColor = '#550000';
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
                
                setTimeout(savePanelSize, 50);
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
                <div style="text-align:center; padding:30px; color:#ff9966; font-style:italic; font-size:11px; width:100%;">
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
                        ${addon.locked ? ' <span style="color:#ff3300; font-size:9px;">(Wymaga licencji)</span>' : ''}
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
    }

    // 🔹 Renderowanie skrótów
    function renderShortcuts() {
        const container = document.getElementById('shortcuts-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const enabledAddons = currentAddons.filter(addon => 
            addon.enabled && !addon.hidden && !addon.locked
        );
        
        if (enabledAddons.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:25px; color:#ff9966; font-style:italic; font-size:11px; width:100%;">
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
            setTimeout(renderShortcuts, 100);
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
                    display.style.borderColor = '#550000';
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
                display.style.borderColor = '#550000';
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
                display.style.borderColor = '#550000';
                
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
        messageEl.style.marginTop = '8px';
        messageEl.style.width = '100%';
        messageEl.style.maxWidth = '600px';
        
        const content = shortcutsTab.querySelector('.sw-tab-content');
        if (content) {
            content.appendChild(messageEl);
        }
        
        return messageEl;
    }

    // 🔹 Eksport ustawień
    function exportSettings() {
        try {
            const settings = {
                v: '4.6.8',
                t: Date.now(),
                a: SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []),
                s: SW.GM_getValue(CONFIG.SHORTCUTS_CONFIG, {}),
                se: SW.GM_getValue(CONFIG.SHORTCUTS_ENABLED, {}),
                p: SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A'),
                f: SW.GM_getValue(CONFIG.FONT_SIZE, 13),
                o: SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90),
                w: SW.GM_getValue(CONFIG.PANEL_WIDTH, 500),
                h: SW.GM_getValue(CONFIG.PANEL_HEIGHT, 500)
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
                        navigator.clipboard.writeText(obfuscated).then(() => {
                            showLicenseMessage('✅ Ustawienia wyeksportowane i skopiowane do schowka!', 'success');
                        }).catch(err => {
                            showLicenseMessage('✅ Ustawienia wyeksportowane! Skopiuj tekst ręcznie.', 'info');
                        });
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
            
            if (settings.v !== '4.6.8') {
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
            if (settings.w) SW.GM_setValue(CONFIG.PANEL_WIDTH, settings.w);
            if (settings.h) SW.GM_setValue(CONFIG.PANEL_HEIGHT, settings.h);
            
            showLicenseMessage('✅ Ustawienia zaimportowane! Odświeżanie...', 'success');
            setTimeout(() => location.reload(), 2000);
            
        } catch (error) {
            console.error('❌ Błąd importu:', error);
            showLicenseMessage('❌ Nieprawidłowy format danych importu', 'error');
        }
    }

    // 🔹 Ładowanie ustawień
    function loadSettings() {
        const savedFontSize = parseInt(SW.GM_getValue(CONFIG.FONT_SIZE, 13));
        currentFontSize = savedFontSize;
        
        applyFontSize(savedFontSize, true);
        
        const savedOpacity = parseInt(SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90));
        applyOpacity(savedOpacity, true);
        
        const savedShortcut = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        panelShortcut = savedShortcut;
        const panelInput = document.getElementById('panelShortcutInput');
        if (panelInput) panelInput.value = panelShortcut;
        
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
        console.log('✅ Initializing Synergy Panel v4.6.8...');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const toggleBtn = createToggleButton();
        createMainPanel();
        
        loadSavedState();
        
        if (toggleBtn) {
            setupToggleDrag(toggleBtn);
        }
        
        setTimeout(async () => {
            await initAccountAndLicense();
            
            renderAddons();
            renderShortcuts();
            
            updateFontSizeButtons(currentFontSize);
            
            setTimeout(() => {
                savePanelSize();
            }, 2000);
            
            setInterval(() => {
                if (userAccountId) checkAndUpdateLicense(userAccountId);
            }, 5 * 60 * 1000);
        }, 1000);
    }

    // 🔹 Start panelu
    console.log('🎯 Starting Synergy Panel v4.6.8...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }

})();