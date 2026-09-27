let map, marker;
const userDeviceIp = "192.168.1.50"; // Simüle edilmiş cihazın kendi IP adresi

// Sayfa yüklendiğinde haritayı ve oturum durumunu başlat
document.addEventListener("DOMContentLoaded", () => {
    initMap();
    checkLoginState();
});

function initMap() {
    // İstanbul merkezli başlangıç haritası
    map = L.map('map').setView([41.0082, 28.9784], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
}

// Gmail Seçici Akışı
function openGmailSelector() {
    const userEmail = prompt("Google hesabınızla devam etmek için lütfen Gmail adresinizi girin:\n(Örn: kullanici@gmail.com)");
    
    if (userEmail && userEmail.includes("@gmail.com")) {
        localStorage.setItem("loggedUser", userEmail);
        checkLoginState();
    } else if (userEmail !== null) {
        showCustomModal("Lütfen geçerli bir @gmail.com adresi girin!");
    }
}

function checkLoginState() {
    const savedUser = localStorage.getItem("loggedUser");
    if (savedUser) {
        document.getElementById("loginCard").style.display = "none";
        document.getElementById("appCard").style.display = "block";
        document.getElementById("userEmailDisplay").innerText = "Hesap: " + savedUser;
    } else {
        document.getElementById("loginCard").style.display = "block";
        document.getElementById("appCard").style.display = "none";
    }
}

function logout() {
    localStorage.removeItem("loggedUser");
    checkLoginState();
}

// IP Eşleme Kontrolü (Kendi IP'sini engelleme ve özel uyarı paneli)
function pairDevice() {
    const enteredIp = document.getElementById("targetIpInput").value.trim();

    if (!enteredIp) {
        showCustomModal("Lütfen geçerli bir IP adresi yazın.");
        return;
    }

    // Kullanıcının kendi IP adresini girmesini engelleme kontrolü
    if (enteredIp === userDeviceIp || enteredIp === "127.0.0.1" || enteredIp === "localhost") {
        showCustomModal("Kendi IP adresinizi giremezsiniz! Lütfen kendi IP adresiniz haricinde başka bir cihazın IP adresini girin.");
        return;
    }

    // Başarılı eşleşme senaryosu
    alert("Eşleşme başarılı! Hedef IP: " + enteredIp);
    
    // Haritada örnek bir konumu gösterme
    if (map && marker) {
        map.removeLayer(marker);
    }
    marker = L.marker([41.015, 28.980]).addTo(map)
        .bindPopup("Eşleşen Cihaz Konumu (" + enteredIp + ")")
        .openPopup();
    map.setView([41.015, 28.980], 15);
}

// Özel Uyarı Kutusunu Göster / Kapat
function showCustomModal(message) {
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("customModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("customModal").style.display = "none";
}
