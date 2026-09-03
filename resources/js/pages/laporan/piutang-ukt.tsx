import { Head, router } from '@inertiajs/react';
import { AlertCircle, CreditCard, Download, Filter, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type SummaryProdi = {
    program_studi_id: number;
    nama_prodi: string;
    jumlah_mahasiswa_menunggak: number;
    total_nominal_tagihan: number;
    total_nominal_dibayar: number;
    total_piutang: number;
};

type TagihanRow = {
    id: number;
    status: string;
    nominal: number;
    sisa_piutang: number;
    jatuh_tempo: string | null;
    mahasiswa?: {
        id: number;
        nim: string;
        nama_lengkap: string;
        programStudi?: {
            nama: string;
        };
    };
};

type Option = {
    id: number;
    nama: string;
    kode?: string;
    is_active?: boolean;
};


export default function LaporanPiutangUktIndex({
    summaryPerProdi = [],
    totalPiutangKeseluruhan = 0,
    totalMahasiswaMenunggak = 0,
    tagihans = [],
    tahunAjarans = [],
    programStudis = [],
    filters = { tahun_ajaran_id: null, program_studi_id: null },
}: {
    summaryPerProdi?: SummaryProdi[];
    totalPiutangKeseluruhan?: number;
    totalMahasiswaMenunggak?: number;
    tagihans?: TagihanRow[];
    tahunAjarans?: Option[];
    programStudis?: Option[];
    filters?: { tahun_ajaran_id: number | null; program_studi_id: number | null };
}) {
    const safeFilters = filters || { tahun_ajaran_id: null, program_studi_id: null };
    const safeSummary = Array.isArray(summaryPerProdi) ? summaryPerProdi : [];
    const safeTagihans = Array.isArray(tagihans) ? tagihans : [];
    const safeTahunAjarans = Array.isArray(tahunAjarans) ? tahunAjarans : [];
    const safeProgramStudis = Array.isArray(programStudis) ? programStudis : [];

    const selectedTahun = safeFilters.tahun_ajaran_id ? String(safeFilters.tahun_ajaran_id) : (safeTahunAjarans[0]?.id ? String(safeTahunAjarans[0].id) : '');
    const selectedProdi = safeFilters.program_studi_id ? String(safeFilters.program_studi_id) : 'all';

    const handleFilterChange = (tahun: string, prodi: string) => {
        router.get('/laporan/piutang-ukt', {
            tahun_ajaran_id: tahun || undefined,
            program_studi_id: prodi !== 'all' ? prodi : undefined,
        }, { preserveState: true });
    };

    const handleExportCsv = () => {
        const query = new URLSearchParams({
            tahun_ajaran_id: selectedTahun || '',
            program_studi_id: selectedProdi !== 'all' ? selectedProdi : '',
        }).toString();
        window.location.href = `/laporan/piutang-ukt/export?${query}`;
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'terlambat':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">TERLAMBAT</span>;
            case 'dicicil':
            case 'parsial':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">DICICIL</span>;
            case 'belum_bayar':
            case 'menunggu_pembayaran':
            default:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">BELUM BAYAR</span>;
        }
    };

    return (
        <>
            <Head title="Laporan Piutang UKT" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <CreditCard className="size-5 text-emerald-600" />
                            Laporan Piutang & Tunggakan UKT
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Monitoring piutang pembayaran UKT mahasiswa aktif per semester dan program studi.
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

                {/* Filters */}
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 p-4 rounded-lg border border-border bg-card shadow-xs">
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-2">
                        <Filter className="size-3.5" />
                        <span>Filter:</span>
                    </div>

                    <div className="w-full sm:w-48">
                        <Select
                            value={selectedTahun}
                            onValueChange={(val) => handleFilterChange(val, selectedProdi)}
                        >
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Pilih Tahun Ajaran" />
                            </SelectTrigger>
                            <SelectContent>
                                {safeTahunAjarans.map((ta) => (
                                    <SelectItem key={ta.id} value={String(ta.id)} className="text-xs">
                                        {ta.nama} {ta.is_active ? '(Aktif)' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:w-56">
                        <Select
                            value={selectedProdi}
                            onValueChange={(val) => handleFilterChange(selectedTahun, val)}
                        >
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Semua Program Studi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">Semua Program Studi</SelectItem>
                                {safeProgramStudis.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                                        {p.kode} - {p.nama}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Top Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-red-200 bg-red-50/40 dark:bg-red-950/20 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 shrink-0">
                            <AlertCircle className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-red-800 dark:text-red-300">Total Piutang UKT Tertunggak</p>
                            <p className="text-2xl font-bold text-red-600 mt-0.5">{formatRupiah(totalPiutangKeseluruhan)}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 shrink-0">
                            <Users className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Jumlah Mahasiswa Menunggak</p>
                            <p className="text-2xl font-bold text-amber-600 mt-0.5">{totalMahasiswaMenunggak} Mahasiswa</p>
                        </div>
                    </div>
                </div>

                {/* Summary per Prodi */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">Ringkasan Total Piutang per Program Studi</h2>
                    <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Program Studi</TableHead>
                                    <TableHead align="center" className="w-36">Mhs Menunggak</TableHead>
                                    <TableHead align="right" className="w-40">Total Tagihan</TableHead>
                                    <TableHead align="right" className="w-40">Total Dibayar</TableHead>
                                    <TableHead align="right" className="w-44 font-bold text-red-600">Total Piutang</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {safeSummary.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">
                                            Tidak ada data piutang untuk filter yang dipilih.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    safeSummary.map((row, idx) => (
                                        <TableRow key={row.program_studi_id}>
                                            <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                                            <TableCell className="font-semibold text-foreground">{row.nama_prodi}</TableCell>
                                            <TableCell align="center" className="font-semibold text-amber-600">
                                                {row.jumlah_mahasiswa_menunggak} Mhs
                                            </TableCell>
                                            <TableCell align="right" className="text-xs text-muted-foreground">
                                                {formatRupiah(row.total_nominal_tagihan)}
                                            </TableCell>
                                            <TableCell align="right" className="text-xs text-emerald-600 font-medium">
                                                {formatRupiah(row.total_nominal_dibayar)}
                                            </TableCell>
                                            <TableCell align="right" className="font-bold text-red-600">
                                                {formatRupiah(row.total_piutang)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </ResponsiveTable>
                    </div>
                </div>

                {/* Detailed Student List */}
                <div className="space-y-3 pt-2">
                    <h2 className="text-sm font-semibold text-foreground">Daftar Mahasiswa Menunggak Pembayaran</h2>
                    <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Mahasiswa & NIM</TableHead>
                                    <TableHead className="hidden md:table-cell">Program Studi</TableHead>
                                    <TableHead align="center" className="w-28">Status</TableHead>
                                    <TableHead align="right" className="w-36 hidden sm:table-cell">Total Tagihan</TableHead>
                                    <TableHead align="right" className="w-36 font-bold text-red-600">Sisa Piutang</TableHead>
                                    <TableHead align="center" className="w-32 hidden sm:table-cell">Jatuh Tempo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {safeTagihans.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">
                                            Tidak ada tunggakan mahasiswa aktif.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tagihans.map((t, idx) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                                            <TableCell>
                                                <StackedCell
                                                    primary={t.mahasiswa?.nama_lengkap || '-'}
                                                    secondary={`NIM: ${t.mahasiswa?.nim || '-'}`}
                                                    tertiary={t.mahasiswa?.programStudi?.nama ? `Prodi: ${t.mahasiswa?.programStudi?.nama}` : undefined}
                                                />
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                                                {t.mahasiswa?.programStudi?.nama || '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {getStatusBadge(t.status)}
                                            </TableCell>
                                            <TableCell align="right" className="text-xs text-muted-foreground hidden sm:table-cell">
                                                {formatRupiah(t.nominal)}
                                            </TableCell>
                                            <TableCell align="right" className="font-bold text-red-600">
                                                {formatRupiah(t.sisa_piutang)}
                                            </TableCell>
                                            <TableCell align="center" className="text-xs text-muted-foreground hidden sm:table-cell">
                                                {t.jatuh_tempo ? new Date(t.jatuh_tempo).toLocaleDateString('id-ID') : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </ResponsiveTable>
                    </div>
                </div>
            </div>
        </>
    );
}

LaporanPiutangUktIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan & Monitoring', href: '#' },
        { title: 'Piutang UKT', href: '/laporan/piutang-ukt' },
    ],
};
