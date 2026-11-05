import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseBulletinInput } from "@/lib/bulletin";
import { toBulletinItem } from "@/lib/bulletin-data";
import { prisma } from "@/lib/prisma";
import { getViewerWithRole, isSameOrigin } from "@/lib/viewer";

type Context = { params: Promise<{ id: string }> };

async function authorise(request: NextRequest) {
  const viewer = await getViewerWithRole("TEACHER");
  if (!viewer) {
    return { error: NextResponse.json({ error: "Only staff can change notices" }, { status: 403 }) };
  }
  if (!isSameOrigin(request)) {
    return { error: NextResponse.json({ error: "Invalid origin" }, { status: 403 }) };
  }
  return { viewer };
}

/** Any member of staff can edit any notice, as with the shared bulletin document. */
export async function PATCH(request: NextRequest, context: Context) {
  const { viewer, error } = await authorise(request);
  if (error) return error;
  const { id } = await context.params;
  const input = parseBulletinInput(await request.json().catch(() => null));
  if ("error" in input) {
    return NextResponse.json(input, { status: 400 });
  }
  const existing = await prisma.bulletinEntry.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "That notice no longer exists" }, { status: 404 });
  }
  const entry = await prisma.bulletinEntry.update({
    where: { id },
    data: { ...input, updatedByEmail: viewer.email, updatedByName: viewer.name }
  });
  return NextResponse.json({ item: toBulletinItem(entry) });
}

export async function DELETE(request: NextRequest, context: Context) {
  const { viewer, error } = await authorise(request);
  if (error) return error;
  const { id } = await context.params;
  const existing = await prisma.bulletinEntry.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ id, deleted: true });
  }
  await prisma.$transaction([
    prisma.bulletinEntry.delete({ where: { id } }),
    prisma.adminAuditLog.create({
      data: {
        actorEmail: viewer.email,
        action: "BULLETIN_DELETED",
        targetType: "BulletinEntry",
        targetId: id,
        beforeJson: JSON.stringify({
          date: existing.date,
          title: existing.title,
          audience: existing.audience
        })
      }
    })
  ]);
  return NextResponse.json({ id, deleted: true });
}
