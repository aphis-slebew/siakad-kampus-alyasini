<?php

namespace App\Http\Controllers\Kemahasiswaan;

use App\Http\Controllers\Controller;
use App\Models\AktivitasMahasiswa;
use App\Models\BeasiswaMahasiswa;
use App\Models\Mahasiswa;
use App\Models\PelanggaranMahasiswa;
use App\Models\ReferensiBiodata;
use App\Services\KemahasiswaanService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KemahasiswaanController extends Controller
{
    /**
     * Display Aktivitas Mahasiswa portal.
     */
    public function aktivitasIndex(Request $request): Response
    {
        $user = auth()->user();

        if ($user->hasRole('mahasiswa')) {
            $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();
            $aktivitases = AktivitasMahasiswa::with('jenisAktivitas')
                ->where('mahasiswa_id', $mahasiswa->id)
                ->latest()
                ->get();
            $jenisAktivitases = ReferensiBiodata::where('tipe', 'jenis_aktivitas')->get();

            return Inertia::render('kemahasiswaan/index', [
                'activeTab' => 'aktivitas',
                'aktivitases' => $aktivitases,
                'jenisAktivitases' => $jenisAktivitases,
                'role' => 'mahasiswa',
            ]);
        }

        $aktivitases = AktivitasMahasiswa::with(['mahasiswa.programStudi', 'jenisAktivitas'])->latest()->get();
        $jenisAktivitases = ReferensiBiodata::where('tipe', 'jenis_aktivitas')->get();

        return Inertia::render('kemahasiswaan/index', [
            'activeTab' => 'aktivitas',
            'aktivitases' => $aktivitases,
            'jenisAktivitases' => $jenisAktivitases,
            'role' => 'admin',
        ]);
    }

    /**
     * Submit Aktivitas Mahasiswa.
     */
    public function aktivitasStore(Request $request, KemahasiswaanService $kemahasiswaanService): RedirectResponse
    {
        $request->validate([
            'nama_kegiatan' => 'required|string|max:255',
            'jenis_aktivitas_id' => 'nullable|exists:referensi_biodatas,id',
        ]);

        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();

        $kemahasiswaanService->submitAktivitas($mahasiswa, $request->nama_kegiatan, $request->jenis_aktivitas_id);

        return back()->with('success', 'Aktivitas mahasiswa berhasil diajukan.');
    }

    /**
     * Validate Aktivitas Mahasiswa.
     */
    public function aktivitasValidate(Request $request, AktivitasMahasiswa $aktivitas, KemahasiswaanService $kemahasiswaanService): RedirectResponse
    {
        $kemahasiswaanService->validateAktivitas($aktivitas);

        return back()->with('success', 'Aktivitas mahasiswa berhasil divalidasi.');
    }

    /**
     * Display Pelanggaran Mahasiswa list.
     */
    public function pelanggaranIndex(Request $request): Response
    {
        $user = auth()->user();

        if ($user->hasRole('mahasiswa')) {
            $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();
            $pelanggarans = PelanggaranMahasiswa::with(['jenisPelanggaran', 'sanksi'])
                ->where('mahasiswa_id', $mahasiswa->id)
                ->latest()
                ->get();

            return Inertia::render('kemahasiswaan/index', [
                'activeTab' => 'pelanggaran',
                'pelanggarans' => $pelanggarans,
                'role' => 'mahasiswa',
            ]);
        }

        $pelanggarans = PelanggaranMahasiswa::with(['mahasiswa.programStudi', 'jenisPelanggaran', 'sanksi'])->latest()->get();
        $mahasiswas = Mahasiswa::all();
        $jenisPelanggarans = ReferensiBiodata::where('tipe', 'jenis_pelanggaran')->get();
        $sanksis = ReferensiBiodata::where('tipe', 'sanksi_pelanggaran')->get();

        return Inertia::render('kemahasiswaan/index', [
            'activeTab' => 'pelanggaran',
            'pelanggarans' => $pelanggarans,
            'mahasiswas' => $mahasiswas,
            'jenisPelanggarans' => $jenisPelanggarans,
            'sanksis' => $sanksis,
            'role' => 'admin',
        ]);
    }

    /**
     * Create Pelanggaran Mahasiswa record (Input sepihak institusi).
     */
    public function pelanggaranStore(Request $request, KemahasiswaanService $kemahasiswaanService): RedirectResponse
    {
        $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswas,id',
            'jenis_pelanggaran_id' => 'nullable|exists:referensi_biodatas,id',
            'sanksi_id' => 'nullable|exists:referensi_biodatas,id',
            'tanggal' => 'required|date',
        ]);

        $mahasiswa = Mahasiswa::findOrFail($request->mahasiswa_id);

        $kemahasiswaanService->createPelanggaran($mahasiswa, $request->jenis_pelanggaran_id, $request->sanksi_id, $request->tanggal);

        return back()->with('success', 'Catatan pelanggaran mahasiswa berhasil ditambahkan.');
    }

    /**
     * Display Beasiswa Mahasiswa portal.
     */
    public function beasiswaIndex(Request $request): Response
    {
        $user = auth()->user();

        if ($user->hasRole('mahasiswa')) {
            $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();
            $beasiswas = BeasiswaMahasiswa::with('jenisBeasiswa')
                ->where('mahasiswa_id', $mahasiswa->id)
                ->latest()
                ->get();
            $jenisBeasiswas = ReferensiBiodata::where('tipe', 'jenis_beasiswa')->get();

            return Inertia::render('kemahasiswaan/index', [
                'activeTab' => 'beasiswa',
                'beasiswas' => $beasiswas,
                'jenisBeasiswas' => $jenisBeasiswas,
                'role' => 'mahasiswa',
            ]);
        }

        $beasiswas = BeasiswaMahasiswa::with(['mahasiswa.programStudi', 'jenisBeasiswa'])->latest()->get();
        $jenisBeasiswas = ReferensiBiodata::where('tipe', 'jenis_beasiswa')->get();

        return Inertia::render('kemahasiswaan/index', [
            'activeTab' => 'beasiswa',
            'beasiswas' => $beasiswas,
            'jenisBeasiswas' => $jenisBeasiswas,
            'role' => 'admin',
        ]);
    }

    /**
     * Submit Beasiswa Mahasiswa.
     */
    public function beasiswaStore(Request $request, KemahasiswaanService $kemahasiswaanService): RedirectResponse
    {
        $request->validate([
            'jenis_beasiswa_id' => 'nullable|exists:referensi_biodatas,id',
        ]);

        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();

        $kemahasiswaanService->submitBeasiswa($mahasiswa, $request->jenis_beasiswa_id);

        return back()->with('success', 'Pengajuan beasiswa berhasil dikirim.');
    }

    /**
     * Approve or reject Beasiswa Mahasiswa.
     */
    public function beasiswaApprove(Request $request, BeasiswaMahasiswa $beasiswa, KemahasiswaanService $kemahasiswaanService): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:diterima,ditolak',
        ]);

        try {
            $kemahasiswaanService->approveBeasiswa($beasiswa, $request->status);

            return back()->with('success', 'Status beasiswa berhasil diperbarui.');
        } catch (Exception $e) {
            return back()->withErrors(['beasiswa' => $e->getMessage()]);
        }
    }
}
