import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownLeft,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Database,
    ExternalLink,
    Filter,
    GraduationCap,
    Info,
    Layers,
    RefreshCw,
    Search,
    Server,
    ShieldAlert,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type SyncLog = {
    id: number;
    table_name: string;
    record_id: number;
    action: string;
    status: 'success' | 'failed' | 'pending';
    pddikti_id: string | null;
    error_message: string | null;
    synced_at: string | null;
    created_at: string;
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

type SyncStats = {
    total_success: number;
    total_failed: number;
    total_pending: number;
    last_synced_at: string | null;
    total_mahasiswa_active: number;
    total_kelas_kuliah: number;
};

type FeederConfig = {
    url: string;
    username: string;
    sandbox_mode: boolean;
};

type ReconcileResult = {
    total_local: number;
    total_feeder: number;
    matched_count: number;
    unmatched_local: Array<{ id: number; nim?: string; nidn?: string; nama: string; prodi?: string }>;
    unmatched_feeder: Array<{ nim?: string; nidn?: string; nama: string; prodi?: string; pddikti_id?: string }>;
    differences: Array<{
        nim?: string;
        nidn?: string;
        local_id: number;
        pddikti_id: string | null;
        discrepancies: Array<{ field: string; local: string; feeder: string }>;
    }>;
};

export default function PddiktiIndex({
    logs,
    stats,
    filters = {},
    feederConfig,
}: {
    logs: { data: SyncLog[] } & PaginationMeta;
    stats: SyncStats;
    filters: { status?: string; table_name?: string; action?: string; search?: string };
    feederConfig: FeederConfig;
}) {
    const { confirm, showAlert, confirmDialog } = useConfirmDialog();
    const [activeTab, setActiveTab] = useState<'logs' | 'reconcile'>('logs');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [tableFilter, setTableFilter] = useState(filters.table_name || 'all');
    const [actionFilter, setActionFilter] = useState(filters.action || 'all');

    // Connection test state
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionResult, setConnectionResult] = useState<{
        status: string;
        url?: string;
        token?: string;
        profil?: any;
        message: string;
    } | null>(null);
    const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);

    // Selected log error modal
    const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null);

    // Reconciliation state
    const [reconcileType, setReconcileType] = useState<'mahasiswa' | 'dosen'>('mahasiswa');
    const [isReconciling, setIsReconciling] = useState(false);
    const [reconcileData, setReconcileData] = useState<ReconcileResult | null>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchQuery });
    };

    const applyFilters = (newFilters: Record<string, string | undefined>) => {
        const query: Record<string, string | undefined> = {
            search: searchQuery || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            table_name: tableFilter !== 'all' ? tableFilter : undefined,
            action: actionFilter !== 'all' ? actionFilter : undefined,
            ...newFilters,
        };

        Object.keys(query).forEach((k) => query[k] === undefined && delete query[k]);

        router.get('/pddikti', query as any, { preserveState: true, replace: true });
    };

    const handleTestConnection = async () => {
        setIsTestingConnection(true);

        try {
            const res = await fetch('/pddikti/test-connection');
            const data = await res.json();
            setConnectionResult(data);
            setIsConnectionModalOpen(true);
        } catch (err: any) {
            setConnectionResult({
                status: 'error',
                message: err?.message || 'Gagal menghubungi server backend.',
            });
            setIsConnectionModalOpen(true);
        } finally {
            setIsTestingConnection(false);
        }
    };

    const handleBatchSync = (entity: 'mahasiswa' | 'kelas_kuliah' | 'nilai' | 'referensi') => {
        const labels: Record<string, string> = {
            mahasiswa: 'Seluruh Biodata Mahasiswa Aktif',
            kelas_kuliah: 'Kelas Perkuliahan & Pengajar',
            nilai: 'Peserta & Nilai Akhir Perkuliahan',
            referensi: 'Kamus Referensi Biodata',
        };

        confirm({
            title: 'Sinkronisasi Batch PD-DIKTI',
            description: `Apakah Anda yakin ingin menjadwalkan sinkronisasi batch antrean untuk ${labels[entity]} ke Neo Feeder PD-DIKTI?`,
            variant: 'primary',
            confirmText: 'Ya, Sinkronisasikan',
            onConfirm: () => {
                router.post('/pddikti/sync-batch', { entity }, { preserveScroll: true });
            },
        });
    };

    const handleRetry = (logId: number) => {
        router.post(`/pddikti/retry/${logId}`, {}, { preserveScroll: true });
    };

    const runReconciliation = async () => {
        setIsReconciling(true);

        try {
            const res = await fetch('/pddikti/reconcile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ type: reconcileType }),
            });
            const result = await res.json();

            if (result.status === 'success') {
                setReconcileData(result.data);
            } else {
                showAlert({
                    title: 'Rekonsiliasi Gagal',
                    description: `Proses rekonsiliasi data dengan Neo Feeder tidak berhasil: ${result.message}`,
                    variant: 'destructive',
                });
            }
        } catch (e: any) {
            showAlert({
                title: 'Error Koneksi Rekonsiliasi',
                description: `Terjadi kendala saat menghubungi server rekonsiliasi: ${e.message}`,
                variant: 'destructive',
            });
        } finally {
            setIsReconciling(false);
        }
    };

    const formatEntityName = (tableName: string) => {
        switch (tableName) {
            case 'mahasiswas':
                return 'Mahasiswa';
            case 'kelas_kuliahs':
                return 'Kelas Kuliah';
            case 'nilais':
                return 'Nilai & KRS';
            case 'referensi_biodatas':
                return 'Referensi Biodata';
            case 'dosens':
                return 'Dosen';
            default:
                return tableName;
        }
    };

    return (
        <>
            {confirmDialog}
            <Head title="Integrasi PD-DIKTI Neo Feeder" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header & Connection Info */}
                <div className="rounded-lg border border-border-default bg-surface-card p-4 sm:p-6 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="p-2 rounded-md bg-brand-primary/10 text-brand-primary">
                                    <Database className="size-5" />
                                </span>
                                <div>
                                    <h1 className="text-xl font-semibold text-text-primary">
                                        Integrasi PD-DIKTI Neo Feeder 2.0
                                    </h1>
                                    <p className="text-xs text-text-secondary mt-0.5">
                                        Buffer sinkronisasi asinkron pelaporan data akademik ke Pangkalan Data Pendidikan Tinggi.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {feederConfig.sandbox_mode && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-300">
                                    <Info className="size-3.5" />
                                    Sandbox Mock Mode
                                </span>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleTestConnection}
                                disabled={isTestingConnection}
                                className="text-xs flex items-center gap-1.5"
                            >
                                <Server className={`size-3.5 ${isTestingConnection ? 'animate-spin' : 'text-brand-primary'}`} />
                                <span>{isTestingConnection ? 'Menguji...' : 'Uji Koneksi Feeder'}</span>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border-default grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-text-secondary">
                        <div>
                            <span className="font-semibold text-text-primary">WS Endpoint: </span>
                            <span className="font-mono text-[11px]">{feederConfig.url}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-text-primary">Operator: </span>
                            <span className="font-mono text-[11px]">{feederConfig.username || '-'}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-text-primary">Arsitektur: </span>
                            <span>Queue Worker (Asinkron)</span>
                        </div>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-secondary">Sukses Dilaporkan</span>
                            <span className="p-1.5 rounded-md bg-status-success/10 text-status-success">
                                <CheckCircle2 className="size-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-text-primary">{stats.total_success.toLocaleString()}</p>
                        <p className="text-[11px] text-text-secondary mt-1">Data valid di Neo Feeder</p>
                    </div>

                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-secondary">Gagal / Perlu Perbaikan</span>
                            <span className="p-1.5 rounded-md bg-status-danger/10 text-status-danger">
                                <AlertCircle className="size-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-status-danger">{stats.total_failed.toLocaleString()}</p>
                        <p className="text-[11px] text-text-secondary mt-1">Dapat dijadwalkan ulang</p>
                    </div>

                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-secondary">Antrean Menunggu</span>
                            <span className="p-1.5 rounded-md bg-status-warning/10 text-status-warning">
                                <Clock className="size-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-text-primary">{stats.total_pending.toLocaleString()}</p>
                        <p className="text-[11px] text-text-secondary mt-1">Sedang diproses worker</p>
                    </div>

                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-secondary">Sinkronisasi Terakhir</span>
                            <span className="p-1.5 rounded-md bg-brand-primary/10 text-brand-primary">
                                <RefreshCw className="size-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-text-primary truncate">
                            {stats.last_synced_at ? new Date(stats.last_synced_at).toLocaleString('id-ID') : 'Belum Ada'}
                        </p>
                        <p className="text-[11px] text-text-secondary mt-1">Aktivitas transmisi terakhir</p>
                    </div>
                </div>

                {/* Quick Action Toolbar */}
                <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            Aksi Cepat Sinkronisasi Batch Antrean
                        </h2>
                        <span className="text-[11px] text-text-secondary">Eksekusi asinkron via Background Queue</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBatchSync('mahasiswa')}
                            className="justify-start text-xs h-auto py-2.5 border-border-default hover:bg-surface-base"
                        >
                            <GraduationCap className="size-4 text-brand-primary mr-2 shrink-0" />
                            <div className="text-left">
                                <div className="font-semibold text-text-primary">Biodata Mahasiswa</div>
                                <div className="text-[10px] text-text-secondary">Push NIK, Ortu & Riwayat</div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBatchSync('kelas_kuliah')}
                            className="justify-start text-xs h-auto py-2.5 border-border-default hover:bg-surface-base"
                        >
                            <Layers className="size-4 text-brand-primary mr-2 shrink-0" />
                            <div className="text-left">
                                <div className="font-semibold text-text-primary">Kelas & Pengajar</div>
                                <div className="text-[10px] text-text-secondary">Push Kelas & Dosen Ajar</div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBatchSync('nilai')}
                            className="justify-start text-xs h-auto py-2.5 border-border-default hover:bg-surface-base"
                        >
                            <CheckCircle2 className="size-4 text-brand-primary mr-2 shrink-0" />
                            <div className="text-left">
                                <div className="font-semibold text-text-primary">KRS & Nilai Final</div>
                                <div className="text-[10px] text-text-secondary">Push Peserta & Nilai Akhir</div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBatchSync('referensi')}
                            className="justify-start text-xs h-auto py-2.5 border-border-default hover:bg-surface-base"
                        >
                            <ArrowDownLeft className="size-4 text-brand-primary mr-2 shrink-0" />
                            <div className="text-left">
                                <div className="font-semibold text-text-primary">Tarik Kamus Referensi</div>
                                <div className="text-[10px] text-text-secondary">Pull Agama, Wilayah, Prodi</div>
                            </div>
                        </Button>
                    </div>
                </div>

                {/* Tabs Header */}
                <div className="border-b border-border-default">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab('logs')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-colors duration-150 flex items-center gap-2 ${
                                activeTab === 'logs'
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            <RefreshCw className="size-4" />
                            <span>Log Transmisi Sinkronisasi</span>
                            <span className="rounded-full bg-surface-base px-2 py-0.5 text-xs text-text-secondary">
                                {logs.total}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('reconcile')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-colors duration-150 flex items-center gap-2 ${
                                activeTab === 'reconcile'
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            <ShieldAlert className="size-4" />
                            <span>Audit & Rekonsiliasi Data</span>
                        </button>
                    </div>
                </div>

                {/* TAB 1: LOGS VIEW */}
                {activeTab === 'logs' && (
                    <div className="space-y-4">
                        {/* Filter Toolbar */}
                        <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
                                <div className="flex-1 min-w-[200px]">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 size-4 text-text-secondary" />
                                        <Input
                                            type="text"
                                            placeholder="Cari ID PDDIKTI, pesan error, atau entitas..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8 text-xs h-9"
                                        />
                                    </div>
                                </div>

                                <div className="w-40">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            applyFilters({ status: e.target.value });
                                        }}
                                        aria-label="Filter Status"
                                        className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="success">Sukses</option>
                                        <option value="failed">Gagal</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>

                                <div className="w-44">
                                    <select
                                        value={tableFilter}
                                        onChange={(e) => {
                                            setTableFilter(e.target.value);
                                            applyFilters({ table_name: e.target.value });
                                        }}
                                        aria-label="Filter Entitas Tabel"
                                        className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                    >
                                        <option value="all">Semua Entitas</option>
                                        <option value="mahasiswas">Mahasiswa</option>
                                        <option value="kelas_kuliahs">Kelas Kuliah</option>
                                        <option value="nilais">Nilai & KRS</option>
                                        <option value="referensi_biodatas">Referensi Biodata</option>
                                        <option value="dosens">Dosen</option>
                                    </select>
                                </div>

                                <div className="w-36">
                                    <select
                                        value={actionFilter}
                                        onChange={(e) => {
                                            setActionFilter(e.target.value);
                                            applyFilters({ action: e.target.value });
                                        }}
                                        aria-label="Filter Arah Transmisi"
                                        className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                    >
                                        <option value="all">Semua Arah</option>
                                        <option value="push">Push (Kirim)</option>
                                        <option value="pull">Pull (Tarik)</option>
                                    </select>
                                </div>

                                <Button type="submit" size="sm" className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs h-9">
                                    <Filter className="size-3.5 mr-1" />
                                    Filter
                                </Button>
                            </form>
                        </div>

                        {/* Logs Table */}
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-40">Waktu</TableHead>
                                    <TableHead className="w-32">Entitas</TableHead>
                                    <TableHead className="w-24">ID Lokal</TableHead>
                                    <TableHead>ID PD-DIKTI Feeder</TableHead>
                                    <TableHead className="w-24">Arah</TableHead>
                                    <TableHead className="w-28">Status</TableHead>
                                    <TableHead>Pesan / Keterangan</TableHead>
                                    <TableHead align="right" className="w-28">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-xs text-text-secondary">
                                            Tidak ada riwayat log sinkronisasi yang sesuai dengan filter.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.data.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-xs text-text-secondary whitespace-nowrap">
                                                {log.synced_at
                                                    ? new Date(log.synced_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' })
                                                    : new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' })}
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-base text-text-primary border border-border-default">
                                                    {formatEntityName(log.table_name)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-text-secondary">
                                                #{log.record_id}
                                            </TableCell>
                                            <TableCell className="font-mono text-[11px] text-text-secondary truncate max-w-[180px]">
                                                {log.pddikti_id || <span className="text-muted-foreground italic">-</span>}
                                            </TableCell>
                                            <TableCell>
                                                {log.action === 'push' ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-primary">
                                                        <ArrowUpRight className="size-3" />
                                                        PUSH
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600">
                                                        <ArrowDownLeft className="size-3" />
                                                        PULL
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {log.status === 'success' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-success/10 text-status-success border border-status-success/30">
                                                        <CheckCircle2 className="size-3" />
                                                        Sukses
                                                    </span>
                                                )}
                                                {log.status === 'failed' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-danger/10 text-status-danger border border-status-danger/30">
                                                        <AlertCircle className="size-3" />
                                                        Gagal
                                                    </span>
                                                )}
                                                {log.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-warning/10 text-status-warning border border-status-warning/30">
                                                        <Clock className="size-3" />
                                                        Pending
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {log.error_message ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedLog(log)}
                                                        className="text-left text-xs text-status-danger hover:underline truncate max-w-[240px] block"
                                                    >
                                                        {log.error_message}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-text-secondary">Berhasil ditransmisikan</span>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                {log.status === 'failed' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRetry(log.id)}
                                                        className="text-[11px] h-7 px-2 border-border-default hover:bg-surface-base"
                                                    >
                                                        <RefreshCw className="size-3 mr-1 text-brand-primary" />
                                                        Retry
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </ResponsiveTable>

                        {/* Pagination */}
                        <Pagination
                            links={logs.links}
                            from={logs.from}
                            to={logs.to}
                            total={logs.total}
                            itemName="data log sync"
                        />
                    </div>
                )}

                {/* TAB 2: AUDIT REKONSILIASI VIEW */}
                {activeTab === 'reconcile' && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-sm font-semibold text-text-primary">
                                    Pencocokan & Rekonsiliasi Data SIAKAD vs PD-DIKTI
                                </h2>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Membandingkan data lokal SIAKAD (Source of Truth) dengan data yang tercatat di Neo Feeder tanpa menimpa data lokal.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={reconcileType}
                                    onChange={(e) => setReconcileType(e.target.value as any)}
                                    aria-label="Pilih Entitas Audit"
                                    className="h-9 rounded-md border border-border-default bg-surface-card px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                >
                                    <option value="mahasiswa">Entitas Mahasiswa</option>
                                    <option value="dosen">Entitas Dosen</option>
                                </select>

                                <Button
                                    size="sm"
                                    onClick={runReconciliation}
                                    disabled={isReconciling}
                                    className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs h-9 flex items-center gap-1.5"
                                >
                                    <RefreshCw className={`size-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
                                    <span>{isReconciling ? 'Memeriksa...' : 'Jalankan Audit'}</span>
                                </Button>
                            </div>
                        </div>

                        {/* Reconciliation Report */}
                        {reconcileData ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                                        <div className="text-xs text-text-secondary font-medium">Total Terdaftar di SIAKAD</div>
                                        <div className="text-xl font-semibold text-text-primary mt-1">{reconcileData.total_local}</div>
                                    </div>

                                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                                        <div className="text-xs text-text-secondary font-medium">Total Terdaftar di PD-DIKTI</div>
                                        <div className="text-xl font-semibold text-text-primary mt-1">{reconcileData.total_feeder}</div>
                                    </div>

                                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                                        <div className="text-xs text-text-secondary font-medium">Data Cocok (Identik)</div>
                                        <div className="text-xl font-semibold text-status-success mt-1">{reconcileData.matched_count}</div>
                                    </div>
                                </div>

                                {/* Unmatched in Feeder */}
                                <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                                        <span className="p-1 rounded bg-amber-500/10 text-amber-600">
                                            <AlertCircle className="size-3.5" />
                                        </span>
                                        <span>Ada di SIAKAD, Belum Terlapor ke PD-DIKTI ({reconcileData.unmatched_local.length})</span>
                                    </div>

                                    {reconcileData.unmatched_local.length === 0 ? (
                                        <p className="text-xs text-text-secondary italic">Semua data lokal telah tercatat di Neo Feeder.</p>
                                    ) : (
                                        <div className="max-h-48 overflow-y-auto divide-y divide-border-default">
                                            {reconcileData.unmatched_local.map((item, idx) => (
                                                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                                                    <div>
                                                        <span className="font-semibold text-text-primary">{item.nama}</span>
                                                        <span className="text-text-secondary ml-2">({item.nim || item.nidn || `#${item.id}`})</span>
                                                    </div>
                                                    <span className="text-text-secondary text-[11px]">{item.prodi || '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Field Discrepancies */}
                                <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                                        <span className="p-1 rounded bg-status-danger/10 text-status-danger">
                                            <ShieldAlert className="size-3.5" />
                                        </span>
                                        <span>Selisih Nilai / Atribut Data ({reconcileData.differences.length})</span>
                                    </div>

                                    {reconcileData.differences.length === 0 ? (
                                        <p className="text-xs text-text-secondary italic">Tidak ditemukan perbedaan atribut data.</p>
                                    ) : (
                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                            {reconcileData.differences.map((diff, idx) => (
                                                <div key={idx} className="p-2.5 rounded bg-surface-base border border-border-default text-xs space-y-1">
                                                    <div className="font-semibold text-text-primary">NIM: {diff.nim}</div>
                                                    {diff.discrepancies.map((d, dIdx) => (
                                                        <div key={dIdx} className="text-[11px] text-text-secondary flex gap-4">
                                                            <span>Field: <b>{d.field}</b></span>
                                                            <span className="text-brand-primary">SIAKAD: "{d.local}"</span>
                                                            <span className="text-amber-600">Feeder: "{d.feeder}"</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-border-default bg-surface-card p-8 text-center text-xs text-text-secondary">
                                Pilih entitas dan klik <b>"Jalankan Audit"</b> untuk membandingkan integritas data SIAKAD dengan Neo Feeder.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* CONNECTION TEST MODAL */}
            <Dialog open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                            <Server className="size-4 text-brand-primary" />
                            Hasil Uji Koneksi Neo Feeder
                        </DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Status komunikasi dengan WS live2.php Neo Feeder
                        </DialogDescription>
                    </DialogHeader>

                    {connectionResult && (
                        <div className="space-y-3 text-xs">
                            <div className={`p-3 rounded border ${
                                connectionResult.status === 'connected'
                                    ? 'bg-status-success/10 border-status-success/30 text-status-success'
                                    : 'bg-status-danger/10 border-status-danger/30 text-status-danger'
                            }`}>
                                <div className="font-semibold flex items-center gap-1.5">
                                    {connectionResult.status === 'connected' ? (
                                        <CheckCircle2 className="size-4" />
                                    ) : (
                                        <AlertCircle className="size-4" />
                                    )}
                                    {connectionResult.message}
                                </div>
                            </div>

                            {connectionResult.status !== 'connected' && (
                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-text-primary space-y-1.5 text-xs">
                                    <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                        <Info className="size-3.5" />
                                        Panduan Solusi:
                                    </div>
                                    <ul className="list-disc pl-4 space-y-1 text-text-secondary text-[11px]">
                                        <li>
                                            <b>Mode Pengujian (Sandbox)</b>: Jika server Feeder fisik belum dinyalakan, ubah <code>PDDIKTI_SANDBOX_MODE=true</code> di file <code>.env</code> untuk menguji fungsi dengan emulator.
                                        </li>
                                        <li>
                                            <b>Koneksi Server Asli</b>: Pastikan aplikasi <b>Neo Feeder 2.0</b> di komputer operator telah dijalankan dan variabel <code>PDDIKTI_FEEDER_URL</code> di <code>.env</code> telah diarahkan ke IP/port yang sesuai.
                                        </li>
                                    </ul>
                                </div>
                            )}

                            {connectionResult.profil && (
                                <div className="p-3 rounded bg-surface-base border border-border-default space-y-1.5 text-text-secondary">
                                    <div>
                                        <span className="font-semibold text-text-primary">Kode PT: </span>
                                        <span className="font-mono">{connectionResult.profil.kode_perguruan_tinggi || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-text-primary">Nama Kampus: </span>
                                        <span>{connectionResult.profil.nama_perguruan_tinggi || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-text-primary">Status Pelaporan: </span>
                                        <span className="text-status-success font-medium">Aktif</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button size="sm" variant="outline" onClick={() => setIsConnectionModalOpen(false)} className="text-xs">
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ERROR DETAIL MODAL */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2 text-status-danger">
                            <AlertCircle className="size-4" />
                            Detail Kesalahan Transmisi #{selectedLog?.id}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Pesan error mentah dari Neo Feeder Web Service
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-surface-base border border-border-default text-text-secondary">
                                <div><b>Entitas:</b> {formatEntityName(selectedLog.table_name)}</div>
                                <div><b>Record ID:</b> #{selectedLog.record_id}</div>
                                <div><b>Aksi:</b> {selectedLog.action.toUpperCase()}</div>
                                <div><b>Waktu:</b> {new Date(selectedLog.created_at).toLocaleString('id-ID')}</div>
                            </div>

                            <div>
                                <label className="font-semibold text-text-primary block mb-1">Pesan Error:</label>
                                <pre className="p-3 rounded bg-neutral-900 text-rose-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                                    {selectedLog.error_message || 'Tidak ada detail pesan error.'}
                                </pre>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex justify-between sm:justify-between">
                        {selectedLog && selectedLog.status === 'failed' && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    handleRetry(selectedLog.id);
                                    setSelectedLog(null);
                                }}
                                className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs"
                            >
                                <RefreshCw className="size-3 mr-1" />
                                Coba Sinkron Ulang
                            </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)} className="text-xs">
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
