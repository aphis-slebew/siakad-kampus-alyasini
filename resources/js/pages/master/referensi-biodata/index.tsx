import { Head, router, useForm } from '@inertiajs/react';
import { Edit, FileText, Filter, Plus, Search, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ReferensiBiodata = {
    id: number;
    tipe: string;
    nama: string;
    pddikti_ref_id: string | null;
};

const CATEGORY_PRESETS = [
    { value: 'agama', label: 'Agama' },
    { value: 'pekerjaan', label: 'Pekerjaan' },
    { value: 'penghasilan', label: 'Penghasilan' },
    { value: 'alat_transportasi', label: 'Alat Transportasi' },
    { value: 'jenis_tinggal', label: 'Jenis Tinggal' },
    { value: 'pendidikan', label: 'Pendidikan' },
    { value: 'suku', label: 'Suku / Etnis' },
    { value: 'kustom', label: 'Kustom (Tipe Baru...)' },
];

export default function ReferensiBiodataIndex({ referensiBiodatas = [] }: { referensiBiodatas: ReferensiBiodata[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRef, setEditingRef] = useState<ReferensiBiodata | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [customTypeModeCreate, setCustomTypeModeCreate] = useState(false);
    const [customTypeModeEdit, setCustomTypeModeEdit] = useState(false);

    const createForm = useForm({
        tipe: 'agama',
        nama: '',
        pddikti_ref_id: '',
    });

    const editForm = useForm({
        tipe: 'agama',
        nama: '',
        pddikti_ref_id: '',
    });

    const filteredList = useMemo(() => {
        return referensiBiodatas.filter((item) => {
            const matchCategory = activeCategory === 'all' || item.tipe.toLowerCase() === activeCategory.toLowerCase();
            const matchSearch = searchQuery === '' ||
                item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tipe.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.pddikti_ref_id && item.pddikti_ref_id.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchCategory && matchSearch;
        });
    }, [referensiBiodatas, activeCategory, searchQuery]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/master/referensi-biodata', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                setCustomTypeModeCreate(false);
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingRef) {
return;
}

        editForm.put(`/master/referensi-biodata/${editingRef.id}`, {
            onSuccess: () => {
                setEditingRef(null);
                editForm.reset();
                setCustomTypeModeEdit(false);
            },
        });
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (item: ReferensiBiodata) => {
        confirm({
            title: 'Hapus Data Referensi',
            description: `Apakah Anda yakin ingin menghapus referensi "${item.nama}" (Tipe: ${item.tipe})? Data profil atau pendaftaran yang menggunakan referensi ini mungkin terpengaruh.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/master/referensi-biodata/${item.id}`);
            },
        });
    };

    const openCreateModal = () => {
        setCustomTypeModeCreate(false);
        createForm.setData({
            tipe: activeCategory !== 'all' ? activeCategory : 'agama',
            nama: '',
            pddikti_ref_id: '',
        });
        setIsCreateOpen(true);
    };

    const openEditModal = (item: ReferensiBiodata) => {
        setEditingRef(item);
        const isPreset = CATEGORY_PRESETS.some((p) => p.value === item.tipe);
        setCustomTypeModeEdit(!isPreset);
        editForm.setData({
            tipe: item.tipe,
            nama: item.nama,
            pddikti_ref_id: item.pddikti_ref_id || '',
        });
    };

    return (
        <>
            {confirmDialog}
            <Head title="Kelola Referensi Biodata" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                            <FileText className="size-5 text-brand-primary" />
                            Referensi Biodata
                        </h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola data referensi pilihan biodata (agama, pekerjaan, suku, penghasilan) untuk pelaporan PD-DIKTI.
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                    >
                        <Plus className="size-4" />
                        Tambah Referensi
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-lg border border-border-default bg-surface-card shadow-xs">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-xs font-semibold text-text-secondary mr-1">
                            <Filter className="size-3.5" />
                            <span>Kategori:</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveCategory('all')}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                activeCategory === 'all'
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-surface-base text-text-secondary hover:bg-surface-card border border-border-default'
                            }`}
                        >
                            Semua ({referensiBiodatas.length})
                        </button>
                        {['agama', 'pekerjaan', 'penghasilan', 'alat_transportasi', 'jenis_tinggal', 'pendidikan', 'suku'].map((cat) => {
                            const count = referensiBiodatas.filter((r) => r.tipe.toLowerCase() === cat).length;

                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                                        activeCategory === cat
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-surface-base text-text-secondary hover:bg-surface-card border border-border-default'
                                    }`}
                                >
                                    {cat.replace('_', ' ')} ({count})
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 size-3.5 text-text-secondary" />
                        <Input
                            type="text"
                            placeholder="Cari nama atau kode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-9 text-xs border-border-default bg-surface-base"
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {filteredList.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">
                                {searchQuery || activeCategory !== 'all' ? 'Tidak ada data yang cocok dengan filter' : 'Belum ada data referensi biodata'}
                            </h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                {searchQuery || activeCategory !== 'all' ? 'Silakan ubah filter pencarian atau kategori Anda.' : 'Silakan tambahkan data referensi biodata baru.'}
                            </p>
                            <Button
                                onClick={openCreateModal}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Referensi
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4 w-40">Tipe Referensi</th>
                                        <th className="py-3 px-4">Nama Pilihan</th>
                                        <th className="py-3 px-4 font-mono w-44">PD-DIKTI Ref ID</th>
                                        <th className="py-3 px-4 text-right w-24">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {filteredList.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-primary/10 text-brand-primary capitalize">
                                                    {item.tipe.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-semibold">{item.nama}</td>
                                            <td className="py-3 px-4 font-mono text-text-secondary">
                                                {item.pddikti_ref_id || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-base transition-colors duration-150"
                                                        title="Edit Referensi"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-status-danger hover:bg-surface-base transition-colors duration-150"
                                                        title="Hapus Referensi"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah Referensi */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tambah Referensi Biodata Baru</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Isi kategori dan nilai opsi referensi biodata.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="create_preset" className="text-xs font-semibold text-text-primary">
                                Kategori Tipe <span className="text-status-danger">*</span>
                            </Label>
                            <Select
                                value={customTypeModeCreate ? 'kustom' : createForm.data.tipe}
                                onValueChange={(val) => {
                                    if (val === 'kustom') {
                                        setCustomTypeModeCreate(true);
                                        createForm.setData('tipe', '');
                                    } else {
                                        setCustomTypeModeCreate(false);
                                        createForm.setData('tipe', val);
                                    }
                                }}
                            >
                                <SelectTrigger className="h-9 text-xs border-border-default">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_PRESETS.map((p) => (
                                        <SelectItem key={p.value} value={p.value} className="text-xs">
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {customTypeModeCreate && (
                                <Input
                                    placeholder="Ketik tipe baru (cth: suku, status_tinggal)..."
                                    value={createForm.data.tipe}
                                    onChange={(e) => createForm.setData('tipe', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary mt-2"
                                />
                            )}
                            {createForm.errors.tipe && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.tipe}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="nama" className="text-xs font-semibold text-text-primary">
                                Nama Opsi / Pilihan <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="nama"
                                placeholder="Misal: Islam, PNS/TNI/Polri, < 1.000.000"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.nama && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.nama}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="pddikti_ref_id" className="text-xs font-semibold text-text-primary">
                                PD-DIKTI Ref ID <span className="text-text-secondary font-normal">(Opsional)</span>
                            </Label>
                            <Input
                                id="pddikti_ref_id"
                                placeholder="Misal: 1, AGAMA-ISLAM"
                                value={createForm.data.pddikti_ref_id}
                                onChange={(e) => createForm.setData('pddikti_ref_id', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary font-mono"
                            />
                            {createForm.errors.pddikti_ref_id && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.pddikti_ref_id}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Referensi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Referensi */}
            <Dialog open={!!editingRef} onOpenChange={(open) => !open && setEditingRef(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Edit Referensi Biodata</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Perbarui data pilihan referensi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_preset" className="text-xs font-semibold text-text-primary">
                                Kategori Tipe <span className="text-status-danger">*</span>
                            </Label>
                            <Select
                                value={customTypeModeEdit ? 'kustom' : editForm.data.tipe}
                                onValueChange={(val) => {
                                    if (val === 'kustom') {
                                        setCustomTypeModeEdit(true);
                                    } else {
                                        setCustomTypeModeEdit(false);
                                        editForm.setData('tipe', val);
                                    }
                                }}
                            >
                                <SelectTrigger className="h-9 text-xs border-border-default">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_PRESETS.map((p) => (
                                        <SelectItem key={p.value} value={p.value} className="text-xs">
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {customTypeModeEdit && (
                                <Input
                                    placeholder="Ketik tipe baru..."
                                    value={editForm.data.tipe}
                                    onChange={(e) => editForm.setData('tipe', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary mt-2"
                                />
                            )}
                            {editForm.errors.tipe && (
                                <p className="text-[11px] text-status-danger">{editForm.errors.tipe}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_nama" className="text-xs font-semibold text-text-primary">
                                Nama Pilihan <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="edit_nama"
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {editForm.errors.nama && (
                                <p className="text-[11px] text-status-danger">{editForm.errors.nama}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_pddikti_ref_id" className="text-xs font-semibold text-text-primary">
                                PD-DIKTI Ref ID <span className="text-text-secondary font-normal">(Opsional)</span>
                            </Label>
                            <Input
                                id="edit_pddikti_ref_id"
                                value={editForm.data.pddikti_ref_id}
                                onChange={(e) => editForm.setData('pddikti_ref_id', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary font-mono"
                            />
                            {editForm.errors.pddikti_ref_id && (
                                <p className="text-[11px] text-status-danger">{editForm.errors.pddikti_ref_id}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingRef(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ReferensiBiodataIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Master Data',
            href: '#',
        },
        {
            title: 'Referensi Biodata',
            href: '/master/referensi-biodata',
        },
    ],
};
