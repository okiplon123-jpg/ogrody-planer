const FORMSUBMIT = "https://formsubmit.co/ajax/gryczewski.bud@gmail.com";

async function withTimeout(url: string, init: RequestInit, ms: number) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...init, signal: c.signal }); } finally { clearTimeout(t); }
}

/** Sends a lead to the company inbox: our own endpoint first, the external service only as a fallback. Resolves true only on confirmed delivery. */
export async function sendLead(fields: Record<string, string>, subject: string, honey = ""): Promise<boolean> {
  try {
    const r = await withTimeout("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields, subject, hp: honey }) }, 12000);
    if (r.ok) return true;
    if (r.status === 400 || r.status === 429) return false; // the visitor's input was rejected, retrying elsewhere won't help
  } catch { /* fall through to the fallback */ }
  try {
    const r = await withTimeout(FORMSUBMIT, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: subject, _captcha: "false", _template: "table", _honey: honey, ...fields }),
    }, 8000);
    const j = await r.json().catch(() => ({}));
    return r.ok && j.success !== "false" && j.success !== false;
  } catch { return false; }
}
