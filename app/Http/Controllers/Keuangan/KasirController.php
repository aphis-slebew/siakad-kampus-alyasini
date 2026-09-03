<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\KomponenBiaya;
use App\Models\Mahasiswa;
use App\Models\Pembayaran;
use App\Models\ProgramStudi;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class KasirController extends Controller
{
    /**
     * Display the cashier point of sale (POS) and invoice generator interface.
     */
    public function index(Request $request): Response
    {
        $nim = $request->input('nim');
        $selectedMahasiswa = null;
        $tagihans = [];

        if ($nim) {
            $selectedMahasiswa = Mahasiswa::with(['programStudi', 'beasiswaMahasiswas.jenisBeasiswa'])
                ->where('nim', $nim)
                ->first();

            if ($selectedMahasiswa) {
                $tagihans = Tagihan::with('tahunAjaran')
                    ->where('mahasiswa_id', $selectedMahasiswa->id)
                    ->orderByDesc('id')
                    ->get();
            }
        }

        $recentPayments = Pembayaran::with(['tagihan.mahasiswa.programStudi', 'tagihan.tahunAjaran'])
            ->latest('id')
            ->take(15)
            ->get();

        $tahunAjarans = TahunAjaran::latest()->get(['id', 'nama', 'is_active']);
        $programStudis = ProgramStudi::orderBy('nama')->get(['id', 'kode', 'nama']);
        $komponens = KomponenBiaya::where('is_active', true)->get();

        return Inertia::render('keuangan/kasir/index', [
            'selectedMahasiswa' => $selectedMahasiswa,
            'tagihans' => $tagihans,
            'recentPayments' => $recentPayments,
            'tahunAjarans' => $tahunAjarans,
            'programStudis' => $programStudis,
            'komponens' => $komponens,
            'searchedNim' => $nim ?? '',
        ]);
    }

    /**
     * Process direct on-the-spot cashier payment for student bills.
     */
    public function storePayment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tagihan_id' => ['required', 'exists:tagihans,id'],
            'nominal_bayar' => ['required', 'numeric', 'min:1000'],
            'metode_pembayaran' => ['required', 'string', 'max:50'], // tunai, transfer, qris, edc
            'catatan' => ['nullable', 'string', 'max:255'],
        ]);

        $tagihan = Tagihan::with('mahasiswa')->findOrFail($validated['tagihan_id']);

        DB::transaction(function () use ($tagihan, $validated) {
            $kodeTransaksi = 'KSR-'.date('YmdHis').'-'.str_pad((string) $tagihan->id, 4, '0', STR_PAD_LEFT);

            // Record verified payment
            Pembayaran::create([
                'tagihan_id' => $tagihan->id,
                'tanggal_bayar' => now()->toDateString(),
                'nominal_dibayar' => $validated['nominal_bayar'],
                'metode' => $validated['metode_pembayaran'],
                'status_verifikasi' => 'diverifikasi',
                'diverifikasi_at' => now(),
                'diverifikasi_oleh_user_id' => Auth::id(),
            ]);

            // Calculate total paid
            $totalPaid = Pembayaran::where('tagihan_id', $tagihan->id)
                ->where('status_verifikasi', 'diverifikasi')
                ->sum('nominal_dibayar');

            if ($totalPaid >= (float) $tagihan->nominal) {
                $tagihan->update(['status' => 'lunas']);
            } else {
                $tagihan->update(['status' => 'belum_lunas']);
            }

            ActivityLogger::log('keuangan.kasir.bayar', 'Tagihan', $tagihan->id, null, [
                'kode_transaksi' => $kodeTransaksi,
                'nominal' => $validated['nominal_bayar'],
                'metode' => $validated['metode_pembayaran'],
            ]);
        });

        return back()->with('success', 'Pembayaran kasir berhasil diproses dan status tagihan diperbarui.');
    }

    /**
     * Bulk generate bills for a semester / prodi / angkatan with auto scholarship discount.
     */
    public function generateMassal(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'komponen_biaya_id' => ['required', 'exists:komponen_biayas,id'],
            'program_studi_id' => ['nullable'],
            'angkatan' => ['nullable', 'integer'],
            'jatuh_tempo' => ['required', 'date'],
        ]);

        $komponen = KomponenBiaya::findOrFail($validated['komponen_biaya_id']);

        $mhsQuery = Mahasiswa::with('beasiswaMahasiswas')
            ->where('status_mahasiswa', 'aktif');

        if (! empty($validated['program_studi_id']) && is_numeric($validated['program_studi_id'])) {
            $mhsQuery->where('program_studi_id', $validated['program_studi_id']);
        }

        if (! empty($validated['angkatan'])) {
            $mhsQuery->where('tahun_masuk', $validated['angkatan']);
        }

        $mahasiswas = $mhsQuery->get();
        $generatedCount = 0;

        DB::transaction(function () use ($mahasiswas, $komponen, $validated, &$generatedCount) {
            foreach ($mahasiswas as $mhs) {
                // Check if already billed
                $exists = Tagihan::where('mahasiswa_id', $mhs->id)
                    ->where('tahun_ajaran_id', $validated['tahun_ajaran_id'])
                    ->where('jenis', $komponen->kode)
                    ->exists();

                if ($exists) {
                    continue;
                }

                $nominal = (float) $komponen->nominal;

                // Check scholarship (if active scholarship and fee is tuition/spp/ukt)
                if (in_array(strtolower($komponen->kategori), ['akademik', 'spp', 'ukt']) && $mhs->beasiswaMahasiswas()->where('status', 'aktif')->exists()) {
                    // Full waiver for scholarship holders or standard nominal 0
                    $nominal = 0.00;
                }

                Tagihan::create([
                    'mahasiswa_id' => $mhs->id,
                    'tahun_ajaran_id' => $validated['tahun_ajaran_id'],
                    'jenis' => $komponen->kode,
                    'nominal' => $nominal,
                    'jatuh_tempo' => $validated['jatuh_tempo'],
                    'status' => $nominal == 0 ? 'lunas' : 'belum_lunas',
                ]);

                $generatedCount++;
            }
        });

        ActivityLogger::log('keuangan.tagihan.generate_massal', 'Tagihan', (int) $komponen->id, null, [
            'komponen' => $komponen->nama,
            'generated_count' => $generatedCount,
        ]);

        return back()->with('success', "Berhasil menggenerasi {$generatedCount} tagihan mahasiswa.");
    }
}
