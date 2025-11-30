/**
 * @fileoverview Form field configuration for event submission.
 * Centralizes field definitions to reduce modification points when adding new fields.
 */

import { EventType, LocationType, OrganizerType, Vendor } from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface FormFieldConfig {
  name: string;
  labelKey: string;
  type: "text" | "textarea" | "select" | "datetime" | "checkbox" | "url";
  required?: boolean;
  placeholderKey?: string;
  helperTextKey?: string;
  dependsOn?: { field: string; value: unknown };
  options?: { value: string; labelKey: string }[];
}

export interface FormSectionConfig {
  titleKey: string;
  descriptionKey?: string;
  fields: FormFieldConfig[];
}

// =============================================================================
// Default Values
// =============================================================================

export interface EventFormData {
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
}

export const FORM_DEFAULT_VALUES: EventFormData = {
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
};

// =============================================================================
// Validation Rules
// =============================================================================

export interface ValidationRule {
  field: string;
  validate: (value: unknown, formData: EventFormData) => string | null;
}

export const VALIDATION_RULES: ValidationRule[] = [
  {
    field: "title",
    validate: (value) => (!String(value).trim() ? "validation.required" : null),
  },
  {
    field: "description",
    validate: (value) => (!String(value).trim() ? "validation.required" : null),
  },
  {
    field: "organizerName",
    validate: (value) => (!String(value).trim() ? "validation.required" : null),
  },
  {
    field: "customVendor",
    validate: (value, formData) =>
      formData.vendor === "Other" && !String(value).trim()
        ? "validation.required"
        : null,
  },
  {
    field: "locationDetail",
    validate: (value, formData) =>
      formData.locationType !== "Online" && !String(value).trim()
        ? "validation.required"
        : null,
  },
  {
    field: "eventStart",
    validate: (value) => (!value ? "validation.required" : null),
  },
  {
    field: "eventEnd",
    validate: (value, formData) => {
      if (!value) return "validation.required";
      if (formData.eventStart && formData.eventEnd) {
        const start = new Date(formData.eventStart).getTime();
        const end = new Date(formData.eventEnd).getTime();
        if (start > end) return "validation.endBeforeStart";
      }
      return null;
    },
  },
  {
    field: "registrationEnd",
    validate: (value, formData) => {
      if (!value) return null;
      if (formData.registrationStart) {
        const start = new Date(formData.registrationStart).getTime();
        const end = new Date(value as string).getTime();
        if (start > end) return "validation.regEndBeforeStart";
      }
      if (formData.eventStart) {
        const eventStart = new Date(formData.eventStart).getTime();
        const regEnd = new Date(value as string).getTime();
        if (regEnd > eventStart) return "validation.regEndAfterEvent";
      }
      return null;
    },
  },
  {
    field: "originalEventStart",
    validate: (value, formData) =>
      formData.isPostponed && !value
        ? "validation.postponedOriginalRequired"
        : null,
  },
  {
    field: "originalEventEnd",
    validate: (value, formData) =>
      formData.isPostponed && !value
        ? "validation.postponedOriginalRequired"
        : null,
  },
];

/**
 * Validate form data against all rules
 * @param formData - Current form data
 * @param t - Translation function
 * @returns Object with field names as keys and error messages as values
 */
export function validateFormData(
  formData: EventFormData,
  t: (key: string) => string
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const rule of VALIDATION_RULES) {
    const value = formData[rule.field as keyof EventFormData];
    const errorKey = rule.validate(value, formData);
    if (errorKey) {
      errors[rule.field] = t(errorKey);
    }
  }

  return errors;
}
