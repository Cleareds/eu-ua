import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/supabase/art-admin";

export async function GET(req: NextRequest) {
  const result = await verifyAdminRequest(req);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({ email: result.adminEmail });
}
