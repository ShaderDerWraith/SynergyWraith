// Dodanie panelu
const panel = document.createElement("div");
panel.id = "myAddonsPanel";
panel.innerHTML = `
    <div id="myAddonsPanelHeader">Mój zestaw dodatków</div>
    <div id="myAddonsPanelContent">
        <!-- Pasek zakładek -->
        <div class="tab-container">
            <button class="tablink active" data-tab="addons">Dodatki</button>
            <button class="tablink" data-tab="status">Status</button>
            <button class="tablink" data-tab="settings">Ustawienia</button>
        </div>

        <!-- Zawartość zakładek -->
        <div id="addons" class="tabcontent" style="display:block;">
            <h3>Aktywne dodatki</h3>
            <div class="addon"><input type="checkbox" id="autoheal"> <label for="autoheal">AutoHeal</label></div>
            <div class="addon"><input type="checkbox" id="xpbar"> <label for="xpbar">XP Bar</label></div>
            <div class="addon"><input type="checkbox" id="fastfight"> <label for="fastfight">FastFight</label></div>
        </div>

        <div id="status" class="tabcontent">
            <h3>Status gry</h3>
            <p>Tu będzie informacja o HP, MANIE, poziomie itp.</p>
            <div id="status-content"></div>
        </div>

        <div id="settings" class="tabcontent">
            <h3>Ustawienia panelu</h3>
            <div class="addon"><input type="checkbox" id="lockPosition"> <label for="lockPosition">Zablokuj pozycję przycisku</label></div>
            <div class="addon"><input type="checkbox" id="showNotifications"> <label for="showNotifications">Powiadomienia</label></div>
            <button id="reset-settings">Resetuj ustawienia</button>
        </div>
    </div>
`;
document.body.appendChild(panel);

    // 🔹 LOGIKA ZAKŁADEK
    function openTab(tabName) {
        // Ukryj wszystkie zakładki
        const tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Usuń klasę "active" ze wszystkich przycisków
        const tablinks = document.getElementsByClassName("tablink");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Pokaż konkretną zakładkę i aktywuj jej przycisk
        document.getElementById(tabName).style.display = "block";
        // Znajdź przycisk, który aktywował tę zakładkę i dodaj mu klasę "active"
        const activeButton = document.querySelector(`.tablink[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.className += " active";
        }
    }

    // Dodaj nasłuchiwanie kliknięcia na KONTENERZE (tzw. delegacja zdarzeń)
    document.querySelector('.tab-container').addEventListener('click', function(e) {
        // Sprawdź, czy kliknięto element z klasą "tablink"
        if (e.target && e.target.matches('.tablink')) {
            // Pobierz nazwę zakładki z atrybutu data-tab
            const tabName = e.target.getAttribute('data-tab');
            openTab(tabName);
        }
    });

    // Obsługa przycisku resetowania w zakładce Ustawienia
    document.getElementById('reset-settings')?.addEventListener('click', function() {
        if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia? Pozycje i preferencje zostaną usunięte.')) {
            localStorage.removeItem('addons_toggleBtn_position');
            localStorage.removeItem('addons_panel_position');
            localStorage.removeItem('addons_panel_visible');
            alert('Ustawienia zresetowane. Strona zostanie odświeżona.');
            setTimeout(() => { location.reload(); }, 1000);
        }
    });
