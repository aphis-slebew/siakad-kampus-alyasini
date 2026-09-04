# Super Admin Implementation Plan

> **Dibuat:** 2026-09-04  
> **Revisi Final:** 2026-09-04 (Diselaraskan penuh dengan `audit_superadmin.md` & verifikasi skema database)  
> **Berdasarkan:** `audit_superadmin.md`  
> **Status Dokumen:** Aktif — Update status setiap task setelah selesai dikerjakan.

---

## 1. Tujuan Perbaikan

Tujuan utama dari proses perbaikan modul Super Admin adalah:

1. **Memastikan seluruh fitur stabil dan kompatibel di MySQL (Laragon)** — mengeliminasi bug sintaksis database seperti operator PostgreSQL `ilike` yang menyebabkan crash fatal saat pencarian data.
2. **Menyeragamkan nama dan konsistensi otorisasi role** — menyelaraskan nama role antara `docs/USE_CASE.md` (Single Source of Truth), database seeder, route middleware, form request, dan controller tanpa membuat asumsi sepihak.
3. **Mengimplementasikan fitur baru yang spesifikasinya sudah ada di skema database** — merealisasikan fitur Kalender Akademik dan Konsentrasi Program Studi yang tabel migrasi dan model Eloquent-nya sudah tersedia namun belum memiliki controller dan UI yang fungsional.
4. **Memperkuat integritas referensial dan audit trail** — memperluas guard penghapusan (delete protection) pada master data referensi agar mencakup seluruh relasi foreign key, serta melengkapi pencatatan `ActivityLogger`.
5. **Mengamankan integrasi eksternal** — membatasi pemanggilan sinkronisasi massal PD-DIKTI Neo Feeder dengan rate limiting dan memperjelas status sandbox pada antarmuka.
6. **Meningkatkan konsistensi kode dan arsitektur** — menyeragamkan pola flash error response dan memperkuat aturan keamanan seperti impersonasi antar-superadmin.

> [!IMPORTANT]
> Setiap perbaikan **tidak boleh merusak fitur yang sudah berfungsi**. Fitur yang telah diverifikasi berfungsi normal: Dashboard, Impersonasi Dasar, Reset Password, System Configs, Master Perguruan Tinggi, Master Fakultas, Master Program Studi, dan Master Ruang Kuliah.

---

## 2. Ringkasan Kondisi Saat Ini

### ✅ Fitur yang Berfungsi Penuh (9 fitur)

| # | Fitur | Route | Deskripsi Status |
|---|---|---|---|
| 1 | Dashboard Superadmin | `GET /dashboard` | Metrik statistik live (mahasiswa, dosen, prodi, kelas, tagihan) berfungsi efisien. |
| 2 | Impersonasi Akun (Login As) | `POST /users/{user}/impersonate` | Transisi sesi dan banner impersonasi berjalan normal. |
| 3 | Selesai Impersonasi | `POST /leave-impersonate` | Pemulihan sesi Superadmin asli via session ID berjalan aman. |
| 4 | Reset Password Pengguna | `POST /users/{user}/reset-password` | Bcrypt hashing, notifikasi email, dan audit log tercatat. |
| 5 | Konfigurasi Sistem (System Configs) | `GET\|PUT /settings/system-configs` | 14 parameter whitelist dengan 5 kategori Sevima berjalan 100% dan lulus pengujian Pest. |
| 6 | Master Data — Perguruan Tinggi | `GET\|POST /master/perguruan-tinggi` | Data profil, pejabat, akreditasi, dan upload sertifikat terhubung ke shared Inertia props. |
| 7 | Master Data — Fakultas | `GET\|POST\|PUT\|DELETE /master/fakultas` | CRUD lengkap dengan guard prodi aktif dan halaman detail `show`. |
| 8 | Master Data — Program Studi | `GET\|POST\|PUT\|DELETE /master/program-studi` | CRUD lengkap dengan parameter akademik, akreditasi, dan halaman detail `show`. |
| 9 | Master Data — Ruang Kuliah | `GET\|POST\|PUT\|DELETE /master/ruang-kuliah` | CRUD master ruangan dengan kapasitas dan validasi jadwal aktif. |

---

### ⚠️ Fitur Bermasalah / Bug Aktif (5 fitur)

