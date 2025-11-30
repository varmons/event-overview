import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("password utilities", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  describe("isPasswordProtectionEnabled", () => {
    it("returns false when hash is not configured", async () => {
      delete process.env.NEXT_PUBLIC_SUBMIT_PASSWORD_HASH;
      const { isPasswordProtectionEnabled } = await import("../password");
      expect(isPasswordProtectionEnabled()).toBe(false);
    });

    it("returns true when hash is configured", async () => {
      process.env.NEXT_PUBLIC_SUBMIT_PASSWORD_HASH = "somehash";
      const { isPasswordProtectionEnabled } = await import("../password");
      expect(isPasswordProtectionEnabled()).toBe(true);
    });
  });

  describe("verifySubmitPassword", () => {
    it("returns true when password protection is disabled (no hash configured)", async () => {
      delete process.env.NEXT_PUBLIC_SUBMIT_PASSWORD_HASH;
      const { verifySubmitPassword } = await import("../password");
      // Should allow access when not configured
      expect(await verifySubmitPassword("anything")).toBe(true);
    });

    it("returns false for empty password when hash is configured", async () => {
      process.env.NEXT_PUBLIC_SUBMIT_PASSWORD_HASH = "somehash";
      const { verifySubmitPassword } = await import("../password");
      expect(await verifySubmitPassword("")).toBe(false);
    });

    it("returns true for correct password", async () => {
      // SHA-256("test") = 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
      process.env.NEXT_PUBLIC_SUBMIT_PASSWORD_HASH =
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

      const { verifySubmitPassword } = await import("../password");
      expect(await verifySubmitPassword("test")).toBe(true);
    });

    it("trims whitespace from password", async () => {
      process.env.NEXT_PUBLIC_SUBMIT_PASSWORD_HASH =
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

      const { verifySubmitPassword } = await import("../password");
      expect(await verifySubmitPassword("  test  ")).toBe(true);
    });

    it("returns false for wrong password", async () => {
      process.env.NEXT_PUBLIC_SUBMIT_PASSWORD_HASH =
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

      const { verifySubmitPassword } = await import("../password");
      expect(await verifySubmitPassword("wrong")).toBe(false);
    });
  });

  describe("SUBMIT_PASSWORD_STORAGE_KEY", () => {
    it("exports the correct storage key", async () => {
      const { SUBMIT_PASSWORD_STORAGE_KEY } = await import("../password");
      expect(SUBMIT_PASSWORD_STORAGE_KEY).toBe("event-overview-submit-access");
    });
  });
});
