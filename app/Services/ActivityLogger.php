<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogger
{
    /**
     * Record an activity log entry according to 04-Security.md §5.
     */
    public static function log(
        string $action,
        string $entityType,
        int|string $entityId,
        ?array $oldValues = null,
        ?array $newValues = null
    ): ActivityLog {
        $request = request();

        return ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => (string) $entityId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request ? $request->ip() : '127.0.0.1',
            'user_agent' => $request ? substr((string) $request->userAgent(), 0, 255) : 'CLI/System',
        ]);
    }
}
