<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait Multitenant
{
    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope('company', function (Builder $builder) {
            if (Auth::check() && ! Auth::user()->isSuperAdmin()) {
                $builder->where('company_id', Auth::user()->company_id);
            }
        });

        static::creating(function ($model) {
            if (Auth::check() && ! Auth::user()->isSuperAdmin()) {
                $model->company_id = Auth::user()->company_id;
            }
        });
    }

    /**
     * Get all records without company scope (for super admins)
     */
    public function scopeAllCompanies(Builder $builder): Builder
    {
        return $builder->withoutGlobalScope('company');
    }

    /**
     * Get records for a specific company
     */
    public function scopeForCompany(Builder $builder, int $companyId): Builder
    {
        return $builder->where('company_id', $companyId);
    }

    /**
     * Check if model belongs to current user's company
     */
    public function belongsToCurrentCompany(): bool
    {
        if (! Auth::check()) {
            return false;
        }

        if (Auth::user()->isSuperAdmin()) {
            return true;
        }

        return $this->company_id === Auth::user()->company_id;
    }
}
