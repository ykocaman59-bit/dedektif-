// Supabase Bağlantı Bilgileri
const SUPABASE_URL = 'https://tlsvemiagbctqvwrosup.supabase.co';
const SUPABASE_KEY = 'Sb_publishable_5B2oG-hRXxPXiHFyblZbHA_anIZHIIX';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let map, marker, targetMarker;
let watchId = null;
let syncInterval = null;

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
document.getElementById('btn-back-profile').addEventListener('click', () => {
    showScreen('profile-screen');
    if(watchId) navigator.geolocation.clearWatch(watchId);
    if(syncInterval) clearInterval(syncInterval);
});

// Kayıt Olma
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

    const { error } = await supabaseClient
        .from('app_users')
        .insert([{ full_name, username, email, phone, password, device_ip }]);

    if (error) {
        alert('Kayıt Hatası: ' + error.message);
    } else {
        alert('Kayıt başarılı! Cihaz IP ID\'niz: ' + device_ip);
        showScreen('login-screen');
    }
});

// Giriş Yapma
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

// Cihaz Eşleştirme (Hedef IP Kaydetme)
document.getElementById('btn-pair').addEventListener('click', async () => {
    const targetIp = document.getElementById('target-ip-input').value.trim();
    if (!targetIp) {
        alert('Lütfen 12 haneli hedef IP girin!');
        return;
    }

    // Hedef IP'nin veritabanında var olup olmadığını kontrol et
    const { data, error } = await supabaseClient
        .from('app_users')
        .select('device_ip, full_name')
        .eq('device_ip', targetIp)
        .single();

    if (error || !data) {
        alert('Bu IP adresine sahip bir cihaz bulunamadı!');
        return;
    }

    // Kendi kullanıcımıza hedef IP'yi kaydedelim
    const { error: updateError } = await supabaseClient
        .from('app_users')
        .update({ target_ip: targetIp })
        .eq('id', currentUser.id);

    if (updateError) {
        alert('Eşleştirme hatası: ' + updateError.message);
    } else {
        currentUser.target_ip = targetIp;
        alert(`${data.full_name} adlı cihazla başarıyla eşleştirildi! Şimdi haritayı açabilirsiniz.`);
    }
});

// Haritayı Aç ve Canlı Takibi Başlat
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

    // 1. Kendi Konumumuzu Sürekli Takip Et ve Supabase'e Gönder
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(async position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Haritada kendi konumumuzu güncelleyelim
            if (!marker) {
                marker = L.marker([lat, lng]).addTo(map).bindPopup('Siz Buradasınız').openPopup();
            } else {
                marker.setLatLng([lat, lng]);
            }

            // Konumumuzu veritabanına kaydedelim
            await supabaseClient
                .from('app_users')
                .update({ latitude: lat, longitude: lng })
                .eq('id', currentUser.id);

        }, err => alert('Konum alınamadı: ' + err.message), { enableHighAccuracy: true });
    }

    // 2. Eşleşilen Hedef Cihazın Konumunu Periyodik Olarak Çek ve Haritada Göster
    syncInterval = setInterval(async () => {
        if (!currentUser.target_ip) return;

        const { data, error } = await supabaseClient
            .from('app_users')
            .select('latitude, longitude, full_name')
            .eq('device_ip', currentUser.target_ip)
            .single();

        if (!error && data && data.latitude && data.longitude) {
            const targetLat = data.latitude;
            const targetLng = data.longitude;

            if (!targetMarker) {
                targetMarker = L.marker([targetLat, targetLng], {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41]
                    })
                }).addTo(map).bindPopup(`Hedef: ${data.full_name}`).openPopup();
            } else {
                targetMarker.setLatLng([targetLat, targetLng]);
            }
        }
    }, 4000); // Her 4 saniyede bir karşı tarafın konumunu günceller
}

// Sesli Navigasyon (Web Speech API)
document.getElementById('btn-speak').addEventListener('click', () => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("Canlı takip ve rota yönlendirmesi aktif.");
        utterance.lang = 'tr-TR';
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Tarayıcınız sesli komut özelliğini desteklemiyor.');
    }
});
