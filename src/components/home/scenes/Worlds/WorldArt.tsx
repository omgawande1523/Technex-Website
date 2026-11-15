import type { World } from "@/lib/content";

/** Gear outline generated from polar points (no hand-drawn asset needed). */
function gear(cx: number, cy: number, r: number, teeth: number) {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const rr = i % 4 < 2 ? r + 9 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z M${cx + 12},${cy} A12,12 0 1 0 ${cx - 12},${cy} A12,12 0 1 0 ${cx + 12},${cy}`;
}

/** Original line drawings, one per world, redrawn with DrawSVG on hover. */
const ART: Record<World["id"], string[]> = {
  workshops: [
    gear(108, 104, 34, 9),
    "M44 196 L92 148 M82 138 C70 126 72 108 86 100 L96 112 L110 104 L104 92 C120 86 136 96 132 114 C130 126 118 134 104 132 L56 206 C50 212 40 202 44 196 Z",
  ],
  competitions: [
    "M70 56 H130 V98 C130 128 116 144 100 144 C84 144 70 128 70 98 Z",
    "M70 70 H50 C50 100 60 110 74 114 M130 70 H150 C150 100 140 110 126 114",
    "M100 144 V172 M76 192 H124 L120 172 H80 Z",
    "M92 84 L100 72 L108 84 L100 112 Z",
  ],
  speakers: [
    "M84 48 C84 34 116 34 116 48 V108 C116 122 84 122 84 108 Z",
    "M68 96 C68 140 132 140 132 96 M100 132 V166 M76 168 H124",
    "M84 64 H98 M84 80 H98 M84 96 H98",
    "M146 70 C156 80 156 104 146 114 M160 58 C176 76 176 108 160 126",
  ],
  passes: [
    "M42 78 H158 V104 C146 104 146 126 158 126 V160 H42 V126 C54 126 54 104 42 104 Z",
    "M112 82 V90 M112 98 V106 M112 114 V122 M112 130 V138 M112 146 V154",
    "M58 100 H96 M58 116 H90 M58 132 H98",
    "M126 104 L142 120 M142 104 L126 120",
  ],
};

export default function WorldArt({ id, className }: { id: World["id"]; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 240" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {ART[id].map((d) => (
          <path key={d} d={d} data-draw />
        ))}
      </g>
    </svg>
  );
}
