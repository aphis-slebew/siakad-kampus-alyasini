import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, CreditCard, ExternalLink, Eye, RefreshCw, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatDateIndonesian } from '@/lib/utils';
import type { SharedData } from '@/types';


type Pembayaran = {
    id: number;
    tagihan_id: number;
    tanggal_bayar: string;
    nominal_dibayar: number;
    metode: string;
    bukti_file_path: string | null;
    status_verifikasi: string;
    diverifikasi_at: string | null;
    tagihan?: {
        id: number;
        jenis: string;
        nominal: number;
        status: string;
        mahasiswa?: {
            nama_lengkap: string;
            nim: string;
            program_studi?: { nama: string };
        };
    };
};

export default function PembayaranStaffIndex({
    pembayarans = [],
    currentStatus = 'menunggu',
}: {
    pembayarans: Pembayaran[];
    currentStatus: string;
}) {
    const { errors, flash } = usePage<SharedData & { flash?: { success?: string; error?: string }; errors?: Record<string, string> }>().props;
    const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null);
    const { confirm, confirmDialog } = useConfirmDialog();

    const handleVerify = (item: Pembayaran, status: 'diverifikasi' | 'ditolak') => {
        confirm({
            title: status === 'diverifikasi' ? 'Verifikasi Pembayaran' : 'Tolak Pembayaran',
            description: `Apakah Anda yakin ingin memverifikasi pembayaran sebesar Rp ${Number(item.nominal_dibayar).toLocaleString('id-ID')} atas nama ${item.tagihan?.mahasiswa?.nama_lengkap || 'Mahasiswa'} sebagai "${status}"?`,
            variant: status === 'diverifikasi' ? 'primary' : 'destructive',
            confirmText: status === 'diverifikasi' ? 'Ya, Verifikasi' : 'Ya, Tolak',
            onConfirm: () => {
                router.patch(`/keuangan/pembayaran/${item.id}/verify`, {
                    status_verifikasi: status,
                }, {
                    onSuccess: () => setSelectedPembayaran(null),
                });
            },
        });
    };

    const handleFilterStatus = (status: string) => {
        router.get('/keuangan/pembayaran', { status });
    };

    const errorMessage = errors?.verifikasi || errors?.error || flash?.error;

    return (
        <>
            {confirmDialog}
            <Head title="Verifikasi Pembayaran UKT & Keuangan" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Error Banner Notification (Poin 4 - Error Handling Ramah User) */}
                {errorMessage && (
                    <div className="bg-status-danger/10 border border-status-danger/30 rounded-lg p-3 text-status-danger text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Dashboard Verifikasi Pembayaran</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Verifikasi bukti transfer manual pembayaran UKT / Her-Registrasi dari mahasiswa.
                        </p>
                    </div>

                    <Button
                        onClick={() => router.post('/keuangan/generate-ukt-batch', { periode_registrasi_id: 1 })}
                        variant="outline"
                        className="border-border-default text-text-primary hover:bg-surface-base text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <RefreshCw className="size-3.5" />
                        Generate Batch UKT
                    </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 border-b border-border-default pb-2 overflow-x-auto whitespace-nowrap">
                    {['menunggu', 'diverifikasi', 'ditolak', 'semua'].map((st) => (
                        <button
                            key={st}
                            type="button"
                            onClick={() => handleFilterStatus(st)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                                currentStatus === st
                                    ? 'bg-brand-primary text-white font-semibold'
                                    : 'text-text-secondary hover:bg-surface-base hover:text-text-primary'
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>

                {/* Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {pembayarans.length === 0 ? (
                        <div className="p-12 text-center">
                            <CreditCard className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Tidak ada data pembayaran ({currentStatus})</h3>
                            <p className="text-xs text-text-secondary mt-1">
                                Belum ada pengajuan pembayaran transfer manual yang masuk dalam kategori ini.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4">Mahasiswa / NIM</th>
                                        <th className="py-3 px-4">Jenis Tagihan</th>
                                        <th className="py-3 px-4 font-mono w-40">Tgl Bayar</th>
                                        <th className="py-3 px-4 font-mono w-36">Nominal Dibayar</th>
                                        <th className="py-3 px-4 text-center w-28">Status</th>
                                        <th className="py-3 px-4 text-right w-36">Aksi Verifikasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {pembayarans.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-semibold text-brand-primary">
                                                {item.tagihan?.mahasiswa?.nama_lengkap || 'Mahasiswa'}
                                                <div className="text-[11px] font-mono font-normal text-text-secondary">
                                                    NIM: {item.tagihan?.mahasiswa?.nim || '-'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 capitalize font-medium">
                                                {item.tagihan?.jenis.replace('_', ' ') || 'UKT'}
                                            </td>
                                            <td className="py-3 px-4 font-medium">{formatDateIndonesian(item.tanggal_bayar)}</td>
                                            <td className="py-3 px-4 font-mono font-semibold">
                                                Rp {Number(item.nominal_dibayar).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {item.status_verifikasi === 'diverifikasi' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-success/10 text-status-success border border-status-success/20">
                                                        <CheckCircle2 className="size-3" />
                                                        Diverifikasi
                                                    </span>
                                                )}
                                                {item.status_verifikasi === 'menunggu' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-warning/10 text-status-warning border border-status-warning/20">
                                                        Menunggu
                                                    </span>
                                                )}
                                                {item.status_verifikasi === 'ditolak' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-danger/10 text-status-danger border border-status-danger/20">
                                                        <XCircle className="size-3" />
                                                        Ditolak
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedPembayaran(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-base transition-colors"
                                                        title="Lihat Bukti Bayar"
                                                    >
                                                        <Eye className="size-4" />
                                                    </button>

                                                    {item.status_verifikasi === 'menunggu' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleVerify(item, 'diverifikasi')}
                                                                className="px-2 py-1 bg-status-success text-white rounded text-[11px] font-semibold hover:bg-status-success/90"
                                                            >
                                                                Terima
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleVerify(item, 'ditolak')}
                                                                className="px-2 py-1 bg-status-danger text-white rounded text-[11px] font-semibold hover:bg-status-danger/90"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </>
                                                    )}
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

            {/* Modal Detail & Bukti Pembayaran */}
            <Dialog open={!!selectedPembayaran} onOpenChange={(open) => !open && setSelectedPembayaran(null)}>
                <DialogContent className="sm:max-w-lg bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Detail & Bukti Pembayaran</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Periksa nominal dan keaslian file bukti transfer manual.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPembayaran && (
                        <div className="space-y-4 py-2 text-xs">
                            <div className="grid grid-cols-2 gap-3 bg-surface-base p-3 rounded-md border border-border-default">
                                <div>
                                    <span className="text-text-secondary block text-[11px]">Nama Mahasiswa:</span>
                                    <span className="font-semibold text-text-primary">{selectedPembayaran.tagihan?.mahasiswa?.nama_lengkap}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary block text-[11px]">NIM:</span>
                                    <span className="font-mono font-semibold text-text-primary">{selectedPembayaran.tagihan?.mahasiswa?.nim}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary block text-[11px]">Nominal Dibayar:</span>
                                    <span className="font-mono font-semibold text-brand-primary">Rp {Number(selectedPembayaran.nominal_dibayar).toLocaleString('id-ID')}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary block text-[11px]">Tanggal Transfer:</span>
                                    <span className="font-medium text-text-primary">{formatDateIndonesian(selectedPembayaran.tanggal_bayar)}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-text-primary">File Bukti Transfer:</Label>
                                {selectedPembayaran.bukti_file_path ? (
                                    <div className="border border-border-default rounded-md p-3 text-center bg-surface-base">
                                        <a
                                            href={`/keuangan/pembayaran/${selectedPembayaran.id}/bukti`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-brand-primary font-semibold hover:underline"
                                        >
                                            <ExternalLink className="size-4" />
                                            Buka / Unduh File Bukti Pembayaran (Private File)
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-text-secondary italic">Tidak ada file bukti diunggah.</p>
                                )}
                            </div>

                            {selectedPembayaran.status_verifikasi === 'menunggu' && (
                                <div className="flex justify-end gap-2 pt-2 border-t border-border-default">
                                    <Button
                                        type="button"
                                        onClick={() => handleVerify(selectedPembayaran, 'ditolak')}
                                        className="bg-status-danger text-white hover:bg-status-danger/90 text-xs font-semibold"
                                    >
                                        Tolak Pembayaran
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => handleVerify(selectedPembayaran, 'diverifikasi')}
                                        className="bg-status-success text-white hover:bg-status-success/90 text-xs font-semibold"
                                    >
                                        Verifikasi (Terima Pembayaran)
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

PembayaranStaffIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Keuangan', href: '#' },
        { title: 'Verifikasi Pembayaran', href: '/keuangan/pembayaran' },
    ],
};
