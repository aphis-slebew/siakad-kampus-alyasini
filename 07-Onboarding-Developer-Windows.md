# Panduan Onboarding Developer Baru (Windows + WSL2) — SIAKAD STAI Al-Yasini

Panduan ini disusun khusus untuk rekan developer baru (**Dev B**) yang menggunakan sistem operasi Windows dan memulai setup project dari nol (belum terinstall Docker, PostgreSQL, atau environment PHP/Node.js).

---

## 1. Prasyarat Instalasi (Windows + WSL2)

Mengembangkan aplikasi berbasis Linux di Windows native sering kali memicu kendala kompatibilitas path, permission file, dan extension PHP. Oleh karena itu, **WSL2 (Windows Subsystem for Linux 2)** wajib digunakan sebagai environment utama.

### Langkah Prasyarat:

1. **Aktifkan WSL2 di Windows**:
   - Buka PowerShell sebagai Administrator, lalu jalankan:
     ```powershell
     wsl --install
     ```
   - Restart komputer jika diminta.
   - Setelah restart, ikuti petunjuk terminal untuk membuat username & password Linux (gunakan distro default: **Ubuntu**).

2. **Install Docker Desktop for Windows**:
   - Unduh dan install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
   - Setelah instalasi selesai, buka **Docker Desktop Settings** > **Resources** > **WSL Integration**:
     - Centang **Enable integration with my default WSL distro**.
     - Centang toggle untuk distro **Ubuntu**.
     - Klik **Apply & Restart**.

3. **Install Git di Dalam WSL2**:
   - Buka terminal WSL2 (Ubuntu), lalu jalankan:
     ```bash
     sudo apt update && sudo apt install -y git
     ```
   - Atur konfigurasi Git & penanganan line ending CRLF/LF:
     ```bash
     git config --global user.name "Nama Anda"
     git config --global user.email "email@domain.com"
     git config --global core.autocrlf input
     ```
     *(Pengaturan `core.autocrlf input` mencegah masalah konversi karakter baris dari Windows ke Linux).*

4. **Install Node.js 20 LTS di Dalam WSL2**:
   - Install NVM (Node Version Manager) di dalam terminal WSL2:
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
     source ~/.bashrc
     nvm install 20
     nvm use 20
     ```

---

## 2. Arsitektur Environment untuk Dev B (Full Docker App Stack)

Berbeda dengan setup developer utama (Sauqi) yang menggunakan PHP native di Linux host, **Dev B direkomendasikan menjalankan seluruh service via Docker Container** (termasuk container `app` di `docker-compose.yml`).

### Trade-off Arsitektur:
- **Kelebihan**: 100% *zero-configuration* untuk PHP/Composer di Windows — tidak perlu menginstall extension PHP native (PDO, Argon2id, Zip, dll.) di host.
- **Kelemahan**: Hot-reload asset frontend sedikit lebih lambat (~1-2 detik), namun sangat stabil dan langsung berjalan dari hari pertama.

### PERATURAN KRITIS: Lokasi Directory Project
- **WAJIB** melakukan clone repository **di dalam filesystem native WSL2** (misal `~/Project/siakad-alyasini` atau `/home/username/Project/siakad-alyasini`).
- **DILARANG HARAM** menaruh folder project di drive Windows (misal `/mnt/c/Users/...` atau `C:\Project`).
- *Alasan*: Akses file dari WSL2 ke drive Windows (`/mnt/c/`) melewati protokol 9P yang menyebabkan performa I/O file 10x s/d 50x lebih lambat, yang akan membuat `composer install` dan `npm run dev` menjadi sangat lambat.

---

## 3. Langkah Instalasi Project (di Terminal WSL2)

Buka terminal WSL2 Ubuntu Anda, lalu ikuti langkah-langkah berikut secara berurutan:

```bash
# 1. Buat folder workspace dan clone repository
mkdir -p ~/Project && cd ~/Project
git clone https://github.com/muhammadsaugi/siakad-alyasini.git
cd siakad-alyasini

