import { Head, Link, useForm, router } from '@inertiajs/react';
import { Search, Receipt, Printer, CheckCircle, Clock, AlertCircle, PlusCircle, CreditCard, User, Sparkles, Building } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

interface Mahasiswa {
    id: number;
    nim: string;
    nama_lengkap: string;
    tahun_masuk: number;
    status_mahasiswa: string;
    program_studi?: {
        id: number;
        nama: string;
    };
    beasiswa_mahasiswas?: Array<{
        id: number;
        status: string;
        jenis_beasiswa?: {
            nama: string;
        };
    }>;
}

interface Tagihan {
    id: number;
    jenis: string;
    nominal: string | number;
    jatuh_tempo: string | null;
    status: string;
    tahun_ajaran?: {
        id: number;
        nama: string;
    };
}

interface Pembayaran {
    id: number;
    kode_transaksi: string;
    metode_pembayaran: string;
    nominal: string | number;
    status: string;
    created_at: string;
    tagihan?: {
        id: number;
        jenis: string;
        tahun_ajaran?: {
            nama: string;
        };
        mahasiswa?: {
            nim: string;
            nama_lengkap: string;
            program_studi?: {
                nama: string;
            };
        };
    };
}

interface TahunAjaran {
    id: number;
    nama: string;
    is_active: boolean;
}

interface ProgramStudi {
    id: number;
    kode: string;
    nama: string;
}

interface KomponenBiaya {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
    nominal: string | number;
}

interface Props {
    selectedMahasiswa: Mahasiswa | null;
    tagihans: Tagihan[];
    recentPayments: Pembayaran[];
    tahunAjarans: TahunAjaran[];
    programStudis: ProgramStudi[];
    komponens: KomponenBiaya[];
    searchedNim: string;
}

