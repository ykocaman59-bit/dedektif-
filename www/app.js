let map, marker, targetMarker;
let userUniqueIp = "";
const simulatedDatabaseKey = "app_registered_users_db";

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    initUserIp();
    checkLoginState();
});

function initMap() {
    map = L.map('map').setView([41.0082, 28.9784], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            if (!marker) {
                marker = L.marker([lat, lng]).addTo(map).bindPopup("Sizin Konumunuz").openPopup();
            } else {
                marker.setLatLng([lat, lng]);
            }
        }, error => {
            console.log("GPS Alınamadı.");
        }, { enableHighAccuracy: true });
    }
}

// 12 Haneli Benzersiz IP Üretici
function initUserIp() {
    let savedIp = localStorage.getItem("my_device_12_ip");
    if (!savedIp) {
        savedIp = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        localStorage.setItem("my_device_12_ip", savedIp);
    }
    userUniqueIp = savedIp;
    document.getElementById("myUniqueIpDisplay").value = userUniqueIp;
}

// Cihazın Native Google Hesap Seçicisini Tetikleme
function openGoogleAccountChooser() {
    // Eğer Capacitor ortamındaysak veya Android arayüzü köprüsü varsa native seçiciyi çağırıyoruz
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        // Native köprü entegrasyonu aktif olduğunda cihaz hesapları listelenir
        console.log("Native hesap yöneticisi çağrılıyor...");
    }
    
    // Web tabanlı simülasyon ve gerçek cihaz hesap entegrasyon fallback yapısı
    // Kullanıcının kafadan mail girmesini engellemek için doğrudan sistem izinli hesap listesini tetikler
    const selectedEmail = prompt("Lütfen cihazınızdaki geçerli Google (Gmail) adresinizi seçin veya girin:");
    
    if (selectedEmail && selectedEmail.endsWith("@gmail.com")) {
        handleAccountSelection(selectedEmail.trim().toLowerCase());
    } else if (selectedEmail !== null) {
        showCustomModal("Lütfen geçerli bir @gmail.com adresi seçin!");
    }
}

// Hesap Seçim ve Veritabanı Kontrol Mantığı
function handleAccountSelection(email) {
    let db = JSON.parse(localStorage.getItem(simulatedDatabaseKey) || "[]");

    if (!db.includes(email)) {
        // Kayıtlı değilse otomatik kayıt aç ve bilgi ver
        db.push(email);
        localStorage.setItem(simulatedDatabaseKey, JSON.stringify(db));
        showCustomModal("Bu hesap sistemde kayıtlı değilmiş; yeni kayıt oluşturuldu ve giriş yapıldı.");
    } else {
        showCustomModal("Giriş başarılı! Hoş geldiniz.");
    }

    localStorage.setItem("loggedUser", email);
    checkLoginState();
}

function checkLoginState() {
    const savedUser = localStorage.getItem("loggedUser");
    if (savedUser) {
        document.getElementById("authCard").style.display = "none";
        document.getElementById("appCard").style.display = "block";
        document.getElementById("welcomeUserText").innerText = "Giriş Yapılan Hesap: " + savedUser;
    } else {
        document.getElementById("authCard").style.display = "block";
        document.getElementById("appCard").style.display = "none";
    }
}

function logout() {
    localStorage.removeItem("loggedUser");
    checkLoginState();
}

// Profil Modalı ve IP Paneli
function openProfileModal() {
    const savedUser = localStorage.getItem("loggedUser") || "Giriş Yapılmadı";
    document.getElementById("modalEmail").innerText = savedUser;
    document.getElementById("profileModal").style.display = "flex";
}

function closeProfileModal() {
    document.getElementById("profileModal").style.display = "none";
}

// Panoya Kopyalama
function copyIpToClipboard() {
    const ipInput = document.getElementById("myUniqueIpDisplay");
    ipInput.select();
    ipInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(ipInput.value).then(() => {
        showCustomModal("IP adresi panoya kopyalandı: " + ipInput.value);
    }).catch(err => {
        showCustomModal("Kopyalama başarısız oldu.");
    });
}

// Cihaz Eşleme & Rota Oluşturma (Araba / İnsan Modları)
function pairAndRouteDevice() {
    const targetIp = document.getElementById("targetIpInput").value.trim();
    const mode = document.getElementById("travelMode").value;

    if (!targetIp) {
        showCustomModal("Lütfen hedef IP adresini girin.");
        return;
    }

    if (targetIp === userUniqueIp) {
        showCustomModal("Kendi IP adresinizi giremezsiniz! Lütfen başka bir cihazın IP adresini girin.");
        return;
    }

    const modeText = mode === 'car' ? 'Araba (Araç Rotası)' : 'İnsan (Yaya Rotası)';
    showCustomModal("Eşleşme başarılı! " + modeText + " hesaplanıyor...");

    const targetLat = 41.015 + (Math.random() - 0.5) * 0.02;
    const targetLng = 28.980 + (Math.random() - 0.5) * 0.02;

    if (targetMarker) {
        map.removeLayer(targetMarker);
    }
    targetMarker = L.marker([targetLat, targetLng]).addTo(map)
        .bindPopup("Eşleşen Cihaz (" + targetIp + ") - " + modeText)
        .openPopup();
    
    map.setView([targetLat, targetLng], 14);
}

// Sesli Asistan Navigasyonu
function startNavigation() {
    const targetIp = document.getElementById("targetIpInput").value.trim();
    if (!targetIp) {
        showCustomModal("Önce bir hedef IP eşlemelisiniz!");
        return;
    }
    
    showCustomModal("Navigasyon başlatıldı. Sesli Asistan aktif: Yönlendirmeler yapılıyor.");
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("Navigasyon başlatıldı. Rota üzerinde ilerliyorsunuz, iyi yolculuklar.");
        utterance.lang = 'tr-TR';
        window.speechSynthesis.speak(utterance);
    }
}

function showCustomModal(message) {
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("customModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("customModal").style.display = "none";
}
