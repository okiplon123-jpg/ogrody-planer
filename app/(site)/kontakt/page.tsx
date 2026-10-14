import Link from "next/link";
import { ContactForm } from "./form";
export const metadata = { title: "Kontakt — NAZWA MARKI" };
export default function Page() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-16 px-5 pb-28 pt-36 md:grid-cols-2 md:px-10">
      <div><h1 className="font-serif text-6xl leading-none md:text-8xl">Porozmawiajmy o Twojej posesji</h1>
        <ul className="mt-8 space-y-2 text-lg text-charcoal/70"><li>[adres e-mail]</li><li>[numer telefonu]</li><li>[adres firmy]</li></ul>
        <p className="mt-6 text-sm text-charcoal/55">Dane kontaktowe to wartości zastępcze.</p>
        <Link href="/planer" className="btn btn-dark mt-8">Najpierw zaprojektuj w planerze</Link></div>
      <ContactForm />
    </div>
  );
}
