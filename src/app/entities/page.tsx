"use client";

import { useState } from "react";
import {
  entities,
  alerts,
  getRiskDot,
  type Entity,
} from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";
import { EntityProfiler } from "@/components/entity-profiler";
import { useSanctionsSearch, useFilingsSearch, type SanctionsResponse, type FilingsResponse } from "@/hooks/use-api";

function SanctionsPanel({ entityName }: { entityName: string }) {
  const { data, loading, error } = useSanctionsSearch(entityName.split(" ")[0]);

  return (
    <div className="bg-[var(--color-surface-container)] rounded-xl p-5 border border-[var(--color-outline-variant)]/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
          Sanctions Screening — {entityName}
        </h3>
        <span className="text-[9px] text-[var(--color-outline)] bg-[var(--color-surface-container-highest)] px-2 py-0.5 rounded">
          Consolidated Screening List (trade.gov)
        </span>
      </div>

      {loading && (
        <div className="text-[12px] text-[var(--color-primary)] animate-pulse py-4 text-center">
          Screening against 11 U.S. government sanctions lists...
        </div>
      )}

      {error && (
        <div className="text-[12px] text-[var(--color-error)] py-2">
          Screening unavailable: {error}
        </div>
      )}

      {data && !loading && (
        <>
          {data.total === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-[var(--color-secondary)]/5 rounded-lg">
              <span className="material-symbols-outlined text-[var(--color-secondary)] text-sm">verified</span>
              <span className="text-[12px] text-[var(--color-secondary)] font-medium">
                No matches found across OFAC SDN, BIS Entity List, UFLPA, or 8 other lists.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-[var(--color-error)]/5 rounded-lg mb-3">
                <span className="material-symbols-outlined text-[var(--color-error)] text-sm">warning</span>
                <span className="text-[12px] text-[var(--color-error)] font-bold">
                  {data.total} match{data.total > 1 ? "es" : ""} found
                </span>
              </div>
              {data.results.slice(0, 5).map((r, i) => (
                <div key={i} className="p-3 bg-[var(--color-surface-container-low)] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-foreground">{r.name}</span>
                    <span className="text-[9px] bg-[var(--color-error)]/10 text-[var(--color-error)] px-1.5 py-0.5 rounded border border-[var(--color-error)]/20 font-bold">
                      {r.source}
                    </span>
                  </div>
                  <div className="flex gap-2 text-[10px] text-[var(--color-muted-foreground)]">
                    <span>{r.type}</span>
                    <span>·</span>
                    <span>{r.country}</span>
                  </div>
                  {r.programs.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {r.programs.map((p, j) => (
                        <span key={j} className="text-[9px] bg-[var(--color-surface-container-highest)] px-1.5 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {r.remarks && (
                    <p className="text-[10px] text-[var(--color-outline)] mt-1.5 line-clamp-2">{r.remarks}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilingsPanel() {
  const { data, loading, error } = useFilingsSearch('"critical minerals"');

  return (
    <div className="bg-[var(--color-surface-container)] rounded-xl p-5 border border-[var(--color-outline-variant)]/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
          SEC EDGAR — Critical Minerals Filings
        </h3>
        <span className="text-[9px] text-[var(--color-outline)] bg-[var(--color-surface-container-highest)] px-2 py-0.5 rounded">
          efts.sec.gov
        </span>
      </div>

      {loading && (
        <div className="text-[12px] text-[var(--color-primary)] animate-pulse py-4 text-center">
          Searching SEC EDGAR full-text index...
        </div>
      )}

      {error && (
        <div className="text-[12px] text-[var(--color-error)] py-2">
          EDGAR search unavailable: {error}
        </div>
      )}

      {data && !loading && data.results.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-[var(--color-muted-foreground)] mb-3">
            {data.total} filings mentioning &quot;critical minerals&quot;
          </p>
          {data.results.slice(0, 8).map((filing) => (
            <div key={filing.id} className="flex items-center justify-between p-2.5 bg-[var(--color-surface-container-low)] rounded-lg hover:bg-[var(--color-surface-container-high)] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded">
                    {filing.filingType}
                  </span>
                  <span className="text-[11px] font-bold text-foreground truncate">{filing.entityName}</span>
                </div>
                <span className="text-[10px] text-[var(--color-outline)]">{filing.fileDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EntitiesPage() {
  const [selectedForScreening, setSelectedForScreening] = useState<Entity>(entities[0]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase border border-[var(--color-secondary)]/20 rounded-sm">
              Entity Intelligence
            </span>
            <span className="text-[var(--color-muted-foreground)] text-[10px] font-bold tracking-widest uppercase">
              {entities.length} Tracked
            </span>
            <span className="text-[var(--color-secondary)] text-[10px] font-bold tracking-widest uppercase bg-[var(--color-secondary)]/5 px-2 py-0.5 rounded">
              LIVE SCREENING
            </span>
          </div>
          <h1 className="text-3xl font-[var(--font-headline)] font-extrabold text-foreground tracking-tight">
            Entity Risk Profiler
          </h1>
          <p className="text-[var(--color-muted-foreground)] mt-1 text-sm">
            Live sanctions screening via Consolidated Screening List. SEC EDGAR filing search. Beneficial ownership tracing.
          </p>
        </div>
        <button className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-[var(--color-primary-foreground)] px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:brightness-110 transition-all">
          <MsIcon name="download" className="text-sm" />
          Export Intelligence Pack
        </button>
      </div>

      {/* Entity Grid — click to screen */}
      <div className="grid grid-cols-5 gap-3">
        {entities.map((e) => {
          const riskColor =
            e.riskLevel === "critical" ? "border-[var(--color-error)]/40"
            : e.riskLevel === "high" ? "border-[var(--color-tertiary)]/40"
            : e.riskLevel === "medium" ? "border-[var(--color-primary)]/40"
            : "border-[var(--color-secondary)]/40";
          const riskText =
            e.riskLevel === "critical" ? "text-[var(--color-error)]"
            : e.riskLevel === "high" ? "text-[var(--color-tertiary)]"
            : e.riskLevel === "medium" ? "text-[var(--color-primary)]"
            : "text-[var(--color-secondary)]";
          const isSelected = selectedForScreening.id === e.id;
          return (
            <button
              key={e.id}
              onClick={() => setSelectedForScreening(e)}
              className={`text-left bg-[var(--color-surface-container-low)] p-3 rounded-xl border-l-[3px] ${riskColor} hover:bg-[var(--color-surface-container)] transition-colors cursor-pointer ${
                isSelected ? "ring-1 ring-[var(--color-secondary)]/30 bg-[var(--color-surface-container)]" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-foreground truncate">{e.name}</span>
                {e.pfeDesignation && (
                  <span className="text-[8px] font-bold text-[var(--color-error)] bg-[var(--color-error)]/10 px-1 py-0.5 rounded-sm border border-[var(--color-error)]/20">PFE</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-[var(--color-outline)]">{e.countryCode}</span>
                <span className={`text-[9px] font-bold uppercase ${riskText}`}>{e.riskLevel}</span>
                {isSelected && <span className="text-[8px] text-[var(--color-secondary)]">screening</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Sanctions + EDGAR panels */}
      <div className="grid lg:grid-cols-2 gap-5">
        <SanctionsPanel entityName={selectedForScreening.name} />
        <FilingsPanel />
      </div>

      {/* Interactive Profiler */}
      <EntityProfiler />
    </div>
  );
}