# 2. Salin file konfigurasi environment
cp .env.example .env
```

### Konfigurasi File `.env`:
Buka file `.env` (bisa menggunakan VS Code via command `code .env` di WSL2) dan pastikan variabel-variabel kunci berikut terisi:
```ini
APP_NAME="SIAKAD STAI Al-Yasini"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8080

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=siakad_db
DB_USERNAME=siakad_user
DB_PASSWORD=secret

REDIS_HOST=redis
REDIS_PORT=6379
```

### Jalankan Services via Docker:
```bash
# 3. Jalankan seluruh container (app, nginx, postgres, redis, queue, scheduler)
docker compose up -d

# 4. Install dependensi PHP di dalam container app
docker compose exec app composer install

# 5. Generate application key
docker compose exec app php artisan key:generate

# 6. Jalankan migrasi tabel basis data
docker compose exec app php artisan migrate

# 7. Jalankan seeder khusus development (DevDummySeeder)
docker compose exec app php artisan db:seed
```
*(Catatan: Karena `APP_ENV=local`, perintah `php artisan db:seed` secara otomatis memanggil `DevDummySeeder` yang mengisi data mock seperti Budi Mahasiswa, Dr. Ahmad Dosen, data Fakultas/Prodi, dan akun dummy dev).*

```bash
# 8. Install & build asset frontend React (di dalam terminal WSL2 host)
npm install
npm run build

# Untuk development harian dengan hot-reload:
npm run dev
```

### Akses Aplikasi di Browser Windows:
Buka browser favorit Anda di Windows (Chrome/Edge/Firefox) dan akses:
👉 **`http://localhost:8080`**

*(Docker Desktop secara otomatis melakukan port-forwarding dari WSL2 ke Windows host, sehingga `localhost:8080` di browser Windows langsung terhubung ke container Nginx).*

---

## 4. Daftar Akun Login per Role (Hasil Seeder Development)

Berikut adalah daftar lengkap 10 akun dummy yang ter-seed secara otomatis melalui `DevDummySeeder` untuk pengujian seluruh peran di SIAKAD:

| No | Role (`01-PRD.md §3`) | Email | Password | Status 2FA | Metode Verifikasi 2FA |
|---|---|---|---|---|---|
| 1 | **Superadmin** | `admin@alyasini.ac.id` | `password` | **Aktif (Mandatory)** | Recovery Code / Authenticator App |
| 2 | **Admin Akademik** | `akademik@alyasini.ac.id` | `password` | **Aktif (Mandatory)** | Recovery Code / Authenticator App |
| 3 | **Panitia PMB** | `pmb@alyasini.ac.id` | `password` | Non-Aktif | Langsung Masuk Dashboard |
| 4 | **Staf Keuangan** | `keuangan@alyasini.ac.id` | `password` | Non-Aktif | Langsung Masuk Dashboard |
| 5 | **Kaprodi** | `kaprodi@alyasini.ac.id` | `password` | Non-Aktif | Langsung Masuk Dashboard |
| 6 | **Dosen** | `dosen@alyasini.ac.id` | `password` | Non-Aktif | Langsung Masuk Dashboard |
| 7 | **Staf Kepegawaian** | `kepegawaian@alyasini.ac.id` | `password` | Non-Aktif | Langsung Masuk Dashboard |
| 8 | **Mahasiswa** | `mahasiswa@alyasini.ac.id` | `password` | Non-Aktif | Langsung Masuk Dashboard |
| 9 | **Calon Mahasiswa** | `calon@alyasini.ac.id` | `password` | Non-Aktif | Langsung Masuk Dashboard |
| 10 | **Operator Kemahasiswaan** | `kemahasiswaan@alyasini.ac.id` | `password` | Non-Aktif | Langsung Masuk Dashboard |

---

## 5. Cara Login Akun Superadmin & Admin Akademik (Handling 2FA)

