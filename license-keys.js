// license-keys.js - Baza kluczy licencyjnych Synergy Wraith
// Format: "KLUCZ_LICENCYJNY": "YYYY-MM-DD" (data wygaśnięcia)

window.LICENSE_KEYS = {
    // 🔹 Klucze testowe (ważne do 2026)
    "SYNERGY-2026-TEST-001": "2026-01-31",
    "SYNERGY-2026-TEST-002": "2026-02-28",
    "SYNERGY-2026-TEST-003": "2026-03-31",
    
    // 🔹 Klucze stałych użytkowników
    "SYNERGY-PREMIUM-USER-001": "2026-12-31",
    "SYNERGY-PREMIUM-USER-002": "2026-12-31",
    "SYNERGY-PREMIUM-USER-003": "2026-12-31",
    
    // 🔹 Klucze miesięczne
    "SYNERGY-MONTHLY-001": "2025-02-20",
    "SYNERGY-MONTHLY-002": "2025-02-20",
    "SYNERGY-MONTHLY-003": "2025-02-20",
    
    // 🔹 Klucze roczne
    "SYNERGY-YEARLY-2025": "2025-12-31",
    "SYNERGY-YEARLY-2026": "2026-12-31",
    
    // 🔹 Klucze developerskie (długie ważność)
    "SYNERGY-DEV-ALPHA": "2027-12-31",
    "SYNERGY-DEV-BETA": "2027-12-31",
    "SYNERGY-DEV-GAMMA": "2027-12-31",
    
    // 🔹 Klucze promocyjne
    "SYNERGY-PROMO-30DAYS": "2025-03-15",
    "SYNERGY-PROMO-60DAYS": "2025-04-15",
    "SYNERGY-PROMO-90DAYS": "2025-05-15",
    
    // 🔹 Klucze specjalne
    "SYNERGY-VIP-ULTIMATE": "2028-12-31",
    "SYNERGY-FOUNDER-001": "2030-01-01",
    
    // 🔹 Klucze wygasłe (do testów)
    "SYNERGY-EXPIRED-001": "2024-01-01",
    "SYNERGY-EXPIRED-002": "2023-12-31",
    
    // 🔹 Klucze testowe do szybkiego sprawdzenia
    "TEST-7DAYS": getDateString(7),     // 7 dni od dziś
    "TEST-30DAYS": getDateString(30),   // 30 dni od dziś
    "TEST-90DAYS": getDateString(90),   // 90 dni od dziś
    "TEST-365DAYS": getDateString(365)  // rok od dziś
};

// Funkcja pomocnicza do generowania dat względnych
function getDateString(daysToAdd) {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
}

// Informacja o załadowaniu kluczy
console.log(`✅ License keys loaded: ${Object.keys(window.LICENSE_KEYS).length} keys available`);
console.log('📅 Sample keys:');
console.log('- TEST-7DAYS (7 dni od dziś)');
console.log('- SYNERGY-2026-TEST-001 (ważny do 2026-01-31)');
console.log('- SYNERGY-EXPIRED-001 (wygasły)');

// Eksport dla modułów (jeśli potrzebne)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LICENSE_KEYS };
}
