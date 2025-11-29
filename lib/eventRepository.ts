import { type Event } from "@/types";
import { getSupabaseClient } from "@/lib/supabaseClient";

const TABLE_NAME = "events";

const supabase = getSupabaseClient();

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

export function mapRowToEvent(row: EventRow): Event {
    return {
        id: row.id,
        title: row.title,
        subtitle: row.subtitle ?? undefined,
        description: row.description,
        eventType: row.event_type,
        vendor: row.vendor ?? undefined,
        tags: row.tags ?? [],
        locationType: row.location_type,
        locationDetail: row.location_detail ?? undefined,
        posterUrl: row.poster_url ?? undefined,
        registrationStart: row.registration_start ?? undefined,
        registrationEnd: row.registration_end ?? undefined,
        eventStart: row.event_start ?? undefined,
        eventEnd: row.event_end ?? undefined,
        submissionDeadline: row.submission_deadline ?? undefined,
        reviewStart: row.review_start ?? undefined,
        reviewEnd: row.review_end ?? undefined,
        announcementDate: row.announcement_date ?? undefined,
        demoDayDate: row.demo_day_date ?? undefined,
        awardCeremonyDate: row.award_ceremony_date ?? undefined,
        status: row.status,
        isPostponed: Boolean(row.is_postponed),
        originalEventStart: row.original_event_start ?? undefined,
        originalEventEnd: row.original_event_end ?? undefined,
        postponedReason: row.postponed_reason ?? undefined,
        organizerName: row.organizer_name,
        organizerType: row.organizer_type,
        organizerAvatarUrl: row.organizer_avatar_url ?? undefined,
        organizerContact: row.organizer_contact ?? undefined,
        registrationUrl: row.registration_url ?? undefined,
        officialSiteUrl: row.official_site_url ?? undefined,
        livestreamUrl: row.livestream_url ?? undefined,
        recordingUrl: row.recording_url ?? undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function mapEventToRow(event: CreateEventInput): InsertEventRow {
    const baseId = event.id || crypto.randomUUID();
    return {
        id: baseId,
        title: event.title,
        subtitle: event.subtitle ?? null,
        description: event.description,
        event_type: event.eventType,
        vendor: event.vendor ?? null,
        tags: event.tags ?? [],
        location_type: event.locationType,
        location_detail: event.locationDetail ?? null,
        poster_url: event.posterUrl ?? null,
        registration_start: event.registrationStart ?? null,
        registration_end: event.registrationEnd ?? null,
        event_start: event.eventStart ?? null,
        event_end: event.eventEnd ?? null,
        submission_deadline: event.submissionDeadline ?? null,
        review_start: event.reviewStart ?? null,
        review_end: event.reviewEnd ?? null,
        announcement_date: event.announcementDate ?? null,
        demo_day_date: event.demoDayDate ?? null,
        award_ceremony_date: event.awardCeremonyDate ?? null,
        status: event.status,
        is_postponed: event.isPostponed ?? false,
        original_event_start: event.originalEventStart ?? null,
        original_event_end: event.originalEventEnd ?? null,
        postponed_reason: event.postponedReason ?? null,
        organizer_name: event.organizerName,
        organizer_type: event.organizerType,
        organizer_avatar_url: event.organizerAvatarUrl ?? null,
        organizer_contact: event.organizerContact ?? null,
        registration_url: event.registrationUrl ?? null,
        official_site_url: event.officialSiteUrl ?? null,
        livestream_url: event.livestreamUrl ?? null,
        recording_url: event.recordingUrl ?? null,
        created_at: event.createdAt ?? new Date().toISOString(),
        updated_at: event.updatedAt ?? new Date().toISOString(),
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

export async function createEventRecord(event: CreateEventInput): Promise<Event> {
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
