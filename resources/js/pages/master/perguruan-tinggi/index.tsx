import { Head, useForm } from '@inertiajs/react';
import {
    Award,
    Building2,
    Check,
    CheckCircle2,
    Compass,
    Copy,
    Crosshair,
    Download,
    ExternalLink,
    Eye,
    FileCheck,
    FileText,
    GraduationCap,
    Info,
    Landmark,
    Loader2,
    MapPin,
    Navigation,
    Palette,
    Phone,
    RotateCcw,
    Save,
    Search,
    Sparkles,
    Trash2,
    Upload,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { KopSuratResmi } from '@/components/kop-surat-resmi';
import { MasterDataNav } from '@/components/master-data-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PerguruanTinggi {
    id: number;
    kode_unit: string;
    nama_unit: string;
    nama_unit_en: string | null;
    nama_singkat: string | null;
    jenis_perguruan_tinggi: string;
    status_milik: string;
    lembaga_naungan: string;
    periode_berdiri: string | null;
    no_sk_pendirian: string | null;
    tanggal_sk_pendirian: string | null;
    no_sk_operasional: string | null;
    tanggal_sk_operasional: string | null;

    ketua_dosen_id?: number | null;
    wakil_ketua_1_dosen_id?: number | null;
    ketua_dosen?: DosenOption | null;
    wakil_ketua_1_dosen?: DosenOption | null;

    ketua_nama: string | null;
    ketua_nidn: string | null;
    ketua_gelar_depan: string | null;
    ketua_gelar_belakang: string | null;
    ketua_nip_niy: string | null;
    wakil_ketua_1: string | null;
    wakil_ketua_1_nama: string | null;
    wakil_ketua_1_nidn: string | null;
    wakil_ketua_1_gelar_depan: string | null;
    wakil_ketua_1_gelar_belakang: string | null;
    wakil_ketua_2: string | null;
    wakil_ketua_3: string | null;
    wakil_ketua_4: string | null;

    lembaga_akreditasi: string;
    peringkat_akreditasi: string;
    nilai_akreditasi: string | null;
    no_sk_akreditasi: string | null;
    tanggal_sk_akreditasi: string | null;
    tanggal_berlaku_akreditasi: string | null;
    tanggal_berakhir_akreditasi: string | null;
    file_sertifikat_akreditasi: string | null;

    visi: string | null;
    misi: string | null;
    alamat: string;
    jalan: string | null;
    rt_rw: string | null;
    dusun: string | null;
    kelurahan: string | null;
    kecamatan: string | null;
    kota_kabupaten: string | null;
    provinsi: string | null;
    kode_pos: string | null;

    telepon: string | null;
    telepon_2: string | null;
    email: string | null;
    website: string | null;
    fax: string | null;

    lintang: number | string | null;
    bujur: number | string | null;
    radius_presensi: number | null;

    logo_path: string | null;
    logo_kop_path: string | null;
    stempel_path: string | null;
    ttd_ketua_path: string | null;

    // Appended Accessors
    logo_url?: string | null;
    logo_kop_url?: string | null;
    stempel_url?: string | null;
    ttd_ketua_url?: string | null;
    file_sertifikat_akreditasi_url?: string | null;
    ketua_nama_lengkap_bergelar?: string | null;
    wakil_ketua_1_nama_lengkap_bergelar?: string | null;
    alamat_lengkap?: string | null;
    status_akreditasi_badge?: {
        status: 'aktif' | 'akan_berakhir' | 'kadaluarsa' | 'tidak_ada';
        label: string;
        color: string;
        days_remaining: number | null;
    };
}

interface DosenOption {
    id: number;
    nama_lengkap: string;
    gelar_depan?: string | null;
    gelar_belakang?: string | null;
    nidn: string | null;
    niy_nip?: string | null;
    nama_bergelar?: string;
    status_kepegawaian?: string | null;
    foto_url?: string | null;
    program_studi?: {
        id: number;
        nama: string;
    } | null;
}

interface Props {
    perguruanTinggi: PerguruanTinggi;
    dosens: DosenOption[];
    jenisPtOptions?: string[];
    statusMilikOptions?: string[];
    lembagaOptions?: string[];
    peringkatOptions?: string[];
}

const DEFAULT_JENIS_PT = ['Universitas', 'Institut', 'Sekolah Tinggi', 'Politeknik', 'Akademi', 'Akademi Komunitas', 'Lainnya'];
const DEFAULT_STATUS_MILIK = ['Swasta', 'Negeri'];
const DEFAULT_LEMBAGA = ['BAN-PT', 'LAMDIK', 'LAMEMBA', 'LAM-PTKes', 'LAM INFOKOM', 'LAM SAMA', 'LAM TEKNIK', 'Lainnya'];
const DEFAULT_PERINGKAT = ['Unggul', 'Baik Sekali', 'Baik', 'A', 'B', 'C', 'Terakreditasi Sementara', 'Tidak Terakreditasi', 'Lainnya'];

type SectionKey = 'profil' | 'legalitas' | 'kontak' | 'pimpinan' | 'branding';
type DropzoneField = 'logo' | 'logo_kop' | 'stempel' | 'ttd_ketua';

interface DosenSearchComboboxProps {
    label: string;
    sublabel?: string;
    placeholder?: string;
    dosens: DosenOption[];
    selectedDosen: DosenOption | null;
    onSelect: (dosen: DosenOption) => void;
    onClear: () => void;
    error?: string;
}

