<?php

namespace App\Services;

use App\Models\BimbinganProposal;
use App\Models\BimbinganSkripsi;
use App\Models\Mahasiswa;
use App\Models\ProposalSkripsi;
use App\Models\Skripsi;
use App\Models\SystemConfig;
use App\Models\Tagihan;
use DomainException;
use Illuminate\Support\Facades\DB;

class SkripsiService
{
    /**
     * Mahasiswa submits a new Proposal Skripsi.
     * State Machine: null -> 'diajukan'
     */
    public function submitProposal(Mahasiswa $mahasiswa, string $judul, ?int $dosenPembimbingId = null): ProposalSkripsi
    {
        $existing = ProposalSkripsi::where('mahasiswa_id', $mahasiswa->id)->first();
        if ($existing && in_array($existing->status, ['bimbingan', 'siap_ujian', 'lulus_ujian'])) {
            throw new DomainException("MAHASISWA SUDAH MEMILIKI PROPOSAL: Proposal Skripsi Anda sudah berstatus '{$existing->status}'.");
        }

        return DB::transaction(function () use ($mahasiswa, $judul, $dosenPembimbingId, $existing) {
            if ($existing) {
                $existing->update([
                    'judul' => $judul,
                    'dosen_pembimbing_id' => $dosenPembimbingId ?? $existing->dosen_pembimbing_id,
                    'status' => 'diajukan',
                ]);
                $proposal = $existing->fresh();
            } else {
                $proposal = ProposalSkripsi::create([
                    'mahasiswa_id' => $mahasiswa->id,
                    'dosen_pembimbing_id' => $dosenPembimbingId,
                    'judul' => $judul,
                    'status' => 'diajukan',
                ]);
            }

            ActivityLogger::log('skripsi.proposal.submit', 'ProposalSkripsi', $proposal->id, [], [
                'mahasiswa_id' => $mahasiswa->id,
                'judul' => $judul,
                'status' => 'diajukan',
            ]);

            return $proposal;
        });
    }

    /**
     * Admin/Kaprodi approves Proposal Skripsi & assigns Dosen Pembimbing.
     * State Machine: 'diajukan' -> 'bimbingan'
     */
    public function approveProposal(ProposalSkripsi $proposal, int $dosenPembimbingId): ProposalSkripsi
    {
        if ($proposal->status !== 'diajukan') {
            throw new DomainException("TRANSISI STATUS INVALID: Hanya proposal berstatus 'diajukan' yang dapat disetujui.");
        }

        return DB::transaction(function () use ($proposal, $dosenPembimbingId) {
            $proposal->update([
                'dosen_pembimbing_id' => $dosenPembimbingId,
                'status' => 'bimbingan',
            ]);

            ActivityLogger::log('skripsi.proposal.approve', 'ProposalSkripsi', $proposal->id, [
                'status' => 'diajukan',
            ], [
                'status' => 'bimbingan',
                'dosen_pembimbing_id' => $dosenPembimbingId,
            ]);

            return $proposal->fresh();
        });
    }

    /**
     * Mahasiswa adds a proposal guidance consultation log.
     */
    public function addBimbinganProposal(ProposalSkripsi $proposal, string $tanggal, string $catatan): BimbinganProposal
    {
        if (! in_array($proposal->status, ['bimbingan', 'diajukan'])) {
            throw new DomainException('CATATAN BIMBINGAN TIDAK DAPAT DITAMBAHKAN: Proposal belum dalam tahap bimbingan.');
        }

        return BimbinganProposal::create([
            'proposal_skripsi_id' => $proposal->id,
            'tanggal' => $tanggal,
            'catatan' => $catatan,
            'divalidasi' => false,
        ]);
    }

    /**
     * Dosen Pembimbing validates proposal guidance consultation log.
     */
    public function validateBimbinganProposal(BimbinganProposal $bimbingan, int $dosenId): BimbinganProposal
    {
        $proposal = $bimbingan->proposalSkripsi;
        if ($proposal->dosen_pembimbing_id !== $dosenId) {
            throw new DomainException('AKSES DITOLAK: Anda bukan dosen pembimbing proposal ini.');
        }

        return DB::transaction(function () use ($bimbingan, $dosenId) {
            $bimbingan->update(['divalidasi' => true]);

            ActivityLogger::log('skripsi.bimbingan.validate', 'BimbinganProposal', $bimbingan->id, [
                'divalidasi' => false,
            ], [
                'divalidasi' => true,
                'dosen_id' => $dosenId,
            ]);

            $studentUser = $bimbingan->proposalSkripsi->mahasiswa->user ?? null;
            if ($studentUser) {
                try {
                    $studentUser->notify(new \App\Notifications\SkripsiNotification('bimbingan_validated', $bimbingan->tanggal));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Gagal mengirim notification Bimbingan Proposal: '.$e->getMessage());
                }
            }

            return $bimbingan->fresh();
        });
    }

