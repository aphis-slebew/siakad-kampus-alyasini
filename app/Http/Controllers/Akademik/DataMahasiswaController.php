<?php

namespace App\Http\Controllers\Akademik;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\ProgramStudi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DataMahasiswaController extends Controller
{
    /**
     * Display a listing of students with filters.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $prodiId = $request->input('program_studi_id');
        $status = $request->input('status');
        $angkatan = $request->input('angkatan');

        $query = Mahasiswa::with(['programStudi', 'user'])
            ->latest('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('nim', 'ilike', "%{$search}%");
            });
        }

        if ($prodiId && $prodiId !== 'all') {
            $query->where('program_studi_id', $prodiId);
        }

        if ($status && $status !== 'all') {
            $query->where('status_mahasiswa', $status);
        }

        if ($angkatan && $angkatan !== 'all') {
            $query->where('tahun_masuk', $angkatan);
        }

        $mahasiswas = $query->paginate(15)->withQueryString();
        $programStudis = ProgramStudi::all(['id', 'kode', 'nama']);
        $angkatans = Mahasiswa::select('tahun_masuk')->distinct()->orderByDesc('tahun_masuk')->pluck('tahun_masuk');

        return Inertia::render('mahasiswa/index', [
            'mahasiswas' => $mahasiswas,
            'programStudis' => $programStudis,
            'angkatans' => $angkatans,
            'filters' => [
                'search' => $search,
                'program_studi_id' => $prodiId ?? 'all',
                'status' => $status ?? 'all',
                'angkatan' => $angkatan ?? 'all',
            ],
            'stats' => [
                'total' => Mahasiswa::count(),
                'aktif' => Mahasiswa::where('status_mahasiswa', 'aktif')->count(),
                'cuti' => Mahasiswa::where('status_mahasiswa', 'cuti')->count(),
                'lulus' => Mahasiswa::where('status_mahasiswa', 'lulus')->count(),
            ],
        ]);
    }

    /**
     * Display the specified student's complete academic record.
     */
    public function show(Mahasiswa $mahasiswa): Response
    {
        $mahasiswa->load([
            'programStudi.fakultas',
            'agama',
            'dataOrangTua',
            'statusAkademikHistoris.tahunAjaran',
            'dosenWalis' => function ($q) {
                $q->with('dosen')->latest('id');
            },
            'krss' => function ($q) {
                $q->with(['tahunAjaran', 'krsDetails.kelasKuliah.kurikulumMatakuliah.matakuliah'])->latest('id');
            },
            'tagihans' => function ($q) {
                $q->with(['tahunAjaran', 'pembayarans'])->latest('id');
            },
            'skripsis.dosenPembimbing',
            'yudisiums.periodeWisuda',
        ]);

        return Inertia::render('mahasiswa/show', [
            'mahasiswa' => $mahasiswa,
        ]);
    }
}
