<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceLog extends Model
{
    use HasFactory;

    public $timestamps = true;

    protected $fillable = [
        'labor_id',
        'supervisor_id',
        'project_id',
        'type',
        'photo_path',
        'latitude',
        'longitude',
        'location_address',
        'timestamp',
        'edit_reason',
        'edited_by',
        'edited_at',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'edited_at' => 'datetime',
        'latitude' => 'float',
        'longitude' => 'float',
        'type' => 'string',
    ];

    public function labor(): BelongsTo
    {
        return $this->belongsTo(Labor::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'edited_by');
    }
}
