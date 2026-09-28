// Supabase Bağlantı Bilgileri
const SUPABASE_URL = 'https://tlsvemiagbctqvwrosup.supabase.co';
const SUPABASE_KEY = 'Sb_publishable_5B2oG-hRXxPXiHFyblZbHA_anIZHIIX';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let map, marker, targetMarker;
let watchId = null;

// Ekran Değiştirme Fonksiyonu
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// 12 Haneli Benzersiz IP Üretici
function generateUniqueIP() {
    let result = '';
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 12; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Navigasyon Geçişleri
document.getElementById('go-to-register').addEventListener('click', (e) => { e.preventDefault(); showScreen('register-screen'); });
document.getElementById('go-to-login').addEventListener('click', (e) => { e.preventDefault(); showScreen('login-screen'); });
document.getElementById('btn-back-profile').addEventListener('click', () => { showScreen('profile-screen'); if(watchId) navigator.geolocation.clearWatch(watchId); });

// KROİD: Kayıt Olma
document.getElementById('btn-register').addEventListener('click', async () => {
    const full_name = document.getElementById('reg-fullname').value;
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;

    if (!email.endsWith('@gmail.com')) {
        alert('Lütfen geçerli bir @gmail.com adresi girin!');
        return;
    }

    const device_ip = generateUniqueIP();

    const { data, error } = await supabaseClient
        .from('app_users')
        .insert([{ full_name, username, email, phone, password, device_ip }])
        .select();

    if (error) {
        alert('Kayıt Hatası: ' + error.message);
    } else {
        alert('Kayıt başarılı! Cihaz IP ID\'niz: ' + device_ip);
        showScreen('login-screen');
    }
});

// GİRİŞ: Oturum Açma
document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabaseClient
        .from('app_users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

    if (error || !data) {
        alert('Giriş başarısız! E-posta veya şifre hatalı.');
    } else {
        currentUser = data;
        document.getElementById('prof-name').innerText = currentUser.full_name;
        document.getElementById('prof-username').innerText = currentUser.username;
        document.getElementById('prof-email').innerText = currentUser.email;
        document.getElementById('prof-ip').innerText = currentUser.device_ip;
        showScreen('profile-screen');
    }
});

// HARİTA VE KONUM TAKİBİ
document.getElementById('btn-open-map').addEventListener('click', () => {
    showScreen('map-screen');
    initMap();
});

function initMap() {
    if (!map) {
        map = L.map('map').setView([41.0082, 28.9784], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);
    } else {
        map.invalidateSize();
    }

    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            if (!marker) {
                marker = L.marker([lat, lng]).addTo(map).bindPopup('Buradasınız').openPopup();
            } else {
                marker.setLatLng([lat, lng]);
            }
            map.setView([lat, lng], 16);
        }, err => alert('Konum alınamadı: ' + err.message), { enableHighAccuracy: true });
    }
}

// SESLİ NAVİGASYON (Web Speech API)
document.getElementById('btn-speak').addEventListener('click', () => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("Navigasyon başlatıldı. Lütfen rotayı takip edin.");
        utterance.lang = 'tr-TR';
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Tarayıcınız sesli komut özelliğini desteklemiyor.');
    }
});
