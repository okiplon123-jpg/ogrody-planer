"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { fmtM, fmtM3, summarize } from "@/lib/summary";
import { fmtArea } from "@/lib/geometry";
import { PlanLayer } from "./PlanLayer";
import { sendLead } from "@/lib/contact";
import { encodeProject } from "@/lib/share";
import { track } from "@/lib/track";

export function Summary() {
  const s = useStore();
  const { project, settings } = s;
  const sum = useMemo(() => summarize(project, settings.waste), [project, settings.waste]);
  const [notes, setNotes] = useState("");
  const [lead, setLead] = useState({ name: "", phone: "", consent: false });
  const [leadErr, setLeadErr] = useState("");
  const [leadState, setLeadState] = useState<"idle" | "sending" | "sent" | "fail">("idle");
  const submitLead = async () => {
    if (lead.name.trim().length < 3) return setLeadErr("Wpisz imię.");
    if (lead.phone.replace(/\D/g, "").length < 9) return setLeadErr("Numer telefonu ma za mało cyfr.");
    if (!lead.consent) return setLeadErr("Zaznacz zgodę na kontakt.");
    setLeadErr(""); setLeadState("sending");
    const link = `${location.origin}/planer#p=${await encodeProject(project)}`;
    const lines = [
      `Projekt: ${project.name}, działka ${project.plot.w} × ${project.plot.l} m`,
      `Kostka i nawierzchnie: ${fmtArea(sum.paved)} (podjazd ${fmtArea(sum.driveway)}, taras ${fmtArea(sum.terrace)}, ścieżki ${fmtArea(sum.path)}, inne ${fmtArea(sum.other)})`,
      `Trawnik: ${fmtArea(sum.lawn)}, rabaty: ${fmtArea(sum.beds)}`,
      `Obrzeża: ${sum.edging ? fmtM(sum.edging) : "—"}, ogrodzenie: ${sum.fence ? fmtM(sum.fence) : "—"}, żywopłot: ${sum.hedge ? fmtM(sum.hedge) : "—"}`,
      `Drzewa: ${sum.counts.trees}, krzewy: ${sum.counts.shrubs}, lampy: ${sum.counts.lights}`,
    ];
    const ok = await sendLead({ imię: lead.name.trim(), telefon: lead.phone.trim(), uwagi: notes.trim() || "(brak)", zestawienie: lines.join(" | "), "link do projektu": link }, "Zgłoszenie z planera ogrodu");
    setLeadState(ok ? "sent" : "fail");
    if (ok) track("generate_lead", { method: "planer" });
  };
  const rows: [string, number, string][] = [
    ["Podjazd", sum.driveway, "var(--data-driveway)"], ["Taras", sum.terrace, "var(--data-terrace)"], ["Ścieżki", sum.path, "var(--data-path)"],
    ["Inne nawierzchnie", sum.other, "var(--data-other)"], ["Trawnik", sum.lawn, "var(--data-lawn)"], ["Rabaty", sum.beds, "var(--data-bed)"],
  ];
  const total = rows.reduce((a, r) => a + r[1], 0) || 1;
  const download = () => {
    if (!s.preview3d) { s.notify("Najpierw otwórz widok 3D — zrzut zostanie wygenerowany z aktualnej sceny."); return; }
    const a = document.createElement("a"); a.href = s.preview3d; a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}-wizualizacja.png`; a.click();
  };
  return (
    <div className="absolute inset-0 z-40 overflow-y-auto bg-[var(--color-paper)]" role="dialog" aria-label="Podsumowanie projektu">
      <div className="mx-auto max-w-[1180px] px-5 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div><h2 className="h2">{project.name}</h2></div>
          <button className="pl-btn" onClick={() => s.set({ summaryOpen: false })}>← Wróć do planera</button>
        </div>
        <div className="grid gap-6">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-[var(--color-rule)] bg-[var(--color-paper)]">
                <div className="pl-label px-3 py-2">Plan 2D</div>
                <svg role="img" aria-label="Plan 2D projektu" viewBox={`-2 -2 ${project.plot.w + 4} ${project.plot.l + 12}`} className="block w-full bg-[var(--color-paper-3)]"><PlanLayer project={project} /></svg>
              </div>
              <div className="border border-[var(--color-rule)] bg-[var(--color-paper)]">
                <div className="pl-label px-3 py-2">Widok 3D</div>
                {s.preview3d ? <img src={s.preview3d} alt="Wizualizacja 3D projektu" className="block w-full" /> : <div className="flex aspect-[3/4] items-center justify-center p-4 text-center text-[12px] text-[var(--color-muted)]">Przygotowuję podgląd 3D… Jeśli się nie pojawi, przełącz na „Widok 3D” i wróć tutaj.</div>}
              </div>
            </div>
            <div className="border border-[var(--color-rule)] bg-[var(--color-paper)] p-4">
              <div className="pl-label mb-3">Zestawienie powierzchni (liczone z geometrii projektu)</div>
              <div className="mb-3 flex h-3 w-full overflow-hidden">{rows.map(([n, a, c]) => a > 0 && <div key={n} title={n} style={{ width: `${(a / total) * 100}%`, background: c }} />)}</div>
              <table className="w-full text-[13px]"><tbody>
                {rows.map(([n, a, c]) => (
                  <tr key={n} className="border-t border-[var(--color-rule)]"><td className="py-1.5"><span className="mr-2 inline-block h-2.5 w-2.5" style={{ background: c }} />{n}</td><td className="py-1.5 text-right tabular-nums text-[var(--color-ink)]">{fmtArea(a)}</td></tr>
                ))}
                <tr className="border-t border-[var(--color-rule)] text-[var(--color-muted)]"><td className="py-1.5">Działka (całość)</td><td className="py-1.5 text-right tabular-nums">{fmtArea(sum.plot)}</td></tr>
              </tbody></table>
              <div className="pl-label mb-2 mt-5">Ilości materiałów (szacunek) (zapas {settings.waste}%)</div>
              {sum.byMaterial.length ? <table className="w-full text-[13px]"><tbody>
                {sum.byMaterial.map((m) => <tr key={m.id} className="border-t border-[var(--color-rule)]"><td className="py-1.5">{m.name}</td><td className="py-1.5 text-right tabular-nums text-[var(--color-muted)]">{fmtArea(m.area)}</td><td className="py-1.5 text-right tabular-nums text-[var(--color-ink)]">{fmtArea(m.withWaste)}</td></tr>)}
              </tbody></table> : <p className="text-[12px] text-[var(--color-muted)]">Brak nawierzchni w projekcie.</p>}
              <p className="mt-4 text-[11px] leading-relaxed text-[var(--color-muted)]">Wartości są szacunkowe i wynikają wyłącznie z narysowanego planu (nakładające się obszary nie są odejmowane).</p>
              <div className="pl-label mb-2 mt-5">Pozostałe ilości</div>
              <table className="w-full text-[13px]"><tbody>
                {([
                  ["Kostka i nawierzchnie razem", fmtArea(sum.paved) + " (z zapasem " + fmtArea(sum.paved * (1 + settings.waste / 100)) + ")"],
                  ["Obrzeża (obwód nawierzchni z wybranym obrzeżem)", sum.edging ? fmtM(sum.edging) : "—"],
                  ["Ogrodzenie", sum.fence ? fmtM(sum.fence) : "—"],
                  ["Żywopłot", sum.hedge ? fmtM(sum.hedge) : "—"],
                  ["Kora na rabatach (warstwa 5 cm)", sum.mulchM3 ? fmtM3(sum.mulchM3) : "—"],
                  ["Drzewa", String(sum.counts.trees) + " szt."],
                  ["Krzewy", String(sum.counts.shrubs) + " szt."],
                  ["Trawy ozdobne", String(sum.counts.grasses) + " szt."],
                  ["Lampy ogrodowe", String(sum.counts.lights) + " szt."],
                  ["Donice, ławki, pergole, oczka wodne", `${sum.counts.planters}, ${sum.counts.benches}, ${sum.counts.pergolas}, ${sum.counts.water}`],
                ] as [string, string][]).map(([k, v]) => <tr key={k} className="border-t border-[var(--color-rule)]"><td className="py-1.5">{k}</td><td className="py-1.5 text-right tabular-nums text-[var(--color-ink)]">{v}</td></tr>)}
              </tbody></table>
            </div>
            <label className="block"><span className="pl-label mb-1 block">Uwagi do projektu (opcjonalnie)</span><textarea className="pl-input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Np. preferowany kolor kostki, istniejące drzewa do zachowania…" /></label>
            <div className="border border-[var(--color-ink)] bg-[var(--color-paper)] p-4">
              <div className="pl-label mb-1">Wyślij projekt do firmy</div>
              <p className="mb-3 text-[12px] leading-relaxed text-[var(--color-muted)]">Firma dostanie Twój projekt razem z zestawieniem ilości i odezwie się, żeby umówić oględziny. Zostaw imię i numer telefonu.</p>
              {leadState === "sent" ? (
                <p role="status" className="bg-[var(--color-accent)] p-3 text-[13px] font-semibold text-[var(--color-accent-ink)]">Projekt wysłany. Odezwiemy się w godzinach pracy (pn–pt 7:00–18:00).</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className="pl-input" placeholder="Imię" autoComplete="given-name" aria-label="Imię" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
                  <input className="pl-input" placeholder="Telefon" type="tel" autoComplete="tel" aria-label="Telefon" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
                  <label className="flex items-start gap-2 text-[12px] sm:col-span-2"><input type="checkbox" className="mt-0.5" checked={lead.consent} onChange={(e) => setLead({ ...lead, consent: e.target.checked })} /><span>Zgadzam się, żeby firma skontaktowała się ze mną w tej sprawie i otrzymała mój projekt. <a href="/polityka-prywatnosci" target="_blank" className="underline">Polityka prywatności</a></span></label>
                  <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                    <button className="pl-btn pl-btn-primary" onClick={submitLead} disabled={leadState === "sending"}>{leadState === "sending" ? "Wysyłam…" : "Wyślij projekt"}</button>
                    <span role="alert" className="text-[12px] text-[var(--color-error)]">{leadErr || (leadState === "fail" ? "Nie udało się wysłać. Zadzwoń: +48 885 879 108." : "")}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="pl-btn pl-btn-primary" onClick={s.save}>Zapisz projekt</button>
              <button className="pl-btn" onClick={download}>Pobierz wizualizację</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
