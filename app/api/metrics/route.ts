import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function label(value: string | null | undefined) {
  return (value ?? "unknown")
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n");
}

function metricHelp(name: string, help: string, type = "gauge") {
  return [`# HELP ${name} ${help}`, `# TYPE ${name} ${type}`];
}

export async function GET(request: NextRequest) {
  const configuredToken = process.env.METRICS_BEARER_TOKEN;
  const suppliedToken =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.nextUrl.searchParams.get("token");

  if (!configuredToken || suppliedToken !== configuredToken) {
    return new NextResponse("Forbidden\n", { status: 403 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);
  const start = performance.now();

  const [
    users,
    activeUsers,
    events,
    links,
    houses,
    homework,
    auditCount
  ] = await Promise.all([
    prisma.user.aggregate({
      where: { isDemo: false },
      _count: { _all: true },
      _sum: { loginCount: true }
    }),
    prisma.analyticsEvent.findMany({
      where: {
        eventType: "LOGIN",
        createdAt: { gte: sevenDaysAgo },
        userId: { not: null }
      },
      distinct: ["userId"],
      select: { userId: true }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["eventType"],
      _count: { _all: true }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["targetId", "targetLabel"],
      where: { eventType: "LINK_CLICK" },
      _count: { _all: true }
    }),
    prisma.house.findMany(),
    prisma.homeworkItem.groupBy({
      by: ["status"],
      _count: { _all: true }
    }),
    prisma.adminAuditLog.count()
  ]);

  const lines = [
    ...metricHelp(
      "dixie_hub_students_total",
      "Number of non-demo students registered in Dixie Hub"
    ),
    `dixie_hub_students_total ${users._count._all}`,
    ...metricHelp(
      "dixie_hub_logins_total",
      "Total successful Google logins recorded by Dixie Hub",
      "counter"
    ),
    `dixie_hub_logins_total ${users._sum.loginCount ?? 0}`,
    ...metricHelp(
      "dixie_hub_active_students_7d",
      "Unique students who logged in during the last seven days"
    ),
    `dixie_hub_active_students_7d ${activeUsers.length}`,
    ...metricHelp(
      "dixie_hub_events_total",
      "Analytics events recorded by event type",
      "counter"
    ),
    ...events.map(
      (event) =>
        `dixie_hub_events_total{event_type="${label(event.eventType)}"} ${event._count._all}`
    ),
    ...metricHelp(
      "dixie_hub_link_clicks_total",
      "Outbound learning-link clicks",
      "counter"
    ),
    ...links.map(
      (linkRow) =>
        `dixie_hub_link_clicks_total{link_id="${label(
          linkRow.targetId
        )}",link_label="${label(linkRow.targetLabel)}"} ${linkRow._count._all}`
    ),
    ...metricHelp(
      "dixie_hub_house_points",
      "Current points total for each Dixie house"
    ),
    ...houses.map(
      (house) =>
        `dixie_hub_house_points{house="${label(house.name)}",colour="${label(
          house.colour
        )}"} ${house.points}`
    ),
    ...metricHelp(
      "dixie_hub_homework_items",
      "Homework items by local Kanban status"
    ),
    ...homework.map(
      (item) =>
        `dixie_hub_homework_items{status="${label(item.status)}"} ${item._count._all}`
    ),
    ...metricHelp(
      "dixie_hub_admin_changes_total",
      "Number of audited admin changes",
      "counter"
    ),
    `dixie_hub_admin_changes_total ${auditCount}`,
    ...metricHelp(
      "dixie_hub_metrics_generation_seconds",
      "Time taken to generate the Prometheus metrics response"
    ),
    `dixie_hub_metrics_generation_seconds ${(
      (performance.now() - start) /
      1000
    ).toFixed(6)}`
  ];

  return new NextResponse(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
