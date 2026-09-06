<?php

namespace App\Http\Controllers\Kepegawaian;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\ProgramStudi;
use App\Models\RiwayatJabatanFungsional;
use App\Models\RiwayatPendidikanDosen;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DosenManagementController extends Controller
{
    /**
     * Tampilkan daftar data dosen lengkap beserta relasi homebase prodi & riwayat.
     */
    public function index(Request $request): Response
    {
        $query = Dosen::with(['programStudi', 'riwayatPendidikans', 'riwayatJabatanFungsionals', 'user'])
            ->latest('id');

        if ($request->filled('search')) {
            $search = '%'.strtolower(trim((string) $request->string('search'))).'%';
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(nama_lengkap) LIKE ?', [$search])
                    ->orWhereRaw('LOWER(email_pribadi) LIKE ?', [$search]);
            });
        }

        if ($request->filled('program_studi_id')) {
            $query->where('program_studi_id', $request->input('program_studi_id'));
        }

        if ($request->filled('jabatan_fungsional')) {
            $query->where('jabatan_fungsional_saat_ini', $request->input('jabatan_fungsional'));
        }

        if ($request->filled('status_kepegawaian')) {
            $query->where('status_kepegawaian', $request->input('status_kepegawaian'));
        }

        if ($request->filled('sertifikasi_pendidik')) {
            $query->where('sertifikasi_pendidik', $request->boolean('sertifikasi_pendidik'));
        }

        $dosens = $query->paginate(15)->withQueryString();
        $programStudis = ProgramStudi::orderBy('nama')->get(['id', 'kode', 'nama', 'jenjang']);

        return Inertia::render('kepegawaian/dosen/index', [
            'dosens' => $dosens,
            'programStudis' => $programStudis,
            'filters' => $request->only(['search', 'program_studi_id', 'jabatan_fungsional', 'status_kepegawaian', 'sertifikasi_pendidik']),
        ]);
    }

    /**
     * Simpan data dosen baru + pembuatan akun login jika dicentang.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:150',
            'gelar_depan' => 'nullable|string|max:30',
            'gelar_belakang' => 'nullable|string|max:30',
            'nidn' => 'nullable|string|max:30',
            'nik' => 'nullable|string|max:30',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'program_studi_id' => 'nullable|exists:program_studis,id',
            'alamat' => 'nullable|string',
            'no_hp' => 'nullable|string|max:25',
            'email_pribadi' => 'nullable|email|max:100',
            'jabatan_fungsional_saat_ini' => 'nullable|string|max:50',
            'status_kepegawaian' => 'required|in:tetap,tidak_tetap,dpk',
            'sertifikasi_pendidik' => 'boolean',
            'create_user_account' => 'boolean',
            'password' => 'nullable|string|min:8',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $userId = null;

            if ($request->boolean('create_user_account') && ! empty($validated['email_pribadi'])) {
                $user = User::create([
                    'name' => trim(($validated['gelar_depan'] ? $validated['gelar_depan'].' ' : '').$validated['nama_lengkap'].($validated['gelar_belakang'] ? ', '.$validated['gelar_belakang'] : '')),
                    'email' => $validated['email_pribadi'],
                    'password' => Hash::make($validated['password'] ?? 'password'),
                    'user_type' => 'dosen',
                    'email_verified_at' => now(),
                ]);

                $user->assignRole('dosen');
                $userId = $user->id;
            }

            unset($validated['create_user_account'], $validated['password']);
            $validated['user_id'] = $userId;

            $dosen = Dosen::create($validated);

            ActivityLogger::log('kepegawaian.dosen.create', 'Dosen', $dosen->id, null, [
                'nama_lengkap' => $dosen->nama_lengkap,
                'nidn' => $dosen->nidn,
                'program_studi_id' => $dosen->program_studi_id,
            ]);
        });

        return back()->with('success', 'Data dosen berhasil ditambahkan.');
    }

    /**
     * Update data dosen.
     */
    public function update(Request $request, Dosen $dosen): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:150',
            'gelar_depan' => 'nullable|string|max:30',
            'gelar_belakang' => 'nullable|string|max:30',
            'nidn' => 'nullable|string|max:30',
            'nik' => 'nullable|string|max:30',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'program_studi_id' => 'nullable|exists:program_studis,id',
            'alamat' => 'nullable|string',
            'no_hp' => 'nullable|string|max:25',
            'email_pribadi' => 'nullable|email|max:100',
            'jabatan_fungsional_saat_ini' => 'nullable|string|max:50',
            'status_kepegawaian' => 'required|in:tetap,tidak_tetap,dpk',
            'sertifikasi_pendidik' => 'boolean',
        ]);

        $oldData = [
            'nama_lengkap' => $dosen->nama_lengkap,
            'program_studi_id' => $dosen->program_studi_id,
            'status_kepegawaian' => $dosen->status_kepegawaian,
        ];

        $dosen->update($validated);

        if ($dosen->user) {
            $dosen->user->update([
                'name' => trim(($validated['gelar_depan'] ? $validated['gelar_depan'].' ' : '').$validated['nama_lengkap'].($validated['gelar_belakang'] ? ', '.$validated['gelar_belakang'] : '')),
                'email' => $validated['email_pribadi'] ?? $dosen->user->email,
            ]);
        }

        ActivityLogger::log('kepegawaian.dosen.update', 'Dosen', $dosen->id, $oldData, [
            'nama_lengkap' => $dosen->nama_lengkap,
            'program_studi_id' => $dosen->program_studi_id,
            'status_kepegawaian' => $dosen->status_kepegawaian,
        ]);

        return back()->with('success', 'Data dosen berhasil diperbarui.');
    }

    /**
     * Hapus data dosen (soft delete).
     */
    public function destroy(Dosen $dosen): RedirectResponse
    {
        if ($dosen->dosenWalis()->exists()) {
            return back()->with('error', 'Dosen tidak dapat dihapus karena masih ditugaskan sebagai Dosen Wali untuk mahasiswa aktif.');
        }

        if ($dosen->dosenPengajars()->exists()) {
            return back()->with('error', 'Dosen tidak dapat dihapus karena masih tercatat sebagai dosen pengajar pada kelas kuliah.');
        }

        if ($dosen->skripsis()->exists() || $dosen->proposalSkripsis()->exists()) {
            return back()->with('error', 'Dosen tidak dapat dihapus karena masih membimbing proposal atau skripsi mahasiswa.');
        }

        DB::transaction(function () use ($dosen) {
            if ($dosen->user) {
                $dosen->user->update(['status' => 'nonaktif']);
            }

            ActivityLogger::log('kepegawaian.dosen.delete', 'Dosen', $dosen->id, [
                'nama_lengkap' => $dosen->nama_lengkap,
                'nidn' => $dosen->nidn,
            ], null);

            $dosen->delete();
        });

        return back()->with('success', 'Data dosen berhasil dihapus.');
    }

    /**
     * Tambah riwayat pendidikan dosen.
     */
    public function storePendidikan(Request $request, Dosen $dosen): RedirectResponse
    {
        $validated = $request->validate([
            'jenjang' => 'required|in:D3,D4,S1,S2,S3,Profesi',
            'institusi' => 'required|string|max:150',
            'program_studi' => 'required|string|max:150',
            'tahun_lulus' => 'required|integer|min:1950|max:'.(date('Y') + 1),
        ]);

        $dosen->riwayatPendidikans()->create($validated);

        return back()->with('success', 'Riwayat pendidikan berhasil ditambahkan.');
    }

    /**
     * Hapus riwayat pendidikan dosen.
     */
    public function destroyPendidikan(Dosen $dosen, RiwayatPendidikanDosen $pendidikan): RedirectResponse
    {
        if ($pendidikan->dosen_id !== $dosen->id) {
            abort(403);
        }

        $pendidikan->delete();

        return back()->with('success', 'Riwayat pendidikan berhasil dihapus.');
    }

    /**
     * Tambah riwayat jabatan fungsional dosen & perbarui status jabatan terkini.
     */
    public function storeJabatan(Request $request, Dosen $dosen): RedirectResponse
    {
        $validated = $request->validate([
            'jabatan' => 'required|in:Tenaga Pengajar,Asisten Ahli,Lektor,Lektor Kepala,Guru Besar',
            'tmt' => 'required|date',
            'nomor_sk' => 'nullable|string|max:100',
        ]);

        DB::transaction(function () use ($dosen, $validated) {
            $dosen->riwayatJabatanFungsionals()->create($validated);

            // Update jabatan fungsional terkini
            $dosen->update([
                'jabatan_fungsional_saat_ini' => $validated['jabatan'],
            ]);
        });

        return back()->with('success', 'Riwayat jabatan fungsional berhasil ditambahkan.');
    }

    /**
     * Hapus riwayat jabatan fungsional dosen.
     */
    public function destroyJabatan(Dosen $dosen, RiwayatJabatanFungsional $jabatan): RedirectResponse
    {
        if ($jabatan->dosen_id !== $dosen->id) {
            abort(403);
        }

        $jabatan->delete();

        return back()->with('success', 'Riwayat jabatan fungsional berhasil dihapus.');
    }
}
