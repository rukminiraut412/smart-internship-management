/**
 * Smart Internship Management System — Frontend API Service Layer
 *
 * Configured with NEXT_PUBLIC_API_URL (defaults to http://localhost:8000).
 * Handles authentication headers, error classification, and graceful fallbacks.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_KEY = "sims_access_token";
const USER_KEY = "sims_user";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/** Token and Session helpers */
export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: (): UserProfile | null => {
    if (typeof window === "undefined") return null;
    const str = localStorage.getItem(USER_KEY);
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  },
  setUser: (user: UserProfile): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

/** Standardized Fetch Wrapper */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = authStorage.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let errorData: unknown = null;

      try {
        errorData = await response.json();
        if (errorData && typeof errorData === "object") {
          const dict = errorData as Record<string, unknown>;
          if (dict.detail) {
            errorMessage =
              typeof dict.detail === "string"
                ? dict.detail
                : JSON.stringify(dict.detail);
          }
        }
      } catch {
        // Non-JSON response
      }

      if (response.status === 401) {
        // If unauthorized, clean up invalid stored token
        authStorage.removeToken();
        throw new ApiError(errorMessage || "Session expired. Please log in again.", 401, errorData);
      } else if (response.status === 403) {
        throw new ApiError(errorMessage || "Access forbidden.", 403, errorData);
      } else if (response.status === 404) {
        throw new ApiError(errorMessage || "Requested resource not found.", 404, errorData);
      } else if (response.status === 422) {
        throw new ApiError(errorMessage || "Validation error in request payload.", 422, errorData);
      } else if (response.status >= 500) {
        throw new ApiError(errorMessage || "Internal server error. Please try again.", response.status, errorData);
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors or backend unreachable
    throw new ApiError(
      "Backend server is unavailable or offline. Ensure backend is running at " + API_BASE_URL,
      0,
      error
    );
  }
}

/** 1. AUTH SCHEMAS & API */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  student_id?: string;
  mentor_id?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export const authApi = {
  register: async (payload: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }): Promise<UserProfile> => {
    return apiRequest<UserProfile>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login: async (payload: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.access_token) {
      authStorage.setToken(res.access_token);
      authStorage.setUser(res.user);
    }
    return res;
  },

  getMe: async (): Promise<UserProfile> => {
    const user = await apiRequest<UserProfile>("/api/auth/me");
    authStorage.setUser(user);
    return user;
  },

  logout: (): void => {
    authStorage.removeToken();
  },
};