    /**
     * Schedule Ujian Proposal with multilayer validations (Min Bimbingan + UKT Check).
     * State Machine: 'bimbingan' -> 'siap_ujian'
     */
    public function scheduleUjianProposal(ProposalSkripsi $proposal, string $tanggalUjian): ProposalSkripsi
    {
        if ($proposal->status !== 'bimbingan') {
            throw new DomainException("TRANSISI STATUS INVALID: Ujian proposal hanya dapat dijadwalkan untuk proposal berstatus 'bimbingan'.");
        }

        // 1. Min Bimbingan Check from SystemConfig
        $minBimbingan = (int) SystemConfig::getValue('MIN_BIMBINGAN_PROPOSAL', '8');

        $validCount = $proposal->bimbinganProposals()->where('divalidasi', true)->count();
        if ($validCount < $minBimbingan) {
            throw new DomainException("SYARAT BIMBINGAN BELUM TERPENUHI: Jumlah bimbingan proposal tervalidasi ({$validCount}x) belum mencapai minimal ({$minBimbingan}x).");
        }

        // 2. UKT Unpaid Check
        $hasUnpaidUkt = Tagihan::where('mahasiswa_id', $proposal->mahasiswa_id)
            ->where('jenis', 'ukt')
            ->where('status', '!=', 'lunas')
            ->where('jatuh_tempo', '<=', date('Y-m-d'))
            ->exists();
        if ($hasUnpaidUkt) {
            throw new DomainException('TUNGGAKAN UKT: Mahasiswa memiliki tunggakan UKT aktif yang belum dilunasi.');
        }

        return DB::transaction(function () use ($proposal, $tanggalUjian) {
            $proposal->update([
                'status' => 'siap_ujian',
                'tanggal_ujian' => $tanggalUjian,
            ]);

            ActivityLogger::log('skripsi.ujian.schedule', 'ProposalSkripsi', $proposal->id, [
                'status' => 'bimbingan',
            ], [
                'status' => 'siap_ujian',
                'tanggal_ujian' => $tanggalUjian,
            ]);

            $studentUser = $proposal->mahasiswa->user ?? null;
            if ($studentUser) {
                try {
                    $studentUser->notify(new \App\Notifications\SkripsiNotification('ujian_scheduled', $tanggalUjian));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Gagal mengirim notification Ujian Proposal: '.$e->getMessage());
                }
            }

            return $proposal->fresh();
        });
    }

    /**
     * Pass Ujian Proposal & initialize Skripsi entry.
     * State Machine Proposal: 'siap_ujian' -> 'lulus_ujian'
     */
    public function passUjianProposal(ProposalSkripsi $proposal): Skripsi
    {
        if ($proposal->status !== 'siap_ujian') {
            throw new DomainException('TRANSISI STATUS INVALID: Ujian proposal belum dijadwalkan.');
        }

        return DB::transaction(function () use ($proposal) {
            $proposal->update(['status' => 'lulus_ujian']);

            $skripsi = Skripsi::firstOrCreate(
                ['mahasiswa_id' => $proposal->mahasiswa_id],
                [
                    'dosen_pembimbing_id' => $proposal->dosen_pembimbing_id,
                    'judul' => $proposal->judul,
                    'status' => 'bimbingan',
                ]
            );

            $studentUser = $proposal->mahasiswa->user ?? null;
            if ($studentUser) {
                try {
                    $studentUser->notify(new \App\Notifications\SkripsiNotification('ujian_passed'));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Gagal mengirim notification Lulus Proposal: '.$e->getMessage());
                }
            }

            return $skripsi;
        });
    }


    /**
     * Mahasiswa adds a skripsi guidance consultation log.
     */
    public function addBimbinganSkripsi(Skripsi $skripsi, string $tanggal, string $catatan): BimbinganSkripsi
    {
        if ($skripsi->status !== 'bimbingan') {
            throw new DomainException('CATATAN BIMBINGAN TIDAK DAPAT DITAMBAHKAN: Skripsi belum dalam tahap bimbingan.');
        }

        return BimbinganSkripsi::create([
            'skripsi_id' => $skripsi->id,
            'tanggal' => $tanggal,
            'catatan' => $catatan,
            'divalidasi' => false,
        ]);
    }

