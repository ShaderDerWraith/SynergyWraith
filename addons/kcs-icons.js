// addons/kcs-icons.js
(function() {
    'use strict';

    console.log("✅ Dodatek KCS Icons załadowany");

    // --- PEŁNA LISTA MONSTERMAPPINGS ---
    const monsterMappings = {
        // ... (zachowaj istniejącą listę monsterMappings) ...
    };

    const CACHE_KEY = 'kcsMonsterIconCache_v0.1';
    const ICON_CLASS_NAME = 'kcs-monster-icon';
    let isEnabled = true;
    let tooltipObserver = null;
    let dynamicItemObserver = null;

    // 🔹 Główne funkcje dodatku
    const kcsIconsAddon = {
        enable: function() {
            if (isEnabled) return;
            isEnabled = true;
            this.start();
            console.log("✅ KCS Icons włączony");
        },

        disable: function() {
            if (!isEnabled) return;
            isEnabled = false;
            this.stop();
            console.log("❌ KCS Icons wyłączony");
        },

        start: function() {
            if (tooltipObserver || dynamicItemObserver) {
                this.stop();
            }

            this.setupObservers();
            this.applyIconsFromCache();
        },

        stop: function() {
            if (tooltipObserver) {
                tooltipObserver.disconnect();
                tooltipObserver = null;
            }

            if (dynamicItemObserver) {
                dynamicItemObserver.disconnect();
                dynamicItemObserver = null;
            }

            // Usuń wszystkie ikony
            document.querySelectorAll(`.${ICON_CLASS_NAME}`).forEach(icon => icon.remove());
        },

        setupObservers: function() {
            // Observer dla tooltipów
            tooltipObserver = new MutationObserver((mutationsList) => {
                if (!isEnabled) return;
                
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE && 
                                (node.classList.contains('tip-wrapper') || node.classList.contains('tooltip'))) {
                                this.processTooltip(node);
                            }
                        });
                    }
                }
            });

            // Observer dla dynamicznie dodawanych itemów
            dynamicItemObserver = new MutationObserver((mutationsList) => {
                if (!isEnabled) return;
                
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        let newItemsFound = false;
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.matches('.item, .inventory-item, .eq-item, [class*="item"]') || 
                                    node.querySelector('.item, .inventory-item, .eq-item, [class*="item"]')) {
                                    newItemsFound = true;
                                }
                            }
                        });
                        if (newItemsFound) {
                            this.applyIconsFromCache();
                        }
                    }
                }
            });

            // Rozpocznij obserwację
            tooltipObserver.observe(document.body, { childList: true, subtree: true });
            dynamicItemObserver.observe(document.body, { childList: true, subtree: true });
        },

        getCache: function() {
            try {
                if (typeof GM_getValue !== 'undefined') {
                    return GM_getValue(CACHE_KEY, {});
                } else {
                    const cached = localStorage.getItem(CACHE_KEY);
                    return cached ? JSON.parse(cached) : {};
                }
            } catch (e) {
                console.error("[KCS Icons] Error reading cache:", e);
                return {};
            }
        },

        saveCache: function(cache) {
            try {
                if (typeof GM_setValue !== 'undefined') {
                    GM_setValue(CACHE_KEY, cache);
                } else {
                    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
                }
            } catch (e) {
                console.error("[KCS Icons] Error saving cache:", e);
            }
        },

        getMapNameFromTooltipText: function(text) {
            if (!text) return null;
            const mapRegex = /Teleportuje gracza na mapę:\s*([\s\S]+?)\s*\(\s*\d+,\s*\d+\s*\)\.?/;
            const match = text.match(mapRegex);
            if (match && match[1]) {
                return match[1].trim().replace(/\n/g, ' ');
            }
            return null;
        },

        addMonsterIcon: function(itemElement, monsterImgUrl) {
            if (!itemElement || !isEnabled) return;

            let existingIcon = itemElement.querySelector(`.${ICON_CLASS_NAME}`);
            if (existingIcon) {
                if (existingIcon.src === monsterImgUrl) {
                    return;
                }
                existingIcon.remove();
            }

            const img = document.createElement('img');
            img.src = monsterImgUrl;
            img.classList.add(ICON_CLASS_NAME);
            img.style.position = 'absolute';
            img.style.bottom = '2px';
            img.style.right = '2px';
            img.style.width = '32px';
            img.style.height = '32px';
            img.style.zIndex = '5';
            img.style.pointerEvents = 'none';
            img.style.borderRadius = '3px';
            img.style.border = '1px solid rgba(0, 0, 0, 0.3)';
            
            itemElement.style.position = 'relative';
            itemElement.appendChild(img);
        },

        processTooltip: function(tooltipNode) {
            if (!isEnabled) return;
            
            const itemDivInTooltip = tooltipNode.querySelector('.item-head .item, .item-container, [class*="item"]');
            if (!itemDivInTooltip) return;

            const itemNameElement = tooltipNode.querySelector('.item-name, .name, [class*="name"]');
            if (!itemNameElement) return;

            const itemName = itemNameElement.textContent;
            if (!(itemName.includes("Kamień Czerwonego Smoka") || 
                  itemName.includes("Zwój Czerwonego Smoka") || 
                  itemName.includes("Ulotny zwój czerwonego smoka"))) {
                return;
            }

            let itemId = null;
            for (const cls of itemDivInTooltip.classList) {
                if (cls.startsWith('item-id-')) {
                    itemId = cls.substring('item-id-'.length);
                    break;
                }
            }
            if (!itemId) return;

            const mapTextElement = tooltipNode.querySelector('.item-tip-section.s-7, .item-description, .item-properties');
            if (!mapTextElement) return;

            const rawMapText = mapTextElement.textContent;
            const parsedMapName = this.getMapNameFromTooltipText(rawMapText);

            if (parsedMapName && monsterMappings[parsedMapName]) {
                const monsterImgUrl = monsterMappings[parsedMapName];
                const inventoryItem = document.querySelector(`.item.item-id-${itemId}, [class*="item-id-${itemId}"]`);
                if (inventoryItem) {
                    this.addMonsterIcon(inventoryItem, monsterImgUrl);
                    const cache = this.getCache();
                    if (cache[itemId] !== monsterImgUrl) {
                        cache[itemId] = monsterImgUrl;
                        this.saveCache(cache);
                    }
                }
            }
        },

        applyIconsFromCache: function() {
            if (!isEnabled) return;
            
            const cache = this.getCache();
            if (Object.keys(cache).length === 0) return;

            const itemSelectors = [
                '.item', '.inventory-item', '.eq-item',
                '[class*="item"]', '[data-type="item"]'
            ];

            let allItems = [];
            itemSelectors.forEach(selector => {
                const items = document.querySelectorAll(selector);
                if (items.length > 0) {
                    allItems = [...allItems, ...items];
                }
            });

            allItems.forEach(itemElement => {
                let itemId = null;
                for (const cls of itemElement.classList) {
                    if (cls.startsWith('item-id-')) {
                        itemId = cls.substring('item-id-'.length);
                        break;
                    }
                }
                if (itemId && cache[itemId]) {
                    this.addMonsterIcon(itemElement, cache[itemId]);
                }
            });
        },

        init: function() {
            console.log("🎮 Sprawdzam czy gra jest załadowana...");

            // Sprawdź czy gra jest gotowa
            const gameSelectors = [
                '.items', '.inventory', '.eq', '.item-list',
                '#eq', '#items', '#inventory',
                '[class*="item"]', '[class*="eq"]'
            ];

            for (const selector of gameSelectors) {
                if (document.querySelector(selector)) {
                    console.log("🎯 Gra załadowana! Inicjalizacja dodatku...");
                    this.start();
                    return true;
                }
            }
            
            console.log("⏳ Gra nie jest jeszcze gotowa, czekam...");
            return false;
        }
    };

    // 🔹 Udostępnij dodatek globalnie
    window.kcsIconsAddon = kcsIconsAddon;

    // 🔹 Sprawdź zapisany stan i zainicjuj
    let savedState = true;
    try {
        if (typeof GM_getValue !== 'undefined') {
            savedState = GM_getValue('kcs_icons_enabled', true);
        } else if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('kcs_icons_enabled');
            savedState = saved !== null ? JSON.parse(saved) : true;
        }
    } catch (e) {
        console.error("Błąd odczytu stanu dodatku:", e);
    }

    isEnabled = savedState;

    // 🔹 CZEKAJ NA PEŁNE ZAŁADOWANIE STRONY
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (isEnabled) {
                    kcsIconsAddon.init();
                }
            }, 2000);
        });
    } else {
        setTimeout(() => {
            if (isEnabled) {
                kcsIconsAddon.init();
            }
        }, 1000);
    }

})();
