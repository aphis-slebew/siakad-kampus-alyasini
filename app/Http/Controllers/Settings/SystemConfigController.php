<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SystemConfig;
use App\Services\ActivityLogger;
use Database\Seeders\SystemConfigSeeder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemConfigController extends Controller
{
    /**
     * Display a listing of all system configuration parameters (Superadmin Only).
     */
    public function index(): Response
    {
        $configs = SystemConfig::orderBy('key')->get()->map(function ($config) {
            $whitelistMeta = SystemConfigSeeder::$whitelist[$config->key] ?? [];

            return [
                'id' => $config->id,
                'key' => $config->key,
                'value' => $config->value,
                'description' => $config->description ?? ($whitelistMeta['description'] ?? ''),
                'type' => $whitelistMeta['type'] ?? 'text',
                'updated_at' => $config->updated_at ? $config->updated_at->toISOString() : null,
            ];
        });

        return Inertia::render('settings/system-configs', [
            'configs' => $configs,
        ]);
    }

    /**
     * Update the specified system configuration parameter with data type validation and Activity Log audit trail.
     */
    public function update(Request $request, SystemConfig $systemConfig)
    {
        $whitelistMeta = SystemConfigSeeder::$whitelist[$systemConfig->key] ?? null;
        if (! $whitelistMeta) {
            return back()->withErrors(['key' => "Key '{$systemConfig->key}' tidak terdaftar dalam whitelist resmi."]);
        }

        $type = $whitelistMeta['type'] ?? 'text';
        $rules = match ($type) {
            'number' => ['required', 'integer', 'min:0'],
            'decimal' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            default => ['required', 'string', 'max:255'],
        };

        $validated = $request->validate([
            'value' => $rules,
        ]);

        $oldValue = $systemConfig->value;
        $newValue = (string) $validated['value'];

        if ($oldValue !== $newValue) {
            $systemConfig->update(['value' => $newValue]);

            ActivityLogger::log(
                'system_config.update',
                'SystemConfig',
                $systemConfig->id,
                ['key' => $systemConfig->key, 'value' => $oldValue],
                ['key' => $systemConfig->key, 'value' => $newValue]
            );
        }

        return redirect()->back()->with('success', "Parameter '{$systemConfig->key}' berhasil diperbarui.");
    }
}
