<?php

namespace App\Http\Controllers\Pmb;

use App\Http\Controllers\Controller;
use App\Models\GelombangPendaftaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GelombangPendaftaranController extends Controller
{
    public function index(): Response
    {
        $gelombangs = GelombangPendaftaran::withCount('calonMahasiswas')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('pmb/gelombang/index', [
            'gelombangs' => $gelombangs,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'mulai_pendaftaran' => ['required', 'date'],
            'selesai_pendaftaran' => ['required', 'date', 'after_or_equal:mulai_pendaftaran'],
            'kuota' => ['required', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);

        if (! empty($validated['is_active'])) {
            GelombangPendaftaran::query()->update(['is_active' => false]);
        }

        GelombangPendaftaran::create($validated);

        return back()->with('success', 'Gelombang pendaftaran berhasil ditambahkan.');
    }

    public function update(Request $request, GelombangPendaftaran $gelombang): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'mulai_pendaftaran' => ['required', 'date'],
            'selesai_pendaftaran' => ['required', 'date', 'after_or_equal:mulai_pendaftaran'],
            'kuota' => ['required', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);

        if (! empty($validated['is_active'])) {
            GelombangPendaftaran::where('id', '!=', $gelombang->id)->update(['is_active' => false]);
        }

        $gelombang->update($validated);

        return back()->with('success', 'Gelombang pendaftaran berhasil diperbarui.');
    }

    public function destroy(GelombangPendaftaran $gelombang): RedirectResponse
    {
        if ($gelombang->calonMahasiswas()->exists()) {
            return back()->with('error', 'Gelombang pendaftaran tidak dapat dihapus karena sudah memiliki calon mahasiswa terdaftar.');
        }

        $gelombang->delete();

        return back()->with('success', 'Gelombang pendaftaran berhasil dihapus.');
    }
}
