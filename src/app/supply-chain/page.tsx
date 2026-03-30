"use client";

import { useState } from "react";
import { entities, supplyChainLinks, complianceThresholds } from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";
import { SupplyChainGraph } from "@/components/supply-chain-graph";
import { useTradeData, type TradeResponse } from "@/hooks/use-api";

function getEntity(id: string) {
  return entities.find((e) => e.id === id);
}

const MINERALS = ["lithium", "rare-earth", "cobalt", "nickel", "graphite"] as const;

function TradeDataPanel({ mineral }: { mineral: string }) {
  const { data, loading, error } = useTradeData(mineral, "842", "2024");

  return (
    <div className="bg-[var(--color-surface-container)] rounded-xl p-5 border border-[var(--color-outline-variant)]/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
          U.S. Imports — <span className="capitalize">{mineral.replace("-", " ")}</span>
        </h3>
        <span className="text-[9px] text-[var(--color-outline)] bg-[var(--color-surface-container-highest)] px-2 py-0.5 rounded">
          UN Comtrade API
        </span>
      </div>

      {loading && (
        <div className="text-[12px] text-[var(--color-primary)] animate-pulse py-4 text-center">
          Querying UN Comtrade for HS codes...
        </div>
      )}

      {error && (
        <div className="text-[12px] text-[var(--color-error)] py-2">Trade data unavailable: {error}</div>
      )}

      {data && !loading && (
        <>
          {!data.configured ? (
            <div className="p-3 bg-[var(--color-tertiary)]/5 rounded-lg">
              <p className="text-[11px] text-[var(--color-tertiary)] font-medium">{data.note}</p>
              <p className="text-[10px] text-[var(--color-muted-foreground)] mt-1">
                HS codes for {mineral}: {data.hsCodes?.join(", ")}
              </p>
            </div>
          ) : data.results.length === 0 ? (
            <p className="text-[12px] text-[var(--color-outline)] py-4 text-center">
              No trade records found for this query.
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-bold text-foreground">{data.total} records</span>
                <span className="text-[10px] text-[var(--color-outline)]">Period: {data.period} · {data.flow}</span>
              </div>
              {data.results.slice(0, 15).map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-[var(--color-surface-container-low)] rounded-lg text-[11px]">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground truncate">{r.partner}</div>
                    <div className="text-[10px] text-[var(--color-outline)] truncate">{r.commodity}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="font-bold text-[var(--color-secondary)] tabular-nums">
                      ${(r.value / 1_000_000).toFixed(1)}M
                    </div>
                    {r.netWeight && (
                      <div className="text-[9px] text-[var(--color-outline)] tabular-nums">
                        {(r.netWeight / 1000).toFixed(0)} MT
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SupplyChainPage() {
  const [selectedMineral, setSelectedMineral] = useState("lithium");
  const flaggedLinks = supplyChainLinks.filter((l) => l.riskFlags.length > 0);
  const minerals = [...new Set(supplyChainLinks.map((l) => l.mineral))];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-[var(--font-headline)] font-extrabold tracking-tight text-foreground">
            Supply Chain Flow Analysis
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
            Cross-border mineral flows via UN Comtrade. Route intelligence and dependency mapping.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-surface-container-low)] p-1 rounded-lg">
          {MINERALS.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMineral(m)}
              className={`px-4 py-1.5 text-xs font-bold rounded capitalize ${
                selectedMineral === m
                  ? "bg-[var(--color-surface-container-highest)] text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-muted-foreground)] hover:text-foreground"
              } transition-colors`}
            >
              {m.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-primary)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Total Routes</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-[var(--font-headline)] font-extrabold">{supplyChainLinks.length}</span>
          </div>
          <div className="w-full bg-[var(--color-surface-container)] h-1 mt-2 rounded-full overflow-hidden">
            <div className="bg-[var(--color-primary)] h-full" style={{ width: "100%" }} />
          </div>
        </div>
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-error)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Flagged Routes</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-error)]">{flaggedLinks.length}</span>
            <span className="text-[10px] text-[var(--color-error)] font-bold">PFE / FEOC risk</span>
          </div>
          <div className="w-full bg-[var(--color-surface-container)] h-1 mt-2 rounded-full overflow-hidden">
            <div className="bg-[var(--color-error)] h-full" style={{ width: `${(flaggedLinks.length / supplyChainLinks.length) * 100}%` }} />
          </div>
        </div>
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-secondary)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Minerals in Flow</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-secondary)]">{minerals.length}</span>
            <span className="text-[10px] text-[var(--color-muted-foreground)]">Active commodities</span>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-tertiary)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Supply Chain Risk</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-tertiary)]">HIGH</span>
          </div>
          <div className="flex gap-1 mt-2">
            {[1,2,3].map(i => <div key={i} className="h-1 w-3 bg-[var(--color-error)]" />)}
            <div className="h-1 w-3 bg-[var(--color-tertiary)]" />
            <div className="h-1 w-3 bg-[var(--color-surface-container-highest)]" />
          </div>
        </div>
      </div>

      {/* UN Comtrade Trade Data */}
      <TradeDataPanel mineral={selectedMineral} />

      {/* Flow Visualization */}
      <SupplyChainGraph />

      {/* Route Intelligence Table */}
      <div className="bg-[var(--color-surface-container-low)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-[var(--font-headline)] font-bold text-lg text-foreground tracking-tight">
            Route Intelligence Stream
          </h3>
          <span className="px-2 py-1 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-[10px] font-bold rounded-sm border border-[var(--color-secondary)]/20">
            LIVE
          </span>
        </div>
        <div className="space-y-3">
          {supplyChainLinks.map((link, i) => {
            const from = getEntity(link.from);
            const to = getEntity(link.to);
            const hasRisk = link.riskFlags.length > 0;
            return (
              <div
                key={i}
                className={`group flex gap-4 p-3 bg-[var(--color-surface-container)]/50 hover:bg-[var(--color-surface-container)] transition-all cursor-pointer rounded border-l-2 ${hasRisk ? "border-[var(--color-error)]" : "border-[var(--color-secondary)]"}`}
              >
                <div className="w-10 h-10 flex-shrink-0 bg-[var(--color-surface-container-highest)] rounded flex items-center justify-center">
                  <MsIcon name={hasRisk ? "warning" : "check_circle"} className={hasRisk ? "text-[var(--color-error)]" : "text-[var(--color-secondary)]"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span>{from?.name}</span>
                    <MsIcon name="arrow_forward" className="text-sm text-[var(--color-outline)]" />
                    <span>{to?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] bg-[var(--color-surface-container-highest)] px-2 py-0.5 rounded capitalize">
                      {link.mineral.replace("-", " ")}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-foreground)] font-mono">{link.volume}</span>
                    <span className="text-[10px] text-[var(--color-outline)]">{link.route}</span>
                  </div>
                  {hasRisk && (
                    <div className="flex gap-2 mt-2">
                      {link.riskFlags.map((f, j) => (
                        <span key={j} className="text-[9px] bg-[var(--color-error)]/10 text-[var(--color-error)] px-2 py-0.5 rounded border border-[var(--color-error)]/20 font-bold">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
