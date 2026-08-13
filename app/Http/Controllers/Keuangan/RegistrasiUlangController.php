<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\DokumenRegistrasi;
use App\Models\PeriodeRegistrasi;
use App\Models\RegistrasiUlang;
use App\Services\ActivityLogger;
use App\Services\SecureFileUploadService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RegistrasiUlangController extends Controller
{
    public function index(Request $request): Response
    {
        $registrasis = RegistrasiUlang::with([
            'periodeRegistrasi.tahunAjaran',
            'calonMahasiswa',
            'mahasiswa.programStudi',
            'dokumenRegistrasis',
        ])
            ->orderByDesc('id')
            ->get();

        return Inertia::render('registrasi-ulang/index', [
            'registrasis' => $registrasis,
        ]);
    }

    public function showStudentIndex(Request $request): Response
    {
        $user = $request->user();
        $calon = $user->user_type === 'calon_mahasiswa' ? $user->calonMahasiswa : null;
        $mahasiswa = $user->user_type === 'mahasiswa' ? $user->mahasiswa : null;

        $activePeriode = PeriodeRegistrasi::with('tahunAjaran')
            ->where('mulai', '<=', now()->toDateString())
            ->where('selesai', '>=', now()->toDateString())
            ->first();

        $registrasi = null;
        if ($activePeriode) {
            if ($calon) {
                $registrasi = RegistrasiUlang::with('dokumenRegistrasis')
                    ->where('periode_registrasi_id', $activePeriode->id)
                    ->where('calon_mahasiswa_id', $calon->id)
                    ->first();
            } elseif ($mahasiswa) {
                $registrasi = RegistrasiUlang::with('dokumenRegistrasis')
                    ->where('periode_registrasi_id', $activePeriode->id)
                    ->where('mahasiswa_id', $mahasiswa->id)
                    ->first();
            }
        }

        return Inertia::render('registrasi-ulang/student', [
            'activePeriode' => $activePeriode,
            'registrasi' => $registrasi,
            'calon' => $calon,
            'mahasiswa' => $mahasiswa,
        ]);
    }

    public function submitRegistration(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'periode_registrasi_id' => ['required', 'exists:periode_registrasis,id'],
            'calon_mahasiswa_id' => ['nullable', 'exists:calon_mahasiswas,id'],
            'mahasiswa_id' => ['nullable', 'exists:mahasiswas,id'],
            'dokumen_ijazah_asli' => ['nullable', 'file', 'mimetypes:application/pdf,image/jpeg,image/png', 'max:2048'],
            'dokumen_kk' => ['nullable', 'file', 'mimetypes:application/pdf,image/jpeg,image/png', 'max:2048'],
            'dokumen_pas_foto' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png', 'max:1024'],
        ]);

        // Exclusive XOR Validation (02-Database-Schema.md §6): EITHER calon_mahasiswa_id OR mahasiswa_id, NEVER both
        $hasCalon = ! empty($validated['calon_mahasiswa_id']);
        $hasMahasiswa = ! empty($validated['mahasiswa_id']);

        if (($hasCalon && $hasMahasiswa) || (! $hasCalon && ! $hasMahasiswa)) {
            return back()->withErrors(['registrasi' => 'Registrasi Ulang harus memilih salah satu dari Calon Mahasiswa (baru) atau Mahasiswa (lama), tidak boleh keduanya sekaligus atau kosong.']);
        }

        try {
            DB::transaction(function () use ($request, $validated, $hasCalon) {
                $registrasi = RegistrasiUlang::firstOrCreate(
                    [
                        'periode_registrasi_id' => $validated['periode_registrasi_id'],
                        'calon_mahasiswa_id' => $hasCalon ? $validated['calon_mahasiswa_id'] : null,
                        'mahasiswa_id' => ! $hasCalon ? $validated['mahasiswa_id'] : null,
                    ],
                    [
                        'status' => 'proses_verifikasi',
                    ]
                );

                // Upload Documents securely via SecureFileUploadService
                $docs = [
                    'dokumen_ijazah_asli' => 'ijazah_asli',
                    'dokumen_kk' => 'kk',
                    'dokumen_pas_foto' => 'pas_foto',
                ];

                foreach ($docs as $field => $jenisDoc) {
                    if ($request->hasFile($field)) {
                        $isImageOnly = ($jenisDoc === 'pas_foto');
                        $maxKb = $isImageOnly ? 1024 : 2048;

                        $path = SecureFileUploadService::uploadPrivate(
                            $request->file($field),
                            'private/dokumen_registrasi',
                            $maxKb,
                            $isImageOnly
                        );

                        DokumenRegistrasi::updateOrCreate(
                            [
                                'registrasi_ulang_id' => $registrasi->id,
                                'jenis_dokumen' => $jenisDoc,
                            ],
                            [
                                'file_path' => $path,
                                'status_verifikasi' => 'diajukan',
                            ]
                        );
                    }
                }

                $registrasi->update(['status' => 'proses_verifikasi']);

                ActivityLogger::log('registrasi_ulang.submit', 'RegistrasiUlang', $registrasi->id, null, [
                    'periode_registrasi_id' => $registrasi->periode_registrasi_id,
                    'calon_mahasiswa_id' => $registrasi->calon_mahasiswa_id,
                    'mahasiswa_id' => $registrasi->mahasiswa_id,
                ]);
            });

            return back()->with('success', 'Dokumen registrasi ulang berhasil diajukan dan sedang diproses.');
        } catch (Exception $e) {
            return back()->withErrors(['registrasi' => $e->getMessage()]);
        }
    }

    public function verifyDokumen(Request $request, DokumenRegistrasi $dokumen): RedirectResponse
    {
        $validated = $request->validate([
            'status_verifikasi' => ['required', 'in:diverifikasi,ditolak'],
        ]);

        $dokumen->update([
            'status_verifikasi' => $validated['status_verifikasi'],
        ]);

        // If all documents for this registrasi are verified, update registrasi status
        $registrasi = $dokumen->registrasiUlang;
        $allDocs = $registrasi->dokumenRegistrasis;
        $allVerified = $allDocs->count() > 0 && $allDocs->every(fn ($d) => $d->status_verifikasi === 'diverifikasi');

        if ($allVerified) {
            $registrasi->update([
                'status' => 'selesai',
                'selesai_at' => now(),
            ]);

            ActivityLogger::log('registrasi_ulang.complete', 'RegistrasiUlang', $registrasi->id, null, [
                'status' => 'selesai',
                'selesai_at' => now(),
            ]);
        }

        return back()->with('success', 'Status dokumen registrasi ulang berhasil diverifikasi.');
    }
}
