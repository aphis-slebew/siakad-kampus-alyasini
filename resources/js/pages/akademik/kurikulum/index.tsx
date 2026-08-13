import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { BookOpenCheck, Edit, Plus, Trash2 } from 'lucide-react';
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

type Matakuliah = {
    id: number;
    kode: string;
    nama: string;
    sks: number;
};

type KurikulumMatakuliah = {
    id: number;
    semester: number;
    matakuliah?: Matakuliah;
};

type Kurikulum = {
    id: number;
    program_studi_id: number;
    tahun_kurikulum: string;
    is_active: boolean;
    program_studi?: ProgramStudi;
    kurikulum_matakuliahs?: KurikulumMatakuliah[];
};

export default function KurikulumProdiIndex({
    kurikulums = [],
    programStudis = [],
    matakuliahs = [],
}: {
    kurikulums: Kurikulum[];
    programStudis: ProgramStudi[];
    matakuliahs: Matakuliah[];
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingKurikulum, setEditingKurikulum] = useState<Kurikulum | null>(null);
    const [selectedKurikulumDetail, setSelectedKurikulumDetail] = useState<Kurikulum | null>(null);

    const createForm = useForm({
        program_studi_id: programStudis[0]?.id || '',
        tahun_kurikulum: new Date().getFullYear().toString(),
        is_active: true,
    });

    const addMkForm = useForm({
        matakuliah_id: matakuliahs[0]?.id || '',
        semester: 1,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/akademik/kurikulum', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleDelete = (item: Kurikulum) => {
        if (confirm(`Apakah Anda yakin ingin menghapus Kurikulum ${item.tahun_kurikulum}?`)) {
            router.delete(`/akademik/kurikulum/${item.id}`);
        }
    };

    const handleAddMkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedKurikulumDetail) return;

        addMkForm.post(`/akademik/kurikulum/${selectedKurikulumDetail.id}/matakuliah`, {
            onSuccess: () => {
                addMkForm.reset();
                setSelectedKurikulumDetail(null);
            },
        });
    };

    return (
        <>
            <Head title="Kelola Kurikulum Program Studi" />

            <div className="p-6 space-y-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Kurikulum Program Studi</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola tahun kurikulum per Prodi (Hanya 1 kurikulum aktif per prodi) dan pemetaan matakuliah per semester.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Kurikulum
                    </Button>
                </div>

                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {kurikulums.length === 0 ? (
                        <div className="p-12 text-center">
                            <BookOpenCheck className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada kurikulum prodi</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Silakan buat tahun kurikulum baru per Program Studi.
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Kurikulum
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4">Program Studi</th>
                                        <th className="py-3 px-4 font-mono w-32">Tahun Kurikulum</th>
                                        <th className="py-3 px-4 text-center w-28">Jumlah MK</th>
                                        <th className="py-3 px-4 text-center w-28">Status Active</th>
                                        <th className="py-3 px-4 text-right w-36">Aksi Struktur</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {kurikulums.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-semibold text-text-primary">
                                                {item.program_studi?.nama} ({item.program_studi?.kode})
                                            </td>
                                            <td className="py-3 px-4 font-mono font-semibold text-brand-primary">{item.tahun_kurikulum}</td>
                                            <td className="py-3 px-4 text-center font-semibold font-mono">
                                                {item.kurikulum_matakuliahs?.length || 0} MK
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-success/10 text-status-success border border-status-success/20">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-base text-text-secondary border border-border-default">
                                                        Non-Aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedKurikulumDetail(item)}
                                                        className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded text-xs font-semibold hover:bg-brand-primary/20"
                                                    >
                                                        + Matakuliah
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-status-danger hover:bg-surface-base transition-colors"
                                                        title="Hapus Kurikulum"
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

            {/* Modal Tambah Kurikulum */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tambah Kurikulum Baru</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Atur tahun kurikulum baru. Menentukan kurikulum ini aktif akan me-nonaktifkan kurikulum lama untuk prodi ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2 text-xs">
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
                                Tahun Kurikulum <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                placeholder="Misal: 2024 / 2026"
                                value={createForm.data.tahun_kurikulum}
                                onChange={(e) => createForm.setData('tahun_kurikulum', e.target.value)}
                                className="text-xs font-mono border-border-default focus-visible:ring-brand-primary"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_active_check"
                                checked={createForm.data.is_active}
                                onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
                            />
                            <Label htmlFor="is_active_check" className="text-xs font-medium text-text-primary">
                                Set sebagai Kurikulum Aktif Prodi ini
                            </Label>
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
                                Simpan Kurikulum
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Detail & Tambah MK ke Kurikulum */}
            <Dialog open={!!selectedKurikulumDetail} onOpenChange={(open) => !open && setSelectedKurikulumDetail(null)}>
                <DialogContent className="sm:max-w-lg bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Struktur Matakuliah Kurikulum</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Petakan matakuliah ke semester tertentu dalam kurikulum.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedKurikulumDetail && (
                        <div className="space-y-4 py-2 text-xs">
                            <form onSubmit={handleAddMkSubmit} className="bg-surface-base p-3 rounded-md border border-border-default space-y-3">
                                <span className="font-semibold text-text-primary block text-xs">Tambah Matakuliah ke Semester:</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <select
                                            value={addMkForm.data.matakuliah_id}
                                            onChange={(e) => addMkForm.setData('matakuliah_id', Number(e.target.value))}
                                            className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary"
                                        >
                                            {matakuliahs.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.kode} - {m.nama} ({m.sks} SKS)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <select
                                            value={addMkForm.data.semester}
                                            onChange={(e) => addMkForm.setData('semester', Number(e.target.value))}
                                            className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                                <option key={s} value={s}>
                                                    Semester {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={addMkForm.processing}
                                    className="w-full bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold py-1.5 rounded-md"
                                >
                                    + Petakan Matakuliah
                                </Button>
                            </form>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                <span className="font-semibold text-text-primary block text-xs">Daftar Matakuliah Terpetakan:</span>
                                {selectedKurikulumDetail.kurikulum_matakuliahs && selectedKurikulumDetail.kurikulum_matakuliahs.length > 0 ? (
                                    selectedKurikulumDetail.kurikulum_matakuliahs.map((km) => (
                                        <div key={km.id} className="flex justify-between items-center bg-surface-base p-2.5 rounded-md border border-border-default">
                                            <div>
                                                <span className="font-mono font-semibold text-brand-primary">{km.matakuliah?.kode}</span> - {km.matakuliah?.nama}
                                                <span className="text-[11px] text-text-secondary block font-medium">Semester {km.semester} • {km.matakuliah?.sks} SKS</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => router.delete(`/akademik/kurikulum-matakuliah/${km.id}`)}
                                                className="p-1 text-text-secondary hover:text-status-danger"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-text-secondary italic text-center py-4">Belum ada matakuliah dipetakan ke kurikulum ini.</p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

KurikulumProdiIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Akademik', href: '#' },
        { title: 'Kurikulum Prodi', href: '/akademik/kurikulum' },
    ],
};
