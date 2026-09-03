import { Head, router } from '@inertiajs/react';
import { Download, FileText, Filter, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type SummaryRow = {
    program_studi_id: number;
    program_studi_nama: string;
    program_studi_kode: string;
    draft_count: number;
    diajukan_count: number;
    disetujui_wali_count: number;
    ditolak_count: number;
    total_krs: number;
};

type DrilldownRow = {
    id: number;
    status: string;
    mahasiswa?: {
        id: number;
        nim: string;
        nama_lengkap: string;
        programStudi?: {
            nama: string;
        };
    };
    created_at?: string;
    updated_at?: string;
};

type Option = {
    id: number;
    nama: string;
    kode?: string;
    is_active?: boolean;
};


export default function LaporanKrsIndex({
    summary = [],
    drilldown = null,
    scopedProdiId = null,
    tahunAjarans = [],
    programStudis = [],
    filters = { tahun_ajaran_id: null, program_studi_id: null, status: null },
}: {
    summary: SummaryRow[];
    drilldown: DrilldownRow[] | null;
    scopedProdiId: number | null;
    tahunAjarans: Option[];
    programStudis: Option[];
    filters: { tahun_ajaran_id: number | null; program_studi_id: number | null; status: string | null };
}) {
    const selectedTahun = filters.tahun_ajaran_id ? String(filters.tahun_ajaran_id) : (tahunAjarans[0]?.id ? String(tahunAjarans[0].id) : '');
    const selectedProdi = scopedProdiId ? String(scopedProdiId) : (filters.program_studi_id ? String(filters.program_studi_id) : 'all');
    const selectedStatus = filters.status || 'all';

    const handleFilterChange = (tahun: string, prodi: string, status: string) => {
        router.get('/laporan/krs', {
            tahun_ajaran_id: tahun || undefined,
            program_studi_id: prodi !== 'all' ? prodi : undefined,
            status: status !== 'all' ? status : undefined,
        }, { preserveState: true });
    };

    const handleExportCsv = () => {
        const query = new URLSearchParams({
            tahun_ajaran_id: selectedTahun || '',
            program_studi_id: selectedProdi !== 'all' ? selectedProdi : '',
            status: selectedStatus !== 'all' ? selectedStatus : '',
        }).toString();
        window.location.href = `/laporan/krs/export?${query}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'disetujui_wali':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">DISETUJUI WALI</span>;
            case 'diajukan':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">DIAJUKAN</span>;
            case 'ditolak':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">DITOLAK</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">DRAFT</span>;
        }
    };

    const totalDraft = summary.reduce((acc, r) => acc + Number(r.draft_count), 0);
    const totalDiajukan = summary.reduce((acc, r) => acc + Number(r.diajukan_count), 0);
    const totalDisetujui = summary.reduce((acc, r) => acc + Number(r.disetujui_wali_count), 0);
    const totalDitolak = summary.reduce((acc, r) => acc + Number(r.ditolak_count), 0);
    const totalSemua = summary.reduce((acc, r) => acc + Number(r.total_krs), 0);

    return (
        <>
            <Head title="Laporan KRS per Prodi" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <FileText className="size-5 text-emerald-600" />
                            Laporan Status Pengisian KRS per Prodi
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Ringkasan agregat status pengajuan KRS mahasiswa berdasarkan program studi.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCsv}
                        className="text-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Download className="size-4 text-emerald-600" />
                        <span>Export CSV</span>
                    </Button>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 p-4 rounded-lg border border-border bg-card shadow-xs">
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-2">
                        <Filter className="size-3.5" />
                        <span>Filter:</span>
                    </div>

                    <div className="w-full sm:w-48">
                        <Select
                            value={selectedTahun}
                            onValueChange={(val) => handleFilterChange(val, selectedProdi, selectedStatus)}
                        >
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Pilih Tahun Ajaran" />
                            </SelectTrigger>
                            <SelectContent>
                                {tahunAjarans.map((ta) => (
                                    <SelectItem key={ta.id} value={String(ta.id)} className="text-xs">
                                        {ta.nama} {ta.is_active ? '(Aktif)' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:w-56">
                        <Select
                            disabled={!!scopedProdiId}
                            value={selectedProdi}
                            onValueChange={(val) => handleFilterChange(selectedTahun, val, selectedStatus)}
                        >
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Semua Program Studi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">Semua Program Studi</SelectItem>
                                {programStudis.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                                        {p.kode} - {p.nama}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:w-44">
                        <Select
                            value={selectedStatus}
                            onValueChange={(val) => handleFilterChange(selectedTahun, selectedProdi, val)}
                        >
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">Semua Status</SelectItem>
                                <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                                <SelectItem value="diajukan" className="text-xs">Diajukan</SelectItem>
                                <SelectItem value="disetujui_wali" className="text-xs">Disetujui Wali</SelectItem>
                                <SelectItem value="ditolak" className="text-xs">Ditolak</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Summary Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="p-4 rounded-lg border border-border bg-card shadow-xs col-span-2 sm:col-span-1">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total KRS</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{totalSemua}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card shadow-xs">
                        <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">Diajukan</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{totalDiajukan}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card shadow-xs">
                        <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Disetujui Wali</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{totalDisetujui}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card shadow-xs">
                        <p className="text-[11px] font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">Ditolak</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{totalDitolak}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card shadow-xs">
                        <p className="text-[11px] font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">Draft</p>
                        <p className="text-2xl font-bold text-gray-600 mt-1">{totalDraft}</p>
                    </div>
                </div>

                {/* Aggregate Summary Table */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Users className="size-4 text-emerald-600" />
                        Ringkasan Jumlah Mahasiswa per Status KRS
                    </h2>

                    <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Program Studi</TableHead>
                                    <TableHead align="center" className="w-24 text-gray-600">Draft</TableHead>
                                    <TableHead align="center" className="w-24 text-amber-600">Diajukan</TableHead>
                                    <TableHead align="center" className="w-28 text-emerald-600">Disetujui Wali</TableHead>
                                    <TableHead align="center" className="w-24 text-red-600">Ditolak</TableHead>
                                    <TableHead align="right" className="w-28 font-bold">Total KRS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summary.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">
                                            Tidak ada data KRS untuk filter yang dipilih.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    summary.map((row, idx) => (
                                        <TableRow key={row.program_studi_id}>
                                            <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                                            <TableCell>
                                                <StackedCell
                                                    primary={row.program_studi_nama}
                                                    secondary={`Kode: ${row.program_studi_kode}`}
                                                />
                                            </TableCell>
                                            <TableCell align="center" className="font-semibold text-gray-700 dark:text-gray-300">
                                                {row.draft_count}
                                            </TableCell>
                                            <TableCell align="center" className="font-semibold text-amber-600">
                                                {row.diajukan_count}
                                            </TableCell>
                                            <TableCell align="center" className="font-semibold text-emerald-600">
                                                {row.disetujui_wali_count}
                                            </TableCell>
                                            <TableCell align="center" className="font-semibold text-red-600">
                                                {row.ditolak_count}
                                            </TableCell>
                                            <TableCell align="right" className="font-bold text-foreground">
                                                {row.total_krs}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </ResponsiveTable>
                    </div>
                </div>

                {/* Drill-down Detail List (If Active) */}
                {drilldown && (
                    <div className="space-y-3 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-foreground">
                                Detail Mahasiswa ({drilldown.length} Baris Data)
                            </h2>
                        </div>

                        <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
                            <ResponsiveTable>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">No</TableHead>
                                        <TableHead>Mahasiswa & NIM</TableHead>
                                        <TableHead>Program Studi</TableHead>
                                        <TableHead align="center" className="w-32">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drilldown.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-6">
                                                Tidak ada mahasiswa ditemukan untuk kriteria ini.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        drilldown.map((item, idx) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                                                <TableCell>
                                                    <StackedCell
                                                        primary={item.mahasiswa?.nama_lengkap || '-'}
                                                        secondary={`NIM: ${item.mahasiswa?.nim || '-'}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {item.mahasiswa?.programStudi?.nama || '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {getStatusBadge(item.status)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </ResponsiveTable>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

LaporanKrsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan & Monitoring', href: '#' },
        { title: 'Laporan KRS', href: '/laporan/krs' },
    ],
};
