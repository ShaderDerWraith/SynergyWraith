// addons/kcs-icons.js
(function() {
    'use strict';

    console.log("✅ Dodatek KCS Icons załadowany");

    // --- PEŁNA LISTA MONSTERMAPPINGS ---
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
        "Krypty Dusz Śniegu p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/lisz_demilisze.gif", //lisz mapa przed(tylko to dziala chyba)
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
        "Kamienna Strażnica - tunel ➝ Sanktuarium": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/goplana.gif", //gopa mapa w srodku(chyba tylko to dziala)
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
        "Kuźnia Worundriela p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/worundriel02.gif", //worek mapa przed
        "Kuźnia Worundriela - Komnata Żaru": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/worundriel02.gif", //worek mapa z e2
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
        "Drzewo Dusz p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/chryzoprenia-1a.gif", //drzewa
        "Ogrza Kawerna p.4": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/ogr_stalowy_pazur-1a.gif", //ogr
        "Skarpa Trzech Słów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/zmutowana-roslinka.gif", // pieknotka
        "Starodrzew Przedwiecznych p.2": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/cerasus-1a.gif", //cera
        "Zalana Grota": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/forbol03.gif", //czemp
        "Krypty Bezsennych p.3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/thuz-patr1.gif", //torunia
        "Przysiółek Valmirów": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/draki-breheret-1b.gif", //breh
        "Szlamowe Kanały p.2 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/mysiur_myswiorowy_krol-1a.gif", //szczur
        "Przerażające Sypialnie": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-sadolia.gif", //sado
        "Sale Rozdzierania": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-bergermona.gif", //berga
        "Sala Skaryfikacji Grzeszników": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-sataniel.gif", //sat
        "Tajemnicza Siedziba": "https://micc.garmory-cdn.cloud/obrazki/npc/hum/sekta-wdowiec1b.gif", //problem znow tak samo jak z sk xDD???
        "Sala Tysiąca Świec": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/sekta-zufulus.gif", //zuf
        "Ołtarz Pajęczej Bogini": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/marlloth.gif", //marloth
        "Grota Błotnej Magii": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok5.gif", //mocny
        "Grota porośniętych Stalagmitów - sala główna ": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok5.gif", //mocny(chyba tylko to dziala)
        "Arachnitopia p5": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/regina-e2.gif", //pajak
        "Jaszczurze Korytarze p.4 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok_roz.gif", //panc
        "Jaszczurze Korytarze p.3 - sala 3": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/maddok_roz.gif", //panc(chyba dziala)
        "Krzaczasta grota - korytarz": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/silvanasus.gif", //szczurokrzak
        "Krzaczasta grota - sala główna": "https://micc.garmory-cdn.cloud/obrazki/npc/e2/silvanasus.gif", //szczurokrzak srodek(chyba dziala)
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
                  itemName.includes("Niepozorny Kamień Czerwonego Smoka") ||  
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
