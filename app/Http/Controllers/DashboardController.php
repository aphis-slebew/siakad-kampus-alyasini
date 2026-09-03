<?php

namespace App\Http\Controllers;

use App\Models\CalonMahasiswa;
use App\Models\Dosen;
use App\Models\KelasKuliah;
use App\Models\Krs;
use App\Models\Mahasiswa;
use App\Models\Pembayaran;
use App\Models\ProgramStudi;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display role-tailored dashboard with real database statistics.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $tahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->first();

        $stats = [
            'total_mahasiswa_aktif' => Mahasiswa::where('status_mahasiswa', 'aktif')->count(),
            'total_dosen_aktif' => Dosen::count(),
            'total_prodi' => ProgramStudi::count(),
            'tahun_ajaran_aktif' => $tahunAjaran ? $tahunAjaran->nama : '2026/2027 Ganjil',
            'pending_krs_count' => Krs::where('status', 'diajukan')->count(),
            'pending_pembayaran_count' => Pembayaran::where('status_verifikasi', 'menunggu')->count(),
            'pending_pmb_count' => CalonMahasiswa::where('status_pendaftaran', 'menunggu_verifikasi')->count(),
            'total_kelas_aktif' => $tahunAjaran ? KelasKuliah::where('tahun_ajaran_id', $tahunAjaran->id)->count() : 0,
        ];

        // Specific data if student
        $studentData = null;
        if ($user->hasRole('mahasiswa') || $user->user_type === 'mahasiswa') {
            $mahasiswa = Mahasiswa::with(['programStudi', 'dataOrangTua'])->where('user_id', $user->id)->first();
            $activeKrs = null;
            if ($mahasiswa && $tahunAjaran) {
                $activeKrs = Krs::where('mahasiswa_id', $mahasiswa->id)
                    ->where('tahun_ajaran_id', $tahunAjaran->id)
                    ->first();
            }
            $studentData = [
                'mahasiswa' => $mahasiswa,
                'active_krs_status' => $activeKrs?->status ?? 'belum_krs',
            ];
        }

        // Specific data if dosen
        $dosenData = null;
        if ($user->hasRole('dosen') || $user->hasRole('kaprodi') || $user->user_type === 'dosen') {
            $dosen = Dosen::where('user_id', $user->id)->first();
            $dosenData = [
                'dosen' => $dosen,
                'bimbingan_krs_count' => $dosen && $tahunAjaran ? Krs::where('tahun_ajaran_id', $tahunAjaran->id)
                    ->where('status', 'diajukan')
                    ->whereHas('mahasiswa.dosenWalis', fn ($q) => $q->where('dosen_id', $dosen->id))
                    ->count() : 0,
            ];
        }

        return Inertia::render('dashboard', [
            'liveStats' => $stats,
            'studentData' => $studentData,
            'dosenData' => $dosenData,
        ]);
    }
}
