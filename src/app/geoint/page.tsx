"use client";

import { useState } from "react";
import { entities, alerts, type Entity } from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";
import { SatelliteModal } from "@/components/satellite-modal";

function SatelliteImageryThumb({ entity }: { entity: Entity }) {
  const isFlagged = entity.verificationStatus === "flagged";
  const isMonitoring = entity.verificationStatus === "monitoring";
  const seed = entity.id.charCodeAt(1);
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;

  const terrainPalette =
    entity.country === "China"
      ? { base: "#1a2a1a", mid: "#243324", accent: "#2e4a2e" }
      : entity.type === "mining"
      ? { base: "#2a2218", mid: "#3a3020", accent: "#4a3e28" }
      : entity.country === "Finland"
      ? { base: "#18222a", mid: "#1e2e3a", accent: "#243840" }
      : { base: "#1a2228", mid: "#20303a", accent: "#263842" };

  const patches = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2 + seed * 0.3;
    const r = 18 + ((seed * (i + 3)) % 36);
    return {
      px: cx + Math.cos(angle) * r,
      py: cy + Math.sin(angle) * r,
      w: 16 + ((seed * (i + 1)) % 28),
      h: 10 + ((seed * (i + 2)) % 18),
      i,
    };
  });

  const buildings = Array.from({ length: entity.type === "manufacturer" ? 7 : entity.type === "processor" ? 5 : 3 }, (_, i) => {
    const angle = (i / 7) * Math.PI * 2 + seed * 0.7;
    const r = 8 + ((seed * (i + 5)) % 20);
    return {
      bx: cx + Math.cos(angle) * r,
      by: cy + Math.sin(angle) * r,
      bw: 6 + ((seed * (i + 1)) % 13),
      bh: 4 + ((seed * (i + 2)) % 9),
      i,
    };
  });

  const alertColor = isFlagged ? "rgba(255,100,80,0.9)" : isMonitoring ? "rgba(255,186,32,0.9)" : "rgba(67,236,219,0.9)";
  const alertGlow  = isFlagged ? "rgba(255,100,80,0.35)" : isMonitoring ? "rgba(255,186,32,0.25)" : "rgba(67,236,219,0.25)";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="w-full h-full block">
      <defs>
        <filter id={`tb-${entity.id}`}><feGaussianBlur stdDeviation="1.2" /></filter>
        <filter id={`tg-${entity.id}`}>
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id={`tgrid-${entity.id}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M 12 0 L 0 0 0 12" fill="none" stroke="rgba(152,203,255,0.06)" strokeWidth="0.5" />
        </pattern>
        <radialGradient id={`tvig-${entity.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
        </radialGradient>
      </defs>

      <rect width={size} height={size} fill={terrainPalette.base} />
      {patches.map((p) => (
        <ellipse key={p.i} cx={p.px} cy={p.py} rx={p.w} ry={p.h}
          fill={p.i % 3 === 0 ? terrainPalette.accent : terrainPalette.mid}
          opacity={0.55 + (p.i % 4) * 0.1} filter={`url(#tb-${entity.id})`} />
      ))}

      {entity.type === "mining" && [38, 27, 17, 8].map((r, i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.6}
          fill="none" stroke={i % 2 === 0 ? "rgba(90,70,40,0.8)" : "rgba(120,95,55,0.6)"} strokeWidth="1" />
      ))}
      {entity.type === "mining" && <ellipse cx={cx} cy={cy} rx={7} ry={4} fill="rgba(60,45,25,0.9)" />}

      {entity.type === "processor" && [[-20,-13],[10,-16],[-16,11],[14,7]].map(([dx, dy], i) => (
        <rect key={i} x={cx + dx - 9} y={cy + dy - 5} width={18} height={11} rx={1}
          fill={i < 2 ? "rgba(67,120,140,0.65)" : "rgba(80,140,100,0.45)"}
          stroke="rgba(152,203,255,0.2)" strokeWidth="0.5" />
      ))}

      <line x1={cx - 72} y1={cy} x2={cx + 72} y2={cy + 4} stroke="rgba(200,190,170,0.2)" strokeWidth="1" />
      <line x1={cx + 4} y1={cy - 72} x2={cx - 4} y2={cy + 72} stroke="rgba(200,190,170,0.2)" strokeWidth="1" />

      {buildings.map((b) => (
        <rect key={b.i} x={b.bx - b.bw / 2} y={b.by - b.bh / 2} width={b.bw} height={b.bh}
          fill={b.i % 2 === 0 ? "rgba(175,170,160,0.45)" : "rgba(135,130,120,0.35)"}
          stroke="rgba(210,205,195,0.12)" strokeWidth="0.5" />
      ))}

      <rect width={size} height={size} fill={`url(#tgrid-${entity.id})`} />
      <rect width={size} height={size} fill={`url(#tvig-${entity.id})`} />

      <circle cx={cx} cy={cy} r={10} fill={alertGlow} filter={`url(#tg-${entity.id})`} />
      <circle cx={cx} cy={cy} r={3} fill={alertColor} />
      {([-10, -5] as const).map((d, axis) =>
        axis === 0
          ? [<line key="l1" x1={cx - 10} y1={cy} x2={cx - 5} y2={cy} stroke={alertColor} strokeWidth="0.75" opacity={0.7} />,
             <line key="l2" x1={cx + 5}  y1={cy} x2={cx + 10} y2={cy} stroke={alertColor} strokeWidth="0.75" opacity={0.7} />]
          : [<line key="l3" x1={cx} y1={cy - 10} x2={cx} y2={cy - 5} stroke={alertColor} strokeWidth="0.75" opacity={0.7} />,
             <line key="l4" x1={cx} y1={cy + 5}  x2={cx} y2={cy + 10} stroke={alertColor} strokeWidth="0.75" opacity={0.7} />]
      )}

      {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx, sy], i) => {
        const bx = cx + sx * 22;
        const by = cy + sy * 22;
        return (
          <g key={i} stroke={alertColor} strokeWidth="0.75" fill="none" opacity={0.45}>
            <line x1={bx} y1={by} x2={bx - sx * 5} y2={by} />
            <line x1={bx} y1={by} x2={bx} y2={by - sy * 5} />
          </g>
        );
      })}

      {isFlagged && (
        <>
          <circle cx={cx + 18} cy={cy - 14} r={7} fill="none" stroke="rgba(255,100,80,0.5)" strokeWidth="1" strokeDasharray="3 2" />
          <circle cx={cx + 18} cy={cy - 14} r={2.5} fill="rgba(255,100,80,0.8)" />
        </>
      )}
    </svg>
  );
}

