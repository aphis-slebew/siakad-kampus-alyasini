# Domain ERD: Presensi Perkuliahan & Penilaian Akademik

## 1. Deskripsi Domain
Dokumentasi ERD untuk pencatatan 16 sesi tatap muka perkuliahan (jurnal dosen & materi), presensi kehadiran mahasiswa per pertemuan, konfigurasi persentase bobot komposisi nilai (tugas, kuis, UTS, UAS, kehadiran), dan nilai akhir mahasiswa (KHS).

## 2. Diagram ERD (Crow's Foot Notation)

```mermaid
erDiagram
    jurnal_perkuliahans {
        bigint id PK "id"
        bigint kelas_kuliah_id FK "kelas_kuliah_id"
        date tanggal "tanggal"
        text materi "materi"
        bigint dosen_pengajar_id FK "dosen_pengajar_id"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    presensis {
        bigint id PK "id"
        bigint jurnal_perkuliahan_id FK "jurnal_perkuliahan_id"
        bigint mahasiswa_id FK "mahasiswa_id"
        varchar status "status"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    komposisi_nilais {
        bigint id PK "id"
        bigint kelas_kuliah_id FK "kelas_kuliah_id"
        varchar komponen "komponen"
        int bobot_persen "bobot_persen"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    nilais {
        bigint id PK "id"
        bigint krs_detail_id FK "krs_detail_id"
        varchar komponen "komponen"
        decimal nilai_angka "nilai_angka"
        varchar nilai_huruf "nilai_huruf"
        tinyint is_final "is_final"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    jurnal_perkuliahans ||--o{ presensis : "jurnal_perkuliahan_id"
```

## 3. Inventarisasi Tabel Domain

| Nama Tabel | Total Kolom | Primary Key | Total FK | Keterangan Fungsi |
|---|---|---|---|---|
| `jurnal_perkuliahans` | 7 | `id` | 2 | Tabel operasional modul jurnal perkuliahans |
| `presensis` | 6 | `id` | 2 | Tabel operasional modul presensis |
| `komposisi_nilais` | 6 | `id` | 1 | Tabel operasional modul komposisi nilais |
| `nilais` | 8 | `id` | 1 | Tabel operasional modul nilais |

---
*Dokumentasi ini digenerate secara otomatis berdasarkan skema database fisik aktif `siakad_db`.*
