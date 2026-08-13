<?php

namespace App\Http\Controllers\Skripsi;

use App\Http\Controllers\Controller;
use App\Models\BimbinganSkripsi;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Skripsi;
use App\Services\SkripsiService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SkripsiController extends Controller
{
    /**
     * Display Skripsi & Bimbingan portal.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        if ($user->hasRole('mahasiswa')) {
            $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();
            $skripsi = Skripsi::with(['dosenPembimbing', 'bimbinganSkripsis'])
                ->where('mahasiswa_id', $mahasiswa->id)
                ->first();

            return Inertia::render('skripsi/index', [
                'skripsi' => $skripsi,
                'role' => 'mahasiswa',
            ]);
        }

        if ($user->hasRole('dosen')) {
            $dosen = Dosen::where('user_id', $user->id)->firstOrFail();
            $skripsis = Skripsi::with(['mahasiswa', 'dosenPembimbing', 'bimbinganSkripsis'])
                ->where('dosen_pembimbing_id', $dosen->id)
                ->get();


            return Inertia::render('skripsi/index', [
                'skripsis' => $skripsis,
                'role' => 'dosen',
            ]);
        }

        $skripsis = Skripsi::with(['mahasiswa.programStudi', 'dosenPembimbing', 'bimbinganSkripsis'])->latest()->get();

        return Inertia::render('skripsi/index', [
            'skripsis' => $skripsis,
            'role' => 'admin',
        ]);
    }

    /**
     * Mahasiswa adds guidance log for Skripsi.
     */
    public function storeBimbingan(Request $request, Skripsi $skripsi, SkripsiService $skripsiService): RedirectResponse
    {
        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();

        // IDOR Protection: Mahasiswa can only add guidance to their own skripsi
        if ($skripsi->mahasiswa_id !== $mahasiswa->id) {
            abort(403, 'Akses Ditolak: Anda tidak berhak menambahkan bimbingan untuk skripsi ini.');
        }

        $request->validate([
            'tanggal' => 'required|date',
            'catatan' => 'required|string|min:5',
        ]);

        try {
            $skripsiService->addBimbinganSkripsi($skripsi, $request->tanggal, $request->catatan);

            return back()->with('success', 'Log bimbingan skripsi berhasil ditambahkan.');
        } catch (Exception $e) {
            return back()->withErrors(['bimbingan' => $e->getMessage()]);
        }
    }

    /**
     * Dosen validates guidance log for Skripsi.
     */
    public function validateBimbingan(Request $request, BimbinganSkripsi $bimbingan, SkripsiService $skripsiService): RedirectResponse
    {
        $user = auth()->user();
        $dosen = Dosen::where('user_id', $user->id)->firstOrFail();

        try {
            $skripsiService->validateBimbinganSkripsi($bimbingan, $dosen->id);

            return back()->with('success', 'Catatan bimbingan skripsi berhasil divalidasi.');
        } catch (Exception $e) {
            return back()->withErrors(['bimbingan' => $e->getMessage()]);
        }
    }

    /**
     * Admin/Kaprodi schedules Ujian Skripsi.
     */
    public function scheduleUjian(Request $request, Skripsi $skripsi, SkripsiService $skripsiService): RedirectResponse
    {
        $request->validate([
            'tanggal_ujian' => 'required|date',
        ]);

        try {
            $skripsiService->scheduleUjianSkripsi($skripsi, $request->tanggal_ujian);

            return back()->with('success', 'Jadwal Ujian Skripsi berhasil ditetapkan.');
        } catch (Exception $e) {
            return back()->withErrors(['ujian' => $e->getMessage()]);
        }
    }

    /**
     * Admin/Penguji passes Ujian Skripsi.
     */
    public function passUjian(Request $request, Skripsi $skripsi, SkripsiService $skripsiService): RedirectResponse
    {
        try {
            $skripsiService->passUjianSkripsi($skripsi);

            return back()->with('success', 'Mahasiswa dinyatakan LULUS UJIAN SKRIPSI.');
        } catch (Exception $e) {
            return back()->withErrors(['ujian' => $e->getMessage()]);
        }
    }
}
