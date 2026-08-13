<?php

namespace App\Services;

use App\Models\KelasKuliah;
use App\Models\Krs;
use App\Models\KrsDetail;
use App\Models\Mahasiswa;
use App\Models\Nilai;
use App\Models\PrasyaratMatakuliah;
use DomainException;
use Illuminate\Support\Facades\DB;

class KrsService
{
    /**
     * Submit KRS with full eligibility, prerequisite, student schedule conflict, and atomic kuota checks.
     *
     * ALUR LANGKAH 6:
     * 1. Reuse KrsEligibilityService (Cekal, Her-Registrasi, UKT lunas/dicicil tanpa overdue).
     * 2. Reuse isReadyForKrs() - Filter hanya kelas yang lengkap dosen & ruangan.
     * 3. Max SKS Check.
     * 4. Prerequisite Course Check.
     * 5. Student Schedule Conflict Check.
     * 6. Atomic Kuota Lock (lockForUpdate()) to prevent race conditions.
     * 7. Activity Logging (krs.submit).
     */
    public function submitKrs(Krs $krs, array $kelasKuliahIds, int $maxSks = 24): Krs
    {
        if (empty($kelasKuliahIds)) {
            throw new DomainException('PILIHAN KRS KOSONG: Silakan pilih minimal 1 matakuliah/kelas kuliah untuk diajukan.');
        }

        $mahasiswa = $krs->mahasiswa;

        // 1. ELIGIBILITY CHECK (REUSE KrsEligibilityService)
        $eligibility = KrsEligibilityService::evaluate($mahasiswa, $krs->tahun_ajaran_id);
        if (! $eligibility['is_eligible']) {
            $reasonsText = implode(' ', $eligibility['reasons']);
            throw new DomainException("SYARAT KRS BELUM TERPENUHI: {$reasonsText}");
        }

        // Fetch selected classes with relations
        $selectedClasses = KelasKuliah::with(['kurikulumMatakuliah.matakuliah', 'jadwalPerkuliahans.ruangKuliah', 'dosenPengajars'])
            ->whereIn('id', $kelasKuliahIds)
            ->get();

        // 2. DUPLICATE COURSE CHECK (DUPLIKASI MATAKULIAH/KELAS)
        $kelasKuliahIds = array_values(array_unique($kelasKuliahIds));

        $matakuliahIds = $selectedClasses->map(fn ($k) => $k->kurikulumMatakuliah->matakuliah_id);
        if ($matakuliahIds->count() !== $matakuliahIds->unique()->count()) {
            $duplicateMkId = $matakuliahIds->duplicates()->first();
            $duplicateMk = $selectedClasses->firstWhere('kurikulumMatakuliah.matakuliah_id', $duplicateMkId);
            $mkNama = $duplicateMk->kurikulumMatakuliah->matakuliah->nama ?? 'Matakuliah';

            throw new DomainException("DUPLIKASI MATAKULIAH: Anda memilih lebih dari 1 kelas untuk matakuliah yang sama ('{$mkNama}'). Hanya boleh memilih 1 kelas per matakuliah.");
        }

        // 2.1 IS READY FOR KRS CHECK (REUSE isReadyForKrs())

        foreach ($selectedClasses as $kelas) {
            if (! $kelas->isReadyForKrs()) {
                $mkNama = $kelas->kurikulumMatakuliah->matakuliah->nama ?? 'Matakuliah';

                throw new DomainException("KELAS BELUM SIAP: Kelas '{$kelas->nama_kelas}' pada matakuliah '{$mkNama}' belum memiliki dosen pengajar dan ruangan perkuliahan lengkap.");
            }
        }

        // 3. MAX SKS CHECK
        $maxSksLimit = (int) \App\Models\SystemConfig::getValue('MAX_SKS_DEFAULT', (string) $maxSks);
        $totalSks = $selectedClasses->sum(fn ($k) => (int) ($k->kurikulumMatakuliah->matakuliah->sks ?? 0));
        if ($totalSks > $maxSksLimit) {
            throw new DomainException("BATAS SKS TERLAMPAUI: Total SKS yang Anda pilih ({$totalSks} SKS) melebihi batas maksimal per semester ({$maxSksLimit} SKS).");
        }


        // 4. PREREQUISITE COURSE CHECK
        foreach ($selectedClasses as $kelas) {
            $mkId = $kelas->kurikulumMatakuliah->matakuliah_id;
            $prasyarats = PrasyaratMatakuliah::with('matakuliahPrasyarat')->where('matakuliah_id', $mkId)->get();

            foreach ($prasyarats as $prasyarat) {
                $mkPrasyaratId = $prasyarat->matakuliah_prasyarat_id;
                $minimalNilai = $prasyarat->minimal_nilai;
                $mkPrasyaratNama = $prasyarat->matakuliahPrasyarat->nama ?? 'Prasyarat';

                // Check student past grades for prerequisite course
                $hasPassed = Nilai::whereHas('krsDetail.krs', function ($q) use ($mahasiswa) {
                    $q->where('mahasiswa_id', $mahasiswa->id)->where('status', 'disetujui_wali');
                })
                    ->whereHas('krsDetail.kelasKuliah.kurikulumMatakuliah', function ($q) use ($mkPrasyaratId) {
                        $q->where('matakuliah_id', $mkPrasyaratId);
                    })
                    ->where('is_final', true)
                    ->exists();

                if (! $hasPassed) {
                    $targetMkNama = $kelas->kurikulumMatakuliah->matakuliah->nama;

                    throw new DomainException("PRASYARAT BELUM TERPENUHI: Anda belum memenuhi prasyarat untuk matakuliah '{$targetMkNama}'. Syarat: Harus lulus matakuliah '{$mkPrasyaratNama}' dengan nilai minimal '{$minimalNilai}'.");
                }
            }
        }

        // 5. STUDENT SCHEDULE CONFLICT CHECK (Bentrok Jadwal Mahasiswa)
        $schedules = [];
        foreach ($selectedClasses as $kelas) {
            $mkNama = $kelas->kurikulumMatakuliah->matakuliah->nama;
            foreach ($kelas->jadwalPerkuliahans as $j) {
                $schedules[] = [
                    'kelas_id' => $kelas->id,
                    'mk_nama' => $mkNama,
                    'nama_kelas' => $kelas->nama_kelas,
                    'hari' => $j->hari,
                    'jam_mulai' => $j->jam_mulai,
                    'jam_selesai' => $j->jam_selesai,
                ];
            }
        }

        $scheduleCount = count($schedules);
        for ($i = 0; $i < $scheduleCount; $i++) {
            for ($j = $i + 1; $j < $scheduleCount; $j++) {
                $s1 = $schedules[$i];
                $s2 = $schedules[$j];

                if ($s1['hari'] === $s2['hari']) {
                    $start1 = (strlen($s1['jam_mulai']) === 5) ? $s1['jam_mulai'].':00' : $s1['jam_mulai'];
                    $end1 = (strlen($s1['jam_selesai']) === 5) ? $s1['jam_selesai'].':00' : $s1['jam_selesai'];
                    $start2 = (strlen($s2['jam_mulai']) === 5) ? $s2['jam_mulai'].':00' : $s2['jam_mulai'];
                    $end2 = (strlen($s2['jam_selesai']) === 5) ? $s2['jam_selesai'].':00' : $s2['jam_selesai'];

                    if ($start1 < $end2 && $end1 > $start2) {
                        throw new DomainException("BENTROK JADWAL KRS: Matakuliah '{$s1['mk_nama']}' (Kelas {$s1['nama_kelas']}) dan '{$s2['mk_nama']}' (Kelas {$s2['nama_kelas']}) memiliki jadwal bertabrakan pada hari {$s1['hari']} jam {$start1} - {$end1}.");
                    }
                }
            }
        }

        // 6. ATOMIC KUOTA LOCK & ENROLLMENT (Pencegahan Race Condition Kuota)
        return DB::transaction(function () use ($krs, $kelasKuliahIds, $totalSks, $mahasiswa) {

            // Delete old details if re-submitting draft
            KrsDetail::where('krs_id', $krs->id)->delete();

            foreach ($kelasKuliahIds as $kelasId) {
                // ATOMIC LOCK FOR UPDATE ON PARENT KELAS_KULIAHS ROW
                $kelasLocked = KelasKuliah::with('kurikulumMatakuliah.matakuliah')
                    ->where('id', $kelasId)
                    ->lockForUpdate()
                    ->firstOrFail();

                // Count existing active enrollments
                $enrolledCount = KrsDetail::where('kelas_kuliah_id', $kelasId)
                    ->whereHas('krs', function ($q) {
                        $q->whereIn('status', ['diajukan', 'disetujui_wali']);
                    })
                    ->count();

                if ($enrolledCount >= $kelasLocked->kuota) {
                    $mkNama = $kelasLocked->kurikulumMatakuliah->matakuliah->nama ?? 'Matakuliah';

                    throw new DomainException("KUOTA KELAS PENUH: Kuota untuk kelas '{$kelasLocked->nama_kelas}' matakuliah '{$mkNama}' sudah penuh ({$kelasLocked->kuota}/{$kelasLocked->kuota}). Silakan pilih kelas/jadwal lain.");
                }

                KrsDetail::create([
                    'krs_id' => $krs->id,
                    'kelas_kuliah_id' => $kelasId,
                ]);
            }

            $oldStatus = $krs->status;
            $krs->update([
                'status' => 'diajukan',
                'diajukan_at' => now(),
                'catatan_penolakan' => null,
            ]);

            // 7. ACTIVITY LOGGING & NOTIFICATIONS
            ActivityLogger::log('krs.submit', 'Krs', $krs->id, [
                'status' => $oldStatus,
            ], [
                'status' => 'diajukan',
                'mahasiswa_id' => $krs->mahasiswa_id,
                'total_sks' => $totalSks,
                'jumlah_mk' => count($kelasKuliahIds),
            ]);

            // Notify specific Dosen Wali assigned to this student
            $dosenWaliRow = \App\Models\DosenWali::with('dosen.user')
                ->where('mahasiswa_id', $mahasiswa->id)
                ->where('tahun_ajaran_id', $krs->tahun_ajaran_id)
                ->first()
                ?? \App\Models\DosenWali::with('dosen.user')
                    ->where('mahasiswa_id', $mahasiswa->id)
                    ->first();

            if ($dosenWaliRow && $dosenWaliRow->dosen && $dosenWaliRow->dosen->user) {
                try {
                    $dosenWaliRow->dosen->user->notify(new \App\Notifications\KrsNotification(
                        'submitted',
                        $mahasiswa->nama_lengkap
                    ));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Gagal mengirim notification KRS Submit: '.$e->getMessage());
                }
            }

            return $krs->fresh(['krsDetails.kelasKuliah.kurikulumMatakuliah.matakuliah']);
        });
    }

