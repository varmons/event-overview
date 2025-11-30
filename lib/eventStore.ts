/**
 * @fileoverview Zustand-based event store for state management.
 * Provides a simpler, more performant alternative to React Context.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Event } from "@/types";
import { listEvents } from "./eventRepository";
import { isSupabaseReady } from "./supabaseClient";
import { MOCK_EVENTS } from "./mock-data";
import { EVENT_CACHE_STORAGE_KEY } from "./constants";

// =============================================================================
// Types
// =============================================================================

interface EventState {
  events: Event[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

interface EventActions {
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  removeEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
  refreshEvents: () => Promise<void>;
  setError: (error: string | null) => void;
}

type EventStore = EventState & EventActions;

// =============================================================================
// Store
// =============================================================================

/**
 * Zustand store for event state management
 * @description Provides reactive state with persistence and optimistic updates
 */
export const useEventStoreZustand = create<EventStore>()(
  persist(
    (set, get) => ({
      // Initial state
      events: [],
      isLoading: true,
      isSyncing: false,
      error: null,

      // Actions
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),

      updateEvent: (event) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === event.id ? event : e)),
        })),

      removeEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),

      getEventById: (id) => get().events.find((e) => e.id === id),

      setError: (error) => set({ error }),

      refreshEvents: async () => {
        const state = get();
        
        // Skip if already syncing
        if (state.isSyncing) return;

        // Check if Supabase is configured
        if (!isSupabaseReady()) {
          if (state.events.length === 0) {
            set({ events: MOCK_EVENTS, isLoading: false });
          }
          return;
        }

        set({ isSyncing: true, error: null });

        try {
          const freshEvents = await listEvents();
          set({
            events: freshEvents,
            isLoading: false,
            isSyncing: false,
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch events";
          set({
            error: message,
            isLoading: false,
            isSyncing: false,
          });
        }
      },
    }),
    {
      name: EVENT_CACHE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ events: state.events }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, trigger a refresh
        if (state) {
          state.isLoading = false;
          state.refreshEvents();
        }
      },
    }
  )
);

// =============================================================================
// Selectors (for optimized re-renders)
// =============================================================================

/** Select only the events array */
export const selectEvents = (state: EventStore) => state.events;

/** Select loading state */
export const selectIsLoading = (state: EventStore) => state.isLoading;

/** Select syncing state */
export const selectIsSyncing = (state: EventStore) => state.isSyncing;

/** Select error state */
export const selectError = (state: EventStore) => state.error;

/** Select events filtered by status */
export const selectEventsByStatus = (status: Event["status"]) => (state: EventStore) =>
  state.events.filter((e) => e.status === status);

/** Select upcoming events */
export const selectUpcomingEvents = (state: EventStore) =>
  state.events.filter((e) => e.status === "Upcoming" || e.status === "OpenForRegistration");
