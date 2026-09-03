import { usePage } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';

interface PerguruanTinggiShared {
    nama_unit?: string;
    nama_singkat?: string;
    lembaga_naungan?: string;
    peringkat_akreditasi?: string;
    lembaga_akreditasi?: string;
    no_sk_pendirian?: string;
    no_sk_akreditasi?: string;
    alamat?: string;
    website?: string;
    email?: string;
    telepon?: string;
}

export function KopSuratResmi({
    title,
    subtitle,
    nomorDokumen,
}: {
    title?: string;
    subtitle?: string;
    nomorDokumen?: string;
}) {
    const { props } = usePage();
    const pt = (props as Record<string, unknown>).perguruanTinggi as PerguruanTinggiShared | undefined;

    const lembagaNaungan = pt?.lembaga_naungan || 'Yayasan Pondok Pesantren Terpadu Al-Yasini';
    const namaKampus = pt?.nama_unit || 'Sekolah Tinggi Agama Islam (STAI) Al-Yasini Pasuruan';
    const akreditasiText = pt?.peringkat_akreditasi
        ? `Terakreditasi ${pt.peringkat_akreditasi} (${pt.lembaga_akreditasi || 'BAN-PT'}) • SK Pendirian ${pt.no_sk_pendirian || 'Dj.I/149/2012'}`
        : 'Terakreditasi BAN-PT / LAMDIK • SK Pendirian Kemenag RI';
    const alamatText = pt?.alamat || 'Jl. Pesantren Terpadu Al-Yasini Kec. Wonorejo Kab. Pasuruan 67173';
    const kontakText = `Website: ${pt?.website || 'www.stai-alyasini.ac.id'} • Email: ${pt?.email || 'info@stai-alyasini.ac.id'} • Telp: ${pt?.telepon || '081333220202'}`;

    return (
        <div className="w-full text-center select-none font-sans">
            {/* Header / Kop */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 gap-4">
                {/* Logo placeholder / Emblem */}
                <div className="w-20 h-20 shrink-0 flex items-center justify-center rounded-full border-2 border-brand-primary bg-brand-primary/5 text-brand-primary">
                    <GraduationCap className="size-10 text-brand-primary" />
                </div>

                {/* Institute Info */}
                <div className="flex-1 text-center">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        {lembagaNaungan}
                    </h3>
                    <h1 className="text-base sm:text-lg font-bold uppercase tracking-tight text-brand-primary-dark">
                        {namaKampus}
                    </h1>
                    <p className="text-[11px] text-text-secondary">
                        {akreditasiText}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-0.5 leading-tight">
                        {alamatText}<br />
                        {kontakText}
                    </p>
                </div>

                {/* QR / Security Emblem */}
                <div className="w-20 h-20 shrink-0 flex flex-col items-center justify-center border border-border-default rounded p-1 bg-surface-base text-[9px] text-text-secondary">
                    <span className="font-bold text-brand-primary">SIAKAD</span>
                    <span className="font-mono text-[8px]">OFFICIAL</span>
                    <span className="text-[7px] text-center text-text-secondary/70">{pt?.nama_singkat || 'STAI Al-Yasini'}</span>
                </div>
            </div>

            {/* Second double line */}
            <div className="border-b border-slate-900 mt-[2px] mb-4"></div>

            {/* Document Title */}
            {title && (
                <div className="my-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary underline decoration-1 underline-offset-4">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-xs font-medium text-text-secondary mt-0.5">
                            {subtitle}
                        </p>
                    )}
                    {nomorDokumen && (
                        <p className="text-[11px] font-mono text-text-secondary mt-0.5">
                            Nomor: {nomorDokumen}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
