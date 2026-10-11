import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="Dixie Hub home">
      <span className="brand-crest" aria-hidden="true">
        {/* Official school crest supplied through the public Dixie website. */}
        <img src="/brand/dixie-round.jpg" alt="" />
      </span>
      {!compact && (
        <span className="brand-copy">
          <strong>Dixie Hub</strong>
          <small>The Dixie Grammar School</small>
        </span>
      )}
    </Link>
  );
}
