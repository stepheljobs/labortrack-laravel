# LaborTrack Multitenancy Technical Implementation Plan

## Overview

Based on the multitenancy brainstorming, this document outlines the technical implementation for converting LaborTrack from a single-tenant to a multi-tenant SaaS platform using **Shared Database, Row-Level Security** approach.

## Architecture Decision

- **Approach**: Shared Database, Shared Schema with Row-Level Security
- **Target**: 100 companies, startup budget
- **Subdomain Strategy**: `company.labortrack.com`
- **Billing**: Hybrid model ($100 base + $5 per additional user)

## Phase 1: Database Schema Changes

### 1.1 Create Companies Table

```php
// Migration: create_companies_table
Schema::create('companies', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('subdomain')->unique();
    $table->string('email')->unique();
    $table->string('phone')->nullable();
    $table->string('address')->nullable();
    $table->enum('plan', ['basic', 'pro', 'enterprise'])->default('basic');
    $table->integer('user_limit')->default(10);
    $table->decimal('monthly_fee', 8, 2)->default(100.00);
    $table->boolean('is_active')->default(true);
    $table->timestamp('trial_ends_at')->nullable();
    $table->timestamps();
});
```

### 1.2 Add Company ID to Existing Tables

Tables to update:

- `users` → `company_id`
- `projects` → `company_id`
- `labors` → `company_id`
- `attendance_logs` → `company_id`
- `project_messages` → `company_id`
- `payroll_runs` → `company_id`
- `payroll_entries` → `company_id`
- `payroll_settings` → `company_id`

### 1.3 Migration Strategy

```php
// Migration: add_company_id_to_tables
// 1. Create default company for existing data
// 2. Add company_id columns (nullable initially)
// 3. Assign all existing data to default company
// 4. Make company_id columns non-nullable
// 5. Add foreign key constraints
```

## Phase 2: Model Updates

### 2.1 Create Company Model

```php
// app/Models/Company.php
class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'subdomain', 'email', 'phone', 'address',
        'plan', 'user_limit', 'monthly_fee', 'is_active', 'trial_ends_at'
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function activeSubscription(): bool
    {
        return $this->is_active &&
               ($this->trial_ends_at?->isFuture() ?? true);
    }
}
```

### 2.2 Add Multitenancy Trait

```php
// app/Traits/Multitenant.php
trait Multitenant
{
    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope('company', function (Builder $builder) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $builder->where('company_id', auth()->user()->company_id);
            }
        });

        static::creating(function ($model) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $model->company_id = auth()->user()->company_id;
            }
        });
    }
}
```

### 2.3 Update Existing Models

Add `Multitenant` trait and `company_id` relationship to:

- User, Project, Labor, AttendanceLog, ProjectMessage, PayrollRun, PayrollEntry, PayrollSetting

## Phase 3: Middleware & Routing

### 3.1 Company Identification Middleware

```php
// app/Http/Middleware/IdentifyCompany.php
class IdentifyCompany
{
    public function handle(Request $request, Closure $next)
    {
        $subdomain = $request->route('subdomain');

        if ($subdomain) {
            $company = Company::where('subdomain', $subdomain)->firstOrFail();

            if (!$company->activeSubscription()) {
                abort(403, 'Company subscription is not active');
            }

            session(['current_company' => $company]);
            view()->share('current_company', $company);
        }

        return $next($request);
    }
}
```

### 3.2 Subdomain Routing

```php
// routes/web.php
Route::domain('{subdomain}.labortrack.com')->middleware(['web', 'identify.company'])->group(function () {
    // Existing routes here
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    // ... other routes
});

// Landing page routes (no subdomain)
Route::domain('labortrack.com')->group(function () {
    Route::get('/', [LandingController::class, 'index']);
    Route::get('/signup', [CompanySignupController::class, 'create']);
    Route::post('/signup', [CompanySignupController::class, 'store']);
});
```

### 3.3 Super Admin Routes

```php
// routes/web.php
Route::prefix('admin')->middleware(['web', 'auth', 'admin'])->group(function () {
    Route::get('/companies', [Admin\CompanyController::class, 'index']);
    Route::get('/companies/{company}', [Admin\CompanyController::class, 'show']);
    Route::post('/companies/{company}/toggle', [Admin\CompanyController::class, 'toggle']);
});
```

## Phase 4: Authentication Updates

### 4.1 Update User Model

