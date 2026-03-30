"use client";

import { useRef } from "react";
import {
  entities, alerts, complianceThresholds, supplyChainLinks,
  getRiskColor, getComplianceColor, timeAgo,
} from "@/data/mock";

const REPORT_DATE = "March 28, 2026";
const REPORT_REF  = "CS-2026-0328-001";
const CLASSIFICATION = "UNCLASSIFIED // FOR OFFICIAL USE ONLY";

export default function ReportPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const criticalAlerts = alerts.filter(a => a.severity === "critical");
  const highAlerts     = alerts.filter(a => a.severity === "high");
  const pfeEntities    = entities.filter(e => e.pfeDesignation);
  const nonCompliant   = entities.filter(e => e.feocStatus === "non-compliant");
  const flaggedRoutes  = supplyChainLinks.filter(l => l.riskFlags.length > 0);
  const belowMacr      = complianceThresholds.filter(t => t.currentCompliance < t.macrThreshold);

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[var(--font-headline)] font-extrabold tracking-tight">
            Intelligence Report
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            {REPORT_REF} · {REPORT_DATE}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Print / PDF
          </button>
          <button
            onClick={() => {
              const text = printRef.current?.innerText ?? "";
              navigator.clipboard?.writeText(text);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg hover:bg-[var(--color-primary)]/15 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
            Copy as Text
          </button>
        </div>
      </div>

      {/* Report body */}
      <div ref={printRef} className="bg-[var(--color-surface-container-low)] rounded-2xl overflow-hidden border border-[var(--color-outline-variant)]/10 print:shadow-none">

        {/* Report header */}
        <div className="bg-[var(--color-surface-container-high)] px-8 py-6 border-b border-[var(--color-outline-variant)]/10">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-error)] mb-2">{CLASSIFICATION}</div>
              <h2 className="text-xl font-[var(--font-headline)] font-extrabold text-foreground leading-tight">
                Critical Minerals Supply Chain<br />Intelligence Assessment
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                FEOC Enforcement Status · PFE Designations · MACR Compliance · Satellite Verification
              </p>
            </div>
            <div className="text-right shrink-0 ml-8">
              <div className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest">Report Reference</div>
              <div className="text-sm font-mono font-bold text-foreground">{REPORT_REF}</div>
              <div className="text-[10px] text-[var(--color-outline)] mt-2 uppercase tracking-widest">Prepared</div>
              <div className="text-sm font-bold text-foreground">{REPORT_DATE}</div>
              <div className="text-[10px] text-[var(--color-outline)] mt-2 uppercase tracking-widest">System</div>
              <div className="text-sm font-bold text-[var(--color-secondary)]">MINERAL_SENTINEL v2.4</div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">

          {/* 1. Executive Summary */}
          <section>
            <SectionHeading number="1" title="Executive Summary" />
            <div className="bg-[var(--color-surface-container)] rounded-xl p-5 border-l-4 border-[var(--color-tertiary)]">
              <p className="text-sm text-foreground leading-relaxed">
                This assessment covers <strong>{entities.length} tracked entities</strong> across the U.S. critical mineral supply chain,
                with particular focus on FEOC-designated companies, PFE-designated foreign entities,
                and domestic sourcing compliance under IRS Notice 2026-15 (MACR thresholds).
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-3 leading-relaxed">
                <strong className="text-foreground">{criticalAlerts.length} critical alerts</strong> and{" "}
                <strong className="text-foreground">{highAlerts.length} high-priority alerts</strong> are active as of {REPORT_DATE}.{" "}
                <strong className="text-foreground">{pfeEntities.length} entities</strong> carry PFE (Prohibited Foreign Entity) designations,
                and <strong className="text-foreground">{belowMacr.length} of {complianceThresholds.length} mineral categories</strong> are
                below their 2027 MACR threshold — the most critical gaps being rare earth elements (15% vs. 40% required)
                and lithium (28% vs. 50% required).
              </p>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-5 gap-3 mt-4">
              {[
                { label: "Entities Tracked", value: entities.length, color: "var(--color-primary)" },
                { label: "PFE Designated", value: pfeEntities.length, color: "var(--color-error)" },
                { label: "Critical Alerts", value: criticalAlerts.length, color: "var(--color-error)" },
                { label: "MACR Gaps", value: belowMacr.length, color: "var(--color-tertiary)" },
                { label: "Flagged Routes", value: flaggedRoutes.length, color: "var(--color-tertiary)" },
              ].map(kpi => (
                <div key={kpi.label} className="bg-[var(--color-surface-container)] rounded-lg p-3 text-center">
                  <div className="text-2xl font-[var(--font-headline)] font-extrabold" style={{ color: kpi.color }}>{kpi.value}</div>
                  <div className="text-[9px] text-[var(--color-outline)] uppercase tracking-widest mt-0.5">{kpi.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Active Intelligence Alerts */}
          <section>
            <SectionHeading number="2" title="Active Intelligence Alerts" />
            <div className="space-y-3">
              {alerts.map((alert, i) => {
                const isC = alert.severity === "critical";
                const isH = alert.severity === "high";
                const accent = isC ? "var(--color-error)" : isH ? "var(--color-tertiary)" : "var(--color-secondary)";
                const severityLabel = isC ? "CRITICAL" : isH ? "HIGH" : "MEDIUM";
                return (
                  <div key={alert.id} className="flex gap-4 p-4 bg-[var(--color-surface-container)] rounded-xl border-l-4"
                    style={{ borderLeftColor: accent }}>
                    <div className="shrink-0 w-6 text-[10px] font-mono text-[var(--color-outline)] pt-0.5">{i + 1}.</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm border"
                          style={{ color: accent, background: `color-mix(in oklch, ${accent} 10%, transparent)`, borderColor: `color-mix(in oklch, ${accent} 25%, transparent)` }}>
                          {severityLabel}
                        </span>
                        <span className="text-[9px] text-[var(--color-outline)] uppercase tracking-widest">{alert.type.replace(/-/g, " ")}</span>
                        <span className="text-[9px] text-[var(--color-outline)]">{timeAgo(alert.timestamp)}</span>
                      </div>
                      <p className="text-sm font-bold text-foreground leading-snug">{alert.title}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-1 leading-relaxed">{alert.description}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-[9px] bg-[var(--color-surface-container-highest)] px-2 py-0.5 rounded font-medium">{alert.entityName}</span>
                        <span className="text-[9px] text-[var(--color-outline)] px-2 py-0.5 rounded bg-[var(--color-surface-container-highest)]">{alert.source}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. PFE / FEOC Entity Registry */}
          <section>
            <SectionHeading number="3" title="PFE & FEOC Entity Risk Registry" />
            <p className="text-xs text-[var(--color-muted-foreground)] mb-4 leading-relaxed">
              Entities flagged as Prohibited Foreign Entities (PFE) under the IRA Sec. 30D guidance or as
              Foreign Entities of Concern (FEOC) under OECD/DOE criteria. Any battery components sourced
              from PFE/FEOC-designated entities disqualify vehicles from the $7,500 Clean Vehicle Credit.
            </p>
            <div className="overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--color-surface-container-high)] text-left">
                    {["Entity", "Country", "Type", "Risk", "FEOC", "PFE", "Verification", "Minerals"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-widest text-[var(--color-outline)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entities.map((e, i) => (
                    <tr key={e.id} className={i % 2 === 0 ? "bg-[var(--color-surface-container)]" : "bg-[var(--color-surface-container-low)]"}>
                      <td className="px-3 py-2.5 font-semibold text-foreground">{e.name}</td>
                      <td className="px-3 py-2.5 text-[var(--color-muted-foreground)]">{e.country}</td>
                      <td className="px-3 py-2.5 capitalize text-[var(--color-muted-foreground)]">{e.type}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm border uppercase ${getRiskColor(e.riskLevel)}`}>
                          {e.riskLevel}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm border uppercase ${getComplianceColor(e.feocStatus)}`}>
                          {e.feocStatus.replace(/-/g, " ")}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {e.pfeDesignation
                          ? <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-sm border text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20">YES</span>
                          : <span className="text-[var(--color-outline)] text-[9px]">—</span>}
                      </td>
                      <td className="px-3 py-2.5 capitalize text-[var(--color-muted-foreground)]">{e.verificationStatus}</td>
                      <td className="px-3 py-2.5 text-[var(--color-muted-foreground)]">{e.minerals.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. MACR Compliance Status */}
          <section>
            <SectionHeading number="4" title="MACR Compliance Status — IRS Notice 2026-15" />
            <p className="text-xs text-[var(--color-muted-foreground)] mb-4 leading-relaxed">
              Material Assistance Cost Ratios (MACR) under IRS Notice 2026-15 set domestic content thresholds
              for battery minerals and transformer steel effective January 1, 2027. Entities using supply chains
              that fail these thresholds will lose eligibility for Sec. 45X manufacturing credits and Sec. 30D consumer credits.
            </p>
            <div className="space-y-3">
              {complianceThresholds.map(t => {
                const isBelow = t.currentCompliance < t.macrThreshold;
                const gap = t.macrThreshold - t.currentCompliance;
                const color = isBelow ? "var(--color-error)" : "var(--color-secondary)";
                return (
                  <div key={t.mineral} className="bg-[var(--color-surface-container)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-bold capitalize text-foreground">{t.mineral.replace("-", " ")}</span>
                        <span className="ml-2 text-[10px] text-[var(--color-outline)]">{t.regulation}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--color-outline)]">Target: {t.macrThreshold}% by {t.deadline.split("T")[0]}</span>
                        <span className="text-sm font-bold tabular-nums" style={{ color }}>
                          {t.currentCompliance}%
                          {isBelow && <span className="text-xs ml-1 text-[var(--color-error)]">({gap}pp gap)</span>}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-[var(--color-surface-container-highest)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${t.currentCompliance}%`, background: color }} />
                      <div className="absolute top-0 h-full w-px bg-white/30" style={{ left: `${t.macrThreshold}%` }} />
                    </div>
                    {isBelow && (
                      <p className="text-[10px] text-[var(--color-error)] mt-1.5">
                        ⚠ {gap} percentage points below threshold — supply chain restructuring required before {t.deadline.split("T")[0]}.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. Supply Chain Risk Routes */}
          <section>
            <SectionHeading number="5" title="High-Risk Supply Chain Routes" />
            <div className="space-y-3">
              {supplyChainLinks.map((link, i) => {
                const fromEntity = entities.find(e => e.id === link.from);
                const toEntity   = entities.find(e => e.id === link.to);
                const hasRisk = link.riskFlags.length > 0;
                return (
                  <div key={i} className={`p-4 rounded-xl border ${hasRisk ? "bg-[var(--color-error)]/5 border-[var(--color-error)]/15" : "bg-[var(--color-surface-container)] border-transparent"}`}>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-sm font-bold text-foreground">{fromEntity?.name}</span>
                      <span className="material-symbols-outlined text-sm text-[var(--color-outline)]">arrow_forward</span>
                      <span className="text-sm font-bold text-foreground">{toEntity?.name}</span>
                      <span className="ml-auto text-[10px] text-[var(--color-outline)] capitalize">{link.mineral} · {link.volume}</span>
                    </div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{link.route}</p>
                    {hasRisk && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {link.riskFlags.map(flag => (
                          <span key={flag} className="text-[9px] px-2 py-0.5 bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 rounded-sm font-bold">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 6. Analytical Notes */}
          <section>
            <SectionHeading number="6" title="Analytical Notes & Recommended Actions" />
            <div className="space-y-3">
              {[
                {
                  priority: "Immediate",
                  color: "var(--color-error)",
                  items: [
                    "Gotion High-Tech (Virginia): Beneficial ownership restructuring may trigger PFE reclassification. Legal review of holding structure required within 30 days. DOE LPO loan review warranted.",
                    "Jinko Solar (Shangrao): CBP Withhold Release Order active on polysilicon modules. Downstream buyer verification required. UFLPA rebuttable presumption applies.",
                    "CATL (Fujian): Ford $900M licensing exposure disqualified under Sec. 45X. Transition timeline to FEOC-compliant suppliers should be accelerated.",
                  ]
                },
                {
                  priority: "Near-Term (30–90 days)",
                  color: "var(--color-tertiary)",
                  items: [
                    "Baotou Steel Rare Earth: 340% export volume spike to Vietnam transshipment. Request CBP enhanced inspection targeting. Pattern consistent with origin laundering ahead of Sec. 232.",
                    "Rare earth MACR gap (15% vs. 40% threshold): Only 25pp gap must be closed by Jan 2027. MP Materials Mountain Pass processing expansion is the fastest domestic path — monitor for DOE funding.",
                    "Lithium MACR gap (28% vs. 50%): Albemarle Kings Mountain remains the primary compliant domestic source. Prioritize off-take agreements.",
                  ]
                },
                {
                  priority: "Strategic (6–12 months)",
                  color: "var(--color-primary)",
                  items: [
                    "Develop satellite change-detection automation for all 10 tracked Chinese facilities. Current manual cadence (2-week lag) insufficient for early-warning use case.",
                    "EU beneficial ownership data remains fragmented post-CJEU 2022 ruling. Engage diplomatic channels to negotiate legitimate interest access for critical minerals research.",
                    "Commodity pricing intelligence gap: Free USGS annual data and LME delayed feeds are insufficient. Evaluate Fastmarkets minor metals subscription for Ga, Ge, Sb, W pricing.",
                  ]
                }
              ].map(section => (
                <div key={section.priority} className="bg-[var(--color-surface-container)] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: section.color }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: section.color }}>{section.priority}</span>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-2 text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                        <span className="shrink-0 text-[var(--color-outline)] mt-0.5">{i + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="pt-4 border-t border-[var(--color-outline-variant)]/10 text-center space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-error)]">{CLASSIFICATION}</p>
            <p className="text-[9px] text-[var(--color-outline)]">
              MINERAL_SENTINEL v2.4 · Auto-generated {REPORT_DATE} · Reference {REPORT_REF}
            </p>
            <p className="text-[9px] text-[var(--color-outline)]">
              Sources: UN Comtrade · SEC EDGAR · UK Companies House · Sentinel-2/FIRMS · Federal Register · OpenSanctions · Global Fishing Watch · EIA · MSHA
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-[var(--color-primary)]">{number}</span>
      </div>
      <h3 className="text-base font-[var(--font-headline)] font-bold text-foreground">{title}</h3>
    </div>
  );
}
