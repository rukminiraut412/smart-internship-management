# Module Integration Guide: Smart Internship Management and Monitoring System

This document outlines the architecture, configuration, connected endpoints, intelligence integration, setup instructions, and known gaps for the integrated Smart Internship Management and Monitoring System.

---

## 1. System URLs & Configuration

| Service | Default Local URL | Configuration Environment Variable |
|---|---|---|
| **Frontend** (Next.js / React 19) | `http://localhost:3000` | `NEXT_PUBLIC_API_URL` (in `frontend/.env.local` or `.env`) |
| **Backend** (FastAPI / SQLAlchemy) | `http://localhost:8000` | `DATABASE_URL`, `CORS_ORIGINS`, `JWT_SECRET_KEY` (in `backend/.env`) |
| **Interactive API Docs** (Swagger UI) | `http://localhost:8000/api/docs` | Built-in via FastAPI OpenAPI |
| **Health Endpoint** | `http://localhost:8000/api/health` | Built-in health check |

### Environment Setup

#### Frontend (`frontend/.env.example` -> `frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
*Note: The frontend does not hardcode localhost throughout the application; all API requests pass through the unified service layer in `frontend/src/lib/api.ts`.*

#### Backend (`backend/.env.example` -> `backend/.env`)
```env
ENVIRONMENT=development
PROJECT_NAME="Smart Internship Management Backend"
API_V1_STR=/api
DATABASE_URL=sqlite:///./sql_app.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
JWT_SECRET_KEY=dev-secret-key-change-in-production-only
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## 2. Authentication Flow

The system implements JSON Web Token (JWT) Bearer authentication:

```
[ Frontend Client ]                                      [ Backend API ]
         |                                                       |
         | --- POST /api/auth/register (email, password, ...) -> |
         | <-- 201 Created (UserResponse without password) ----- |
         |                                                       |
         | --- POST /api/auth/login (email, password) ---------> |
         | <-- 200 OK (access_token, token_type, user) --------- |
         |                                                       |
         | [ Store token in browser localStorage:                |
         |   key: "sims_access_token" ]                          |
         |                                                       |
         | --- GET /api/auth/me (Authorization: Bearer <token>) ->|
         | <-- 200 OK (current authenticated user profile) ------ |
```

- **Protected Requests**: For authenticated requests, the frontend client automatically attaches:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Error Handling**:
  - `401 Unauthorized`: Token expired or invalid; the client purges the stored token and prompts re-login.
  - `403 Forbidden`: Insufficient role or access permissions.
  - `422 Unprocessable Entity`: Request validation failure with detailed field explanations.

---

## 3. Connected Endpoints & Schema Mapping

The frontend communicates with backend APIs using existing schemas:

| Feature | HTTP Method & Endpoint | Backend Schema | Integration Details |
|---|---|---|---|
| **Health Check** | `GET /api/health` | `{ status, message, environment }` | Monitored by frontend to show live "Backend Connected" / "Local Mode" badge |
| **User Registration** | `POST /api/auth/register` | `UserRegisterRequest` -> `UserResponse` | User registers as student or mentor; creates specialized profile record |
| **User Login** | `POST /api/auth/login` | `UserLoginRequest` -> `TokenResponse` | Returns JWT bearer access token and user metadata |
| **Current User Profile** | `GET /api/auth/me` | `UserResponse` | Verifies active JWT and retrieves user identity |
| **Internship Listings** | `GET /api/internships` | `List[InternshipResponse]` | Retrieves available internships (filterable by `domain` and `status`) |
| **Internship Details** | `GET /api/internships/{id}` | `InternshipResponse` | Fetches details, company name, mentor info, and dates |
| **Student Internships** | `GET /api/students/{id}/internships` | `List[StudentInternshipItem]` | Fetches student placement applications and linked internship records |
| **Submit Weekly Report** | `POST /api/internships/{id}/reports` | `ProgressReportCreate` -> `ProgressReportResponse` | Submits weekly work log, hours logged, and task summaries |
| **Weekly Report History** | `GET /api/internships/{id}/reports` | `List[ProgressReportResponse]` | Fetches submitted reports filtered by student and sorted by week |
| **Skill Gap Evaluation** | `POST /api/intelligence/skill-gap` | `SkillGapRequest` -> `SkillGapResult` | Compares student skills with required skills using deterministic logic |
| **Internship Skill Gap** | `GET /api/intelligence/skill-gap/{id}` | `SkillGapResult` | Evaluates student against an internship's required skills from DB |
| **Attention Evaluation** | `POST /api/intelligence/evaluate-attention` | `ProgressAttentionRequest` -> `ProgressAttentionEngineResult` | Deterministic progress attention score and recommendations |
| **Student Attention Status** | `GET /api/intelligence/attention-status/{id}` | `ProgressAttentionEngineResult` | Live evaluation of student's progress and cadence based on DB records |

---

## 4. Intelligence Module Integration

The `intelligence/` module is incorporated into the application **without external AI APIs**:

- **Skill Gap Analysis** (`intelligence/app/skill_gap.py`):
  - Normalizes and deduplicates skills (case-insensitive comparison).
  - Calculates `match_percentage = (matched / required) * 100`.
  - Generates transparent, human-readable learning recommendations.
  - Handles edge cases cleanly (empty student skills = 0%, empty required = 100%).

- **Internship Progress Attention** (`intelligence/app/progress_analysis.py`):
  - Deterministic 4-factor scoring:
    $$\text{Score} = (\text{Consistency} \times 0.30) + (\text{Task Completion} \times 0.30) + (\text{Reports} \times 0.20) + (\text{Mentor Feedback} \times 0.20)$$
  - Status thresholds:
    - $\ge 75.0$: `ON_TRACK`
    - $50.0 - 74.9$: `MONITOR`
    - $< 50.0$: `NEEDS_ATTENTION`
  - Returns explainable reasons and actionable recommendations.
  - **Scope Limitation**: Strictly monitors internship progress milestones and task cadence. It makes **no predictions** regarding a student's personal behavior, psychological state, or mental health.

---

## 5. Local Setup & Startup Commands

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup & Startup
```powershell
# 1. Install backend requirements
python -m pip install -r backend/requirements.txt

# 2. Run backend tests
python -m pytest backend/tests -v

# 3. Start the FastAPI development server
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
Backend will be available at: `http://localhost:8000` (Docs at `http://localhost:8000/api/docs`).

### Frontend Setup & Startup
```powershell
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Verify linting and build
npm run lint
npm run build

# 4. Start Next.js development server
npm run dev
```
Frontend will be available at: `http://localhost:3000`.

### Running All Tests
```powershell
# Run backend and intelligence test suites concurrently
python -m pytest
```

---

## 6. Known Integration Gaps & Future Enhancements

1. **Student Internship Applications**:
   - `POST /api/applications` is part of the future API specification (`docs/API_CONTRACT.md`), while current backend creates placements directly via `POST /api/internships`. The frontend registration form currently submits and maintains state cleanly, awaiting formal application approval endpoints.
2. **Dynamic Task Assignment API**:
   - Currently, tasks are seeded in the database models and summarized in progress calculations; dedicated CRUD routes (`/api/tasks`) will allow mentors to assign custom tasks dynamically.
3. **File Storage for Resumes & Attachments**:
   - Resumes and report attachments currently store URLs/file references; cloud object storage (e.g. S3 / GCS / local static uploads) can be configured for production.
