<?php

namespace App\Services;

use App\Models\Krs;
use App\Models\Mahasiswa;
use App\Models\SkalaNilai;
use DomainException;

class KhsService
{
    /**
     * Generate Kartu Hasil Studi (KHS) on-the-fly for a student and semester.
     * NO dedicated 'khs' table is created (02-Database-Schema.md §13).
     */
    public function generateKhs(Mahasiswa $mahasiswa, int $tahunAjaranId, ?int $requestingUserId = null): array
    {
        // IDOR PROTECTION CHECK
        if ($requestingUserId !== null && $mahasiswa->user_id !== $requestingUserId) {
            $user = auth()->user();
            if (! $user || (! $user->hasRole('superadmin') && ! $user->hasRole('admin_akademik') && ! $user->hasRole('kaprodi') && ! $user->hasRole('dosen'))) {
                throw new DomainException('AKSES DITOLAK: Anda tidak memiliki wewenang untuk melihat Kartu Hasil Studi (KHS) mahasiswa lain.');
            }
        }

        $krs = Krs::with([
            'tahunAjaran',
            'krsDetails.kelasKuliah.kurikulumMatakuliah.matakuliah',
            'krsDetails.kelasKuliah.komposisiNilais',
            'krsDetails.nilais',
        ])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('tahun_ajaran_id', $tahunAjaranId)
            ->where('status', 'disetujui_wali')
            ->first();

        if (! $krs) {
            return [
                'mahasiswa' => $mahasiswa,
                'krs' => null,
                'items' => [],
                'total_sks' => 0,
                'ips' => 0.00,
            ];
        }

        $items = [];
        $totalSks = 0;
        $totalSksXBobot = 0.00;
        $skalaNilais = SkalaNilai::all();

        foreach ($krs->krsDetails as $detail) {
            $kelas = $detail->kelasKuliah;
            $mk = $kelas->kurikulumMatakuliah->matakuliah;
            $sks = $mk->sks ?? 0;

            $nilais = $detail->nilais;
            $komposisis = $kelas->komposisiNilais ?? collect();

            $finalScore = 0.00;
            if ($komposisis->count() > 0 && $nilais->count() > 0) {
                foreach ($komposisis as $comp) {
                    $nilaiItem = $nilais->firstWhere('komponen', $comp->komponen);
                    if ($nilaiItem) {
                        $finalScore += ((float) $nilaiItem->nilai_angka * ($comp->bobot_persen / 100));
                    }
                }
            } else {
                $finalScore = $nilais->avg('nilai_angka') ?? 0.00;
            }

            $huruf = $this->calculateHuruf($finalScore, $skalaNilais);
            $bobotNilai = $this->calculateBobot($huruf);

            $items[] = [
                'krs_detail_id' => $detail->id,
                'kode_mk' => $mk->kode,
                'nama_mk' => $mk->nama,
                'sks' => $sks,
                'nama_kelas' => $kelas->nama_kelas,
                'nilai_angka' => round($finalScore, 2),
                'nilai_huruf' => $huruf,
                'bobot' => $bobotNilai,
                'is_final' => $nilais->first()?->is_final ?? false,
            ];

            $totalSks += $sks;
            $totalSksXBobot += ($sks * $bobotNilai);
        }

        $ips = ($totalSks > 0) ? round($totalSksXBobot / $totalSks, 2) : 0.00;

        return [
            'mahasiswa' => $mahasiswa,
            'krs' => $krs,
            'items' => $items,
            'total_sks' => $totalSks,
            'ips' => $ips,
        ];
    }

    private function calculateHuruf(float $score, $skalaNilais = null): string
    {
        if ($skalaNilais) {
            $skala = $skalaNilais->first(fn ($s) => $s->min_angka <= $score && $s->max_angka >= $score);
            if ($skala) {
                return $skala->huruf;
            }
        } else {
            $skala = SkalaNilai::where('min_angka', '<=', $score)->where('max_angka', '>=', $score)->first();
            if ($skala) {
                return $skala->huruf;
            }
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

    private function calculateBobot(string $huruf): float
    {
        return match ($huruf) {
            'A' => 4.00,
            'B+' => 3.50,
            'B' => 3.00,
            'C+' => 2.50,
            'C' => 2.00,
            'D' => 1.00,
            default => 0.00,
        };
    }
}
