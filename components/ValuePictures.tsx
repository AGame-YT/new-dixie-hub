import { schoolValues } from "@/lib/config";

/** The five school values as pictures, as on the school website, each with its value colour. */
export function ValuePictures() {
  return (
    <section className="value-pictures" aria-label="School values">
      {schoolValues.map((value) => (
        <figure key={value.id} className={`value-picture value-${value.colour}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.image} alt="" />
          <figcaption>{value.name}</figcaption>
        </figure>
      ))}
    </section>
  );
}
