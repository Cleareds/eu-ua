import { NextRequest, NextResponse } from "next/server";
import { subscribe } from "@/lib/supabase/newsletter";
import { NEWSLETTER_ENABLED } from "@/lib/site";

const ALLOWED_SOURCES = new Set(["footer", "news", "home", "unknown"]);

export async function POST(req: NextRequest) {
  // Gated by the same switch as the forms, so hiding the UI actually closes the
  // endpoint rather than just making it harder to find.
  if (!NEWSLETTER_ENABLED) {
    return NextResponse.json({ error: "Newsletter signup is not open yet." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, source, company } = (body ?? {}) as Record<string, unknown>;

  // Honeypot: the form renders a hidden "company" field that humans never see.
  // Anything that fills it in gets a success response and is silently dropped —
  // telling a bot it was detected only helps it adapt.
  if (typeof company === "string" && company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const result = await subscribe(
    email,
    typeof source === "string" && ALLOWED_SOURCES.has(source) ? source : "unknown",
  );

  if (!result.ok) {
    if (result.reason === "invalid_email") {
      return NextResponse.json({ error: "That doesn't look like a valid email address." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "We couldn't save your subscription right now. Please try again later." },
      { status: 503 },
    );
  }

  // The same response either way — whether an address is already on the list is
  // not something an unauthenticated caller should be able to probe for.
  return NextResponse.json({ ok: true });
}
