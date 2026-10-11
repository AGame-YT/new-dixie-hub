import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { BrandMark } from "@/components/BrandMark";
import { authOptions, googleAuthConfigured, localAdminConfigured } from "@/lib/auth";

export const metadata = { title: "Admin sign in" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.isAdmin) redirect("/admin");

  return (
    <div className="admin-login-page">
      <header>
        <BrandMark />
        <Link href="/">Return to Dixie Hub</Link>
      </header>
      <main>
        <div className="admin-login-copy">
          <span className="eyebrow">Staff access</span>
          <h1>Dixie Hub administration</h1>
          <p>
            Manage house points and view adoption, engagement and service-health
            metrics.
          </p>
        </div>
        <AdminLoginForm
          localEnabled={localAdminConfigured}
          googleEnabled={googleAuthConfigured}
        />
        <p className="admin-login-privacy">
          Credentials are checked by the server and are never stored in the
          browser or analytics database.
        </p>
      </main>
    </div>
  );
}
