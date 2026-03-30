"use client";

import { useState } from "react";
import { entities, alerts, type Entity } from "@/data/mock";
import { MsIcon } from "@/components/ms-icon";
import { SatelliteModal } from "@/components/satellite-modal";
import { SatelliteImageryView } from "@/components/satellite-imagery";
import { useFIRMS, type FIRMSResponse } from "@/hooks/use-api";

function ThermalPanel({ entity }: { entity: Entity }) {
  const { data, loading, error } = useFIRMS(entity.latitude, entity.longitude, 25, 10);

  return (
    <div className="bg-[var(--color-surface-container)] rounded-xl p-4 border border-[var(--color-outline-variant)]/10">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[11px] font-bold text-[var(--color-secondary)] uppercase tracking-widest">
          FIRMS Thermal — {entity.name.split(" ")[0]}
        </h4>
        <span className="text-[8px] text-[var(--color-outline)] bg-[var(--color-surface-container-highest)] px-1.5 py-0.5 rounded">
          NASA VIIRS
        </span>
      </div>

      {loading && (
        <div className="text-[11px] text-[var(--color-primary)] animate-pulse py-3 text-center">
          Scanning thermal anomalies...
        </div>
      )}

      {error && <div className="text-[11px] text-[var(--color-error)] py-2">{error}</div>}

      {data && !loading && (
        <>
          {!data.configured ? (
            <p className="text-[10px] text-[var(--color-tertiary)]">{data.note}</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[var(--color-surface-container-low)] p-2 rounded text-center">
                  <div className="text-lg font-[var(--font-headline)] font-extrabold text-foreground">{data.total}</div>
                  <div className="text-[8px] text-[var(--color-outline)] uppercase">Detections</div>
                </div>
                <div className="bg-[var(--color-surface-container-low)] p-2 rounded text-center">
                  <div className="text-lg font-[var(--font-headline)] font-extrabold text-[var(--color-secondary)]">{data.highConfidence}</div>
                  <div className="text-[8px] text-[var(--color-outline)] uppercase">High Conf</div>
                </div>
                <div className="bg-[var(--color-surface-container-low)] p-2 rounded text-center">
                  <div className="text-lg font-[var(--font-headline)] font-extrabold text-[var(--color-tertiary)]">{data.averageFRP.toFixed(1)}</div>
                  <div className="text-[8px] text-[var(--color-outline)] uppercase">Avg FRP</div>
                </div>
              </div>
              <div className={`p-2 rounded text-center text-[10px] font-bold ${
                data.thermalStatus === "active"
                  ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                  : data.thermalStatus === "low-activity"
                  ? "bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)]"
                  : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
              }`}>
                {data.thermalStatus === "active" ? "ACTIVE — Thermal signatures detected"
                  : data.thermalStatus === "low-activity" ? "LOW ACTIVITY — Minimal thermal output"
                  : "NO DETECTIONS — Facility may be offline"}
              </div>
              {data.results.length > 0 && (
                <div className="mt-2">
                  <p className="text-[9px] text-[var(--color-outline)] mb-1">Recent detections:</p>
                  <div className="space-y-1 max-h-[120px] overflow-y-auto">
                    {data.results.slice(0, 5).map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-[9px] bg-[var(--color-surface-container-low)] px-2 py-1 rounded">
                        <span className="text-[var(--color-muted-foreground)]">{r.acq_date} {r.acq_time}</span>
                        <span className="font-mono text-[var(--color-secondary)]">{r.frp.toFixed(1)} MW</span>
                        <span className={`font-bold ${r.confidence === "high" || r.confidence === "h" ? "text-[var(--color-secondary)]" : "text-[var(--color-outline)]"}`}>
                          {r.confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SatelliteCard({ entity, onClick }: { entity: Entity; onClick: () => void }) {
  const isFlagged = entity.verificationStatus === "flagged";
  const statusColor =
    entity.verificationStatus === "verified"
      ? "text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/20"
      : entity.verificationStatus === "flagged"
      ? "text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20"
      : "text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-[var(--color-surface-container-low)] rounded-xl overflow-hidden transition-all duration-200 hover:bg-[var(--color-surface-container)] hover:scale-[1.015] hover:shadow-lg group cursor-pointer ${
        isFlagged ? "border border-[var(--color-error)]/25 ring-1 ring-[var(--color-error)]/10" : "border border-transparent"
      }`}
    >
      <div className="relative bg-[#0b0e14] overflow-hidden" style={{ height: 160 }}>
        <SatelliteImageryView entity={entity} size={160} />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="flex items-center gap-1.5 bg-[var(--color-surface-container)]/90 rounded-lg px-3 py-1.5 border border-[var(--color-outline-variant)]/20">
            <span className="material-symbols-outlined text-[var(--color-secondary)] text-sm">open_in_full</span>
            <span className="text-[10px] font-bold text-foreground">View Intelligence</span>
          </div>
        </div>
        <div className="absolute bottom-2 left-2 text-[9px] font-mono text-[var(--color-outline)] bg-[#0b0e14]/80 px-1.5 py-0.5 rounded">
          {entity.latitude.toFixed(4)}°N, {Math.abs(entity.longitude).toFixed(4)}°{entity.longitude > 0 ? "E" : "W"}
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm border uppercase tracking-widest ${statusColor}`}>
            {entity.verificationStatus}
          </span>
        </div>
        <div className="absolute top-2 left-2 text-[8px] font-mono text-[var(--color-secondary)]/50">
          {entity.verificationStatus === "verified" ? "SENTINEL-2 / FIRMS" : "MAXAR / S-2"}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-foreground leading-tight">{entity.name}</h4>
          {entity.pfeDesignation && (
            <span className="text-[8px] font-bold text-[var(--color-error)] bg-[var(--color-error)]/10 px-1 py-0.5 rounded-sm border border-[var(--color-error)]/20 shrink-0 ml-2">
              PFE
            </span>
          )}
        </div>
        <p className="text-[10px] text-[var(--color-muted-foreground)]">{entity.country}</p>
        <div className="mt-3 space-y-1.5">
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
            <span className="text-foreground truncate ml-4 text-right">{entity.minerals.join(", ")}</span>
          </div>
        </div>
        <p className="text-[10px] text-[var(--color-muted-foreground)] mt-3 line-clamp-2 italic leading-relaxed">
          {entity.notes}
        </p>
      </div>
    </button>
  );
}

export default function GeointPage() {
  const [selected, setSelected] = useState<Entity | null>(null);
  const [thermalEntity, setThermalEntity] = useState<Entity>(entities[0]);
  const satelliteAlerts = alerts.filter((a) => a.type === "satellite");
  const verified   = entities.filter((e) => e.verificationStatus === "verified").length;
  const monitoring = entities.filter((e) => e.verificationStatus === "monitoring").length;
  const flagged    = entities.filter((e) => e.verificationStatus === "flagged").length;

  return (
    <>
      {selected && <SatelliteModal entity={selected} onClose={() => setSelected(null)} />}

      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-[var(--font-headline)] font-extrabold tracking-tight text-foreground">
              GEOINT — Satellite Verification
            </h1>
            <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
              Facility verification via satellite imagery + NASA FIRMS thermal anomaly detection.
            </p>
          </div>
        </div>

        {/* KPIs */}
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

        {/* Thermal Analysis Panel */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
              NASA FIRMS Thermal Anomaly Detection
            </h3>
            <div className="flex gap-1.5">
              {entities.slice(0, 6).map((e) => (
                <button
                  key={e.id}
                  onClick={() => setThermalEntity(e)}
                  className={`text-[9px] px-2 py-1 rounded transition-colors ${
                    thermalEntity.id === e.id
                      ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] font-bold border border-[var(--color-secondary)]/30"
                      : "bg-[var(--color-surface-container)] text-[var(--color-muted-foreground)] hover:text-foreground"
                  }`}
                >
                  {e.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <ThermalPanel entity={thermalEntity} />
        </div>

        {/* Card grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4">
            Facility Verification — Click any card to view full intelligence
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {entities.map((entity) => (
              <SatelliteCard key={entity.id} entity={entity} onClick={() => setSelected(entity)} />
            ))}
          </div>
        </div>

        {/* Satellite intel feed */}
        <div className="bg-[var(--color-surface-container-low)] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-[var(--font-headline)] font-bold text-lg text-foreground tracking-tight flex items-center gap-2">
              <MsIcon name="satellite_alt" className="text-[var(--color-secondary)]" />
              Satellite Intelligence Feed
            </h3>
            <span className="px-2 py-1 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-[10px] font-bold rounded-sm border border-[var(--color-secondary)]/20">
              SENTINEL-2 / FIRMS / MAXAR
            </span>
          </div>
          <div className="space-y-3">
            {satelliteAlerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => {
                  const entity = entities.find((e) => e.id === alert.entityId);
                  if (entity) setSelected(entity);
                }}
                className="w-full text-left flex gap-4 p-3 bg-[var(--color-surface-container)]/50 rounded border-l-2 border-[var(--color-secondary)] hover:bg-[var(--color-surface-container)] transition-colors"
              >
                <div className="w-10 h-10 flex-shrink-0 bg-[var(--color-secondary)]/10 rounded flex items-center justify-center">
                  <MsIcon name="satellite_alt" className="text-[var(--color-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground">{alert.title}</h4>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] bg-[var(--color-surface-container-highest)] px-2 py-0.5 rounded">{alert.entityName}</span>
                    <span className="text-[9px] text-[var(--color-outline)]">{alert.source}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
