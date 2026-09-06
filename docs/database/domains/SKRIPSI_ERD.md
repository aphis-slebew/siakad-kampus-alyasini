# Domain ERD: Tugas Akhir, Skripsi, Munaqasyah & Yudisium

## 1. Deskripsi Domain
Dokumentasi ERD untuk siklus penyelesaian studi akhir: pengajuan dan verifikasi proposal skripsi, bimbingan proposal, penetapan dosen pembimbing skripsi, log asistensi/bimbingan rutin (minimal 8 log), sidang munaqasyah, audit bebas tanggungan akademik/keuangan, penetapan SK Yudisium, dan penjadwalan periode wisuda.

## 2. Diagram ERD (Crow's Foot Notation)

```mermaid
erDiagram
    proposal_skripsis {
        bigint id PK "id"
        bigint mahasiswa_id FK "mahasiswa_id"
        bigint dosen_pembimbing_id FK "dosen_pembimbing_id"
        text judul "judul"
        varchar status "status"
        date tanggal_ujian "tanggal_ujian"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    bimbingan_proposals {
        bigint id PK "id"
        bigint proposal_skripsi_id FK "proposal_skripsi_id"
        date tanggal "tanggal"
        text catatan "catatan"
        tinyint divalidasi "divalidasi"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    skripsis {
        bigint id PK "id"
        bigint mahasiswa_id FK "mahasiswa_id"
        bigint dosen_pembimbing_id FK "dosen_pembimbing_id"
        text judul "judul"
        varchar status "status"
        date tanggal_ujian "tanggal_ujian"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    bimbingan_skripsis {
        bigint id PK "id"
        bigint skripsi_id FK "skripsi_id"
        date tanggal "tanggal"
        text catatan "catatan"
        tinyint divalidasi "divalidasi"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    yudisiums {
        bigint id PK "id"
        bigint mahasiswa_id FK "mahasiswa_id"
        bigint periode_wisuda_id FK "periode_wisuda_id"
        decimal ipk_akhir "ipk_akhir"
        varchar nomor_dokumen "nomor_dokumen"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    periode_wisudas {
        bigint id PK "id"
        varchar nama "nama"
        date tanggal_wisuda "tanggal_wisuda"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    proposal_skripsis ||--o{ bimbingan_proposals : "proposal_skripsi_id"
    skripsis ||--o{ bimbingan_skripsis : "skripsi_id"
    periode_wisudas |o--o{ yudisiums : "periode_wisuda_id"
```

## 3. Inventarisasi Tabel Domain

| Nama Tabel | Total Kolom | Primary Key | Total FK | Keterangan Fungsi |
|---|---|---|---|---|
| `proposal_skripsis` | 8 | `id` | 2 | Tabel operasional modul proposal skripsis |
| `bimbingan_proposals` | 7 | `id` | 1 | Tabel operasional modul bimbingan proposals |
| `skripsis` | 8 | `id` | 2 | Tabel operasional modul skripsis |
| `bimbingan_skripsis` | 7 | `id` | 1 | Tabel operasional modul bimbingan skripsis |
| `yudisiums` | 7 | `id` | 2 | Tabel operasional modul yudisiums |
| `periode_wisudas` | 5 | `id` | 0 | Tabel operasional modul periode wisudas |

---
*Dokumentasi ini digenerate secara otomatis berdasarkan skema database fisik aktif `siakad_db`.*
