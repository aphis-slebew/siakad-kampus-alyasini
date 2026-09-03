import { Head, router, useForm } from '@inertiajs/react';
import {
    Briefcase,
    Building2,
    CheckCircle2,
    Edit,
    Filter,
    KeyRound,
    Mail,
    Phone,
    Plus,
    Search,
    Trash2,
    UserCheck,
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
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type PegawaiItem = {
    id: number;
    user_id: number | null;
    unit_kerja_id: number | null;
    nip_internal: string | null;
    nama_lengkap: string;
    nik: string | null;
    tanggal_lahir: string | null;
    jenis_kelamin: string | null;
    alamat: string | null;
    no_hp: string | null;
    jabatan_struktural: string | null;
    status_kepegawaian: 'tetap' | 'kontrak' | 'honorer';
    foto_path: string | null;
    unit_kerja?: {
        id: number;
        kode: string;
        nama: string;
    };
    user?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
};

type OptionUnit = {
    id: number;
    kode: string;
    nama: string;
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

export default function PegawaiIndex({
    pegawais = { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, from: null, to: null, links: [] },
    unitKerjas = [],
    filters = {},
}: {
    pegawais?: { data: PegawaiItem[] } & PaginationMeta;
    unitKerjas?: OptionUnit[];
    filters?: { search?: string; unit_kerja_id?: string; status_kepegawaian?: string };
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedUnit, setSelectedUnit] = useState(filters.unit_kerja_id || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status_kepegawaian || 'all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPegawai, setEditingPegawai] = useState<PegawaiItem | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_lengkap: '',
        nip_internal: '',
        nik: '',
        unit_kerja_id: '',
        tanggal_lahir: '',
        jenis_kelamin: 'L',
        alamat: '',
        no_hp: '',
        jabatan_struktural: '',
        status_kepegawaian: 'tetap',
        create_user_account: false,
        email: '',
        user_role: 'staf_kepegawaian',
        password: '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchQuery });
    };

    const applyFilters = (newFilters: Record<string, string | undefined>) => {
        const query: Record<string, string | undefined> = {
            search: searchQuery || undefined,
            unit_kerja_id: selectedUnit !== 'all' ? selectedUnit : undefined,
            status_kepegawaian: selectedStatus !== 'all' ? selectedStatus : undefined,
            ...newFilters,
        };

        Object.keys(query).forEach((k) => query[k] === undefined && delete query[k]);

        router.get('/kepegawaian/pegawai', query as any, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingPegawai(null);
        setIsModalOpen(true);
    };

    const openEditModal = (pegawai: PegawaiItem) => {
        reset();
        clearErrors();
        setEditingPegawai(pegawai);
        setData({
            nama_lengkap: pegawai.nama_lengkap || '',
            nip_internal: pegawai.nip_internal || '',
            nik: pegawai.nik || '',
            unit_kerja_id: pegawai.unit_kerja_id ? String(pegawai.unit_kerja_id) : '',
            tanggal_lahir: pegawai.tanggal_lahir ? pegawai.tanggal_lahir.substring(0, 10) : '',
            jenis_kelamin: (pegawai.jenis_kelamin as any) || 'L',
            alamat: pegawai.alamat || '',
            no_hp: pegawai.no_hp || '',
            jabatan_struktural: pegawai.jabatan_struktural || '',
            status_kepegawaian: pegawai.status_kepegawaian || 'tetap',
            create_user_account: false,
            email: '',
            user_role: 'staf_kepegawaian',
            password: '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPegawai(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingPegawai) {
            put(`/kepegawaian/pegawai/${editingPegawai.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/kepegawaian/pegawai', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (pegawai: PegawaiItem) => {
        confirm({
            title: 'Hapus Data Pegawai',
            description: `Apakah Anda yakin ingin menghapus data pegawai "${pegawai.nama_lengkap}" (${pegawai.unit_kerja?.nama || 'Unit Kerja'})? Tindakan ini akan menonaktifkan akun pegawai terkait.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                destroy(`/kepegawaian/pegawai/${pegawai.id}`);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'tetap':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-success/10 text-status-success border border-status-success/30">
                        <CheckCircle2 className="size-3" />
                        Tetap
                    </span>
                );
            case 'kontrak':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-warning/10 text-status-warning border border-status-warning/30">
                        Kontrak
                    </span>
                );
            case 'honorer':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-base text-text-secondary border border-border-default">
                        Honorer
                    </span>
                );
            default:
                return <span>{status}</span>;
        }
    };

    return (
        <>
            {confirmDialog}
            <Head title="Data Pegawai & Staf - SIAKAD" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header */}
                <div className="rounded-lg border border-border-default bg-surface-card p-4 sm:p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-md bg-brand-primary/10 text-brand-primary">
                                <Users className="size-5" />
                            </span>
                            <div>
                                <h1 className="text-xl font-semibold text-text-primary">
                                    Data Pegawai & Staf Non-Dosen
                                </h1>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Kelola biodata, unit kerja penempatan, jabatan struktural, dan akun login staf.
                                </p>
                            </div>
                        </div>

                        <Button
                            size="sm"
                            onClick={openCreateModal}
                            className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs h-9 flex items-center justify-center gap-1.5 self-start sm:self-auto"
                        >
                            <Plus className="size-4" />
                            <span>Tambah Pegawai</span>
                        </Button>
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
                                    placeholder="Cari nama pegawai atau NIP internal..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 text-xs h-9"
                                />
                            </div>
                        </div>

                        <div className="w-full sm:w-48">
                            <select
                                value={selectedUnit}
                                onChange={(e) => {
                                    setSelectedUnit(e.target.value);
                                    applyFilters({ unit_kerja_id: e.target.value });
                                }}
                                aria-label="Filter Unit Kerja"
                                className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            >
                                <option value="all">Semua Unit Kerja</option>
                                {unitKerjas.map((u) => (
                                    <option key={u.id} value={String(u.id)}>
                                        {u.nama} ({u.kode})
                                    </option>
                                ))}
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
                                <option value="kontrak">Kontrak</option>
                                <option value="honorer">Honorer</option>
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
                            <TableHead className="w-32">NIP Internal</TableHead>
                            <TableHead>Nama Pegawai & Kontak</TableHead>
                            <TableHead>Unit Kerja</TableHead>
                            <TableHead>Jabatan Struktural</TableHead>
                            <TableHead className="w-28">Status</TableHead>
                            <TableHead className="w-32">Akun Login</TableHead>
                            <TableHead align="right" className="w-24">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!pegawais?.data || pegawais.data.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-xs text-text-secondary">
                                    Tidak ada data pegawai yang sesuai.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pegawais.data.map((pegawai) => (
                                <TableRow key={pegawai.id}>
                                    <TableCell className="font-mono text-xs text-text-secondary">
                                        {pegawai.nip_internal || <span className="italic text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell>
                                        <StackedCell
                                            primary={pegawai.nama_lengkap}
                                            secondary={pegawai.no_hp || pegawai.user?.email || '-'}
                                        />
                                    </TableCell>
                                    <TableCell className="text-xs text-text-primary">
                                        {pegawai.unit_kerja ? (
                                            <span className="inline-flex items-center gap-1 font-medium">
                                                <Building2 className="size-3.5 text-brand-primary" />
                                                {pegawai.unit_kerja.nama}
                                            </span>
                                        ) : (
                                            <span className="text-text-secondary italic">Belum Ditempatkan</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-text-secondary">
                                        {pegawai.jabatan_struktural || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(pegawai.status_kepegawaian)}
                                    </TableCell>
                                    <TableCell>
                                        {pegawai.user ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-status-success">
                                                <UserCheck className="size-3.5" />
                                                Terhubung
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-text-secondary italic">Tanpa Akun</span>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(pegawai)}
                                                className="h-8 w-8 p-0 text-text-secondary hover:text-brand-primary"
                                                title="Edit"
                                            >
                                                <Edit className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(pegawai)}
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
                    links={pegawais?.links || []}
                    from={pegawais?.from ?? null}
                    to={pegawais?.to ?? null}
                    total={pegawais?.total ?? 0}
                    itemName="pegawai"
                />
            </div>

            {/* Modal Create / Edit Pegawai */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                            <Users className="size-4 text-brand-primary" />
                            {editingPegawai ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Lengkapi biodata dan penempatan unit kerja pegawai kampus.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="nama_lengkap" className="text-xs">
                                    Nama Lengkap <span className="text-status-danger">*</span>
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

                            <div className="space-y-1">
                                <Label htmlFor="nip_internal" className="text-xs">NIP Internal / ID Staf</Label>
                                <Input
                                    id="nip_internal"
                                    value={data.nip_internal}
                                    onChange={(e) => setData('nip_internal', e.target.value)}
                                    className="text-xs h-9 font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="unit_kerja_id" className="text-xs">Penempatan Unit Kerja</Label>
                                <select
                                    id="unit_kerja_id"
                                    value={data.unit_kerja_id}
                                    onChange={(e) => setData('unit_kerja_id', e.target.value)}
                                    className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                >
                                    <option value="">-- Pilih Unit Kerja --</option>
                                    {unitKerjas.map((u) => (
                                        <option key={u.id} value={String(u.id)}>
                                            {u.nama} ({u.kode})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="jabatan_struktural" className="text-xs">Jabatan Struktural</Label>
                                <Input
                                    id="jabatan_struktural"
                                    placeholder="Contoh: Kepala Bagian / Staf Administrasi"
                                    value={data.jabatan_struktural}
                                    onChange={(e) => setData('jabatan_struktural', e.target.value)}
                                    className="text-xs h-9"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="status_kepegawaian" className="text-xs">Status Kepegawaian</Label>
                                <select
                                    id="status_kepegawaian"
                                    value={data.status_kepegawaian}
                                    onChange={(e) => setData('status_kepegawaian', e.target.value as any)}
                                    className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                >
                                    <option value="tetap">Pegawai Tetap</option>
                                    <option value="kontrak">Kontrak</option>
                                    <option value="honorer">Honorer</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="no_hp" className="text-xs">Nomor Handphone / WhatsApp</Label>
                                <Input
                                    id="no_hp"
                                    value={data.no_hp}
                                    onChange={(e) => setData('no_hp', e.target.value)}
                                    className="text-xs h-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="alamat" className="text-xs">Alamat Tinggal</Label>
                            <Input
                                id="alamat"
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                className="text-xs h-9"
                            />
                        </div>

                        {/* Opsi Buat Akun User jika baru */}
                        {!editingPegawai && (
                            <div className="p-3 rounded-md bg-surface-base border border-border-default space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-primary">
                                    <input
                                        type="checkbox"
                                        checked={data.create_user_account}
                                        onChange={(e) => setData('create_user_account', e.target.checked)}
                                        className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>Buat Akun User Login untuk Pegawai Ini</span>
                                </label>

                                {data.create_user_account && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="email" className="text-xs">Email Login</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="text-xs h-9"
                                                required={data.create_user_account}
                                            />
                                            {errors.email && <p className="text-status-danger text-[11px]">{errors.email}</p>}
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="user_role" className="text-xs">Peran / Role Hak Akses</Label>
                                            <select
                                                id="user_role"
                                                value={data.user_role}
                                                onChange={(e) => setData('user_role', e.target.value)}
                                                className="w-full h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                            >
                                                <option value="staf_kepegawaian">Staf Kepegawaian (HRD)</option>
                                                <option value="staf_keuangan">Staf Keuangan (BAU)</option>
                                                <option value="admin_akademik">Admin Akademik (BAA)</option>
                                                <option value="panitia_pmb">Panitia PMB</option>
                                                <option value="operator_kemahasiswaan">Operator Kemahasiswaan</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1 sm:col-span-2">
                                            <Label htmlFor="password" className="text-xs">Password (Kosongkan untuk default: "password")</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Default: password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="text-xs h-9"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={closeModal}
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
                                {processing ? 'Menyimpan...' : editingPegawai ? 'Perbarui' : 'Simpan Pegawai'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
