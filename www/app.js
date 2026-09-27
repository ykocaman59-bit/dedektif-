let map, marker, targetMarker;
let userUniqueIp = "";
const usersDbKey = "app_all_users_database";

document.addEventListener("DOMContentLoaded", () => {
    initMap();
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

// 12 Haneli Benzersiz IP Üretici (Her kullanıcı/cihaz için benzersiz)
function getOrCreateUserIp(email) {
    let allIps = JSON.parse(localStorage.getItem("app_user_ips_db") || "{}");
    if (allIps[email]) {
        return allIps[email];
    }
    // Tamamen rastgele 12 haneli benzersiz IP üretimi
    let newIp = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    allIps[email] = newIp;
    localStorage.setItem("app_user_ips_db", JSON.stringify(allIps));
    return newIp;
}

// Form Ekranı Değişiklikleri
function showRegisterForm() {
    document.getElementById("loginCard").style.display = "none";
    document.getElementById("registerCard").style.display = "block";
}

function showLoginForm() {
    document.getElementById("registerCard").style.display = "none";
    document.getElementById("loginCard").style.display = "block";
}

// Kayıt Ol İşlemi (Zorunlu Alanlar Kontrolü)
function handleRegister() {
    const fullName = document.getElementById("regFullName").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!fullName || !username || !email || !phone || !password) {
        showCustomModal("Lütfen tüm alanları eksiksiz doldurun!");
        return;
    }

    if (!email.endsWith("@gmail.com")) {
        showCustomModal("Lütfen geçerli bir Gmail adresi girin!");
        return;
    }

    let users = JSON.parse(localStorage.getItem(usersDbKey) || "[]");
    
    // Aynı mail kayıtlı mı kontrolü
    if (users.some(u => u.email === email)) {
        showCustomModal("Bu Gmail adresi ile zaten bir hesap kayıtlı!");
        return;
    }

    const newUser = { fullName, username, email, phone, password };
    users.push(newUser);
    localStorage.setItem(usersDbKey, JSON.stringify(users));

    showCustomModal("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
    showLoginForm();
}

// Giriş Yap İşlemi
function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        showCustomModal("Lütfen e-posta ve şifrenizi girin!");
        return;
    }

    let users = JSON.parse(localStorage.getItem(usersDbKey) || "[]");
    const validUser = users.find(u => u.email === email && u.password === password);

    if (validUser) {
        localStorage.setItem("loggedUserEmail", email);
        checkLoginState();
    } else {
        showCustomModal("Hatalı Gmail veya şifre! Lütfen bilgilerinizi kontrol edin.");
    }
}

// Oturum ve Arayüz Durum Kontrolü
function checkLoginState() {
    const loggedEmail = localStorage.getItem("loggedUserEmail");
    const loginCard = document.getElementById("loginCard");
    const registerCard = document.getElementById("registerCard");
    const appCard = document.getElementById("appCard");
    const trackingCard = document.getElementById("trackingCard");
    const mapCard = document.getElementById("mapCard");
    const profileNavBtn = document.getElementById("profileNavBtn");

    if (loggedEmail) {
        loginCard.style.display = "none";
        registerCard.style.display = "none";
        appCard.style.display = "block";
        trackingCard.style.display = "block";
        mapCard.style.display = "block";
        profileNavBtn.style.display = "block"; // Giriş yapıldığı için profil butonu görünür

        let users = JSON.parse(localStorage.getItem(usersDbKey) || "[]");
        const currentUser = users.find(u => u.email === loggedEmail);
        if (currentUser) {
            document.getElementById("welcomeUserText").innerText = "Hoş geldiniz, " + currentUser.fullName;
        }
    } else {
        loginCard.style.display = "block";
        registerCard.style.display = "none";
        appCard.style.display = "none";
        trackingCard.style.display = "none";
        mapCard.style.display = "none";
        profileNavBtn.style.display = "none"; // Giriş yapılmadığı için gizli
    }
}

function logout() {
    localStorage.removeItem("loggedUserEmail");
    checkLoginState();
}

// Profil Modalı İşlemleri
function openProfileModal() {
    const loggedEmail = localStorage.getItem("loggedUserEmail");
    if (!loggedEmail) return;

    let users = JSON.parse(localStorage.getItem(usersDbKey) || "[]");
    const currentUser = users.find(u => u.email === loggedEmail);

    if (currentUser) {
        document.getElementById("modalFullName").innerText = currentUser.fullName;
        document.getElementById("modalUsername").innerText = currentUser.username;
        document.getElementById("modalEmail").innerText = currentUser.email;
        document.getElementById("modalPhone").innerText = currentUser.phone;
        
        userUniqueIp = getOrCreateUserIp(currentUser.email);
        document.getElementById("myUniqueIpDisplay").value = userUniqueIp;
    }

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

// Hesap Silme Modalı İşlemleri
function confirmDeleteAccount() {
    document.getElementById("deleteConfirmModal").style.display = "flex";
}

function deleteAccountNo() {
    document.getElementById("deleteConfirmModal").style.display = "none";
}

function deleteAccountYes() {
    const loggedEmail = localStorage.getItem("loggedUserEmail");
    let users = JSON.parse(localStorage.getItem(usersDbKey) || "[]");
    
    // Kullanıcıyı veritabanından sil
    users = users.filter(u => u.email !== loggedEmail);
    localStorage.setItem(usersDbKey, JSON.stringify(users));

    // Oturumu kapat
    localStorage.removeItem("loggedUserEmail");
    
    document.getElementById("deleteConfirmModal").style.display = "none";
    closeProfileModal();
    checkLoginState();
    showCustomModal("Hesabınız başarıyla silindi.");
}

// Cihaz Eşleme & Rota
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
