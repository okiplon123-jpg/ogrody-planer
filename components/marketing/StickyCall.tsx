/* C4 sticky bottom bar: the one action, always reachable. */
export function StickyCall() {
  return (
    <aside className="sticky-call" aria-label="Szybki kontakt">
      <span className="label hide-sm">pn–pt [godziny] · [miasto i okolice]</span>
      <a href="tel:+48000000000" className="btn btn-signal btn-sm ml-auto">zadzwoń&nbsp;[telefon]</a>
    </aside>
  );
}
