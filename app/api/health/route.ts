import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "dixie-hub",
    time: new Date().toISOString()
  });
}
