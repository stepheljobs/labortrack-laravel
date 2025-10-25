<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\Multitenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Multitenant, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'company_id',
        'invitation_token',
        'invitation_accepted_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'invitation_accepted_at' => 'datetime',
        ];
    }

    /**
     * Projects created by the user (creator).
     */
    public function projectsCreated(): HasMany
    {
        return $this->hasMany(Project::class, 'created_by');
    }

    /**
     * Projects the supervisor is assigned to.
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class)->withTimestamps();
    }

    /**
     * Attendance logs supervised by this user.
     */
    public function supervisedAttendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class, 'supervisor_id');
    }

    /**
     * Company this user belongs to.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Check if user is a super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if user belongs to current company session.
     */
    public function belongsToCurrentCompany(): bool
    {
        $currentCompany = session('current_company');

        return $currentCompany && $this->company_id === $currentCompany->id;
    }

    /**
     * Check if user is an admin (company admin or super admin).
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }

    /**
     * Check if user can manage company settings.
     */
    public function canManageCompany(): bool
    {
        return $this->isAdmin();
    }
}
