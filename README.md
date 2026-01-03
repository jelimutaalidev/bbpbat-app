# Sistem Informasi PKL/Magang BBPBAT

![BBPBAT Application](https://img.shields.io/badge/Status-Development-blue?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-React_TypeScript-61DAFB?style=for-the-badge&logo=react)
![Backend](https://img.shields.io/badge/Backend-Django_Python-092E20?style=for-the-badge&logo=django)

Aplikasi manajemen PKL/Magang terintegrasi untuk Balai Besar Perikanan Budidaya Air Tawar (BBPBAT). Aplikasi ini menggabungkan frontend modern berbasis React dengan backend Django yang handal dalam arsitektur Monorepo.

## 🌟 Fitur Utama

*   **Manajemen Peserta (Students)**: Pendaftaran, biodata, dan administrasi peserta PKL.
*   **Bimbingan (Guidance)**: Pemantauan progres magang, laporan harian/mingguan, dan bimbingan dosen/pembimbing lapangan.
*   **Pengumuman (Announcements)**: Sistem informasi terpusat untuk peserta magang.
*   **Sertifikat Digital**: Generasi sertifikat magang otomatis (PDF) dengan integrasi data backend.
*   **Geolokasi**: Fitur berbasis peta untuk pemantauan lokasi (menggunakan Leaflet).

## 🛠️ Teknologi yang Digunakan

### Frontend
*   **Framework**: [React](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **State & Networking**: Axios, React Query (Implicit/Recommended)
*   **PDF Tools**: jsPDF, html2canvas, pdf-lib
*   **UI Components**: Lucide React, Framer Motion

### Backend
*   **Framework**: [Django](https://www.djangoproject.com/)
*   **API**: Django Rest Framework (DRF)
*   **Database**: SQLite (Development) / PostgreSQL (Production ready)
*   **Authentication**: JWT / Session based

---

## 🚀 Panduan Instalasi

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal Anda.

### Prasyarat
*   [Node.js](https://nodejs.org/) (v16 atau lebih baru)
*   [Python](https://www.python.org/) (v3.10 atau lebih baru)
*   [Git](https://git-scm.com/)

### 1. Clone Repository
```bash
git clone https://github.com/username/bbpbat-app.git
cd bbpbat-app
```

### 2. Setup Backend (Django)
Buka terminal baru di folder root project.

```bash
# Masuk ke direktori backend
cd bbpbat_backend_project

# Buat Virtual Environment
python -m venv venv

# Aktifkan Virtual Environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Setup Database
python manage.py migrate

# Jalankan Server Backend
python manage.py runserver
```
Backend akan berjalan di: `http://127.0.0.1:8000`

### 3. Setup Frontend (React)
Buka terminal **baru** (biarkan backend tetap jalan) di folder root project.

```bash
# Install Dependencies (hanya perlu sekali di awal)
npm install

# Jalankan Development Server
npm run dev
```
Frontend akan berjalan di: `http://localhost:5173`

---

## 📂 Struktur Project (Monorepo)

```text
bbpbat-app/
├── bbpbat_backend_project/    # Source code Backend (Django)
│   ├── apps/                  # Modular Apps (Bimbingan, Peserta, Users, dll)
│   ├── media/                 # File uploads (User, PDF, Images)
│   ├── manage.py              # Django command utility
│   └── requirements.txt       # Python dependencies
│
├── src/                       # Source code Frontend (React)
│   ├── components/            # UI Components
│   ├── pages/                 # Halaman Aplikasi
│   └── utils/                 # Utilities (PDF generator, Geo, dll)
│
├── public/                    # Static assets
├── index.html                 # HTML Entry point
├── package.json               # Node.js dependencies
└── README.md                  # Dokumentasi Project
```

## 📝 Catatan Pengembang
*   Pastikan file `.env` sudah dikonfigurasi jika ada (untuk API keys, Database creds, dll).
*   Jangan lupa format code sebelum commit (Frontend: Prettier/ESLint, Backend: Black/Flake8).

---
Built with ❤️ by [Your Name/Team]
