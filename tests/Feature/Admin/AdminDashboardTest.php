<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create system company for super admin
        $systemCompany = Company::withoutGlobalScopes()->create([
            'name' => 'System',
            'subdomain' => 'system',
            'email' => 'system@labortrack.com',
            'plan' => 'enterprise',
            'is_active' => true,
        ]);
        
        // Create super admin user
        $this->superAdmin = User::factory()->create([
            'role' => 'super_admin',
            'company_id' => $systemCompany->id,
        ]);
    }

    public function test_super_admin_can_access_admin_dashboard()
    {
        $response = $this->actingAs($this->superAdmin)
            ->get('/admin/dashboard');

        if ($response->status() === 500) {
            dd($response->exception);
        }

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Dashboard')
        );
    }

    public function test_regular_user_cannot_access_admin_dashboard()
    {
        $regularUser = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($regularUser)
            ->get('/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_company_admin_cannot_access_admin_dashboard()
    {
        $companyAdmin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($companyAdmin)
            ->get('/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_guest_cannot_access_admin_dashboard()
    {
        $response = $this->get('/admin/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_super_admin_can_access_companies_index()
    {
        $response = $this->actingAs($this->superAdmin)
            ->get('/admin/companies');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Companies/Index')
        );
    }

    public function test_super_admin_can_view_company_details()
    {
        $company = Company::factory()->create();

        $response = $this->actingAs($this->superAdmin)
            ->get("/admin/companies/{$company->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Companies/Show')
        );
    }

    public function test_super_admin_can_toggle_company_status()
    {
        $company = Company::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->superAdmin)
            ->post("/admin/companies/{$company->id}/toggle");

        $response->assertRedirect();
        $this->assertFalse($company->fresh()->is_active);
    }
}