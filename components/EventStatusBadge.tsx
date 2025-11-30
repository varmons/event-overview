"use client";

import { memo } from "react";
import { EventStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// =============================================================================
// Types
// =============================================================================

interface EventStatusBadgeProps {
  /** Event status to display */
  status: EventStatus;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

/** Tailwind classes for each status type */
const STATUS_STYLES: Record<EventStatus, string> = {
  Upcoming: "bg-blue-100 text-blue-800 border-blue-200",
  OpenForRegistration: "bg-green-100 text-green-800 border-green-200",
  RegistrationClosed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Ongoing: "bg-purple-100 text-purple-800 border-purple-200 animate-pulse",
  InReview: "bg-orange-100 text-orange-800 border-orange-200",
  Completed: "bg-gray-100 text-gray-800 border-gray-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
  Postponed: "bg-red-100 text-red-800 border-red-200 font-bold",
};

// =============================================================================
// Component
// =============================================================================

/**
 * Badge component displaying event status with color coding
 * @description Memoized for performance in list rendering
 */
export const EventStatusBadge = memo(
  function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
    const t = useTranslations("eventStatus");
    const badgeClass = STATUS_STYLES[status] ?? STATUS_STYLES.Upcoming;

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
          badgeClass,
          className,
        )}
      >
        {t(status)}
      </span>
    );
  },
  (prev, next) =>
    prev.status === next.status && prev.className === next.className,
);
