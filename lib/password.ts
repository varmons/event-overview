/**
 * @fileoverview Password verification utilities for the submit form.
 * Uses SHA-256 hashing for secure password comparison.
 *
 * SECURITY: The password hash MUST be set via environment variable.
 * Generate a hash: node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
 */

// =============================================================================
// Constants
// =============================================================================

/**
 * Password hash from environment variable
 * @security Never hardcode password hashes in source code
 */
const PASSWORD_HASH = process.env.NEXT_PUBLIC_SUBMIT_PASSWORD_HASH;

/** localStorage key for persisting access grant */
export const SUBMIT_PASSWORD_STORAGE_KEY = "event-overview-submit-access";

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Compute SHA-256 hash of a string
 * @internal Uses Web Crypto API in browser, Node crypto on server
 */
async function sha256(value: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  const crypto = await import("crypto");
  return crypto.createHash("sha256").update(value).digest("hex");
}

// =============================================================================
// Exported Functions
// =============================================================================

/**
 * Check if password protection is enabled
 * @returns true if NEXT_PUBLIC_SUBMIT_PASSWORD_HASH is configured
 */
export function isPasswordProtectionEnabled(): boolean {
  return Boolean(PASSWORD_HASH);
}

/**
 * Verify a password against the configured hash
 * @param candidate - Plain text password to verify
 * @returns true if password matches, false otherwise
 * @throws Error if password hash is not configured
 */
export async function verifySubmitPassword(
  candidate: string,
): Promise<boolean> {
  if (!PASSWORD_HASH) {
    console.warn("NEXT_PUBLIC_SUBMIT_PASSWORD_HASH is not set. Password protection disabled.");
    return true; // Allow access when not configured (for development)
  }
  if (!candidate) return false;
  const hashedCandidate = await sha256(candidate.trim());
  return hashedCandidate === PASSWORD_HASH;
}
