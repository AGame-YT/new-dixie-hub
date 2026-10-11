import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { getAdminOverview } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  return NextResponse.json(await getAdminOverview());
}
