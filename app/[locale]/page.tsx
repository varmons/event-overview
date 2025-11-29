"use client";

import { useState, useMemo } from "react";
import { useEventStore } from "@/lib/store";
import { EventCard } from "@/components/EventCard";
import { EventType, Vendor, EventStatus } from "@/types";
import { Search, Filter, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Home() {
  const { events, isLoading, isSyncing, error, refreshEvents } = useEventStore();
  const t = useTranslations("home");
  const tEventTypes = useTranslations("eventTypes");
  const tVendors = useTranslations("vendors");
  const tStatus = useTranslations("eventStatus");
  const tSupabase = useTranslations("supabase");
  const vendorFilters: Vendor[] = [
    "Tencent",
    "Alibaba",
    "ByteDance",
    "Huawei Cloud",
    "Google",
    "Amazon",
    "Other",
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | "All">("All");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | "All">("All");

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Search filter
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.organizerName.toLowerCase().includes(query) ||
          event.tags.some((tag) => tag.toLowerCase().includes(query));

        if (!matchesSearch) return false;

        // Type filter
        if (selectedType !== "All" && event.eventType !== selectedType) return false;

        // Vendor filter
        if (selectedVendor !== "All") {
          const vendorKey =
            event.vendor && vendorFilters.includes(event.vendor as Vendor)
              ? (event.vendor as Vendor)
              : "Other";
          if (vendorKey !== selectedVendor) return false;
        }

        // Status filter
        if (selectedStatus !== "All" && event.status !== selectedStatus) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort by event start fallback to createdAt
        const dateA = a.eventStart
          ? new Date(a.eventStart).getTime()
          : new Date(a.createdAt).getTime();
        const dateB = b.eventStart
          ? new Date(b.eventStart).getTime()
          : new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
  }, [events, searchQuery, selectedType, selectedVendor, selectedStatus]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedVendor("All");
    setSelectedStatus("All");
  };

  const showSkeleton = isLoading && events.length === 0;
  const showEmptyState = !isLoading && filteredEvents.length === 0;

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
            <p className="text-sm font-semibold text-red-900">{tSupabase("errorTitle")}</p>
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
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

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
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">{t("filters.type")}</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as EventType | "All")}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">{t("filters.allTypes")}</option>
                  <option value="Meetup">{tEventTypes("Meetup")}</option>
                  <option value="Hackathon">{tEventTypes("Hackathon")}</option>
                  <option value="Competition">{tEventTypes("Competition")}</option>
                  <option value="Workshop">{tEventTypes("Workshop")}</option>
                  <option value="Webinar">{tEventTypes("Webinar")}</option>
                  <option value="Other">{tEventTypes("Other")}</option>
                </select>
              </div>

              {/* Vendor Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">{t("filters.vendor")}</label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value as Vendor | "All")}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">{t("filters.allVendors")}</option>
                  {vendorFilters.map((vendor) => (
                    <option key={vendor} value={vendor}>
                      {tVendors(vendor)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">{t("filters.status")}</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as EventStatus | "All")}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">{t("filters.allStatuses")}</option>
                  <option value="Upcoming">{tStatus("Upcoming")}</option>
                  <option value="OpenForRegistration">{tStatus("OpenForRegistration")}</option>
                  <option value="Ongoing">{tStatus("Ongoing")}</option>
                  <option value="InReview">{tStatus("InReview")}</option>
                  <option value="Completed">{tStatus("Completed")}</option>
                  <option value="Postponed">{tStatus("Postponed")}</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Event Grid */}
          <main className="flex-1">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-gray-500">
                {isSyncing && <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
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
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
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
                <div className="mt-6">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t("filters.clear")}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
