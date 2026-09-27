let map, marker;
let userDeviceIp = "192.168.1.50"; // Simüle edilmiş veya cihazın kendi IP adresi

// Sayfa yüklendiğinde haritayı başlat
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

// Gerçekçi Gmail Seçici Paneli (Prompt Alternatifi)
function openGmailSelector() {
    // Örnek kayıtlı/cihazda bulunan mailler (gerçek senaryoda Google Sign-In SDK veya hesap listesi gelir)
    const simulatedGmail = prompt("Lütfen kullanmak istediğiniz Gmail adresinizi girin:\n(Örn: kullanici@gmail.com)");
    
    if (simulatedGmail && simulatedGmail.includes("@gmail.com")) {
        localStorage.setItem("loggedUser", simulatedGmail);
        checkLoginState();
    } else if (simulatedGmail !== null) {
        showCustomModal("Geçerli bir @gmail.com adresi girmelisiniz!");
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

// IP Eşleme Kontrolü (Kendi IP'sini engelleme)
function pairDevice() {
    const enteredIp = document.getElementById("targetIpInput").value.trim();

    if (!enteredIp) {
        showCustomModal("Lütfen geçerli bir IP adresi yazın.");
        return;
    }

    // Kullanıcının kendi IP adresini girmesini engelleme kontrolü
    if (enteredIp === userDeviceIp || enteredIp === "127.0.0.1" || enteredIp === "localhost") {
        showCustomModal("Kendi IP adresinizi buraya yazamazsınız! Lütfen başka bir cihazın IP adresini girin.");
        return;
    }

    // Başarılı eşleşme senaryosu
    alert("Eşleşme başarılı! Hedef IP: " + enteredIp);
    
    // Haritada örnek bir konuma odaklanma (canlı simülasyon)
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
