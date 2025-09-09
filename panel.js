/* panel.js - logika panelu (uruchamiany w kontekście strony) */
(function () {
  if (window.__MP_PANEL_LOADED) return;
  window.__MP_PANEL_LOADED = true;

  const ID = 'mp-panel-v1';
  const TOGGLE_ID = 'mp-toggle';
  const STORAGE_POS = 'mp_panel_pos_v1';
  const STORAGE_OPEN = 'mp_panel_open_v1';

  console.log('[MP] Panel dodatków ładowany');

  // helper: utwórz node tylko jeśli nie istnieje
  function createIfMissing(id, tag='div') {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement(tag);
      el.id = id;
    }
    return el;
  }

  // --- toggle button ---
  const toggle = createIfMissing(TOGGLE_ID);
  toggle.textContent = '⚙️ Dodatki';
  document.body.appendChild(toggle);

  // --- panel ---
  const panel = createIfMissing(ID);
  panel.innerHTML = `
    <div class="mp-header">
      <div class="mp-title">Mój zestaw dodatków</div>
      <button class="mp-close" title="Zamknij">✕</button>
    </div>
    <div class="mp-body">
      <label class="mp-option"><input type="checkbox" id="mp_opt_autoheal"> AutoHeal</label>
      <label class="mp-option"><input type="checkbox" id="mp_opt_xpbar"> XP Bar</label>
      <label class="mp-option"><input type="checkbox" id="mp_opt_fastfight"> FastFight</label>
    </div>
    <div class="mp-footer">
      <div>Wersja: 0.1</div>
      <div style="opacity:0.8">Panel lokalny</div>
    </div>
  `;
  document.body.appendChild(panel);

  // Przywróć pozycję z localStorage
  try {
    const pos = JSON.parse(localStorage.getItem(STORAGE_POS) || 'null');
    if (pos && pos.left && pos.top) {
      panel.style.left = pos.left;
      panel.style.top = pos.top;
    } else {
      panel.style.left = '18px';
      panel.style.top = '80px';
    }
  } catch (e) {
    panel.style.left = '18px';
    panel.style.top = '80px';
  }

  // przywróć stan open/closed
  const wasOpen = localStorage.getItem(STORAGE_OPEN) === '1';
  if (wasOpen) panel.style.display = 'block'; else panel.style.display = 'none';

  // zamknij przyciskiem
  panel.querySelector('.mp-close').addEventListener('click', () => {
    panel.style.display = 'none';
    localStorage.setItem(STORAGE_OPEN, '0');
  });

  // toggle button obsługa
  toggle.addEventListener('click', () => {
    panel.style.display = (panel.style.display === 'none' || !panel.style.display) ? 'block' : 'none';
    localStorage.setItem(STORAGE_OPEN, panel.style.display === 'block' ? '1' : '0');
  });

  // --- checkboxy - zapis stanu w localStorage ---
  const options = ['autoheal','xpbar','fastfight'];
  options.forEach(opt => {
    const el = document.getElementById(`mp_opt_${opt}`);
    const key = `mp_opt_${opt}_v1`;
    try {
      const val = localStorage.getItem(key) === '1';
      el.checked = val;
    } catch(e) { /* ignore */ }

    el.addEventListener('change', () => {
      localStorage.setItem(key, el.checked ? '1' : '0');
      console.log(`[MP] Opcja ${opt} = ${el.checked}`);
      // tutaj możesz wywoływać funkcję aktywującą dany addon
      // ex: if (opt === 'autoheal') toggleAutoHeal(el.checked);
    });
  });

  // --- prosty drag (przeciąganie panelu) ---
  (function addDrag() {
    const header = panel.querySelector('.mp-header');
    let dragging = false;
    let startX=0, startY=0, startLeft=0, startTop=0;

    header.addEventListener('pointerdown', (e) => {
      dragging = true;
      header.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(panel.style.left || 0);
      startTop = parseInt(panel.style.top || 0);
      e.preventDefault();
    });

    document.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panel.style.left = (startLeft + dx) + 'px';
      panel.style.top  = (startTop + dy) + 'px';
    });

    document.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      // zapisz pozycję
      try {
        localStorage.setItem(STORAGE_POS, JSON.stringify({ left: panel.style.left, top: panel.style.top }));
      } catch (e) {}
    });
  })();

  console.log('[MP] Panel gotowy');
  // expose for debug
  window.MPPanel = { panel, toggle };
})();
