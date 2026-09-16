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

export const mockStudentData: {
  student: StudentProfile;
  internship: InternshipDetails;
  progress: ProgressSummary;
  tasks: TaskItem[];
  reports: ReportItem[];
  skills: SkillMatchItem[];
  attention: AttentionStatus;
  registeredInternships: RegisteredInternship[];
  weeklyReports: WeeklyReport[];
  weeklyTimeline: WeeklyProgressItem[];
} = {
  student: {
    name: "Alex Rivera",
    studentId: "STU-2026-8842",
    email: "alex.rivera@university.edu",
    phone: "+1 (555) 382-9014",
    college: "School of Engineering & Applied Sciences",
    university: "State Institute of Technology",
    department: "Department of Computer Science & Engineering",
    year: "Final Year (Semester 7 - 2026)",
    gpa: 3.84,
    avatarInitials: "AR",
    skills: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Docker",
      "Git & GitHub",
      "TypeScript",
      "REST APIs",
      "Redis",
      "Linux Sysadmin",
      "CI/CD Pipelines",
    ],
    resume: {
      fileName: "alex_rivera_cs_resume_2026.pdf",
      status: "Verified & Active",
      uploadDate: "Aug 10, 2026",
      fileSize: "1.4 MB",
    },
  },
  internship: {
    company: "CloudScale Distributed Systems",
    role: "Backend Engineering Intern",
    mentor: "Dr. Marcus Vance",
    mentorTitle: "Staff Systems Architect",
    mentorEmail: "m.vance@cloudscale.io",
    location: "Hybrid (Seattle, WA / Remote)",
    term: "Fall 2026 Cohort",
    startDate: "Aug 15, 2026",
    endDate: "Nov 07, 2026",
    status: "Active",
    stipend: "$1,800 / month",
  },
  progress: {
    currentWeek: 5,
    totalWeeks: 12,
    percentComplete: 42,
    hoursCompleted: 105,
    targetHours: 240,
    weeklyTargetHours: 20,
  },
  tasks: [
    {
      id: "TSK-101",
      title: "Design PostgreSQL schema for telemetry ingestion",
      status: "Completed",
      dueDate: "Sep 01, 2026",
      category: "Database",
    },
    {
      id: "TSK-102",
      title: "Implement FastAPI CRUD routes with Pydantic v2 schemas",
      status: "Completed",
      dueDate: "Sep 08, 2026",
      category: "API",
    },
    {
      id: "TSK-103",
      title: "Set up Docker multi-stage build container & compose stack",
      status: "Completed",
      dueDate: "Sep 12, 2026",
      category: "Architecture",
    },
    {
      id: "TSK-104",
      title: "Write pytest integration tests with >80% code coverage",
      status: "In Progress",
      dueDate: "Sep 19, 2026",
      category: "Testing",
    },
    {
      id: "TSK-105",
      title: "Benchmark Redis caching layer under concurrent query load",
      status: "Pending",
      dueDate: "Sep 26, 2026",
      category: "Architecture",
    },
    {
      id: "TSK-106",
      title: "Draft mid-term technical documentation and API walkthrough",
      status: "Pending",
      dueDate: "Oct 03, 2026",
      category: "API",
    },
  ],
  reports: [
    {
      week: 1,
      status: "Approved",
      submissionDate: "Aug 22, 2026",
      hoursLogged: 21,
      mentorScore: 4.8,
    },
    {
      week: 2,
      status: "Approved",
      submissionDate: "Aug 29, 2026",
      hoursLogged: 20,
      mentorScore: 4.6,
    },
    {
      week: 3,
      status: "Approved",
      submissionDate: "Sep 05, 2026",
      hoursLogged: 22,
      mentorScore: 4.9,
    },
    {
      week: 4,
      status: "Approved",
      submissionDate: "Sep 12, 2026",
      hoursLogged: 22,
      mentorScore: 4.5,
    },
    {
      week: 5,
      status: "Pending Submission",
      hoursLogged: 20,
    },
  ],
  skills: [
    {
      skill: "Python & AsyncIO",
      studentLevel: "Advanced",
      requiredLevel: "Advanced",
      matchStatus: "Met",
      progressPct: 100,
    },
    {
      skill: "FastAPI Framework",
      studentLevel: "Intermediate",
      requiredLevel: "Intermediate",
      matchStatus: "Met",
      progressPct: 100,
    },
    {
      skill: "PostgreSQL & SQLModel",
      studentLevel: "Intermediate",
      requiredLevel: "Advanced",
      matchStatus: "Partial",
      progressPct: 75,
    },
    {
      skill: "Docker & Containerization",
      studentLevel: "Intermediate",
      requiredLevel: "Intermediate",
      matchStatus: "Met",
      progressPct: 90,
    },
    {
      skill: "Distributed Caching (Redis)",
      studentLevel: "Beginner",
      requiredLevel: "Intermediate",
      matchStatus: "Partial",
      progressPct: 50,
    },
  ],
  attention: {
    status: "ON_TRACK",
    attentionScore: 94,
    health: "Healthy",
    riskScore: 18,
    lastEvaluated: "Sep 16, 2026 at 09:30 AM",
    flaggedReasons: [
      "Cadence on track: 4 out of 4 previous weekly logs submitted on time",
      "Consistent mentor feedback: Average score of 4.7 / 5.0 across milestones",
      "Notice: Week 5 report deadline is approaching in 2 days (due Friday 5:00 PM)",
    ],
    reasons: [
      "Cadence on track: 4 out of 4 weekly reports submitted on schedule with all required sections completed",
      "Consistent positive mentor evaluation: Average supervisor score of 4.7 / 5.0 across milestones",
      "Proactive task execution: 3 foundational tasks completed ahead of planned cohort deadlines",
      "Notice: Upcoming Week 5 report deadline in 2 days (due Friday 5:00 PM)",
    ],
    recommendedActions: [
      "Finalize Week 5 task notes for unit test coverage deliverables",
      "Schedule Thursday 15-minute sync with Dr. Marcus Vance to review Redis caching requirements",
    ],
    recommendations: [
      "Submit Week 5 report before Friday 5:00 PM to maintain On Track cadence",
      "Document Redis caching benchmarks before starting Week 6 queue worker refactoring",
      "Schedule Thursday 15-minute sync with Dr. Marcus Vance to review unit test coverage",
    ],
  },
  registeredInternships: [
    {
      id: "REG-2026-0814",
      companyName: "CloudScale Distributed Systems",
      internshipTitle: "Backend Engineering Intern",
      domain: "Cloud & Distributed Systems",
      startDate: "2026-08-15",
      endDate: "2026-11-07",
      mode: "Hybrid",
      location: "Seattle, WA / Remote",
      requiredSkills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
      description: "Developing scalable telemetry ingestion pipelines and microservices in Python with automated integration testing.",
      mentorName: "Dr. Marcus Vance",
      mentorEmail: "m.vance@cloudscale.io",
      mentorPhone: "+1 (555) 441-2099",
      registrationStatus: "Approved",
      submittedAt: "2026-08-01 10:15 AM",
    },
  ],
  weeklyReports: [
    {
      id: "REP-WK-004",
      weekNumber: 4,
      startDate: "2026-09-06",
      endDate: "2026-09-12",
      tasksCompleted: "• Configured Docker multi-stage build container & compose stack\n• Integrated environment secrets management with Pydantic BaseSettings\n• Verified health check endpoints across containerized services",
      workDescription: "Finalized production Docker multi-stage images for backend telemetry ingestion microservices. Reduced artifact image footprint from 850MB to 142MB. Configured docker-compose development profiles and verified local database container orchestrations.",
      skillsLearned: ["Docker Multi-stage Builds", "Container Optimization", "Docker Compose", "CI/CD Foundations"],
      challengesFaced: "Managing native C-dependency wheels during psycopg2 build in alpine containers; resolved by migrating base layer to python:3.11-slim-bookworm.",
      nextWeekPlan: "Author comprehensive pytest unit and integration test suite targeting FastAPI telemetry endpoints with minimum 80% coverage.",
      submissionDate: "Sep 12, 2026",
      status: "Reviewed",
      shortSummary: "Docker multi-stage container optimization and compose orchestration setup.",
      mentorFeedbackStatus: "Reviewed",
      mentorScore: 4.5,
      mentorFeedback: "Impressive reduction in container image size. Docker configuration is clean and developer-friendly. Keep up the high code standards.",
      hoursLogged: 22,
    },
    {
      id: "REP-WK-003",
      weekNumber: 3,
      startDate: "2026-08-30",
      endDate: "2026-09-05",
      tasksCompleted: "• Implemented FastAPI CRUD routes with Pydantic v2 schemas\n• Added automated validation middleware and standardized error response wrappers\n• Hooked route handlers into SQLModel async session dependency",
      workDescription: "Constructed core RESTful API endpoints for ingestion payload intake. Implemented request validation, response serialization, and comprehensive exception handlers. Verified async session pooling under synthetic concurrency test scripts.",
      skillsLearned: ["FastAPI Routing", "Pydantic v2 Models", "Async Database Sessions", "REST Architecture"],
      challengesFaced: "Handling nested JSON telemetry validation errors gracefully without exposing database internals; created custom exception request interceptors.",
      nextWeekPlan: "Containerize the FastAPI application using multi-stage Docker build files and configure docker-compose for telemetry stack.",
      submissionDate: "Sep 05, 2026",
      status: "Reviewed",
      shortSummary: "FastAPI CRUD routes with Pydantic v2 and async SQLModel sessions.",
      mentorFeedbackStatus: "Reviewed",
      mentorScore: 4.9,
      mentorFeedback: "Excellent work on Pydantic v2 schemas and clean error formatting. API structure is modular and easy to extend.",
      hoursLogged: 22,
    },
    {
      id: "REP-WK-002",
      weekNumber: 2,
      startDate: "2026-08-23",
      endDate: "2026-08-29",
      tasksCompleted: "• Designed PostgreSQL schema for telemetry ingestion\n• Created Alembic database migration scripts with foreign key indexes\n• Benchmarked insert performance on test dataset",
      workDescription: "Authored relational database schema supporting time-series telemetry events, student activity logs, and mentor evaluation records. Implemented indexed UUID keys and timestamp clustering for high query throughput.",
      skillsLearned: ["PostgreSQL Schema Design", "Alembic Migrations", "Index Optimization", "SQLModel ORM"],
      challengesFaced: "Balancing foreign key constraints with high-throughput ingestion latency; implemented partition tables for seasonal event logs.",
      nextWeekPlan: "Implement FastAPI router endpoints and wire database queries using SQLAlchemy 2.0 async engine.",
      submissionDate: "Aug 29, 2026",
      status: "Reviewed",
      shortSummary: "PostgreSQL relational schema, indexes, and Alembic database migration scripts.",
      mentorFeedbackStatus: "Reviewed",
      mentorScore: 4.6,
      mentorFeedback: "Solid database design principles. Good foresight on indexing timestamp columns for fast telemetry range queries.",
      hoursLogged: 20,
    },
    {
      id: "REP-WK-001",
      weekNumber: 1,
      startDate: "2026-08-16",
      endDate: "2026-08-22",
      tasksCompleted: "• Completed engineering workstation onboarding & repository setup\n• Reviewed distributed architecture specifications and system requirements\n• Set up local development virtualenv, linters (Ruff, Flake8), and pre-commit hooks",
      workDescription: "Attended intern orientation, security briefing, and architectural overview with Staff Systems Architect Dr. Marcus Vance. Configured local development environment and reviewed SIMS technical roadmap.",
      skillsLearned: ["Development Environment Setup", "Git Branching Workflows", "System Architecture Analysis"],
      challengesFaced: "Navigating repository permissions and configuring internal VPN tokens; resolved with IT support on Day 2.",
      nextWeekPlan: "Draft database entity-relationship model and create initial Alembic migration scripts for PostgreSQL.",
      submissionDate: "Aug 22, 2026",
      status: "Reviewed",
      shortSummary: "Internship onboarding, development environment setup, and architecture review.",
      mentorFeedbackStatus: "Reviewed",
      mentorScore: 4.8,
      mentorFeedback: "Strong start to the internship. Alex demonstrated quick onboarding and deep enthusiasm for distributed systems concepts.",
      hoursLogged: 21,
    },
  ],
  weeklyTimeline: [
    {
      week: 1,
      title: "Orientation & Environment Setup",
      dateRange: "Aug 15 - Aug 21, 2026",
      hoursLogged: 21,
      targetHours: 20,
      status: "Completed",
      completedTasksCount: 1,
      highlights: "Repository setup, architecture review, and dev tooling.",
    },
    {
      week: 2,
      title: "PostgreSQL Database Schema",
      dateRange: "Aug 22 - Aug 28, 2026",
      hoursLogged: 20,
      targetHours: 20,
      status: "Completed",
      completedTasksCount: 1,
      highlights: "Schema design, Alembic migrations, and index optimization.",
    },
    {
      week: 3,
      title: "FastAPI CRUD & Route Architecture",
      dateRange: "Aug 29 - Sep 04, 2026",
      hoursLogged: 22,
      targetHours: 20,
      status: "Completed",
      completedTasksCount: 1,
      highlights: "REST API endpoints, Pydantic v2 schemas, and validation.",
    },
    {
      week: 4,
      title: "Docker Containerization & Stacks",
      dateRange: "Sep 05 - Sep 11, 2026",
      hoursLogged: 22,
      targetHours: 20,
      status: "Completed",
      completedTasksCount: 1,
      highlights: "Multi-stage Docker builds and docker-compose deployment.",
    },
    {
      week: 5,
      title: "Pytest Suite & Concurrency Tests",
      dateRange: "Sep 12 - Sep 18, 2026",
      hoursLogged: 20,
      targetHours: 20,
      status: "Current",
      completedTasksCount: 0,
      highlights: "Active week: authoring test coverage for API endpoints.",
    },
    {
      week: 6,
      title: "Redis Caching Layer & Benchmarking",
      dateRange: "Sep 19 - Sep 25, 2026",
      hoursLogged: 0,
      targetHours: 20,
      status: "Upcoming",
      completedTasksCount: 0,
      highlights: "Caching layer for high-throughput query caching.",
    },
    {
      week: 7,
      title: "Mid-Term Evaluation & Milestone Review",
      dateRange: "Sep 26 - Oct 02, 2026",
      hoursLogged: 0,
      targetHours: 20,
      status: "Upcoming",
      completedTasksCount: 0,
      highlights: "Formal mid-term presentation with academic & industry mentors.",
    },
    {
      week: 8,
      title: "Worker Queue & Event Streams",
      dateRange: "Oct 03 - Oct 09, 2026",
      hoursLogged: 0,
      targetHours: 20,
      status: "Upcoming",
      completedTasksCount: 0,
      highlights: "Background task workers and telemetry stream processing.",
    },
    {
      week: 9,
      title: "Security & Role-Based Access",
      dateRange: "Oct 10 - Oct 16, 2026",
      hoursLogged: 0,
      targetHours: 20,
      status: "Upcoming",
      completedTasksCount: 0,
      highlights: "JWT auth integration and tenant permission isolation.",
    },
    {
      week: 10,
      title: "Observability & Prometheus Metrics",
      dateRange: "Oct 17 - Oct 23, 2026",
      hoursLogged: 0,
      targetHours: 20,
      status: "Upcoming",
      completedTasksCount: 0,
      highlights: "Grafana dashboards and Prometheus metrics instrumentation.",
    },
    {
      week: 11,
      title: "End-to-End Staging Deployment",
      dateRange: "Oct 24 - Oct 30, 2026",
      hoursLogged: 0,
      targetHours: 20,
      status: "Upcoming",
      completedTasksCount: 0,
      highlights: "Deployment to staging environment and load simulation.",
    },
    {
      week: 12,
      title: "Final Internship Report & Capstone",
      dateRange: "Oct 31 - Nov 07, 2026",
      hoursLogged: 0,
      targetHours: 20,
      status: "Upcoming",
      completedTasksCount: 0,
      highlights: "Comprehensive final documentation and project handover.",
    },
  ],
};
