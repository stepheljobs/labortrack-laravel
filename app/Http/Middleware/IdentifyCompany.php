<?php

namespace App\Http\Middleware;

use App\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyCompany
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $subdomain = $request->route('subdomain');

        if ($subdomain) {
            $company = Company::where('subdomain', $subdomain)->firstOrFail();

            if (! $company->activeSubscription()) {
                abort(403, 'Company subscription is not active');
            }

            session(['current_company' => $company]);
            view()->share('current_company', $company);
        }

        return $next($request);
    }
}
