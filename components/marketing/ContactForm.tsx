"use client";
import { useState } from "react";
import { sendLead } from "@/lib/contact";

export function ContactForm() {
  const [v, setV] = useState({ name: "", phone: "", msg: "", consent: false });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [fail, setFail] = useState(false);
  const [hp, setHp] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (v.name.trim().length < 3) x.name = "Wpisz imię, żebyśmy wiedzieli, kogo prosić do telefonu.";
    if (v.phone.replace(/\D/g, "").length < 9) x.phone = "Numer ma za mało cyfr. Wpisz pełny numer, np. 600 000 000.";
    if (!v.consent) x.consent = "Zaznacz zgodę na kontakt, inaczej nie możemy się z Tobą skontaktować.";
    setErr(x);
    if (Object.keys(x).length || sending) return;
    setSending(true); setFail(false);
    const ok = await sendLead({ imię: v.name.trim(), telefon: v.phone.trim(), wiadomość: v.msg.trim() || "(brak opisu)" }, "Nowe zapytanie ze strony", hp);
    if (ok) setDone(true); else setFail(true);
    setSending(false);
  };

  if (done) {
    return (
      <div role="status" className="border border-[var(--color-ink)] bg-[var(--color-accent)] p-6">
        <p className="h3">dziękujemy, wiadomość poszła.</p>
        <p className="mt-3 prose-m">Odezwiemy się w godzinach pracy (pn–pt 7:00–18:00). Pilna sprawa? Zadzwoń: +48 885 879 108.</p>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="field">
        <label htmlFor="cf-name" className="label">imię</label>
        <input id="cf-name" className="input" autoComplete="given-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} aria-invalid={!!err.name} aria-describedby={err.name ? "cf-name-e" : undefined} />
        <div className="err-slot" aria-live="polite">{err.name && <p id="cf-name-e" className="err">{err.name}</p>}</div>
      </div>
      <div className="field">
        <label htmlFor="cf-phone" className="label">telefon</label>
        <input id="cf-phone" className="input tnum" type="tel" autoComplete="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} aria-invalid={!!err.phone} aria-describedby={err.phone ? "cf-phone-e" : undefined} />
        <div className="err-slot" aria-live="polite">{err.phone && <p id="cf-phone-e" className="err">{err.phone}</p>}</div>
      </div>
      <div className="field">
        <label htmlFor="cf-msg" className="label">co chcesz położyć (opcjonalnie)</label>
        <textarea id="cf-msg" className="input min-h-[7rem]" value={v.msg} onChange={(e) => setV({ ...v, msg: e.target.value })} />
      </div>
      <div>
        <label className="flex items-start gap-3 text-[var(--text-sm)]">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--color-ink)]" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} aria-invalid={!!err.consent} />
          <span>Zgadzam się, żeby firma skontaktowała się ze mną w tej sprawie. <a href="/polityka-prywatnosci" className="underline underline-offset-4">Polityka prywatności</a></span>
        </label>
        <div className="err-slot" aria-live="polite">{err.consent && <p className="err">{err.consent}</p>}</div>
      </div>
      <input type="text" name="website" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <button type="submit" disabled={sending} className="btn btn-signal">{sending ? "wysyłam…" : "poproś o kontakt"}</button>
      <div className="err-slot" aria-live="polite">{fail && <p className="err">Nie udało się wysłać. Zadzwoń: +48 885 879 108 albo napisz na gryczewski.bud@gmail.com.</p>}</div>
    </form>
  );
}
