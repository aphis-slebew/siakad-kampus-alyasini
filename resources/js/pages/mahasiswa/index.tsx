import { Head, Link, router } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    Eye,
    Filter,
    GraduationCap,
    Plus,
    Search,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type MahasiswaItem = {
    id: number;
    nim: string;
    nama_lengkap: string;
    status_mahasiswa: string;
    tahun_masuk: number;
    program_studi?: {
        id: number;
        nama: string;
        kode: string;
    };
    user?: {
        id: number;
        email: string;
    };
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

export default function DataMahasiswaIndex({
    mahasiswas,
    programStudis = [],
    angkatans = [],
    filters = {},
    stats = { total: 0, aktif: 0, cuti: 0, lulus: 0 },
}: {
    mahasiswas?: ({ data: MahasiswaItem[] } & PaginationMeta) | null;
    programStudis?: Array<{ id: number; kode: string; nama: string }>;
    angkatans?: number[];
    filters?: { search?: string; program_studi_id?: string | number; status?: string; angkatan?: string | number };
    stats?: { total: number; aktif: number; cuti: number; lulus: number };
}) {
    const safeMahasiswas = mahasiswas || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0, from: null, to: null, links: [] };
    const safeStats = stats || { total: 0, aktif: 0, cuti: 0, lulus: 0 };
    const safeFilters = filters || {};

    const [searchQuery, setSearchQuery] = useState(safeFilters.search || '');
    const [prodiFilter, setProdiFilter] = useState(String(safeFilters.program_studi_id || 'all'));
    const [statusFilter, setStatusFilter] = useState(safeFilters.status || 'all');
    const [angkatanFilter, setAngkatanFilter] = useState(String(safeFilters.angkatan || 'all'));

    const handleApplyFilter = () => {
        router.get(
            '/mahasiswa',
            {
                search: searchQuery || undefined,
                program_studi_id: prodiFilter !== 'all' ? prodiFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                angkatan: angkatanFilter !== 'all' ? angkatanFilter : undefined,
                page: 1,
            },
            { preserveState: true, replace: true }
        );
    };

    return (
        <>
            <Head title="Data & Direktori Mahasiswa" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                            Direktori Mahasiswa STAI Al-Yasini
                        </h1>
                        <p className="text-xs sm:text-sm text-text-secondary">
                            Pangkalan data seluruh mahasiswa aktif, cuti, dan lulusan terdaftar.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="outline" className="text-xs">
                            <Link href="/akademik/dosen-wali">
                                <UserCheck className="size-3.5 mr-1.5" />
                                Kelola Dosen Wali
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                    <Card className="border-border-default bg-surface-card p-4 shadow-xs">
                        <span className="text-[11px] font-semibold text-text-secondary uppercase">Total Mahasiswa</span>
                        <h3 className="text-2xl font-bold text-text-primary mt-1">{safeStats.total}</h3>
                    </Card>
                    <Card className="border-border-default bg-surface-card p-4 shadow-xs">
                        <span className="text-[11px] font-semibold text-emerald-700 uppercase">Mahasiswa Aktif</span>
                        <h3 className="text-2xl font-bold text-emerald-700 mt-1">{safeStats.aktif}</h3>
                    </Card>
                    <Card className="border-border-default bg-surface-card p-4 shadow-xs">
                        <span className="text-[11px] font-semibold text-amber-700 uppercase">Cuti Akademik</span>
                        <h3 className="text-2xl font-bold text-amber-700 mt-1">{safeStats.cuti}</h3>
                    </Card>
                    <Card className="border-border-default bg-surface-card p-4 shadow-xs">
                        <span className="text-[11px] font-semibold text-blue-700 uppercase">Alumni / Lulus</span>
                        <h3 className="text-2xl font-bold text-blue-700 mt-1">{safeStats.lulus}</h3>
                    </Card>
                </div>

                {/* Filter & Search Bar */}
                <Card className="border-border-default bg-surface-card shadow-xs">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <div className="relative lg:col-span-2">
                                <Search className="absolute left-3 top-2.5 size-4 text-text-secondary" />
                                <Input
                                    placeholder="Cari berdasarkan Nama atau NIM..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>

                            <select
                                value={prodiFilter}
                                onChange={(e) => setProdiFilter(e.target.value)}
                                className="h-9 px-3 rounded-md border border-border-default bg-surface-card text-xs text-text-primary"
                            >
                                <option value="all">Semua Program Studi</option>
                                {programStudis.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.kode} - {p.nama}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 px-3 rounded-md border border-border-default bg-surface-card text-xs text-text-primary"
                            >
                                <option value="all">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="cuti">Cuti</option>
                                <option value="lulus">Lulus</option>
                                <option value="do">Drop Out</option>
                            </select>

                            <div className="flex items-center gap-2">
                                <select
                                    value={angkatanFilter}
                                    onChange={(e) => setAngkatanFilter(e.target.value)}
                                    className="h-9 px-3 rounded-md border border-border-default bg-surface-card text-xs text-text-primary flex-1"
                                >
                                    <option value="all">Semua Angkatan</option>
                                    {angkatans.map((a) => (
                                        <option key={a} value={a}>
                                            {a}
                                        </option>
                                    ))}
                                </select>
                                <Button size="sm" onClick={handleApplyFilter} className="h-9 text-xs px-3">
                                    <Filter className="size-3.5 mr-1" />
                                    Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Students Table */}
                <Card className="border-border-default bg-surface-card overflow-hidden">
                    <CardContent className="p-0">
                        {safeMahasiswas.data.length === 0 ? (
                            <div className="p-8 text-center text-xs text-text-secondary">
                                Tidak ada data mahasiswa yang cocok dengan kriteria pencarian.
                            </div>
                        ) : (
                            <ResponsiveTable>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>NIM & Mahasiswa</TableHead>
                                        <TableHead>Program Studi</TableHead>
                                        <TableHead className="text-center">Angkatan</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {safeMahasiswas.data.map((mhs) => (
                                        <TableRow key={mhs.id}>
                                            <TableCell>
                                                <div className="font-bold text-text-primary text-sm">{mhs.nama_lengkap}</div>
                                                <div className="text-[11px] font-mono text-text-secondary">NIM: {mhs.nim}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-text-primary text-xs">
                                                    {mhs.program_studi?.nama || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-xs">
                                                {mhs.tahun_masuk}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={mhs.status_mahasiswa === 'aktif' ? 'default' : 'secondary'}
                                                    className="capitalize text-[10px]"
                                                >
                                                    {mhs.status_mahasiswa}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild size="sm" variant="ghost" className="h-8 px-2.5 text-xs">
                                                    <Link href={`/mahasiswa/${mhs.id}`}>
                                                        <Eye className="size-3.5 mr-1 text-brand-primary" />
                                                        Detail Lengkap
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </ResponsiveTable>
                        )}

                        {safeMahasiswas.links && (
                            <div className="p-4 border-t border-border-default">
                                <Pagination links={safeMahasiswas.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DataMahasiswaIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Mahasiswa', href: '/mahasiswa' },
    ],
};
