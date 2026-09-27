// Örnek Veritabanı: Sistemde kayıtlı olan yetkili Gmail hesapları ve IP adresleri
const registeredUsers = [
    { email: "ornekuser1@gmail.com", ip: "A1B2C3D4E5F6" },
    { email: "testkullanici@gmail.com", ip: "123456789ABC" }
];

let currentUser = null;
let map, marker;
let watchId = null;

// 1. Cihazda ekli olan mailleri listeleme simülasyonu (Gerçek cihazda Native API / Cordova plugin kullanılabilir)
function openGmailPicker() {
    const modal = document.getElementById("gmail-modal");
    const listContainer = document.getElementById("gmail-list");
    
    // Tarayıcı ortamında test etmek veya cihazdaki hesapları simüle etmek için örnek liste
    const deviceGmails = [
        "ornekuser1@gmail.com",
        "kayitsizhesap@gmail.com", // Sistemde kayıtlı değil
        "testkullanici@gmail.com"
    ];

    listContainer.innerHTML = "";
    deviceGmails.forEach(email => {
        const item = document.createElement("div");
        item.className = "gmail-item";
        item.innerHTML = `<span>📧</span> <span>${email}</span>`;
        item.onclick = () => selectGmail(email);
        listContainer.appendChild(item);
    });

    modal.style.display = "flex";
}

function closeGmailPicker(e) {
    document.getElementById("gmail-modal").style.display = "none";
}

// 2. Gmail Seçildiğinde Kontrol Yapma
function selectGmail(email) {
    document.getElementById("gmail-modal").style.display = "none";

    // Sistemde kayıtlı mı kontrol et
    const foundUser = registeredUsers.find(u => u.email === email);

    if (!foundUser) {
        // HTML'de ID hatası olmaması için güvenli kontrol eklendi
        const errorEl = document.getElementById("login-error");
        if(errorEl) errorEl.textContent = "Giriş başarısız: Bu Gmail sistemde kayıtlı değil!";
        alert("Giriş Başarısız: Bu Gmail adresi sistemde kayıtlı değil.");
        return;
    }

    // Giriş Başarılı
    currentUser = foundUser;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-screen").style.display = "block";

    // Profili doldur
    document.getElementById("profile-email").textContent = currentUser.email;
    document.getElementById("user-ip").textContent = currentUser.ip;

    // Haritayı ve GPS İznini Başlat
    initMap();
}

// 3. Panoya Kopyalama Fonksiyonu
function copyIP() {
    const ipText = document.getElementById("user-ip").textContent;
    navigator.clipboard.writeText(ipText).then(() => {
        alert("IP adresi panoya kopyalandı: " + ipText);
    });
}

// 4. Modalları Açıp Kapatma
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    // Diğer modalı kapat
    document.querySelectorAll('.popup-modal').forEach(m => {
        if (m.id !== modalId) m.style.display = 'none';
    });
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

// 5. Cihaz Eşleştirme Kontrolü
function matchDevice() {
    const targetIp = document.getElementById("target-ip").value.trim();
    const msg = document.getElementById("match-message");

    const matchExists = registeredUsers.some(u => u.ip === targetIp);

    if (!matchExists) {
        msg.style.color = "red";
        msg.textContent = "Eşleşme başarısız: Sistemde böyle bir IP/Cihaz bulunamadı!";
    } else {
        msg.style.color = "green";
        msg.textContent = "Eşleşme başarılı! Canlı GPS verisi akıtılıyor.";
        // Burada eşleşen cihazın konumunu haritada gösterme tetiklenebilir
    }
}

// 6. Harita, Zorunlu GPS İzni ve Canlı Konum Takibi
function initMap() {
    if (navigator.geolocation) {
        // Kullanıcı giriş yaptıktan hemen sonra konum izni istenir ve ilk konum alınır
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Haritayı kullanıcının anlık konumuyla başlat
                map = L.map('map').setView([lat, lon], 15);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);

                marker = L.marker([lat, lon]).addTo(map).bindPopup("Canlı Konumunuz").openPopup();

                // Canlı Konum Takibini (Sürekli Güncelleme) Başlat
                startLiveTracking();
            },
            (error) => {
                console.error("GPS Alınamadı: ", error.message);
                alert("Uygulamanın çalışması ve harita takibi için GPS konum izni zorunludur! Lütfen cihaz ayarlarından konum izni verin.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        alert("Cihazınız veya tarayıcınız GPS konum özelliklerini desteklemiyor.");
    }
}

// 7. Canlı Konum Akışı (Sürekli Takip)
function startLiveTracking() {
    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            if (marker) {
                marker.setLatLng([lat, lon]);
                map.setView([lat, lon]); // Kullanıcı hareket ettikçe haritayı merkeze al
            }
        },
        (error) => {
            console.log("GPS takip hatası:", error.message);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
}
