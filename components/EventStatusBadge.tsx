"use client";

import { EventStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface EventStatusBadgeProps {
    status: EventStatus;
    className?: string;
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
    const t = useTranslations('eventStatus');

    const getStatusStyles = (s: EventStatus) => {
        switch (s) {
            case "Upcoming":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "OpenForRegistration":
                return "bg-green-100 text-green-800 border-green-200";
            case "RegistrationClosed":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Ongoing":
                return "bg-purple-100 text-purple-800 border-purple-200 animate-pulse";
            case "InReview":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "Completed":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "Cancelled":
                return "bg-red-100 text-red-800 border-red-200";
            case "Postponed":
                return "bg-red-100 text-red-800 border-red-200 font-bold";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const badgeClass = getStatusStyles(status);

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                badgeClass,
                className
            )}
        >
            {t(status)}
        </span>
    );
}
