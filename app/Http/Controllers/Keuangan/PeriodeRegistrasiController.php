<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\PeriodeRegistrasi;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeriodeRegistrasiController extends Controller
{
    public function index(): Response
    {
        $periodes = PeriodeRegistrasi::with('tahunAjaran')
            ->orderByDesc('id')
            ->get();

        $tahunAjarans = TahunAjaran::orderByDesc('id')->get();

        return Inertia::render('registrasi-ulang/periode/index', [
            'periodes' => $periodes,
            'tahunAjarans' => $tahunAjarans,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'jenis' => ['required', 'in:mahasiswa_baru,mahasiswa_lama'],
            'mulai' => ['required', 'date'],
            'selesai' => ['required', 'date', 'after_or_equal:mulai'],
        ], [
            'tahun_ajaran_id.required' => 'Tahun ajaran wajib dipilih.',
            'jenis.required' => 'Jenis periode registrasi wajib dipilih.',
            'mulai.required' => 'Tanggal mulai wajib diisi.',
            'selesai.required' => 'Tanggal selesai wajib diisi.',
            'selesai.after_or_equal' => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
        ]);

        PeriodeRegistrasi::create($validated);

        return back()->with('success', 'Periode registrasi ulang berhasil ditambahkan.');
    }

    public function update(Request $request, PeriodeRegistrasi $periode): RedirectResponse
    {
        $validated = $request->validate([
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'jenis' => ['required', 'in:mahasiswa_baru,mahasiswa_lama'],
            'mulai' => ['required', 'date'],
            'selesai' => ['required', 'date', 'after_or_equal:mulai'],
        ]);

        $periode->update($validated);

        return back()->with('success', 'Periode registrasi ulang berhasil diperbarui.');
    }

    public function destroy(PeriodeRegistrasi $periode): RedirectResponse
    {
        $periode->delete();

        return back()->with('success', 'Periode registrasi ulang berhasil dihapus.');
    }
}
