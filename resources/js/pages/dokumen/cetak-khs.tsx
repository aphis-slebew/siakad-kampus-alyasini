import { Head } from '@inertiajs/react';
import { ArrowLeft, Printer, QrCode } from 'lucide-react';
import { KopSuratResmi } from '@/components/kop-surat-resmi';
import { Button } from '@/components/ui/button';

type MahasiswaData = {
    id: number;
    nim: string;
    nama_lengkap: string;
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

type KhsRow = {
    id: number;
    kode_mk: string;
    nama_mk: string;
    sks: number;
    nilai_angka?: number | null;
    nilai_huruf?: string | null;
    nilai_indeks?: number | null;
    bobot?: number | null;
};

type KhsData = {
    mahasiswa_id: number;
    tahun_ajaran_id: number;
    rows: KhsRow[];
    total_sks: number;
    total_bobot: number;
    ips: number;
    total_sks_kumulatif?: number;
    ipk_kumulatif?: number;
    max_sks_next_semester?: number;
};

export default function CetakKhs({
    mahasiswa,
    tahunAjaran,
    khsData,
    dosenWali,
    nomorDokumen,
}: {
    mahasiswa: MahasiswaData;
    tahunAjaran: { id: number; nama: string };
    khsData: KhsData;
    dosenWali?: { nama_lengkap: string; gelar_depan?: string; gelar_belakang?: string; nidn?: string } | null;
    nomorDokumen: string;
}) {
    const handlePrint = () => {
        window.print();
    };

    const rows: KhsRow[] = ((khsData as unknown as { items?: KhsRow[] })?.items || khsData?.rows || []) as KhsRow[];

    const formatDosenName = (d?: { nama_lengkap: string; gelar_depan?: string; gelar_belakang?: string } | null) => {
        if (!d) {
return '-';
}

        const depan = d.gelar_depan ? `${d.gelar_depan} ` : '';
        const belakang = d.gelar_belakang ? `, ${d.gelar_belakang}` : '';

        return `${depan}${d.nama_lengkap}${belakang}`;
    };

    const getMaxSksRecommendation = (ips: number) => {
        if (ips >= 3.0) {
return 24;
}

        if (ips >= 2.5) {
return 22;
}

        if (ips >= 2.0) {
return 20;
}

        return 18;
    };

    const maxSks = khsData.max_sks_next_semester || getMaxSksRecommendation(khsData.ips || 0);

    return (
        <>
            <Head title={`KHS - ${mahasiswa.nim} - ${mahasiswa.nama_lengkap}`} />

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
                        <span>Cetak Dokumen (PDF / Printer)</span>
                    </Button>
                </div>

                {/* Printable Document A4 Container */}
                <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 md:p-12 shadow-sm rounded-lg border border-border-default print:shadow-none print:border-none print:p-4 print:max-w-none">
                    <KopSuratResmi
                        title="Kartu Hasil Studi (KHS)"
                        subtitle={`Tahun Akademik: ${tahunAjaran?.nama || '2026/2027 Ganjil'}`}
                        nomorDokumen={nomorDokumen}
                    />

                    {/* Metadata Table */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs my-4 pb-2 border-b border-border-default">
                        <div className="space-y-1">
                            <div className="flex">
                                <span className="w-32 text-text-secondary">NIM</span>
                                <span className="font-mono font-semibold text-text-primary">: {mahasiswa.nim}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-text-secondary">Nama Mahasiswa</span>
                                <span className="font-semibold text-text-primary">: {mahasiswa.nama_lengkap}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-text-secondary">Fakultas</span>
                                <span>: {mahasiswa.program_studi?.fakultas?.nama || 'Tarbiyah'}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Program Studi</span>
                                <span>: {mahasiswa.program_studi?.jenjang} {mahasiswa.program_studi?.nama}</span>
                            </div>
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Dosen Wali (PA)</span>
                                <span>: {formatDosenName(dosenWali)}</span>
                            </div>
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Semester</span>
                                <span>: {tahunAjaran?.nama || 'Ganjil'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Grade Table */}
                    <div className="overflow-x-auto my-4">
                        <table className="w-full text-xs border-collapse border border-slate-900 min-w-[550px] sm:min-w-0">
                            <thead>
                                <tr className="bg-slate-100 text-slate-900 font-semibold border-b border-slate-900 text-center">
                                    <th className="border border-slate-900 p-2 w-8">No</th>
                                    <th className="border border-slate-900 p-2 w-24">Kode MK</th>
                                    <th className="border border-slate-900 p-2 text-left">Mata Kuliah</th>
                                    <th className="border border-slate-900 p-2 w-14">SKS (K)</th>
                                    <th className="border border-slate-900 p-2 w-16">Nilai Huruf</th>
                                    <th className="border border-slate-900 p-2 w-16">Indeks (N)</th>
                                    <th className="border border-slate-900 p-2 w-20">Bobot (K × N)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="border border-slate-900 p-4 text-center text-text-secondary italic">
                                            Nilai untuk semester ini belum dipublikasikan atau mahasiswa belum memprogram KRS.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row: KhsRow, idx: number) => (
                                        <tr key={row.id || idx} className="border-b border-slate-900">
                                            <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                                            <td className="border border-slate-900 p-2 font-mono text-center font-medium">
                                                {row.kode_mk || '-'}
                                            </td>
                                            <td className="border border-slate-900 p-2 font-medium">
                                                {row.nama_mk || '-'}
                                            </td>
                                            <td className="border border-slate-900 p-2 text-center font-semibold">
                                                {row.sks || 0}
                                            </td>
                                            <td className="border border-slate-900 p-2 text-center font-bold">
                                                {row.nilai_huruf || '-'}
                                            </td>
                                            <td className="border border-slate-900 p-2 text-center font-mono">
                                                {row.nilai_indeks !== undefined && row.nilai_indeks !== null ? Number(row.nilai_indeks).toFixed(2) : '-'}
                                            </td>
                                            <td className="border border-slate-900 p-2 text-center font-mono font-semibold">
                                                {row.bobot !== undefined && row.bobot !== null ? Number(row.bobot).toFixed(2) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-100 font-bold border-t border-slate-900">
                                    <td colSpan={3} className="border border-slate-900 p-2 text-right uppercase">
                                        Total SKS & Bobot Nilai :
                                    </td>
                                    <td className="border border-slate-900 p-2 text-center font-bold">
                                        {khsData.total_sks || 0}
                                    </td>
                                    <td colSpan={2} className="border border-slate-900 p-2"></td>
                                    <td className="border border-slate-900 p-2 text-center font-mono">
                                        {Number(khsData.total_bobot || 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Academic Performance Summary Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-900 p-3 bg-slate-50 my-4 rounded-xs">
                        <div>
                            <span className="text-text-secondary block text-[10px]">Indeks Prestasi Semester (IPS)</span>
                            <span className="text-base font-bold font-mono text-brand-primary">
                                {Number(khsData.ips || 0).toFixed(2)}
                            </span>
                        </div>
                        <div>
                            <span className="text-text-secondary block text-[10px]">Indeks Prestasi Kumulatif (IPK)</span>
                            <span className="text-base font-bold font-mono text-brand-primary-dark">
                                {Number(khsData.ipk_kumulatif || khsData.ips || 0).toFixed(2)}
                            </span>
                        </div>
                        <div>
                            <span className="text-text-secondary block text-[10px]">Total SKS Ditempuh</span>
                            <span className="text-base font-bold text-text-primary">
                                {khsData.total_sks_kumulatif || khsData.total_sks || 0} SKS
                            </span>
                        </div>
                        <div>
                            <span className="text-text-secondary block text-[10px]">Maks. Beban SKS Semester Depan</span>
                            <span className="text-base font-bold text-status-success">
                                {maxSks} SKS
                            </span>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="mt-8 grid grid-cols-2 gap-8 text-xs text-center">
                        <div className="space-y-16">
                            <div>
                                <p className="text-text-secondary">Dosen Pembimbing Akademik (Wali),</p>
                            </div>
                            <div>
                                <p className="font-semibold underline uppercase text-text-primary">
                                    {formatDosenName(dosenWali)}
                                </p>
                                <p className="font-mono text-[11px] text-text-secondary">NIDN: {dosenWali?.nidn || '-'}</p>
                            </div>
                        </div>

                        <div className="space-y-16">
                            <div>
                                <p className="text-text-secondary">Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-text-secondary">Pembantu Ketua I Bidang Akademik,</p>
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
                            <span>Dokumen ini sah dan diterbitkan secara digital oleh SIAKAD STAI Al-Yasini Pasuruan.</span>
                        </div>
                        <span className="font-mono">Verifikasi: {nomorDokumen}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
