import {
  entities,
  alerts,
  getRiskDot,
  type Entity,
} from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";
import { EntityProfiler } from "@/components/entity-profiler";

export default function EntitiesPage() {
  // Featured entity for the profiler view
  const featured = entities[2]; // Gotion — most interesting for demo

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
          </div>
          <h1 className="text-3xl font-[var(--font-headline)] font-extrabold text-foreground tracking-tight">
            Entity Risk Profiler
          </h1>
          <p className="text-[var(--color-muted-foreground)] mt-1 text-sm">
            Beneficial ownership tracing, FEOC compliance scoring, and geopolitical risk decomposition.
          </p>
        </div>
        <button className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-[var(--color-primary-foreground)] px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:brightness-110 transition-all">
          <MsIcon name="download" className="text-sm" />
          Export Intelligence Pack
        </button>
      </div>

      {/* Entity Grid */}
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
          return (
            <div key={e.id} className={`bg-[var(--color-surface-container-low)] p-3 rounded-xl border-l-[3px] ${riskColor} hover:bg-[var(--color-surface-container)] transition-colors cursor-pointer`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-foreground truncate">{e.name}</span>
                {e.pfeDesignation && (
                  <span className="text-[8px] font-bold text-[var(--color-error)] bg-[var(--color-error)]/10 px-1 py-0.5 rounded-sm border border-[var(--color-error)]/20">PFE</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-[var(--color-outline)]">{e.countryCode}</span>
                <span className={`text-[9px] font-bold uppercase ${riskText}`}>{e.riskLevel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Profiler */}
      <EntityProfiler />
    </div>
  );
}
