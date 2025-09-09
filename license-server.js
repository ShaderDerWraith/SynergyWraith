// license-server.js (TYMCZASOWY - symulacja API)
const VALID_LICENSES = {
    // 🔹 DODAJ WIĘCEJ TESTOWYCH KLUCZY
    "SYNERGY-2024-001": { active: true, user: "Test User 1", expires: "2024-12-31" },
    "SYNERGY-2024-002": { active: true, user: "Test User 2", expires: "2024-12-31" },
    "SYNERGY-2024-003": { active: true, user: "Test User 3", expires: "2024-12-31" },
    "TEST-KEY-12345":   { active: true, user: "Tester", expires: "2024-12-31" },
    "DEV-ACCESS-777":   { active: true, user: "Developer", expires: "2024-12-31" },
    "BETA-TESTER-888":  { active: true, user: "Beta Tester", expires: "2024-12-31" }
};

function validateLicense(key) {
    console.log("[License Server] Validation request for key:", key);
    return new Promise((resolve) => {
        setTimeout(() => {
            const licenseInfo = VALID_LICENSES[key];
            if (licenseInfo && licenseInfo.active) {
                console.log("[License Server] Key VALID for user:", licenseInfo.user);
                resolve({ 
                    success: true, 
                    user: licenseInfo.user, 
                    expires: licenseInfo.expires,
                    key: key
                });
            } else {
                console.log("[License Server] Key INVALID or inactive");
                resolve({ 
                    success: false, 
                    message: "Invalid or inactive license key" 
                });
            }
        }, 800);
    });
}
