# Handoff do Figma / Figma Make — strona + planer ogrodu (NAZWA MARKI)

## Co to jest
Strona firmy brukarsko‑ogrodniczej (PL) + planer ogrodu 2D/3D. Stack: Next.js, React, TypeScript, Tailwind v4, React Three Fiber, zustand. Uruchomienie: `npm install && npm run dev` → http://localhost:3000 (planer: `/planer`).

## Decyzja: BEZ WYCENY
Nie ma formularza wyceny ani przycisku „do wyceny”. Planer kończy się ekranem „Podsumowanie” (powierzchnie, ilości, zapis, pobranie wizualizacji). Zostaje tylko prosty formularz kontaktowy (`/kontakt`, symulowany).

## Repo
https://github.com/okiplon123-jpg/ogrody-planer (publiczne, gałąź `main`)

## Zgłoszone problemy (najważniejsze do dalszej pracy)
1. **Planer został odchudzony do podstaw.** Jeden panel „Dodaj do działki” z 9 elementami (Dom, Podjazd, Taras, Ścieżka, Trawnik, Rabata, Drzewo, Krzewy, Lampa) — klik albo przeciągnięcie na plan. Wymiary działki wpisuje się w pasku u góry. Po zaznaczeniu obiektu pojawia się mały pasek: próbki materiału, układ kostki, gatunek, Obróć/Duplikuj/Usuń; rozmiar zmienia się uchwytami na planie. Przełącznik Plan / 3D oraz przycisk „Gotowe” (podsumowanie). Bez kroków, bez ekranu powitalnego, bez ustawień. Do zaprojektowania przez projektanta: wygląd całości, stan pusty, uchwyty, wersja mobilna.
2. **Wygląd „jak od AI” — NIE rozwiązane.** Zamiast zdjęć są ilustracje SVG (`components/marketing/Art.tsx`); zdjęcia podmienia się przez prop `src` komponentu `Photo`. Usunięto tylko część szablonowych elementów (etykiety nad nagłówkami, numerację, kursywę w kolorze akcentu). Brakuje własnego języka wizualnego, prawdziwej fotografii i copywritingu — to zadanie dla projektanta.

## Co działa (logika do zachowania)
- Model projektu: `lib/types.ts` (jeden obiekt `Project` zasila 2D i 3D, wersjonowany).
- Geometria i pola powierzchni: `lib/geometry.ts`, `lib/summary.ts`.
- Katalog materiałów/roślin: `lib/catalog.ts`; tekstury proceduralne: `lib/textures.ts`.
- Stan + undo/redo + zapis (localStorage): `lib/store.ts`; projekt przykładowy: `lib/sample.ts`.
- Plan 2D: `components/planner/PlanLayer.tsx` (render), `PlanEditor.tsx` (interakcje).
- Scena 3D: `components/planner/Scene3D.tsx` (czysta bryła architektoniczna: gładkie rośliny, światło otoczenia, ambient occlusion; to nie jest fotorealizm — wyższy poziom wymaga gotowych modeli glTF albo renderu poza przeglądarką).
- UI planera: `Planner.tsx`, `Panels.tsx`, `PropertiesBar.tsx`, `Summary.tsx`.
- Strona: `app/(site)/*`, `components/marketing/*`, treści w `lib/content.ts`.

## Ograniczenia
- Działka tylko prostokątna. Zapis tylko lokalny. Kontakt symulowany. Dane/nazwa firmy to placeholdery („NAZWA MARKI”).
- Brak testów mobilnych i wydajności 3D na słabszych urządzeniach.

## Oryginalny brief
Paleta: #173D2B, #244A35, #141816, #F6F4EE, #E7E0D2, #8B918A, akcent sage/lime. Typografia: Cormorant Garamond + Inter. Treści po polsku. (Pełny brief dołączył autor w rozmowie.)
