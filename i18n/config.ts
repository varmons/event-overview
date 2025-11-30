/**
 * @fileoverview Internationalization configuration.
 */

/** Supported locale codes */
export const locales = ["en", "zh", "ja"] as const;

/** Locale type derived from supported locales */
export type Locale = (typeof locales)[number];

/** Default locale for the application */
export const defaultLocale: Locale = "en";