    /**
     * Dosen Pembimbing validates skripsi guidance consultation log.
     */
    public function validateBimbinganSkripsi(BimbinganSkripsi $bimbingan, int $dosenId): BimbinganSkripsi
    {
        $skripsi = $bimbingan->skripsi;
        if ($skripsi->dosen_pembimbing_id !== $dosenId) {
            throw new DomainException('AKSES DITOLAK: Anda bukan dosen pembimbing skripsi ini.');
        }

        return DB::transaction(function () use ($bimbingan, $dosenId) {
            $bimbingan->update(['divalidasi' => true]);

            ActivityLogger::log('skripsi.bimbingan.validate', 'BimbinganSkripsi', $bimbingan->id, [
                'divalidasi' => false,
            ], [
                'divalidasi' => true,
                'dosen_id' => $dosenId,
            ]);

            $studentUser = $bimbingan->skripsi->mahasiswa->user ?? null;
            if ($studentUser) {
                try {
                    $studentUser->notify(new \App\Notifications\SkripsiNotification('bimbingan_validated', $bimbingan->tanggal));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Gagal mengirim notification Bimbingan Skripsi: '.$e->getMessage());
                }
            }

            return $bimbingan->fresh();
        });
    }

    /**
     * Schedule Ujian Skripsi with multilayer validations (Min Bimbingan + UKT Check).
     * State Machine: 'bimbingan' -> 'siap_ujian'
     */
    public function scheduleUjianSkripsi(Skripsi $skripsi, string $tanggalUjian): Skripsi
    {
        if ($skripsi->status !== 'bimbingan') {
            throw new DomainException("TRANSISI STATUS INVALID: Ujian skripsi hanya dapat dijadwalkan untuk skripsi berstatus 'bimbingan'.");
        }

        // 1. Min Bimbingan Check from SystemConfig
        $minBimbingan = (int) SystemConfig::getValue('MIN_BIMBINGAN_SKRIPSI', '8');

        $validCount = $skripsi->bimbinganSkripsis()->where('divalidasi', true)->count();
        if ($validCount < $minBimbingan) {
            throw new DomainException("SYARAT BIMBINGAN BELUM TERPENUHI: Jumlah bimbingan skripsi tervalidasi ({$validCount}x) belum mencapai minimal ({$minBimbingan}x).");
        }

        // 2. UKT Unpaid Check
        $hasUnpaidUkt = Tagihan::where('mahasiswa_id', $skripsi->mahasiswa_id)
            ->where('jenis', 'ukt')
            ->where('status', '!=', 'lunas')
            ->where('jatuh_tempo', '<=', date('Y-m-d'))
            ->exists();
        if ($hasUnpaidUkt) {
            throw new DomainException('TUNGGAKAN UKT: Mahasiswa memiliki tunggakan UKT aktif yang belum dilunasi.');
        }

        return DB::transaction(function () use ($skripsi, $tanggalUjian) {
            $skripsi->update([
                'status' => 'siap_ujian',
                'tanggal_ujian' => $tanggalUjian,
            ]);

            ActivityLogger::log('skripsi.ujian.schedule', 'Skripsi', $skripsi->id, [
                'status' => 'bimbingan',
            ], [
                'status' => 'siap_ujian',
                'tanggal_ujian' => $tanggalUjian,
            ]);

            $studentUser = $skripsi->mahasiswa->user ?? null;
            if ($studentUser) {
                try {
                    $studentUser->notify(new \App\Notifications\SkripsiNotification('ujian_scheduled', $tanggalUjian));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Gagal mengirim notification Ujian Skripsi: '.$e->getMessage());
                }
            }

            return $skripsi->fresh();
        });
    }

    /**
     * Pass Ujian Skripsi.
     * State Machine: 'siap_ujian' -> 'lulus_ujian'
     */
    public function passUjianSkripsi(Skripsi $skripsi): Skripsi
    {
        if ($skripsi->status !== 'siap_ujian') {
            throw new DomainException('TRANSISI STATUS INVALID: Ujian skripsi belum dijadwalkan.');
        }

        return DB::transaction(function () use ($skripsi) {
            $skripsi->update(['status' => 'lulus_ujian']);

            ActivityLogger::log('skripsi.pass', 'Skripsi', $skripsi->id, [
                'status' => 'siap_ujian',
            ], [
                'status' => 'lulus_ujian',
            ]);

            $studentUser = $skripsi->mahasiswa->user ?? null;
            if ($studentUser) {
                try {
                    $studentUser->notify(new \App\Notifications\SkripsiNotification('ujian_passed'));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Gagal mengirim notification Lulus Skripsi: '.$e->getMessage());
                }
            }

            return $skripsi->fresh();
        });
    }

}

