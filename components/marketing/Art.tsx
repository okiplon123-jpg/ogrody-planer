import type { ReactNode } from "react";

/** Illustrative placeholder imagery (SVG). Replace with real photography via <Photo src="..."/>. */
export type ArtKind = "house" | "driveway" | "terrace" | "lawn" | "garden" | "path" | "before";
const rnd = (i: number, k = 1) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return Math.round((x - Math.floor(x)) * 1e4) / 1e4; };

function Blades({ x0, x1, y, n, h, c1, c2, seed = 1 }: { x0: number; x1: number; y: number; n: number; h: number; c1: string; c2: string; seed?: number }) {
  return (
    <g strokeLinecap="round" fill="none">
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + rnd(i, seed) * (x1 - x0), hh = h * (0.5 + rnd(i, seed + 3) * 0.8), lean = (rnd(i, seed + 5) - 0.5) * hh * 0.7;
        return <path key={i} d={`M${x} ${y} Q${x + lean * 0.3} ${y - hh * 0.6} ${x + lean} ${y - hh}`} stroke={rnd(i, seed + 9) > 0.5 ? c1 : c2} strokeWidth={1.6 + rnd(i, 2) * 1.6} />;
      })}
    </g>
  );
}
const Tree = ({ x, y, s, c = "#2f5a3a", c2 = "#3d6e45" }: { x: number; y: number; s: number; c?: string; c2?: string }) => (
  <g><rect x={x - s * 0.04} y={y - s * 0.45} width={s * 0.08} height={s * 0.45} fill="#2a2018" /><ellipse cx={x} cy={y - s * 0.75} rx={s * 0.42} ry={s * 0.5} fill={c} /><ellipse cx={x - s * 0.12} cy={y - s * 0.85} rx={s * 0.26} ry={s * 0.3} fill={c2} opacity={0.8} /></g>
);

