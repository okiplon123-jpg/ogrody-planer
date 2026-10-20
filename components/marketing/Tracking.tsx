"use client";
import { useEffect } from "react";
import { GTM_ID } from "@/lib/site";
import { track } from "@/lib/track";

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; __consentInit?: boolean };
const consentFromStorage = () => {
  try { const c = JSON.parse(localStorage.getItem("cookie-consent") || "null"); return c ? { analytics: !!c.analytics, marketing: !!c.marketing } : null; } catch { return null; }
};
const mode = (c: { analytics: boolean; marketing: boolean } | null) => ({
  analytics_storage: c?.analytics ? "granted" : "denied",
  ad_storage: c?.marketing ? "granted" : "denied",
  ad_user_data: c?.marketing ? "granted" : "denied",
  ad_personalization: c?.marketing ? "granted" : "denied",
});

/** Consent Mode v2 (everything denied until the visitor agrees), GTM loader, and click-to-call events. */
export function Tracking() {
  useEffect(() => {
    const w = window as W;
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () { w.dataLayer!.push(arguments); }; // eslint-disable-line prefer-rest-params
    if (!w.__consentInit) {
      w.__consentInit = true;
      w.gtag("consent", "default", { ...mode(null), wait_for_update: 500 });
      const stored = consentFromStorage();
      if (stored) w.gtag("consent", "update", mode(stored));
    }
    const onConsent = () => w.gtag!("consent", "update", mode(consentFromStorage()));
    window.addEventListener("cookie-consent", onConsent);

    if (GTM_ID && !document.getElementById("gtm-script")) {
      w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const s = document.createElement("script");
      s.id = "gtm-script"; s.async = true; s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      document.head.appendChild(s);
    }

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='tel:']");
      if (a) track("phone_click", { link_text: (a.textContent || "").trim().slice(0, 40), page_path: location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("cookie-consent", onConsent); document.removeEventListener("click", onClick); };
  }, []);
  return null;
}
