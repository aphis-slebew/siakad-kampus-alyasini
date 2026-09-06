import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    Clock,
    Download,
    Edit,
    ExternalLink,
    Eye,
    FileCheck2,
    FileText,
    GraduationCap,
    MoreVertical,
    Plus,
    RefreshCw,
    Search,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    Upload,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { DosenOption, DosenSearchCombobox } from '@/components/dosen-search-combobox';
import { EmptyState } from '@/components/empty-state';
import { MasterDataNav } from '@/components/master-data-nav';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface PegawaiOption {
    id: number;
    nama_lengkap: string;
    nip_internal?: string | null;
    jabatan_struktural?: string | null;
    status_kepegawaian?: string | null;
    foto_url?: string | null;
}

export interface Fakultas {
    id: number;
    dekan_dosen_id?: number | null;
    wakil_dekan_dosen_id?: number | null;
    wakil_dekan_1_dosen_id?: number | null;
    wakil_dekan_2_dosen_id?: number | null;
    wakil_dekan_3_dosen_id?: number | null;
    wakil_dekan_4_dosen_id?: number | null;
    ketua_gpmf_dosen_id?: number | null;
    kepala_tata_usaha_pegawai_id?: number | null;
    kode: string;
    nama: string;
    nama_en?: string | null;
    nama_singkat?: string | null;
    no_sk_pendirian?: string | null;
    tanggal_sk_pendirian?: string | null;
    file_sk_pendirian_path?: string | null;
    file_sk_pendirian_url?: string | null;
    no_sk_izin_operasional?: string | null;
    tanggal_sk_izin_operasional?: string | null;
    file_sk_izin_operasional_path?: string | null;
    file_sk_izin_operasional_url?: string | null;
    alamat?: string | null;
    telepon?: string | null;
    email?: string | null;
    website?: string | null;
    tahun_berdiri?: number | string | null;
    periode_berdiri?: string | null;
    status: string;
    luas_m2?: string | null;
    dekan_nama?: string | null;
    dekan_gelar_depan?: string | null;
    dekan_gelar_belakang?: string | null;
    dekan_nidn?: string | null;
    dekan_nama_lengkap_bergelar?: string | null;
    wakil_dekan_1?: string | null;
    wakil_dekan_2?: string | null;
    wakil_dekan_3?: string | null;
    wakil_dekan_4?: string | null;
    wakil_dekan_1_nama_lengkap_bergelar?: string | null;
    wakil_dekan_2_nama_lengkap_bergelar?: string | null;
    wakil_dekan_3_nama_lengkap_bergelar?: string | null;
    wakil_dekan_4_nama_lengkap_bergelar?: string | null;
    ketua_gpmf_nama_lengkap_bergelar?: string | null;
    kepala_tata_usaha_nama_lengkap?: string | null;
    id_feeder?: string | null;
    last_synced_at?: string | null;
    sync_status?: 'belum_sinkron' | 'sinkron' | 'gagal_sinkron' | null;
    visi?: string | null;
    misi?: string | null;
    program_studis_count?: number;
    mahasiswas_count?: number;
    dekan?: {
        id: number;
        nama_lengkap: string;
        nama_bergelar?: string;
        nidn?: string | null;
        foto_url?: string | null;
        status_kepegawaian?: string | null;
        program_studi?: {
            id: number;
            nama: string;
        } | null;
    } | null;
}

export interface StatsData {
    total_fakultas: number;
    total_fakultas_aktif: number;
    total_prodi_terdistribusi: number;
    fakultas_dengan_dekan: number;
    total_mahasiswa_aktif: number;
}

interface FakultasIndexProps {
    fakultas: Fakultas[];
    stats?: StatsData;
    dosens?: DosenOption[];
    pegawais?: PegawaiOption[];
}

