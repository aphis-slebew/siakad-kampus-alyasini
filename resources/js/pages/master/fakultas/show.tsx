import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Compass,
    Download,
    Edit3,
    ExternalLink,
    Eye,
    FileCheck2,
    FileText,
    Globe,
    GraduationCap,
    History,
    Info,
    Mail,
    MapPin,
    Phone,
    Plus,
    RefreshCw,
    Search,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    TrendingUp,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface DosenRelation {
    id: number;
    nama_lengkap: string;
    gelar_depan?: string | null;
    gelar_belakang?: string | null;
    nama_lengkap_bergelar?: string;
    nama_bergelar?: string;
    nidn?: string | null;
    niy_nip?: string | null;
    foto_url?: string | null;
    status_kepegawaian?: string | null;
    program_studi?: {
        id: number;
        nama: string;
    } | null;
}

interface PegawaiOption {
    id: number;
    nama_lengkap: string;
    nip_internal?: string | null;
    jabatan_struktural?: string | null;
    status_kepegawaian?: string | null;
    foto_url?: string | null;
}

interface ProgramStudiItem {
    id: number;
    kode: string;
    nama: string;
    nama_en?: string | null;
    jenjang: string;
    status: string;
    akreditasi?: string | null;
    lembaga_akreditasi?: string | null;
    no_sk_akreditasi?: string | null;
    ketua_prodi_nama?: string | null;
    ketua_prodi_nidn?: string | null;
    mahasiswas_count?: number;
}

interface RiwayatPimpinanItem {
    id: number;
    fakultas_id: number;
    dosen_id: number;
    jabatan: 'dekan' | 'wakil_dekan_1' | 'wakil_dekan_2' | 'wakil_dekan_3' | 'wakil_dekan_4' | 'ketua_gpmf';
    jabatan_label?: string;
    periode_mulai: string;
    periode_selesai?: string | null;
    no_sk_pelantikan?: string | null;
    file_sk_pelantikan_path?: string | null;
    file_sk_pelantikan_url?: string | null;
    is_aktif: boolean;
    dosen?: DosenRelation | null;
}

interface AnalyticsData {
    total_dosen_homebase: number;
    total_mahasiswa_aktif: number;
    rasio_dosen_mahasiswa: string;
    rasio_angka: number;
    is_rasio_ideal: boolean;
    rata_rata_ipk: number;
    distribusi_akreditasi: {
        Unggul: number;
        'Baik Sekali': number;
        Baik: number;
        'Belum Terakreditasi': number;
    };
}

interface FakultasDetailData {
    id: number;
    kode: string;
    nama: string;
    nama_en: string | null;
    nama_singkat: string | null;
    dekan_dosen_id?: number | null;
    wakil_dekan_dosen_id?: number | null;
    wakil_dekan_1_dosen_id?: number | null;
    wakil_dekan_2_dosen_id?: number | null;
    wakil_dekan_3_dosen_id?: number | null;
    wakil_dekan_4_dosen_id?: number | null;
    ketua_gpmf_dosen_id?: number | null;
    kepala_tata_usaha_pegawai_id?: number | null;
    dekan_nama: string | null;
    dekan_nidn: string | null;
    dekan_gelar_depan: string | null;
    dekan_gelar_belakang: string | null;
    dekan_nama_lengkap_bergelar?: string;
    wakil_dekan_1: string | null;
    wakil_dekan_2: string | null;
    wakil_dekan_3: string | null;
    wakil_dekan_4: string | null;
    wakil_dekan_1_nama_lengkap_bergelar?: string | null;
    wakil_dekan_2_nama_lengkap_bergelar?: string | null;
    wakil_dekan_3_nama_lengkap_bergelar?: string | null;
    wakil_dekan_4_nama_lengkap_bergelar?: string | null;
    ketua_gpmf_nama_lengkap_bergelar?: string | null;
    kepala_tata_usaha_nama_lengkap?: string | null;
    alamat: string | null;
    telepon: string | null;
    email: string | null;
    website: string | null;
    tahun_berdiri: number | null;
    periode_berdiri: string | null;
    no_sk_pendirian: string | null;
    tanggal_sk_pendirian: string | null;
    file_sk_pendirian_path?: string | null;
    file_sk_pendirian_url?: string | null;
    no_sk_izin_operasional: string | null;
    tanggal_sk_izin_operasional: string | null;
    file_sk_izin_operasional_path?: string | null;
    file_sk_izin_operasional_url?: string | null;
    id_feeder?: string | null;
    last_synced_at?: string | null;
    sync_status?: 'belum_sinkron' | 'sinkron' | 'gagal_sinkron' | null;
    status: string;
    luas_m2: string | null;
    visi: string | null;
    misi: string | null;
    dekan?: DosenRelation | null;
    wakil_dekan?: DosenRelation | null;
    wakil_dekan_1_relation?: DosenRelation | null;
    wakil_dekan_2_relation?: DosenRelation | null;
    wakil_dekan_3_relation?: DosenRelation | null;
    wakil_dekan_4_relation?: DosenRelation | null;
    ketua_gpmf?: DosenRelation | null;
    kepala_tata_usaha?: PegawaiOption | null;
    program_studis?: ProgramStudiItem[];
    riwayat_pimpinan?: RiwayatPimpinanItem[];
}

interface Props {
    fakultas: FakultasDetailData;
    analytics?: AnalyticsData;
    allFakultas: Array<{ id: number; kode: string; nama: string }>;
    dosens: DosenOption[];
    pegawais?: PegawaiOption[];
}

