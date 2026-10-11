import { getServerSession } from "next-auth";
import { AppShell } from "@/components/AppShell";
import { LearningLinksGrid } from "@/components/LearningLinksGrid";
import { authOptions } from "@/lib/auth";
import { learningLinks } from "@/lib/config";

export const metadata = { title: "Learning links" };

export default async function LinksPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const demo = params.demo === "1" || !session?.user;

  return (
    <AppShell user={session?.user} demo={demo} isAdmin={session?.isAdmin}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">One click away</span>
          <h1>Learning links</h1>
          <p>
            School systems, revision tools and support resources in one place.
          </p>
        </div>
      </div>
      <LearningLinksGrid links={learningLinks} />
    </AppShell>
  );
}
