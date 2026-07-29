import { NextRequest, NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/supabase/newsletter";

/**
 * One-click unsubscribe target for the link in every email — a GET so it works
 * straight from a mail client, with no login and no confirmation step.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const ok = await unsubscribeByToken(token);

  const target = new URL("/newsletter/unsubscribed", req.nextUrl.origin);
  if (!ok) target.searchParams.set("status", "notfound");
  return NextResponse.redirect(target);
}
