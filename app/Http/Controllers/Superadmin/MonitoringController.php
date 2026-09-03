<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Dosen;
use App\Models\KelasKuliah;
use App\Models\Krs;
use App\Models\Mahasiswa;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MonitoringController extends Controller
{
    /**
     * Display Superadmin System Monitoring & Audit Log dashboard.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $actionFilter = $request->input('action');

        $query = ActivityLog::with('user')->latest('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'ilike', "%{$search}%")
                    ->orWhere('entity_type', 'ilike', "%{$search}%")
                    ->orWhere('ip_address', 'ilike', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'ilike', "%{$search}%"));
            });
        }

        if ($actionFilter && $actionFilter !== 'all') {
            $query->where('action', $actionFilter);
        }

        $logs = $query->paginate(20)->withQueryString();

        // Database entity counts
        $dbStats = [
            'total_users' => User::count(),
            'total_mahasiswa' => Mahasiswa::count(),
            'total_dosen' => Dosen::count(),
            'total_kelas' => KelasKuliah::count(),
            'total_krs' => Krs::count(),
            'total_tagihan' => Tagihan::count(),
            'total_pembayaran' => Pembayaran::count(),
            'total_logs' => ActivityLog::count(),
        ];

        // Queue status
        $queueStats = [
            'pending_jobs' => DB::table('jobs')->count(),
            'failed_jobs' => DB::table('failed_jobs')->count(),
        ];

        // Server runtime environment
        $systemInfo = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'app_env' => config('app.env'),
            'app_debug' => config('app.debug'),
            'db_connection' => config('database.default'),
            'cache_driver' => config('cache.default'),
            'queue_driver' => config('queue.default'),
        ];

        return Inertia::render('superadmin/monitoring', [
            'logs' => $logs,
            'dbStats' => $dbStats,
            'queueStats' => $queueStats,
            'systemInfo' => $systemInfo,
            'filters' => [
                'search' => $search,
                'action' => $actionFilter ?? 'all',
            ],
        ]);
    }
}
