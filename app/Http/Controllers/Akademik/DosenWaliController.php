<?php

namespace App\Http\Controllers\Akademik;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\DosenWali;
use App\Models\Mahasiswa;
use App\Models\ProgramStudi;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DosenWaliController extends Controller
{
    /**
     * Display a listing of academic advisors (Dosen Wali).
     */
    public function index(Request $request): Response
    {
        $tahunAjaranId = $request->input('tahun_ajaran_id')
            ?: (TahunAjaran::where('is_active', true)->first()?->id ?: TahunAjaran::latest()->first()?->id);
        $dosenId = $request->input('dosen_id');
        $prodiId = $request->input('program_studi_id');
        $search = $request->input('search');

        $query = DosenWali::with(['mahasiswa.programStudi', 'dosen.programStudi', 'tahunAjaran'])
            ->where('tahun_ajaran_id', $tahunAjaranId)
            ->latest('id');

        if ($dosenId && $dosenId !== 'all') {
            $query->where('dosen_id', $dosenId);
        }

        if ($prodiId && $prodiId !== 'all') {
            $query->whereHas('mahasiswa', fn ($q) => $q->where('program_studi_id', $prodiId));
        }

        if ($search) {
            $query->whereHas('mahasiswa', function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nim', 'like', "%{$search}%");
            });
        }

        $assignments = $query->paginate(20)->withQueryString();

        $dosens = Dosen::orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'nidn', 'program_studi_id']);
        $programStudis = ProgramStudi::all(['id', 'kode', 'nama']);
        $tahunAjarans = TahunAjaran::latest()->get(['id', 'nama', 'is_active']);

        // Mahasiswas without advisor in this active academic year
        $unassignedMahasiswas = Mahasiswa::where('status_mahasiswa', 'aktif')
            ->whereDoesntHave('dosenWalis', fn ($q) => $q->where('tahun_ajaran_id', $tahunAjaranId))
            ->orderBy('nama_lengkap')
            ->get(['id', 'nim', 'nama_lengkap', 'program_studi_id']);

        return Inertia::render('akademik/dosen-wali', [
            'assignments' => $assignments,
            'dosens' => $dosens,
            'programStudis' => $programStudis,
            'tahunAjarans' => $tahunAjarans,
            'unassignedMahasiswas' => $unassignedMahasiswas,
            'filters' => [
                'tahun_ajaran_id' => (int) $tahunAjaranId,
                'dosen_id' => $dosenId ?? 'all',
                'program_studi_id' => $prodiId ?? 'all',
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store new Dosen Wali assignment(s).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'dosen_id' => ['required', 'exists:dosens,id'],
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'mahasiswa_ids' => ['required', 'array', 'min:1'],
            'mahasiswa_ids.*' => ['exists:mahasiswas,id'],
        ], [
            'mahasiswa_ids.required' => 'Pilih minimal 1 mahasiswa untuk ditugaskan.',
        ]);

        $count = 0;
        foreach ($validated['mahasiswa_ids'] as $mhsId) {
            DosenWali::updateOrCreate(
                [
                    'mahasiswa_id' => $mhsId,
                    'tahun_ajaran_id' => $validated['tahun_ajaran_id'],
                ],
                [
                    'dosen_id' => $validated['dosen_id'],
                ]
            );
            $count++;
        }

        return back()->with('success', "Berhasil menugaskan {$count} mahasiswa ke Dosen Wali terpilih.");
    }

    /**
     * Rollover advisor assignments from previous academic year.
     */
    public function rollover(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'from_tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'to_tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id', 'different:from_tahun_ajaran_id'],
        ]);

        $previousAssignments = DosenWali::where('tahun_ajaran_id', $validated['from_tahun_ajaran_id'])->get();
        $copiedCount = 0;

        foreach ($previousAssignments as $assignment) {
            // Only copy if student is still active and doesn't have an assignment in target year
            $mhs = Mahasiswa::find($assignment->mahasiswa_id);
            if ($mhs && $mhs->status_mahasiswa === 'aktif') {
                DosenWali::firstOrCreate(
                    [
                        'mahasiswa_id' => $assignment->mahasiswa_id,
                        'tahun_ajaran_id' => $validated['to_tahun_ajaran_id'],
                    ],
                    [
                        'dosen_id' => $assignment->dosen_id,
                    ]
                );
                $copiedCount++;
            }
        }

        return back()->with('success', "Berhasil menyalin {$copiedCount} data penugasan dosen wali dari semester sebelumnya.");
    }

    /**
     * Remove the specified Dosen Wali assignment.
     */
    public function destroy(DosenWali $dosenWali): RedirectResponse
    {
        $dosenWali->delete();

        return back()->with('success', 'Penugasan Dosen Wali berhasil dihapus.');
    }
}
