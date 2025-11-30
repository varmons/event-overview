/**
 * @fileoverview Home page showing active events with pagination.
 * Historical events are moved to a separate page for better performance.
 */

"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { useEventStore } from "@/lib/store";
import { EventCard } from "@/components/EventCard";
import { EventType, Vendor, EventStatus } from "@/types";
import { Search, Filter, X, History, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { InputField, SelectField } from "@/components/FormControls";
import { KNOWN_VENDORS, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { isActiveEvent, paginate, getEventStats } from "@/lib/eventFilters";

// Memoized EventCard for better performance
const MemoizedEventCard = memo(EventCard);

export default function Home() {
  const { events, isLoading, isSyncing, error, refreshEvents } = useEventStore();
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tEventTypes = useTranslations("eventTypes");
  const tVendors = useTranslations("vendors");
  const tStatus = useTranslations("eventStatus");
  const tSupabase = useTranslations("supabase");
  const locale = useLocale();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | "All">("All");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | "All">("All");
  const [page, setPage] = useState(1);

  // Get only active events (filter out historical)
  const activeEvents = useMemo(
    () => events.filter(isActiveEvent),
    [events]
  );

  // Apply filters
  const filteredEvents = useMemo(() => {
    let result = activeEvents;

    // Filter by status (only active statuses)
    if (selectedStatus !== "All") {
      result = result.filter((e) => e.status === selectedStatus);
    }

    // Filter by type
    if (selectedType !== "All") {
      result = result.filter((e) => e.eventType === selectedType);
    }

    // Filter by vendor
    if (selectedVendor !== "All") {
      result = result.filter((e) => e.vendor === selectedVendor);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort by event start date
    return result.sort((a, b) => {
      const dateA = a.eventStart ? new Date(a.eventStart).getTime() : Infinity;
      const dateB = b.eventStart ? new Date(b.eventStart).getTime() : Infinity;
      return dateA - dateB;
    });
  }, [activeEvents, selectedStatus, selectedType, selectedVendor, searchQuery]);

  // Paginate results
  const paginatedEvents = useMemo(
    () => paginate(filteredEvents, page, DEFAULT_PAGE_SIZE),
    [filteredEvents, page]
  );

  // Event stats
  const stats = useMemo(() => getEventStats(events), [events]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedVendor("All");
    setSelectedStatus("All");
    setPage(1);
  }, []);

  const hasFilters = searchQuery || selectedType !== "All" || selectedVendor !== "All" || selectedStatus !== "All";
  const showSkeleton = isLoading && events.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero / Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            {t("hero.title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            {t("hero.subtitle")}
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <span className="flex h-2 w-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </span>
              {tSupabase("badge")}
            </span>
            <span className="text-gray-500">
              {isSyncing ? tSupabase("syncing") : tSupabase("synced")}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-900">
              {tSupabase("errorTitle")}
            </p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={refreshEvents}
              disabled={isSyncing}
              className="mt-3 inline-flex items-center rounded-md border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSyncing ? tSupabase("retrying") : tSupabase("retry")}
            </button>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <InputField
              label={t("search.button")}
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              rightSlot={<Search className="w-4 h-4" />}
            />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> {t("filters.title")}
                </h3>
                {(selectedType !== "All" ||
                  selectedVendor !== "All" ||
                  selectedStatus !== "All" ||
                  searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> {t("filters.clear")}
                  </button>
                )}
              </div>

              {/* Event Type Filter */}
              <SelectField
                label={t("filters.type")}
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value as EventType | "All")
                }
                options={[
                  { value: "All", label: t("filters.allTypes") },
                  { value: "Meetup", label: tEventTypes("Meetup") },
                  { value: "Hackathon", label: tEventTypes("Hackathon") },
                  { value: "Competition", label: tEventTypes("Competition") },
                  { value: "Workshop", label: tEventTypes("Workshop") },
                  { value: "Webinar", label: tEventTypes("Webinar") },
                  { value: "Other", label: tEventTypes("Other") },
                ]}
              />

              {/* Vendor Filter */}
              <SelectField
                label={t("filters.vendor")}
                value={selectedVendor}
                onChange={(e) =>
                  setSelectedVendor(e.target.value as Vendor | "All")
                }
                options={[
                  { value: "All", label: t("filters.allVendors") },
                  ...KNOWN_VENDORS.map((vendor) => ({
                    value: vendor,
                    label: tVendors(vendor),
                  })),
                ]}
              />

              {/* Status Filter (only active statuses) */}
              <SelectField
                label={t("filters.status")}
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as EventStatus | "All")
                }
                options={[
                  { value: "All", label: t("filters.allStatuses") },
                  { value: "Upcoming", label: tStatus("Upcoming") },
                  { value: "OpenForRegistration", label: tStatus("OpenForRegistration") },
                  { value: "RegistrationClosed", label: tStatus("RegistrationClosed") },
                  { value: "Ongoing", label: tStatus("Ongoing") },
                  { value: "InReview", label: tStatus("InReview") },
                  { value: "Postponed", label: tStatus("Postponed") },
                ]}
              />

              {/* Link to History Page */}
              {stats.historical > 0 && (
                <Link
                  href={`/${locale}/history`}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm text-gray-700"
                >
                  <History className="w-4 h-4" />
                  <span>历史活动 ({stats.historical})</span>
                </Link>
              )}
            </div>
          </aside>

          {/* Event Grid */}
          <main className="flex-1">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-gray-500">
                {isSyncing && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                )}
                {t("resultsCount", { count: filteredEvents.length })}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>
                  {isSyncing ? tSupabase("refreshing") : tSupabase("snapshot")}
                </span>
                <button
                  onClick={refreshEvents}
                  disabled={isSyncing}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {tSupabase("refresh")}
                </button>
              </div>
            </div>

            {showSkeleton ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-64 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="h-32 w-full rounded-lg bg-gray-200 animate-pulse" />
                    <div className="mt-4 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                      <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
                      <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedEvents.total > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedEvents.items.map((event) => (
                    <MemoizedEventCard key={event.id} event={event} />
                  ))}
                </div>

                {/* Pagination */}
                {paginatedEvents.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {tCommon("previous")}
                    </button>

                    <span className="text-sm text-gray-600">
                      {page} / {paginatedEvents.totalPages}
                    </span>

                    <button
                      onClick={() => setPage((p) => Math.min(paginatedEvents.totalPages, p + 1))}
                      disabled={!paginatedEvents.hasMore}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {tCommon("next")}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <Search className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t("noResults.title")}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t("noResults.description")}
                </p>
                {hasFilters && (
                  <div className="mt-6">
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t("filters.clear")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
