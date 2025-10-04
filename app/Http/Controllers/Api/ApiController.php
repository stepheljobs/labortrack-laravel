<?php

namespace App\Http\Controllers\Api;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\JsonResponse;

class ApiController extends BaseController
{
    protected function success(mixed $data = null, string $message = '', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data ?? [],
            'message' => $message,
        ], $status);
    }

    protected function error(array $errors = [], string $message = 'Validation failed', int $status = 422): JsonResponse
    {
        return response()->json([
            'success' => false,
            'errors' => $errors,
            'message' => $message,
        ], $status);
    }
}

