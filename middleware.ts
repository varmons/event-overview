/**
 * @fileoverview Internationalization middleware for locale detection and routing.
 * Handles automatic locale detection and URL prefixing.
 */

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** Middleware that handles locale negotiation and redirects */
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /public files (images, etc.)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
