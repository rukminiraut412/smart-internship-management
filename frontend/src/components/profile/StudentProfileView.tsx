"use client";

import React, { useState } from "react";
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

interface Props {
  initialProfile: StudentProfile;
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

export function StudentProfileView({
  initialProfile,
  onProfileUpdate,
}: Props) {
  const [profile, setProfile] =
    useState<StudentProfile>(initialProfile);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] =
    useState<StudentProfile>(initialProfile);

  const [newSkillInput, setNewSkillInput] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const validateForm = (data: StudentProfile): boolean => {
    const validationErrors: FormErrors = {};

    if (!data.name.trim()) {
      validationErrors.name = "Full name is required";
    } else if (data.name.trim().length < 2) {
      validationErrors.name =
        "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.email.trim()) {
      validationErrors.email =
        "Email address is required";
    } else if (!emailRegex.test(data.email.trim())) {
      validationErrors.email =
        "Please enter a valid email address";
    }

    if (!data.phone.trim()) {
      validationErrors.phone =
        "Phone number is required";
    } else if (data.phone.trim().length < 7) {
      validationErrors.phone =
        "Please enter a valid phone number";
    }

    if (!data.college.trim()) {
      validationErrors.college =
        "College / School is required";
    }

    if (!data.department.trim()) {
      validationErrors.department =
        "Department is required";
    }

    if (!data.year.trim()) {
      validationErrors.year =
        "Academic year is required";
    }

    if (!data.skills || data.skills.length === 0) {
      validationErrors.skills =
        "At least one skill is required";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  // --------------------------------------------------
  // EDIT PROFILE
  // --------------------------------------------------

  const handleStartEdit = () => {
    setFormData({ ...profile });
    setErrors({});
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData({ ...profile });
    setErrors({});
    setIsEditing(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    setProfile(formData);

    if (onProfileUpdate) {
      onProfileUpdate(formData);
    }

    setIsEditing(false);
    setSuccessMessage(
      "Student profile updated successfully."
    );

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // --------------------------------------------------
  // SKILLS
  // --------------------------------------------------

  const handleAddSkill = () => {
    const skill = newSkillInput.trim();

    if (!skill) {
      return;
    }

    const alreadyExists = formData.skills.some(
      (existingSkill) =>
        existingSkill.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setErrors((previous) => ({
        ...previous,
        skills: `Skill "${skill}" already exists`,
      }));

      return;
    }

    const updatedSkills = [
      ...formData.skills,
      skill,
    ];

    setFormData((previous) => ({
      ...previous,
      skills: updatedSkills,
    }));

    setNewSkillInput("");

    setErrors((previous) => ({
      ...previous,
      skills: undefined,
    }));
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = formData.skills.filter(
      (skill) => skill !== skillToRemove
    );

    setFormData((previous) => ({
      ...previous,
      skills: updatedSkills,
    }));

    if (updatedSkills.length === 0) {
      setErrors((previous) => ({
        ...previous,
        skills: "At least one skill is required",
      }));
    }
  };

  // --------------------------------------------------
  // INPUT CLASS
  // --------------------------------------------------

  const inputClass = (error?: string) =>
    `w-full rounded-lg border px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 ${
      error
        ? "border-rose-400 focus:ring-rose-400 bg-rose-50/20"
        : "border-slate-200 focus:ring-emerald-500"
    }`;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />

          <span>{successMessage}</span>
        </div>
      )}

      {/* ------------------------------------------------
          PROFILE HEADER
      ------------------------------------------------ */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

          <div className="flex items-center gap-4">

            {/* Avatar */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xl">
              {profile.avatarInitials}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">

                <h1 className="text-xl font-bold text-slate-900">
                  {profile.name}
                </h1>

                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active Student
                </span>

              </div>

              <p className="text-xs text-slate-500 mt-1">
                Student ID:{" "}
                <span className="font-semibold text-slate-700">
                  {profile.studentId}
                </span>
              </p>

              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                {profile.department}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <PencilSquareIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="student-profile-form"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Save Changes
              </button>

            </div>
          )}

        </div>
      </div>

      {/* ------------------------------------------------
          VIEW MODE
      ------------------------------------------------ */}

      {!isEditing ? (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Academic Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-900">
                Academic & Contact Information
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Your registered student information.
              </p>
            </div>

            <div className="space-y-3">

              <InfoRow
                icon={<UserIcon className="w-4 h-4" />}
                label="Full Name"
                value={profile.name}
              />

              <InfoRow
                icon={<MailIcon className="w-4 h-4" />}
                label="Email"
                value={profile.email}
              />

              <InfoRow
                icon={<PhoneIcon className="w-4 h-4" />}
                label="Phone"
                value={profile.phone}
              />

              <InfoRow
                icon={
                  <BuildingOfficeIcon className="w-4 h-4" />
                }
                label="College / School"
                value={profile.college}
              />

              <InfoRow
                icon={
                  <AcademicCapIcon className="w-4 h-4" />
                }
                label="Department"
                value={profile.department}
              />

              <InfoRow
                icon={
                  <AcademicCapIcon className="w-4 h-4" />
                }
                label="Academic Year"
                value={profile.year}
                last
              />

            </div>
          </div>

          {/* Skills & Resume */}
          <div className="space-y-5">

            {/* Skills */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">

              <div className="flex items-center justify-between mb-4">

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Skills
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Skills used for internship matching.
                  </p>
                </div>

                <span className="text-[11px] font-semibold text-slate-400">
                  {profile.skills.length} skills
                </span>

              </div>

              <div className="flex flex-wrap gap-2">

                {profile.skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {skill}
                  </span>
                ))}

              </div>

            </div>

            {/* Resume */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">

              <div className="flex items-center gap-3">

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                  <DocumentTextIcon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">

                  <h2 className="text-sm font-bold text-slate-900">
                    Resume
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {profile.resume.fileName}
                  </p>

                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                  <CheckCircleIcon className="w-3 h-3" />
                  {profile.resume.status}
                </span>

              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">

                <span className="text-slate-400">
                  {profile.resume.fileSize}
                </span>

                <span className="text-slate-400">
                  Uploaded {profile.resume.uploadDate}
                </span>

              </div>

            </div>

          </div>

        </div>

      ) : (

        /* ------------------------------------------------
           EDIT MODE
        ------------------------------------------------ */

        <form
          id="student-profile-form"
          onSubmit={handleSaveEdit}
          className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-6"
        >

          {/* Error Banner */}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertCircleIcon className="w-4 h-4 shrink-0" />

              <span>
                Please correct the highlighted fields before saving.
              </span>
            </div>
          )}

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Name */}
            <FormField
              label="Full Name"
              required
              error={errors.name}
            >
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className={inputClass(errors.name)}
                placeholder="Enter full name"
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Email"
              required
              error={errors.email}
            >
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className={inputClass(errors.email)}
                placeholder="Enter email address"
              />
            </FormField>

            {/* Phone */}
            <FormField
              label="Phone Number"
              required
              error={errors.phone}
            >
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                className={inputClass(errors.phone)}
                placeholder="Enter phone number"
              />
            </FormField>

            {/* Academic Year */}
            <FormField
              label="Academic Year"
              required
              error={errors.year}
            >
              <select
                value={formData.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: e.target.value,
                  })
                }
                className={inputClass(errors.year)}
              >
                <option value="">
                  Select academic year
                </option>

                <option value="1st Year">
                  1st Year
                </option>

                <option value="2nd Year">
                  2nd Year
                </option>

                <option value="3rd Year">
                  3rd Year
                </option>

                <option value="Final Year">
                  Final Year
                </option>
              </select>
            </FormField>

            {/* College */}
            <FormField
              label="College / School"
              required
              error={errors.college}
            >
              <input
                type="text"
                value={formData.college}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    college: e.target.value,
                  })
                }
                className={inputClass(errors.college)}
                placeholder="Enter college / school"
              />
            </FormField>

            {/* Department */}
            <FormField
              label="Department"
              required
              error={errors.department}
            >
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department: e.target.value,
                  })
                }
                className={inputClass(errors.department)}
                placeholder="Enter department"
              />
            </FormField>

          </div>

          {/* Skills */}
          <div className="pt-5 border-t border-slate-100">

            <div className="mb-3">

              <label className="block text-xs font-bold text-slate-700">
                Technical Skills{" "}
                <span className="text-rose-500">*</span>
              </label>

              <p className="text-[11px] text-slate-400 mt-1">
                Add skills that can be used for internship skill-gap analysis.
              </p>

            </div>

            {/* Add Skill */}
            <div className="flex gap-2 max-w-lg">

              <input
                type="text"
                value={newSkillInput}
                onChange={(e) =>
                  setNewSkillInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g. Python, React, SQL"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <button
                type="button"
                onClick={handleAddSkill}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add
              </button>

            </div>

            {errors.skills && (
              <p className="mt-1.5 text-[11px] text-rose-600">
                {errors.skills}
              </p>
            )}

            {/* Skill Tags */}
            <div className="mt-4 flex flex-wrap gap-2">

              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs font-medium text-emerald-800"
                >
                  <span>{skill}</span>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveSkill(skill)
                    }
                    className="text-emerald-500 hover:text-rose-600"
                    title={`Remove ${skill}`}
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

            </div>

          </div>

          {/* Bottom Actions */}
          <div className="pt-5 border-t border-slate-100 flex justify-end gap-2">

            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Save Profile
            </button>

          </div>

        </form>
      )}

    </div>
  );
}

/* ======================================================
   SMALL REUSABLE COMPONENTS
====================================================== */

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-2.5 ${
        !last ? "border-b border-slate-100" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
        <span className="text-slate-400">
          {icon}
        </span>

        <span>{label}</span>
      </div>

      <span className="text-xs font-semibold text-slate-800 text-right break-words">
        {value}
      </span>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">
        {label}

        {required && (
          <span className="text-rose-500 ml-1">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-[11px] text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
