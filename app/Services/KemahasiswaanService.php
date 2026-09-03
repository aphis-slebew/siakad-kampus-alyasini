<?php

namespace App\Services;

use App\Models\AktivitasMahasiswa;
use App\Models\BeasiswaMahasiswa;
use App\Models\Mahasiswa;
use App\Models\PelanggaranMahasiswa;
use App\Notifications\KemahasiswaanNotification;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KemahasiswaanService
{
    /**
     * Mahasiswa submits student activity record.
     */
    public function submitAktivitas(Mahasiswa $mahasiswa, string $namaKegiatan, ?int $jenisAktivitasId = null): AktivitasMahasiswa
    {
        return AktivitasMahasiswa::create([
            'mahasiswa_id' => $mahasiswa->id,
            'jenis_aktivitas_id' => $jenisAktivitasId,
            'nama_kegiatan' => $namaKegiatan,
            'divalidasi' => false,
        ]);
    }

    /**
     * Staff/Dosen validates student activity record.
     */
    public function validateAktivitas(AktivitasMahasiswa $aktivitas): AktivitasMahasiswa
    {
        return DB::transaction(function () use ($aktivitas) {
            $aktivitas->update(['divalidasi' => true]);

            ActivityLogger::log('kemahasiswaan.aktivitas.validate', 'AktivitasMahasiswa', $aktivitas->id, [
                'divalidasi' => false,
            ], [
                'divalidasi' => true,
            ]);

            $studentUser = $aktivitas->mahasiswa->user ?? null;
            if ($studentUser) {
                try {
                    $studentUser->notify(new KemahasiswaanNotification(
                        'aktivitas',
                        $aktivitas->nama_kegiatan,
                        'divalidasi'
                    ));
                } catch (\Throwable $e) {
                    Log::error('Gagal mengirim notification Aktivitas: '.$e->getMessage());
                }
            }

            return $aktivitas->fresh();
        });
    }

    /**
     * Staff Kemahasiswaan inputs student violation record (pencatatan sepihak institusi).
     */
    public function createPelanggaran(Mahasiswa $mahasiswa, ?int $jenisPelanggaranId, ?int $sanksiId, string $tanggal): PelanggaranMahasiswa
    {
        return DB::transaction(function () use ($mahasiswa, $jenisPelanggaranId, $sanksiId, $tanggal) {
            $pelanggaran = PelanggaranMahasiswa::create([
                'mahasiswa_id' => $mahasiswa->id,
                'jenis_pelanggaran_id' => $jenisPelanggaranId,
                'sanksi_id' => $sanksiId,
                'tanggal' => $tanggal,
            ]);

            ActivityLogger::log('kemahasiswaan.pelanggaran.create', 'PelanggaranMahasiswa', $pelanggaran->id, [], [
                'mahasiswa_id' => $mahasiswa->id,
                'jenis_pelanggaran_id' => $jenisPelanggaranId,
                'sanksi_id' => $sanksiId,
                'tanggal' => $tanggal,
            ]);

            return $pelanggaran;
        });
    }

    /**
     * Mahasiswa applies for scholarship.
     */
    public function submitBeasiswa(Mahasiswa $mahasiswa, ?int $jenisBeasiswaId): BeasiswaMahasiswa
    {
        return BeasiswaMahasiswa::create([
            'mahasiswa_id' => $mahasiswa->id,
            'jenis_beasiswa_id' => $jenisBeasiswaId,
            'status' => 'diajukan',
        ]);
    }

    /**
     * Staff approves/rejects scholarship application.
     */
    public function approveBeasiswa(BeasiswaMahasiswa $beasiswa, string $newStatus): BeasiswaMahasiswa
    {
        if (! in_array($newStatus, ['diterima', 'ditolak'])) {
            throw new DomainException("Status beasiswa invalid: '{$newStatus}'. Pilih 'diterima' atau 'ditolak'.");
        }

        return DB::transaction(function () use ($beasiswa, $newStatus) {
            $oldStatus = $beasiswa->status;
            $beasiswa->update(['status' => $newStatus]);

            ActivityLogger::log('kemahasiswaan.beasiswa.approve', 'BeasiswaMahasiswa', $beasiswa->id, [
                'status' => $oldStatus,
            ], [
                'status' => $newStatus,
            ]);

            $studentUser = $beasiswa->mahasiswa->user ?? null;
            if ($studentUser) {
                try {
                    $namaItem = $beasiswa->jenisBeasiswa->nama ?? 'Beasiswa';
                    $studentUser->notify(new KemahasiswaanNotification(
                        'beasiswa',
                        $namaItem,
                        $newStatus
                    ));
                } catch (\Throwable $e) {
                    Log::error('Gagal mengirim notification Beasiswa: '.$e->getMessage());
                }
            }

            return $beasiswa->fresh();
        });
    }
}
