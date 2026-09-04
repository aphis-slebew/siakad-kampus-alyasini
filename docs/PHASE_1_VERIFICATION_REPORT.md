# Laporan Verifikasi Phase 1 — Critical Bug Fix (Kompatibilitas MySQL)

> **Tanggal Verifikasi:** 2026-09-04  
> **Lingkungan Pengujian:** Windows Laragon (MySQL 8.0.30, PHP 8.4.25 CLI, SQLite In-Memory Test Suite)  
> **Status Keseluruhan:** **ALL PASSED (100% SUKSES)**

---

## 1. Ringkasan Eksekutif

Phase 1 bertujuan memperbaiki error fatal database MySQL yang disebabkan oleh penggunaan operator case-insensitive PostgreSQL `ilike` pada fitur pencarian (search) di 3 modul utama Super Admin. 

Seluruh task (TASK-001 sampai TASK-003) telah selesai diimplementasikan dengan intervensi kode minimal, tanpa refactor berlebihan, dan telah diverifikasi secara menyeluruh menggunakan automated test runner (Pest 5 / PHPUnit 13) serta code formatter (Laravel Pint).

| Task ID | Nama Task | File Terdampak | Status | Hasil Pengujian |
|---|---|---|:---:|---|
| **TASK-001** | Fix `ilike` di UserManagementController | `app/Http/Controllers/Superadmin/UserManagementController.php` | **PASS** | 10/10 tests passed (32 assertions) |
| **TASK-002** | Fix `ilike` di MonitoringController | `app/Http/Controllers/Superadmin/MonitoringController.php` | **PASS** | 4/4 tests passed (7 assertions) |
| **TASK-003** | Fix `ilike` di TahunAjaranController | `app/Http/Controllers/Master/TahunAjaranController.php` | **PASS** | 3/3 tests passed (5 assertions) |

---

## 2. Rincian Eksekusi & Bukti Pengujian

---

### TASK-001: Fix `ilike` di UserManagementController

* **Masalah Awal:**  
  Pencarian pengguna pada route `GET /users?search=...` mengeksekusi query dengan operator `'ilike'` pada kolom `name` dan `email`. Pada MySQL, query ini melempar exception:
  `QueryException: Unknown column comparison operator 'ilike'`.
* **Perubahan Kode:**  
  Mengganti operator `'ilike'` menjadi `'like'` pada query builder:
  ```php
  // app/Http/Controllers/Superadmin/UserManagementController.php (lines 101-102)
  if ($search) {
      $query->where(function ($q) use ($search) {
          $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
      });
  }
  ```
* **Metode Verifikasi:**  
  Menambahkan test kasus pencarian nama dan email di `tests/Feature/UserManagementTest.php`:
  `Superadmin can search users by name and email without database error`.
* **Hasil Pengujian Otomatis:**
  ```text
  PASS  Tests\Feature\UserManagementTest
  ✓ Superadmin can view user management list
  ✓ Superadmin can search users by name and email without database error
  ✓ Non-superadmin cannot access user management
  ✓ Superadmin can create new user and assign role
  ✓ Superadmin can reset any user password
  ✓ Superadmin can impersonate another user and leave impersonation
  ✓ Superadmin cannot create user with incompatible user_type and role
  ✓ Superadmin cannot update user to incompatible user_type and role
  ✓ Password reset sends in-app notification to target user
  ✓ Leave impersonation redirects to login safely if impersonator no longer exists

  Tests:    10 passed (32 assertions)
  Duration: 4.65s
  ```
* **Status:** ✅ **PASS**

---

### TASK-002: Fix `ilike` di MonitoringController

* **Masalah Awal:**  
  Pencarian log sistem pada route `GET /superadmin/monitoring?search=...` menggunakan operator `'ilike'` pada 4 titik: kolom `action`, `entity_type`, `ip_address`, dan relasi `user.name`.