function SatelliteCard({ entity, onClick }: { entity: Entity; onClick: () => void }) {
  const isFlagged = entity.verificationStatus === "flagged";
  const statusColor =
    entity.verificationStatus === "verified"
      ? "text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/20"
      : entity.verificationStatus === "flagged"
      ? "text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20"
      : "text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-[var(--color-surface-container-low)] rounded-xl overflow-hidden transition-all duration-200 hover:bg-[var(--color-surface-container)] hover:scale-[1.015] hover:shadow-lg group cursor-pointer ${
        isFlagged ? "border border-[var(--color-error)]/25 ring-1 ring-[var(--color-error)]/10" : "border border-transparent"
      }`}
    >
      {/* Imagery */}
      <div className="relative bg-[#0b0e14] overflow-hidden" style={{ height: 160 }}>
        <SatelliteImageryThumb entity={entity} />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="flex items-center gap-1.5 bg-[var(--color-surface-container)]/90 rounded-lg px-3 py-1.5 border border-[var(--color-outline-variant)]/20">
            <span className="material-symbols-outlined text-[var(--color-secondary)] text-sm">open_in_full</span>
            <span className="text-[10px] font-bold text-foreground">View Intelligence</span>
          </div>
        </div>

        {/* Coords */}
        <div className="absolute bottom-2 left-2 text-[9px] font-mono text-[var(--color-outline)] bg-[#0b0e14]/80 px-1.5 py-0.5 rounded">
          {entity.latitude.toFixed(4)}°N, {Math.abs(entity.longitude).toFixed(4)}°{entity.longitude > 0 ? "E" : "W"}
        </div>
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm border uppercase tracking-widest ${statusColor}`}>
            {entity.verificationStatus}
          </span>
        </div>
        {/* Source label */}
        <div className="absolute top-2 left-2 text-[8px] font-mono text-[var(--color-secondary)]/50">
          {entity.verificationStatus === "verified" ? "PLANET LABS" : "MAXAR / S-2"}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-foreground leading-tight">{entity.name}</h4>
          {entity.pfeDesignation && (
            <span className="text-[8px] font-bold text-[var(--color-error)] bg-[var(--color-error)]/10 px-1 py-0.5 rounded-sm border border-[var(--color-error)]/20 shrink-0 ml-2">
              PFE
            </span>
          )}
        </div>
        <p className="text-[10px] text-[var(--color-muted-foreground)]">{entity.country}</p>

        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-[var(--color-outline)]">Last Pass</span>
            <span className="font-mono text-foreground">{entity.lastSatelliteVerification}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-[var(--color-outline)]">Facility</span>
            <span className="capitalize text-foreground">{entity.type}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-[var(--color-outline)]">Minerals</span>
            <span className="text-foreground truncate ml-4 text-right">{entity.minerals.join(", ")}</span>
          </div>
        </div>

        <p className="text-[10px] text-[var(--color-muted-foreground)] mt-3 line-clamp-2 italic leading-relaxed">
          {entity.notes}
        </p>
      </div>
    </button>
  );
}

