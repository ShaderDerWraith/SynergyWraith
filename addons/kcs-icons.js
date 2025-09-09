// addons/kcs-icons.js
(function() {
    'use strict';

    console.log("✅ Dodatek KCS Icons załadowany");

    // --- PEŁNA LISTA MONSTERMAPPINGS ---
    const monsterMappings = {
        // Elity 2
        "Kryjówka Dzikich Kotów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/st-puma.gif",
        "Las Tropicieli": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/kotolak_lowca.gif",
        "Przeklęta Strażnica - podziemia p.2 s.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/demonszef.gif",
        "Przeklęta Strażnica - podziemia p.2 s.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/demonszef.gif",
        "Schowek na łupy": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zbir-e2-zorg.gif",
        "Podmokła Dolina": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/gobbloker.gif",
        "Jaskinia Pogardy": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gobsamurai.gif",
        "Pieczara Kwiku - sala 2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dzik.gif",
        "Stary Kupiecki Trakt": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zbir-szczet.gif",
        "Skalne Turnie": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tollok_shimger.gif",
        "Stare Wyrobisko p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/razuglag.gif",
        "Mokra Grota p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/glut_agar.gif",
        "Lazurytowa Grota p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/kobold07.gif",
        "Kopalnia Kapiącego Miodu p.2 - sala Owadziej Matki": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zadlak-e2-owadzia-matka.gif",
        "Wioska Gnolli": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gnoll11.gif",
        "Jaskinia Gnollich Szamanów - Komnata Kozuga": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gnoll12.gif",
        "Kamienna Jaskinia - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/kam_olbrzym-b.gif",
        "Głębokie Skałki p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tollok_jask_atamatu.gif",
        "Krypty Dusz Śniegu p.2 - komnata Lisza": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/lisz_demilisze.gif",
        "Krypty Dusz Śniegu p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/lisz_demilisze.gif",
        "Erem Czarnego Słońca p.5": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/nieu_mnich_grabarz.gif",
        "Świątynia Andarum - zbrojownia": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/magaz_zbrojmistrz.gif",
        "Firnowa Grota p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wlochacze_wielka_stopa.gif",
        "Wylęgarnia Choukkerów p.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dlawiciel5.gif",
        "Wylęgarnia Choukkerów p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dlawiciel5.gif",
        "Kopalnia Margorii": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/nadzorczyni_krasnoludow.gif",
        "Margoria": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krasnolud_boss.gif",
        "Grota Samotnych Dusz p.6": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/ugrape2.gif",
        "Zapomniany Święty Gaj p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/lesne_widmo.gif",
        "Kamienna Strażnica - wsch. baszta zasypany tunel": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goplana.gif",
        "Kamienna Strażnica - tunel ➝ Sanktuarium": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goplana.gif",
        "Zagrzybiałe Ścieżki p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gnom_figlid.gif",
        "Dolina Centaurów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/cent-zyfryd.gif",
        "Las Dziwów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/kambion.gif",
        "Podziemia Zniszczonej Wieży p.5": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/moloch-jertek.gif",
        "Zabłocona Jama p.2 - Sala Duszącej Stęchlizny": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/blotniaki_milosnik_lowcow.gif",
        "Zabłocona Jama p.2 - Sala Błotnistych Odmętów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/blotniaki_milosnik_rycerzy.gif",
        "Zabłocona Jama p.2 - Sala Magicznego Błota": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/blotniaki_milosnik_magii.gif",
        "Skalne Cmentarzysko p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/alghul-czaszka-1a.gif",
        "Piramida Pustynnego Władcy p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/mumia-ozirus.gif",
        "Jama Morskiej Macki p.1 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/osmiornica-1b.gif",
        "Wyspa Rem": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krab_big3.gif",
        "Opuszczony statek - pokład pod rufą": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krab_big3.gif",
        "Twierdza Rogogłowych - Sala Byka": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/ingotia_minotaur-7a.gif",
        "Piaskowa Pułapka - Grota Piaskowej Śmierci": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/stworzyciel.gif",
        "Wulkan Politraki p.1 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/magradit_ifryt.gif",
        "Ukryta Grota Morskich Diabłów - skarbiec": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/pirat5b.gif",
        "Ukryta Grota Morskich Diabłów - siedziba": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/pirat-2b.gif",
        "Ukryta Grota Morskich Diabłów - magazyn": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/pirat01.gif",
        "Piaszczysta Grota p.1 - sala 2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/piaskowy_potwor-6a.gif",
        "Kopalnia Żółtego Kruszcu p.2 - sala 1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/grubber-ochlaj.gif",
        "Kuźnia Worundriela p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/worundriel02.gif",
        "Kuźnia Worundriela - Komnata Żaru": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/worundriel02.gif",
        "Chata wójta Fistuły": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goral-e2-wojt-fistula.gif",
        "Babi Wzgórek": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goral-e2-tesciowa-rumcajsa.gif",
        "Cenotaf Berserkerów p.1 - sala 2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/amuno.gif",
        "Mała Twierdza - sala główna": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/fodug_zolash.gif",
        "Lokum Złych Goblinów - warsztat": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goons_asterus-1a.gif",
        "Labolatorium Adariel": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tri_adariel.gif",
        "Grota Orczych Szamanów p.3 s.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/r_orc_sheba.gif",
        "Grota Orczej Hordy p.2 s.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/orkczd.gif",
        "Nawiedzone Kazamaty p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/duch_wladcy_kl.gif",
        "Sala Rady Orków": "https://micc.garmory-cdn.cloud/obrazki/npc/e1/praork_woj_1a.gif",
        "Kryształowa Grota - Sala Smutku": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/krolowa-sniegu.gif",
        "Sala Królewska": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/prakrolowa.gif",
        "Drzewo Dusz p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/chryzoprenia-1a.gif",
        "Ogrza Kawerna p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/ogr_stalowy_pazur-1a.gif",
        "Skarpa Trzech Słów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zmutowana-roslinka.gif",
        "Starodrzew Przedwiecznych p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/cerasus-1a.gif",
        "Zalana Grota": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/forbol03.gif",
        "Krypty Bezsennych p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/thuz-patr1.gif",
        "Przysiółek Valmirów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/draki-breheret-1b.gif",
        "Szlamowe Kanały p.2 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/mysiur_myswiorowy_krol-1a.gif",
        "Przerażające Sypialnie": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-sadolia.gif",
        "Sale Rozdzierania": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-bergermona.gif",
        "Sala Skaryfikacji Grzeszników": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-sataniel.gif",
        "Tajemnicza Siedziba": "https://micc.garmory-cdn.cloud/obrazki/npc/hum/sekta-wdowiec1b.gif",
        "Sala Tysiąca Świec": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-zufulus.gif",
        "Ołtarz Pajęczej Bogini": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/marlloth.gif",
        "Grota Błotnej Magii": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok5.gif",
        "Grota porośniętych Stalagmitów - sala główna ": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok5.gif",
        "Arachnitopia p5": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/regina-e2.gif",
        "Jaszczurze Korytarze p.4 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok_roz.gif",
        "Jaszczurze Korytarze p.3 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok_roz.gif",
        "Krzaczasta grota - korytarz": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/silvanasus.gif",
        "Krzaczasta grota - sala główna": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/silvanasus.gif",
        "Źródło Zakorzenionego Ludu": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/dendroculus.gif",
        "Złota Góra p.2 s.1": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/bolita.gif",
        "Niecka Xiuh Atl": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maho-cuaitl.gif",
        "Potępione Zamczysko - sala ofiarna": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/tri2_witch_e2.gif",
        "Zachodni Mictlan p.8": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/mahoplowca.gif",
        "Wschodni Mictlan p.8": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/quetzalcoatl.gif",
        "Katakumby Gwałtownej Śmierci": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/chopesh2.gif",
        "Grobowiec Seta": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/szkiel_set.gif",
        "Świątynia Hebrehotha - sala czciciela": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/bar_smokoszef.gif",
        "Świątynia Hebrehotha - sala ofiary": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/bar_smoczyca.gif",
        "Urwisko Vapora": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/terrorzaur_pus.gif",
        "Jaskinia Smoczej Paszczy p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/terrorzaur_pus.gif",
        "Drzewo życia p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/nymphemonia.gif",
        "Sala Mroźnych Szeptów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wl-mrozu01.gif",
        "Sala Mroźnych Strzał": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wl-mrozu02.gif",
        "Sala Lodowej Magii": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/wl-mrozu03.gif",

        // Tytani
        "Mroczna Pieczara p.0": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/dziewicza_orlica.gif",
        "Grota Caerbannoga": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/zabojczy_krolik.gif",
        "Bandyckie Chowisko": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/renegat_baulus.gif",
        "Wulkan Politraki - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/archdemon.gif",
        "Lokum Złych Goblinów p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/versus-zoons.gif",
        "Jaskinia Ulotnych Wspomnień": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/lowcz-wspo-driady.gif",
        "Więzienie Demonów": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/przyz_demon_sekta.gif",
        "Grota Jaszczurzych Koszmarów p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/maddok-tytan.gif",
        "Teotihuacan - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/tezcatlipoca.gif",
        "Sekretne Przejście Kapłanów": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/hebrehoth_smokoludzie.gif",
        "Przejście Władców Mrozu": "https://micc.garmory-cdn.cloud/obrazki/npc/tyt/ice_king.gif",

        // Kolosi
        "Pradawne Wzgórze Przodków": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/mamlambo_final2.gif",
        "Pieczara Szaleńców - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/bazyliszek.gif",
        "Zmarzlina Amaimona Soplorękiego - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/soploreki.gif",
        "Głębia Przeklętych Fal - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-wodnik.gif",
        "Przepaść Zadumy - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-wazka.gif",
        "Czeluść Chimerycznej Natury - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/hydrokora.gif",
        "Grobowiec Przeklętego Krakania - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolkrucz.gif",
        "Grota Przebiegłego Tkacza - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-pajak.gif",
        "Grota Martwodrzewów - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-dendro.gif",
        "Katakumby Antycznego Gniewu - przedsionek": "https://micc.garmory-cdn.cloud/obrazki/npc/kol/kolos-drakolisz.gif"
    };

     const CACHE_KEY = 'kcsMonsterIconCache_v0.1';
    const ICON_CLASS_NAME = 'kcs-monster-icon';

    // 🔹 OZNACZ ŻE DODATEK SIĘ ZAŁADOWAŁ
    window.kcs_icons_loaded = true;
    console.log("🎯 Dodatek KCS Icons zainicjalizowany, czekam na załadowanie gry...");

    function getCache() {
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
    }

    function saveCache(cache) {
        try {
            if (typeof GM_setValue !== 'undefined') {
                GM_setValue(CACHE_KEY, cache);
            } else {
                localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            }
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
    }

    // 🔹 GŁÓWNA FUNKCJA INICJALIZUJĄCA - CZEKA NA ZAŁADOWANIE GRY
    function initKCSAddon() {
        console.log("🎮 Sprawdzam czy gra jest załadowana...");

        // Funkcja sprawdzająca czy gra jest gotowa
        function checkGameReady() {
            // Sprawdź różne selektory używane przez grę Margonem
            const gameSelectors = [
                '.items', '.inventory', '.eq', '.item-list',
                '#eq', '#items', '#inventory',
                '[class*="item"]', '[class*="eq"]'
            ];

            for (const selector of gameSelectors) {
                if (document.querySelector(selector)) {
                    console.log("🎯 Gra załadowana! Inicjalizacja dodatku...");
                    return true;
                }
            }
            return false;
        }

        // Spróbuj znaleźć elementy gry
        if (checkGameReady()) {
            startKCSAddon();
        } else {
            // Czekaj na załadowanie gry
            console.log("⏳ Gra nie jest jeszcze gotowa, czekam...");
            let attempts = 0;
            const maxAttempts = 20; // 10 sekund

            const waitInterval = setInterval(() => {
                attempts++;
                if (checkGameReady()) {
                    clearInterval(waitInterval);
                    startKCSAddon();
                } else if (attempts >= maxAttempts) {
                    clearInterval(waitInterval);
                    console.log("❌ Gra nie załadowała się w wymaganym czasie");
                }
            }, 500);
        }
    }

    function startKCSAddon() {
        console.log("🚀 Rozpoczynam działanie dodatku KCS Icons");

        const tooltipObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && 
                            (node.classList.contains('tip-wrapper') || node.classList.contains('tooltip'))) {
                            processTooltip(node);
                        }
                    });
                }
            }
        });

        function processTooltip(tooltipNode) {
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
            const parsedMapName = getMapNameFromTooltipText(rawMapText);

            if (parsedMapName && monsterMappings[parsedMapName]) {
                const monsterImgUrl = monsterMappings[parsedMapName];
                const inventoryItem = document.querySelector(`.item.item-id-${itemId}, [class*="item-id-${itemId}"]`);
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

        function applyIconsFromCache() {
            const cache = getCache();
            if (Object.keys(cache).length === 0) return;

            // Szukaj itemów używając różnych selektorów
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
                    addMonsterIcon(itemElement, cache[itemId]);
                }
            });
        }

        const dynamicItemObserver = new MutationObserver((mutationsList) => {
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
                        applyIconsFromCache();
                    }
                }
            }
        });

        // Start observers
        tooltipObserver.observe(document.body, { childList: true, subtree: true });
        dynamicItemObserver.observe(document.body, { childList: true, subtree: true });

        // Initial apply
        applyIconsFromCache();

        console.log("✅ Dodatek KCS Icons został pomyślnie uruchomiony");
    }

    // 🔹 CZEKAJ NA PEŁNE ZAŁADOWANIE STRONY
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initKCSAddon, 2000); // Dodatkowe 2 sekundy opóźnienia
        });
    } else {
        setTimeout(initKCSAddon, 1000); // 1 sekunda opóźnienia jeśli DOM już załadowany
    }

})();
