import { describe, it, expect } from "vitest";
import {
  validateFormData,
  FORM_DEFAULT_VALUES,
  EventFormData,
} from "../formConfig";

// Mock translation function
const t = (key: string) => key;

describe("Form Validation", () => {
  describe("Required Fields", () => {
    it("validates title is required", () => {
      const formData = { ...FORM_DEFAULT_VALUES, title: "" };
      const errors = validateFormData(formData, t);
      expect(errors.title).toBe("validation.required");
    });

    it("validates description is required", () => {
      const formData = { ...FORM_DEFAULT_VALUES, description: "" };
      const errors = validateFormData(formData, t);
      expect(errors.description).toBe("validation.required");
    });

    it("validates organizerName is required", () => {
      const formData = { ...FORM_DEFAULT_VALUES, organizerName: "" };
      const errors = validateFormData(formData, t);
      expect(errors.organizerName).toBe("validation.required");
    });

    it("validates eventStart is required", () => {
      const formData = { ...FORM_DEFAULT_VALUES, eventStart: "" };
      const errors = validateFormData(formData, t);
      expect(errors.eventStart).toBe("validation.required");
    });

    it("validates eventEnd is required", () => {
      const formData = { ...FORM_DEFAULT_VALUES, eventEnd: "" };
      const errors = validateFormData(formData, t);
      expect(errors.eventEnd).toBe("validation.required");
    });
  });

  describe("Conditional Required Fields", () => {
    it("requires customVendor when vendor is Other", () => {
      const formData = {
        ...FORM_DEFAULT_VALUES,
        vendor: "Other",
        customVendor: "",
      };
      const errors = validateFormData(formData, t);
      expect(errors.customVendor).toBe("validation.required");
    });

    it("does not require customVendor when vendor is not Other", () => {
      const formData = {
        ...FORM_DEFAULT_VALUES,
        vendor: "Google",
        customVendor: "",
      };
      const errors = validateFormData(formData, t);
      expect(errors.customVendor).toBeUndefined();
    });

    it("requires locationDetail when locationType is not Online", () => {
      const formData: EventFormData = {
        ...FORM_DEFAULT_VALUES,
        locationType: "Offline",
        locationDetail: "",
      };
      const errors = validateFormData(formData, t);
      expect(errors.locationDetail).toBe("validation.required");
    });

    it("does not require locationDetail when locationType is Online", () => {
      const formData: EventFormData = {
        ...FORM_DEFAULT_VALUES,
        locationType: "Online",
        locationDetail: "",
      };
      const errors = validateFormData(formData, t);
      expect(errors.locationDetail).toBeUndefined();
    });
  });

  describe("Postponed Event Validation", () => {
    it("requires originalEventStart when isPostponed is true", () => {
      const formData = {
        ...FORM_DEFAULT_VALUES,
        isPostponed: true,
        originalEventStart: "",
      } as EventFormData;
      const errors = validateFormData(formData, t);
      expect(errors.originalEventStart).toBe(
        "validation.postponedOriginalRequired"
      );
    });

    it("requires originalEventEnd when isPostponed is true", () => {
      const formData = {
        ...FORM_DEFAULT_VALUES,
        isPostponed: true,
        originalEventEnd: "",
      } as EventFormData;
      const errors = validateFormData(formData, t);
      expect(errors.originalEventEnd).toBe(
        "validation.postponedOriginalRequired"
      );
    });

    it("does not require original dates when isPostponed is false", () => {
      const formData = {
        ...FORM_DEFAULT_VALUES,
        isPostponed: false,
        originalEventStart: "",
        originalEventEnd: "",
      };
      const errors = validateFormData(formData, t);
      expect(errors.originalEventStart).toBeUndefined();
      expect(errors.originalEventEnd).toBeUndefined();
    });
  });

  describe("Date Validation", () => {
    it("validates eventEnd is after eventStart", () => {
      const formData = {
        ...FORM_DEFAULT_VALUES,
        eventStart: "2024-06-15T10:00",
        eventEnd: "2024-06-14T10:00", // Before start
      };
      const errors = validateFormData(formData, t);
      expect(errors.eventEnd).toBe("validation.endBeforeStart");
    });

    it("allows eventEnd after eventStart", () => {
      const formData = {
        ...FORM_DEFAULT_VALUES,
        eventStart: "2024-06-15T10:00",
        eventEnd: "2024-06-15T18:00",
      };
      const errors = validateFormData(formData, t);
      expect(errors.eventEnd).toBeUndefined();
    });

    it("validates registrationEnd is after registrationStart", () => {
      const formData = {
        ...FORM_DEFAULT_VALUES,
        registrationStart: "2024-06-10T00:00",
        registrationEnd: "2024-06-05T00:00", // Before start
        eventStart: "2024-06-15T10:00",
        eventEnd: "2024-06-15T18:00",
      };
      const errors = validateFormData(formData, t);
      expect(errors.registrationEnd).toBe("validation.regEndBeforeStart");
    });

    it("validates registrationEnd is before eventStart", () => {
      const formData = {
        ...FORM_DEFAULT_VALUES,
        registrationStart: "2024-06-01T00:00",
        registrationEnd: "2024-06-20T00:00", // After event start
        eventStart: "2024-06-15T10:00",
        eventEnd: "2024-06-15T18:00",
      };
      const errors = validateFormData(formData, t);
      expect(errors.registrationEnd).toBe("validation.regEndAfterEvent");
    });
  });

  describe("Valid Form Data", () => {
    it("returns no errors for valid form data", () => {
      const formData = {
        ...FORM_DEFAULT_VALUES,
        title: "Test Event",
        description: "Test Description",
        organizerName: "Test Organizer",
        eventStart: "2024-06-15T10:00",
        eventEnd: "2024-06-15T18:00",
        vendor: "Google",
      } as EventFormData;
      const errors = validateFormData(formData, t);
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });
});