```php
// app/Models/User.php
class User extends Authenticatable
{
    use Multitenant; // Add this trait

    protected $fillable = [
        'name', 'email', 'password', 'role', 'company_id',
        'invitation_token', 'invitation_accepted_at',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function belongsToCurrentCompany(): bool
    {
        $currentCompany = session('current_company');
        return $currentCompany && $this->company_id === $currentCompany->id;
    }
}
```

### 4.2 Update Login Logic

```php
// app/Actions/Fortify/CreateNewUser.php
// app/Actions/Fortify/AttemptToAuthenticate.php
// Add company validation during login
```

## Phase 5: Company Signup Flow

### 5.1 Company Signup Controller

```php
// app/Http/Controllers/CompanySignupController.php
class CompanySignupController extends Controller
{
    public function create()
    {
        return view('auth.company-signup');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'subdomain' => 'required|string|max:50|unique:companies,subdomain',
            'email' => 'required|email|unique:companies,email',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:8',
        ]);

        DB::transaction(function () use ($validated) {
            // Create company
            $company = Company::create([
                'name' => $validated['company_name'],
                'subdomain' => $validated['subdomain'],
                'email' => $validated['email'],
                'trial_ends_at' => now()->addDays(14),
            ]);

            // Create admin user
            $user = User::create([
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['password']),
                'role' => 'admin',
                'company_id' => $company->id,
            ]);

            // Send welcome email
            // ...
        });

        return redirect("https://{$validated['subdomain']}.labortrack.com/login")
            ->with('success', 'Company created successfully!');
    }
}
```

## Phase 6: Super Admin Panel

### 6.1 Admin Company Controller

```php
// app/Http/Controllers/Admin/CompanyController.php
class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::withCount('users')->paginate(20);
        return view('admin.companies.index', compact('companies'));
    }

    public function show(Company $company)
    {
        $company->load(['users', 'projects']);
        return view('admin.companies.show', compact('company'));
    }

    public function toggle(Company $company)
    {
        $company->update(['is_active' => !$company->is_active]);
        return back()->with('success', 'Company status updated');
    }
}
```

## Phase 7: Billing Integration

### 7.1 Subscription Management

```php
// app/Services/SubscriptionService.php
class SubscriptionService
{
    public function calculateMonthlyBill(Company $company): float
    {
        $userCount = $company->users()->count();
        $includedUsers = $company->user_limit;
        $additionalUsers = max(0, $userCount - $includedUsers);

        return $company->monthly_fee + ($additionalUsers * 5.00);
    }

    public function canAddUser(Company $company): bool
    {
        if ($company->plan === 'enterprise') return true;

        return $company->users()->count() < $company->user_limit;
    }
}
```

## Phase 8: Security & Performance

### 8.1 Security Measures

- Add `company_id` to all query validation
- Implement audit logging for cross-company access attempts
- Add rate limiting per company
- Validate user belongs to current company on every request

### 8.2 Performance Optimizations

- Add database indexes on `company_id` columns
- Implement caching for company data
- Use database connection pooling
- Monitor query performance with `company_id` filters

## Phase 9: Testing Strategy

### 9.1 Test Categories

- **Unit Tests**: Model relationships, scopes, traits
- **Feature Tests**: Subdomain routing, company isolation, signup flow
- **Security Tests**: Cross-company data access prevention
- **Performance Tests**: Query performance with large datasets

### 9.2 Key Test Scenarios

- Users can only access their own company data
- Super admin can access all companies
- Subdomain routing works correctly
- Company signup creates proper data structure
- Billing calculations are accurate

## Phase 10: Deployment Plan

### 10.1 Migration Steps

1. Deploy database migrations in staging
2. Test with sample data
3. Backup production database
4. Deploy migrations to production
5. Update application code
6. Test thoroughly
7. Go live with new features

### 10.2 Rollback Plan

- Database rollback migrations
- Previous application version ready
- DNS changes can be reverted
- Customer communication plan

## Implementation Timeline

**Week 1-2**: Database schema changes and model updates
**Week 3**: Middleware, routing, and authentication updates
**Week 4**: Company signup flow and super admin panel
**Week 5**: Billing integration and security measures
**Week 6**: Testing, performance optimization, and deployment

## Success Metrics

- Zero cross-company data leaks
- Subdomain routing 100% reliable
- Company signup conversion rate > 80%
- Page load times under 2 seconds
- 99.9% uptime during transition

## Next Steps

1. Review and approve this technical plan
2. Set up development environment for multitenancy
3. Begin Phase 1 implementation
4. Regular progress reviews and adjustments
