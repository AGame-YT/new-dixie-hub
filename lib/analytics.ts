import { prisma } from "@/lib/prisma";

export const analyticsTypes = {
  login: "LOGIN",
  pageView: "PAGE_VIEW",
  linkClick: "LINK_CLICK",
  homeworkStatus: "HOMEWORK_STATUS",
  classroomSync: "CLASSROOM_SYNC",
  emailSync: "EMAIL_SYNC"
} as const;

export async function recordAnalyticsEvent({
  userId,
  eventType,
  targetId,
  targetLabel,
  path
}: {
  userId?: string | null;
  eventType: string;
  targetId?: string;
  targetLabel?: string;
  path?: string;
}) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        userId: userId ?? null,
        eventType,
        targetId,
        targetLabel,
        path
      }
    });
  } catch {
    // Analytics must never interrupt the student experience.
  }
}
