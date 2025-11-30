/**
 * @fileoverview Event utility functions for date handling and status computation.
 * Uses China timezone (Asia/Shanghai) as default.
 */

import { Event, EventStatus } from "@/types";
import { getTimezoneForLocale } from "./timezone";

// =============================================================================
// Types
// =============================================================================

/** Flexible date input type for utility functions */
export type DateInput = string | Date | null | undefined;

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Parse various date inputs into a Date object
 * @internal
 */
const toDate = (input: DateInput): Date | null => {
  if (!input) return null;
  if (input instanceof Date) return input;
  const parsed = new Date(input);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Convert date input to Unix timestamp
 * @internal
 */
const toEpoch = (input: DateInput): number | null => {
  const parsed = toDate(input);
  return parsed ? parsed.getTime() : null;
};

// =============================================================================
// Exported Functions
// =============================================================================

/**
 * Normalize any date-like input to an ISO 8601 string
 * @param input - Date string, Date object, null, or undefined
 * @returns ISO string or undefined if input is invalid
 * @example
 * toIsoString(new Date()) // "2024-01-15T10:30:00.000Z"
 * toIsoString("2024-01-15") // "2024-01-15T00:00:00.000Z"
 * toIsoString(null) // undefined
 */
export const toIsoString = (input: DateInput): string | undefined => {
  const parsed = toDate(input);
  return parsed ? parsed.toISOString() : undefined;
};

/**
 * Compute the current status of an event based on its dates
 * @param event - The event to evaluate
 * @param now - Reference date (defaults to current time)
 * @returns The computed EventStatus
 *
 * @description Status flow:
 * - Postponed (if isPostponed flag is set)
 * - Upcoming → OpenForRegistration → RegistrationClosed → Ongoing → InReview → Completed
 */
export function computeEventStatus(
  event: Event,
  now: Date = new Date(),
): EventStatus {
  if (event.isPostponed) {
    return "Postponed";
  }

  const nowTime = now.getTime();
  const regStart = toEpoch(event.registrationStart);
  const regEnd = toEpoch(event.registrationEnd);
  const evtStart = toEpoch(event.eventStart);
  const evtEnd = toEpoch(event.eventEnd);
  const reviewStart = toEpoch(event.reviewStart);
  const reviewEnd = toEpoch(event.reviewEnd);

  if (regStart && nowTime < regStart) return "Upcoming";

  if (regStart && regEnd && nowTime >= regStart && nowTime <= regEnd) {
    return "OpenForRegistration";
  }
  if (!regStart && regEnd && nowTime <= regEnd) {
    return "OpenForRegistration";
  }

  if (regEnd && evtStart && nowTime > regEnd && nowTime < evtStart) {
    return "RegistrationClosed";
  }

  if (evtStart && evtEnd && nowTime >= evtStart && nowTime <= evtEnd) {
    return "Ongoing";
  }

  if (evtEnd && reviewEnd && nowTime > evtEnd && nowTime <= reviewEnd) {
    if (!reviewStart || nowTime >= reviewStart) return "InReview";
  }

  if (evtEnd && nowTime > evtEnd) {
    if (!reviewEnd || nowTime > reviewEnd) return "Completed";
  }

  if (evtStart && nowTime < evtStart) return "Upcoming";

  return "Upcoming";
}

/**
 * Format a date for display (date only, no time)
 * @param dateStr - Date to format
 * @param locale - Locale code ("en", "zh", "ja")
 * @returns Formatted date string or empty string if invalid
 * @example
 * formatDate("2024-06-15T06:30:00Z", "zh") // "6月15日" (in China timezone)
 */
export function formatDate(dateStr?: DateInput, locale: string = "en"): string {
  const date = toDate(dateStr);
  if (!date) return "";

  const timezone = getTimezoneForLocale(locale);

  if (locale === "zh") {
    return date.toLocaleDateString("zh-CN", {
      timeZone: timezone,
      month: "long",
      day: "numeric",
    });
  }

  if (locale === "ja") {
    return date.toLocaleDateString("ja-JP", {
      timeZone: timezone,
      month: "long",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date with time for display
 * @param dateStr - Date to format
 * @param locale - Locale code ("en", "zh", "ja")
 * @returns Formatted datetime string or empty string if invalid
 * @example
 * formatDateTime("2024-06-15T06:30:00Z", "zh") // "6月15日 下午2:30" (in China timezone UTC+8)
 */
export function formatDateTime(
  dateStr?: DateInput,
  locale: string = "en",
): string {
  const date = toDate(dateStr);
  if (!date) return "";

  const timezone = getTimezoneForLocale(locale);

  if (locale === "zh") {
    const formatted = date.toLocaleString("zh-CN", {
      timeZone: timezone,
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    // Keep spacing consistent (e.g., 12月14日 下午5:00)
    return formatted.replace(/\s+/g, " ");
  }

  if (locale === "ja") {
    return date.toLocaleString("ja-JP", {
      timeZone: timezone,
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  }

  return date.toLocaleString("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
