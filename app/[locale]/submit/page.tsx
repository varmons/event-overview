"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2 } from "lucide-react";

import { useEventStore } from "@/lib/store";
import { computeEventStatus } from "@/lib/event-utils";
import { createEventRecord } from "@/lib/eventRepository";
import { uploadEventPoster } from "@/lib/storage";
import { SUBMIT_PASSWORD_STORAGE_KEY } from "@/lib/password";
import {
  EVENT_TYPES,
  KNOWN_VENDORS,
  LOCATION_TYPES,
  ORGANIZER_TYPES,
} from "@/lib/constants";

import { Event } from "@/types";
import {
  FormSection,
  InputField,
  SelectField,
  DateTimeField,
  TextareaField,
  CheckboxField,
} from "@/components/FormControls";

import { useEventFormState } from "./useEventForm";
import {
  PasswordGate,
  PosterUpload,
  FormErrorBanner,
  DateTimeFieldsSection,
  EVENT_TIMELINE_FIELDS,
  REGISTRATION_FIELDS,
} from "./components";

export default function SubmitEventPage() {
  const router = useRouter();
  const locale = useLocale();
  const { addEvent, refreshEvents } = useEventStore();

  // Translations
  const t = useTranslations("submit");
  const tCommon = useTranslations("common");
  const tEventTypes = useTranslations("eventTypes");
  const tVendors = useTranslations("vendors");
  const tLocation = useTranslations("locationTypes");
  const tOrganizerTypes = useTranslations("organizerTypes");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    formData,
    errors,
    setErrors,
    handleChange,
    validate,
    normalizeDates,
    deriveRegistrationEnd,
  } = useEventFormState({ t });

  // Poster state
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  // Auth state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Check authorization on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(SUBMIT_PASSWORD_STORAGE_KEY);
    if (stored === "granted") setIsAuthorized(true);
    setIsCheckingAccess(false);
  }, []);

  // Poster file handling
  const handleFileSelect = (file: File): boolean => {
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({ ...prev, poster: t("validation.imageTooLarge") }));
      return false;
    }
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, poster: t("validation.invalidImageType") }));
      return false;
    }

    setPosterFile(file);
    if (posterPreview) URL.revokeObjectURL(posterPreview);
    setPosterPreview(URL.createObjectURL(file));
    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { poster: _unused, ...rest } = prev;
      return rest;
    });
    return true;
  };

  const clearPoster = () => {
    if (posterPreview) URL.revokeObjectURL(posterPreview);
    setPosterFile(null);
    setPosterPreview(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const finalRegEnd = deriveRegistrationEnd();

      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const vendorValue =
        formData.vendor === "Other"
          ? formData.customVendor.trim()
          : formData.vendor;
      const normalizedVendor = vendorValue || undefined;
      const eventId = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      let posterUrl: string | undefined;
      if (posterFile) {
        posterUrl = await uploadEventPoster(posterFile, eventId);
      }

      const normalizedDates = normalizeDates(finalRegEnd);

      const newEvent: Event = {
        id: eventId,
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        description: formData.description,
        eventType: formData.eventType,
        vendor: normalizedVendor,
        tags,
        locationType: formData.locationType,
        locationDetail:
          formData.locationType === "Online"
            ? undefined
            : formData.locationDetail || undefined,
        posterUrl,
        registrationStart: normalizedDates.registrationStart,
        registrationEnd: normalizedDates.registrationEnd,
        eventStart: normalizedDates.eventStart,
        eventEnd: normalizedDates.eventEnd,
        submissionDeadline: normalizedDates.submissionDeadline,
        reviewStart: normalizedDates.reviewStart,
        reviewEnd: normalizedDates.reviewEnd,
        announcementDate: normalizedDates.announcementDate,
        demoDayDate: normalizedDates.demoDayDate,
        awardCeremonyDate: normalizedDates.awardCeremonyDate,
        status: "Upcoming",
        isPostponed: formData.isPostponed,
        originalEventStart: normalizedDates.originalEventStart,
        originalEventEnd: normalizedDates.originalEventEnd,
        postponedReason: formData.postponedReason || undefined,
        organizerName: formData.organizerName,
        organizerType: formData.organizerType,
        organizerContact: formData.organizerContact || undefined,
        organizerAvatarUrl: undefined,
        registrationUrl: formData.registrationUrl || undefined,
        officialSiteUrl: formData.officialSiteUrl || undefined,
        livestreamUrl: formData.livestreamUrl || undefined,
        recordingUrl: formData.recordingUrl || undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      newEvent.status = computeEventStatus(newEvent);

      const createdEvent = await createEventRecord(newEvent);

      addEvent(createdEvent);
      await refreshEvents();

      router.push(`/${locale}/events/${createdEvent.id}`);
    } catch (error) {
      console.error("Failed to submit event", error);
      const message =
        error instanceof Error ? error.message : "Failed to submit event";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <div className="h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm">{t("auth.loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <PasswordGate t={t} onUnlock={() => setIsAuthorized(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-500 mt-1">{t("description")}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Error Banners */}
            <FormErrorBanner title={t("validation.formErrors")} errors={errors} />
            <FormErrorBanner title={t("errorTitle")} message={submitError ?? undefined} />

            {/* Basic Info */}
            <FormSection title={t("basicInfo")}>
              <div className="grid grid-cols-1 gap-6">
                <InputField
                  label={t("fields.title.label")}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder={t("fields.title.placeholder")}
                  error={errors.title}
                />

                <InputField
                  label={t("fields.subtitle.label")}
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder={t("fields.subtitle.placeholder")}
                />

                <TextareaField
                  label={t("fields.description.label")}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  required
                  placeholder={t("fields.description.placeholder")}
                  error={errors.description}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <SelectField
                    label={t("fields.eventType.label")}
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    options={EVENT_TYPES.map((opt) => ({
                      value: opt,
                      label: tEventTypes(opt),
                    }))}
                  />

                  <SelectField
                    label={t("fields.vendor.label")}
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                    options={KNOWN_VENDORS.map((opt) => ({
                      value: opt,
                      label: tVendors(opt),
                    }))}
                  />
                </div>

                {formData.vendor === "Other" && (
                  <InputField
                    label={t("fields.customVendor.label")}
                    name="customVendor"
                    value={formData.customVendor}
                    onChange={handleChange}
                    placeholder={t("fields.customVendor.placeholder")}
                    error={errors.customVendor}
                  />
                )}

                <InputField
                  label={t("fields.tags.label")}
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder={t("fields.tags.placeholder")}
                />
              </div>
            </FormSection>

            {/* Location */}
            <FormSection title={t("location")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SelectField
                  label={t("fields.locationType.label")}
                  name="locationType"
                  value={formData.locationType}
                  onChange={handleChange}
                  options={LOCATION_TYPES.map((opt) => ({
                    value: opt,
                    label: tLocation(opt),
                  }))}
                />
                <InputField
                  label={t("fields.locationDetail.label")}
                  name="locationDetail"
                  value={formData.locationDetail}
                  onChange={handleChange}
                  placeholder={t("fields.locationDetail.placeholder")}
                  required={formData.locationType !== "Online"}
                  error={errors.locationDetail}
                  helperText={
                    formData.locationType === "Online"
                      ? t("fields.locationDetail.placeholder")
                      : undefined
                  }
                />
              </div>
            </FormSection>

            {/* Organizer */}
            <FormSection title={t("organizer")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField
                  label={t("fields.organizerName.label")}
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleChange}
                  required
                  error={errors.organizerName}
                />
                <SelectField
                  label={t("fields.organizerType.label")}
                  name="organizerType"
                  value={formData.organizerType}
                  onChange={handleChange}
                  options={ORGANIZER_TYPES.map((opt) => ({
                    value: opt,
                    label: tOrganizerTypes(opt),
                  }))}
                />
                <InputField
                  className="sm:col-span-2"
                  label={t("fields.organizerContact.label")}
                  name="organizerContact"
                  value={formData.organizerContact}
                  onChange={handleChange}
                  placeholder={t("fields.organizerContact.placeholder")}
                />
              </div>
            </FormSection>

            {/* Links */}
            <FormSection title={t("links")}>
              <div className="grid grid-cols-1 gap-6">
                <InputField
                  label={t("fields.registrationUrl.label")}
                  name="registrationUrl"
                  value={formData.registrationUrl}
                  onChange={handleChange}
                  placeholder={t("fields.registrationUrl.placeholder")}
                  type="url"
                />
                <InputField
                  label={t("fields.officialSiteUrl.label")}
                  name="officialSiteUrl"
                  value={formData.officialSiteUrl}
                  onChange={handleChange}
                  placeholder={t("fields.officialSiteUrl.placeholder")}
                  type="url"
                />
                <InputField
                  label={t("fields.livestreamUrl.label")}
                  name="livestreamUrl"
                  value={formData.livestreamUrl}
                  onChange={handleChange}
                  placeholder={t("fields.livestreamUrl.placeholder")}
                  type="url"
                />
                <InputField
                  label={t("fields.recordingUrl.label")}
                  name="recordingUrl"
                  value={formData.recordingUrl}
                  onChange={handleChange}
                  placeholder={t("fields.recordingUrl.placeholder")}
                  type="url"
                />
              </div>
            </FormSection>

            {/* Event Timeline */}
            <DateTimeFieldsSection
              title={t("timeline")}
              fields={EVENT_TIMELINE_FIELDS}
              formData={formData}
              errors={errors}
              onChange={handleChange}
              t={t}
            />

            {/* Registration Period */}
            <DateTimeFieldsSection
              title={t("registration")}
              fields={REGISTRATION_FIELDS}
              formData={formData}
              errors={errors}
              onChange={handleChange}
              t={t}
            />

            {/* Poster Upload */}
            <FormSection title={t("fields.poster.label")}>
              <PosterUpload
                t={t}
                posterPreview={posterPreview}
                error={errors.poster}
                onFileSelect={handleFileSelect}
                onClear={clearPoster}
              />
            </FormSection>

            {/* Postponed Toggle */}
            <FormSection
              title={t("fields.isPostponed.label")}
              description={t("postponedInfo")}
            >
              <CheckboxField
                label={t("fields.isPostponed.label")}
                name="isPostponed"
                checked={formData.isPostponed}
                onChange={handleChange}
              />

              {formData.isPostponed && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DateTimeField
                      label={t("fields.originalEventStart.label")}
                      name="originalEventStart"
                      value={formData.originalEventStart}
                      onChange={handleChange}
                      required
                      error={errors.originalEventStart}
                    />
                    <DateTimeField
                      label={t("fields.originalEventEnd.label")}
                      name="originalEventEnd"
                      value={formData.originalEventEnd}
                      onChange={handleChange}
                      required
                      error={errors.originalEventEnd}
                    />
                    <InputField
                      className="sm:col-span-2"
                      label={t("fields.postponedReason.label")}
                      name="postponedReason"
                      value={formData.postponedReason}
                      onChange={handleChange}
                      placeholder={t("fields.postponedReason.placeholder")}
                    />
                  </div>
                </div>
              )}
            </FormSection>

            <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {tCommon("cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? t("submitting") : t("submit")}
                {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
