<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\PasswordResetByAdminNotification;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    /**
     * Official mapping: each user_type -> allowed Spatie role(s).
     */
    private const USER_TYPE_ROLE_MAP = [
        'superadmin' => 'superadmin',
        'admin_akademik' => 'admin_akademik',
        'panitia_pmb' => 'panitia_pmb',
        'staf_keuangan' => 'staf_keuangan',
        'staf_kepegawaian' => 'staf_kepegawaian',
        'kaprodi' => 'kaprodi',
        'dosen' => 'dosen',
        'mahasiswa' => 'mahasiswa',
        'calon_mahasiswa' => 'calon_mahasiswa',
        'operator_kemahasiswaan' => 'operator_kemahasiswaan',
        'pegawai' => ['staf_keuangan', 'staf_kepegawaian', 'kaprodi', 'admin_akademik'],
    ];

    /**
     * Validate consistency between user_type and Spatie role.
     * Returns an error string if incompatible, or null if valid.
     */
    private function validateTypeRoleConsistency(string $userType, string $role): ?string
    {
        $allowedRoles = self::USER_TYPE_ROLE_MAP[$userType] ?? null;

        if ($allowedRoles === null) {
            return "Tipe pengguna '{$userType}' tidak valid dalam sistem.";
        }

        $allowed = is_array($allowedRoles) ? $allowedRoles : [$allowedRoles];

        if (! in_array($role, $allowed, true)) {
            $allowedStr = implode(', ', $allowed);

            return "Peran (role) '{$role}' tidak kompatibel dengan tipe pengguna '{$userType}'. Peran yang diizinkan: [{$allowedStr}].";
        }

        return null;
    }

    /**
     * Calculate user category stats with a single aggregated query.
     *
     * @return array{total: int, mahasiswa: int, dosen: int, pegawai: int, superadmin: int}
     */
    private function getTotalStats(): array
    {
        $counts = DB::table('users')
            ->selectRaw("
                COUNT(*) AS total,
                COUNT(CASE WHEN user_type = 'mahasiswa' THEN 1 END) AS mahasiswa,
                COUNT(CASE WHEN user_type = 'dosen' THEN 1 END) AS dosen,
                COUNT(CASE WHEN user_type IN ('pegawai', 'admin_akademik', 'staf_keuangan', 'panitia_pmb', 'staf_kepegawaian', 'kaprodi', 'operator_kemahasiswaan') THEN 1 END) AS pegawai,
                COUNT(CASE WHEN user_type = 'superadmin' THEN 1 END) AS superadmin
            ")
            ->first();

        return [
            'total' => (int) ($counts->total ?? 0),
            'mahasiswa' => (int) ($counts->mahasiswa ?? 0),
            'dosen' => (int) ($counts->dosen ?? 0),
            'pegawai' => (int) ($counts->pegawai ?? 0),
            'superadmin' => (int) ($counts->superadmin ?? 0),
        ];
    }

    /**
     * Display a listing of all users across the system.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');
        $statusFilter = $request->input('status');

        $query = User::with(['roles', 'mahasiswa.programStudi', 'dosen.programStudi', 'pegawai.unitKerja'])
            ->latest('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter && $roleFilter !== 'all') {
            $query->where(function ($q) use ($roleFilter) {
                $q->where('user_type', $roleFilter)
                    ->orWhereHas('roles', fn ($r) => $r->where('name', $roleFilter));
            });
        }

        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $users = $query->paginate(15)->withQueryString()->through(function ($user) {
            $identifier = '-';
            if ($user->mahasiswa) {
                $identifier = 'NIM: '.($user->mahasiswa->nim ?? '-');
            } elseif ($user->dosen) {
                $identifier = 'NIDN: '.($user->dosen->nidn ?? '-');
            } elseif ($user->pegawai) {
                $identifier = 'NIP: '.($user->pegawai->nip ?? '-');
            }

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'status' => $user->status ?? 'aktif',
                'roles' => $user->getRoleNames(),
                'identifier' => $identifier,
                'prodi_or_unit' => $user->mahasiswa?->programStudi?->nama
                    ?? $user->dosen?->programStudi?->nama
                    ?? $user->pegawai?->unitKerja?->nama
                    ?? '-',
                'created_at' => $user->created_at?->format('d M Y H:i') ?? '-',
            ];
        });

        $roles = Role::pluck('name');

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter ?? 'all',
                'status' => $statusFilter ?? 'all',
            ],
            'totalStats' => $this->getTotalStats(),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'user_type' => 'required|string|in:superadmin,admin_akademik,panitia_pmb,staf_keuangan,staf_kepegawaian,kaprodi,dosen,mahasiswa,calon_mahasiswa,operator_kemahasiswaan,pegawai',
            'role' => 'required|string|exists:roles,name',
            'status' => 'nullable|string|in:aktif,nonaktif,lulus,dropout,cuti',
        ]);

        $consistencyError = $this->validateTypeRoleConsistency($validated['user_type'], $validated['role']);
        if ($consistencyError) {
            return back()->withErrors(['role' => $consistencyError]);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'user_type' => $validated['user_type'],
            'status' => $validated['status'] ?? 'aktif',
            'email_verified_at' => now(),
        ]);

        $user->assignRole($validated['role']);

        ActivityLogger::log('user.create', 'User', $user->id, null, [
            'name' => $user->name,
            'email' => $user->email,
            'user_type' => $user->user_type,
            'role' => $validated['role'],
        ]);

        return back()->with('success', "Akun pengguna {$user->name} ({$validated['role']}) berhasil dibuat.");
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'user_type' => 'required|string',
            'role' => 'required|string|exists:roles,name',
            'status' => 'required|string|in:aktif,nonaktif,lulus,dropout,cuti',
        ]);

        $consistencyError = $this->validateTypeRoleConsistency($validated['user_type'], $validated['role']);
        if ($consistencyError) {
            return back()->withErrors(['role' => $consistencyError]);
        }

        $oldValues = [
            'name' => $user->name,
            'email' => $user->email,
            'user_type' => $user->user_type,
            'status' => $user->status,
            'roles' => $user->getRoleNames()->toArray(),
        ];

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'user_type' => $validated['user_type'],
            'status' => $validated['status'],
        ]);

        $user->syncRoles([$validated['role']]);

        ActivityLogger::log('user.update', 'User', $user->id, $oldValues, [
            'name' => $user->name,
            'email' => $user->email,
            'user_type' => $user->user_type,
            'status' => $user->status,
            'role' => $validated['role'],
        ]);

        return back()->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
    }

    /**
     * Reset password for a specific user.
     */
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        $user->notify(new PasswordResetByAdminNotification(
            resetByName: Auth::user()->name
        ));

        ActivityLogger::log('user.reset_password', 'User', $user->id, null, [
            'name' => $user->name,
            'email' => $user->email,
        ]);

        return back()->with('success', "Password pengguna {$user->name} berhasil di-reset. Notifikasi telah dikirim.");
    }

    /**
     * Impersonate (Login as) a specific user.
     */
    public function impersonate(Request $request, User $user): RedirectResponse
    {
        $currentAuth = Auth::user();

        if ($currentAuth->id === $user->id) {
            return back()->with('error', 'Anda sudah berada di akun ini.');
        }

        // Only store original impersonator if not already impersonating
        if (! $request->session()->has('impersonator_id')) {
            $request->session()->put('impersonator_id', $currentAuth->id);
            $request->session()->put('impersonator_name', $currentAuth->name);
        }

        ActivityLogger::log('user.impersonate', 'User', $user->id, [
            'impersonator_id' => $currentAuth->id,
            'impersonator_name' => $currentAuth->name,
        ], [
            'target_id' => $user->id,
            'target_name' => $user->name,
        ]);

        Auth::login($user);

        $roleName = $user->roles->first()?->name ?? $user->user_type;

        return redirect('/dashboard')->with('success', "Anda sekarang masuk sebagai {$user->name} ({$roleName}).");
    }

    /**
     * Leave impersonation and return to the original Superadmin account.
     *
     * NOTE: This method is intentionally NOT protected by role:superadmin middleware.
     * During an active impersonation session, the authenticated user is the TARGET user
     * (not the superadmin), so the superadmin middleware would block this route.
     * Security is maintained via session validation: the presence of 'impersonator_id'
     * in the session is the gate that controls access to this restoration flow.
     */
    public function leaveImpersonate(Request $request): RedirectResponse
    {
        if (! $request->session()->has('impersonator_id')) {
            return redirect('/dashboard');
        }

        $originalId = $request->session()->pull('impersonator_id');
        $originalName = $request->session()->pull('impersonator_name');

        $originalUser = User::find($originalId);

        if (! $originalUser) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')
                ->with('error', 'Sesi tidak valid. Akun administrator tidak ditemukan. Silakan login kembali.');
        }

        Auth::login($originalUser);

        ActivityLogger::log('user.leave_impersonate', 'User', $originalId, null, [
            'restored_user' => $originalName,
        ]);

        return redirect()->route('users.index')->with('success', 'Berhasil kembali ke akun Superadmin.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Tidak dapat menghapus akun yang sedang Anda gunakan.');
        }

        if ($user->hasRole('superadmin')) {
            $superadminCount = User::whereHas('roles', fn ($q) => $q->where('name', 'superadmin'))->count();
            if ($superadminCount <= 1) {
                return back()->with('error', 'Tidak dapat menghapus Superadmin terakhir pada sistem.');
            }
        }

        $oldValues = [
            'name' => $user->name,
            'email' => $user->email,
            'user_type' => $user->user_type,
        ];
        $userId = $user->id;
        $userName = $user->name;
        $user->delete();

        ActivityLogger::log('user.delete', 'User', $userId, $oldValues, null);

        return back()->with('success', "Akun pengguna {$userName} berhasil dihapus.");
    }
}
