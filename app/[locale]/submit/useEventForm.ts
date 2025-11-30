"use client";

import { useCallback, useState, ChangeEvent } from "react";
import { EventType, LocationType, OrganizerType, Vendor } from "@/types";
import { toIsoString } from "@/lib/event-utils";

type Translator = (key: string) => string;

export type EventFormData = {
  title: string;
  subtitle: string;
  description: string;
  eventType: EventType;
  vendor: Vendor | string;
  customVendor: string;
  tags: string;
  locationType: LocationType;
  locationDetail: string;

  registrationStart: string;
  registrationEnd: string;
  eventStart: string;
  eventEnd: string;
  submissionDeadline: string;
  reviewStart: string;
  reviewEnd: string;
  announcementDate: string;
  demoDayDate: string;
  awardCeremonyDate: string;

  organizerName: string;
  organizerType: OrganizerType;
  organizerContact: string;

  registrationUrl: string;
  officialSiteUrl: string;
  livestreamUrl: string;
  recordingUrl: string;

  isPostponed: boolean;
  originalEventStart: string;
  originalEventEnd: string;
  postponedReason: string;
};

interface UseEventFormStateOptions {
  t: Translator;
}

export function useEventFormState({ t }: UseEventFormStateOptions) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    subtitle: "",
    description: "",
    eventType: "Meetup",
    vendor: "Other",
    customVendor: "",
    tags: "",
    locationType: "Online",
    locationDetail: "",

    registrationStart: "",
    registrationEnd: "",
    eventStart: "",
    eventEnd: "",
    submissionDeadline: "",
    reviewStart: "",
    reviewEnd: "",
    announcementDate: "",
    demoDayDate: "",
    awardCeremonyDate: "",

    organizerName: "",
    organizerType: "Individual",
    organizerContact: "",

    registrationUrl: "",
    officialSiteUrl: "",
    livestreamUrl: "",
    recordingUrl: "",

    isPostponed: false,
    originalEventStart: "",
    originalEventEnd: "",
    postponedReason: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearFieldError = useCallback((name: string) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleChange = useCallback(
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value, type } = e.target;
      const nextValue =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
      setFormData((prev) => ({ ...prev, [name]: nextValue }));
      clearFieldError(name);
    },
    [clearFieldError],
  );

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = t("validation.required");
    if (!formData.description.trim())
      newErrors.description = t("validation.required");
    if (!formData.organizerName.trim())
      newErrors.organizerName = t("validation.required");
    if (formData.vendor === "Other" && !formData.customVendor.trim()) {
      newErrors.customVendor = t("validation.required");
    }
    if (formData.locationType !== "Online" && !formData.locationDetail.trim()) {
      newErrors.locationDetail = t("validation.required");
    }

    if (!formData.eventStart) newErrors.eventStart = t("validation.required");
    if (!formData.eventEnd) newErrors.eventEnd = t("validation.required");

    const start = formData.eventStart
      ? new Date(formData.eventStart).getTime()
      : null;
    const end = formData.eventEnd
      ? new Date(formData.eventEnd).getTime()
      : null;

    if (start && end && start > end) {
      newErrors.eventEnd = t("validation.endBeforeStart");
    }

    if (formData.registrationStart && formData.registrationEnd) {
      if (
        new Date(formData.registrationStart).getTime() >
        new Date(formData.registrationEnd).getTime()
      ) {
        newErrors.registrationEnd = t("validation.regEndBeforeStart");
      }
    }

    if (formData.registrationEnd && start) {
      if (new Date(formData.registrationEnd).getTime() > start) {
        newErrors.registrationEnd = t("validation.regEndAfterEvent");
      }
    }

    if (formData.isPostponed) {
      if (!formData.originalEventStart)
        newErrors.originalEventStart = t(
          "validation.postponedOriginalRequired",
        );
      if (!formData.originalEventEnd)
        newErrors.originalEventEnd = t("validation.postponedOriginalRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const deriveRegistrationEnd = useCallback(() => {
    if (
      formData.eventType === "Meetup" &&
      !formData.registrationEnd &&
      formData.eventStart
    ) {
      const evtStart = new Date(formData.eventStart);
      evtStart.setDate(evtStart.getDate() - 1);
      evtStart.setHours(23, 59, 0, 0);
      return evtStart.toISOString();
    }
    return formData.registrationEnd || undefined;
  }, [formData.eventStart, formData.eventType, formData.registrationEnd]);

  const normalizeDates = useCallback(
    (finalRegEnd?: string) => ({
      registrationStart: toIsoString(formData.registrationStart),
      registrationEnd: toIsoString(finalRegEnd ?? formData.registrationEnd),
      eventStart: toIsoString(formData.eventStart)!,
      eventEnd: toIsoString(formData.eventEnd)!,
      submissionDeadline: toIsoString(formData.submissionDeadline),
      reviewStart: toIsoString(formData.reviewStart),
      reviewEnd: toIsoString(formData.reviewEnd),
      announcementDate: toIsoString(formData.announcementDate),
      demoDayDate: toIsoString(formData.demoDayDate),
      awardCeremonyDate: toIsoString(formData.awardCeremonyDate),
      originalEventStart: toIsoString(formData.originalEventStart),
      originalEventEnd: toIsoString(formData.originalEventEnd),
    }),
    [formData],
  );

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    validate,
    normalizeDates,
    deriveRegistrationEnd,
    clearFieldError,
  };
}
