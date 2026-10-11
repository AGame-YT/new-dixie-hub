import { NextResponse } from "next/server";
import { demoTimetable } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET() {
  // Google Calendar or the school's MIS adapter can replace this provider later.
  return NextResponse.json({
    items: demoTimetable,
    source: "demo",
    configured: false
  });
}
