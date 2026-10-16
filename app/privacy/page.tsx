import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <header><BrandMark /></header>
      <main className="panel">
        <span className="eyebrow">Prototype notice</span>
        <h1>Privacy at Dixie Hub</h1>
        <p>
          Dixie Hub is designed to keep student data to the minimum needed for a
          useful homepage. This prototype uses demo data unless a student signs in
          with an approved Google account.
        </p>
        <h2>Google data</h2>
        <p>
          When enabled, the hub requests read-only access to selected Classroom,
          Gmail or Calendar information. OAuth credentials and tokens are never
          exposed in frontend code. Full email content is not stored.
        </p>
        <h2>Homework preferences</h2>
        <p>
          Local Kanban status overrides may be stored so a student can mark work as
          in progress without changing its Google Classroom submission state.
        </p>
        <h2>Wellbeing check-ins</h2>
        <p>
          If a student answers &ldquo;How are you feeling?&rdquo;, their answer and any
          note are stored and shown only to their form tutor and head of section.
          Check-ins are not monitored around the clock: anyone who needs help
          urgently should speak to a member of staff.
        </p>
        <h2>Usage analytics</h2>
        <p>
          The hub records a small set of first-party operational events: successful
          sign-ins, page views, learning-link clicks, homework status changes and
          Google service sync outcomes. These are used to understand adoption and
          improve the service. Search text, full email content, homework
          descriptions, precise location and OAuth tokens are not included.
        </p>
        <h2>Before school-wide use</h2>
        <p>
          This placeholder must be replaced with a school-approved privacy notice,
          retention policy and safeguarding review before rollout.
        </p>
        <Link href="/" className="button primary small">Return to Dixie Hub</Link>
      </main>
    </div>
  );
}
