# 🚦 Traffic Light Controller

Modern web-based traffic light controller untuk Wemos D1 R2 (ESP8266) dengan interface yang responsif dan fitur lengkap.

## ✨ Fitur Utama

- 🎮 **Kontrol Manual** - Kontrol individual untuk setiap lampu (merah, kuning, hijau)
- 🔄 **Mode Otomatis** - Siklus otomatis dengan timing yang dapat disesuaikan
- 🚨 **Emergency Stop** - Tombol darurat untuk mengaktifkan lampu merah
- ⚙️ **Settings** - Konfigurasi durasi untuk setiap lampu
- 📱 **Responsive Design** - Bekerja di desktop, tablet, dan mobile
- 🔗 **API Endpoints** - RESTful API untuk integrasi dengan Arduino/Wemos
- 📊 **Real-time Status** - Update status secara real-time
- ⌨️ **Keyboard Shortcuts** - Kontrol cepat menggunakan keyboard

## 🛠️ Teknologi

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **UI Components**: Radix UI, shadcn/ui
- **Hardware**: Wemos D1 R2 (ESP8266), LED 8mm 5V

## 🚀 Instalasi

1. **Clone repository**
\`\`\`bash
git clone https://github.com/sabenih726/traffic.git
cd traffic
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Jalankan server backend**
\`\`\`bash
npm run server
\`\`\`

4. **Jalankan frontend (terminal baru)**
\`\`\`bash
npm run dev
\`\`\`

5. **Akses aplikasi**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/traffic-status

## 📡 API Endpoints

### Untuk Arduino/Wemos D1 R2
- \`GET /traffic-status\` - Mendapatkan status traffic light
- \`GET /health\` - Health check server

### Untuk Web Interface
- \`POST /control-traffic\` - Kontrol traffic light
- \`POST /emergency\` - Emergency stop
- \`POST /update-settings\` - Update timing settings
- \`GET /current-traffic-status\` - Status saat ini
- \`GET /traffic-patterns\` - Pola traffic light
- \`GET /traffic-stats\` - Statistik sistem

## 🎮 Kontrol

### Manual Control
- **Merah**: Aktifkan lampu merah
- **Kuning**: Aktifkan lampu kuning  
- **Hijau**: Aktifkan lampu hijau

### Mode Otomatis
Siklus otomatis: Merah → Hijau → Kuning (repeat)

### Keyboard Shortcuts
- \`1\` - Lampu Merah
- \`2\` - Lampu Kuning
- \`3\` - Lampu Hijau
- \`A\` - Mode Auto
- \`0\` - Turn Off
- \`E\` - Emergency Stop

## ⚙️ Konfigurasi

### Default Timing
- Merah: 5 detik
- Kuning: 2 detik
- Hijau: 5 detik

Timing dapat disesuaikan melalui tab Settings di web interface.

## 🔌 Koneksi Hardware

### Wemos D1 R2 Pin Configuration
\`\`\`
LED Merah   -> Pin D1 (GPIO5)
LED Kuning  -> Pin D2 (GPIO4)
LED Hijau   -> Pin D3 (GPIO0)
GND         -> GND
VCC         -> 5V
\`\`\`

### Arduino Code Example
\`\`\`cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://192.168.1.100:3000/traffic-status";

#define RED_PIN D1
#define YELLOW_PIN D2
#define GREEN_PIN D3

void setup() {
  Serial.begin(115200);
  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
}

void loop() {
  // Get status from server
  HTTPClient http;
  http.begin(serverURL);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, payload);
    
    String color = doc["color"];
    
    // Control LEDs
    digitalWrite(RED_PIN, color == "red" ? HIGH : LOW);
    digitalWrite(YELLOW_PIN, color == "yellow" ? HIGH : LOW);
    digitalWrite(GREEN_PIN, color == "green" ? HIGH : LOW);
  }
  
  http.end();
  delay(1000);
}
\`\`\`

## 📱 Screenshots

- Modern responsive interface
- Real-time traffic light visualization
- Configurable timing settings
- Emergency controls

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail.

## 🆘 Support

Jika mengalami masalah atau butuh bantuan:
1. Check dokumentasi di README
2. Buat issue di GitHub
3. Contact: sabenih726@gmail.com
