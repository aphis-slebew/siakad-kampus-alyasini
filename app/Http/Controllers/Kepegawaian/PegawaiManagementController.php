<?php

namespace App\Http\Controllers\Kepegawaian;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\UnitKerja;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PegawaiManagementController extends Controller
{
    /**
     * Tampilkan daftar pegawai staf non-dosen beserta penempatan unit kerja.
     */
    public function index(Request $request): Response
    {
        $query = Pegawai::with(['unitKerja', 'user'])->latest('id');

        if ($request->filled('search')) {
            $search = '%'.strtolower(trim((string) $request->string('search'))).'%';
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(nama_lengkap) LIKE ?', [$search])
                    ->orWhereRaw('LOWER(nip_internal) LIKE ?', [$search]);
            });
        }

        if ($request->filled('unit_kerja_id')) {
            $query->where('unit_kerja_id', $request->input('unit_kerja_id'));
        }

        if ($request->filled('status_kepegawaian')) {
            $query->where('status_kepegawaian', $request->input('status_kepegawaian'));
        }

        $pegawais = $query->paginate(15)->withQueryString();
        $unitKerjas = UnitKerja::orderBy('nama')->get(['id', 'kode', 'nama']);

        return Inertia::render('kepegawaian/pegawai/index', [
            'pegawais' => $pegawais,
            'unitKerjas' => $unitKerjas,
            'filters' => $request->only(['search', 'unit_kerja_id', 'status_kepegawaian']),
        ]);
    }

    /**
     * Simpan data pegawai baru + pembuatan akun user login jika dipilih.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:150',
            'nip_internal' => 'nullable|string|max:30',
            'nik' => 'nullable|string|max:30',
            'unit_kerja_id' => 'nullable|exists:unit_kerjas,id',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'alamat' => 'nullable|string',
            'no_hp' => 'nullable|string|max:25',
            'jabatan_struktural' => 'nullable|string|max:100',
            'status_kepegawaian' => 'required|in:tetap,kontrak,honorer',
            'create_user_account' => 'boolean',
            'email' => 'nullable|email|max:100|unique:users,email',
            'user_role' => 'nullable|in:staf_kepegawaian,staf_keuangan,panitia_pmb,operator_kemahasiswaan,admin_akademik',
            'password' => 'nullable|string|min:8',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $userId = null;

            if ($request->boolean('create_user_account') && ! empty($validated['email'])) {
                $user = User::create([
                    'name' => $validated['nama_lengkap'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password'] ?? 'password'),
                    'user_type' => 'pegawai',
                    'email_verified_at' => now(),
                ]);

                if (! empty($validated['user_role'])) {
                    $user->assignRole($validated['user_role']);
                }

                $userId = $user->id;
            }

            unset($validated['create_user_account'], $validated['email'], $validated['user_role'], $validated['password']);
            $validated['user_id'] = $userId;

            Pegawai::create($validated);
        });

        return back()->with('success', 'Data pegawai berhasil ditambahkan.');
    }

    /**
     * Update data pegawai.
     */
    public function update(Request $request, Pegawai $pegawai): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:150',
            'nip_internal' => 'nullable|string|max:30',
            'nik' => 'nullable|string|max:30',
            'unit_kerja_id' => 'nullable|exists:unit_kerjas,id',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'alamat' => 'nullable|string',
            'no_hp' => 'nullable|string|max:25',
            'jabatan_struktural' => 'nullable|string|max:100',
            'status_kepegawaian' => 'required|in:tetap,kontrak,honorer',
        ]);

        $pegawai->update($validated);

        if ($pegawai->user) {
            $pegawai->user->update([
                'name' => $validated['nama_lengkap'],
            ]);
        }

        return back()->with('success', 'Data pegawai berhasil diperbarui.');
    }

    /**
     * Hapus data pegawai (soft delete).
     */
    public function destroy(Pegawai $pegawai): RedirectResponse
    {
        $pegawai->delete();

        return back()->with('success', 'Data pegawai berhasil dihapus.');
    }
}
