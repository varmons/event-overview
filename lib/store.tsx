/**
 * @fileoverview Global event store using React Context.
 * Handles data fetching, caching, and state management for events.
 */

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { type Event } from "@/types";
import { MOCK_EVENTS } from "./mock-data";
import { listEvents } from "@/lib/eventRepository";
import { isSupabaseReady } from "@/lib/supabaseClient";
import { EVENT_CACHE_STORAGE_KEY } from "./constants";

// =============================================================================
// Types
// =============================================================================

interface EventContextType {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  getEventById: (id: string) => Event | undefined;
  refreshEvents: () => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);

  const applyEvents = useCallback((nextEvents: Event[]) => {
    setEvents(nextEvents);
    hasInitializedRef.current = true;
  }, []);

  const persistEvents = useCallback((nextEvents: Event[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(EVENT_CACHE_STORAGE_KEY, JSON.stringify(nextEvents));
    } catch (err) {
      console.warn("Failed to persist events cache", err);
    }
  }, []);

  const refreshEvents = useCallback(async () => {
    if (!isSupabaseReady()) {
      if (!hasInitializedRef.current) {
        applyEvents(MOCK_EVENTS);
      }
      setError(null);
      setIsLoading(false);
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    try {
      const remoteEvents = await listEvents();
      applyEvents(remoteEvents);
      persistEvents(remoteEvents);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch events";
      setError(message);
      if (!hasInitializedRef.current) {
        applyEvents(MOCK_EVENTS);
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [applyEvents, persistEvents]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const cached = localStorage.getItem(EVENT_CACHE_STORAGE_KEY);
      if (cached) {
        const parsed: Event[] = JSON.parse(cached);
        if (parsed.length > 0) {
          applyEvents(parsed);
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.warn("Failed to read cached events", err);
    }

    refreshEvents();
  }, [applyEvents, refreshEvents]);

  useEffect(() => {
    if (!hasInitializedRef.current) return;
    persistEvents(events);
  }, [events, persistEvents]);

  const addEvent = useCallback((event: Event) => {
    setEvents((prev) => {
      const deduped = prev.filter((existing) => existing.id !== event.id);
      hasInitializedRef.current = true;
      return [event, ...deduped];
    });
  }, []);

  const updateEvent = useCallback((updatedEvent: Event) => {
    setEvents((prev) => {
      hasInitializedRef.current = true;
      return prev.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event,
      );
    });
  }, []);

  const getEventById = useCallback(
    (id: string) => {
      return events.find((event) => event.id === id);
    },
    [events],
  );

  const value: EventContextType = {
    events,
    addEvent,
    updateEvent,
    getEventById,
    refreshEvents,
    isLoading,
    isSyncing,
    error,
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}

export function useEventStore() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEventStore must be used within an EventProvider");
  }
  return context;
}
