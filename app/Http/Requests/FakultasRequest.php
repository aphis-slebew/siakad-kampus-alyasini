<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FakultasRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('master_data.manage') ?? false;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $status = $this->input('status');

        if (is_bool($status)) {
            $this->merge([
                'status' => $status ? 'aktif' : 'nonaktif',
            ]);
        } elseif (empty($status)) {
            $this->merge([
                'status' => 'aktif',
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $fakultas = $this->route('fakulta') ?? $this->route('fakultas');
        $fakultasId = is_object($fakultas) ? $fakultas->id : $fakultas;

        return [
            'kode' => ['required', 'string', 'max:20', Rule::unique('fakultas', 'kode')->ignore($fakultasId)],
            'nama' => ['required', 'string', 'max:255'],
            'nama_en' => ['nullable', 'string', 'max:255'],
            'nama_singkat' => ['nullable', 'string', 'max:100'],
            'no_sk_pendirian' => ['nullable', 'string', 'max:100'],
            'tanggal_sk_pendirian' => ['nullable', 'date'],
            'file_sk_pendirian' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'no_sk_izin_operasional' => ['nullable', 'string', 'max:100'],
            'tanggal_sk_izin_operasional' => ['nullable', 'date'],
            'file_sk_izin_operasional' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'status' => ['required', 'in:aktif,nonaktif'],
            'dekan_dosen_id' => ['nullable', 'integer', 'exists:dosens,id'],
            'wakil_dekan_dosen_id' => ['nullable', 'integer', 'exists:dosens,id'],
            'wakil_dekan_1_dosen_id' => ['nullable', 'integer', 'exists:dosens,id'],
            'wakil_dekan_2_dosen_id' => ['nullable', 'integer', 'exists:dosens,id'],
            'wakil_dekan_3_dosen_id' => ['nullable', 'integer', 'exists:dosens,id'],
            'wakil_dekan_4_dosen_id' => ['nullable', 'integer', 'exists:dosens,id'],
            'ketua_gpmf_dosen_id' => ['nullable', 'integer', 'exists:dosens,id'],
            'kepala_tata_usaha_pegawai_id' => ['nullable', 'integer', 'exists:pegawais,id'],
            'dekan_nama' => ['nullable', 'string', 'max:255'],
            'dekan_gelar_depan' => ['nullable', 'string', 'max:50'],
            'dekan_gelar_belakang' => ['nullable', 'string', 'max:50'],
            'dekan_nidn' => ['nullable', 'string', 'max:50'],
            'wakil_dekan_1' => ['nullable', 'string', 'max:255'],
            'wakil_dekan_2' => ['nullable', 'string', 'max:255'],
            'wakil_dekan_3' => ['nullable', 'string', 'max:255'],
            'wakil_dekan_4' => ['nullable', 'string', 'max:255'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'telepon' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'website' => ['nullable', 'string', 'max:255'],
            'tahun_berdiri' => ['nullable', 'integer', 'min:1900', 'max:'.((int) date('Y') + 1)],
            'periode_berdiri' => ['nullable', 'string', 'max:100'],
            'luas_m2' => ['nullable', 'string', 'max:50'],
            'visi' => ['nullable', 'string'],
            'misi' => ['nullable', 'string'],
            'id_feeder' => ['nullable', 'string', 'max:100'],
            'sync_status' => ['nullable', 'in:belum_sinkron,sinkron,gagal_sinkron'],
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
            'kode.required' => 'Kode fakultas wajib diisi.',
            'kode.unique' => 'Kode fakultas sudah digunakan oleh fakultas lain.',
            'kode.max' => 'Kode fakultas maksimal 20 karakter.',
            'nama.required' => 'Nama resmi fakultas wajib diisi.',
            'status.required' => 'Status operasional fakultas wajib dipilih.',
            'status.in' => 'Status fakultas harus aktif atau nonaktif.',
            'dekan_dosen_id.exists' => 'Dosen yang dipilih sebagai Dekan tidak valid atau tidak ditemukan.',
            'wakil_dekan_1_dosen_id.exists' => 'Dosen yang dipilih sebagai Wakil Dekan I tidak valid.',
            'wakil_dekan_2_dosen_id.exists' => 'Dosen yang dipilih sebagai Wakil Dekan II tidak valid.',
            'wakil_dekan_3_dosen_id.exists' => 'Dosen yang dipilih sebagai Wakil Dekan III tidak valid.',
            'wakil_dekan_4_dosen_id.exists' => 'Dosen yang dipilih sebagai Wakil Dekan IV tidak valid.',
            'ketua_gpmf_dosen_id.exists' => 'Dosen yang dipilih sebagai Ketua GPMF tidak valid.',
            'kepala_tata_usaha_pegawai_id.exists' => 'Pegawai yang dipilih sebagai Kepala Tata Usaha tidak valid.',
            'email.email' => 'Format email fakultas tidak valid.',
            'tahun_berdiri.integer' => 'Tahun berdiri harus berupa angka tahun.',
            'tanggal_sk_pendirian.date' => 'Format tanggal SK pendirian tidak valid.',
            'tanggal_sk_izin_operasional.date' => 'Format tanggal SK izin operasional tidak valid.',
            'file_sk_pendirian.mimes' => 'Berkas SK Pendirian harus berupa dokumen PDF.',
            'file_sk_pendirian.max' => 'Ukuran berkas SK Pendirian maksimal 5MB.',
            'file_sk_izin_operasional.mimes' => 'Berkas SK Izin Operasional harus berupa dokumen PDF.',
            'file_sk_izin_operasional.max' => 'Ukuran berkas SK Izin Operasional maksimal 5MB.',
        ];
    }
}
