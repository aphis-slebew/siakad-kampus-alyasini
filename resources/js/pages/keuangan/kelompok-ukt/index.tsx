import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { CreditCard, Edit, Plus, Trash2 } from 'lucide-react';
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

type ProgramStudi = {
    id: number;
    nama: string;
    kode: string;
};

type KelompokUkt = {
    id: number;
    program_studi_id: number;
    nama: string;
    nominal_per_semester: number;
    program_studi?: ProgramStudi;
};

export default function KelompokUktIndex({
    kelompoks = [],
    programStudis = [],
}: {
    kelompoks: KelompokUkt[];
    programStudis: ProgramStudi[];
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingKelompok, setEditingKelompok] = useState<KelompokUkt | null>(null);

    const createForm = useForm({
        program_studi_id: programStudis[0]?.id || '',
        nama: '',
        nominal_per_semester: 2500000,
    });

    const editForm = useForm({
        program_studi_id: 0,
        nama: '',
        nominal_per_semester: 2500000,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/keuangan/kelompok-ukt', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingKelompok) return;

        editForm.put(`/keuangan/kelompok-ukt/${editingKelompok.id}`, {
            onSuccess: () => {
                setEditingKelompok(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (item: KelompokUkt) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kelompok UKT ${item.nama}?`)) {
            router.delete(`/keuangan/kelompok-ukt/${item.id}`);
        }
    };

    const openEditModal = (item: KelompokUkt) => {
        setEditingKelompok(item);
        editForm.setData({
            program_studi_id: item.program_studi_id,
            nama: item.nama,
            nominal_per_semester: Number(item.nominal_per_semester),
        });
    };

    return (
        <>
            <Head title="Kelola Kelompok UKT" />

            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Kelompok UKT (Uang Kuliah Tunggal)</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Atur tingkatan dan nominal tarif UKT per semester untuk tiap Program Studi.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Kelompok UKT
                    </Button>
                </div>

                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {kelompoks.length === 0 ? (
                        <div className="p-12 text-center">
                            <CreditCard className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada kelompok UKT</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Silakan buat kelompok UKT baru per Program Studi.
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Kelompok UKT
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4">Program Studi</th>
                                        <th className="py-3 px-4">Nama Kelompok</th>
                                        <th className="py-3 px-4 font-mono w-44">Nominal / Semester</th>
                                        <th className="py-3 px-4 text-right w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {kelompoks.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-semibold text-text-primary">
                                                {item.program_studi?.nama || '-'} ({item.program_studi?.kode})
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-brand-primary">{item.nama}</td>
                                            <td className="py-3 px-4 font-mono">
                                                Rp {Number(item.nominal_per_semester).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-base transition-colors duration-150"
                                                        title="Edit Kelompok UKT"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-status-danger hover:bg-surface-base transition-colors duration-150"
                                                        title="Hapus Kelompok UKT"
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

            {/* Modal Tambah */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tambah Kelompok UKT</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Isi detail nama kelompok dan tarif UKT per semester.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Program Studi <span className="text-status-danger">*</span>
                            </Label>
                            <select
                                value={createForm.data.program_studi_id}
                                onChange={(e) => createForm.setData('program_studi_id', Number(e.target.value))}
                                className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                            >
                                <option value="">Pilih Program Studi</option>
                                {programStudis.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nama} ({p.kode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Nama Kelompok UKT <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                placeholder="Misal: Kelompok I / Kelompok II"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Nominal UKT / Semester (Rp) <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                value={createForm.data.nominal_per_semester}
                                onChange={(e) => createForm.setData('nominal_per_semester', Number(e.target.value))}
                                className="text-xs border-border-default focus-visible:ring-brand-primary font-mono"
                            />
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
                                Simpan Kelompok UKT
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

KelompokUktIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Keuangan', href: '#' },
        { title: 'Kelompok UKT', href: '/keuangan/kelompok-ukt' },
    ],
};
