let map, marker, targetMarker;
let isRegisterMode = false; // false = Giriş modu, true = Kayıt modu
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

    // Kullanıcının kendi konumunu canlı simüle et veya al
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
            console.log("GPS Alınamadı, varsayılan İstanbul konumu kullanılıyor.");
        }, { enableHighAccuracy: true });
    }
}

// 12 Haneli Benzersiz IP Üretici (Cihaz başına kalıcı)
function initUserIp() {
    let savedIp = localStorage.getItem("my_device_12_ip");
    if (!savedIp) {
        // 12 haneli rastgele sayı veya kod üretimi
        savedIp = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        localStorage.setItem("my_device_12_ip", savedIp);
    }
    userUniqueIp = savedIp;
    document.getElementById("myUniqueIpDisplay").value = userUniqueIp;
}

// Giriş / Kayıt Modunu Değiştirme
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    const title = document.getElementById("authTitle");
    const desc = document.getElementById("authDesc");
    const btn = document.getElementById("authActionButton");
    const toggleBtn = document.getElementById("toggleAuthBtn");

    if (isRegisterMode) {
        title.innerText = "Yeni Hesap Kaydı";
        desc.innerText = "Kayıt olmak istediğiniz Gmail adresini yazın:";
        btn.innerText = "Kayıt Ol";
        toggleBtn.innerText = "Zaten hesabınız var mı? Giriş Yap";
    } else {
        title.innerText = "Sisteme Giriş Yap";
        desc.innerText = "Devam etmek için kayıtlı Gmail adresinizi girin:";
        btn.innerText = "Giriş Yap";
        toggleBtn.innerText = "Hesabınız yok mu? Kayıt Ol";
    }
}

// Kimlik Doğrulama / Kayıt Mantığı
function handleAuthAction() {
    const email = document.getElementById("userEmailInput").value.trim().toLowerCase();

    if (!email || !email.endsWith("@gmail.com")) {
        showCustomModal("Lütfen geçerli bir @gmail.com adresi girin!");
        return;
    }

    let db = JSON.parse(localStorage.getItem(simulatedDatabaseKey) || "[]");

    if (isRegisterMode) {
        // Kayıt Olma İşlemi
        if (db.includes(email)) {
            showCustomModal("Bu Gmail adresi zaten sistemde mevcut! Lütfen giriş yapın.");
            return;
        }
        db.push(email);
        localStorage.setItem(simulatedDatabaseKey, JSON.stringify(db));
        showCustomModal("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        toggleAuthMode();
    } else {
        // Giriş Yapma İşlemi
        if (!db.includes(email)) {
            showCustomModal("Bu Gmail adresi sistemde kayıtlı değil! Önce kayıt olmalısınız.");
            return;
        }
        localStorage.setItem("loggedUser", email);
        checkLoginState();
    }
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

// Profil Modalı İşlemleri
function openProfileModal() {
    const savedUser = localStorage.getItem("loggedUser") || "Giriş Yapılmadı";
    document.getElementById("modalEmail").innerText = savedUser;
    document.getElementById("profileModal").style.display = "flex";
}

function closeProfileModal() {
    document.getElementById("profileModal").style.display = "none";
}

// Panoya Kopyalama Özelliği
function copyIpToClipboard() {
    const ipInput = document.getElementById("myUniqueIpDisplay");
    ipInput.select();
    ipInput.setSelectionRange(0, 99999); // Mobil uyumluluk için
    navigator.clipboard.writeText(ipInput.value).then(() => {
        showCustomModal("IP adresi panoya kopyalandı: " + ipInput.value);
    }).catch(err => {
        showCustomModal("Kopyalama başarısız oldu.");
    });
}

// Cihaz Eşleme ve Rota Oluşturma
function pairAndRouteDevice() {
    const targetIp = document.getElementById("targetIpInput").value.trim();
    const mode = document.getElementById("travelMode").value;

    if (!targetIp) {
        showCustomModal("Lütfen hedef IP adresini girin.");
        return;
    }

    // Kendi IP adresini engelleme kontrolü
    if (targetIp === userUniqueIp) {
        showCustomModal("Kendi IP adresinizi giremezsiniz! Lütfen başka bir cihazın IP adresini girin.");
        return;
    }

    showCustomModal("Eşleşme başarılı! (" + (mode === 'car' ? 'Araba' : 'Yaya') + " modu için rota hesaplanıyor...)");

    // Haritada hedef konumu simüle etme ve odaklanma
    const targetLat = 41.015 + (Math.random() - 0.5) * 0.02;
    const targetLng = 28.980 + (Math.random() - 0.5) * 0.02;

    if (targetMarker) {
        map.removeLayer(targetMarker);
    }
    targetMarker = L.marker([targetLat, targetLng]).addTo(map)
        .bindPopup("Eşleşen Cihaz (" + targetIp + ")")
        .openPopup();
    
    map.setView([targetLat, targetLng], 14);
}

// Sesli Asistan / Navigasyon Başlatma Simülasyonu
function startNavigation() {
    const targetIp = document.getElementById("targetIpInput").value.trim();
    if (!targetIp) {
        showCustomModal("Önce bir hedef IP eşlemelisiniz!");
        return;
    }
    
    showCustomModal("Navigasyon başlatıldı. Sesli Asistan aktif: Rota boyunca yönlendiriliyorsunuz.");
    
    // Tarayıcı sesli sentez (SpeechSynthesis) desteği varsa sesli uyarı verir
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("Navigasyon başlatıldı. 100 metre sonra sağa dönün.");
        utterance.lang = 'tr-TR';
        window.speechSynthesis.speak(utterance);
    }
}

// Özel Uyarı Modalı
function showCustomModal(message) {
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("customModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("customModal").style.display = "none";
}
