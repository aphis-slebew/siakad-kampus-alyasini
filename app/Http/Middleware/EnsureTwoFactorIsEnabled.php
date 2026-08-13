<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactorIsEnabled
{
    /**
     * Whitelist of route names allowed when setting up 2FA or authenticating.
     */
    protected array $whitelistedRoutes = [
        'security.edit',
        'user-password.update',
        'two-factor.enable',
        'two-factor.confirm',
        'two-factor.disable',
        'two-factor.qr-code',
        'two-factor.secret-key',
        'two-factor.recovery-codes',
        'two-factor.regenerate-recovery-codes',
        'password.confirm',
        'password.confirmation',
        'password.confirm.store',
        'logout',
    ];

    /**
     * Handle an incoming request according to 04-Security.md §1.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Mandatory 2FA enforcement strictly for Superadmin and Admin Akademik roles
        $isPrivilegedRole = $user->hasRole('superadmin') || $user->hasRole('admin_akademik');

        if ($isPrivilegedRole && ! $user->two_factor_secret) {
            $routeName = $request->route()?->getName();

            if (! in_array($routeName, $this->whitelistedRoutes, true)) {
                return redirect()->route('security.edit')->with('warning', 'Akun dengan hak akses Superadmin/Admin Akademik wajib mengaktifkan Verifikasi 2 Langkah (2FA) sebelum mengakses fitur sistem.');
            }
        }

        return $next($request);
    }
}
