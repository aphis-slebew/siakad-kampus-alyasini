import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Eye, UserCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type Mahasiswa = {
    id: number;
    nim: string;
    nama_lengkap: string;
    program_studi?: { nama: string };
};

type Matakuliah = {
    kode: string;
    nama: string;
    sks: number;
};

type KrsDetail = {
    id: number;
    kelas_kuliah?: {
        nama_kelas: string;
        kurikulum_matakuliah?: {
            matakuliah?: Matakuliah;
        };
        jadwal_perkuliahans?: any[];
    };
};


type Krs = {
    id: number;
    status: string;
    catatan_wali?: string;
    mahasiswa?: Mahasiswa;
    krs_details?: KrsDetail[];
};

type TahunAjaran = {
    id: number;
    nama: string;
};

export default function DosenApprovalIndex({

    krss = [],
    tahunAjaran,
}: {
    krss: Krs[];
    tahunAjaran: TahunAjaran;
}) {
    const [selectedKrs, setSelectedKrs] = useState<Krs | null>(null);
    const [rejectingKrs, setRejectingKrs] = useState<Krs | null>(null);
    const [catatanPenolakan, setCatatanPenolakan] = useState('');

    const handleApprove = (krs: Krs) => {
        if (confirm(`Apakah Anda yakin ingin menyetujui KRS mahasiswa ${krs.mahasiswa?.nama_lengkap}?`)) {
            router.post(`/perwalian/krs/${krs.id}/approve`, {}, {
                onSuccess: () => setSelectedKrs(null),
            });
        }
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingKrs) return;

        router.post(`/perwalian/krs/${rejectingKrs.id}/reject`, {
            catatan: catatanPenolakan,
        }, {
            onSuccess: () => {
                setRejectingKrs(null);
                setCatatanPenolakan('');
                setSelectedKrs(null);
            },
        });
    };

    return (
        <>
            <Head title="Perwalian & Approval KRS - Dosen Wali" />

            <div className="p-6 space-y-6 font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Dashboard Perwalian & Approval KRS</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Verifikasi & persetujuan rencana studi mahasiswa bimbingan perwalian semester {tahunAjaran?.nama}.
                        </p>
                    </div>
                </div>

                {/* Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {krss.length === 0 ? (
                        <div className="p-12 text-center">
                            <UserCheck className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada pengajuan KRS perwalian</h3>
                            <p className="text-xs text-text-secondary mt-1">
                                Belum ada mahasiswa bimbingan perwalian yang mengajukan KRS pada semester ini.
                            </p>
                        </div>
                    ) : (
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Mahasiswa Bimbingan</TableHead>
                                    <TableHead align="center" className="w-32">Total MK / SKS</TableHead>
                                    <TableHead align="center" className="w-36">Status Approval</TableHead>
                                    <TableHead align="right" className="w-40">Aksi Verifikasi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {krss.map((item, index) => {
                                    const details = item.krs_details || [];
                                    const totalSks = details.reduce((sum, d) => sum + (d.kelas_kuliah?.kurikulum_matakuliah?.matakuliah?.sks || 0), 0);

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-muted-foreground font-medium">{index + 1}</TableCell>
                                            <TableCell>
                                                <StackedCell
                                                    primary={item.mahasiswa?.nama_lengkap}
                                                    secondary={`NIM: ${item.mahasiswa?.nim} • ${item.mahasiswa?.program_studi?.nama}`}
                                                />
                                            </TableCell>
                                            <TableCell align="center" className="font-mono font-semibold">
                                                {details.length} MK ({totalSks} SKS)
                                            </TableCell>
                                            <TableCell align="center">
                                                {item.status === 'disetujui_wali' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        <CheckCircle2 className="size-3" />
                                                        Disetujui Wali
                                                    </span>
                                                )}
                                                {item.status === 'diajukan' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                        Menunggu Approval
                                                    </span>
                                                )}
                                                {item.status === 'ditolak' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                                        <XCircle className="size-3" />
                                                        Ditolak
                                                    </span>
                                                )}
                                                {item.status === 'draft' && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                                        Draft Mahasiswa
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedKrs(item)}
                                                        className="h-8 w-8 p-0"
                                                        title="Review Matakuliah KRS"
                                                    >
                                                        <Eye className="size-4" />
                                                    </Button>

                                                    {item.status === 'diajukan' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApprove(item)}
                                                                className="bg-emerald-600 hover:bg-emerald-700 h-8 px-2.5 text-xs"
                                                            >
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setRejectingKrs(item)}
                                                                className="h-8 px-2.5 text-xs text-destructive hover:text-destructive"
                                                            >
                                                                Tolak
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </ResponsiveTable>
                    )}
                </div>
            </div>


            {/* Modal Review Detail KRS Mahasiswa */}
            <Dialog open={!!selectedKrs} onOpenChange={(open) => !open && setSelectedKrs(null)}>
                <DialogContent className="sm:max-w-xl bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Review Rencana Studi (KRS) Mahasiswa</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Periksa pilihan matakuliah, jam bentrok, dan total bobot SKS.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedKrs && (
                        <div className="space-y-4 py-2 text-xs">
                            <div className="bg-surface-base p-3 rounded-md border border-border-default grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-text-secondary text-[11px] block">Mahasiswa:</span>
                                    <span className="font-bold text-text-primary">{selectedKrs.mahasiswa?.nama_lengkap}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary text-[11px] block">NIM:</span>
                                    <span className="font-mono font-bold text-brand-primary">{selectedKrs.mahasiswa?.nim}</span>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                <span className="font-bold text-text-primary block text-xs">Daftar Matakuliah Diambil:</span>
                                {selectedKrs.krs_details?.map((d, idx) => {
                                    const mk = d.kelas_kuliah?.kurikulum_matakuliah?.matakuliah;
                                    const j = d.kelas_kuliah?.jadwal_perkuliahans && d.kelas_kuliah.jadwal_perkuliahans[0];
                                    const r = j?.ruang_kuliah;

                                    return (
                                        <div key={d.id} className="p-2.5 bg-surface-base rounded-md border border-border-default flex justify-between items-center text-xs">
                                            <div>
                                                <span className="font-mono font-bold text-brand-primary">{idx + 1}. {mk?.kode}</span> - <span className="font-semibold">{mk?.nama}</span>
                                                <div className="text-[11px] text-text-secondary mt-0.5">
                                                    Kelas <span className="font-bold">{d.kelas_kuliah?.nama_kelas}</span> • {j?.hari}, {j?.jam_mulai.substring(0, 5)} - {j?.jam_selesai.substring(0, 5)} ({r?.nama})
                                                </div>
                                            </div>
                                            <span className="font-mono font-bold text-brand-primary text-xs">{mk?.sks} SKS</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedKrs.status === 'diajukan' && (
                                <DialogFooter className="pt-2 gap-2 border-t border-border-default">
                                    <Button
                                        type="button"
                                        onClick={() => setRejectingKrs(selectedKrs)}
                                        className="bg-status-danger text-white hover:bg-status-danger/90 text-xs font-semibold"
                                    >
                                        Tolak KRS
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => handleApprove(selectedKrs)}
                                        className="bg-status-success text-white hover:bg-status-success/90 text-xs font-semibold"
                                    >
                                        Setujui KRS Mahasiswa
                                    </Button>
                                </DialogFooter>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal Input Catatan Penolakan KRS */}
            <Dialog open={!!rejectingKrs} onOpenChange={(open) => !open && setRejectingKrs(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tolak Pengajuan KRS</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Masukkan alasan penolakan agar mahasiswa dapat memperbaiki pilihan KRS.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleRejectSubmit} className="space-y-4 py-2 text-xs">
                        <div className="space-y-1.5">
                            <span className="font-semibold text-text-primary block">
                                Alasan / Catatan Perbaikan Dosen Wali <span className="text-status-danger">*</span>
                            </span>
                            <textarea
                                required
                                rows={4}
                                placeholder="Misal: Kurangi SKS karena bentrok jadwal / SKS terlalu berat..."
                                value={catatanPenolakan}
                                onChange={(e) => setCatatanPenolakan(e.target.value)}
                                className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                            />
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRejectingKrs(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-status-danger text-white hover:bg-status-danger/90 text-xs font-semibold"
                            >
                                Kirim Penolakan KRS
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

DosenApprovalIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Perwalian', href: '#' },
        { title: 'Approval KRS', href: '/perwalian/krs' },
    ],
};
