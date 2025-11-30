"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { EventStatusBadge } from "@/components/EventStatusBadge";
import { EventTimeline } from "@/components/EventTimeline";
import { formatDateTime } from "@/lib/event-utils";
import { KNOWN_VENDORS } from "@/lib/constants";
import { useEventStore } from "@/lib/store";
import {
  Calendar,
  MapPin,
  Building2,
  ArrowLeft,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { RegistrationCard } from "@/components/RegistrationCard";
import { OrganizerCard } from "@/components/OrganizerCard";
import { Vendor } from "@/types";
import Image from "next/image";

export default function EventDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const { getEventById, isLoading, isSyncing, error, refreshEvents } =
    useEventStore();
  const t = useTranslations("eventDetail");
  const tEventTypes = useTranslations("eventTypes");
  const tVendors = useTranslations("vendors");
  const tLocation = useTranslations("locationTypes");
  const tOrganizerTypes = useTranslations("organizerTypes");
  const tCommon = useTranslations("common");
  const tSupabase = useTranslations("supabase");

  const eventId = params.id as string | undefined;
  const event = eventId ? getEventById(eventId) : undefined;
  const showSkeleton = isLoading && !event;

  // Move all hooks to the top before any conditional returns
  const { isRegistrationClosed, isRegistrationOpen } =
    useMemo(() => {
      if (!event) {
        return {
          isRegistrationOpen: false,
          isRegistrationClosed: false,
        };
      }

      const now = new Date().getTime();
      const registrationStart = event.registrationStart
        ? new Date(event.registrationStart).getTime()
        : null;
      const registrationEnd = event.registrationEnd
        ? new Date(event.registrationEnd).getTime()
        : null;

      const isOpenForRegistration = event?.status === "OpenForRegistration";
      const isCancelled = event?.status === "Cancelled";
      const isPostponed = event?.status === "Postponed";
      const isRegistrationClosed = event?.status === "RegistrationClosed";
      const isCompleted = event?.status === "Completed";
      
      const open: boolean = Boolean(
        isOpenForRegistration ||
        (registrationStart &&
          registrationEnd &&
          now >= registrationStart &&
          now <= registrationEnd &&
          !isCancelled &&
          !isPostponed)
      );

      const closed: boolean = Boolean(
        isRegistrationClosed ||
        (registrationEnd && now > registrationEnd) ||
        isCompleted
      );

      return {
        isRegistrationOpen: Boolean(open),
        isRegistrationClosed: Boolean(closed),
      };
    }, [event]);

  const vendorLabel = useMemo(() => {
    if (!event?.vendor) return tVendors("Other");
    
    // Type guard to ensure vendor is of type Vendor
    const vendor = event.vendor;
    if (KNOWN_VENDORS.includes(vendor as Vendor)) {
      return tVendors(vendor as Vendor);
    }
    
    return vendor || tVendors("Other");
  }, [event, tVendors]);

  if (showSkeleton) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 w-full rounded-2xl bg-gray-200 animate-pulse" />
            <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="h-6 w-2/3 rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-full rounded bg-gray-50 animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-gray-50 animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-48 rounded-2xl bg-white p-4 border border-gray-100 space-y-3">
              <div className="h-5 w-1/3 rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-full rounded bg-gray-50 animate-pulse" />
              <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="h-56 rounded-2xl bg-white p-4 border border-gray-100 space-y-3">
              <div className="h-5 w-1/4 rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-full rounded bg-gray-50 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-gray-50 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md w-full space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            {error ? t("errorHeading") : t("eventNotFound")}
          </h1>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm text-gray-500">{t("missingDescription")}</p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={refreshEvents}
              disabled={isSyncing}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              {isSyncing
                ? tSupabase("syncingShort")
                : tSupabase("retrySupabase")}
            </button>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              <ArrowLeft className="w-4 h-4" /> {t("backToEvents")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> {t("backToEvents")}
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-900">
              {tSupabase("errorTitle")}
            </p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={refreshEvents}
              disabled={isSyncing}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              {isSyncing ? tSupabase("retrying") : tSupabase("retry")}
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="w-full bg-gray-100 relative">
                {event.posterUrl ? (
                  <Image
                    src={event.posterUrl}
                    alt={event.title}
                    width={800}
                    height={400}
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center text-gray-400 bg-gray-50">
                    <span className="text-lg">{t("noPoster")}</span>
                  </div>
                )}
                {event.posterUrl && (
                  <div className="absolute top-4 right-4">
                    <EventStatusBadge
                      status={event.status}
                      className="text-sm px-3 py-1 shadow-lg"
                    />
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                      {tEventTypes(event.eventType)}
                    </span>
                    <span className="text-gray-300">{"\u2022"}</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {vendorLabel}
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                    {event.title}
                  </h1>
                  {event.subtitle && (
                    <p className="text-xl text-gray-500 mt-2">
                      {event.subtitle}
                    </p>
                  )}
                </div>

                {event.isPostponed && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900">
                        {t("postponed.title")}
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        {event.postponedReason || t("postponed.defaultReason")}
                      </p>
                      {event.originalEventStart && (
                        <p className="text-sm text-red-700 mt-2">
                          {t("postponed.originalDate")}{" "}
                          <span className="line-through">
                            {formatDateTime(event.originalEventStart, locale)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">
                      {event.eventStart
                        ? formatDateTime(event.eventStart, locale)
                        : tCommon("tbd")}
                    </span>
                    {event.eventEnd && (
                      <span className="text-gray-500">
                        {" "}
                        - {formatDateTime(event.eventEnd, locale)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">
                      {tLocation(event.locationType)}
                    </span>
                    {event.locationDetail && (
                      <span className="text-gray-500">
                        ({event.locationDetail})
                      </span>
                    )}
                  </div>
                </div>

                <div className="prose prose-blue max-w-none pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("aboutEvent")}
                  </h3>
                  <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="uppercase tracking-wide text-xs text-gray-400">
                    {t("lastUpdated")}
                  </span>
                  <span>{formatDateTime(event.updatedAt, locale)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <RegistrationCard
              event={event}
              locale={locale}
              t={t}
              isRegistrationOpen={isRegistrationOpen}
              isRegistrationClosed={isRegistrationClosed}
            />

            {/* Organizer Card */}
            <OrganizerCard
              event={event}
              t={t}
              tOrganizerTypes={tOrganizerTypes}
            />

            {/* Timeline Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <EventTimeline event={event} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
