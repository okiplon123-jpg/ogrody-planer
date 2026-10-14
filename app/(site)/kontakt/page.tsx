import { ContactForm } from "@/components/marketing/ContactForm";
export const metadata = { title: "Kontakt — zadzwoń lub poproś o projekt, NAZWA MARKI [miasto]" };
export default function Page() {
  return (
    <div className="mx-auto grid max-w-[1500px] md:grid-cols-2">
      <div className="border-b-[1.5px] border-ink px-5 py-14 md:border-b-0 md:border-r-[1.5px] md:px-12 md:py-24">
        <p className="eyebrow text-rust">Kontakt</p>
        <h1 className="mt-3 font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.92]">Najszybciej: zadzwoń.</h1>
        <a href="tel:+48000000000" className="mt-8 block font-serif text-5xl text-rust md:text-7xl">[telefon]</a>
        <ul className="eyebrow mt-8 space-y-2 text-ink/70"><li>[adres e-mail]</li><li>[adres firmy]</li><li>pn–pt [godziny]</li><li>Obsługujemy: [miasto i okolice]</li></ul>
      </div>
      <div className="px-5 py-14 md:px-12 md:py-24"><ContactForm title="Wolisz, żebyśmy oddzwonili?" /></div>
    </div>
  );
}
