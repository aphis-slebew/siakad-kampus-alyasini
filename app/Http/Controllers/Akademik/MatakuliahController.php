<?php

namespace App\Http\Controllers\Akademik;

use App\Http\Controllers\Controller;
use App\Models\Matakuliah;
use App\Models\ReferensiBiodata;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatakuliahController extends Controller
{
    public function index(): Response
    {
        $matakuliahs = Matakuliah::with(['bidangIlmu', 'prasyarats.matakuliahPrasyarat'])
            ->orderBy('kode')
            ->get();

        $bidangIlmus = ReferensiBiodata::where('tipe', 'bidang_ilmu')->get();

        return Inertia::render('akademik/matakuliah/index', [
            'matakuliahs' => $matakuliahs,
            'bidangIlmus' => $bidangIlmus,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', 'unique:matakuliahs,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'sks' => ['required', 'integer', 'min:1', 'max:6'],
            'jenis' => ['required', 'in:wajib,pilihan'],
            'bidang_ilmu_id' => ['nullable', 'exists:referensi_biodatas,id'],
        ], [
            'kode.required' => 'Kode matakuliah wajib diisi.',
            'kode.unique' => 'Kode matakuliah ini sudah digunakan.',
            'nama.required' => 'Nama matakuliah wajib diisi.',
            'sks.required' => 'Jumlah SKS wajib diisi.',
        ]);

        Matakuliah::create($validated);

        return back()->with('success', 'Matakuliah berhasil ditambahkan.');
    }

    public function update(Request $request, Matakuliah $matakuliah): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', 'unique:matakuliahs,kode,'.$matakuliah->id],
            'nama' => ['required', 'string', 'max:255'],
            'sks' => ['required', 'integer', 'min:1', 'max:6'],
            'jenis' => ['required', 'in:wajib,pilihan'],
            'bidang_ilmu_id' => ['nullable', 'exists:referensi_biodatas,id'],
        ]);

        $matakuliah->update($validated);

        return back()->with('success', 'Matakuliah berhasil diperbarui.');
    }

    public function destroy(Matakuliah $matakuliah): RedirectResponse
    {
        $matakuliah->delete();

        return back()->with('success', 'Matakuliah berhasil dihapus.');
    }
}