| # | Fitur | Masalah Utama | Prioritas | Status |
|---|---|---|---|---|
| 1 | Manajemen Pengguna (`/users`) | Query search memakai operator PostgreSQL `ilike` → Crash di MySQL Laragon. | 🔴 Critical | ✅ Selesai (TASK-001) |
| 2 | System Monitoring (`/superadmin/monitoring`) | Query search log memakai `ilike` di 4 kolom → Crash di MySQL Laragon. | 🔴 Critical | ✅ Selesai (TASK-002) |
| 3 | Master Data — Tahun Ajaran | Query search nama tahun ajaran memakai `ilike` → Crash di MySQL Laragon. | 🔴 High | ✅ Selesai (TASK-003) |
| 4 | Master Data — Referensi Biodata | Guard delete hanya memeriksa 1 relasi (agama), mengabaikan 8 relasi foreign key lainnya. Belum ada `ActivityLogger`. | 🟡 Medium | ⏳ Menunggu Phase 4 |
| 5 | PD-DIKTI Neo Feeder | Endpoint `sync-batch` tanpa throttle/rate limiting; UI belum menampilkan status sandbox/live dengan jelas. | 🟡 Medium | ⏳ Menunggu Phase 5 |

---

### 🚧 Fitur Belum Selesai (2 fitur)

| # | Fitur | Kondisi Kode Saat Ini |
|---|---|---|
| 1 | Kalender Akademik | `KalenderAkademikController.php` kosong stub; tabel `kalender_akademiks` dan model `KalenderAkademik` sudah ada; belum ada route dan UI. |
| 2 | Konsentrasi Program Studi | `KonsentrasiController.php` kosong stub; tabel `konsentrasis` dan model `Konsentrasi` sudah ada; belum ada route dan UI. |

---

### 🔴 Inkonsistensi Role & Otorisasi (2 masalah)

| # | Domain Role | Kondisi Mismatch | Keputusan yang Dibutuhkan |
|---|---|---|---|
| 1 | Kemahasiswaan | Dokumen `docs/USE_CASE.md` menyebut `kemahasiswaan`, tetapi seeder & mapping controller memakai `operator_kemahasiswaan`. | Konfirmasi nama canonical dari user. |
| 2 | Kepegawaian | Dokumen `docs/USE_CASE.md` menyebut `kepegawaian`, tetapi seeder & route middleware memakai `staf_kepegawaian`. | Konfirmasi nama canonical dari user. |

---

### 🟢 Inkonsistensi Minor (2 item)

| # | Masalah | Catatan |
|---|---|---|
| 1 | Response delete Ruang Kuliah | `RuangKuliahController::destroy()` memakai `withErrors()` bukan `with('error')`. |
| 2 | Impersonasi Superadmin | Superadmin dapat mengimpersonasi akun Superadmin lain (perlu pembatasan guard). |

---

### ℹ️ Item Temuan Audit yang Tidak Dibuatkan Task Khusus (Dengan Justifikasi Teknis)

Untuk mencegah overengineering dan menjaga integritas kode, temuan audit berikut **secara sadar tidak dibuatkan task perbaikan**:

1. **Coupling `SystemConfigController` dengan `SystemConfigSeeder::$whitelist`**:
   - *Justifikasi:* Modul konfigurasi sistem baru saja dioptimasi dan telah lolos pengujian 100% (4 unit test Pest, 17 assertions). Memindahkan whitelist ke config terpisah saat ini tidak memberikan nilai fungsional baru dan berisiko merusak kontrak seeder yang sudah teruji.
2. **`PddiktiSyncController::testConnection()` mengembalikan `JsonResponse`**:
   - *Justifikasi:* Pemeriksaan pada `resources/js/pages/pddikti/index.tsx:147` membuktikan bahwa antarmuka memanggil endpoint ini menggunakan `await fetch('/pddikti/test-connection')` (AJAX client-side) dan mem-parse JSON secara tepat. Bentuk `JsonResponse` memang disengaja dan sudah sesuai arsitektur UI.
3. **`syncBatch` nilai PD-DIKTI dikirim per kelas, bukan per mahasiswa**:
   - *Justifikasi:* Spesifikasi resmi Web Service Neo Feeder Kemendikbudristek mengirimkan data penilaian perkuliahan melalui method berbasis rombel/kelas kuliah (`InsertNilaiPerkuliahanKelas`). Mekanisme batch per kelas kuliah sudah sesuai standar integrasi PD-DIKTI.

