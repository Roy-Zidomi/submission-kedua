# Story App - Interactive Story Map Application

Aplikasi web interaktif untuk berbagi cerita dengan lokasi menggunakan peta digital. Dibangun dengan Vanilla JavaScript, HTML, dan CSS tanpa framework.

## 🎯 Fitur Utama

### Authentication
- ✅ Login & Register dengan validasi form
- ✅ Token-based authentication
- ✅ Protected routes

### Home Page
- ✅ Tampilan list cerita dengan gambar dan informasi
- ✅ Peta interaktif menggunakan Leaflet.js
- ✅ Marker untuk setiap lokasi cerita
- ✅ Popup informasi di marker
- ✅ Layer control (Street Map & Satellite)
- ✅ Filter lokasi (All Stories / With Location)
- ✅ Highlight marker aktif
- ✅ Sinkronisasi klik list ↔ marker
- ✅ Auto fit bounds ke semua marker

### Create Story Page
- ✅ Form tambah cerita dengan validasi
- ✅ Upload gambar (drag & drop support)
- ✅ Akses kamera untuk foto langsung
- ✅ Auto close camera stream
- ✅ Pilih lokasi dengan klik pada peta
- ✅ Submit data secara asynchronous

### Aksesibilitas & UX
- ✅ HTML semantik
- ✅ Alt text untuk gambar
- ✅ Label untuk input
- ✅ Skip to content link
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ ARIA labels
- ✅ Responsive design (375px, 768px, 1024px)

### Technical Features
- ✅ Single Page Application (SPA)
- ✅ Hash-based routing
- ✅ View transitions
- ✅ MVP architecture
- ✅ ES Modules
- ✅ Modern CSS (Flexbox/Grid)
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation

## 📁 Struktur Folder

```
src/
├── public/
│   └── images/
│
├── scripts/
│   ├── data/
│   │   └── api.js              # API Service
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login-page.js   # Login page
│   │   │   └── register-page.js # Register page
│   │   ├── home/
│   │   │   └── home-page.js    # Home page with map
│   │   ├── create/
│   │   │   └── create-page.js  # Create story page
│   │   └── app.js              # Main app controller
│   │
│   ├── routes/
│   │   ├── routes.js           # Route definitions
│   │   └── url-parser.js       # URL parser utility
│   │
│   └── utils/
│       ├── index.js            # Utility functions
│       ├── config.js           # App configuration
│       └── view-transition.js  # View transition handler
│
├── styles/
│   └── styles.css              # Main stylesheet
│
└── index.html                  # Entry point
```

## 🚀 Cara Menggunakan

### 1. Setup Project

```bash
# Clone atau copy semua file ke project folder Anda

# Install dependencies
npm install

# Development mode (akan otomatis membuka browser di port 9000)
npm run start-dev

# Build production
npm run build

# Serve production build
npm run serve
```

### 2. Struktur File yang Diperlukan
Pastikan struktur folder Anda seperti ini:

```
project-root/
├── src/
│   ├── public/
│   │   ├── images/
│   │   └── favicon.png (optional)
│   ├── scripts/
│   │   ├── data/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── login-page.js
│   │   │   │   └── register-page.js
│   │   │   ├── home/
│   │   │   │   └── home-page.js
│   │   │   ├── create/
│   │   │   │   └── create-page.js
│   │   │   └── app.js
│   │   ├── routes/
│   │   │   ├── routes.js
│   │   │   └── url-parser.js
│   │   └── utils/
│   │       ├── index.js
│   │       ├── config.js
│   │       └── view-transition.js
│   ├── styles/
│   │   └── styles.css
│   └── index.html
├── .babelrc
├── .gitignore
├── package.json
├── webpack.common.js
├── webpack.dev.js
└── webpack.prod.js
```

### 3. Akses Aplikasi
- Development: `http://localhost:9000`
- Production (setelah build): `http://localhost:8080` (via npm run serve)

### 4. Register & Login
1. Klik "Register" untuk membuat akun baru
2. Isi form dengan:
   - Name (minimal 3 karakter)
   - Email (format valid)
   - Password (minimal 8 karakter)
3. Setelah berhasil, login dengan kredensial yang dibuat

### 5. Melihat Stories
- Home page menampilkan semua cerita dalam list dan peta
- Klik pada story card untuk highlight di peta
- Klik pada marker untuk scroll ke story card
- Gunakan layer control untuk ganti tile map
- Filter cerita berdasarkan lokasi

### 6. Membuat Story Baru
1. Klik tombol "Add Story"
2. Upload gambar:
   - Klik area upload untuk browse file
   - Drag & drop gambar
   - Atau gunakan kamera untuk foto langsung
3. Isi deskripsi cerita
4. Klik pada peta untuk memilih lokasi
5. Klik "Publish Story"

## 🎨 Design System

### Color Palette
- Primary: `#2563eb` (Blue)
- Secondary: `#64748b` (Slate)
- Success: `#10b981` (Green)
- Error: `#ef4444` (Red)
- Background: `#f8fafc` (Light Gray)
- Text: `#0f172a` (Dark)

### Typography
- Font: System fonts (Apple SF, Segoe UI, Roboto)
- Base size: 16px
- Line height: 1.6

### Spacing & Layout
- Container max-width: 1200px
- Grid gap: 1-2rem
- Border radius: 6-12px

## 🔧 API Configuration

Aplikasi ini menggunakan Dicoding Story API:

```javascript
BASE_URL: 'https://story-api.dicoding.dev/v1'

Endpoints:
- POST /register
- POST /login
- GET /stories?location=1
- POST /stories (multipart/form-data)
```

## ⌨️ Keyboard Navigation

- `Tab` - Navigate between elements
- `Enter/Space` - Activate buttons and links
- `Escape` - Close modals/dialogs
- Story cards are keyboard accessible

## 📱 Responsive Breakpoints

- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px

## 🌐 Browser Support

- Modern browsers dengan ES6+ support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔐 Security Features

- Token-based authentication
- Protected routes
- XSS prevention (innerHTML sanitization)
- Form validation
- HTTPS API calls

## 📝 Notes

1. **Camera Access**: Membutuhkan HTTPS atau localhost untuk akses kamera
2. **Location Services**: Marker menggunakan koordinat dari API
3. **Image Upload**: Maksimal ukuran file sesuai API limit
4. **Token Storage**: Menggunakan localStorage (production gunakan httpOnly cookies)

## 🐛 Troubleshooting

### Map tidak muncul
- Pastikan Leaflet CSS & JS ter-load
- Check console untuk errors
- Pastikan ada koneksi internet

### Camera tidak bisa diakses
- Gunakan HTTPS atau localhost
- Check browser permissions
- Pastikan device memiliki camera

### Login gagal
- Check credentials
- Pastikan API endpoint aktif
- Check network connection

## 📄 License

Educational project - Free to use and modify

## 👨‍💻 Developer Notes

### Menambah Route Baru
1. Buat file page di `scripts/pages/`
2. Export class dengan method `render()` dan `afterRender()`
3. Daftarkan di `scripts/routes/routes.js`

### Menambah API Endpoint
Tambahkan method baru di `scripts/data/api.js`

### Custom Styling
Edit `styles/styles.css` sesuai kebutuhan

## 🎓 Learning Resources

- [Leaflet.js Documentation](https://leafletjs.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

Built with ❤️ using Vanilla JavaScript