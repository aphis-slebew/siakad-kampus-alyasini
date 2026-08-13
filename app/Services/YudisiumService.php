<?php

namespace App\Services;

use App\Models\Mahasiswa;
use App\Models\Nilai;
use App\Models\PeriodeWisuda;
use App\Models\ProgramStudi;
use App\Models\Skripsi;
use App\Models\SystemConfig;
use App\Models\Tagihan;
use App\Models\Yudisium;
use DomainException;
use Illuminate\Support\Facades\DB;

class YudisiumService
{
    /**
     * Assign Yudisium to a student with atomic locking for document numbering,
     * automatic IPK calculation (best grade filter), SystemConfig IPK & SKS checks, and strict UKT/Exam pass checks.
     */
    public function assignYudisium(Mahasiswa $mahasiswa, int $periodeWisudaId): Yudisium
    {
        // 1. Check Skripsi Status
        $skripsiPassed = Skripsi::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'lulus_ujian')
            ->exists();
        if (! $skripsiPassed) {
            throw new DomainException('SYARAT YUDISIUM BELUM TERPENUHI: Mahasiswa belum dinyatakan LULUS UJIAN SKRIPSI.');
        }

        // 2. Check Unpaid UKT
        $hasUnpaidUkt = Tagihan::where('mahasiswa_id', $mahasiswa->id)
            ->where('jenis', 'ukt')
            ->where('status', '!=', 'lunas')
            ->where('jatuh_tempo', '<=', date('Y-m-d'))
            ->exists();
        if ($hasUnpaidUkt) {
            throw new DomainException('TUNGGAKAN UKT: Mahasiswa memiliki tunggakan UKT aktif yang belum dilunasi. Yudisium tidak dapat diproses.');
        }

        // 3. Calculate Final IPK & Total SKS
        $ipkAkhir = $this->calculateIpkAkhir($mahasiswa);
        $minIpk = (float) SystemConfig::getValue('MIN_IPK_YUDISIUM', '2.00');
        if ($ipkAkhir > 0 && $ipkAkhir < $minIpk) {
            throw new DomainException("SYARAT IPK YUDISIUM BELUM TERPENUHI: IPK Mahasiswa ({$ipkAkhir}) di bawah batas minimal ({$minIpk}).");
        }

        $totalSks = $this->calculateTotalSksLulus($mahasiswa);
        $minSks = (int) SystemConfig::getValue('MIN_SKS_YUDISIUM', '138');
        if ($totalSks > 0 && $totalSks < $minSks) {
            throw new DomainException("SYARAT SKS YUDISIUM BELUM TERPENUHI: Total SKS Lulus ({$totalSks} SKS) di bawah batas minimal ({$minSks} SKS).");
        }



        $periodeWisuda = PeriodeWisuda::findOrFail($periodeWisudaId);
        $year = date('Y', strtotime($periodeWisuda->tanggal_wisuda ?? date('Y-m-d')));

