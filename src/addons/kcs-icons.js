// ==UserScript==
// @name         Synergy Wraith - KCS Icons
// @namespace    http://synergywraith.com/
// @version      1.2
// @description  Premium icons for Tribal Wars (requires Synergy Wraith license)
// @author       SynergyWraith
// @match        https://tempest.margonem.pl/
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const ADDON_ID = 'kcs-icons';

    // ========== TWOJA PEŁNA LISTA MONSTERMAPPINGS ==========
    const monsterMappings = {
        // Elity 2
        "Kryjówka Dzikich Kotów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/st-puma.gif", //mushita
        "Las Tropicieli": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/kotolak_lowca.gif", //kotolak
        "Przeklęta Strażnica - podziemia p.2 s.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/demonszef.gif", //shae phu 1
        "Przeklęta Strażnica - podziemia p.2 s.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/demonszef.gif", //shae phu 2
        "Schowek na łupy": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zbir-e2-zorg.gif", //zorg
        "Podmokła Dolina": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/gobbloker.gif", //wladca rzek ?? PROBLEM CO Z NIZSZYM I TYM
        "Jaskinia Pogardy": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gobsamurai.gif", //gobbos ?? NIE DA SIE TAM USTAWIC WIEC TO CO WYZEJ I CHUJ
        "Pieczara Kwiku - sala 2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dzik.gif", //dzik
        "Stary Kupiecki Trakt": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zbir-szczet.gif", //alias
        "Skalne Turnie": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tollok_shimger.gif", //tollok maly
        "Stare Wyrobisko p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/razuglag.gif", //razuglag
        "Mokra Grota p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/glut_agar.gif", //agar
        "Lazurytowa Grota p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/kobold07.gif", //kobold
        "Kopalnia Kapiącego Miodu p.2 - sala Owadziej Matki": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zadlak-e2-owadzia-matka.gif", //pszczola
        "Wioska Gnolli": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gnoll11.gif", //vari kruger
        "Jaskinia Gnollich Szamanów - Komnata Kozuga": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gnoll12.gif", //koza
        "Kamienna Jaskinia - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/kam_olbrzym-b.gif", //jotun
        "Głębokie Skałki p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tollok_jask_atamatu.gif", //atamatu
        "Krypty Dusz Śniegu p.2 - komnata Lisza": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/lisz_demilisze.gif", //lisz
        "Erem Czarnego Słońca p.5": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/nieu_mnich_grabarz.gif", //grab
        "Świątynia Andarum - zbrojownia": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/magaz_zbrojmistrz.gif", //zbroj
        "Firnowa Grota p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wlochacze_wielka_stopa.gif", //stopa
        "Wylęgarnia Choukkerów p.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dlawiciel5.gif", //chouker 1
        "Wylęgarnia Choukkerów p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dlawiciel5.gif", //chouker 2
        "Kopalnia Margorii": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/nadzorczyni_krasnoludow.gif", //nadzorka
        "Margoria": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krasnolud_boss.gif", //morthen
        "Grota Samotnych Dusz p.6": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/ugrape2.gif", //ohyd
        "Zapomniany Święty Gaj p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/lesne_widmo.gif", //widmo
        "Kamienna Strażnica - wsch. baszta zasypany tunel": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goplana.gif", //gopa
        "Zagrzybiałe Ścieżki p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gnom_figlid.gif", //gnom
        "Dolina Centaurów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/cent-zyfryd.gif", //cent
        "Las Dziwów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/kambion.gif", //kambion
        "Podziemia Zniszczonej Wieży p.5": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/moloch-jertek.gif", //jertek
        "Zabłocona Jama p.2 - Sala Duszącej Stęchlizny": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/blotniaki_milosnik_lowcow.gif", //milek lowcow
        "Zabłocona Jama p.2 - Sala Błotnistych Odmętów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/blotniaki_milosnik_rycerzy.gif", //milek rycy
        "Zabłocona Jama p.2 - Sala Magicznego Błota": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/blotniaki_milosnik_magii.gif", //milek magii
        "Skalne Cmentarzysko p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/alghul-czaszka-1a.gif", //lowca czaszek
        "Piramida Pustynnego Władcy p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/mumia-ozirus.gif", //ozirus
        "Jama Morskiej Macki p.1 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/osmiornica-1b.gif", //morski
        "Wyspa Rem": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krab_big3.gif", //krab 1
        "Opuszczony statek - pokład pod rufą": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krab_big3.gif", //krab 2
        "Twierdza Rogogłowych - Sala Byka": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/ingotia_minotaur-7a.gif", //byk
        "Piaskowa Pułapka - Grota Piaskowej Śmierci": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/stworzyciel.gif", //stworek
        "Wulkan Politraki p.1 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/magradit_ifryt.gif", //ifryt
        "Ukryta Grota Morskich Diabłów - skarbiec": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/pirat5b.gif", //henry
        "Ukryta Grota Morskich Diabłów - siedziba": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/pirat-2b.gif", //helga
        "Ukryta Grota Morskich Diabłów - magazyn": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/pirat01.gif", //jack
        "Piaszczysta Grota p.1 - sala 2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/piaskowy_potwor-6a.gif", //eol
        "Kopalnia Żółtego Kruszcu p.2 - sala 1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/grubber-ochlaj.gif", //gruber
        "Kuźnia Worundriela p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/worundriel02.gif", //worek
        "Chata wójta Fistuły": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goral-e2-wojt-fistula.gif", //wojt
        "Babi Wzgórek": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goral-e2-tesciowa-rumcajsa.gif", //tesciowa
        "Cenotaf Berserkerów p.1 - sala 2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/amuno.gif", //amuno
        "Mała Twierdza - sala główna": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/fodug_zolash.gif", //fodug
        "Lokum Złych Goblinów - warsztat": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goons_asterus-1a.gif", //goons
        "Labolatorium Adariel": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tri_adariel.gif", //adariel
        "Grota Orczych Szamanów p.3 s.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/r_orc_sheba.gif", //sheba
        "Grota Orczej Hordy p.2 s.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/orkczd.gif", //burek
        "Nawiedzone Kazamaty p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/duch_wladcy_kl.gif", //dwk
        "Sala Rady Orków": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/praork_woj_1a.gif", //wez tu kurwa ustaw 3 e2 na 1 mapie XD????
        "Kryształowa Grota - Sala Smutku": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krolowa-sniegu.gif", //sniezka
        "Sala Królewska": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/prakrolowa.gif", //imagine tu kcsa ustawiac ale ok gruba
        "Drzewo Dusz p.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/chryzoprenia.gif", //chryzia
        "Grota Arbor s.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/drzewoe2.gif", //cera
        "Zalana Grota": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/forbol03.gif", //czemp
        "Krypty Bezsennych p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/thuz-patr1.gif", //torunia
        "Przysiółek Valmirów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/draki-breheret-1b.gif", //breh
        "Szlamowe kanały": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krolszczur.gif", //szczur
        "Przerażające Sypialnie": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-sadolia.gif", //sado
        "Sale Rozdzierania": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-bergermona.gif", //berga
        "Sala Spowiedzi Konających": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-sataniel.gif", //sat
        "Tajemnicza Siedziba": "https://micc.garmory-cdn.cloud/obrazki/npc/hum/sekta-wdowiec1b.gif", //problem znow tak samo jak z sk xDD???
        "Sala Tysiąca Świec": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-zufulus.gif", //zuf
        "Ołtarz Pajęczej Bogini": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/marlloth.gif", //marloth
        "Grota Błotnej Magii": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok5.gif", //mocny
        "Arachnitopia p5": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/regina-e2.gif", //pajak
        "Jaszczurze Korytarze p.4 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok_roz.gif", //panc
        "Krzaczasta grota - korytarz": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/silvanasus.gif", //szczurokrzak
        "Źródło Zakorzenionego Ludu": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dendroculus.gif", //dendro
        "Złota Góra p.2 s.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/bolita.gif", //bolita
        "Niecka Xiuh Atl": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maho-cuaitl.gif", //ciut
        "Potępione Zamczysko - sala ofiarna": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tri2_witch_e2.gif", //sybilka
        "Zachodni Mictlan p.8": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/mahoplowca.gif", //yaotl
        "Wschodni Mictlan p.8": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/quetzalcoatl.gif", //p9
        "Katakumby Gwałtownej Śmierci": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/chopesh2.gif", //chopesz
        "Grobowiec Seta": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/szkiel_set.gif", //set
        "Świątynia Hebrehotha - sala czciciela": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/bar_smokoszef.gif", //chaged
        "Świątynia Hebrehotha - sala ofiary": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/bar_smoczyca.gif", //vaera
        "Urwisko Vapora": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/terrorzaur_pus.gif", //dino 1
        "Jaskinia Smoczej Paszczy p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/terrorzaur_pus.gif", //dino 2
        "Drzewo życia p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/nymphemonia.gif", //nymfa
        "Sala Mroźnych Szeptów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wl-mrozu01.gif", //zorin
        "Sala Mroźnych Strzał": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wl-mrozu02.gif", //furion
        "Sala Lodowej Magii": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wl-mrozu03.gif", //art

        // Tytani
        "Mroczna Pieczara p.0": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/dziewicza_orlica.gif", //orlica
        "Grota Caerbannoga": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/zabojczy_krolik.gif", //kic
        "Bandyckie Chowisko": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/renegat_baulus.gif", //rene
        "Wulkan Politraki - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/archdemon.gif", //arcy
        "Lokum Złych Goblinów p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/versus-zoons.gif", //zoons
        "Jaskinia Ulotnych Wspomnień": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/lowcz-wspo-driady.gif", //lowka
        "Więzienie Demonów": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/przyz_demon_sekta.gif", //przyzy
        "Grota Jaszczurzych Koszmarów p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/maddok-tytan.gif", //magua
        "Teotihuacan - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/tezcatlipoca.gif", //teza
        "Sekretne Przejście Kapłanów": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/hebrehoth_smokoludzie.gif", //barbatos
        "Przejście Władców Mrozu": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/ice_king.gif", //tanroth

        // Kolosi
        "Pradawne Wzgórze Przodków": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/mamlambo_final2.gif", //lambo
        "Pieczara Szaleńców - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/bazyliszek.gif", //regulus
        "Zmarzlina Amaimona Soplorękiego - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/soploreki.gif", //sopel
        "Głębia Przeklętych Fal - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-wodnik.gif", //umibozu
        "Przepaść Zadumy - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-wazka.gif", //vashka
        "Czeluść Chimerycznej Natury - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/hydrokora.gif", //hydra
        "Grobowiec Przeklętego Krakania - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolkrucz.gif", //lulek
        "Grota Przebiegłego Tkacza - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-pajak.gif", //arach
        "Grota Martwodrzewów - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-dendro.gif", //reuzen
        "Katakumby Antycznego Gniewu - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-drakolisz.gif", //drako
    };
 	
    // ========================================================

    const CACHE_KEY = 'kcsMonsterIconCache_v0.1';
    const ICON_CLASS_NAME = 'kcs-monster-icon';

    function getCache() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            return cached ? JSON.parse(cached) : {};
        } catch (e) {
            console.error("[KCS Icons] Error reading cache:", e);
            return {};
        }
    }

    function saveCache(cache) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.error("[KCS Icons] Error saving cache:", e);
        }
    }

    function getMapNameFromTooltipText(text) {
        if (!text) return null;
        const mapRegex = /Teleportuje gracza na mapę:\s*([\s\S]+?)\s*\(\s*\d+,\s*\d+\s*\)\.?/;
        const match = text.match(mapRegex);
        if (match && match[1]) {
            return match[1].trim().replace(/\n/g, ' ');
        }
        return null;
    }

    function addMonsterIcon(itemElement, monsterImgUrl) {
        if (!itemElement) return;

        let existingIcon = itemElement.querySelector(`img.${ICON_CLASS_NAME}`);
        if (existingIcon) {
            if (existingIcon.src === monsterImgUrl) {
                itemElement.dataset.monsterIconAdded = 'true';
                return;
            } else {
                existingIcon.remove();
            }
        }

        const currentPosition = window.getComputedStyle(itemElement).position;
        if (currentPosition === 'static') {
            itemElement.style.position = 'relative';
        }

        const img = document.createElement('img');
        img.src = monsterImgUrl;
        img.classList.add(ICON_CLASS_NAME);
        img.style.position = 'absolute';
        img.style.bottom = '0px';
        img.style.right = '0px';
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.zIndex = '10';
        img.style.pointerEvents = 'none';
        img.style.borderRadius = '2px';
        itemElement.appendChild(img);

        const cooldownDiv = itemElement.querySelector('div.cooldown');
        if (cooldownDiv) {
            if (window.getComputedStyle(cooldownDiv).position === 'static') cooldownDiv.style.position = 'relative';
            cooldownDiv.style.zIndex = '11';
        }

        const amountDiv = itemElement.querySelector('div.amount');
        if (amountDiv) {
            if (window.getComputedStyle(amountDiv).position === 'static') amountDiv.style.position = 'relative';
            amountDiv.style.zIndex = '11';
        }

        itemElement.dataset.monsterIconAdded = 'true';
    }

    function applyIconsFromCache() {
        const cache = getCache();
        if (Object.keys(cache).length === 0) return;
        const allItems = document.querySelectorAll('.item[class*="item-id-"]');
        allItems.forEach(itemElement => {
            let itemId = null;
            for (const cls of itemElement.classList) {
                if (cls.startsWith('item-id-')) {
                    itemId = cls.substring('item-id-'.length);
                    break;
                }
            }
            if (itemId && cache[itemId]) {
                addMonsterIcon(itemElement, cache[itemId]);
            }
        });
    }

    let tooltipObserver = null;
    let dynamicItemObserver = null;

    function startAddon() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyIconsFromCache);
        } else {
            applyIconsFromCache();
        }

        tooltipObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('tip-wrapper')) {
                            const tooltipNode = node;
                            const itemDivInTooltip = tooltipNode.querySelector('.item-head .item');
                            if (!itemDivInTooltip) return;
                            const itemNameElement = tooltipNode.querySelector('.item-name');
                            if (!itemNameElement) return;
                            const itemName = itemNameElement.textContent;
                            if (!(itemName.includes("Kamień Czerwonego Smoka") || itemName.includes("Zwój Czerwonego Smoka"))) return;

                            let itemId = null;
                            for (const cls of itemDivInTooltip.classList) {
                                if (cls.startsWith('item-id-')) {
                                    itemId = cls.substring('item-id-'.length);
                                    break;
                                }
                            }
                            if (!itemId) return;

                            const mapTextElement = tooltipNode.querySelector('.item-tip-section.s-7');
                            if (!mapTextElement) return;
                            const rawMapText = mapTextElement.textContent;
                            const parsedMapName = getMapNameFromTooltipText(rawMapText);

                            if (parsedMapName && monsterMappings[parsedMapName]) {
                                const monsterImgUrl = monsterMappings[parsedMapName];
                                const inventoryItem = document.querySelector(`.item.item-id-${itemId}`);
                                if (inventoryItem) {
                                    addMonsterIcon(inventoryItem, monsterImgUrl);
                                    const cache = getCache();
                                    if (cache[itemId] !== monsterImgUrl) {
                                        cache[itemId] = monsterImgUrl;
                                        saveCache(cache);
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });
        tooltipObserver.observe(document.body, { childList: true, subtree: true });

        dynamicItemObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    let potentiallyNewItems = false;
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches('.item[class*="item-id-"]') || node.querySelector('.item[class*="item-id-"]')) {
                                potentiallyNewItems = true;
                            }
                        }
                    });
                    if (potentiallyNewItems) {
                        applyIconsFromCache();
                    }
                }
            }
        });
        dynamicItemObserver.observe(document.body, { childList: true, subtree: true });

        console.log('[KCS Icons] Addon started.');
    }

    function stopAddon() {
        if (tooltipObserver) tooltipObserver.disconnect();
        if (dynamicItemObserver) dynamicItemObserver.disconnect();
        document.querySelectorAll(`img.${ICON_CLASS_NAME}`).forEach(img => img.remove());
        console.log('[KCS Icons] Addon stopped.');
    }

    // ========== INTEGRACJA Z API PANELU SYNERGY ==========
    function waitForAPI(maxAttempts = 50, interval = 200) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const checkAPI = setInterval(() => {
                attempts++;
                if (window.SynergyWraithAPI) {
                    clearInterval(checkAPI);
                    resolve(window.SynergyWraithAPI);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkAPI);
                    reject(new Error('SynergyWraithAPI not found'));
                }
            }, interval);
        });
    }

    async function initAddon() {
        try {
            console.log(`🚀 ${ADDON_ID}: Checking license...`);
            const api = await waitForAPI();
            const license = api.checkLicense(ADDON_ID);

            if (!license.valid) {
                console.error(`❌ ${ADDON_ID}: License required!`);
                showLicenseError();
                return;
            }

            console.log(`✅ ${ADDON_ID}: License valid! Days left: ${license.daysLeft}`);
            const result = api.requireLicense(ADDON_ID, () => {
                startAddon();
                return { success: true, stop: stopAddon };
            });
            if (result && result.success) {
                console.log(`✅ ${ADDON_ID}: Successfully initialized`);
                if (result.stop) window.synergyAddonStop = result.stop;
            }
        } catch (error) {
            console.error(`❌ ${ADDON_ID}: Error:`, error);
        }
    }

    function showLicenseError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(20, 0, 0, 0.95);
            color: #ff6666;
            padding: 30px;
            border-radius: 10px;
            border: 2px solid #ff0000;
            z-index: 999999;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
        `;
        errorDiv.innerHTML = `
            <h3 style="color: #ff0000; margin-bottom: 15px;">⚠️ KCS Icons</h3>
            <p style="margin-bottom: 10px;">This premium addon requires an active Synergy Wraith license!</p>
            <button onclick="document.getElementById('swLicenseModal').style.display='flex'; this.parentElement.remove();" 
                    style="padding: 10px 20px; background: #ff0000; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Activate License
            </button>
        `;
        document.body.appendChild(errorDiv);
    }

    // Start dodatek po 2 sekundach (czas na załadowanie API panelu)
    setTimeout(initAddon, 2000);
})();