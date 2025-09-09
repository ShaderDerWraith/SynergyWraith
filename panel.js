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
