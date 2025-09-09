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
    toggleBtn.textContent = "⚙️ Dodatki";
    toggleBtn.title = "Przeciągnij, aby przenieść. Kliknij dwukrotnie, aby otworzyć/ukryć panel."; // Nowa podpowiedź
    document.body.appendChild(toggleBtn);

    // Dodanie panelu
    const panel = document.createElement("div");
    panel.id = "myAddonsPanel";
    panel.innerHTML = `
        <div id="myAddonsPanelHeader">Mój zestaw dodatków</div>
        <div id="myAddonsPanelContent">
            <div class="addon"><input type="checkbox" id="autoheal"> AutoHeal</div>
            <div class="addon"><input type="checkbox" id="xpbar"> XP Bar</div>
            <div class="addon"><input type="checkbox" id="fastfight"> FastFight</div>
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
        // Jeśli to już drugie kliknięcie w krótkim czasie, wyczyść timer i otwórz/ zamknij panel
        if (clickTimer !== null) {
            clearTimeout(clickTimer);
            clickTimer = null;
            // Główna akcja: przełącz widoczność panelu
            const isVisible = panel.style.display === "block";
            panel.style.display = isVisible ? "none" : "block";
            localStorage.setItem(PANEL_VISIBLE_KEY, (!isVisible).toString());
        } else {
            // To pierwsze kliknięcie, uruchom timer. Jeśli drugie nie nadejdzie, timer się wyzeruje.
            clickTimer = setTimeout(() => {
                clickTimer = null;
            }, 300); // Czas (w ms) na uznanie drugiego kliknięcia za część podwójnego. Standard to 300-500ms.
        }
    });

    // 🔹 PRZESUWANIE PANELU (Twój istniejący kod) - ZOSTAWIAMY
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

    // 🔹 PRZESUWANIE PRZYCISKU TOGGLE (POJEDYNCZE KLIKNIĘCIE I PRZECIĄGNIJ)
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
        // Zapisz pozycję przycisku
        localStorage.setItem(TOGGLE_BTN_POS_KEY, JSON.stringify({
            top: toggleBtn.style.top,
            left: toggleBtn.style.left
        }));
        document.removeEventListener("mousemove", onToggleDrag);
        document.removeEventListener("mouseup", stopToggleDrag);
    };

    // Przypisz nasłuchiwacz do przycisku
    toggleBtn.addEventListener("mousedown", startToggleDrag);

})();
