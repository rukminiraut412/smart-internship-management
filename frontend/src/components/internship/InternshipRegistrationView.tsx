"use client";

import React, { useState, useEffect } from "react";
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/common/Icons";
import { RegisteredInternship, mockStudentData } from "@/data/mockData";
import { BackendInternship, studentsApi } from "@/lib/api";

const DOMAINS = [
  "Software Engineering & Architecture",
  "Cloud & DevOps Engineering",
  "Data Science & Machine Learning",
  "Cybersecurity & Information Assurance",
  "Full Stack Web Development",
  "Mobile Application Engineering",
  "Embedded Systems & IoT",
  "Product & Systems Management",
];

interface FormErrors {
  companyName?: string;
  internshipTitle?: string;
  domain?: string;
  startDate?: string;
  endDate?: string;
  mode?: string;
  location?: string;
  requiredSkills?: string;
  description?: string;
  mentorName?: string;
  mentorEmail?: string;
  mentorPhone?: string;
}

interface InternshipRegistrationViewProps {
  studentId?: string;
  onRegistrationSuccess?: (internship: BackendInternship) => void;
}

export function InternshipRegistrationView({
  studentId,
  onRegistrationSuccess,
}: InternshipRegistrationViewProps = {}) {
  const [registrations, setRegistrations] = useState<RegisteredInternship[]>(
    mockStudentData.registeredInternships
  );

  const [formData, setFormData] = useState({
    companyName: "",
    internshipTitle: "",
    domain: DOMAINS[0],
    startDate: "",
    endDate: "",
    mode: "Hybrid" as "Online" | "Offline" | "Hybrid",
    location: "",
    skillInput: "",
    requiredSkills: [] as string[],
    description: "",
    mentorName: "",
    mentorEmail: "",
    mentorPhone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!studentId) return;
    studentsApi
      .getInternships(studentId)
      .then((items) => {
        if (items && items.length > 0) {
          const mapped: RegisteredInternship[] = items.map((item) => {
            const intern = item.internship;
            return {
              id: intern.id,
              companyName: intern.company_name || "Host Organization",
              internshipTitle: intern.title,
              domain: intern.domain || "General Engineering",
              startDate: intern.start_date ? intern.start_date.split("T")[0] : "2026-08-15",
              endDate: intern.end_date ? intern.end_date.split("T")[0] : "2026-11-07",
              mode: (intern.mode as "Online" | "Offline" | "Hybrid") || "Hybrid",
              location: intern.location || "Remote",
              requiredSkills: ["Engineering", "Development"],
              description: intern.description || "",
              mentorName: "Assigned Supervisor",
              mentorEmail: "supervisor@company.com",
              mentorPhone: "+1 (555) 000-0000",
              registrationStatus: (item.application_status === "Approved" ? "Approved" : "Pending Review") as "Approved" | "Pending Review",
              submittedAt: item.applied_at
                ? new Date(item.applied_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recently",
            };
          });
          setRegistrations(mapped);
        }
      })
      .catch((err) => {
        console.warn("Could not load existing student registrations", err);
      });
  }, [studentId]);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.companyName.trim()) {
      errs.companyName = "Company/Organization name is required";
    } else if (formData.companyName.trim().length < 2) {
      errs.companyName = "Company name must be at least 2 characters";
    }

    if (!formData.internshipTitle.trim()) {
      errs.internshipTitle = "Internship title is required";
    } else if (formData.internshipTitle.trim().length < 2) {
      errs.internshipTitle = "Title must be at least 2 characters";
    }

    if (!formData.domain.trim()) {
      errs.domain = "Internship domain is required";
    }

    if (!formData.startDate) {
      errs.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      errs.endDate = "End date is required";
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      errs.endDate = "End date must be after start date";
    }

    if (!formData.location.trim()) {
      errs.location = "Location is required (enter 'Remote' for online roles)";
    }

    if (formData.requiredSkills.length === 0) {
      errs.requiredSkills = "Please add at least one required skill tag";
    }

    if (!formData.description.trim()) {
      errs.description = "Internship description is required";
    } else if (formData.description.trim().length < 20) {
      errs.description = "Description must be at least 20 characters";
    }

    if (!formData.mentorName.trim()) {
      errs.mentorName = "Mentor/Supervisor name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.mentorEmail.trim()) {
      errs.mentorEmail = "Mentor contact email is required";
    } else if (!emailRegex.test(formData.mentorEmail.trim())) {
      errs.mentorEmail = "Please enter a valid email address";
    }

    if (!formData.mentorPhone.trim()) {
      errs.mentorPhone = "Mentor contact phone is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSkill = () => {
    const skill = formData.skillInput.trim();
    if (!skill) return;
    if (formData.requiredSkills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setErrors((prev) => ({ ...prev, requiredSkills: `"${skill}" is already added` }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, skill],
      skillInput: "",
    }));
    setErrors((prev) => ({ ...prev, requiredSkills: undefined }));
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!studentId) {
        throw new Error("Student authentication required. Please ensure you are logged in to register an internship.");
      }

      const createdInternship = await studentsApi.registerInternship(studentId, {
        company_name: formData.companyName.trim(),
        internship_title: formData.internshipTitle.trim(),
        domain: formData.domain,
        start_date: formData.startDate ? `${formData.startDate}T09:00:00` : undefined,
        end_date: formData.endDate ? `${formData.endDate}T17:00:00` : undefined,
        mode: formData.mode,
        location: formData.location.trim(),
        required_skills: formData.requiredSkills,
        description: formData.description.trim(),
        mentor_name: formData.mentorName.trim(),
        mentor_email: formData.mentorEmail.trim(),
        mentor_phone: formData.mentorPhone.trim(),
      });

      const newRegistration: RegisteredInternship = {
        id: createdInternship.id,
        companyName: createdInternship.company_name || formData.companyName.trim(),
        internshipTitle: createdInternship.title,
        domain: createdInternship.domain || formData.domain,
        startDate: createdInternship.start_date ? createdInternship.start_date.split("T")[0] : formData.startDate,
        endDate: createdInternship.end_date ? createdInternship.end_date.split("T")[0] : formData.endDate,
        mode: (createdInternship.mode as "Online" | "Offline" | "Hybrid") || formData.mode,
        location: createdInternship.location || formData.location.trim(),
        requiredSkills: formData.requiredSkills,
        description: createdInternship.description || formData.description.trim(),
        mentorName: formData.mentorName.trim() || "Assigned Supervisor",
        mentorEmail: formData.mentorEmail.trim() || "supervisor@company.com",
        mentorPhone: formData.mentorPhone.trim() || "+1 (555) 000-0000",
        registrationStatus: "Approved",
        submittedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };

      setRegistrations((prev) => [newRegistration, ...prev]);
      setSuccessNotice(
        `Internship Registration Submitted Successfully! Assigned ID: ${newRegistration.id}. Status: Approved.`
      );

      // Reset form
      setFormData({
        companyName: "",
        internshipTitle: "",
        domain: DOMAINS[0],
        startDate: "",
        endDate: "",
        mode: "Hybrid",
        location: "",
        skillInput: "",
        requiredSkills: [],
        description: "",
        mentorName: "",
        mentorEmail: "",
        mentorPhone: "",
      });
      setErrors({});

      if (createdInternship && onRegistrationSuccess) {
        onRegistrationSuccess(createdInternship);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSuccessNotice(null), 8000);
    } catch (err: unknown) {
      console.error("Failed to register internship:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to register internship. Please check your connection and try again.";
      setApiError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <BriefcaseIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Internship Registration</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Register an off-campus or institutional internship placement for academic monitoring and faculty mentor assignment.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="flex items-start space-x-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 shadow-2xs">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{successNotice}</div>
        </div>
      )}

      {/* Error Notification */}
      {apiError && (
        <div className="flex items-start space-x-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 shadow-2xs">
          <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{apiError}</div>
        </div>
      )}

      {/* Registration Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircleIcon className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Please review and fix the required fields marked in red below.</span>
            </div>
          )}

          {/* Section 1: Role & Company Details */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="w-4 h-4 text-indigo-600" />
              1. Organization & Position Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Organization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. CloudScale Distributed Systems"
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.companyName ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                />
                {errors.companyName && <p className="mt-1 text-[11px] text-rose-600">{errors.companyName}</p>}
              </div>

              {/* Internship Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internship Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.internshipTitle}
                  onChange={(e) => setFormData({ ...formData, internshipTitle: e.target.value })}
                  placeholder="e.g. Backend Engineering Intern"
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.internshipTitle ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                />
                {errors.internshipTitle && <p className="mt-1 text-[11px] text-rose-600">{errors.internshipTitle}</p>}
              </div>

              {/* Domain */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internship Domain <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {DOMAINS.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
                {errors.domain && <p className="mt-1 text-[11px] text-rose-600">{errors.domain}</p>}
              </div>

              {/* Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internship Mode <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Online", "Offline", "Hybrid"] as const).map((modeOption) => (
                    <button
                      key={modeOption}
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: modeOption })}
                      className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                        formData.mode === modeOption
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {modeOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Location / Office Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Seattle, WA (or 'Remote - Global')"
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                      errors.location ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  />
                </div>
                {errors.location && <p className="mt-1 text-[11px] text-rose-600">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Duration & Timeline */}
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              2. Duration & Schedule
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.startDate ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                />
                {errors.startDate && <p className="mt-1 text-[11px] text-rose-600">{errors.startDate}</p>}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.endDate ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                />
                {errors.endDate && <p className="mt-1 text-[11px] text-rose-600">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Skills & Description */}
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-indigo-600" />
              3. Deliverables & Technical Expectations
            </h2>

            <div className="space-y-4">
              {/* Required Skills Adder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Technical Skills <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2 max-w-lg">
                  <input
                    type="text"
                    value={formData.skillInput}
                    onChange={(e) => setFormData({ ...formData, skillInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type skill & press Add (e.g. Python, Docker, SQL)..."
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="inline-flex items-center space-x-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                </div>

                {errors.requiredSkills && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.requiredSkills}</p>
                )}

                {/* Added Skill Badges */}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-800"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-400 hover:text-rose-600 transition-colors"
                        title={`Remove ${skill}`}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internship Description & Deliverables <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize your key responsibilities, project scope, and weekly deliverables during this placement..."
                  className={`w-full rounded-lg border p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.description ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                />
                {errors.description && <p className="mt-1 text-[11px] text-rose-600">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Section 4: Mentor / Company Contact */}
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-indigo-600" />
              4. Mentor / Company Point of Contact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Mentor Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mentor / Guide Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.mentorName}
                    onChange={(e) => setFormData({ ...formData, mentorName: e.target.value })}
                    placeholder="e.g. Dr. Marcus Vance"
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                      errors.mentorName ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  />
                </div>
                {errors.mentorName && <p className="mt-1 text-[11px] text-rose-600">{errors.mentorName}</p>}
              </div>

              {/* Mentor Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mentor Official Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MailIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.mentorEmail}
                    onChange={(e) => setFormData({ ...formData, mentorEmail: e.target.value })}
                    placeholder="e.g. m.vance@cloudscale.io"
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                      errors.mentorEmail ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  />
                </div>
                {errors.mentorEmail && <p className="mt-1 text-[11px] text-rose-600">{errors.mentorEmail}</p>}
              </div>

              {/* Mentor Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mentor Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.mentorPhone}
                    onChange={(e) => setFormData({ ...formData, mentorPhone: e.target.value })}
                    placeholder="e.g. +1 (555) 441-2099"
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                      errors.mentorPhone ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  />
                </div>
                {errors.mentorPhone && <p className="mt-1 text-[11px] text-rose-600">{errors.mentorPhone}</p>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting Registration..." : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Registrations Preview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Registered Internships History</h2>
            <p className="text-xs text-slate-500">Track registration verification with academic cell</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {registrations.length} Placements
          </span>
        </div>

        <div className="space-y-3">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 hover:bg-slate-100/70 transition-colors text-xs space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{reg.internshipTitle}</span>
                  <span className="text-indigo-600 font-semibold">{reg.companyName}</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="text-slate-500">{reg.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                      reg.registrationStatus === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {reg.registrationStatus}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">{reg.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block">Duration & Mode</span>
                  <span>{reg.startDate} to {reg.endDate} ({reg.mode})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location</span>
                  <span>{reg.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mentor</span>
                  <span>{reg.mentorName} ({reg.mentorEmail})</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {reg.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
