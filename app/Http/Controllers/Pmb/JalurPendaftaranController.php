<?php

namespace App\Http\Controllers\Pmb;

use App\Http\Controllers\Controller;
use App\Models\JalurPendaftaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JalurPendaftaranController extends Controller
{
    public function index(): Response
    {
        $jalurs = JalurPendaftaran::orderBy('id')->get();

        return Inertia::render('pmb/jalur/index', [
            'jalurs' => $jalurs,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'biaya_pendaftaran' => ['required', 'numeric', 'min:0'],
        ], [
            'nama.required' => 'Nama jalur pendaftaran wajib diisi.',
            'biaya_pendaftaran.required' => 'Biaya pendaftaran wajib diisi.',
        ]);

        JalurPendaftaran::create($validated);

        return back()->with('success', 'Jalur pendaftaran berhasil ditambahkan.');
    }

    public function update(Request $request, JalurPendaftaran $jalur): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'biaya_pendaftaran' => ['required', 'numeric', 'min:0'],
        ], [
            'nama.required' => 'Nama jalur pendaftaran wajib diisi.',
            'biaya_pendaftaran.required' => 'Biaya pendaftaran wajib diisi.',
        ]);

        $jalur->update($validated);

        return back()->with('success', 'Jalur pendaftaran berhasil diperbarui.');
    }

    public function destroy(JalurPendaftaran $jalur): RedirectResponse
    {
        if ($jalur->calonMahasiswas()->exists()) {
            return back()->with('error', 'Jalur pendaftaran tidak dapat dihapus karena sudah memiliki calon mahasiswa terdaftar.');
        }

        $jalur->delete();

        return back()->with('success', 'Jalur pendaftaran berhasil dihapus.');
    }
}
