/**
 * @fileoverview Event filtering and categorization utilities.
 * Provides efficient functions for separating active and historical events.
 */

import { Event, EventStatus } from "@/types";
import {
  ACTIVE_EVENT_STATUSES,
  HISTORICAL_EVENT_STATUSES,
  DEFAULT_PAGE_SIZE,
} from "./constants";

// =============================================================================
// Types
// =============================================================================

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface EventFilterOptions {
  status?: EventStatus | "All";
  type?: string | "All";
  vendor?: string | "All";
  search?: string;
}

// =============================================================================
// Categorization Functions
// =============================================================================

/**
 * Check if an event is considered "active" (non-historical)
 * @param event - Event to check
 * @returns true if event is active
 */
export function isActiveEvent(event: Event): boolean {
  return ACTIVE_EVENT_STATUSES.includes(event.status);
}

/**
 * Check if an event is considered "historical"
 * @param event - Event to check
 * @returns true if event is historical (completed or cancelled)
 */
export function isHistoricalEvent(event: Event): boolean {
  return HISTORICAL_EVENT_STATUSES.includes(event.status);
}

/**
 * Separate events into active and historical categories
 * @param events - All events
 * @returns Object with active and historical event arrays
 */
export function categorizeEvents(events: Event[]): {
  active: Event[];
  historical: Event[];
} {
  const active: Event[] = [];
  const historical: Event[] = [];

  for (const event of events) {
    if (isHistoricalEvent(event)) {
      historical.push(event);
    } else {
      active.push(event);
    }
  }

  return { active, historical };
}

// =============================================================================
// Filtering Functions
// =============================================================================

/**
 * Filter events based on multiple criteria
 * @param events - Events to filter
 * @param options - Filter options
 * @returns Filtered events
 */
export function filterEvents(
  events: Event[],
  options: EventFilterOptions
): Event[] {
  let filtered = events;

  // Filter by status
  if (options.status && options.status !== "All") {
    filtered = filtered.filter((e) => e.status === options.status);
  }

  // Filter by event type
  if (options.type && options.type !== "All") {
    filtered = filtered.filter((e) => e.eventType === options.type);
  }

  // Filter by vendor
  if (options.vendor && options.vendor !== "All") {
    filtered = filtered.filter((e) => e.vendor === options.vendor);
  }

  // Filter by search query
  if (options.search) {
    const query = options.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
}

// =============================================================================
// Pagination Functions
// =============================================================================

/**
 * Paginate an array of items
 * @param items - Items to paginate
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @returns Paginated result
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const normalizedPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (normalizedPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: items.slice(startIndex, endIndex),
    total,
    page: normalizedPage,
    pageSize,
    totalPages,
    hasMore: normalizedPage < totalPages,
  };
}

/**
 * Get active events with pagination
 * @param events - All events
 * @param page - Page number
 * @param pageSize - Items per page
 * @returns Paginated active events
 */
export function getActiveEventsPaginated(
  events: Event[],
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginatedResult<Event> {
  const activeEvents = events.filter(isActiveEvent);
  // Sort by event start date (upcoming first)
  activeEvents.sort((a, b) => {
    const dateA = a.eventStart ? new Date(a.eventStart).getTime() : Infinity;
    const dateB = b.eventStart ? new Date(b.eventStart).getTime() : Infinity;
    return dateA - dateB;
  });
  return paginate(activeEvents, page, pageSize);
}

/**
 * Get historical events with pagination
 * @param events - All events
 * @param page - Page number
 * @param pageSize - Items per page
 * @returns Paginated historical events
 */
export function getHistoricalEventsPaginated(
  events: Event[],
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginatedResult<Event> {
  const historicalEvents = events.filter(isHistoricalEvent);
  // Sort by event end date (most recent first)
  historicalEvents.sort((a, b) => {
    const dateA = a.eventEnd ? new Date(a.eventEnd).getTime() : 0;
    const dateB = b.eventEnd ? new Date(b.eventEnd).getTime() : 0;
    return dateB - dateA;
  });
  return paginate(historicalEvents, page, pageSize);
}

// =============================================================================
// Statistics Functions
// =============================================================================

/**
 * Get event statistics
 * @param events - All events
 * @returns Statistics object
 */
export function getEventStats(events: Event[]): {
  total: number;
  active: number;
  historical: number;
  byStatus: Record<EventStatus, number>;
} {
  const byStatus = {} as Record<EventStatus, number>;
  let active = 0;
  let historical = 0;

  for (const event of events) {
    byStatus[event.status] = (byStatus[event.status] || 0) + 1;
    if (isActiveEvent(event)) {
      active++;
    } else {
      historical++;
    }
  }

  return {
    total: events.length,
    active,
    historical,
    byStatus,
  };
}
