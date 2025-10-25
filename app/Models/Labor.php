<?php

namespace App\Models;

use App\Traits\Multitenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Labor extends Model
{
    use HasFactory, Multitenant;

    protected $fillable = [
        'name',
        'contact_number',
        'designation',
        'daily_rate',
        'project_id',
        'company_id',
    ];

    protected $casts = [
        'daily_rate' => 'decimal:2',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('project_id');
    }

    public function scopeAssigned($query)
    {
        return $query->whereNotNull('project_id');
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