---

## 3. Strategi Pengerjaan & Dependency Teknis

Urutan eksekusi disusun strictly berdasarkan hierarki ketergantungan teknis (dependency graph):

```mermaid
graph TD
    P1[Phase 1: Kompatibilitas MySQL & Fix ilike] --> P2[Phase 2: Penyelarasan Role & Otorisasi]
    P1 -. Selesai diverifikasi .-> P1_Done[Status: DONE (17 tests passed)]
    P2 --> P3A[Phase 3A: CRUD Konsentrasi]
    P1 --> P3B[Phase 3B: Kalender Akademik]
    P2 --> P3B
    P3A --> P4[Phase 4: Data Integrity & Audit Trail]
    P3B --> P4
    P4 --> P5[Phase 5: PD-DIKTI Hardening]
    P5 --> P6[Phase 6: Code Quality & Minor Hardening]
```

---

## 4. Phase Pengerjaan

* **Phase 1 — Critical Bug Fix: Kompatibilitas MySQL (`ilike` → `like`)** `[STATUS: SELESAI]`
  Menghilangkan seluruh sintaksis database PostgreSQL-specific agar fitur pencarian di seluruh modul Super Admin berfungsi normal di MySQL Laragon.
* **Phase 2 — Role & Authorization Consistency (Decision-Gated)** `[STATUS: MENUNGGU KONFIRMASI USER]`
  Menyeragamkan nama role kemahasiswaan dan kepegawaian di seluruh lapisan aplikasi berdasarkan keputusan resmi user.
* **Phase 3 — Missing Core Features (Konsentrasi & Kalender Akademik)** `[STATUS: NOT STARTED]`
  Mengimplementasikan controller, route, dan UI untuk mengelola konsentrasi prodi serta agenda kalender akademik.
* **Phase 4 — Data Integrity & Audit Trail Expansion** `[STATUS: NOT STARTED]`
  Memperbaiki guard penghapusan referensi biodata di 8 kolom foreign key dan memastikan seluruh mutasi data tercatat di `ActivityLogger`.
* **Phase 5 — Integration Hardening (PD-DIKTI Feeder)** `[STATUS: NOT STARTED]`
  Menambahkan pembatasan frekuensi (rate limiting throttle) dan visualisasi status sandbox pada modul sinkronisasi PD-DIKTI.
* **Phase 6 — Code Quality & Minor Safeguards** `[STATUS: NOT STARTED]`
  Menyeragamkan format session flash error pada master ruang kuliah dan membatasi Superadmin mengimpersonasi sesama Superadmin.

---

## 5. Detail Task

---

### TASK-001: Fix `ilike` di UserManagementController

**Prioritas:** Critical  
**Status:** Done ✅  
**Phase:** 1  

**Masalah:**  
`UserManagementController::index()` pada baris 101–102 menggunakan operator `'ilike'`. Pada database MySQL (Laragon), eksekusi query pencarian melempar exception:  
`QueryException: Unknown column comparison operator 'ilike'`.

**Tujuan:**  
Fitur pencarian pengguna (berdasarkan nama dan email) pada `/users` berjalan lancar di MySQL maupun PostgreSQL tanpa error.

**File Terdampak:**  
- `app/Http/Controllers/Superadmin/UserManagementController.php` (baris ~99–104)

**Perubahan yang Dilakukan:**  
Mengganti operator `'ilike'` menjadi `'like'` pada query search nama dan email.

**Acceptance Criteria:**  
- Navigasi ke `/users` dengan parameter `?search=admin` mengembalikan daftar pengguna yang cocok.
- Tidak terjadi `QueryException` di MySQL.
- Filter role dan pagination tetap berfungsi normal.

**Hasil Testing:**  
`UserManagementTest.php` 10/10 tests PASSED (32 assertions). Termasuk pengujian baru `Superadmin can search users by name and email without database error`.

---

### TASK-002: Fix `ilike` di MonitoringController

**Prioritas:** Critical  
**Status:** Done ✅  
**Phase:** 1  