function DosenSearchCombobox({
    label,
    sublabel,
    placeholder = 'Ketik nama dosen, gelar, atau NIDN...',
    dosens,
    selectedDosen,
    onSelect,
    onClear,
    error,
}: DosenSearchComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDosens = useMemo(() => {
        if (!searchQuery.trim()) {
            return dosens.slice(0, 8);
        }
        const q = searchQuery.toLowerCase().trim();
        return dosens
            .filter((d) => {
                const name = (d.nama_lengkap || '').toLowerCase();
                const titledName = (d.nama_bergelar || '').toLowerCase();
                const nidn = (d.nidn || '').toLowerCase();
                const nip = (d.niy_nip || '').toLowerCase();
                const prodi = (d.program_studi?.nama || '').toLowerCase();
                return name.includes(q) || titledName.includes(q) || nidn.includes(q) || nip.includes(q) || prodi.includes(q);
            })
            .slice(0, 15);
    }, [dosens, searchQuery]);

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Users className="size-3.5 text-emerald-600" />
                        <span>{label}</span>
                    </Label>
                    {sublabel && <p className="text-[11px] text-slate-500 mt-0.5">{sublabel}</p>}
                </div>
                {selectedDosen && !isOpen && (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsOpen(true);
                                setSearchQuery('');
                            }}
                            className="text-xs h-8 px-2.5 rounded-lg border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs"
                        >
                            <Search className="size-3 mr-1 text-emerald-600" />
                            Ganti Dosen
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="text-xs h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Hapus relasi dosen dan gunakan input manual"
                        >
                            <UserX className="size-3.5 mr-1" />
                            Lepas Relasi (Manual)
                        </Button>
                    </div>
                )}
            </div>

            {/* MINI PROFILE CARD JIKA DOSEN TERPILIH */}
            {selectedDosen && !isOpen ? (
                <div className="p-4 rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/70 via-emerald-50/30 to-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                            {selectedDosen.foto_url ? (
                                <img
                                    src={selectedDosen.foto_url}
                                    alt={selectedDosen.nama_lengkap}
                                    className="size-13 rounded-full object-cover border-2 border-emerald-500/30 shadow-xs"
                                />
                            ) : (
                                <div className="size-13 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-xs">
                                    {(selectedDosen.nama_lengkap || 'D').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span
                                className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-2xs"
                                title="Dosen Aktif Terhubung"
                            />
                        </div>

                        <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <Check className="size-2.5" />
                                    <span>Master Dosen Terhubung</span>
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                    Status: {selectedDosen.status_kepegawaian ? selectedDosen.status_kepegawaian.toUpperCase() : 'TETAP'}
                                </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 truncate">
                                {selectedDosen.nama_bergelar || selectedDosen.nama_lengkap}
                            </h4>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-sans">
                                <span className="font-mono text-[11px]">
                                    NIDN: <strong className="text-slate-800">{selectedDosen.nidn || '-'}</strong>
                                </span>
                                {selectedDosen.niy_nip && (
                                    <span className="font-mono text-[11px]">
                                        NIP/NIY: <strong className="text-slate-800">{selectedDosen.niy_nip}</strong>
                                    </span>
                                )}
                                <span>
                                    Homebase: <strong className="text-slate-800">{selectedDosen.program_studi?.nama || 'Institusi'}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* SEARCH BOX & DROPDOWN COMBOBOX */
                <div className="space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsOpen(true)}
                            placeholder={placeholder}
                            className="pl-9 pr-20 text-xs h-10 rounded-xl bg-white border-slate-300 focus:border-emerald-500 shadow-2xs"
                        />
                        {selectedDosen && isOpen && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-2 text-xs text-slate-500 hover:text-slate-800"
                            >
                                Tutup
                            </Button>
                        )}
                    </div>

                    {isOpen && (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150 z-20">
                            {filteredDosens.length > 0 ? (
                                filteredDosens.map((d) => {
                                    const isCurrent = selectedDosen?.id === d.id;
                                    return (
                                        <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => {
                                                onSelect(d);
                                                setIsOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className={`w-full text-left p-2.5 px-3.5 flex items-center justify-between gap-3 hover:bg-emerald-50/60 transition-colors cursor-pointer ${
                                                isCurrent ? 'bg-emerald-50/80 font-medium' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="size-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {(d.nama_lengkap || 'D').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-semibold text-slate-900 truncate">
                                                        {d.nama_bergelar || d.nama_lengkap}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                        <span className="font-mono">NIDN: {d.nidn || '-'}</span>
                                                        <span>•</span>
                                                        <span>{d.program_studi?.nama || 'STAI Al-Yasini'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {isCurrent ? (
                                                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 shrink-0">
                                                    <Check className="size-3.5" />
                                                    <span>Terpilih</span>
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 hover:text-emerald-700 shrink-0">
                                                    Pilih
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-xs text-slate-500">
                                    Tidak ada dosen yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
}

export default function PerguruanTinggiIndex({
    perguruanTinggi,
    dosens,
    jenisPtOptions = DEFAULT_JENIS_PT,
    statusMilikOptions = DEFAULT_STATUS_MILIK,
    lembagaOptions = DEFAULT_LEMBAGA,
    peringkatOptions = DEFAULT_PERINGKAT,
}: Props) {
    const [activeSection, setActiveSection] = useState<SectionKey>('profil');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isKopModalOpen, setIsKopModalOpen] = useState<boolean>(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
    const [dragOverField, setDragOverField] = useState<DropzoneField | null>(null);

    // Local object URL state for instant branding live previews before form submit
    const [localLogoPreview, setLocalLogoPreview] = useState<string | null>(null);
    const [localLogoKopPreview, setLocalLogoKopPreview] = useState<string | null>(null);
    const [localStempelPreview, setLocalStempelPreview] = useState<string | null>(null);
    const [localTtdPreview, setLocalTtdPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, isDirty, reset } = useForm({
        // 1. Profil Umum & PDDIKTI
        kode_unit: perguruanTinggi.kode_unit || '',
        nama_unit: perguruanTinggi.nama_unit || '',
        nama_unit_en: perguruanTinggi.nama_unit_en || '',
        nama_singkat: perguruanTinggi.nama_singkat || '',
        jenis_perguruan_tinggi: perguruanTinggi.jenis_perguruan_tinggi || 'Sekolah Tinggi',
        status_milik: perguruanTinggi.status_milik || 'Swasta',
        lembaga_naungan: perguruanTinggi.lembaga_naungan || '',
        periode_berdiri: perguruanTinggi.periode_berdiri || '',
        visi: perguruanTinggi.visi || '',
        misi: perguruanTinggi.misi || '',

        // 2. Legalitas & Akreditasi
        no_sk_pendirian: perguruanTinggi.no_sk_pendirian || '',
        tanggal_sk_pendirian: perguruanTinggi.tanggal_sk_pendirian ? perguruanTinggi.tanggal_sk_pendirian.substring(0, 10) : '',
        no_sk_operasional: perguruanTinggi.no_sk_operasional || '',
        tanggal_sk_operasional: perguruanTinggi.tanggal_sk_operasional ? perguruanTinggi.tanggal_sk_operasional.substring(0, 10) : '',
        lembaga_akreditasi: perguruanTinggi.lembaga_akreditasi || 'BAN-PT',
        peringkat_akreditasi: perguruanTinggi.peringkat_akreditasi || 'Baik',
        nilai_akreditasi: perguruanTinggi.nilai_akreditasi || '',
        no_sk_akreditasi: perguruanTinggi.no_sk_akreditasi || '',
        tanggal_sk_akreditasi: perguruanTinggi.tanggal_sk_akreditasi ? perguruanTinggi.tanggal_sk_akreditasi.substring(0, 10) : '',
        tanggal_berlaku_akreditasi: perguruanTinggi.tanggal_berlaku_akreditasi ? perguruanTinggi.tanggal_berlaku_akreditasi.substring(0, 10) : '',
        tanggal_berakhir_akreditasi: perguruanTinggi.tanggal_berakhir_akreditasi ? perguruanTinggi.tanggal_berakhir_akreditasi.substring(0, 10) : '',
        file_sertifikat_akreditasi: null as File | null,
        hapus_file_sertifikat: false,

        // 3. Kontak & Titik Presensi
        alamat: perguruanTinggi.alamat || '',
        jalan: perguruanTinggi.jalan || '',
        rt_rw: perguruanTinggi.rt_rw || '',
        dusun: perguruanTinggi.dusun || '',
        kelurahan: perguruanTinggi.kelurahan || '',
        kecamatan: perguruanTinggi.kecamatan || '',
        kota_kabupaten: perguruanTinggi.kota_kabupaten || '',
        provinsi: perguruanTinggi.provinsi || '',
        kode_pos: perguruanTinggi.kode_pos || '',
        telepon: perguruanTinggi.telepon || '',
        telepon_2: perguruanTinggi.telepon_2 || '',
        email: perguruanTinggi.email || '',
        website: perguruanTinggi.website || '',
        fax: perguruanTinggi.fax || '',
        lintang: perguruanTinggi.lintang ? String(perguruanTinggi.lintang) : '',
        bujur: perguruanTinggi.bujur ? String(perguruanTinggi.bujur) : '',
        radius_presensi: perguruanTinggi.radius_presensi || 100,

        // 4. Pimpinan & Pejabat
        ketua_dosen_id: (perguruanTinggi.ketua_dosen_id || null) as number | null,
        ketua_nama: perguruanTinggi.ketua_nama || '',
        ketua_nidn: perguruanTinggi.ketua_nidn || '',
        ketua_gelar_depan: perguruanTinggi.ketua_gelar_depan || '',
        ketua_gelar_belakang: perguruanTinggi.ketua_gelar_belakang || '',
        ketua_nip_niy: perguruanTinggi.ketua_nip_niy || '',
        wakil_ketua_1_dosen_id: (perguruanTinggi.wakil_ketua_1_dosen_id || null) as number | null,
        wakil_ketua_1: perguruanTinggi.wakil_ketua_1 || '',
        wakil_ketua_1_nama: perguruanTinggi.wakil_ketua_1_nama || '',
        wakil_ketua_1_nidn: perguruanTinggi.wakil_ketua_1_nidn || '',
        wakil_ketua_1_gelar_depan: perguruanTinggi.wakil_ketua_1_gelar_depan || '',
        wakil_ketua_1_gelar_belakang: perguruanTinggi.wakil_ketua_1_gelar_belakang || '',
        wakil_ketua_2: perguruanTinggi.wakil_ketua_2 || '',
        wakil_ketua_3: perguruanTinggi.wakil_ketua_3 || '',
        wakil_ketua_4: perguruanTinggi.wakil_ketua_4 || '',
        ttd_ketua: null as File | null,
        hapus_ttd_ketua: false,

        // 5. Aset Branding
        logo: null as File | null,
        hapus_logo: false,
        logo_kop: null as File | null,
        hapus_logo_kop: false,
        stempel: null as File | null,
        hapus_stempel: false,
    });

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            if (localLogoPreview) URL.revokeObjectURL(localLogoPreview);
            if (localLogoKopPreview) URL.revokeObjectURL(localLogoKopPreview);
            if (localStempelPreview) URL.revokeObjectURL(localStempelPreview);
            if (localTtdPreview) URL.revokeObjectURL(localTtdPreview);
        };
    }, [localLogoPreview, localLogoKopPreview, localStempelPreview, localTtdPreview]);

    // Handle file change and local preview
    const handleFileChange = (field: 'logo' | 'logo_kop' | 'stempel' | 'ttd_ketua' | 'file_sertifikat_akreditasi', file: File | null) => {
        if (!file) {
            setData(field, null);
            return;
        }

        // Validate size client-side (2MB for images, 5MB for cert)
        const maxBytes = field === 'file_sertifikat_akreditasi' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
        if (file.size > maxBytes) {
            toast.error(`Ukuran file "${file.name}" melebihi batas maksimal ${field === 'file_sertifikat_akreditasi' ? '5MB' : '2MB'}.`);
            return;
        }

        setData(field, file);
        const url = URL.createObjectURL(file);

        if (field === 'logo') {
            if (localLogoPreview) URL.revokeObjectURL(localLogoPreview);
            setLocalLogoPreview(url);
            setData('hapus_logo', false);
            toast.success('Logo Utama berhasil dimuat untuk pratinjau.');
        } else if (field === 'logo_kop') {
            if (localLogoKopPreview) URL.revokeObjectURL(localLogoKopPreview);
            setLocalLogoKopPreview(url);
            setData('hapus_logo_kop', false);
            toast.success('Logo Kop Surat berhasil dimuat.');
        } else if (field === 'stempel') {
            if (localStempelPreview) URL.revokeObjectURL(localStempelPreview);
            setLocalStempelPreview(url);
            setData('hapus_stempel', false);
            toast.success('Stempel digital berhasil dimuat.');
        } else if (field === 'ttd_ketua') {
            if (localTtdPreview) URL.revokeObjectURL(localTtdPreview);
            setLocalTtdPreview(url);
            setData('hapus_ttd_ketua', false);
            toast.success('Tanda tangan digital berhasil dimuat.');
        }
    };

    // Drag and Drop helpers for branding dropzones
    const handleDrop = (field: DropzoneField, e: React.DragEvent) => {
        e.preventDefault();
        setDragOverField(null);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Berkas harus berupa gambar (PNG, JPG, atau WEBP).');
                return;
            }
            handleFileChange(field, file);
        }
    };

    // Copy to clipboard helper
    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(label);
        toast.success(`${label} berhasil disalin ke clipboard!`);
        setTimeout(() => setCopiedField(null), 2500);
    };

    // Interactive Browser GPS Geolocation Picker
    const detectCurrentLocation = () => {
        if (!('geolocation' in navigator)) {
            toast.error('Browser ini tidak mendukung fitur geolokasi GPS.');
            return;
        }

        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(7);
                const lng = position.coords.longitude.toFixed(7);
                setData((prev) => ({
                    ...prev,
                    lintang: lat,
                    bujur: lng,
                }));
                setIsDetectingLocation(false);
                toast.success(`Titik koordinat berhasil diselaraskan: ${lat}, ${lng}`);
            },
            (error) => {
                setIsDetectingLocation(false);
                let msg = 'Gagal mendeteksi lokasi GPS.';
                if (error.code === error.PERMISSION_DENIED) {
                    msg = 'Izin akses lokasi GPS ditolak oleh browser. Harap aktifkan izin lokasi.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    msg = 'Sinyal lokasi GPS perangkat tidak tersedia.';
                } else if (error.code === error.TIMEOUT) {
                    msg = 'Waktu deteksi lokasi GPS habis (timeout).';
                }
                toast.error(msg);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Selected Dosen lookups
    const selectedKetuaDosen = useMemo(() => {
        if (!data.ketua_dosen_id) {
            return null;
        }
        return dosens.find((d) => d.id === Number(data.ketua_dosen_id)) || null;
    }, [data.ketua_dosen_id, dosens]);

    const selectedWakilKetua1Dosen = useMemo(() => {
        if (!data.wakil_ketua_1_dosen_id) {
            return null;
        }
        return dosens.find((d) => d.id === Number(data.wakil_ketua_1_dosen_id)) || null;
    }, [data.wakil_ketua_1_dosen_id, dosens]);

    // Dosen picker handlers
    const handleKetuaSelect = (dosen: DosenOption) => {
        setData((prev) => ({
            ...prev,
            ketua_dosen_id: dosen.id,
            ketua_nama: dosen.nama_lengkap,
            ketua_nidn: dosen.nidn || '',
            ketua_gelar_depan: dosen.gelar_depan || '',
            ketua_gelar_belakang: dosen.gelar_belakang || '',
            ketua_nip_niy: dosen.niy_nip || '',
        }));
        toast.success(`Data Rektor/Ketua diselaraskan dengan: ${dosen.nama_bergelar || dosen.nama_lengkap}`);
    };

    const handleClearKetuaDosen = () => {
        setData((prev) => ({
            ...prev,
            ketua_dosen_id: null,
        }));
        toast.info('Pilihan dosen Rektor/Ketua dilepas (dapat diinput manual).');
    };

    const handleWakilKetua1Select = (dosen: DosenOption) => {
        setData((prev) => ({
            ...prev,
            wakil_ketua_1_dosen_id: dosen.id,
            wakil_ketua_1_nama: dosen.nama_lengkap,
            wakil_ketua_1_nidn: dosen.nidn || '',
            wakil_ketua_1_gelar_depan: dosen.gelar_depan || '',
            wakil_ketua_1_gelar_belakang: dosen.gelar_belakang || '',
            wakil_ketua_1: `${dosen.nidn || dosen.niy_nip || ''} - ${dosen.nama_bergelar || dosen.nama_lengkap}`,
        }));
        toast.success(`Data Wakil Rektor I diselaraskan dengan: ${dosen.nama_bergelar || dosen.nama_lengkap}`);
    };

    const handleClearWakilKetua1Dosen = () => {
        setData((prev) => ({
            ...prev,
            wakil_ketua_1_dosen_id: null,
        }));
        toast.info('Pilihan dosen Wakil Rektor I dilepas (dapat diinput manual).');
    };

    // Form submit
    const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
        if (e) {
            e.preventDefault();
        }
        post('/master/perguruan-tinggi', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    // Form reset to initial state
    const handleReset = () => {
        reset();
        if (localLogoPreview) {
            URL.revokeObjectURL(localLogoPreview);
        }
        if (localLogoKopPreview) {
            URL.revokeObjectURL(localLogoKopPreview);
        }
        if (localStempelPreview) {
            URL.revokeObjectURL(localStempelPreview);
        }
        if (localTtdPreview) {
            URL.revokeObjectURL(localTtdPreview);
        }
        setLocalLogoPreview(null);
        setLocalLogoKopPreview(null);
        setLocalStempelPreview(null);
        setLocalTtdPreview(null);
        toast.info('Perubahan formulir dikembalikan ke data awal.');
    };

    // Section error indicator
    const sectionHasErrors = (sec: SectionKey): boolean => {
        const errorKeys = Object.keys(errors);
        switch (sec) {
            case 'profil':
                return errorKeys.some((k) => ['kode_unit', 'nama_unit', 'nama_unit_en', 'nama_singkat', 'jenis_perguruan_tinggi', 'status_milik', 'lembaga_naungan', 'periode_berdiri', 'visi', 'misi'].includes(k));
            case 'legalitas':
                return errorKeys.some((k) => ['no_sk_pendirian', 'tanggal_sk_pendirian', 'no_sk_operasional', 'tanggal_sk_operasional', 'lembaga_akreditasi', 'peringkat_akreditasi', 'nilai_akreditasi', 'no_sk_akreditasi', 'tanggal_sk_akreditasi', 'tanggal_berlaku_akreditasi', 'tanggal_berakhir_akreditasi', 'file_sertifikat_akreditasi'].includes(k));
            case 'kontak':
                return errorKeys.some((k) => ['alamat', 'jalan', 'rt_rw', 'dusun', 'kelurahan', 'kecamatan', 'kota_kabupaten', 'provinsi', 'kode_pos', 'telepon', 'telepon_2', 'email', 'website', 'fax', 'lintang', 'bujur', 'radius_presensi'].includes(k));
            case 'pimpinan':
                return errorKeys.some((k) => ['ketua_dosen_id', 'wakil_ketua_1_dosen_id', 'ketua_nama', 'ketua_nidn', 'ketua_gelar_depan', 'ketua_gelar_belakang', 'ketua_nip_niy', 'wakil_ketua_1', 'wakil_ketua_1_nama', 'wakil_ketua_1_nidn', 'ttd_ketua'].includes(k));
            case 'branding':
                return errorKeys.some((k) => ['logo', 'logo_kop', 'stempel'].includes(k));
            default:
                return false;
        }
    };

    // Section completeness indicator (Checklist Pill)
    const isSectionComplete = (sec: SectionKey): boolean => {
        switch (sec) {
            case 'profil':
                return Boolean(data.kode_unit && data.nama_unit && data.jenis_perguruan_tinggi && data.status_milik);
            case 'legalitas':
                return Boolean(data.no_sk_pendirian && data.lembaga_akreditasi && data.peringkat_akreditasi);
            case 'kontak':
                return Boolean((data.alamat || data.jalan) && data.telepon && data.email);
            case 'pimpinan':
                return Boolean((data.ketua_dosen_id || data.ketua_nama) && (data.wakil_ketua_1_dosen_id || data.wakil_ketua_1_nama || data.wakil_ketua_1));
            case 'branding':
                return Boolean((!data.hapus_logo && (localLogoPreview || perguruanTinggi.logo_path)) || (!data.hapus_logo_kop && (localLogoKopPreview || perguruanTinggi.logo_kop_path)));
            default:
                return false;
        }
    };

    // Effective logo URL for live preview
    const activeLogoUrl = useMemo(() => {
        if (data.hapus_logo_kop && data.hapus_logo) return null;
        if (localLogoKopPreview) return localLogoKopPreview;
        if (localLogoPreview) return localLogoPreview;
        if (data.hapus_logo_kop) return data.hapus_logo ? null : perguruanTinggi.logo_url;
        return perguruanTinggi.logo_kop_url || perguruanTinggi.logo_url;
    }, [data.hapus_logo, data.hapus_logo_kop, localLogoKopPreview, localLogoPreview, perguruanTinggi.logo_kop_url, perguruanTinggi.logo_url]);

    // Accreditation status badge styling
    const badge = perguruanTinggi.status_akreditasi_badge || {
        status: 'tidak_ada',
        label: 'Masa Berlaku Belum Diatur',
        color: 'slate',
        days_remaining: null,
    };

    const sections = [
        {
            key: 'profil' as SectionKey,
            title: 'Identitas & Profil PDDIKTI',
            shortTitle: 'Profil PDDIKTI',
            desc: 'Kode PT, nama resmi, jenis & kepemilikan',
            icon: Landmark,
        },
        {
            key: 'legalitas' as SectionKey,
            title: 'Legalitas & Akreditasi BAN-PT',
            shortTitle: 'Legalitas & SK',
            desc: 'SK Pendirian, Izin Operasional & Akreditasi',
            icon: Award,
        },
        {
            key: 'kontak' as SectionKey,
            title: 'Alamat & Titik Presensi GPS',
            shortTitle: 'Alamat & GPS',
            desc: 'Domisili, kontak resmi & koordinat presensi',
            icon: MapPin,
        },
        {
            key: 'pimpinan' as SectionKey,
            title: 'Struktur Pimpinan Institusi',
            shortTitle: 'Pimpinan Kampus',
            desc: 'Rektor/Ketua, Wakil Rektor I & tanda tangan',
            icon: Users,
        },
        {
            key: 'branding' as SectionKey,
            title: 'Identitas Visual & Kop Dokumen',
            shortTitle: 'Branding & Kop',
            desc: 'Logo, stempel digital & pratinjau cetak',
            icon: Palette,
        },
    ];

    // OpenStreetMap preview URL helper
    const osmEmbedUrl = useMemo(() => {
        const lat = parseFloat(String(data.lintang));
        const lng = parseFloat(String(data.bujur));
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return null;
        }
        const delta = 0.005;
        const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
    }, [data.lintang, data.bujur]);

    return (
        <>
            <Head title="Master Perguruan Tinggi / Profil Institusi" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-900 pb-28">
                {/* Master Data Dropdown Breadcrumb */}
                <MasterDataNav currentHref="/master/perguruan-tinggi" />

                {/* Page Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                            <Building2 className="size-6 text-emerald-600" />
                            <span>Pengaturan Profil Institusi & Kampus</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Kelola identitas resmi, legalitas SK PDDIKTI, titik koordinat presensi GPS, struktur penandatangan, dan aset branding dokumen.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsKopModalOpen(true)}
                            className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold h-9 rounded-xl border-slate-300 gap-1.5 shadow-2xs cursor-pointer"
                        >
                            <Eye className="size-3.5 text-emerald-600" />
                            <span>Tinjau Kop Dokumen</span>
                        </Button>
                    </div>
                </div>

                {/* MOBILE / TABLET RESPONSIVE COMPACT NAVIGATION (< lg) */}
                <div className="block lg:hidden space-y-3">
                    {/* Compact Mobile Identity Card */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                {activeLogoUrl ? (
                                    <img src={activeLogoUrl} alt="Logo" className="w-7 h-7 object-contain" />
                                ) : (
                                    <Landmark className="size-5 text-emerald-600" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xs font-bold text-slate-900 truncate" title={data.nama_unit}>
                                    {data.nama_unit || 'Perguruan Tinggi'}
                                </h2>
                                <p className="text-[10px] text-slate-500 font-mono">Kode PT: {data.kode_unit || '-'}</p>
                            </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${
                            badge.color === 'emerald'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : badge.color === 'amber'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                            {data.peringkat_akreditasi}
                        </span>
                    </div>

                    {/* Horizontal Scrolling Pill Navigation */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                        {sections.map((sec) => {
                            const Icon = sec.icon;
                            const isActive = activeSection === sec.key;
                            const hasError = sectionHasErrors(sec.key);
                            const isComplete = isSectionComplete(sec.key);

                            return (
                                <button
                                    key={sec.key}
                                    type="button"
                                    onClick={() => setActiveSection(sec.key)}
                                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
                                    }`}
                                >
                                    <Icon className={`size-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                    <span>{sec.shortTitle}</span>
                                    {hasError ? (
                                        <span className="size-1.5 rounded-full bg-rose-400 shrink-0 animate-pulse" />
                                    ) : isComplete ? (
                                        <span title="Data lengkap">
                                            <Check className={`size-3 shrink-0 ${isActive ? 'text-emerald-200' : 'text-emerald-600'}`} />
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* TWO-COLUMN MASTER-SECTION LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: DESKTOP STICKY SIDEBAR NAVIGATION (~28%) */}
                    <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-6">
                        {/* Mini Identity Card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4.5 space-y-3.5">
                            <div className="flex items-center gap-3.5">
                                <div className="w-13 h-13 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                    {activeLogoUrl ? (
                                        <img src={activeLogoUrl} alt="Logo Kampus" className="w-9 h-9 object-contain" />
                                    ) : (
                                        <Landmark className="size-6 text-emerald-600" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-sm font-bold text-slate-900 leading-snug truncate" title={data.nama_unit}>
                                        {data.nama_unit || 'Perguruan Tinggi'}
                                    </h2>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[11px] font-mono text-slate-500">
                                            PT {data.kode_unit || '-'}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-[11px] font-semibold text-emerald-700">
                                            {data.status_milik}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Akreditasi Pill */}
                            <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-medium flex items-center justify-between ${
                                badge.color === 'emerald'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : badge.color === 'amber'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : badge.color === 'rose'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                                <div className="flex items-center gap-1.5 truncate">
                                    <Award className="size-3.5 shrink-0" />
                                    <span className="truncate">{data.peringkat_akreditasi} ({data.lembaga_akreditasi})</span>
                                </div>
                                <span className="text-[10px] font-semibold shrink-0">
                                    {badge.days_remaining !== null ? `${badge.days_remaining}h` : 'Aktif'}
                                </span>
                            </div>
                        </div>

                        {/* Vertical Section Navigation */}
                        <nav aria-label="Navigasi Seksi Profil" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-2 space-y-1">
                            {sections.map((sec) => {
                                const Icon = sec.icon;
                                const isActive = activeSection === sec.key;
                                const hasError = sectionHasErrors(sec.key);
                                const isComplete = isSectionComplete(sec.key);

                                return (
                                    <button
                                        key={sec.key}
                                        type="button"
                                        onClick={() => setActiveSection(sec.key)}
                                        className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/90 shadow-2xs font-semibold'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                            isActive
                                                ? 'bg-emerald-600 text-white shadow-2xs'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            <Icon className="size-4" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span className="text-xs font-bold truncate">
                                                    {sec.title}
                                                </span>

                                                {/* Status Check / Error */}
                                                {hasError ? (
                                                    <span className="size-2 rounded-full bg-rose-500 shrink-0 ring-2 ring-rose-100 animate-pulse" title="Terdapat kesalahan input" />
                                                ) : isComplete ? (
                                                    <span title="Data lengkap">
                                                        <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                                                    </span>
                                                ) : (
                                                    <span className="size-1.5 rounded-full bg-slate-300 shrink-0" title="Belum lengkap" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                                                {sec.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* RIGHT COLUMN: ACTIVE SECTION CONTENT (~72%) */}
                    <main className="lg:col-span-8 xl:col-span-9">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* 1. SEKSI IDENTITAS & PROFIL PDDIKTI */}
                            {activeSection === 'profil' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
                                        <CardHeader className="p-5 sm:p-6 border-b border-slate-100 pb-4">
                                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                <Landmark className="size-4.5 text-emerald-600" />
                                                <span>Identitas Resmi Perguruan Tinggi (PDDIKTI)</span>
                                            </CardTitle>
                                            <CardDescription className="text-xs text-slate-500 mt-0.5">
                                                Data induk institusi sesuai registrasi resmi Kemenag / Kemendikbudristek.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-6 space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {/* Kode Unit dengan Quick Copy */}
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="kode_unit" className="text-xs font-semibold text-slate-700">
                                                            Kode Perguruan Tinggi (PDDIKTI)
                                                        </Label>
                                                        {data.kode_unit && (
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(data.kode_unit, 'Kode PT')}
                                                                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                                                            >
                                                                {copiedField === 'Kode PT' ? <Check className="size-3" /> : <Copy className="size-3" />}
                                                                <span>{copiedField === 'Kode PT' ? 'Tersalin' : 'Salin'}</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <Input
                                                        id="kode_unit"
                                                        value={data.kode_unit}
                                                        onChange={(e) => setData('kode_unit', e.target.value)}
                                                        placeholder="Contoh: 213048"
                                                        className="font-mono text-sm"
                                                    />
                                                    <p className="text-[11px] text-slate-500">6 digit kode resmi yang terdaftar pada PDDikti.</p>
                                                    {errors.kode_unit && <p className="text-xs text-rose-500">{errors.kode_unit}</p>}
                                                </div>

                                                {/* Singkatan */}
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="nama_singkat" className="text-xs font-semibold text-slate-700">
                                                        Singkatan / Akronim Kampus
                                                    </Label>
                                                    <Input
                                                        id="nama_singkat"
                                                        value={data.nama_singkat}
                                                        onChange={(e) => setData('nama_singkat', e.target.value)}
                                                        placeholder="Contoh: STAI Al-Yasini"
                                                        className="text-sm font-semibold"
                                                    />
                                                    <p className="text-[11px] text-slate-500">Digunakan pada header ringkas, navigasi, dan watermark.</p>
                                                    {errors.nama_singkat && <p className="text-xs text-rose-500">{errors.nama_singkat}</p>}
                                                </div>

                                                {/* Nama Resmi */}
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <Label htmlFor="nama_unit" className="text-xs font-semibold text-slate-700">
                                                        Nama Resmi Perguruan Tinggi <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="nama_unit"
                                                        value={data.nama_unit}
                                                        onChange={(e) => setData('nama_unit', e.target.value)}
                                                        placeholder="Contoh: STAI Al-Yasini Pasuruan"
                                                        className="text-sm font-medium"
                                                        required
                                                    />
                                                    {errors.nama_unit && <p className="text-xs text-rose-500">{errors.nama_unit}</p>}
                                                </div>

                                                {/* Nama Internasional */}
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <Label htmlFor="nama_unit_en" className="text-xs font-semibold text-slate-700">
                                                        Nama Internasional (English)
                                                    </Label>
                                                    <Input
                                                        id="nama_unit_en"
                                                        value={data.nama_unit_en}
                                                        onChange={(e) => setData('nama_unit_en', e.target.value)}
                                                        placeholder="Contoh: Al-Yasini Islamic College of Pasuruan"
                                                        className="text-sm"
                                                    />
                                                    <p className="text-[11px] text-slate-500">Digunakan pada Surat Keterangan Pendamping Ijazah (SKPI) & Transkrip Bilingual.</p>
                                                    {errors.nama_unit_en && <p className="text-xs text-rose-500">{errors.nama_unit_en}</p>}
                                                </div>

                                                {/* Jenis PT */}
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="jenis_perguruan_tinggi" className="text-xs font-semibold text-slate-700">
                                                        Jenis / Bentuk Perguruan Tinggi
                                                    </Label>
                                                    <Select
                                                        value={data.jenis_perguruan_tinggi}
                                                        onValueChange={(val) => setData('jenis_perguruan_tinggi', val)}
                                                    >
                                                        <SelectTrigger className="w-full text-sm">
                                                            <SelectValue placeholder="Pilih Jenis PT" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {jenisPtOptions.map((opt) => (
                                                                <SelectItem key={opt} value={opt}>
                                                                    {opt}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.jenis_perguruan_tinggi && <p className="text-xs text-rose-500">{errors.jenis_perguruan_tinggi}</p>}
                                                </div>

                                                {/* Status Kepemilikan */}
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="status_milik" className="text-xs font-semibold text-slate-700">
                                                        Status Kepemilikan
                                                    </Label>
                                                    <Select
                                                        value={data.status_milik}
                                                        onValueChange={(val) => setData('status_milik', val)}
                                                    >
                                                        <SelectTrigger className="w-full text-sm">
                                                            <SelectValue placeholder="Pilih Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statusMilikOptions.map((opt) => (
                                                                <SelectItem key={opt} value={opt}>
                                                                    {opt}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.status_milik && <p className="text-xs text-rose-500">{errors.status_milik}</p>}
                                                </div>

                                                {/* Lembaga Naungan */}
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="lembaga_naungan" className="text-xs font-semibold text-slate-700">
                                                        Yayasan / Lembaga Naungan
                                                    </Label>
                                                    <Input
                                                        id="lembaga_naungan"
                                                        value={data.lembaga_naungan}
                                                        onChange={(e) => setData('lembaga_naungan', e.target.value)}
                                                        placeholder="Contoh: PTA Islam Swasta"
                                                        className="text-sm"
                                                    />
                                                    {errors.lembaga_naungan && <p className="text-xs text-rose-500">{errors.lembaga_naungan}</p>}
                                                </div>

                                                {/* Periode Berdiri */}
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="periode_berdiri" className="text-xs font-semibold text-slate-700">
                                                        Tahun Berdiri
                                                    </Label>
                                                    <Input
                                                        id="periode_berdiri"
                                                        value={data.periode_berdiri}
                                                        onChange={(e) => setData('periode_berdiri', e.target.value)}
                                                        placeholder="Contoh: 2012"
                                                        className="text-sm"
                                                    />
                                                    {errors.periode_berdiri && <p className="text-xs text-rose-500">{errors.periode_berdiri}</p>}
                                                </div>
                                            </div>

                                            {/* Visi & Misi */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="visi" className="text-xs font-semibold text-slate-700">
                                                        Visi Resmi Institusi
                                                    </Label>
                                                    <Textarea
                                                        id="visi"
                                                        value={data.visi}
                                                        onChange={(e) => setData('visi', e.target.value)}
                                                        rows={4}
                                                        placeholder="Tuliskan visi resmi perguruan tinggi..."
                                                        className="text-sm resize-none"
                                                    />
                                                    {errors.visi && <p className="text-xs text-rose-500">{errors.visi}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="misi" className="text-xs font-semibold text-slate-700">
                                                        Misi Resmi Institusi
                                                    </Label>
                                                    <Textarea
                                                        id="misi"
                                                        value={data.misi}
                                                        onChange={(e) => setData('misi', e.target.value)}
                                                        rows={4}
                                                        placeholder="Tuliskan misi resmi perguruan tinggi..."
                                                        className="text-sm resize-none"
                                                    />
                                                    {errors.misi && <p className="text-xs text-rose-500">{errors.misi}</p>}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* 2. SEKSI LEGALITAS & AKREDITASI */}
                            {activeSection === 'legalitas' && (
                                <div className="space-y-6 animate-fadeIn">
                                    {/* Surat Keputusan Legalitas */}
                                    <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
                                        <CardHeader className="p-5 sm:p-6 border-b border-slate-100 pb-4">
                                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                <FileText className="size-4.5 text-emerald-600" />
                                                <span>Surat Keputusan (SK) Legalitas Kampus</span>
                                            </CardTitle>
                                            <CardDescription className="text-xs text-slate-500 mt-0.5">
                                                Nomor dan tanggal pengesahan SK Pendirian serta Izin Operasional resmi.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="no_sk_pendirian" className="text-xs font-semibold text-slate-700">
                                                        Nomor SK Pendirian
                                                    </Label>
                                                    <Input
                                                        id="no_sk_pendirian"
                                                        value={data.no_sk_pendirian}
                                                        onChange={(e) => setData('no_sk_pendirian', e.target.value)}
                                                        placeholder="Contoh: Dj.I/149/2012"
                                                        className="text-sm font-mono"
                                                    />
                                                    {errors.no_sk_pendirian && <p className="text-xs text-rose-500">{errors.no_sk_pendirian}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="tanggal_sk_pendirian" className="text-xs font-semibold text-slate-700">
                                                        Tanggal SK Pendirian
                                                    </Label>
                                                    <Input
                                                        id="tanggal_sk_pendirian"
                                                        type="date"
                                                        value={data.tanggal_sk_pendirian}
                                                        onChange={(e) => setData('tanggal_sk_pendirian', e.target.value)}
                                                        className="text-sm"
                                                    />
                                                    {errors.tanggal_sk_pendirian && <p className="text-xs text-rose-500">{errors.tanggal_sk_pendirian}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="no_sk_operasional" className="text-xs font-semibold text-slate-700">
                                                        Nomor SK Izin Operasional
                                                    </Label>
                                                    <Input
                                                        id="no_sk_operasional"
                                                        value={data.no_sk_operasional}
                                                        onChange={(e) => setData('no_sk_operasional', e.target.value)}
                                                        placeholder="Contoh: SK-KEMENAG-2015/01"
                                                        className="text-sm font-mono"
                                                    />
                                                    {errors.no_sk_operasional && <p className="text-xs text-rose-500">{errors.no_sk_operasional}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="tanggal_sk_operasional" className="text-xs font-semibold text-slate-700">
                                                        Tanggal SK Izin Operasional
                                                    </Label>
                                                    <Input
                                                        id="tanggal_sk_operasional"
                                                        type="date"
                                                        value={data.tanggal_sk_operasional}
                                                        onChange={(e) => setData('tanggal_sk_operasional', e.target.value)}
                                                        className="text-sm"
                                                    />
                                                    {errors.tanggal_sk_operasional && <p className="text-xs text-rose-500">{errors.tanggal_sk_operasional}</p>}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Akreditasi Institusi */}
                                    <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
                                        <CardHeader className="p-5 sm:p-6 border-b border-slate-100 pb-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                        <Award className="size-4.5 text-emerald-600" />
                                                        <span>Akreditasi Institusi BAN-PT / LAM</span>
                                                    </CardTitle>
                                                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                                                        Instrumen peringkat mutu resmi institusi penentu validitas ijazah.
                                                    </CardDescription>
                                                </div>

                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                                    badge.color === 'emerald'
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : badge.color === 'amber'
                                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                        : badge.color === 'rose'
                                                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                                }`}>
                                                    <Award className="size-3.5" />
                                                    <span>{badge.label}</span>
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="lembaga_akreditasi" className="text-xs font-semibold text-slate-700">
                                                        Lembaga Akreditasi <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Select
                                                        value={data.lembaga_akreditasi}
                                                        onValueChange={(val) => setData('lembaga_akreditasi', val)}
                                                    >
                                                        <SelectTrigger className="w-full text-sm">
                                                            <SelectValue placeholder="Pilih Lembaga" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {lembagaOptions.map((opt) => (
                                                                <SelectItem key={opt} value={opt}>
                                                                    {opt}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.lembaga_akreditasi && <p className="text-xs text-rose-500">{errors.lembaga_akreditasi}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="peringkat_akreditasi" className="text-xs font-semibold text-slate-700">
                                                        Peringkat Akreditasi <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Select
                                                        value={data.peringkat_akreditasi}
                                                        onValueChange={(val) => setData('peringkat_akreditasi', val)}
                                                    >
                                                        <SelectTrigger className="w-full text-sm">
                                                            <SelectValue placeholder="Pilih Peringkat" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {peringkatOptions.map((opt) => (
                                                                <SelectItem key={opt} value={opt}>
                                                                    {opt}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.peringkat_akreditasi && <p className="text-xs text-rose-500">{errors.peringkat_akreditasi}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="nilai_akreditasi" className="text-xs font-semibold text-slate-700">
                                                        Nilai Skor Angka (Opsional)
                                                    </Label>
                                                    <Input
                                                        id="nilai_akreditasi"
                                                        value={data.nilai_akreditasi}
                                                        onChange={(e) => setData('nilai_akreditasi', e.target.value)}
                                                        placeholder="Contoh: 342"
                                                        className="text-sm font-mono"
                                                    />
                                                    {errors.nilai_akreditasi && <p className="text-xs text-rose-500">{errors.nilai_akreditasi}</p>}
                                                </div>

                                                <div className="space-y-1.5 md:col-span-3">
                                                    <Label htmlFor="no_sk_akreditasi" className="text-xs font-semibold text-slate-700">
                                                        Nomor SK Akreditasi BAN-PT / LAM
                                                    </Label>
                                                    <Input
                                                        id="no_sk_akreditasi"
                                                        value={data.no_sk_akreditasi}
                                                        onChange={(e) => setData('no_sk_akreditasi', e.target.value)}
                                                        placeholder="Contoh: 481/SK/BAN-PT/Ak/PT/VIII/2022"
                                                        className="text-sm font-mono"
                                                    />
                                                    {errors.no_sk_akreditasi && <p className="text-xs text-rose-500">{errors.no_sk_akreditasi}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="tanggal_sk_akreditasi" className="text-xs font-semibold text-slate-700">
                                                        Tanggal Terbit SK
                                                    </Label>
                                                    <Input
                                                        id="tanggal_sk_akreditasi"
                                                        type="date"
                                                        value={data.tanggal_sk_akreditasi}
                                                        onChange={(e) => setData('tanggal_sk_akreditasi', e.target.value)}
                                                        className="text-sm"
                                                    />
                                                    {errors.tanggal_sk_akreditasi && <p className="text-xs text-rose-500">{errors.tanggal_sk_akreditasi}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="tanggal_berlaku_akreditasi" className="text-xs font-semibold text-slate-700">
                                                        Tanggal Mulai Berlaku
                                                    </Label>
                                                    <Input
                                                        id="tanggal_berlaku_akreditasi"
                                                        type="date"
                                                        value={data.tanggal_berlaku_akreditasi}
                                                        onChange={(e) => setData('tanggal_berlaku_akreditasi', e.target.value)}
                                                        className="text-sm"
                                                    />
                                                    {errors.tanggal_berlaku_akreditasi && <p className="text-xs text-rose-500">{errors.tanggal_berlaku_akreditasi}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="tanggal_berakhir_akreditasi" className="text-xs font-semibold text-slate-700">
                                                        Tanggal Kadaluarsa SK
                                                    </Label>
                                                    <Input
                                                        id="tanggal_berakhir_akreditasi"
                                                        type="date"
                                                        value={data.tanggal_berakhir_akreditasi}
                                                        onChange={(e) => setData('tanggal_berakhir_akreditasi', e.target.value)}
                                                        className="text-sm"
                                                    />
                                                    {errors.tanggal_berakhir_akreditasi && <p className="text-xs text-rose-500">{errors.tanggal_berakhir_akreditasi}</p>}
                                                </div>
                                            </div>

                                            {/* Berkas Sertifikat */}
                                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                                <Label className="text-xs font-semibold text-slate-700 block">
                                                    Berkas Sertifikat Akreditasi (PDF/Gambar, Maks 5MB)
                                                </Label>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    {perguruanTinggi.file_sertifikat_akreditasi_url && !data.hapus_file_sertifikat && (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                                                            <FileText className="size-4 text-emerald-600" />
                                                            <span className="truncate max-w-[200px]">Sertifikat Akreditasi Terunggah</span>
                                                            <a
                                                                href={perguruanTinggi.file_sertifikat_akreditasi_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-0.5 ml-1"
                                                            >
                                                                <Download className="size-3" /> Unduh
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => setData('hapus_file_sertifikat', true)}
                                                                className="text-rose-500 hover:text-rose-700 ml-2 cursor-pointer"
                                                                title="Hapus berkas"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <Input
                                                        id="file_sertifikat_akreditasi"
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                                        onChange={(e) => handleFileChange('file_sertifikat_akreditasi', e.target.files?.[0] || null)}
                                                        className="text-xs max-w-sm"
                                                    />
                                                </div>
                                                {errors.file_sertifikat_akreditasi && (
                                                    <p className="text-xs text-rose-500">{errors.file_sertifikat_akreditasi}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* 3. SEKSI ALAMAT & TITIK PRESENSI GPS */}
                            {activeSection === 'kontak' && (
                                <div className="space-y-6 animate-fadeIn">
                                    {/* Alamat Rinci */}
                                    <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
                                        <CardHeader className="p-5 sm:p-6 border-b border-slate-100 pb-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                        <MapPin className="size-4.5 text-emerald-600" />
                                                        <span>Domisili & Alamat Rinci Kampus</span>
                                                    </CardTitle>
                                                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                                                        Rincian wilayah domisili untuk pelaporan PDDIKTI dan korespondensi.
                                                    </CardDescription>
                                                </div>

                                                {(data.jalan || data.alamat) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(data.jalan ? `${data.jalan}, ${data.kecamatan}, ${data.kota_kabupaten}` : data.alamat, 'Alamat Kampus')}
                                                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        {copiedField === 'Alamat Kampus' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                                                        <span>{copiedField === 'Alamat Kampus' ? 'Alamat Tersalin' : 'Salin Alamat'}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-6 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <Label htmlFor="jalan" className="text-xs font-semibold text-slate-700">
                                                        Nama Jalan & Nomor Bangunan
                                                    </Label>
                                                    <Input
                                                        id="jalan"
                                                        value={data.jalan}
                                                        onChange={(e) => setData('jalan', e.target.value)}
                                                        placeholder="Contoh: Jl. Pesantren Terpadu Al-Yasini"
                                                        className="text-sm"
                                                    />
                                                    {errors.jalan && <p className="text-xs text-rose-500">{errors.jalan}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="rt_rw" className="text-xs font-semibold text-slate-700">
                                                        RT / RW
                                                    </Label>
                                                    <Input
                                                        id="rt_rw"
                                                        value={data.rt_rw}
                                                        onChange={(e) => setData('rt_rw', e.target.value)}
                                                        placeholder="Contoh: 02/05"
                                                        className="text-sm"
                                                    />
                                                    {errors.rt_rw && <p className="text-xs text-rose-500">{errors.rt_rw}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="dusun" className="text-xs font-semibold text-slate-700">
                                                        Dusun / Lingkungan
                                                    </Label>
                                                    <Input
                                                        id="dusun"
                                                        value={data.dusun}
                                                        onChange={(e) => setData('dusun', e.target.value)}
                                                        placeholder="Contoh: Areng-Areng"
                                                        className="text-sm"
                                                    />
                                                    {errors.dusun && <p className="text-xs text-rose-500">{errors.dusun}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="kelurahan" className="text-xs font-semibold text-slate-700">
                                                        Kelurahan / Desa
                                                    </Label>
                                                    <Input
                                                        id="kelurahan"
                                                        value={data.kelurahan}
                                                        onChange={(e) => setData('kelurahan', e.target.value)}
                                                        placeholder="Contoh: Sambisirah"
                                                        className="text-sm"
                                                    />
                                                    {errors.kelurahan && <p className="text-xs text-rose-500">{errors.kelurahan}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="kecamatan" className="text-xs font-semibold text-slate-700">
                                                        Kecamatan
                                                    </Label>
                                                    <Input
                                                        id="kecamatan"
                                                        value={data.kecamatan}
                                                        onChange={(e) => setData('kecamatan', e.target.value)}
                                                        placeholder="Contoh: Wonorejo"
                                                        className="text-sm"
                                                    />
                                                    {errors.kecamatan && <p className="text-xs text-rose-500">{errors.kecamatan}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="kota_kabupaten" className="text-xs font-semibold text-slate-700">
                                                        Kota / Kabupaten
                                                    </Label>
                                                    <Input
                                                        id="kota_kabupaten"
                                                        value={data.kota_kabupaten}
                                                        onChange={(e) => setData('kota_kabupaten', e.target.value)}
                                                        placeholder="Contoh: Pasuruan"
                                                        className="text-sm"
                                                    />
                                                    {errors.kota_kabupaten && <p className="text-xs text-rose-500">{errors.kota_kabupaten}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="provinsi" className="text-xs font-semibold text-slate-700">
                                                        Provinsi
                                                    </Label>
                                                    <Input
                                                        id="provinsi"
                                                        value={data.provinsi}
                                                        onChange={(e) => setData('provinsi', e.target.value)}
                                                        placeholder="Contoh: Jawa Timur"
                                                        className="text-sm"
                                                    />
                                                    {errors.provinsi && <p className="text-xs text-rose-500">{errors.provinsi}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="kode_pos" className="text-xs font-semibold text-slate-700">
                                                        Kode Pos
                                                    </Label>
                                                    <Input
                                                        id="kode_pos"
                                                        value={data.kode_pos}
                                                        onChange={(e) => setData('kode_pos', e.target.value)}
                                                        placeholder="Contoh: 67173"
                                                        className="text-sm font-mono"
                                                    />
                                                    {errors.kode_pos && <p className="text-xs text-rose-500">{errors.kode_pos}</p>}
                                                </div>

                                                <div className="space-y-1.5 md:col-span-3">
                                                    <Label htmlFor="alamat" className="text-xs font-semibold text-slate-700">
                                                        Alamat Lengkap Formal (Teks Cetak Dokumen)
                                                    </Label>
                                                    <Input
                                                        id="alamat"
                                                        value={data.alamat}
                                                        onChange={(e) => setData('alamat', e.target.value)}
                                                        placeholder="Contoh: Jl. Pesantren Terpadu Al-Yasini Kec. Wonorejo Kab. Pasuruan 67173"
                                                        className="text-sm"
                                                    />
                                                    {errors.alamat && <p className="text-xs text-rose-500">{errors.alamat}</p>}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Kontak Resmi */}
                                    <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
                                        <CardHeader className="p-5 sm:p-6 border-b border-slate-100 pb-4">
                                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                <Phone className="size-4.5 text-emerald-600" />
                                                <span>Kontak Resmi & Portal Kampus</span>
                                            </CardTitle>
                                            <CardDescription className="text-xs text-slate-500 mt-0.5">
                                                Kanal komunikasi resmi perguruan tinggi untuk civitas dan publik.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="telepon" className="text-xs font-semibold text-slate-700">
                                                        Telepon Utama / Kantor
                                                    </Label>
                                                    <Input
                                                        id="telepon"
                                                        value={data.telepon}
                                                        onChange={(e) => setData('telepon', e.target.value)}
                                                        placeholder="Contoh: 081333220202"
                                                        className="text-sm font-mono"
                                                    />
                                                    {errors.telepon && <p className="text-xs text-rose-500">{errors.telepon}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="telepon_2" className="text-xs font-semibold text-slate-700">
                                                        Telepon 2 / Hotline Mahasiswa
                                                    </Label>
                                                    <Input
                                                        id="telepon_2"
                                                        value={data.telepon_2}
                                                        onChange={(e) => setData('telepon_2', e.target.value)}
                                                        placeholder="Contoh: 081234567890"
                                                        className="text-sm font-mono"
                                                    />
                                                    {errors.telepon_2 && <p className="text-xs text-rose-500">{errors.telepon_2}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="fax" className="text-xs font-semibold text-slate-700">
                                                        Fax (Faksimili)
                                                    </Label>
                                                    <Input
                                                        id="fax"
                                                        value={data.fax}
                                                        onChange={(e) => setData('fax', e.target.value)}
                                                        placeholder="Contoh: (0343) 123456"
                                                        className="text-sm font-mono"
                                                    />
                                                    {errors.fax && <p className="text-xs text-rose-500">{errors.fax}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                                                            Email Resmi (.ac.id)
                                                        </Label>
                                                        {data.email && (
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(data.email, 'Email Resmi')}
                                                                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                                                            >
                                                                {copiedField === 'Email Resmi' ? <Check className="size-3" /> : <Copy className="size-3" />}
                                                                <span>{copiedField === 'Email Resmi' ? 'Tersalin' : 'Salin'}</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        placeholder="Contoh: info@stai-alyasini.ac.id"
                                                        className="text-sm"
                                                    />
                                                    {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                                                </div>

                                                <div className="space-y-1.5 md:col-span-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="website" className="text-xs font-semibold text-slate-700">
                                                            Website Resmi Kampus
                                                        </Label>
                                                        {data.website && (
                                                            <a
                                                                href={data.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                                                            >
                                                                <ExternalLink className="size-3" /> Kunjungi
                                                            </a>
                                                        )}
                                                    </div>
                                                    <Input
                                                        id="website"
                                                        value={data.website}
                                                        onChange={(e) => setData('website', e.target.value)}
                                                        placeholder="Contoh: https://www.stai-alyasini.ac.id"
                                                        className="text-sm"
                                                    />
                                                    {errors.website && <p className="text-xs text-rose-500">{errors.website}</p>}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Titik Presensi GPS & Geofencing dengan Interactive Map */}
                                    <Card className="border border-emerald-200/90 shadow-xs bg-emerald-50/20 rounded-2xl overflow-hidden">
                                        <CardHeader className="p-5 sm:p-6 border-b border-emerald-100 pb-4 bg-white/70">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <CardTitle className="text-base font-bold text-emerald-950 flex items-center gap-2">
                                                        <Navigation className="size-4.5 text-emerald-600" />
                                                        <span>Titik Koordinat Geofencing Presensi (GPS)</span>
                                                    </CardTitle>
                                                    <CardDescription className="text-xs text-emerald-800 mt-0.5">
                                                        Titik pusat kampus untuk validasi radius absensi mobile web dosen dan mahasiswa.
                                                    </CardDescription>
                                                </div>

                                                {/* Button: Gunakan Lokasi GPS Saat Ini */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        onClick={detectCurrentLocation}
                                                        disabled={isDetectingLocation}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8.5 rounded-xl shadow-2xs gap-1.5 cursor-pointer shrink-0"
                                                    >
                                                        {isDetectingLocation ? (
                                                            <>
                                                                <Loader2 className="size-3.5 animate-spin" />
                                                                <span>Mendeteksi GPS...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Crosshair className="size-3.5" />
                                                                <span>Gunakan Lokasi GPS Saya</span>
                                                            </>
                                                        )}
                                                    </Button>

                                                    {data.lintang && data.bujur && (
                                                        <a
                                                            href={`https://www.google.com/maps?q=${data.lintang},${data.bujur}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-700 text-xs font-semibold shadow-2xs hover:bg-emerald-50 shrink-0 h-8.5"
                                                        >
                                                            <MapPin className="size-3.5" /> Google Maps
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-6 space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="lintang" className="text-xs font-semibold text-slate-700">
                                                        Latitude (Garis Lintang)
                                                    </Label>
                                                    <Input
                                                        id="lintang"
                                                        value={data.lintang}
                                                        onChange={(e) => setData('lintang', e.target.value)}
                                                        placeholder="Contoh: -7.7123456"
                                                        className="text-sm font-mono bg-white"
                                                    />
                                                    <p className="text-[11px] text-slate-500">Antara -90 s/d 90 derajat desimal.</p>
                                                    {errors.lintang && <p className="text-xs text-rose-500">{errors.lintang}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="bujur" className="text-xs font-semibold text-slate-700">
                                                        Longitude (Garis Bujur)
                                                    </Label>
                                                    <Input
                                                        id="bujur"
                                                        value={data.bujur}
                                                        onChange={(e) => setData('bujur', e.target.value)}
                                                        placeholder="Contoh: 112.8987654"
                                                        className="text-sm font-mono bg-white"
                                                    />
                                                    <p className="text-[11px] text-slate-500">Antara -180 s/d 180 derajat desimal.</p>
                                                    {errors.bujur && <p className="text-xs text-rose-500">{errors.bujur}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="radius_presensi" className="text-xs font-semibold text-slate-700">
                                                        Toleransi Radius Presensi (Meter)
                                                    </Label>
                                                    <Input
                                                        id="radius_presensi"
                                                        type="number"
                                                        min="10"
                                                        max="10000"
                                                        value={data.radius_presensi}
                                                        onChange={(e) => setData('radius_presensi', parseInt(e.target.value) || 100)}
                                                        placeholder="100"
                                                        className="text-sm font-mono bg-white"
                                                    />
                                                    <p className="text-[11px] text-emerald-800">
                                                        Radius presensi kehadiran (default: 100 meter).
                                                    </p>
                                                    {errors.radius_presensi && <p className="text-xs text-rose-500">{errors.radius_presensi}</p>}
                                                </div>
                                            </div>

                                            {/* Interactive Map Visualizer */}
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                        <Compass className="size-3.5 text-emerald-600" />
                                                        Pratinjau Peta Lokasi Kampus (OpenStreetMap)
                                                    </span>
                                                    {data.lintang && data.bujur && (
                                                        <span className="text-[11px] text-slate-500 font-mono">
                                                            Radius validasi: {data.radius_presensi || 100}m
                                                        </span>
                                                    )}
                                                </div>

                                                {osmEmbedUrl ? (
                                                    <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-xs bg-slate-100 h-64 sm:h-72">
                                                        <iframe
                                                            title="Pratinjau Peta Kampus"
                                                            src={osmEmbedUrl}
                                                            className="w-full h-full border-0"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-700 shadow-2xs">
                                                            Pusat Radius Presensi: {data.lintang}, {data.bujur}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center space-y-2">
                                                        <MapPin className="size-8 mx-auto text-slate-300 stroke-1" />
                                                        <p className="text-xs text-slate-600 font-medium">
                                                            Koordinat lokasi belum dimasukkan
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                                                            Klik tombol <b>"Gunakan Lokasi GPS Saya"</b> di atas atau masukkan latitude dan longitude secara manual untuk memvisualisasikan peta kampus.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* 4. SEKSI PIMPINAN & PEJABAT INSTITUSI */}
                            {activeSection === 'pimpinan' && (
                                <div className="space-y-6 animate-fadeIn">
                                    {/* Rektor / Ketua */}
                                    <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
                                        <CardHeader className="p-5 sm:p-6 border-b border-slate-100 pb-4">
                                            <div>
                                                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                    <UserCheck className="size-4.5 text-emerald-600" />
                                                    <span>Rektor / Ketua Perguruan Tinggi</span>
                                                </CardTitle>
                                                <CardDescription className="text-xs text-slate-500 mt-0.5">
                                                    Pimpinan tertinggi penanggung jawab ijazah, yudisium, dan legalitas dokumen resmi kampus.
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-6 space-y-6">
                                            {/* Searchable Combobox & Mini Profile Card */}
                                            <DosenSearchCombobox
                                                label="Hubungkan ke Master Dosen (Rektor / Ketua)"
                                                sublabel="Pilih dosen dari master data untuk menghubungkan relasi database dan sinkronisasi otomatis biodata pimpinan"
                                                placeholder="Cari dosen berdasarkan nama lengkap, gelar, NIDN, atau prodi..."
                                                dosens={dosens}
                                                selectedDosen={selectedKetuaDosen}
                                                onSelect={handleKetuaSelect}
                                                onClear={handleClearKetuaDosen}
                                                error={errors.ketua_dosen_id}
                                            />

                                            {/* Status Sinksronisasi Notice */}
                                            {selectedKetuaDosen ? (
                                                <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                                                    <Check className="size-4 text-emerald-600 shrink-0" />
                                                    <span>
                                                        Biodata Rektor/Ketua terhubung dengan Master Dosen. Kolom formulir di bawah ini diisi otomatis dan dapat disesuaikan untuk kebutuhan pencetakan.
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                                                    <Info className="size-4 text-slate-400 shrink-0" />
                                                    <span>
                                                        Rektor/Ketua saat ini diatur secara manual (non-dosen / eksternal). Gunakan pencarian di atas kapan saja untuk menghubungkan ke Master Dosen.
                                                    </span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="ketua_gelar_depan" className="text-xs font-semibold text-slate-700">
                                                        Gelar Depan
                                                    </Label>
                                                    <Input
                                                        id="ketua_gelar_depan"
                                                        value={data.ketua_gelar_depan}
                                                        onChange={(e) => setData('ketua_gelar_depan', e.target.value)}
                                                        placeholder="Contoh: Dr. / Prof."
                                                        className="text-sm"
                                                    />
                                                    {errors.ketua_gelar_depan && <p className="text-xs text-rose-500">{errors.ketua_gelar_depan}</p>}
                                                </div>

                                                <div className="space-y-1.5 md:col-span-2">
                                                    <Label htmlFor="ketua_nama" className="text-xs font-semibold text-slate-700">
                                                        Nama Lengkap Rektor / Ketua
                                                    </Label>
                                                    <Input
                                                        id="ketua_nama"
                                                        value={data.ketua_nama}
                                                        onChange={(e) => setData('ketua_nama', e.target.value)}
                                                        placeholder="Contoh: Akh. Syamsul Muniri"
                                                        className="text-sm font-semibold"
                                                    />
                                                    {errors.ketua_nama && <p className="text-xs text-rose-500">{errors.ketua_nama}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="ketua_gelar_belakang" className="text-xs font-semibold text-slate-700">
                                                        Gelar Belakang
                                                    </Label>
                                                    <Input
                                                        id="ketua_gelar_belakang"
                                                        value={data.ketua_gelar_belakang}
                                                        onChange={(e) => setData('ketua_gelar_belakang', e.target.value)}
                                                        placeholder="Contoh: M.S.I / Ph.D"
                                                        className="text-sm"
                                                    />
                                                    {errors.ketua_gelar_belakang && <p className="text-xs text-rose-500">{errors.ketua_gelar_belakang}</p>}
                                                </div>

                                                <div className="space-y-1.5 md:col-span-2">
                                                    <Label htmlFor="ketua_nidn" className="text-xs font-semibold text-slate-700">
                                                        NIDN (Nomor Induk Dosen Nasional)
                                                    </Label>
                                                    <Input
                                                        id="ketua_nidn"
                                                        value={data.ketua_nidn}
                                                        onChange={(e) => setData('ketua_nidn', e.target.value)}
                                                        placeholder="Contoh: 2113058301"
                                                        className="text-sm font-mono"
                                                    />
                                                    {errors.ketua_nidn && <p className="text-xs text-rose-500">{errors.ketua_nidn}</p>}
                                                </div>

                                                <div className="space-y-1.5 md:col-span-2">
                                                    <Label htmlFor="ketua_nip_niy" className="text-xs font-semibold text-slate-700">
                                                        NIP / NIY / NIDK
                                                    </Label>
                                                    <Input
                                                        id="ketua_nip_niy"
                                                        value={data.ketua_nip_niy}
                                                        onChange={(e) => setData('ketua_nip_niy', e.target.value)}
                                                        placeholder="Contoh: 198305132010011001"
                                                        className="text-sm font-mono"
                                                    />
                                                    {errors.ketua_nip_niy && <p className="text-xs text-rose-500">{errors.ketua_nip_niy}</p>}
                                                </div>
                                            </div>

                                            {/* Tanda Tangan Digital Rektor (Dropzone) */}
                                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                                <Label className="text-xs font-semibold text-slate-700 block">
                                                    Tanda Tangan Digital Rektor / Ketua (Transparan PNG, Maks 2MB)
                                                </Label>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    {(localTtdPreview || (perguruanTinggi.ttd_ketua_url && !data.hapus_ttd_ketua)) ? (
                                                        <div className="relative p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                                            <img
                                                                src={localTtdPreview || perguruanTinggi.ttd_ketua_url!}
                                                                alt="TTD Rektor"
                                                                className="h-16 object-contain"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setData('hapus_ttd_ketua', true);
                                                                    setData('ttd_ketua', null);
                                                                    setLocalTtdPreview(null);
                                                                    toast.info('Tanda tangan digital dihapus.');
                                                                }}
                                                                className="absolute -top-2 -right-2 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full cursor-pointer shadow-xs"
                                                                title="Hapus TTD"
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </button>
                                                        </div>
                                                    ) : null}

                                                    <Input
                                                        id="ttd_ketua"
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp"
                                                        onChange={(e) => handleFileChange('ttd_ketua', e.target.files?.[0] || null)}
                                                        className="text-xs max-w-sm"
                                                    />
                                                </div>
                                                {errors.ttd_ketua && <p className="text-xs text-rose-500">{errors.ttd_ketua}</p>}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Wakil Ketua 1 (Bidang Akademik) */}
                                    <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
                                        <CardHeader className="p-5 sm:p-6 border-b border-slate-100 pb-4">
                                            <div>
                                                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                    <GraduationCap className="size-4.5 text-emerald-600" />
                                                    <span>Wakil Rektor I / Pembantu Ketua (Bidang Akademik)</span>
                                                </CardTitle>
                                                <CardDescription className="text-xs text-slate-500 mt-0.5">
                                                    Pejabat penandatangan berkas akademik resmi (KRS, KHS, Transkrip Sementara, Kartu Ujian).
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-6 space-y-6">
                                            {/* Searchable Combobox & Mini Profile Card */}
                                            <DosenSearchCombobox
                                                label="Hubungkan ke Master Dosen (Wakil Rektor I)"
                                                sublabel="Pilih dosen dari master data untuk menghubungkan relasi database dan sinkronisasi otomatis pejabat bidang akademik"
                                                placeholder="Cari dosen berdasarkan nama lengkap, gelar, NIDN, atau prodi..."
                                                dosens={dosens}
                                                selectedDosen={selectedWakilKetua1Dosen}
                                                onSelect={handleWakilKetua1Select}
                                                onClear={handleClearWakilKetua1Dosen}
                                                error={errors.wakil_ketua_1_dosen_id}
                                            />

                                            {/* Status Sinksronisasi Notice */}
                                            {selectedWakilKetua1Dosen ? (
                                                <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                                                    <Check className="size-4 text-emerald-600 shrink-0" />
                                                    <span>
                                                        Biodata Wakil Rektor I terhubung dengan Master Dosen. Kolom formulir di bawah ini diisi otomatis dan dapat disesuaikan untuk kebutuhan pencetakan.
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                                                    <Info className="size-4 text-slate-400 shrink-0" />
                                                    <span>
                                                        Wakil Rektor I saat ini diatur secara manual. Gunakan pencarian di atas kapan saja untuk menghubungkan ke Master Dosen.
                                                    </span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="wakil_ketua_1_gelar_depan" className="text-xs font-semibold text-slate-700">
                                                        Gelar Depan
                                                    </Label>
                                                    <Input
                                                        id="wakil_ketua_1_gelar_depan"
                                                        value={data.wakil_ketua_1_gelar_depan}
                                                        onChange={(e) => setData('wakil_ketua_1_gelar_depan', e.target.value)}
                                                        placeholder="Contoh: Dr."
                                                        className="text-sm"
                                                    />
                                                </div>

                                                <div className="space-y-1.5 md:col-span-2">
                                                    <Label htmlFor="wakil_ketua_1_nama" className="text-xs font-semibold text-slate-700">
                                                        Nama Lengkap Wakil Rektor I
                                                    </Label>
                                                    <Input
                                                        id="wakil_ketua_1_nama"
                                                        value={data.wakil_ketua_1_nama}
                                                        onChange={(e) => setData('wakil_ketua_1_nama', e.target.value)}
                                                        placeholder="Contoh: Mohamad Mishbahuddin"
                                                        className="text-sm font-semibold"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="wakil_ketua_1_gelar_belakang" className="text-xs font-semibold text-slate-700">
                                                        Gelar Belakang
                                                    </Label>
                                                    <Input
                                                        id="wakil_ketua_1_gelar_belakang"
                                                        value={data.wakil_ketua_1_gelar_belakang}
                                                        onChange={(e) => setData('wakil_ketua_1_gelar_belakang', e.target.value)}
                                                        placeholder="Contoh: M.Pd.I"
                                                        className="text-sm"
                                                    />
                                                </div>

                                                <div className="space-y-1.5 md:col-span-2">
                                                    <Label htmlFor="wakil_ketua_1_nidn" className="text-xs font-semibold text-slate-700">
                                                        NIDN Wakil Rektor I
                                                    </Label>
                                                    <Input
                                                        id="wakil_ketua_1_nidn"
                                                        value={data.wakil_ketua_1_nidn}
                                                        onChange={(e) => setData('wakil_ketua_1_nidn', e.target.value)}
                                                        placeholder="Contoh: 2104118501"
                                                        className="text-sm font-mono"
                                                    />
                                                </div>

                                                <div className="space-y-1.5 md:col-span-2">
                                                    <Label htmlFor="wakil_ketua_1" className="text-xs font-semibold text-slate-700">
                                                        Format Teks Snapshot Dokumen
                                                    </Label>
                                                    <Input
                                                        id="wakil_ketua_1"
                                                        value={data.wakil_ketua_1}
                                                        onChange={(e) => setData('wakil_ketua_1', e.target.value)}
                                                        placeholder="2104118501 - Dr. Mohamad Mishbahuddin, M.Pd.I"
                                                        className="text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Wakil Rektor Lainnya */}
                                    <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
                                        <CardHeader className="p-5 sm:p-6 border-b border-slate-100 pb-4">
                                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                <Users className="size-4.5 text-emerald-600" />
                                                <span>Pejabat Wakil Rektor / Pembantu Ketua Lainnya</span>
                                            </CardTitle>
                                            <CardDescription className="text-xs text-slate-500 mt-0.5">
                                                Struktur pimpinan bidang administrasi umum, kemahasiswaan, dan kelembagaan.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="wakil_ketua_2" className="text-xs font-semibold text-slate-700">
                                                        Wakil II (Keuangan & Umum)
                                                    </Label>
                                                    <Input
                                                        id="wakil_ketua_2"
                                                        value={data.wakil_ketua_2}
                                                        onChange={(e) => setData('wakil_ketua_2', e.target.value)}
                                                        placeholder="Contoh: Muhammad Sholeh, M.Pd"
                                                        className="text-sm"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="wakil_ketua_3" className="text-xs font-semibold text-slate-700">
                                                        Wakil III (Kemahasiswaan)
                                                    </Label>
                                                    <Input
                                                        id="wakil_ketua_3"
                                                        value={data.wakil_ketua_3}
                                                        onChange={(e) => setData('wakil_ketua_3', e.target.value)}
                                                        placeholder="Nama pejabat wakil III..."
                                                        className="text-sm"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="wakil_ketua_4" className="text-xs font-semibold text-slate-700">
                                                        Wakil IV (Kerjasama & Kelembagaan)
                                                    </Label>
                                                    <Input
                                                        id="wakil_ketua_4"
                                                        value={data.wakil_ketua_4}
                                                        onChange={(e) => setData('wakil_ketua_4', e.target.value)}
                                                        placeholder="Nama pejabat wakil IV..."
                                                        className="text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* 5. SEKSI IDENTITAS VISUAL & KOP DOKUMEN */}
                            {activeSection === 'branding' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
                                        <CardHeader className="p-5 sm:p-6 border-b border-slate-100 pb-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                        <Palette className="size-4.5 text-emerald-600" />
                                                        <span>Aset Identitas Visual & Grafis Resmi Kampus</span>
                                                    </CardTitle>
                                                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                                                        Berkas grafis resmi institusi untuk logo sistem, kop cetak dokumen, dan stempel verifikasi.
                                                    </CardDescription>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsKopModalOpen(true)}
                                                    className="bg-white hover:bg-slate-50 text-xs font-semibold text-emerald-700 border-emerald-300 gap-1.5 h-9 rounded-xl shadow-2xs cursor-pointer shrink-0"
                                                >
                                                    <Eye className="size-3.5 text-emerald-600" />
                                                    <span>Tinjau Kop Dokumen Resmi</span>
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Modern Dropzone 1: Logo Utama dengan Drag-and-Drop */}
                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setDragOverField('logo'); }}
                                                    onDragLeave={() => setDragOverField(null)}
                                                    onDrop={(e) => handleDrop('logo', e)}
                                                    className={`p-4.5 rounded-2xl border transition-all space-y-3 ${
                                                        dragOverField === 'logo'
                                                            ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-200 scale-[1.02] shadow-md'
                                                            : 'border-slate-200/90 bg-slate-50/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-bold text-slate-800">
                                                            1. Logo Utama Kampus
                                                        </Label>
                                                        <span className="text-[10px] text-slate-500 font-mono">PNG/JPG/WEBP</span>
                                                    </div>

                                                    <div className="h-32 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-3 relative overflow-hidden group shadow-2xs">
                                                        {localLogoPreview || (perguruanTinggi.logo_url && !data.hapus_logo) ? (
                                                            <>
                                                                <img
                                                                    src={localLogoPreview || perguruanTinggi.logo_url!}
                                                                    alt="Logo Utama"
                                                                    className="max-h-full max-w-full object-contain"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setData('hapus_logo', true);
                                                                        setData('logo', null);
                                                                        setLocalLogoPreview(null);
                                                                        toast.info('Logo utama ditandai untuk dihapus.');
                                                                    }}
                                                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white cursor-pointer shadow-xs transition-opacity"
                                                                    title="Hapus Logo"
                                                                >
                                                                    <Trash2 className="size-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="text-center text-slate-400 space-y-1">
                                                                <Upload className={`size-6 mx-auto stroke-1 transition-transform ${dragOverField === 'logo' ? 'scale-110 text-emerald-600 animate-bounce' : 'text-slate-300'}`} />
                                                                <span className="text-[11px] block">
                                                                    {dragOverField === 'logo' ? 'Lepaskan berkas di sini...' : 'Tarik & lepas berkas ke sini'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Input
                                                        id="logo"
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp"
                                                        onChange={(e) => handleFileChange('logo', e.target.files?.[0] || null)}
                                                        className="text-xs bg-white"
                                                    />
                                                    <p className="text-[11px] text-slate-500">Maksimal ukuran file 2MB.</p>
                                                    {errors.logo && <p className="text-xs text-rose-500">{errors.logo}</p>}
                                                </div>

                                                {/* Modern Dropzone 2: Logo Kop Surat dengan Drag-and-Drop */}
                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setDragOverField('logo_kop'); }}
                                                    onDragLeave={() => setDragOverField(null)}
                                                    onDrop={(e) => handleDrop('logo_kop', e)}
                                                    className={`p-4.5 rounded-2xl border transition-all space-y-3 ${
                                                        dragOverField === 'logo_kop'
                                                            ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-200 scale-[1.02] shadow-md'
                                                            : 'border-slate-200/90 bg-slate-50/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-bold text-slate-800">
                                                            2. Logo Khusus Kop Surat
                                                        </Label>
                                                        <span className="text-[10px] text-slate-500 font-mono">Transparan High-res</span>
                                                    </div>

                                                    <div className="h-32 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-3 relative overflow-hidden group shadow-2xs">
                                                        {localLogoKopPreview || (perguruanTinggi.logo_kop_url && !data.hapus_logo_kop) ? (
                                                            <>
                                                                <img
                                                                    src={localLogoKopPreview || perguruanTinggi.logo_kop_url!}
                                                                    alt="Logo Kop"
                                                                    className="max-h-full max-w-full object-contain"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setData('hapus_logo_kop', true);
                                                                        setData('logo_kop', null);
                                                                        setLocalLogoKopPreview(null);
                                                                        toast.info('Logo kop surat ditandai untuk dihapus.');
                                                                    }}
                                                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white cursor-pointer shadow-xs transition-opacity"
                                                                    title="Hapus Logo Kop"
                                                                >
                                                                    <Trash2 className="size-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="text-center text-slate-400 space-y-1">
                                                                <Upload className={`size-6 mx-auto stroke-1 transition-transform ${dragOverField === 'logo_kop' ? 'scale-110 text-emerald-600 animate-bounce' : 'text-slate-300'}`} />
                                                                <span className="text-[11px] block">
                                                                    {dragOverField === 'logo_kop' ? 'Lepaskan berkas di sini...' : 'Fallback ke Logo Utama'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Input
                                                        id="logo_kop"
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp"
                                                        onChange={(e) => handleFileChange('logo_kop', e.target.files?.[0] || null)}
                                                        className="text-xs bg-white"
                                                    />
                                                    <p className="text-[11px] text-slate-500">Khusus berkas cetak dokumen A4.</p>
                                                    {errors.logo_kop && <p className="text-xs text-rose-500">{errors.logo_kop}</p>}
                                                </div>

                                                {/* Modern Dropzone 3: Stempel Resmi dengan Drag-and-Drop */}
                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setDragOverField('stempel'); }}
                                                    onDragLeave={() => setDragOverField(null)}
                                                    onDrop={(e) => handleDrop('stempel', e)}
                                                    className={`p-4.5 rounded-2xl border transition-all space-y-3 ${
                                                        dragOverField === 'stempel'
                                                            ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-200 scale-[1.02] shadow-md'
                                                            : 'border-slate-200/90 bg-slate-50/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-bold text-slate-800">
                                                            3. Stempel Digital Resmi
                                                        </Label>
                                                        <span className="text-[10px] text-slate-500 font-mono">PNG Transparan</span>
                                                    </div>

                                                    <div className="h-32 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-3 relative overflow-hidden group shadow-2xs">
                                                        {localStempelPreview || (perguruanTinggi.stempel_url && !data.hapus_stempel) ? (
                                                            <>
                                                                <img
                                                                    src={localStempelPreview || perguruanTinggi.stempel_url!}
                                                                    alt="Stempel Resmi"
                                                                    className="max-h-full max-w-full object-contain"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setData('hapus_stempel', true);
                                                                        setData('stempel', null);
                                                                        setLocalStempelPreview(null);
                                                                        toast.info('Stempel digital ditandai untuk dihapus.');
                                                                    }}
                                                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white cursor-pointer shadow-xs transition-opacity"
                                                                    title="Hapus Stempel"
                                                                >
                                                                    <Trash2 className="size-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="text-center text-slate-400 space-y-1">
                                                                <Upload className={`size-6 mx-auto stroke-1 transition-transform ${dragOverField === 'stempel' ? 'scale-110 text-emerald-600 animate-bounce' : 'text-slate-300'}`} />
                                                                <span className="text-[11px] block">
                                                                    {dragOverField === 'stempel' ? 'Lepaskan berkas di sini...' : 'Belum ada stempel digital'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Input
                                                        id="stempel"
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp"
                                                        onChange={(e) => handleFileChange('stempel', e.target.files?.[0] || null)}
                                                        className="text-xs bg-white"
                                                    />
                                                    <p className="text-[11px] text-slate-500">Stempel resmi lembar pengesahan.</p>
                                                    {errors.stempel && <p className="text-xs text-rose-500">{errors.stempel}</p>}
                                                </div>
                                            </div>

                                            {/* Preview Card Snippet */}
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                                                        <FileCheck className="size-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-900">
                                                            Kop Dokumen Resmi Akademik Otomatis
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500">
                                                            Logo dan data institusi di atas langsung disinkronkan ke dokumen KRS, KHS, Transkrip, dan Kartu Ujian.
                                                        </p>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    onClick={() => setIsKopModalOpen(true)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-9 rounded-xl shadow-xs gap-1.5 cursor-pointer shrink-0"
                                                >
                                                    <Eye className="size-3.5" />
                                                    <span>Lihat Pratinjau Kertas A4</span>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </form>
                    </main>
                </div>

                {/* CONDITIONAL FLOATING ACTION BAR (SHOPIFY / LINEAR STYLE) */}
                <div
                    className={`fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-2xl px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-4 transition-all duration-300 ease-out transform ${
                        isDirty
                            ? 'translate-y-0 opacity-100 pointer-events-auto'
                            : 'translate-y-28 opacity-0 pointer-events-none'
                    }`}
                >
                    <div className="flex items-center gap-2.5 text-xs min-w-0">
                        <span className="size-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        <span className="font-medium text-slate-800 truncate">
                            Ada perubahan data formulir institusi yang belum disimpan.
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleReset}
                            disabled={processing}
                            className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold h-9 px-3 rounded-xl gap-1.5 cursor-pointer transition-colors"
                        >
                            <RotateCcw className="size-3.5" />
                            <span className="hidden sm:inline">Batalkan</span>
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-4 sm:px-6 h-9 sm:h-10 rounded-xl shadow-xs gap-2 cursor-pointer transition-all"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    <span>Simpan Perubahan</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* MODAL DIALOG: PRATINJAU KOP DOKUMEN RESMI (A4 MOCKUP) */}
                <Dialog open={isKopModalOpen} onOpenChange={setIsKopModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-7 rounded-2xl">
                        <DialogHeader className="border-b border-slate-100 pb-3">
                            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <FileCheck className="size-5 text-emerald-600" />
                                <span>Pratinjau Kop Surat Resmi Dokumen Akademik</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Simulasi kop surat pada cetakan resmi civitas (KRS, KHS, Transkrip Nilai, Kartu Ujian, dan Berita Acara).
                            </DialogDescription>
                        </DialogHeader>

                        {/* Paper Sheet Simulator */}
                        <div className="my-4 p-6 sm:p-10 bg-white border border-slate-300 rounded-xl shadow-xs max-w-3xl mx-auto">
                            <KopSuratResmi
                                title="KARTU HASIL STUDI (KHS)"
                                subtitle="SEMESTER GANJIL TAHUN AKADEMIK 2025/2026"
                                nomorDokumen="042/STAI-AY/AKAD/IX/2026"
                                data={{
                                    nama_unit: data.nama_unit,
                                    nama_singkat: data.nama_singkat,
                                    lembaga_naungan: data.lembaga_naungan,
                                    peringkat_akreditasi: data.peringkat_akreditasi,
                                    lembaga_akreditasi: data.lembaga_akreditasi,
                                    no_sk_pendirian: data.no_sk_pendirian,
                                    no_sk_akreditasi: data.no_sk_akreditasi,
                                    alamat: data.alamat,
                                    website: data.website,
                                    email: data.email,
                                    telepon: data.telepon,
                                    logo_url: activeLogoUrl,
                                    logo_kop_url: activeLogoUrl,
                                }}
                            />

                            <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center text-xs text-slate-400 space-y-1">
                                <p className="font-mono text-[11px]">*** FORMAT KOP RESMI SIAKAD AL-YASINI BERSTANDAR SEVIMA ***</p>
                                <p className="text-[10px]">Logo di atas otomatis terpasang pada seluruh cetakan dokumen akademik tanpa penyesuaian manual.</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsKopModalOpen(false)}
                                className="text-xs font-semibold rounded-xl"
                            >
                                Tutup Pratinjau
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
