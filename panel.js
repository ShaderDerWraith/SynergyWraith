// panel.js
(function() {
    'use strict';
    console.log("✅ Panel dodatków załadowany");

    // 🔹 klucze w localStorage
    const PANEL_POS_KEY = "addons_panel_position";
    const PANEL_VISIBLE_KEY = "addons_panel_visible";
    const TOGGLE_BTN_POS_KEY = "addons_toggleBtn_position";

    // Dodanie przycisku
    const toggleBtn = document.createElement("div");
    toggleBtn.id = "myPanelToggle";
    toggleBtn.textContent = ""; // Ikona będzie teraz tłem CSS
    toggleBtn.title = "Przeciągnij, aby przenieść. Kliknij dwukrotnie, aby otworzyć/ukryć panel.";
    document.body.appendChild(toggleBtn);

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

    // 🔹 Funkcja do wczytywania i aplikowania zapisanej pozycji PANELU
    function loadPanelState() {
        // Wczytaj zapisany stan widoczności panelu
        const savedVisible = localStorage.getItem(PANEL_VISIBLE_KEY);
        panel.style.display = savedVisible === "true" ? "block" : "none";

        // Wczytaj zapisaną pozycję panelu
        const savedPos = localStorage.getItem(PANEL_POS_KEY);
        if (savedPos) {
            try {
                const { top, left } = JSON.parse(savedPos);
                panel.style.top = top;
                panel.style.left = left;
            } catch (e) {
                console.error("Błąd wczytywania pozycji panelu:", e);
            }
        }
    }

    // 🔹 Funkcja do wczytywania i aplikowania zapisanej pozycji PRZYCISKU
    function loadToggleBtnState() {
        const savedTogglePos = localStorage.getItem(TOGGLE_BTN_POS_KEY);
        if (savedTogglePos) {
            try {
                const { top, left } = JSON.parse(savedTogglePos);
                toggleBtn.style.top = top;
                toggleBtn.style.left = left;
            } catch (e) {
                console.error("Błąd wczytywania pozycji przycisku:", e);
            }
        }
    }

    // Załaduj stan przy starcie
    loadPanelState();
    loadToggleBtnState();

    // 🔹 OBSŁUGA PODWÓJNEGO KLIKNIĘCIA (otwieranie/zamykanie panelu)
    let clickTimer = null;
    toggleBtn.addEventListener('click', (e) => {
        if (clickTimer !== null) {
            clearTimeout(clickTimer);
            clickTimer = null;
            const isVisible = panel.style.display === "block";
            panel.style.display = isVisible ? "none" : "block";
            localStorage.setItem(PANEL_VISIBLE_KEY, (!isVisible).toString());
        } else {
            clickTimer = setTimeout(() => {
                clickTimer = null;
            }, 300);
        }
    });

    // 🔹 PRZESUWANIE PANELU
    const header = document.getElementById("myAddonsPanelHeader");
    let isPanelDragging = false;
    let panelOffsetX = 0;
    let panelOffsetY = 0;

    const startPanelDrag = (e) => {
        isPanelDragging = true;
        panel.classList.add('dragging');
        const panelRect = panel.getBoundingClientRect();
        panelOffsetX = e.clientX - panelRect.left;
        panelOffsetY = e.clientY - panelRect.top;
        document.addEventListener("mousemove", onPanelDrag);
        document.addEventListener("mouseup", stopPanelDrag);
        e.preventDefault();
    };

    const onPanelDrag = (e) => {
        if (!isPanelDragging) return;
        const newX = e.clientX - panelOffsetX;
        const newY = e.clientY - panelOffsetY;
        panel.style.left = newX + "px";
        panel.style.top = newY + "px";
    };

    const stopPanelDrag = () => {
        if (!isPanelDragging) return;
        isPanelDragging = false;
        panel.classList.remove('dragging');
        localStorage.setItem(PANEL_POS_KEY, JSON.stringify({
            top: panel.style.top,
            left: panel.style.left
        }));
        document.removeEventListener("mousemove", onPanelDrag);
        document.removeEventListener("mouseup", stopPanelDrag);
    };
    header.addEventListener("mousedown", startPanelDrag);

    // 🔹 PRZESUWANIE PRZYCISKU TOGGLE
    let isToggleDragging = false;
    let toggleOffsetX = 0;
    let toggleOffsetY = 0;

    const startToggleDrag = (e) => {
        isToggleDragging = true;
        toggleBtn.classList.add('dragging');
        const toggleRect = toggleBtn.getBoundingClientRect();
        toggleOffsetX = e.clientX - toggleRect.left;
        toggleOffsetY = e.clientY - toggleRect.top;
        document.addEventListener("mousemove", onToggleDrag);
        document.addEventListener("mouseup", stopToggleDrag);
        e.preventDefault();
    };

    const onToggleDrag = (e) => {
        if (!isToggleDragging) return;
        const newX = e.clientX - toggleOffsetX;
        const newY = e.clientY - toggleOffsetY;
        toggleBtn.style.left = newX + "px";
        toggleBtn.style.top = newY + "px";
    };

    const stopToggleDrag = () => {
        if (!isToggleDragging) return;
        isToggleDragging = false;
        toggleBtn.classList.remove('dragging');
        localStorage.setItem(TOGGLE_BTN_POS_KEY, JSON.stringify({
            top: toggleBtn.style.top,
            left: toggleBtn.style.left
        }));
        document.removeEventListener("mousemove", onToggleDrag);
        document.removeEventListener("mouseup", stopToggleDrag);
    };

    toggleBtn.addEventListener("mousedown", startToggleDrag);

    // 🔹 LOGIKA ZAKŁADEK
    function openTab(tabName) {
        const tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        const tablinks = document.getElementsByClassName("tablink");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabName).style.display = "block";
        const activeButton = document.querySelector(`.tablink[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.className += " active";
        }
    }

    document.querySelector('.tab-container').addEventListener('click', function(e) {
        if (e.target && e.target.matches('.tablink')) {
            const tabName = e.target.getAttribute('data-tab');
            openTab(tabName);
        }
    });

    document.getElementById('reset-settings')?.addEventListener('click', function() {
        if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia? Pozycje i preferencje zostaną usunięte.')) {
            localStorage.removeItem('addons_toggleBtn_position');
            localStorage.removeItem('addons_panel_position');
            localStorage.removeItem('addons_panel_visible');
            alert('Ustawienia zresetowane. Strona zostanie odświeżona.');
            setTimeout(() => { location.reload(); }, 1000);
        }
    });

})();
