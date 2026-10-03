// Senin Firebase yapılandırma bilgilerin
const firebaseConfig = {
  apiKey: "AIzaSyA-rrU1BnXwN7rH0v4VHBJtAlFnMLelPUA",
  authDomain: "gps-takip-e90da.firebaseapp.com",
  projectId: "gps-takip-e90da",
  storageBucket: "gps-takip-e90da.firebasestorage.app",
  messagingSenderId: "659536651462",
  appId: "1:659536651462:web:5d0552f8080bb5815fe3c7"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Bağlantı durumunu arayüze yansıt
document.getElementById("connection-status").innerText = "Firebase Bağlandı";
document.getElementById("connection-status").style.backgroundColor = "#2e7d32";

// Haritayı Başlat (İstanbul merkezli örnek başlangıç)
const map = L.map('map').setView([41.0082, 28.9784], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let userMarker = null;
let watchId = null;

const btnShare = document.getElementById("btn-share");
const btnStop = document.getElementById("btn-stop");

// Konum Paylaşımı Başlat
btnShare.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Tarayıcınız konum desteklemiyor.");
        return;
    }

    btnShare.disabled = true;
    btnStop.disabled = false;

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const timestamp = Date.now();

            // Haritada konumu güncelle
            if (userMarker) {
                userMarker.setLatLng([lat, lng]);
            } else {
                userMarker = L.marker([lat, lng]).addTo(map)
                    .bindPopup("Buradasınız").openPopup();
            }
            map.setView([lat, lng], 16);

            // Firestore Veritabanına Anlık Konum Kaydetme
            db.collection("locations").add({
                latitude: lat,
                longitude: lng,
                timestamp: timestamp
            })
            .then(() => {
                console.log("Konum veritabanına kaydedildi:", lat, lng);
            })
            .catch((error) => {
                console.error("Kayıt hatası: ", error);
            });
        },
        (error) => {
            console.error("Konum alınamadı: ", error);
            alert("Konum alınamadı. GPS açık olduğundan emin olun.");
            stopSharing();
        },
        {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 20000
        }
    );
});

// Paylaşımı Durdur
btnStop.addEventListener("click", stopSharing);

function stopSharing() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    btnShare.disabled = false;
    btnStop.disabled = true;
}
