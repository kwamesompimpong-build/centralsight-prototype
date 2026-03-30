import { entities, alerts, type Entity } from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";

function SatelliteCard({ entity }: { entity: Entity }) {
  const statusColor =
    entity.verificationStatus === "verified" ? "text-[var(--color-secondary)]"
    : entity.verificationStatus === "flagged" ? "text-[var(--color-error)]"
    : "text-[var(--color-primary)]";
  const statusBg =
    entity.verificationStatus === "verified" ? "bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/20"
    : entity.verificationStatus === "flagged" ? "bg-[var(--color-error)]/10 border-[var(--color-error)]/20"
    : "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20";
  const isFlagged = entity.verificationStatus === "flagged";

  return (
    <div className={`bg-[var(--color-surface-container-low)] rounded-xl overflow-hidden ${isFlagged ? "border border-[var(--color-error)]/20" : ""}`}>
      {/* Simulated satellite imagery */}
      <div className="h-40 bg-gradient-to-br from-[#0b0e14] via-[#191c22] to-[#0b0e14] relative">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `
            linear-gradient(rgba(152,203,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(152,203,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }} />
        {/* Facility markers */}
        <div className="absolute top-1/3 left-1/3 w-3 h-3 border border-[var(--color-secondary)] rounded-full animate-pulse opacity-60" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[var(--color-primary)]/40 rounded-full" />
        {isFlagged && (
          <div className="absolute top-1/4 right-1/3 w-5 h-5 border-2 border-[var(--color-error)] rounded-full animate-pulse" />
        )}
        {/* Coordinates */}
        <div className="absolute bottom-2 left-2 text-[9px] font-mono text-[var(--color-outline)] bg-[var(--color-surface-container-lowest)]/80 px-1.5 py-0.5 rounded">
          {entity.latitude.toFixed(4)}°N, {Math.abs(entity.longitude).toFixed(4)}°{entity.longitude > 0 ? "E" : "W"}
        </div>
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm border ${statusBg} ${statusColor} uppercase tracking-widest`}>
            {entity.verificationStatus}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-foreground">{entity.name}</h4>
          {entity.pfeDesignation && (
            <span className="text-[8px] font-bold text-[var(--color-error)] bg-[var(--color-error)]/10 px-1 py-0.5 rounded-sm border border-[var(--color-error)]/20">PFE</span>
          )}
        </div>
        <p className="text-[10px] text-[var(--color-muted-foreground)]">{entity.country}</p>

        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-[10px]">
            <span className="text-[var(--color-outline)]">Last Pass</span>
            <span className="font-mono text-foreground">{entity.lastSatelliteVerification}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-[var(--color-outline)]">Facility</span>
            <span className="capitalize text-foreground">{entity.type}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-[var(--color-outline)]">Minerals</span>
            <span className="text-foreground">{entity.minerals.join(", ")}</span>
          </div>
        </div>

        <p className="text-[10px] text-[var(--color-muted-foreground)] mt-3 line-clamp-2 italic">{entity.notes}</p>
      </div>
    </div>
  );
}

export default function GeointPage() {
  const satelliteAlerts = alerts.filter((a) => a.type === "satellite");
  const verified = entities.filter((e) => e.verificationStatus === "verified").length;
  const monitoring = entities.filter((e) => e.verificationStatus === "monitoring").length;
  const flagged = entities.filter((e) => e.verificationStatus === "flagged").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-[var(--font-headline)] font-extrabold tracking-tight text-foreground">
            GEOINT — Satellite Verification
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
            Facility verification through satellite imagery analysis, OSINT fusion, and geospatial provenance.
          </p>
        </div>
      </div>

      {/* Status KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-secondary)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Verified</p>
          <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-secondary)]">{verified}</span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-primary)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Monitoring</p>
          <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-primary)]">{monitoring}</span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-error)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Flagged</p>
          <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-error)]">{flagged}</span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl border-b-[3px] border-[var(--color-tertiary)]/20">
          <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">Sat Alerts</p>
          <span className="text-2xl font-[var(--font-headline)] font-extrabold text-[var(--color-tertiary)]">{satelliteAlerts.length}</span>
        </div>
      </div>

      {/* Satellite Cards Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4">
          Facility Verification — Imagery Analysis
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {entities.map((entity) => (
            <SatelliteCard key={entity.id} entity={entity} />
          ))}
        </div>
      </div>

      {/* Satellite Intelligence Feed */}
      <div className="bg-[var(--color-surface-container-low)] p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-[var(--font-headline)] font-bold text-lg text-foreground tracking-tight flex items-center gap-2">
            <MsIcon name="satellite_alt" className="text-[var(--color-secondary)]" />
            Satellite Intelligence Feed
          </h3>
          <span className="px-2 py-1 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-[10px] font-bold rounded-sm border border-[var(--color-secondary)]/20">
            SENTINEL-2 / MAXAR
          </span>
        </div>
        <div className="space-y-3">
          {satelliteAlerts.map((alert) => (
            <div key={alert.id} className="flex gap-4 p-3 bg-[var(--color-surface-container)]/50 rounded border-l-2 border-[var(--color-secondary)]">
              <div className="w-10 h-10 flex-shrink-0 bg-[var(--color-secondary)]/10 rounded flex items-center justify-center">
                <MsIcon name="satellite_alt" className="text-[var(--color-secondary)]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{alert.title}</h4>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{alert.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[9px] bg-[var(--color-surface-container-highest)] px-2 py-0.5 rounded">{alert.entityName}</span>
                  <span className="text-[9px] text-[var(--color-outline)]">{alert.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
