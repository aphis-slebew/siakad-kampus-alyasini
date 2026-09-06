import React, { useMemo, useState } from 'react';
import { Check, Search, UserCheck, Users, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface DosenOption {
    id: number;
    nama_lengkap: string;
    gelar_depan?: string | null;
    gelar_belakang?: string | null;
    nama_bergelar?: string;
    nidn?: string | null;
    niy_nip?: string | null;
    status_kepegawaian?: string | null;
    foto_url?: string | null;
    program_studi?: {
        id: number;
        nama: string;
    } | null;
}

export interface DosenSearchComboboxProps {
    label: string;
    sublabel?: string;
    placeholder?: string;
    dosens: DosenOption[];
    selectedDosen: DosenOption | null;
    onSelect: (dosen: DosenOption) => void;
    onClear: () => void;
    error?: string;
}

export function DosenSearchCombobox({
    label,
    sublabel,
    placeholder = 'Cari dosen berdasarkan nama lengkap, NIDN, atau prodi...',
    dosens = [],
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
                                            className="w-full text-left p-2.5 px-3.5 flex items-center justify-between gap-3 hover:bg-emerald-50/60 transition-colors cursor-pointer"
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

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        </div>
    );
}
