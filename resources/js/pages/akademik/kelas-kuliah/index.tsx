import { Head, router, useForm, usePage, Link } from '@inertiajs/react';
import { 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    Edit, 
    MapPin, 
    Plus, 
    Trash2, 
    Users, 
    Search, 
    RotateCcw, 
    Printer, 
    SlidersHorizontal, 
    BookOpen, 
    Lock, 
    Unlock, 
    Eye, 
    Calendar,
    ChevronDown,
    GraduationCap,
    Layers,
    FileSpreadsheet,
    FileText,
    Award
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
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { SharedData, BreadcrumbItem } from '@/types';

type Matakuliah = {
    id: number;
    kode: string;
    nama: string;
    sks: number;
    metode_pembelajaran?: string;
};

type KurikulumMatakuliah = {
    id: number;
    semester: number;
    kurikulum_prodi_id?: number;
    matakuliah?: Matakuliah;
    kurikulum_prodi?: {
        id: number;
        nama: string;
        tahun_mulai: number;
        program_studi?: { id: number; kode: string; nama: string; jenjang: string };
    };
};

type TahunAjaran = {
    id: number;
    nama: string;
    is_active?: boolean;
};

type Dosen = {
    id: number;
    nama_lengkap: string;
    nidn: string;
};

type DosenPengajar = {
    id: number;
    peran: string;
    dosen_id?: number;
    dosen?: Dosen;
};

type RuangKuliah = {
    id: number;
    kode: string;
    nama: string;
    kapasitas?: number;
};

type JadwalPerkuliahan = {
    id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruang_kuliah_id?: number | null;
    ruang_kuliah?: RuangKuliah | null;
};

type KelasKuliah = {
    id: number;
    kurikulum_matakuliah_id: number;
    tahun_ajaran_id: number;
    nama_kelas: string;
    kuota: number;
    sistem_kuliah?: string;
    is_nilai_dikunci?: boolean;
    krs_details_count?: number;
    kurikulum_matakuliah?: KurikulumMatakuliah;
    tahun_ajaran?: TahunAjaran;
    dosen_pengajars?: DosenPengajar[];
    jadwal_perkuliahans?: JadwalPerkuliahan[];
};

type ProgramStudi = {
    id: number;
    kode: string;
    nama: string;
    jenjang?: string;
};

type Kurikulum = {
    id: number;
    nama: string;
    tahun_mulai: number;
    program_studi?: ProgramStudi;
};

export default function KelasKuliahIndex({
    kelases = [],
    tahunAjarans = [],
    kurikulumMatakuliahs = [],
    dosens = [],
    ruangs = [],
    programStudis = [],
    kurikulums = [],
    filters = { tahun_ajaran_id: 'all', program_studi_id: 'all', kurikulum_id: 'all', sistem_kuliah: 'all', status_kelas: 'all', search: '' },
}: {
    kelases: KelasKuliah[];
    tahunAjarans: TahunAjaran[];
    kurikulumMatakuliahs: KurikulumMatakuliah[];
    dosens: Dosen[];
    ruangs: RuangKuliah[];
    programStudis?: ProgramStudi[];
    kurikulums?: Kurikulum[];
    filters?: {
        tahun_ajaran_id?: string | number;
        program_studi_id?: string | number;
        kurikulum_id?: string | number;
        sistem_kuliah?: string;
        status_kelas?: string;
        search?: string;
    };
}) {
    const { auth, errors } = usePage<SharedData & { errors?: Record<string, string> }>().props;
    const canManage = auth?.user?.roles?.some((r: any) => ['superadmin', 'admin_akademik'].includes(typeof r === 'string' ? r : r?.name));
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingKelas, setEditingKelas] = useState<KelasKuliah | null>(null);

    // Filters matching Photo 5
    const [filterTahun, setFilterTahun] = useState(String(filters.tahun_ajaran_id || 'all'));
    const [filterProdi, setFilterProdi] = useState(String(filters.program_studi_id || 'all'));
    const [filterKurikulum, setFilterKurikulum] = useState(String(filters.kurikulum_id || 'all'));
    const [filterSistem, setFilterSistem] = useState(String(filters.sistem_kuliah || 'all'));
    const [filterStatus, setFilterStatus] = useState(String(filters.status_kelas || 'all'));
    const [filterSearch, setFilterSearch] = useState(filters.search || '');

    // Checkbox selection
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Perkuliahan', href: '/akademik/kelas-kuliah' },
        { title: 'Data Kelas', href: '/akademik/kelas-kuliah' },
        { title: 'Kelas Kuliah', href: '/akademik/kelas-kuliah' },
    ];

    const handleApplyFilters = () => {
        router.get('/akademik/kelas-kuliah', {
            tahun_ajaran_id: filterTahun !== 'all' ? filterTahun : undefined,
            program_studi_id: filterProdi !== 'all' ? filterProdi : undefined,
            kurikulum_id: filterKurikulum !== 'all' ? filterKurikulum : undefined,
            sistem_kuliah: filterSistem !== 'all' ? filterSistem : undefined,
            status_kelas: filterStatus !== 'all' ? filterStatus : undefined,
            search: filterSearch || undefined,
        }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setFilterTahun('all');
        setFilterProdi('all');
        setFilterKurikulum('all');
        setFilterSistem('all');
        setFilterStatus('all');
        setFilterSearch('');
        router.get('/akademik/kelas-kuliah', {}, { preserveState: true });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(kelases.map(k => k.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    };

    const createForm = useForm({
        kurikulum_matakuliah_id: kurikulumMatakuliahs[0]?.id || '',
        tahun_ajaran_id: filterTahun !== 'all' ? filterTahun : (tahunAjarans[0]?.id || ''),
        nama_kelas: 'A',
        kuota: 40,
        sistem_kuliah: 'reguler',
        dosen_ids: [] as number[],
        ruang_kuliah_id: ruangs[0]?.id || '',
        hari: 'Senin',
        jam_mulai: '08:00',
        jam_selesai: '10:30',
    });

    const editForm = useForm({
        kurikulum_matakuliah_id: kurikulumMatakuliahs[0]?.id || '',
        tahun_ajaran_id: tahunAjarans[0]?.id || '',
        nama_kelas: 'A',
        kuota: 40,
        sistem_kuliah: 'reguler',
        dosen_ids: [] as number[],
        ruang_kuliah_id: ruangs[0]?.id || '',
        hari: 'Senin',
        jam_mulai: '08:00',
        jam_selesai: '10:30',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/akademik/kelas-kuliah', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingKelas) {
return;
}

        editForm.put(`/akademik/kelas-kuliah/${editingKelas.id}`, {
            onSuccess: () => {
                setEditingKelas(null);
                editForm.reset();
            },
        });
    };

    const openEditModal = (item: KelasKuliah) => {
        const jadwal = item.jadwal_perkuliahans && item.jadwal_perkuliahans[0];
        const ruangId = (jadwal?.ruang_kuliah_id || (jadwal?.ruang_kuliah ? jadwal.ruang_kuliah.id : '')) || '';
        const assignedDosenIds = item.dosen_pengajars ? item.dosen_pengajars.map(dp => dp.dosen_id || dp.dosen?.id).filter(Boolean) as number[] : [];

        setEditingKelas(item);
        editForm.setData({
            kurikulum_matakuliah_id: item.kurikulum_matakuliah_id,
            tahun_ajaran_id: item.tahun_ajaran_id,
            nama_kelas: item.nama_kelas,
            kuota: item.kuota,
            sistem_kuliah: item.sistem_kuliah || 'reguler',
            dosen_ids: assignedDosenIds.length > 0 ? assignedDosenIds : (dosens[0] ? [dosens[0].id] : []),
            ruang_kuliah_id: ruangId || (ruangs[0] ? ruangs[0].id : ''),
            hari: jadwal?.hari || 'Senin',
            jam_mulai: jadwal?.jam_mulai ? jadwal.jam_mulai.substring(0, 5) : '08:00',
            jam_selesai: jadwal?.jam_selesai ? jadwal.jam_selesai.substring(0, 5) : '10:30',
        });
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (item: KelasKuliah) => {
        confirm({
            title: 'Hapus Kelas Kuliah',
            description: `Apakah Anda yakin ingin menghapus kelas ${item.nama_kelas} (${item.kurikulum_matakuliah?.matakuliah?.nama || 'Mata Kuliah'})? Seluruh penugasan dosen dan jadwal pada kelas ini akan ikut terhapus.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/akademik/kelas-kuliah/${item.id}`);
            },
        });
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) {
return;
}

        confirm({
            title: 'Hapus Kelas Terpilih',
            description: `Apakah Anda yakin ingin menghapus ${selectedIds.length} kelas terpilih beserta jadwal dan penugasan dosennya?`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus Semua',
            onConfirm: () => {
                // Sequential or bulk delete
                selectedIds.forEach(id => {
                    router.delete(`/akademik/kelas-kuliah/${id}`);
                });
                setSelectedIds([]);
            },
        });
    };

    const conflictErrorMessage = errors?.jadwal || errors?.ruang_kuliah_id || errors?.dosen_ids || createForm.errors.ruang_kuliah_id || createForm.errors.dosen_ids || editForm.errors.ruang_kuliah_id || editForm.errors.dosen_ids;

    return (
        <>
            {confirmDialog}
            <Head title="Kelas Kuliah - Daftar Kelas & Jadwal Perkuliahan" />

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Header Title (Family & Senior Friendly) */}
                <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <BookOpen className="w-7 h-7 text-emerald-600" />
                        Kelas Kuliah
                        <span className="text-base font-normal text-slate-500">Daftar Kelas & Jadwal Perkuliahan</span>
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Kelola pembagian kelas kuliah, kurikulum, kapasitas kuota mahasiswa, dosen pengampu, dan ruangan jadwal mingguan.
                    </p>
                </div>

                {/* Error Banner Bentrok */}
                {conflictErrorMessage && (
                    <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 text-rose-800 text-sm font-semibold flex items-center gap-3 shadow-xs">
                        <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                        <span>{conflictErrorMessage}</span>
                    </div>
                )}

                {/* Top Filter Card (Matching Reference Photo 5 - 2 Columns, Large Clear Inputs) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-amber-500 p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Row 1: Periode & Prodi */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <label className="w-40 text-sm font-bold text-amber-900">Periode Akademik</label>
                            <select
                                value={filterTahun}
                                onChange={e => setFilterTahun(e.target.value)}
                                className="flex-1 px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 transition"
                            >
                                <option value="all">-- Semua Periode --</option>
                                {tahunAjarans.map(ta => (
                                    <option key={ta.id} value={ta.id}>
                                        {ta.nama} {ta.is_active ? '(Aktif)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <label className="w-40 text-sm font-bold text-amber-900">Prodi Pengampu</label>
                            <select
                                value={filterProdi}
                                onChange={e => setFilterProdi(e.target.value)}
                                className="flex-1 px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 transition"
                            >
                                <option value="all">-- Semua Program Studi --</option>
                                {programStudis.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.jenjang || 'S1'} - {p.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Row 2: Kurikulum & Sistem Kuliah */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <label className="w-40 text-sm font-bold text-amber-900">Kurikulum</label>
                            <select
                                value={filterKurikulum}
                                onChange={e => setFilterKurikulum(e.target.value)}
                                className="flex-1 px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 transition"
                            >
                                <option value="all">-- Semua Kurikulum --</option>
                                {kurikulums.map(k => (
                                    <option key={k.id} value={k.id}>
                                        Kurikulum {k.nama} ({k.tahun_mulai})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <label className="w-40 text-sm font-bold text-amber-900">Sistem Kuliah</label>
                            <select
                                value={filterSistem}
                                onChange={e => setFilterSistem(e.target.value)}
                                className="flex-1 px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 transition"
                            >
                                <option value="all">-- Semua Sistem Kuliah --</option>
                                <option value="reguler">Reguler (Tatap Muka)</option>
                                <option value="hibrida">Hibrida / Blended</option>
                                <option value="online">Online / Daring</option>
                            </select>
                        </div>

                        {/* Row 3: Jenis Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <label className="w-40 text-sm font-bold text-amber-900">Jenis Status</label>
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="flex-1 px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 transition"
                            >
                                <option value="all">-- Semua Jenis Status --</option>
                                <option value="terbuka">Status Nilai Terbuka</option>
                                <option value="dikunci">Status Nilai Dikunci</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Action & Search Bar (Matching Reference Photo 5) */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                    {/* Left: Search & Filter Trigger */}
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white"
                            defaultValue="all"
                        >
                            <option value="all">-- Semua --</option>
                        </select>

                        <div className="relative w-64 sm:w-80">
                            <input
                                type="text"
                                placeholder="Cari Kelas Kuliah / Matakuliah..."
                                value={filterSearch}
                                onChange={e => setFilterSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleApplyFilters}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition"
                        >
                            <Search className="w-4 h-4" /> Cari
                        </button>

                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-xs transition"
                            title="Reset Filter"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Right Action Buttons (+ Tambah, Hapus, Aksi, Cetak) */}
                    <div className="flex flex-wrap items-center gap-2">
                        {canManage && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
                                >
                                    <Plus className="w-4 h-4 stroke-[3]" /> Tambah
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    disabled={selectedIds.length === 0}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-4 h-4" /> Hapus {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
                                </button>
                            </>
                        )}

                        <div className="relative group">
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition"
                            >
                                Aksi <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 hidden group-hover:block z-20">
                                <button
                                    type="button"
                                    onClick={() => handleApplyFilters()}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Lock className="w-4 h-4 text-amber-600" /> Kunci Nilai Terpilih
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleApplyFilters()}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Unlock className="w-4 h-4 text-emerald-600" /> Buka Kunci Nilai
                                </button>
                            </div>
                        </div>

                        <div className="relative group">
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition"
                            >
                                <Printer className="w-4 h-4" /> Cetak <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 hidden group-hover:block z-20">
                                <a
                                    href="/laporan/rekap-nilai"
                                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4 text-sky-600" /> Cetak Jadwal Kuliah PDF
                                </a>
                                <a
                                    href="/laporan/rekap-nilai"
                                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Data (Matching Photo 5 with High Usability & Senior-Friendly Typography) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-white text-xs uppercase font-bold tracking-wider">
                                <th className="p-3.5 text-center w-10">
                                    <input
                                        type="checkbox"
                                        checked={kelases.length > 0 && selectedIds.length === kelases.length}
                                        onChange={e => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 rounded text-emerald-600 border-white/40"
                                    />
                                </th>
                                <th className="p-3.5 w-16 text-center">Kur.</th>
                                <th className="p-3.5 min-w-[220px]">Mata Kuliah</th>
                                <th className="p-3.5 min-w-[180px]">Prodi Pengampu</th>
                                <th className="p-3.5 text-center w-20">Nama Kelas</th>
                                <th className="p-3.5 min-w-[180px]">Pengajar</th>
                                <th className="p-3.5 min-w-[200px]">Jadwal Mingguan</th>
                                <th className="p-3.5 text-center w-14">Kap.</th>
                                <th className="p-3.5 text-center w-14">Pst.</th>
                                <th className="p-3.5 text-center w-28">Nilai Dikunci</th>
                                <th className="p-3.5 text-center w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {kelases.map(item => {
                                const mk = item.kurikulum_matakuliah?.matakuliah;
                                const kur = item.kurikulum_matakuliah?.kurikulum_prodi;
                                const prodi = kur?.program_studi;
                                const dosenList = item.dosen_pengajars?.map(dp => dp.dosen?.nama_lengkap).filter(Boolean) || [];
                                const jadwal = item.jadwal_perkuliahans && item.jadwal_perkuliahans[0];
                                const isSelected = selectedIds.includes(item.id);
                                const pesertaCount = item.krs_details_count || 0;

                                return (
                                    <tr
                                        key={item.id}
                                        className={`hover:bg-slate-50/80 transition-colors ${
                                            isSelected ? 'bg-amber-50/60' : ''
                                        }`}
                                    >
                                        {/* Checkbox */}
                                        <td className="p-3.5 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={e => handleSelectOne(item.id, e.target.checked)}
                                                className="w-4 h-4 rounded text-emerald-600 border-slate-300"
                                            />
                                        </td>

                                        {/* Kurikulum Tahun */}
                                        <td className="p-3.5 text-center font-bold text-slate-700">
                                            {kur?.tahun_mulai || '2023'}
                                        </td>

                                        {/* Mata Kuliah */}
                                        <td className="p-3.5">
                                            <div className="font-bold text-slate-900 leading-snug">
                                                {mk ? `${mk.kode} - ${mk.nama}` : 'Mata Kuliah'}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                                <span>({mk?.sks || 0}.00 SKS)</span>
                                                <span className="inline-block px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold text-[10px] border border-sky-200">
                                                    {mk?.metode_pembelajaran || 'Case Method'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Prodi Pengampu */}
                                        <td className="p-3.5 font-medium text-slate-800">
                                            {prodi ? `${prodi.jenjang || 'S1'} - ${prodi.nama}` : 'STAI Al-Yasini'}
                                        </td>

                                        {/* Nama Kelas */}
                                        <td className="p-3.5 text-center font-bold text-slate-900 text-base">
                                            {item.nama_kelas}
                                        </td>

                                        {/* Pengajar */}
                                        <td className="p-3.5 text-slate-800 font-medium">
                                            {dosenList.length > 0 ? (
                                                <div className="space-y-0.5">
                                                    {dosenList.map((d, idx) => (
                                                        <div key={idx} className="leading-snug">{d}</div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-amber-600 text-xs font-semibold">Belum Ditugaskan</span>
                                            )}
                                        </td>

                                        {/* Jadwal Mingguan */}
                                        <td className="p-3.5">
                                            {jadwal ? (
                                                <div className="text-xs text-slate-800">
                                                    <span className="font-semibold text-slate-900">{jadwal.hari}</span>, {jadwal.jam_mulai.substring(0, 5)} s.d {jadwal.jam_selesai.substring(0, 5)}
                                                    <div className="text-slate-500 mt-0.5 font-mono">
                                                        @ {jadwal.ruang_kuliah ? `${jadwal.ruang_kuliah.kode} (${jadwal.ruang_kuliah.nama})` : 'Ruang A3'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>

                                        {/* Kapasitas */}
                                        <td className="p-3.5 text-center font-bold text-slate-800">
                                            {item.kuota}
                                        </td>

                                        {/* Peserta */}
                                        <td className="p-3.5 text-center font-bold text-emerald-700 bg-emerald-50/50 rounded">
                                            {pesertaCount}
                                        </td>

                                        {/* Status Nilai Dikunci */}
                                        <td className="p-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                <Lock className="w-3 h-3" /> Dikunci
                                            </span>
                                        </td>

                                        {/* Aksi */}
                                        <td className="p-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link
                                                    href={`/akademik/presensi?kelas_kuliah_id=${item.id}`}
                                                    className="p-1.5 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
                                                    title="Jurnal & Presensi Perkuliahan"
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/akademik/penilaian?kelas_kuliah_id=${item.id}`}
                                                    className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                                                    title="Pengelolaan & Input Nilai"
                                                >
                                                    <Award className="w-4 h-4" />
                                                </Link>
                                                {canManage && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(item)}
                                                            className="p-1.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                                                            title="Edit Kelas & Jadwal"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item)}
                                                            className="p-1.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                                                            title="Hapus Kelas"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {kelases.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-base font-semibold text-slate-800">Tidak ada jadwal kelas kuliah</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Ubah filter di atas atau klik tombol <strong>+ Tambah</strong> untuk membuat kelas baru.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah Kelas Kuliah (Senior Friendly) */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Plus className="w-5 h-5 text-emerald-600" /> Tambah Kelas & Jadwal Perkuliahan
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Pilih matakuliah, tentukan nama kelas, kapasitas, penugasan dosen, serta hari dan ruangan kuliah.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-bold text-slate-700">Mata Kuliah</Label>
                                <select
                                    value={createForm.data.kurikulum_matakuliah_id}
                                    onChange={e => createForm.setData('kurikulum_matakuliah_id', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                    required
                                >
                                    {kurikulumMatakuliahs.map(km => (
                                        <option key={km.id} value={km.id}>
                                            {km.matakuliah?.kode} - {km.matakuliah?.nama} ({km.matakuliah?.sks} SKS)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-slate-700">Tahun Ajaran</Label>
                                <select
                                    value={createForm.data.tahun_ajaran_id}
                                    onChange={e => createForm.setData('tahun_ajaran_id', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                    required
                                >
                                    {tahunAjarans.map(ta => (
                                        <option key={ta.id} value={ta.id}>{ta.nama}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-xs font-bold text-slate-700">Nama Kelas (A/B/C/A1/B2)</Label>
                                <Input
                                    value={createForm.data.nama_kelas}
                                    onChange={e => createForm.setData('nama_kelas', e.target.value)}
                                    placeholder="Contoh: A, A1, B2"
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-bold text-slate-700">Kapasitas / Kuota</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={createForm.data.kuota}
                                    onChange={e => createForm.setData('kuota', Number(e.target.value))}
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-bold text-slate-700">Sistem Perkuliahan</Label>
                                <select
                                    value={createForm.data.sistem_kuliah}
                                    onChange={e => createForm.setData('sistem_kuliah', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                >
                                    <option value="reguler">Reguler</option>
                                    <option value="hibrida">Hibrida / Blended</option>
                                    <option value="online">Online</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-slate-700">Dosen Pengampu Utama</Label>
                            <select
                                value={createForm.data.dosen_ids[0] || ''}
                                onChange={e => createForm.setData('dosen_ids', [Number(e.target.value)])}
                                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                required
                            >
                                <option value="">-- Pilih Dosen Pengampu --</option>
                                {dosens.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.nama_lengkap} (NIDN: {d.nidn})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                            <div>
                                <Label className="text-xs font-bold text-slate-700">Hari Perkuliahan</Label>
                                <select
                                    value={createForm.data.hari}
                                    onChange={e => createForm.setData('hari', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                >
                                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label className="text-xs font-bold text-slate-700">Jam Mulai</Label>
                                <Input
                                    type="time"
                                    value={createForm.data.jam_mulai}
                                    onChange={e => createForm.setData('jam_mulai', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-bold text-slate-700">Jam Selesai</Label>
                                <Input
                                    type="time"
                                    value={createForm.data.jam_selesai}
                                    onChange={e => createForm.setData('jam_selesai', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-slate-700">Ruangan Kuliah</Label>
                            <select
                                value={createForm.data.ruang_kuliah_id}
                                onChange={e => createForm.setData('ruang_kuliah_id', e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                required
                            >
                                {ruangs.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.kode} - {r.nama} (Kapasitas: {r.kapasitas || 40})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <DialogFooter className="pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                                Simpan Kelas & Jadwal
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Kelas Kuliah */}
            {editingKelas && (
                <Dialog open={!!editingKelas} onOpenChange={() => setEditingKelas(null)}>
                    <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Edit className="w-5 h-5 text-amber-500" /> Edit Kelas & Jadwal Perkuliahan
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Perbarui konfigurasi kelas, kuota, dosen pengampu, dan jadwal ruangan.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Mata Kuliah</Label>
                                    <select
                                        value={editForm.data.kurikulum_matakuliah_id}
                                        onChange={e => editForm.setData('kurikulum_matakuliah_id', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                        required
                                    >
                                        {kurikulumMatakuliahs.map(km => (
                                            <option key={km.id} value={km.id}>
                                                {km.matakuliah?.kode} - {km.matakuliah?.nama} ({km.matakuliah?.sks} SKS)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Tahun Ajaran</Label>
                                    <select
                                        value={editForm.data.tahun_ajaran_id}
                                        onChange={e => editForm.setData('tahun_ajaran_id', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                        required
                                    >
                                        {tahunAjarans.map(ta => (
                                            <option key={ta.id} value={ta.id}>{ta.nama}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Nama Kelas</Label>
                                    <Input
                                        value={editForm.data.nama_kelas}
                                        onChange={e => editForm.setData('nama_kelas', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Kapasitas / Kuota</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={editForm.data.kuota}
                                        onChange={e => editForm.setData('kuota', Number(e.target.value))}
                                        className="mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Sistem Perkuliahan</Label>
                                    <select
                                        value={editForm.data.sistem_kuliah}
                                        onChange={e => editForm.setData('sistem_kuliah', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                    >
                                        <option value="reguler">Reguler</option>
                                        <option value="hibrida">Hibrida / Blended</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-slate-700">Dosen Pengampu</Label>
                                <select
                                    value={editForm.data.dosen_ids[0] || ''}
                                    onChange={e => editForm.setData('dosen_ids', [Number(e.target.value)])}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                    required
                                >
                                    <option value="">-- Pilih Dosen Pengampu --</option>
                                    {dosens.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.nama_lengkap} (NIDN: {d.nidn})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Hari</Label>
                                    <select
                                        value={editForm.data.hari}
                                        onChange={e => editForm.setData('hari', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                    >
                                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Jam Mulai</Label>
                                    <Input
                                        type="time"
                                        value={editForm.data.jam_mulai}
                                        onChange={e => editForm.setData('jam_mulai', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Jam Selesai</Label>
                                    <Input
                                        type="time"
                                        value={editForm.data.jam_selesai}
                                        onChange={e => editForm.setData('jam_selesai', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-slate-700">Ruangan Kuliah</Label>
                                <select
                                    value={editForm.data.ruang_kuliah_id}
                                    onChange={e => editForm.setData('ruang_kuliah_id', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                                    required
                                >
                                    {ruangs.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.kode} - {r.nama} (Kapasitas: {r.kapasitas || 40})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <DialogFooter className="pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingKelas(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
                                >
                                    Simpan Perubahan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

KelasKuliahIndex.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Perkuliahan', href: '/akademik/kelas-kuliah' },
        { title: 'Data Kelas', href: '/akademik/kelas-kuliah' },
        { title: 'Kelas Kuliah', href: '/akademik/kelas-kuliah' },
    ],
};
