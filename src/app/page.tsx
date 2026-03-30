import {
  kpis,
  alerts,
  complianceThresholds,
  entities,
  timeAgo,
} from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";

export default function DashboardPage() {
  const recentAlerts = alerts.slice(0, 5);
  const belowThreshold = complianceThresholds.filter((t) => t.currentCompliance < t.macrThreshold);
  const criticalEntities = entities.filter((e) => e.pfeDesignation);

  return (
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
            <button className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold px-5 py-2 rounded-xl text-[12px] tracking-[0.02em] hover:brightness-110 transition-all shadow-sm">
              Generate Full Report
            </button>
            <button className="text-[var(--color-muted-foreground)] hover:text-foreground font-medium px-5 py-2 rounded-xl text-[12px] tracking-[0.02em] hover:bg-[var(--color-surface-container-high)] transition-all">
              Share Briefing
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="w-[260px] shrink-0 flex flex-col gap-3">
          {[
            { label: "Entities Tracked", value: kpis.entitiesTracked, sub: `${kpis.pfeDesignated} PFE`, color: "var(--color-foreground)", accent: "var(--color-primary)" },
            { label: "Risk Alerts", value: alerts.length, sub: `${kpis.criticalAlerts} Critical`, color: "var(--color-foreground)", accent: "var(--color-tertiary)" },
            { label: "MACR Compliance", value: `${kpis.avgCompliance}%`, sub: `${belowThreshold.length} below threshold`, color: "var(--color-error)", accent: "var(--color-error)" },
            { label: "Satellite Verified", value: kpis.satelliteVerifications, sub: `of ${kpis.entitiesTracked} entities`, color: "var(--color-secondary)", accent: "var(--color-secondary)" },
          ].map((kpi, i) => (
            <div key={i} className="bg-[var(--color-surface-container)] rounded-xl p-4 border-l-[3px]" style={{ borderLeftColor: kpi.accent }}>
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
              {["All Sources", "Satellite", "Regulatory"].map((label, i) => (
                <button
                  key={label}
                  className={`px-3.5 py-[6px] text-[11px] rounded-lg font-medium transition-colors ${
                    i === 0
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
            {recentAlerts.map((alert) => {
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
                <div
                  key={alert.id}
                  className="card-interactive flex gap-4 p-4 bg-[var(--color-surface-container)] rounded-xl border-l-[3px] cursor-pointer"
                  style={{ borderLeftColor: accentColor }}
                >
                  <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in oklch, ${accentColor} 10%, transparent)` }}>
                    <MsIcon name={iconName} className="text-[18px]" style={{ color: accentColor }} />
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panels */}
        <div className="col-span-4 flex flex-col gap-5">
          {/* MACR Compliance */}
          <div className="bg-[var(--color-surface-container)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-outline)]">MACR Compliance</h3>
              <MsIcon name="verified_user" className="text-[16px] text-[var(--color-outline)]" />
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
          </div>

          {/* PFE Watchlist */}
          <div className="bg-[var(--color-surface-container)] rounded-xl p-5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-outline)] mb-4">PFE Watchlist</h3>
            <div className="space-y-2">
              {criticalEntities.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-container-low)] card-interactive cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <span className="w-[6px] h-[6px] rounded-full bg-[var(--color-error)]" />
                    <div>
                      <p className="text-[12px] font-medium leading-none">{e.name}</p>
                      <p className="text-[10px] text-[var(--color-outline)] mt-[3px]">{e.country} · {e.minerals[0]}</p>
                    </div>
                  </div>
                  <span className="px-2 py-[3px] bg-[var(--color-error)]/[0.08] text-[var(--color-error)] text-[9px] font-bold rounded-md tracking-[0.04em]">
                    PFE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-[var(--color-surface-container)] rounded-xl p-5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-outline)] mb-4">Risk Distribution</h3>
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
          </div>
        </div>
      </div>
    </div>
  );
}
