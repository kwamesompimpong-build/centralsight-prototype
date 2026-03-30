"use client";

import { useEffect } from "react";
import { MsIcon } from "@/components/ms-icon";
import type { Entity } from "@/data/mock";
import { SatelliteImageryView } from "@/components/satellite-imagery";

// Legacy stub — replaced by SatelliteImageryView
function SatelliteImagery({ entity, large }: { entity: Entity; large?: boolean }) {
  const size = large ? 480 : 160;
  const isFlagged = entity.verificationStatus === "flagged";
  const isMonitoring = entity.verificationStatus === "monitoring";
  const seed = entity.id.charCodeAt(1);

  // Terrain color based on entity country / type
  const terrainPalette =
    entity.country === "China"
      ? { base: "#1a2a1a", mid: "#243324", top: "#1e2e1e", accent: "#2e4a2e" }
      : entity.type === "mining"
      ? { base: "#2a2218", mid: "#3a3020", top: "#2e2a1a", accent: "#4a3e28" }
      : entity.country === "Finland"
      ? { base: "#18222a", mid: "#1e2e3a", top: "#1a2a34", accent: "#243840" }
      : { base: "#1a2228", mid: "#20303a", top: "#1c2c36", accent: "#263842" };

  const cx = size / 2;
  const cy = size / 2;

  // Generate deterministic "terrain" patches
  const patches = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 + seed * 0.3;
    const r = 20 + ((seed * (i + 3)) % 40);
    const px = cx + Math.cos(angle) * r * (size / 160);
    const py = cy + Math.sin(angle) * r * (size / 160);
    const w = 18 + ((seed * (i + 1)) % 30);
    const h = 12 + ((seed * (i + 2)) % 20);
    return { px, py, w: w * (size / 160), h: h * (size / 160), i };
  });

  // Building / facility blocks
  const buildings = Array.from({ length: entity.type === "manufacturer" ? 8 : entity.type === "processor" ? 6 : 4 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 + seed * 0.7;
    const r = 8 + ((seed * (i + 5)) % 22);
    const bx = cx + Math.cos(angle) * r * (size / 160);
    const by = cy + Math.sin(angle) * r * (size / 160);
    const bw = (6 + ((seed * (i + 1)) % 14)) * (size / 160);
    const bh = (4 + ((seed * (i + 2)) % 10)) * (size / 160);
    return { bx, by, bw, bh, i };
  });

  // Road lines
  const roads = [
    { x1: cx - size * 0.45, y1: cy, x2: cx + size * 0.45, y2: cy + size * 0.05 },
    { x1: cx + size * 0.05, y1: cy - size * 0.45, x2: cx - size * 0.05, y2: cy + size * 0.45 },
  ];

  const alertColor = isFlagged ? "rgba(255,100,80,0.9)" : isMonitoring ? "rgba(255,186,32,0.9)" : "rgba(67,236,219,0.9)";
  const alertGlow = isFlagged ? "rgba(255,100,80,0.3)" : isMonitoring ? "rgba(255,186,32,0.2)" : "rgba(67,236,219,0.2)";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full"
      style={{ display: "block" }}
    >
      <defs>
        <filter id={`blur-${entity.id}`}>
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <filter id={`glow-${entity.id}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id={`grid-${entity.id}`} width={large ? 24 : 12} height={large ? 24 : 12} patternUnits="userSpaceOnUse">
          <path
            d={`M ${large ? 24 : 12} 0 L 0 0 0 ${large ? 24 : 12}`}
            fill="none"
            stroke="rgba(152,203,255,0.06)"
            strokeWidth="0.5"
          />
        </pattern>
        <radialGradient id={`vignette-${entity.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
        </radialGradient>
      </defs>

      {/* Base terrain */}
      <rect width={size} height={size} fill={terrainPalette.base} />

      {/* Terrain variation patches */}
      {patches.map((p) => (
        <ellipse
          key={p.i}
          cx={p.px}
          cy={p.py}
          rx={p.w}
          ry={p.h}
          fill={p.i % 3 === 0 ? terrainPalette.accent : p.i % 3 === 1 ? terrainPalette.mid : terrainPalette.top}
          opacity={0.6 + (p.i % 4) * 0.1}
          filter={`url(#blur-${entity.id})`}
        />
      ))}

      {/* Mining open-pit ring for mining type */}
      {entity.type === "mining" && (
        <>
          {[40, 30, 20, 10].map((r, i) => (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={r * (size / 160)}
              ry={r * 0.6 * (size / 160)}
              fill="none"
              stroke={i % 2 === 0 ? "rgba(90,70,40,0.8)" : "rgba(120,95,55,0.6)"}
              strokeWidth={size / 160}
            />
          ))}
          <ellipse cx={cx} cy={cy} rx={8 * (size / 160)} ry={5 * (size / 160)} fill="rgba(60,45,25,0.9)" />
        </>
      )}

      {/* Evaporation ponds for processors */}
      {entity.type === "processor" && (
        <>
          {[[-22, -15], [10, -18], [-18, 12], [15, 8]].map(([dx, dy], i) => (
            <rect
              key={i}
              x={(cx + dx * (size / 160)) - 10 * (size / 160)}
              y={(cy + dy * (size / 160)) - 6 * (size / 160)}
              width={20 * (size / 160)}
              height={12 * (size / 160)}
              rx={1}
              fill={i < 2 ? "rgba(67,120,140,0.7)" : "rgba(80,140,100,0.5)"}
              stroke="rgba(152,203,255,0.2)"
              strokeWidth="0.5"
            />
          ))}
        </>
      )}

      {/* Roads */}
      {roads.map((r, i) => (
        <line
          key={i}
          x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
          stroke="rgba(200,190,170,0.25)"
          strokeWidth={size / 160}
        />
      ))}

      {/* Buildings / facility blocks */}
      {buildings.map((b) => (
        <rect
          key={b.i}
          x={b.bx - b.bw / 2}
          y={b.by - b.bh / 2}
          width={b.bw}
          height={b.bh}
          fill={b.i % 2 === 0 ? "rgba(180,175,165,0.5)" : "rgba(140,135,125,0.4)"}
          stroke="rgba(210,205,195,0.15)"
          strokeWidth="0.5"
        />
      ))}

      {/* Grid overlay */}
      <rect width={size} height={size} fill={`url(#grid-${entity.id})`} />

      {/* Vignette */}
      <rect width={size} height={size} fill={`url(#vignette-${entity.id})`} />

      {/* Primary facility marker */}
      <circle cx={cx} cy={cy} r={large ? 12 : 6} fill={alertGlow} filter={`url(#glow-${entity.id})`} />
      <circle cx={cx} cy={cy} r={large ? 5 : 3} fill={alertColor} />

      {/* Crosshair */}
      <line x1={cx - (large ? 20 : 10)} y1={cy} x2={cx - (large ? 8 : 5)} y2={cy} stroke={alertColor} strokeWidth="0.75" opacity={0.7} />
      <line x1={cx + (large ? 8 : 5)} y1={cy} x2={cx + (large ? 20 : 10)} y2={cy} stroke={alertColor} strokeWidth="0.75" opacity={0.7} />
      <line x1={cx} y1={cy - (large ? 20 : 10)} x2={cx} y2={cy - (large ? 8 : 5)} stroke={alertColor} strokeWidth="0.75" opacity={0.7} />
      <line x1={cx} y1={cy + (large ? 8 : 5)} x2={cx} y2={cy + (large ? 20 : 10)} stroke={alertColor} strokeWidth="0.75" opacity={0.7} />

      {/* Corner brackets */}
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => {
        const bx = cx + sx * (large ? 40 : 22);
        const by = cy + sy * (large ? 40 : 22);
        const bl = large ? 10 : 5;
        return (
          <g key={i} stroke={alertColor} strokeWidth="0.75" fill="none" opacity={0.5}>
            <line x1={bx} y1={by} x2={bx - sx * bl} y2={by} />
            <line x1={bx} y1={by} x2={bx} y2={by - sy * bl} />
          </g>
        );
      })}

      {/* Flagged: anomaly detection rings */}
      {isFlagged && (
        <>
          <circle cx={cx + 18 * (size / 160)} cy={cy - 14 * (size / 160)} r={8 * (size / 160)} fill="none" stroke="rgba(255,100,80,0.5)" strokeWidth="1" strokeDasharray="3 2" />
          <circle cx={cx + 18 * (size / 160)} cy={cy - 14 * (size / 160)} r={3 * (size / 160)} fill="rgba(255,100,80,0.7)" />
        </>
      )}

      {/* Scan line effect */}
      <rect width={size} height={2} y={size * 0.35} fill="rgba(67,236,219,0.04)" />
      <rect width={size} height={1} y={size * 0.65} fill="rgba(67,236,219,0.03)" />
    </svg>
  );
}

