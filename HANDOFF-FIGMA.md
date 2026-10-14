# Handoff do Figma / Figma Make — strona + planer ogrodu (NAZWA MARKI)

## Co to jest
Strona firmy brukarsko‑ogrodniczej (PL) + planer ogrodu 2D/3D. Stack: Next.js, React, TypeScript, Tailwind v4, React Three Fiber, zustand. Uruchomienie: `npm install && npm run dev` → http://localhost:3000 (planer: `/planer`).

## Decyzja: BEZ WYCENY
Nie ma formularza wyceny ani przycisku „do wyceny”. Planer kończy się ekranem „Podsumowanie” (powierzchnie, ilości, zapis, pobranie wizualizacji). Zostaje tylko prosty formularz kontaktowy (`/kontakt`, symulowany).

## Zgłoszone problemy (do naprawy — to jest najważniejsze)
1. **Planer jest mało intuicyjny.** Za dużo naraz: 7 kategorii w lewym pasku + panel + pasek właściwości + przełącznik 2D/3D + ukryte uchwyty. Nowy użytkownik nie wie od czego zacząć ani co kliknąć.
   Do przemyślenia przez projektanta:
   - Jasny, liniowy przepływ (np. 1 Działka → 2 Dom → 3 Podjazd/taras → 4 Ogród → 5 Podgląd 3D) z widocznym „co dalej”.
   - Dodawanie obiektów przeciągnij‑i‑upuść z biblioteki na plan (dziś: klik dodaje na środek).
   - Widoczne, podpisane narzędzia na płótnie (zaznacz / rysuj / przesuń widok), podpowiedzi przy pierwszym użyciu.
   - Mniej opcji domyślnie, zaawansowane schowane.
   - Lepsze uchwyty zmiany rozmiaru/obrotu, czytelniejsze stany zaznaczenia.
   - Wersja mobilna: dziś tylko ostrzeżenie; potrzebny osobny, prostszy układ.
2. **Całość wygląda jak wygenerowana przez AI.** Powody:
   - Zamiast zdjęć są ilustracje SVG (`components/marketing/Art.tsx`) — płaskie, generyczne. Docelowo prawdziwe zdjęcia (komponent `Photo` przyjmuje `src`).
   - Szablonowy układ: duże serify + „eyebrow” kapitaliki nad każdym nagłówkiem, numerowane 01/02/03, równe siatki, ten sam rytm sekcji.
   - Zbyt jednolita, bezpieczna paleta i powtarzalne komponenty.
   - Do zrobienia: własny język wizualny, asymetria, fotografia, mniej „dekoracji”, prawdziwy copywriting.

## Co działa (logika do zachowania)
- Model projektu: `lib/types.ts` (jeden obiekt `Project` zasila 2D i 3D, wersjonowany).
- Geometria i pola powierzchni: `lib/geometry.ts`, `lib/summary.ts`.
- Katalog materiałów/roślin: `lib/catalog.ts`; tekstury proceduralne: `lib/textures.ts`.
- Stan + undo/redo + zapis (localStorage): `lib/store.ts`; projekt przykładowy: `lib/sample.ts`.
- Plan 2D: `components/planner/PlanLayer.tsx` (render), `PlanEditor.tsx` (interakcje).
- Scena 3D: `components/planner/Scene3D.tsx`.
- UI planera: `Planner.tsx`, `Panels.tsx`, `PropertiesBar.tsx`, `Summary.tsx`.
- Strona: `app/(site)/*`, `components/marketing/*`, treści w `lib/content.ts`.

## Ograniczenia
- Działka tylko prostokątna. Zapis tylko lokalny. Kontakt symulowany. Dane/nazwa firmy to placeholdery („NAZWA MARKI”).
- Brak testów mobilnych i wydajności 3D na słabszych urządzeniach.

## Oryginalny brief
Paleta: #173D2B, #244A35, #141816, #F6F4EE, #E7E0D2, #8B918A, akcent sage/lime. Typografia: Cormorant Garamond + Inter. Treści po polsku. (Pełny brief dołączył autor w rozmowie.)
