# REST API Contract: Smart Internship Management and Monitoring System

**Base URL**: `http://localhost:8000/api/v1`  
**Standard Header**: `Content-Type: application/json`  
**Auth Header**: `Authorization: Bearer <jwt_access_token>`

All timestamp fields use ISO 8601 UTC format (e.g., `2026-09-16T12:00:00Z`).  
Standard error responses follow FastAPI conventions:
```json
{
  "detail": "Descriptive error message"
}
```

---

## 1. Authentication

### 1.1 Register User
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/register`
- **Purpose**: Registers a new user account (Student, Mentor, or Admin).
- **Request Body**:
```json
{
  "email": "jane.student@university.edu",      // string, required, valid email format
  "password": "SecurePassword123!",            // string, required, min 8 chars
  "full_name": "Jane Doe",                     // string, required
  "role": "student"                            // string, required, enum: ["student", "mentor", "admin"]
}
```
- **Response**: `201 Created`
```json
{
  "id": "c1f7b8d4-5e92-4f6a-9a1b-3f4e5a6b7c8d",
  "email": "jane.student@university.edu",
  "full_name": "Jane Doe",
  "role": "student",
  "created_at": "2026-09-16T12:00:00Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: `{"detail": "Email already registered"}`
  - `422 Unprocessable Entity`: `{"detail": "Validation error: invalid email or password too short"}`

---

### 1.2 Login (Token Generation)
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/login`
- **Purpose**: Authenticates user and issues a signed JSON Web Token (JWT).
- **Request Body**:
```json
{
  "email": "jane.student@university.edu",      // string, required
  "password": "SecurePassword123!"             // string, required
}
```
- **Response**: `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "c1f7b8d4-5e92-4f6a-9a1b-3f4e5a6b7c8d",
    "email": "jane.student@university.edu",
    "full_name": "Jane Doe",
    "role": "student"
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: `{"detail": "Invalid email or password"}`

---

### 1.3 Get Current User Profile
- **Method**: `GET`
- **Endpoint**: `/api/v1/auth/me`
- **Purpose**: Returns the authenticated user's profile and role.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
```json
{
  "id": "c1f7b8d4-5e92-4f6a-9a1b-3f4e5a6b7c8d",
  "email": "jane.student@university.edu",
  "full_name": "Jane Doe",
  "role": "student",
  "created_at": "2026-09-16T12:00:00Z"
}
```
- **Error Responses**:
  - `401 Unauthorized`: `{"detail": "Could not validate credentials"}`

---

## 2. Students

### 2.1 Get Student Profile
- **Method**: `GET`
- **Endpoint**: `/api/v1/students/{id}`
- **Purpose**: Retrieves a student's academic and profile details.
- **Path Parameters**:
  - `id` (UUID, required): Student ID or User ID.
- **Response**: `200 OK`
```json
{
  "id": "s8a9b0c1-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
  "user_id": "c1f7b8d4-5e92-4f6a-9a1b-3f4e5a6b7c8d",
  "full_name": "Jane Doe",
  "university": "State Engineering University",
  "department": "Computer Science",
  "year_of_study": 3,
  "gpa": 3.85,
  "bio": "Passionate backend engineer interested in distributed systems.",
  "resume_url": "https://storage.example.com/resumes/jane_doe.pdf"
}
```
- **Error Responses**:
  - `404 Not Found`: `{"detail": "Student profile not found"}`

---

### 2.2 Update Student Profile
- **Method**: `PUT`
- **Endpoint**: `/api/v1/students/{id}`
- **Purpose**: Updates student academic and personal information.
- **Path Parameters**:
  - `id` (UUID, required): Student ID.
- **Request Body**:
```json
{
  "university": "State Engineering University", // string, optional
  "department": "Computer Science",             // string, optional
  "year_of_study": 4,                           // integer, optional (1-5)
  "gpa": 3.90,                                  // float, optional (0.0-4.0)
  "bio": "Updated bio text",                    // string, optional
  "resume_url": "https://storage.example.com/resumes/jane_doe_v2.pdf" // string, optional
}
```
- **Response**: `200 OK` (Returns updated student profile object).
- **Error Responses**:
  - `403 Forbidden`: `{"detail": "Not authorized to modify this profile"}`
  - `404 Not Found`: `{"detail": "Student not found"}`

---

### 2.3 Get Student Skills
- **Method**: `GET`
- **Endpoint**: `/api/v1/students/{id}/skills`
- **Purpose**: Lists all skills associated with the student profile along with proficiency levels.
- **Path Parameters**:
  - `id` (UUID, required): Student ID.
- **Response**: `200 OK`
```json
{
  "student_id": "s8a9b0c1-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
  "skills": [
    {
      "skill_id": "sk-101",
      "skill_name": "Python",
      "category": "Backend",
      "proficiency": "advanced"                // enum: ["beginner", "intermediate", "advanced"]
    },
    {
      "skill_id": "sk-102",
      "skill_name": "FastAPI",
      "category": "Backend",
      "proficiency": "intermediate"
    }
  ]
}
```
- **Error Responses**:
  - `404 Not Found`: `{"detail": "Student not found"}`

---

### 2.4 Add or Update Student Skills
- **Method**: `POST`
- **Endpoint**: `/api/v1/students/{id}/skills`
- **Purpose**: Adds or updates self-declared skills on the student profile.
- **Path Parameters**:
  - `id` (UUID, required): Student ID.
- **Request Body**:
```json
{
  "skills": [
    {
      "skill_name": "Docker",                  // string, required
      "proficiency": "beginner"                // string, required, enum: ["beginner", "intermediate", "advanced"]
    }
  ]
}
```
- **Response**: `200 OK` (Returns updated skills list).
- **Error Responses**:
  - `403 Forbidden`: `{"detail": "Not authorized to update skills"}`

---

## 3. Internships

### 3.1 List Internships
- **Method**: `GET`
- **Endpoint**: `/api/v1/internships`
- **Purpose**: Lists available internship listings with filtering and pagination.
- **Query Parameters**:
  - `status` (string, optional, default: `"open"`): Filter by status (`"open"`, `"closed"`).
  - `company_id` (UUID, optional): Filter by company.
  - `search` (string, optional): Keyword search in title/description.
  - `limit` (integer, optional, default: 20): Number of records.
  - `offset` (integer, optional, default: 0): Pagination offset.
- **Response**: `200 OK`
```json
{
  "total": 42,
  "limit": 20,
  "offset": 0,
  "items": [
    {
      "id": "in-7788",
      "title": "Backend Engineering Intern",
      "company_name": "CloudScale Systems",
      "location": "Remote",
      "duration_weeks": 12,
      "stipend": 1500.00,
      "status": "open",
      "required_skills": ["Python", "FastAPI", "PostgreSQL"],
      "created_at": "2026-09-10T10:00:00Z"
    }
  ]
}
```
- **Error Responses**:
  - `422 Unprocessable Entity`: `{"detail": "Invalid query parameters"}`

---

### 3.2 Get Internship Details
- **Method**: `GET`
- **Endpoint**: `/api/v1/internships/{id}`
- **Purpose**: Retrieves full details of a specific internship including required skills and mentor contact.
- **Path Parameters**:
  - `id` (UUID, required): Internship ID.
- **Response**: `200 OK`
```json
{
  "id": "in-7788",
  "title": "Backend Engineering Intern",
  "description": "Work with our cloud infrastructure team to build scalable microservices.",
  "company": {
    "id": "co-101",
    "name": "CloudScale Systems",
    "website": "https://cloudscale.example.com"
  },
  "mentor_id": "m-5544",
  "duration_weeks": 12,
  "stipend": 1500.00,
  "status": "open",
  "required_skills": [
    {"skill_name": "Python", "min_proficiency": "intermediate"},
    {"skill_name": "PostgreSQL", "min_proficiency": "beginner"}
  ],
  "created_at": "2026-09-10T10:00:00Z"
}
```
- **Error Responses**:
  - `404 Not Found`: `{"detail": "Internship not found"}`

---

### 3.3 Create Internship
- **Method**: `POST`
- **Endpoint**: `/api/v1/internships`
- **Purpose**: Creates a new internship listing (Authorized for Mentors and Admins).
- **Request Body**:
```json
{
  "company_id": "co-101",                      // UUID, required
  "title": "Full Stack Intern",                // string, required
  "description": "Design and build web apps",  // string, required
  "location": "Hybrid - New York, NY",         // string, required
  "duration_weeks": 12,                        // integer, required (1-52)
  "stipend": 1200.00,                          // float, optional
  "required_skills": [                         // array of objects, required
    {
      "skill_name": "React",
      "min_proficiency": "intermediate"
    },
    {
      "skill_name": "FastAPI",
      "min_proficiency": "beginner"
    }
  ]
}
```
- **Response**: `201 Created` (Returns newly created internship object).
- **Error Responses**:
  - `401 Unauthorized`: `{"detail": "Authentication required"}`
  - `403 Forbidden`: `{"detail": "Only Mentors or Admins can post internships"}`

---

### 3.4 Update Internship
- **Method**: `PUT`
- **Endpoint**: `/api/v1/internships/{id}`
- **Purpose**: Updates an existing internship posting.
- **Path Parameters**:
  - `id` (UUID, required): Internship ID.
- **Request Body**: Same fields as creation; partial fields allowed.
- **Response**: `200 OK` (Returns updated internship).
- **Error Responses**:
  - `403 Forbidden`: `{"detail": "Not authorized to edit this listing"}`
  - `404 Not Found`: `{"detail": "Internship not found"}`

---

## 4. Applications

### 4.1 Apply for Internship
- **Method**: `POST`
- **Endpoint**: `/api/v1/applications`
- **Purpose**: Submits a student application for an internship.
- **Request Body**:
```json
{
  "internship_id": "in-7788",                  // UUID, required
  "statement_of_purpose": "Excited to contribute to cloud infrastructure...", // string, optional
  "portfolio_url": "https://github.com/janedoe"// string, optional
}
```
- **Response**: `201 Created`
```json
{
  "id": "app-9901",
  "internship_id": "in-7788",
  "student_id": "s8a9b0c1-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
  "status": "applied",                         // enum: ["applied", "under_review", "accepted", "rejected"]
  "applied_at": "2026-09-16T12:30:00Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: `{"detail": "You have already applied to this internship"}`
  - `404 Not Found`: `{"detail": "Internship not found or closed"}`

---

### 4.2 List Applications
- **Method**: `GET`
- **Endpoint**: `/api/v1/applications`
- **Purpose**: Retrieves applications filtered by student (for students) or internship/mentor (for mentors).
- **Query Parameters**:
  - `internship_id` (UUID, optional): Filter by internship.
  - `student_id` (UUID, optional): Filter by student.
  - `status` (string, optional): Filter by status (`"applied"`, `"accepted"`, etc.).
- **Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "app-9901",
      "internship_title": "Backend Engineering Intern",
      "student_name": "Jane Doe",
      "status": "applied",
      "applied_at": "2026-09-16T12:30:00Z"
    }
  ]
}
```

---

### 4.3 Update Application Status
- **Method**: `PATCH`
- **Endpoint**: `/api/v1/applications/{id}/status`
- **Purpose**: Updates the status of an application (Mentors/Admins only).
- **Path Parameters**:
  - `id` (UUID, required): Application ID.
- **Request Body**:
```json
{
  "status": "accepted",                        // string, required, enum: ["under_review", "accepted", "rejected"]
  "feedback_notes": "Strong candidate with solid Python background." // string, optional
}
```
- **Response**: `200 OK`
```json
{
  "id": "app-9901",
  "status": "accepted",
  "feedback_notes": "Strong candidate with solid Python background.",
  "updated_at": "2026-09-16T13:00:00Z"
}
```
- **Error Responses**:
  - `403 Forbidden`: `{"detail": "Only mentors can update application status"}`
  - `404 Not Found`: `{"detail": "Application not found"}`

---

## 5. Progress Reports

### 5.1 Submit Weekly Progress Report
- **Method**: `POST`
- **Endpoint**: `/api/v1/progress-reports`
- **Purpose**: Allows an active intern to submit their weekly progress report.
- **Request Body**:
```json
{
  "application_id": "app-9901",                // UUID, required
  "week_number": 3,                            // integer, required (1-52)
  "hours_worked": 20.0,                        // float, required (0.0-80.0)
  "tasks_completed": "Configured database connection pool and wrote unit tests for auth service.", // string, required
  "tasks_in_progress": "Implementing rate limiter middleware.", // string, optional
  "blockers": "Experiencing Docker port conflicts on local testing environment.", // string, optional
  "self_satisfaction_rating": 4                // integer, required (1 to 5)
}
```
- **Response**: `201 Created`
```json
{
  "id": "pr-3001",
  "application_id": "app-9901",
  "week_number": 3,
  "submitted_at": "2026-09-16T13:05:00Z",
  "status": "submitted"
}
```
- **Error Responses**:
  - `400 Bad Request`: `{"detail": "Report for this week number already submitted"}`
  - `403 Forbidden`: `{"detail": "Application is not in active accepted state"}`

---

### 5.2 List Progress Reports
- **Method**: `GET`
- **Endpoint**: `/api/v1/progress-reports`
- **Purpose**: Lists submitted reports for an application or student.
- **Query Parameters**:
  - `application_id` (UUID, required): Filter by specific internship placement.
- **Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "pr-3001",
      "week_number": 3,
      "hours_worked": 20.0,
      "tasks_completed": "Configured database connection pool...",
      "blockers": "Experiencing Docker port conflicts...",
      "self_satisfaction_rating": 4,
      "submitted_at": "2026-09-16T13:05:00Z"
    }
  ]
}
```

---

### 5.3 Get Progress Report Details
- **Method**: `GET`
- **Endpoint**: `/api/v1/progress-reports/{id}`
- **Purpose**: Retrieves full details of an individual report.
- **Path Parameters**:
  - `id` (UUID, required): Progress Report ID.
- **Response**: `200 OK` (Returns full progress report object).
- **Error Responses**:
  - `404 Not Found`: `{"detail": "Progress report not found"}`

---

## 6. Mentor Monitoring

### 6.1 List Mentored Interns
- **Method**: `GET`
- **Endpoint**: `/api/v1/mentor/students`
- **Purpose**: Lists all active student interns under the authenticated mentor along with recent submission status and risk indicators.
- **Response**: `200 OK`
```json
{
  "items": [
    {
      "student_id": "s8a9b0c1-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
      "student_name": "Jane Doe",
      "internship_title": "Backend Engineering Intern",
      "application_id": "app-9901",
      "latest_report_week": 3,
      "days_since_last_report": 2,
      "risk_level": "LOW",                     // enum: ["LOW", "MEDIUM", "HIGH"]
      "active_blockers_count": 1
    }
  ]
}
```
- **Error Responses**:
  - `403 Forbidden`: `{"detail": "Access restricted to mentors"}`

---

### 6.2 Submit Mentor Evaluation
- **Method**: `POST`
- **Endpoint**: `/api/v1/evaluations`
- **Purpose**: Mentors record periodic or milestone evaluations for a student intern.
- **Request Body**:
```json
{
  "application_id": "app-9901",                // UUID, required
  "progress_report_id": "pr-3001",             // UUID, optional (tie to specific report)
  "performance_rating": 4.5,                   // float, required (1.0 to 5.0)
  "technical_skills_rating": 4.0,              // float, required (1.0 to 5.0)
  "communication_rating": 5.0,                 // float, required (1.0 to 5.0)
  "feedback_summary": "Great initiative this week. Proactively asked for help with Docker.", // string, required
  "recommended_action": "Continue with next milestone" // string, optional
}
```
- **Response**: `201 Created`
```json
{
  "id": "ev-4001",
  "application_id": "app-9901",
  "evaluated_by": "m-5544",
  "performance_rating": 4.5,
  "created_at": "2026-09-16T13:10:00Z"
}
```
- **Error Responses**:
  - `403 Forbidden`: `{"detail": "Only the assigned mentor can submit evaluations"}`

---

## 7. Dashboard Analytics

### 7.1 Get Dashboard Metrics
- **Method**: `GET`
- **Endpoint**: `/api/v1/analytics/dashboard`
- **Purpose**: Delivers aggregated summary cards and charts tailored to the authenticated user's role.
- **Response**: `200 OK`
```json
{
  "role": "mentor",
  "metrics": {
    "total_assigned_interns": 8,
    "active_interns": 7,
    "reports_pending_review": 3,
    "at_risk_interns_count": 2
  },
  "recent_activity": [
    {
      "event": "Report Submitted",
      "student_name": "Jane Doe",
      "timestamp": "2026-09-16T13:05:00Z"
    }
  ]
}
```
- **Error Responses**:
  - `401 Unauthorized`: `{"detail": "Authentication required"}`

---

## 8. Skill-Gap Analysis

### 8.1 Evaluate Skill Gap for Internship
- **Method**: `GET`
- **Endpoint**: `/api/v1/intelligence/skill-gap/{internship_id}`
- **Purpose**: Compares the authenticated student's declared skills against the internship's required skills, computing matching percentage and recommended skills to acquire.
- **Path Parameters**:
  - `internship_id` (UUID, required): Target internship ID.
- **Response**: `200 OK`
```json
{
  "internship_id": "in-7788",
  "internship_title": "Backend Engineering Intern",
  "match_percentage": 66.7,
  "matching_skills": [
    {
      "skill_name": "Python",
      "student_proficiency": "advanced",
      "required_proficiency": "intermediate",
      "status": "satisfied"
    },
    {
      "skill_name": "PostgreSQL",
      "student_proficiency": "beginner",
      "required_proficiency": "beginner",
      "status": "satisfied"
    }
  ],
  "missing_skills": [
    {
      "skill_name": "FastAPI",
      "required_proficiency": "beginner",
      "status": "missing"
    }
  ],
  "recommendations": [
    "Complete a beginner FastAPI tutorial on building RESTful CRUD endpoints.",
    "Highlight any previous experience with asynchronous Python in your application."
  ]
}
```
- **Error Responses**:
  - `404 Not Found`: `{"detail": "Internship not found"}`

---

## 9. Attention / Early-Intervention Analysis

### 9.1 List Attention Alerts
- **Method**: `GET`
- **Endpoint**: `/api/v1/intelligence/attention-alerts`
- **Purpose**: Mentors and Admins retrieve active, explainable early-attention alerts for struggling students.
- **Query Parameters**:
  - `severity` (string, optional): Filter by `"HIGH"` or `"MEDIUM"`.
  - `resolved` (boolean, optional, default: `false`): Filter by resolution state.
- **Response**: `200 OK`
```json
{
  "alerts_count": 2,
  "items": [
    {
      "alert_id": "alt-8001",
      "student_id": "s8a9b0c1-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
      "student_name": "Jane Doe",
      "internship_title": "Backend Engineering Intern",
      "risk_level": "HIGH",
      "risk_score": 65,
      "flagged_reasons": [
        "No progress report submitted for the past 10 days (Deadline: 7 days)",
        "Unresolved blocker: 'Docker port conflicts' reported in consecutive weeks",
        "Recent mentor evaluation score dropped to 2.5/5.0"
      ],
      "suggested_interventions": [
        "Schedule a 15-minute 1-on-1 check-in to unblock local environment setup",
        "Verify if task scope needs adjustment"
      ],
      "created_at": "2026-09-16T12:45:00Z",
      "resolved": false
    }
  ]
}
```
- **Error Responses**:
  - `403 Forbidden`: `{"detail": "Access restricted to Mentors and Admins"}`

---

### 9.2 Trigger Risk Assessment Evaluation
- **Method**: `POST`
- **Endpoint**: `/api/v1/intelligence/evaluate-risk/{student_id}`
- **Purpose**: Manually re-evaluates the early-attention risk score and explanations for a student intern based on recent logs and mentor feedback.
- **Path Parameters**:
  - `student_id` (UUID, required): Target student ID.
- **Response**: `200 OK`
```json
{
  "student_id": "s8a9b0c1-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
  "evaluated_at": "2026-09-16T13:15:00Z",
  "risk_score": 65,
  "risk_level": "HIGH",
  "attention_needed": true,
  "flagged_reasons": [
    "No progress report submitted for the past 10 days (Deadline: 7 days)",
    "Unresolved blocker: 'Docker port conflicts' reported in consecutive weeks"
  ],
  "alert_generated": true
}
```
- **Error Responses**:
  - `404 Not Found`: `{"detail": "Student or active internship application not found"}`
