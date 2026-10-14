"use client";
import { useState } from "react";
export function ContactForm() {
  const [v, setV] = useState({ name: "", email: "", msg: "", consent: false });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (v.name.trim().length < 3) x.name = "Podaj imię i nazwisko.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) x.email = "Podaj poprawny adres e-mail.";
    if (v.msg.trim().length < 10) x.msg = "Napisz kilka słów o swoim pomyśle.";
    if (!v.consent) x.consent = "Zgoda jest wymagana.";
    setErr(x); if (!Object.keys(x).length) setDone(true);
  };
  if (done) return <div role="status" className="self-start bg-forest p-8 text-white"><h2 className="font-serif text-4xl">Dziękujemy — to wersja demonstracyjna</h2><p className="mt-3 text-white/80">Formularz nie jest jeszcze podłączony do żadnej usługi, więc <b>wiadomość nie została wysłana</b>.</p></div>;
  const f = (k: "name" | "email" | "msg", label: string, area = false) => (
    <label className="block"><span className="eyebrow mb-1 block text-charcoal/60">{label}</span>
      {area ? <textarea className="min-h-[140px] w-full border border-charcoal/25 bg-white p-3" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} aria-invalid={!!err[k]} /> : <input className="w-full border border-charcoal/25 bg-white p-3" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} aria-invalid={!!err[k]} />}
      {err[k] && <span role="alert" className="mt-1 block text-sm text-red-700">{err[k]}</span>}</label>
  );
  return (
    <form onSubmit={submit} noValidate className="space-y-5 self-start">
      {f("name", "Imię i nazwisko")}{f("email", "Adres e-mail")}{f("msg", "Wiadomość", true)}
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} />Wyrażam zgodę na kontakt w odpowiedzi na wiadomość. <a href="/polityka-prywatnosci" className="underline">Polityka prywatności</a></label>
      {err.consent && <span role="alert" className="block text-sm text-red-700">{err.consent}</span>}
      <button className="btn btn-dark" type="submit">Wyślij wiadomość</button>
    </form>
  );
}