/** 2. INTERNSHIP & REPORTS SCHEMAS & API */
export interface BackendInternship {
  id: string;
  company_id: string;
  company_name?: string;
  mentor_id?: string;
  title: string;
  domain?: string;
  description?: string;
  location?: string;
  mode: string;
  status: string;
  stipend?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface BackendProgressReport {
  id: string;
  student_id: string;
  internship_id: string;
  week_number: number;
  title?: string;
  summary?: string;
  hours_logged: number;
  status: string;
  mentor_feedback?: string;
  mentor_score?: number;
  submission_date?: string;
  created_at: string;
}

export interface StudentInternshipItem {
  application_id: string;
  application_status: string;
  applied_at: string;
  internship: BackendInternship;
}

export const internshipsApi = {
  list: async (params?: { domain?: string; status?: string }): Promise<BackendInternship[]> => {
    const query = new URLSearchParams();
    if (params?.domain) query.append("domain", params.domain);
    if (params?.status) query.append("status", params.status);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<BackendInternship[]>(`/api/internships${qs}`);
  },

  getById: async (id: string): Promise<BackendInternship> => {
    return apiRequest<BackendInternship>(`/api/internships/${id}`);
  },

  create: async (data: {
    company_id: string;
    mentor_id?: string;
    title: string;
    domain?: string;
    description?: string;
    location?: string;
    mode?: string;
    status?: string;
    stipend?: string;
  }): Promise<BackendInternship> => {
    return apiRequest<BackendInternship>("/api/internships", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  listReports: async (
    internshipId: string,
    studentId?: string
  ): Promise<BackendProgressReport[]> => {
    const qs = studentId ? `?student_id=${encodeURIComponent(studentId)}` : "";
    return apiRequest<BackendProgressReport[]>(`/api/internships/${internshipId}/reports${qs}`);
  },

  createReport: async (
    internshipId: string,
    report: {
      student_id: string;
      week_number: number;
      title?: string;
      summary?: string;
      hours_logged: number;
      status?: string;
      mentor_feedback?: string;
      mentor_score?: number;
    }
  ): Promise<BackendProgressReport> => {
    return apiRequest<BackendProgressReport>(`/api/internships/${internshipId}/reports`, {
      method: "POST",
      body: JSON.stringify(report),
    });
  },
};

export interface StudentInternshipRegisterPayload {
  company_name: string;
  internship_title: string;
  domain?: string;
  start_date?: string;
  end_date?: string;
  mode?: "Online" | "Offline" | "Hybrid";
  location?: string;
  required_skills?: string[];
  description?: string;
  mentor_name?: string;
  mentor_email?: string;
  mentor_phone?: string;
  stipend?: string;
}

export interface BackendStudentProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  student_id_number?: string;
  phone?: string;
  college?: string;
  university?: string;
  department?: string;
  year_of_study?: string;
  gpa?: number;
  resume_url?: string;
  skills: string[];
  created_at: string;
  updated_at?: string;
}

export interface StudentProfileUpdatePayload {
  name?: string;
  phone?: string;
  college?: string;
  university?: string;
  department?: string;
  year_of_study?: string;
  gpa?: number;
  resume_url?: string;
  skills?: string[];
}

/** 3. STUDENTS API */
export const studentsApi = {
  getProfile: async (studentId: string): Promise<BackendStudentProfile> => {
    return apiRequest<BackendStudentProfile>(`/api/students/${studentId}`);
  },

  updateProfile: async (
    studentId: string,
    payload: StudentProfileUpdatePayload
  ): Promise<BackendStudentProfile> => {
    return apiRequest<BackendStudentProfile>(`/api/students/${studentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getInternships: async (studentId: string): Promise<StudentInternshipItem[]> => {
    return apiRequest<StudentInternshipItem[]>(`/api/students/${studentId}/internships`);
  },

  registerInternship: async (
    studentId: string,
    payload: StudentInternshipRegisterPayload
  ): Promise<BackendInternship> => {
    return apiRequest<BackendInternship>(`/api/students/${studentId}/register-internship`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

/** 4. INTELLIGENCE API */
export interface SkillGapResult {
  matched_skills: string[];
  missing_skills: string[];
  match_percentage: number;
  recommendation: string;
}

export interface ProgressAttentionResult {
  score: number;
  status: "ON_TRACK" | "MONITOR" | "NEEDS_ATTENTION" | string;
  reasons: string[];
  recommendations: string[];
}

export const intelligenceApi = {
  evaluateSkillGap: async (
    studentSkills: string[],
    requiredSkills: string[]
  ): Promise<SkillGapResult> => {
    return apiRequest<SkillGapResult>("/api/intelligence/skill-gap", {
      method: "POST",
      body: JSON.stringify({
        student_skills: studentSkills,
        required_skills: requiredSkills,
      }),
    });
  },

  getInternshipSkillGap: async (
    internshipId: string,
    studentId?: string
  ): Promise<SkillGapResult> => {
    const qs = studentId ? `?student_id=${encodeURIComponent(studentId)}` : "";
    return apiRequest<SkillGapResult>(`/api/intelligence/skill-gap/${internshipId}${qs}`);
  },

  evaluateAttention: async (metrics: {
    progress_consistency?: number;
    task_completion?: number;
    report_submission?: number;
    mentor_feedback?: number;
  }): Promise<ProgressAttentionResult> => {
    return apiRequest<ProgressAttentionResult>("/api/intelligence/evaluate-attention", {
      method: "POST",
      body: JSON.stringify(metrics),
    });
  },

  getStudentAttention: async (studentId: string): Promise<ProgressAttentionResult> => {
    return apiRequest<ProgressAttentionResult>(`/api/intelligence/attention-status/${studentId}`);
  },
};

/** 5. HEALTH CHECK API */
export const healthApi = {
  check: async (): Promise<{ status: string; message: string; environment?: string }> => {
    return apiRequest<{ status: string; message: string; environment?: string }>("/api/health");
  },
};

/** 6. MENTORS SCHEMAS & API */
export interface MentorProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company_id?: string;
  company_name?: string;
  job_title?: string;
  department?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface MentorInternItem {
  student_id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  student_id_number?: string;
  college?: string;
  department?: string;
  internship_id: string;
  internship_title: string;
  company_name?: string;
  progress_pct: number;
  tasks_completed: number;
  total_tasks: number;
  reports_submitted: number;
  total_reports: number;
  attention_status: string;
  latest_report_status?: string;
}

export interface EvaluationItem {
  id: string;
  student_id: string;
  internship_id: string;
  mentor_id: string;
  evaluation_type: string;
  rating: number;
  comments?: string;
  recommendation?: string;
  created_at: string;
}

export interface TaskItem {
  id: string;
  internship_id: string;
  student_id: string;
  mentor_id?: string;
  title: string;
  description?: string;
  category?: string;
  status: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

export const mentorsApi = {
  getMe: async (): Promise<MentorProfile> => {
    return apiRequest<MentorProfile>("/api/mentors/me");
  },

  updateProfile: async (payload: {
    name?: string;
    company_name?: string;
    job_title?: string;
    department?: string;
    phone?: string;
  }): Promise<MentorProfile> => {
    return apiRequest<MentorProfile>("/api/mentors/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getInterns: async (mentorId: string): Promise<MentorInternItem[]> => {
    return apiRequest<MentorInternItem[]>(`/api/mentors/${mentorId}/interns`);
  },

  reviewReport: async (
    reportId: string,
    payload: {
      status: string;
      mentor_feedback?: string;
      mentor_score?: number;
    }
  ): Promise<BackendProgressReport> => {
    return apiRequest<BackendProgressReport>(`/api/mentors/reports/${reportId}/review`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  createEvaluation: async (payload: {
    student_id: string;
    internship_id: string;
    evaluation_type: string;
    rating: number;
    comments?: string;
    recommendation?: string;
  }): Promise<EvaluationItem> => {
    return apiRequest<EvaluationItem>("/api/mentors/evaluations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getEvaluations: async (mentorId: string): Promise<EvaluationItem[]> => {
    return apiRequest<EvaluationItem[]>(`/api/mentors/${mentorId}/evaluations`);
  },

  getTasks: async (mentorId: string): Promise<TaskItem[]> => {
    return apiRequest<TaskItem[]>(`/api/mentors/${mentorId}/tasks`);
  },

  createTask: async (payload: {
    internship_id: string;
    student_id: string;
    title: string;
    description?: string;
    category?: string;
    due_date?: string;
  }): Promise<TaskItem> => {
    return apiRequest<TaskItem>("/api/mentors/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

/** 7. ADMIN SCHEMAS & API */
export interface AdminStats {
  total_students: number;
  active_internships: number;
  total_companies: number;
  total_mentors: number;
  pending_applications: number;
  reports_pending_review: number;
  students_needing_attention: number;
  completed_internships: number;
}

export interface AdminApplicationItem {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_id_number?: string;
  internship_id: string;
  internship_title: string;
  company_name?: string;
  status: string;
  applied_at: string;
}

export interface AdminMentorItem {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company_name?: string;
  job_title?: string;
  department?: string;
  phone?: string;
  assigned_interns_count: number;
  active_internships_count: number;
}

export interface AdminStudentItem {
  id: string;
  user_id: string;
  name: string;
  email: string;
  student_id_number?: string;
  college?: string;
  department?: string;
  year_of_study?: string;
  gpa?: number;
  active_internship_title?: string;
  status: string;
}

export interface AdminInternshipItem {
  id: string;
  title: string;
  company_name?: string;
  mentor_name?: string;
  domain?: string;
  mode: string;
  status: string;
  stipend?: string;
  applicant_count: number;
}

export interface AdminReportAlertItem {
  id: string;
  type: string;
  title: string;
  student_name: string;
  internship_title?: string;
  status: string;
  severity: string;
  date: string;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    return apiRequest<AdminStats>("/api/admin/stats");
  },

  getApplications: async (): Promise<AdminApplicationItem[]> => {
    return apiRequest<AdminApplicationItem[]>("/api/admin/applications");
  },

  updateApplicationStatus: async (
    applicationId: string,
    status: "Approved" | "Rejected" | "Pending" | string
  ): Promise<AdminApplicationItem> => {
    return apiRequest<AdminApplicationItem>(`/api/admin/applications/${applicationId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  getMentors: async (): Promise<AdminMentorItem[]> => {
    return apiRequest<AdminMentorItem[]>("/api/admin/mentors");
  },

  assignMentor: async (payload: {
    internship_id: string;
    mentor_id: string;
  }): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>("/api/admin/assign-mentor", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getStudents: async (): Promise<AdminStudentItem[]> => {
    return apiRequest<AdminStudentItem[]>("/api/admin/students");
  },

  getInternships: async (): Promise<AdminInternshipItem[]> => {
    return apiRequest<AdminInternshipItem[]>("/api/admin/internships");
  },

  getReportsAndAlerts: async (): Promise<AdminReportAlertItem[]> => {
    return apiRequest<AdminReportAlertItem[]>("/api/admin/reports-alerts");
  },
};
