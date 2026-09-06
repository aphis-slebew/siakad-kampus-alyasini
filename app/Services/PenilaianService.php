<?php

namespace App\Services;

use App\Models\Dosen;
use App\Models\KalenderAkademik;
use App\Models\KelasKuliah;
use App\Models\KomposisiNilai;
use App\Models\KrsDetail;
use App\Models\Nilai;
use App\Models\SkalaNilai;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;

class PenilaianService
{
    /**
     * Set grade composition per class (tugas/uts/uas/presensi).
     * Total sum of bobot_persen MUST BE EXACTLY 100%.
     */
    public function saveKomposisiNilai(KelasKuliah $kelas, array $komposisis): void
    {
        $totalBobot = array_sum(array_column($komposisis, 'bobot_persen'));

        if ($totalBobot !== 100) {
            throw new DomainException("TOTAL BOBOT HARUS 100%: Total bobot komposisi nilai saat ini adalah {$totalBobot}%. Silakan sesuaikan bobot komponen agar tepat 100%.");
        }

        DB::transaction(function () use ($kelas, $komposisis) {
            KomposisiNilai::where('kelas_kuliah_id', $kelas->id)->delete();

            foreach ($komposisis as $k) {
                KomposisiNilai::create([
                    'kelas_kuliah_id' => $kelas->id,
                    'komponen' => strtolower($k['komponen']),
                    'bobot_persen' => (int) $k['bobot_persen'],
                ]);
            }
        });
    }

    /**
     * Dosen inputs numeric scores for a student in a class.
     * IMMUNITY CHECK: If grades are already finalized (is_final = true), CANNOT be edited directly.
     * TIMELINE CHECK: Verify input_nilai schedule on Kalender Akademik (bypass for admin/superadmin).
     */
    public function inputNilaiByDosen(KelasKuliah $kelas, int $krsDetailId, array $komponenScores, int $dosenUserId, bool $bypassTimeline = false): void
    {
        $user = User::find($dosenUserId);
        $isPrivileged = $bypassTimeline || ($user && ($user->hasRole('superadmin') || $user->hasRole('admin_akademik')));

        // TIMELINE ENGINE CHECK: Verify input_nilai schedule on Kalender Akademik
        if (! $isPrivileged && $kelas->tahun_ajaran_id) {
            $timeline = AcademicTimelineService::getTimelineStatus($kelas->tahun_ajaran_id, KalenderAkademik::TIPE_INPUT_NILAI);
            if ($timeline['is_configured'] && ! $timeline['is_open']) {
                throw new DomainException("PERIODE PENGISIAN NILAI DITUTUP: {$timeline['message']} Hubungi Admin Akademik jika memerlukan perpanjangan jadwal atau pemutihan nilai.");
            }
        }

        $dosen = Dosen::where('user_id', $dosenUserId)->first();
        if (! $dosen || ! $kelas->dosenPengajars()->where('dosen_id', $dosen->id)->exists()) {
            throw new DomainException('AKSES DITOLAK: Anda bukan dosen pengajar yang ditugaskan pada kelas kuliah ini.');
        }

        $krsDetail = KrsDetail::with('krs.mahasiswa')->findOrFail($krsDetailId);

        // IMMUNITY CHECK: Block edit if grade is already finalized
        $isFinalized = Nilai::where('krs_detail_id', $krsDetailId)->where('is_final', true)->exists();
        if ($isFinalized) {
            $mhsNama = $krsDetail->krs->mahasiswa->nama_lengkap ?? 'Mahasiswa';

            throw new DomainException("NILAI SUDAH FINAL: Nilai mahasiswa '{$mhsNama}' untuk matakuliah ini telah berstatus FINAL dan tidak dapat diubah langsung. Perubahan harus melalui alur Pemutihan Nilai.");
        }

        DB::transaction(function () use ($krsDetailId, $komponenScores) {
            foreach ($komponenScores as $komponen => $nilaiAngka) {
                $nilaiHuruf = $this->calculateHuruf((float) $nilaiAngka);

                Nilai::updateOrCreate(
                    [
                        'krs_detail_id' => $krsDetailId,
                        'komponen' => strtolower($komponen),
                    ],
                    [
                        'nilai_angka' => (float) $nilaiAngka,
                        'nilai_huruf' => $nilaiHuruf,
                        'is_final' => false,
                    ]
                );
            }
        });
    }

    /**
     * Finalize all grades for a class.
     */
    public function finalizeNilai(KelasKuliah $kelas, int $dosenUserId): void
    {
        $dosen = Dosen::where('user_id', $dosenUserId)->first();
        if (! $dosen || ! $kelas->dosenPengajars()->where('dosen_id', $dosen->id)->exists()) {
            throw new DomainException('AKSES DITOLAK: Anda bukan dosen pengajar pada kelas kuliah ini.');
        }

        DB::transaction(function () use ($kelas) {
            $krsDetailIds = KrsDetail::where('kelas_kuliah_id', $kelas->id)->pluck('id');

            Nilai::whereIn('krs_detail_id', $krsDetailIds)->update(['is_final' => true]);

            ActivityLogger::log('nilai.finalize', 'KelasKuliah', $kelas->id, [
                'is_final' => false,
            ], [
                'is_final' => true,
                'kelas_kuliah_id' => $kelas->id,
            ]);
        });
    }

    /**
     * Service Pemutihan Nilai (White-wash final grade override by Admin).
     */
    public function whitewashNilai(Nilai $nilai, float $nilaiAngkaBaru, string $alasanPemutihan, int $adminUserId): Nilai
    {
        if (empty(trim($alasanPemutihan))) {
            throw new DomainException('ALASAN PEMUTIHAN WAJIB: Masukkan alasan resmi pemutihan/perubahan nilai final.');
        }

        return DB::transaction(function () use ($nilai, $nilaiAngkaBaru, $alasanPemutihan, $adminUserId) {
            $nilaiOldAngka = $nilai->nilai_angka;
            $nilaiOldHuruf = $nilai->nilai_huruf;

            $nilaiHurufBaru = $this->calculateHuruf($nilaiAngkaBaru);

            $nilai->update([
                'nilai_angka' => $nilaiAngkaBaru,
                'nilai_huruf' => $nilaiHurufBaru,
                'is_final' => true,
            ]);

            ActivityLogger::log('nilai.whitewash', 'Nilai', $nilai->id, [
                'nilai_angka' => $nilaiOldAngka,
                'nilai_huruf' => $nilaiOldHuruf,
            ], [
                'nilai_angka' => $nilaiAngkaBaru,
                'nilai_huruf' => $nilaiHurufBaru,
                'alasan_pemutihan' => $alasanPemutihan,
                'admin_user_id' => $adminUserId,
            ]);

            return $nilai->fresh();
        });
    }

    /**
     * Calculate letter grade from numeric score based on skala_nilais table.
     */
    public function calculateHuruf(float $score): string
    {
        $skala = SkalaNilai::where('min_angka', '<=', $score)
            ->where('max_angka', '>=', $score)
            ->first();

        if ($skala) {
            return $skala->huruf;
        }

        if ($score >= 85) {
            return 'A';
        }
        if ($score >= 75) {
            return 'B';
        }
        if ($score >= 60) {
            return 'C';
        }
        if ($score >= 50) {
            return 'D';
        }

        return 'E';
    }
}
