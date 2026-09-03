# Panduan Instalasi & Konfigurasi Lokal (XAMPP + PostgreSQL + Redis)
## SIAKAD Al-Yasini — Non-Docker Setup

Panduan ini ditujukan untuk menjalankan proyek **SIAKAD Al-Yasini** di lingkungan Windows menggunakan **XAMPP**, **PostgreSQL Standalone**, dan **Redis Standalone** tanpa membutuhkan Docker Desktop (sangat hemat konsumsi RAM).

---

## 1. Prasyarat Sistem & Software

Pastikan software berikut sudah terpasang di komputer/laptop:

| Software | Versi Minimum | Keterangan |
| :--- | :--- | :--- |
| **XAMPP (PHP)** | **PHP 8.3+** | Cek versi via CMD/Terminal: `php -v` |
| **Composer** | Versi 2.x | Manajemen dependensi PHP ([getcomposer.org](https://getcomposer.org/)) |
| **Node.js & NPM** | **Node.js v20+** | Untuk kompilasi aset React & Vite ([nodejs.org](https://nodejs.org/)) |
| **PostgreSQL** | Versi 15 / 16 | Database server ([postgresql.org](https://www.postgresql.org/download/windows/)) |
| **Redis for Windows** | Versi 5.x / Memurai | In-memory cache & queue ([tporadowski/redis](https://github.com/tporadowski/redis/releases)) |
| **Git** | Versi terbaru | Untuk clone repository |

---

## 2. Konfigurasi XAMPP (`php.ini`)

Aplikasi ini memerlukan beberapa ekstensi PHP yang secara default dinonaktifkan di XAMPP.

1. Buka **XAMPP Control Panel**.
2. Pada baris **Apache**, klik tombol **Config** $\rightarrow$ pilih **PHP (php.ini)** (atau buka langsung file `C:\xampp\php\php.ini`).
3. Cari baris-baris berikut (gunakan `Ctrl + F`) dan **hapus tanda titik koma (`;`) di awal baris** untuk mengaktifkannya:
   ```ini
   extension=pdo_pgsql
   extension=pgsql
   extension=intl
   extension=fileinfo
   extension=gd
   extension=zip
   extension=bcmath
   extension=mbstring
   extension=curl
   ```
4. Simpan file `php.ini`, lalu **Restart Apache** pada XAMPP Control Panel.

> [!IMPORTANT]
> **Pengecekan Versi PHP:**
> Buka Command Prompt / PowerShell, ketik `php -v`. Pastikan versi PHP yang aktif adalah **PHP 8.3.x atau lebih tinggi**. Jika XAMPP Anda masih menggunakan PHP 8.1/8.2, perbarui modul PHP di XAMPP terlebih dahulu.

---

## 3. Setup PostgreSQL & Pembuatan Database

1. Buka aplikasi **pgAdmin** atau tool database favorit Anda (DBeaver, TablePlus, atau SQL Shell `psql`).
2. Login menggunakan user `postgres` dan password yang Anda tentukan saat instalasi.
3. Buat database baru bernama:
   ```sql
   CREATE DATABASE siakad_alyasini;
   ```
   *(Port default PostgreSQL adalah `5432`)*.

---

## 4. Setup Redis for Windows

1. Unduh installer MSI ringan: **[Redis-x64-5.0.14.msi](https://github.com/tporadowski/redis/releases)**.
2. Jalankan instalasi (centang opsi *"Add Redis to PATH"* dan *"Set up as Windows Service"*).
3. Setelah terpasang, Redis akan otomatis berjalan di background pada port `6379`.
4. Untuk menguji apakah Redis aktif, buka CMD dan ketik:
   ```bash
   redis-cli ping
   # Jika output: PONG (artinya Redis sudah aktif)
   ```

---

## 5. Konfigurasi Proyek (`.env`)

Letakkan folder proyek di `C:\xampp\htdocs\siakad-alyasini` (atau folder direktori kerja Anda).

1. Buka terminal (CMD / PowerShell / Git Bash) di dalam direktori proyek.
2. Salin file template `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Atau salin manual `.env.example` lalu rename menjadi `.env`)*.
3. Buka file `.env` menggunakan VS Code / Text Editor, lalu sesuaikan bagian berikut:

```env
APP_NAME="SIAKAD Al-Yasini"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# ==========================================
# KONFIGURASI DATABASE (POSTGRESQL)
# ==========================================
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=siakad_alyasini
DB_USERNAME=postgres
DB_PASSWORD=password_postgres_anda

# ==========================================
# KONFIGURASI QUEUE & CACHE (REDIS)
# ==========================================
QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=database

REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

> [!TIP]
> Jika PHP di komputer Anda belum memiliki modul `php_redis.dll`, gunakan konfigurasi `REDIS_CLIENT=predis` di atas.

---

## 6. Instalasi Dependensi & Setup Awal

Jalankan perintah-perintah berikut secara berurutan di terminal folder proyek:

```bash
# 1. Install dependensi backend PHP & paket predis
composer install
composer require predis/predis

# 2. Generate Application Key (Kunci Enkripsi Laravel)
php artisan key:generate

# 3. Jalankan Migrasi Database & Seeder Data Dummy
php artisan migrate:fresh --seed

# 4. Install dependensi frontend (React, Tailwind v4, Inertia)
npm install

# 5. Build awal asset frontend
npm run build
```

---

## 7. Menjalankan Aplikasi

Buka **dua jendela terminal** di folder proyek:

### Terminal 1: Backend Server (Laravel)
```bash
php artisan serve
```
*(Server akan berjalan di `http://localhost:8000`)*.

### Terminal 2: Frontend Dev Server (Vite / React Hot-Reload)
```bash
npm run dev
```
*(Menangani compile dan live-reload antarmuka React)*.

### Terminal 3 (Opsional): Queue Worker
Jika Anda ingin menguji background job/antrean notifikasi:
```bash
php artisan queue:listen
```

---

## 8. Informasi Akun untuk Login & Pengujian

Buka browser dan akses: **`http://localhost:8000`**

### A. Shortcut Login Cepat (Bypass Dev Mode)
Akses URL berikut untuk langsung login otomatis sebagai Superadmin tanpa input password/2FA:
👉 **`http://localhost:8000/dev-auth/admin`**

### B. Akun Dummy Bawaan Seeder
| Role | Email | Password |
| :--- | :--- | :--- |
| **Superadmin** | `admin@alyasini.ac.id` | `password` |
| **Admin Akademik** | `akademik@alyasini.ac.id` | `password` |
| **Dosen** | `dosen@alyasini.ac.id` | `password` |
| **Mahasiswa** | `mahasiswa@alyasini.ac.id` | `password` |

*(Jika sistem meminta verifikasi 2FA saat login manual, masukkan kode recovery:* `DEV-REC-01` *atau* `DEV-REC-02`*)*.

---

## 9. Troubleshooting / Kendala Umum

* **Error `could not find driver` pada PostgreSQL:**
  * Pastikan baris `extension=pdo_pgsql` dan `extension=pgsql` di `C:\xampp\php\php.ini` sudah dibuka (tanpa tanda `;`).
  * Restart Apache di XAMPP.
* **Error `Class "Redis" not found`:**
  * Pastikan di `.env` sudah diatur `REDIS_CLIENT=predis` dan sudah menjalankan `composer require predis/predis`.
  * Atau ubah sementara `QUEUE_CONNECTION=database` dan `CACHE_STORE=database`.
* **Error Vite / Tampilan Blank Putih:**
  * Pastikan Terminal 2 (`npm run dev`) sedang aktif berjalan.
