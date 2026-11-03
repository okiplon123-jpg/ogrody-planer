/**
 * Pushes a conversion event to the GTM data layer.
 *
 * The GTM container listens for `gb_*` event names (e.g. gb_form_success, gb_planner_open) and maps them to the GA4 / Google Ads tags.
 * Call sites keep using the readable GA4-style names; this translates them. Phone/WhatsApp clicks and form_start are detected by the
 * container itself (custom HTML tag), so they are not pushed from here.
 */
const SELF_TRACKED = new Set(["phone_click", "whatsapp_click", "form_start"]);

function containerEvent(event: string, params: Record<string, string | number>): string {
  if (event === "generate_lead") return params.lead_type === "planer" ? "gb_planner_lead_success" : "gb_form_success";
  return `gb_${event}`;
}

export function track(event: string, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined" || SELF_TRACKED.has(event)) return;
  const w = window as unknown as { dataLayer?: unknown[] };
  const event_id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  (w.dataLayer = w.dataLayer || []).push({ event: containerEvent(event, params), event_id, ...params });
}
