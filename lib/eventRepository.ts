/**
 * @fileoverview Event data access layer for Supabase.
 * Handles CRUD operations and data mapping between domain and database models.
 */

import { type Event } from "@/types";
import { toIsoString } from "@/lib/event-utils";
import { getSupabaseClient } from "@/lib/supabaseClient";

// =============================================================================
// Constants
// =============================================================================

const TABLE_NAME = "events";
const supabase = getSupabaseClient();

// =============================================================================
// Utility Functions
// =============================================================================

/** Convert null to undefined (for domain model) */
const n2u = <T>(value: T | null): T | undefined => value ?? undefined;

/** Convert undefined to null (for database row) */
const u2n = <T>(value: T | undefined): T | null => value ?? null;

export type EventRow = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  event_type: Event["eventType"];
  vendor: string | null;
  tags: string[] | null;
  location_type: Event["locationType"];
  location_detail: string | null;
  poster_url: string | null;
  registration_start: string | null;
  registration_end: string | null;
  event_start: string | null;
  event_end: string | null;
  submission_deadline: string | null;
  review_start: string | null;
  review_end: string | null;
  announcement_date: string | null;
  demo_day_date: string | null;
  award_ceremony_date: string | null;
  status: Event["status"];
  is_postponed: boolean | null;
  original_event_start: string | null;
  original_event_end: string | null;
  postponed_reason: string | null;
  organizer_name: string;
  organizer_type: Event["organizerType"];
  organizer_avatar_url: string | null;
  organizer_contact: string | null;
  registration_url: string | null;
  official_site_url: string | null;
  livestream_url: string | null;
  recording_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateEventInput = Omit<Event, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

type InsertEventRow = Omit<EventRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

/** Map database row to domain Event model */
export function mapRowToEvent(row: EventRow): Event {
  return {
    // Required fields
    id: row.id,
    title: row.title,
    description: row.description,
    eventType: row.event_type,
    locationType: row.location_type,
    status: row.status,
    organizerName: row.organizer_name,
    organizerType: row.organizer_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: row.tags ?? [],
    isPostponed: Boolean(row.is_postponed),
    // Optional fields (null → undefined)
    subtitle: n2u(row.subtitle),
    vendor: n2u(row.vendor),
    locationDetail: n2u(row.location_detail),
    posterUrl: n2u(row.poster_url),
    registrationStart: n2u(row.registration_start),
    registrationEnd: n2u(row.registration_end),
    eventStart: n2u(row.event_start),
    eventEnd: n2u(row.event_end),
    submissionDeadline: n2u(row.submission_deadline),
    reviewStart: n2u(row.review_start),
    reviewEnd: n2u(row.review_end),
    announcementDate: n2u(row.announcement_date),
    demoDayDate: n2u(row.demo_day_date),
    awardCeremonyDate: n2u(row.award_ceremony_date),
    originalEventStart: n2u(row.original_event_start),
    originalEventEnd: n2u(row.original_event_end),
    postponedReason: n2u(row.postponed_reason),
    organizerAvatarUrl: n2u(row.organizer_avatar_url),
    organizerContact: n2u(row.organizer_contact),
    registrationUrl: n2u(row.registration_url),
    officialSiteUrl: n2u(row.official_site_url),
    livestreamUrl: n2u(row.livestream_url),
    recordingUrl: n2u(row.recording_url),
  };
}

/** Convert ISO date string helper */
const toIsoNull = (value?: string): string | null => u2n(toIsoString(value));

/** Map domain Event model to database row */
export function mapEventToRow(event: CreateEventInput): InsertEventRow {
  const id = event.id || crypto.randomUUID();
  const now = new Date().toISOString();

  return {
    // Required fields
    id,
    title: event.title,
    description: event.description,
    event_type: event.eventType,
    location_type: event.locationType,
    status: event.status,
    organizer_name: event.organizerName,
    organizer_type: event.organizerType,
    created_at: event.createdAt ?? now,
    updated_at: event.updatedAt ?? now,
    tags: event.tags ?? [],
    is_postponed: event.isPostponed ?? false,
    // Optional fields (undefined → null)
    subtitle: u2n(event.subtitle),
    vendor: u2n(event.vendor),
    location_detail: u2n(event.locationDetail),
    poster_url: u2n(event.posterUrl),
    postponed_reason: u2n(event.postponedReason),
    organizer_avatar_url: u2n(event.organizerAvatarUrl),
    organizer_contact: u2n(event.organizerContact),
    registration_url: u2n(event.registrationUrl),
    official_site_url: u2n(event.officialSiteUrl),
    livestream_url: u2n(event.livestreamUrl),
    recording_url: u2n(event.recordingUrl),
    // Date fields (normalize to ISO string)
    registration_start: toIsoNull(event.registrationStart),
    registration_end: toIsoNull(event.registrationEnd),
    event_start: toIsoNull(event.eventStart),
    event_end: toIsoNull(event.eventEnd),
    submission_deadline: toIsoNull(event.submissionDeadline),
    review_start: toIsoNull(event.reviewStart),
    review_end: toIsoNull(event.reviewEnd),
    announcement_date: toIsoNull(event.announcementDate),
    demo_day_date: toIsoNull(event.demoDayDate),
    award_ceremony_date: toIsoNull(event.awardCeremonyDate),
    original_event_start: toIsoNull(event.originalEventStart),
    original_event_end: toIsoNull(event.originalEventEnd),
  };
}

export async function listEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("event_start", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  const rows = (data ?? []) as EventRow[];
  return rows.map(mapRowToEvent);
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch event ${id}: ${error.message}`);
  }

  const row = data as EventRow | null;
  return row ? mapRowToEvent(row) : undefined;
}

export async function createEventRecord(
  event: CreateEventInput,
): Promise<Event> {
  const row = mapEventToRow(event);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }

  const insertedRow = data as EventRow;
  return mapRowToEvent(insertedRow);
}