export default function GeointPage() {
  const [selected, setSelected] = useState<Entity | null>(null);
  const satelliteAlerts = alerts.filter((a) => a.type === "satellite");
  const verified   = entities.filter((e) => e.verificationStatus === "verified").length;
  const monitoring = entities.filter((e) => e.verificationStatus === "monitoring").length;
  const flagged    = entities.filter((e) => e.verificationStatus === "flagged").length;

  return (
    <>
      {selected && <SatelliteModal entity={selected} onClose={() => setSelected(null)} />}

      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-[var(--font-headline)] font-extrabold tracking-tight text-foreground">
              GEOINT — Satellite Verification
            </h1>
            <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
              Facility verification through satellite imagery analysis, OSINT fusion, and geospatial provenance.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-secondary)]/20">
            <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Verified</p>
            <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-secondary)]">{verified}</span>
          </div>
          <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-primary)]/20">
            <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Monitoring</p>
            <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-primary)]">{monitoring}</span>
          </div>
          <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-error)]/20">
            <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Flagged</p>
            <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-error)]">{flagged}</span>
          </div>
          <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-tertiary)]/20">
            <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Sat Alerts</p>
            <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-tertiary)]">{satelliteAlerts.length}</span>
          </div>
        </div>

        {/* Card grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4">
            Facility Verification — Click any card to view full intelligence
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {entities.map((entity) => (
              <SatelliteCard key={entity.id} entity={entity} onClick={() => setSelected(entity)} />
            ))}
          </div>
        </div>

        {/* Satellite intel feed */}
        <div className="bg-[var(--color-surface-container-low)] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-[var(--font-headline)] font-bold text-lg text-foreground tracking-tight flex items-center gap-2">
              <MsIcon name="satellite_alt" className="text-[var(--color-secondary)]" />
              Satellite Intelligence Feed
            </h3>
            <span className="px-2 py-1 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-[10px] font-bold rounded-sm border border-[var(--color-secondary)]/20">
              SENTINEL-2 / MAXAR
            </span>
          </div>
          <div className="space-y-3">
            {satelliteAlerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => {
                  const entity = entities.find((e) => e.id === alert.entityId);
                  if (entity) setSelected(entity);
                }}
                className="w-full text-left flex gap-4 p-3 bg-[var(--color-surface-container)]/50 rounded border-l-2 border-[var(--color-secondary)] hover:bg-[var(--color-surface-container)] transition-colors"
              >
                <div className="w-10 h-10 flex-shrink-0 bg-[var(--color-secondary)]/10 rounded flex items-center justify-center">
                  <MsIcon name="satellite_alt" className="text-[var(--color-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground">{alert.title}</h4>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] bg-[var(--color-surface-container-highest)] px-2 py-0.5 rounded">{alert.entityName}</span>
                    <span className="text-[9px] text-[var(--color-outline)]">{alert.source}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
