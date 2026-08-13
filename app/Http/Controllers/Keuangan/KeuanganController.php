<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateUktTagihanJob;
use App\Models\CicilanTagihan;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use App\Services\PaymentVerificationService;
use App\Services\SecureFileUploadService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class KeuanganController extends Controller
{
    /**
     * Financial Staff Payment Verification Dashboard.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'menunggu');

        $pembayarans = Pembayaran::with([
            'tagihan.mahasiswa.programStudi',
            'tagihan.tahunAjaran',
            'diverifikasiOleh',
        ])
            ->when($status !== 'semua', fn ($q) => $q->where('status_verifikasi', $status))
            ->orderByDesc('id')
            ->get();

        $tagihans = Tagihan::with(['mahasiswa.programStudi', 'tahunAjaran', 'pembayarans', 'cicilanTagihans'])
            ->orderByDesc('id')
            ->get();

        return Inertia::render('keuangan/pembayaran/index', [
            'pembayarans' => $pembayarans,
            'tagihans' => $tagihans,
            'currentStatus' => $status,
        ]);
    }

    /**
     * Student Payment Page (`/keuangan/bayar`).
     */
    public function showStudentPayment(Request $request): Response
    {
        $user = $request->user();
        $mahasiswa = $user->mahasiswa;

        $tagihans = [];
        if ($mahasiswa) {
            $tagihans = Tagihan::with([
                'tahunAjaran',
                'pembayarans',
                'cicilanTagihans',
            ])
                ->where('mahasiswa_id', $mahasiswa->id)
                ->orderByDesc('id')
                ->get();
        }

        return Inertia::render('keuangan/pembayaran/student', [
            'mahasiswa' => $mahasiswa,
            'tagihans' => $tagihans,
        ]);
    }

    /**
     * Student submits manual transfer proof upload (`04-Security.md §3`).
     */
    public function submitPayment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tagihan_id' => ['required', 'exists:tagihans,id'],
            'tanggal_bayar' => ['required', 'date'],
            'nominal_dibayar' => ['required', 'numeric', 'min:10000'],
            'bukti_file' => ['required', 'file', 'mimetypes:image/jpeg,image/png,application/pdf', 'max:2048'],
        ], [
            'tagihan_id.required' => 'Tagihan wajib dipilih.',
            'nominal_dibayar.required' => 'Nominal dibayar wajib diisi.',
            'bukti_file.required' => 'Bukti pembayaran wajib diunggah.',
            'bukti_file.mimetypes' => 'Bukti pembayaran harus berupa gambar JPG/PNG atau PDF.',
            'bukti_file.max' => 'Ukuran file bukti pembayaran maksimal 2MB.',
        ]);

        $tagihan = Tagihan::findOrFail($validated['tagihan_id']);

        try {
            $path = SecureFileUploadService::uploadPrivate(
                $request->file('bukti_file'),
                'private/bukti_pembayaran',
                2048
            );
        } catch (\InvalidArgumentException $e) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'bukti_file' => [$e->getMessage()],
            ]);
        }


        Pembayaran::create([
            'tagihan_id' => $tagihan->id,
            'tanggal_bayar' => $validated['tanggal_bayar'],
            'nominal_dibayar' => $validated['nominal_dibayar'],
            'metode' => 'transfer_manual',
            'bukti_file_path' => $path,
            'status_verifikasi' => 'menunggu',
        ]);

        return back()->with('success', 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi dari staf keuangan.');
    }

    /**
     * Financial Staff verifies payment via PaymentVerificationService.
     */
    public function verifyPayment(Request $request, Pembayaran $pembayaran, PaymentVerificationService $service): RedirectResponse
    {
        $validated = $request->validate([
            'status_verifikasi' => ['required', 'in:diverifikasi,ditolak'],
        ]);

        try {
            $service->verifyPayment($pembayaran, $validated['status_verifikasi'], $request->user()->id);

            return back()->with('success', "Status verifikasi pembayaran berhasil diubah menjadi {$validated['status_verifikasi']}.");
        } catch (Exception $e) {
            return back()->withErrors(['verifikasi' => $e->getMessage()]);
        }
    }

    /**
     * Download/view private proof of payment file safely (`04-Security.md §3`).
     */
    public function downloadBukti(Request $request, Pembayaran $pembayaran): StreamedResponse
    {
        $user = $request->user();
        $isKeuangan = $user->hasRole('staf_keuangan') || $user->hasRole('superadmin');
        $isOwner = $pembayaran->tagihan && $pembayaran->tagihan->mahasiswa && $pembayaran->tagihan->mahasiswa->user_id === $user->id;

        if (! $isKeuangan && ! $isOwner) {
            abort(403, 'Anda tidak memiliki otorisasi untuk melihat bukti pembayaran ini.');
        }

        if (! $pembayaran->bukti_file_path || ! Storage::disk('local')->exists($pembayaran->bukti_file_path)) {
            abort(404, 'File bukti pembayaran tidak ditemukan.');
        }

        return Storage::disk('local')->response($pembayaran->bukti_file_path);
    }

    /**
     * Submit installment plan (Cicilan Tagihan).
     * PEMBULATAN CICILAN (Edge Case Finansial #2):
     * Jika nominal tagihan dibagi jumlah cicilan menghasilkan desimal tidak terbatas
     * (misal Rp 1.000.000 / 3 = 333.333,333...), cicilan ke-1 s.d. (N-1) dibulatkan ke bawah
     * dan cicilan TERAKHIR menyerap SELURUH sisa pembulatan sehingga total cicilan
     * PERSIS SAMA dengan nominal tagihan asli tanpa selisih 1 sen/rupiah pun.
     */
    public function requestCicilan(Request $request, Tagihan $tagihan): RedirectResponse
    {
        $validated = $request->validate([
            'jumlah_cicilan' => ['required', 'integer', 'min:2', 'max:4'],
        ]);

        $jumlah = $validated['jumlah_cicilan'];
        $nominalTotal = (float) $tagihan->nominal;

        // Base nominal rounded down to 2 decimal places
        $baseNominal = round(floor(($nominalTotal / $jumlah) * 100) / 100, 2);
        $allocatedSum = 0.0;

        // Delete existing unverified cicilans if any
        CicilanTagihan::where('tagihan_id', $tagihan->id)->delete();

        for ($i = 1; $i <= $jumlah; $i++) {
            if ($i === $jumlah) {
                // Last installment absorbs the exact remaining rounding remainder
                $nominalCicilan = round($nominalTotal - $allocatedSum, 2);
            } else {
                $nominalCicilan = $baseNominal;
                $allocatedSum += $nominalCicilan;
            }

            CicilanTagihan::create([
                'tagihan_id' => $tagihan->id,
                'cicilan_ke' => $i,
                'nominal' => $nominalCicilan,
                'jatuh_tempo' => now()->addMonths($i)->toDateString(),
                'status' => 'belum_bayar',
            ]);
        }

        $tagihan->update(['status' => 'dicicil']);

        return back()->with('success', "Skema {$jumlah} kali cicilan berhasil dibuat dengan total pembagian presisi Rp ".number_format($nominalTotal, 2, ',', '.').'.');
    }

    /**
     * Dispatch GenerateUktTagihanJob for a registration period.
     */
    public function generateUktBatch(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'periode_registrasi_id' => ['required', 'exists:periode_registrasis,id'],
        ]);

        GenerateUktTagihanJob::dispatch($validated['periode_registrasi_id']);

        return back()->with('success', 'Job pembuatan tagihan UKT otomatis berhasil dijalankan di background queue.');
    }
}
