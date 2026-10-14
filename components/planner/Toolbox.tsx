"use client";
import { SIMPLE_ITEMS } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { ItemThumb } from "./ui";

export function Toolbox() {
  const s = useStore();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-sage">Dodaj do działki</h2>
        <p className="mt-1 text-[12px] leading-snug text-[#aab6aa]">Kliknij element albo przeciągnij go na plan.</p>
      </div>
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-3">
        {SIMPLE_ITEMS.map((it) => (
          <button key={it.id} draggable onDragStart={(e) => { e.dataTransfer.setData("text/lib", it.id); e.dataTransfer.effectAllowed = "copy"; }}
            onClick={() => { s.set({ mode: "2d" }); s.addFromLib(it); }}
            className="flex flex-col items-center gap-1.5 border border-[#2a342e] bg-[#181f1b] p-2 text-[12px] text-[#e2e9e2] transition hover:border-sage active:scale-95">
            <ItemThumb item={it} />{it.name}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-[12px] text-[#e2e9e2]">
        <input type="checkbox" checked={s.project.fence.enabled} onChange={(e) => s.patchProject({ fence: { ...s.project.fence, enabled: e.target.checked } })} /> Ogrodzenie wokół działki
      </label>
      <button className="pl-btn text-left" onClick={() => s.loadSample()}>Wczytaj przykładowy projekt</button>
    </div>
  );
}
