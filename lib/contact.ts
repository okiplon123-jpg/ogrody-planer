const ENDPOINT = "https://formsubmit.co/ajax/gryczewski.bud@gmail.com";

/** Sends a lead to the company inbox. Resolves true only when the service confirms delivery. */
export async function sendLead(fields: Record<string, string>, subject: string, honey = ""): Promise<boolean> {
  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: subject, _captcha: "false", _template: "table", _honey: honey, ...fields }),
    });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.success !== "false" && j.success !== false;
  } catch {
    return false;
  }
}
