<?php

namespace Database\Seeders;

use App\Models\AttendanceLog;
use App\Models\Labor;
use App\Models\Project;
use App\Models\ProjectMessage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Core accounts
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => 'password', 'role' => 'admin']
        );

        // Named supervisors for realism
        $namedSupervisors = [
            ['name' => 'Maria Gonzales', 'email' => 'maria.gonzales@example.com'],
            ['name' => 'David Chen', 'email' => 'david.chen@example.com'],
            ['name' => 'Jamal Turner', 'email' => 'jamal.turner@example.com'],
            ['name' => 'Elena Rossi', 'email' => 'elena.rossi@example.com'],
            ['name' => 'Connor O’Brien', 'email' => 'connor.obrien@example.com'],
        ];
        $supervisors = collect();
        foreach ($namedSupervisors as $sup) {
            $supervisors->push(
                User::firstOrCreate(
                    ['email' => $sup['email']],
                    ['name' => $sup['name'], 'password' => 'password', 'role' => 'supervisor']
                )
            );
        }

        // 2) Realistic projects with site addresses and a base lat/lng used for logs
        $projectData = [
            [
                'name' => 'Downtown Mixed‑Use Tower',
                'description' => '30‑story concrete frame with retail podium and underground parking.',
                'location_address' => '1200 Market St, San Francisco, CA',
                'geofence_radius' => 180,
                'coords' => [37.7766, -122.4169],
            ],
            [
                'name' => 'Riverside Bridge Rehabilitation',
                'description' => 'Structural repairs, deck replacement, and traffic control along the river.',
                'location_address' => '405 River Rd, Louisville, KY',
                'geofence_radius' => 250,
                'coords' => [38.2568, -85.7481],
            ],
            [
                'name' => 'Eastside Elementary Renovation',
                'description' => 'Interior remodel, MEP upgrades, and ADA improvements across campus buildings.',
                'location_address' => '801 Eastside Ave, Austin, TX',
                'geofence_radius' => 150,
                'coords' => [30.2713, -97.7207],
            ],
        ];

        $projects = collect();
        foreach ($projectData as $data) {
            $projects->push(
                Project::firstOrCreate(
                    ['name' => $data['name']],
                    [
                        'description' => $data['description'],
                        'location_address' => $data['location_address'],
                        'geofence_radius' => $data['geofence_radius'],
                        'created_by' => $admin->id,
                    ]
                )
            );
        }

        // Assign 2 supervisors per project
        foreach ($projects as $i => $project) {
            $assigned = $supervisors->shuffle()->take(2)->pluck('id')->all();
            $project->supervisors()->syncWithoutDetaching($assigned);
        }

        // 3) Crews per project with realistic trades and pay
        $tradeRates = [
            'General Laborer' => [90, 130],
            'Carpenter' => [140, 200],
            'Mason' => [140, 210],
            'Electrician' => [180, 260],
            'Plumber' => [170, 240],
            'Ironworker' => [170, 240],
            'Operator' => [180, 260],
            'Painter' => [120, 170],
        ];

        $nameExamples = [
            'Aiden Brooks','Noah Patel','Liam Murphy','Sophia Cruz','Emma Martinez','Olivia Nguyen',
            'Ava Johnson','Mia Thompson','Isabella Rivera','Ethan Wright','Lucas Adams','Mason Clark',
            'Logan Walker','Aria Flores','Chloe King','Amelia Scott','Layla Baker','Zoe Turner',
        ];

        $projectBaseCoords = $projects->values()->mapWithKeys(function ($project, $idx) use ($projectData) {
            return [$project->id => $projectData[$idx]['coords']];
        });

        $allLabors = collect();
        foreach ($projects as $project) {
            $tradesForProject = collect(array_keys($tradeRates))->shuffle()->take(5)->values();
            $crewSize = 14; // balanced, realistic crew size per site

            for ($n = 0; $n < $crewSize; $n++) {
                $designation = $tradesForProject[$n % $tradesForProject->count()];
                [$min, $max] = $tradeRates[$designation];
                $daily = round(mt_rand($min * 100, $max * 100) / 100, 2);

                $name = $nameExamples[array_rand($nameExamples)] . ' ' . Str::substr(Str::uuid(), 0, 4);
                $labor = Labor::firstOrCreate([
                    'name' => $name,
                    'project_id' => $project->id,
                ], [
                    'contact_number' => '555-' . str_pad((string) random_int(1000, 9999), 4, '0'),
                    'designation' => $designation,
                    'daily_rate' => $daily,
                ]);
                $allLabors->push($labor);
            }

            // A few initial site messages
            $messages = [
                'Mobilized crane and staged rebar near core.',
                'Concrete pour for level 3 complete. 6 trucks total.',
                'Delay due to rain; resumed at 10:30am with reduced crew.',
                'Received inspection sign-off for electrical rough-in in Area B.',
                'Safety stand-down at 7:00am. No incidents reported.',
            ];
            foreach ($messages as $m) {
                ProjectMessage::create([
                    'project_id' => $project->id,
                    'user_id' => $project->supervisors()->inRandomOrder()->value('users.id') ?? $supervisors->random()->id,
                    'message' => $m,
                ]);
            }
        }

        // 4) Attendance: last 20 workdays, weekdays preferred, realistic times, geo close to site
        $workdays = [];
        $day = Carbon::now();
        while (count($workdays) < 20) {
            if (!in_array($day->dayOfWeekIso, [6,7], true)) { // 6=Sat, 7=Sun
                $workdays[] = $day->copy();
            }
            $day = $day->subDay();
        }

        foreach ($allLabors as $labor) {
            $project = $labor->project;
            $base = $projectBaseCoords[$project->id] ?? [0, 0];
            $supervisorIds = $project->supervisors()->pluck('users.id');

            foreach ($workdays as $date) {
                // 85% chance present
                if (mt_rand(1, 100) > 85) {
                    continue;
                }

                $minuteSlots = [0, 10, 15, 20, 30, 45];
                $inHour = mt_rand(7, 8);
                $outHour = mt_rand(16, 17);
                $overtime = mt_rand(1, 100) <= 20; // 20% OT
                if ($overtime) {
                    $outHour = mt_rand(18, 19);
                }

                $clockIn = $date->copy()->setTime($inHour, $minuteSlots[array_rand($minuteSlots)], 0);
                $clockOut = $date->copy()->setTime($outHour, $minuteSlots[array_rand($minuteSlots)], 0);

                // jitter around site base (approx ~50–150m)
                $jitter = fn () => (mt_rand(-8, 8)) / 1000; // ~0.008 deg ~ ~900m max; typical ~100m
                $latIn = $base[0] + $jitter();
                $lngIn = $base[1] + $jitter();
                $latOut = $base[0] + $jitter();
                $lngOut = $base[1] + $jitter();

                $supervisorId = $supervisorIds->isNotEmpty() ? $supervisorIds->random() : $supervisors->random()->id;

                AttendanceLog::create([
                    'labor_id' => $labor->id,
                    'project_id' => $project->id,
                    'supervisor_id' => $supervisorId,
                    'type' => 'clock_in',
                    'timestamp' => $clockIn,
                    'latitude' => $latIn,
                    'longitude' => $lngIn,
                    'location_address' => $project->location_address,
                    'photo_path' => null,
                ]);

                AttendanceLog::create([
                    'labor_id' => $labor->id,
                    'project_id' => $project->id,
                    'supervisor_id' => $supervisorId,
                    'type' => 'clock_out',
                    'timestamp' => $clockOut,
                    'latitude' => $latOut,
                    'longitude' => $lngOut,
                    'location_address' => $project->location_address,
                    'photo_path' => null,
                ]);
            }
        }
    }
}
