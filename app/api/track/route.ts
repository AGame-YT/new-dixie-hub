import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { analyticsTypes, recordAnalyticsEvent } from "@/lib/analytics";

function clean(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : undefined;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const body = (await request.json()) as {
    eventType?: string;
    targetId?: string;
    targetLabel?: string;
    path?: string;
  };

  if (
    body.eventType !== analyticsTypes.pageView &&
    body.eventType !== analyticsTypes.linkClick
  ) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  await recordAnalyticsEvent({
    userId: token?.sub,
    eventType: body.eventType,
    targetId: clean(body.targetId, 80),
    targetLabel: clean(body.targetLabel, 120),
    path: clean(body.path, 120)
  });

  return new NextResponse(null, { status: 202 });
}