    /**
     * Dosen Wali approves submitted KRS.
     */
    public function approveKrsByDosenWali(Krs $krs, int $dosenId): Krs
    {
        if ($krs->status !== 'diajukan') {
            throw new DomainException("Hanya KRS berstatus 'diajukan' yang dapat disetujui Dosen Wali.");
        }

        return DB::transaction(function () use ($krs, $dosenId) {
            $oldStatus = $krs->status;

            $krs->update([
                'status' => 'disetujui_wali',
                'disetujui_at' => now(),
                'catatan_penolakan' => null,
            ]);

            ActivityLogger::log('krs.approve', 'Krs', $krs->id, [
                'status' => $oldStatus,
            ], [
                'status' => 'disetujui_wali',
                'dosen_id' => $dosenId,
                'mahasiswa_id' => $krs->mahasiswa_id,
            ]);

            // Notify Student User
            $studentUser = $krs->mahasiswa->user ?? null;
            if ($studentUser) {
                try {
                    $studentUser->notify(new \App\Notifications\KrsNotification(
                        'approved',
                        $krs->mahasiswa->nama_lengkap
                    ));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Gagal mengirim notification KRS Approve: '.$e->getMessage());
                }
            }

            return $krs->fresh();
        });
    }

    /**
     * Dosen Wali rejects submitted KRS with a required rejection note.
     */
    public function rejectKrsByDosenWali(Krs $krs, int $dosenId, string $catatan): Krs
    {
        if ($krs->status !== 'diajukan') {
            throw new DomainException("Hanya KRS berstatus 'diajukan' yang dapat ditolak Dosen Wali.");
        }

        if (empty(trim($catatan))) {
            throw new DomainException('ALASAN PENOLAKAN WAJIB: Masukkan alasan penolakan KRS untuk mahasiswa.');
        }

        return DB::transaction(function () use ($krs, $dosenId, $catatan) {
            $oldStatus = $krs->status;

            $krs->update([
                'status' => 'ditolak',
                'catatan_penolakan' => $catatan,
            ]);

            ActivityLogger::log('krs.reject', 'Krs', $krs->id, [
                'status' => $oldStatus,
            ], [
                'status' => 'ditolak',
                'dosen_id' => $dosenId,
                'mahasiswa_id' => $krs->mahasiswa_id,
                'catatan_penolakan' => $catatan,
            ]);

            // Notify Student User
            $studentUser = $krs->mahasiswa->user ?? null;
            if ($studentUser) {
                try {
                    $studentUser->notify(new \App\Notifications\KrsNotification(
                        'rejected',
                        $krs->mahasiswa->nama_lengkap,
                        $catatan
                    ));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Gagal mengirim notification KRS Reject: '.$e->getMessage());
                }
            }

            return $krs->fresh();
        });
    }

}

