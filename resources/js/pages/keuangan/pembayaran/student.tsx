import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, CreditCard, Upload } from 'lucide-react';
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

import { formatDateIndonesian } from '@/lib/utils';

type Pembayaran = {

    id: number;
    tanggal_bayar: string;
    nominal_dibayar: number;
    status_verifikasi: string;
};

type Cicilan = {
    id: number;
    cicilan_ke: number;
    nominal: number;
    jatuh_tempo: string;
    status: string;
};

type Tagihan = {
    id: number;
    jenis: string;
    nominal: number;
    jatuh_tempo: string;
    status: string;
    tahun_ajaran?: { nama: string };
    pembayarans?: Pembayaran[];
    cicilan_tagihans?: Cicilan[];
};

type Mahasiswa = {
    id: number;
    nama_lengkap: string;
    nim: string;
};

export default function StudentPaymentIndex({
    mahasiswa,
    tagihans = [],
}: {
    mahasiswa: Mahasiswa | null;
    tagihans: Tagihan[];
}) {
    const [selectedTagihan, setSelectedTagihan] = useState<Tagihan | null>(null);
    const [selectedCicilanTagihan, setSelectedCicilanTagihan] = useState<Tagihan | null>(null);

    const uploadForm = useForm({
        tagihan_id: 0,
        tanggal_bayar: new Date().toISOString().split('T')[0],
        nominal_dibayar: 0,
        bukti_file: null as File | null,
    });

    const cicilanForm = useForm({
        jumlah_cicilan: 2,
    });

    const openUploadModal = (item: Tagihan) => {
        setSelectedTagihan(item);
        uploadForm.setData({
            tagihan_id: item.id,
            tanggal_bayar: new Date().toISOString().split('T')[0],
            nominal_dibayar: Number(item.nominal),
            bukti_file: null,
        });
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post('/keuangan/bayar', {
            onSuccess: () => {
                setSelectedTagihan(null);
                uploadForm.reset();
            },
        });
    };

    const handleCicilanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCicilanTagihan) return;

        cicilanForm.post(`/keuangan/tagihan/${selectedCicilanTagihan.id}/cicilan`, {
            onSuccess: () => {
                setSelectedCicilanTagihan(null);
                cicilanForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="Pembayaran UKT & Tagihan Saya" />

            <div className="p-6 space-y-6 font-sans">
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">Pembayaran UKT & Tagihan Mahasiswa</h1>
                    <p className="text-xs text-text-secondary mt-0.5">
                        Unggah bukti transfer pembayaran manual UKT atau ajukan skema cicilan resmi.
                    </p>
                </div>

                {/* Account Summary Banner */}
                {mahasiswa && (
                    <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                        <div>
                            <span className="text-text-secondary text-[11px] block">Mahasiswa Terdaftar:</span>
                            <span className="font-semibold text-text-primary text-sm">{mahasiswa.nama_lengkap}</span>
                            <span className="font-mono text-text-secondary block">NIM: {mahasiswa.nim}</span>
                        </div>
                        <div className="bg-surface-card border border-border-default p-3 rounded-md font-mono text-xs">
                            <span className="text-text-secondary text-[11px] block">Nomor Rekening Pembayaran Resmi Kampus:</span>
                            <span className="font-bold text-brand-primary">Bank Syariah Indonesia (BSI): 7123-4567-89</span>
                            <span className="text-text-secondary text-[11px] block mt-0.5">a.n. STAI Al-Yasini Pasuruan</span>
                        </div>
                    </div>
                )}

                {/* List of Tagihan */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-text-primary">Daftar Tagihan Semester Saya</h2>

                    {tagihans.length === 0 ? (
                        <div className="p-12 text-center border border-border-default rounded-lg bg-surface-card">
                            <CreditCard className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Tidak Ada Tagihan Aktif</h3>
                            <p className="text-xs text-text-secondary mt-1">
                                Anda belum memiliki tagihan UKT atau Her-Registrasi aktif untuk semester ini.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tagihans.map((tagihan) => (
                                <div
                                    key={tagihan.id}
                                    className="bg-surface-card border border-border-default rounded-lg p-5 shadow-xs space-y-4 flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-brand-primary uppercase">
                                                {tagihan.jenis.replace('_', ' ')} — {tagihan.tahun_ajaran?.nama}
                                            </span>
                                            {tagihan.status === 'lunas' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-success/10 text-status-success border border-status-success/20">
                                                    <CheckCircle2 className="size-3" />
                                                    Lunas
                                                </span>
                                            )}
                                            {tagihan.status === 'dicicil' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-warning/10 text-status-warning border border-status-warning/20">
                                                    Skema Cicilan
                                                </span>
                                            )}
                                            {tagihan.status === 'belum_bayar' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-danger/10 text-status-danger border border-status-danger/20">
                                                    <AlertCircle className="size-3" />
                                                    Belum Bayar
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-text-secondary text-[11px] block">Total Nominal Tagihan:</span>
                                            <span className="text-xl font-bold font-mono text-text-primary">
                                                Rp {Number(tagihan.nominal).toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-text-secondary text-[11px] block font-mono">
                                                Jatuh Tempo: {formatDateIndonesian(tagihan.jatuh_tempo)}
                                            </span>

                                        </div>

                                        {/* Status Riwayat Upload Pembayaran */}
                                        {tagihan.pembayarans && tagihan.pembayarans.length > 0 && (
                                            <div className="bg-surface-base p-3 rounded-md border border-border-default space-y-1 text-xs">
                                                <span className="font-semibold text-text-primary text-[11px] block">Riwayat Upload Bukti Transfer:</span>
                                                {tagihan.pembayarans.map((p) => (
                                                    <div key={p.id} className="flex justify-between items-center text-[11px]">
                                                        <span>Rp {Number(p.nominal_dibayar).toLocaleString('id-ID')}</span>
                                                        <span className="capitalize font-semibold text-brand-primary">[{p.status_verifikasi}]</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Skema Cicilan info */}
                                        {tagihan.cicilan_tagihans && tagihan.cicilan_tagihans.length > 0 && (
                                            <div className="bg-surface-base p-3 rounded-md border border-border-default space-y-1 text-xs">
                                                <span className="font-semibold text-text-primary text-[11px] block">Rincian Skema Cicilan:</span>
                                                {tagihan.cicilan_tagihans.map((c) => (
                                                    <div key={c.id} className="flex justify-between items-center text-[11px] font-mono">
                                                        <span>Cicilan {c.cicilan_ke}: Rp {Number(c.nominal).toLocaleString('id-ID')}</span>
                                                        <span className="capitalize font-semibold">{c.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 flex items-center gap-2 border-t border-border-default">
                                        {tagihan.status !== 'lunas' && (
                                            <>
                                                <Button
                                                    onClick={() => openUploadModal(tagihan)}
                                                    className="flex-1 bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold py-2 rounded-md inline-flex items-center justify-center gap-1.5"
                                                >
                                                    <Upload className="size-3.5" />
                                                    Upload Bukti Bayar
                                                </Button>

                                                {tagihan.status === 'belum_bayar' && (
                                                    <Button
                                                        onClick={() => setSelectedCicilanTagihan(tagihan)}
                                                        variant="outline"
                                                        className="border-border-default text-text-primary text-xs font-semibold py-2 rounded-md"
                                                    >
                                                        Ajukan Cicilan
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Upload Bukti Transfer */}
            <Dialog open={!!selectedTagihan} onOpenChange={(open) => !open && setSelectedTagihan(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Upload Bukti Transfer Pembayaran</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Unggah resi/bukti transfer manual (JPG, PNG, PDF Max 2MB).
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUploadSubmit} className="space-y-4 py-2" encType="multipart/form-data">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Tanggal Transfer <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={uploadForm.data.tanggal_bayar}
                                onChange={(e) => uploadForm.setData('tanggal_bayar', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Nominal Dibayar (Rp) <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                type="number"
                                min={10000}
                                value={uploadForm.data.nominal_dibayar}
                                onChange={(e) => uploadForm.setData('nominal_dibayar', Number(e.target.value))}
                                className="text-xs border-border-default focus-visible:ring-brand-primary font-mono"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                File Bukti Transfer (JPG/PNG/PDF Max 2MB) <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => uploadForm.setData('bukti_file', e.target.files?.[0] || null)}
                                className="text-xs border-border-default"
                            />
                            {uploadForm.errors.bukti_file && (
                                <p className="text-[11px] text-status-danger">{uploadForm.errors.bukti_file}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedTagihan(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={uploadForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                {uploadForm.processing ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Ajukan Cicilan */}
            <Dialog open={!!selectedCicilanTagihan} onOpenChange={(open) => !open && setSelectedCicilanTagihan(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Ajukan Skema Cicilan Tagihan</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Pilih jumlah tahap cicilan pembayaran UKT.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCicilanSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Tahap Cicilan <span className="text-status-danger">*</span>
                            </Label>
                            <select
                                value={cicilanForm.data.jumlah_cicilan}
                                onChange={(e) => cicilanForm.setData('jumlah_cicilan', Number(e.target.value))}
                                className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                            >
                                <option value={2}>2 Kali Cicilan (50% + 50%)</option>
                                <option value={3}>3 Kali Cicilan (33.3% x 3)</option>
                                <option value={4}>4 Kali Cicilan (25% x 4)</option>
                            </select>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedCicilanTagihan(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={cicilanForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                Simpan Skema Cicilan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

StudentPaymentIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Keuangan', href: '#' },
        { title: 'Pembayaran Saya', href: '/keuangan/bayar' },
    ],
};
