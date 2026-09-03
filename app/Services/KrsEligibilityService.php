<?php

namespace App\Services;

use App\Models\Cekal;
use App\Models\CicilanTagihan;
use App\Models\Mahasiswa;
use App\Models\RegistrasiUlang;
use App\Models\SystemConfig;
use App\Models\Tagihan;

class KrsEligibilityService
{
    /**
     * Evaluate the 3 mandatory conditions for KRS submission eligibility (02-Database-Schema.md §11).
     *
     * SYARAT 1: Tidak sedang memiliki status Cekal aktif (is_active = true).
     * SYARAT 2: Telah menyelesaikan Registrasi Ulang (status = 'selesai').
     * SYARAT 3: Tagihan UKT telah 'lunas' ATAU memiliki skema cicilan (cicilan_tagihans) aktif & TANPA cicilan menunggak (melewati jatuh tempo).
     *
     * @return array{is_eligible: bool, reasons: string[]}
     */
    public static function evaluate(Mahasiswa $mahasiswa, int $tahunAjaranId): array
    {
        $reasons = [];
        $today = date('Y-m-d');
        $openDate = SystemConfig::getValue('KRS_OPENING_DATE', '');
        $closeDate = SystemConfig::getValue('KRS_CLOSING_DATE', '');

        if ($openDate && $today < $openDate) {
            $reasons[] = "Pengajuan KRS belum dibuka (Jadwal Pembukaan: {$openDate}).";
        }
        if ($closeDate && $today > $closeDate) {
            $reasons[] = "Pengajuan KRS telah ditutup (Batas Akhir: {$closeDate}).";
        }

        // 1. Syarat 1: Cekal Aktif

        $hasCekal = Cekal::where('mahasiswa_id', $mahasiswa->id)
            ->where('is_active', true)
            ->exists();

        if ($hasCekal) {
            $reasons[] = 'Mahasiswa sedang dalam status Cekal Akademik / Keuangan aktif.';
        }

        // 2. Syarat 2: Registrasi Ulang Selesai
        $registrasiSelesai = RegistrasiUlang::where('mahasiswa_id', $mahasiswa->id)
            ->whereHas('periodeRegistrasi', function ($q) use ($tahunAjaranId) {
                $q->where('tahun_ajaran_id', $tahunAjaranId);
            })
            ->where('status', 'selesai')
            ->exists();

        if (! $registrasiSelesai) {
            $reasons[] = 'Mahasiswa belum menyelesaikan proses Registrasi Ulang (Her-Registrasi) untuk semester ini.';
        }

        // 3. Syarat 3: Lunas UKT atau Cicilan Aktif Tanpa Tunggakan Overdue
        $tagihanUkt = Tagihan::where('mahasiswa_id', $mahasiswa->id)
            ->where('tahun_ajaran_id', $tahunAjaranId)
            ->where('jenis', 'ukt')
            ->first();

        if (! $tagihanUkt) {
            $isUktPaidOrCicilan = false;
            $reasons[] = 'Tagihan UKT belum diterbitkan atau belum dilunasi.';
        } elseif ($tagihanUkt->status === 'lunas') {
            $isUktPaidOrCicilan = true;
        } else {
            // Cek apakah mahasiswa memiliki skema cicilan
            $hasCicilan = CicilanTagihan::where('tagihan_id', $tagihanUkt->id)->exists();

            if (! $hasCicilan) {
                $isUktPaidOrCicilan = false;
                $reasons[] = 'Tagihan UKT belum lunas dan belum memiliki skema cicilan aktif yang disetujui.';
            } else {
                // Cek apakah ada cicilan yang sudah MELEWATI JATUH TEMPO tetapi belum lunas (EDGE CASE FINANSIAL #4)
                $hasOverdueUnpaidCicilan = CicilanTagihan::where('tagihan_id', $tagihanUkt->id)
                    ->where('status', '!=', 'lunas')
                    ->where('jatuh_tempo', '<', now()->toDateString())
                    ->exists();

                if ($hasOverdueUnpaidCicilan) {
                    $isUktPaidOrCicilan = false;
                    $reasons[] = 'Mahasiswa memiliki cicilan UKT yang telah melewati tanggal jatuh tempo dan belum dilunasi.';
                } else {
                    $isUktPaidOrCicilan = true;
                }
            }
        }

        return [
            'is_eligible' => empty($reasons),
            'reasons' => $reasons,
        ];
    }
}
