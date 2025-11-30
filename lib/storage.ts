/**
 * @fileoverview Supabase Storage utilities for file uploads.
 */

import { getSupabaseClient } from "@/lib/supabaseClient";

// =============================================================================
// Constants
// =============================================================================

/** Storage bucket name for event posters */
const EVENT_POSTER_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_POSTER_BUCKET ?? "event-posters";

// =============================================================================
// Exported Functions
// =============================================================================

/**
 * Upload an event poster image to Supabase Storage
 * @param file - Image file to upload
 * @param eventId - Optional event ID for filename (generates UUID if not provided)
 * @returns Public URL of the uploaded image
 * @throws Error if upload fails
 */
export async function uploadEventPoster(
  file: File,
  eventId?: string,
): Promise<string> {
  const supabase = getSupabaseClient();
  const extension = file.name?.split(".").pop() ?? "png";
  const normalizedExtension = extension.toLowerCase();
  const safeEventId = eventId ?? crypto.randomUUID();
  const fileName = `${safeEventId}-${Date.now()}.${normalizedExtension}`;
  const filePath = `posters/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(EVENT_POSTER_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Failed to upload poster: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(EVENT_POSTER_BUCKET).getPublicUrl(filePath);

  if (!publicUrl) {
    throw new Error("Unable to retrieve public URL for uploaded poster");
  }

  return publicUrl;
}
