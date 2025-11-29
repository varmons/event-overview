import { Event } from "@/types";
import { formatDateTime } from "@/lib/event-utils";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

interface EventTimelineProps {
    event: Event;
}

export function EventTimeline({ event }: EventTimelineProps) {
    const locale = useLocale();
    const t = useTranslations("eventDetail.timeline");
    const now = new Date().getTime();

    const timelineItems = [
        {
            label: t("registrationOpens"),
            date: event.registrationStart,
            key: "regStart",
        },
        {
            label: t("registrationCloses"),
            date: event.registrationEnd,
            key: "regEnd",
        },
        {
            label: t("eventStarts"),
            date: event.eventStart,
            key: "evtStart",
        },
        {
            label: t("eventEnds"),
            date: event.eventEnd,
            key: "evtEnd",
        },
        {
            label: t("submissionDeadline"),
            date: event.submissionDeadline,
            key: "subDeadline",
        },
        {
            label: t("reviewStarts"),
            date: event.reviewStart,
            key: "revStart",
        },
        {
            label: t("reviewEnds"),
            date: event.reviewEnd,
            key: "revEnd",
        },
        {
            label: t("announcement"),
            date: event.announcementDate,
            key: "announce",
        },
        {
            label: t("demoDay"),
            date: event.demoDayDate,
            key: "demo",
        },
        {
            label: t("awardCeremony"),
            date: event.awardCeremonyDate,
            key: "award",
        },
    ]
        .filter((item) => item.date) // Only show items with dates
        .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()); // Sort chronologically

    return (
        <div className="space-y-6">
            <h3 className="font-semibold text-gray-900">{t("title")}</h3>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-2">
                {timelineItems.map((item) => {
                    const itemTime = new Date(item.date!).getTime();
                    const isPast = itemTime < now;

                    return (
                        <div key={item.key} className="relative pl-8">
                            <div
                                className={cn(
                                    "absolute -left-[9px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white",
                                    isPast
                                        ? "border-green-500 text-green-500"
                                        : "border-gray-300 text-gray-300"
                                )}
                            >
                                {isPast ? (
                                    <CheckCircle2 className="w-3 h-3 fill-green-50" />
                                ) : (
                                    <Circle className="w-3 h-3" />
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                <span
                                    className={cn(
                                        "text-sm font-medium",
                                        isPast ? "text-gray-900" : "text-gray-500"
                                    )}
                                >
                                    {item.label}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">
                                    {formatDateTime(item.date, locale)}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {timelineItems.length === 0 && (
                    <p className="text-sm text-gray-500 pl-4 italic">
                        {t("noDetails")}
                    </p>
                )}
            </div>
        </div>
    );
}