Karena role `superadmin` dan `admin_akademik` diwajibkan menggunakan 2FA (sesuai `04-Security.md §1`), akun dummy mereka memiliki status 2FA aktif. Dev B dapat melewatinya dengan **2 metode praktis**:

### Metode A: Menggunakan Recovery Code (Paling Cepat — Diterapkan Seeder)
1. Login dengan email `admin@alyasini.ac.id` (atau `akademik@alyasini.ac.id`) dan password `password`.
2. Saat layar tantangan 2FA (*Two-Factor Challenge*) muncul, klik tombol **"Gunakan Kode Pemulihan"** (*Use a recovery code*).
3. Masukkan salah satu Kode Pemulihan dummy yang sudah disediakan seeder:
   - **`DEV-REC-01`**
   - **`DEV-REC-02`**
   - **`DEV-REC-03`**
4. Klik Submit. Anda langsung masuk ke Dashboard.

### Metode B: Menggunakan Google Authenticator / Authy App
1. Buka aplikasi Google Authenticator / Authy / Bitwarden di smartphone atau browser Anda.
2. Tambahkan akun baru secara manual (*Enter a setup key*).
3. Masukkan Secret Key Base32 berikut:
   `JBSWY3DPEHPK3PXP`
4. Aplikasi authenticator Anda akan meng-generate kode OTP 6-angka yang valid setiap 30 detik. Masukkan kode 6-angka tersebut di layar tantangan 2FA.

---

## 6. Troubleshooting Umum (Windows + WSL2)

### A. Error: `Ports are not available: listen tcp 0.0.0.0:8080: bind: an attempt was made to access a socket...`
- **Penyebab**: Port 8080 sedang digunakan oleh aplikasi Windows lain (misal IIS, Skype, atau service Node lokal).
- **Solusi**:
  1. Buka PowerShell Administrator di Windows, cek proses yang memakai port 8080:
     ```powershell
     netstat -ano | findstr :8080
     ```
  2. Hentikan PID proses yang bentrok:
     ```powershell
     taskkill /PID <PID_PROSES> /F
     ```
  3. Atau ubah `APP_PORT=8081` di `.env` dan `docker-compose.yml`.

### B. Docker Desktop Tidak Terhubung dengan WSL2
- **Penyebab**: Integrasi WSL2 di Docker Desktop belum diaktifkan atau service WSL2 terhenti.
- **Solusi**: Buka Docker Desktop > Settings > Resources > WSL Integration, pastikan toggle Ubuntu aktif. Di PowerShell, jalankan `wsl --shutdown` lalu buka kembali WSL2 terminal.

### C. Masalah Line Ending (CRLF vs LF Error / Bash script `\r` unexpected)
- **Penyebab**: File `.sh` atau `.env` diedit menggunakan editor Windows yang menambahkan karakter `CRLF`.
- **Solusi**: Di terminal WSL2, jalankan pengubah format baris ke LF:
  ```bash
  git config --global core.autocrlf input
  sudo apt install -y dos2unix
  dos2unix .env
  ```

---

## 7. Aturan Alur Kerja Pengembangan Tim (Git Workflow)

1. **Jangan Pernah Push Langsung ke Branch `main`**:
   Branch `main` dilindungi dan hanya digunakan untuk rilis stabil.
2. **Checkout Branch `develop` Sebelum Membuat Fitur**:
   ```bash
   git checkout develop
   git pull origin develop
   ```
3. **Buat Feature Branch Spesifik Per Modul**:
   Sesuai pembagian kerja di `01-PRD.md §9`:
   ```bash
   git checkout -b feature/nama-modul-anda
   ```
4. **Jalankan Test Sebelum Push**:
   ```bash
   docker compose exec app ./vendor/bin/pest
   ```
   Pastikan seluruh test suite berwarna **hijau (PASS)** sebelum melakukan Pull Request ke branch `develop`.
