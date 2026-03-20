# OverHeatMenth 🖥️

Windows için gelişmiş sistem monitörü — Electron + React + TypeScript

## Özellikler

- ⚡ **Gerçek zamanlı** CPU, GPU, RAM, Disk, Ağ izleme (1 saniye güncelleme)
- 📊 **Canlı grafikler** — 60 saniyelik geçmiş grafikleri
- 🌡️ **Sıcaklık takibi** — CPU çekirdek sıcaklıkları
- 🎮 **Tüm GPU'lar** — NVIDIA, AMD, Intel (systeminformation kütüphanesi)
- 💾 **RAM yuvaları** — slot bazlı detaylı bellek bilgisi
- 🗂️ **Süreçler** — 50 satır sayfalama, sıralama, arama
- 🌐 **Ağ** — arayüz bazlı detaylı istatistikler
- 🌙 **Karanlık / Aydınlık tema**
- 🇹🇷 **Türkçe / İngilizce** arayüz
- 🪟 Windows native başlık çubuğu entegrasyonu

---

## Kurulum

### Gereksinimler

- **Node.js** v18 veya üzeri → https://nodejs.org
- **Git** (opsiyonel)
- **Windows 10/11**

### Adımlar

```bash
# 1. Proje klasörüne gir
cd sysmonitor-pro

# 2. Bağımlılıkları yükle
npm install

# 3. Geliştirme modunda çalıştır
npm run dev
```

### Geliştirme Modu
Electron penceresi açılır, her değişiklikte otomatik yenilenir.

### Dağıtım (EXE oluşturma)
```bash
npm run build
```
`dist-installer/` klasöründe `.exe` kurulum dosyası oluşur.

---

## Proje Yapısı

```
sysmonitor-pro/
├── electron/
│   ├── main.ts          # Electron ana process, IPC handlers
│   └── preload.ts       # Güvenli API köprüsü (contextBridge)
├── src/
│   ├── components/
│   │   ├── Charts.tsx       # MiniChart, FullChart bileşenleri
│   │   ├── Sidebar.tsx      # Sol navigasyon
│   │   ├── Topbar.tsx       # Üst çubuk
│   │   ├── OverviewPage.tsx # Genel bakış sayfası
│   │   ├── CpuPage.tsx      # İşlemci sayfası
│   │   ├── GpuPage.tsx      # GPU sayfası
│   │   ├── MemoryPage.tsx   # Bellek sayfası
│   │   ├── DiskPage.tsx     # Depolama sayfası
│   │   ├── NetworkPage.tsx  # Ağ sayfası
│   │   ├── ProcessesPage.tsx# Süreçler sayfası
│   │   └── SystemPage.tsx   # Sistem bilgisi sayfası
│   ├── hooks/
│   ├── i18n/
│   │   └── translations.ts  # TR/EN çeviriler
│   ├── store/
│   │   └── useStore.ts      # Zustand global state
│   ├── styles/
│   │   └── global.css       # Tüm CSS (CSS variables, dark/light)
│   ├── types/
│   │   └── index.ts         # TypeScript tipleri
│   ├── utils/
│   │   ├── format.ts        # Formatlama fonksiyonları
│   │   └── chartSetup.ts    # Chart.js kayıt
│   ├── App.tsx              # Ana bileşen, veri döngüsü
│   └── main.tsx             # React entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Teknik Detaylar

### Veri Akışı
```
Electron Main (systeminformation)
    ↓ IPC (ipcMain.handle)
Preload (contextBridge)
    ↓ window.electronAPI
React App (useEffect + setInterval)
    ↓ Zustand Store
Bileşenler (Chart.js grafikler)
```

### Kullanılan Kütüphaneler
| Kütüphane | Amaç |
|-----------|-------|
| `systeminformation` | Windows donanım verisi (WMI) |
| `electron` | Masaüstü pencere + native API |
| `react` + `typescript` | UI framework |
| `zustand` | Global state yönetimi |
| `chart.js` + `react-chartjs-2` | Grafikler |
| `vite` | Build tool |

### Performans
- Güncelleme aralığı: 500ms / 1s / 2s / 5s (seçilebilir)
- Geçmiş: sadece RAM'de, son 60 veri noktası
- Disk'e hiçbir şey yazılmaz
- Electron renderer process hafif kalır

---

## Geliştirme Notları

### Tarayıcıda Test
Electron olmadan da çalışır (mock veri ile):
```bash
npm run preview
```

### GPU Verisi
- NVIDIA: `systeminformation` nvidia-smi üzerinden okur
- AMD: WMI üzerinden
- Intel: WMI üzerinden
- Birden fazla GPU varsa hepsi gösterilir

### Sorun Giderme
```bash
# node_modules temizle ve yeniden yükle
rm -rf node_modules
npm install

# Electron yeniden indir
npm rebuild electron
```
