# High-Level Entity Relationship Diagram (Conceptual & Architectural ERD)
## Sistem Informasi Akademik (SIAKAD) STAI Al-Yasini

Dokumen ini menyajikan arsitektur database tingkat tinggi (*high-level conceptual / architectural view*) untuk memberikan pemahaman menyeluruh terhadap integrasi data antar-domain bisnis pada SIAKAD STAI Al-Yasini.

---

## 1. Diagram Integrasi Lintas Domain Utama (Mermaid)

Diagram di bawah ini menggambarkan interaksi antara entitas jangkar (*anchor entities*) dari setiap domain utama:

```mermaid
erDiagram
    %% DOMAIN: AUTH & RBAC
    users {
        bigint id PK
        varchar name
        varchar email UK
        varchar role_aktif
    }

    %% DOMAIN: KEPEGAWAIAN
    dosens {
        bigint id PK
        bigint user_id FK
        varchar nidn UK
        varchar nama_dosen
    }

    %% DOMAIN: MASTER DATA
    program_studis {
        bigint id PK
        varchar kode_prodi UK
        varchar nama_prodi
        varchar jenjang
    }

    %% DOMAIN: PMB
    calon_mahasiswas {
        bigint id PK
        bigint user_id FK
        bigint program_studi_id FK
        varchar nomor_pendaftaran UK
        varchar status_pendaftaran
    }

    %% DOMAIN: MAHASISWA (CORE)
    mahasiswas {
        bigint id PK
        bigint user_id FK
        bigint program_studi_id FK
        varchar nim UK
        varchar nama_lengkap
        varchar status_mahasiswa
    }

    %% DOMAIN: KURIKULUM & MATAKULIAH
    matakuliahs {
        bigint id PK
        bigint program_studi_id FK
        varchar kode_matakuliah UK
        varchar nama_matakuliah
        int sks_total
    }

    %% DOMAIN: AKADEMIK & KELAS KULIAH
    kelas_kuliahs {
        bigint id PK
        bigint matakuliah_id FK
        bigint tahun_ajaran_id FK
        varchar nama_kelas
        int kapasitas
    }

    %% DOMAIN: KEUANGAN & KASIR
    tagihans {
        bigint id PK
        bigint mahasiswa_id FK
        varchar nomor_tagihan UK
        decimal total_tagihan
        varchar status_pembayaran
    }

    pembayarans {
        bigint id PK
        bigint tagihan_id FK
        varchar nomor_transaksi UK
        decimal jumlah_bayar
        varchar status_transaksi
    }

    %% DOMAIN: PERWALIAN & KONTRAK KRS
    krs {
        bigint id PK
        bigint mahasiswa_id FK
        bigint tahun_ajaran_id FK
        varchar status_krs
        int total_sks
    }

    krs_details {
        bigint id PK
        bigint krs_id FK
        bigint kelas_kuliah_id FK
        varchar status_persetujuan
    }

    %% DOMAIN: PRESENSI & PERKULIAHAN
    jurnal_perkuliahans {
        bigint id PK
        bigint kelas_kuliah_id FK
        int pertemuan_ke
        text materi_pembahasan
    }

    presensis {
        bigint id PK
        bigint jurnal_perkuliahan_id FK
        bigint mahasiswa_id FK
        varchar status_kehadiran
    }

    %% DOMAIN: PENILAIAN (KHS)
    nilais {
        bigint id PK
        bigint krs_detail_id FK
        decimal nilai_akhir
        varchar nilai_huruf
        decimal nilai_indeks
    }

    %% DOMAIN: TUGAS AKHIR & YUDISIUM
    proposal_skripsis {
        bigint id PK
        bigint mahasiswa_id FK
        text judul_proposal
        varchar status_proposal
    }

    skripsis {
        bigint id PK
        bigint proposal_skripsi_id FK
        bigint mahasiswa_id FK
        text judul_skripsi
        varchar status_skripsi
    }

    yudisiums {
        bigint id PK
        bigint mahasiswa_id FK
        varchar nomor_sk_yudisium
        date tanggal_yudisium
        varchar predikat_kelulusan
    }

    %% RELASI STRUKTURAL LINTAS DOMAIN
    users ||--o| dosens : "memiliki_profil_dosen"
    users ||--o| mahasiswas : "memiliki_profil_mahasiswa"
    users ||--o| calon_mahasiswas : "memiliki_profil_camaba"

    program_studis ||--o{ dosens : "homebase"
    program_studis ||--o{ mahasiswas : "terdaftar_pada"
    program_studis ||--o{ matakuliahs : "menyelenggarakan"
    program_studis ||--o{ calon_mahasiswas : "pilihan_prodi"

    matakuliahs ||--o{ kelas_kuliahs : "dibuka_menjadi"
    dosens ||--o{ kelas_kuliahs : "mengajar_melalui_pivot"

    %% Alur Mahasiswa & Akademik
    calon_mahasiswas ||--o| mahasiswas : "dikonversi_menjadi"
    mahasiswas ||--o{ tagihans : "diterbitkan_tagihan"
    tagihans ||--o{ pembayarans : "dilunasi_oleh"

    mahasiswas ||--o{ krs : "mengajukan_krs"
    krs ||--|{ krs_details : "memilih_mata_kuliah"
    kelas_kuliahs ||--o{ krs_details : "peserta_kelas"

    %% Alur Kuliah, Presensi & Nilai
    kelas_kuliahs ||--o{ jurnal_perkuliahans : "pelaksanaan_tatap_muka"
    jurnal_perkuliahans ||--o{ presensis : "catatan_kehadiran"
    mahasiswas ||--o{ presensis : "status_hadir"
    krs_details ||--o| nilais : "memperoleh_hasil_studi"

    %% Alur Kelulusan
    mahasiswas ||--o{ proposal_skripsis : "mengajukan_judul"
    proposal_skripsis ||--o| skripsis : "disetujui_menjadi"
    mahasiswas ||--o{ skripsis : "mengerjakan_tugas_akhir"
    mahasiswas ||--o| yudisiums : "ditetapkan_kelulusan"
```

