"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MATERIALS } from "@/lib/catalog";
import { sendLead } from "@/lib/contact";
import { track } from "@/lib/track";
import { WHATSAPP_URL } from "@/lib/site";

type Type = "podjazd" | "taras" | "sciezka" | "plac" | "trawnik" | "rabata";
type Item = { id: number; type: Type; w: string; l: string; material: string };

const TYPES: { id: Type; name: string; group: "kostka" | "trawnik" | "rabata"; w: string; l: string }[] = [
  { id: "podjazd", name: "Podjazd", group: "kostka", w: "3.5", l: "8" },
  { id: "taras", name: "Taras", group: "kostka", w: "4", l: "5" },
  { id: "sciezka", name: "Ścieżka", group: "kostka", w: "1.2", l: "10" },
  { id: "plac", name: "Plac / parking", group: "kostka", w: "6", l: "8" },
  { id: "trawnik", name: "Trawnik", group: "trawnik", w: "8", l: "10" },
  { id: "rabata", name: "Rabata", group: "rabata", w: "2", l: "6" },
];
const SURFACES = MATERIALS.filter((m) => m.kind === "surface");
const CATS = [...new Set(SURFACES.map((m) => m.cat))];
const WASTE = 8;

const num = (v: string) => { const n = parseFloat(v.replace(",", ".")); return Number.isFinite(n) && n > 0 ? n : 0; };
const m2 = (n: number) => `${(Math.round(n * 10) / 10).toLocaleString("pl-PL")} m²`;
const defaultMaterial = (t: Type) => (t === "trawnik" ? "z rolki" : t === "rabata" ? "kora" : "kb-szara");

