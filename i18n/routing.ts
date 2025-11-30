/**
 * @fileoverview next-intl routing configuration and navigation utilities.
 */

import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "./config";

/** Routing configuration for next-intl */
export const routing = defineRouting({
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
