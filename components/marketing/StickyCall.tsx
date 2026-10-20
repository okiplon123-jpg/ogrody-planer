/* C4 sticky bottom bar: the one action, always reachable. */
export function StickyCall() {
  return (
    <aside className="sticky-call" aria-label="Szybki kontakt">
      <span className="label hide-sm">pn–pt 7:00–18:00 · Białystok i okolice</span>
      <a href="tel:+48885879108" className="btn btn-signal btn-sm ml-auto">zadzwoń&nbsp;885&nbsp;879&nbsp;108</a>
    </aside>
  );
}
