import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    Database,
    Filter,
    HardDrive,
    Layers,
    RefreshCw,
    Search,
    Server,
    Shield,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type LogItem = {
    id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    new_values?: Record<string, unknown> | null;
};

type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function SuperadminMonitoring({
    logs,
    dbStats = {
        total_users: 0,
        total_mahasiswa: 0,
        total_dosen: 0,
        total_kelas: 0,
        total_krs: 0,
        total_tagihan: 0,
        total_pembayaran: 0,
        total_logs: 0,
    },
    queueStats = { pending_jobs: 0, failed_jobs: 0 },
    systemInfo = {
        php_version: '-',
        laravel_version: '-',
        app_env: 'local',
        app_debug: true,
        db_connection: 'pgsql',
        cache_driver: 'file',
        queue_driver: 'database',
    },
    filters = {},
}: {
    logs?: ({ data: LogItem[] } & PaginationMeta) | null;
    dbStats?: {
        total_users: number;
        total_mahasiswa: number;
        total_dosen: number;
        total_kelas: number;
        total_krs: number;
        total_tagihan: number;
        total_pembayaran: number;
        total_logs: number;
    };
    queueStats?: { pending_jobs: number; failed_jobs: number };
    systemInfo?: {
        php_version: string;
        laravel_version: string;
        app_env: string;
        app_debug: boolean;
        db_connection: string;
        cache_driver: string;
        queue_driver: string;
    };
    filters?: { search?: string; action?: string };
}) {
    const safeLogs = logs || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0, from: null, to: null, links: [] };
    const safeDbStats = dbStats || { total_users: 0, total_mahasiswa: 0, total_dosen: 0, total_kelas: 0, total_krs: 0, total_tagihan: 0, total_pembayaran: 0, total_logs: 0 };
    const safeQueueStats = queueStats || { pending_jobs: 0, failed_jobs: 0 };
    const safeSystemInfo = systemInfo || { php_version: '-', laravel_version: '-', app_env: 'local', app_debug: true, db_connection: 'pgsql', cache_driver: 'file', queue_driver: 'database' };
    const safeFilters = filters || {};

    const [searchQuery, setSearchQuery] = useState(safeFilters.search || '');
    const [actionFilter, setActionFilter] = useState(safeFilters.action || 'all');

    const getActionBadgeColor = (action: string) => {
        const lower = action.toLowerCase();

        if (lower.includes('delete') || lower.includes('destroy') || lower.includes('reject')) {
            return 'bg-rose-50 text-rose-700 border-rose-200';
        }

        if (lower.includes('create') || lower.includes('store') || lower.includes('approve') || lower.includes('complete')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }

        if (lower.includes('update') || lower.includes('edit') || lower.includes('modify')) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }

        if (lower.includes('impersonate') || lower.includes('login') || lower.includes('auth')) {
            return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        }

        return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    const handleApplyFilter = (overrideAction?: string) => {
        const targetAction = overrideAction !== undefined ? overrideAction : actionFilter;
        router.get(
            '/superadmin/monitoring',
            {
                search: searchQuery || undefined,
                action: targetAction !== 'all' ? targetAction : undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    return (
        <>
            <Head title="Monitoring & Audit Log Sistem" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                            <Activity className="size-6 sm:size-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Monitoring & Audit Log Sistem
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Pemantauan kesehatan runtime server, statistik basis data, antrean queue, dan jejak aktivitas admin.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button asChild size="sm" variant="outline" className="text-xs border-slate-300 hover:bg-slate-50 h-9">
                            <Link href="/pddikti">
                                <RefreshCw className="size-3.5 mr-1.5 text-emerald-600" />
                                PD-DIKTI Feeder
                            </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="text-xs border-slate-300 hover:bg-slate-50 h-9">
                            <Link href="/settings/system-configs">
                                <Shield className="size-3.5 mr-1.5 text-emerald-600" />
                                Konfigurasi Sistem
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* System Environment & Queue Health */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-slate-200 bg-white p-4 shadow-xs border-t-2 border-t-emerald-600 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <Server className="size-4 text-emerald-600" />
                                Runtime Environment
                            </span>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                                {systemInfo.app_env}
                            </Badge>
                        </div>
                        <div className="mt-3 space-y-2 text-xs text-slate-600">
                            <div className="flex justify-between"><span>PHP Version:</span> <b className="text-slate-900 font-mono">{systemInfo.php_version}</b></div>
                            <div className="flex justify-between"><span>Laravel Framework:</span> <b className="text-slate-900 font-mono">v{systemInfo.laravel_version}</b></div>
                            <div className="flex justify-between"><span>Database:</span> <b className="text-slate-900 uppercase font-mono">{systemInfo.db_connection}</b></div>
                        </div>
                    </Card>

                    <Card className="border-slate-200 bg-white p-4 shadow-xs border-t-2 border-t-blue-600 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <Layers className="size-4 text-blue-600" />
                                Queue & Background Jobs
                            </span>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold bg-blue-50 text-blue-700 border-blue-200 font-mono">
                                {systemInfo.queue_driver}
                            </Badge>
                        </div>
                        <div className="mt-3 space-y-2 text-xs text-slate-600">
                            <div className="flex justify-between"><span>Pending Jobs:</span> <b className="text-emerald-700 font-bold">{queueStats.pending_jobs} antrean</b></div>
                            <div className="flex justify-between"><span>Failed Jobs:</span> <b className={queueStats.failed_jobs > 0 ? 'text-rose-600 font-bold' : 'text-slate-900 font-bold'}>{queueStats.failed_jobs} tugas</b></div>
                            <div className="flex justify-between"><span>Cache Store:</span> <b className="text-slate-900 uppercase font-mono">{systemInfo.cache_driver}</b></div>
                        </div>
                    </Card>

                    <Card className="border-slate-200 bg-white p-4 shadow-xs border-t-2 border-t-amber-600 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <Database className="size-4 text-amber-600" />
                                Record Basis Data
                            </span>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold bg-amber-50 text-amber-700 border-amber-200 font-mono">
                                {safeDbStats.total_logs} Logs
                            </Badge>
                        </div>
                        <div className="mt-3 space-y-2 text-xs text-slate-600">
                            <div className="flex justify-between"><span>Total Pengguna:</span> <b className="text-slate-900 font-bold">{dbStats.total_users} akun</b></div>
                            <div className="flex justify-between"><span>Mahasiswa / Dosen:</span> <b className="text-slate-900 font-bold">{dbStats.total_mahasiswa} / {dbStats.total_dosen}</b></div>
                            <div className="flex justify-between"><span>Kelas / KRS:</span> <b className="text-slate-900 font-bold">{dbStats.total_kelas} / {dbStats.total_krs}</b></div>
                        </div>
                    </Card>
                </div>

                {/* Filter & Activity Logs Table */}
                <Card className="border-slate-200 bg-white overflow-hidden shadow-xs border-t-2 border-t-emerald-600">
                    <CardHeader className="pb-3 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                            <Activity className="size-4 text-emerald-600" />
                            Log Audit & Riwayat Aktivitas Sistem ({safeDbStats.total_logs} Log Terdata)
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            {/* Action Filter Dropdown */}
                            <select
                                value={actionFilter}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setActionFilter(val);
                                    handleApplyFilter(val);
                                }}
                                className="text-xs h-8 px-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
                            >
                                <option value="all">Semua Kategori Aksi</option>
                                <option value="user.create">Aksi: Pembuatan Pengguna</option>
                                <option value="user.update">Aksi: Perubahan Pengguna</option>
                                <option value="user.delete">Aksi: Penghapusan Pengguna</option>
                                <option value="user.impersonate">Aksi: Impersonasi Akun</option>
                                <option value="user.reset_password">Aksi: Reset Password</option>
                                <option value="system_config.update">Aksi: Perubahan Konfigurasi</option>
                                <option value="master.fakultas.create">Aksi: Master Fakultas</option>
                                <option value="master.program_studi.create">Aksi: Master Program Studi</option>
                                <option value="keuangan.kasir.bayar">Aksi: Pembayaran Kasir</option>
                                <option value="pmb.verify_berkas">Aksi: Verifikasi PMB</option>
                            </select>

                            <div className="flex items-center gap-1.5">
                                <Input
                                    placeholder="Cari aksi, user, entitas, IP..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                                    className="h-8 text-xs w-48 sm:w-56 bg-white border-slate-300"
                                />
                                <Button size="sm" onClick={() => handleApplyFilter()} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3">
                                    <Search className="size-3.5 mr-1" />
                                    Cari
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {safeLogs.data.length === 0 ? (
                            <EmptyState
                                icon={Activity}
                                title="Belum Ada Catatan Log Aktivitas"
                                description="Belum ada catatan aktivitas yang terekam atau tidak ada riwayat log yang sesuai dengan filter pencarian Anda."
                            />
                        ) : (
                            <ResponsiveTable>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 border-b border-slate-200">
                                        <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Waktu</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Pelaksana (User)</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Aksi & Entitas</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Alamat IP</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {safeLogs.data.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                            <TableCell className="text-xs text-slate-500 font-mono">
                                                {new Date(log.created_at).toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-slate-900 text-xs">{log.user?.name || 'Sistem / Anonim'}</div>
                                                <div className="text-[10px] text-slate-500 font-mono">{log.user?.email || '-'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase font-mono ${getActionBadgeColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                    <span className="font-semibold text-xs text-slate-900">
                                                        {log.entity_type} #{log.entity_id}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-mono text-slate-500">
                                                {log.ip_address || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </ResponsiveTable>
                        )}

                        {safeLogs.links && safeLogs.links.length > 0 && (
                            <div className="p-4 border-t border-slate-200">
                                <Pagination links={safeLogs.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SuperadminMonitoring.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Monitoring Sistem', href: '/superadmin/monitoring' },
    ],
};
