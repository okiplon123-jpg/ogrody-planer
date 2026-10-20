import type { Project } from "./types";

const b64url = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

/** Whole project as a compressed URL-safe string (no server needed). */
export async function encodeProject(p: Project): Promise<string> {
  return b64url(await pipe(new TextEncoder().encode(JSON.stringify(p)), new CompressionStream("deflate-raw")));
}
export async function decodeProject(s: string): Promise<Project | null> {
  try {
    const p = JSON.parse(new TextDecoder().decode(await pipe(unb64url(s), new DecompressionStream("deflate-raw")))) as Project;
    return p && p.plot && Array.isArray(p.objects) ? p : null;
  } catch {
    return null;
  }
}
