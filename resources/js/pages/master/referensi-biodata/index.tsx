import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, FileText, Plus, Trash2 } from 'lucide-react';
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

type ReferensiBiodata = {
    id: number;
    tipe: string;
    nama: string;
    pddikti_ref_id: string | null;
};

export default function ReferensiBiodataIndex({ referensiBiodatas = [] }: { referensiBiodatas: ReferensiBiodata[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRef, setEditingRef] = useState<ReferensiBiodata | null>(null);

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

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/master/referensi-biodata', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRef) return;

        editForm.put(`/master/referensi-biodata/${editingRef.id}`, {
            onSuccess: () => {
                setEditingRef(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (item: ReferensiBiodata) => {
        if (confirm(`Apakah Anda yakin ingin menghapus referensi ${item.nama}?`)) {
            router.delete(`/master/referensi-biodata/${item.id}`);
        }
    };

    const openEditModal = (item: ReferensiBiodata) => {
        setEditingRef(item);
        editForm.setData({
            tipe: item.tipe,
            nama: item.nama,
            pddikti_ref_id: item.pddikti_ref_id || '',
        });
    };

    return (
        <>
            <Head title="Kelola Referensi Biodata" />

            <div className="p-6 space-y-6">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Referensi Biodata</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola data referensi pilihan biodata (agama, pekerjaan, suku, penghasilan) untuk PD-DIKTI.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Referensi
                    </Button>
                </div>

                {/* Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {referensiBiodatas.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada data referensi biodata</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Silakan tambahkan data referensi biodata baru.
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
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
                                        <th className="py-3 px-4 w-36">Tipe Referensi</th>
                                        <th className="py-3 px-4">Nama Pilihan</th>
                                        <th className="py-3 px-4 font-mono">PD-DIKTI Ref ID</th>
                                        <th className="py-3 px-4 text-right w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {referensiBiodatas.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-surface-base text-brand-primary border border-border-default capitalize">
                                                    {item.tipe}
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
                            Isi tipe dan pilihan referensi biodata.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="tipe" className="text-xs font-semibold text-text-primary">
                                Tipe Referensi <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="tipe"
                                placeholder="Misal: agama / pekerjaan / penghasilan"
                                value={createForm.data.tipe}
                                onChange={(e) => createForm.setData('tipe', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.tipe && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.tipe}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="nama" className="text-xs font-semibold text-text-primary">
                                Nama Pilihan <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="nama"
                                placeholder="Misal: Islam / PNS / Rp 3.000.000 - Rp 5.000.000"
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
                                PD-DIKTI Ref ID (Opsional)
                            </Label>
                            <Input
                                id="pddikti_ref_id"
                                placeholder="UUID dari Feeder (jika ada)"
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
                            <Label htmlFor="edit_tipe" className="text-xs font-semibold text-text-primary">
                                Tipe Referensi <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="edit_tipe"
                                value={editForm.data.tipe}
                                onChange={(e) => editForm.setData('tipe', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
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
                                PD-DIKTI Ref ID (Opsional)
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
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Referensi'}
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
