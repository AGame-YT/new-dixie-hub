import { prisma } from "@/lib/prisma";

const DAY = 86_400_000;

export async function getAdminOverview() {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * DAY);
  const thirtyDaysAgo = new Date(now - 30 * DAY);

  const [
    studentCount,
    totalLogins,
    activeUserRows,
    linkClicks,
    pageViews,
    homeworkMoves,
    houses,
    topLinks,
    recentUsers,
    recentAudit,
    dailyEvents
  ] = await Promise.all([
    prisma.user.count({ where: { isDemo: false } }),
    prisma.user.aggregate({
      where: { isDemo: false },
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
    prisma.analyticsEvent.count({
      where: { eventType: "LINK_CLICK", createdAt: { gte: thirtyDaysAgo } }
    }),
    prisma.analyticsEvent.count({
      where: { eventType: "PAGE_VIEW", createdAt: { gte: thirtyDaysAgo } }
    }),
    prisma.analyticsEvent.count({
      where: {
        eventType: "HOMEWORK_STATUS",
        createdAt: { gte: thirtyDaysAgo }
      }
    }),
    prisma.house.findMany({ orderBy: { points: "desc" } }),
    prisma.analyticsEvent.groupBy({
      by: ["targetId", "targetLabel"],
      where: { eventType: "LINK_CLICK", createdAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
      orderBy: { _count: { targetId: "desc" } },
      take: 8
    }),
    prisma.user.findMany({
      where: { isDemo: false },
      orderBy: { lastLoginAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        loginCount: true,
        lastLoginAt: true,
        createdAt: true
      }
    }),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, eventType: true }
    })
  ]);

  const activity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now - (6 - index) * DAY);
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString("en-GB", { weekday: "short" }),
      events: 0,
      logins: 0,
      clicks: 0
    };
  });
  const activityMap = new Map(activity.map((item) => [item.key, item]));

  for (const event of dailyEvents) {
    const bucket = activityMap.get(event.createdAt.toISOString().slice(0, 10));
    if (!bucket) continue;
    bucket.events += 1;
    if (event.eventType === "LOGIN") bucket.logins += 1;
    if (event.eventType === "LINK_CLICK") bucket.clicks += 1;
  }

  return {
    summary: {
      studentCount,
      totalLogins: totalLogins._sum.loginCount ?? 0,
      activeStudents7d: activeUserRows.length,
      linkClicks30d: linkClicks,
      pageViews30d: pageViews,
      homeworkMoves30d: homeworkMoves
    },
    houses,
    topLinks: topLinks.map((link) => ({
      id: link.targetId ?? "unknown",
      label: link.targetLabel ?? link.targetId ?? "Unknown link",
      clicks: link._count._all
    })),
    recentUsers,
    recentAudit,
    activity
  };
}
