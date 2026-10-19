"use client";
import { useState } from "react";

export function ContactForm() {
  const [v, setV] = useState({ name: "", phone: "", msg: "", consent: false });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (v.name.trim().length < 3) x.name = "Wpisz imię, żebyśmy wiedzieli, kogo prosić do telefonu.";
    if (v.phone.replace(/\D/g, "").length < 9) x.phone = "Numer ma za mało cyfr. Wpisz pełny numer, np. 600 000 000.";
    if (!v.consent) x.consent = "Zaznacz zgodę na kontakt, inaczej nie możemy oddzwonić.";
    setErr(x);
    if (!Object.keys(x).length) setDone(true);
  };

  if (done) {
    return (
      <div role="status" className="border border-[var(--color-ink)] bg-[var(--color-accent)] p-6">
        <p className="h3">to wersja demonstracyjna.</p>
        <p className="mt-3 prose-m">Formularz nie jest jeszcze podłączony, więc wiadomość nie została wysłana. Zadzwoń: [telefon].</p>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="field">
        <label htmlFor="cf-name" className="label">imię</label>
        <input id="cf-name" className="input" autoComplete="given-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} aria-invalid={!!err.name} aria-describedby={err.name ? "cf-name-e" : undefined} />
        {err.name && <p id="cf-name-e" role="alert" className="err">{err.name}</p>}
      </div>
      <div className="field">
        <label htmlFor="cf-phone" className="label">telefon</label>
        <input id="cf-phone" className="input tnum" type="tel" autoComplete="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} aria-invalid={!!err.phone} aria-describedby={err.phone ? "cf-phone-e" : undefined} />
        {err.phone && <p id="cf-phone-e" role="alert" className="err">{err.phone}</p>}
      </div>
      <div className="field">
        <label htmlFor="cf-msg" className="label">co chcesz położyć (opcjonalnie)</label>
        <textarea id="cf-msg" className="input min-h-[7rem]" value={v.msg} onChange={(e) => setV({ ...v, msg: e.target.value })} />
      </div>
      <div>
        <label className="flex items-start gap-3 text-[var(--text-sm)]">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--color-ink)]" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} aria-invalid={!!err.consent} />
          <span>Zgadzam się, żeby firma oddzwoniła w tej sprawie. <a href="/polityka-prywatnosci" className="underline underline-offset-4">Polityka prywatności</a></span>
        </label>
        {err.consent && <p role="alert" className="err">{err.consent}</p>}
      </div>
      <button type="submit" className="btn btn-signal">poproś o oddzwonienie</button>
    </form>
  );
}
