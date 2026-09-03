import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, Eye, GraduationCap, ShieldCheck, UserCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
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

type CalonMahasiswa = {
    id: number;
    nama_lengkap: string;
    nik: string;
    email: string;
    no_hp: string;
    status_pendaftaran: string;
    prodi_pilihan1?: { id: number; nama: string; kode: string };
    gelombang_pendaftaran?: { id: number; nama: string };
    jalur_pendaftaran?: { id: number; nama: string };
    hasil_seleksi?: { id: number; status: string; nilai_tes: number };
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-surface-base text-text-secondary border-border-default' },
    diajukan: { label: 'Diajukan', color: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' },
    verifikasi_berkas: { label: 'Verifikasi Berkas', color: 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' },
    lolos_verifikasi: { label: 'Lolos Verifikasi', color: 'bg-status-success/10 text-status-success border-status-success/20' },
    dijadwalkan_tes: { label: 'Dijadwalkan Tes', color: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' },
    lulus_seleksi: { label: 'Lulus Seleksi', color: 'bg-status-success/10 text-status-success border-status-success/20' },
    tidak_lulus: { label: 'Tidak Lulus', color: 'bg-status-danger/10 text-status-danger border-status-danger/20' },
};

export default function CalonMahasiswaIndex({
    calonMahasiswas = [],
    currentStatus,
}: {
    calonMahasiswas: CalonMahasiswa[];
    currentStatus?: string;
}) {
    const [selectedCalon, setSelectedCalon] = useState<CalonMahasiswa | null>(null);
    const [isHasilOpen, setIsHasilOpen] = useState(false);
    const [isKonversiOpen, setIsKonversiOpen] = useState(false);

    const statusForm = useForm({
        target_status: '',
    });

    const hasilForm = useForm({
        nilai_tes: 85,
        status: 'lulus',
        catatan: '',
    });

    const konversiForm = useForm({
        is_registrasi_ulang_selesai: true,
    });

    const handleFilterStatus = (status?: string) => {
        router.get('/pmb/calon-mahasiswa', status ? { status } : {}, { preserveState: true });
    };

    const handleUpdateStatus = (calon: CalonMahasiswa, targetStatus: string) => {
        statusForm.setData('target_status', targetStatus);
        router.patch(`/pmb/calon-mahasiswa/${calon.id}/status`, { target_status: targetStatus });
    };

    const handleHasilSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCalon) {
return;
}

        hasilForm.post(`/pmb/calon-mahasiswa/${selectedCalon.id}/hasil-seleksi`, {
            onSuccess: () => {
                setIsHasilOpen(false);
                setSelectedCalon(null);
            },
        });
    };

    const handleKonversiSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCalon) {
return;
}

        konversiForm.post(`/pmb/calon-mahasiswa/${selectedCalon.id}/konversi`, {
            onSuccess: () => {
                setIsKonversiOpen(false);
                setSelectedCalon(null);
            },
        });
    };

    return (
        <>
            <Head title="Daftar Calon Mahasiswa - PMB" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Calon Mahasiswa Baru</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola pendaftaran, verifikasi berkas, dan hasil seleksi penerimaan mahasiswa baru STAI Al-Yasini.
                        </p>
                    </div>
                </div>

                {/* Filter Tabs Status Pendaftaran */}
                <div className="flex items-center gap-1.5 border-b border-border-default pb-2 overflow-x-auto whitespace-nowrap">
                    <button
                        type="button"
                        onClick={() => handleFilterStatus()}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            !currentStatus
                                ? 'bg-brand-primary text-white'
                                : 'text-text-secondary hover:text-text-primary hover:bg-surface-base'
                        }`}
                    >
                        Semua ({calonMahasiswas.length})
                    </button>
                    {Object.entries(STATUS_LABELS).map(([key, config]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handleFilterStatus(key)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                currentStatus === key
                                    ? 'bg-brand-primary text-white'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-base'
                            }`}
                        >
                            {config.label}
                        </button>
                    ))}
                </div>

                {/* Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {calonMahasiswas.length === 0 ? (
                        <div className="p-12 text-center">
                            <UserCheck className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Tidak ada calon mahasiswa</h3>
                            <p className="text-xs text-text-secondary mt-1">
                                Belum ada calon mahasiswa dengan kriteria filter tersebut.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4">Nama Lengkap</th>
                                        <th className="py-3 px-4">Pilihan Prodi 1</th>
                                        <th className="py-3 px-4">Gelombang & Jalur</th>
                                        <th className="py-3 px-4 text-center">Status Pendaftaran</th>
                                        <th className="py-3 px-4 text-right w-36">Aksi & Transisi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {calonMahasiswas.map((item, index) => {
                                        const statusConfig = STATUS_LABELS[item.status_pendaftaran] || {
                                            label: item.status_pendaftaran,
                                            color: 'bg-surface-base text-text-primary',
                                        };

                                        return (
                                            <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                                <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                                <td className="py-3 px-4">
                                                    <p className="font-semibold text-text-primary">{item.nama_lengkap}</p>
                                                    <p className="text-[11px] text-text-secondary">{item.email} • {item.no_hp}</p>
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-brand-primary">
                                                    {item.prodi_pilihan1?.nama || '-'}
                                                </td>
                                                <td className="py-3 px-4 text-text-secondary">
                                                    {item.gelombang_pendaftaran?.nama} ({item.jalur_pendaftaran?.nama})
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.color}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Step State Machine Action Buttons */}
                                                        {item.status_pendaftaran === 'diajukan' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(item, 'verifikasi_berkas')}
                                                                className="text-[11px] bg-brand-primary text-white hover:bg-brand-primary-dark h-7 px-2"
                                                            >
                                                                Mulai Verifikasi
                                                            </Button>
                                                        )}

                                                        {item.status_pendaftaran === 'verifikasi_berkas' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(item, 'lolos_verifikasi')}
                                                                className="text-[11px] bg-status-success text-white hover:bg-status-success/90 h-7 px-2"
                                                            >
                                                                Lolos Berkas
                                                            </Button>
                                                        )}

                                                        {item.status_pendaftaran === 'lolos_verifikasi' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(item, 'dijadwalkan_tes')}
                                                                className="text-[11px] bg-brand-primary text-white hover:bg-brand-primary-dark h-7 px-2"
                                                            >
                                                                Jadwalkan Tes
                                                            </Button>
                                                        )}

                                                        {item.status_pendaftaran === 'dijadwalkan_tes' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedCalon(item);
                                                                    setIsHasilOpen(true);
                                                                }}
                                                                className="text-[11px] bg-brand-accent text-white hover:bg-brand-accent/90 h-7 px-2"
                                                            >
                                                                Input Hasil Tes
                                                            </Button>
                                                        )}

                                                        {item.status_pendaftaran === 'lulus_seleksi' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedCalon(item);
                                                                    setIsKonversiOpen(true);
                                                                }}
                                                                className="text-[11px] bg-status-success text-white hover:bg-status-success/90 h-7 px-2 flex items-center gap-1"
                                                            >
                                                                <GraduationCap className="size-3.5" />
                                                                Konversi Mahasiswa
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Input Hasil Seleksi */}
            <Dialog open={isHasilOpen} onOpenChange={setIsHasilOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Input Hasil Seleksi Tes</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Calon Mahasiswa: {selectedCalon?.nama_lengkap}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleHasilSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="nilai_tes" className="text-xs font-semibold text-text-primary">
                                Nilai Ujian / Tes (0 - 100)
                            </Label>
                            <Input
                                id="nilai_tes"
                                type="number"
                                min={0}
                                max={100}
                                value={hasilForm.data.nilai_tes}
                                onChange={(e) => hasilForm.setData('nilai_tes', Number(e.target.value))}
                                className="text-xs border-border-default focus-visible:ring-brand-primary font-mono"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Keputusan Hasil Seleksi <span className="text-status-danger">*</span>
                            </Label>
                            <select
                                value={hasilForm.data.status}
                                onChange={(e) => hasilForm.setData('status', e.target.value)}
                                className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                            >
                                <option value="lulus">LULUS (Diterima)</option>
                                <option value="tidak_lulus">TIDAK LULUS</option>
                            </select>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsHasilOpen(false)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={hasilForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                Simpan Hasil Seleksi
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Konversi Calon Ke Mahasiswa Resmi */}
            <Dialog open={isKonversiOpen} onOpenChange={setIsKonversiOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary flex items-center gap-2">
                            <ShieldCheck className="size-5 text-status-success" />
                            Konversi Ke Mahasiswa Resmi
                        </DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Proses ini akan membuat akun User & baris Mahasiswa BARU (NIM baru) serta mencatat riwayat PMB.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleKonversiSubmit} className="space-y-4 py-2">
                        <div className="rounded-md bg-surface-base p-3 border border-border-default text-xs space-y-1">
                            <p className="font-semibold text-text-primary">Calon: {selectedCalon?.nama_lengkap}</p>
                            <p className="text-text-secondary">Prodi: {selectedCalon?.prodi_pilihan1?.nama}</p>
                            <p className="text-status-success font-semibold mt-1">✓ Hasil Seleksi: LULUS</p>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_reg_ulang"
                                checked={konversiForm.data.is_registrasi_ulang_selesai}
                                onChange={(e) => konversiForm.setData('is_registrasi_ulang_selesai', e.target.checked)}
                                className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
                            />
                            <Label htmlFor="is_reg_ulang" className="text-xs font-semibold text-text-primary cursor-pointer">
                                Tandai selesai registrasi ulang (Sementara, manual)
                            </Label>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsKonversiOpen(false)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={konversiForm.processing}
                                className="bg-status-success text-white hover:bg-status-success/90 text-xs font-semibold"
                            >
                                Generate NIM & Konversi
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

CalonMahasiswaIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'PMB',
            href: '#',
        },
        {
            title: 'Calon Mahasiswa',
            href: '/pmb/calon-mahasiswa',
        },
    ],
};
