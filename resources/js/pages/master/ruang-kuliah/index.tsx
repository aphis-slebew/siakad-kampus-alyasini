import { Head, Link, router, useForm } from '@inertiajs/react';
import { DoorOpen, Edit, Plus, Search, Trash2 } from 'lucide-react';
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
import { MasterDataNav } from '@/components/master-data-nav';

type RuangKuliah = {
    id: number;
    kode: string;
    nama: string;
    kapasitas: number;
};

export default function RuangKuliahIndex({ ruangKuliahs = [] }: { ruangKuliahs: RuangKuliah[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRuang, setEditingRuang] = useState<RuangKuliah | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const createForm = useForm({
        kode: '',
        nama: '',
        kapasitas: 30,
    });

    const editForm = useForm({
        kode: '',
        nama: '',
        kapasitas: 30,
    });

    const filteredList = useMemo(() => {
        return ruangKuliahs.filter((item) => {
            if (!searchQuery) {
return true;
}

            return (
                item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.nama.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [ruangKuliahs, searchQuery]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/master/ruang-kuliah', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingRuang) {
return;
}

        editForm.put(`/master/ruang-kuliah/${editingRuang.id}`, {
            onSuccess: () => {
                setEditingRuang(null);
                editForm.reset();
            },
        });
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (item: RuangKuliah) => {
        confirm({
            title: 'Hapus Ruang Kuliah',
            description: `Apakah Anda yakin ingin menghapus ruang kuliah "${item.nama}" (${item.kode} - Kapasitas: ${item.kapasitas} kursi)? Pastikan tidak ada jadwal kuliah yang sedang menggunakan ruang ini.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/master/ruang-kuliah/${item.id}`);
            },
        });
    };

    const openEditModal = (item: RuangKuliah) => {
        setEditingRuang(item);
        editForm.setData({
            kode: item.kode,
            nama: item.nama,
            kapasitas: item.kapasitas,
        });
    };

    return (
        <>
            {confirmDialog}
            <Head title="Kelola Ruang Kuliah" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto">
                {/* Clean Dropdown Breadcrumb Nav */}
                <MasterDataNav currentHref="/master/ruang-kuliah" />

                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                            <DoorOpen className="size-6 sm:size-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Ruang Kuliah
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Kelola data gedung dan ruang perkuliahan di STAI Al-Yasini.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition self-start sm:self-auto cursor-pointer"
                    >
                        <Plus className="size-4" />
                        <span>Tambah Ruang Kuliah</span>
                    </Button>
                </div>

                {/* Search Toolbar */}
                <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Cari kode atau nama ruang..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-9 text-xs bg-slate-50 border-slate-200"
                        />
                    </div>
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                        Total: {filteredList.length} ruang
                    </span>
                </div>

                {/* Data Table */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden border-t-2 border-t-emerald-600">
                    {filteredList.length === 0 ? (
                        <div className="p-12 text-center">
                            <DoorOpen className="mx-auto size-10 text-slate-400 mb-3" />
                            <h3 className="text-sm font-semibold text-slate-900">
                                {searchQuery ? 'Tidak ada ruang kuliah yang cocok dengan pencarian' : 'Belum ada data ruang kuliah'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 mb-4">
                                {searchQuery ? 'Silakan periksa kembali kata kunci pencarian Anda.' : 'Silakan tambahkan data ruang perkuliahan baru.'}
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Ruang Kuliah
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4 w-32 font-mono">Kode Ruang</th>
                                        <th className="py-3 px-4">Nama Ruang Kuliah</th>
                                        <th className="py-3 px-4 text-center w-36">Kapasitas Kursi</th>
                                        <th className="py-3 px-4 text-right w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {filteredList.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-mono font-semibold text-brand-primary">{item.kode}</td>
                                            <td className="py-3 px-4 font-semibold">{item.nama}</td>
                                            <td className="py-3 px-4 text-center font-mono">
                                                {item.kapasitas} Kursi
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-base transition-colors duration-150"
                                                        title="Edit Ruang Kuliah"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-status-danger hover:bg-surface-base transition-colors duration-150"
                                                        title="Hapus Ruang Kuliah"
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

            {/* Modal Tambah Ruang Kuliah */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tambah Ruang Kuliah Baru</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Isi informasi kode dan kapasitas ruang.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="kode" className="text-xs font-semibold text-text-primary">
                                Kode Ruang <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="kode"
                                placeholder="Misal: RK-01"
                                value={createForm.data.kode}
                                onChange={(e) => createForm.setData('kode', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.kode && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.kode}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="nama" className="text-xs font-semibold text-text-primary">
                                Nama Ruang Kuliah <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="nama"
                                placeholder="Misal: Ruang Kuliah 01 Gedung A"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.nama && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.nama}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="kapasitas" className="text-xs font-semibold text-text-primary">
                                Kapasitas Kursi <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="kapasitas"
                                type="number"
                                min={1}
                                value={createForm.data.kapasitas}
                                onChange={(e) => createForm.setData('kapasitas', e.target.value === '' ? ('' as any) : parseInt(e.target.value, 10))}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.kapasitas && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.kapasitas}</p>
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
                                className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold"
                            >
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Ruang Kuliah'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Ruang Kuliah */}
            <Dialog open={!!editingRuang} onOpenChange={(open) => !open && setEditingRuang(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Edit Ruang Kuliah</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Perbarui informasi ruang kuliah.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_kode" className="text-xs font-semibold text-text-primary">
                                Kode Ruang <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="edit_kode"
                                value={editForm.data.kode}
                                onChange={(e) => editForm.setData('kode', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {editForm.errors.kode && (
                                <p className="text-[11px] text-status-danger">{editForm.errors.kode}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_nama" className="text-xs font-semibold text-text-primary">
                                Nama Ruang Kuliah <span className="text-status-danger">*</span>
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
                            <Label htmlFor="edit_kapasitas" className="text-xs font-semibold text-text-primary">
                                Kapasitas Kursi <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="edit_kapasitas"
                                type="number"
                                min={1}
                                value={editForm.data.kapasitas}
                                onChange={(e) => editForm.setData('kapasitas', e.target.value === '' ? ('' as any) : parseInt(e.target.value, 10))}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {editForm.errors.kapasitas && (
                                <p className="text-[11px] text-status-danger">{editForm.errors.kapasitas}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingRuang(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Ruang Kuliah'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

RuangKuliahIndex.layout = {
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
            title: 'Ruang Kuliah',
            href: '/master/ruang-kuliah',
        },
    ],
};
