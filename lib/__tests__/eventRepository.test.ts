import { describe, it, expect } from "vitest";
import { mapRowToEvent, mapEventToRow, type EventRow } from "../eventRepository";
import { type Event } from "../../types";

describe("eventRepository mappers", () => {
    it("converts database rows into domain events", () => {
        const row: EventRow = {
            id: "evt_123",
            title: "Sample Event",
            subtitle: null,
            description: "An example event",
            event_type: "Meetup",
            vendor: null,
            tags: ["sample"],
            location_type: "Online",
            location_detail: null,
            poster_url: null,
            registration_start: null,
            registration_end: null,
            event_start: "2025-01-10T10:00:00.000Z",
            event_end: "2025-01-10T12:00:00.000Z",
            submission_deadline: null,
            review_start: null,
            review_end: null,
            announcement_date: null,
            demo_day_date: null,
            award_ceremony_date: null,
            status: "Upcoming",
            is_postponed: null,
            original_event_start: null,
            original_event_end: null,
            postponed_reason: null,
            organizer_name: "Sample Org",
            organizer_type: "Organization",
            organizer_avatar_url: null,
            organizer_contact: null,
            registration_url: null,
            official_site_url: null,
            livestream_url: null,
            recording_url: null,
            created_at: "2024-12-01T00:00:00.000Z",
            updated_at: "2024-12-01T00:00:00.000Z",
        };

        const event = mapRowToEvent(row);

        expect(event).toMatchObject({
            id: "evt_123",
            title: "Sample Event",
            subtitle: undefined,
            tags: ["sample"],
            locationDetail: undefined,
            posterUrl: undefined,
            status: "Upcoming",
            isPostponed: false,
            createdAt: "2024-12-01T00:00:00.000Z",
        });
    });

    it("converts domain events into insertable rows", () => {
        const now = "2024-12-02T00:00:00.000Z";
        const event: Event = {
            id: "evt_456",
            title: "Another Event",
            subtitle: "Sub",
            description: "Details",
            eventType: "Hackathon",
            vendor: "Tencent",
            tags: ["hack"],
            locationType: "Hybrid",
            locationDetail: "Shenzhen",
            posterUrl: "https://example.com/poster.png",
            registrationStart: "2024-12-05T00:00:00.000Z",
            registrationEnd: "2024-12-09T00:00:00.000Z",
            eventStart: "2024-12-10T00:00:00.000Z",
            eventEnd: "2024-12-12T00:00:00.000Z",
            submissionDeadline: undefined,
            reviewStart: undefined,
            reviewEnd: undefined,
            announcementDate: undefined,
            demoDayDate: undefined,
            awardCeremonyDate: undefined,
            status: "OpenForRegistration",
            isPostponed: false,
            originalEventStart: undefined,
            originalEventEnd: undefined,
            postponedReason: undefined,
            organizerName: "Org",
            organizerType: "Community",
            organizerAvatarUrl: undefined,
            organizerContact: undefined,
            registrationUrl: "https://register",
            officialSiteUrl: undefined,
            livestreamUrl: undefined,
            recordingUrl: undefined,
            createdAt: now,
            updatedAt: now,
        };

        const row = mapEventToRow(event);

        expect(row).toMatchObject({
            id: "evt_456",
            title: "Another Event",
            event_type: "Hackathon",
            tags: ["hack"],
            location_type: "Hybrid",
            location_detail: "Shenzhen",
            poster_url: "https://example.com/poster.png",
            registration_start: "2024-12-05T00:00:00.000Z",
            status: "OpenForRegistration",
            created_at: now,
            updated_at: now,
        });
    });
});
