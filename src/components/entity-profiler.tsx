"use client";

import { useState } from "react";
import { entities, alerts, type Entity } from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";

function RiskBar({ label, score, color, note }: { label: string; score: number; color: string; note: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-[var(--color-muted-foreground)]">{label}</span>
        <span className={`text-xs font-bold ${color}`}>{score.toFixed(1)} / 10</span>
      </div>
      <div className="h-1 bg-[var(--color-surface-container-highest)] rounded-full overflow-hidden">
        <div className={`h-full ${color.replace("text-", "bg-")}`} style={{ width: `${score * 10}%` }} />
      </div>
      <p className="text-[10px] text-[var(--color-muted-foreground)] mt-1 italic">{note}</p>
    </div>
  );
}

function getRiskScores(e: Entity) {
  const geo = e.pfeDesignation ? 9.2 : e.riskLevel === "critical" ? 8.5 : e.riskLevel === "high" ? 6.8 : e.riskLevel === "medium" ? 4.5 : 2.1;
  const compliance = e.feocStatus === "non-compliant" ? 8.8 : e.feocStatus === "under-review" ? 6.2 : 2.5;
  const supply = e.tier <= 1 ? 7.5 : e.tier === 2 ? 5.2 : 3.1;
  return { geo, compliance, supply, aggregate: Number(((geo + compliance + supply) / 3).toFixed(1)) };
}

export function EntityProfiler() {
  const [selected, setSelected] = useState(entities[2]);
  const scores = getRiskScores(selected);
  const entityAlerts = alerts.filter((a) => a.entityId === selected.id);

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Risk Scoring */}
      <div className="col-span-12 lg:col-span-4 space-y-4">
        {/* Selector */}
        <div className="bg-[var(--color-surface-container)] p-5 rounded-xl">
          <h3 className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-widest mb-3">
            Select Entity
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {entities.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className={`text-[10px] px-2 py-1 rounded transition-colors ${
                  selected.id === e.id
                    ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30 font-bold"
                    : "bg-[var(--color-surface-container-highest)] text-[var(--color-muted-foreground)] hover:text-foreground border border-transparent"
                }`}
              >
                {e.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Decomposition */}
        <div className="bg-[var(--color-surface-container)] p-6 rounded-xl">
          <h3 className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-widest mb-6">
            Risk Decomposition
          </h3>
          <div className="space-y-6">
            <RiskBar label="Geopolitical Risk" score={scores.geo} color="text-[var(--color-error)]" note={selected.pfeDesignation ? "PFE-designated. Direct government ownership chain." : "Elevated by country and ownership structure."} />
            <RiskBar label="Compliance Risk" score={scores.compliance} color="text-[var(--color-tertiary)]" note={`FEOC status: ${selected.feocStatus}`} />
            <RiskBar label="Supply Chain Criticality" score={scores.supply} color="text-[var(--color-secondary)]" note={`Tier ${selected.tier} — ${selected.type}`} />
          </div>
        </div>

        {/* Aggregate Score */}
        <div className="bg-[var(--color-surface-container)] p-5 rounded-xl flex flex-col justify-between overflow-hidden relative">
          <div className="z-10">
            <h3 className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest mb-1">
              Aggregate Risk Score
            </h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-[var(--font-headline)] font-extrabold ${scores.aggregate > 7 ? "text-[var(--color-error)]" : scores.aggregate > 5 ? "text-[var(--color-tertiary)]" : "text-[var(--color-secondary)]"}`}>
                {scores.aggregate}
              </span>
              <span className="text-sm text-[var(--color-muted-foreground)]">/ 10</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <MsIcon name="shield" className="text-[120px]" />
          </div>
        </div>
      </div>

      {/* Ownership & Timeline */}
      <div className="col-span-12 lg:col-span-8 space-y-4">
        {/* Ownership Structure */}
        <div className="bg-[var(--color-surface-container)] p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
              Ownership Structure — {selected.name}
            </h3>
          </div>
          <div className="relative flex flex-col items-center py-4">
            {/* Root node */}
            <div className="bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] font-bold px-4 py-2 rounded-lg text-sm border-2 border-[var(--color-secondary)]/20 shadow-[0_0_15px_rgba(67,236,219,0.3)]">
              {selected.name}
            </div>
            <div className="h-6 w-px bg-[var(--color-outline-variant)]/30" />
            {/* Chain */}
            <div className="flex flex-col items-center gap-0">
              {selected.ownershipChain.map((owner, i) => {
                const isLast = i === selected.ownershipChain.length - 1;
                const isPfe = isLast && selected.pfeDesignation;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`${isPfe ? "bg-[var(--color-error)]/10 border-[var(--color-error)]/30" : "bg-[var(--color-surface-container-highest)] border-[var(--color-outline-variant)]/20"} border px-4 py-2 rounded-md text-[11px] text-center`}>
                      <div className="font-bold text-foreground">{owner}</div>
                      {isPfe && (
                        <div className="text-[9px] text-[var(--color-error)] mt-1 tracking-widest uppercase font-bold">
                          PFE Government Link
                        </div>
                      )}
                    </div>
                    {i < selected.ownershipChain.length - 1 && (
                      <div className="h-4 w-px bg-[var(--color-outline-variant)]/30" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Metadata */}
            <div className="mt-8 w-full">
              <h4 className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest mb-3">
                Entity Metadata
              </h4>
              <div className="flex flex-wrap gap-2">
                {selected.minerals.map((m) => (
                  <span key={m} className="px-2 py-1.5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/15 rounded-full text-[10px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
                    {m}
                  </span>
                ))}
                <span className="px-2 py-1.5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/15 rounded-full text-[10px] text-[var(--color-muted-foreground)]">
                  Tier {selected.tier} · {selected.type}
                </span>
                <span className="px-2 py-1.5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/15 rounded-full text-[10px] text-[var(--color-muted-foreground)]">
                  {selected.latitude.toFixed(2)}°, {selected.longitude.toFixed(2)}°
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Timeline */}
        <div className="bg-[var(--color-surface-container)] p-6 rounded-xl">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-6">
            Intelligence Timeline
          </h3>
          {entityAlerts.length > 0 ? (
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[var(--color-outline-variant)]/20">
              {entityAlerts.map((alert) => {
                const dotColor = alert.severity === "critical" ? "bg-[var(--color-error)]" : alert.severity === "high" ? "bg-[var(--color-tertiary)]" : "bg-[var(--color-secondary)]";
                return (
                  <div key={alert.id} className="relative pl-8">
                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full ${dotColor} border-4 border-[var(--color-surface-container-low)]`} />
                    <div className="text-[10px] text-[var(--color-muted-foreground)] font-bold uppercase mb-1">
                      {new Date(alert.timestamp).toLocaleDateString("en-US", { month: "short", year: "numeric" })} · {alert.type.replace("-", " ")}
                    </div>
                    <div className="text-sm font-bold text-foreground mb-1">{alert.title}</div>
                    <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">{alert.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <MsIcon name="info" className="text-2xl text-[var(--color-outline-variant)] mb-2" />
              <p className="text-xs text-[var(--color-muted-foreground)]">No recent intelligence events for this entity.</p>
              <p className="text-[10px] text-[var(--color-outline)]">{selected.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
