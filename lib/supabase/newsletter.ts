/**
 * Newsletter subscriber storage.
 *
 * Uses the service role: the table has RLS enabled with no policies, so the anon
 * key cannot read the subscriber list from the browser. Import this only from
 * server code (API routes) — never from a client component.
 */
import { createServerClient } from "./server";

const TABLE = "newsletter_subscribers";

/** The wording shown next to the signup form, stored with each subscriber as consent proof. */
export const CONSENT_TEXT =
  "I agree to receive the EU-UA.com email newsletter about Ukraine's EU integration. " +
  "I can unsubscribe at any time using the link in every email.";

export type SubscribeResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; reason: "invalid_email" | "storage_unavailable" };

/**
 * Deliberately permissive: this rejects obvious typos and junk without trying to
 * out-guess the RFC. A real address is proven by the person receiving the email,
 * not by a regex.
 */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 5 || email.length > 254) return null;
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) return null;
  return email;
}

export async function subscribe(rawEmail: unknown, source: string): Promise<SubscribeResult> {
  const email = normalizeEmail(rawEmail);
  if (!email) return { ok: false, reason: "invalid_email" };

  let db;
  try {
    db = createServerClient();
  } catch {
    return { ok: false, reason: "storage_unavailable" };
  }

  const { data: existing, error: lookupError } = await db
    .from(TABLE)
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("newsletter subscribe lookup:", lookupError.message);
    return { ok: false, reason: "storage_unavailable" };
  }

  // Re-subscribing after an unsubscribe is a fresh consent, so the wording and
  // timestamp are recorded again rather than just flipping the status back.
  if (existing) {
    if (existing.status === "confirmed") return { ok: true, alreadySubscribed: true };

    const { error } = await db
      .from(TABLE)
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        unsubscribed_at: null,
        consent_text: CONSENT_TEXT,
        source,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("newsletter resubscribe:", error.message);
      return { ok: false, reason: "storage_unavailable" };
    }
    return { ok: true, alreadySubscribed: false };
  }

  const { error } = await db.from(TABLE).insert({
    email,
    status: "confirmed",
    confirmed_at: new Date().toISOString(),
    consent_text: CONSENT_TEXT,
    source,
  });

  if (error) {
    // A race between the lookup and the insert lands here; the person is subscribed
    // either way, so report success rather than an error they can't act on.
    if (error.code === "23505") return { ok: true, alreadySubscribed: true };
    console.error("newsletter insert:", error.message);
    return { ok: false, reason: "storage_unavailable" };
  }

  return { ok: true, alreadySubscribed: false };
}

/** Returns true when a matching subscriber was found and unsubscribed. */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return false;

  let db;
  try {
    db = createServerClient();
  } catch {
    return false;
  }

  const { data, error } = await db
    .from(TABLE)
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("token", token)
    .select("id");

  if (error) {
    console.error("newsletter unsubscribe:", error.message);
    return false;
  }
  return (data ?? []).length > 0;
}
