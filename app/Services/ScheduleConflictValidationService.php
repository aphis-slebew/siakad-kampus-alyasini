<?php

namespace App\Services;

use App\Models\Dosen;
use App\Models\JadwalPerkuliahan;
use App\Models\KelasKuliah;
use Illuminate\Validation\ValidationException;

class ScheduleConflictValidationService
{
    /**
     * Validate room and lecturer schedule conflicts for a class schedule.
     *
     * VALIDASI BENTROK JADWAL (Langkah 5 §2):
     * 1. RUANG BENTROK: 1 ruang kuliah tidak boleh dipakai 2 kelas berbeda di hari & jam overlap (tahun ajaran sama).
     * 2. DOSEN BENTROK: 1 dosen tidak boleh mengajar 2 kelas berbeda di hari & jam overlap (tahun ajaran sama).
     *
     * @param  int  $kelasKuliahId  ID Kelas Kuliah yang sedang dijadwalkan
     * @param  int  $ruangKuliahId  ID Ruang Kuliah
     * @param  string  $hari  Hari perkuliahan (Senin..Sabtu)
     * @param  string  $jamMulai  Jam mulai (HH:MM / HH:MM:SS)
     * @param  string  $jamSelesai  Jam selesai (HH:MM / HH:MM:SS)
     * @param  array<int>  $dosenIds  Array of Dosen IDs assigned to this class
     * @param  int|null  $ignoreJadwalId  ID Jadwal yang sedang diedit (optional)
     *
     * @throws ValidationException
     */
    public function validate(
        int $kelasKuliahId,
        int $ruangKuliahId,
        string $hari,
        string $jamMulai,
        string $jamSelesai,
        array $dosenIds = [],
        ?int $ignoreJadwalId = null
    ): void {
        $targetKelas = KelasKuliah::with(['kurikulumMatakuliah.matakuliah'])->findOrFail($kelasKuliahId);
        $tahunAjaranId = $targetKelas->tahun_ajaran_id;

        // Ensure time format HH:MM:SS
        $jamMulaiClean = (strlen($jamMulai) === 5) ? $jamMulai.':00' : $jamMulai;
        $jamSelesaiClean = (strlen($jamSelesai) === 5) ? $jamSelesai.':00' : $jamSelesai;

        if ($jamMulaiClean >= $jamSelesaiClean) {
            throw ValidationException::withMessages([
                'jam_selesai' => 'Jam selesai perkuliahan harus lebih besar dari jam mulai.',
            ]);
        }

        // 1. VALIDASI RUANG BENTROK
        $existingRuangJadwal = JadwalPerkuliahan::with(['kelasKuliah.kurikulumMatakuliah.matakuliah', 'ruangKuliah'])
            ->whereNotNull('ruang_kuliah_id')
            ->where('ruang_kuliah_id', $ruangKuliahId)
            ->where('kelas_kuliah_id', '!=', $kelasKuliahId)
            ->where('hari', $hari)
            ->whereHas('kelasKuliah', function ($q) use ($tahunAjaranId) {
                $q->where('tahun_ajaran_id', $tahunAjaranId);
            })
            ->where(function ($q) use ($jamMulaiClean, $jamSelesaiClean) {
                $q->where('jam_mulai', '<', $jamSelesaiClean)
                    ->where('jam_selesai', '>', $jamMulaiClean);
            })
            ->when($ignoreJadwalId, fn ($q) => $q->where('id', '!=', $ignoreJadwalId))
            ->first();

        if ($existingRuangJadwal) {
            $ruangNama = $existingRuangJadwal->ruangKuliah->nama ?? 'Ruang Kuliah';
            $existingMkNama = $existingRuangJadwal->kelasKuliah->kurikulumMatakuliah->matakuliah->nama ?? 'Matakuliah Lain';
            $existingNamaKelas = $existingRuangJadwal->kelasKuliah->nama_kelas ?? '-';

            throw ValidationException::withMessages([
                'ruang_kuliah_id' => "BENTROK RUANG KULIAH: Ruang '{$ruangNama}' telah digunakan oleh matakuliah '{$existingMkNama}' (Kelas {$existingNamaKelas}) pada hari {$hari} jam {$existingRuangJadwal->jam_mulai} - {$existingRuangJadwal->jam_selesai}.",
            ]);
        }

        // 2. VALIDASI DOSEN BENTROK
        foreach ($dosenIds as $dosenId) {
            $existingDosenJadwal = JadwalPerkuliahan::with(['kelasKuliah.kurikulumMatakuliah.matakuliah', 'ruangKuliah'])
                ->where('hari', $hari)
                ->where('kelas_kuliah_id', '!=', $kelasKuliahId)
                ->whereHas('kelasKuliah', function ($q) use ($tahunAjaranId, $dosenId) {
                    $q->where('tahun_ajaran_id', $tahunAjaranId)
                        ->whereHas('dosenPengajars', function ($dq) use ($dosenId) {
                            $dq->where('dosen_id', $dosenId);
                        });
                })
                ->where(function ($q) use ($jamMulaiClean, $jamSelesaiClean) {
                    $q->where('jam_mulai', '<', $jamSelesaiClean)
                        ->where('jam_selesai', '>', $jamMulaiClean);
                })
                ->when($ignoreJadwalId, fn ($q) => $q->where('id', '!=', $ignoreJadwalId))
                ->first();

            if ($existingDosenJadwal) {
                $dosen = Dosen::find($dosenId);
                $dosenNama = $dosen->nama_lengkap ?? 'Dosen Pengajar';
                $existingMkNama = $existingDosenJadwal->kelasKuliah->kurikulumMatakuliah->matakuliah->nama ?? 'Matakuliah Lain';
                $existingNamaKelas = $existingDosenJadwal->kelasKuliah->nama_kelas ?? '-';
                $existingRuangNama = $existingDosenJadwal->ruangKuliah->nama ?? 'Ruang Kuliah';

                throw ValidationException::withMessages([
                    'dosen_ids' => "BENTROK JADWAL DOSEN: Dosen '{$dosenNama}' sudah memiliki jadwal mengajar matakuliah '{$existingMkNama}' (Kelas {$existingNamaKelas}) di Ruang '{$existingRuangNama}' pada hari {$hari} jam {$existingDosenJadwal->jam_mulai} - {$existingDosenJadwal->jam_selesai}.",
                ]);
            }
        }
    }
}
