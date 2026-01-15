// synergy_admin.js - Prosty panel admina
(function() {
    'use strict';
    
    console.log('🔧 Synergy Admin Panel');
    
    const CONFIG = {
        ADMIN_TOKEN: 'SYNERGY_ADMIN_2024_SECRET',
        BACKEND_URL: 'https://synergy-licenses.lozu-oo.workers.dev'
    };
    
    function init() {
        console.log('🚀 Admin Panel loading...');
        injectAdminCSS();
        createAdminPanel();
        setupEventListeners();
    }
    
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
                padding: 12px;
                text-align: center;
                border-bottom: 1px solid #00cc00;
                cursor: move;
                font-weight: bold;
                color: #00ff00;
                font-size: 14px;
            }
            
            .admin-content {
                padding: 15px;
                max-height: 500px;
                overflow-y: auto;
                font-size: 12px;
            }
            
            .admin-button {
                width: 100%;
                padding: 10px;
                background: linear-gradient(to right, #006600, #008800);
                border: 1px solid #00cc00;
                border-radius: 5px;
                color: #ffffff;
                cursor: pointer;
                font-weight: bold;
                font-size: 12px;
                margin-bottom: 10px;
            }
            
            .admin-input {
                width: 100%;
                padding: 8px;
                background: rgba(0, 40, 0, 0.8);
                border: 1px solid #008800;
                border-radius: 4px;
                color: #00ff00;
                font-size: 12px;
                margin-bottom: 10px;
            }
            
            #adminToggleBtn {
                position: fixed;
                top: 100px;
                right: 20px;
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #006600, #00aa00);
                border: 2px solid #00ff00;
                border-radius: 50%;
                cursor: pointer;
                z-index: 999998;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.7);
                color: white;
                font-weight: bold;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                user-select: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    function createAdminPanel() {
        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'adminToggleBtn';
        toggleBtn.innerHTML = 'A';
        toggleBtn.title = 'Panel Admina';
        document.body.appendChild(toggleBtn);
        
        const panel = document.createElement('div');
        panel.id = 'synergyAdminPanel';
        
        panel.innerHTML = `
            <div id="adminPanelHeader">
                🔧 SYNERGY ADMIN
            </div>
            <div class="admin-content">
                <div style="margin-bottom:15px;">
                    <h3 style="color:#00ff00; margin-top:0;">Test Połączenia</h3>
                    <div id="connectionStatus" style="color:#ff9966; margin:10px 0;">Kliknij test</div>
                    <button class="admin-button" id="testConnectionBtn">Testuj Połączenie</button>
                </div>
                
                <div style="margin-bottom:15px;">
                    <h3 style="color:#00ff00;">Generuj Klucz</h3>
                    <input type="date" class="admin-input" id="adminExpiryDate">
                    <input type="text" class="admin-input" id="adminAddons" value="all" placeholder="Dodatki (all)">
                    <input type="text" class="admin-input" id="adminNote" placeholder="Notatka">
                    <button class="admin-button" id="createLicenseBtn">🎫 Generuj Klucz</button>
                    <div id="createdKey" style="display:none; padding:10px; background:rgba(0,60,0,0.5); border-radius:5px; margin-top:10px; font-size:11px;"></div>
                </div>
                
                <div>
                    <h3 style="color:#00ff00;">Lista Kluczy</h3>
                    <button class="admin-button" id="listLicensesBtn">📋 Pokaż Klucze</button>
                    <div id="licensesList" style="max-height:200px; overflow-y:auto; margin-top:10px; padding:10px; background:rgba(0,30,0,0.5); border-radius:5px;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        const dateInput = document.getElementById('adminExpiryDate');
        if (dateInput) {
            const today = new Date();
            today.setDate(today.getDate() + 30);
            dateInput.value = today.toISOString().split('T')[0];
        }
    }
    
    function setupEventListeners() {
        const toggleBtn = document.getElementById('adminToggleBtn');
        const panel = document.getElementById('synergyAdminPanel');
        
        toggleBtn.addEventListener('click', function() {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        });
        
        document.getElementById('testConnectionBtn').addEventListener('click', testConnection);
        document.getElementById('createLicenseBtn').addEventListener('click', createLicense);
        document.getElementById('listLicensesBtn').addEventListener('click', listLicenses);
    }
    
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
            return { success: false, error: error.message };
        }
    }
    
    async function testConnection() {
        const statusEl = document.getElementById('connectionStatus');
        statusEl.textContent = 'Testowanie...';
        
        try {
            const result = await makeRequest('/api/check', { accountId: 'test' });
            statusEl.textContent = result.success !== undefined ? '✅ Backend OK!' : '⚠️ Backend odpowiada';
            statusEl.style.color = '#00ff00';
        } catch (error) {
            statusEl.textContent = '❌ Błąd połączenia';
            statusEl.style.color = '#ff3300';
        }
    }
    
    async function createLicense() {
        const expiry = document.getElementById('adminExpiryDate').value;
        const addons = document.getElementById('adminAddons').value.trim();
        const note = document.getElementById('adminNote').value.trim();
        
        if (!expiry) {
            alert('Wybierz datę!');
            return;
        }
        
        const addonsArray = addons ? addons.split(',').map(a => a.trim()).filter(a => a) : ['all'];
        
        const result = await makeRequest('/api/admin/create', {
            expiry: expiry,
            addons: addonsArray,
            note: note || ''
        });
        
        if (result.success && result.license) {
            const displayDiv = document.getElementById('createdKey');
            displayDiv.innerHTML = `
                <div style="color:#00ff00; font-weight:bold;">Wygenerowany klucz:</div>
                <div style="color:#00ccff; font-family:monospace; margin:5px 0;">${result.license.key}</div>
                <div style="color:#00cc99; font-size:10px;">Ważny do: ${new Date(expiry).toLocaleDateString('pl-PL')}</div>
            `;
            displayDiv.style.display = 'block';
        } else {
            alert('Błąd: ' + (result.message || 'Nieznany błąd'));
        }
    }
    
    async function listLicenses() {
        const listEl = document.getElementById('licensesList');
        listEl.innerHTML = '<div style="color:#666; text-align:center; padding:20px;">Ładowanie...</div>';
        
        const result = await makeRequest('/api/admin/list', {});
        
        if (result.success && result.licenses && result.licenses.length > 0) {
            let html = '';
            result.licenses.forEach(license => {
                const expiry = new Date(license.expiry);
                const now = new Date();
                const isExpired = expiry < now;
                const isUsed = license.used || false;
                
                let statusColor = '#00ff00';
                let statusText = 'AKTYWNY';
                
                if (isUsed) {
                    statusColor = '#ff9900';
                    statusText = 'UŻYTY';
                } else if (isExpired) {
                    statusColor = '#ff3300';
                    statusText = 'WYGASŁY';
                }
                
                html += `
                    <div style="padding:8px; border-bottom:1px solid rgba(0,100,0,0.3); font-size:11px;">
                        <div><strong style="color:#00ff00;">Klucz:</strong> ${license.key}</div>
                        <div><strong>Ważny do:</strong> ${expiry.toLocaleDateString('pl-PL')}</div>
                        <div><strong>Status:</strong> <span style="color:${statusColor}">${statusText}</span></div>
                    </div>
                `;
            });
            listEl.innerHTML = html;
        } else {
            listEl.innerHTML = '<div style="color:#666; text-align:center; padding:20px;">Brak kluczy</div>';
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();