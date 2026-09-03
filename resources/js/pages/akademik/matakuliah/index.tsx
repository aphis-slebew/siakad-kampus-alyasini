import { Head, router, useForm } from '@inertiajs/react';
import { BookOpen, Edit, Plus, Trash2 } from 'lucide-react';
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

type BidangIlmu = {
    id: number;
    nama: string;
};

type Matakuliah = {
    id: number;
    kode: string;
    nama: string;
    sks: number;
    jenis: string;
    bidang_ilmu_id: number | null;
    bidang_ilmu?: BidangIlmu;
};

export default function MatakuliahIndex({
    matakuliahs = [],
    bidangIlmus = [],
}: {
    matakuliahs: Matakuliah[];
    bidangIlmus: BidangIlmu[];
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingMk, setEditingMk] = useState<Matakuliah | null>(null);

    const createForm = useForm({
        kode: '',
        nama: '',
        sks: 3,
        jenis: 'wajib',
        bidang_ilmu_id: '',
    });

    const editForm = useForm({
        kode: '',
        nama: '',
        sks: 3,
        jenis: 'wajib',
        bidang_ilmu_id: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/akademik/matakuliah', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingMk) {
return;
}

        editForm.put(`/akademik/matakuliah/${editingMk.id}`, {
            onSuccess: () => {
                setEditingMk(null);
                editForm.reset();
            },
        });
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (item: Matakuliah) => {
        confirm({
            title: 'Hapus Mata Kuliah',
            description: `Apakah Anda yakin ingin menghapus mata kuliah ${item.nama} (${item.kode} - ${item.sks} SKS)? Tindakan ini akan menghapus referensi mata kuliah dari master data.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/akademik/matakuliah/${item.id}`);
            },
        });
    };

    const openEditModal = (item: Matakuliah) => {
        setEditingMk(item);
        editForm.setData({
            kode: item.kode,
            nama: item.nama,
            sks: item.sks,
            jenis: item.jenis,
            bidang_ilmu_id: item.bidang_ilmu_id ? String(item.bidang_ilmu_id) : '',
        });
    };

    return (
        <>
            {confirmDialog}
            <Head title="Kelola Matakuliah Master" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Master Data Matakuliah</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola daftar seluruh matakuliah, bobot SKS, dan jenis kelompok matakuliah.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Matakuliah
                    </Button>
                </div>

                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {matakuliahs.length === 0 ? (
                        <div className="p-12 text-center">
                            <BookOpen className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada data matakuliah</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Tambahkan matakuliah baru ke dalam repositori akademik kampus.
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Matakuliah
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4 font-mono w-32">Kode MK</th>
                                        <th className="py-3 px-4">Nama Matakuliah</th>
                                        <th className="py-3 px-4 font-mono text-center w-24">SKS</th>
                                        <th className="py-3 px-4 text-center w-28 hidden sm:table-cell">Jenis</th>
                                        <th className="py-3 px-4 text-right w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {matakuliahs.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-mono font-semibold text-brand-primary">{item.kode}</td>
                                            <td className="py-3 px-4 font-semibold text-text-primary">
                                                <div>{item.nama}</div>
                                                <div className="sm:hidden text-[10px] text-text-secondary capitalize mt-0.5">
                                                    Jenis: {item.jenis}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-center font-semibold">{item.sks} SKS</td>
                                            <td className="py-3 px-4 text-center hidden sm:table-cell">
                                                <span className={`capitalize px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                                    item.jenis === 'wajib'
                                                        ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                                                        : 'bg-surface-base text-text-secondary border-border-default'
                                                }`}>
                                                    {item.jenis}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-base transition-colors"
                                                        title="Edit Matakuliah"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-status-danger hover:bg-surface-base transition-colors"
                                                        title="Hapus Matakuliah"
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

            {/* Modal Tambah Matakuliah */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tambah Matakuliah Baru</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Isi detail kode, nama, dan SKS matakuliah.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2 text-xs">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Kode Matakuliah <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                placeholder="Misal: PAI101 / MKB202"
                                value={createForm.data.kode}
                                onChange={(e) => createForm.setData('kode', e.target.value)}
                                className="text-xs font-mono border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.kode && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.kode}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Nama Matakuliah <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                placeholder="Nama resmi matakuliah"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-text-primary">
                                    Bobot SKS <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={6}
                                    value={createForm.data.sks}
                                    onChange={(e) => createForm.setData('sks', Number(e.target.value))}
                                    className="text-xs font-mono border-border-default"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-text-primary">
                                    Jenis Matakuliah <span className="text-status-danger">*</span>
                                </Label>
                                <select
                                    value={createForm.data.jenis}
                                    onChange={(e) => createForm.setData('jenis', e.target.value)}
                                    className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                                >
                                    <option value="wajib">Wajib Program Studi</option>
                                    <option value="pilihan">Matakuliah Pilihan</option>
                                </select>
                            </div>
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
                                Simpan Matakuliah
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Matakuliah */}
            <Dialog open={!!editingMk} onOpenChange={(open) => !open && setEditingMk(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Edit Matakuliah</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Perbarui informasi data matakuliah master.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2 text-xs">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Kode Matakuliah <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                value={editForm.data.kode}
                                onChange={(e) => editForm.setData('kode', e.target.value)}
                                className="text-xs font-mono border-border-default focus-visible:ring-brand-primary"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Nama Matakuliah <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-text-primary">
                                    Bobot SKS <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={6}
                                    value={editForm.data.sks}
                                    onChange={(e) => editForm.setData('sks', Number(e.target.value))}
                                    className="text-xs font-mono border-border-default"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-text-primary">
                                    Jenis Matakuliah <span className="text-status-danger">*</span>
                                </Label>
                                <select
                                    value={editForm.data.jenis}
                                    onChange={(e) => editForm.setData('jenis', e.target.value)}
                                    className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                                >
                                    <option value="wajib">Wajib Program Studi</option>
                                    <option value="pilihan">Matakuliah Pilihan</option>
                                </select>
                            </div>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingMk(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

MatakuliahIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Akademik', href: '#' },
        { title: 'Master Matakuliah', href: '/akademik/matakuliah' },
    ],
};
