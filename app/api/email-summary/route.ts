import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { demoEmails } from "@/lib/demo-data";
import { fetchGmailSummary } from "@/lib/google";
import { analyticsTypes, recordAnalyticsEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token?.accessToken || process.env.ENABLE_GMAIL_API !== "true") {
    return NextResponse.json({
      items: demoEmails,
      source: "demo",
      configured: false
    });
  }

  try {
    const items = await fetchGmailSummary(token.accessToken);
    await recordAnalyticsEvent({
      userId: token.sub,
      eventType: analyticsTypes.emailSync,
      targetId: "success",
      targetLabel: String(items.length)
    });
    return NextResponse.json({
      items,
      source: "gmail",
      configured: true
    });
  } catch {
    await recordAnalyticsEvent({
      userId: token?.sub,
      eventType: analyticsTypes.emailSync,
      targetId: "fallback"
    });
    return NextResponse.json({
      items: demoEmails,
      source: "demo",
      configured: true,
      warning: "Gmail could not be reached; demo data is shown."
    });
  }
}
