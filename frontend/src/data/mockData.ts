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

export interface AttentionStatus {
  health: "Healthy" | "Attention Needed" | "Critical Risk";
  riskScore: number; // 0 to 100
  lastEvaluated: string;
  flaggedReasons: string[];
  recommendedActions: string[];
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
    health: "Healthy",
    riskScore: 18,
    lastEvaluated: "Sep 16, 2026 at 09:30 AM",
    flaggedReasons: [
      "Cadence on track: 4 out of 4 previous weekly logs submitted on time",
      "Consistent mentor feedback: Average score of 4.7 / 5.0 across milestones",
      "Notice: Week 5 report deadline is approaching in 2 days (due Friday 5:00 PM)",
    ],
    recommendedActions: [
      "Finalize Week 5 task notes for unit test coverage deliverables",
      "Schedule Thursday 15-minute sync with Dr. Marcus Vance to review Redis caching requirements",
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
};
