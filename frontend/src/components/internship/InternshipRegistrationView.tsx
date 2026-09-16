"use client";

import React, { useEffect, useState } from "react";

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

import {
  studentsApi,
  authStorage,
  StudentInternshipItem,
} from "@/lib/api";

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
  location?: string;
  requiredSkills?: string;
  description?: string;
  mentorName?: string;
  mentorEmail?: string;
  mentorPhone?: string;
}

export function InternshipRegistrationView() {
  const [registrations, setRegistrations] = useState<
    StudentInternshipItem[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // ==========================================================================
  // LOAD REAL REGISTRATIONS FROM BACKEND
  // ==========================================================================

  const loadRegistrations = async () => {
    const user = authStorage.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const data = await studentsApi.getInternships(user.id);

      setRegistrations(data);
    } catch (error) {
      console.error("Failed to load registrations:", error);

      setErrorNotice(
        error instanceof Error
          ? error.message
          : "Unable to load internship registrations."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.companyName.trim()) {
      errs.companyName =
        "Company/Organization name is required";
    } else if (
      formData.companyName.trim().length < 2
    ) {
      errs.companyName =
        "Company name must be at least 2 characters";
    }

    if (!formData.internshipTitle.trim()) {
      errs.internshipTitle =
        "Internship title is required";
    } else if (
      formData.internshipTitle.trim().length < 2
    ) {
      errs.internshipTitle =
        "Title must be at least 2 characters";
    }

    if (!formData.domain.trim()) {
      errs.domain =
        "Internship domain is required";
    }

    if (!formData.startDate) {
      errs.startDate =
        "Start date is required";
    }

    if (!formData.endDate) {
      errs.endDate =
        "End date is required";
    } else if (
      formData.startDate &&
      new Date(formData.endDate) <=
        new Date(formData.startDate)
    ) {
      errs.endDate =
        "End date must be after start date";
    }

    if (!formData.location.trim()) {
      errs.location =
        "Location is required (enter 'Remote' for online roles)";
    }

    if (formData.requiredSkills.length === 0) {
      errs.requiredSkills =
        "Please add at least one required skill tag";
    }

    if (!formData.description.trim()) {
      errs.description =
        "Internship description is required";
    } else if (
      formData.description.trim().length < 20
    ) {
      errs.description =
        "Description must be at least 20 characters";
    }

    if (!formData.mentorName.trim()) {
      errs.mentorName =
        "Mentor/Supervisor name is required";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.mentorEmail.trim()) {
      errs.mentorEmail =
        "Mentor contact email is required";
    } else if (
      !emailRegex.test(
        formData.mentorEmail.trim()
      )
    ) {
      errs.mentorEmail =
        "Please enter a valid email address";
    }

    if (!formData.mentorPhone.trim()) {
      errs.mentorPhone =
        "Mentor contact phone is required";
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  // ==========================================================================
  // SKILLS
  // ==========================================================================

  const handleAddSkill = () => {
    const skill =
      formData.skillInput.trim();

    if (!skill) return;

    if (
      formData.requiredSkills.some(
        (s) =>
          s.toLowerCase() ===
          skill.toLowerCase()
      )
    ) {
      setErrors((prev) => ({
        ...prev,
        requiredSkills:
          `"${skill}" is already added`,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      requiredSkills: [
        ...prev.requiredSkills,
        skill,
      ],
      skillInput: "",
    }));

    setErrors((prev) => ({
      ...prev,
      requiredSkills: undefined,
    }));
  };

  const handleRemoveSkill = (
    skillToRemove: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills:
        prev.requiredSkills.filter(
          (s) => s !== skillToRemove
        ),
    }));
  };

  // ==========================================================================
  // RESET FORM
  // ==========================================================================

  const resetForm = () => {
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
  };

  // ==========================================================================
  // SUBMIT REGISTRATION TO BACKEND
  // ==========================================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSuccessNotice(null);
    setErrorNotice(null);

    if (!validate()) {
      return;
    }

    const user = authStorage.getUser();

    if (!user) {
      setErrorNotice(
        "Please log in before registering an internship."
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const registration =
        await studentsApi.registerInternship(
          user.id,
          {
            company_name:
              formData.companyName.trim(),

            internship_title:
              formData.internshipTitle.trim(),

            domain:
              formData.domain,

            description:
              formData.description.trim(),

            location:
              formData.location.trim(),

            mode:
              formData.mode,

            start_date:
              formData.startDate
                ? `${formData.startDate}T00:00:00`
                : undefined,

            end_date:
              formData.endDate
                ? `${formData.endDate}T00:00:00`
                : undefined,

            required_skills:
              formData.requiredSkills,

            mentor_name:
              formData.mentorName.trim(),

            mentor_email:
              formData.mentorEmail.trim(),

            mentor_phone:
              formData.mentorPhone.trim(),

            cover_letter: undefined,
          }
        );

      // Add the newly created registration
      // to the live UI.
      setRegistrations((prev) => [
        registration,
        ...prev,
      ]);

      setSuccessNotice(
        "Internship registration submitted successfully and saved to the database."
      );

      resetForm();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        setSuccessNotice(null);
      }, 6000);
    } catch (error) {
      console.error(
        "Internship registration failed:",
        error
      );

      setErrorNotice(
        error instanceof Error
          ? error.message
          : "Unable to submit internship registration."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <BriefcaseIcon className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Internship Registration
            </h1>

            <p className="text-xs sm:text-sm text-slate-500">
              Register an off-campus or institutional internship placement for academic monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="flex items-start space-x-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 shadow-2xs">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />

          <div className="leading-relaxed">
            {successNotice}
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorNotice && (
        <div className="flex items-start space-x-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 shadow-2xs">
          <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />

          <div className="leading-relaxed">
            {errorNotice}
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Validation Error */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircleIcon className="w-4 h-4 text-rose-500 shrink-0" />

              <span>
                Please review and fix the required fields marked in red below.
              </span>
            </div>
          )}

          {/* ================================================================ */}
          {/* SECTION 1 */}
          {/* ================================================================ */}

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="w-4 h-4 text-indigo-600" />

              1. Organization & Position Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Company */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Organization Name{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      companyName:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. TechNova Solutions"
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.companyName
                      ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400"
                      : "border-slate-200 focus:ring-indigo-500"
                  }`}
                />

                {errors.companyName && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.companyName}
                  </p>
                )}
              </div>

              {/* Internship Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internship Title{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <input
                  type="text"
                  value={formData.internshipTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      internshipTitle:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. Python Developer Intern"
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.internshipTitle
                      ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400"
                      : "border-slate-200 focus:ring-indigo-500"
                  }`}
                />

                {errors.internshipTitle && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.internshipTitle}
                  </p>
                )}
              </div>

              {/* Domain */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internship Domain{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <select
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      domain:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {DOMAINS.map(
                    (domain) => (
                      <option
                        key={domain}
                        value={domain}
                      >
                        {domain}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internship Mode{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      "Online",
                      "Offline",
                      "Hybrid",
                    ] as const
                  ).map(
                    (modeOption) => (
                      <button
                        key={
                          modeOption
                        }
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            mode:
                              modeOption,
                          })
                        }
                        className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                          formData.mode ===
                          modeOption
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {modeOption}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Location / Office Address{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                  </div>

                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location:
                          e.target.value,
                      })
                    }
                    placeholder="e.g. Pune, Maharashtra or Remote"
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                      errors.location
                        ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400"
                        : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  />
                </div>

                {errors.location && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* SECTION 2 */}
          {/* ================================================================ */}

          <div className="pt-4 border-t border-slate-100">

            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />

              2. Duration & Schedule
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Start */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Date{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <input
                  type="date"
                  value={
                    formData.startDate
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate:
                        e.target.value,
                    })
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.startDate
                      ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400"
                      : "border-slate-200 focus:ring-indigo-500"
                  }`}
                />

                {errors.startDate && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.startDate}
                  </p>
                )}
              </div>

              {/* End */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  End Date{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <input
                  type="date"
                  value={
                    formData.endDate
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endDate:
                        e.target.value,
                    })
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                    errors.endDate
                      ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400"
                      : "border-slate-200 focus:ring-indigo-500"
                  }`}
                />

                {errors.endDate && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* SECTION 3 */}
          {/* ================================================================ */}

          <div className="pt-4 border-t border-slate-100">

            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-indigo-600" />

              3. Deliverables & Technical Expectations
            </h2>

            {/* Skills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Technical Skills{" "}
                <span className="text-rose-500">*</span>
              </label>

              <div className="flex gap-2 max-w-lg">

                <input
                  type="text"
                  value={
                    formData.skillInput
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      skillInput:
                        e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g. Python, Docker, SQL"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={
                    handleAddSkill
                  }
                  className="inline-flex items-center space-x-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  <PlusIcon className="w-3.5 h-3.5" />

                  <span>
                    Add Skill
                  </span>
                </button>
              </div>

              {errors.requiredSkills && (
                <p className="mt-1 text-[11px] text-rose-600">
                  {errors.requiredSkills}
                </p>
              )}

              <div className="mt-2.5 flex flex-wrap gap-2">

                {formData.requiredSkills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-800"
                    >
                      <span>
                        {skill}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveSkill(
                            skill
                          )
                        }
                        className="text-indigo-400 hover:text-rose-600 transition-colors"
                        title={`Remove ${skill}`}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">

              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internship Description & Deliverables{" "}
                <span className="text-rose-500">*</span>
              </label>

              <textarea
                rows={4}
                value={
                  formData.description
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description:
                      e.target.value,
                  })
                }
                placeholder="Summarize responsibilities, project scope and weekly deliverables..."
                className={`w-full rounded-lg border p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                  errors.description
                    ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />

              {errors.description && (
                <p className="mt-1 text-[11px] text-rose-600">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* ================================================================ */}
          {/* SECTION 4 */}
          {/* ================================================================ */}

          <div className="pt-4 border-t border-slate-100">

            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-indigo-600" />

              4. Mentor / Company Point of Contact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Mentor Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mentor / Guide Name{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                  </div>

                  <input
                    type="text"
                    value={
                      formData.mentorName
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mentorName:
                          e.target.value,
                      })
                    }
                    placeholder="Mentor name"
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                      errors.mentorName
                        ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400"
                        : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  />
                </div>

                {errors.mentorName && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.mentorName}
                  </p>
                )}
              </div>

              {/* Mentor Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mentor Official Email{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MailIcon className="w-4 h-4 text-slate-400" />
                  </div>

                  <input
                    type="email"
                    value={
                      formData.mentorEmail
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mentorEmail:
                          e.target.value,
                      })
                    }
                    placeholder="mentor@company.com"
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                      errors.mentorEmail
                        ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400"
                        : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  />
                </div>

                {errors.mentorEmail && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.mentorEmail}
                  </p>
                )}
              </div>

              {/* Mentor Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mentor Phone Number{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                  </div>

                  <input
                    type="text"
                    value={
                      formData.mentorPhone
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mentorPhone:
                          e.target.value,
                      })
                    }
                    placeholder="+91 9876543210"
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 ${
                      errors.mentorPhone
                        ? "border-rose-400 bg-rose-50/20 focus:ring-rose-400"
                        : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  />
                </div>

                {errors.mentorPhone && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.mentorPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* SUBMIT */}
          {/* ================================================================ */}

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end">

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {isSubmitting
                ? "Saving Registration..."
                : "Submit Registration"}
            </button>

          </div>
        </form>
      </div>

      {/* ================================================================ */}
      {/* REAL REGISTRATION HISTORY */}
      {/* ================================================================ */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Registered Internships History
            </h2>

            <p className="text-xs text-slate-500">
              Registrations loaded from the backend database
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {registrations.length} Placements
          </span>

        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-8 text-center text-xs text-slate-500">
            Loading registrations...
          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          registrations.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <BriefcaseIcon className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No internship registered yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Submit the registration form above to add your internship.
              </p>
            </div>
          )}

        {/* Registrations */}
        {!isLoading &&
          registrations.length > 0 && (
            <div className="space-y-3">

              {registrations.map(
                (item) => {
                  const internship =
                    item.internship;

                  return (
                    <div
                      key={
                        item.application_id
                      }
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 hover:bg-slate-100/70 transition-colors text-xs space-y-2"
                    >

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

                        <div>
                          <span className="font-bold text-slate-900 text-sm block">
                            {
                              internship.title
                            }
                          </span>

                          <span className="text-indigo-600 font-semibold">
                            {
                              internship.company_name ||
                              "Company"
                            }
                          </span>

                          {internship.domain && (
                            <>
                              <span className="text-slate-400 mx-1.5">
                                •
                              </span>

                              <span className="text-slate-500">
                                {
                                  internship.domain
                                }
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">

                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                            {
                              item.application_status
                            }
                          </span>

                          <span className="text-slate-400 font-mono text-[10px]">
                            Application
                          </span>

                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 pt-1">

                        <div>
                          <span className="text-slate-400 block">
                            Duration & Mode
                          </span>

                          <span>
                            {internship.start_date
                              ? internship.start_date.split(
                                  "T"
                                )[0]
                              : "—"}{" "}
                            to{" "}
                            {internship.end_date
                              ? internship.end_date.split(
                                  "T"
                                )[0]
                              : "—"}{" "}
                            ({internship.mode})
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block">
                            Location
                          </span>

                          <span>
                            {
                              internship.location
                            }
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block">
                            Registration Date
                          </span>

                          <span>
                            {item.applied_at
                              ? new Date(
                                  item.applied_at
                                ).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>
    </div>
  );
}