---

## 2. Alur Interaksi Antar Domain Bisnis

### A. Siklus Masuk & Konversi (PMB -> Keuangan -> Master Mahasiswa)
1. Calon mahasiswa mendaftar pada portal PMB (`calon_mahasiswas`), memilih `program_studis`, dan mengunggah berkas.
2. Setelah dinyatakan lulus tes seleksi, calon mahasiswa melakukan her-registrasi dan pembayaran biaya awal.
3. Melalui `RegistrasiUlangService`, data calon mahasiswa dikonversi menjadi record resmi `mahasiswas`, dan diterbitkan akun pengguna (`users`) serta Nomor Induk Mahasiswa (NIM).

### B. Siklus Registrasi Semester (Keuangan -> Akademik KRS)
1. Pada awal semester baru, sistem keuangan (`tagihans`) menerbitkan invoice UKT berdasarkan tarif `kelompok_ukts` atau pembebasan bagi penerima `beasiswa_mahasiswas`.
2. Setelah transaksi kasir POS atau verifikasi transfer lunas (`pembayarans`), sistem membuka hak akses pengisian KRS online (`krs`).
3. Mahasiswa mengontrak kelas matakuliah (`kelas_kuliahs`) ke dalam `krs_details`, lalu dosen wali mengevaluasi dan memberikan persetujuan (*approved*).

### C. Siklus Perkuliahan & Penilaian (Akademik -> Presensi -> KHS)
1. Dosen mengajar kelas dan mengisi jurnal tatap muka 1-16 pertemuan (`jurnal_perkuliahans`).
2. Kehadiran mahasiswa dicatat per pertemuan (`presensis`). Persentase kehadiran menjadi syarat kelayakan mengikuti UTS ($\ge 50\%$) dan UAS ($\ge 75\%$).
3. Dosen menginput nilai komponen tugas, UTS, dan UAS. Sistem secara otomatis mengkalkulasi nilai angka, huruf mutu, dan bobot indeks ke dalam tabel `nilais` untuk menerbitkan Kartu Hasil Studi (KHS).

### D. Siklus Tugas Akhir & Kelulusan (Skripsi -> Yudisium -> Alumni)
1. Mahasiswa yang telah menempuh minimal 100 SKS mengajukan judul pada `proposal_skripsis`.
2. Setelah disetujui Kaprodi dan melalui seminar proposal, proposal naik status menjadi naskah `skripsis`.
3. Mahasiswa melakukan bimbingan rutin (minimal 8 sesi log) sebelum diuji pada sidang munaqasyah dewan penguji.
4. Mahasiswa yang lulus sidang dan menyelesaikan audit bebas tanggungan akademik/keuangan didaftarkan ke sidang `yudisiums` untuk penetapan SK Yudisium, IPK akhir, serta penjadwalan wisuda sarjana.

---
*Dokumentasi disusun oleh Senior Database Architect SIAKAD STAI Al-Yasini.*