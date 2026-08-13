import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { DoorOpen, Edit, Plus, Trash2 } from 'lucide-react';
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

type RuangKuliah = {
    id: number;
    kode: string;
    nama: string;
    kapasitas: number;
};

export default function RuangKuliahIndex({ ruangKuliahs = [] }: { ruangKuliahs: RuangKuliah[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRuang, setEditingRuang] = useState<RuangKuliah | null>(null);

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
        if (!editingRuang) return;

        editForm.put(`/master/ruang-kuliah/${editingRuang.id}`, {
            onSuccess: () => {
                setEditingRuang(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (item: RuangKuliah) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ruang kuliah ${item.nama}?`)) {
            router.delete(`/master/ruang-kuliah/${item.id}`);
        }
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
            <Head title="Kelola Ruang Kuliah" />

            <div className="p-6 space-y-6">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Ruang Kuliah</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola data gedung dan ruang perkuliahan di STAI Al-Yasini.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Ruang Kuliah
                    </Button>
                </div>

                {/* Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {ruangKuliahs.length === 0 ? (
                        <div className="p-12 text-center">
                            <DoorOpen className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada data ruang kuliah</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Silakan tambahkan data ruang perkuliahan baru.
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Ruang Kuliah
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4 w-32 font-mono">Kode Ruang</th>
                                        <th className="py-3 px-4">Nama Ruang Kuliah</th>
                                        <th className="py-3 px-4 text-center w-36">Kapasitas Kursi</th>
                                        <th className="py-3 px-4 text-right w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {ruangKuliahs.map((item, index) => (
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
                                onChange={(e) => createForm.setData('kapasitas', Number(e.target.value))}
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
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
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
                                onChange={(e) => editForm.setData('kapasitas', Number(e.target.value))}
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
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
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
