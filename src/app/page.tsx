"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  kpis,
  alerts as seedAlerts,
  complianceThresholds,
  entities,
  timeAgo,
  type Entity,
} from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";
import { SatelliteModal } from "@/components/satellite-modal";
import { useIntelFeed, type IntelAlert } from "@/hooks/use-api";

const FILTER_LABELS = ["All Sources", "Regulatory", "News", "Filings", "Satellite", "Sanctions"] as const;
type FilterLabel = (typeof FILTER_LABELS)[number];

function alertMatchesFilter(alert: { type: string }, filter: FilterLabel) {
  if (filter === "All Sources") return true;
  if (filter === "Regulatory") return alert.type === "regulatory";
  if (filter === "News") return alert.type === "news";
  if (filter === "Filings") return alert.type === "filing";
  if (filter === "Satellite") return alert.type === "satellite";
  if (filter === "Sanctions") return alert.type === "sanctions" || alert.type === "ownership-change";
  return true;
}

function severityColor(severity: string) {
  if (severity === "critical") return "var(--color-error)";
  if (severity === "high") return "var(--color-tertiary)";
  return "var(--color-secondary)";
}

function typeIcon(type: string) {
  if (type === "satellite") return "satellite_alt";
  if (type === "sanctions" || type === "ownership-change") return "gavel";
  if (type === "regulatory") return "article";
  if (type === "filing") return "description";
  if (type === "news") return "newspaper";
  return "query_stats";
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterLabel>("All Sources");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [briefingCopied, setBriefingCopied] = useState(false);

  // Live intelligence feed from aggregated APIs
  const { data: intelFeed, loading: intelLoading, lastUpdated } = useIntelFeed(30);

  const belowThreshold = complianceThresholds.filter((t) => t.currentCompliance < t.macrThreshold);
  const criticalEntities = entities.filter((e) => e.pfeDesignation);

  // Merge live API alerts with seed alerts for enrichment
  const liveAlerts = intelFeed?.results || [];
  const allAlerts = liveAlerts.length > 0 ? liveAlerts : seedAlerts.map((a) => ({
    id: a.id,
    timestamp: a.timestamp,
    type: a.type,
    severity: a.severity,
    title: a.title,
    description: a.description,
    source: a.source,
    sourceUrl: null,
    entities: [a.entityName],
    tags: [a.type],
  } satisfies IntelAlert));

  const filteredAlerts = allAlerts.filter((a) => alertMatchesFilter(a, activeFilter));

  // Compute live KPIs
  const liveAlertCount = allAlerts.length;
  const liveCriticalCount = allAlerts.filter((a) => a.severity === "critical").length;
  const liveSourceCount = intelFeed?.sources?.length || 0;

  function openEntityFromAlert(alert: IntelAlert) {
    // Try to match alert entities to tracked entities
    const matched = entities.find((e) =>
      alert.entities.some((name) => e.name.toLowerCase().includes(name.toLowerCase()))
    );
    if (matched) setSelectedEntity(matched);
  }

  function handleShareBriefing() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setBriefingCopied(true);
    setTimeout(() => setBriefingCopied(false), 2000);
  }

  return (
    <>
      {selectedEntity && (
        <SatelliteModal entity={selectedEntity} onClose={() => setSelectedEntity(null)} />
      )}

      <div className="space-y-8 max-w-[1440px] mx-auto">
        {/* AI Briefing + KPIs */}
        <div className="flex gap-6">
          {/* Briefing */}
          <div className="flex-1 bg-[var(--color-surface-container)] rounded-2xl p-7 relative overflow-hidden group">
            <div className="absolute -top-8 -right-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
              <MsIcon name="auto_awesome" className="text-[180px] text-[var(--color-primary)]" />
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-[6px] px-2.5 py-1 bg-[var(--color-secondary)]/[0.08] rounded-lg">
                <span className="relative flex h-[5px] w-[5px]">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-[var(--color-secondary)] opacity-50" />
                  <span className="relative rounded-full h-[5px] w-[5px] bg-[var(--color-secondary)]" />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.1em] text-[var(--color-secondary)] uppercase">
                  Live Intelligence
                </span>
              </div>
              {lastUpdated && (
                <span className="text-[11px] text-[var(--color-outline)]">
                  Updated {timeAgo(lastUpdated.toISOString())} · {liveSourceCount} sources active
                </span>
              )}
              {intelLoading && (
                <span className="text-[10px] text-[var(--color-primary)] animate-pulse">Fetching feeds...</span>
              )}
            </div>
            <h1 className="text-[26px] font-[var(--font-headline)] font-extrabold text-foreground mb-5 leading-[1.2] tracking-[-0.02em] max-w-[640px]">
              {liveCriticalCount > 0
                ? `${liveCriticalCount} Critical Alert${liveCriticalCount > 1 ? "s" : ""} — ${liveAlertCount} Total Signals`
                : "Monitoring Critical Mineral Supply Chains"}
            </h1>
            <div className="grid md:grid-cols-2 gap-6 text-[13px] text-[var(--color-muted-foreground)] leading-[1.7]">
              <p>
                Live intelligence feed aggregating{" "}
                <strong className="text-foreground">Federal Register</strong> regulatory actions,{" "}
                <strong className="text-foreground">GDELT</strong> global news monitoring, and{" "}
                <strong className="text-foreground">SEC EDGAR</strong> corporate filings — all filtered for critical
                minerals, FEOC, UFLPA, and supply chain signals.
              </p>
              <p>
                Tracking {entities.length} entities across {complianceThresholds.length} mineral categories.{" "}
                {belowThreshold.length} minerals below MACR threshold.{" "}
                {criticalEntities.length} PFE-designated entities require continuous monitoring.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.push("/report")}
                className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold px-5 py-2 rounded-xl text-[12px] tracking-[0.02em] hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]">description</span>
                Generate Full Report
              </button>
              <button
                onClick={handleShareBriefing}
                className="text-[var(--color-muted-foreground)] hover:text-foreground font-medium px-5 py-2 rounded-xl text-[12px] tracking-[0.02em] hover:bg-[var(--color-surface-container-high)] active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {briefingCopied ? "check" : "share"}
                </span>
                {briefingCopied ? "Link Copied!" : "Share Briefing"}
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="w-[260px] shrink-0 flex flex-col gap-3">
            {[
              { label: "Entities Tracked", value: kpis.entitiesTracked, sub: `${kpis.pfeDesignated} PFE`, color: "var(--color-foreground)", accent: "var(--color-primary)", href: "/entities" },
              { label: "Live Signals", value: liveAlertCount || seedAlerts.length, sub: `${liveCriticalCount || kpis.criticalAlerts} Critical`, color: "var(--color-foreground)", accent: "var(--color-tertiary)", href: null },
              { label: "MACR Compliance", value: `${kpis.avgCompliance}%`, sub: `${belowThreshold.length} below threshold`, color: "var(--color-error)", accent: "var(--color-error)", href: "/compliance" },
              { label: "API Sources", value: liveSourceCount || 3, sub: "live feeds", color: "var(--color-secondary)", accent: "var(--color-secondary)", href: "/sources" },
            ].map((kpi, i) => (
              <div
                key={i}
                onClick={() => kpi.href && router.push(kpi.href)}
                className={`bg-[var(--color-surface-container)] rounded-xl p-4 border-l-[3px] transition-colors ${
                  kpi.href ? "cursor-pointer hover:bg-[var(--color-surface-container-high)]" : ""
                }`}
                style={{ borderLeftColor: kpi.accent }}
              >
                <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-[0.08em] font-semibold">{kpi.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[22px] font-[var(--font-headline)] font-extrabold tracking-[-0.02em]" style={{ color: kpi.color }}>
                    {kpi.value}
                  </span>
                  <span className="text-[10px] font-medium" style={{ color: kpi.accent }}>{kpi.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed + Right panels */}
        <div className="grid grid-cols-12 gap-6">
          {/* Intel Feed */}
          <div className="col-span-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-[var(--font-headline)] font-bold flex items-center gap-2 tracking-[-0.01em]">
                <MsIcon name="dynamic_feed" className="text-[20px] text-[var(--color-primary)]" />
                OSINT Intelligence Feed
                {liveAlerts.length > 0 && (
                  <span className="text-[10px] font-medium text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 px-2 py-0.5 rounded-md ml-2">
                    LIVE
                  </span>
                )}
              </h2>
              <div className="flex gap-1.5">
                {FILTER_LABELS.map((label) => (
                  <button
                    key={label}
                    onClick={() => setActiveFilter(label)}
                    className={`px-3.5 py-[6px] text-[11px] rounded-lg font-medium transition-colors ${
                      activeFilter === label
                        ? "bg-[var(--color-surface-container-highest)] text-foreground"
                        : "text-[var(--color-outline)] hover:text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-container)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {intelLoading && filteredAlerts.length === 0 && (
                <div className="p-8 text-center text-[13px] text-[var(--color-primary)] bg-[var(--color-surface-container)] rounded-xl animate-pulse">
                  Fetching live intelligence from Federal Register, GDELT, and SEC EDGAR...
                </div>
              )}
              {!intelLoading && filteredAlerts.length === 0 && (
                <div className="p-8 text-center text-[13px] text-[var(--color-outline)] bg-[var(--color-surface-container)] rounded-xl">
                  No {activeFilter.toLowerCase()} signals at this time.
                </div>
              )}
              {filteredAlerts.slice(0, 15).map((alert) => {
                const accentColor = severityColor(alert.severity);
                const iconName = typeIcon(alert.type);

                return (
                  <button
                    key={alert.id}
                    onClick={() => {
                      if ('sourceUrl' in alert && alert.sourceUrl) {
                        openEntityFromAlert(alert as IntelAlert);
                      }
                    }}
                    className="w-full text-left card-interactive flex gap-4 p-4 bg-[var(--color-surface-container)] rounded-xl border-l-[3px] cursor-pointer hover:bg-[var(--color-surface-container-high)] transition-colors"
                    style={{ borderLeftColor: accentColor }}
                  >
                    <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in oklch, ${accentColor} 10%, transparent)` }}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: accentColor }}>{iconName}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-[2px]">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: accentColor }}>
                          {alert.source.split(" / ")[0]}
                        </span>
                        <span className="text-[10px] text-[var(--color-outline)]">{timeAgo(alert.timestamp)}</span>
                        {('sourceUrl' in alert && alert.sourceUrl) && (
                          <span className="text-[9px] text-[var(--color-secondary)]">LIVE</span>
                        )}
                      </div>
                      <h3 className="text-[13px] font-semibold text-foreground mb-1 leading-snug">{alert.title}</h3>
                      <p className="text-[12px] text-[var(--color-muted-foreground)] leading-[1.6] line-clamp-2">{alert.description}</p>
                      <div className="flex gap-1.5 mt-2.5 flex-wrap">
                        {alert.entities.map((entity, i) => (
                          <span key={i} className="text-[10px] bg-[var(--color-surface-container-highest)] px-2 py-[3px] rounded-md text-[var(--color-muted-foreground)] font-medium">
                            {entity}
                          </span>
                        ))}
                        <span className="text-[10px] bg-[var(--color-surface-container-highest)] px-2 py-[3px] rounded-md text-[var(--color-outline)]">
                          {alert.type.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Source attribution */}
            {intelFeed && (
              <div className="mt-4 flex items-center gap-4 text-[10px] text-[var(--color-outline)]">
                <span className="uppercase tracking-widest font-bold">Sources</span>
                {intelFeed.sources.map((s) => (
                  <span key={s} className="bg-[var(--color-surface-container)] px-2 py-1 rounded text-[var(--color-muted-foreground)]">{s}</span>
                ))}
                <span className="ml-auto">{intelFeed.total} total signals</span>
              </div>
            )}
          </div>

          {/* Right Panels */}
          <div className="col-span-4 flex flex-col gap-5">
            {/* MACR Compliance */}
            <button
              onClick={() => router.push("/compliance")}
              className="w-full text-left bg-[var(--color-surface-container)] rounded-xl p-5 hover:bg-[var(--color-surface-container-high)] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-outline)]">MACR Compliance</h3>
                <MsIcon name="open_in_new" className="text-[14px] text-[var(--color-outline)]" />
              </div>
              <div className="space-y-4">
                {complianceThresholds.slice(0, 6).map((t) => {
                  const isBelow = t.currentCompliance < t.macrThreshold;
                  const color = isBelow ? "var(--color-error)" : "var(--color-secondary)";
                  return (
                    <div key={t.mineral}>
                      <div className="flex justify-between items-center mb-[6px]">
                        <span className="text-[12px] font-medium capitalize text-[var(--color-muted-foreground)]">
                          {t.mineral.replace("-", " ")}
                        </span>
                        <span className="text-[12px] font-bold tabular-nums" style={{ color }}>
                          {t.currentCompliance}%
                        </span>
                      </div>
                      <div className="relative h-[5px] bg-[var(--color-surface-container-highest)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${t.currentCompliance}%`, background: color }} />
                        <div className="absolute top-0 h-full w-[2px] bg-[var(--color-foreground)]/20 rounded-full" style={{ left: `${t.macrThreshold}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </button>

            {/* PFE Watchlist */}
            <div className="bg-[var(--color-surface-container)] rounded-xl p-5">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-outline)] mb-4">PFE Watchlist</h3>
              <div className="space-y-2">
                {criticalEntities.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEntity(e)}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-[6px] h-[6px] rounded-full bg-[var(--color-error)] shrink-0" />
                      <div>
                        <p className="text-[12px] font-medium leading-none">{e.name}</p>
                        <p className="text-[10px] text-[var(--color-outline)] mt-[3px]">{e.country} · {e.minerals[0]}</p>
                      </div>
                    </div>
                    <span className="px-2 py-[3px] bg-[var(--color-error)]/[0.08] text-[var(--color-error)] text-[9px] font-bold rounded-md tracking-[0.04em]">
                      PFE
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Distribution */}
            <button
              onClick={() => router.push("/entities")}
              className="w-full text-left bg-[var(--color-surface-container)] rounded-xl p-5 hover:bg-[var(--color-surface-container-high)] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-outline)]">Risk Distribution</h3>
                <MsIcon name="open_in_new" className="text-[14px] text-[var(--color-outline)]" />
              </div>
              <div className="flex items-end gap-3 h-20 px-1">
                {([
                  { label: "Critical", count: entities.filter((e) => e.riskLevel === "critical").length, color: "var(--color-error)" },
                  { label: "High", count: entities.filter((e) => e.riskLevel === "high").length, color: "var(--color-tertiary)" },
                  { label: "Medium", count: entities.filter((e) => e.riskLevel === "medium").length, color: "var(--color-primary)" },
                  { label: "Low", count: entities.filter((e) => e.riskLevel === "low").length, color: "var(--color-secondary)" },
                ]).map((r) => (
                  <div key={r.label} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[13px] font-bold font-[var(--font-headline)]" style={{ color: r.color }}>{r.count}</span>
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{ height: `${Math.max((r.count / entities.length) * 64, 8)}px`, background: r.color, opacity: 0.7 }}
                    />
                    <span className="text-[9px] text-[var(--color-outline)] font-semibold uppercase tracking-[0.06em]">{r.label.slice(0, 4)}</span>
                  </div>
                ))}
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