function House({ mood }: { mood: "dusk" | "day" | "bare" }) {
  const dusk = mood === "dusk", bare = mood === "bare";
  const sky = dusk ? ["#1b2a3f", "#e0a272"] : bare ? ["#aab4b6", "#d3d6d0"] : ["#8fb8d6", "#e8eee8"];
  const wall = dusk ? "#c9c4b8" : "#e9e5da";
  const win = dusk ? "#ffd08a" : "#3b4b57";
  return (
    <>
      <defs>
        <linearGradient id={`sky-${mood}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
        <linearGradient id={`drv-${mood}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={bare ? "#8e8a7e" : "#2e3235"} /><stop offset="1" stopColor={bare ? "#6f6a5e" : "#474c50"} /></linearGradient>
        <radialGradient id="glow"><stop offset="0" stopColor="#ffd28a" stopOpacity=".9" /><stop offset="1" stopColor="#ffd28a" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="1200" height="800" fill={`url(#sky-${mood})`} />
      <path d="M0 470 Q300 410 560 450 T1200 430 V560 H0Z" fill={dusk ? "#1d2c2a" : bare ? "#8b9283" : "#5d7f66"} opacity={0.9} />
      <Tree x={90} y={520} s={300} c={dusk ? "#17301f" : bare ? "#6f7d62" : "#2f5a3a"} />
      <Tree x={1110} y={520} s={260} c={dusk ? "#17301f" : bare ? "#6f7d62" : "#2f5a3a"} c2={dusk ? "#21402a" : "#4a7a4f"} />
      {/* house */}
      <rect x="260" y="330" width="560" height="190" fill={wall} />
      <rect x="240" y="312" width="600" height="22" fill="#25292b" />
      <rect x="450" y="262" width="300" height="56" fill={dusk ? "#8c6a4c" : "#9a7655"} />
      <rect x="440" y="248" width="320" height="16" fill="#25292b" />
      <rect x="300" y="372" width="230" height="124" fill={win} />
      <rect x="560" y="400" width="86" height="120" fill="#5a3d28" />
      {[470, 560, 650].map((x) => <rect key={x} x={x} y="276" width="70" height="34" fill={win} />)}
      <rect x="690" y="372" width="100" height="148" fill={win} opacity={0.9} />
      {dusk && <><ellipse cx="415" cy="434" rx="180" ry="80" fill="url(#glow)" /><ellipse cx="740" cy="450" rx="110" ry="90" fill="url(#glow)" /></>}
      {/* garage */}
      <rect x="820" y="390" width="200" height="130" fill={dusk ? "#3a4044" : "#454b4f"} />
      <rect x="806" y="376" width="228" height="18" fill="#25292b" />
      {[420, 445, 470, 495].map((y) => <rect key={y} x="840" y={y} width="160" height="2" fill="#222" />)}
      {/* lawn + driveway */}
      <rect y="520" width="1200" height="280" fill={dusk ? "#26402a" : bare ? "#8a8a6a" : "#5b8c45"} />
      <polygon points="800,520 1030,520 1130,800 560,800" fill={`url(#drv-${mood})`} />
      {Array.from({ length: 14 }, (_, i) => { const t = (i + 1) / 15; const y = 520 + t * t * 280; return <line key={i} x1={800 - (240 * t * t)} y1={y} x2={1030 + 100 * t * t} y2={y} stroke="#000" strokeOpacity={bare ? 0.1 : 0.28} strokeWidth={1 + t * 2} />; })}
      {!bare && Array.from({ length: 10 }, (_, i) => { const t = i / 9; return <line key={i} x1={800 + t * 230 - 0} y1={520} x2={560 + t * 570} y2={800} stroke="#000" strokeOpacity={0.16} />; })}
      {bare ? (
        <g><path d="M120 640 l60 -10 l-30 40 l70 5 l-90 30z" fill="#6e6a58" opacity=".6" /><path d="M180 590 q40 20 90 8 M300 710 q50 -20 110 0" stroke="#4d4a3b" strokeWidth="3" fill="none" /><Blades x0={80} x1={560} y={780} n={60} h={50} c1="#7b7a47" c2="#5d6a39" seed={4} /></g>
      ) : (
        <g>
          <Blades x0={140} x1={420} y={600} n={90} h={90} c1={dusk ? "#a99c62" : "#cdbf7a"} c2={dusk ? "#7d8a4e" : "#e6dba3"} seed={2} />
          <Blades x0={200} x1={540} y={760} n={90} h={130} c1={dusk ? "#b4a76a" : "#d3c581"} c2={dusk ? "#6e7d45" : "#8fb35c"} seed={7} />
          <Blades x0={880} x1={1160} y={640} n={80} h={80} c1={dusk ? "#a99c62" : "#cdbf7a"} c2="#7d8a4e" seed={5} />
          {dusk && [[470, 700], [720, 640], [1090, 700], [250, 640]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y - 28} r="46" fill="url(#glow)" /><rect x={x - 2} y={y - 24} width="4" height="24" fill="#222" /><circle cx={x} cy={y - 28} r="6" fill="#ffe3a8" /></g>)}
        </g>
      )}
      <rect width="1200" height="800" fill={dusk ? "#0c1519" : "transparent"} opacity={dusk ? 0.18 : 0} />
    </>
  );
}

