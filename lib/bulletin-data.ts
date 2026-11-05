import type { BulletinEntry } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  addDays,
  relativeDateLabel,
  staffOnlyAudience,
  ukDateKey,
  type BulletinEntryItem
} from "@/lib/bulletin";
import type { NoticeItem } from "@/lib/types";

export function toBulletinItem(entry: BulletinEntry): BulletinEntryItem {
  return {
    id: entry.id,
    date: entry.date,
    title: entry.title,
    body: entry.body,
    audience: entry.audience,
    pinned: entry.pinned,
    createdByName: entry.createdByName ?? entry.createdByEmail,
    updatedByName: entry.updatedByEmail
      ? entry.updatedByName ?? entry.updatedByEmail
      : undefined,
    updatedAt: entry.updatedAt.toISOString()
  };
}

export async function listBulletin(
  from: string,
  to: string,
  { includeStaff }: { includeStaff: boolean }
) {
  const entries = await prisma.bulletinEntry.findMany({
    where: {
      date: { gte: from, lte: to },
      ...(includeStaff ? {} : { audience: { not: staffOnlyAudience } })
    },
    orderBy: [{ date: "asc" }, { pinned: "desc" }, { createdAt: "asc" }]
  });
  return entries.map(toBulletinItem);
}

/** Bulletin notices for today and the next week, shaped for the notices card. */
export async function upcomingNotices({
  includeStaff,
  days = 7
}: {
  includeStaff: boolean;
  days?: number;
}): Promise<NoticeItem[] | null> {
  const today = ukDateKey();
  try {
    const entries = await listBulletin(today, addDays(today, days - 1), { includeStaff });
    return entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      body: entry.body,
      date: relativeDateLabel(entry.date, today),
      audience: entry.audience,
      pinned: entry.pinned
    }));
  } catch {
    // The database isn't ready; callers fall back to the configured notices.
    return null;
  }
}
