<?php

namespace App\Services;

use App\Models\Dosen;
use App\Models\JurnalPerkuliahan;
use App\Models\KelasKuliah;
use App\Models\Presensi;
use Carbon\Carbon;
use DomainException;
use Illuminate\Support\Facades\DB;

class PresensiService
{
    /**
     * Record lecture journal and student attendance for a class session.
     *
     * ATURAN LANGKAH 7 §1:
     * 1. Otorisasi: Dosen HANYA boleh mengisi presensi untuk kelas yang diajarnya (dosen_pengajars).
     * 2. Eligibility: HANYA mahasiswa dengan KRS status 'disetujui_wali' yang muncul & dapat dicatat presensinya.
     * 3. Batasan Tanggal:
     *    - Tanggal masa depan (tanggal > today) DILARANG 100%.
     *    - Tanggal masa lalu > 7 hari (pertemuan > 7 hari lalu) DIKUNCI untuk Dosen (memerlukan Admin).
     */
    public function recordJurnalAndPresensi(
        KelasKuliah $kelas,
        string $tanggal,
        string $materi,
        array $presensiData, // array of ['mahasiswa_id' => int, 'status' => 'hadir'|'izin'|'sakit'|'alpa']
        int $dosenUserId,
        bool $isAdminOverride = false
    ): JurnalPerkuliahan {
        // 1. OTORISASI DOSEN PENGAJAR
        $dosen = Dosen::where('user_id', $dosenUserId)->first();
        if (! $isAdminOverride && (! $dosen || ! $kelas->dosenPengajars()->where('dosen_id', $dosen->id)->exists())) {
            throw new DomainException('AKSES DITOLAK: Anda bukan dosen pengajar yang ditugaskan pada kelas kuliah ini.');
        }

        $dateCarbon = Carbon::parse($tanggal)->startOfDay();
        $todayCarbon = Carbon::today();

        // 2. BATASAN TANGGAL
        if ($dateCarbon->isAfter($todayCarbon)) {
            throw new DomainException("TANGGAL MASA DEPAN DILARANG: Pengisian presensi perkuliahan tidak dapat dilakukan untuk tanggal di masa depan ({$tanggal}).");
        }

        if (! $isAdminOverride && $dateCarbon->isBefore($todayCarbon->copy()->subDays(7))) {
            throw new DomainException("BATAS WAKTU PRESENSI TERLAMPAUI: Pengisian presensi untuk pertemuan lebih dari 7 hari yang lalu ({$tanggal}) telah dikunci. Pengisian susulan memerlukan otorisasi Admin Akademik.");
        }

        // 3. FILTER MAHASISWA DISETUJUI WALI
        $validMahasiswaIds = DB::table('krs_details')
            ->join('krs', 'krs_details.krs_id', '=', 'krs.id')
            ->where('krs_details.kelas_kuliah_id', $kelas->id)
            ->where('krs.status', 'disetujui_wali')
            ->pluck('krs.mahasiswa_id')
            ->map(fn ($id) => (int) $id)
            ->toArray();

        $dosenPengajarId = $kelas->dosenPengajars()->first()?->id;

        return DB::transaction(function () use ($kelas, $tanggal, $materi, $dosenPengajarId, $presensiData, $validMahasiswaIds) {
            $jurnal = JurnalPerkuliahan::updateOrCreate(
                [
                    'kelas_kuliah_id' => $kelas->id,
                    'tanggal' => $tanggal,
                ],
                [
                    'materi' => $materi,
                    'dosen_pengajar_id' => $dosenPengajarId,
                ]
            );

            foreach ($presensiData as $p) {
                $mahasiswaId = (int) $p['mahasiswa_id'];

                // Reject any student not in approved KRS
                if (! in_array($mahasiswaId, $validMahasiswaIds, true)) {
                    continue;
                }

                Presensi::updateOrCreate(
                    [
                        'jurnal_perkuliahan_id' => $jurnal->id,
                        'mahasiswa_id' => $mahasiswaId,
                    ],
                    [
                        'status' => strtolower($p['status']),
                    ]
                );
            }

            return $jurnal->fresh(['presensis.mahasiswa']);
        });
    }
}
