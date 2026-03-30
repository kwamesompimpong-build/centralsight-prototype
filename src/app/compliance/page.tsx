import { complianceThresholds, entities } from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";

export default function CompliancePage() {
  const belowThreshold = complianceThresholds.filter((t) => t.currentCompliance < t.macrThreshold);
  const compliantCount = entities.filter((e) => e.feocStatus === "compliant").length;
  const nonCompliantCount = entities.filter((e) => e.feocStatus === "non-compliant").length;
  const underReviewCount = entities.filter((e) => e.feocStatus === "under-review").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-[var(--font-headline)] font-extrabold tracking-tight text-foreground">
            Compliance & Regulatory Intelligence
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
            FEOC/PFE compliance scoring, MACR threshold tracking, and regulatory framework monitoring.
          </p>
        </div>
        <button className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-[var(--color-primary-foreground)] font-bold px-4 py-2 rounded-md text-xs flex items-center gap-2">
          <MsIcon name="description" className="text-sm" />
          Generate Compliance Report
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-secondary)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">FEOC Compliant</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-secondary)]">{compliantCount}</span>
            <span className="text-[10px] text-[var(--color-muted-foreground)]">entities</span>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-error)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Non-Compliant</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-error)]">{nonCompliantCount}</span>
            <span className="text-[10px] text-[var(--color-muted-foreground)]">entities</span>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-tertiary)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Under Review</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-tertiary)]">{underReviewCount}</span>
            <span className="text-[10px] text-[var(--color-muted-foreground)]">entities</span>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-primary)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Below MACR</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-error)]">{belowThreshold.length}/{complianceThresholds.length}</span>
            <span className="text-[10px] text-[var(--color-muted-foreground)]">minerals</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* MACR Compliance Gauges */}
        <div className="bg-[var(--color-surface-container)] p-6 rounded-xl border border-[var(--color-outline-variant)]/10">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-6">
            MACR Threshold Compliance
          </h3>
          <div className="space-y-5">
            {complianceThresholds.map((t) => {
              const isBelow = t.currentCompliance < t.macrThreshold;
              return (
                <div key={t.mineral}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium capitalize text-foreground">{t.mineral.replace("-", " ")}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-mono ${isBelow ? "text-[var(--color-error)]" : "text-[var(--color-secondary)]"}`}>
                        {t.currentCompliance}%
                      </span>
                      <span className="text-[10px] text-[var(--color-outline)]">/ {t.macrThreshold}% req</span>
                    </div>
                  </div>
                  <div className="relative h-1.5 bg-[var(--color-surface-container-highest)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isBelow ? "bg-[var(--color-error)]" : "bg-[var(--color-secondary)]"}`}
                      style={{ width: `${Math.min(t.currentCompliance, 100)}%` }}
                    />
                    {/* Threshold marker */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-foreground/30"
                      style={{ left: `${t.macrThreshold}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-[var(--color-outline)] mt-1">{t.regulation} · Due {t.deadline}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Entity FEOC Status */}
        <div className="bg-[var(--color-surface-container)] p-6 rounded-xl border border-[var(--color-outline-variant)]/10">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-6">
            Entity FEOC & PFE Status
          </h3>
          <div className="space-y-2">
            {entities.map((e) => {
              const statusColor =
                e.feocStatus === "compliant" ? "text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/20"
                : e.feocStatus === "non-compliant" ? "text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20"
                : "text-[var(--color-tertiary)] bg-[var(--color-tertiary)]/10 border-[var(--color-tertiary)]/20";
              return (
                <div key={e.id} className="flex items-center justify-between p-3 rounded bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)] transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.feocStatus === "compliant" ? "bg-[var(--color-secondary)]" : e.feocStatus === "non-compliant" ? "bg-[var(--color-error)]" : "bg-[var(--color-tertiary)]"}`} />
                    <div className="min-w-0">
                      <span className="text-xs font-bold truncate block">{e.name}</span>
                      <span className="text-[9px] text-[var(--color-outline)]">{e.countryCode} · {e.minerals.slice(0, 2).join(", ")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm border ${statusColor} uppercase`}>
                      {e.feocStatus}
                    </span>
                    {e.pfeDesignation && (
                      <span className="px-1.5 py-0.5 text-[8px] font-bold text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-sm">
                        PFE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Regulatory Framework */}
      <div className="bg-[var(--color-surface-container-low)] p-6 rounded-lg">
        <h3 className="font-[var(--font-headline)] font-bold text-lg text-foreground tracking-tight mb-6 flex items-center gap-2">
          <MsIcon name="gavel" className="text-[var(--color-primary)]" />
          Active Regulatory Framework
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "IRS Notice 2026-15", scope: "Sec 45X / 48E MACR thresholds for battery & solar components", status: "Active", severity: "critical" },
            { name: "UFLPA", scope: "Uyghur Forced Labor Prevention Act — Xinjiang-linked imports", status: "Enforcement Active", severity: "critical" },
            { name: "OBBBA Sec 40101", scope: "Prohibited Foreign Entities for grid infrastructure", status: "Active", severity: "high" },
            { name: "Section 232 Minerals", scope: "Critical mineral import verification — 180-day window", status: "Active thru Jul 2026", severity: "high" },
            { name: "SECURE Minerals Act", scope: "Federal reserve requiring provenance tracking", status: "Introduced 2026", severity: "medium" },
            { name: "DOE CMA 2026", scope: "Critical materials assessment — GOES & transformers added", status: "RFI Open", severity: "medium" },
          ].map((reg) => {
            const borderColor = reg.severity === "critical" ? "border-l-[var(--color-error)]" : reg.severity === "high" ? "border-l-[var(--color-tertiary)]" : "border-l-[var(--color-primary)]";
            return (
              <div key={reg.name} className={`bg-[var(--color-surface-container)] p-4 rounded-lg border-l-2 ${borderColor}`}>
                <p className="text-sm font-bold text-foreground">{reg.name}</p>
                <p className="text-[10px] text-[var(--color-muted-foreground)] mt-1 leading-relaxed">{reg.scope}</p>
                <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-bold bg-[var(--color-surface-container-highest)] text-[var(--color-muted-foreground)] rounded-sm uppercase tracking-wider">
                  {reg.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
