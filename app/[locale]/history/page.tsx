/**
 * @fileoverview Historical events page with pagination.
 * Displays completed and cancelled events.
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";

import { useEventStore } from "@/lib/store";
import { EventCard } from "@/components/EventCard";
import {
  getHistoricalEventsPaginated,
  getEventStats,
} from "@/lib/eventFilters";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export default function HistoryPage() {
  const { events, isLoading } = useEventStore();
  const t = useTranslations("history");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  // Memoize paginated results
  const paginatedEvents = useMemo(
    () => getHistoricalEventsPaginated(events, page, pageSize),
    [events, page, pageSize]
  );

  // Memoize stats
  const stats = useMemo(() => getEventStats(events), [events]);

  // Navigation handlers
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const nextPage = useCallback(() => {
    if (paginatedEvents.hasMore) {
      goToPage(page + 1);
    }
  }, [paginatedEvents.hasMore, page, goToPage]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1);
    }
  }, [page, goToPage]);

  // Loading state
  if (isLoading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <div className="h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/${locale}`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← {tCommon("back")}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <History className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("title")}
              </h1>
              <p className="text-gray-500 mt-1">
                {t("description", { count: stats.historical })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {paginatedEvents.total === 0 ? (
          <div className="text-center py-16">
            <History className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">
              {t("empty.title")}
            </h2>
            <p className="text-gray-500 mt-2">{t("empty.description")}</p>
          </div>
        ) : (
          <>
            {/* Event Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.items.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {paginatedEvents.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {tCommon("previous")}
                </button>

                <span className="text-sm text-gray-600">
                  {t("pagination", {
                    current: page,
                    total: paginatedEvents.totalPages,
                  })}
                </span>

                <button
                  onClick={nextPage}
                  disabled={!paginatedEvents.hasMore}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {tCommon("next")}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="mt-6 text-center text-sm text-gray-500">
              {t("showing", {
                start: (page - 1) * pageSize + 1,
                end: Math.min(page * pageSize, paginatedEvents.total),
                total: paginatedEvents.total,
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
