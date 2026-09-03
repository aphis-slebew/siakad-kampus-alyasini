<?php

namespace App\Traits;

trait HasBlindIndex
{
    /**
     * Generate a deterministic HMAC-SHA256 blind index hash for encrypted field lookups.
     * Uses dedicated app.blind_index_key secret to decouple blind index lookups from APP_KEY rotation.
     */
    public static function generateBlindIndex(string $value): string
    {
        $key = (string) (config('app.blind_index_key') ?: config('app.key') ?: 'siakad-alyasini-default-blind-index-key');

        return hash_hmac('sha256', trim($value), $key);
    }

    /**
     * Automatically compute blind index hash fields on model saving.
     */
    protected static function bootHasBlindIndex(): void
    {
        static::saving(function ($model) {
            if ($model->isDirty('nik') && ! empty($model->nik)) {
                $model->nik_hash = static::generateBlindIndex((string) $model->nik);
            }

            if (isset($model->nidn) && $model->isDirty('nidn') && ! empty($model->nidn)) {
                $model->nidn_hash = static::generateBlindIndex((string) $model->nidn);
            }

            if (isset($model->nip_internal) && $model->isDirty('nip_internal') && ! empty($model->nip_internal)) {
                $model->nip_hash = static::generateBlindIndex((string) $model->nip_internal);
            }
        });
    }
}
