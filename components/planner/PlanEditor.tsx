"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { getNodes, nearestSegment, rebuildShape, shapePoints, simplifyClosed, smoothCurve } from "@/lib/geometry";
import { PlanLayer } from "./PlanLayer";
import { POINT_KINDS, SHAPE_KINDS, KIND_LABEL, findLibItem, matById } from "@/lib/catalog";
import { fmtArea, fmtLen, localToWorld, objectArea, snapTo, worldAABB, worldToLocal, type V2 } from "@/lib/geometry";
import type { PlanObject } from "@/lib/types";

type Drag =
  | { t: "move"; id: string; start: PlanObject; w0: V2; moved: boolean }
  | { t: "resize"; id: string; start: PlanObject; sx: number; sy: number; moved: boolean }
  | { t: "rotate"; id: string; moved: boolean }
  | { t: "node"; id: string; i: number; start: PlanObject; moved: boolean }
  | { t: "free" }
  | { t: "pan"; px: number; py: number; cx: number; cy: number }
  | null;

export function PlanEditor() {
  const s = useStore();
  const { project, selectedId, settings, tool, armed, drawPts, drawMode, drawSmooth, drawWidth } = s;
  const wrap = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cam, setCam] = useState({ x: 0, y: 0, z: 18 });
  const [cursor, setCursor] = useState<V2 | null>(null);
  const [freePts, setFreePts] = useState<V2[]>([]);
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });
  const drag = useRef<Drag>(null);
  const pointers = useRef(new Map<number, V2>());
  const pinch = useRef<{ d: number; z: number } | null>(null);
  const sel = project.objects.find((o) => o.id === selectedId);

  const fit = useCallback(() => {
    if (!size.w) return;
    const { w, l } = project.plot;
    const z = Math.max(3, Math.min(60, Math.min((size.w - 90) / (w + 4), (size.h - 110) / (l + 4))));
    setCam({ z, x: (size.w - w * z) / 2, y: (size.h - l * z) / 2 - 10 });
  }, [size, project.plot]);

  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(fit, [s.fitNonce, size.w > 0, s.mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // keep "view centre" fresh for objects added from the library
    if (!size.w) return;
    s.set({ viewCenter: [snapTo((size.w / 2 - cam.x) / cam.z, 0.5), snapTo((size.h / 2 - cam.y) / cam.z, 0.5)] });
  }, [cam, size]); // eslint-disable-line react-hooks/exhaustive-deps

  const toWorld = (e: { clientX: number; clientY: number }): V2 => {
    const r = svgRef.current!.getBoundingClientRect();
    return [(e.clientX - r.left - cam.x) / cam.z, (e.clientY - r.top - cam.y) / cam.z];
  };
  const sn = (v: number) => (settings.snap ? snapTo(v, 0.1) : v);

  // wheel zoom (native listener to allow preventDefault)
  useEffect(() => {
    const el = wrap.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      setCam((c) => {
        const z = Math.max(3, Math.min(120, c.z * Math.exp(-e.deltaY * 0.0015)));
        const k = z / c.z;
        return { z, x: mx - (mx - c.x) * k, y: my - (my - c.y) * k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input,textarea,select")) return;
      const st = useStore.getState();
      if (e.key === "Escape") { st.cancelDraw(); st.set({ armed: null, selectedId: null }); }
      else if (e.key === "Enter" && st.tool === "draw") st.finishDraw();
      else if (e.key === "Backspace" && st.tool === "draw") { e.preventDefault(); st.undoDrawPt(); }
      else if ((e.key === "Delete" || e.key === "Backspace") && st.selectedId) { e.preventDefault(); st.remove(st.selectedId); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? st.redo() : st.undo(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") { e.preventDefault(); st.redo(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d" && st.selectedId) { e.preventDefault(); st.duplicate(st.selectedId); }
      else if (e.key.startsWith("Arrow") && st.selectedId) {
        e.preventDefault();
        const o = st.project.objects.find((x) => x.id === st.selectedId)!;
        const d = e.shiftKey ? 0.5 : 0.1;
        st.update(o.id, { x: o.x + (e.key === "ArrowRight" ? d : e.key === "ArrowLeft" ? -d : 0), y: o.y + (e.key === "ArrowDown" ? d : e.key === "ArrowUp" ? -d : 0) }, true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const snapMove = (o: PlanObject, nx: number, ny: number) => {
    const t: PlanObject = { ...o, x: nx, y: ny };
    const b = worldAABB(t);
    const thr = 9 / cam.z;
    const xs = [0, project.plot.w], ys = [0, project.plot.l];
    for (const q of project.objects) if (q.id !== o.id && q.kind !== "light") { const a = worldAABB(q); xs.push(a.minX, a.maxX); ys.push(a.minY, a.maxY); }
    let dx = 0, dy = 0, bx = thr, by = thr;
    for (const v of xs) for (const e of [b.minX, b.maxX]) if (Math.abs(v - e) < bx) { bx = Math.abs(v - e); dx = v - e; }
    for (const v of ys) for (const e of [b.minY, b.maxY]) if (Math.abs(v - e) < by) { by = Math.abs(v - e); dy = v - e; }
    if (!settings.snap) { setGuides({ v: [], h: [] }); return [nx, ny] as V2; }
    if (bx >= thr) dx = snapTo(nx, 0.1) - nx;
    if (by >= thr) dy = snapTo(ny, 0.1) - ny;
    // guide lines at snapped edges
    const nb = { minX: b.minX + dx, maxX: b.maxX + dx, minY: b.minY + dy, maxY: b.maxY + dy };
    const g: { v: number[]; h: number[] } = { v: [], h: [] };
    if (bx < thr) for (const v of xs) for (const e of [nb.minX, nb.maxX]) if (Math.abs(v - e) < 1e-6) g.v.push(v);
    if (by < thr) for (const v of ys) for (const e of [nb.minY, nb.maxY]) if (Math.abs(v - e) < 1e-6) g.h.push(v);
    setGuides(g);
    return [nx + dx, ny + dy] as V2;
  };

  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: cam.z };
      drag.current = null;
      return;
    }
    const w = toWorld(e);
    const target = e.target as Element;
    if (tool === "draw") {
      if (drawMode === "free") { drag.current = { t: "free" }; setFreePts([w]); return; }
      const p: V2 = [sn(w[0]), sn(w[1])];
      if (drawMode === "points" && drawPts.length >= 3 && Math.hypot(p[0] - drawPts[0][0], p[1] - drawPts[0][1]) < 14 / cam.z) s.finishDraw();
      else s.addDrawPt(p);
      return;
    }
    if (armed) {
      s.addFromLib(armed, [sn(w[0]), sn(w[1])]);
      return;
    }
    const nodeI = target.closest("[data-node]")?.getAttribute("data-node");
    if (nodeI !== null && nodeI !== undefined && sel) { drag.current = { t: "node", id: sel.id, i: Number(nodeI), start: sel, moved: false }; return; }
    const handle = target.closest("[data-handle]")?.getAttribute("data-handle");
    if (handle && sel) {
      if (handle === "rot") drag.current = { t: "rotate", id: sel.id, moved: false };
      else { const [sx, sy] = handle.split(",").map(Number); drag.current = { t: "resize", id: sel.id, start: sel, sx, sy, moved: false }; }
      return;
    }
    const id = target.closest("[data-id]")?.getAttribute("data-id");
    if (id) {
      s.select(id);
      const o = project.objects.find((x) => x.id === id)!;
      drag.current = { t: "move", id, start: o, w0: w, moved: false };
    } else {
      s.select(null);
      drag.current = { t: "pan", px: e.clientX, py: e.clientY, cx: cam.x, cy: cam.y };
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, [e.clientX, e.clientY]);
    const w = toWorld(e);
    setCursor(w);
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const z = Math.max(3, Math.min(120, pinch.current.z * (Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.current.d)));
      setCam((c) => ({ ...c, z }));
      return;
    }
    const d = drag.current;
    if (!d) return;
    if (d.t === "pan") { setCam((c) => ({ ...c, x: d.cx + e.clientX - d.px, y: d.cy + e.clientY - d.py })); return; }
    const st = useStore.getState();
    if (d.t === "free") { setFreePts((a) => (a.length && Math.hypot(w[0] - a[a.length - 1][0], w[1] - a[a.length - 1][1]) < 0.12 ? a : [...a, w])); return; }
    if (d.t === "node") {
      if (!d.moved) { st.commit(); d.moved = true; }
      const [sx, sy] = [sn(w[0]), sn(w[1])];
      const nodes = getNodes(d.start).map((n) => n.slice() as V2);
      nodes[d.i] = worldToLocal(d.start, [sx, sy]);
      st.update(d.id, rebuildShape(d.start, nodes), false);
      return;
    }
    if (d.t === "move") {
      if (!d.moved && Math.hypot(w[0] - d.w0[0], w[1] - d.w0[1]) * cam.z < 3) return;
      if (!d.moved) { st.commit(); d.moved = true; }
      const [nx, ny] = snapMove(d.start, d.start.x + w[0] - d.w0[0], d.start.y + w[1] - d.w0[1]);
      st.update(d.id, { x: nx, y: ny }, false);
    } else if (d.t === "resize") {
      if (!d.moved) { st.commit(); d.moved = true; }
      const o = d.start;
      const p = worldToLocal(o, w);
      const opp: V2 = [(-d.sx * o.w) / 2, (-d.sy * o.h) / 2];
      let nw = Math.max(0.2, (p[0] - opp[0]) * d.sx), nh = Math.max(0.2, (p[1] - opp[1]) * d.sy);
      if (POINT_KINDS.includes(o.kind)) { nw = nh = Math.max(nw, nh); }
      nw = sn(nw); nh = sn(nh);
      const c = localToWorld(o, [opp[0] + (d.sx * nw) / 2, opp[1] + (d.sy * nh) / 2]);
      st.update(d.id, { w: nw, h: nh, x: c[0], y: c[1], ...(o.nodes ? { nodes: o.nodes.map(([x, y]) => [(x * nw) / o.w, (y * nh) / o.h] as V2) } : {}) }, false);
    } else if (d.t === "rotate") {
      if (!d.moved) { st.commit(); d.moved = true; }
      const o = st.project.objects.find((x) => x.id === d.id)!;
      let a = (Math.atan2(w[1] - o.y, w[0] - o.x) * 180) / Math.PI + 90;
      a = ((a % 360) + 360) % 360;
      if (settings.snap) { const r = Math.round(a / 15) * 15; if (Math.abs(a - r) < 5) a = r; }
      st.update(d.id, { rot: Math.round(a * 10) / 10 % 360 }, false);
    }
  };
  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (drag.current?.t === "free") {
      const st = useStore.getState();
      const pts = simplifyClosed(freePts, 0.18);
      setFreePts([]);
      if (pts.length >= 3) st.finishDraw(pts); // closes the stroke into a shape
    }
    drag.current = null;
    setGuides({ v: [], h: [] });
  };

  const fs = 11 / cam.z;
  const u = settings.units;
  const dimText = (x: number, y: number, t: string, rot = 0) => (
    <text x={x} y={y} fontSize={fs} fill="var(--color-ink)" textAnchor="middle" transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} style={{ paintOrder: "stroke", stroke: "var(--color-paper)", strokeWidth: fs * 0.35, pointerEvents: "none" }}>{t}</text>
  );
  const handles: V2[] = sel ? ([[-1, -1], [1, -1], [1, 1], [-1, 1]] as V2[]) : [];

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const w = toWorld(e);
    const libId = e.dataTransfer.getData("text/lib"), matId = e.dataTransfer.getData("text/mat");
    const st = useStore.getState();
    if (libId) { const it = findLibItem(libId); if (it) st.addFromLib(it, [sn(w[0]), sn(w[1])]); }
    else if (matId) {
      const m = matById(matId);
      const hit = document.elementsFromPoint(e.clientX, e.clientY).map((el) => el.closest("[data-id]")?.getAttribute("data-id")).find(Boolean);
      const o = st.project.objects.find((x) => x.id === hit);
      if (o && o.kind === m.kind) { st.select(o.id); st.update(o.id, { material: matId, pattern: m.pattern ?? o.pattern }); }
      else st.notify(o ? "Ten materiał nie pasuje do tego obiektu." : "Upuść materiał na nawierzchnię, trawnik lub rabatę w planie.");
    }
  };
  const onDbl = (e: React.MouseEvent) => {
    if (tool === "draw") { s.finishDraw(); return; }
    if (!sel || !SHAPE_KINDS.includes(sel.kind)) return;
    const st = useStore.getState();
    const nodes = getNodes(sel), band = !!sel.band;
    const nodeEl = (e.target as Element).closest("[data-node]");
    if (nodeEl) {
      const i = Number(nodeEl.getAttribute("data-node"));
      if (nodes.length > (band ? 2 : 3)) { st.commit(); st.update(sel.id, rebuildShape(sel, nodes.filter((_, k) => k !== i)), false); }
      return;
    }
    const ns = nearestSegment(nodes, worldToLocal(sel, toWorld(e)), !band);
    if (ns.dist * cam.z < 16) {
      const a = nodes[ns.index], b = nodes[(ns.index + 1) % nodes.length];
      const arr = [...nodes]; arr.splice(ns.index + 1, 0, [a[0] + (b[0] - a[0]) * ns.t, a[1] + (b[1] - a[1]) * ns.t] as V2);
      st.commit(); st.update(sel.id, rebuildShape(sel, arr), false);
    }
  };
  const empty = project.objects.length === 0 && tool === "select";
  const cur: V2 | null = cursor ? [sn(cursor[0]), sn(cursor[1])] : null;
  const base: V2[] = [...drawPts, ...(cur ? [cur] : [])];
  const previewPoly: V2[] | null = tool !== "draw" ? null : drawMode === "band" && base.length >= 2 ? shapePoints(base, drawSmooth, drawWidth) : drawMode === "points" && drawSmooth && base.length >= 3 ? smoothCurve(base, true, 10) : null;

  return (
    <div ref={wrap} onDragOver={(e) => e.preventDefault()} onDrop={onDrop} className="absolute inset-0 select-none overflow-hidden bg-[var(--color-paper-3)]" style={{ cursor: tool === "draw" || armed ? "crosshair" : "default", touchAction: "none" }}>
      <svg ref={svgRef} className="absolute inset-0 h-full w-full" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onDoubleClick={onDbl} role="application" aria-label="Plan działki 2D">
        <g transform={`translate(${cam.x} ${cam.y}) scale(${cam.z})`}>
          <PlanLayer project={project} grid={settings.grid}>
            {settings.dims && (
              <g>
                <line x1={0} x2={project.plot.w} y1={-0.6} y2={-0.6} stroke="var(--color-ink)" strokeWidth={0.03} />
                {dimText(project.plot.w / 2, -0.85, `działka ${fmtLen(project.plot.w, u)}`)}
                <line x1={-0.6} x2={-0.6} y1={0} y2={project.plot.l} stroke="var(--color-ink)" strokeWidth={0.03} />
                {dimText(-0.9, project.plot.l / 2, fmtLen(project.plot.l, u), -90)}
                {dimText(project.plot.w / 2, project.plot.l + 3.6, "ULICA", 0)}
              </g>
            )}
            {guides.v.map((v, i) => <line key={"v" + i} x1={v} x2={v} y1={-3} y2={project.plot.l + 3} stroke="var(--color-ink)" strokeWidth={0.04} strokeDasharray="0.3 0.2" pointerEvents="none" />)}
            {guides.h.map((v, i) => <line key={"h" + i} y1={v} y2={v} x1={-3} x2={project.plot.w + 3} stroke="var(--color-ink)" strokeWidth={0.04} strokeDasharray="0.3 0.2" pointerEvents="none" />)}
            {sel && (
              <g>
                <g transform={`translate(${sel.x} ${sel.y}) rotate(${sel.rot})`}>
                  <rect x={-sel.w / 2} y={-sel.h / 2} width={sel.w} height={sel.h} fill="none" stroke="var(--color-ink)" strokeWidth={2 / cam.z} strokeDasharray={`${6 / cam.z} ${4 / cam.z}`} pointerEvents="none" />
                  <line x1={0} y1={-sel.h / 2} x2={0} y2={-sel.h / 2 - 22 / cam.z} stroke="var(--color-ink)" strokeWidth={1.5 / cam.z} />
                  <circle data-handle="rot" cx={0} cy={-sel.h / 2 - 22 / cam.z} r={7 / cam.z} fill="var(--color-accent)" stroke="var(--color-ink)" strokeWidth={2 / cam.z} style={{ cursor: "grab" }} />
                  {handles.map(([sx, sy]) => (
                    <rect key={`${sx},${sy}`} data-handle={`${sx},${sy}`} x={(sx * sel.w) / 2 - 6 / cam.z} y={(sy * sel.h) / 2 - 6 / cam.z} width={12 / cam.z} height={12 / cam.z} fill="var(--color-accent)" stroke="var(--color-ink)" strokeWidth={1.5 / cam.z} style={{ cursor: "nwse-resize" }} />
                  ))}
                </g>
                {SHAPE_KINDS.includes(sel.kind) && tool !== "draw" && getNodes(sel).map((n, i) => { const wp = localToWorld(sel, n); return <circle key={"n" + i} data-node={i} cx={wp[0]} cy={wp[1]} r={6 / cam.z} fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth={2 / cam.z} style={{ cursor: "move" }} />; })}
                {settings.dims && (() => {
                  const top = localToWorld(sel, [0, -sel.h / 2 - 0.6 - 30 / cam.z]);
                  const side = localToWorld(sel, [sel.w / 2 + 0.7 + 8 / cam.z, 0]);
                  return (
                    <g>
                      {dimText(top[0], top[1], POINT_KINDS.includes(sel.kind) ? `Ø ${fmtLen(sel.w, u)}` : `${fmtLen(sel.w, u)}`)}
                      {!POINT_KINDS.includes(sel.kind) && dimText(side[0], side[1], fmtLen(sel.h, u), sel.rot - 90)}
                      {["surface", "lawn", "bed", "house", "garage", "water"].includes(sel.kind) && dimText(sel.x, sel.y + fs * 0.35, fmtArea(objectArea(sel)))}
                    </g>
                  );
                })()}
              </g>
            )}
            {tool === "draw" && drawMode === "free" && freePts.length > 1 && (
              <polyline pointerEvents="none" points={freePts.map((p) => p.join(",")).join(" ")} fill="rgba(0,0,0,0)" stroke="var(--color-ink)" strokeWidth={2 / cam.z} strokeLinejoin="round" />
            )}
            {tool === "draw" && drawPts.length > 0 && (
              <g pointerEvents="none">
                {previewPoly ? (
                  <polygon points={previewPoly.map((p) => p.join(",")).join(" ")} fill="rgba(0,0,0,0.12)" stroke="var(--color-ink)" strokeWidth={2 / cam.z} strokeLinejoin="round" />
                ) : (
                  <polyline points={base.map((p) => p.join(",")).join(" ")} fill="rgba(0,0,0,0)" stroke="var(--color-ink)" strokeWidth={2 / cam.z} />
                )}
                {drawPts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={(i === 0 ? 7 : 4) / cam.z} fill={i === 0 ? "var(--color-accent)" : "var(--color-ink)"} stroke="var(--color-ink)" strokeWidth={1.5 / cam.z} />)}
              </g>
            )}
          </PlanLayer>
        </g>
      </svg>

      {empty && (
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <div className="pointer-events-auto max-w-xs border border-dashed border-[var(--color-ink)] bg-[var(--color-paper)] p-5 text-center text-[13px] leading-relaxed text-[var(--color-ink-2)]">
            <div className="h3">Zacznij od domu</div>
            Kliknij „Dom” po lewej albo przeciągnij go na plan.
            <button className="pl-btn mt-3 block w-full" onClick={() => s.loadSample()}>Wczytaj przykładowy projekt</button>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute left-3 top-14 flex flex-col gap-2 text-[11px]">
        {tool === "draw" && (
          <div className="pointer-events-auto flex items-center gap-2 border border-[var(--color-ink)] bg-[var(--color-paper)] px-3 py-2 text-[var(--color-ink)]">
            {drawMode === "free" ? "Przytrzymaj i narysuj kształt ręką. Puść, żeby go zamknąć." : drawMode === "band" ? `Kliknij punkty wzdłuż ścieżki (${drawPts.length}). Koniec: dwuklik lub Enter. Backspace cofa punkt.` : `Kliknij kolejne punkty obrysu (${drawPts.length}). Koniec: pierwszy punkt, dwuklik lub Enter. Backspace cofa punkt.`}
            {drawMode !== "free" && <button className="pl-btn pl-btn-primary" onClick={() => s.finishDraw()} disabled={drawPts.length < (drawMode === "band" ? 2 : 3)}>Zakończ</button>}
            <button className="pl-btn" onClick={s.cancelDraw}>Anuluj</button>
          </div>
        )}
        {armed && (
          <div className="pointer-events-auto flex items-center gap-2 border border-[var(--color-ink)] bg-[var(--color-paper)] px-3 py-2 text-[var(--color-ink)]">
            Sadzenie wielokrotne: „{armed.name}” — klikaj na planie. <button className="pl-btn" onClick={() => s.set({ armed: null })}>Zakończ (Esc)</button>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col border border-[var(--color-rule)] bg-[var(--color-paper)]">
        {[["+", 1.25], ["−", 0.8]].map(([l, k]) => (
          <button key={l as string} aria-label={l === "+" ? "Przybliż" : "Oddal"} className="h-9 w-9 text-lg text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]" onClick={() => setCam((c) => { const z = Math.max(3, Math.min(120, c.z * (k as number))); const mx = size.w / 2, my = size.h / 2, q = z / c.z; return { z, x: mx - (mx - c.x) * q, y: my - (my - c.y) * q }; })}>{l}</button>
        ))}
        <button aria-label="Dopasuj widok" className="h-9 w-9 border-t border-[var(--color-rule)] text-[10px] text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]" onClick={fit}>FIT</button>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 flex items-end gap-3 text-[10px] text-[var(--color-muted)]">
        <div>
          <div className="h-1.5 border-x border-b border-[var(--color-ink)]" style={{ width: cam.z * (cam.z > 12 ? 1 : 5) }} />
          {cam.z > 12 ? "1 m" : "5 m"}
        </div>
        <span className="max-w-[300px] leading-snug">Plan poglądowy — wymiary orientacyjne, nie są mapą geodezyjną.</span>
      </div>
      {sel && <div className="pointer-events-none absolute right-3 top-3 border border-[var(--color-rule)] bg-[var(--color-paper)] px-2 py-1 text-[11px] text-[var(--color-ink)]">{KIND_LABEL[sel.kind]}</div>}
    </div>
  );
}
