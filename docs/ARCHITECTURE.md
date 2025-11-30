# Project Architecture

This document describes the architecture and structure of the Event Overview project.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **State Management** | React Context + Zustand |
| **Database** | Supabase (PostgreSQL) |
| **i18n** | next-intl |
| **Testing** | Vitest + Playwright |
| **Icons** | Lucide React |

---

## Directory Structure

```
event-overview/
├── app/                    # Next.js App Router pages
│   ├── [locale]/           # Localized routes
│   │   ├── events/[id]/    # Event detail page
│   │   ├── history/        # Historical events page
│   │   ├── submit/         # Event submission form
│   │   ├── redirect/       # External link redirect
│   │   ├── layout.tsx      # Locale layout with providers
│   │   └── page.tsx        # Home page
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
│
├── components/             # Reusable UI components
│   ├── EventCard.tsx       # Event card for listings
│   ├── EventStatusBadge.tsx # Status indicator
│   ├── EventTimeline.tsx   # Timeline visualization
│   ├── FormControls.tsx    # Form input primitives
│   ├── Navbar.tsx          # Navigation bar
│   ├── Footer.tsx          # Page footer
│   ├── ErrorBoundary.tsx   # Error handling
│   ├── WebVitals.tsx       # Performance monitoring
│   └── index.ts            # Barrel exports
│
├── lib/                    # Core business logic
│   ├── __tests__/          # Unit tests
│   ├── constants.ts        # Application constants
│   ├── event-utils.ts      # Date/status utilities
│   ├── eventFilters.ts     # Filtering & pagination
│   ├── eventRepository.ts  # Data access layer
│   ├── eventStore.ts       # Zustand store
│   ├── store.tsx           # React Context store
│   ├── timezone.ts         # Timezone utilities
│   ├── password.ts         # Auth utilities
│   ├── storage.ts          # File upload
│   ├── supabaseClient.ts   # Database client
│   └── index.ts            # Barrel exports
│
├── types/                  # TypeScript type definitions
│   └── index.ts            # Event, Status, Vendor types
│
├── i18n/                   # Internationalization config
│   ├── config.ts           # Locale definitions
│   ├── routing.ts          # next-intl routing
│   └── request.ts          # Server-side locale
│
├── messages/               # Translation files
│   ├── en.json             # English
│   ├── zh.json             # Chinese
│   └── ja.json             # Japanese
│
├── e2e/                    # Playwright E2E tests
│   └── home.spec.ts
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # This file
│   └── PERFORMANCE.md      # Performance guide
│
└── public/                 # Static assets
```

---

## Core Concepts

### 1. State Management

```
┌─────────────────────────────────────────┐
│           EventProvider (Context)        │ ← Primary store
├─────────────────────────────────────────┤
│         useEventStoreZustand            │ ← Alternative (Zustand)
└─────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │    Supabase      │ ← Data source
         └──────────────────┘
```

### 2. Data Flow

```
Form Input → toIsoString() → Database (UTC) → formatDateTime() → Display
```

### 3. Event Lifecycle

```
Upcoming → OpenForRegistration → RegistrationClosed → Ongoing → InReview → Completed
                                                                              │
                                                                     ┌───────┴────────┐
                                                                     │   Historical    │
                                                                     │   (Archived)    │
                                                                     └────────────────┘
```

---

## Key Files

### Entry Points

| File | Purpose |
|------|---------|
| `lib/index.ts` | All library exports |
| `components/index.ts` | All component exports |
| `types/index.ts` | All type exports |

### Configuration

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | (v4 uses CSS) |
| `vitest.config.ts` | Unit test config |
| `playwright.config.ts` | E2E test config |
| `i18n/config.ts` | Locale settings |

---

## Design Patterns

### 1. Barrel Exports
All modules use index.ts for clean imports:
```typescript
import { EventCard, Navbar } from "@/components";
import { formatDate, computeEventStatus } from "@/lib";
```

### 2. Colocation
Related files are grouped together:
```
app/[locale]/submit/
├── page.tsx           # Main component
├── formConfig.ts      # Form configuration
├── useEventForm.ts    # Form hook
├── components/        # Page-specific components
└── __tests__/         # Tests for this feature
```

### 3. Type Safety
All data flows through typed interfaces:
```typescript
Event → CreateEventInput → EventRow → InsertEventRow
```

---

## Adding New Features

### New Page
1. Create `app/[locale]/[feature]/page.tsx`
2. Add translations to `messages/*.json`
3. Update navigation if needed

### New Component
1. Create `components/[Name].tsx`
2. Add JSDoc documentation
3. Export from `components/index.ts`

### New Utility
1. Create or update in `lib/`
2. Add unit tests in `lib/__tests__/`
3. Export from `lib/index.ts`

---

## Testing Strategy

| Type | Tool | Location |
|------|------|----------|
| Unit | Vitest | `lib/__tests__/`, `**/__tests__/` |
| E2E | Playwright | `e2e/` |

Run tests:
```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests (requires browser)
```

---

## Performance Considerations

1. **Pagination**: Default 12 items per page
2. **Memoization**: EventCard uses React.memo
3. **Code Splitting**: Dynamic imports for heavy components
4. **Caching**: LocalStorage for event data
5. **Timezone**: Locale-based timezone mapping

See `docs/PERFORMANCE.md` for detailed optimization guide.
