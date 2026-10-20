"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "cookie-consent";
type Choice = { v: 1; analytics: boolean; marketing: boolean; at: string };
const read = (): Choice | null => { try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as Choice) : null; } catch { return null; } };
const write = (c: Choice) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* zapis zablokowany: wybór obowiązuje do końca wizyty */ } window.dispatchEvent(new Event("cookie-consent")); };

/* Pasek informacyjny: pokazuje się, dopóki użytkownik nie potwierdzi albo nie zapisze ustawień. */
export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const sync = () => setShow(!read());
    sync();
    window.addEventListener("cookie-consent", sync);
    return () => window.removeEventListener("cookie-consent", sync);
  }, []);
  if (!show) return null;
  return (
    <div role="region" aria-label="Informacja o cookies" className="cookie-notice">
      <p className="prose-m">Strona nie używa cookies analitycznych ani reklamowych. Zapisuje w przeglądarce tylko to, co sam zapiszesz w planerze.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-signal btn-sm" onClick={() => write({ v: 1, analytics: false, marketing: false, at: new Date().toISOString() })}>rozumiem</button>
        <Link href="/polityka-prywatnosci#cookies" className="btn btn-line btn-sm">ustawienia</Link>
      </div>
    </div>
  );
}

/* Panel ustawień na stronie polityki prywatności. */
export function CookieSettings() {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { const c = read(); if (c) { setAnalytics(c.analytics); setMarketing(c.marketing); } }, []);
  const save = (a: boolean, m: boolean) => { write({ v: 1, analytics: a, marketing: m, at: new Date().toISOString() }); setSaved(true); };
  const rows: [string, string, boolean | null, (v: boolean) => void][] = [
    ["niezbędne", "Zawsze włączone. Zapis projektu z planera w pamięci przeglądarki (klucz ogrody-planer:project) i zapamiętanie tego wyboru (klucz cookie-consent). Nie są to pliki śledzące i nie opuszczają Twojego urządzenia.", null, () => {}],
    ["analityczne", "Obecnie nie używamy żadnych narzędzi analitycznych. Jeśli się pojawią, włączymy je tylko za Twoją zgodą.", analytics, setAnalytics],
    ["marketingowe", "Obecnie nie używamy żadnych cookies reklamowych. Jeśli się pojawią, włączymy je tylko za Twoją zgodą.", marketing, setMarketing],
  ];
  return (
    <div className="mt-6 border-y border-[var(--color-ink)]">
      {rows.map(([name, desc, val, set]) => (
        <div key={name} className="grid grid-cols-6 items-start gap-y-2 border-b border-[var(--color-rule)] py-4 last:border-b-0 md:grid-cols-12">
          <p className="h3 col-span-4 md:col-span-3" style={{ fontSize: "var(--text-lg)" }}>{name}</p>
          <label className="col-span-2 flex min-h-11 items-center justify-end gap-2 md:col-span-2 md:order-last">
            <input type="checkbox" className="h-5 w-5 accent-[var(--color-ink)]" checked={val ?? true} disabled={val === null} onChange={(e) => { set(e.target.checked); setSaved(false); }} aria-label={`${name}: ${val === null ? "zawsze włączone" : "zgoda"}`} />
            <span className="label">{val === null ? "zawsze" : val ? "tak" : "nie"}</span>
          </label>
          <p className="prose-m col-span-6 md:col-span-7">{desc}</p>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3 py-4">
        <button type="button" className="btn btn-signal" onClick={() => save(analytics, marketing)}>zapisz wybór</button>
        <button type="button" className="btn btn-line" onClick={() => { setAnalytics(false); setMarketing(false); save(false, false); }}>tylko niezbędne</button>
        <p role="status" className="label">{saved ? "zapisano" : ""}</p>
      </div>
    </div>
  );
}
