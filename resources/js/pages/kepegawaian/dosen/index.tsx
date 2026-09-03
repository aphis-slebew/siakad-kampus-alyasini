import { Head, router, useForm } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Edit,
    FileText,
    Filter,
    GraduationCap,
    Info,
    Mail,
    Phone,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    UserCheck,
    Users,
    X,
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
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type RiwayatPendidikan = {
    id: number;
    dosen_id: number;
    jenjang: string;
    institusi: string;
    program_studi: string;
    tahun_lulus: number;
};

type RiwayatJabatan = {
    id: number;
    dosen_id: number;
    jabatan: string;
    tmt: string;
    nomor_sk: string | null;
};

type DosenItem = {
    id: number;
    user_id: number | null;
    program_studi_id: number | null;
    nidn: string | null;
    gelar_depan: string | null;
    nama_lengkap: string;
    gelar_belakang: string | null;
    nik: string | null;
    tempat_lahir: string | null;
    tanggal_lahir: string | null;
    jenis_kelamin: string | null;
    alamat: string | null;
    no_hp: string | null;
    email_pribadi: string | null;
    jabatan_fungsional_saat_ini: string | null;
    status_kepegawaian: 'tetap' | 'tidak_tetap' | 'dpk';
    sertifikasi_pendidik: boolean;
    foto_path: string | null;
    program_studi?: {
        id: number;
        kode: string;
        nama: string;
        jenjang: string;
    };
    user?: {
        id: number;
        name: string;
        email: string;
    };
    riwayat_pendidikans?: RiwayatPendidikan[];
    riwayat_jabatan_fungsionals?: RiwayatJabatan[];
    created_at: string;
};

