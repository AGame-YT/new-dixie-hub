import { redirect } from "next/navigation";

/** The hub is now one page; this old route jumps to its section. */
export default async function LegacyPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  redirect(params.demo === "1" ? "/dashboard?demo=1#links" : "/dashboard#links");
}
