<?php

namespace App\Http\Requests;

use App\Models\PerguruanTinggi;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PerguruanTinggiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('master_data.manage');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // PDDIKTI & Profil Umum
            'kode_unit' => ['nullable', 'string', 'max:50'],
            'nama_unit' => ['sometimes', 'required', 'string', 'max:255'],
            'nama_unit_en' => ['nullable', 'string', 'max:255'],
            'nama_singkat' => ['nullable', 'string', 'max:100'],
            'jenis_perguruan_tinggi' => ['nullable', 'string', Rule::in(PerguruanTinggi::JENIS_PT)],
            'status_milik' => ['nullable', 'string', Rule::in(PerguruanTinggi::STATUS_MILIK)],
            'lembaga_naungan' => ['nullable', 'string', 'max:150'],
            'periode_berdiri' => ['nullable', 'string', 'max:100'],

            // Legalitas SK Pendirian & Operasional
            'no_sk_pendirian' => ['nullable', 'string', 'max:150'],
            'tanggal_sk_pendirian' => ['nullable', 'date'],
            'no_sk_operasional' => ['nullable', 'string', 'max:150'],
            'tanggal_sk_operasional' => ['nullable', 'date'],

            // Akreditasi Institusi
            'lembaga_akreditasi' => ['sometimes', 'required', 'string', Rule::in(PerguruanTinggi::LEMBAGA_AKREDITASI)],
            'peringkat_akreditasi' => ['sometimes', 'required', 'string', Rule::in(PerguruanTinggi::PERINGKAT_AKREDITASI)],
            'nilai_akreditasi' => ['nullable', 'string', 'max:50'],
            'no_sk_akreditasi' => ['nullable', 'string', 'max:150'],
            'tanggal_sk_akreditasi' => ['nullable', 'date'],
            'tanggal_berlaku_akreditasi' => ['nullable', 'date'],
            'tanggal_berakhir_akreditasi' => ['nullable', 'date'],
            'file_sertifikat_akreditasi' => ['nullable', 'file', 'mimetypes:application/pdf,image/jpeg,image/png,image/webp', 'max:5120'],
            'hapus_file_sertifikat' => ['nullable', 'boolean'],

            // Visi Misi & Domisili
            'visi' => ['nullable', 'string'],
            'misi' => ['nullable', 'string'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'jalan' => ['nullable', 'string', 'max:255'],
            'rt_rw' => ['nullable', 'string', 'max:50'],
            'dusun' => ['nullable', 'string', 'max:100'],
            'kelurahan' => ['nullable', 'string', 'max:100'],
            'kecamatan' => ['nullable', 'string', 'max:100'],
            'kota_kabupaten' => ['nullable', 'string', 'max:100'],
            'provinsi' => ['nullable', 'string', 'max:100'],
            'kode_pos' => ['nullable', 'string', 'max:20'],

            // Kontak & Geofencing Presensi
            'telepon' => ['nullable', 'string', 'max:50'],
            'telepon_2' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'website' => ['nullable', 'string', 'max:255'],
            'fax' => ['nullable', 'string', 'max:50'],
            'lintang' => ['nullable', 'numeric', 'between:-90,90'],
            'bujur' => ['nullable', 'numeric', 'between:-180,180'],
            'radius_presensi' => ['nullable', 'integer', 'min:10', 'max:10000'],

            // Pimpinan & Penandatangan Dokumen
            'ketua_dosen_id' => ['nullable', 'integer', 'exists:dosens,id'],
            'wakil_ketua_1_dosen_id' => ['nullable', 'integer', 'exists:dosens,id'],
            'ketua_nama' => ['nullable', 'string', 'max:255'],
            'ketua_nidn' => ['nullable', 'string', 'max:50'],
            'ketua_gelar_depan' => ['nullable', 'string', 'max:50'],
            'ketua_gelar_belakang' => ['nullable', 'string', 'max:50'],
            'ketua_nip_niy' => ['nullable', 'string', 'max:50'],
            'wakil_ketua_1' => ['nullable', 'string', 'max:255'],
            'wakil_ketua_1_nama' => ['nullable', 'string', 'max:255'],
            'wakil_ketua_1_nidn' => ['nullable', 'string', 'max:50'],
            'wakil_ketua_1_gelar_depan' => ['nullable', 'string', 'max:50'],
            'wakil_ketua_1_gelar_belakang' => ['nullable', 'string', 'max:50'],
            'wakil_ketua_2' => ['nullable', 'string', 'max:255'],
            'wakil_ketua_3' => ['nullable', 'string', 'max:255'],
            'wakil_ketua_4' => ['nullable', 'string', 'max:255'],

            // Branding Assets
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'hapus_logo' => ['nullable', 'boolean'],
            'logo_kop' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'hapus_logo_kop' => ['nullable', 'boolean'],
            'stempel' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'hapus_stempel' => ['nullable', 'boolean'],
            'ttd_ketua' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'hapus_ttd_ketua' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'kode_unit' => 'Kode Perguruan Tinggi',
            'nama_unit' => 'Nama Resmi Perguruan Tinggi',
            'nama_unit_en' => 'Nama Internasional (English)',
            'nama_singkat' => 'Singkatan Kampus',
            'jenis_perguruan_tinggi' => 'Jenis Perguruan Tinggi',
            'status_milik' => 'Status Kepemilikan',
            'no_sk_pendirian' => 'Nomor SK Pendirian',
            'no_sk_operasional' => 'Nomor SK Izin Operasional',
            'lembaga_akreditasi' => 'Lembaga Akreditasi',
            'peringkat_akreditasi' => 'Peringkat Akreditasi',
            'file_sertifikat_akreditasi' => 'File Sertifikat Akreditasi',
            'lintang' => 'Koordinat Lintang (Latitude)',
            'bujur' => 'Koordinat Bujur (Longitude)',
            'radius_presensi' => 'Radius Presensi',
            'logo' => 'Logo Utama Kampus',
            'logo_kop' => 'Logo Kop Surat Resmi',
            'stempel' => 'Stempel Resmi Digital',
            'ttd_ketua' => 'Tanda Tangan Digital Rektor/Ketua',
            'ketua_dosen_id' => 'Data Dosen Rektor/Ketua',
            'wakil_ketua_1_dosen_id' => 'Data Dosen Wakil Rektor I',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => ':Attribute wajib diisi.',
            'max' => ':Attribute tidak boleh lebih dari :max karakter.',
            'image' => ':Attribute harus berupa file gambar.',
            'mimes' => ':Attribute harus memiliki format: :values.',
            'mimetypes' => ':Attribute harus memiliki format: :values.',
            'in' => 'Pilihan :attribute tidak valid.',
            'exists' => 'Pilihan :attribute tidak ditemukan pada master data dosen.',
            'numeric' => ':Attribute harus berupa angka yang valid.',
            'between' => ':Attribute harus berada di antara :min dan :max.',
            'file.max' => 'Ukuran :attribute maksimal adalah :max KB.',
        ];
    }
}