export default function FakultasIndex({
    fakultas = [],
    stats = {
        total_fakultas: 0,
        total_fakultas_aktif: 0,
        total_prodi_terdistribusi: 0,
        fakultas_dengan_dekan: 0,
        total_mahasiswa_aktif: 0,
    },
    dosens = [],
    pegawais = [],
}: FakultasIndexProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'semua' | 'aktif' | 'nonaktif'>('semua');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFakultas, setEditingFakultas] = useState<Fakultas | null>(null);
    const [activeTab, setActiveTab] = useState<'identitas' | 'legalitas' | 'pimpinan' | 'kontak' | 'visi_misi'>('identitas');

    // PDF Preview Modal
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [pdfPreviewTitle, setPdfPreviewTitle] = useState<string>('');

    const form = useForm({
        kode: '',
        nama: '',
        nama_en: '',
        nama_singkat: '',
        no_sk_pendirian: '',
        tanggal_sk_pendirian: '',
        no_sk_izin_operasional: '',
        tanggal_sk_izin_operasional: '',
        status: 'aktif',
        dekan_dosen_id: null as number | null,
        wakil_dekan_dosen_id: null as number | null,
        wakil_dekan_1_dosen_id: null as number | null,
        wakil_dekan_2_dosen_id: null as number | null,
        wakil_dekan_3_dosen_id: null as number | null,
        wakil_dekan_4_dosen_id: null as number | null,
        ketua_gpmf_dosen_id: null as number | null,
        kepala_tata_usaha_pegawai_id: null as number | null,
        dekan_nama: '',
        dekan_gelar_depan: '',
        dekan_gelar_belakang: '',
        dekan_nidn: '',
        wakil_dekan_1: '',
        wakil_dekan_2: '',
        wakil_dekan_3: '',
        wakil_dekan_4: '',
        alamat: '',
        telepon: '',
        email: '',
        website: '',
        tahun_berdiri: '' as string | number,
        periode_berdiri: '',
        luas_m2: '',
        visi: '',
        misi: '',
        id_feeder: '',
        file_sk_pendirian: null as File | null,
        file_sk_izin_operasional: null as File | null,
    });

    const selectedDekanDosen = useMemo(() => {
        if (!form.data.dekan_dosen_id) {
            return null;
        }
        return dosens.find((d) => d.id === Number(form.data.dekan_dosen_id)) || null;
    }, [form.data.dekan_dosen_id, dosens]);

    const handleDekanSelect = (dosen: DosenOption) => {
        form.setData((prev) => ({
            ...prev,
            dekan_dosen_id: dosen.id,
            dekan_nama: dosen.nama_lengkap,
            dekan_nidn: dosen.nidn || dosen.niy_nip || '',
            dekan_gelar_depan: dosen.gelar_depan || '',
            dekan_gelar_belakang: dosen.gelar_belakang || '',
        }));
        toast.success(`Dekan diselaraskan dengan data dosen: ${dosen.nama_bergelar || dosen.nama_lengkap}`);
    };

    const handleDekanClear = () => {
        form.setData((prev) => ({
            ...prev,
            dekan_dosen_id: null,
        }));
        toast.info('Pilihan dosen Dekan dilepas. Anda dapat menginput pimpinan secara manual.');
    };

    const openCreateModal = () => {
        form.reset();
        form.clearErrors();
        setEditingFakultas(null);
        setActiveTab('identitas');
        setIsModalOpen(true);
    };

    const openEditModal = (item: Fakultas) => {
        form.clearErrors();
        setEditingFakultas(item);
        setActiveTab('identitas');
        form.setData({
            kode: item.kode || '',
            nama: item.nama || '',
            nama_en: item.nama_en || '',
            nama_singkat: item.nama_singkat || '',
            no_sk_pendirian: item.no_sk_pendirian || '',
            tanggal_sk_pendirian: item.tanggal_sk_pendirian ? item.tanggal_sk_pendirian.substring(0, 10) : '',
            no_sk_izin_operasional: item.no_sk_izin_operasional || '',
            tanggal_sk_izin_operasional: item.tanggal_sk_izin_operasional ? item.tanggal_sk_izin_operasional.substring(0, 10) : '',
            status: item.status || 'aktif',
            dekan_dosen_id: item.dekan_dosen_id || null,
            wakil_dekan_dosen_id: item.wakil_dekan_dosen_id || null,
            wakil_dekan_1_dosen_id: item.wakil_dekan_1_dosen_id || null,
            wakil_dekan_2_dosen_id: item.wakil_dekan_2_dosen_id || null,
            wakil_dekan_3_dosen_id: item.wakil_dekan_3_dosen_id || null,
            wakil_dekan_4_dosen_id: item.wakil_dekan_4_dosen_id || null,
            ketua_gpmf_dosen_id: item.ketua_gpmf_dosen_id || null,
            kepala_tata_usaha_pegawai_id: item.kepala_tata_usaha_pegawai_id || null,
            dekan_nama: item.dekan_nama || '',
            dekan_gelar_depan: item.dekan_gelar_depan || '',
            dekan_gelar_belakang: item.dekan_gelar_belakang || '',
            dekan_nidn: item.dekan_nidn || '',
            wakil_dekan_1: item.wakil_dekan_1 || '',
            wakil_dekan_2: item.wakil_dekan_2 || '',
            wakil_dekan_3: item.wakil_dekan_3 || '',
            wakil_dekan_4: item.wakil_dekan_4 || '',
            alamat: item.alamat || '',
            telepon: item.telepon || '',
            email: item.email || '',
            website: item.website || '',
            tahun_berdiri: item.tahun_berdiri || '',
            periode_berdiri: item.periode_berdiri || '',
            luas_m2: item.luas_m2 || '',
            visi: item.visi || '',
            misi: item.misi || '',
            id_feeder: item.id_feeder || '',
            file_sk_pendirian: null,
            file_sk_izin_operasional: null,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingFakultas) {
            form.transform((data) => ({
                ...data,
                _method: 'put',
            }));
            form.post(`/master/fakultas/${editingFakultas.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingFakultas(null);
                    toast.success('Data fakultas berhasil diperbarui.');
                },
                onError: () => {
                    toast.error('Periksa kembali isian formulir.');
                },
            });
        } else {
            form.transform((data) => data);
            form.post('/master/fakultas', {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                    toast.success('Fakultas baru berhasil ditambahkan.');
                },
                onError: () => {
                    toast.error('Periksa kembali isian formulir.');
                },
            });
        }
    };

    const handleSyncFeeder = (item: Fakultas) => {
        router.post(
            `/master/fakultas/${item.id}/sync-feeder`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Fakultas "${item.nama}" berhasil disinkronkan dengan PDDIKTI Feeder.`);
                },
                onError: () => {
                    toast.error('Gagal menyinkronkan data dengan PDDIKTI Feeder.');
                },
            }
        );
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (item: Fakultas) => {
        const prodiCount = item.program_studis_count || 0;

        if (prodiCount > 0) {
            confirm({
                title: 'Tidak Dapat Menghapus Fakultas',
                description: `Fakultas "${item.nama}" (${item.kode}) masih menaungi ${prodiCount} Program Studi aktif. Sesuai aturan integritas data PDDIKTI, fakultas tidak dapat dihapus sebelum seluruh program studinya dipindahkan atau dinonaktifkan.`,
                variant: 'destructive',
                confirmText: 'Mengerti',
                onConfirm: () => {},
            });
            return;
        }

        confirm({
            title: 'Hapus Fakultas',
            description: `Apakah Anda yakin ingin menghapus fakultas "${item.nama}" (${item.kode})? Tindakan ini akan dicatat ke dalam audit log sistem.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus Fakultas',
            onConfirm: () => {
                router.delete(`/master/fakultas/${item.id}`, {
                    onSuccess: () => toast.success('Fakultas berhasil dihapus.'),
                });
            },
        });
    };

    const filteredFakultas = useMemo(() => {
        return fakultas.filter((item) => {
            const matchesStatus = statusFilter === 'semua' || item.status === statusFilter;
            if (!matchesStatus) {
                return false;
            }

            if (!searchQuery.trim()) {
                return true;
            }

            const q = searchQuery.toLowerCase().trim();
            const kode = (item.kode || '').toLowerCase();
            const nama = (item.nama || '').toLowerCase();
            const singkatan = (item.nama_singkat || '').toLowerCase();
            const dekan = (item.dekan_nama_lengkap_bergelar || item.dekan_nama || '').toLowerCase();

            return kode.includes(q) || nama.includes(q) || singkatan.includes(q) || dekan.includes(q);
        });
    }, [fakultas, searchQuery, statusFilter]);

    return (
        <>
            {confirmDialog}
            <Head title="Master Fakultas - SIAKAD Al-Yasini" />

            <PageContainer variant="default">
                {/* Header Section */}
                <PageHeader
                    title="Master Fakultas & Unit Pengelola"
                    description="Kelola profil fakultas, struktur kepemimpinan dekanat, legalitas SK PDDIKTI, dan pemetaan program studi di lingkungan kampus."
                    icon={Building2}
                    bordered
                    actions={
                        <div className="flex flex-wrap items-center gap-2.5">
                            <MasterDataNav currentHref="/master/fakultas" compact />
                            <Button
                                onClick={openCreateModal}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer h-9"
                            >
                                <Plus className="size-4" />
                                <span>Tambah Fakultas</span>
                            </Button>
                        </div>
                    }
                />

                {/* Stat Metric Cards (Sevima Enterprise Standard) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        title="Fakultas Aktif"
                        value={`${stats.total_fakultas_aktif} Fakultas`}
                        subtext={
                            <span className="text-slate-500">
                                Dari total <strong className="text-slate-700">{stats.total_fakultas}</strong> unit terdaftar di sistem
                            </span>
                        }
                        icon={Building2}
                        variant="primary"
                    />
                    <StatCard
                        title="Program Studi Terdistribusi"
                        value={`${stats.total_prodi_terdistribusi} Prodi`}
                        subtext={
                            <span className="text-slate-500">
                                Menaungi perkiraan <strong className="text-slate-700">{stats.total_mahasiswa_aktif}</strong> mahasiswa
                            </span>
                        }
                        icon={GraduationCap}
                        variant="info"
                    />
                    <StatCard
                        title="Pimpinan Dekan Terdefinisi"
                        value={`${stats.fakultas_dengan_dekan} / ${stats.total_fakultas}`}
                        subtext={
                            <span className="text-slate-500">
                                Pejabat Dekanat terisi &amp; terhubung
                            </span>
                        }
                        icon={UserCheck}
                        variant="success"
                    />
                </div>

                {/* Filter & Search Toolbar */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari berdasarkan kode, nama fakultas, singkatan, atau nama dekan..."
                            className="pl-9 text-xs h-9 bg-slate-50/60 border-slate-200 focus:bg-white rounded-lg"
                        />
                    </div>

                    <div className="flex items-center gap-2.5">
                        <span className="text-xs text-slate-500 font-medium">Status:</span>
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('semua')}
                                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                                    statusFilter === 'semua'
                                        ? 'bg-white text-slate-900 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('aktif')}
                                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                                    statusFilter === 'aktif'
                                        ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Aktif
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('nonaktif')}
                                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                                    statusFilter === 'nonaktif'
                                        ? 'bg-slate-700 text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Nonaktif
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                                    <th className="py-3 px-4 w-28 text-center">Kode &amp; Feeder</th>
                                    <th className="py-3 px-4">Nama Fakultas &amp; Legalitas</th>
                                    <th className="py-3 px-4">Pimpinan Dekanat &amp; UPPS</th>
                                    <th className="py-3 px-4 text-center w-28">Program Studi</th>
                                    <th className="py-3 px-4 text-center w-28">Mahasiswa</th>
                                    <th className="py-3 px-4 text-center w-24">Status</th>
                                    <th className="py-3 px-4 text-center w-20">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredFakultas.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8">
                                            <EmptyState
                                                icon={Building2}
                                                title="Belum ada data fakultas yang cocok"
                                                description={
                                                    searchQuery
                                                        ? `Tidak ditemukan fakultas dengan kata kunci "${searchQuery}". Silakan coba kata kunci lain.`
                                                        : 'Belum ada data fakultas yang terdaftar. Klik tombol Tambah Fakultas untuk membuat entitas baru.'
                                                }
                                                action={
                                                    <Button
                                                        onClick={openCreateModal}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                                                    >
                                                        <Plus className="size-4 mr-1.5" />
                                                        <span>Tambah Fakultas</span>
                                                    </Button>
                                                }
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFakultas.map((item) => {
                                        const dekanName = item.dekan_nama_lengkap_bergelar || item.dekan?.nama_bergelar || item.dekan_nama;
                                        const dekanNidn = item.dekan?.nidn || item.dekan_nidn;
                                        const isConnectedDosen = Boolean(item.dekan_dosen_id);

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                                                {/* Kode & Feeder */}
                                                <td className="py-3.5 px-4 text-center align-top space-y-1.5">
                                                    <div>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                                            {item.kode}
                                                        </span>
                                                        {item.nama_singkat && (
                                                            <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                                                                {item.nama_singkat}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Neo Feeder Sync Badge */}
                                                    <div>
                                                        {item.sync_status === 'sinkron' ? (
                                                            <span
                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                                                                title={`Tersinkron Feeder (${item.last_synced_at || 'Baru Saja'})`}
                                                            >
                                                                <ShieldCheck className="size-2.5 text-emerald-600" />
                                                                <span>Feeder OK</span>
                                                            </span>
                                                        ) : item.sync_status === 'gagal_sinkron' ? (
                                                            <span
                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 cursor-default"
                                                                title="Gagal Sinkronisasi ke Feeder"
                                                            >
                                                                <ShieldAlert className="size-2.5 text-rose-600" />
                                                                <span>Feeder Err</span>
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200 cursor-default"
                                                                title="Belum disinkronkan ke Neo Feeder"
                                                            >
                                                                <Clock className="size-2.5 text-slate-400" />
                                                                <span>Belum Sync</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Nama Fakultas & SK */}
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="space-y-1">
                                                        <Link
                                                            href={`/master/fakultas/${item.id}`}
                                                            className="font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors flex items-center gap-1.5"
                                                        >
                                                            <span>{item.nama}</span>
                                                            <ExternalLink className="size-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </Link>

                                                        {item.nama_en && (
                                                            <p className="text-[11px] text-slate-500 italic">
                                                                {item.nama_en}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                                                            {item.no_sk_pendirian ? (
                                                                item.file_sk_pendirian_url ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setPdfPreviewTitle(`SK Pendirian - ${item.nama}`);
                                                                            setPdfPreviewUrl(item.file_sk_pendirian_url!);
                                                                        }}
                                                                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-1.5 py-0.5 rounded font-medium cursor-pointer transition"
                                                                        title="Klik untuk pratinjau Berkas PDF SK Pendirian"
                                                                    >
                                                                        <FileCheck2 className="size-3 text-emerald-600" />
                                                                        <span>SK: {item.no_sk_pendirian} (PDF)</span>
                                                                    </button>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <FileText className="size-3 text-slate-500" />
                                                                        <span>SK: {item.no_sk_pendirian}</span>
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="text-slate-400 italic">SK Belum diset</span>
                                                            )}

                                                            {item.tahun_berdiri && (
                                                                <>
                                                                    <span className="text-slate-300">•</span>
                                                                    <span>Est. {item.tahun_berdiri}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Pimpinan Dekanat & UPPS */}
                                                <td className="py-3.5 px-4 align-top">
                                                    <div className="flex items-start gap-2.5">
                                                        {item.dekan?.foto_url ? (
                                                            <img
                                                                src={item.dekan.foto_url}
                                                                alt={dekanName || 'Dekan'}
                                                                className="size-8 rounded-full object-cover border border-emerald-300 shrink-0 mt-0.5"
                                                            />
                                                        ) : (
                                                            <div className="size-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                                                {(dekanName || 'D').substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}

                                                        <div className="min-w-0 space-y-0.5">
                                                            <div className="font-semibold text-slate-900 truncate">
                                                                {dekanName || (
                                                                    <span className="text-slate-400 italic font-normal">Belum ditentukan</span>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                                                {dekanNidn && (
                                                                    <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                                                        NIDN: {dekanNidn}
                                                                    </span>
                                                                )}
                                                                {isConnectedDosen && (
                                                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                                                                        Relasi Dosen
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Wadek 1 / GPMF summary */}
                                                            <div className="pt-0.5 space-y-0.5 text-[10px] text-slate-500">
                                                                {(item.wakil_dekan_1_nama_lengkap_bergelar || item.wakil_dekan_1) && (
                                                                    <p className="truncate" title={`Wadek 1: ${item.wakil_dekan_1_nama_lengkap_bergelar || item.wakil_dekan_1}`}>
                                                                        Wadek 1: {item.wakil_dekan_1_nama_lengkap_bergelar || item.wakil_dekan_1}
                                                                    </p>
                                                                )}
                                                                {item.ketua_gpmf_nama_lengkap_bergelar && (
                                                                    <p className="truncate text-emerald-600 font-medium" title={`GPMF: ${item.ketua_gpmf_nama_lengkap_bergelar}`}>
                                                                        GPMF: {item.ketua_gpmf_nama_lengkap_bergelar}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Program Studi */}
                                                <td className="py-3.5 px-4 text-center align-top">
                                                    <Link
                                                        href={`/master/fakultas/${item.id}`}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition cursor-pointer"
                                                        title="Lihat daftar program studi"
                                                    >
                                                        <GraduationCap className="size-3.5" />
                                                        <span>{item.program_studis_count || 0} Prodi</span>
                                                    </Link>
                                                </td>

                                                {/* Total Mahasiswa */}
                                                <td className="py-3.5 px-4 text-center align-top">
                                                    <span className="inline-flex items-center gap-1 font-mono font-medium text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                                        <Users className="size-3.5 text-slate-400" />
                                                        <span>{item.mahasiswas_count || 0}</span>
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-4 text-center align-top">
                                                    <StatusBadge
                                                        variant={item.status === 'aktif' ? 'success' : 'neutral'}
                                                        label={item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                                    />
                                                </td>

                                                {/* Aksi Dropdown */}
                                                <td className="py-3.5 px-4 text-center align-top">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="size-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                                                            >
                                                                <MoreVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-52 text-xs">
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={`/master/fakultas/${item.id}`}
                                                                    className="flex items-center gap-2 cursor-pointer font-medium"
                                                                >
                                                                    <Eye className="size-3.5 text-emerald-600" />
                                                                    <span>Lihat Profil Lengkap</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => openEditModal(item)}
                                                                className="flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <Edit className="size-3.5 text-blue-600" />
                                                                <span>Edit Data &amp; Personalia</span>
                                                            </DropdownMenuItem>

                                                            {/* Sync Feeder Action */}
                                                            <DropdownMenuItem
                                                                onClick={() => handleSyncFeeder(item)}
                                                                className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-emerald-700"
                                                            >
                                                                <RefreshCw className="size-3.5 text-emerald-600" />
                                                                <span>Sinkronkan ke Feeder</span>
                                                            </DropdownMenuItem>

                                                            {/* PDF Document Shortcuts */}
                                                            {item.file_sk_pendirian_url && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setPdfPreviewTitle(`SK Pendirian - ${item.nama}`);
                                                                        setPdfPreviewUrl(item.file_sk_pendirian_url!);
                                                                    }}
                                                                    className="flex items-center gap-2 cursor-pointer text-emerald-700"
                                                                >
                                                                    <FileCheck2 className="size-3.5 text-emerald-600" />
                                                                    <span>Pratinjau SK Pendirian</span>
                                                                </DropdownMenuItem>
                                                            )}

                                                            {item.file_sk_izin_operasional_url && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setPdfPreviewTitle(`SK Izin Operasional - ${item.nama}`);
                                                                        setPdfPreviewUrl(item.file_sk_izin_operasional_url!);
                                                                    }}
                                                                    className="flex items-center gap-2 cursor-pointer text-blue-700"
                                                                >
                                                                    <FileCheck2 className="size-3.5 text-blue-600" />
                                                                    <span>Pratinjau SK Operasional</span>
                                                                </DropdownMenuItem>
                                                            )}

                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(item)}
                                                                className="flex items-center gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                                <span>Hapus Fakultas</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </PageContainer>

            {/* MODAL INLINE PDF VIEWER */}
            <Dialog open={Boolean(pdfPreviewUrl)} onOpenChange={(open) => !open && setPdfPreviewUrl(null)}>
                <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden flex flex-col rounded-2xl">
                    <DialogHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="size-4 text-emerald-600" />
                                <span>{pdfPreviewTitle || 'Pratinjau Dokumen SK'}</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Dokumen resmi arsip digital SK Fakultas (Unit Pengelola Program Studi).
                            </DialogDescription>
                        </div>
                        {pdfPreviewUrl && (
                            <a
                                href={pdfPreviewUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            >
                                <Download className="size-3.5" />
                                <span>Unduh PDF</span>
                            </a>
                        )}
                    </DialogHeader>
                    <div className="flex-1 w-full h-full bg-slate-900/5">
                        {pdfPreviewUrl && (
                            <iframe
                                src={`${pdfPreviewUrl}#toolbar=0`}
                                className="w-full h-full border-0"
                                title={pdfPreviewTitle}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* CREATE / EDIT MODAL DIALOG (ENTERPRISE TABBED FORMAT) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="size-5 text-emerald-600" />
                            <span>{editingFakultas ? 'Edit Data Fakultas' : 'Tambah Fakultas Baru'}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Kelola profil resmi, legalitas SK PDDIKTI, serta pimpinan dekanat fakultas di lingkungan STAI Al-Yasini.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-slate-200 mt-2 gap-2 text-xs font-semibold overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('identitas')}
                            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                                activeTab === 'identitas'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            1. Identitas Inti
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('legalitas')}
                            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                                activeTab === 'legalitas'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            2. Legalitas &amp; Berkas SK PDF
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('pimpinan')}
                            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                                activeTab === 'pimpinan'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            3. Personalia Dekanat &amp; UPPS
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('kontak')}
                            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                                activeTab === 'kontak'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            4. Kontak &amp; Fasilitas
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('visi_misi')}
                            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                                activeTab === 'visi_misi'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            5. Visi &amp; Misi
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-3">
                        {/* TAB 1: IDENTITAS INTI */}
                        {activeTab === 'identitas' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-700">
                                            Kode Fakultas <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            value={form.data.kode}
                                            onChange={(e) => form.setData('kode', e.target.value.toUpperCase())}
                                            placeholder="e.g. FAI, FTK"
                                            className="h-9 text-xs font-mono font-semibold"
                                            required
                                        />
                                        {form.errors.kode && <p className="text-[11px] text-rose-600">{form.errors.kode}</p>}
                                    </div>

                                    <div className="space-y-1 sm:col-span-2">
                                        <Label className="text-xs font-semibold text-slate-700">
                                            Nama Resmi Fakultas <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            value={form.data.nama}
                                            onChange={(e) => form.setData('nama', e.target.value)}
                                            placeholder="e.g. Fakultas Tarbiyah dan Keguruan"
                                            className="h-9 text-xs font-medium"
                                            required
                                        />
                                        {form.errors.nama && <p className="text-[11px] text-rose-600">{form.errors.nama}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-700">Nama Bahasa Inggris (EN)</Label>
                                        <Input
                                            value={form.data.nama_en}
                                            onChange={(e) => form.setData('nama_en', e.target.value)}
                                            placeholder="e.g. Faculty of Education and Teacher Training"
                                            className="h-9 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-700">Singkatan / Akronim</Label>
                                        <Input
                                            value={form.data.nama_singkat}
                                            onChange={(e) => form.setData('nama_singkat', e.target.value)}
                                            placeholder="e.g. FTK"
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-700">Tahun Berdiri</Label>
                                        <Input
                                            type="number"
                                            value={form.data.tahun_berdiri}
                                            onChange={(e) => form.setData('tahun_berdiri', e.target.value)}
                                            placeholder="2012"
                                            className="h-9 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-700">Periode Berdiri</Label>
                                        <Input
                                            value={form.data.periode_berdiri}
                                            onChange={(e) => form.setData('periode_berdiri', e.target.value)}
                                            placeholder="e.g. 20121"
                                            className="h-9 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-700">
                                            Status Operasional <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select
                                            value={form.data.status}
                                            onValueChange={(val) => form.setData('status', val)}
                                        >
                                            <SelectTrigger className="h-9 text-xs bg-white">
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="aktif" className="text-xs">Aktif</SelectItem>
                                                <SelectItem value="nonaktif" className="text-xs">Nonaktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* ID Feeder Neo */}
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                            <ShieldCheck className="size-3.5 text-emerald-600" />
                                            <span>Integrasi PDDIKTI Neo Feeder</span>
                                        </Label>
                                        <span className="text-[10px] text-slate-500">Opsional / Otomatis</span>
                                    </div>
                                    <div className="space-y-1">
                                        <Input
                                            value={form.data.id_feeder}
                                            onChange={(e) => form.setData('id_feeder', e.target.value)}
                                            placeholder="UUID Feeder (contoh: 3fa85f64-5717-4562-b3fc-2c963f66afa6)"
                                            className="h-8 text-xs font-mono bg-white"
                                        />
                                        <p className="text-[10px] text-slate-500">
                                            Digunakan untuk sinkronisasi rekonsiliasi data unit pengelola prodi dengan PDDIKTI Neo Feeder Kemendiktisaintek.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: LEGALITAS & BERKAS SK PDF */}
                        {activeTab === 'legalitas' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <FileText className="size-3.5 text-emerald-600" />
                                        <span>1. Legalitas SK Pendirian Fakultas</span>
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600">Nomor SK Pendirian</Label>
                                            <Input
                                                value={form.data.no_sk_pendirian}
                                                onChange={(e) => form.setData('no_sk_pendirian', e.target.value)}
                                                placeholder="e.g. Dj.I/149/2012"
                                                className="h-8 text-xs bg-white"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600">Tanggal SK Pendirian</Label>
                                            <Input
                                                type="date"
                                                value={form.data.tanggal_sk_pendirian}
                                                onChange={(e) => form.setData('tanggal_sk_pendirian', e.target.value)}
                                                className="h-8 text-xs bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Upload SK Pendirian PDF */}
                                    <div className="space-y-1.5 pt-1">
                                        <Label className="text-xs font-semibold flex items-center gap-1 text-slate-700">
                                            <Upload className="size-3 text-emerald-600" />
                                            <span>Upload Berkas SK Pendirian (PDF Maks. 5MB)</span>
                                        </Label>
                                        <Input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    form.setData('file_sk_pendirian', e.target.files[0]);
                                                }
                                            }}
                                            className="text-xs h-8 bg-white"
                                        />
                                        {editingFakultas?.file_sk_pendirian_url && (
                                            <div className="flex items-center gap-2 pt-0.5">
                                                <span className="text-[11px] text-emerald-600 font-medium">
                                                    ✓ Berkas saat ini tersimpan di server.
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPdfPreviewTitle(`SK Pendirian - ${editingFakultas.nama}`);
                                                        setPdfPreviewUrl(editingFakultas.file_sk_pendirian_url!);
                                                    }}
                                                    className="text-[11px] text-emerald-700 underline font-semibold hover:text-emerald-800 cursor-pointer"
                                                >
                                                    Lihat Dokumen
                                                </button>
                                            </div>
                                        )}
                                        {form.errors.file_sk_pendirian && (
                                            <p className="text-[11px] text-rose-600">{form.errors.file_sk_pendirian}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <FileText className="size-3.5 text-blue-600" />
                                        <span>2. Legalitas SK Izin Operasional</span>
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600">Nomor SK Izin Operasional</Label>
                                            <Input
                                                value={form.data.no_sk_izin_operasional}
                                                onChange={(e) => form.setData('no_sk_izin_operasional', e.target.value)}
                                                placeholder="e.g. 481/SK/BAN-PT/Ak/PT/VIII/2022"
                                                className="h-8 text-xs bg-white"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600">Tanggal SK Izin Operasional</Label>
                                            <Input
                                                type="date"
                                                value={form.data.tanggal_sk_izin_operasional}
                                                onChange={(e) => form.setData('tanggal_sk_izin_operasional', e.target.value)}
                                                className="h-8 text-xs bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Upload SK Izin Operasional PDF */}
                                    <div className="space-y-1.5 pt-1">
                                        <Label className="text-xs font-semibold flex items-center gap-1 text-slate-700">
                                            <Upload className="size-3 text-blue-600" />
                                            <span>Upload Berkas SK Izin Operasional (PDF Maks. 5MB)</span>
                                        </Label>
                                        <Input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    form.setData('file_sk_izin_operasional', e.target.files[0]);
                                                }
                                            }}
                                            className="text-xs h-8 bg-white"
                                        />
                                        {editingFakultas?.file_sk_izin_operasional_url && (
                                            <div className="flex items-center gap-2 pt-0.5">
                                                <span className="text-[11px] text-blue-600 font-medium">
                                                    ✓ Berkas saat ini tersimpan di server.
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPdfPreviewTitle(`SK Izin Operasional - ${editingFakultas.nama}`);
                                                        setPdfPreviewUrl(editingFakultas.file_sk_izin_operasional_url!);
                                                    }}
                                                    className="text-[11px] text-blue-700 underline font-semibold hover:text-blue-800 cursor-pointer"
                                                >
                                                    Lihat Dokumen
                                                </button>
                                            </div>
                                        )}
                                        {form.errors.file_sk_izin_operasional && (
                                            <p className="text-[11px] text-rose-600">{form.errors.file_sk_izin_operasional}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: PIMPINAN DEKANAT & PERSONALIA UPPS */}
                        {activeTab === 'pimpinan' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3">
                                    <DosenSearchCombobox
                                        label="Hubungkan Dekan ke Master Data Dosen"
                                        sublabel="Memilih dosen akan mengaitkan relasi pimpinan fakultas secara resmi dan menyinkronkan nama bergelar, NIDN, dan kredensial"
                                        dosens={dosens}
                                        selectedDosen={selectedDekanDosen}
                                        onSelect={handleDekanSelect}
                                        onClear={handleDekanClear}
                                        error={form.errors.dekan_dosen_id}
                                    />
                                </div>

                                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-800">
                                        Data Detail Dekan (Manual / Fallback Cetak)
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                                        <div className="space-y-1 sm:col-span-2">
                                            <Label className="text-xs text-slate-600">Nama Lengkap (Tanpa Gelar)</Label>
                                            <Input
                                                value={form.data.dekan_nama}
                                                onChange={(e) => form.setData('dekan_nama', e.target.value)}
                                                placeholder="e.g. Ahmad Fauzi"
                                                className="h-8 text-xs bg-white"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600">Gelar Depan</Label>
                                            <Input
                                                value={form.data.dekan_gelar_depan}
                                                onChange={(e) => form.setData('dekan_gelar_depan', e.target.value)}
                                                placeholder="e.g. Dr."
                                                className="h-8 text-xs bg-white"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600">Gelar Belakang</Label>
                                            <Input
                                                value={form.data.dekan_gelar_belakang}
                                                onChange={(e) => form.setData('dekan_gelar_belakang', e.target.value)}
                                                placeholder="e.g. M.Pd.I"
                                                className="h-8 text-xs bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-600">NIDN Dekan</Label>
                                        <Input
                                            value={form.data.dekan_nidn}
                                            onChange={(e) => form.setData('dekan_nidn', e.target.value)}
                                            placeholder="e.g. 2108098201"
                                            className="h-8 text-xs font-mono bg-white"
                                        />
                                    </div>
                                </div>

                                {/* STRUKTUR WAKIL DEKAN 1 - 4 */}
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Relasi Wakil Dekan (Wadek I – IV)
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-slate-600">Wadek I (Bid. Akademik)</Label>
                                            <Select
                                                value={form.data.wakil_dekan_1_dosen_id ? String(form.data.wakil_dekan_1_dosen_id) : 'none'}
                                                onValueChange={(val) => form.setData('wakil_dekan_1_dosen_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white">
                                                    <SelectValue placeholder="Pilih Dosen Wadek I..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs text-slate-400">-- Tanpa Relasi Dosen --</SelectItem>
                                                    {dosens.map((d) => (
                                                        <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                            {d.nama_bergelar || d.nama_lengkap}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={form.data.wakil_dekan_1}
                                                onChange={(e) => form.setData('wakil_dekan_1', e.target.value)}
                                                placeholder="Atau ketik manual nama Wadek 1"
                                                className="h-7 text-[11px] mt-1"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-slate-600">Wadek II (Bid. Keuangan &amp; SDM)</Label>
                                            <Select
                                                value={form.data.wakil_dekan_2_dosen_id ? String(form.data.wakil_dekan_2_dosen_id) : 'none'}
                                                onValueChange={(val) => form.setData('wakil_dekan_2_dosen_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white">
                                                    <SelectValue placeholder="Pilih Dosen Wadek II..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs text-slate-400">-- Tanpa Relasi Dosen --</SelectItem>
                                                    {dosens.map((d) => (
                                                        <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                            {d.nama_bergelar || d.nama_lengkap}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={form.data.wakil_dekan_2}
                                                onChange={(e) => form.setData('wakil_dekan_2', e.target.value)}
                                                placeholder="Atau ketik manual nama Wadek 2"
                                                className="h-7 text-[11px] mt-1"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-slate-600">Wadek III (Bid. Kemahasiswaan)</Label>
                                            <Select
                                                value={form.data.wakil_dekan_3_dosen_id ? String(form.data.wakil_dekan_3_dosen_id) : 'none'}
                                                onValueChange={(val) => form.setData('wakil_dekan_3_dosen_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white">
                                                    <SelectValue placeholder="Pilih Dosen Wadek III..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs text-slate-400">-- Tanpa Relasi Dosen --</SelectItem>
                                                    {dosens.map((d) => (
                                                        <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                            {d.nama_bergelar || d.nama_lengkap}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={form.data.wakil_dekan_3}
                                                onChange={(e) => form.setData('wakil_dekan_3', e.target.value)}
                                                placeholder="Atau ketik manual nama Wadek 3"
                                                className="h-7 text-[11px] mt-1"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-slate-600">Wadek IV (Bid. Kerjasama &amp; Riset)</Label>
                                            <Select
                                                value={form.data.wakil_dekan_4_dosen_id ? String(form.data.wakil_dekan_4_dosen_id) : 'none'}
                                                onValueChange={(val) => form.setData('wakil_dekan_4_dosen_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white">
                                                    <SelectValue placeholder="Pilih Dosen Wadek IV..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs text-slate-400">-- Tanpa Relasi Dosen --</SelectItem>
                                                    {dosens.map((d) => (
                                                        <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                            {d.nama_bergelar || d.nama_lengkap}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={form.data.wakil_dekan_4}
                                                onChange={(e) => form.setData('wakil_dekan_4', e.target.value)}
                                                placeholder="Atau ketik manual nama Wadek 4"
                                                className="h-7 text-[11px] mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* PERSONALIA UPPS (GPMF & TATA USAHA) */}
                                <div className="space-y-3 pt-2 border-t border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Personalia UPPS (GPMF &amp; Tata Usaha)
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-emerald-700">
                                                Ketua GPMF (Gugus Mutu - Dosen)
                                            </Label>
                                            <Select
                                                value={form.data.ketua_gpmf_dosen_id ? String(form.data.ketua_gpmf_dosen_id) : 'none'}
                                                onValueChange={(val) => form.setData('ketua_gpmf_dosen_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white">
                                                    <SelectValue placeholder="Pilih Ketua GPMF..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs text-slate-400">-- Tanpa Relasi --</SelectItem>
                                                    {dosens.map((d) => (
                                                        <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                            {d.nama_bergelar || d.nama_lengkap}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-sky-700">
                                                Kepala Bagian Tata Usaha (Pegawai)
                                            </Label>
                                            <Select
                                                value={form.data.kepala_tata_usaha_pegawai_id ? String(form.data.kepala_tata_usaha_pegawai_id) : 'none'}
                                                onValueChange={(val) => form.setData('kepala_tata_usaha_pegawai_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white">
                                                    <SelectValue placeholder="Pilih Kepala Tata Usaha..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs text-slate-400">-- Tanpa Relasi --</SelectItem>
                                                    {pegawais.map((p) => (
                                                        <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                                                            {p.nama_lengkap} {p.nip_internal ? `(${p.nip_internal})` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: KONTAK & FASILITAS */}
                        {activeTab === 'kontak' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-slate-700">Alamat Gedung / Kampus</Label>
                                    <Input
                                        value={form.data.alamat}
                                        onChange={(e) => form.setData('alamat', e.target.value)}
                                        placeholder="e.g. Gedung Pascasarjana Lt. 2, Kampus Terpadu Al-Yasini"
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-700">Telepon / WhatsApp Resmi</Label>
                                        <Input
                                            value={form.data.telepon}
                                            onChange={(e) => form.setData('telepon', e.target.value)}
                                            placeholder="e.g. 0343-421234"
                                            className="h-9 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-700">Email Resmi Fakultas</Label>
                                        <Input
                                            type="email"
                                            value={form.data.email}
                                            onChange={(e) => form.setData('email', e.target.value)}
                                            placeholder="e.g. tarbiyah@stai-alyasini.ac.id"
                                            className="h-9 text-xs"
                                        />
                                        {form.errors.email && <p className="text-[11px] text-rose-600">{form.errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-700">Situs Web Resmi</Label>
                                        <Input
                                            value={form.data.website}
                                            onChange={(e) => form.setData('website', e.target.value)}
                                            placeholder="e.g. https://tarbiyah.stai-alyasini.ac.id"
                                            className="h-9 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-700">Luas Fasilitas Gedung (m²)</Label>
                                        <Input
                                            value={form.data.luas_m2}
                                            onChange={(e) => form.setData('luas_m2', e.target.value)}
                                            placeholder="e.g. 1500 m2"
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 5: VISI & MISI */}
                        {activeTab === 'visi_misi' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-slate-700">Visi Fakultas</Label>
                                    <Textarea
                                        rows={4}
                                        value={form.data.visi}
                                        onChange={(e) => form.setData('visi', e.target.value)}
                                        placeholder="Tuliskan rumusan visi fakultas..."
                                        className="text-xs rounded-xl"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-slate-700">Misi Fakultas</Label>
                                    <Textarea
                                        rows={6}
                                        value={form.data.misi}
                                        onChange={(e) => form.setData('misi', e.target.value)}
                                        placeholder="Tuliskan butir-butir misi fakultas..."
                                        className="text-xs rounded-xl"
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="border-t border-slate-100 pt-3 flex items-center justify-between sm:justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <span>Bagian {activeTab === 'identitas' ? '1/5' : activeTab === 'legalitas' ? '2/5' : activeTab === 'pimpinan' ? '3/5' : activeTab === 'kontak' ? '4/5' : '5/5'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-xs h-9 rounded-xl"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-2xs cursor-pointer"
                                >
                                    {form.processing ? 'Menyimpan...' : editingFakultas ? 'Simpan Perubahan' : 'Tambah Fakultas'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

FakultasIndex.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Data Pelengkap', href: '/master/fakultas' },
        { title: 'Fakultas', href: '/master/fakultas' },
    ],
};

