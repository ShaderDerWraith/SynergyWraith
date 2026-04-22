// ==UserScript==
// @name         Synergy Panel v4.7.4 - Final Clean & Smooth
// @namespace    http://tampermonkey.net/
// @version      4.7.4
// @description  Zaawansowany panel dodatków do gry - bez zbędnych emotikon, z płynnym scrollowaniem
// @author       ShaderDerWraith
// @match        *://*/*
// @icon         https://raw.githubusercontent.com/ShaderDerWraith/SynergyWraith/main/public/icon.jpg
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('🚀 Synergy Panel loaded - v4.7.4 (Final Clean)');

    // ========== CSS (z zmienną --base-font-size) ==========
    const panelCSS = `
        :root {
            --base-font-size: 12px;
        }
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
            box-shadow: 0 0 15px rgba(255,51,0,0.9);
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
            box-shadow: 0 0 25px rgba(255,102,0,1);
            border: 2px solid #ffcc00;
            z-index: 1000001;
        }
        #swPanelToggle:hover:not(.dragging) {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(255,102,0,1);
            cursor: grab;
        }
        #swPanelToggle.saved {
            animation: savePulse 1.5s ease-in-out;
        }
        @keyframes savePulse {
            0% { box-shadow: 0 0 15px rgba(255,51,0,0.9); border-color: #ff3300; }
            50% { box-shadow: 0 0 30px rgba(255,153,0,1); border-color: #ffcc00; transform: scale(1.05); }
            100% { box-shadow: 0 0 15px rgba(255,51,0,0.9); border-color: #ff3300; }
        }
        #swAddonsPanel {
            position: fixed;
            top: 70px;
            left: 20px;
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, rgba(20,0,0,0.98), rgba(40,0,0,0.98), rgba(80,0,0,0.98));
            border: 2px solid #ff3300;
            border-radius: 10px;
            color: #ffffff;
            z-index: 999999;
            box-shadow: 0 0 25px rgba(255,51,0,0.8), inset 0 0 40px rgba(255,51,0,0.1);
            backdrop-filter: blur(10px);
            display: none;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            min-width: 450px;
            min-height: 400px;
            max-width: 800px;
            max-height: 700px;
            resize: both;
            font-size: var(--base-font-size);
            cursor: default;
        }
        /* Ukrycie starego uchwytu resize */
        #swAddonsPanel::-webkit-resizer {
            display: none;
        }
        /* Nowy uchwyt resize – mały trójkąt w prawym dolnym rogu */
        #swAddonsPanel::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 0 15px 15px;
            border-color: transparent transparent rgba(255,51,0,0.3) transparent;
            pointer-events: none;
            z-index: 10000;
        }
        #swPanelHeader {
            background: linear-gradient(135deg, rgba(40,0,0,0.95), rgba(80,0,0,0.95), rgba(120,0,0,0.95));
            padding: 12px;
            text-align: center;
            border-bottom: 2px solid #ff3300;
            cursor: move;
            font-size: calc(var(--base-font-size) + 10px);
            font-weight: bold;
            color: #ffcc00;
            text-shadow: 0 0 5px #ff3300, 0 0 10px #ff6600, 0 0 15px #ff9900;
            user-select: none;
            position: relative;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fireBreath 1.8s infinite alternate ease-in-out;
        }
        @keyframes fireBreath {
            0% { text-shadow: 0 0 4px #ff3300, 0 0 8px #ff6600, 0 0 12px #ff9900; color: #ffcc00; }
            100% { text-shadow: 0 0 10px #ff6600, 0 0 20px #ff3300, 0 0 30px #ff0000; color: #ffdd99; }
        }
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
        .tab-container {
            display: flex;
            background: linear-gradient(to bottom, rgba(40,0,0,0.95), rgba(30,0,0,0.95));
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
            font-size: calc(var(--base-font-size) - 1px);
            text-transform: uppercase;
            letter-spacing: 0.4px;
            border-bottom: 2px solid transparent;
            position: relative;
            min-width: 80px;
            text-align: center;
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
        .tablink:hover::after { width: 80%; }
        .tablink.active { color: #ffcc00; text-shadow: 0 0 6px rgba(255,102,0,0.8); }
        .tablink.active::after { width: 100%; background: linear-gradient(to right, #ff3300, #ffcc00, #ff3300); box-shadow: 0 0 8px rgba(255,102,0,0.8); }
        .tabcontent {
            display: none;
            flex: 1;
            overflow: hidden;
            flex-direction: column;
            position: relative;
            height: calc(100% - 90px);
        }
        .tabcontent.active { display: flex; }
        .sw-tab-content {
            padding: 12px;
            background: rgba(20,0,0,0.7);
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: hidden;
            position: relative;
            flex: 1;
            min-height: 0;
        }
        /* Kontenery scroll – naturalne, bez sztucznych poprawek */
        .addon-list-container,
        .shortcuts-list-container,
        .license-scroll-container,
        .scrollable-container {
            width: 100%;
            max-width: 600px;
            flex: 1;
            overflow-y: auto !important;
            overflow-x: hidden;
            margin-bottom: 8px;
            padding-right: 8px;
            padding-bottom: 15px;
            scrollbar-width: thin;
            scrollbar-color: #ff3300 rgba(40,0,0,0.5);
            height: auto;
            min-height: 180px;
            scroll-behavior: auto;
        }
        /* Specjalne dla INFO – przesunięcie scrolla, żeby nie nachodził na treść */
        #info .scrollable-container {
            padding-right: 15px;
        }
        /* Scrollbary */
        .addon-list-container::-webkit-scrollbar,
        .shortcuts-list-container::-webkit-scrollbar,
        .license-scroll-container::-webkit-scrollbar,
        .scrollable-container::-webkit-scrollbar {
            width: 10px;
            background: rgba(40,0,0,0.5);
            border-radius: 6px;
        }
        .addon-list-container::-webkit-scrollbar-track,
        .shortcuts-list-container::-webkit-scrollbar-track,
        .license-scroll-container::-webkit-scrollbar-track,
        .scrollable-container::-webkit-scrollbar-track {
            background: rgba(40,0,0,0.5);
            border-radius: 6px;
            border: 1px solid #550000;
        }
        .addon-list-container::-webkit-scrollbar-thumb,
        .shortcuts-list-container::-webkit-scrollbar-thumb,
        .license-scroll-container::-webkit-scrollbar-thumb,
        .scrollable-container::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #ff3300, #ff6600);
            border-radius: 6px;
            border: 1px solid #ff9900;
        }
        .addon-list { width: 100%; }
        .addon {
            background: linear-gradient(135deg, rgba(40,0,0,0.9), rgba(80,0,0,0.9));
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
            box-shadow: 0 4px 12px rgba(255,51,0,0.4);
            background: linear-gradient(135deg, rgba(80,0,0,0.95), rgba(120,0,0,0.95));
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
            font-size: calc(var(--base-font-size) + 1px);
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
        }
        .addon-description {
            color: #ff9966;
            font-size: calc(var(--base-font-size) - 1px);
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
        }
        .addon-controls {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
        }
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
        .favorite-btn:hover { color: #ff9900; background: rgba(255,153,0,0.1); }
        .favorite-btn.favorite { color: #ffcc00; text-shadow: 0 0 10px rgba(255,204,0,0.8); }
        .addon-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
        }
        .addon-switch input { opacity: 0; width: 0; height: 0; }
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
            font-size: calc(var(--base-font-size) - 1px);
            font-weight: 600;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            white-space: nowrap;
            min-width: 100px;
            text-align: center;
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
            box-shadow: 0 3px 10px rgba(255,51,0,0.5);
        }
        #swSaveAndRestartButton {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #005500, #007700);
            border: 1px solid #00bb00;
            border-radius: 6px;
            color: #ffffff;
            cursor: pointer;
            font-weight: 700;
            font-size: var(--base-font-size);
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-top: 15px;
            margin-bottom: 8px;
            display: block;
            box-sizing: border-box;
            text-align: center;
        }
        #swSaveAndRestartButton:hover {
            background: linear-gradient(135deg, #007700, #009900);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,255,0,0.4);
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
            background: rgba(20,0,0,0.7);
        }
        .shortcut-item {
            background: linear-gradient(135deg, rgba(40,0,0,0.9), rgba(80,0,0,0.9));
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
        .shortcut-info {
            flex: 1;
            min-width: 200px;
            margin-right: 15px;
            margin-bottom: 10px;
        }
        .shortcut-name {
            font-weight: 700;
            color: #ffcc00;
            font-size: calc(var(--base-font-size) + 1px);
            margin-bottom: 4px;
            text-align: left;
        }
        .shortcut-desc {
            color: #ff9966;
            font-size: calc(var(--base-font-size) - 1px);
            text-align: left;
        }
        .shortcut-display {
            padding: 6px 10px;
            background: rgba(25,0,0,0.8);
            border: 1px solid #550000;
            border-radius: 4px;
            color: #ffcc00;
            font-size: calc(var(--base-font-size) - 1px);
            font-weight: bold;
            text-align: center;
            min-width: 90px;
        }
        .shortcut-set-btn, .shortcut-clear-btn {
            padding: 6px 12px;
            background: linear-gradient(135deg, #550000, #880000);
            border: 1px solid #ff3300;
            border-radius: 4px;
            color: #ffcc00;
            cursor: pointer;
            font-size: calc(var(--base-font-size) - 1px);
            font-weight: 600;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            white-space: nowrap;
            min-width: 65px;
            text-align: center;
        }
        .shortcut-set-btn:hover, .shortcut-clear-btn:hover {
            background: linear-gradient(135deg, #880000, #bb0000);
            color: #ffffff;
            transform: translateY(-2px);
        }
        .shortcut-toggle {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
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
        }
        .shortcut-toggle input:checked + .shortcut-toggle-slider {
            background-color: #005500;
            border-color: #00bb00;
        }
        .shortcut-toggle input:checked + .shortcut-toggle-slider:before {
            transform: translateX(19px);
            background-color: #00ff00;
        }
        .license-container {
            background: linear-gradient(135deg, rgba(40,0,0,0.9), rgba(80,0,0,0.9));
            border: 1px solid #550000;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 12px;
            width: 100%;
            max-width: 600px;
            box-sizing: border-box;
        }
        .license-header {
            color: #ffcc00;
            font-size: calc(var(--base-font-size) + 2px);
            font-weight: bold;
            margin-bottom: 12px;
            border-bottom: 2px solid #ff3300;
            padding-bottom: 8px;
            text-align: center;
        }
        .license-status-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: var(--base-font-size);
            padding: 6px 0;
            border-bottom: 1px solid rgba(255,51,0,0.3);
        }
        .license-status-label { color: #ff9966; font-weight: 600; }
        .license-status-value { font-weight: 600; text-align: right; color: #ffcc00; }
        .license-status-valid { color: #00ff00 !important; }
        .license-status-invalid { color: #ff3300 !important; }
        .settings-item {
            margin-bottom: 15px;
            padding: 15px;
            background: linear-gradient(135deg, rgba(40,0,0,0.9), rgba(80,0,0,0.9));
            border: 1px solid #550000;
            border-radius: 8px;
            width: 100%;
            max-width: 600px;
            box-sizing: border-box;
        }
        .settings-label {
            display: block;
            color: #ffcc00;
            font-size: calc(var(--base-font-size) + 1px);
            margin-bottom: 10px;
            font-weight: 700;
            text-align: center;
        }
        .font-size-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
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
        }
        .font-size-btn:hover {
            background: linear-gradient(135deg, #880000, #bb0000);
            transform: translateY(-2px);
        }
        .font-size-display {
            min-width: 65px;
            padding: 8px;
            background: rgba(40,0,0,0.8);
            border: 1px solid #550000;
            border-radius: 5px;
            color: #ffcc00;
            font-size: calc(var(--base-font-size) + 2px);
            font-weight: bold;
            text-align: center;
        }
        .slider-container {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .slider-value {
            min-width: 45px;
            text-align: center;
            color: #ffcc00;
            font-weight: bold;
        }
        .opacity-slider {
            flex: 1;
            -webkit-appearance: none;
            height: 6px;
            background: #2a0000;
            border-radius: 4px;
            border: 1px solid #550000;
        }
        .opacity-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #ff3300;
            cursor: pointer;
            border: 2px solid #ffcc00;
        }
        #panelShortcutSetBtn {
            padding: 8px 15px;
            background: linear-gradient(135deg, #550000, #880000);
            border: 1px solid #ff3300;
            border-radius: 5px;
            color: #ffffff;
            cursor: pointer;
            font-size: calc(var(--base-font-size) - 1px);
            font-weight: 700;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            white-space: nowrap;
            min-width: 70px;
        }
        #panelShortcutSetBtn:hover {
            background: linear-gradient(135deg, #880000, #bb0000);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255,51,0,0.4);
        }
        .import-export-container {
            width: 100%;
            max-width: 600px;
            margin-top: 15px;
            padding: 15px;
            background: linear-gradient(135deg, rgba(40,0,0,0.9), rgba(80,0,0,0.9));
            border: 1px solid #550000;
            border-radius: 8px;
            box-sizing: border-box;
        }
        .import-export-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
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
            font-size: calc(var(--base-font-size) - 1px);
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            text-align: center;
        }
        .import-export-btn:hover {
            background: linear-gradient(135deg, #880000, #bb0000);
            transform: translateY(-2px);
        }
        .import-export-textarea {
            width: 100%;
            height: 100px;
            background: rgba(20,0,0,0.8);
            border: 1px solid #550000;
            border-radius: 5px;
            color: #ffcc00;
            font-size: calc(var(--base-font-size) - 2px);
            font-family: monospace;
            resize: none;
            padding: 8px;
        }
        #swResetButton {
            padding: 10px;
            background: linear-gradient(135deg, #550000, #880000);
            border: 1px solid #ff3300;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
            max-width: 600px;
            margin-top: 15px;
        }
        #swResetButton:hover {
            background: linear-gradient(135deg, #880000, #bb0000);
            transform: translateY(-2px);
        }
        .info-section {
            background: linear-gradient(135deg, rgba(40,0,0,0.9), rgba(80,0,0,0.9));
            border: 1px solid #550000;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            width: 100%;
            max-width: 600px;
            box-sizing: border-box;
        }
        .info-section h4 {
            color: #ff9966;
            text-align: center;
            margin-top: 0;
            font-size: calc(var(--base-font-size) + 2px);
            border-bottom: 1px solid #ff3300;
            padding-bottom: 5px;
        }
        .info-section p {
            color: #ffcc00;
            font-size: var(--base-font-size);
            margin: 8px 0;
            padding-left: 15px;
            position: relative;
        }
        .info-section p::before {
            content: "•";
            color: #ff6600;
            position: absolute;
            left: 0;
        }
        @media (max-width: 768px) {
            #swAddonsPanel {
                width: 95vw !important;
                min-width: 350px;
                left: 2.5vw !important;
            }
            .tablink {
                font-size: 10px;
                padding: 8px 10px;
                min-width: 60px;
            }
        }
    `;

    const style = document.createElement('style');
    style.textContent = panelCSS;
    document.head.appendChild(style);

    // ========== KONFIGURACJA ==========
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

    const ADDONS = [
        { id: 'enhanced-stats', name: 'Enhanced Stats', description: 'Rozszerzone statystyki postaci', type: 'free', enabled: false, favorite: false, hidden: false },
        { id: 'trade-helper', name: 'Trade Helper', description: 'Pomocnik handlu i aukcji', type: 'free', enabled: false, favorite: false, hidden: false },
        { id: 'chat-manager', name: 'Chat Manager', description: 'Zaawansowane zarządzanie czatem', type: 'free', enabled: false, favorite: false, hidden: false },
        { id: 'quest-logger', name: 'Quest Logger', description: 'Logowanie postępów w zadaniach', type: 'free', enabled: false, favorite: false, hidden: false },
        { id: 'kcs-icons', name: 'KCS Icons', description: 'Profesjonalne ikony do interfejsu', type: 'premium', enabled: false, favorite: false, hidden: true },
        { id: 'auto-looter', name: 'Auto Looter', description: 'Inteligentny zbieracz łupów', type: 'premium', enabled: false, favorite: false, hidden: true },
        { id: 'quest-helper', name: 'Quest Helper', description: 'Pełna pomoc w zadaniach z mapą', type: 'premium', enabled: false, favorite: false, hidden: true },
        { id: 'combat-log', name: 'Combat Log', description: 'Szczegółowy log walki z analizą', type: 'premium', enabled: false, favorite: false, hidden: true },
        { id: 'auto-potion', name: 'Auto Potion', description: 'Automatyczne używanie mikstur', type: 'premium', enabled: false, favorite: false, hidden: true },
        { id: 'fishing-bot', name: 'Fishing Bot', description: 'Automatyczne łowienie ryb', type: 'premium', enabled: false, favorite: false, hidden: true }
    ];

    if (!window.synergyWraith) {
        window.synergyWraith = {
            GM_getValue: (key, defaultValue) => { try { const val = localStorage.getItem(key); return val ? JSON.parse(val) : defaultValue; } catch(e) { return defaultValue; } },
            GM_setValue: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch(e) { return false; } },
            GM_deleteValue: (key) => { try { localStorage.removeItem(key); return true; } catch(e) { return false; } }
        };
    }
    const SW = window.synergyWraith;

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
    let panelResizeTimer = null;

    // ========== FUNKCJA CZCIONKI (CSS variable) ==========
    function applyFontSize(size, skipSave = false) {
        const minSize = 8, maxSize = 16;
        const clampedSize = Math.max(minSize, Math.min(maxSize, size));
        currentFontSize = clampedSize;
        if (!skipSave) SW.GM_setValue(CONFIG.FONT_SIZE, clampedSize);
        const panel = document.getElementById('swAddonsPanel');
        if (panel) panel.style.setProperty('--base-font-size', clampedSize + 'px');
        else document.documentElement.style.setProperty('--base-font-size', clampedSize + 'px');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeValue) fontSizeValue.textContent = clampedSize + 'px';
        const dec = document.getElementById('fontSizeDecrease'), inc = document.getElementById('fontSizeIncrease');
        if (dec) dec.disabled = clampedSize <= minSize;
        if (inc) inc.disabled = clampedSize >= maxSize;
    }

    function applyOpacity(opacity, skipSave = false) {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const clamped = Math.max(30, Math.min(100, opacity));
            panel.style.opacity = clamped / 100;
            if (!skipSave) SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, clamped);
            const valEl = document.getElementById('opacityValue');
            if (valEl) valEl.textContent = clamped + '%';
        }
    }

    function savePanelSize() {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const w = Math.max(450, Math.min(panel.offsetWidth, 800));
            const h = Math.max(400, Math.min(panel.offsetHeight, 700));
            SW.GM_setValue(CONFIG.PANEL_WIDTH, w);
            SW.GM_setValue(CONFIG.PANEL_HEIGHT, h);
        }
    }

    function loadPanelSize() {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const w = Math.max(450, Math.min(SW.GM_getValue(CONFIG.PANEL_WIDTH, 500), 800));
            const h = Math.max(400, Math.min(SW.GM_getValue(CONFIG.PANEL_HEIGHT, 500), 700));
            panel.style.width = w + 'px';
            panel.style.height = h + 'px';
        }
    }

    function handlePanelResize() {
        clearTimeout(panelResizeTimer);
        panelResizeTimer = setTimeout(savePanelSize, 300);
    }

    function createToggleButton() {
        const old = document.getElementById('swPanelToggle');
        if (old) old.remove();
        const btn = document.createElement('div');
        btn.id = 'swPanelToggle';
        btn.title = 'Kliknij - otwórz/ukryj panel | Przeciągnij - zmień pozycję';
        document.body.appendChild(btn);
        return btn;
    }

    function generatePanelHTML() {
        return `
            <div id="swPanelHeader"><strong>SYNERGY</strong></div>
            <div class="tab-container">
                <button class="tablink active" data-tab="addons">Dodatki</button>
                <button class="tablink" data-tab="shortcuts">Skróty</button>
                <button class="tablink" data-tab="license">Licencja</button>
                <button class="tablink" data-tab="settings">Ustawienia</button>
                <button class="tablink" data-tab="info">Info</button>
            </div>
            <div id="addons" class="tabcontent active">
                <div class="sw-tab-content">
                    <div style="width:100%; max-width:600px; margin:0 auto 12px auto;"><input type="text" id="searchAddons" placeholder="Wyszukaj dodatki..." style="width:100%; padding:10px 14px; background:rgba(40,0,0,0.8); border:1px solid #550000; border-radius:6px; color:#ffcc00; font-size:12px; box-sizing:border-box;"></div>
                    <div class="addon-filters">
                        <button class="filter-btn active" data-filter="all">Wszystkie</button>
                        <button class="filter-btn" data-filter="enabled">Włączone</button>
                        <button class="filter-btn" data-filter="disabled">Wyłączone</button>
                        <button class="filter-btn" data-filter="favorites">Ulubione</button>
                    </div>
                    <div class="addon-list-container"><div class="addon-list" id="addon-list"></div></div>
                    <div class="save-button-container"><button id="swSaveAndRestartButton">Zapisz i odśwież grę</button></div>
                    <div id="swAddonsMessage" class="license-message" style="display: none;"></div>
                </div>
            </div>
            <div id="shortcuts" class="tabcontent">
                <div class="sw-tab-content">
                    <div style="margin-bottom:12px; padding:12px; background:linear-gradient(135deg, rgba(40,0,0,0.9), rgba(80,0,0,0.9)); border-radius:6px; border:1px solid #550000; width:100%; max-width:600px;"><h3 style="color:#ffcc00; margin-top:0; margin-bottom:5px; font-size:13px; text-align:center;">Skróty klawiszowe</h3><p style="color:#ff9966; font-size:11px; margin:0; text-align:center;">Skróty pokazują się tylko dla włączonych dodatków</p></div>
                    <div class="shortcuts-list-container"><div id="shortcuts-list" style="width:100%;"></div></div>
                    <div style="height:15px;"></div>
                </div>
            </div>
            <div id="license" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="license-scroll-container">
                        <div class="license-container"><div class="license-header">Status Licencji</div>
                            <div class="license-status-item"><span class="license-status-label">ID Konta:</span><span id="swAccountId" class="license-status-value">Ładowanie...</span></div>
                            <div class="license-status-item"><span class="license-status-label">Status:</span><span id="swLicenseStatus" class="license-status-invalid">Nieaktywna</span></div>
                            <div class="license-status-item"><span class="license-status-label">Ważna do:</span><span id="swLicenseExpiry" class="license-status-value">-</span></div>
                            <div class="license-status-item"><span class="license-status-label">Dni pozostało:</span><span id="swLicenseDaysLeft" class="license-status-value">-</span></div>
                        </div>
                        <div class="license-container"><div class="license-header">Informacje o Premium</div><div style="padding:12px; color:#ffcc00; font-size:11px; text-align:center;"><p>Aby uzyskać dostęp do dodatków premium, skontaktuj się z administratorem.</p></div></div>
                    </div>
                    <div id="swLicenseMessage" class="license-message"></div>
                </div>
            </div>
            <div id="settings" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="scrollable-container">
                        <div class="settings-item"><div class="settings-label">Rozmiar czcionki:</div><div class="font-size-controls"><button class="font-size-btn" id="fontSizeDecrease">-</button><div class="font-size-display" id="fontSizeValue">13px</div><button class="font-size-btn" id="fontSizeIncrease">+</button></div><small style="color:#ff9966; font-size:10px; display:block; text-align:center;">Kliknij +/- aby zmienić (8-16px)</small></div>
                        <div class="settings-item"><div class="settings-label">Przeźroczystość panelu:</div><div class="slider-container"><input type="range" min="30" max="100" value="90" class="opacity-slider" id="opacitySlider" step="1"><span class="slider-value" id="opacityValue">90%</span></div><small style="color:#ff9966; font-size:10px; display:block; text-align:center;">30-100%</small></div>
                        <div class="settings-item"><div class="settings-label">Skrót do panelu:</div><div style="display:flex; gap:8px; align-items:center; margin-bottom:5px;"><input type="text" id="panelShortcutInput" style="flex:1; padding:8px; background:rgba(40,0,0,0.8); border:1px solid #550000; border-radius:4px; color:#ffcc00; font-size:12px; text-align:center;" value="Ctrl+A" readonly><button id="panelShortcutSetBtn">Ustaw</button></div></div>
                        <div class="import-export-container"><div class="settings-label">Eksport/Import ustawień:</div><div class="import-export-buttons"><button class="import-export-btn" id="exportSettingsBtn">Eksportuj</button><button class="import-export-btn" id="importSettingsBtn">Importuj</button></div><textarea class="import-export-textarea" id="settingsTextarea" placeholder="Dane pojawią się tutaj po eksporcie..."></textarea></div>
                        <div style="margin:15px auto 0 auto; padding-top:12px; border-top:1px solid #550000; width:100%; max-width:600px; text-align:center;"><button id="swResetButton">Resetuj ustawienia</button></div>
                    </div>
                    <div id="swResetMessage" style="margin-top:12px; padding:10px; border-radius:5px; display:none; font-size:11px; width:100%; max-width:600px; text-align:center;"></div>
                </div>
            </div>
            <div id="info" class="tabcontent">
                <div class="sw-tab-content">
                    <div class="scrollable-container">
                        <div style="text-align:center; padding:15px; width:100%; max-width:600px; margin:0 auto;">
                            <h3 style="color:#ffcc00; margin-bottom:15px; font-size:18px;">Synergy Panel</h3>
                            <div class="info-section"><h4>System Dodatków</h4><p>• Darmowe dodatki: dostępne dla każdego</p><p style="color:#00ff00;">• Premium dodatki: wymagają aktywnej licencji</p><p style="color:#ff9966;">• Filtry: Wszystkie / Włączone / Wyłączone / Ulubione</p></div>
                            <div class="info-section"><h4>System Licencji</h4><p>• Licencje przyznawane przez administratora</p><p>• Ważność czasowa (30 dni, 90 dni, etc.)</p><p>• Automatyczne odświeżanie statusu</p></div>
                            <div class="info-section"><h4>Nowe Funkcje</h4><p>• Eksport/Import ustawień</p><p>• Filtry dodatków</p><p>• Skróty domyślnie wyłączone</p><p>• Płynne przesuwanie panelu</p></div>
                            <div style="color:#ff9966; font-size:10px; margin-top:20px; padding:12px; background:rgba(40,0,0,0.5); border-radius:5px;"><p style="margin:5px 0;">© 2024 Synergy Panel</p><p style="margin:5px 0;">System licencji GitHub RAW</p></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function createMainPanel() {
        const old = document.getElementById('swAddonsPanel');
        if (old) old.remove();
        const panel = document.createElement('div');
        panel.id = 'swAddonsPanel';
        panel.innerHTML = generatePanelHTML();
        document.body.appendChild(panel);
        initializeEventListeners();
        loadSettings();
        loadPanelSize();
        setupPanelDrag();
        return panel;
    }

    function initializeEventListeners() {
        const saveBtn = document.getElementById('swSaveAndRestartButton');
        if (saveBtn) saveBtn.addEventListener('click', () => { saveAddonsState(); savePanelSize(); showLicenseMessage('✅ Zapisano ustawienia! Odświeżanie gry...', 'success'); setTimeout(() => location.reload(), 1500); });
        const resetBtn = document.getElementById('swResetButton');
        if (resetBtn) resetBtn.addEventListener('click', () => { if(confirm('Czy na pewno chcesz zresetować wszystkie ustawienia?')) resetAllSettings(); });
        const decFont = document.getElementById('fontSizeDecrease'), incFont = document.getElementById('fontSizeIncrease');
        if (decFont) decFont.addEventListener('click', () => applyFontSize(currentFontSize - 1));
        if (incFont) incFont.addEventListener('click', () => applyFontSize(currentFontSize + 1));
        const opSlider = document.getElementById('opacitySlider');
        if (opSlider) opSlider.addEventListener('input', (e) => applyOpacity(parseInt(e.target.value)));
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderAddons();
            });
        });
        const expBtn = document.getElementById('exportSettingsBtn'), impBtn = document.getElementById('importSettingsBtn');
        if (expBtn) expBtn.addEventListener('click', exportSettings);
        if (impBtn) impBtn.addEventListener('click', importSettings);
        const search = document.getElementById('searchAddons');
        if (search) search.addEventListener('input', (e) => { searchQuery = e.target.value.toLowerCase(); renderAddons(); });
        setupPanelShortcutInput();
        setupTabs();
        setupGlobalShortcuts();
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            let ro; try { ro = new ResizeObserver(() => handlePanelResize()); ro.observe(panel); } catch(e) { panel.addEventListener('mouseup', handlePanelResize); }
        }
    }

    function setupPanelDrag() {
        const panel = document.getElementById('swAddonsPanel');
        if (!panel) return;
        let isDragging = false, startX, startY, initialLeft, initialTop;
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
                document.addEventListener('mousemove', onDrag);
                document.addEventListener('mouseup', stopDrag);
                e.preventDefault();
            }
        };
        const onDrag = (e) => {
            if (!isDragging) return;
            let newLeft = initialLeft + (e.clientX - startX);
            let newTop = initialTop + (e.clientY - startY);
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - panel.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - panel.offsetHeight));
            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
        };
        const stopDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            panel.classList.remove('dragging');
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
            SW.GM_setValue(CONFIG.PANEL_POSITION, { left: panel.style.left, top: panel.style.top });
            savePanelSize();
        };
        panel.addEventListener('mousedown', startDrag);
        panel.addEventListener('dragstart', (e) => e.preventDefault());
    }

    function setupToggleDrag(toggleBtn) {
        if (!toggleBtn) return;
        const savedPos = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        if (savedPos) { toggleBtn.style.left = savedPos.left; toggleBtn.style.top = savedPos.top; }
        else { toggleBtn.style.left = '20px'; toggleBtn.style.top = '20px'; }
        let isDragging = false, startX, startY, initialLeft, initialTop, dragTimer;
        toggleBtn.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            startX = e.clientX;
            startY = e.clientY;
            const rect = toggleBtn.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            dragTimer = setTimeout(() => { isDragging = true; toggleBtn.classList.add('dragging'); }, 100);
            const onMove = (e) => {
                if (!isDragging) return;
                let newLeft = initialLeft + (e.clientX - startX);
                let newTop = initialTop + (e.clientY - startY);
                newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - toggleBtn.offsetWidth));
                newTop = Math.max(0, Math.min(newTop, window.innerHeight - toggleBtn.offsetHeight));
                toggleBtn.style.left = newLeft + 'px';
                toggleBtn.style.top = newTop + 'px';
                e.preventDefault();
            };
            const onUp = () => {
                clearTimeout(dragTimer);
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                if (isDragging) {
                    isDragging = false;
                    toggleBtn.classList.remove('dragging');
                    SW.GM_setValue(CONFIG.TOGGLE_BTN_POSITION, { left: toggleBtn.style.left, top: toggleBtn.style.top });
                } else {
                    togglePanel();
                }
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    function togglePanel() {
        const panel = document.getElementById('swAddonsPanel');
        if (panel) {
            const visible = panel.style.display === 'block';
            panel.style.display = visible ? 'none' : 'block';
            SW.GM_setValue(CONFIG.PANEL_VISIBLE, !visible);
            savePanelSize();
        }
    }

    function setupPanelShortcutInput() {
        const inp = document.getElementById('panelShortcutInput'), setBtn = document.getElementById('panelShortcutSetBtn');
        if (!inp || !setBtn) return;
        const saved = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        panelShortcut = saved;
        inp.value = panelShortcut;
        setBtn.addEventListener('click', () => {
            inp.value = 'Wciśnij kombinację...';
            inp.style.borderColor = '#ff3300';
            let keys = [], isSetting = true;
            const keyDown = (e) => {
                if (!isSetting) return;
                e.preventDefault();
                const parts = [];
                if (e.ctrlKey) parts.push('Ctrl');
                if (e.shiftKey) parts.push('Shift');
                if (e.altKey) parts.push('Alt');
                const main = e.key.toUpperCase();
                if (!['CONTROL','SHIFT','ALT','META'].includes(main)) parts.push(main);
                inp.value = parts.join('+');
                keys = parts;
            };
            const keyUp = (e) => {
                if (!isSetting) return;
                if (keys.length >= 2) {
                    isSetting = false;
                    document.removeEventListener('keydown', keyDown);
                    document.removeEventListener('keyup', keyUp);
                    panelShortcut = keys.join('+');
                    SW.GM_setValue(CONFIG.CUSTOM_SHORTCUT, panelShortcut);
                    inp.value = panelShortcut;
                    inp.style.borderColor = '#00cc00';
                    setTimeout(() => inp.style.borderColor = '#550000', 2000);
                    const msg = document.getElementById('swResetMessage');
                    if (msg) { msg.textContent = `✅ Skrót ustawiony: ${panelShortcut}`; msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 3000); }
                }
            };
            const esc = (e) => { if (e.key === 'Escape') { isSetting = false; document.removeEventListener('keydown', keyDown); document.removeEventListener('keyup', keyUp); document.removeEventListener('keydown', esc); inp.value = panelShortcut; inp.style.borderColor = '#550000'; } };
            document.addEventListener('keydown', keyDown);
            document.addEventListener('keyup', keyUp);
            document.addEventListener('keydown', esc);
            setTimeout(() => { if (isSetting) { isSetting = false; document.removeEventListener('keydown', keyDown); document.removeEventListener('keyup', keyUp); document.removeEventListener('keydown', esc); inp.value = panelShortcut; inp.style.borderColor = '#550000'; } }, 10000);
        });
    }

    function setupTabs() {
        document.querySelectorAll('.tablink').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = tab.getAttribute('data-tab');
                document.querySelectorAll('.tabcontent').forEach(c => { c.classList.remove('active'); c.style.display = 'none'; });
                document.querySelectorAll('.tablink').forEach(t => t.classList.remove('active'));
                const active = document.getElementById(tabName);
                if (active) { active.classList.add('active'); active.style.display = 'flex'; }
                tab.classList.add('active');
                if (tabName === 'shortcuts') setTimeout(renderShortcuts, 50);
                savePanelSize();
            });
        });
    }

    function setupGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (isShortcutInputFocused) return;
            const parts = panelShortcut.split('+');
            const hasCtrl = parts.includes('Ctrl'), hasShift = parts.includes('Shift'), hasAlt = parts.includes('Alt');
            const key = parts[parts.length-1].toUpperCase();
            const match = (hasCtrl === e.ctrlKey) && (hasShift === e.shiftKey) && (hasAlt === e.altKey) && (e.key.toUpperCase() === key);
            if (match) { e.preventDefault(); togglePanel(); return; }
            Object.keys(addonShortcuts).forEach(addonId => {
                const sc = addonShortcuts[addonId];
                if (!sc || shortcutsEnabled[addonId] !== true) return;
                const scParts = sc.split('+');
                const scHasCtrl = scParts.includes('Ctrl'), scHasShift = scParts.includes('Shift'), scHasAlt = scParts.includes('Alt');
                const scKey = scParts[scParts.length-1].toUpperCase();
                const scMatch = (scHasCtrl === e.ctrlKey) && (scHasShift === e.shiftKey) && (scHasAlt === e.altKey) && (e.key.toUpperCase() === scKey);
                if (scMatch) {
                    e.preventDefault();
                    const addon = currentAddons.find(a => a.id === addonId);
                    if (addon && addon.enabled && !addon.locked) toggleAddon(addonId, false);
                }
            });
        });
    }

    // ========== PŁYNNE SCROLLOWANIE ==========
    function initSmoothScroll() {
        const containers = document.querySelectorAll('.addon-list-container, .shortcuts-list-container, .license-scroll-container, .scrollable-container');
        containers.forEach(container => {
            let scrollTarget = container.scrollTop;
            let isScrolling = false;
            const smoothScroll = () => {
                const diff = scrollTarget - container.scrollTop;
                if (Math.abs(diff) < 0.5) {
                    container.scrollTop = scrollTarget;
                    isScrolling = false;
                    return;
                }
                container.scrollTop += diff * 0.12;
                requestAnimationFrame(smoothScroll);
            };
            container.addEventListener('wheel', (e) => {
                e.preventDefault();
                scrollTarget += e.deltaY;
                scrollTarget = Math.max(0, Math.min(scrollTarget, container.scrollHeight - container.clientHeight));
                if (!isScrolling) {
                    isScrolling = true;
                    requestAnimationFrame(smoothScroll);
                }
            }, { passive: false });
        });
    }

    function renderAddons() {
        const container = document.getElementById('addon-list');
        if (!container) return;
        container.innerHTML = '';
        let filtered = currentAddons.filter(a => !a.hidden);
        if (currentFilter === 'enabled') filtered = filtered.filter(a => a.enabled);
        else if (currentFilter === 'disabled') filtered = filtered.filter(a => !a.enabled);
        else if (currentFilter === 'favorites') filtered = filtered.filter(a => a.favorite);
        if (searchQuery) filtered = filtered.filter(a => a.name.toLowerCase().includes(searchQuery) || a.description.toLowerCase().includes(searchQuery));
        if (filtered.length === 0) { container.innerHTML = '<div style="text-align:center; padding:30px; color:#ff9966;">Brak dodatków</div>'; return; }
        const frag = document.createDocumentFragment();
        filtered.forEach(addon => {
            const div = document.createElement('div');
            div.className = 'addon';
            div.innerHTML = `
                <div class="addon-header"><div class="addon-title">${addon.type === 'premium' ? '<span class="premium-badge">PREMIUM</span> ' : ''}${addon.name}${addon.locked ? ' <span style="color:#ff3300;">(Wymaga licencji)</span>' : ''}</div><div class="addon-description">${addon.description}</div></div>
                <div class="addon-controls"><button class="favorite-btn ${addon.favorite ? 'favorite' : ''}" data-id="${addon.id}" ${addon.locked ? 'disabled style="opacity:0.5;"' : ''}>★</button><label class="addon-switch"><input type="checkbox" ${addon.enabled ? 'checked' : ''} ${addon.locked ? 'disabled' : ''} data-id="${addon.id}"><span class="addon-switch-slider"></span></label></div>
            `;
            frag.appendChild(div);
        });
        container.appendChild(frag);
        document.querySelectorAll('.favorite-btn:not(:disabled)').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(btn.dataset.id); }));
        document.querySelectorAll('.addon-switch input:not(:disabled)').forEach(ch => ch.addEventListener('change', (e) => { e.stopPropagation(); toggleAddon(ch.dataset.id, ch.checked); }));
    }

    function renderShortcuts() {
        const container = document.getElementById('shortcuts-list');
        if (!container) return;
        container.innerHTML = '';
        const enabled = currentAddons.filter(a => a.enabled && !a.hidden && !a.locked);
        if (enabled.length === 0) { container.innerHTML = '<div style="text-align:center; padding:25px; color:#ff9966;">Brak włączonych dodatków</div>'; return; }
        const frag = document.createDocumentFragment();
        enabled.forEach(addon => {
            const shortcut = addonShortcuts[addon.id] || 'Brak skrótu';
            const isEnabled = shortcutsEnabled[addon.id] === true;
            const div = document.createElement('div');
            div.className = 'shortcut-item';
            div.innerHTML = `
                <div class="shortcut-info"><div class="shortcut-name">${addon.type === 'premium' ? '<span class="premium-badge">PREMIUM</span> ' : ''}${addon.name}</div><div class="shortcut-desc">${addon.description}</div></div>
                <div class="shortcut-controls"><div class="shortcut-display" id="shortcut-display-${addon.id}">${shortcut}</div><button class="shortcut-set-btn" data-id="${addon.id}">Ustaw</button><button class="shortcut-clear-btn" data-id="${addon.id}">Wyczyść</button><label class="shortcut-toggle"><input type="checkbox" ${isEnabled ? 'checked' : ''} data-id="${addon.id}" class="shortcut-toggle-input"><span class="shortcut-toggle-slider"></span></label></div>
            `;
            frag.appendChild(div);
        });
        container.appendChild(frag);
        document.querySelectorAll('.shortcut-set-btn').forEach(btn => btn.addEventListener('click', () => setAddonShortcut(btn.dataset.id)));
        document.querySelectorAll('.shortcut-clear-btn').forEach(btn => btn.addEventListener('click', () => clearAddonShortcut(btn.dataset.id)));
        document.querySelectorAll('.shortcut-toggle-input').forEach(toggle => toggle.addEventListener('change', (e) => toggleShortcutEnabled(toggle.dataset.id, e.target.checked)));
    }

    function toggleFavorite(id) {
        const idx = currentAddons.findIndex(a => a.id === id);
        if (idx !== -1) { currentAddons[idx].favorite = !currentAddons[idx].favorite; saveAddonsState(); renderAddons(); }
    }
    function toggleAddon(id, enabled) {
        const idx = currentAddons.findIndex(a => a.id === id);
        if (idx !== -1 && !currentAddons[idx].locked) { currentAddons[idx].enabled = enabled; saveAddonsState(); renderAddons(); if (document.getElementById('shortcuts').classList.contains('active')) renderShortcuts(); }
    }
    function saveAddonsState() { SW.GM_setValue(CONFIG.FAVORITE_ADDONS, currentAddons.map(a => ({ id: a.id, enabled: a.enabled, favorite: a.favorite }))); }
    function restoreAddonsState() { const saved = SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []); currentAddons = ADDONS.map(addon => { const s = saved.find(a => a.id === addon.id); return { ...addon, enabled: s ? s.enabled : false, favorite: s ? s.favorite : false }; }); }
    function loadAddonShortcuts() { addonShortcuts = SW.GM_getValue(CONFIG.SHORTCUTS_CONFIG, {}); }
    function saveAddonShortcuts() { SW.GM_setValue(CONFIG.SHORTCUTS_CONFIG, addonShortcuts); }
    function saveShortcutsEnabledState() { SW.GM_setValue(CONFIG.SHORTCUTS_ENABLED, shortcutsEnabled); }
    function loadShortcutsEnabledState() { shortcutsEnabled = SW.GM_getValue(CONFIG.SHORTCUTS_ENABLED, {}); saveShortcutsEnabledState(); }
    function setAddonShortcut(id) {
        const display = document.getElementById(`shortcut-display-${id}`);
        if (!display) return;
        display.textContent = 'Wciśnij kombinację...';
        let keys = [], isSetting = true;
        const keyDown = (e) => { if (!isSetting) return; e.preventDefault(); const parts = []; if (e.ctrlKey) parts.push('Ctrl'); if (e.shiftKey) parts.push('Shift'); if (e.altKey) parts.push('Alt'); const main = e.key.toUpperCase(); if (!['CONTROL','SHIFT','ALT','META'].includes(main)) parts.push(main); display.textContent = parts.join('+'); keys = parts; };
        const keyUp = (e) => { if (!isSetting) return; if (keys.length >= 2) { isSetting = false; document.removeEventListener('keydown', keyDown); document.removeEventListener('keyup', keyUp); const shortcut = keys.join('+'); addonShortcuts[id] = shortcut; saveAddonShortcuts(); shortcutsEnabled[id] = false; saveShortcutsEnabledState(); display.textContent = shortcut; display.style.color = '#00ff00'; setTimeout(() => display.style.color = '#ffcc00', 2000); } };
        const esc = (e) => { if (e.key === 'Escape') { isSetting = false; document.removeEventListener('keydown', keyDown); document.removeEventListener('keyup', keyUp); document.removeEventListener('keydown', esc); display.textContent = addonShortcuts[id] || 'Brak skrótu'; } };
        document.addEventListener('keydown', keyDown);
        document.addEventListener('keyup', keyUp);
        document.addEventListener('keydown', esc);
        setTimeout(() => { if (isSetting) { isSetting = false; document.removeEventListener('keydown', keyDown); document.removeEventListener('keyup', keyUp); document.removeEventListener('keydown', esc); display.textContent = addonShortcuts[id] || 'Brak skrótu'; } }, 10000);
    }
    function clearAddonShortcut(id) { delete addonShortcuts[id]; delete shortcutsEnabled[id]; saveAddonShortcuts(); saveShortcutsEnabledState(); const d = document.getElementById(`shortcut-display-${id}`); if (d) d.textContent = 'Brak skrótu'; }
    function toggleShortcutEnabled(id, enabled) { shortcutsEnabled[id] = enabled; saveShortcutsEnabledState(); }
    function exportSettings() {
        try {
            const settings = { v: '4.7.4', t: Date.now(), a: SW.GM_getValue(CONFIG.FAVORITE_ADDONS, []), s: SW.GM_getValue(CONFIG.SHORTCUTS_CONFIG, {}), se: SW.GM_getValue(CONFIG.SHORTCUTS_ENABLED, {}), p: SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A'), f: SW.GM_getValue(CONFIG.FONT_SIZE, 13), o: SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90), w: SW.GM_getValue(CONFIG.PANEL_WIDTH, 500), h: SW.GM_getValue(CONFIG.PANEL_HEIGHT, 500) };
            const json = JSON.stringify(settings);
            const base64 = btoa(unescape(encodeURIComponent(json)));
            let obf = base64.split('').reverse().join('').replace(/=/g,'_').replace(/\+/g,'-').replace(/\//g,'.');
            const chk = obf.length.toString(36);
            obf = chk + ':' + obf;
            const ta = document.getElementById('settingsTextarea');
            if (ta) { ta.value = obf; ta.select(); document.execCommand('copy'); showLicenseMessage('✅ Ustawienia wyeksportowane i skopiowane', 'success'); }
        } catch(e) { showLicenseMessage('❌ Błąd eksportu', 'error'); }
    }
    function importSettings() {
        const ta = document.getElementById('settingsTextarea');
        if (!ta || !ta.value.trim()) { showLicenseMessage('❌ Brak danych', 'error'); return; }
        try {
            let obf = ta.value.trim();
            const parts = obf.split(':');
            if (parts.length !== 2) throw new Error('Zły format');
            const chk = parts[0];
            let data = parts[1];
            data = data.replace(/_/g,'=').replace(/-/g,'+').replace(/\./g,'/').split('').reverse().join('');
            if (parseInt(chk,36) !== data.length) throw new Error('Checksum error');
            const decoded = decodeURIComponent(escape(atob(data)));
            const settings = JSON.parse(decoded);
            if (settings.a) SW.GM_setValue(CONFIG.FAVORITE_ADDONS, settings.a);
            if (settings.s) SW.GM_setValue(CONFIG.SHORTCUTS_CONFIG, settings.s);
            if (settings.se) SW.GM_setValue(CONFIG.SHORTCUTS_ENABLED, settings.se);
            if (settings.p) SW.GM_setValue(CONFIG.CUSTOM_SHORTCUT, settings.p);
            if (settings.f) SW.GM_setValue(CONFIG.FONT_SIZE, settings.f);
            if (settings.o) SW.GM_setValue(CONFIG.BACKGROUND_OPACITY, settings.o);
            if (settings.w) SW.GM_setValue(CONFIG.PANEL_WIDTH, settings.w);
            if (settings.h) SW.GM_setValue(CONFIG.PANEL_HEIGHT, settings.h);
            showLicenseMessage('✅ Import OK, odświeżanie...', 'success');
            setTimeout(() => location.reload(), 2000);
        } catch(e) { showLicenseMessage('❌ Nieprawidłowy import', 'error'); }
    }
    function loadSettings() {
        const savedFont = SW.GM_getValue(CONFIG.FONT_SIZE, 13);
        applyFontSize(savedFont, true);
        const savedOp = SW.GM_getValue(CONFIG.BACKGROUND_OPACITY, 90);
        applyOpacity(savedOp, true);
        const savedShort = SW.GM_getValue(CONFIG.CUSTOM_SHORTCUT, 'Ctrl+A');
        panelShortcut = savedShort;
        const inp = document.getElementById('panelShortcutInput');
        if (inp) inp.value = panelShortcut;
        const opSlider = document.getElementById('opacitySlider');
        if (opSlider) opSlider.value = savedOp;
    }
    function loadSavedState() {
        const toggle = document.getElementById('swPanelToggle');
        const tPos = SW.GM_getValue(CONFIG.TOGGLE_BTN_POSITION);
        if (toggle && tPos) { toggle.style.left = tPos.left; toggle.style.top = tPos.top; }
        const panel = document.getElementById('swAddonsPanel');
        const pPos = SW.GM_getValue(CONFIG.PANEL_POSITION);
        if (panel && pPos) { panel.style.left = pPos.left; panel.style.top = pPos.top; }
        const visible = SW.GM_getValue(CONFIG.PANEL_VISIBLE, false);
        if (panel) panel.style.display = visible ? 'block' : 'none';
    }
    function resetAllSettings() {
        Object.keys(CONFIG).forEach(k => SW.GM_deleteValue(CONFIG[k]));
        currentAddons = ADDONS.map(a => ({ ...a, enabled: false, favorite: false, locked: a.type === 'premium', hidden: a.type === 'premium' }));
        userAccountId = null; isLicenseVerified = false; licenseData = null; licenseExpiry = null; isAdmin = false; addonShortcuts = {}; shortcutsEnabled = {}; panelShortcut = 'Ctrl+A'; currentFontSize = 13; currentFilter = 'all';
        const msg = document.getElementById('swResetMessage');
        if (msg) { msg.textContent = '✅ Reset, odświeżanie...'; msg.style.display = 'block'; setTimeout(() => location.reload(), 2000); }
    }

    // ========== LICENCJA ==========
    async function initAccountAndLicense() {
        await new Promise(r => setTimeout(r, 800));
        const acc = await getAccountId();
        if (acc) { userAccountId = acc; SW.GM_setValue(CONFIG.ACCOUNT_ID, acc); isAdmin = (acc.toString() === '7411461'); SW.GM_setValue(CONFIG.ADMIN_ACCESS, isAdmin); updateAccountDisplay(acc); await checkAndUpdateLicense(acc); }
        else updateAccountDisplay('Nie znaleziono');
    }
    function getCookie(name) { const c = document.cookie.split('; ').find(r => r.startsWith(name+'=')); return c ? c.split('=')[1] : null; }
    async function getAccountId() { const c = getCookie('user_id') || getCookie('mchar_id'); if (c) return c; const s = SW.GM_getValue(CONFIG.ACCOUNT_ID); if (s) return s; const t = 'temp_'+Date.now()+'_'+Math.random().toString(36).substr(2,9); SW.GM_setValue(CONFIG.ACCOUNT_ID,t); return t; }
    function checkIfAdmin(id) { return id === '7411461'; }
    async function checkAndUpdateLicense(acc) {
        if (isCheckingLicense) return;
        isCheckingLicense = true;
        try {
            const res = await checkLicenseForAccount(acc);
            if (res.success && (res.hasLicense && !res.expired && !res.used)) {
                isLicenseVerified = true; licenseData = res; licenseExpiry = res.expiry ? new Date(res.expiry) : null;
                SW.GM_setValue(CONFIG.LICENSE_ACTIVE, true); SW.GM_setValue(CONFIG.LICENSE_EXPIRY, licenseExpiry?.toISOString()); SW.GM_setValue(CONFIG.LICENSE_DATA, res);
                loadAddonsBasedOnLicense(res.addons || ['all']);
                showLicenseMessage(`✅ Licencja aktywna!`, 'success');
            } else {
                isLicenseVerified = false; licenseData = null; licenseExpiry = null;
                SW.GM_setValue(CONFIG.LICENSE_ACTIVE, false); SW.GM_deleteValue(CONFIG.LICENSE_EXPIRY); SW.GM_deleteValue(CONFIG.LICENSE_DATA);
                loadAddonsBasedOnLicense([]);
                showLicenseMessage('ℹ️ Brak aktywnej licencji.', 'info');
            }
        } catch(e) { console.error(e); loadAddonsBasedOnLicense([]); }
        finally { isCheckingLicense = false; updateLicenseDisplay(); }
    }
    async function checkLicenseForAccount(acc) {
        if (checkIfAdmin(acc)) return { success: true, hasLicense: true, expired: false, used: false, expiry: new Date(Date.now()+365*24*3600000).toISOString(), daysLeft: 365, addons: ['all'], type: 'premium' };
        return { success: true, hasLicense: false, expired: false, used: false, message: 'Brak licencji' };
    }
    function loadAddonsBasedOnLicense(allowed) {
        const premiumOk = isLicenseVerified || isAdmin;
        currentAddons = ADDONS.map(a => {
            const isPremium = a.type === 'premium';
            return { ...a, enabled: false, favorite: false, hidden: isPremium && !premiumOk, locked: isPremium && !premiumOk };
        });
        restoreAddonsState();
        loadAddonShortcuts();
        loadShortcutsEnabledState();
        renderAddons();
    }
    function updateAccountDisplay(id) {
        const el = document.getElementById('swAccountId');
        if (el) {
            el.innerHTML = `${id} <span class="copy-icon" title="Skopiuj ID">📋</span>`;
            const copy = el.querySelector('.copy-icon');
            if (copy) {
                copy.addEventListener('click', () => {
                    navigator.clipboard.writeText(id);
                    showLicenseMessage('✅ Skopiowano ID konta', 'success');
                });
            }
        }
    }
    function updateLicenseDisplay() {
        const status = document.getElementById('swLicenseStatus');
        if (status) {
            status.textContent = isLicenseVerified ? 'Aktywna' : 'Nieaktywna';
            status.className = isLicenseVerified ? 'license-status-valid' : 'license-status-invalid';
        }
        const expirySpan = document.getElementById('swLicenseExpiry');
        if (expirySpan) expirySpan.textContent = licenseExpiry ? licenseExpiry.toLocaleDateString('pl-PL') : '-';
        const daysSpan = document.getElementById('swLicenseDaysLeft');
        if (daysSpan) daysSpan.textContent = licenseData && licenseData.daysLeft !== undefined ? licenseData.daysLeft+' dni' : '-';
    }
    function showLicenseMessage(msg, type) {
        const el = document.getElementById('swLicenseMessage');
        if (el) { el.textContent = msg; el.className = `license-message license-${type}`; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 5000); }
    }

    // ========== INICJALIZACJA ==========
    async function initPanel() {
        await new Promise(r => { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', r); else r(); });
        await new Promise(r => setTimeout(r, 50));
        const toggle = createToggleButton();
        createMainPanel();
        loadSavedState();
        setupToggleDrag(toggle);
        setTimeout(async () => {
            await initAccountAndLicense();
            requestAnimationFrame(() => { renderAddons(); renderShortcuts(); });
            setTimeout(() => {
                initSmoothScroll();
                savePanelSize();
            }, 150);
            setInterval(() => { if (userAccountId) checkAndUpdateLicense(userAccountId); }, 5*60*1000);
        }, 300);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPanel);
    else initPanel();
})();