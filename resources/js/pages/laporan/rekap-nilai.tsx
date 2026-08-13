import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Award, Download, Filter, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type RekapRow = {
    kelas_kuliah_id: number;
    nama_kelas: string;
    kode_mk: string;
    nama_mk: string;
    total_sks: number;
    nama_prodi: string;
    nama_dosen: string | null;
    rata_rata: number;
    count_a: number;
    count_b: number;
    count_c: number;
    count_d: number;
    count_e: number;
    count_belum_final: number;
    total_mahasiswa: number;
};

type Option = {
    id: number;
    nama: string;
    kode?: string;
    is_active?: boolean;
};


type KelasOption = {
    id: number;
    nama_kelas: string;
    kurikulum_matakuliah?: {
        matakuliah?: {
            nama: string;
            kode: string;
        };
    };
};

export default function RekapNilaiIndex({
    rekap = [],
    scopedDosenId = null,
    tahunAjarans = [],
    programStudis = [],
    kelases = [],
    filters = { tahun_ajaran_id: null, kelas_kuliah_id: null, program_studi_id: null },
}: {
    rekap: RekapRow[];
    scopedDosenId: number | null;
    tahunAjarans: Option[];
    programStudis: Option[];
    kelases: KelasOption[];
    filters: { tahun_ajaran_id: number | null; kelas_kuliah_id: number | null; program_studi_id: number | null };
}) {
    const [selectedTahun, setSelectedTahun] = useState<string>(filters.tahun_ajaran_id ? String(filters.tahun_ajaran_id) : '');
    const [selectedKelas, setSelectedKelas] = useState<string>(filters.kelas_kuliah_id ? String(filters.kelas_kuliah_id) : 'all');
    const [selectedProdi, setSelectedProdi] = useState<string>(filters.program_studi_id ? String(filters.program_studi_id) : 'all');

    const handleFilterChange = (tahun: string, kelas: string, prodi: string) => {
        router.get('/laporan/rekap-nilai', {
            tahun_ajaran_id: tahun || undefined,
            kelas_kuliah_id: kelas !== 'all' ? kelas : undefined,
            program_studi_id: prodi !== 'all' ? prodi : undefined,
        }, { preserveState: true });
    };

    const handleExportCsv = () => {
        const query = new URLSearchParams({
            tahun_ajaran_id: selectedTahun || '',
            kelas_kuliah_id: selectedKelas !== 'all' ? selectedKelas : '',
            program_studi_id: selectedProdi !== 'all' ? selectedProdi : '',
        }).toString();
        window.location.href = `/laporan/rekap-nilai/export?${query}`;
    };

    const totalPeserta = rekap.reduce((acc, r) => acc + Number(r.total_mahasiswa), 0);
    const totalA = rekap.reduce((acc, r) => acc + Number(r.count_a), 0);
    const totalB = rekap.reduce((acc, r) => acc + Number(r.count_b), 0);
    const totalC = rekap.reduce((acc, r) => acc + Number(r.count_c), 0);
    const totalD = rekap.reduce((acc, r) => acc + Number(r.count_d), 0);
    const totalE = rekap.reduce((acc, r) => acc + Number(r.count_e), 0);
    const totalBelumFinal = rekap.reduce((acc, r) => acc + Number(r.count_belum_final), 0);

    return (
        <>
            <Head title="Rekap Nilai Perkuliahan" />

            <div className="p-6 space-y-6 font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <Award className="size-5 text-emerald-600" />
                            Rekapitulasi Nilai & Distribusi Huruf Mutu
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Laporan agregat nilai akhir kelas, rerata kelas, dan status kelengkapan penilaian.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCsv}
                        className="text-xs flex items-center gap-1.5"
                    >
                        <Download className="size-4 text-emerald-600" />
                        <span>Export CSV</span>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-border bg-card shadow-xs">
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-2">
                        <Filter className="size-3.5" />
                        <span>Filter:</span>
                    </div>

                    <div className="w-48">
                        <Select
                            value={selectedTahun}
                            onValueChange={(val) => {
                                setSelectedTahun(val);
                                handleFilterChange(val, selectedKelas, selectedProdi);
                            }}
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

                    <div className="w-56">
                        <Select
                            value={selectedProdi}
                            onValueChange={(val) => {
                                setSelectedProdi(val);
                                handleFilterChange(selectedTahun, selectedKelas, val);
                            }}
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

                    <div className="w-64">
                        <Select
                            value={selectedKelas}
                            onValueChange={(val) => {
                                setSelectedKelas(val);
                                handleFilterChange(selectedTahun, val, selectedProdi);
                            }}
                        >
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Semua Kelas Kuliah" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">Semua Kelas Kuliah</SelectItem>
                                {kelases.map((k) => (
                                    <SelectItem key={k.id} value={String(k.id)} className="text-xs">
                                        {k.kurikulum_matakuliah?.matakuliah?.kode} - {k.kurikulum_matakuliah?.matakuliah?.nama} ({k.nama_kelas})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Grade Distribution Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                    <div className="p-3 rounded-lg border border-border bg-card shadow-xs text-center">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Peserta</p>
                        <p className="text-xl font-bold text-foreground mt-0.5">{totalPeserta}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
                        <p className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Nilai A</p>
                        <p className="text-xl font-bold text-emerald-600 mt-0.5">{totalA}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-center">
                        <p className="text-[10px] font-semibold text-blue-800 dark:text-blue-300 uppercase">Nilai B</p>
                        <p className="text-xl font-bold text-blue-600 mt-0.5">{totalB}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 text-center">
                        <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 uppercase">Nilai C</p>
                        <p className="text-xl font-bold text-amber-600 mt-0.5">{totalC}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 text-center">
                        <p className="text-[10px] font-semibold text-orange-800 dark:text-orange-300 uppercase">Nilai D</p>
                        <p className="text-xl font-bold text-orange-600 mt-0.5">{totalD}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20 text-center">
                        <p className="text-[10px] font-semibold text-red-800 dark:text-red-300 uppercase">Nilai E</p>
                        <p className="text-xl font-bold text-red-600 mt-0.5">{totalE}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 text-center">
                        <p className="text-[10px] font-semibold text-purple-800 dark:text-purple-300 uppercase">Belum Final</p>
                        <p className="text-xl font-bold text-purple-600 mt-0.5">{totalBelumFinal}</p>
                    </div>
                </div>

                {/* Rekap Table */}
                <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
                    <ResponsiveTable>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No</TableHead>
                                <TableHead>Mata Kuliah & Kelas</TableHead>
                                <TableHead>Dosen Pengajar</TableHead>
                                <TableHead align="center" className="w-20">Peserta</TableHead>
                                <TableHead align="center" className="w-12 text-emerald-600">A</TableHead>
                                <TableHead align="center" className="w-12 text-blue-600">B</TableHead>
                                <TableHead align="center" className="w-12 text-amber-600">C</TableHead>
                                <TableHead align="center" className="w-12 text-orange-600">D</TableHead>
                                <TableHead align="center" className="w-12 text-red-600">E</TableHead>
                                <TableHead align="center" className="w-24 text-purple-600">Belum Final</TableHead>
                                <TableHead align="right" className="w-24 font-bold">Rerata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rekap.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center text-xs text-muted-foreground py-8">
                                        Tidak ada data rekap nilai untuk filter yang dipilih.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rekap.map((row, idx) => (
                                    <TableRow key={row.kelas_kuliah_id}>
                                        <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                                        <TableCell>
                                            <StackedCell
                                                primary={`${row.kode_mk} - ${row.nama_mk} (${row.nama_kelas})`}
                                                secondary={`Prodi: ${row.nama_prodi} • ${row.total_sks} SKS`}
                                            />
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {row.nama_dosen || '-'}
                                        </TableCell>
                                        <TableCell align="center" className="font-semibold text-foreground">
                                            {row.total_mahasiswa}
                                        </TableCell>
                                        <TableCell align="center" className="font-semibold text-emerald-600">
                                            {row.count_a}
                                        </TableCell>
                                        <TableCell align="center" className="font-semibold text-blue-600">
                                            {row.count_b}
                                        </TableCell>
                                        <TableCell align="center" className="font-semibold text-amber-600">
                                            {row.count_c}
                                        </TableCell>
                                        <TableCell align="center" className="font-semibold text-orange-600">
                                            {row.count_d}
                                        </TableCell>
                                        <TableCell align="center" className="font-semibold text-red-600">
                                            {row.count_e}
                                        </TableCell>
                                        <TableCell align="center" className="font-semibold text-purple-600">
                                            {row.count_belum_final}
                                        </TableCell>
                                        <TableCell align="right" className="font-bold text-emerald-600 text-sm">
                                            {Number(row.rata_rata).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </ResponsiveTable>
                </div>
            </div>
        </>
    );
}
