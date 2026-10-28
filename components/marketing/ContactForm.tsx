"use client";
import { useState } from "react";
import { sendLead } from "@/lib/contact";
import { track } from "@/lib/track";

const AREAS = ["do 30 m²", "30–80 m²", "ponad 80 m²", "nie wiem"];

export function ContactForm({ service, compact = false, withArea = false, idp = "cf" }: { service?: string; compact?: boolean; withArea?: boolean; idp?: string }) {
  const [v, setV] = useState({ name: "", phone: "", msg: "", consent: false });
  const [area, setArea] = useState("");
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
    const ok = await sendLead({ imię: v.name.trim(), telefon: v.phone.trim(), ...(service ? { usługa: service } : {}), ...(area ? { "powierzchnia (orientacyjnie)": area } : {}), wiadomość: v.msg.trim() || "(brak opisu)" }, service ? `Nowe zapytanie: ${service}` : "Nowe zapytanie ze strony", hp);
    if (ok) { setDone(true); track("generate_lead", { method: "formularz", lead_type: "formularz", form_id: idp, interaction_location: location.pathname, ...(service ? { service, service_type: service } : {}), ...(area ? { surface_bucket: area } : {}) }); } else setFail(true);
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
    <form onSubmit={submit} noValidate className={compact ? "space-y-3" : "space-y-5"}>
      <div className="field">
        <label htmlFor={`${idp}-name`} className="label">imię</label>
        <input id={`${idp}-name`} className="input" autoComplete="given-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} aria-invalid={!!err.name} aria-describedby={err.name ? `${idp}-name-e` : undefined} />
        <div className="err-slot" aria-live="polite">{err.name && <p id={`${idp}-name-e`} className="err">{err.name}</p>}</div>
      </div>
      <div className="field">
        <label htmlFor={`${idp}-phone`} className="label">telefon</label>
        <input id={`${idp}-phone`} className="input tnum" type="tel" autoComplete="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} aria-invalid={!!err.phone} aria-describedby={err.phone ? `${idp}-phone-e` : undefined} />
        <div className="err-slot" aria-live="polite">{err.phone && <p id={`${idp}-phone-e`} className="err">{err.phone}</p>}</div>
      </div>
      {withArea && (
        <div role="radiogroup" aria-label="Orientacyjna powierzchnia" className="field">
          <p className="label">powierzchnia (orientacyjnie)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AREAS.map((a) => (
              <button key={a} type="button" role="radio" aria-checked={area === a} onClick={() => setArea(area === a ? "" : a)}
                className={`min-h-11 border border-[var(--color-ink)] px-3 text-[var(--text-sm)] font-semibold ${area === a ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]" : "bg-transparent"}`}>{a}</button>
            ))}
          </div>
        </div>
      )}
      {!compact && (
        <div className="field">
          <label htmlFor={`${idp}-msg`} className="label">co chcesz położyć (opcjonalnie)</label>
          <textarea id={`${idp}-msg`} className="input min-h-[7rem]" value={v.msg} onChange={(e) => setV({ ...v, msg: e.target.value })} />
        </div>
      )}
      <div>
        <label className="flex min-h-11 items-start gap-3 text-[var(--text-sm)]">
          <input type="checkbox" className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--color-ink)]" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} aria-invalid={!!err.consent} />
          <span>Zgadzam się, żeby firma skontaktowała się ze mną w tej sprawie. <a href="/polityka-prywatnosci" className="underline underline-offset-4">Polityka prywatności</a></span>
        </label>
        <div className="err-slot" aria-live="polite">{err.consent && <p className="err">{err.consent}</p>}</div>
      </div>
      <input type="text" name="website" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <button type="submit" disabled={sending} className="btn btn-signal">{sending ? "wysyłam…" : "umów oględziny"}</button>
      <div className="err-slot" aria-live="polite">{fail && <p className="err">Nie udało się wysłać. Zadzwoń: +48 885 879 108 albo napisz na gryczewski.bud@gmail.com.</p>}</div>
    </form>
  );
}
