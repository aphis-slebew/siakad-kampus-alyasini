import { Head } from '@inertiajs/react';
import { ArrowLeft, Printer, QrCode } from 'lucide-react';
import { KopSuratResmi } from '@/components/kop-surat-resmi';
import { Button } from '@/components/ui/button';

type MahasiswaData = {
    id: number;
    nim: string;
    nama_lengkap: string;
    nik?: string | null;
    tempat_lahir?: string | null;
    tanggal_lahir?: string | null;
    program_studi?: {
        id: number;
        kode: string;
        nama: string;
        jenjang: string;
        fakultas?: {
            nama: string;
        };
    };
};

type TranskripItem = {
    id: number;
    kode_mk: string;
    nama_mk: string;
    sks: number;
    nilai_huruf: string;
    nilai_indeks: number;
    bobot: number;
    semester: string;
};

export default function CetakTranskrip({
    mahasiswa,
    items = [],
    totalSks,
    ipk,
    predikat,
    nomorDokumen,
}: {
    mahasiswa: MahasiswaData;
    items: TranskripItem[];
    totalSks: number;
    ipk: number;
    predikat: string;
    nomorDokumen: string;
}) {
    const handlePrint = () => {
        window.print();
    };

    const totalBobot = items.reduce((acc, curr) => acc + (curr.bobot || 0), 0);

    return (
        <>
            <Head title={`Transkrip - ${mahasiswa.nim} - ${mahasiswa.nama_lengkap}`} />

            <div className="min-h-screen bg-surface-base py-6 font-sans text-text-primary print:bg-white print:py-0 print:m-0">
                {/* Action Bar (Hidden on Print) */}
                <div className="max-w-4xl mx-auto px-4 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 print:hidden">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="text-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Kembali</span>
                    </Button>

                    <Button
                        size="sm"
                        onClick={handlePrint}
                        className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Printer className="size-3.5" />
                        <span>Cetak Transkrip (PDF / Printer)</span>
                    </Button>
                </div>

                {/* Printable Document A4 Container */}
                <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 md:p-12 shadow-sm rounded-lg border border-border-default print:shadow-none print:border-none print:p-4 print:max-w-none">
                    <KopSuratResmi
                        title="Transkrip Akademik Sementara"
                        subtitle="Rekapitulasi Prestasi Hasil Belajar Mahasiswa"
                        nomorDokumen={nomorDokumen}
                    />

                    {/* Metadata Table */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs my-4 pb-2 border-b border-border-default">
                        <div className="space-y-1">
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Nama Lengkap</span>
                                <span className="font-semibold text-text-primary">: {mahasiswa.nama_lengkap}</span>
                            </div>
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Nomor Induk Mahasiswa</span>
                                <span className="font-mono font-semibold text-text-primary">: {mahasiswa.nim}</span>
                            </div>
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Tempat / Tgl Lahir</span>
                                <span>
                                    : {mahasiswa.tempat_lahir || 'Pasuruan'}, {mahasiswa.tanggal_lahir ? new Date(mahasiswa.tanggal_lahir).toLocaleDateString('id-ID') : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex">
                                <span className="w-32 text-text-secondary">Fakultas</span>
                                <span>: {mahasiswa.program_studi?.fakultas?.nama || 'Tarbiyah'}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-text-secondary">Program Studi</span>
                                <span>: {mahasiswa.program_studi?.nama}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-text-secondary">Jenjang Pendidikan</span>
                                <span>: {mahasiswa.program_studi?.jenjang} (Strata 1)</span>
                            </div>
                        </div>
                    </div>

                    {/* Cumulative Grades Table */}
                    <div className="overflow-x-auto my-4">
                        <table className="w-full text-xs border-collapse border border-slate-900 min-w-[550px] sm:min-w-0">
                            <thead>
                                <tr className="bg-slate-100 text-slate-900 font-semibold border-b border-slate-900 text-center">
                                    <th className="border border-slate-900 p-1.5 w-8">No</th>
                                    <th className="border border-slate-900 p-1.5 w-20">Kode MK</th>
                                    <th className="border border-slate-900 p-1.5 text-left">Mata Kuliah</th>
                                    <th className="border border-slate-900 p-1.5 w-12">SKS (K)</th>
                                    <th className="border border-slate-900 p-1.5 w-14">Nilai (HM)</th>
                                    <th className="border border-slate-900 p-1.5 w-14">Angka (AM)</th>
                                    <th className="border border-slate-900 p-1.5 w-16">Mutu (M)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="border border-slate-900 p-4 text-center text-text-secondary italic">
                                            Belum ada data nilai matakuliah yang terpublikasi.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, idx) => (
                                        <tr key={item.id || idx} className="border-b border-slate-900">
                                            <td className="border border-slate-900 p-1.5 text-center">{idx + 1}</td>
                                            <td className="border border-slate-900 p-1.5 font-mono text-center font-medium">
                                                {item.kode_mk}
                                            </td>
                                            <td className="border border-slate-900 p-1.5 font-medium">
                                                {item.nama_mk}
                                            </td>
                                            <td className="border border-slate-900 p-1.5 text-center font-semibold">
                                                {item.sks}
                                            </td>
                                            <td className="border border-slate-900 p-1.5 text-center font-bold">
                                                {item.nilai_huruf || '-'}
                                            </td>
                                            <td className="border border-slate-900 p-1.5 text-center font-mono">
                                                {item.nilai_indeks !== null && item.nilai_indeks !== undefined ? Number(item.nilai_indeks).toFixed(2) : '-'}
                                            </td>
                                            <td className="border border-slate-900 p-1.5 text-center font-mono font-semibold">
                                                {item.bobot !== null && item.bobot !== undefined ? Number(item.bobot).toFixed(2) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-100 font-bold border-t border-slate-900">
                                    <td colSpan={3} className="border border-slate-900 p-1.5 text-right uppercase">
                                        Total Kumulatif :
                                    </td>
                                    <td className="border border-slate-900 p-1.5 text-center">
                                        {totalSks}
                                    </td>
                                    <td colSpan={2} className="border border-slate-900 p-1.5"></td>
                                    <td className="border border-slate-900 p-1.5 text-center font-mono">
                                        {Number(totalBobot).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Performance Summary Box */}
                    <div className="grid grid-cols-3 gap-2 text-xs border border-slate-900 p-3 bg-slate-50 my-4">
                        <div>
                            <span className="text-text-secondary block text-[10px]">Total SKS Lulus</span>
                            <span className="text-sm font-bold text-text-primary">{totalSks} SKS</span>
                        </div>
                        <div>
                            <span className="text-text-secondary block text-[10px]">Indeks Prestasi Kumulatif (IPK)</span>
                            <span className="text-sm font-bold font-mono text-brand-primary">{Number(ipk).toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-text-secondary block text-[10px]">Predikat Kelulusan</span>
                            <span className="text-sm font-bold text-brand-primary-dark">{predikat}</span>
                        </div>
                    </div>

                    {/* Official Signatures */}
                    <div className="mt-8 grid grid-cols-2 gap-8 text-xs text-center">
                        <div className="space-y-16">
                            <div>
                                <p className="text-text-secondary">Mengetahui,</p>
                                <p className="text-text-secondary font-semibold">Ketua STAI Al-Yasini Pasuruan,</p>
                            </div>
                            <div>
                                <p className="font-semibold underline uppercase text-text-primary">
                                    Dr. K.H. A. Mujib Imron, S.H., M.H.
                                </p>
                                <p className="font-mono text-[11px] text-text-secondary">NIDN: 2101016501</p>
                            </div>
                        </div>

                        <div className="space-y-16">
                            <div>
                                <p className="text-text-secondary">Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-text-secondary font-semibold">Pembantu Ketua I Bidang Akademik,</p>
                            </div>
                            <div>
                                <p className="font-semibold underline uppercase text-text-primary">
                                    Dr. H. Ahmad Fauzi, M.Pd.I
                                </p>
                                <p className="font-mono text-[11px] text-text-secondary">NIDN: 2108098201</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Footnote */}
                    <div className="mt-8 pt-3 border-t border-border-default flex items-center justify-between text-[10px] text-text-secondary">
                        <div className="flex items-center gap-1.5">
                            <QrCode className="size-4 text-brand-primary" />
                            <span>Transkrip akademik sementara ini sah diterbitkan oleh Bagian Administrasi Akademik (BAA) STAI Al-Yasini.</span>
                        </div>
                        <span className="font-mono">Verifikasi: {nomorDokumen}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
