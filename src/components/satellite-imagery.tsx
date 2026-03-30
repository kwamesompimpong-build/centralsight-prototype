"use client";

import type { Entity } from "@/data/mock";

// Deterministic pseudo-random from a seed
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── OPEN-PIT MINE ───────────────────────────────────────────────────────────
// Resembles Landsat/Sentinel-2 RGB composite of open-pit operations:
// concentric terraced rings in ochre/rust, spiral haul road, tailings pond
function MiningImagery({ size, entity, alertColor, alertGlow }: ImgProps) {
  const cx = size / 2, cy = size / 2;
  const s = rng(entity.id.charCodeAt(1) * 31 + 7);
  const pitR = size * 0.28;
  const levels = 7;
  const tilt = 0.55; // ellipse y-scale to simulate perspective
  const isDomestic = entity.country === "United States";

  // Color palette: US mines tend to lighter beige, others darker red-brown
  const soilBase  = isDomestic ? "#c8a96e" : "#a06a3a";
  const soilDark  = isDomestic ? "#9a7a4a" : "#7a4e28";
  const soilLight = isDomestic ? "#e2c898" : "#c08858";
  const roadCol   = isDomestic ? "#d4b87c" : "#b87840";
  const tailingCol = "#2d4a5e";

  // Surrounding terrain
  const terrainPatches = Array.from({ length: 16 }, (_, i) => {
    const r = s();
    const a = (i / 16) * Math.PI * 2 + r * 0.5;
    const d = pitR * 1.4 + r * pitR * 0.8;
    return {
      x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * tilt,
      rx: (20 + r * 30) * (size / 320), ry: (12 + r * 18) * (size / 320),
      fill: i % 3 === 0 ? soilLight : i % 3 === 1 ? soilDark : soilBase,
    };
  });

  // Tailings pond (irregular polygon, bottom-left of pit)
  const tailX = cx - pitR * 0.8, tailY = cy + pitR * 0.9;
  const tailW = pitR * 0.7, tailH = pitR * 0.35;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <defs>
        <filter id={`mn-blur-${entity.id}`}><feGaussianBlur stdDeviation="2" /></filter>
        <filter id={`mn-blur2-${entity.id}`}><feGaussianBlur stdDeviation="0.8" /></filter>
        <filter id={`mn-glow-${entity.id}`}>
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id={`mn-sky-${entity.id}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={soilLight} stopOpacity="0.4" />
          <stop offset="100%" stopColor={soilDark} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`mn-pit-${entity.id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1a1008" />
          <stop offset="100%" stopColor={soilDark} />
        </radialGradient>
        <linearGradient id={`mn-tail-${entity.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3a6880" />
          <stop offset="100%" stopColor="#1e3545" />
        </linearGradient>
        <pattern id={`mn-noise-${entity.id}`} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill={soilBase} />
          <circle cx="1" cy="1" r="0.5" fill={soilDark} opacity="0.4" />
          <circle cx="3" cy="3" r="0.4" fill={soilLight} opacity="0.3" />
        </pattern>
        <radialGradient id={`mn-vig-${entity.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </radialGradient>
      </defs>

      {/* Base terrain */}
      <rect width={size} height={size} fill={`url(#mn-noise-${entity.id})`} />
      {terrainPatches.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill={p.fill} opacity={0.7}
          filter={`url(#mn-blur-${entity.id})`} />
      ))}

      {/* Terraced pit rings — outer to inner */}
      {Array.from({ length: levels }, (_, i) => {
        const fr = (levels - i) / levels;
        const rx = pitR * fr, ry = pitR * fr * tilt;
        const shade = Math.floor(60 + i * 18).toString(16).padStart(2, "0");
        return (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
            fill={i % 2 === 0 ? soilDark : soilBase}
            stroke={soilLight} strokeWidth={size / 320 * 0.8} opacity={0.9} />
        );
      })}

      {/* Pit floor gradient */}
      <ellipse cx={cx} cy={cy} rx={pitR * 0.22} ry={pitR * 0.22 * tilt}
        fill={`url(#mn-pit-${entity.id})`} />

      {/* Water at pit bottom */}
      <ellipse cx={cx} cy={cy + 4} rx={pitR * 0.12} ry={pitR * 0.08}
        fill="#2a4e6a" opacity={0.8} />

      {/* Spiral haul road */}
      {Array.from({ length: 20 }, (_, i) => {
        const t = (i / 20) * Math.PI * 1.8 + Math.PI * 0.3;
        const fr = 0.95 - i / 20 * 0.72;
        const x1 = cx + Math.cos(t) * pitR * fr;
        const y1 = cy + Math.sin(t) * pitR * fr * tilt;
        const t2 = ((i + 1) / 20) * Math.PI * 1.8 + Math.PI * 0.3;
        const fr2 = 0.95 - (i + 1) / 20 * 0.72;
        const x2 = cx + Math.cos(t2) * pitR * fr2;
        const y2 = cy + Math.sin(t2) * pitR * fr2 * tilt;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={roadCol} strokeWidth={size / 320 * 2.5} opacity={0.85} />;
      })}

      {/* Exit road from pit edge north */}
      <line x1={cx} y1={cy - pitR * tilt} x2={cx + size * 0.1} y2={0}
        stroke={roadCol} strokeWidth={size / 320 * 3} opacity={0.7} />

      {/* Processing plant buildings (top-right cluster) */}
      {[
        { x: cx + pitR * 0.9, y: cy - pitR * 0.6, w: size * 0.08, h: size * 0.05 },
        { x: cx + pitR * 1.1, y: cy - pitR * 0.4, w: size * 0.06, h: size * 0.04 },
        { x: cx + pitR * 0.85, y: cy - pitR * 0.3, w: size * 0.07, h: size * 0.035 },
        { x: cx + pitR * 1.0, y: cy - pitR * 0.1, w: size * 0.045, h: size * 0.045 },
      ].map((b, i) => (
        <rect key={i} x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={b.h}
          fill={i === 3 ? "#a89878" : "#c8b898"} stroke="#888" strokeWidth={0.5} opacity={0.9} />
      ))}

      {/* Tailings pond */}
      <ellipse cx={tailX} cy={tailY} rx={tailW} ry={tailH}
        fill={`url(#mn-tail-${entity.id})`} opacity={0.85} />
      {/* Pond shine */}
      <ellipse cx={tailX - tailW * 0.2} cy={tailY - tailH * 0.2}
        rx={tailW * 0.3} ry={tailH * 0.25} fill="rgba(100,180,210,0.2)" />

      {/* Dust / haze near pit edge */}
      <ellipse cx={cx + pitR * 0.4} cy={cy - pitR * 0.3} rx={pitR * 0.5} ry={pitR * 0.2}
        fill="rgba(220,200,160,0.15)" filter={`url(#mn-blur-${entity.id})`} />

      {/* Vignette */}
      <rect width={size} height={size} fill={`url(#mn-vig-${entity.id})`} />

      {/* Facility marker + HUD */}
      <circle cx={cx} cy={cy} r={size * 0.035} fill={alertGlow}
        filter={`url(#mn-glow-${entity.id})`} />
      <circle cx={cx} cy={cy} r={size * 0.018} fill={alertColor} />
      {[[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dy],i) => (
        <line key={i}
          x1={cx + dx * size * 0.055} y1={cy + dy * size * 0.055}
          x2={cx + dx * size * 0.032} y2={cy + dy * size * 0.032}
          stroke={alertColor} strokeWidth={size/320} opacity={0.8} />
      ))}
      {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy],i) => {
        const bx = cx + sx * size * 0.14, by = cy + sy * size * 0.14;
        const l = size * 0.035;
        return (
          <g key={i} stroke={alertColor} strokeWidth={size/320 * 0.8} fill="none" opacity={0.55}>
            <line x1={bx} y1={by} x2={bx - sx*l} y2={by} />
            <line x1={bx} y1={by} x2={bx} y2={by - sy*l} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── PROCESSING FACILITY (evaporation ponds) ─────────────────────────────────
// Resembles satellite view of lithium brine operations (Atacama) or
// chemical processing sites: rectangular ponds in turquoise/blue, pipelines
function ProcessorImagery({ size, entity, alertColor, alertGlow }: ImgProps) {
  const cx = size / 2, cy = size / 2;
  const s = rng(entity.id.charCodeAt(1) * 17 + 3);
  const isChina = entity.country === "China";
  const baseTerrain = isChina ? "#4a5a3a" : "#b8a878";
  const darkTerrain = isChina ? "#364430" : "#9a8a5e";

  // Evaporation pond grid — various stages shown by color gradient
  const pondColors = [
    "#1a4a6a", "#2a6880", "#2e8a7a", "#3aaa88",  // Stage 1-4 (dark→teal)
    "#4ab8a0", "#88d4c0", "#a0e8d0",              // Stage 5-7 (turquoise→pale)
    "#c8d4a0", "#d8c86a",                          // Late stage (yellow-green, high salt)
  ];

  const ponds = [
    { x: cx - size*0.36, y: cy - size*0.30, w: size*0.18, h: size*0.14, ci: 0 },
    { x: cx - size*0.15, y: cy - size*0.30, w: size*0.22, h: size*0.14, ci: 1 },
    { x: cx + size*0.10, y: cy - size*0.30, w: size*0.16, h: size*0.14, ci: 2 },
    { x: cx - size*0.36, y: cy - size*0.13, w: size*0.18, h: size*0.12, ci: 3 },
    { x: cx - size*0.15, y: cy - size*0.13, w: size*0.14, h: size*0.12, ci: 4 },
    { x: cx + size*0.02, y: cy - size*0.13, w: size*0.24, h: size*0.12, ci: 5 },
    { x: cx - size*0.36, y: cy + size*0.02, w: size*0.26, h: size*0.12, ci: 6 },
    { x: cx - size*0.07, y: cy + size*0.02, w: size*0.18, h: size*0.12, ci: 7 },
    { x: cx + size*0.14, y: cy + size*0.02, w: size*0.12, h: size*0.12, ci: 8 },
    { x: cx - size*0.20, y: cy + size*0.17, w: size*0.32, h: size*0.10, ci: 6 },
    { x: cx + size*0.15, y: cy + size*0.17, w: size*0.12, h: size*0.10, ci: 3 },
  ];

  // Processing buildings cluster (right side)
  const buildings = [
    { x: cx + size*0.30, y: cy - size*0.22, w: size*0.09, h: size*0.06 },
    { x: cx + size*0.30, y: cy - size*0.13, w: size*0.11, h: size*0.05 },
    { x: cx + size*0.30, y: cy - size*0.05, w: size*0.07, h: size*0.07 },
    { x: cx + size*0.30, y: cy + size*0.05, w: size*0.09, h: size*0.04 },
    { x: cx + size*0.30, y: cy + size*0.12, w: size*0.06, h: size*0.05 },
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <defs>
        <filter id={`pr-glow-${entity.id}`}>
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`pr-blur-${entity.id}`}><feGaussianBlur stdDeviation="1.5"/></filter>
        <pattern id={`pr-terr-${entity.id}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill={baseTerrain} />
          <rect x="0" y="0" width="2" height="2" fill={darkTerrain} opacity="0.4" />
          <rect x="4" y="3" width="2" height="2" fill={darkTerrain} opacity="0.3" />
        </pattern>
        <radialGradient id={`pr-vig-${entity.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
        </radialGradient>
        {ponds.map((p, i) => (
          <linearGradient key={i} id={`pond-${entity.id}-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={pondColors[p.ci]} stopOpacity="0.92" />
            <stop offset="100%" stopColor={pondColors[Math.min(p.ci + 1, pondColors.length-1)]} stopOpacity="0.92" />
          </linearGradient>
        ))}
      </defs>

      {/* Base terrain */}
      <rect width={size} height={size} fill={`url(#pr-terr-${entity.id})`} />

      {/* Ponds */}
      {ponds.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y} width={p.w} height={p.h}
            fill={`url(#pond-${entity.id}-${i})`}
            stroke="rgba(255,255,255,0.25)" strokeWidth={size/320 * 1.2} rx={size/320 * 2} />
          {/* Specular highlight on water surface */}
          <rect x={p.x + p.w*0.1} y={p.y + p.h*0.1} width={p.w*0.3} height={p.h*0.25}
            fill="rgba(255,255,255,0.12)" rx={size/320} />
        </g>
      ))}

      {/* Inter-pond dikes / berm roads */}
      <rect x={cx - size*0.37} y={cy - size*0.31} width={size*0.74} height={size*0.60}
        fill="none" stroke={baseTerrain} strokeWidth={size/320 * 3} rx={0} />

      {/* Pipeline / conveyor lines */}
      {[
        { x1: cx + size*0.28, y1: cy - size*0.19, x2: cx + size*0.06, y2: cy - size*0.19 },
        { x1: cx + size*0.28, y1: cy - size*0.10, x2: cx + size*0.26, y2: cy - size*0.28 },
        { x1: cx + size*0.28, y1: cy + size*0.08, x2: cx - size*0.07, y2: cy + size*0.08 },
      ].map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#888" strokeWidth={size/320 * 1.5} opacity={0.6} strokeDasharray={`${size/32},${size/64}`} />
      ))}

      {/* Processing buildings */}
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h}
            fill="#c0b890" stroke="#888" strokeWidth={0.5} />
          {/* Roof ridge line */}
          <line x1={b.x} y1={b.y + b.h/2} x2={b.x + b.w} y2={b.y + b.h/2}
            stroke="#a09870" strokeWidth={size/320} opacity={0.6} />
        </g>
      ))}

      {/* Storage tanks (circles) */}
      {[[cx + size*0.28, cy + size*0.17],[cx + size*0.32, cy + size*0.17],[cx + size*0.36, cy + size*0.17]].map(([tx,ty],i) => (
        <g key={i}>
          <circle cx={tx} cy={ty} r={size * 0.022} fill="#b8b0a0" stroke="#888" strokeWidth={0.5} />
          <circle cx={tx} cy={ty} r={size * 0.012} fill="#d0c8b8" />
        </g>
      ))}

      {/* Road */}
      <line x1={cx + size*0.35} y1={0} x2={cx + size*0.35} y2={size}
        stroke="#c0a870" strokeWidth={size/320 * 3} opacity={0.55} />

      {/* Vignette */}
      <rect width={size} height={size} fill={`url(#pr-vig-${entity.id})`} />

      {/* Facility marker */}
      <circle cx={cx} cy={cy} r={size * 0.035} fill={alertGlow}
        filter={`url(#pr-glow-${entity.id})`} />
      <circle cx={cx} cy={cy} r={size * 0.018} fill={alertColor} />
      {[[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dy],i) => (
        <line key={i}
          x1={cx + dx * size * 0.055} y1={cy + dy * size * 0.055}
          x2={cx + dx * size * 0.032} y2={cy + dy * size * 0.032}
          stroke={alertColor} strokeWidth={size/320} opacity={0.8} />
      ))}
      {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy],i) => {
        const bx = cx + sx * size*0.14, by = cy + sy * size*0.14, l = size*0.035;
        return (
          <g key={i} stroke={alertColor} strokeWidth={size/320*0.8} fill="none" opacity={0.55}>
            <line x1={bx} y1={by} x2={bx-sx*l} y2={by} />
            <line x1={bx} y1={by} x2={bx} y2={by-sy*l} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── MANUFACTURING FACILITY ───────────────────────────────────────────────────
// Resembles satellite view of large industrial/gigafactory campus:
// regular grid of large gray building footprints, parking lots, rail/road links
function ManufacturerImagery({ size, entity, alertColor, alertGlow }: ImgProps) {
  const cx = size / 2, cy = size / 2;
  const s = rng(entity.id.charCodeAt(1) * 23 + 11);
  const isChina = entity.country === "China";
  const groundCol = isChina ? "#6a7a5a" : "#8a9070";
  const concreteCol = "#9a9a90";
  const roofGray = "#c0c0b8";
  const roofDark = "#a0a098";
  const asphalt = "#787870";

  // Main building grid — large factory footprints
  const mainBuildings = [
    // Row 1 — top large buildings
    { x: cx - size*0.38, y: cy - size*0.35, w: size*0.26, h: size*0.14, shade: roofGray },
    { x: cx - size*0.09, y: cy - size*0.35, w: size*0.22, h: size*0.14, shade: roofDark },
    { x: cx + size*0.16, y: cy - size*0.35, w: size*0.24, h: size*0.14, shade: roofGray },
    // Row 2 — main production halls
    { x: cx - size*0.38, y: cy - size*0.17, w: size*0.36, h: size*0.16, shade: roofDark },
    { x: cx + size*0.01, y: cy - size*0.17, w: size*0.20, h: size*0.16, shade: roofGray },
    { x: cx + size*0.24, y: cy - size*0.17, w: size*0.16, h: size*0.16, shade: roofDark },
    // Row 3 — warehouse / logistics
    { x: cx - size*0.38, y: cy + size*0.02, w: size*0.20, h: size*0.12, shade: roofGray },
    { x: cx - size*0.15, y: cy + size*0.02, w: size*0.28, h: size*0.12, shade: concreteCol },
    { x: cx + size*0.16, y: cy + size*0.02, w: size*0.24, h: size*0.12, shade: roofDark },
    // Row 4 — smaller support buildings
    { x: cx - size*0.38, y: cy + size*0.17, w: size*0.12, h: size*0.08, shade: roofDark },
    { x: cx - size*0.23, y: cy + size*0.17, w: size*0.18, h: size*0.08, shade: roofGray },
    { x: cx - size*0.02, y: cy + size*0.17, w: size*0.26, h: size*0.08, shade: concreteCol },
    { x: cx + size*0.27, y: cy + size*0.17, w: size*0.13, h: size*0.08, shade: roofDark },
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <defs>
        <filter id={`mf-glow-${entity.id}`}>
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id={`mf-ground-${entity.id}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill={groundCol} />
          <rect x="0" y="0" width="3" height="3" fill="rgba(0,0,0,0.06)" />
          <rect x="5" y="5" width="3" height="3" fill="rgba(255,255,255,0.04)" />
        </pattern>
        <radialGradient id={`mf-vig-${entity.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </radialGradient>
      </defs>

      {/* Ground */}
      <rect width={size} height={size} fill={`url(#mf-ground-${entity.id})`} />

      {/* Perimeter road / fence line */}
      <rect x={cx - size*0.42} y={cy - size*0.42} width={size*0.84} height={size*0.84}
        fill="none" stroke={asphalt} strokeWidth={size/320 * 4} opacity={0.6} />

      {/* Internal road grid */}
      {[cy - size*0.17, cy + size*0.02, cy + size*0.17].map((y, i) => (
        <line key={`h${i}`} x1={cx - size*0.42} y1={y - size*0.01} x2={cx + size*0.42} y2={y - size*0.01}
          stroke={asphalt} strokeWidth={size/320*3} opacity={0.5} />
      ))}
      {[cx - size*0.09, cx + size*0.16].map((x, i) => (
        <line key={`v${i}`} x1={x - size*0.01} y1={cy - size*0.42} x2={x - size*0.01} y2={cy + size*0.42}
          stroke={asphalt} strokeWidth={size/320*2} opacity={0.45} />
      ))}

      {/* Buildings with cast shadow */}
      {mainBuildings.map((b, i) => (
        <g key={i}>
          {/* Shadow */}
          <rect x={b.x + size/320*2} y={b.y + size/320*2} width={b.w} height={b.h}
            fill="rgba(0,0,0,0.25)" rx={size/320} />
          {/* Body */}
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.shade} rx={size/320} />
          {/* Roof detail lines */}
          {Array.from({ length: 3 }, (_, j) => (
            <line key={j}
              x1={b.x + b.w * (j + 1) / 4} y1={b.y}
              x2={b.x + b.w * (j + 1) / 4} y2={b.y + b.h}
              stroke="rgba(0,0,0,0.12)" strokeWidth={size/320*0.8} />
          ))}
        </g>
      ))}

      {/* Parking lot (south-east) */}
      <rect x={cx + size*0.27} y={cy + size*0.28} width={size*0.14} height={size*0.12}
        fill={asphalt} opacity={0.55} />
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i}
          x1={cx + size*0.27 + size*0.028*i} y1={cy + size*0.28}
          x2={cx + size*0.27 + size*0.028*i} y2={cy + size*0.40}
          stroke="rgba(255,255,255,0.2)" strokeWidth={size/320*0.8} />
      ))}

      {/* Rail line */}
      <line x1={cx - size*0.5} y1={cy + size*0.38} x2={cx + size*0.5} y2={cy + size*0.38}
        stroke="#806a50" strokeWidth={size/320*2} opacity={0.6} />
      <line x1={cx - size*0.5} y1={cy + size*0.40} x2={cx + size*0.5} y2={cy + size*0.40}
        stroke="#806a50" strokeWidth={size/320*2} opacity={0.6} />
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i}
          x1={cx - size*0.5 + i * size*0.072} y1={cy + size*0.37}
          x2={cx - size*0.5 + i * size*0.072} y2={cy + size*0.41}
          stroke="#806a50" strokeWidth={size/320*2.5} opacity={0.5} />
      ))}

      {/* Power substation (small) */}
      <rect x={cx - size*0.44} y={cy + size*0.28} width={size*0.07} height={size*0.07}
        fill="#b8b0a0" stroke="#888" strokeWidth={0.5} />
      {[[0.3,0.3],[0.5,0.3],[0.7,0.3],[0.3,0.7],[0.5,0.7],[0.7,0.7]].map(([fx,fy],i) => (
        <circle key={i}
          cx={cx - size*0.44 + size*0.07*fx} cy={cy + size*0.28 + size*0.07*fy}
          r={size/320*1.5} fill="#888" />
      ))}

      {/* Vignette */}
      <rect width={size} height={size} fill={`url(#mf-vig-${entity.id})`} />

      {/* Facility marker */}
      <circle cx={cx} cy={cy} r={size*0.035} fill={alertGlow}
        filter={`url(#mf-glow-${entity.id})`} />
      <circle cx={cx} cy={cy} r={size*0.018} fill={alertColor} />
      {[[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dy],i) => (
        <line key={i}
          x1={cx + dx*size*0.055} y1={cy + dy*size*0.055}
          x2={cx + dx*size*0.032} y2={cy + dy*size*0.032}
          stroke={alertColor} strokeWidth={size/320} opacity={0.8} />
      ))}
      {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy],i) => {
        const bx = cx+sx*size*0.14, by = cy+sy*size*0.14, l = size*0.035;
        return (
          <g key={i} stroke={alertColor} strokeWidth={size/320*0.8} fill="none" opacity={0.55}>
            <line x1={bx} y1={by} x2={bx-sx*l} y2={by} />
            <line x1={bx} y1={by} x2={bx} y2={by-sy*l} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── TRADER / GENERIC ────────────────────────────────────────────────────────
function TraderImagery({ size, entity, alertColor, alertGlow }: ImgProps) {
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <defs>
        <filter id={`tr-glow-${entity.id}`}>
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id={`tr-urban-${entity.id}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#7a8a7a"/>
          <rect x="1" y="1" width="6" height="6" fill="#8a9a80" opacity="0.7"/>
          <rect x="9" y="1" width="5" height="5" fill="#6a7a68" opacity="0.7"/>
          <rect x="1" y="9" width="5" height="6" fill="#909a88" opacity="0.5"/>
          <rect x="8" y="9" width="7" height="6" fill="#6a7a68" opacity="0.5"/>
        </pattern>
        <radialGradient id={`tr-vig-${entity.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="50%" stopColor="transparent"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)"/>
        </radialGradient>
      </defs>
      <rect width={size} height={size} fill={`url(#tr-urban-${entity.id})`}/>
      {/* Grid roads */}
      {[0.25,0.5,0.75].map((f,i) => (
        <g key={i}>
          <line x1={0} y1={size*f} x2={size} y2={size*f} stroke="#5a6a58" strokeWidth={size/320*3} opacity={0.5}/>
          <line x1={size*f} y1={0} x2={size*f} y2={size} stroke="#5a6a58" strokeWidth={size/320*3} opacity={0.5}/>
        </g>
      ))}
      <rect width={size} height={size} fill={`url(#tr-vig-${entity.id})`}/>
      <circle cx={cx} cy={cy} r={size*0.035} fill={alertGlow} filter={`url(#tr-glow-${entity.id})`}/>
      <circle cx={cx} cy={cy} r={size*0.018} fill={alertColor}/>
      {[[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dy],i) => (
        <line key={i} x1={cx+dx*size*0.055} y1={cy+dy*size*0.055}
          x2={cx+dx*size*0.032} y2={cy+dy*size*0.032}
          stroke={alertColor} strokeWidth={size/320} opacity={0.8}/>
      ))}
      {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy],i) => {
        const bx=cx+sx*size*0.14, by=cy+sy*size*0.14, l=size*0.035;
        return (
          <g key={i} stroke={alertColor} strokeWidth={size/320*0.8} fill="none" opacity={0.55}>
            <line x1={bx} y1={by} x2={bx-sx*l} y2={by}/>
            <line x1={bx} y1={by} x2={bx} y2={by-sy*l}/>
          </g>
        );
      })}
    </svg>
  );
}

// ─── PUBLIC INTERFACE ────────────────────────────────────────────────────────
interface ImgProps {
  size: number;
  entity: Entity;
  alertColor: string;
  alertGlow: string;
}

export function SatelliteImageryView({ entity, size = 160 }: { entity: Entity; size?: number }) {
  const isFlagged = entity.verificationStatus === "flagged";
  const isMonitoring = entity.verificationStatus === "monitoring";
  const alertColor = isFlagged ? "rgba(255,90,70,0.95)" : isMonitoring ? "rgba(255,186,32,0.95)" : "rgba(67,236,219,0.95)";
  const alertGlow  = isFlagged ? "rgba(255,90,70,0.35)"  : isMonitoring ? "rgba(255,186,32,0.28)" : "rgba(67,236,219,0.28)";

  const props: ImgProps = { size, entity, alertColor, alertGlow };
  if (entity.type === "mining")       return <MiningImagery       {...props} />;
  if (entity.type === "processor")    return <ProcessorImagery    {...props} />;
  if (entity.type === "manufacturer") return <ManufacturerImagery {...props} />;
  return <TraderImagery {...props} />;
}