        // 4. Atomic Transaction & Locking for Document Numbering
        return DB::transaction(function () use ($mahasiswa, $periodeWisudaId, $ipkAkhir, $year) {
            // Check if already yudisium
            $existing = Yudisium::where('mahasiswa_id', $mahasiswa->id)->first();
            if ($existing) {
                throw new DomainException("MAHASISWA SUDAH DIYUDISIUM: Mahasiswa '{$mahasiswa->nama_lengkap}' sudah terdaftar yudisium dengan No Dokumen {$existing->nomor_dokumen}.");
            }

            // ATOMIC LOCK FOR UPDATE ON PROGRAM STUDI ROW TO PREVENT DUPLICATE DOCUMENT NUMBERS
            $prodi = ProgramStudi::where('id', $mahasiswa->program_studi_id)
                ->lockForUpdate()
                ->firstOrFail();

            $prodiKode = strtoupper($prodi->kode ?? 'PRODI');

            $countInProdiAndYear = Yudisium::whereHas('mahasiswa', function ($q) use ($prodi) {
                $q->where('program_studi_id', $prodi->id);
            })
                ->where('nomor_dokumen', 'LIKE', "YUD/{$year}/{$prodiKode}/%")
                ->count();

            $seqNumber = str_pad((string) ($countInProdiAndYear + 1), 4, '0', STR_PAD_LEFT);
            $nomorDokumen = "YUD/{$year}/{$prodiKode}/{$seqNumber}";

            $yudisium = Yudisium::create([
                'mahasiswa_id' => $mahasiswa->id,
                'periode_wisuda_id' => $periodeWisudaId,
                'ipk_akhir' => $ipkAkhir,
                'nomor_dokumen' => $nomorDokumen,
            ]);

            ActivityLogger::log('yudisium.assign', 'Yudisium', $yudisium->id, [], [
                'mahasiswa_id' => $mahasiswa->id,
                'periode_wisuda_id' => $periodeWisudaId,
                'ipk_akhir' => $ipkAkhir,
                'nomor_dokumen' => $nomorDokumen,
            ]);

            if ($mahasiswa->user) {
                try {
                    $mahasiswa->user->notify(new \App\Notifications\YudisiumNotification(
                        $yudisium->id,
                        $nomorDokumen
                    ));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Gagal mengirim notification Yudisium: '.$e->getMessage());
                }
            }


            return $yudisium->fresh(['mahasiswa.programStudi', 'periodeWisuda']);
        });
    }


    /**
     * Calculate IPK Akhir for student:
     * - Filters only Nilai where is_final = true and KRS status = disetujui_wali.
     * - Takes the BEST grade for retaken courses.
     */
    public function calculateIpkAkhir(Mahasiswa $mahasiswa): float
    {
        $allNilais = Nilai::with(['krsDetail.kelasKuliah.kurikulumMatakuliah.matakuliah'])
            ->whereHas('krsDetail.krs', function ($q) use ($mahasiswa) {
                $q->where('mahasiswa_id', $mahasiswa->id)->where('status', 'disetujui_wali');
            })
            ->where('is_final', true)
            ->get();

        if ($allNilais->isEmpty()) {
            return 0.00;
        }

        // Map weights
        $weightMap = [
            'A' => 4.00,
            'B+' => 3.50,
            'B' => 3.00,
            'C+' => 2.50,
            'C' => 2.00,
            'D' => 1.00,
            'E' => 0.00,
        ];

        // Group by matakuliah_id and pick the highest grade weight (Best Grade Strategy)
        $bestGrades = [];
        foreach ($allNilais as $nilai) {
            $mkId = $nilai->krsDetail->kelasKuliah->kurikulumMatakuliah->matakuliah_id ?? null;
            $sks = (int) ($nilai->krsDetail->kelasKuliah->kurikulumMatakuliah->matakuliah->sks ?? 0);
            $huruf = strtoupper(trim($nilai->nilai_huruf ?? 'E'));
            $weight = $weightMap[$huruf] ?? 0.00;

            if ($mkId) {
                if (! isset($bestGrades[$mkId]) || $weight > $bestGrades[$mkId]['weight']) {
                    $bestGrades[$mkId] = [
                        'sks' => $sks,
                        'weight' => $weight,
                    ];
                }
            }
        }

        $totalSks = 0;
        $totalQualityPoints = 0.0;

        foreach ($bestGrades as $item) {
            $totalSks += $item['sks'];
            $totalQualityPoints += ($item['sks'] * $item['weight']);
        }

        if ($totalSks === 0) {
            return 0.00;
        }

        return round($totalQualityPoints / $totalSks, 2);
    }

    /**
     * Calculate total passing earned credits (SKS) for student.
     */
    public function calculateTotalSksLulus(Mahasiswa $mahasiswa): int
    {
        $allNilais = Nilai::with(['krsDetail.kelasKuliah.kurikulumMatakuliah.matakuliah'])
            ->whereHas('krsDetail.krs', function ($q) use ($mahasiswa) {
                $q->where('mahasiswa_id', $mahasiswa->id)->where('status', 'disetujui_wali');
            })
            ->where('is_final', true)
            ->whereNotIn('nilai_huruf', ['E', 'F'])
            ->get();

        $passedMkIds = [];
        $totalSks = 0;

        foreach ($allNilais as $nilai) {
            $mkId = $nilai->krsDetail->kelasKuliah->kurikulumMatakuliah->matakuliah_id ?? null;
            $sks = (int) ($nilai->krsDetail->kelasKuliah->kurikulumMatakuliah->matakuliah->sks ?? 0);

            if ($mkId && ! in_array($mkId, $passedMkIds)) {
                $passedMkIds[] = $mkId;
                $totalSks += $sks;
            }
        }

        return $totalSks;
    }
}