type OptionProdi = {
    id: number;
    kode: string;
    nama: string;
    jenjang: string;
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

export default function DosenIndex({
    dosens,
    programStudis = [],
    filters = {},
}: {
    dosens: { data: DosenItem[] } & PaginationMeta;
    programStudis: OptionProdi[];
    filters: {
        search?: string;
        program_studi_id?: string;
        jabatan_fungsional?: string;
        status_kepegawaian?: string;
        sertifikasi_pendidik?: string;
    };
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedProdi, setSelectedProdi] = useState(filters.program_studi_id || 'all');
    const [selectedJabatan, setSelectedJabatan] = useState(filters.jabatan_fungsional || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status_kepegawaian || 'all');

    // Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingDosen, setEditingDosen] = useState<DosenItem | null>(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDosenDetail, setSelectedDosenDetail] = useState<DosenItem | null>(null);
    const [detailTab, setDetailTab] = useState<'biodata' | 'pendidikan' | 'jabatan'>('biodata');

    // Form Main Dosen
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_lengkap: '',
        gelar_depan: '',
        gelar_belakang: '',
        nidn: '',
        nik: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: 'L',
        program_studi_id: '',
        alamat: '',
        no_hp: '',
        email_pribadi: '',
        jabatan_fungsional_saat_ini: 'Tenaga Pengajar',
        status_kepegawaian: 'tetap',
        sertifikasi_pendidik: false,
        create_user_account: false,
        password: '',
    });

    // Form Pendidikan Sub-Item
    const formPendidikan = useForm({
        jenjang: 'S2',
        institusi: '',
        program_studi: '',
        tahun_lulus: new Date().getFullYear(),
    });

    // Form Jabatan Sub-Item
    const formJabatan = useForm({
        jabatan: 'Asisten Ahli',
        tmt: new Date().toISOString().substring(0, 10),
        nomor_sk: '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchQuery });
    };

    const applyFilters = (newFilters: Record<string, string | undefined>) => {
        const query: Record<string, string | undefined> = {
            search: searchQuery || undefined,
            program_studi_id: selectedProdi !== 'all' ? selectedProdi : undefined,
            jabatan_fungsional: selectedJabatan !== 'all' ? selectedJabatan : undefined,
            status_kepegawaian: selectedStatus !== 'all' ? selectedStatus : undefined,
            ...newFilters,
        };

        Object.keys(query).forEach((k) => query[k] === undefined && delete query[k]);

        router.get('/kepegawaian/dosen', query as any, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingDosen(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (dosen: DosenItem) => {
        reset();
        clearErrors();
        setEditingDosen(dosen);
        setData({
            nama_lengkap: dosen.nama_lengkap || '',
            gelar_depan: dosen.gelar_depan || '',
            gelar_belakang: dosen.gelar_belakang || '',
            nidn: dosen.nidn || '',
            nik: dosen.nik || '',
            tempat_lahir: dosen.tempat_lahir || '',
            tanggal_lahir: dosen.tanggal_lahir ? dosen.tanggal_lahir.substring(0, 10) : '',
            jenis_kelamin: (dosen.jenis_kelamin as any) || 'L',
            program_studi_id: dosen.program_studi_id ? String(dosen.program_studi_id) : '',
            alamat: dosen.alamat || '',
            no_hp: dosen.no_hp || '',
            email_pribadi: dosen.email_pribadi || '',
            jabatan_fungsional_saat_ini: dosen.jabatan_fungsional_saat_ini || 'Tenaga Pengajar',
            status_kepegawaian: dosen.status_kepegawaian || 'tetap',
            sertifikasi_pendidik: Boolean(dosen.sertifikasi_pendidik),
            create_user_account: false,
            password: '',
        });
        setIsFormModalOpen(true);
    };

    const openDetailModal = (dosen: DosenItem) => {
        setSelectedDosenDetail(dosen);
        setDetailTab('biodata');
        setIsDetailModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingDosen) {
            put(`/kepegawaian/dosen/${editingDosen.id}`, {
                onSuccess: () => setIsFormModalOpen(false),
            });
        } else {
            post('/kepegawaian/dosen', {
                onSuccess: () => setIsFormModalOpen(false),
            });
        }
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (dosen: DosenItem) => {
        confirm({
            title: 'Hapus Data Dosen',
            description: `Apakah Anda yakin ingin menghapus data dosen "${formatFullName(dosen)}"? Akun dan data pengajaran terkait akan dinonaktifkan.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                destroy(`/kepegawaian/dosen/${dosen.id}`);
            },
        });
    };

    const handleAddPendidikan = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDosenDetail) {
return;
}

        formPendidikan.post(`/kepegawaian/dosen/${selectedDosenDetail.id}/pendidikan`, {
            onSuccess: () => {
                formPendidikan.reset();
                router.reload();
            },
        });
    };

    const handleDeletePendidikan = (pendidikanId: number) => {
        if (!selectedDosenDetail) {
return;
}

        confirm({
            title: 'Hapus Riwayat Pendidikan',
            description: 'Apakah Anda yakin ingin menghapus data riwayat pendidikan ini dari profil dosen?',
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/kepegawaian/dosen/${selectedDosenDetail.id}/pendidikan/${pendidikanId}`, {
                    onSuccess: () => router.reload(),
                });
            },
        });
    };

    const handleAddJabatan = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDosenDetail) {
return;
}

        formJabatan.post(`/kepegawaian/dosen/${selectedDosenDetail.id}/jabatan`, {
            onSuccess: () => {
                formJabatan.reset();
                router.reload();
            },
        });
    };

    const handleDeleteJabatan = (jabatanId: number) => {
        if (!selectedDosenDetail) {
return;
}

        confirm({
            title: 'Hapus Riwayat Jabatan',
            description: 'Apakah Anda yakin ingin menghapus data riwayat jabatan fungsional ini dari profil dosen?',
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/kepegawaian/dosen/${selectedDosenDetail.id}/jabatan/${jabatanId}`, {
                    onSuccess: () => router.reload(),
                });
            },
        });
    };

    const formatFullName = (dosen: DosenItem) => {
        const depan = dosen.gelar_depan ? `${dosen.gelar_depan} ` : '';
        const belakang = dosen.gelar_belakang ? `, ${dosen.gelar_belakang}` : '';

        return `${depan}${dosen.nama_lengkap}${belakang}`;
    };

    return (
        <>
            {confirmDialog}
            <Head title="Data Dosen & Jabatan Fungsional - SIAKAD" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header */}
                <div className="rounded-lg border border-border-default bg-surface-card p-4 sm:p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-md bg-brand-primary/10 text-brand-primary">
                                <GraduationCap className="size-5" />
                            </span>
                            <div>
                                <h1 className="text-xl font-semibold text-text-primary">
                                    Data Dosen & Jabatan Akademik
                                </h1>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Kelola profil tenaga pengajar, NIDN, homebase prodi, riwayat pendidikan, dan jabatan fungsional.
                                </p>
                            </div>
                        </div>

                        <Button
                            size="sm"
                            onClick={openCreateModal}
                            className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs h-9 flex items-center justify-center gap-1.5 self-start sm:self-auto"
                        >
                            <Plus className="size-4" />
                            <span>Tambah Dosen</span>
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                        <span className="text-xs font-medium text-text-secondary">Total Tenaga Pendidik</span>
                        <p className="mt-2 text-2xl font-semibold text-text-primary">{dosens.total}</p>
                    </div>

                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                        <span className="text-xs font-medium text-text-secondary">Tersertifikasi (Serdos)</span>
                        <p className="mt-2 text-2xl font-semibold text-brand-primary">
                            {dosens.data.filter((d) => d.sertifikasi_pendidik).length} Dosen
                        </p>
                    </div>

                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                        <span className="text-xs font-medium text-text-secondary">Dosen Tetap</span>
                        <p className="mt-2 text-2xl font-semibold text-status-success">
                            {dosens.data.filter((d) => d.status_kepegawaian === 'tetap').length}
                        </p>
                    </div>

                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                        <span className="text-xs font-medium text-text-secondary">Lektor / Guru Besar</span>
                        <p className="mt-2 text-2xl font-semibold text-text-primary">
                            {dosens.data.filter((d) => ['Lektor', 'Lektor Kepala', 'Guru Besar'].includes(d.jabatan_fungsional_saat_ini || '')).length}
                        </p>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 size-4 text-text-secondary" />
                                <Input
                                    type="text"
                                    placeholder="Cari nama dosen atau email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 text-xs h-9"
                                />
                            </div>
                        </div>

                        <div className="w-full sm:w-48">
                            <select
                                value={selectedProdi}
                                onChange={(e) => {
                                    setSelectedProdi(e.target.value);
                                    applyFilters({ program_studi_id: e.target.value });
                                }}
                                aria-label="Filter Homebase Program Studi"
                                className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            >
                                <option value="all">Semua Homebase Prodi</option>
                                {programStudis.map((p) => (
                                    <option key={p.id} value={String(p.id)}>
                                        {p.jenjang} {p.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full sm:w-40">
                            <select
                                value={selectedJabatan}
                                onChange={(e) => {
                                    setSelectedJabatan(e.target.value);
                                    applyFilters({ jabatan_fungsional: e.target.value });
                                }}
                                aria-label="Filter Jabatan Fungsional"
                                className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            >
                                <option value="all">Semua Jabatan</option>
                                <option value="Tenaga Pengajar">Tenaga Pengajar</option>
                                <option value="Asisten Ahli">Asisten Ahli</option>
                                <option value="Lektor">Lektor</option>
                                <option value="Lektor Kepala">Lektor Kepala</option>
                                <option value="Guru Besar">Guru Besar</option>
                            </select>
                        </div>

                        <div className="w-36">
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    applyFilters({ status_kepegawaian: e.target.value });
                                }}
                                aria-label="Filter Status Kepegawaian"
                                className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            >
                                <option value="all">Semua Status</option>
                                <option value="tetap">Tetap</option>
                                <option value="tidak_tetap">Tidak Tetap</option>
                                <option value="dpk">DPK</option>
                            </select>
                        </div>

                        <Button type="submit" size="sm" className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs h-9">
                            <Filter className="size-3.5 mr-1" />
                            Filter
                        </Button>
                    </form>
                </div>

                {/* Table */}
                <ResponsiveTable>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-28">NIDN</TableHead>
                            <TableHead>Nama Dosen & Gelar</TableHead>
                            <TableHead>Homebase Prodi</TableHead>
                            <TableHead>Jabatan Fungsional</TableHead>
                            <TableHead className="w-24 text-center">Serdos</TableHead>
                            <TableHead className="w-28">Status</TableHead>
                            <TableHead align="right" className="w-28">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dosens.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-xs text-text-secondary">
                                    Tidak ada data dosen yang sesuai dengan kriteria pencarian.
                                </TableCell>
                            </TableRow>
                        ) : (
                            dosens.data.map((dosen) => (
                                <TableRow key={dosen.id}>
                                    <TableCell className="font-mono text-xs text-text-secondary">
                                        {dosen.nidn || <span className="italic text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell>
                                        <StackedCell
                                            primary={formatFullName(dosen)}
                                            secondary={dosen.email_pribadi || dosen.user?.email || '-'}
                                        />
                                    </TableCell>
                                    <TableCell className="text-xs text-text-primary">
                                        {dosen.program_studi ? (
                                            <span className="inline-flex items-center gap-1 font-medium">
                                                <BookOpen className="size-3.5 text-brand-primary" />
                                                {dosen.program_studi.jenjang} {dosen.program_studi.nama}
                                            </span>
                                        ) : (
                                            <span className="text-text-secondary italic">Non-Homebase</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                                            {dosen.jabatan_fungsional_saat_ini || 'Tenaga Pengajar'}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center">
                                        {dosen.sertifikasi_pendidik ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-success">
                                                <ShieldCheck className="size-3.5" />
                                                Ya
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-text-secondary">Belum</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs capitalize text-text-secondary">
                                        {dosen.status_kepegawaian.replace('_', ' ')}
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDetailModal(dosen)}
                                                className="h-8 w-8 p-0 text-text-secondary hover:text-brand-primary"
                                                title="Riwayat & Detail"
                                            >
                                                <Info className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(dosen)}
                                                className="h-8 w-8 p-0 text-text-secondary hover:text-brand-primary"
                                                title="Edit"
                                            >
                                                <Edit className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(dosen)}
                                                className="h-8 w-8 p-0 text-text-secondary hover:text-status-danger"
                                                title="Hapus"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </ResponsiveTable>

                {/* Pagination */}
                <Pagination
                    links={dosens.links}
                    from={dosens.from}
                    to={dosens.to}
                    total={dosens.total}
                    itemName="dosen"
                />
            </div>

            {/* Modal Create / Edit Dosen */}
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                            <GraduationCap className="size-4 text-brand-primary" />
                            {editingDosen ? 'Edit Data Dosen' : 'Tambah Tenaga Pendidik / Dosen Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Lengkapi profil akademik dosen, gelar, NIDN, dan homebase program studi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="gelar_depan" className="text-xs">Gelar Depan</Label>
                                <Input
                                    id="gelar_depan"
                                    placeholder="Contoh: Dr., Prof., K.H."
                                    value={data.gelar_depan}
                                    onChange={(e) => setData('gelar_depan', e.target.value)}
                                    className="text-xs h-9"
                                />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="nama_lengkap" className="text-xs">
                                    Nama Lengkap (Tanpa Gelar) <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    id="nama_lengkap"
                                    value={data.nama_lengkap}
                                    onChange={(e) => setData('nama_lengkap', e.target.value)}
                                    className="text-xs h-9"
                                    required
                                />
                                {errors.nama_lengkap && <p className="text-status-danger text-[11px]">{errors.nama_lengkap}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="gelar_belakang" className="text-xs">Gelar Belakang</Label>
                                <Input
                                    id="gelar_belakang"
                                    placeholder="Contoh: M.Pd.I, Ph.D"
                                    value={data.gelar_belakang}
                                    onChange={(e) => setData('gelar_belakang', e.target.value)}
                                    className="text-xs h-9"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="nidn" className="text-xs">NIDN</Label>
                                <Input
                                    id="nidn"
                                    placeholder="10 digit NIDN"
                                    value={data.nidn}
                                    onChange={(e) => setData('nidn', e.target.value)}
                                    className="text-xs h-9 font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="nik" className="text-xs">NIK (KTP)</Label>
                                <Input
                                    id="nik"
                                    placeholder="16 digit NIK"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    className="text-xs h-9 font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="program_studi_id" className="text-xs">Homebase Prodi</Label>
                                <select
                                    id="program_studi_id"
                                    value={data.program_studi_id}
                                    onChange={(e) => setData('program_studi_id', e.target.value)}
                                    className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                >
                                    <option value="">-- Tanpa Homebase --</option>
                                    {programStudis.map((p) => (
                                        <option key={p.id} value={String(p.id)}>
                                            {p.jenjang} {p.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="jabatan_fungsional" className="text-xs">Jabatan Fungsional</Label>
                                <select
                                    id="jabatan_fungsional"
                                    value={data.jabatan_fungsional_saat_ini}
                                    onChange={(e) => setData('jabatan_fungsional_saat_ini', e.target.value)}
                                    className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                >
                                    <option value="Tenaga Pengajar">Tenaga Pengajar</option>
                                    <option value="Asisten Ahli">Asisten Ahli</option>
                                    <option value="Lektor">Lektor</option>
                                    <option value="Lektor Kepala">Lektor Kepala</option>
                                    <option value="Guru Besar">Guru Besar</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="status_kepegawaian" className="text-xs">Status Dosen</Label>
                                <select
                                    id="status_kepegawaian"
                                    value={data.status_kepegawaian}
                                    onChange={(e) => setData('status_kepegawaian', e.target.value as any)}
                                    className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                >
                                    <option value="tetap">Dosen Tetap Yayasan</option>
                                    <option value="tidak_tetap">Dosen Luar Biasa (LB)</option>
                                    <option value="dpk">Dosen DPK (PNS Kemenag)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="email_pribadi" className="text-xs">Email Dosen</Label>
                                <Input
                                    id="email_pribadi"
                                    type="email"
                                    value={data.email_pribadi}
                                    onChange={(e) => setData('email_pribadi', e.target.value)}
                                    className="text-xs h-9"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="no_hp" className="text-xs">No. Handphone / WA</Label>
                                <Input
                                    id="no_hp"
                                    value={data.no_hp}
                                    onChange={(e) => setData('no_hp', e.target.value)}
                                    className="text-xs h-9"
                                />
                            </div>

                            <div className="space-y-1 flex flex-col justify-end pb-1.5">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-primary">
                                    <input
                                        type="checkbox"
                                        checked={data.sertifikasi_pendidik}
                                        onChange={(e) => setData('sertifikasi_pendidik', e.target.checked)}
                                        className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>Tersertifikasi Pendidik (Serdos)</span>
                                </label>
                            </div>
                        </div>

                        {!editingDosen && (
                            <div className="p-3 rounded-md bg-surface-base border border-border-default space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-primary">
                                    <input
                                        type="checkbox"
                                        checked={data.create_user_account}
                                        onChange={(e) => setData('create_user_account', e.target.checked)}
                                        className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>Buat Akun Portal Dosen (Role: Dosen)</span>
                                </label>
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsFormModalOpen(false)}
                                disabled={processing}
                                className="text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs"
                            >
                                {processing ? 'Menyimpan...' : editingDosen ? 'Perbarui Dosen' : 'Simpan Dosen'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Detail & Riwayat (Pendidikan & Jabatan Fungsional) */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedDosenDetail && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                                    <GraduationCap className="size-4 text-brand-primary" />
                                    <span>{formatFullName(selectedDosenDetail)}</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-text-secondary">
                                    Homebase: {selectedDosenDetail.program_studi?.nama || 'Non-Homebase'} • NIDN: {selectedDosenDetail.nidn || '-'}
                                </DialogDescription>
                            </DialogHeader>

                            {/* Tabs */}
                            <div className="flex border-b border-border-default text-xs font-medium">
                                <button
                                    onClick={() => setDetailTab('biodata')}
                                    className={`px-4 py-2 border-b-2 transition-colors ${
                                        detailTab === 'biodata'
                                            ? 'border-brand-primary text-brand-primary font-semibold'
                                            : 'border-transparent text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    Biodata & Kontak
                                </button>
                                <button
                                    onClick={() => setDetailTab('pendidikan')}
                                    className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1 ${
                                        detailTab === 'pendidikan'
                                            ? 'border-brand-primary text-brand-primary font-semibold'
                                            : 'border-transparent text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    Riwayat Pendidikan
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-base border">
                                        {selectedDosenDetail.riwayat_pendidikans?.length || 0}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setDetailTab('jabatan')}
                                    className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1 ${
                                        detailTab === 'jabatan'
                                            ? 'border-brand-primary text-brand-primary font-semibold'
                                            : 'border-transparent text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    Jabatan Fungsional
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-base border">
                                        {selectedDosenDetail.riwayat_jabatan_fungsionals?.length || 0}
                                    </span>
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="py-3 text-xs">
                                {detailTab === 'biodata' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded bg-surface-base border border-border-default space-y-2">
                                            <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">Identitas</p>
                                            <div>
                                                <span className="text-text-secondary">Nama: </span>
                                                <span className="font-semibold text-text-primary">{formatFullName(selectedDosenDetail)}</span>
                                            </div>
                                            <div>
                                                <span className="text-text-secondary">NIDN: </span>
                                                <span className="font-mono text-text-primary">{selectedDosenDetail.nidn || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-text-secondary">NIK: </span>
                                                <span className="font-mono text-text-primary">{selectedDosenDetail.nik || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-text-secondary">Tempat / Tgl Lahir: </span>
                                                <span className="text-text-primary">
                                                    {selectedDosenDetail.tempat_lahir || '-'}, {selectedDosenDetail.tanggal_lahir ? new Date(selectedDosenDetail.tanggal_lahir).toLocaleDateString('id-ID') : '-'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded bg-surface-base border border-border-default space-y-2">
                                            <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">Status & Kontak</p>
                                            <div>
                                                <span className="text-text-secondary">Status Kepegawaian: </span>
                                                <span className="font-semibold text-text-primary capitalize">{selectedDosenDetail.status_kepegawaian.replace('_', ' ')}</span>
                                            </div>
                                            <div>
                                                <span className="text-text-secondary">Email Pribadi: </span>
                                                <span className="text-text-primary">{selectedDosenDetail.email_pribadi || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-text-secondary">No. Handphone: </span>
                                                <span className="text-text-primary">{selectedDosenDetail.no_hp || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-text-secondary">Sertifikasi Dosen: </span>
                                                <span className="font-semibold text-status-success">
                                                    {selectedDosenDetail.sertifikasi_pendidik ? 'Tersertifikasi (Serdos)' : 'Belum Tersertifikasi'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'pendidikan' && (
                                    <div className="space-y-4">
                                        {/* List Pendidikan */}
                                        <div className="space-y-2">
                                            {(!selectedDosenDetail.riwayat_pendidikans || selectedDosenDetail.riwayat_pendidikans.length === 0) ? (
                                                <p className="text-text-secondary italic text-center py-4">Belum ada riwayat pendidikan yang dicatat.</p>
                                            ) : (
                                                selectedDosenDetail.riwayat_pendidikans.map((pen) => (
                                                    <div key={pen.id} className="flex items-center justify-between p-2.5 rounded border border-border-default bg-surface-base">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-brand-primary/10 text-brand-primary">
                                                                    {pen.jenjang}
                                                                </span>
                                                                <span className="font-semibold text-text-primary">{pen.program_studi}</span>
                                                            </div>
                                                            <p className="text-[11px] text-text-secondary">
                                                                {pen.institusi} • Lulus Tahun {pen.tahun_lulus}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeletePendidikan(pen.id)}
                                                            className="h-7 w-7 p-0 text-text-secondary hover:text-status-danger"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Form Tambah Pendidikan */}
                                        <form onSubmit={handleAddPendidikan} className="p-3 rounded-md border border-border-default bg-surface-card space-y-3">
                                            <p className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                                                <Plus className="size-3.5 text-brand-primary" />
                                                Tambah Riwayat Pendidikan Dosen
                                            </p>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                <div>
                                                    <Label className="text-[11px]">Jenjang</Label>
                                                    <select
                                                        value={formPendidikan.data.jenjang}
                                                        onChange={(e) => formPendidikan.setData('jenjang', e.target.value)}
                                                        className="w-full h-8 rounded border border-border-default bg-surface-card px-2 text-xs"
                                                    >
                                                        <option value="S1">S1 (Sarjana)</option>
                                                        <option value="S2">S2 (Magister)</option>
                                                        <option value="S3">S3 (Doktor)</option>
                                                        <option value="Profesi">Profesi</option>
                                                        <option value="D4">D4</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Label className="text-[11px]">Nama Perguruan Tinggi / Institusi</Label>
                                                    <Input
                                                        placeholder="Contoh: UIN Maulana Malik Ibrahim"
                                                        value={formPendidikan.data.institusi}
                                                        onChange={(e) => formPendidikan.setData('institusi', e.target.value)}
                                                        className="h-8 text-xs"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[11px]">Tahun Lulus</Label>
                                                    <Input
                                                        type="number"
                                                        value={formPendidikan.data.tahun_lulus}
                                                        onChange={(e) => formPendidikan.setData('tahun_lulus', Number(e.target.value))}
                                                        className="h-8 text-xs"
                                                        required
                                                    />
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <Label className="text-[11px]">Program Studi / Jurusan</Label>
                                                    <Input
                                                        placeholder="Contoh: Pendidikan Agama Islam"
                                                        value={formPendidikan.data.program_studi}
                                                        onChange={(e) => formPendidikan.setData('program_studi', e.target.value)}
                                                        className="h-8 text-xs"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        disabled={formPendidikan.processing}
                                                        className="w-full h-8 bg-brand-primary text-white text-xs"
                                                    >
                                                        Simpan
                                                    </Button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {detailTab === 'jabatan' && (
                                    <div className="space-y-4">
                                        {/* List Jabatan */}
                                        <div className="space-y-2">
                                            {(!selectedDosenDetail.riwayat_jabatan_fungsionals || selectedDosenDetail.riwayat_jabatan_fungsionals.length === 0) ? (
                                                <p className="text-text-secondary italic text-center py-4">Belum ada riwayat SK kenaikan jabatan fungsional.</p>
                                            ) : (
                                                selectedDosenDetail.riwayat_jabatan_fungsionals.map((jab) => (
                                                    <div key={jab.id} className="flex items-center justify-between p-2.5 rounded border border-border-default bg-surface-base">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.2 rounded font-bold text-[10px] bg-brand-primary/10 text-brand-primary">
                                                                    {jab.jabatan}
                                                                </span>
                                                                <span className="text-xs text-text-secondary">
                                                                    TMT: {new Date(jab.tmt).toLocaleDateString('id-ID')}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-text-secondary">
                                                                No. SK: {jab.nomor_sk || '-'}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteJabatan(jab.id)}
                                                            className="h-7 w-7 p-0 text-text-secondary hover:text-status-danger"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Form Tambah Jabatan */}
                                        <form onSubmit={handleAddJabatan} className="p-3 rounded-md border border-border-default bg-surface-card space-y-3">
                                            <p className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                                                <Plus className="size-3.5 text-brand-primary" />
                                                Tambah Riwayat Jabatan Fungsional / SK
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <div>
                                                    <Label className="text-[11px]">Jabatan Fungsional</Label>
                                                    <select
                                                        value={formJabatan.data.jabatan}
                                                        onChange={(e) => formJabatan.setData('jabatan', e.target.value)}
                                                        className="w-full h-8 rounded border border-border-default bg-surface-card px-2 text-xs"
                                                    >
                                                        <option value="Tenaga Pengajar">Tenaga Pengajar</option>
                                                        <option value="Asisten Ahli">Asisten Ahli</option>
                                                        <option value="Lektor">Lektor</option>
                                                        <option value="Lektor Kepala">Lektor Kepala</option>
                                                        <option value="Guru Besar">Guru Besar</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px]">TMT (Terhitung Mulai Tanggal)</Label>
                                                    <Input
                                                        type="date"
                                                        value={formJabatan.data.tmt}
                                                        onChange={(e) => formJabatan.setData('tmt', e.target.value)}
                                                        className="h-8 text-xs"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[11px]">Nomor SK</Label>
                                                    <Input
                                                        placeholder="Contoh: SK/045/DIKTI/2026"
                                                        value={formJabatan.data.nomor_sk}
                                                        onChange={(e) => formJabatan.setData('nomor_sk', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="sm:col-span-3 flex justify-end">
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        disabled={formJabatan.processing}
                                                        className="h-8 bg-brand-primary text-white text-xs"
                                                    >
                                                        Simpan Jabatan & Update Status
                                                    </Button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="text-xs"
                                >
                                    Tutup
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
