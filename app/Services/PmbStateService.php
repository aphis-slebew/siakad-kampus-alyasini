<?php

namespace App\Services;

use App\Models\CalonMahasiswa;
use App\Models\Mahasiswa;
use App\Models\RegistrasiUlang;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;

class PmbStateService
{
    /**
     * Sequential status transition map.
     */
    protected array $allowedTransitions = [
        'draft' => ['diajukan'],
        'diajukan' => ['verifikasi_berkas'],
        'verifikasi_berkas' => ['lolos_verifikasi', 'tidak_lulus'],
        'lolos_verifikasi' => ['dijadwalkan_tes'],
        'dijadwalkan_tes' => ['lulus_seleksi', 'tidak_lulus'],
        'lulus_seleksi' => [],
        'tidak_lulus' => [],
    ];

    public function __construct(
        protected NimGeneratorService $nimGenerator
    ) {}

    /**
     * Transition Calon Mahasiswa status pendaftaran sequentially.
     */
    public function transition(CalonMahasiswa $calon, string $targetStatus): CalonMahasiswa
    {
        $currentStatus = $calon->status_pendaftaran;

        if (! isset($this->allowedTransitions[$currentStatus]) || ! in_array($targetStatus, $this->allowedTransitions[$currentStatus], true)) {
            throw new InvalidArgumentException(
                "Transisi status pendaftaran dari '{$currentStatus}' ke '{$targetStatus}' tidak valid. Transisi harus berurutan."
            );
        }

        $oldStatus = $calon->status_pendaftaran;
        $calon->status_pendaftaran = $targetStatus;
        $calon->save();

        ActivityLogger::log('pmb.update_status_pendaftaran', 'CalonMahasiswa', $calon->id, [
            'status_pendaftaran' => $oldStatus,
        ], [
            'status_pendaftaran' => $targetStatus,
        ]);

        return $calon;
    }

    /**
     * Convert admitted Calon Mahasiswa to official Mahasiswa & User accounts.
     *
     * SYARAT KONVERSI RESMI (01-PRD.md §5 & Langkah 4):
     * 1. Status seleksi == 'lulus'
     * 2. Status registrasi ulang di tabel registrasi_ulangs == 'selesai' (QUERIED REAL DATA, NO MOCK FLAGS)
     */
    public function convertCalonKeMahasiswa(CalonMahasiswa $calon): Mahasiswa
    {
        if ($calon->status_pendaftaran !== 'lulus_seleksi') {
            throw new DomainException('Calon mahasiswa belum mencapai status lulus_seleksi.');
        }

        $hasilSeleksi = $calon->hasilSeleksi;
        if (! $hasilSeleksi || $hasilSeleksi->status !== 'lulus') {
            throw new DomainException('Hasil seleksi calon mahasiswa belum berstatus lulus.');
        }

        // REAL CHECK (Langkah 4 Integration): Query database registrasi_ulangs for status = 'selesai'
        $isRegistrasiUlangSelesai = RegistrasiUlang::where('calon_mahasiswa_id', $calon->id)
            ->where('status', 'selesai')
            ->exists();

        if (! $isRegistrasiUlangSelesai) {
            throw new DomainException("Calon mahasiswa belum menyelesaikan proses registrasi ulang (status registrasi ulang di database belum 'selesai').");
        }

        $prodiId = $calon->program_studi_pilihan_1_id;

        return $this->nimGenerator->generateAndExecute($prodiId, function (string $nim) use ($calon, $prodiId) {
            // 1. Buat User Account BARU untuk Mahasiswa (Role: mahasiswa)
            $studentEmail = $calon->email ?: strtolower($nim).'@student.alyasini.ac.id';
            $userMahasiswa = User::create([
                'name' => $calon->nama_lengkap,
                'email' => $studentEmail,
                'password' => Hash::make('password'),
                'user_type' => 'mahasiswa',
                'status' => 'aktif',
            ]);
            $userMahasiswa->assignRole('mahasiswa');

            // 2. Buat Baris BARU di tabel mahasiswas (Calon Mahasiswa LAMA tetap ada di DB)
            $mahasiswa = Mahasiswa::create([
                'user_id' => $userMahasiswa->id,
                'calon_mahasiswa_id' => $calon->id,
                'program_studi_id' => $prodiId,
                'nim' => $nim,
                'nik' => $calon->nik,
                'nama_lengkap' => $calon->nama_lengkap,
                'tempat_lahir' => $calon->tempat_lahir,
                'tanggal_lahir' => $calon->tanggal_lahir,
                'jenis_kelamin' => $calon->jenis_kelamin,
                'alamat_ktp' => $calon->alamat,
                'no_hp' => $calon->no_hp,
                'email_pribadi' => $studentEmail,
                'tahun_masuk' => (int) date('Y'),
                'status_mahasiswa' => 'aktif',
            ]);

            // Audit log pencatatan konversi
            ActivityLogger::log('pmb.konversi_mahasiswa', 'Mahasiswa', $mahasiswa->id, null, [
                'calon_mahasiswa_id' => $calon->id,
                'nim' => $mahasiswa->nim,
                'nama_lengkap' => $mahasiswa->nama_lengkap,
                'user_id' => $userMahasiswa->id,
            ]);

            return $mahasiswa;
        });
    }
}
