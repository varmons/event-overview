"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calendar, MapPin, Building2 } from "lucide-react";
import Image from "next/image";
import { Event, Vendor } from "@/types";
import { EventStatusBadge } from "./EventStatusBadge";
import { formatDate } from "@/lib/event-utils";
import { KNOWN_VENDORS } from "@/lib/constants";

// =============================================================================
// Types
// =============================================================================

interface EventCardProps {
  /** Event data to display */
  event: Event;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Event card component for the home feed
 * @description Displays event poster, title, status, dates, and location
 */
function EventCardComponent({ event }: EventCardProps) {
  const locale = useLocale();
  const tLocation = useTranslations("locationTypes");
  const tEventTypes = useTranslations("eventTypes");
  const tVendors = useTranslations("vendors");
  const tDetail = useTranslations("eventDetail");
  const tCommon = useTranslations("common");

  const vendorLabel = useMemo(() => {
    if (!event.vendor) return tVendors("Other");
    
    // Type guard to ensure vendor is of type Vendor
    const vendor = event.vendor;
    if (KNOWN_VENDORS.includes(vendor as Vendor)) {
      return tVendors(vendor as Vendor);
    }
    
    return vendor || tVendors("Other");
  }, [event.vendor, tVendors]);

  const dateText = useMemo(() => {
    const start = event.eventStart
      ? formatDate(event.eventStart, locale)
      : tCommon("tbd");
    const end = event.eventEnd
      ? ` - ${formatDate(event.eventEnd, locale)}`
      : "";
    return `${start}${end}`;
  }, [event.eventEnd, event.eventStart, locale, tCommon]);

  return (
    <Link
      href={`/${locale}/events/${event.id}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:border-blue-200"
    >
      <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
        {event.posterUrl ? (
          <Image
            src={event.posterUrl}
            alt={event.title}
            width={400}
            height={225}
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
            <span>{dateText}</span>
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

export const EventCard = memo(
  EventCardComponent,
  (prev, next) =>
    prev.event.id === next.event.id &&
    prev.event.updatedAt === next.event.updatedAt,
);
