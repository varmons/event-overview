/**
 * @fileoverview Timezone utilities for consistent date/time handling.
 * Defaults to China timezone (Asia/Shanghai) when detection fails.
 */

// =============================================================================
// Constants
// =============================================================================

/** Default timezone (China Standard Time) */
export const DEFAULT_TIMEZONE = "Asia/Shanghai";

/** Supported timezone mappings for locales */
export const LOCALE_TIMEZONE_MAP: Record<string, string> = {
  zh: "Asia/Shanghai",
  ja: "Asia/Tokyo",
  en: "America/New_York", // Default for English, can be overridden by browser
};

// =============================================================================
// Timezone Detection
// =============================================================================

/**
 * Detect user's timezone from browser
 * @returns Detected timezone or default (Asia/Shanghai)
 */
export function detectTimezone(): string {
  if (typeof window === "undefined") {
    return DEFAULT_TIMEZONE;
  }

  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return detected || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/**
 * Get timezone for a specific locale
 * @param locale - Locale code
 * @returns Timezone string
 */
export function getTimezoneForLocale(locale: string): string {
  return LOCALE_TIMEZONE_MAP[locale] || DEFAULT_TIMEZONE;
}

// =============================================================================
// Date Formatting with Timezone
// =============================================================================

/**
 * Format a date with explicit timezone
 * @param date - Date to format
 * @param locale - Locale code
 * @param timezone - Timezone (defaults to detected or China)
 * @returns Formatted date string
 */
export function formatDateWithTimezone(
  date: Date | string | null | undefined,
  locale: string = "zh",
  timezone?: string
): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";

  const tz = timezone || getTimezoneForLocale(locale);

  const localeMap: Record<string, string> = {
    zh: "zh-CN",
    ja: "ja-JP",
    en: "en-US",
  };

  return dateObj.toLocaleDateString(localeMap[locale] || "zh-CN", {
    timeZone: tz,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a datetime with explicit timezone
 * @param date - Date to format
 * @param locale - Locale code
 * @param timezone - Timezone (defaults to detected or China)
 * @returns Formatted datetime string
 */
export function formatDateTimeWithTimezone(
  date: Date | string | null | undefined,
  locale: string = "zh",
  timezone?: string
): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";

  const tz = timezone || getTimezoneForLocale(locale);

  const localeMap: Record<string, string> = {
    zh: "zh-CN",
    ja: "ja-JP",
    en: "en-US",
  };

  return dateObj.toLocaleString(localeMap[locale] || "zh-CN", {
    timeZone: tz,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: locale !== "ja", // Japan uses 24-hour format
  });
}

/**
 * Get current time in a specific timezone
 * @param timezone - Timezone string
 * @returns Current Date adjusted for display
 */
export function getCurrentTimeInTimezone(timezone: string = DEFAULT_TIMEZONE): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: timezone })
  );
}

/**
 * Convert local datetime-local input to UTC ISO string
 * @param localDateTimeString - Value from datetime-local input (e.g., "2024-06-15T14:30")
 * @returns UTC ISO string
 * @description The browser's datetime-local input is always in local timezone,
 *              so we simply parse and convert to ISO string (UTC)
 */
export function localToUTC(localDateTimeString: string): string {
  if (!localDateTimeString) return "";

  // datetime-local is interpreted as local time by the browser
  const date = new Date(localDateTimeString);
  return date.toISOString();
}

/**
 * Format UTC date for display in specific timezone
 * @param utcString - UTC ISO string from database
 * @param locale - Display locale
 * @param timezone - Display timezone
 * @returns Formatted string for display
 */
export function utcToLocalDisplay(
  utcString: string | undefined,
  locale: string = "zh",
  timezone?: string
): string {
  if (!utcString) return "";
  return formatDateTimeWithTimezone(utcString, locale, timezone);
}
