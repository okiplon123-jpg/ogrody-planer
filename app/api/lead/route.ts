import { COMPANY } from "@/lib/site";

export const runtime = "nodejs";

const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now(), win = 60 * 60 * 1000;
  const list = (hits.get(ip) ?? []).filter((t) => now - t < win);
  list.push(now); hits.set(ip, list);
  return list.length > 8;
};
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

/** Receives a lead from the site and mails it to the company inbox through Resend. 503 = not configured yet (the client then falls back). */
export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return Response.json({ ok: false, error: "not_configured" }, { status: 503 });

  let body: { fields?: Record<string, unknown>; subject?: unknown; hp?: unknown };
  try { body = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  if (body.hp) return Response.json({ ok: true }); // honeypot: pretend success, send nothing
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const raw = body.fields ?? {};
  const fields = Object.entries(raw).slice(0, 20).map(([k, v]) => [String(k).slice(0, 60), String(v ?? "").slice(0, 4000)] as const);
  const phone = fields.find(([k]) => /telefon/i.test(k))?.[1] ?? "";
  if (phone.replace(/\D/g, "").length < 9) return Response.json({ ok: false, error: "invalid" }, { status: 400 });

  const subject = String(body.subject ?? "Nowe zapytanie ze strony").slice(0, 120);
  const html = `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${fields
    .map(([k, v]) => `<tr><td style="border:1px solid #ddd;padding:8px;background:#f6f6f6;vertical-align:top"><b>${esc(k)}</b></td><td style="border:1px solid #ddd;padding:8px">${/^https?:\/\//.test(v) ? `<a href="${esc(v)}">${esc(v)}</a>` : esc(v)}</td></tr>`)
    .join("")}</table>`;
  const text = fields.map(([k, v]) => `${k}: ${v}`).join("\n");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "Strona gryczewski-bud.pl <onboarding@resend.dev>",
      to: [process.env.LEAD_TO ?? COMPANY.email],
      subject, html, text,
    }),
  });
  if (!r.ok) return Response.json({ ok: false, error: "provider" }, { status: 502 });
  return Response.json({ ok: true });
}
