/**
 * Shared TypeScript type/interface definitions for the EduIntern SIMMS frontend.
 *
 * !! IMPORTANT: This file must NEVER contain hardcoded data objects or seeded values.
 * All data must come from the real backend API via /src/lib/api.ts
 *
 * This file is kept for backward compatibility with components that import types here.
 * Future work: migrate these types to /src/types/index.ts
 */

export interface StudentProfile {
  name: string;
  studentId: string;
  email: string;
  phone: string;
  college: string;
  university: string;
  department: string;
  year: string;
  gpa: number;
  avatarInitials: string;
  skills: string[];
  resume: {
    fileName: string;
    status: "Verified & Active" | "Pending Verification" | "Action Required";
    uploadDate: string;
    fileSize: string;
  };
}

export interface InternshipDetails {
  company: string;
  role: string;
  mentor: string;
  mentorTitle: string;
  mentorEmail: string;
  location: string;
  term: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Completed" | "Pending";
  stipend: string;
}

export interface ProgressSummary {
  currentWeek: number;
  totalWeeks: number;
  percentComplete: number;
  hoursCompleted: number;
  targetHours: number;
  weeklyTargetHours: number;
}

export interface TaskItem {
  id: string;
  title: string;
  status: "Completed" | "In Progress" | "Pending";
  dueDate: string;
  category: "Architecture" | "Database" | "API" | "Testing";
}

export interface ReportItem {
  week: number;
  status: "Approved" | "Under Review" | "Pending Submission";
  submissionDate?: string;
  hoursLogged: number;
  mentorScore?: number; // 1 to 5
}

export interface SkillMatchItem {
  skill: string;
  studentLevel: "Beginner" | "Intermediate" | "Advanced";
  requiredLevel: "Beginner" | "Intermediate" | "Advanced";
  matchStatus: "Met" | "Partial" | "Missing";
  progressPct: number;
}

export type AttentionStatusLevel = "ON_TRACK" | "MONITOR" | "NEEDS_ATTENTION";

export interface AttentionStatus {
  status: AttentionStatusLevel;
  attentionScore: number; // 0 to 100
  health: "Healthy" | "Attention Needed" | "Critical Risk";
  riskScore: number; // 0 to 100
  lastEvaluated: string;
  flaggedReasons: string[];
  reasons: string[];
  recommendedActions: string[];
  recommendations: string[];
}

export type ReportStatus = "Submitted" | "Pending Review" | "Reviewed";

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasksCompleted: string;
  workDescription: string;
  skillsLearned: string[];
  challengesFaced: string;
  nextWeekPlan: string;
  submissionDate: string;
  status: ReportStatus;
  shortSummary: string;
  mentorFeedbackStatus: string;
  mentorScore?: number;
  mentorFeedback?: string;
  hoursLogged?: number;
}

export interface WeeklyProgressItem {
  week: number;
  title: string;
  dateRange: string;
  hoursLogged: number;
  targetHours: number;
  status: "Completed" | "Current" | "Upcoming";
  completedTasksCount: number;
  highlights: string;
}

export interface RegisteredInternship {
  id: string;
  companyName: string;
  internshipTitle: string;
  domain: string;
  startDate: string;
  endDate: string;
  mode: "Online" | "Offline" | "Hybrid";
  location: string;
  requiredSkills: string[];
  description: string;
  mentorName: string;
  mentorEmail: string;
  mentorPhone: string;
  registrationStatus: "Approved" | "Pending Review" | "Under Evaluation";
  submittedAt: string;
}

// ============================================================================
// ZERO MOCK DATA ENFORCEMENT
// ============================================================================
// There are NO exported data objects in this file.
// ALL data displayed in the UI must come from backend API responses.
// mockStudentData was removed as part of the SIMMS frontend refactor.
// See /src/lib/api.ts for all API call methods.
// ============================================================================