**Masalah:**  
`MonitoringController::index()` pada baris 33–36 menggunakan operator `'ilike'` di 4 titik: kolom `action`, `entity_type`, `ip_address`, dan relasi `user.name`. Mengakibatkan error fatal di MySQL saat mencari log aktivitas.

**Tujuan:**  
Fitur pencarian log sistem pada `/superadmin/monitoring` berfungsi di MySQL.

**File Terdampak:**  
- `app/Http/Controllers/Superadmin/MonitoringController.php` (baris ~31–38)

**Perubahan yang Dilakukan:**  
Mengganti seluruh 4 pemanggilan `'ilike'` menjadi `'like'`.

**Acceptance Criteria:**  
- Pencarian log sistem dengan kata kunci (misal: "login", "user", IP address) berhasil memfilter tabel data.
- Tidak ada error MySQL perbandingan operator.

**Hasil Testing:**  
`MonitoringTest.php` 4/4 tests PASSED (7 assertions). Pengujian search log berdasarkan action, entity_type, IP address, dan relasi nama user terbukti berfungsi tanpa error.

---

### TASK-003: Fix `ilike` di TahunAjaranController

**Prioritas:** High  
**Status:** Done ✅  
**Phase:** 1  

**Masalah:**  
`TahunAjaranController::index()` pada baris 26 memfilter kolom `nama` menggunakan `'ilike'`. Filter search tahun ajaran crash saat digunakan di MySQL.

**Tujuan:**  
Pencarian tahun ajaran pada `/master/tahun-ajaran` berfungsi di MySQL.

**File Terdampak:**  
- `app/Http/Controllers/Master/TahunAjaranController.php` (baris ~25–27)

**Perubahan yang Dilakukan:**  
Mengganti `where('nama', 'ilike', "%{$search}%")` menjadi `where('nama', 'like', "%{$search}%")`.

**Acceptance Criteria:**  
- Pencarian tahun ajaran aktif/nonaktif dapat dilakukan tanpa error database.
- Data periode semester muncul sesuai query.

**Hasil Testing:**  
`TahunAjaranTest.php` 3/3 tests PASSED (5 assertions). Pengujian search tahun ajaran dan filter status aktif/nonaktif terbukti berfungsi normal.

---

### TASK-004: Penyelarasan Nama Role Kemahasiswaan (`operator_kemahasiswaan` vs `kemahasiswaan`)

**Prioritas:** High  
**Status:** Not Started  
**Phase:** 2  

> [!IMPORTANT]
> **KEPUTUSAN DIBUTUHKAN DARI USER SEBELUM IMPLEMENTASI:**
> - **Opsi A (Sesuai `docs/USE_CASE.md`):** Menggunakan nama resmi `kemahasiswaan`.  
>   *Implikasi:* Mengubah nama role di `RoleAndPermissionSeeder.php`, `UserManagementController::USER_TYPE_ROLE_MAP`, validasi `store/update` user, dan migrasi ulang permission role.
> - **Opsi B (Sesuai Kode Existing):** Mempertahankan nama `operator_kemahasiswaan`.  
>   *Implikasi:* Mengupdate dokumen `docs/USE_CASE.md` dan seeder akun dummy `DevDummySeeder.php` agar mencocokkan kode yang sudah berjalan.

**Masalah:**  
Terjadi split nama antara dokumen acuan (`kemahasiswaan`) dan implementasi Spatie Role (`operator_kemahasiswaan`). Akun testing di `DevDummySeeder` bahkan keliru diberi role `staf_kepegawaian`.

**Tujuan:**  
Satu nama role canonical disepakati dan diterapkan secara konsisten di dokumen, seeder, route, dan manajemen user.

---

### TASK-005: Penyelarasan Nama Role Kepegawaian (`staf_kepegawaian` vs `kepegawaian`)

**Prioritas:** Medium  
**Status:** Not Started  
**Phase:** 2  

> [!IMPORTANT]
> **KEPUTUSAN DIBUTUHKAN DARI USER SEBELUM IMPLEMENTASI:**
> - **Opsi A (Sesuai `docs/USE_CASE.md`):** Menggunakan nama resmi `kepegawaian`.  
>   *Implikasi:* Mengubah middleware di `routes/web.php` (baris 376), `RoleAndPermissionSeeder.php`, `PegawaiManagementController.php`, dan `UserManagementController.php`.
> - **Opsi B (Sesuai Kode Existing):** Mempertahankan nama `staf_kepegawaian`.  
>   *Implikasi:* Mengupdate dokumen `docs/USE_CASE.md` menjadi `staf_kepegawaian` (karena route dan seeder sudah kompak memakai nama ini).

