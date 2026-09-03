# Panduan Instalasi Awal — SIAKAD STAI Al-Yasini

Stack final: **Laravel 12 + Inertia.js + React + PostgreSQL + Redis + Docker
Compose + Nginx**. Payment gateway & PDDIKTI belum diaktifkan di tahap ini
(lihat catatan di `.env.example`).

File yang sudah disiapkan (letakkan di root project sebelum mulai):
```
docker-compose.yml
docker/php/Dockerfile
docker/nginx/default.conf
.env.example
```

---

## 0. Prasyarat di komputer masing-masing developer

- PHP 8.3+ dan Composer (untuk scaffolding awal & tooling lokal)
- Node.js 20 LTS + npm
- Docker Desktop / Docker Engine + Docker Compose v2
- Git

Kenapa tetap perlu PHP/Composer lokal padahal sudah pakai Docker? Karena
proses `laravel new` (langkah 2) paling gampang dijalankan secara interaktif
di lokal. Setelah project jadi, seluruh development harian berikutnya bisa
lewat container.

## 1. Buat repository GitHub

```bash
# Buat repo kosong "siakad-alyasini" di GitHub dulu (lewat web), lalu:
git clone git@github.com:<org-kampus>/siakad-alyasini.git
cd siakad-alyasini
```

Satu repo utama untuk seluruh source code (sesuai kesepakatan di blueprint) —
jangan pisah repo frontend/backend, karena Inertia menyatukan keduanya dalam
satu Laravel app.

## 2. Scaffold project Laravel dengan starter kit React + Inertia

```bash
composer global require laravel/installer
laravel new . --react
```

Saat prompt muncul:
- **Which starter kit?** → pilih **React**
- **Which testing framework?** → Pest (lebih ringkas) atau PHPUnit, bebas
- **Which database?** → PostgreSQL

Ini otomatis memasang Inertia.js, React, Tailwind, dan auth scaffolding dasar
(login/register) — jadi tidak perlu install Breeze manual terpisah.

## 3. Pindahkan file konfigurasi Docker yang sudah disiapkan

Salin `docker-compose.yml`, folder `docker/`, dan `.env.example` (menimpa
`.env.example` bawaan Laravel) ke root project hasil `laravel new` di atas.

## 4. Konfigurasi `.env`

```bash
cp .env.example .env
```

Edit `.env`:
- Ganti `DB_PASSWORD` dengan password yang kuat (jangan biarkan default).
- Sesuaikan `APP_URL` kalau port berbeda.
- Biarkan bagian Payment Gateway & PD-DIKTI tetap dikomentari.

**Jangan commit `.env`** — pastikan `.gitignore` bawaan Laravel sudah
mengecualikannya (biasanya sudah otomatis).

## 5. Build & jalankan container

```bash
docker compose build
docker compose up -d
docker compose ps   # pastikan app, nginx, postgres, redis, queue, scheduler semua "running"
```

## 6. Generate application key & migrate

```bash
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
```

Kalau migration untuk modul-modul (PMB, keuangan, dst) belum dibuat, buat dulu
migration filenya berdasarkan `02-Database-Schema.md` sebelum menjalankan
`migrate` — jangan biarkan Antigravity membuat kolom yang tidak ada di dokumen
itu tanpa direview.

## 7. Install & build asset frontend

```bash
npm install
npm run build
```

Untuk development sehari-hari dengan hot-reload:
```bash
npm run dev
```
(Jalankan ini di **host**, bukan di dalam container, supaya hot-reload lebih
responsif — hanya `php artisan` dan `composer` yang perlu lewat container.)

## 8. Buka aplikasi

Akses `http://localhost:8080` di browser. Kalau halaman Laravel/Inertia
default muncul, instalasi awal berhasil.

## 9. Setup RBAC dasar

```bash
docker compose require spatie/laravel-permission
```
(jalankan lewat `docker compose exec app composer require spatie/laravel-permission`,
lalu publish config & migrate sesuai dokumentasi paketnya). Buat seeder role
sesuai daftar di `01-PRD.md §3`: superadmin, admin_akademik, panitia_pmb,
staf_keuangan, kaprodi, dosen, staf_kepegawaian, mahasiswa, calon_mahasiswa,
operator_kemahasiswaan.

## 10. Commit awal

```bash
git add .
git commit -m "chore: initial Laravel + Inertia React + Docker setup"
git push origin main
```

Setelah ini, buat branch `develop` dan mulai kerja lewat `feature/*` branch
sesuai `01-PRD.md §9` (pembagian modul per developer).

---

## 11. Seeding Data: Produksi vs Development (Langkah 13 Prioritas 5)

Sistem memisahkan seeder secara ketat antara lingkungan pengembangan (development/testing) dan lingkungan produksi sungguhan:

### A. Deployment Produksi (Server Produksi Sungguhan):
Jalankan seeder khusus produksi untuk mengisi data struktural wajib (Roles & Permissions, Default System Configs) dan meng-generate akun Superadmin PERTAMA dengan password acak aman:
```bash
docker compose exec app php artisan db:seed --class=ProductionSeeder
```
*Catatan*: Output konsol akan mencetak password acak Superadmin produksi (misal `58vu33YxGXvPkF2M`). SIMPAN DAN SEGERA GANTI KATA SANDI INI SETELAH LOGIN PERTAMA. **Dilarang** menjalankan `db:seed` tanpa `--class=ProductionSeeder` di server produksi!

### B. Lingkungan Development / Testing Lokal:
```bash
docker compose exec app php artisan db:seed
# atau
docker compose exec app php artisan db:seed --class=DevDummySeeder
```
*(Sistem secara otomatis mendeteksi `APP_ENV=local` / `APP_ENV=testing` dan mengeksekusi `DevDummySeeder` yang menyertakan data mock realistic seperti Budi Mahasiswa, Dr. Ahmad Dosen, data Fakultas/Prodi, dan akun dummy dev).*

---


## Checklist verifikasi sebelum lanjut ke development modul

- [ ] `docker compose ps` — semua service `running`, tidak ada yang restart
      terus-menerus.
- [ ] `php artisan migrate:status` — tabel `users`, `sessions`, `cache`,
      `jobs` (bawaan Laravel) sudah masuk.
- [ ] Bisa register/login lewat halaman default Inertia.
- [ ] `docker compose exec app php artisan queue:work` merespons tanpa error
      koneksi Redis.
- [ ] Port PostgreSQL (5432) dan Redis **tidak** ter-expose ke `0.0.0.0` — cek
      `docker compose ps` kolom PORTS harus menunjukkan `127.0.0.1:5432`,
      bukan `0.0.0.0:5432`.
- [ ] `.env` tidak muncul di `git status` sebagai file yang ter-track.

Kalau semua ini sudah hijau, baru mulai migration modul-modul dari
`02-Database-Schema.md` satu per satu sesuai pembagian kerja di PRD.