const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export default function KasirIndex({
    selectedMahasiswa,
    tagihans,
    recentPayments,
    tahunAjarans,
    programStudis,
    komponens,
    searchedNim,
}: Props) {
    const [nimInput, setNimInput] = useState(searchedNim);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isGenerateMassalOpen, setIsGenerateMassalOpen] = useState(false);
    const [selectedTagihan, setSelectedTagihan] = useState<Tagihan | null>(null);

    // Payment Form
    const paymentForm = useForm({
        tagihan_id: 0,
        nominal_bayar: '',
        metode_pembayaran: 'tunai',
        catatan: 'Pembayaran langsung di Kasir TU',
    });

    // Bulk Generator Form
    const massalForm = useForm({
        tahun_ajaran_id: tahunAjarans.find((t) => t.is_active)?.id || (tahunAjarans[0]?.id ?? ''),
        komponen_biaya_id: komponens[0]?.id ?? '',
        program_studi_id: 'all',
        angkatan: '',
        jatuh_tempo: defaultDueDate,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (nimInput.trim()) {
            router.get(`/keuangan/kasir?nim=${encodeURIComponent(nimInput.trim())}`);
        }
    };

    const openPayModal = (tagihan: Tagihan) => {
        setSelectedTagihan(tagihan);
        paymentForm.setData({
            tagihan_id: tagihan.id,
            nominal_bayar: String(tagihan.nominal),
            metode_pembayaran: 'tunai',
            catatan: `Pembayaran ${tagihan.jenis.toUpperCase()} di Kasir TU`,
        });
        setIsPaymentModalOpen(true);
    };

    const handleProcessPayment = (e: React.FormEvent) => {
        e.preventDefault();
        paymentForm.post('/keuangan/kasir/bayar', {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
            },
        });
    };

    const handleGenerateMassal = (e: React.FormEvent) => {
        e.preventDefault();
        massalForm.post('/keuangan/kasir/generate-massal', {
            onSuccess: () => setIsGenerateMassalOpen(false),
        });
    };

    const formatRupiah = (val: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(val));
    };

    return (
        <>
            <Head title="Kasir Pembayaran POS & Tagihan TU" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header & Sub-Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
                            <Receipt className="size-6 text-brand-primary" />
                            <span>Kasir Pembayaran & Billing POS</span>
                        </h1>
                        <p className="text-sm text-text-secondary mt-1">
                            Layanan pembayaran langsung di loket TU, cetak kuitansi resmi, dan generator tagihan massal otomatis.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsGenerateMassalOpen(true)}
                        size="sm"
                        className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <PlusCircle className="size-3.5" />
                        <span>Generate Tagihan Massal</span>
                    </Button>
                </div>

                {/* Sub-nav tabs */}
                <div className="flex items-center gap-2 border-b border-border-default pb-2 overflow-x-auto whitespace-nowrap text-xs font-medium">
                    <Link
                        href="/keuangan/kasir"
                        className="px-3 py-1.5 rounded-md bg-brand-primary/10 text-brand-primary font-semibold"
                    >
                        Kasir Pembayaran POS
                    </Link>
                    <Link
                        href="/keuangan/komponen-biaya"
                        className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    >
                        Tarif Komponen Biaya
                    </Link>
                    <Link
                        href="/keuangan/kelompok-ukt"
                        className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    >
                        Kelompok UKT
                    </Link>
                    <Link
                        href="/keuangan/pembayaran"
                        className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    >
                        Verifikasi Transfer Bank
                    </Link>
                    <Link
                        href="/keuangan/periode-registrasi"
                        className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    >
                        Periode Registrasi
                    </Link>
                </div>

                {/* Cashier Search Box */}
                <Card className="border border-border-default shadow-xs bg-linear-to-r from-surface-base to-emerald-50/20">
                    <CardContent className="p-4 sm:p-6">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
                                <Input
                                    value={nimInput}
                                    onChange={(e) => setNimInput(e.target.value)}
                                    placeholder="Ketik Nomor Induk Mahasiswa (NIM) atau Scan Barcode Kartu Mahasiswa..."
                                    className="pl-9 text-sm h-10 font-mono"
                                    autoFocus
                                />
                            </div>
                            <Button type="submit" className="bg-brand-primary text-white h-10 text-xs px-6 font-semibold">
                                Cari Mahasiswa
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Selected Student Profile & Bills (If Found) */}
                {selectedMahasiswa ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Student Biodata Card */}
                        <Card className="border border-border-default shadow-xs">
                            <CardHeader className="p-4 sm:p-5 border-b border-border-default pb-3">
                                <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                    <User className="size-4 text-brand-primary" />
                                    <span>Identitas Mahasiswa</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-5 space-y-3 text-xs">
                                <div>
                                    <span className="text-text-secondary block">Nama Lengkap:</span>
                                    <span className="font-bold text-text-primary text-sm">{selectedMahasiswa.nama_lengkap}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-text-secondary block">NIM:</span>
                                        <span className="font-mono font-semibold text-text-primary">{selectedMahasiswa.nim}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-secondary block">Angkatan:</span>
                                        <span className="font-semibold text-text-primary">{selectedMahasiswa.tahun_masuk}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-text-secondary block">Program Studi:</span>
                                    <span className="font-semibold text-text-primary">{selectedMahasiswa.program_studi?.nama}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary block">Status Mahasiswa:</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                                        {selectedMahasiswa.status_mahasiswa}
                                    </span>
                                </div>

                                {/* Scholarship Badges if Any */}
                                {selectedMahasiswa.beasiswa_mahasiswas && selectedMahasiswa.beasiswa_mahasiswas.filter(b => b.status === 'aktif').length > 0 && (
                                    <div className="pt-2 border-t border-border-default">
                                        <span className="text-text-secondary block mb-1">Beasiswa Aktif:</span>
                                        {selectedMahasiswa.beasiswa_mahasiswas.filter(b => b.status === 'aktif').map(b => (
                                            <div key={b.id} className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5 font-medium">
                                                <Sparkles className="size-3.5 text-amber-600 shrink-0" />
                                                <span>Penerima {b.jenis_beasiswa?.nama || 'Beasiswa'} (Potongan Tagihan Otomatis)</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Student Bills List (2 Columns on Large Screens) */}
                        <Card className="border border-border-default shadow-xs lg:col-span-2">
                            <CardHeader className="p-4 sm:p-5 border-b border-border-default pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-semibold text-text-primary">
                                        Daftar Tagihan Biaya Mahasiswa
                                    </CardTitle>
                                    <CardDescription className="text-xs text-text-secondary">
                                        Pilih tagihan yang ingin dibayar langsung di loket kasir.
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-surface-base border-b border-border-default text-text-secondary font-medium uppercase tracking-wider">
                                                <th className="p-3">Semester</th>
                                                <th className="p-3">Jenis Biaya</th>
                                                <th className="p-3 text-right">Nominal</th>
                                                <th className="p-3 text-center">Jatuh Tempo</th>
                                                <th className="p-3 text-center">Status</th>
                                                <th className="p-3 text-center">Aksi Kasir</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-default">
                                            {tagihans.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="p-6 text-center text-text-secondary italic">
                                                        Tidak ada catatan tagihan untuk mahasiswa ini.
                                                    </td>
                                                </tr>
                                            ) : (
                                                tagihans.map((t) => (
                                                    <tr key={t.id} className="hover:bg-surface-hover">
                                                        <td className="p-3 font-medium text-text-primary">{t.tahun_ajaran?.nama}</td>
                                                        <td className="p-3 font-semibold uppercase text-text-primary">{t.jenis}</td>
                                                        <td className="p-3 text-right font-mono font-semibold text-text-primary">
                                                            {formatRupiah(t.nominal)}
                                                        </td>
                                                        <td className="p-3 text-center text-text-secondary">
                                                            {t.jatuh_tempo ? new Date(t.jatuh_tempo).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {t.status === 'lunas' ? (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center justify-center gap-1">
                                                                    <CheckCircle className="size-3" /> Lunas
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 flex items-center justify-center gap-1">
                                                                    <Clock className="size-3" /> Belum Lunas
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {t.status === 'lunas' ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => window.print()}
                                                                    className="h-7 text-[11px] flex items-center gap-1"
                                                                >
                                                                    <Printer className="size-3" />
                                                                    <span>Kuitansi</span>
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => openPayModal(t)}
                                                                    className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                                                                >
                                                                    <CreditCard className="size-3" />
                                                                    <span>Bayar Sekarang</span>
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : searchedNim ? (
                    <Card className="border border-red-200 bg-red-50 p-6 text-center text-red-800 text-sm">
                        <AlertCircle className="size-8 mx-auto text-red-500 mb-2" />
                        <p className="font-semibold">Mahasiswa dengan NIM "{searchedNim}" tidak ditemukan.</p>
                        <p className="text-xs text-red-600 mt-1">Pastikan NIM yang diinput sudah benar dan terdaftar di sistem.</p>
                    </Card>
                ) : null}

                {/* Recent Payments Log Table */}
                <Card className="border border-border-default shadow-xs overflow-hidden">
                    <CardHeader className="p-4 sm:p-5 border-b border-border-default pb-3">
                        <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
                            <Clock className="size-4 text-brand-primary" />
                            <span>Riwayat Transaksi Kasir Terbaru (15 Transaksi Terakhir)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-surface-base border-b border-border-default text-text-secondary font-medium uppercase tracking-wider">
                                        <th className="p-3 w-12 text-center">No</th>
                                        <th className="p-3">No. Transaksi</th>
                                        <th className="p-3">Mahasiswa</th>
                                        <th className="p-3">Jenis Biaya & Semester</th>
                                        <th className="p-3 text-right">Nominal Bayar</th>
                                        <th className="p-3 text-center">Metode</th>
                                        <th className="p-3 text-center">Waktu Transaksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default">
                                    {recentPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-6 text-center text-text-secondary italic">
                                                Belum ada riwayat transaksi kasir.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentPayments.map((p, idx) => (
                                            <tr key={p.id} className="hover:bg-surface-hover">
                                                <td className="p-3 text-center text-text-secondary font-mono">{idx + 1}</td>
                                                <td className="p-3 font-mono font-semibold text-text-primary">{p.kode_transaksi}</td>
                                                <td className="p-3">
                                                    <span className="font-semibold text-text-primary block">
                                                        {p.tagihan?.mahasiswa?.nama_lengkap || '-'}
                                                    </span>
                                                    <span className="text-[11px] text-text-secondary block font-mono">
                                                        {p.tagihan?.mahasiswa?.nim} ({p.tagihan?.mahasiswa?.program_studi?.nama})
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className="font-semibold uppercase text-text-primary block">
                                                        {p.tagihan?.jenis}
                                                    </span>
                                                    <span className="text-[11px] text-text-secondary block">
                                                        {p.tagihan?.tahun_ajaran?.nama}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-mono font-semibold text-emerald-700">
                                                    {formatRupiah(p.nominal)}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-800">
                                                        {p.metode_pembayaran}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center text-text-secondary font-mono text-[11px]">
                                                    {new Date(p.created_at).toLocaleString('id-ID', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Direct Payment Modal */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Proses Pembayaran Kasir</DialogTitle>
                        <DialogDescription>
                            Input nominal yang diterima dan metode pembayaran.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTagihan && (
                        <form onSubmit={handleProcessPayment} className="space-y-4 pt-2">
                            <div className="p-3 rounded-lg bg-surface-base border border-border-default space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Mahasiswa:</span>
                                    <span className="font-semibold text-text-primary">{selectedMahasiswa?.nama_lengkap} ({selectedMahasiswa?.nim})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Tagihan:</span>
                                    <span className="font-semibold text-text-primary uppercase">{selectedTagihan.jenis} ({selectedTagihan.tahun_ajaran?.nama})</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-border-default font-semibold text-sm text-emerald-700">
                                    <span>Total Tagihan:</span>
                                    <span className="font-mono">{formatRupiah(selectedTagihan.nominal)}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Nominal yang Dibayarkan (Rp)</Label>
                                <Input
                                    type="number"
                                    value={paymentForm.data.nominal_bayar}
                                    onChange={(e) => paymentForm.setData('nominal_bayar', e.target.value)}
                                    className="h-9 font-mono font-bold text-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Metode Pembayaran</Label>
                                <select
                                    value={paymentForm.data.metode_pembayaran}
                                    onChange={(e) => paymentForm.setData('metode_pembayaran', e.target.value)}
                                    className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                                >
                                    <option value="tunai">Tunai / Cash di Loket TU</option>
                                    <option value="transfer">Transfer Bank Instan</option>
                                    <option value="qris">QRIS Kampus</option>
                                    <option value="edc">Mesin Gesek EDC / Kartu Debit</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Catatan Pembayaran (Opsional)</Label>
                                <Input
                                    value={paymentForm.data.catatan}
                                    onChange={(e) => paymentForm.setData('catatan', e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsPaymentModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" size="sm" disabled={paymentForm.processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                                    {paymentForm.processing ? 'Memproses...' : 'Konfirmasi & Cetak Kuitansi'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Bulk Generate Bills Modal */}
            <Dialog open={isGenerateMassalOpen} onOpenChange={setIsGenerateMassalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Generate Tagihan Massal Mahasiswa</DialogTitle>
                        <DialogDescription>
                            Buat tagihan biaya serentak untuk mahasiswa aktif berdasarkan semester, prodi, dan angkatan (dengan pembebasan beasiswa otomatis).
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleGenerateMassal} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Tahun Ajaran / Semester Target</Label>
                            <select
                                value={massalForm.data.tahun_ajaran_id}
                                onChange={(e) => massalForm.setData('tahun_ajaran_id', Number(e.target.value))}
                                className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                            >
                                {tahunAjarans.map((t) => (
                                    <option key={t.id} value={t.id}>{t.nama} {t.is_active ? '(Aktif)' : ''}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Pilih Komponen Biaya</Label>
                            <select
                                value={massalForm.data.komponen_biaya_id}
                                onChange={(e) => massalForm.setData('komponen_biaya_id', Number(e.target.value))}
                                className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                            >
                                {komponens.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.nama} ({k.kode}) - {formatRupiah(k.nominal)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Filter Program Studi</Label>
                                <select
                                    value={massalForm.data.program_studi_id}
                                    onChange={(e) => massalForm.setData('program_studi_id', e.target.value)}
                                    className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                                >
                                    <option value="all">Semua Program Studi</option>
                                    {programStudis.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nama}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Filter Angkatan (Tahun Masuk)</Label>
                                <Input
                                    type="number"
                                    value={massalForm.data.angkatan}
                                    onChange={(e) => massalForm.setData('angkatan', e.target.value)}
                                    placeholder="Semua Angkatan"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Batas Tanggal Jatuh Tempo</Label>
                            <Input
                                type="date"
                                value={massalForm.data.jatuh_tempo}
                                onChange={(e) => massalForm.setData('jatuh_tempo', e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div className="p-3 rounded bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
                            <Sparkles className="size-4 text-blue-600 shrink-0 mt-0.5" />
                            <span>
                                <strong>Sinkronisasi Beasiswa:</strong> Mahasiswa yang memiliki status beasiswa aktif pada kategori akademik akan otomatis dibebaskan / nominal Rp 0 (langsung lunas).
                            </span>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsGenerateMassalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" size="sm" disabled={massalForm.processing} className="bg-brand-primary text-white">
                                {massalForm.processing ? 'Memproses Tagihan...' : 'Mulai Generate Tagihan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

KasirIndex.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Keuangan', href: '/keuangan/kasir' },
        { title: 'Kasir POS & Tagihan', href: '/keuangan/kasir' },
    ],
};

