<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmployeeStoreRequest;
use App\Http\Requests\EmployeeUpdateRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Labor;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = Labor::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $term = $request->string('search');
                $query->where('name', 'like', "%{$term}%")
                    ->orWhere('contact_number', 'like', "%{$term}%")
                    ->orWhere('designation', 'like', "%{$term}%");
            })
            ->when($request->filled('sort'), function ($query) use ($request) {
                $sort = $request->string('sort');
                $direction = $request->string('direction', 'asc');
                $query->orderBy($sort, $direction);
            }, function ($query) {
                $query->orderBy('name');
            })
            ->paginate(25);

        return Inertia::render('admin/employees/index', [
            'employees' => $employees->items(),
            'pagination' => [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
            ],
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    public function search(Request $request)
    {
        $employees = Labor::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $term = $request->string('search');
                $query->where(function ($subQuery) use ($term) {
                    $subQuery->where('name', 'like', "%{$term}%")
                        ->orWhere('contact_number', 'like', "%{$term}%")
                        ->orWhere('designation', 'like', "%{$term}%");
                });
            })
            ->where(function ($query) {
                $query->whereNull('project_id')
                    ->orWhere('project_id', '!=', request('project_id'));
            })
            ->orderBy('name')
            ->limit(50)
            ->get();

        return EmployeeResource::collection($employees);
    }

    public function store(EmployeeStoreRequest $request)
    {
        Labor::create($request->validated());
        
        return redirect()->route('employees.index')
            ->with('success', 'Employee created successfully.');
    }

    public function update(EmployeeUpdateRequest $request, Labor $employee)
    {
        $employee->update($request->validated());
        
        return redirect()->route('employees.index')
            ->with('success', 'Employee updated successfully.');
    }

    public function destroy(Labor $employee)
    {
        $employee->delete();
        
        return redirect()->route('employees.index')
            ->with('success', 'Employee deleted successfully.');
    }

    public function assignToProject(Request $request, Project $project, Labor $employee)
    {
        $employee->update(['project_id' => $project->id]);
        
        return redirect()->back()
            ->with('success', 'Employee assigned to project successfully.');
    }
}
