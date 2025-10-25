<?php

namespace App\Models;

use App\Traits\Multitenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory, Multitenant;

    protected $fillable = [
        'name',
        'description',
        'location_address',
        'geofence_radius',
        'created_by',
        'company_id',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function supervisors(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    public function labors(): HasMany
    {
        return $this->hasMany(Labor::class);
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ProjectMessage::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
