import { CookieSettings } from "@/components/marketing/Cookies";
export const metadata = { title: "Polityka prywatności i cookies — NAZWA MARKI Białystok", description: "Kto przetwarza Twoje dane, po co, jak długo i jakie masz prawa. Informacja o cookies i pamięci przeglądarki." };

const S = ({ n, t, children }: { n: string; t: string; children: React.ReactNode }) => (
  <section className="grid grid-cols-6 gap-y-3 border-t border-[var(--color-rule)] py-8 md:grid-cols-12">
    <p className="label col-span-6 md:col-span-1" aria-hidden>{n}</p>
    <h2 className="h3 col-span-6 md:col-span-4" style={{ fontSize: "clamp(1.3rem, 2.2vw, 1.75rem)" }}>{t}</h2>
    <div className="prose-m col-span-6 space-y-3 md:col-span-6 md:col-start-7">{children}</div>
  </section>
);

export default function Page() {
  return (
    <section className="pad py-[clamp(3rem,8vw,7rem)]">
      <h1 className="h2">polityka prywatności.</h1>
      <p className="prose-m mt-6 max-w-[40rem]">Piszemy to prosto: kto zbiera dane, po co, jak długo je trzyma i co możesz z nimi zrobić. Ostatnia aktualizacja: 20 października 2026.</p>

      <div className="mt-12">
        <S n="01" t="kto jest administratorem">
          <p>Administratorem Twoich danych osobowych jest Patryk Gryczewski, prowadzący działalność pod nazwą [nazwa firmy], ul. Tysiąclecia P.P, 15-111 Białystok, NIP 5423470508.</p>
          <p>Kontakt w sprawach danych: telefon <a href="tel:+48885879108" className="font-bold">+48 885 879 108</a>, e-mail [adres e-mail].</p>
        </S>
        <S n="02" t="kiedy zbieramy dane">
          <p><strong>Kontakt telefoniczny lub przez formularz.</strong> Podajesz imię, numer telefonu i opcjonalnie opis prac. Używamy ich, żeby oddzwonić, umówić oględziny terenu i odpowiedzieć na pytanie. Podstawa: nasz uzasadniony interes w odpowiedzi na zapytanie oraz działania przed zawarciem umowy (art. 6 ust. 1 lit. f i b RODO). Dane trzymamy do zakończenia rozmowy; jeśli dojdzie do umowy, przez czas wymagany przepisami podatkowymi i rachunkowymi oraz do przedawnienia roszczeń.</p>
          <p><strong>Zgoda na kontakt.</strong> Zaznaczenie zgody w formularzu jest potrzebne, żebyśmy mogli oddzwonić. Możesz ją cofnąć w każdej chwili, bez wpływu na wcześniejsze przetwarzanie.</p>
          <p>Podanie danych jest dobrowolne, ale bez numeru telefonu nie oddzwonimy.</p>
        </S>
        <S n="03" t="wizualizator i planer">
          <p>Zdjęcia wgrywane do wizualizatora i projekty rysowane w planerze ogrodu są przetwarzane wyłącznie w Twojej przeglądarce. Nie wysyłamy ich na serwer, nie widzimy ich i nie przechowujemy.</p>
          <p>Jeśli klikniesz „zapisz projekt”, projekt trafia do pamięci Twojej przeglądarki (localStorage) na tym urządzeniu. Możesz go usunąć, czyszcząc dane strony w ustawieniach przeglądarki.</p>
        </S>
        <S n="04" t="logi serwera i hosting">
          <p>Strona jest udostępniana przez dostawcę hostingu [nazwa dostawcy hostingu, do uzupełnienia po publikacji]. Serwer może zapisywać standardowe dane techniczne wizyty, np. adres IP, czas i adres żądanej strony, w celu zapewnienia bezpieczeństwa i działania serwisu. Nie łączymy ich z Twoją tożsamością.</p>
          <p>Czcionki są serwowane z naszej strony, więc nie łączą się z zewnętrznymi usługami czcionek.</p>
        </S>
        <S n="05" t="komu przekazujemy dane">
          <p>Dane nie są sprzedawane. Mogą je otrzymać wyłącznie podmioty, które pomagają nam prowadzić stronę i firmę (hosting, księgowość, obsługa IT) na podstawie umów powierzenia, oraz organy, jeśli wymaga tego prawo. [do potwierdzenia przez firmę: lista faktycznych odbiorców]</p>
        </S>
        <S n="06" t="twoje prawa">
          <p>Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz sprzeciwu wobec przetwarzania opartego na naszym uzasadnionym interesie. Aby z nich skorzystać, zadzwoń lub napisz na dane z punktu 01.</p>
          <p>Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).</p>
          <p>Nie podejmujemy wobec Ciebie decyzji w sposób zautomatyzowany i nie profilujemy Cię.</p>
        </S>
        <S n="07" t="cookies i pamięć przeglądarki">
          <p>Ta strona nie ustawia cookies analitycznych, reklamowych ani śledzących. Zapisuje w przeglądarce tylko dwie rzeczy: projekt z planera (jeśli go zapiszesz) i Twój wybór ustawień poniżej. Oba zapisy zostają na Twoim urządzeniu.</p>
          <p>Jeśli w przyszłości dodamy narzędzia analityczne lub reklamowe, włączymy je dopiero po Twojej zgodzie i zaktualizujemy tę stronę.</p>
        </S>
      </div>

      <div id="cookies" className="scroll-mt-20 pt-6">
        <h2 className="h3">ustawienia cookies.</h2>
        <CookieSettings />
      </div>
    </section>
  );
}
