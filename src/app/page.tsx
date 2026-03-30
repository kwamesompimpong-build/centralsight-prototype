"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  kpis,
  alerts,
  complianceThresholds,
  entities,
  timeAgo,
  type Entity,
} from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";
import { SatelliteModal } from "@/components/satellite-modal";

const FILTER_LABELS = ["All Sources", "Satellite", "Regulatory", "Ownership", "Sanctions"] as const;
type FilterLabel = (typeof FILTER_LABELS)[number];

function alertMatchesFilter(alert: (typeof alerts)[number], filter: FilterLabel) {
  if (filter === "All Sources") return true;
  if (filter === "Satellite") return alert.type === "satellite";
  if (filter === "Regulatory") return alert.type === "regulatory";
  if (filter === "Ownership") return alert.type === "ownership-change";
  if (filter === "Sanctions") return alert.type === "sanctions";
  return true;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterLabel>("All Sources");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [reportCopied, setReportCopied] = useState(false);
  const [briefingCopied, setBriefingCopied] = useState(false);

  const belowThreshold = complianceThresholds.filter((t) => t.currentCompliance < t.macrThreshold);
  const criticalEntities = entities.filter((e) => e.pfeDesignation);
  const filteredAlerts = alerts.filter((a) => alertMatchesFilter(a, activeFilter));

  function openEntityFromAlert(entityId: string) {
    const entity = entities.find((e) => e.id === entityId);
    if (entity) setSelectedEntity(entity);
  }

  function handleGenerateReport() {
    router.push("/compliance");
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
                  AI Briefing
                </span>
              </div>
              <span className="text-[11px] text-[var(--color-outline)]">Mar 27, 2026 · 08:00 UTC</span>
            </div>
            <h1 className="text-[26px] font-[var(--font-headline)] font-extrabold text-foreground mb-5 leading-[1.2] tracking-[-0.02em] max-w-[640px]">
              FEOC Enforcement Escalation &amp; Critical Mineral Supply Chain Fractures
            </h1>
            <div className="grid md:grid-cols-2 gap-6 text-[13px] text-[var(--color-muted-foreground)] leading-[1.7]">
              <p>
                Beneficial ownership restructuring detected at Gotion High-Tech Virginia — Hefei Municipal Government
                increased indirect stake through newly formed holding entity. May trigger PFE reclassification,
                jeopardizing $2.36B in planned facility investment.
              </p>
              <p>
                Satellite imagery confirms 40% capacity expansion at Ganfeng Lithium&apos;s Xinyu complex.
                IRS Notice 2026-15 now requires 50% domestic content for battery components by 2027 — US lithium
                compliance sits at 28%, well below threshold.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleGenerateReport}
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
              { label: "Risk Alerts", value: alerts.length, sub: `${kpis.criticalAlerts} Critical`, color: "var(--color-foreground)", accent: "var(--color-tertiary)", href: null },
              { label: "MACR Compliance", value: `${kpis.avgCompliance}%`, sub: `${belowThreshold.length} below threshold`, color: "var(--color-error)", accent: "var(--color-error)", href: "/compliance" },
              { label: "Satellite Verified", value: kpis.satelliteVerifications, sub: `of ${kpis.entitiesTracked} entities`, color: "var(--color-secondary)", accent: "var(--color-secondary)", href: "/geoint" },
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
              {filteredAlerts.length === 0 && (
                <div className="p-8 text-center text-[13px] text-[var(--color-outline)] bg-[var(--color-surface-container)] rounded-xl">
                  No {activeFilter.toLowerCase()} alerts at this time.
                </div>
              )}
              {filteredAlerts.map((alert) => {
                const isC = alert.severity === "critical";
                const isH = alert.severity === "high";
                const accentColor = isC ? "var(--color-error)" : isH ? "var(--color-tertiary)" : "var(--color-secondary)";
                const iconName =
                  alert.type === "satellite" ? "satellite_alt"
                  : alert.type === "sanctions" ? "gavel"
                  : alert.type === "ownership-change" ? "swap_horiz"
                  : alert.type === "regulatory" ? "article"
                  : "query_stats";

                return (
                  <button
                    key={alert.id}
                    onClick={() => openEntityFromAlert(alert.entityId)}
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
                      </div>
                      <h3 className="text-[13px] font-semibold text-foreground mb-1 leading-snug">{alert.title}</h3>
                      <p className="text-[12px] text-[var(--color-muted-foreground)] leading-[1.6] line-clamp-2">{alert.description}</p>
                      <div className="flex gap-1.5 mt-2.5">
                        <span className="text-[10px] bg-[var(--color-surface-container-highest)] px-2 py-[3px] rounded-md text-[var(--color-muted-foreground)] font-medium">
                          {alert.entityName}
                        </span>
                        <span className="text-[10px] bg-[var(--color-surface-container-highest)] px-2 py-[3px] rounded-md text-[var(--color-outline)]">
                          {alert.type.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-[var(--color-outline)] self-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1">chevron_right</span>
                  </button>
                );
              })}
            </div>
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
