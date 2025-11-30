/**
 * @fileoverview Organizer information card component.
 */

"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { Event } from "@/types";

// =============================================================================
// Types
// =============================================================================

interface OrganizerCardProps {
  event: Event;
  t: (key: string) => string;
  tOrganizerTypes: (key: string) => string;
}

// =============================================================================
// Component
// =============================================================================

/** Displays event organizer information with avatar and contact */
export function OrganizerCard({
  event,
  t,
  tOrganizerTypes,
}: OrganizerCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">{t("organizer.title")}</h3>
      <div className="flex items-center gap-3">
        {event.organizerAvatarUrl ? (
          <Image
            src={event.organizerAvatarUrl}
            alt={event.organizerName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <User className="w-5 h-5" />
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">{event.organizerName}</p>
          <p className="text-xs text-gray-500">
            {tOrganizerTypes(event.organizerType)}
          </p>
        </div>
      </div>
      {event.organizerContact && (
        <div className="text-sm text-gray-600 pt-2">
          <p className="font-medium text-xs text-gray-500 uppercase tracking-wider mb-1">
            {t("organizer.contact")}
          </p>
          <p>{event.organizerContact}</p>
        </div>
      )}
    </div>
  );
}
