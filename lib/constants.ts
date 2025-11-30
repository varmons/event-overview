/**
 * @fileoverview Application constants and enumerations.
 * Centralized location for all app-wide constants.
 */

import {
  type Vendor,
  type EventType,
  type LocationType,
  type OrganizerType,
  type EventStatus,
} from "@/types";

// =============================================================================
// Event Types
// =============================================================================

/** All supported event types */
export const EVENT_TYPES: EventType[] = [
  "Meetup",
  "Hackathon",
  "Competition",
  "Workshop",
  "Webinar",
  "Other",
];

// =============================================================================
// Vendors
// =============================================================================

/** Known vendor/platform providers */
export const KNOWN_VENDORS: Vendor[] = [
  "Tencent",
  "Alibaba",
  "ByteDance",
  "Huawei Cloud",
  "Google",
  "Amazon",
  "Other",
];

// =============================================================================
// Location Types
// =============================================================================

/** All supported location types */
export const LOCATION_TYPES: LocationType[] = ["Online", "Offline", "Hybrid"];

// =============================================================================
// Organizer Types
// =============================================================================

/** All supported organizer types */
export const ORGANIZER_TYPES: OrganizerType[] = [
  "Individual",
  "Organization",
  "Community",
];

// =============================================================================
// Event Statuses
// =============================================================================

/** All possible event statuses */
export const EVENT_STATUSES: EventStatus[] = [
  "Upcoming",
  "OpenForRegistration",
  "RegistrationClosed",
  "Ongoing",
  "InReview",
  "Completed",
  "Cancelled",
  "Postponed",
];

/** Statuses considered as "active" (non-historical) */
export const ACTIVE_EVENT_STATUSES: EventStatus[] = [
  "Upcoming",
  "OpenForRegistration",
  "RegistrationClosed",
  "Ongoing",
  "InReview",
  "Postponed",
];

/** Statuses considered as "historical" */
export const HISTORICAL_EVENT_STATUSES: EventStatus[] = [
  "Completed",
  "Cancelled",
];

// =============================================================================
// Pagination
// =============================================================================

/** Default page size for event lists */
export const DEFAULT_PAGE_SIZE = 12;

/** Maximum page size allowed */
export const MAX_PAGE_SIZE = 50;

// =============================================================================
// Storage Keys
// =============================================================================

/** localStorage key for event data cache */
export const EVENT_CACHE_STORAGE_KEY = "event-overview-data";

// =============================================================================
// Limits
// =============================================================================

/** Maximum poster file size in bytes (2MB) */
export const MAX_POSTER_SIZE = 2 * 1024 * 1024;

/** Allowed image MIME types for posters */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
