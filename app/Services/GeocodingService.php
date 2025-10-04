<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GeocodingService
{
    public function reverse(float $lat, float $lng): ?string
    {
        $cacheKey = sprintf('geocode:rev:%f,%f', $lat, $lng);

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($lat, $lng) {
            try {
                $response = Http::timeout(8)
                    ->withHeaders(['User-Agent' => config('app.name').' Geocoder'])
                    ->get('https://nominatim.openstreetmap.org/reverse', [
                        'format' => 'json',
                        'lat' => $lat,
                        'lon' => $lng,
                    ]);

                if ($response->ok() && ($display = $response->json('display_name'))) {
                    return $display;
                }
            } catch (\Throwable $e) {
                // swallow
            }

            return null;
        });
    }
}

