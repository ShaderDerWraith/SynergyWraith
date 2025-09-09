// panel.js
(function() {
    'use strict';
    console.log("✅ Panel dodatków załadowany");

    // 🔹 klucze w localStorage
    const PANEL_POS_KEY = "addons_panel_position";
    const PANEL_VISIBLE_KEY = "addons_panel_visible";

    // Dodanie przycisku
    const toggleBtn = document.createElement("div");
    toggleBtn.id = "myPanelToggle";
    toggleBtn.textContent = "⚙️ Dodatki";
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

    // 🔹 Funkcja do wczytywania i aplikowania zapisanej pozycji
    function loadPanelState() {
        // Wczytaj zapisany stan widoczności
        const savedVisible = localStorage.getItem(PANEL_VISIBLE_KEY);
        panel.style.display = savedVisible === "true" ? "block" : "none";

        // Wczytaj zapisaną pozycję
        const savedPos = localStorage.getItem(PANEL_POS_KEY);
        if (savedPos) {
            try {
                const { top, left } = JSON.parse(savedPos);
                panel.style.top = top;
                panel.style.left = left;
            } catch (e) {
                console.error("Błąd wczytywania pozycji:", e);
            }
        }
    }
    // Załaduj stan przy starcie
    loadPanelState();

    // Obsługa otwierania/zamykania
    toggleBtn.addEventListener("click", () => {
        const isVisible = panel.style.display === "block";
        panel.style.display = isVisible ? "none" : "block";
        localStorage.setItem(PANEL_VISIBLE_KEY, (!isVisible).toString());
    });

    // 🔹 PRZESUWANIE PANELU - POPRAWIONA WERSJA
    const header = document.getElementById("myAddonsPanelHeader");
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    // Funkcja rozpoczynająca przeciąganie
    const startDrag = (e) => {
        isDragging = true;
        panel.classList.add('dragging');

        // Oblicz offset (różnica między kursorem a górnym legiem rogiem panelu)
        const panelRect = panel.getBoundingClientRect();
        offsetX = e.clientX - panelRect.left;
        offsetY = e.clientY - panelRect.top;

        // Dodaj nasłuchiwacze na cały dokument
        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", stopDrag);
        e.preventDefault(); // Zapobiega niepożądanemu zaznaczaniu tekstu
    };

    // Funkcja wykonująca się podczas przeciągania
    const onDrag = (e) => {
        if (!isDragging) return;

        // Oblicz nową pozycję (uwzględniając scroll strony)
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;

        // Zastosuj nową pozycję
        panel.style.left = newX + "px";
        panel.style.top = newY + "px";
    };

    // Funkcja kończąca przeciąganie
    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        panel.classList.remove('dragging');

        // Zapisz nową pozycję
        localStorage.setItem(PANEL_POS_KEY, JSON.stringify({
            top: panel.style.top,
            left: panel.style.left
        }));

        // Usuń nasłuchiwacze z dokumentu
        document.removeEventListener("mousemove", onDrag);
        document.removeEventListener("mouseup", stopDrag);
    };

    // Przypisz nasłuchiwacze do nagłówka
    header.addEventListener("mousedown", startDrag);

})();
