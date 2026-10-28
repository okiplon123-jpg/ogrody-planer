"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";

/** Sends one view_service event per page view of a service page. */
export function TrackView({ service }: { service: string }) {
  useEffect(() => { track("view_service", { service_type: service, page_path: location.pathname }); }, [service]);
  return null;
}
