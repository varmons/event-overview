const DEFAULT_PASSWORD_HASH = "ab4b76e9d419a7bd7cb7e0a78fb422083e699c91239b2a9b58373fd32a46ebd2";

const PASSWORD_HASH = process.env.NEXT_PUBLIC_SUBMIT_PASSWORD_HASH ?? DEFAULT_PASSWORD_HASH;
export const SUBMIT_PASSWORD_STORAGE_KEY = "event-overview-submit-access";

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

export async function verifySubmitPassword(candidate: string): Promise<boolean> {
    if (!candidate) return false;
    const hashedCandidate = await sha256(candidate.trim());
    return hashedCandidate === PASSWORD_HASH;
}
