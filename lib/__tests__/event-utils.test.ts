import { describe, it, expect } from "vitest";
import {
  computeEventStatus,
  formatDate,
  formatDateTime,
  toIsoString,
} from "../event-utils";
import { Event } from "../../types";

// Helper to create a minimal event object
const createEvent = (overrides: Partial<Event> = {}): Event => ({
  id: "test-1",
  title: "Test Event",
  description: "Test description",
  eventType: "Meetup",
  tags: [],
  locationType: "Online",
  status: "Upcoming",
  isPostponed: false,
  organizerName: "Test Org",
  organizerType: "Organization",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

describe("toIsoString", () => {
  it("converts Date object to ISO string", () => {
    const date = new Date("2024-06-15T10:30:00.000Z");
    expect(toIsoString(date)).toBe("2024-06-15T10:30:00.000Z");
  });

  it("converts date string to ISO string", () => {
    const result = toIsoString("2024-06-15T10:30:00.000Z");
    expect(result).toBe("2024-06-15T10:30:00.000Z");
  });

  it("returns undefined for null input", () => {
    expect(toIsoString(null)).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(toIsoString(undefined)).toBeUndefined();
  });

  it("returns undefined for invalid date string", () => {
    expect(toIsoString("not-a-date")).toBeUndefined();
  });
});

describe("computeEventStatus", () => {
  it("returns Postponed when event is postponed", () => {
    const event = createEvent({ isPostponed: true });
    expect(computeEventStatus(event)).toBe("Postponed");
  });

  it("returns Upcoming when before registration start", () => {
    const event = createEvent({
      registrationStart: "2024-06-01T00:00:00.000Z",
      registrationEnd: "2024-06-10T00:00:00.000Z",
      eventStart: "2024-06-15T00:00:00.000Z",
      eventEnd: "2024-06-15T18:00:00.000Z",
    });
    const now = new Date("2024-05-01T00:00:00.000Z");
    expect(computeEventStatus(event, now)).toBe("Upcoming");
  });

  it("returns OpenForRegistration when within registration period", () => {
    const event = createEvent({
      registrationStart: "2024-06-01T00:00:00.000Z",
      registrationEnd: "2024-06-10T00:00:00.000Z",
      eventStart: "2024-06-15T00:00:00.000Z",
      eventEnd: "2024-06-15T18:00:00.000Z",
    });
    const now = new Date("2024-06-05T00:00:00.000Z");
    expect(computeEventStatus(event, now)).toBe("OpenForRegistration");
  });

  it("returns RegistrationClosed after registration ends but before event starts", () => {
    const event = createEvent({
      registrationStart: "2024-06-01T00:00:00.000Z",
      registrationEnd: "2024-06-10T00:00:00.000Z",
      eventStart: "2024-06-15T00:00:00.000Z",
      eventEnd: "2024-06-15T18:00:00.000Z",
    });
    const now = new Date("2024-06-12T00:00:00.000Z");
    expect(computeEventStatus(event, now)).toBe("RegistrationClosed");
  });

  it("returns Ongoing during event", () => {
    const event = createEvent({
      eventStart: "2024-06-15T09:00:00.000Z",
      eventEnd: "2024-06-15T18:00:00.000Z",
    });
    const now = new Date("2024-06-15T12:00:00.000Z");
    expect(computeEventStatus(event, now)).toBe("Ongoing");
  });

  it("returns InReview during review period", () => {
    const event = createEvent({
      eventStart: "2024-06-15T09:00:00.000Z",
      eventEnd: "2024-06-15T18:00:00.000Z",
      reviewStart: "2024-06-16T00:00:00.000Z",
      reviewEnd: "2024-06-20T00:00:00.000Z",
    });
    const now = new Date("2024-06-18T00:00:00.000Z");
    expect(computeEventStatus(event, now)).toBe("InReview");
  });

  it("returns Completed after event ends (no review period)", () => {
    const event = createEvent({
      eventStart: "2024-06-15T09:00:00.000Z",
      eventEnd: "2024-06-15T18:00:00.000Z",
    });
    const now = new Date("2024-06-20T00:00:00.000Z");
    expect(computeEventStatus(event, now)).toBe("Completed");
  });

  it("returns Completed after review period ends", () => {
    const event = createEvent({
      eventStart: "2024-06-15T09:00:00.000Z",
      eventEnd: "2024-06-15T18:00:00.000Z",
      reviewEnd: "2024-06-20T00:00:00.000Z",
    });
    const now = new Date("2024-06-25T00:00:00.000Z");
    expect(computeEventStatus(event, now)).toBe("Completed");
  });

  it("returns Upcoming when only eventStart is set and now is before it", () => {
    const event = createEvent({
      eventStart: "2024-06-15T09:00:00.000Z",
    });
    const now = new Date("2024-06-01T00:00:00.000Z");
    expect(computeEventStatus(event, now)).toBe("Upcoming");
  });
});

describe("formatDate", () => {
  const testDate = "2024-06-15T10:30:00.000Z";

  it("formats date in English locale", () => {
    const result = formatDate(testDate, "en");
    expect(result).toMatch(/Jun\s+15,\s+2024/);
  });

  it("formats date in Chinese locale", () => {
    const result = formatDate(testDate, "zh");
    expect(result).toMatch(/6月/);
    expect(result).toMatch(/15/);
  });

  it("formats date in Japanese locale", () => {
    const result = formatDate(testDate, "ja");
    expect(result).toMatch(/6月/);
    expect(result).toMatch(/15/);
  });

  it("returns empty string for null input", () => {
    expect(formatDate(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(formatDate(undefined)).toBe("");
  });

  it("defaults to English locale", () => {
    const result = formatDate(testDate);
    expect(result).toMatch(/Jun/);
  });
});

describe("formatDateTime", () => {
  const testDate = "2024-06-15T14:30:00.000Z";

  it("formats datetime in English locale", () => {
    const result = formatDateTime(testDate, "en");
    expect(result).toContain("Jun");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("formats datetime in Chinese locale", () => {
    const result = formatDateTime(testDate, "zh");
    expect(result).toMatch(/6月/);
    expect(result).toMatch(/15/);
  });

  it("formats datetime in Japanese locale", () => {
    const result = formatDateTime(testDate, "ja");
    expect(result).toMatch(/6月/);
    expect(result).toMatch(/15/);
  });

  it("returns empty string for null input", () => {
    expect(formatDateTime(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(formatDateTime(undefined)).toBe("");
  });
});
