// synergy_admin.js - Prosty panel admina do zarządzania licencjami
(function() {
    'use strict';
    
    console.log('🔧 Synergy Admin Panel - Simple License Manager');
    
    // 🔹 Konfiguracja
    const CONFIG = {
        ADMIN_TOKEN: 'SIMPLE_SYNERGY_2024', // Zmień to na swój sekretny token!
        BACKEND_URL: 'https://synergy-licenses.lozu-oo.workers.dev',
        SAVED_LICENSES: 'synergy_admin_licenses'
    };
    
    // 🔹 Inicjalizacja
    function init() {
        console.log('🚀 Initializing Admin Panel...');
        
        injectAdminCSS();
        createAdminPanel();
        setupEventListeners();
        
        // Test połączenia
        testConnection();
        
        console.log('✅ Admin Panel ready!');
    }
    
    // 🔹 Wstrzyknij CSS
    function injectAdminCSS() {
        const style = document.createElement('style');
        style.textContent = `
            #synergyAdminPanel {
                position: fixed;
                top: 100px;
                right: 20px;
                width: 400px;
                background: linear-gradient(135deg, #001a00, #003300);
                border: 2px solid #00cc00;
                border-radius: 10px;
                color: white;
                z-index: 999999;
                box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: none;
            }
            
            #adminPanelHeader {
                background: linear-gradient(to right, #002200, #004400);
                padding: 15px;
                text-align: center;
                border-bottom: 1px solid #00cc00;
                cursor: move;
                font-weight: bold;
                color: #00ff00;
                font-size: 16px;
            }
            
            .admin-content {
                padding: 20px;
                max-height: 500px;
                overflow-y: auto;
            }
            
            .admin-section {
                margin-bottom: 25px;
                padding: 15px;
                background: rgba(0, 50, 0, 0.3);
                border: 1px solid #006600;
                border-radius: 8px;
            }
            
            .admin-section h3 {
                color: #00ff00;
                margin-top: 0;
                margin-bottom: 15px;
                font-size: 14px;
                text-transform: uppercase;
                border-bottom: 1px solid #008800;
                padding-bottom: 8px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-label {
                display: block;
                color: #00cc00;
                font-size: 12px;
                margin-bottom: 5px;
                font-weight: bold;
            }
            
            .form-input {
                width: 100%;
                padding: 10px;
                background: rgba(0, 40, 0, 0.8);
                border: 1px solid #008800;
                border-radius: 5px;
                color: #00ff00;
                font-size: 13px;
                box-sizing: border-box;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #00ff00;
                box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
            }
            
            .admin-button {
                width: 100%;
                padding: 12px;
                background: linear-gradient(to right, #006600, #008800);
                border: 1px solid #00cc00;
                border-radius: 6px;
                color: #ffffff;
                cursor: pointer;
                font-weight: bold;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: all 0.3s ease;
                margin-top: 10px;
            }
            
            .admin-button:hover {
                background: linear-gradient(to right, #008800, #00aa00);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 255, 0, 0.3);
            }
            
            .admin-button.delete {
                background: linear-gradient(to right, #660000, #880000);
                border-color: #cc0000;
            }
            
            .admin-button.delete:hover {
                background: linear-gradient(to right, #880000, #aa0000);
                box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3);
            }
            
            .admin-message {
                margin-top: 15px;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                text-align: center;
                border: 1px solid;
            }
            
            .message-success {
                background: rgba(0, 100, 0, 0.2);
                color: #00ff00;
                border-color: #00ff00;
            }
            
            .message-error {
                background: rgba(100, 0, 0, 0.2);
                color: #ff3300;
                border-color: #ff3300;
            }
            
            .message-info {
                background: rgba(0, 50, 100, 0.2);
                color: #00aaff;
                border-color: #00aaff;
            }
            
            .license-list {
                max-height: 200px;
                overflow-y: auto;
                background: rgba(0, 30, 0, 0.5);
                border-radius: 5px;
                padding: 10px;
                margin-top: 10px;
            }
            
            .license-item {
                padding: 8px;
                border-bottom: 1px solid rgba(0, 100, 0, 0.3);
                font-size: 11px;
            }
            
            .license-item:last-child {
                border-bottom: none;
            }
            
            .license-id {
                color: #00ff00;
                font-weight: bold;
            }
            
            .license-expiry {
                color: #00ccff;
            }
            
            .license-expired {
                color: #ff6666;
            }
            
            #adminToggleBtn {
                position: fixed;
                top: 100px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #006600, #00aa00);
                border: 2px solid #00ff00;
                border-radius: 50%;
                cursor: pointer;
                z-index: 999998;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.7);
                color: white;
                font-weight: bold;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                user-select: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 🔹 Tworzenie panelu
    function createAdminPanel() {
        // Przycisk przełączania
        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'adminToggleBtn';
        toggleBtn.innerHTML = 'A';
        toggleBtn.title = 'Panel Admina Synergy';
        document.body.appendChild(toggleBtn);
        
        // Główny panel
        const panel = document.createElement('div');
        panel.id = 'synergyAdminPanel';
        
        panel.innerHTML = `
            <div id="adminPanelHeader">
                🔧 SYNERGY ADMIN PANEL
            </div>
            <div class="admin-content">
                <div class="admin-section">
                    <h3>🔄 Test Połączenia</h3>
                    <div id="connectionStatus" style="color:#ff9966; text-align:center; margin:10px 0;">
                        Testowanie połączenia...
                    </div>
                    <button class="admin-button" id="testConnectionBtn">
                        Testuj Połączenie
                    </button>
                </div>
                
                <div class="admin-section">
                    <h3>➕ Dodaj/Edytuj Licencję</h3>
                    <div class="form-group">
                        <label class="form-label">ID Konta:</label>
                        <input type="text" class="form-input" id="adminAccountId" placeholder="np. 123456">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Data ważności:</label>
                        <input type="date" class="form-input" id="adminExpiryDate">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Dodatki (oddzielone przecinkami):</label>
                        <input type="text" class="form-input" id="adminAddons" value="all" placeholder="all, kcs-icons, auto-looter">
                        <small style="color:#00cc99; font-size:11px;">"all" = dostęp do wszystkich dodatków</small>
                    </div>
                    <button class="admin-button" id="saveLicenseBtn">
                        💾 Zapisz Licencję
                    </button>
                    <button class="admin-button delete" id="removeLicenseBtn">
                        🗑️ Usuń Licencję
                    </button>
                </div>
                
                <div class="admin-section">
                    <h3>📋 Lista Licencji</h3>
                    <button class="admin-button" id="refreshLicensesBtn">
                        Odśwież Listę
                    </button>
                    <div class="license-list" id="licensesList">
                        <div style="color:#666; text-align:center; padding:20px;">
                            Kliknij "Odśwież Listę"
                        </div>
                    </div>
                </div>
                
                <div id="adminMessage" class="admin-message"></div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Ustaw dzisiejszą datę jako domyślną (30 dni)
        const dateInput = document.getElementById('adminExpiryDate');
        if (dateInput) {
            const today = new Date();
            today.setDate(today.getDate() + 30);
            dateInput.value = today.toISOString().split('T')[0];
        }
    }
    
    // 🔹 Setup event listenerów
    function setupEventListeners() {
        // Przycisk przełączania
        const toggleBtn = document.getElementById('adminToggleBtn');
        const panel = document.getElementById('synergyAdminPanel');
        
        toggleBtn.addEventListener('click', function() {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        });
        
        // Test połączenia
        document.getElementById('testConnectionBtn').addEventListener('click', testConnection);
        
        // Zapisz licencję
        document.getElementById('saveLicenseBtn').addEventListener('click', saveLicense);
        
        // Usuń licencję
        document.getElementById('removeLicenseBtn').addEventListener('click', removeLicense);
        
        // Odśwież listę
        document.getElementById('refreshLicensesBtn').addEventListener('click', listLicenses);
        
        // Przeciąganie panelu
        const header = document.getElementById('adminPanelHeader');
        setupPanelDrag(header, panel);
    }
    
    // 🔹 Przeciąganie panelu
    function setupPanelDrag(header, panel) {
        let isDragging = false;
        let offsetX, offsetY;
        
        header.addEventListener('mousedown', startDrag);
        
        function startDrag(e) {
            isDragging = true;
            const rect = panel.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDrag);
        }
        
        function onDrag(e) {
            if (!isDragging) return;
            
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
        }
        
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
        }
    }
    
    // 🔹 Funkcje API
    async function makeRequest(endpoint, data = {}) {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.ADMIN_TOKEN}`
                },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            console.error('❌ API Error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 🔹 Test połączenia
    async function testConnection() {
        const statusEl = document.getElementById('connectionStatus');
        statusEl.textContent = 'Testowanie...';
        statusEl.style.color = '#ff9966';
        
        try {
            const result = await makeRequest('/api/check', { accountId: 'test' });
            
            if (result.success !== undefined) {
                statusEl.textContent = '✅ Połączenie z backendem OK!';
                statusEl.style.color = '#00ff00';
                showMessage('Backend działa poprawnie!', 'success');
            } else {
                statusEl.textContent = '⚠️ Backend odpowiada inaczej';
                statusEl.style.color = '#ffcc00';
            }
        } catch (error) {
            statusEl.textContent = '❌ Błąd połączenia';
            statusEl.style.color = '#ff3300';
            showMessage('Błąd połączenia z backendem!', 'error');
        }
    }
    
    // 🔹 Zapisz licencję
    async function saveLicense() {
        const accountId = document.getElementById('adminAccountId').value.trim();
        const expiry = document.getElementById('adminExpiryDate').value;
        const addonsInput = document.getElementById('adminAddons').value.trim();
        
        if (!accountId) {
            showMessage('Wpisz ID konta!', 'error');
            return;
        }
        
        if (!expiry) {
            showMessage('Wybierz datę ważności!', 'error');
            return;
        }
        
        const addons = addonsInput.split(',').map(a => a.trim()).filter(a => a);
        
        showMessage('Zapisywanie licencji...', 'info');
        
        const result = await makeRequest('/api/admin/add', {
            accountId: accountId,
            expiry: expiry,
            addons: addons
        });
        
        if (result.success) {
            showMessage(`✅ Licencja zapisana dla ID: ${accountId}`, 'success');
            document.getElementById('adminAccountId').value = '';
            listLicenses(); // Odśwież listę
        } else {
            showMessage(`❌ Błąd: ${result.message || 'Nieznany błąd'}`, 'error');
        }
    }
    
    // 🔹 Usuń licencję
    async function removeLicense() {
        const accountId = document.getElementById('adminAccountId').value.trim();
        
        if (!accountId) {
            showMessage('Wpisz ID konta do usunięcia!', 'error');
            return;
        }
        
        if (!confirm(`Czy na pewno chcesz usunąć licencję dla ID: ${accountId}?`)) {
            return;
        }
        
        showMessage('Usuwanie licencji...', 'info');
        
        const result = await makeRequest('/api/admin/remove', {
            accountId: accountId
        });
        
        if (result.success) {
            showMessage(`✅ Licencja usunięta dla ID: ${accountId}`, 'success');
            document.getElementById('adminAccountId').value = '';
            listLicenses(); // Odśwież listę
        } else {
            showMessage(`❌ Błąd: ${result.message || 'Nieznany błąd'}`, 'error');
        }
    }
    
    // 🔹 Lista licencji
    async function listLicenses() {
        const listEl = document.getElementById('licensesList');
        listEl.innerHTML = '<div style="color:#666; text-align:center; padding:20px;">Ładowanie...</div>';
        
        const result = await makeRequest('/api/admin/list');
        
        if (result.success && result.licenses && result.licenses.length > 0) {
            let html = '';
            
            result.licenses.forEach(license => {
                const expiryDate = new Date(license.expiry);
                const now = new Date();
                const isExpired = expiryDate < now;
                const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                
                html += `
                    <div class="license-item">
                        <div><span class="license-id">ID: ${license.accountId}</span></div>
                        <div class="${isExpired ? 'license-expired' : 'license-expiry'}">
                            📅 ${expiryDate.toLocaleDateString('pl-PL')} 
                            ${isExpired ? '(WYGASŁA)' : `(${daysLeft} dni)`}
                        </div>
                        <div style="color:#00cc99; font-size:10px;">
                            Dodatki: ${license.addons.join(', ')}
                        </div>
                    </div>
                `;
            });
            
            listEl.innerHTML = html;
            showMessage(`Znaleziono ${result.count} licencji`, 'success');
        } else {
            listEl.innerHTML = '<div style="color:#666; text-align:center; padding:20px;">Brak licencji w systemie</div>';
            showMessage('Brak licencji w systemie', 'info');
        }
    }
    
    // 🔹 Pokaż wiadomość
    function showMessage(text, type = 'info') {
        const messageEl = document.getElementById('adminMessage');
        messageEl.textContent = text;
        messageEl.className = `admin-message message-${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
    
    // 🔹 Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();