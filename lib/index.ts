// =============================================================================
// Library Exports
// =============================================================================
// This file provides a single entry point for all library utilities.
// Grouped by functionality for better organization and discoverability.
// =============================================================================

// -----------------------------------------------------------------------------
// State Management
// -----------------------------------------------------------------------------
// React Context-based event store with localStorage caching
export { EventProvider, useEventStore } from "./store";

// Zustand-based event store (alternative, more performant)
export {
  useEventStoreZustand,
  selectEvents,
  selectIsLoading,
  selectIsSyncing,
  selectError,
  selectEventsByStatus,
  selectUpcomingEvents,
} from "./eventStore";

// -----------------------------------------------------------------------------
// Data Access Layer
// -----------------------------------------------------------------------------
// Supabase CRUD operations and data mapping
export {
  listEvents,
  getEventById,
  createEventRecord,
  mapRowToEvent,
  mapEventToRow,
  type EventRow,
  type CreateEventInput,
} from "./eventRepository";

export {
  supabaseClient,
  getSupabaseClient,
  isSupabaseReady,
} from "./supabaseClient";

export { uploadEventPoster } from "./storage";

// -----------------------------------------------------------------------------
// Business Logic
// -----------------------------------------------------------------------------
// Event status computation and date utilities
export {
  computeEventStatus,
  formatDate,
  formatDateTime,
  toIsoString,
  type DateInput,
} from "./event-utils";

// -----------------------------------------------------------------------------
// Authentication
// -----------------------------------------------------------------------------
// Password verification for submit form
export {
  verifySubmitPassword,
  isPasswordProtectionEnabled,
  SUBMIT_PASSWORD_STORAGE_KEY,
} from "./password";

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------
// General-purpose utilities
export { cn } from "./utils";

// -----------------------------------------------------------------------------
// Constants & Mock Data
// -----------------------------------------------------------------------------
export {
  EVENT_TYPES,
  KNOWN_VENDORS,
  LOCATION_TYPES,
  ORGANIZER_TYPES,
  EVENT_STATUSES,
  ACTIVE_EVENT_STATUSES,
  HISTORICAL_EVENT_STATUSES,
  EVENT_CACHE_STORAGE_KEY,
  MAX_POSTER_SIZE,
  ALLOWED_IMAGE_TYPES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "./constants";

// Event filtering and pagination
export {
  isActiveEvent,
  isHistoricalEvent,
  categorizeEvents,
  filterEvents,
  paginate,
  getActiveEventsPaginated,
  getHistoricalEventsPaginated,
  getEventStats,
  type PaginatedResult,
  type EventFilterOptions,
} from "./eventFilters";

// Timezone utilities
export {
  DEFAULT_TIMEZONE,
  LOCALE_TIMEZONE_MAP,
  detectTimezone,
  getTimezoneForLocale,
  formatDateWithTimezone,
  formatDateTimeWithTimezone,
  getCurrentTimeInTimezone,
  localToUTC,
  utcToLocalDisplay,
} from "./timezone";

export { MOCK_EVENTS } from "./mock-data";
