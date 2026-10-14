"use client";
import { useState } from "react";
export function ContactForm({ title = "Poproś o projekt" }: { title?: string }) {
  const [v, setV] = useState({ name: "", phone: "", msg: "", consent: false });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (v.name.trim().length < 3) x.name = "Podaj imię.";
    if (v.phone.replace(/\D/g, "").length < 9) x.phone = "Podaj numer telefonu (min. 9 cyfr).";
    if (!v.consent) x.consent = "Zgoda jest wymagana.";
    setErr(x); if (!Object.keys(x).length) setDone(true);
  };
  if (done) return <div role="status" className="border-[1.5px] border-ink bg-rust p-6 text-white"><p className="font-serif text-3xl">Wersja demonstracyjna</p><p className="mt-2">Formularz nie jest jeszcze podłączony — wiadomość nie została wysłana. Zadzwoń: [telefon].</p></div>;
  const f = (k: "name" | "phone" | "msg", label: string, area = false) => (
    <label className="block"><span className="eyebrow mb-1 block">{label}</span>
      {area ? <textarea className="min-h-[110px] w-full border-[1.5px] border-ink bg-paper p-3" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /> : <input className="w-full border-[1.5px] border-ink bg-paper p-3" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} aria-invalid={!!err[k]} />}
      {err[k] && <span role="alert" className="mt-1 block text-sm text-rust">{err[k]}</span>}</label>
  );
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <h3 className="font-serif text-3xl">{title}</h3>
      {f("name", "Imię")}{f("phone", "Telefon")}{f("msg", "Co chcesz położyć? (opcjonalnie)", true)}
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} />Zgadzam się, żeby firma oddzwoniła w tej sprawie. <a href="/polityka-prywatnosci" className="underline">Polityka prywatności</a></label>
      {err.consent && <span role="alert" className="block text-sm text-rust">{err.consent}</span>}
      <button type="submit" className="btn btn-rust">Oddzwońcie do mnie</button>
    </form>
  );
}