**Masalah:**  
`docs/USE_CASE.md` mendefinisikan role `kepegawaian`, sementara route middleware dan seeder telah menggunakan `staf_kepegawaian`.

**Tujuan:**  
Konsistensi 100% antara dokumentasi dan kode otorisasi kepegawaian.

---

### TASK-006: Implementasi CRUD Konsentrasi Program Studi

**Prioritas:** Medium  
**Status:** Not Started  
**Phase:** 3  

**Spesifikasi Skema Database & Model:**  
- Tabel: `konsentrasis` (didefinisikan di migrasi `2026_07_31_092627_create_master_data_tables.php`)
- Kolom: `id`, `program_studi_id` (FK cascade ke `program_studis`), `nama` (string), `timestamps`, `softDeletes`.
- Model: `App\Models\Konsentrasi` (sudah ada, menggunakan `SoftDeletes`).
- Relasi: `ProgramStudi` hasMany `Konsentrasi` (`program_studi_id`).

**Masalah:**  
`KonsentrasiController.php` masih berupa file kosong tanpa method. `ProgramStudiController::index()` sudah menghitung `withCount('konsentrasis')`, namun belum ada antarmuka untuk menambah, melihat, atau menghapus konsentrasi program studi.

---

### TASK-007: Implementasi Kalender Akademik (Agenda & Milestone)

**Prioritas:** High  
**Status:** Not Started  
**Phase:** 3  

**Spesifikasi Skema Database & Model:**  
- Tabel: `kalender_akademiks` (didefinisikan di migrasi `2026_07_31_092627_create_master_data_tables.php`)
- Kolom: `id`, `tahun_ajaran_id` (FK cascade ke `tahun_ajarans`), `kegiatan` (string), `mulai` (date), `selesai` (date), `timestamps`.
- Model: `App\Models\KalenderAkademik` (sudah ada, casts `mulai` & `selesai` ke date).
- Sumber Data Tambahan: Kolom milestone pada `tahun_ajarans` (`krs_mulai`, `krs_selesai`, `uts_mulai`, `uts_selesai`, `uas_mulai`, `uas_selesai`, `penilaian_mulai`, `penilaian_selesai`, `pembayaran_mulai`, `pembayaran_selesai`).

**Masalah:**  
`KalenderAkademikController.php` masih kosong stub. Mahasiswa dan staf membutuhkan visibilitas agenda akademik (seperti Masa KRS, Pembayaran UKT, Awal Perkuliahan, Libur Semester, Yudisium).

---

### TASK-008: Perbaikan Guard Delete dan Activity Log di ReferensiBiodataController

**Prioritas:** Medium  
**Status:** Not Started  
**Phase:** 4  

**Masalah:**  
`ReferensiBiodataController::destroy()` saat ini hanya mengecek 1 relasi:  
`Mahasiswa::where('agama_referensi_biodata_id', $referensiBiodatum->id)->exists()`.  
Padahal berdasarkan audit skema database lengkap, tabel `referensi_biodatas` digunakan di **8 kolom foreign key lain pada 4 tabel**:
1. `mahasiswas.pekerjaan_ayah_referensi_id`
2. `mahasiswas.pekerjaan_ibu_referensi_id`
3. `mahasiswas.penghasilan_ortu_referensi_id`
4. `matakuliahs.bidang_ilmu_id`
5. `aktivitas_mahasiswas.jenis_aktivitas_id`
6. `pelanggaran_mahasiswas.jenis_pelanggaran_id`
7. `pelanggaran_mahasiswas.sanksi_id`
8. `beasiswas.jenis_beasiswa_id`  
Selain itu, operasi `store`, `update`, dan `destroy` belum mencatat audit trail di `ActivityLogger`.

---

### TASK-009: Rate Limiting dan Indikator Sandbox Mode di PD-DIKTI

**Prioritas:** Medium  
**Status:** Not Started  
**Phase:** 5  

