<?php

namespace App\Traits;

use App\Models\Activity;

trait LogsActivity
{
    protected static function bootLogsActivity()
    {
        static::created(function ($model) {
            $model->logActivity('created');
        });

        static::updated(function ($model) {
            $model->logActivity('updated');
        });

        static::deleted(function ($model) {
            $model->logActivity('deleted');
        });
    }

    protected function logActivity(string $type)
    {
        $properties = null;
        $description = null;

        if ($type === 'created') {
            $description = $this->getActivityDescription('created');
        } elseif ($type === 'updated') {
            $changes = $this->getChanges();
            if (!empty($changes)) {
                $properties = [
                    'old' => array_intersect_key($this->getOriginal(), $changes),
                    'new' => $changes,
                ];
                $description = $this->getActivityDescription('updated', $changes);
            }
        } elseif ($type === 'deleted') {
            $description = $this->getActivityDescription('deleted');
        }

        Activity::create([
            'user_id' => auth()->id(),
            'type' => $type,
            'subject_type' => get_class($this),
            'subject_id' => $this->id,
            'description' => $description,
            'properties' => $properties,
        ]);
    }

    protected function getActivityDescription(string $type, array $changes = []): string
    {
        $modelName = class_basename($this);
        $identifier = $this->name ?? $this->title ?? "#{$this->id}";

        switch ($type) {
            case 'created':
                return "{$modelName} '{$identifier}' was created";
            case 'updated':
                $changedFields = array_keys($changes);
                $fieldsStr = implode(', ', $changedFields);
                return "{$modelName} '{$identifier}' was updated ({$fieldsStr})";
            case 'deleted':
                return "{$modelName} '{$identifier}' was deleted";
            default:
                return "{$modelName} '{$identifier}' was {$type}";
        }
    }
}