export default function FakultasShow({
    fakultas,
    analytics = {
        total_dosen_homebase: 0,
        total_mahasiswa_aktif: 0,
        rasio_dosen_mahasiswa: '1 : 0',
        rasio_angka: 0,
        is_rasio_ideal: true,
        rata_rata_ipk: 3.38,
        distribusi_akreditasi: {
            Unggul: 0,
            'Baik Sekali': 0,
            Baik: 0,
            'Belum Terakreditasi': 0,
        },
    },
    allFakultas = [],
    dosens = [],
    pegawais = [],
}: Props) {
    const [selectedFakultasId, setSelectedFakultasId] = useState<string>(String(fakultas.id));
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTenureModalOpen, setIsTenureModalOpen] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [pdfPreviewTitle, setPdfPreviewTitle] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'identitas' | 'pimpinan' | 'legalitas' | 'visi_misi'>('identitas');
    const [rightActiveTab, setRightActiveTab] = useState<'prodi' | 'tenure'>('prodi');
    const [prodiSearch, setProdiSearch] = useState('');

    const { confirm, confirmDialog } = useConfirmDialog();

    // Main Edit Form
    const editForm = useForm({
        kode: fakultas.kode || '',
        nama: fakultas.nama || '',
        nama_en: fakultas.nama_en || '',
        nama_singkat: fakultas.nama_singkat || '',
        no_sk_pendirian: fakultas.no_sk_pendirian || '',
        tanggal_sk_pendirian: fakultas.tanggal_sk_pendirian ? fakultas.tanggal_sk_pendirian.substring(0, 10) : '',
        no_sk_izin_operasional: fakultas.no_sk_izin_operasional || '',
        tanggal_sk_izin_operasional: fakultas.tanggal_sk_izin_operasional ? fakultas.tanggal_sk_izin_operasional.substring(0, 10) : '',
        status: fakultas.status || 'aktif',
        dekan_dosen_id: fakultas.dekan_dosen_id || null,
        wakil_dekan_1_dosen_id: fakultas.wakil_dekan_1_dosen_id || null,
        wakil_dekan_2_dosen_id: fakultas.wakil_dekan_2_dosen_id || null,
        wakil_dekan_3_dosen_id: fakultas.wakil_dekan_3_dosen_id || null,
        wakil_dekan_4_dosen_id: fakultas.wakil_dekan_4_dosen_id || null,
        ketua_gpmf_dosen_id: fakultas.ketua_gpmf_dosen_id || null,
        kepala_tata_usaha_pegawai_id: fakultas.kepala_tata_usaha_pegawai_id || null,
        dekan_nama: fakultas.dekan_nama || '',
        dekan_gelar_depan: fakultas.dekan_gelar_depan || '',
        dekan_gelar_belakang: fakultas.dekan_gelar_belakang || '',
        dekan_nidn: fakultas.dekan_nidn || '',
        wakil_dekan_1: fakultas.wakil_dekan_1 || '',
        wakil_dekan_2: fakultas.wakil_dekan_2 || '',
        wakil_dekan_3: fakultas.wakil_dekan_3 || '',
        wakil_dekan_4: fakultas.wakil_dekan_4 || '',
        alamat: fakultas.alamat || '',
        telepon: fakultas.telepon || '',
        email: fakultas.email || '',
        website: fakultas.website || '',
        tahun_berdiri: (fakultas.tahun_berdiri ?? '') as string | number,
        periode_berdiri: fakultas.periode_berdiri || '',
        luas_m2: fakultas.luas_m2 || '',
        visi: fakultas.visi || '',
        misi: fakultas.misi || '',
        file_sk_pendirian: null as File | null,
        file_sk_izin_operasional: null as File | null,
    });

    // Tenure Form
    const tenureForm = useForm({
        dosen_id: null as number | null,
        jabatan: 'dekan',
        periode_mulai: '',
        periode_selesai: '',
        no_sk_pelantikan: '',
        file_sk_pelantikan: null as File | null,
        is_aktif: true,
    });

    const selectedDekanDosen = useMemo(() => {
        if (!editForm.data.dekan_dosen_id) {
            return null;
        }
        return dosens.find((d) => d.id === Number(editForm.data.dekan_dosen_id)) || null;
    }, [editForm.data.dekan_dosen_id, dosens]);

    const selectedTenureDosen = useMemo(() => {
        if (!tenureForm.data.dosen_id) {
            return null;
        }
        return dosens.find((d) => d.id === Number(tenureForm.data.dosen_id)) || null;
    }, [tenureForm.data.dosen_id, dosens]);

    const handleSwitchFakultas = (id: string) => {
        if (!id || id === String(fakultas.id)) {
            return;
        }
        setSelectedFakultasId(id);
        router.get(`/master/fakultas/${id}`);
    };

    const handleSelectDekan = (dosen: DosenOption) => {
        editForm.setData((prev) => ({
            ...prev,
            dekan_dosen_id: dosen.id,
            dekan_nama: dosen.nama_lengkap,
            dekan_gelar_depan: dosen.gelar_depan || '',
            dekan_gelar_belakang: dosen.gelar_belakang || '',
            dekan_nidn: dosen.nidn || dosen.niy_nip || '',
        }));
    };

    const handleClearDekan = () => {
        editForm.setData((prev) => ({
            ...prev,
            dekan_dosen_id: null,
            dekan_nama: '',
            dekan_gelar_depan: '',
            dekan_gelar_belakang: '',
            dekan_nidn: '',
        }));
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.post(`/master/fakultas/${fakultas.id}`, {
            _method: 'put',
            onSuccess: () => {
                setIsEditModalOpen(false);
                toast.success('Data fakultas berhasil diperbarui');
            },
            onError: () => {
                toast.error('Periksa kembali input formulir');
            },
        } as any);
    };

    const handleCreateTenure = (e: React.FormEvent) => {
        e.preventDefault();
        tenureForm.post(`/master/fakultas/${fakultas.id}/pimpinan`, {
            forceFormData: true,
            onSuccess: () => {
                setIsTenureModalOpen(false);
                tenureForm.reset();
                toast.success('Riwayat masa jabatan dekanat berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Periksa kembali input data riwayat');
            },
        });
    };

    const handleDeleteTenure = (item: RiwayatPimpinanItem) => {
        confirm({
            title: 'Hapus Riwayat Pimpinan?',
            description: `Apakah Anda yakin ingin menghapus data masa jabatan ${item.jabatan_label || item.jabatan} untuk ${item.dosen?.nama_bergelar || item.dosen?.nama_lengkap}? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus',
            variant: 'destructive',
            onConfirm: () => {
                router.delete(`/master/fakultas/${fakultas.id}/pimpinan/${item.id}`, {
                    onSuccess: () => toast.success('Riwayat pimpinan berhasil dihapus'),
                    onError: () => toast.error('Gagal menghapus riwayat pimpinan'),
                });
            },
        });
    };

    const handleSyncFeeder = () => {
        router.post(`/master/fakultas/${fakultas.id}/sync-feeder`, {}, {
            onSuccess: () => toast.success('Status sinkronisasi PDDIKTI Feeder berhasil diperbarui'),
            onError: () => toast.error('Gagal memperbarui sinkronisasi Feeder'),
        });
    };

    const filteredProdis = useMemo(() => {
        const prodis = fakultas.program_studis || [];
        if (!prodiSearch.trim()) {
            return prodis;
        }
        const q = prodiSearch.toLowerCase().trim();
        return prodis.filter(
            (p) =>
                p.nama.toLowerCase().includes(q) ||
                p.kode.toLowerCase().includes(q) ||
                p.jenjang.toLowerCase().includes(q) ||
                (p.ketua_prodi_nama && p.ketua_prodi_nama.toLowerCase().includes(q))
        );
    }, [fakultas.program_studis, prodiSearch]);

    const totalMahasiswa = useMemo(() => {
        return (fakultas.program_studis || []).reduce((acc, curr) => acc + (curr.mahasiswas_count || 0), 0);
    }, [fakultas.program_studis]);

    return (
        <>
            {confirmDialog}
            <Head title={`Fakultas ${fakultas.nama} - UPPS Enterprise Detail`} />

            <PageContainer>
                {/* Global Tab Navigation */}
                <MasterDataNav currentHref="/master/fakultas" />

                <div className="space-y-6">
                    {/* Top Action & Navigation Bar */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-start gap-4">
                            <Link
                                href="/master/fakultas"
                                className="inline-flex items-center justify-center size-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition shrink-0"
                                title="Kembali ke Daftar Fakultas"
                            >
                                <ArrowLeft className="size-5" />
                            </Link>

                            <div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                                        {fakultas.kode}
                                    </span>
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                        {fakultas.nama}
                                    </h1>
                                    <StatusBadge
                                        variant={fakultas.status === 'aktif' ? 'success' : 'danger'}
                                        label={fakultas.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                                    />
                                    {/* Feeder Sync Status Badge */}
                                    <span
                                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                                            fakultas.sync_status === 'sinkron'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                : fakultas.sync_status === 'gagal_sinkron'
                                                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                    >
                                        <span
                                            className={`size-1.5 rounded-full ${
                                                fakultas.sync_status === 'sinkron'
                                                    ? 'bg-emerald-500'
                                                    : fakultas.sync_status === 'gagal_sinkron'
                                                    ? 'bg-rose-500'
                                                    : 'bg-slate-400'
                                            }`}
                                        />
                                        <span>
                                            Feeder: {fakultas.sync_status === 'sinkron' ? 'Sinkron' : fakultas.sync_status === 'gagal_sinkron' ? 'Gagal' : 'Belum Sinkron'}
                                        </span>
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {fakultas.nama_en ? `${fakultas.nama_en} • ` : ''}
                                    {fakultas.nama_singkat ? `Akronim: ${fakultas.nama_singkat} • ` : ''}
                                    Unit Pengelola Program Studi (UPPS)
                                </p>
                            </div>
                        </div>

                        {/* Quick Switcher, Sync Button & Actions */}
                        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto w-full md:w-auto">
                            <div className="flex-1 md:w-56">
                                <Select
                                    value={selectedFakultasId}
                                    onValueChange={handleSwitchFakultas}
                                >
                                    <SelectTrigger className="h-9.5 text-xs bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="Pindah Fakultas..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allFakultas.map((f) => (
                                            <SelectItem key={f.id} value={String(f.id)} className="text-xs">
                                                <span className="font-mono font-bold mr-1.5 text-emerald-600">[{f.kode}]</span>
                                                <span>{f.nama}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleSyncFeeder}
                                title="Sinkronkan dengan Neo Feeder PDDIKTI"
                                className="h-9.5 px-3 border-slate-200 dark:border-slate-700 text-xs font-semibold gap-1.5 hover:bg-slate-50 cursor-pointer"
                            >
                                <RefreshCw className="size-3.5 text-emerald-600" />
                                <span className="hidden sm:inline">Sinkron Feeder</span>
                            </Button>

                            <Button
                                onClick={() => setIsEditModalOpen(true)}
                                className="h-9.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-2xs gap-1.5 shrink-0 cursor-pointer"
                            >
                                <Edit3 className="size-3.5" />
                                <span>Edit Fakultas</span>
                            </Button>
                        </div>
                    </div>

                    {/* Academic KPI & UPPS Analytics Bar (BAN-PT Criteria 9 Ready) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                                    Rasio Dosen : Mahasiswa
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                        {analytics.rasio_dosen_mahasiswa}
                                    </span>
                                    <span
                                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                            analytics.is_rasio_ideal
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                        }`}
                                    >
                                        {analytics.is_rasio_ideal ? 'Ideal BAN-PT' : 'Perlu Tambah Dosen'}
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-500 block">
                                    {analytics.total_dosen_homebase} Dosen • {analytics.total_mahasiswa_aktif} Mahasiswa
                                </span>
                            </div>
                            <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <Users className="size-5.5" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                                    Rata-Rata IPK Mahasiswa
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                        {analytics.rata_rata_ipk.toFixed(2)}
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                                        Skala 4.00
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-500 block">
                                    Prestasi Akademik Fakultas
                                </span>
                            </div>
                            <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <TrendingUp className="size-5.5" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                                    Distribusi Akreditasi Prodi
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                        {analytics.distribusi_akreditasi.Unggul} Unggul
                                    </span>
                                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                        {analytics.distribusi_akreditasi['Baik Sekali']} Baik Sekali
                                    </span>
                                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                        {analytics.distribusi_akreditasi.Baik} Baik
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-500 block">
                                    Dari total {fakultas.program_studis?.length || 0} program studi
                                </span>
                            </div>
                            <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <Award className="size-5.5" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                                    Masa Jabatan Dekanat
                                </span>
                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                                    {fakultas.dekan_nama_lengkap_bergelar || 'Belum Ditetapkan'}
                                </div>
                                <span className="text-[11px] text-emerald-600 font-medium block">
                                    {fakultas.riwayat_pimpinan?.length || 0} Rekam Jejak Pimpinan
                                </span>
                            </div>
                            <div className="size-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                <History className="size-5.5" />
                            </div>
                        </div>
                    </div>

                    {/* Main Two-Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT COLUMN: Legalitas, Profil Dekanat, Personalia UPPS, Kontak (~40%) */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Card 1: Identitas & Legalitas PDDIKTI + PDF Scan */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileCheck2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            Identitas &amp; Legalitas PDDIKTI
                                        </h2>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Standar PDDIKTI
                                    </span>
                                </div>

                                <div className="p-5 space-y-4 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                                    <div className="flex items-center justify-between pt-1 first:pt-0">
                                        <span className="text-slate-500">Kode Resmi Fakultas</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                            {fakultas.kode}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3">
                                        <span className="text-slate-500">Nama Resmi (Indonesia)</span>
                                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-right max-w-[60%]">
                                            {fakultas.nama}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3">
                                        <span className="text-slate-500">Nama Internasional (EN)</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-[60%] italic">
                                            {fakultas.nama_en || '-'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3">
                                        <span className="text-slate-500">Singkatan / Akronim</span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">
                                            {fakultas.nama_singkat || '-'}
                                        </span>
                                    </div>

                                    {/* SK Pendirian with PDF Viewer */}
                                    <div className="pt-3 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">SK Pendirian Fakultas</span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-right">
                                                {fakultas.no_sk_pendirian || 'Belum Tercatat'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span>
                                                {fakultas.tanggal_sk_pendirian
                                                    ? new Date(fakultas.tanggal_sk_pendirian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    : 'Tanggal belum diisi'}
                                            </span>
                                            {fakultas.file_sk_pendirian_url ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPdfPreviewUrl(fakultas.file_sk_pendirian_url || null);
                                                            setPdfPreviewTitle(`SK Pendirian - ${fakultas.nama}`);
                                                        }}
                                                        className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Eye className="size-3" />
                                                        <span>Lihat Scan PDF</span>
                                                    </button>
                                                    <a
                                                        href={fakultas.file_sk_pendirian_url}
                                                        download
                                                        className="text-slate-500 hover:text-slate-800 inline-flex items-center"
                                                        title="Unduh Berkas PDF"
                                                    >
                                                        <Download className="size-3" />
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Scan PDF belum diunggah</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* SK Izin Operasional with PDF Viewer */}
                                    <div className="pt-3 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">SK Izin Operasional</span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-right">
                                                {fakultas.no_sk_izin_operasional || 'Belum Tercatat'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span>
                                                {fakultas.tanggal_sk_izin_operasional
                                                    ? new Date(fakultas.tanggal_sk_izin_operasional).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    : 'Tanggal belum diisi'}
                                            </span>
                                            {fakultas.file_sk_izin_operasional_url ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPdfPreviewUrl(fakultas.file_sk_izin_operasional_url || null);
                                                            setPdfPreviewTitle(`SK Izin Operasional - ${fakultas.nama}`);
                                                        }}
                                                        className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Eye className="size-3" />
                                                        <span>Lihat Scan PDF</span>
                                                    </button>
                                                    <a
                                                        href={fakultas.file_sk_izin_operasional_url}
                                                        download
                                                        className="text-slate-500 hover:text-slate-800 inline-flex items-center"
                                                        title="Unduh Berkas PDF"
                                                    >
                                                        <Download className="size-3" />
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Scan PDF belum diunggah</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3">
                                        <span className="text-slate-500">ID Feeder PDDIKTI</span>
                                        <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                                            {fakultas.id_feeder || 'Belum Terkoneksi'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Pimpinan Dekanat & Personalia UPPS (Standarisasi BAN-PT) */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            Personalia UPPS &amp; Pimpinan
                                        </h2>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                        Struktur UPPS
                                    </span>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Dekan Main Spotlight Card */}
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent border border-emerald-200/70 dark:border-emerald-800/60 flex items-start gap-3.5">
                                        <div className="size-12 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                                            {fakultas.dekan?.foto_url ? (
                                                <img
                                                    src={fakultas.dekan.foto_url}
                                                    alt={fakultas.dekan.nama_lengkap}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <span>{(fakultas.dekan_nama_lengkap_bergelar || fakultas.dekan_nama || 'D').substring(0, 2).toUpperCase()}</span>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                                                Dekan Fakultas
                                            </span>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug mt-0.5">
                                                {fakultas.dekan_nama_lengkap_bergelar || fakultas.dekan_nama || 'Belum Ditetapkan'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                                                {(fakultas.dekan?.nidn || fakultas.dekan_nidn) && (
                                                    <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                        NIDN: {fakultas.dekan?.nidn || fakultas.dekan_nidn}
                                                    </span>
                                                )}
                                                {fakultas.dekan?.niy_nip && (
                                                    <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                        NIP: {fakultas.dekan.niy_nip}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Wakil Dekan 1 - 4 Grid */}
                                    <div className="space-y-2 pt-2">
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Para Wakil Dekan
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                                                <span className="text-[10px] font-bold text-slate-400 block">Wadek I (Akademik)</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                                                    {fakultas.wakil_dekan_1_nama_lengkap_bergelar || fakultas.wakil_dekan_1 || '-'}
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                                                <span className="text-[10px] font-bold text-slate-400 block">Wadek II (Keuangan)</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                                                    {fakultas.wakil_dekan_2_nama_lengkap_bergelar || fakultas.wakil_dekan_2 || '-'}
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                                                <span className="text-[10px] font-bold text-slate-400 block">Wadek III (Kemahasiswaan)</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                                                    {fakultas.wakil_dekan_3_nama_lengkap_bergelar || fakultas.wakil_dekan_3 || '-'}
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                                                <span className="text-[10px] font-bold text-slate-400 block">Wadek IV (Kerjasama)</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                                                    {fakultas.wakil_dekan_4_nama_lengkap_bergelar || fakultas.wakil_dekan_4 || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personalia Penjaminan Mutu & Tata Usaha (GPMF & KTU) */}
                                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Penjaminan Mutu &amp; Tata Usaha
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800">
                                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">
                                                    Ketua GPMF (Mutu)
                                                </span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                                                    {fakultas.ketua_gpmf_nama_lengkap_bergelar || 'Belum Ditetapkan'}
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-lg bg-sky-50/40 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800">
                                                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 block">
                                                    Kepala Tata Usaha
                                                </span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                                                    {fakultas.kepala_tata_usaha_nama_lengkap || 'Belum Ditetapkan'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Kontak & Kanal Resmi */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 space-y-3 text-xs">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <MapPin className="size-4 text-emerald-600" />
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Alamat &amp; Kontak Resmi</h3>
                                </div>
                                <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                                    <MapPin className="size-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span>{fakultas.alamat || 'Alamat kantor belum diisi'}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                                    <Phone className="size-4 text-slate-400 shrink-0" />
                                    {fakultas.telepon ? (
                                        <a href={`tel:${fakultas.telepon}`} className="hover:text-emerald-600 font-mono">
                                            {fakultas.telepon}
                                        </a>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                                    <Mail className="size-4 text-slate-400 shrink-0" />
                                    {fakultas.email ? (
                                        <a href={`mailto:${fakultas.email}`} className="hover:text-emerald-600">
                                            {fakultas.email}
                                        </a>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                                    <Globe className="size-4 text-slate-400 shrink-0" />
                                    {fakultas.website ? (
                                        <a
                                            href={fakultas.website.startsWith('http') ? fakultas.website : `https://${fakultas.website}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:text-emerald-600 inline-flex items-center gap-1"
                                        >
                                            <span>{fakultas.website}</span>
                                            <ExternalLink className="size-3 text-slate-400" />
                                        </a>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Tabs for Program Studi Binaan & Riwayat Dekanat (~60%) */}
                        <div className="lg:col-span-7 space-y-5">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                                {/* Tab Header Right Column */}
                                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setRightActiveTab('prodi')}
                                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
                                                rightActiveTab === 'prodi'
                                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                            }`}
                                        >
                                            <GraduationCap className="size-4" />
                                            <span>Program Studi Binaan ({fakultas.program_studis?.length || 0})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setRightActiveTab('tenure')}
                                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
                                                rightActiveTab === 'tenure'
                                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                            }`}
                                        >
                                            <History className="size-4" />
                                            <span>Riwayat Dekanat ({fakultas.riwayat_pimpinan?.length || 0})</span>
                                        </button>
                                    </div>

                                    {rightActiveTab === 'prodi' ? (
                                        <div className="relative w-full sm:w-52">
                                            <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                                            <Input
                                                type="text"
                                                placeholder="Cari prodi..."
                                                value={prodiSearch}
                                                onChange={(e) => setProdiSearch(e.target.value)}
                                                className="pl-8 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                            />
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => setIsTenureModalOpen(true)}
                                            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl gap-1 cursor-pointer shrink-0"
                                        >
                                            <Plus className="size-3.5" />
                                            <span>Tambah Riwayat</span>
                                        </Button>
                                    )}
                                </div>

                                {/* TAB 1: Daftar Program Studi */}
                                {rightActiveTab === 'prodi' && (
                                    <div className="p-5">
                                        {filteredProdis.length === 0 ? (
                                            <EmptyState
                                                icon={GraduationCap}
                                                title="Tidak Ada Program Studi"
                                                description={
                                                    prodiSearch
                                                        ? 'Tidak ditemukan program studi yang sesuai dengan kata kunci.'
                                                        : 'Fakultas ini belum memiliki Program Studi binaan terdaftar.'
                                                }
                                            />
                                        ) : (
                                            <div className="grid grid-cols-1 gap-4">
                                                {filteredProdis.map((prodi) => (
                                                    <div
                                                        key={prodi.id}
                                                        className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800/80 bg-white dark:bg-slate-900 transition shadow-2xs group"
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                            <div className="space-y-1.5 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span
                                                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                                                            prodi.jenjang === 'S1'
                                                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                                                : prodi.jenjang === 'S2'
                                                                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                        }`}
                                                                    >
                                                                        {prodi.jenjang}
                                                                    </span>
                                                                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                                                                        {prodi.kode}
                                                                    </span>
                                                                    <StatusBadge
                                                                        variant={prodi.status === 'aktif' ? 'success' : 'danger'}
                                                                        label={prodi.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                                                                    />
                                                                </div>
                                                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 transition">
                                                                    {prodi.nama}
                                                                </h3>
                                                            </div>
                                                            <Link
                                                                href={`/master/program-studi/${prodi.id}`}
                                                                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition shrink-0"
                                                            >
                                                                <span>Detail Prodi</span>
                                                                <ExternalLink className="size-3.5" />
                                                            </Link>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <Award className="size-4 text-amber-500 shrink-0" />
                                                                <div className="min-w-0">
                                                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Akreditasi</span>
                                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                                                                        {prodi.akreditasi ? `${prodi.lembaga_akreditasi || 'BAN-PT'}: ${prodi.akreditasi}` : 'Belum Terakreditasi'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <UserCheck className="size-4 text-sky-500 shrink-0" />
                                                                <div className="min-w-0">
                                                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ketua Prodi</span>
                                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                                                                        {prodi.ketua_prodi_nama || 'Belum Ditetapkan'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Users className="size-4 text-emerald-500 shrink-0" />
                                                                <div className="min-w-0">
                                                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mahasiswa Aktif</span>
                                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                                                                        {(prodi.mahasiswas_count ?? 0).toLocaleString('id-ID')} Orang
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TAB 2: Riwayat Masa Jabatan Dekanat & Pimpinan */}
                                {rightActiveTab === 'tenure' && (
                                    <div className="p-5">
                                        {(!fakultas.riwayat_pimpinan || fakultas.riwayat_pimpinan.length === 0) ? (
                                            <EmptyState
                                                icon={History}
                                                title="Belum Ada Riwayat Dekanat"
                                                description="Belum ada riwayat kepemimpinan dekanat yang dicatat untuk fakultas ini. Klik tombol Tambah Riwayat untuk mencatat masa jabatan."
                                                action={
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setIsTenureModalOpen(true)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl gap-1.5"
                                                    >
                                                        <Plus className="size-4" />
                                                        <span>Catat Masa Jabatan Baru</span>
                                                    </Button>
                                                }
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                {fakultas.riwayat_pimpinan.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-200 bg-white dark:bg-slate-900 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                                    >
                                                        <div className="flex items-start gap-3.5 min-w-0">
                                                            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center shrink-0 overflow-hidden">
                                                                {item.dosen?.foto_url ? (
                                                                    <img src={item.dosen.foto_url} alt="" className="size-full object-cover" />
                                                                ) : (
                                                                    <span>{(item.dosen?.nama_bergelar || 'D').substring(0, 2).toUpperCase()}</span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                        {item.jabatan_label || item.jabatan}
                                                                    </span>
                                                                    {item.is_aktif ? (
                                                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-white">
                                                                            Aktif
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                                                            Demisioner
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                                                    {item.dosen?.nama_bergelar || item.dosen?.nama_lengkap || 'Dosen Tidak Dikenal'}
                                                                </h4>
                                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="size-3 text-slate-400" />
                                                                        <span>
                                                                            {new Date(item.periode_mulai).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })} -{' '}
                                                                            {item.periode_selesai
                                                                                ? new Date(item.periode_selesai).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
                                                                                : 'Sekarang'}
                                                                        </span>
                                                                    </span>
                                                                    {item.no_sk_pelantikan && (
                                                                        <span className="font-mono text-slate-600 dark:text-slate-400">
                                                                            SK: {item.no_sk_pelantikan}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions: View SK & Delete */}
                                                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                            {item.file_sk_pelantikan_url && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setPdfPreviewUrl(item.file_sk_pelantikan_url || null);
                                                                        setPdfPreviewTitle(`SK Pelantikan - ${item.dosen?.nama_bergelar || item.jabatan}`);
                                                                    }}
                                                                    className="h-8 text-xs font-semibold border-slate-200 hover:bg-slate-50 gap-1 cursor-pointer"
                                                                >
                                                                    <Eye className="size-3.5 text-emerald-600" />
                                                                    <span>Scan SK</span>
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteTenure(item)}
                                                                className="h-8 px-2 text-rose-600 hover:bg-rose-50 border-slate-200 cursor-pointer"
                                                                title="Hapus Rekam Jejak"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </PageContainer>

            {/* Modal Form Edit Fakultas (With PDF Upload & UPPS Personalia) */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                            <Building2 className="size-5 text-emerald-600" />
                            <span>Edit Fakultas &amp; Personalia UPPS</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Perbarui identitas resmi, legalitas SK PDF, pimpinan dekanat, wadek 1-4, dan ketua GPMF.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tab Navigation in Dialog */}
                    <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mt-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('identitas')}
                            className={`px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                                activeTab === 'identitas'
                                    ? 'border-emerald-600 text-emerald-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Identitas Inti
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('legalitas')}
                            className={`px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                                activeTab === 'legalitas'
                                    ? 'border-emerald-600 text-emerald-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Legalitas &amp; Berkas PDF
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('pimpinan')}
                            className={`px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                                activeTab === 'pimpinan'
                                    ? 'border-emerald-600 text-emerald-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Personalia Dekanat &amp; UPPS
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('visi_misi')}
                            className={`px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                                activeTab === 'visi_misi'
                                    ? 'border-emerald-600 text-emerald-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Kontak &amp; Visi Misi
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-4 pt-3">
                        {/* TAB 1: Identitas Inti */}
                        {activeTab === 'identitas' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">
                                            Kode Fakultas <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            value={editForm.data.kode}
                                            onChange={(e) => editForm.setData('kode', e.target.value.toUpperCase())}
                                            placeholder="Contoh: FTK, FASIH"
                                            className="font-mono text-xs h-9 uppercase"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Singkatan / Akronim</Label>
                                        <Input
                                            value={editForm.data.nama_singkat}
                                            onChange={(e) => editForm.setData('nama_singkat', e.target.value)}
                                            placeholder="Contoh: FTK"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Nama Resmi Fakultas <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        value={editForm.data.nama}
                                        onChange={(e) => editForm.setData('nama', e.target.value)}
                                        placeholder="Contoh: Fakultas Tarbiyah dan Keguruan"
                                        className="text-xs h-9"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Nama Internasional (English)</Label>
                                    <Input
                                        value={editForm.data.nama_en}
                                        onChange={(e) => editForm.setData('nama_en', e.target.value)}
                                        placeholder="Faculty of Tarbiyah and Teacher Training"
                                        className="text-xs h-9"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Status Operasional</Label>
                                        <Select
                                            value={editForm.data.status}
                                            onValueChange={(val) => editForm.setData('status', val)}
                                        >
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="aktif" className="text-xs">Aktif</SelectItem>
                                                <SelectItem value="nonaktif" className="text-xs">Non-Aktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Luas Fasilitas (m²)</Label>
                                        <Input
                                            type="number"
                                            value={editForm.data.luas_m2}
                                            onChange={(e) => editForm.setData('luas_m2', e.target.value)}
                                            placeholder="1500"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: Legalitas & Berkas PDF SK */}
                        {activeTab === 'legalitas' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Nomor SK Pendirian</Label>
                                        <Input
                                            value={editForm.data.no_sk_pendirian}
                                            onChange={(e) => editForm.setData('no_sk_pendirian', e.target.value)}
                                            placeholder="123/KPT/I/2018"
                                            className="font-mono text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Tanggal SK Pendirian</Label>
                                        <Input
                                            type="date"
                                            value={editForm.data.tanggal_sk_pendirian}
                                            onChange={(e) => editForm.setData('tanggal_sk_pendirian', e.target.value)}
                                            className="text-xs h-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <Upload className="size-3.5 text-emerald-600" />
                                        <span>Upload Berkas SK Pendirian (PDF Maks. 5MB)</span>
                                    </Label>
                                    <Input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                editForm.setData('file_sk_pendirian', e.target.files[0]);
                                            }
                                        }}
                                        className="text-xs h-9"
                                    />
                                    {fakultas.file_sk_pendirian_url && (
                                        <p className="text-[11px] text-emerald-600 font-medium">
                                            Berkas saat ini tersimpan. Unggah file baru untuk menggantinya.
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Nomor SK Izin Operasional</Label>
                                        <Input
                                            value={editForm.data.no_sk_izin_operasional}
                                            onChange={(e) => editForm.setData('no_sk_izin_operasional', e.target.value)}
                                            placeholder="456/B/HK/2020"
                                            className="font-mono text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Tanggal SK Izin Operasional</Label>
                                        <Input
                                            type="date"
                                            value={editForm.data.tanggal_sk_izin_operasional}
                                            onChange={(e) => editForm.setData('tanggal_sk_izin_operasional', e.target.value)}
                                            className="text-xs h-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <Upload className="size-3.5 text-emerald-600" />
                                        <span>Upload Berkas SK Izin Operasional (PDF Maks. 5MB)</span>
                                    </Label>
                                    <Input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                editForm.setData('file_sk_izin_operasional', e.target.files[0]);
                                            }
                                        }}
                                        className="text-xs h-9"
                                    />
                                    {fakultas.file_sk_izin_operasional_url && (
                                        <p className="text-[11px] text-emerald-600 font-medium">
                                            Berkas saat ini tersimpan. Unggah file baru untuk menggantinya.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: Personalia Dekanat & UPPS */}
                        {activeTab === 'pimpinan' && (
                            <div className="space-y-4">
                                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800 rounded-xl space-y-3">
                                    <DosenSearchCombobox
                                        label="Hubungkan Dekan ke Master Dosen"
                                        sublabel="Otomatis mengisi nama lengkap, gelar akademik, dan NIDN Dekan."
                                        dosens={dosens}
                                        selectedDosen={selectedDekanDosen}
                                        onSelect={handleSelectDekan}
                                        onClear={handleClearDekan}
                                    />
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                        Relasi Wakil Dekan I - IV (Master Dosen)
                                    </Label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-slate-600">Wadek I (Akademik)</Label>
                                            <Select
                                                value={editForm.data.wakil_dekan_1_dosen_id ? String(editForm.data.wakil_dekan_1_dosen_id) : 'none'}
                                                onValueChange={(val) => editForm.setData('wakil_dekan_1_dosen_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Pilih Dosen Wadek I..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs text-slate-400">-- Tanpa Relasi (Kosong) --</SelectItem>
                                                    {dosens.map((d) => (
                                                        <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                            {d.nama_bergelar || d.nama_lengkap}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-slate-600">Wadek II (Keuangan &amp; Umum)</Label>
                                            <Select
                                                value={editForm.data.wakil_dekan_2_dosen_id ? String(editForm.data.wakil_dekan_2_dosen_id) : 'none'}
                                                onValueChange={(val) => editForm.setData('wakil_dekan_2_dosen_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Pilih Dosen Wadek II..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs text-slate-400">-- Tanpa Relasi (Kosong) --</SelectItem>
                                                    {dosens.map((d) => (
                                                        <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                            {d.nama_bergelar || d.nama_lengkap}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-slate-600">Wadek III (Kemahasiswaan)</Label>
                                            <Select
                                                value={editForm.data.wakil_dekan_3_dosen_id ? String(editForm.data.wakil_dekan_3_dosen_id) : 'none'}
                                                onValueChange={(val) => editForm.setData('wakil_dekan_3_dosen_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Pilih Dosen Wadek III..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs text-slate-400">-- Tanpa Relasi (Kosong) --</SelectItem>
                                                    {dosens.map((d) => (
                                                        <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                            {d.nama_bergelar || d.nama_lengkap}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-slate-600">Wadek IV (Kerjasama &amp; Riset)</Label>
                                            <Select
                                                value={editForm.data.wakil_dekan_4_dosen_id ? String(editForm.data.wakil_dekan_4_dosen_id) : 'none'}
                                                onValueChange={(val) => editForm.setData('wakil_dekan_4_dosen_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Pilih Dosen Wadek IV..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs text-slate-400">-- Tanpa Relasi (Kosong) --</SelectItem>
                                                    {dosens.map((d) => (
                                                        <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                            {d.nama_bergelar || d.nama_lengkap}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                        Personalia UPPS (GPMF &amp; Tata Usaha)
                                    </Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-emerald-700">Ketua GPMF (Dosen)</Label>
                                            <Select
                                                value={editForm.data.ketua_gpmf_dosen_id ? String(editForm.data.ketua_gpmf_dosen_id) : 'none'}
                                                onValueChange={(val) => editForm.setData('ketua_gpmf_dosen_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-9 text-xs">
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
                                            <Label className="text-[11px] font-semibold text-sky-700">Kepala Bagian Tata Usaha (Pegawai)</Label>
                                            <Select
                                                value={editForm.data.kepala_tata_usaha_pegawai_id ? String(editForm.data.kepala_tata_usaha_pegawai_id) : 'none'}
                                                onValueChange={(val) => editForm.setData('kepala_tata_usaha_pegawai_id', val === 'none' ? null : Number(val))}
                                            >
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Pilih Kepala TU..." />
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

                        {/* TAB 4: Kontak & Visi Misi */}
                        {activeTab === 'visi_misi' && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Alamat Gedung</Label>
                                    <Input
                                        value={editForm.data.alamat}
                                        onChange={(e) => editForm.setData('alamat', e.target.value)}
                                        placeholder="Jl. Raya Kraton..."
                                        className="text-xs h-9"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Telepon Kantor</Label>
                                        <Input
                                            value={editForm.data.telepon}
                                            onChange={(e) => editForm.setData('telepon', e.target.value)}
                                            placeholder="(0343) 421xxx"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Email Resmi</Label>
                                        <Input
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={(e) => editForm.setData('email', e.target.value)}
                                            placeholder="fakultas@kampus.ac.id"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Website Resmi</Label>
                                        <Input
                                            value={editForm.data.website}
                                            onChange={(e) => editForm.setData('website', e.target.value)}
                                            placeholder="ftk.kampus.ac.id"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <Label className="text-xs font-semibold">Visi Fakultas</Label>
                                    <Textarea
                                        rows={3}
                                        value={editForm.data.visi}
                                        onChange={(e) => editForm.setData('visi', e.target.value)}
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Misi Fakultas</Label>
                                    <Textarea
                                        rows={4}
                                        value={editForm.data.misi}
                                        onChange={(e) => editForm.setData('misi', e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-xs h-9 rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-2xs cursor-pointer"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Tambah Riwayat Masa Jabatan Pimpinan (Tenure History) */}
            <Dialog open={isTenureModalOpen} onOpenChange={setIsTenureModalOpen}>
                <DialogContent className="max-w-xl rounded-2xl">
                    <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <History className="size-4.5 text-emerald-600" />
                            <span>Catat Riwayat Masa Jabatan Dekanat</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Dokumentasikan periode pengabdian pimpinan struktural fakultas untuk instrumen akreditasi 9 Kriteria.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateTenure} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <DosenSearchCombobox
                                label="Pilih Dosen Pimpinan"
                                sublabel="Dosen yang mengemban amanah struktural."
                                dosens={dosens}
                                selectedDosen={selectedTenureDosen}
                                onSelect={(d) => tenureForm.setData('dosen_id', d.id)}
                                onClear={() => tenureForm.setData('dosen_id', null)}
                                error={tenureForm.errors.dosen_id}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Amanah Jabatan Struktural</Label>
                            <Select
                                value={tenureForm.data.jabatan}
                                onValueChange={(val) => tenureForm.setData('jabatan', val)}
                            >
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dekan" className="text-xs">Dekan Fakultas</SelectItem>
                                    <SelectItem value="wakil_dekan_1" className="text-xs">Wakil Dekan I (Akademik)</SelectItem>
                                    <SelectItem value="wakil_dekan_2" className="text-xs">Wakil Dekan II (Keuangan)</SelectItem>
                                    <SelectItem value="wakil_dekan_3" className="text-xs">Wakil Dekan III (Kemahasiswaan)</SelectItem>
                                    <SelectItem value="wakil_dekan_4" className="text-xs">Wakil Dekan IV (Kerjasama)</SelectItem>
                                    <SelectItem value="ketua_gpmf" className="text-xs">Ketua GPMF (Mutu)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Periode Mulai Menjabat <span className="text-rose-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={tenureForm.data.periode_mulai}
                                    onChange={(e) => tenureForm.setData('periode_mulai', e.target.value)}
                                    className="text-xs h-9"
                                    required
                                />
                                {tenureForm.errors.periode_mulai && <p className="text-[11px] text-rose-500">{tenureForm.errors.periode_mulai}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Periode Selesai (Kosongkan bila masih aktif)</Label>
                                <Input
                                    type="date"
                                    value={tenureForm.data.periode_selesai}
                                    onChange={(e) => tenureForm.setData('periode_selesai', e.target.value)}
                                    className="text-xs h-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Nomor SK Pelantikan</Label>
                            <Input
                                value={tenureForm.data.no_sk_pelantikan}
                                onChange={(e) => tenureForm.setData('no_sk_pelantikan', e.target.value)}
                                placeholder="Contoh: SK-YASINI/REK/2022/012"
                                className="font-mono text-xs h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Upload Berkas Scan SK Pelantikan (PDF Maks. 5MB)</Label>
                            <Input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        tenureForm.setData('file_sk_pelantikan', e.target.files[0]);
                                    }
                                }}
                                className="text-xs h-9"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_aktif"
                                checked={tenureForm.data.is_aktif}
                                onChange={(e) => tenureForm.setData('is_aktif', e.target.checked)}
                                className="size-4 rounded text-emerald-600 border-slate-300 cursor-pointer"
                            />
                            <Label htmlFor="is_aktif" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                Sedang Menjabat Aktif Saat Ini
                            </Label>
                        </div>

                        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsTenureModalOpen(false)}
                                className="text-xs h-9 rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={tenureForm.processing || !tenureForm.data.dosen_id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-2xs cursor-pointer"
                            >
                                {tenureForm.processing ? 'Menyimpan...' : 'Simpan Riwayat Pimpinan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Inline PDF Viewer */}
            <Dialog open={Boolean(pdfPreviewUrl)} onOpenChange={(open) => !open && setPdfPreviewUrl(null)}>
                <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden flex flex-col rounded-2xl">
                    <DialogHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <FileText className="size-4 text-emerald-600" />
                            <span>Pratinjau Dokumen SK Resmi: {pdfPreviewTitle}</span>
                        </DialogTitle>
                        {pdfPreviewUrl && (
                            <a
                                href={pdfPreviewUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mr-6"
                            >
                                <Download className="size-3.5" />
                                <span>Unduh PDF</span>
                            </a>
                        )}
                    </DialogHeader>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2">
                        {pdfPreviewUrl && (
                            <iframe
                                src={pdfPreviewUrl}
                                className="size-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                                title={pdfPreviewTitle || 'Pratinjau PDF'}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

FakultasShow.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Master Data', href: '/master/fakultas' },
        { title: 'Fakultas', href: '/master/fakultas' },
        { title: 'Detail Fakultas', href: '#' },
    ],
};
