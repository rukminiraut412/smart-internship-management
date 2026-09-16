"use client";

import React, { useState, useEffect } from "react";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/common/Icons";
import { StudentProfile } from "@/data/mockData";
import { studentsApi } from "@/lib/api";

interface Props {
  initialProfile: StudentProfile;
  studentId?: string;
  onProfileUpdate?: (updated: StudentProfile) => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  college?: string;
  department?: string;
  year?: string;
  skills?: string;
}

export function StudentProfileView({ initialProfile, studentId, onProfileUpdate }: Props) {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentProfile>(initialProfile);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeUploadedNotice, setResumeUploadedNotice] = useState<string | null>(null);

  // Validation function
  const validateForm = (data: StudentProfile): boolean => {
    const errs: FormErrors = {};

    if (!data.name.trim()) {
      errs.name = "Full name is required";
    } else if (data.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      errs.email = "Email address is required";
    } else if (!emailRegex.test(data.email.trim())) {
      errs.email = "Please enter a valid academic/personal email";
    }

    if (!data.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (data.phone.trim().length < 7) {
      errs.phone = "Please enter a valid phone number";
    }

    if (!data.college.trim()) {
      errs.college = "College/School is required";
    }

    if (!data.department.trim()) {
      errs.department = "Department is required";
    }

    if (!data.year.trim()) {
      errs.year = "Academic year is required";
    }

    if (!data.skills || data.skills.length === 0) {
      errs.skills = "At least one skill must be added";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    if (!studentId) return;
    studentsApi
      .getProfile(studentId)
      .then((res) => {
        if (res) {
          const mapped: StudentProfile = {
            name: res.name || initialProfile.name,
            studentId: res.student_id_number || initialProfile.studentId,
            email: res.email || initialProfile.email,
            phone: res.phone || initialProfile.phone,
            college: res.college || initialProfile.college,
            university: res.university || initialProfile.university,
            department: res.department || initialProfile.department,
            year: res.year_of_study || initialProfile.year,
            gpa: res.gpa !== null && res.gpa !== undefined ? res.gpa : initialProfile.gpa,
            avatarInitials: (res.name || initialProfile.name)
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            skills: res.skills && res.skills.length > 0 ? res.skills : initialProfile.skills,
            resume: {
              fileName: res.resume_url ? res.resume_url.split("/").pop() || "Resume_2026.pdf" : initialProfile.resume.fileName,
              status: initialProfile.resume.status,
              uploadDate: initialProfile.resume.uploadDate,
              fileSize: initialProfile.resume.fileSize,
            },
          };
          setProfile(mapped);
          setFormData(mapped);
          if (onProfileUpdate) {
            onProfileUpdate(mapped);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch student profile from backend:", err);
      });
  }, [studentId, initialProfile, onProfileUpdate]);

  const handleStartEdit = () => {
    setFormData({ ...profile });
    setErrors({});
    setSuccessMessage(null);
    setApiError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData({ ...profile });
    setErrors({});
    setApiError(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm(formData)) {
      return;
    }

    if (!studentId) {
      setProfile(formData);
      if (onProfileUpdate) {
        onProfileUpdate(formData);
      }
      setIsEditing(false);
      setSuccessMessage("Student profile updated locally (not authenticated)!");
      setTimeout(() => setSuccessMessage(null), 4000);
      return;
    }

    setIsSaving(true);
    try {
      const res = await studentsApi.updateProfile(studentId, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        college: formData.college.trim(),
        university: formData.university.trim(),
        department: formData.department.trim(),
        year_of_study: formData.year.trim(),
        gpa: formData.gpa,
        skills: formData.skills,
        resume_url: formData.resume.fileName,
      });

      const updated: StudentProfile = {
        name: res.name || formData.name,
        studentId: res.student_id_number || formData.studentId,
        email: res.email || formData.email,
        phone: res.phone || formData.phone,
        college: res.college || formData.college,
        university: res.university || formData.university,
        department: res.department || formData.department,
        year: res.year_of_study || formData.year,
        gpa: res.gpa !== null && res.gpa !== undefined ? res.gpa : formData.gpa,
        avatarInitials: (res.name || formData.name)
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        skills: res.skills && res.skills.length > 0 ? res.skills : formData.skills,
        resume: formData.resume,
      };

      setProfile(updated);
      setFormData(updated);
      if (onProfileUpdate) {
        onProfileUpdate(updated);
      }
      setIsEditing(false);
      setSuccessMessage("Student profile updated and saved to database successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      console.error("Failed to update student profile:", err);
      const msg = err instanceof Error ? err.message : "Failed to update profile. Please try again.";
      setApiError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    const skillTrimmed = newSkillInput.trim();
    if (!skillTrimmed) return;
    if (formData.skills.some((s) => s.toLowerCase() === skillTrimmed.toLowerCase())) {
      setErrors((prev) => ({ ...prev, skills: `Skill "${skillTrimmed}" already exists` }));
      return;
    }
    const updatedSkills = [...formData.skills, skillTrimmed];
    setFormData((prev) => ({ ...prev, skills: updatedSkills }));
    setNewSkillInput("");
    setErrors((prev) => ({ ...prev, skills: undefined }));
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = formData.skills.filter((s) => s !== skillToRemove);
    setFormData((prev) => ({ ...prev, skills: updatedSkills }));
    if (updatedSkills.length === 0) {
      setErrors((prev) => ({ ...prev, skills: "At least one skill is required" }));
    }
  };

  const handleSimulateResumeUpload = () => {
    const simulatedFileName = `${profile.name.toLowerCase().replace(/\s+/g, "_")}_updated_resume.pdf`;
    const updatedProfile: StudentProfile = {
      ...profile,
      resume: {
        fileName: simulatedFileName,
        status: "Verified & Active",
        uploadDate: "Just now",
        fileSize: "1.5 MB",
      },
    };
    setProfile(updatedProfile);
    setFormData(updatedProfile);
    if (onProfileUpdate) {
      onProfileUpdate(updatedProfile);
    }
    setResumeUploadedNotice(`New resume uploaded: "${simulatedFileName}"`);
    setTimeout(() => setResumeUploadedNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Alert Banners */}
      {successMessage && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 shadow-2xs">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {apiError && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 shadow-2xs">
          <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {resumeUploadedNotice && (
        <div className="flex items-center space-x-2 rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-xs font-semibold text-indigo-800 shadow-2xs">
          <CheckCircleIcon className="w-5 h-5 text-indigo-600 shrink-0" />
          <span>{resumeUploadedNotice}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-2xl shadow-sm ring-4 ring-indigo-50">
              {profile.avatarInitials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{profile.name}</h1>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Active Enrolled
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Student ID: <span className="font-semibold text-slate-700">{profile.studentId}</span></p>
              <p className="text-xs text-indigo-600 font-medium">{profile.department}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content: View Mode vs Edit Mode */}
        {!isEditing ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic & Personal Details */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Academic & Contact Information
              </h2>

              <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    Full Name
                  </span>
                  <span className="font-semibold text-slate-800">{profile.name}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <MailIcon className="w-4 h-4 text-slate-400" />
                    Institutional Email
                  </span>
                  <span className="font-semibold text-slate-800">{profile.email}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                    Phone Number
                  </span>
                  <span className="font-semibold text-slate-800">{profile.phone}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <BuildingOfficeIcon className="w-4 h-4 text-slate-400" />
                    College / School
                  </span>
                  <span className="font-semibold text-slate-800 text-right">{profile.college}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <AcademicCapIcon className="w-4 h-4 text-slate-400" />
                    Department
                  </span>
                  <span className="font-semibold text-slate-800 text-right">{profile.department}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <AcademicCapIcon className="w-4 h-4 text-slate-400" />
                    Academic Year
                  </span>
                  <span className="font-semibold text-slate-800">{profile.year}</span>
                </div>
              </div>
            </div>

            {/* Skills & Resume Status */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Skills & Verification
              </h2>

              {/* Skills Tags */}
              <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-700">Declared Skills</span>
                  <span className="text-[11px] text-slate-400 font-medium">{profile.skills.length} skills listed</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume Status Card */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100/60">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Resume Status</span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                    <CheckCircleIcon className="w-3 h-3 mr-1 text-emerald-600" />
                    {profile.resume.status}
                  </span>
                </div>

                <div className="mt-3 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium truncate max-w-[200px]">{profile.resume.fileName}</span>
                    <span className="text-slate-400 text-[11px]">{profile.resume.fileSize}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Uploaded on {profile.resume.uploadDate}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-indigo-100/60 flex items-center justify-between">
                  <span className="text-[11px] text-indigo-700 font-medium">Verified by Academic Portal</span>
                  <button
                    type="button"
                    onClick={handleSimulateResumeUpload}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Upload New Resume →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSaveEdit} className="mt-6 space-y-6">
            {Object.keys(errors).length > 0 && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Please correct the errors highlighted below before saving.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.name ? "border-rose-400 focus:ring-rose-400 bg-rose-50/20" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                  placeholder="e.g. Alex Rivera"
                />
                {errors.name && <p className="mt-1 text-[11px] text-rose-600">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.email ? "border-rose-400 focus:ring-rose-400 bg-rose-50/20" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                  placeholder="e.g. alex.rivera@university.edu"
                />
                {errors.email && <p className="mt-1 text-[11px] text-rose-600">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.phone ? "border-rose-400 focus:ring-rose-400 bg-rose-50/20" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                  placeholder="e.g. +1 (555) 382-9014"
                />
                {errors.phone && <p className="mt-1 text-[11px] text-rose-600">{errors.phone}</p>}
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Year <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="1st Year (Semester 1 & 2)">1st Year (Semester 1 & 2)</option>
                  <option value="2nd Year (Semester 3 & 4)">2nd Year (Semester 3 & 4)</option>
                  <option value="3rd Year (Semester 5 & 6)">3rd Year (Semester 5 & 6)</option>
                  <option value="Final Year (Semester 7 - 2026)">Final Year (Semester 7 - 2026)</option>
                  <option value="Final Year (Semester 8 - 2026)">Final Year (Semester 8 - 2026)</option>
                </select>
                {errors.year && <p className="mt-1 text-[11px] text-rose-600">{errors.year}</p>}
              </div>

              {/* College */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  College / School <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.college ? "border-rose-400 focus:ring-rose-400 bg-rose-50/20" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                  placeholder="e.g. School of Engineering & Applied Sciences"
                />
                {errors.college && <p className="mt-1 text-[11px] text-rose-600">{errors.college}</p>}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.department ? "border-rose-400 focus:ring-rose-400 bg-rose-50/20" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                  placeholder="e.g. Department of Computer Science & Engineering"
                />
                {errors.department && <p className="mt-1 text-[11px] text-rose-600">{errors.department}</p>}
              </div>
            </div>

            {/* Skills Edit Section */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Technical Skills <span className="text-rose-500">*</span>
              </label>

              {/* Skill Adder Input */}
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add a new skill (e.g. Kubernetes, React)..."
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="inline-flex items-center space-x-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {errors.skills && <p className="mt-1 text-[11px] text-rose-600">{errors.skills}</p>}

              {/* Skill Tags to Remove */}
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-800"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                      title={`Remove ${skill}`}
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving Profile..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
