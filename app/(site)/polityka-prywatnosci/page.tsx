export const metadata = { title: "Polityka prywatności — NAZWA MARKI" };
export default function Page() {
  return (
    <section className="pad py-[clamp(3rem,8vw,7rem)]">
      <h1 className="h2">polityka prywatności.</h1>
      <div className="mt-10 grid grid-cols-6 md:grid-cols-12">
        <div className="prose-m col-span-6 space-y-4 md:col-span-7">
          <p>[Tu właściwa polityka prywatności firmy.] Ta strona jest wersją roboczą: zdjęcia wgrywane do wizualizatora i projekty z planera zostają wyłącznie w Twojej przeglądarce i nigdzie się nie wysyłają.</p>
          <h2 id="cookies" className="h3 pt-6">ustawienia cookies.</h2>
          <p>Wersja robocza nie używa plików cookies śledzących. Panel zgód pojawi się razem z narzędziami analitycznymi.</p>
        </div>
      </div>
    </section>
  );
}
