import { WHATSAPP_URL } from "@/lib/site";

/* C4 sticky bottom bar: the actions, always reachable. Phone first, WhatsApp beside it. */
export function StickyCall() {
  return (
    <aside className="sticky-call" aria-label="Szybki kontakt" data-nosnippet>
      <span className="label hide-sm">pn–pt 7:00–18:00 · Białystok i okolice</span>
      <div className="sticky-actions">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn sticky-wa" aria-label="Napisz na WhatsApp">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.4L2 22l4.7-1.2A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-2.8.7.8-2.7-.2-.3A9 9 0 1 1 12 20.5Zm5-6.7c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1a7.4 7.4 0 0 1-3.7-3.2c-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5l-.9-2c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.8 2.5.8 3.4.7.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3Z"/></svg>
          <span className="hide-sm">WhatsApp</span>
        </a>
        <a href="tel:+48885879108" className="btn btn-signal sticky-call-btn"><span aria-hidden>☎&nbsp;</span>zadzwoń&nbsp;885&nbsp;879&nbsp;108</a>
      </div>
    </aside>
  );
}
