import { schoolValues } from "@/lib/config";

export function ValuesPillars({
  compact = false,
  heading = true
}: {
  compact?: boolean;
  heading?: boolean;
}) {
  return (
    <section className={compact ? "values-section compact" : "values-section"}>
      {heading && (
        <div className="values-heading">
          <span className="eyebrow">The Dixie way</span>
          <h2>Five values. One school culture.</h2>
          <p>
            The habits that shape how we learn, work together and contribute to
            school life.
          </p>
        </div>
      )}
      <div className="values-grid">
        {schoolValues.map((value) => (
          <article
            className={`value-pillar value-${value.colour}`}
            key={value.id}
          >
            <span className="value-image">
              <img src={value.image} alt="" />
            </span>
            <div>
              <strong>{value.name}</strong>
              {!compact && <p>{value.statement}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
