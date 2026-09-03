# Panduan Menjalankan SIAKAD Al-Yasini di Laragon (Windows)
## Dokumentasi Resmi untuk Tim Pengembang & AI Agent

Panduan ini ditujukan bagi anggota tim pengembang dan AI Coding Agent agar dapat menjalankan, mengembangkan, dan menguji proyek **SIAKAD Al-Yasini** secara lancar menggunakan lingkungan **Laragon (Windows)** tanpa kesalahan konfigurasi.

---

## 1. Prasyarat Sistem & Versi PHP

> [!IMPORTANT]
> **WAJIB MENGGUNAKAN PHP >= 8.4**  
> Proyek ini menggunakan Laravel 13, Pest 5, dan PHPUnit 13 yang memanfaatkan sintaks modern PHP 8.4 (`new Class()->method()`).  
> **JANGAN menggunakan PHP 8.3 atau versi lebih lama**, karena akan memicu:  
> `Parse error: syntax error, unexpected token "->"` pada `Version.php` atau `Expectation.php`.

| Komponen | Versi / Path | Keterangan |
| :--- | :--- | :--- |
| **Laragon** | Full Edition | Terpasang di `D:\laragon` |
| **PHP Runtime** | **PHP 8.4.25+** | `D:\laragon\bin\php\php-8.4.25-Win32-vs17-x64\php.exe` |
| **Database Server** | **MySQL 8.0.x** (Bawaan Laragon) | Port `3306`, User `root`, Password kosong |
| **Node.js & NPM** | Node.js v20+ / NPM v10+ | Untuk kompilasi Vite, Tailwind CSS v4, dan React 19 |
| **Web Server** | Apache / `php artisan serve` | Port default `8000` atau `http://siakad-alyasini.test` |

---

## 2. Konfigurasi Ekstensi `php.ini` (PHP 8.4 Laragon)

Pastikan ekstensi berikut sudah aktif pada `D:\laragon\bin\php\php-8.4.25-Win32-vs17-x64\php.ini`:
```ini
extension=curl
extension=fileinfo
extension=gd
extension=intl
extension=mbstring
extension=exif
extension=mysqli
extension=openssl
extension=pdo_mysql
extension=pdo_pgsql
extension=pdo_sqlite
extension=pgsql
extension=zip
```

---

## 3. Konfigurasi File `.env` (Laragon MySQL)

File `.env` di direktori proyek `D:\laragon\www\siakad-alyasini\.env` harus menggunakan konfigurasi MySQL berikut:

```env
APP_NAME="SIAKAD STAI Al-Yasini"
APP_ENV=local
APP_KEY=base64:zZkF72D0zI2k8zI4kGq3h0q7uM+2zL8k9p1o2q3r4s5=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Nonaktifkan devtools storage lock saat di lingkungan lokal
INERTIA_DEVTOOLS_ENABLED=false

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=siakad_db
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```

---

## 4. Migrasi & Seeder Database

Jika ingin mereset atau mengisi ulang basis data MySQL:

```powershell
php artisan migrate:fresh --seed
```

Semua 29 tabel migrasi dan seeder 10 role akun akan otomatis terisi ke dalam database **`siakad_db`** di phpMyAdmin.

---

## 5. Cara Menjalankan Aplikasi (Dual Terminal)

Buka 2 tab terminal di VS Code (atau gunakan tombol *Split Terminal* `|`):

### Terminal 1: Backend Laravel Server
```powershell
php artisan serve
```
*Aplikasi berjalan di: `http://127.0.0.1:8000`*

### Terminal 2: Frontend Vite React Server (Hot Reload)
```powershell
npm run dev
```
*Aset React terkompilasi dan memantau perubahan file secara real-time.*

---

## 6. Troubleshooting & Solusi Masalah Umum

### A. `Parse error: syntax error, unexpected token "->"`
- **Penyebab:** Terminal VS Code masih memanggil PHP 8.3 versi lama dari cache sesi sebelumnya.
- **Solusi:**  
  1. Tutup aplikasi VS Code sepenuhnya (*Close Window*).  
  2. Buka kembali VS Code di folder `D:\laragon\www\siakad-alyasini`.  
  3. Ketik `php -v` di terminal baru. Pastikan versinya adalah **PHP 8.4.25**.  
  4. Jalankan ulang `php artisan serve`.

### B. `httpd.exe - Entry Point Not Found (nghttp2.dll)`
- **Penyebab:** File `nghttp2.dll` Apache bawaan versi lama konflik dengan cURL PHP 8.4.
- **Solusi:** File `nghttp2.dll` di `D:\laragon\bin\apache\...\bin\` sudah diperbarui dengan versi dari PHP 8.4.

---

## 7. Kredensial Login 10 Role Default untuk Pengujian

Semua akun dummy berikut memiliki kata sandi default: **`password`**  
*(Atau gunakan tombol **Quick Login Shortcut** langsung di halaman `/login`)*:

| No | Role | Email Akun | Hak Akses & Tugas |
| :---: | :--- | :--- | :--- |
| 1 | **Superadmin** | `admin@alyasini.ac.id` | Pengaturan sistem, hak akses, safeguard admin |
| 2 | **BAA (Akademik)** | `akademik@alyasini.ac.id` | Manajemen prodi, kurikulum, matakuliah, kelas |
| 3 | **Dosen Pengajar** | `dosen@alyasini.ac.id` | Presensi perkuliahan, lembar nilai mahasiswa |
| 4 | **Kaprodi (KPS)** | `kaprodi@alyasini.ac.id` | Kurikulum prodi, matakuliah, approval KRS wali, rekap nilai |
| 5 | **Mahasiswa** | `mahasiswa@alyasini.ac.id` | Pengisian KRS, kartu hasil studi (KHS), transkrip |
| 6 | **Calon Mahasiswa** | `calon@alyasini.ac.id` | Pendaftaran mahasiswa baru (PMB), upload berkas |
| 7 | **Staf Keuangan** | `keuangan@alyasini.ac.id` | Kelompok UKT, kasir, verifikasi pembayaran SPP/UKT |
| 8 | **Panitia PMB** | `pmb@alyasini.ac.id` | Kelola jalur masuk, gelombang, verifikasi seleksi |
| 9 | **Kepegawaian (SDM)**| `kepegawaian@alyasini.ac.id`| Biodata dosen, pegawai, SK fungsional |
| 10 | **Kemahasiswaan** | `kemahasiswaan@alyasini.ac.id`| Prestasi mahasiswa, beasiswa, pelanggaran |