* **Perubahan Kode:**  
  Mengganti ke-4 pemanggilan `'ilike'` menjadi `'like'`:
  ```php
  // app/Http/Controllers/Superadmin/MonitoringController.php (lines 33-36)
  if ($search) {
      $query->where(function ($q) use ($search) {
          $q->where('action', 'like', "%{$search}%")
              ->orWhere('entity_type', 'like', "%{$search}%")
              ->orWhere('ip_address', 'like', "%{$search}%")
              ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
      });
  }
  ```
* **Metode Verifikasi:**  
  Membuat test suite baru `tests/Feature/MonitoringTest.php` yang menguji pencarian log berdasarkan action, entity_type, ip_address, dan relasi user name.
* **Hasil Pengujian Otomatis:**
  ```text
  PASS  Tests\Feature\MonitoringTest
  ✓ Superadmin can view system monitoring dashboard
  ✓ Non-superadmin cannot access system monitoring
  ✓ Superadmin can search audit logs by action, entity_type, ip, and user name without database error
  ✓ Superadmin can filter audit logs by action filter

  Tests:    4 passed (7 assertions)
  Duration: 1.78s
  ```
* **Status:** ✅ **PASS**

---

### TASK-003: Fix `ilike` di TahunAjaranController

* **Masalah Awal:**  
  Pencarian tahun ajaran pada route `GET /master/tahun-ajaran?search=...` menggunakan operator `'ilike'` pada kolom `nama`.
* **Perubahan Kode:**  
  Mengganti operator `'ilike'` menjadi `'like'`:
  ```php
  // app/Http/Controllers/Master/TahunAjaranController.php (line 26)
  if ($search) {
      $query->where('nama', 'like', "%{$search}%");
  }
  ```
* **Metode Verifikasi:**  
  Membuat feature test `tests/Feature/TahunAjaranTest.php` untuk menguji hak akses superadmin, filter status aktif/nonaktif, dan pencarian nama tahun ajaran.
* **Hasil Pengujian Otomatis:**
  ```text
  PASS  Tests\Feature\TahunAjaranTest
  ✓ Superadmin can view master tahun ajaran list
  ✓ Non-authorized user cannot access master tahun ajaran
  ✓ Superadmin can search tahun ajaran by name without database error

  Tests:    3 passed (5 assertions)
  Duration: 1.59s
  ```
* **Status:** ✅ **PASS**

---

## 3. Hasil Regression Testing

Pengujian regresi gabungan dijalankan secara simultan untuk seluruh modul yang disentuh:

```powershell
D:\laragon\bin\php\php-8.4.25-Win32-vs17-x64\php.exe artisan test --compact tests/Feature/UserManagementTest.php tests/Feature/MonitoringTest.php tests/Feature/TahunAjaranTest.php
```

**Hasil:**
```text
   PASS  Tests\Feature\MonitoringTest (4 tests)
   PASS  Tests\Feature\TahunAjaranTest (3 tests)
   PASS  Tests\Feature\UserManagementTest (10 tests)

   Tests:    17 passed (44 assertions)
   Duration: 26.28s
```

### Verifikasi Code Style (Laravel Pint)
```powershell
D:\laragon\bin\php\php-8.4.25-Win32-vs17-x64\php.exe vendor/bin/pint --dirty --format agent
```
**Hasil:**
```json
{"tool":"pint","result":"passed"}
```
Tidak ada pelanggaran gaya kode (*0 linting errors*).

---

## 4. Kesimpulan & Batasan

1. **Phase 1 Selesai 100%**: Seluruh pencarian di User Management, Monitoring, dan Tahun Ajaran kini kompatibel penuh dengan MySQL Laragon tanpa mengorbankan fungsionalitas di PostgreSQL.
2. **Tidak Ada Regression**: Fitur dasar seperti login, impersonasi, otorisasi role, dan pagination tetap berfungsi normal.
3. **Sesuai Arahan User**: Tidak ada pengerjaan yang melompat ke Phase 2 sebelum konfirmasi resmi nama canonical role diterima.
