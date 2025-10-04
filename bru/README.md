# BRU API Collection for LaborTrack

This folder contains BRU (Bruno) API collection files for testing all endpoints in the LaborTrack application.

## Files Overview

- `auth.bru` - Authentication endpoints (login, register, logout, password reset, email verification)
- `api.bru` - API endpoints (projects, labors, attendance, messages)
- `web.bru` - Web routes (dashboard, projects, admin panel)
- `settings.bru` - User settings endpoints (profile, password, 2FA, appearance)
- `environments.bru` - Environment variables for different deployment stages

## Setup Instructions

1. Install Bruno CLI or use Bruno GUI application
2. Import this folder as a collection in Bruno
3. Set up your environment variables in `environments.bru`
4. Update the `base_url` to match your local development server (default: `http://localhost:8000`)

## Authentication

Most endpoints require authentication. You'll need to:

1. First call the `/login` endpoint to get an authentication token
2. Set the token in Bruno's auth settings or use the bearer token in the request headers
3. Use the token for subsequent authenticated requests

## Environment Variables

Update the following variables in `environments.bru` as needed:

- `base_url`: Your application's base URL
- `project_id`: A valid project ID for testing
- `labor_id`: A valid labor ID for testing
- `supervisor_id`: A valid supervisor ID for testing
- `token`: Password reset token (when testing password reset flow)
- `id`: User ID for email verification
- `hash`: Verification hash for email verification

## Usage Tips

1. Start with authentication endpoints to get a valid token
2. Use the API endpoints for testing the main application functionality
3. Web routes are primarily for testing the frontend integration
4. Settings endpoints are for testing user profile and account management

## Notes

- All POST/PUT/PATCH requests include sample JSON bodies
- Authentication is set to "bearer" for protected endpoints
- Some endpoints may require specific user roles (admin, supervisor, etc.)
- Make sure your Laravel application is running before testing the endpoints
