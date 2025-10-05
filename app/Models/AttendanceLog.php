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
    ];

    protected $casts = [
        'timestamp' => 'datetime',
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
}
