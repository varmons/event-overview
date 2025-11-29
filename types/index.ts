export type EventType =
    | "Meetup"
    | "Hackathon"
    | "Competition"
    | "Workshop"
    | "Webinar"
    | "Other";

export type Vendor =
    | "Tencent"
    | "Alibaba"
    | "ByteDance"
    | "Huawei Cloud"
    | "Google"
    | "Amazon"
    | "Other";

export type EventStatus =
    | "Upcoming"
    | "OpenForRegistration"
    | "RegistrationClosed"
    | "Ongoing"
    | "InReview"
    | "Completed"
    | "Cancelled"
    | "Postponed";

export type LocationType = "Online" | "Offline" | "Hybrid";

export type OrganizerType = "Individual" | "Organization" | "Community";

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
