<?php

namespace App\Http\Controllers\Pmb;

use App\Http\Controllers\Controller;
use App\Models\BerkasPendaftaran;
use App\Models\CalonMahasiswa;
use App\Models\HasilSeleksi;
use App\Notifications\PmbSeleksiNotification;
use App\Services\ActivityLogger;
use App\Services\PmbStateService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CalonMahasiswaController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');

        $query = CalonMahasiswa::with([
            'gelombangPendaftaran',
            'jalurPendaftaran',
            'prodiPilihan1',
            'prodiPilihan2',
            'berkasPendaftarans',
            'hasilSeleksi',
        ]);

        if ($status) {
            $query->where('status_pendaftaran', $status);
        }

        $calonMahasiswas = $query->orderByDesc('id')->get();

        return Inertia::render('pmb/calon-mahasiswa/index', [
            'calonMahasiswas' => $calonMahasiswas,
            'currentStatus' => $status,
        ]);
    }

    public function show(CalonMahasiswa $calonMahasiswa): Response
    {
        $calonMahasiswa->load([
            'gelombangPendaftaran',
            'jalurPendaftaran',
            'prodiPilihan1',
            'prodiPilihan2',
            'berkasPendaftarans',
            'jadwalSeleksis',
            'hasilSeleksi',
        ]);

        return Inertia::render('pmb/calon-mahasiswa/show', [
            'calon' => $calonMahasiswa,
        ]);
    }

    public function updateStatus(Request $request, CalonMahasiswa $calonMahasiswa, PmbStateService $pmbStateService): RedirectResponse
    {
        $validated = $request->validate([
            'target_status' => ['required', 'string'],
        ]);

        try {
            $pmbStateService->transition($calonMahasiswa, $validated['target_status']);

            return back()->with('success', "Status pendaftaran berhasil diperbarui menjadi {$validated['target_status']}.");
        } catch (Exception $e) {
            return back()->withErrors(['target_status' => $e->getMessage()]);
        }
    }

    public function verifyBerkas(Request $request, BerkasPendaftaran $berkas): RedirectResponse
    {
        $validated = $request->validate([
            'status_verifikasi' => ['required', 'in:diverifikasi,ditolak'],
            'catatan_verifikasi' => ['nullable', 'string'],
        ]);

        $oldStatus = $berkas->status_verifikasi;

        $berkas->update([
            'status_verifikasi' => $validated['status_verifikasi'],
            'catatan_verifikasi' => $validated['catatan_verifikasi'] ?? null,
            'diverifikasi_oleh_user_id' => $request->user()->id,
        ]);

        ActivityLogger::log('pmb.verify_berkas', 'BerkasPendaftaran', $berkas->id, [
            'status_verifikasi' => $oldStatus,
        ], [
            'status_verifikasi' => $validated['status_verifikasi'],
            'catatan_verifikasi' => $validated['catatan_verifikasi'] ?? null,
            'diverifikasi_oleh_user_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Status verifikasi berkas berhasil disimpan.');
    }

    public function downloadBerkas(Request $request, BerkasPendaftaran $berkas): StreamedResponse
    {
        // 04-Security.md §3: Protect private file downloads
        $user = $request->user();
        $isPanitia = $user->hasRole('panitia_pmb') || $user->hasRole('superadmin');
        $isOwner = $berkas->calonMahasiswa && $berkas->calonMahasiswa->user_id === $user->id;

        if (! $isPanitia && ! $isOwner) {
            abort(403, 'Anda tidak memiliki otorisasi untuk mengunduh berkas ini.');
        }

        if (! Storage::disk('local')->exists($berkas->file_path)) {
            abort(404, 'File berkas tidak ditemukan.');
        }

        return Storage::disk('local')->response($berkas->file_path);
    }

    public function inputHasilSeleksi(Request $request, CalonMahasiswa $calonMahasiswa): RedirectResponse
    {
        $validated = $request->validate([
            'nilai_tes' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'status' => ['required', 'in:lulus,tidak_lulus'],
            'catatan' => ['nullable', 'string'],
        ]);

        $hasil = HasilSeleksi::updateOrCreate(
            ['calon_mahasiswa_id' => $calonMahasiswa->id],
            [
                'nilai_tes' => $validated['nilai_tes'] ?? null,
                'status' => $validated['status'],
                'catatan' => $validated['catatan'] ?? null,
            ]
        );

        // Update status pendaftaran calon mahasiswa
        $newStatus = $validated['status'] === 'lulus' ? 'lulus_seleksi' : 'tidak_lulus';
        $calonMahasiswa->update(['status_pendaftaran' => $newStatus]);

        if ($calonMahasiswa->user) {
            try {
                $calonMahasiswa->user->notify(new PmbSeleksiNotification(
                    $validated['status'],
                    $validated['catatan'] ?? ''
                ));
            } catch (\Throwable $e) {
                Log::error('Gagal mengirim notification PMB: '.$e->getMessage());
            }
        }

        ActivityLogger::log('pmb.input_hasil_seleksi', 'HasilSeleksi', $hasil->id, null, [

            'calon_mahasiswa_id' => $calonMahasiswa->id,
            'status' => $validated['status'],
            'nilai_tes' => $validated['nilai_tes'] ?? null,
        ]);

        return back()->with('success', 'Hasil seleksi calon mahasiswa berhasil disimpan.');
    }

    public function konversi(Request $request, CalonMahasiswa $calonMahasiswa, PmbStateService $pmbStateService): RedirectResponse
    {
        try {
            $mahasiswa = $pmbStateService->convertCalonKeMahasiswa($calonMahasiswa);

            return back()->with('success', "Calon mahasiswa berhasil dikonversi menjadi Mahasiswa Resmi dengan NIM: {$mahasiswa->nim}.");
        } catch (Exception $e) {
            return back()->withErrors(['konversi' => $e->getMessage()]);
        }
    }
}
