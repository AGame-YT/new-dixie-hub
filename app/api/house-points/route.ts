import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const since = new Date(Date.now() - 7 * 86_400_000);
    const [houses, changes] = await Promise.all([
      prisma.house.findMany({ orderBy: { points: "desc" } }),
      prisma.housePointChange.groupBy({
        by: ["houseId"],
        where: { createdAt: { gte: since }, delta: { gt: 0 } },
        _sum: { delta: true }
      })
    ]);
    const gains = new Map(
      changes.map((change) => [change.houseId, change._sum.delta ?? 0])
    );

    return NextResponse.json({
      houses: houses.map((house) => ({
        id: house.id,
        name: house.name,
        colour: house.colour,
        points: house.points,
        weeklyGain: gains.get(house.id) ?? 0
      }))
    });
  } catch {
    return NextResponse.json({ houses: [] }, { status: 503 });
  }
}
