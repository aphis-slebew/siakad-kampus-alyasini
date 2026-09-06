# Domain ERD: Akademik, Kurikulum & Kontrak Studi (KRS)

## 1. Deskripsi Domain
Dokumentasi ERD untuk struktur kurikulum prodi, matakuliah, prasyarat matakuliah, ekivalensi kurikulum lama-baru, pembagian kelas perkuliahan, penugasan dosen pengajar, jadwal kuliah mingguan, kontrak rencana studi (KRS) mahasiswa, dan detail KRS per matakuliah.

## 2. Diagram ERD (Crow's Foot Notation)

```mermaid
erDiagram
    kurikulum_prodis {
        bigint id PK "id"
        bigint program_studi_id FK "program_studi_id"
        varchar tahun_kurikulum "tahun_kurikulum"
        tinyint is_active "is_active"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    matakuliahs {
        bigint id PK "id"
        varchar kode UK "kode"
        varchar nama "nama"
        int sks "sks"
        varchar jenis "jenis"
        bigint bidang_ilmu_id FK "bidang_ilmu_id"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
        timestamp deleted_at "deleted_at"
    }
    kurikulum_matakuliahs {
        bigint id PK "id"
        bigint kurikulum_prodi_id FK "kurikulum_prodi_id"
        bigint matakuliah_id FK "matakuliah_id"
        int semester "semester"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    prasyarat_matakuliahs {
        bigint id PK "id"
        bigint matakuliah_id FK "matakuliah_id"
        bigint matakuliah_prasyarat_id FK "matakuliah_prasyarat_id"
        varchar minimal_nilai "minimal_nilai"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    ekivalensi_matakuliahs {
        bigint id PK "id"
        bigint matakuliah_lama_id FK "matakuliah_lama_id"
        bigint matakuliah_baru_id FK "matakuliah_baru_id"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    kelas_kuliahs {
        bigint id PK "id"
        bigint kurikulum_matakuliah_id FK "kurikulum_matakuliah_id"
        bigint tahun_ajaran_id FK "tahun_ajaran_id"
        varchar nama_kelas "nama_kelas"
        int kuota "kuota"
        varchar sistem_kuliah "sistem_kuliah"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    dosen_pengajars {
        bigint id PK "id"
        bigint kelas_kuliah_id FK "kelas_kuliah_id"
        bigint dosen_id FK "dosen_id"
        varchar peran "peran"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    jadwal_perkuliahans {
        bigint id PK "id"
        bigint kelas_kuliah_id FK "kelas_kuliah_id"
        bigint ruang_kuliah_id FK "ruang_kuliah_id"
        varchar hari "hari"
        time jam_mulai "jam_mulai"
        time jam_selesai "jam_selesai"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    krs {
        bigint id PK "id"
        bigint mahasiswa_id FK "mahasiswa_id"
        bigint tahun_ajaran_id FK "tahun_ajaran_id"
        varchar status "status"
        timestamp diajukan_at "diajukan_at"
        timestamp disetujui_at "disetujui_at"
        text catatan_penolakan "catatan_penolakan"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    krs_details {
        bigint id PK "id"
        bigint krs_id FK "krs_id"
        bigint kelas_kuliah_id FK "kelas_kuliah_id"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    kurikulum_prodis ||--o{ kurikulum_matakuliahs : "kurikulum_prodi_id"
    matakuliahs ||--o{ kurikulum_matakuliahs : "matakuliah_id"
    matakuliahs ||--o{ prasyarat_matakuliahs : "matakuliah_id"
    matakuliahs ||--o{ prasyarat_matakuliahs : "matakuliah_prasyarat_id"
    matakuliahs ||--o{ ekivalensi_matakuliahs : "matakuliah_baru_id"
    matakuliahs ||--o{ ekivalensi_matakuliahs : "matakuliah_lama_id"
    kurikulum_matakuliahs ||--o{ kelas_kuliahs : "kurikulum_matakuliah_id"
    kelas_kuliahs ||--o{ dosen_pengajars : "kelas_kuliah_id"
    kelas_kuliahs ||--o{ jadwal_perkuliahans : "kelas_kuliah_id"
    kelas_kuliahs ||--o{ krs_details : "kelas_kuliah_id"
    krs ||--o{ krs_details : "krs_id"
```

## 3. Inventarisasi Tabel Domain

| Nama Tabel | Total Kolom | Primary Key | Total FK | Keterangan Fungsi |
|---|---|---|---|---|
| `kurikulum_prodis` | 6 | `id` | 1 | Tabel operasional modul kurikulum prodis |
| `matakuliahs` | 9 | `id` | 1 | Tabel operasional modul matakuliahs |
| `kurikulum_matakuliahs` | 6 | `id` | 2 | Tabel operasional modul kurikulum matakuliahs |
| `prasyarat_matakuliahs` | 6 | `id` | 2 | Tabel operasional modul prasyarat matakuliahs |
| `ekivalensi_matakuliahs` | 5 | `id` | 2 | Tabel operasional modul ekivalensi matakuliahs |
| `kelas_kuliahs` | 8 | `id` | 2 | Tabel operasional modul kelas kuliahs |
| `dosen_pengajars` | 6 | `id` | 2 | Tabel operasional modul dosen pengajars |
| `jadwal_perkuliahans` | 8 | `id` | 2 | Tabel operasional modul jadwal perkuliahans |
| `krs` | 9 | `id` | 2 | Tabel operasional modul krs |
| `krs_details` | 5 | `id` | 2 | Tabel operasional modul krs details |

---
*Dokumentasi ini digenerate secara otomatis berdasarkan skema database fisik aktif `siakad_db`.*
