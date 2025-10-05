# LaborTrack API Documentation

This document provides comprehensive documentation for all API endpoints in the LaborTrack application. This information is essential for mobile app development.

## Base URL
```
/api
```

## Authentication
The API uses Laravel Sanctum for authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

## Response Format
All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "errors": { ... },
  "message": "Error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "meta": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 25,
      "total": 100
    }
  },
  "message": ""
}
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/register`

Creates a new user account. New users are assigned the 'supervisor' role by default.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `name`: required, string, max 255 characters
- `email`: required, valid email, max 255 characters, unique
- `password`: required, string, minimum 8 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "supervisor"
    },
    "token": "1|abc123..."
  },
  "message": "Registration successful"
}
```

### 2. Login User
**POST** `/login`

Authenticates a user and returns an access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `email`: required, valid email
- `password`: required, string

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "supervisor"
    },
    "token": "1|abc123..."
  },
  "message": "Login successful"
}
```

### 3. Logout User
**POST** `/logout`

**Authentication:** Required

Revokes the current access token.

**Response:**
```json
{
  "success": true,
  "data": [],
  "message": "Logged out"
}
```

---

## Project Endpoints

### 4. Get User's Projects
**GET** `/projects`

**Authentication:** Required

Returns a paginated list of projects assigned to the authenticated user.

**Query Parameters:**
- `page` (optional): Page number for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Construction Project A",
        "description": "Building construction project",
        "location_address": "123 Main St, City",
        "geofence_radius": 100
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 15,
      "total": 1
    }
  },
  "message": ""
}
```

### 5. Get Project Details
**GET** `/projects/{project_id}`

**Authentication:** Required

Returns detailed information about a specific project.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Construction Project A",
    "description": "Building construction project",
    "location_address": "123 Main St, City",
    "geofence_radius": 100
  },
  "message": ""
}
```

---

## Labor Management Endpoints

### 6. Get Project Labors
**GET** `/projects/{project_id}/labors`

**Authentication:** Required

Returns a paginated list of labors assigned to a specific project.

**Query Parameters:**
- `search` (optional): Search term to filter labors by name
- `page` (optional): Page number for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "John Smith",
        "contact_number": "+1234567890",
        "designation": "Foreman",
        "daily_rate": 125.50,
        "project_id": 1
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 25,
      "total": 1
    }
  },
  "message": ""
}
```

### 7. Create Labor
**POST** `/projects/{project_id}/labors`

**Authentication:** Required

Creates a new labor entry for a specific project.

**Request Body:**
```json
{
  "name": "John Smith",
  "contact_number": "+1234567890",
  "designation": "Foreman",
  "daily_rate": 125.50
}
```

**Validation Rules:**
- `name`: required, string, max 255 characters
- `contact_number`: optional, string, max 50 characters
- `designation`: optional, string, max 100 characters
- `daily_rate`: optional, number, min 0

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Smith",
    "contact_number": "+1234567890",
    "designation": "Foreman",
    "daily_rate": 125.50,
    "project_id": 1
  },
  "message": "Labor created"
}
```

### 8. Delete Labor
**DELETE** `/labors/{labor_id}`

**Authentication:** Required

Deletes a labor entry.

**Response:**
```json
{
  "success": true,
  "data": [],
  "message": "Labor deleted"
}
```

---

## Attendance Management Endpoints

### 9. Log Attendance
**POST** `/attendance/log`

**Authentication:** Required

Logs attendance for a labor with photo and location data.

You can submit the request in either of the following formats:

1) multipart/form-data (file upload):
- `labor_id`: integer, required, must exist in labors table
- `project_id`: integer, required, must exist in projects table
- `photo`: file, required, image file, max 5MB
- `latitude`: numeric, required, between -90 and 90
- `longitude`: numeric, required, between -180 and 180
- `timestamp`: date, required, ISO format

2) application/json (base64 string):
- `labor_id`: integer, required, must exist in labors table
- `project_id`: integer, required, must exist in projects table
- `photo`: string, required, base64 image; data URI format recommended
  - Example: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...`
- `latitude`: numeric, required, between -90 and 90
- `longitude`: numeric, required, between -180 and 180
- `timestamp`: date, required, ISO format

In both cases, the server validates `photo` as an image and stores it.

**Validation Rules:**
- `labor_id`: required, integer, exists in labors table
- `project_id`: required, integer, exists in projects table
- `photo`: required, image, max 5120KB (5MB)
- `latitude`: required, numeric, between -90 and 90
- `longitude`: required, numeric, between -180 and 180
- `timestamp`: required, valid date

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "labor": {
      "id": 1,
      "name": "John Smith",
      "contact_number": "+1234567890",
      "role": "Foreman",
      "project_id": 1
    },
    "supervisor": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "supervisor"
    },
    "project_id": 1,
    "photo_url": "http://localhost/storage/attendance-photos/photo.jpg",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "location_address": "123 Main St, New York, NY",
    "timestamp": "2024-01-15T09:00:00.000000Z",
    "created_at": "2024-01-15T09:00:00.000000Z"
  },
  "message": "Attendance logged"
}
```

### 10. Get Project Attendance Logs
**GET** `/projects/{project_id}/attendance`

**Authentication:** Required

Returns attendance logs for a specific project.

**Query Parameters:**
- `date` (optional): Filter by specific date (YYYY-MM-DD format)
- `page` (optional): Page number for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "labor": {
          "id": 1,
          "name": "John Smith",
          "contact_number": "+1234567890",
          "role": "Foreman",
          "project_id": 1
        },
        "supervisor": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "role": "supervisor"
        },
        "project_id": 1,
        "photo_url": "http://localhost/storage/attendance-photos/photo.jpg",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "location_address": "123 Main St, New York, NY",
        "timestamp": "2024-01-15T09:00:00.000000Z",
        "created_at": "2024-01-15T09:00:00.000000Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 25,
      "total": 1
    }
  },
  "message": ""
}
```

