<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\TahunAjaran;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TahunAjaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $query = TahunAjaran::query()->orderByDesc('mulai');

        if ($search) {
            $query->where('nama', 'ilike', "%{$search}%");
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $tahunAjarans = $query->get();

        return Inertia::render('master/tahun-ajaran/index', [
            'tahunAjarans' => $tahunAjarans,
            'filters' => [
                'search' => $search,
                'status' => $status ?? 'all',
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'mulai' => ['required', 'date'],
            'selesai' => ['required', 'date', 'after_or_equal:mulai'],
            'is_active' => ['boolean'],
            'krs_mulai' => ['nullable', 'date'],
            'krs_selesai' => ['nullable', 'date'],
            'krs_batal_tambah_mulai' => ['nullable', 'date'],
            'krs_batal_tambah_selesai' => ['nullable', 'date'],
            'penilaian_mulai' => ['nullable', 'date'],
            'penilaian_selesai' => ['nullable', 'date'],
            'pembayaran_mulai' => ['nullable', 'date'],
            'pembayaran_selesai' => ['nullable', 'date'],
            'uts_mulai' => ['nullable', 'date'],
            'uts_selesai' => ['nullable', 'date'],
            'uas_mulai' => ['nullable', 'date'],
            'uas_selesai' => ['nullable', 'date'],
        ], [
            'nama.required' => 'Nama tahun ajaran wajib diisi.',
            'mulai.required' => 'Tanggal mulai wajib diisi.',
            'selesai.required' => 'Tanggal selesai wajib diisi.',
            'selesai.after_or_equal' => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
        ]);

        if (! empty($validated['is_active'])) {
            TahunAjaran::query()->update(['is_active' => false]);
        }

        $tahunAjaran = TahunAjaran::create($validated);

        ActivityLogger::log('master.tahun_ajaran.create', 'TahunAjaran', $tahunAjaran->id, null, $validated);

        return back()->with('success', 'Tahun ajaran & periode akademik berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TahunAjaran $tahunAjaran): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'mulai' => ['required', 'date'],
            'selesai' => ['required', 'date', 'after_or_equal:mulai'],
            'is_active' => ['boolean'],
            'krs_mulai' => ['nullable', 'date'],
            'krs_selesai' => ['nullable', 'date'],
            'krs_batal_tambah_mulai' => ['nullable', 'date'],
            'krs_batal_tambah_selesai' => ['nullable', 'date'],
            'penilaian_mulai' => ['nullable', 'date'],
            'penilaian_selesai' => ['nullable', 'date'],
            'pembayaran_mulai' => ['nullable', 'date'],
            'pembayaran_selesai' => ['nullable', 'date'],
            'uts_mulai' => ['nullable', 'date'],
            'uts_selesai' => ['nullable', 'date'],
            'uas_mulai' => ['nullable', 'date'],
            'uas_selesai' => ['nullable', 'date'],
        ], [
            'nama.required' => 'Nama tahun ajaran wajib diisi.',
            'mulai.required' => 'Tanggal mulai wajib diisi.',
            'selesai.required' => 'Tanggal selesai wajib diisi.',
            'selesai.after_or_equal' => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
        ]);

        if (! empty($validated['is_active'])) {
            TahunAjaran::where('id', '!=', $tahunAjaran->id)->update(['is_active' => false]);
        }

        $oldValues = $tahunAjaran->toArray();
        $tahunAjaran->update($validated);

        ActivityLogger::log('master.tahun_ajaran.update', 'TahunAjaran', $tahunAjaran->id, $oldValues, $validated);

        return back()->with('success', 'Tahun ajaran & periode akademik berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TahunAjaran $tahunAjaran): RedirectResponse
    {
        if ($tahunAjaran->is_active) {
            return back()->with('error', 'Tahun ajaran aktif tidak dapat dihapus. Silakan aktifkan tahun ajaran lain terlebih dahulu.');
        }

        if ($tahunAjaran->kelasKuliahs()->exists()) {
            return back()->with('error', 'Tahun ajaran tidak dapat dihapus karena sudah memiliki kelas perkuliahan terdaftar.');
        }

        if ($tahunAjaran->krss()->exists()) {
            return back()->with('error', 'Tahun ajaran tidak dapat dihapus karena sudah memiliki data KRS mahasiswa.');
        }

        $oldValues = $tahunAjaran->toArray();
        $id = $tahunAjaran->id;
        $tahunAjaran->delete();

        ActivityLogger::log('master.tahun_ajaran.delete', 'TahunAjaran', $id, $oldValues, null);

        return back()->with('success', 'Tahun ajaran berhasil dihapus.');
    }
}
