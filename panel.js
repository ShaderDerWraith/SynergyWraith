(function() {
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

    // 🔹 wczytaj zapisany stan widoczności
    const savedVisible = localStorage.getItem(PANEL_VISIBLE_KEY);
    if (savedVisible === "true") {
        panel.style.display = "block";
    }

    // 🔹 wczytaj zapisaną pozycję
    const savedPos = JSON.parse(localStorage.getItem(PANEL_POS_KEY));
    if (savedPos) {
        panel.style.top = savedPos.top;
        panel.style.left = savedPos.left;
    }

    // Obsługa otwierania/zamykania
    toggleBtn.addEventListener("click", () => {
        const isVisible = panel.style.display === "block";
        panel.style.display = isVisible ? "none" : "block";
        localStorage.setItem(PANEL_VISIBLE_KEY, (!isVisible).toString());
    });

    // 🔹 przesuwanie panelu
    const header = document.getElementById("myAddonsPanelHeader");
    let isDragging = false, offsetX, offsetY;

    header.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        const newLeft = e.clientX - offsetX;
        const newTop = e.clientY - offsetY;

        panel.style.left = newLeft + "px";
        panel.style.top = newTop + "px";
    }

    function onMouseUp() {
        if (!isDragging) return;
        isDragging = false;

        // zapisz nową pozycję
        localStorage.setItem(PANEL_POS_KEY, JSON.stringify({
            top: panel.style.top,
            left: panel.style.left
        }));

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }
})();
