<?php

namespace App\Http\Controllers\Akademik;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\TahunAjaran;
use App\Services\KhsService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KhsController extends Controller
{
    /**
     * Student KHS Portal.
     */
    public function studentKhs(Request $request, KhsService $khsService): Response
    {
        $user = auth()->user();
        $mahasiswa = Mahasiswa::with('programStudi')->where('user_id', $user->id)->firstOrFail();
        $tahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->firstOrFail();

        $khsData = $khsService->generateKhs($mahasiswa, $tahunAjaran->id, auth()->id() ? (int) auth()->id() : null);

        return Inertia::render('khs/student', [
            'khsData' => $khsData,
            'tahunAjaran' => $tahunAjaran,
        ]);
    }

    /**
     * View specific student KHS (Admin / Kaprodi / IDOR test endpoint).
     */
    public function showMahasiswaKhs(Request $request, Mahasiswa $mahasiswa, KhsService $khsService): Response
    {
        $tahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->firstOrFail();

        try {
            $khsData = $khsService->generateKhs($mahasiswa, $tahunAjaran->id, auth()->id() ? (int) auth()->id() : null);

            return Inertia::render('khs/student', [
                'khsData' => $khsData,
                'tahunAjaran' => $tahunAjaran,
            ]);
        } catch (Exception $e) {
            abort(403, $e->getMessage());
        }
    }
}
