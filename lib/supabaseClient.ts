import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

const isTestEnv = process.env.NODE_ENV === "test";
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && !isTestEnv) {
    // eslint-disable-next-line no-console
    console.warn(
        "Supabase environment variables are missing. Define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or VITE_ equivalents). Falling back to local mock data."
    );
}

const resolvedUrl = supabaseUrl ?? "http://localhost:54321";
const resolvedAnonKey = supabaseAnonKey ?? "test-anon-key";

type SupabaseClientCache = {
    supabaseClient?: SupabaseClient;
};

const globalForSupabase = globalThis as unknown as SupabaseClientCache;

export const supabaseClient: SupabaseClient =
    globalForSupabase.supabaseClient ?? createClient(resolvedUrl, resolvedAnonKey);

if (!globalForSupabase.supabaseClient) {
    globalForSupabase.supabaseClient = supabaseClient;
}

export function getSupabaseClient(): SupabaseClient {
    return supabaseClient;
}

export function isSupabaseReady(): boolean {
    return isSupabaseConfigured;
}