### 11. Get Today's Attendance
**GET** `/attendance/today`

**Authentication:** Required

Returns all attendance logs for today across all projects assigned to the user.

**Query Parameters:**
- `page` (optional): Page number for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "labor": {
          "id": 1,
          "name": "John Smith",
          "contact_number": "+1234567890",
          "role": "Foreman",
          "project_id": 1
        },
        "supervisor": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "role": "supervisor"
        },
        "project_id": 1,
        "photo_url": "http://localhost/storage/attendance-photos/photo.jpg",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "location_address": "123 Main St, New York, NY",
        "timestamp": "2024-01-15T09:00:00.000000Z",
        "created_at": "2024-01-15T09:00:00.000000Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 25,
      "total": 1
    }
  },
  "message": ""
}
```

---

## Messaging Endpoints

### 12. Get Project Messages
**GET** `/projects/{project_id}/messages`

**Authentication:** Required

Returns messages posted in a specific project.

**Query Parameters:**
- `page` (optional): Page number for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "project_id": 1,
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "role": "supervisor"
        },
        "message": "Project update: Foundation work completed",
        "photo_url": "http://localhost/storage/message-photos/photo.jpg",
        "created_at": "2024-01-15T10:00:00.000000Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 25,
      "total": 1
    }
  },
  "message": ""
}
```

### 13. Post Project Message
**POST** `/projects/{project_id}/messages`

**Authentication:** Required

Posts a new message to a project.

**Request Body (multipart/form-data):**
- `message`: string, required
- `photo`: file, optional, image file, max 5MB

**Validation Rules:**
- `message`: required, string
- `photo`: optional, file, image, max 5120KB (5MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": 1,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "supervisor"
    },
    "message": "Project update: Foundation work completed",
    "photo_url": "http://localhost/storage/message-photos/photo.jpg",
    "created_at": "2024-01-15T10:00:00.000000Z"
  },
  "message": "Message posted"
}
```

---

## Error Handling

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `403`: Forbidden (insufficient permissions)
- `422`: Validation Error
- `500`: Internal Server Error

### Validation Error Example
```json
{
  "success": false,
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  },
  "message": "Validation failed"
}
```

### Authorization Error Example
```json
{
  "success": false,
  "errors": [],
  "message": "This action is unauthorized."
}
```

---

## Important Notes for Mobile Development

1. **Authentication**: Store the Bearer token securely and include it in all authenticated requests.

2. **File Uploads**: Use `multipart/form-data` for endpoints that accept file uploads (attendance logging and messaging).

3. **Pagination**: All list endpoints support pagination. Use the `page` query parameter to navigate through results.

4. **Image URLs**: Photo URLs returned by the API are absolute URLs that can be used directly in mobile apps.

5. **Location Services**: The attendance logging requires GPS coordinates. Ensure your mobile app has location permissions.

6. **Error Handling**: Always check the `success` field in responses and handle errors appropriately.

7. **Offline Support**: Consider implementing offline storage for critical data like projects and labors.

8. **Real-time Updates**: Consider implementing WebSocket connections or polling for real-time message updates.

---

## Data Models

### User
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "supervisor"
}
```

### Project
```json
{
  "id": 1,
  "name": "Construction Project A",
  "description": "Building construction project",
  "location_address": "123 Main St, City",
  "geofence_radius": 100
}
```

### Labor
```json
{
  "id": 1,
  "name": "John Smith",
  "contact_number": "+1234567890",
  "designation": "Foreman",
  "daily_rate": 125.50,
  "project_id": 1
}
```

### AttendanceLog
```json
{
  "id": 1,
  "labor": { ... },
  "supervisor": { ... },
  "project_id": 1,
  "type": "clock_in",
  "photo_url": "http://localhost/storage/attendance-photos/photo.jpg",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "location_address": "123 Main St, New York, NY",
  "timestamp": "2024-01-15T09:00:00.000000Z",
  "created_at": "2024-01-15T09:00:00.000000Z"
}
```

### ProjectMessage
```json
{
  "id": 1,
  "project_id": 1,
  "user": { ... },
  "message": "Project update: Foundation work completed",
  "photo_url": "http://localhost/storage/message-photos/photo.jpg",
  "created_at": "2024-01-15T10:00:00.000000Z"
}
```