function Driveway() {
  return (
    <>
      <rect width="1200" height="800" fill="#4c6b4a" />
      <polygon points="470,0 730,0 1130,800 70,800" fill="#34383b" />
      {Array.from({ length: 22 }, (_, i) => { const t = (i + 1) / 22, y = t * t * 800; const x0 = 470 - 400 * t * t, x1 = 730 + 400 * t * t; return <line key={i} x1={x0} y1={y} x2={x1} y2={y} stroke="#14171a" strokeWidth={1 + t * 3} opacity={0.55} />; })}
      {Array.from({ length: 18 }, (_, i) => <line key={i} x1={470 + (i - 1) * 16} y1={0} x2={70 + (i - 1) * 64} y2={800} stroke="#14171a" strokeWidth={2} opacity={0.4} />)}
      <polygon points="470,0 450,0 20,800 70,800" fill="#c8c5ba" /><polygon points="730,0 750,0 1180,800 1130,800" fill="#c8c5ba" />
      <Blades x0={0} x1={160} y={800} n={50} h={120} c1="#b9aa66" c2="#789b4e" seed={3} /><Blades x0={1040} x1={1200} y={800} n={50} h={120} c1="#b9aa66" c2="#789b4e" seed={6} />
    </>
  );
}
function Terrace() {
  return (
    <>
      <rect width="1200" height="800" fill="#5d8a45" />
      {Array.from({ length: 5 }, (_, c) => Array.from({ length: 4 }, (_, r) => <rect key={`${c}${r}`} x={180 + c * 170} y={130 + r * 140 + (c % 2) * 50} width="166" height="136" fill={`hsl(40 6% ${56 + rnd(c * 7 + r) * 8}%)`} />))}
      <rect x="70" y="140" width="90" height="520" fill="#6b4a30" /><rect x="1040" y="140" width="90" height="520" fill="#6b4a30" />
      <Blades x0={74} x1={156} y={650} n={40} h={80} c1="#d6c985" c2="#8fb35c" seed={8} />
      <circle cx="560" cy="360" r="70" fill="#2b2f31" /><circle cx="560" cy="360" r="56" fill="#3a3f42" />
      {[[450, 300], [670, 300], [450, 430], [670, 430]].map(([x, y], i) => <rect key={i} x={x - 24} y={y - 24} width="48" height="48" fill="#8a6a4a" />)}
    </>
  );
}
function Lawn() {
  return (
    <>
      <rect width="1200" height="800" fill="#b9d3e6" />
      <rect y="330" width="1200" height="470" fill="#5f9347" />
      {Array.from({ length: 12 }, (_, i) => <polygon key={i} points={`${i * 100},330 ${i * 100 + 100},330 ${i * 240 - 600 + 240},800 ${i * 240 - 600},800`} fill={i % 2 ? "#5a8e43" : "#68a04e"} />)}
      <Tree x={200} y={420} s={380} /><Tree x={980} y={400} s={320} c="#3b6a3e" c2="#58874a" /><Tree x={690} y={380} s={200} c="#3f6e47" />
      <rect y="320" width="1200" height="14" fill="#d8d4c6" />
    </>
  );
}
function Garden() {
  return (
    <>
      <rect width="1200" height="800" fill="#6d5237" />
      <path d="M0 520 Q300 380 640 470 T1200 430 V800 H0Z" fill="#5c8a44" />
      <path d="M0 300 Q300 200 600 280 T1200 250 V0 H0Z" fill="#26402e" />
      {[[180, 560, 70], [380, 600, 54], [560, 540, 80], [800, 590, 60], [1000, 530, 76]].map(([x, y, r], i) => <g key={i}><circle cx={x} cy={y} r={r} fill={i % 2 ? "#e9e6f2" : "#8e84b8"} /><circle cx={x - 12} cy={y - 10} r={r * 0.5} fill="#fff" opacity={0.35} /></g>)}
      <Blades x0={0} x1={1200} y={720} n={260} h={190} c1="#c9ba70" c2="#e5d9a3" seed={11} />
      <Blades x0={0} x1={1200} y={790} n={200} h={230} c1="#a9b861" c2="#d8c98a" seed={13} />
    </>
  );
}
function Path() {
  return (
    <>
      <rect width="1200" height="800" fill="#cfc7b6" />
      {Array.from({ length: 4000 }, (_, i) => i < 700 ? <circle key={i} cx={rnd(i) * 1200} cy={rnd(i, 4) * 800} r={1.5 + rnd(i, 8) * 3} fill={`hsl(40 10% ${50 + rnd(i, 2) * 30}%)`} /> : null)}
      {Array.from({ length: 8 }, (_, i) => { const t = i / 7; return <rect key={i} x={240 + Math.sin(t * 3.4) * 330 + t * 400} y={60 + i * 90} width="170" height="74" fill="#6d7174" transform={`rotate(${Math.sin(t * 5) * 8} ${300 + t * 400} ${100 + i * 90})`} />; })}
      <Blades x0={0} x1={1200} y={800} n={200} h={200} c1="#b9aa66" c2="#789b4e" seed={21} />
    </>
  );
}

export function Art({ kind, className = "" }: { kind: ArtKind; className?: string }) {
  let body: ReactNode;
  switch (kind) {
    case "house": body = <House mood="dusk" />; break;
    case "before": body = <House mood="bare" />; break;
    case "driveway": body = <Driveway />; break;
    case "terrace": body = <Terrace />; break;
    case "lawn": body = <Lawn />; break;
    case "garden": body = <Garden />; break;
    case "path": body = <Path />; break;
  }
  return <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className={`block h-full w-full ${className}`} role="img" aria-label="Ilustracja poglądowa — miejsce na zdjęcie realizacji">{body}</svg>;
}

/** Use `src` for real photography; falls back to the illustrative placeholder. */
export function Photo({ kind, src, alt = "", className = "" }: { kind: ArtKind; src?: string; alt?: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} /> : <Art kind={kind} className={className} />;
}