**Masalah:**  
Endpoint `POST /pddikti/sync-batch` memicu dispatch queue job massal (mahasiswa, kelas, nilai). Jika tombol ditekan berulang-ulang, antrean antrean database dapat mengalami lonjakan beban (request storm). Selain itu, operator tidak mendapatkan indikator visual yang jelas di UI apakah feeder sedang dalam mode sandbox atau live production.

---

### TASK-010: Standardisasi Flash Error Response di RuangKuliahController

**Prioritas:** Low  
**Status:** Not Started  
**Phase:** 6  

**Masalah:**  
`RuangKuliahController::destroy()` menggunakan format `back()->withErrors(['error' => ...])` saat membatalkan delete karena ruang masih dipakai di jadwal perkuliahan. Seluruh controller lain di aplikasi menggunakan format standar `back()->with('error', ...)`.

---

### TASK-011: Batasi Impersonasi Antar-Superadmin

**Prioritas:** Low  
**Status:** Not Started  
**Phase:** 6  

**Masalah:**  
Seorang pengguna dengan role Superadmin saat ini dapat melakukan impersonasi ke akun pengguna lain yang juga memiliki role Superadmin. Hal ini berpotensi membingungkan jejak audit dan menciptakan celah eskalasi sesi yang tidak perlu.

---

## 6. Urutan Eksekusi

```
[X] Phase 1 — Critical Bug Fix: Kompatibilitas MySQL (SELESAI ✅)
    [X] TASK-001 — Fix ilike di UserManagementController
    [X] TASK-002 — Fix ilike di MonitoringController
    [X] TASK-003 — Fix ilike di TahunAjaranController

[ ] Phase 2 — Role & Authorization Consistency (Menunggu Konfirmasi User ⏸️)
    [ ] TASK-004 — Penyelarasan role Kemahasiswaan
    [ ] TASK-005 — Penyelarasan role Kepegawaian

[ ] Phase 3 — Missing Core Features
    [ ] TASK-006 — Implementasi CRUD Konsentrasi Program Studi
    [ ] TASK-007 — Implementasi Kalender Akademik

[ ] Phase 4 — Data Integrity & Audit Trail
    [ ] TASK-008 — Guard delete komprehensif & activity log Referensi Biodata

[ ] Phase 5 — Integration Hardening
    [ ] TASK-009 — Rate limiting & badge sandbox mode PD-DIKTI

[ ] Phase 6 — Code Quality & Minor Safeguards
    [ ] TASK-010 — Standardisasi flash error response Ruang Kuliah
    [ ] TASK-011 — Pembatasan impersonasi sesama Superadmin
```

---

## 7. Aturan Pengerjaan

1. **Jangan mengerjakan semua task sekaligus.** Kerjakan satu task dalam satu waktu, selesaikan sepenuhnya sebelum beralih ke task berikutnya.
2. **Kerjakan hanya satu task atau satu phase dalam satu waktu.** Jangan loncat ke phase berikutnya sebelum phase aktif selesai.
3. **Sebelum mengubah kode, baca terlebih dahulu seluruh file yang terdampak.** Pahami konteks dan pola yang ada sebelum mulai menulis.
4. **Jangan melakukan refactor besar jika tidak diperlukan.** Hanya ubah apa yang disebutkan dalam rencana implementasi task.
5. **Jangan mengubah fitur yang sudah berfungsi.** Fitur seperti Dashboard, Impersonasi, Reset Password, System Configs, dan CRUD Master Data yang sudah berfungsi tidak boleh terganggu.
6. **Setelah implementasi, lakukan testing** sesuai bagian Testing pada setiap task sebelum dianggap selesai.
7. **Setelah task selesai, update status pada dokumen ini** dari `Not Started` menjadi `Done` beserta catatan jika ada.
8. **Jika ditemukan masalah baru saat implementasi, jangan langsung memperluas scope.** Catat terlebih dahulu sebagai temuan baru di bagian bawah dokumen ini dan lanjutkan task yang sedang dikerjakan.
9. **Pastikan setiap perubahan tidak merusak role atau fitur lain.** Jalankan test suite yang relevan setelah setiap task.
10. **Jangan mulai implementasi tanpa persetujuan.** Setiap phase baru harus dikonfirmasi terlebih dahulu dengan user.
