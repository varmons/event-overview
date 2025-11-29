"use client";

import Link from "next/link";
import { Event } from "@/types";
import { EventStatusBadge } from "./EventStatusBadge";
import { Calendar, MapPin, Building2 } from "lucide-react";
import { formatDate } from "@/lib/event-utils";
import { useLocale, useTranslations } from "next-intl";

export function EventCard({ event }: { event: Event }) {
    const locale = useLocale();
    const tLocation = useTranslations("locationTypes");
    const tEventTypes = useTranslations("eventTypes");
    const tVendors = useTranslations("vendors");
    const tDetail = useTranslations("eventDetail");
    const tCommon = useTranslations("common");
    const knownVendors = [
        "Tencent",
        "Alibaba",
        "ByteDance",
        "Huawei Cloud",
        "Google",
        "Amazon",
        "Other",
    ];

    const vendorLabel =
        event.vendor && knownVendors.includes(event.vendor)
            ? tVendors(event.vendor)
            : event.vendor || tVendors("Other");

    return (
        <Link
            href={`/${locale}/events/${event.id}`}
            className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:border-blue-200"
        >
            <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                {event.posterUrl ? (
                    <img
                        src={event.posterUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        <span className="text-sm">{tDetail("noPoster")}</span>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <EventStatusBadge status={event.status} />
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {tEventTypes(event.eventType)}
                        </span>
                        <span className="text-gray-300">{"\u2022"}</span>
                        <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {vendorLabel}
                        </span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                        {event.title}
                    </h3>
                    {event.subtitle && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {event.subtitle}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                            {event.eventStart ? formatDate(event.eventStart, locale) : tCommon("tbd")}
                            {event.eventEnd && ` - ${formatDate(event.eventEnd, locale)}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>
                            {tLocation(event.locationType)}
                            {event.locationDetail && ` - ${event.locationDetail}`}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
