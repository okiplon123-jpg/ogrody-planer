"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* N1a: three tools-and-content destinations (usługi, wizualizator kostki, planer ogrodu); everything else lives in the footer colophon. */
export function Nav() {
  const path = usePathname();
  const cur = (h: string) => (path.startsWith(h) ? "page" : undefined);
  return (
    <header className="nav">
      <div className="nav-in">
        <Link href="/" className="wordmark" aria-label="nazwa marki — strona główna">nazwa marki<span className="period" aria-hidden /></Link>
        <div className="nav-row2">
          <Link href="/uslugi" className="nav-link" aria-current={cur("/uslugi")}>usługi</Link>
          <Link href="/wizualizator" className="nav-link" aria-current={cur("/wizualizator")}>wizualizator</Link>
          <Link href="/planer" className="nav-link">planer</Link>
        </div>
        <a href="tel:+48885879108" className="btn btn-signal btn-sm">zadzwoń<span className="hide-sm">&nbsp;885&nbsp;879&nbsp;108</span></a>
      </div>
    </header>
  );
}