/** Phone version of the planner: a short list instead of a drawing board. Quantities only, sent straight to the company. */
export default function MobilePlanner() {
  const [items, setItems] = useState<Item[]>([{ id: 1, type: "podjazd", w: "3.5", l: "8", material: "kb-szara" }]);
  const [lead, setLead] = useState({ name: "", phone: "", consent: false });
  const [err, setErr] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "fail">("idle");

  const patch = (id: number, p: Partial<Item>) => setItems((a) => a.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const setType = (id: number, t: Type) => { const d = TYPES.find((x) => x.id === t)!; patch(id, { type: t, w: d.w, l: d.l, material: defaultMaterial(t) }); };
  const add = () => setItems((a) => [...a, { id: Math.max(0, ...a.map((x) => x.id)) + 1, type: "trawnik", w: "8", l: "10", material: "z rolki" }]);

  const sum = useMemo(() => {
    const t = { kostka: 0, trawnik: 0, rabata: 0 };
    for (const it of items) t[TYPES.find((x) => x.id === it.type)!.group] += num(it.w) * num(it.l);
    return t;
  }, [items]);
  const matName = (it: Item) => (TYPES.find((x) => x.id === it.type)!.group === "kostka" ? SURFACES.find((m) => m.id === it.material)?.name ?? "do ustalenia" : it.material);

  const send = async () => {
    if (lead.name.trim().length < 3) return setErr("Wpisz imię.");
    if (lead.phone.replace(/\D/g, "").length < 9) return setErr("Numer telefonu ma za mało cyfr.");
    if (!lead.consent) return setErr("Zaznacz zgodę na kontakt.");
    setErr(""); setState("sending");
    const lines = items.map((it) => `${TYPES.find((x) => x.id === it.type)!.name} ${it.w}×${it.l} m (${m2(num(it.w) * num(it.l))}), ${matName(it)}`);
    const ok = await sendLead({
      imię: lead.name.trim(), telefon: lead.phone.trim(),
      elementy: lines.join(" | "),
      zestawienie: `Kostka i nawierzchnie: ${m2(sum.kostka)} (z zapasem ${WASTE}%: ${m2(sum.kostka * (1 + WASTE / 100))}) | Trawnik: ${m2(sum.trawnik)} | Rabaty: ${m2(sum.rabata)}`,
    }, "Zgłoszenie z planera (telefon)");
    setState(ok ? "sent" : "fail");
    if (ok) track("generate_lead", { method: "planer-mobilny" });
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] pb-28 text-[var(--color-ink)]">
      <header className="flex items-center justify-between border-b border-[var(--color-ink)] pad py-3">
        <Link href="/" className="wordmark" aria-label="Strona główna">gryczewski<span className="period" aria-hidden /></Link>
        <a href="tel:+48885879108" className="btn btn-signal btn-sm">zadzwoń</a>
      </header>

      <main className="pad pt-8">
        <p className="label">planer · 1 minuta</p>
        <h1 className="h2 mt-2" style={{ fontSize: "clamp(1.9rem, 8vw, 2.6rem)" }}>policz, ile kostki i trawnika potrzeba.</h1>
        <p className="prose-m mt-3">Dodaj elementy i wpisz wymiary w metrach. Wynik jest orientacyjny. Dokładną wycenę podajemy po obejrzeniu terenu.</p>

        <ol className="mt-8 space-y-4">
          {items.map((it, i) => {
            const t = TYPES.find((x) => x.id === it.type)!;
            const area = num(it.w) * num(it.l);
            return (
              <li key={it.id} className="border border-[var(--color-ink)] p-4">
                <div className="flex items-center justify-between">
                  <p className="label">element {i + 1}</p>
                  {items.length > 1 && <button type="button" className="min-h-11 px-2 text-[var(--text-sm)] underline" onClick={() => setItems((a) => a.filter((x) => x.id !== it.id))}>usuń</button>}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Rodzaj elementu">
                  {TYPES.map((x) => (
                    <button key={x.id} type="button" role="radio" aria-checked={it.type === x.id} onClick={() => setType(it.id, x.id)}
                      className={`min-h-12 border border-[var(--color-ink)] px-1 text-[var(--text-sm)] font-semibold leading-tight ${it.type === x.id ? "bg-[var(--color-accent)]" : ""}`}>{x.name}</button>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="block"><span className="label">szerokość (m)</span>
                    <input className="input tnum mt-1" inputMode="decimal" value={it.w} onChange={(e) => patch(it.id, { w: e.target.value })} /></label>
                  <label className="block"><span className="label">długość (m)</span>
                    <input className="input tnum mt-1" inputMode="decimal" value={it.l} onChange={(e) => patch(it.id, { l: e.target.value })} /></label>
                </div>
                <p className="mt-2 text-[var(--text-lg)] font-extrabold tnum">{area ? `= ${m2(area)}` : "wpisz wymiary"}</p>
                {t.group === "kostka" && (
                  <label className="mt-3 block"><span className="label">kostka lub płyty</span>
                    <select className="input mt-1" value={it.material} onChange={(e) => patch(it.id, { material: e.target.value })}>
                      {CATS.map((c) => <optgroup key={c} label={c}>{SURFACES.filter((m) => m.cat === c).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>)}
                    </select></label>
                )}
                {t.group === "trawnik" && (
                  <label className="mt-3 block"><span className="label">sposób założenia</span>
                    <select className="input mt-1" value={it.material} onChange={(e) => patch(it.id, { material: e.target.value })}>
                      {["z rolki", "z siewu", "nie wiem"].map((x) => <option key={x}>{x}</option>)}
                    </select></label>
                )}
              </li>
            );
          })}
        </ol>
        <button type="button" className="btn btn-line mt-4 w-full" onClick={add}>+ dodaj kolejny element</button>

        <section aria-label="Zestawienie" className="mt-8 border-y border-[var(--color-ink)] py-5">
          <p className="label">zestawienie</p>
          {([["Kostka i nawierzchnie", sum.kostka], ["Trawnik", sum.trawnik], ["Rabaty", sum.rabata]] as [string, number][]).filter(([, v]) => v > 0).map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between border-t border-[var(--color-rule)] py-3 first:border-t-0">
              <span className="prose-m">{k}</span><span className="tnum text-[var(--text-xl)] font-extrabold">{m2(v)}</span>
            </div>
          ))}
          {sum.kostka > 0 && <p className="prose-m text-[var(--color-ink-2)]">Kostka z zapasem {WASTE}%: <strong className="tnum">{m2(sum.kostka * (1 + WASTE / 100))}</strong></p>}
          {!sum.kostka && !sum.trawnik && !sum.rabata && <p className="prose-m">Wpisz wymiary, a zobaczysz wynik.</p>}
        </section>

        <section className="mt-8">
          <h2 className="h3">wyślij to do nas.</h2>
          <p className="prose-m mt-2">Dostaniemy zestawienie i oddzwonimy, żeby umówić oględziny. Bez zobowiązań.</p>
          {state === "sent" ? (
            <p role="status" className="mt-4 border border-[var(--color-ink)] bg-[var(--color-accent)] p-4 font-semibold">Wysłane. Oddzwonimy w godzinach pracy (pn–pt 7:00–18:00).</p>
          ) : (
            <div className="mt-4 space-y-3">
              <label className="block"><span className="label">imię</span><input className="input mt-1" autoComplete="given-name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} /></label>
              <label className="block"><span className="label">telefon</span><input className="input tnum mt-1" type="tel" autoComplete="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} /></label>
              <label className="flex min-h-11 items-start gap-3 text-[var(--text-sm)]">
                <input type="checkbox" className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--color-ink)]" checked={lead.consent} onChange={(e) => setLead({ ...lead, consent: e.target.checked })} />
                <span>Zgadzam się, żeby firma skontaktowała się ze mną w tej sprawie. <a href="/polityka-prywatnosci" className="underline" target="_blank">Polityka prywatności</a></span>
              </label>
              <button type="button" className="btn btn-signal w-full" onClick={send} disabled={state === "sending"}>{state === "sending" ? "wysyłam…" : "wyślij zestawienie"}</button>
              <p role="alert" className="text-[var(--text-sm)] text-[var(--color-error)]">{err || (state === "fail" ? "Nie udało się wysłać. Zadzwoń: 885 879 108." : "")}</p>
            </div>
          )}
        </section>

        <p className="prose-m mt-10 text-[var(--color-ink-2)]">Wolisz narysować działkę w 2D i 3D? Pełny edytor działa najlepiej na komputerze lub tablecie. <Link href="/planer?pelny=1" className="underline underline-offset-4">Otwórz pełny edytor</Link></p>
      </main>

      <aside className="sticky-call" aria-label="Szybki kontakt">
        <div className="sticky-actions">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn sticky-wa" aria-label="Napisz na WhatsApp"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.4L2 22l4.7-1.2A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-2.8.7.8-2.7-.2-.3A9 9 0 1 1 12 20.5Zm5-6.7c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1a7.4 7.4 0 0 1-3.7-3.2c-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5l-.9-2c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.8 2.5.8 3.4.7.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3Z"/></svg></a>
          <a href="tel:+48885879108" className="btn btn-signal sticky-call-btn"><span aria-hidden>☎&nbsp;</span>zadzwoń&nbsp;885&nbsp;879&nbsp;108</a>
        </div>
      </aside>
    </div>
  );
}
