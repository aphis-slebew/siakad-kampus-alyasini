import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateIndonesian } from '@/lib/utils';

type Yudisium = {
    id: number;
    ipk_akhir: string;
    nomor_dokumen: string;
    created_at: string;
    mahasiswa?: {
        nama_lengkap: string;
        nim: string;
        program_studi?: {
            nama: string;
            jenjang: string;
            fakultas?: { nama: string };
        };
    };
    periode_wisuda?: {
        nama: string;
        tanggal_wisuda: string;
    };
};

export default function YudisiumSertifikatPage({ yudisium }: { yudisium: Yudisium }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:bg-white print:p-0">
            <Head title={`Sertifikat Yudisium - ${yudisium.mahasiswa?.nama_lengkap || 'Mahasiswa'}`} />

            <div className="mx-auto max-w-4xl space-y-4 print:space-y-0">
                <div className="flex justify-end print:hidden">
                    <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700">
                        <Printer className="mr-2 h-4 w-4" /> Cetak / Download PDF
                    </Button>
                </div>

                <div className="rounded-xl border border-slate-300 bg-white p-8 shadow-lg print:border-none print:shadow-none print:p-6">
                    {/* Kop Surat Resmi */}
                    <div className="border-b-4 border-double border-emerald-800 pb-4 text-center">
                        <h2 className="text-xl font-bold uppercase tracking-wide text-emerald-900">STAI AL-YASINI PASURUAN</h2>
                        <p className="text-sm font-semibold uppercase text-slate-700">
                            {yudisium.mahasiswa?.program_studi?.fakultas?.nama || 'FAKULTAS TARBIYAH'}
                        </p>
                        <p className="text-xs text-slate-500">Jl. Raya Kraton No. 01, Ngabar, Kraton, Pasuruan, Jawa Timur 67151</p>
                    </div>

                    {/* Judul Dokumen */}
                    <div className="my-8 text-center space-y-1">
                        <h1 className="text-2xl font-extrabold uppercase tracking-widest text-slate-900">SURAT KETERANGAN YUDISIUM</h1>
                        <p className="font-mono text-sm font-semibold text-emerald-700">Nomor: {yudisium.nomor_dokumen}</p>
                    </div>

                    {/* Isi Dokumen */}
                    <div className="space-y-6 text-sm text-slate-800">
                        <p>Dewan Senat Akademik STAI Al-Yasini Pasuruan dengan ini menyatakan bahwa:</p>

                        <div className="mx-auto max-w-2xl space-y-2 rounded-lg border bg-slate-50 p-4 font-sans print:bg-white">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="font-semibold text-slate-600">Nama Mahasiswa</span>
                                <span className="col-span-2 font-bold text-slate-900">{yudisium.mahasiswa?.nama_lengkap}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="font-semibold text-slate-600">NIM</span>
                                <span className="col-span-2 font-mono font-semibold text-slate-900">{yudisium.mahasiswa?.nim}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="font-semibold text-slate-600">Program Studi</span>
                                <span className="col-span-2 font-semibold text-slate-900">
                                    {yudisium.mahasiswa?.program_studi?.jenjang} - {yudisium.mahasiswa?.program_studi?.nama}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="font-semibold text-slate-600">Indeks Prestasi Kumulatif (IPK)</span>
                                <span className="col-span-2 text-base font-bold text-emerald-700">{yudisium.ipk_akhir} / 4.00</span>
                            </div>
                        </div>

                        <p className="leading-relaxed">
                            Telah memenuhi seluruh persyaratan akademik, administratif, dan keuangan, serta dinyatakan <strong>LULUS (YUDISIUM)</strong> dengan hak menyandang gelar sarjana dan diikutsertakan pada <strong>{yudisium.periode_wisuda?.nama || 'Wisuda Resmi'}</strong> tanggal <strong>{formatDateIndonesian(yudisium.periode_wisuda?.tanggal_wisuda)}</strong>.
                        </p>
                    </div>

                    {/* Tanda Tangan */}
                    <div className="mt-16 grid grid-cols-2 text-center text-sm text-slate-800">
                        <div></div>
                        <div className="space-y-16">
                            <div>
                                <p>Pasuruan, {formatDateIndonesian(yudisium.created_at)}</p>
                                <p className="font-semibold">Ketua STAI Al-Yasini Pasuruan,</p>
                            </div>
                            <div>
                                <p className="font-bold underline text-slate-900">Dr. KH. A. Mujib Imron, SH., MH.</p>
                                <p className="text-xs text-slate-500">NIP. 197001012000031001</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
