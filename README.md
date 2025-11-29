# Event Overview

A multilingual event discovery dashboard built with Next.js 16 (App Router) that curates community events from Supabase, provides a password-gated submission workflow, and exposes locale-aware detail pages with rich timelines.

## Key Features

- **Live Supabase feed** – Client-side store hydrates from Supabase Postgres and automatically caches the latest snapshot in `localStorage` for offline resilience.
- **Password-locked submissions** – The submit form stays hidden until the correct SHA-256 password is provided, preventing random spam while remaining fully client-side.
- **Multi-language UX** – `next-intl` powers English, Simplified Chinese, and Japanese copies across every page, including error and status messages.
- **Rich detail views** – Posters, timelines, vendor metadata, postponed banners, and registration CTAs come from the same dataset, guaranteeing consistency between list and detail pages.
- **Modern tooling** – Vitest for unit tests, Tailwind-powered UI primitives, and structured TypeScript types for events.

## Tech Stack

| Layer | Tooling |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI / Styling | Tailwind CSS + custom components |
| State | Client-side `EventProvider` context + `localStorage` cache |
| Localization | `next-intl` with per-locale message bundles |
| Backend | Supabase Postgres & Supabase Storage |
| Testing | [Vitest](https://vitest.dev/) + `vite-tsconfig-paths` |

## Project Structure

```
app/
  [locale]/
    page.tsx              # Home feed with filters + Supabase status
    submit/page.tsx       # Password-gated submission form
    events/[id]/page.tsx  # Event detail view
components/              # UI atoms (cards, status badges, timelines)
lib/
  eventRepository.ts     # Supabase CRUD + mappers
  password.ts            # SHA-256 password verification helper
  store.tsx              # EventProvider context (fetch/cache logic)
messages/                # next-intl locale JSON files
```

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project (cloud or local Docker stack) with:
  - Postgres table `public.events`
  - Storage bucket `event-posters`
  - Anonymous policies that allow read/insert for the respective resources

## Environment Variables

Create `.env.local` at the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
NEXT_PUBLIC_SUPABASE_POSTER_BUCKET=event-posters
# Optional: override the hashed password used by the submit gate
NEXT_PUBLIC_SUBMIT_PASSWORD_HASH=<sha256-hex>
```

### Changing the submit password

1. Choose a plain-text password (defaults to `event-overview`).
2. Generate a SHA-256 hash:
   ```bash
   node -e "const crypto=require('crypto');console.log(crypto.createHash('sha256').update('your-password').digest('hex'))"
   ```
3. Set the resulting hex string in `NEXT_PUBLIC_SUBMIT_PASSWORD_HASH` and restart the dev server. The UI never exposes the plain password.

## Supabase Setup

### Table Schema

```sql
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text not null,
  event_type text not null,
  vendor text,
  tags text[] default '{}',
  location_type text not null,
  location_detail text,
  poster_url text,
  registration_start timestamptz,
  registration_end timestamptz,
  event_start timestamptz,
  event_end timestamptz,
  submission_deadline timestamptz,
  review_start timestamptz,
  review_end timestamptz,
  announcement_date timestamptz,
  demo_day_date timestamptz,
  award_ceremony_date timestamptz,
  status text not null,
  is_postponed boolean default false,
  original_event_start timestamptz,
  original_event_end timestamptz,
  postponed_reason text,
  organizer_name text not null,
  organizer_type text not null,
  organizer_avatar_url text,
  organizer_contact text,
  registration_url text,
  official_site_url text,
  livestream_url text,
  recording_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Row Level Security

```sql
alter table public.events enable row level security;

create policy if not exists "Allow anonymous reads"
  on public.events for select using (true);

create policy if not exists "Allow anonymous inserts"
  on public.events for insert with check (true);
```

> Harden these policies (e.g., service role, Edge Functions) before going to production and add triggers to maintain `updated_at`.

### Storage Bucket

1. Create bucket `event-posters`.
2. Allow public reads:
   ```sql
   create policy if not exists "Public poster read"
     on storage.objects for select using (bucket_id = 'event-posters');
   ```
3. Allow uploads (if needed for anonymous clients):
   ```sql
   create policy if not exists "Anon poster insert"
     on storage.objects for insert
     with check (bucket_id = 'event-posters');
   ```

## Installation & Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/en` (or `/zh`, `/ja`). The submission form is at `/{locale}/submit` and will prompt for the password the first time.

## Testing

```bash
npm run test
```

Vitest covers event mappers and Supabase helpers. Extend these tests when adding new data flows (stores, submission steps, etc.).

## Localization Workflow

- Message files live under `messages/<locale>.json`.
- Use `useTranslations("namespace")` in components.
- Every user-facing string on the home feed, detail page, submit form, and error banners already has entries in `en`, `zh`, and `ja`. Add new keys to all locales to keep parity.

## Deployment Checklist

1. Set all required env vars (`NEXT_PUBLIC_SUPABASE_*`, optional password hash) in your hosting provider.
2. Ensure Supabase Storage CORS settings allow your domain (or use signed URLs).
3. Run `npm run test` in CI before deploys.
4. Optionally configure [Supabase Database Branching](https://supabase.com/docs/guides/database) for staging data.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Banner shows “Supabase environment variables are missing” | Double-check `.env.local` or hosting env vars; until resolved the UI falls back to cached mock data only. |
| Poster uploads fail | Confirm the bucket name matches `NEXT_PUBLIC_SUPABASE_POSTER_BUCKET` and `anon` has `insert` rights (or provide an authenticated route). |
| Event not visible after submission | Inspect browser console for Supabase errors, ensure RLS policies allow inserts, and verify the `EventProvider` re-sync succeeded via the “Refresh feed” button. |
| Password gate never unlocks | Generate a new SHA-256 hash and ensure the value in `NEXT_PUBLIC_SUBMIT_PASSWORD_HASH` matches exactly (no whitespace). |

With the Supabase project configured, the live feed, filters, and detail pages will all reflect the latest data instantly after each submission.
