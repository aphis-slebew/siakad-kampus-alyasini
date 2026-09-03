<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\RuangKuliah;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RuangKuliahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $ruangKuliahs = RuangKuliah::orderBy('kode')->get();

        return Inertia::render('master/ruang-kuliah/index', [
            'ruangKuliahs' => $ruangKuliahs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:20', 'unique:ruang_kuliahs,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'kapasitas' => ['required', 'integer', 'min:1'],
        ], [
            'kode.required' => 'Kode ruang kuliah wajib diisi.',
            'kode.unique' => 'Kode ruang kuliah sudah digunakan.',
            'nama.required' => 'Nama ruang kuliah wajib diisi.',
            'kapasitas.required' => 'Kapasitas wajib diisi.',
            'kapasitas.min' => 'Kapasitas minimal 1 orang.',
        ]);

        $ruang = RuangKuliah::create($validated);

        ActivityLogger::log('master.ruang_kuliah.create', 'RuangKuliah', $ruang->id, null, $validated);

        return back()->with('success', 'Ruang kuliah berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RuangKuliah $ruangKuliah): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:20', 'unique:ruang_kuliahs,kode,'.$ruangKuliah->id],
            'nama' => ['required', 'string', 'max:255'],
            'kapasitas' => ['required', 'integer', 'min:1'],
        ], [
            'kode.required' => 'Kode ruang kuliah wajib diisi.',
            'kode.unique' => 'Kode ruang kuliah sudah digunakan.',
            'nama.required' => 'Nama ruang kuliah wajib diisi.',
            'kapasitas.required' => 'Kapasitas wajib diisi.',
            'kapasitas.min' => 'Kapasitas minimal 1 orang.',
        ]);

        $oldValues = $ruangKuliah->only(['kode', 'nama', 'kapasitas']);
        $ruangKuliah->update($validated);

        ActivityLogger::log('master.ruang_kuliah.update', 'RuangKuliah', $ruangKuliah->id, $oldValues, $validated);

        return back()->with('success', 'Ruang kuliah berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RuangKuliah $ruangKuliah): RedirectResponse
    {
        if ($ruangKuliah->jadwalPerkuliahans()->exists()) {
            return back()->withErrors(['error' => 'Ruang kuliah "'.$ruangKuliah->nama.'" tidak dapat dihapus karena masih digunakan dalam jadwal perkuliahan.']);
        }

        $oldValues = $ruangKuliah->only(['kode', 'nama', 'kapasitas']);
        $id = $ruangKuliah->id;
        $ruangKuliah->delete();

        ActivityLogger::log('master.ruang_kuliah.delete', 'RuangKuliah', $id, $oldValues, null);

        return back()->with('success', 'Ruang kuliah berhasil dihapus.');
    }
}
