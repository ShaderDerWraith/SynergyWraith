// license-server.js (TYMCZASOWY - symulacja API)
const VALID_LICENSES = {
    // 🔹 DODAJ TU SWOJE TESTOWE KLUCZE
    "SYNERGY-2024-001": { active: true, user: "Test User 1", expires: "2024-12-31" },
    "SYNERGY-2024-002": { active: true, user: "Test User 2", expires: "2024-12-31" },
    "TEST-KEY-12345":   { active: true, user: "Tester", expires: "2024-12-31" },
};

function validateLicense(key) {
    console.log("[License Server] Validation request for key:", key);
    // Symuluj opóźnienie sieciowe
    return new Promise((resolve) => {
        setTimeout(() => {
            const licenseInfo = VALID_LICENSES[key];
            if (licenseInfo && licenseInfo.active) {
                console.log("[License Server] Key VALID for user:", licenseInfo.user);
                resolve({ success: true, user: licenseInfo.user, expires: licenseInfo.expires });
            } else {
                console.log("[License Server] Key INVALID or inactive");
                resolve({ success: false, message: "Invalid or inactive license key" });
            }
        }, 800); // Opóźnienie 0.8s
    });
}
