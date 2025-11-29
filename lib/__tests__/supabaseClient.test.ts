import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("supabaseClient", () => {
    beforeEach(() => {
        vi.resetModules();
        process.env = { ...ORIGINAL_ENV };
    });

    afterEach(() => {
        process.env = { ...ORIGINAL_ENV };
    });

    it("reports ready when Supabase env vars exist", async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

        const { isSupabaseReady } = await import("../supabaseClient");

        expect(isSupabaseReady()).toBe(true);
    });

    it("falls back to mock mode when env vars are missing in tests", async () => {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        process.env.NODE_ENV = "test";

        const { isSupabaseReady, getSupabaseClient } = await import("../supabaseClient");

        expect(isSupabaseReady()).toBe(false);
        expect(() => getSupabaseClient()).not.toThrow();
    });
});