interface Props {
  entity: Entity;
  onClose: () => void;
}

const changeHistory = [
  { date: "2026-03-15", delta: "+12% facility footprint", type: "expansion" },
  { date: "2026-02-28", delta: "New structure detected (NW quadrant)", type: "construction" },
  { date: "2026-01-10", delta: "Thermal signature increase +340°C", type: "activity" },
  { date: "2025-12-03", delta: "Vehicle count baseline established", type: "baseline" },
];

export function SatelliteModal({ entity, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isFlagged = entity.verificationStatus === "flagged";
  const statusColor =
    isFlagged ? "text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20"
    : entity.verificationStatus === "monitoring" ? "text-[var(--color-tertiary)] bg-[var(--color-tertiary)]/10 border-[var(--color-tertiary)]/20"
    : "text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-4xl bg-[var(--color-surface-container)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-outline-variant)]/20 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-surface-container-high)]/60 border-b border-[var(--color-outline-variant)]/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[var(--color-secondary)] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>satellite_alt</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{entity.name}</h2>
              <p className="text-[10px] text-[var(--color-outline)]">
                {entity.latitude.toFixed(4)}°N, {Math.abs(entity.longitude).toFixed(4)}°{entity.longitude > 0 ? "E" : "W"} · {entity.country}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm border uppercase tracking-widest ${statusColor}`}>
              {entity.verificationStatus}
            </span>
            {entity.pfeDesignation && (
              <span className="px-1.5 py-0.5 text-[8px] font-bold text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-sm">PFE</span>
            )}
            <button
              onClick={onClose}
              className="ml-2 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-outline)] hover:text-foreground hover:bg-[var(--color-surface-container-highest)] transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <div className="grid lg:grid-cols-2 gap-0">

            {/* Imagery panel */}
            <div className="bg-[#0b0e14] relative flex items-center justify-center" style={{ minHeight: 320 }}>
              <div className="w-full h-full" style={{ aspectRatio: "1 / 1", maxHeight: 400 }}>
                <SatelliteImageryView entity={entity} size={480} />
              </div>

              {/* Overlay HUD */}
              <div className="absolute top-3 left-3 font-mono text-[9px] text-[var(--color-secondary)]/70 space-y-0.5">
                <div>SENTINEL-2 / MAXAR</div>
                <div>RES: 0.5m GSD</div>
                <div>PASS: {entity.lastSatelliteVerification}</div>
              </div>
              <div className="absolute bottom-3 right-3 font-mono text-[9px] text-[var(--color-outline)]/60 text-right space-y-0.5">
                <div>BAND: NIR-R-G</div>
                <div>CLOUD: 2%</div>
                <div>CLASSIFICATION: UNCLASSIFIED//FOUO</div>
              </div>
              {isFlagged && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded px-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-error)] animate-pulse" />
                  <span className="text-[9px] font-bold text-[var(--color-error)]">ANOMALY DETECTED</span>
                </div>
              )}
            </div>

            {/* Intel panel */}
            <div className="p-6 space-y-5">

              {/* Entity metadata */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Facility Type", value: entity.type },
                  { label: "Country", value: entity.country },
                  { label: "FEOC Status", value: entity.feocStatus.replace("-", " ") },
                  { label: "Risk Level", value: entity.riskLevel },
                  { label: "Minerals", value: entity.minerals.join(", ") },
                  { label: "Supply Tier", value: `Tier ${entity.tier}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[var(--color-surface-container-low)] rounded-lg p-2.5">
                    <p className="text-[9px] text-[var(--color-outline)] uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-xs font-bold text-foreground capitalize">{value}</p>
                  </div>
                ))}
              </div>

              {/* Ownership chain */}
              <div>
                <p className="text-[9px] text-[var(--color-outline)] uppercase tracking-widest font-bold mb-2">Ownership Chain</p>
                <div className="space-y-1">
                  {entity.ownershipChain.map((owner, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {i > 0 && <span className="text-[var(--color-outline)] text-[10px] ml-1">↳</span>}
                      <span className={`text-xs ${i === entity.ownershipChain.length - 1 && entity.pfeDesignation ? "text-[var(--color-error)]" : "text-[var(--color-muted-foreground)]"}`}>
                        {owner}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intel notes */}
              <div className="bg-[var(--color-surface-container-low)] rounded-lg p-3 border-l-2 border-[var(--color-primary)]/40">
                <p className="text-[9px] text-[var(--color-outline)] uppercase tracking-widest font-bold mb-1.5">OSINT Assessment</p>
                <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">{entity.notes}</p>
              </div>
            </div>
          </div>

          {/* Change detection timeline */}
          <div className="px-6 pb-6 border-t border-[var(--color-outline-variant)]/10 pt-5">
            <p className="text-[9px] text-[var(--color-outline)] uppercase tracking-widest font-bold mb-3">Change Detection History</p>
            <div className="flex gap-4 overflow-x-auto pb-1">
              {changeHistory.map((event, i) => (
                <div key={i} className="shrink-0 bg-[var(--color-surface-container-low)] rounded-lg p-3 min-w-[160px]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      event.type === "expansion" ? "bg-[var(--color-error)]"
                      : event.type === "construction" ? "bg-[var(--color-tertiary)]"
                      : event.type === "activity" ? "bg-[var(--color-primary)]"
                      : "bg-[var(--color-secondary)]"
                    }`} />
                    <span className="text-[9px] font-bold text-[var(--color-outline)] uppercase">{event.type}</span>
                  </div>
                  <p className="text-[10px] font-bold text-foreground">{event.date}</p>
                  <p className="text-[9px] text-[var(--color-muted-foreground)] mt-0.5">{event.delta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--color-outline-variant)]/10 flex items-center justify-between bg-[var(--color-surface-container-low)]/60 shrink-0">
          <span className="text-[9px] text-[var(--color-outline)] font-mono">UNCLASSIFIED // FOR OFFICIAL USE ONLY</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-[10px] font-bold text-[var(--color-muted-foreground)] hover:text-foreground bg-[var(--color-surface-container-highest)] rounded transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">download</span>
              Export Report
            </button>
            <button className="px-3 py-1.5 text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">flag</span>
              Flag for Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
