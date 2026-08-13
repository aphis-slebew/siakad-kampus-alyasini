<?php

namespace App\Http\Controllers\Akademik;

use App\Http\Controllers\Controller;
use App\Models\EkivalensiMatakuliah;
use App\Models\KurikulumMatakuliah;
use App\Models\KurikulumProdi;
use App\Models\Matakuliah;
use App\Models\PrasyaratMatakuliah;
use App\Models\ProgramStudi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class KurikulumProdiController extends Controller
{
    public function index(): Response
    {
        $kurikulums = KurikulumProdi::with(['programStudi', 'kurikulumMatakuliahs.matakuliah'])
            ->orderBy('program_studi_id')
            ->orderByDesc('tahun_kurikulum')
            ->get();

        $programStudis = ProgramStudi::orderBy('nama')->get();
        $matakuliahs = Matakuliah::orderBy('nama')->get();

        return Inertia::render('akademik/kurikulum/index', [
            'kurikulums' => $kurikulums,
            'programStudis' => $programStudis,
            'matakuliahs' => $matakuliahs,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'program_studi_id' => ['required', 'exists:program_studis,id'],
            'tahun_kurikulum' => ['required', 'string', 'max:10'],
            'is_active' => ['boolean'],
        ]);

        $isActive = $request->boolean('is_active', true);

        DB::transaction(function () use ($validated, $isActive) {
            // ATURAN SAMA SEPERTI TAHUN AJARAN: Hanya 1 Kurikulum aktif per Program Studi
            if ($isActive) {
                KurikulumProdi::where('program_studi_id', $validated['program_studi_id'])
                    ->update(['is_active' => false]);
            }

            KurikulumProdi::create([
                'program_studi_id' => $validated['program_studi_id'],
                'tahun_kurikulum' => $validated['tahun_kurikulum'],
                'is_active' => $isActive,
            ]);
        });

        return back()->with('success', 'Kurikulum program studi berhasil ditambahkan.');
    }

    public function update(Request $request, KurikulumProdi $kurikulum): RedirectResponse
    {
        $validated = $request->validate([
            'program_studi_id' => ['required', 'exists:program_studis,id'],
            'tahun_kurikulum' => ['required', 'string', 'max:10'],
            'is_active' => ['boolean'],
        ]);

        $isActive = $request->boolean('is_active', $kurikulum->is_active);

        DB::transaction(function () use ($kurikulum, $validated, $isActive) {
            if ($isActive) {
                KurikulumProdi::where('program_studi_id', $validated['program_studi_id'])
                    ->where('id', '!=', $kurikulum->id)
                    ->update(['is_active' => false]);
            }

            $kurikulum->update([
                'program_studi_id' => $validated['program_studi_id'],
                'tahun_kurikulum' => $validated['tahun_kurikulum'],
                'is_active' => $isActive,
            ]);
        });

        return back()->with('success', 'Kurikulum program studi berhasil diperbarui.');
    }

    public function destroy(KurikulumProdi $kurikulum): RedirectResponse
    {
        $kurikulum->delete();

        return back()->with('success', 'Kurikulum program studi berhasil dihapus.');
    }

    public function addMatakuliah(Request $request, KurikulumProdi $kurikulum): RedirectResponse
    {
        $validated = $request->validate([
            'matakuliah_id' => ['required', 'exists:matakuliahs,id'],
            'semester' => ['required', 'integer', 'min:1', 'max:8'],
        ]);

        KurikulumMatakuliah::firstOrCreate([
            'kurikulum_prodi_id' => $kurikulum->id,
            'matakuliah_id' => $validated['matakuliah_id'],
        ], [
            'semester' => $validated['semester'],
        ]);

        return back()->with('success', 'Matakuliah berhasil ditambahkan ke kurikulum.');
    }

    public function removeMatakuliah(KurikulumMatakuliah $kurikulumMatakuliah): RedirectResponse
    {
        $kurikulumMatakuliah->delete();

        return back()->with('success', 'Matakuliah berhasil dihapus dari kurikulum.');
    }

    public function addPrasyarat(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'matakuliah_id' => ['required', 'exists:matakuliahs,id'],
            'matakuliah_prasyarat_id' => ['required', 'exists:matakuliahs,id', 'different:matakuliah_id'],
            'minimal_nilai' => ['required', 'in:A,B,C,D'],
        ]);

        PrasyaratMatakuliah::firstOrCreate([
            'matakuliah_id' => $validated['matakuliah_id'],
            'matakuliah_prasyarat_id' => $validated['matakuliah_prasyarat_id'],
        ], [
            'minimal_nilai' => $validated['minimal_nilai'],
        ]);

        return back()->with('success', 'Prasyarat matakuliah berhasil ditambahkan.');
    }

    public function addEkivalensi(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'matakuliah_lama_id' => ['required', 'exists:matakuliahs,id'],
            'matakuliah_baru_id' => ['required', 'exists:matakuliahs,id', 'different:matakuliah_lama_id'],
        ]);

        EkivalensiMatakuliah::firstOrCreate([
            'matakuliah_lama_id' => $validated['matakuliah_lama_id'],
            'matakuliah_baru_id' => $validated['matakuliah_baru_id'],
        ]);

        return back()->with('success', 'Ekivalensi matakuliah berhasil ditambahkan.');
    }
}
