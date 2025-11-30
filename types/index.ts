/**
 * @fileoverview Core type definitions for the Event Overview application.
 * All types are designed to be JSON-serializable for Supabase storage.
 */

/** Supported event types */
export type EventType =
  | "Meetup"
  | "Hackathon"
  | "Competition"
  | "Workshop"
  | "Webinar"
  | "Other";

/** Known vendor/platform providers */
export type Vendor =
  | "Tencent"
  | "Alibaba"
  | "ByteDance"
  | "Huawei Cloud"
  | "Google"
  | "Amazon"
  | "Other";

/**
 * Event lifecycle status
 * @description Status flow: Upcoming → OpenForRegistration → RegistrationClosed → Ongoing → InReview → Completed
 */
export type EventStatus =
  | "Upcoming"
  | "OpenForRegistration"
  | "RegistrationClosed"
  | "Ongoing"
  | "InReview"
  | "Completed"
  | "Cancelled"
  | "Postponed";

/** Event location type */
export type LocationType = "Online" | "Offline" | "Hybrid";

/** Organizer entity type */
export type OrganizerType = "Individual" | "Organization" | "Community";

/**
 * Core event data model
 * @description All date fields use ISO 8601 format strings
 */
export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  eventType: EventType;
  vendor?: Vendor | string;
  tags: string[];

  locationType: LocationType;
  locationDetail?: string;

  posterUrl?: string;

  // Timeline
  registrationStart?: string; // ISO date string
  registrationEnd?: string;
  eventStart?: string;
  eventEnd?: string;
  submissionDeadline?: string;
  reviewStart?: string;
  reviewEnd?: string;
  announcementDate?: string;
  demoDayDate?: string;
  awardCeremonyDate?: string;

  // Status & State
  status: EventStatus;
  isPostponed: boolean;
  originalEventStart?: string;
  originalEventEnd?: string;
  postponedReason?: string;

  // Organizer
  organizerName: string;
  organizerType: OrganizerType;
  organizerAvatarUrl?: string;
  organizerContact?: string;

  // Links
  registrationUrl?: string;
  officialSiteUrl?: string;
  livestreamUrl?: string;
  recordingUrl?: string;

  createdAt: string;
  updatedAt: string;
}
