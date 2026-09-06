import { Head, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    Edit,
    Plus,
    Trash2,
    Calendar,
    Filter,
    Clock,
    Sparkles,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { MasterDataNav } from '@/components/master-data-nav';
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
import { formatDateIndonesian } from '@/lib/utils';

type TahunAjaran = {
    id: number;
    nama: string;
    is_active: boolean;
    mulai?: string;
    selesai?: string;
};

type KalenderAkademik = {
    id: number;
    tahun_ajaran_id: number;
    kegiatan: string;
    tipe_kegiatan: string;
    mulai: string;
    selesai: string;
    deskripsi?: string | null;
    is_published: boolean;
    status?: 'upcoming' | 'active' | 'closed';
    tahun_ajaran?: TahunAjaran;
};

type AvailableType = {
    key: string;
    label: string;
    color: string;
};

interface Props {
    kalenderAkademiks: KalenderAkademik[];
    tahunAjarans: TahunAjaran[];
    selectedTahunAjaranId: number;
    activeTahunAjaran?: TahunAjaran | null;
    availableTypes?: AvailableType[];
    activeAgendasNow?: KalenderAkademik[];
}

const DEFAULT_TYPES: AvailableType[] = [
    { key: 'pembayaran_ukt', label: 'Pembayaran Biaya Kuliah & UKT', color: 'amber' },
    { key: 'registrasi_ulang', label: 'Her-Registrasi / Registrasi Ulang', color: 'blue' },
    { key: 'krs', label: 'Pengisian & Perubahan KRS', color: 'emerald' },
    { key: 'perwalian_krs', label: 'Persetujuan KRS Dosen Wali', color: 'indigo' },
    { key: 'perkuliahan', label: 'Masa Perkuliahan Efektif', color: 'teal' },
    { key: 'uts', label: 'Ujian Tengah Semester (UTS)', color: 'purple' },
    { key: 'uas', label: 'Ujian Akhir Semester (UAS)', color: 'rose' },
    { key: 'input_nilai', label: 'Penginputan Nilai oleh Dosen', color: 'cyan' },
    { key: 'yudisium', label: 'Pendaftaran & Sidang Yudisium', color: 'violet' },
    { key: 'kkn_pkl', label: 'Pelaksanaan KKN / PKL Magang', color: 'sky' },
    { key: 'libur_semester', label: 'Libur Semester / Masa Tenang', color: 'slate' },
    { key: 'lainnya', label: 'Agenda Lainnya / Umum', color: 'slate' },
];

export default function KalenderAkademikIndex({
    kalenderAkademiks = [],
    tahunAjarans = [],
    selectedTahunAjaranId,
    activeTahunAjaran,
    availableTypes = DEFAULT_TYPES,
    activeAgendasNow = [],
}: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<KalenderAkademik | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTahun, setFilterTahun] = useState<number>(selectedTahunAjaranId || (activeTahunAjaran?.id ?? 0));
    const [filterTipe, setFilterTipe] = useState<string>('all');

    const createForm = useForm({
        tahun_ajaran_id: filterTahun || activeTahunAjaran?.id || (tahunAjarans[0]?.id ?? 0),
        kegiatan: '',
        tipe_kegiatan: 'krs',
        mulai: '',
        selesai: '',
        deskripsi: '',
        is_published: true,
    });

    const editForm = useForm({
        tahun_ajaran_id: 0,
        kegiatan: '',
        tipe_kegiatan: 'lainnya',
        mulai: '',
        selesai: '',
        deskripsi: '',
        is_published: true,
    });

    const filteredList = useMemo(() => {
        return kalenderAkademiks.filter((item) => {
            const matchesTahun = filterTahun === 0 || item.tahun_ajaran_id === filterTahun;
            const matchesTipe = filterTipe === 'all' || item.tipe_kegiatan === filterTipe;
            const matchesSearch =
                !searchQuery ||
                item.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.deskripsi && item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesTahun && matchesTipe && matchesSearch;
        });
    }, [kalenderAkademiks, filterTahun, filterTipe, searchQuery]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/master/kalender-akademik', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingItem) {
            return;
        }

        editForm.put(`/master/kalender-akademik/${editingItem.id}`, {
            onSuccess: () => {
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (item: KalenderAkademik) => {
        confirm({
            title: 'Hapus Agenda Kalender',
            description: `Apakah Anda yakin ingin menghapus agenda "${item.kegiatan}"? Tindakan ini dapat memengaruhi aturan waktu operasional sistem.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/master/kalender-akademik/${item.id}`);
            },
        });
    };

    const openEditModal = (item: KalenderAkademik) => {
        setEditingItem(item);
        editForm.setData({
            tahun_ajaran_id: item.tahun_ajaran_id,
            kegiatan: item.kegiatan,
            tipe_kegiatan: item.tipe_kegiatan || 'lainnya',
            mulai: item.mulai ? item.mulai.substring(0, 10) : '',
            selesai: item.selesai ? item.selesai.substring(0, 10) : '',
            deskripsi: item.deskripsi || '',
            is_published: item.is_published ?? true,
        });
    };

    const getTimelineBadge = (item: KalenderAkademik) => {
        const today = new Date().toISOString().substring(0, 10);
        const start = item.mulai ? item.mulai.substring(0, 10) : '';
        const end = item.selesai ? item.selesai.substring(0, 10) : '';

        if (!item.is_published) {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                    Draft (Tertutup)
                </span>
            );
        }

        if (start && today < start) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    <Clock className="size-3 text-sky-600" />
                    <span>Akan Datang</span>
                </span>
            );
        }

        if (end && today > end) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <CheckCircle2 className="size-3 text-slate-400" />
                    <span>Telah Selesai</span>
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sedang Berlangsung</span>
            </span>
        );
    };

    const getTipeBadgeColor = (tipe: string) => {
        switch (tipe) {
            case 'krs':
            case 'perwalian_krs':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pembayaran_ukt':
            case 'registrasi_ulang':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'perkuliahan':
                return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'uts':
            case 'uas':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'input_nilai':
                return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            case 'yudisium':
                return 'bg-violet-50 text-violet-700 border-violet-200';
            case 'kkn_pkl':
                return 'bg-sky-50 text-sky-700 border-sky-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getTipeLabel = (tipeKey: string) => {
        const found = availableTypes.find((t) => t.key === tipeKey);

        return found ? found.label : tipeKey.replace('_', ' ');
    };

    return (
        <>
            {confirmDialog}
            <Head title="Kalender Akademik & Timeline Engine" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto">
                <MasterDataNav currentHref="/master/kalender-akademik" />

                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                            <CalendarDays className="size-6 sm:size-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Kalender Akademik & Timeline Engine
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Pusat kendali jadwal dan aturan waktu resmi perkuliahan, pembayaran UKT, pengisian KRS, dan penilaian dosen.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            createForm.setData(
                                'tahun_ajaran_id',
                                filterTahun || activeTahunAjaran?.id || (tahunAjarans[0]?.id ?? 0)
                            );
                            setIsCreateOpen(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition self-start sm:self-auto cursor-pointer"
                    >
                        <Plus className="size-4" />
                        <span>Tambah Agenda Akademik</span>
                    </Button>
                </div>

                {/* Active Milestones Live Banner */}
                {activeAgendasNow.length > 0 && (
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="size-2 rounded-full bg-emerald-600 animate-ping" />
                            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                                Agenda Akademik Sedang Berlangsung Hari Ini
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {activeAgendasNow.map((agenda) => (
                                <div
                                    key={agenda.id}
                                    className="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                            <span
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${getTipeBadgeColor(
                                                    agenda.tipe_kegiatan
                                                )}`}
                                            >
                                                {agenda.tipe_kegiatan.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                s/d {formatDateIndonesian(agenda.selesai)}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{agenda.kegiatan}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filter and Search Toolbar */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-2">
                            <Filter className="size-4 text-slate-400 shrink-0" />
                            <label htmlFor="filter-tahun" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                                Semester:
                            </label>
                            <select
                                id="filter-tahun"
                                aria-label="Pilih Periode Semester"
                                value={filterTahun}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setFilterTahun(val);
                                    router.get(
                                        '/master/kalender-akademik',
                                        { tahun_ajaran_id: val },
                                        { preserveState: true }
                                    );
                                }}
                                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value={0}>Semua Periode</option>
                                {tahunAjarans.map((ta) => (
                                    <option key={ta.id} value={ta.id}>
                                        {ta.nama} {ta.is_active ? '(Aktif)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label htmlFor="filter-tipe" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                                Kategori:
                            </label>
                            <select
                                id="filter-tipe"
                                aria-label="Pilih Kategori Kegiatan"
                                value={filterTipe}
                                onChange={(e) => setFilterTipe(e.target.value)}
                                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="all">Semua Kategori</option>
                                {availableTypes.map((t) => (
                                    <option key={t.key} value={t.key}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="relative w-full lg:w-72">
                        <Input
                            placeholder="Cari kegiatan atau deskripsi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-xs h-9 pl-9 pr-3 bg-slate-50 border-slate-200 rounded-lg"
                        />
                        <Calendar className="size-3.5 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                </div>

                {/* Table List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600 border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold">
                                    <th className="px-4 py-3 w-12 text-center">No</th>
                                    <th className="px-4 py-3">Nama Kegiatan & Kategori</th>
                                    <th className="px-4 py-3">Periode Semester</th>
                                    <th className="px-4 py-3">Rentang Jadwal</th>
                                    <th className="px-4 py-3">Status Waktu</th>
                                    <th className="px-4 py-3 w-24 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">
                                            Tidak ada agenda kalender akademik ditemukan untuk kriteria filter ini.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3.5 text-center text-slate-400 font-mono">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTipeBadgeColor(
                                                                item.tipe_kegiatan
                                                            )}`}
                                                        >
                                                            {getTipeLabel(item.tipe_kegiatan)}
                                                        </span>
                                                        <span className="font-bold text-slate-900 text-xs">
                                                            {item.kegiatan}
                                                        </span>
                                                    </div>
                                                    {item.deskripsi && (
                                                        <p className="text-[11px] text-slate-500 line-clamp-1">
                                                            {item.deskripsi}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                                                    {item.tahun_ajaran?.nama ?? 'Tahun Ajaran'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="text-[11px] text-slate-700 space-y-0.5">
                                                    <p className="font-medium text-slate-900">
                                                        {formatDateIndonesian(item.mulai)} s/d
                                                    </p>
                                                    <p className="text-slate-500 font-medium">
                                                        {formatDateIndonesian(item.selesai)}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">{getTimelineBadge(item)}</td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                        title="Edit Agenda"
                                                    >
                                                        <Edit className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                        title="Hapus Agenda"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Agenda */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <form onSubmit={handleCreateSubmit}>
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <CalendarDays className="size-5 text-emerald-600" />
                                <span>Tambah Agenda Kalender Akademik</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Masukkan rincian kegiatan dan aturan waktu pelaksanaan jadwal semester.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3.5 py-3 text-xs">
                            <div className="space-y-1">
                                <Label htmlFor="create-ta" className="text-xs font-semibold">
                                    Periode Semester / Tahun Ajaran
                                </Label>
                                <select
                                    id="create-ta"
                                    value={createForm.data.tahun_ajaran_id}
                                    onChange={(e) => createForm.setData('tahun_ajaran_id', Number(e.target.value))}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    required
                                >
                                    {tahunAjarans.map((ta) => (
                                        <option key={ta.id} value={ta.id}>
                                            {ta.nama} {ta.is_active ? '(Aktif)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="create-tipe" className="text-xs font-semibold">
                                    Kategori Timeline Engine
                                </Label>
                                <select
                                    id="create-tipe"
                                    value={createForm.data.tipe_kegiatan}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        createForm.setData('tipe_kegiatan', val);
                                        const typeObj = availableTypes.find((t) => t.key === val);
                                        if (typeObj && (!createForm.data.kegiatan || createForm.data.kegiatan.length < 3)) {
                                            createForm.setData('kegiatan', typeObj.label);
                                        }
                                    }}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    required
                                >
                                    {availableTypes.map((t) => (
                                        <option key={t.key} value={t.key}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="create-kegiatan" className="text-xs font-semibold">
                                    Nama Agenda / Kegiatan
                                </Label>
                                <Input
                                    id="create-kegiatan"
                                    value={createForm.data.kegiatan}
                                    onChange={(e) => createForm.setData('kegiatan', e.target.value)}
                                    placeholder="Contoh: Pengisian & Perubahan KRS Semester Ganjil"
                                    required
                                />
                                {createForm.errors.kegiatan && (
                                    <p className="text-rose-600 text-[11px]">{createForm.errors.kegiatan}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="create-mulai" className="text-xs font-semibold">
                                        Tanggal Mulai
                                    </Label>
                                    <Input
                                        id="create-mulai"
                                        type="date"
                                        value={createForm.data.mulai}
                                        onChange={(e) => createForm.setData('mulai', e.target.value)}
                                        required
                                    />
                                    {createForm.errors.mulai && (
                                        <p className="text-rose-600 text-[11px]">{createForm.errors.mulai}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="create-selesai" className="text-xs font-semibold">
                                        Tanggal Selesai
                                    </Label>
                                    <Input
                                        id="create-selesai"
                                        type="date"
                                        value={createForm.data.selesai}
                                        onChange={(e) => createForm.setData('selesai', e.target.value)}
                                        required
                                    />
                                    {createForm.errors.selesai && (
                                        <p className="text-rose-600 text-[11px]">{createForm.errors.selesai}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="create-deskripsi" className="text-xs font-semibold">
                                    Deskripsi & Petunjuk (Opsional)
                                </Label>
                                <Input
                                    id="create-deskripsi"
                                    value={createForm.data.deskripsi}
                                    onChange={(e) => createForm.setData('deskripsi', e.target.value)}
                                    placeholder="Catatan tambahan untuk civitas..."
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            >
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Agenda'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Agenda */}
            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent className="sm:max-w-md bg-white">
                    <form onSubmit={handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Edit className="size-5 text-emerald-600" />
                                <span>Edit Agenda Kalender Akademik</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Perbarui informasi kegiatan atau tanggal pelaksanaan agenda.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3.5 py-3 text-xs">
                            <div className="space-y-1">
                                <Label htmlFor="edit-ta" className="text-xs font-semibold">
                                    Periode Semester / Tahun Ajaran
                                </Label>
                                <select
                                    id="edit-ta"
                                    value={editForm.data.tahun_ajaran_id}
                                    onChange={(e) => editForm.setData('tahun_ajaran_id', Number(e.target.value))}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    required
                                >
                                    {tahunAjarans.map((ta) => (
                                        <option key={ta.id} value={ta.id}>
                                            {ta.nama} {ta.is_active ? '(Aktif)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="edit-tipe" className="text-xs font-semibold">
                                    Kategori Timeline Engine
                                </Label>
                                <select
                                    id="edit-tipe"
                                    value={editForm.data.tipe_kegiatan}
                                    onChange={(e) => editForm.setData('tipe_kegiatan', e.target.value)}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    required
                                >
                                    {availableTypes.map((t) => (
                                        <option key={t.key} value={t.key}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="edit-kegiatan" className="text-xs font-semibold">
                                    Nama Agenda / Kegiatan
                                </Label>
                                <Input
                                    id="edit-kegiatan"
                                    value={editForm.data.kegiatan}
                                    onChange={(e) => editForm.setData('kegiatan', e.target.value)}
                                    required
                                />
                                {editForm.errors.kegiatan && (
                                    <p className="text-rose-600 text-[11px]">{editForm.errors.kegiatan}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="edit-mulai" className="text-xs font-semibold">
                                        Tanggal Mulai
                                    </Label>
                                    <Input
                                        id="edit-mulai"
                                        type="date"
                                        value={editForm.data.mulai}
                                        onChange={(e) => editForm.setData('mulai', e.target.value)}
                                        required
                                    />
                                    {editForm.errors.mulai && (
                                        <p className="text-rose-600 text-[11px]">{editForm.errors.mulai}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-selesai" className="text-xs font-semibold">
                                        Tanggal Selesai
                                    </Label>
                                    <Input
                                        id="edit-selesai"
                                        type="date"
                                        value={editForm.data.selesai}
                                        onChange={(e) => editForm.setData('selesai', e.target.value)}
                                        required
                                    />
                                    {editForm.errors.selesai && (
                                        <p className="text-rose-600 text-[11px]">{editForm.errors.selesai}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="edit-deskripsi" className="text-xs font-semibold">
                                    Deskripsi & Petunjuk (Opsional)
                                </Label>
                                <Input
                                    id="edit-deskripsi"
                                    value={editForm.data.deskripsi}
                                    onChange={(e) => editForm.setData('deskripsi', e.target.value)}
                                    placeholder="Catatan tambahan untuk civitas..."
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingItem(null)}
                                className="text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Agenda'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
