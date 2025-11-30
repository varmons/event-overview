/**
 * @fileoverview Registration and links card component.
 */

"use client";

import Link from "next/link";
import { ExternalLink, PlayCircle, Video } from "lucide-react";
import { Event } from "@/types";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface RegistrationCardProps {
  event: Event;
  locale: string;
  t: (key: string) => string;
  isRegistrationOpen: boolean;
  isRegistrationClosed: boolean;
}

// =============================================================================
// Component
// =============================================================================

/** Registration CTA and external links card */
export function RegistrationCard({
  event,
  locale,
  t,
  isRegistrationOpen,
  isRegistrationClosed,
}: RegistrationCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">{t("registration.title")}</h3>
      {event.registrationUrl ? (
        <Link
          href={`/${locale}/redirect?target=${encodeURIComponent(event.registrationUrl)}`}
          target="_blank"
          className={cn(
            "w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors",
            isRegistrationOpen
              ? "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              : "bg-gray-300 cursor-not-allowed",
          )}
          onClick={(e) => {
            if (!isRegistrationOpen) e.preventDefault();
          }}
        >
          {isRegistrationClosed
            ? t("registration.registrationClosed")
            : isRegistrationOpen
              ? t("registration.registerNow")
              : t("registration.registrationNotOpen")}
          {isRegistrationOpen && <ExternalLink className="ml-2 w-4 h-4" />}
        </Link>
      ) : (
        <button
          disabled
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-300 cursor-not-allowed"
        >
          {t("registration.noLink")}
        </button>
      )}

      <div className="space-y-3 pt-4 border-t border-gray-100">
        {event.officialSiteUrl && (
          <Link
            href={`/${locale}/redirect?target=${encodeURIComponent(event.officialSiteUrl)}`}
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {t("links.officialSite")}
          </Link>
        )}
        {event.livestreamUrl && (
          <Link
            href={`/${locale}/redirect?target=${encodeURIComponent(event.livestreamUrl)}`}
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Video className="w-4 h-4" />
            {t("links.livestream")}
          </Link>
        )}
        {event.recordingUrl && (
          <Link
            href={`/${locale}/redirect?target=${encodeURIComponent(event.recordingUrl)}`}
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            {t("links.recording")}
          </Link>
        )}
      </div>
    </div>
  );
}
