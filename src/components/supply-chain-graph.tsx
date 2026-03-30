"use client";

import { entities, supplyChainLinks, getRiskDot } from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";

const tierX: Record<number, number> = { 3: 60, 2: 310, 1: 560 };

function getNodeY(id: string, tier: number): number {
  const tierEntities = entities.filter((e) => e.tier === tier);
  const idx = tierEntities.findIndex((e) => e.id === id);
  const spacing = 320 / Math.max(tierEntities.length, 1);
  return 50 + idx * spacing;
}

export function SupplyChainGraph() {
  return (
    <div className="bg-[var(--color-surface-container-low)] rounded-xl overflow-hidden">
      <div className="px-6 py-4 flex justify-between items-center bg-[var(--color-surface-container)]/50 border-b border-[var(--color-outline-variant)]/10">
        <h3 className="text-sm font-bold text-foreground">Origin to Destination Flow</h3>
        <div className="flex gap-4">
          <span className="flex items-center gap-1 text-[10px] text-[var(--color-muted-foreground)]">
            <span className="w-2 h-0.5 bg-[var(--color-error)]/60" /> PFE-linked
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[var(--color-muted-foreground)]">
            <span className="w-2 h-0.5 bg-[var(--color-secondary)]/60" /> Compliant
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="relative w-full" style={{ height: 380 }}>
          {/* Tier labels */}
          {([3, 2, 1] as const).map((tier) => (
            <div
              key={tier}
              className="absolute text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-[0.15em]"
              style={{ left: tierX[tier], top: 14 }}
            >
              Tier {tier}
              <span className="ml-1 normal-case font-normal text-[var(--color-muted-foreground)]">
                {tier === 3 ? "(Extraction)" : tier === 2 ? "(Processing)" : "(Manufacturing)"}
              </span>
            </div>
          ))}

          {/* Lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
            {supplyChainLinks.map((link, i) => {
              const from = entities.find((e) => e.id === link.from)!;
              const to = entities.find((e) => e.id === link.to)!;
              const x1 = tierX[from.tier] + 190;
              const y1 = getNodeY(from.id, from.tier) + 18;
              const x2 = tierX[to.tier];
              const y2 = getNodeY(to.id, to.tier) + 18;
              const hasRisk = link.riskFlags.length > 0;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={hasRisk ? "rgba(255,180,171,0.35)" : "rgba(67,236,219,0.2)"}
                  strokeWidth={hasRisk ? 2 : 1}
                  strokeDasharray={hasRisk ? "6 3" : "none"}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {entities.map((entity) => {
            const x = tierX[entity.tier];
            const y = getNodeY(entity.id, entity.tier);
            const riskDot = entity.riskLevel === "critical" ? "bg-[var(--color-error)]"
              : entity.riskLevel === "high" ? "bg-[var(--color-tertiary)]"
              : entity.riskLevel === "medium" ? "bg-[var(--color-primary)]"
              : "bg-[var(--color-secondary)]";
            return (
              <div
                key={entity.id}
                className="absolute bg-[var(--color-surface-container-highest)] border border-[var(--color-outline-variant)]/20 px-3 py-1.5 rounded-md hover:bg-[var(--color-surface-bright)] transition-colors cursor-pointer"
                style={{ left: x, top: y, width: 190 }}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${riskDot}`} />
                  <span className="text-[11px] font-bold text-foreground truncate">{entity.name}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-[var(--color-outline)]">{entity.countryCode}</span>
                  {entity.pfeDesignation && (
                    <span className="text-[8px] px-1 py-0 text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-sm font-bold">PFE</span>
                  )}
                  <span className="text-[9px] text-[var(--color-muted-foreground)] capitalize">{entity.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
