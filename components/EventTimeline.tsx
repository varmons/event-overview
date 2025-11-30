/**
 * @fileoverview Event timeline component showing chronological milestones.
 */

"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Event } from "@/types";
import { formatDateTime } from "@/lib/event-utils";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface EventTimelineProps {
  /** Event to display timeline for */
  event: Event;
}

interface TimelineItem {
  key: string;
  label: string;
  date?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Displays a vertical timeline of event milestones
 * @description Shows registration, event, review, and ceremony dates in chronological order
 */
export function EventTimeline({ event }: EventTimelineProps) {
  const locale = useLocale();
  const t = useTranslations("eventDetail.timeline");
  const now = useMemo(() => new Date().getTime(), []);

  const timelineItems: Array<TimelineItem & { timestamp: number }> = useMemo(
    () =>
      [
        {
          key: "regStart",
          label: t("registrationOpens"),
          date: event.registrationStart,
        },
        {
          key: "regEnd",
          label: t("registrationCloses"),
          date: event.registrationEnd,
        },
        { key: "evtStart", label: t("eventStarts"), date: event.eventStart },
        { key: "evtEnd", label: t("eventEnds"), date: event.eventEnd },
        {
          key: "subDeadline",
          label: t("submissionDeadline"),
          date: event.submissionDeadline,
        },
        {
          key: "revStart",
          label: t("reviewStarts"),
          date: event.reviewStart,
        },
        { key: "revEnd", label: t("reviewEnds"), date: event.reviewEnd },
        {
          key: "announce",
          label: t("announcement"),
          date: event.announcementDate,
        },
        { key: "demo", label: t("demoDay"), date: event.demoDayDate },
        {
          key: "award",
          label: t("awardCeremony"),
          date: event.awardCeremonyDate,
        },
      ]
        .filter((item) => item.date)
        .map((item) => ({
          ...item,
          timestamp: new Date(item.date!).getTime(),
        }))
        .sort((a, b) => a.timestamp - b.timestamp),
    [
      event.announcementDate,
      event.awardCeremonyDate,
      event.demoDayDate,
      event.eventEnd,
      event.eventStart,
      event.registrationEnd,
      event.registrationStart,
      event.reviewEnd,
      event.reviewStart,
      event.submissionDeadline,
      t,
    ],
  );

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900">{t("title")}</h3>
      <div className="relative ml-3 space-y-8 border-l-2 border-gray-200 pb-2">
        {timelineItems.map((item) => {
          const itemTime = new Date(item.date!).getTime();
          const isPast = itemTime < now;

          return (
            <div key={item.key} className="relative pl-8">
              <div
                className={cn(
                  "absolute -left-[9px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white",
                  isPast
                    ? "border-green-500 text-green-500"
                    : "border-gray-300 text-gray-300",
                )}
              >
                {isPast ? (
                  <CheckCircle2 className="h-3 w-3 fill-green-50" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isPast ? "text-gray-900" : "text-gray-500",
                  )}
                >
                  {item.label}
                </span>
                <span className="font-mono text-xs text-gray-500">
                  {formatDateTime(item.date, locale)}
                </span>
              </div>
            </div>
          );
        })}
        {timelineItems.length === 0 && (
          <p className="pl-4 text-sm italic text-gray-500">{t("noDetails")}</p>
        )}
      </div>
    </div>
  );
}
