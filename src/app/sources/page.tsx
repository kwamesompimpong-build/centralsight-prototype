"use client";

import { useState } from "react";
import { MsIcon } from "@/components/ms-icon";

type SourceStatus = "active" | "limited" | "pending" | "gap";

interface DataSource {
  id: string;
  name: string;
  category: string;
  endpoint: string;
  rateLimit: string;
  lastRefresh: string;
  latency: string;
  status: SourceStatus;
  coverage: string;
  authType: string;
  notes: string;
  recordsIngested?: string;
}

const SOURCES: DataSource[] = [
  // Trade & Customs
  {
    id: "comtrade",
    name: "UN Comtrade",
    category: "Trade & Customs",
    endpoint: "comtradeapi.un.org/data/v1/",
    rateLimit: "500 calls/day · 100K records/call",
    lastRefresh: "2026-03-28 06:00",
    latency: "84ms",
    status: "active",
    coverage: "~200 countries · HS codes 1962–present · 6-digit resolution",
    authType: "API Key (free)",
    notes: "2–6 month reporting lag. Use comtradeapicall library.",
    recordsIngested: "2.4M",
  },
  {
    id: "usitc",
    name: "USITC DataWeb",
    category: "Trade & Customs",
    endpoint: "datawebws.usitc.gov/dataweb",
    rateLimit: "Unrestricted (free)",
    lastRefresh: "2026-03-28 06:00",
    latency: "112ms",
    status: "active",
    coverage: "U.S. imports/exports · 10-digit HTS resolution · 2013–present",
    authType: "Bearer Token (Login.gov)",
    notes: "More granular than Comtrade. Monthly updates ~3 business days after Census release.",
    recordsIngested: "890K",
  },
  {
    id: "census",
    name: "Census Bureau USA Trade",
    category: "Trade & Customs",
    endpoint: "api.census.gov/data/timeseries/intltrade/",
    rateLimit: "500 req/day (free key)",
    lastRefresh: "2026-03-27 18:00",
    latency: "98ms",
    status: "active",
    coverage: "U.S. bilateral trade · 2013–present · Same source as USITC",
    authType: "API Key (free)",
    notes: "USA Trade Online relaunched March 2026 at usatradeonline.census.gov.",
    recordsIngested: "340K",
  },
  {
    id: "eurostat",
    name: "Eurostat COMEXT",
    category: "Trade & Customs",
    endpoint: "ec.europa.eu/eurostat/api/comext/dissemination",
    rateLimit: "Unlimited (no auth)",
    lastRefresh: "2026-03-28 04:00",
    latency: "220ms",
    status: "active",
    coverage: "EU27 bilateral trade · Updated twice daily · HS + CN codes",
    authType: "None",
    notes: "Bulk gzipped TSV downloads. Use pip install eurostat.",
    recordsIngested: "1.1M",
  },
  {
    id: "importyeti",
    name: "ImportYeti (Bills of Lading)",
    category: "Trade & Customs",
    endpoint: "importyeti.com",
    rateLimit: "Web only — no API",
    lastRefresh: "Manual",
    latency: "—",
    status: "limited",
    coverage: "U.S. ocean customs records searchable by HS code / company",
    authType: "None (web scrape)",
    notes: "No API. Paid alternatives: Panjiva ($1K+/mo), ImportGenius ($199–299/mo).",
  },
  // Vessel Tracking
  {
    id: "gfw",
    name: "Global Fishing Watch",
    category: "Vessel Tracking",
    endpoint: "gateway.api.globalfishingwatch.org/",
    rateLimit: "50,000 req/day (free)",
    lastRefresh: "2026-03-28 09:15",
    latency: "143ms",
    status: "active",
    coverage: "All vessel types · Port visits · Encounter detection · 2012–96h ago",
    authType: "API Key (free registration)",
    notes: "Vessel Presence covers bulk carriers. gfw-api-python-client (Apr 2025).",
    recordsIngested: "4.2M",
  },
  {
    id: "aisstream",
    name: "aisstream.io (Real-time AIS)",
    category: "Vessel Tracking",
    endpoint: "stream.aisstream.io/v0/stream (WebSocket)",
    rateLimit: "~300 msg/sec (free key)",
    lastRefresh: "Real-time",
    latency: "<10ms",
    status: "active",
    coverage: "Terrestrial AIS only · Filter by MMSI or bounding box · Port arrivals",
    authType: "API Key (GitHub login)",
    notes: "Open ocean vessels disappear from free feeds. Use websockets library.",
    recordsIngested: "Live",
  },
  {
    id: "marinecadastre",
    name: "US MarineCadastre (Historical)",
    category: "Vessel Tracking",
    endpoint: "marinecadastre.gov/accessais/",
    rateLimit: "Bulk download — no API",
    lastRefresh: "2026-03-01",
    latency: "—",
    status: "active",
    coverage: "U.S. EEZ (~40–50mi offshore) · GeoParquet · 2009–present · CC0",
    authType: "None (public domain)",
    notes: "2024 data available. Excellent for U.S. port activity pattern analysis.",
    recordsIngested: "680K",
  },
  {
    id: "satellite-ais",
    name: "Satellite AIS (Spire/Kpler)",
    category: "Vessel Tracking",
    endpoint: "Spire Maritime API",
    rateLimit: "Enterprise only",
    lastRefresh: "—",
    latency: "—",
    status: "gap",
    coverage: "Open-ocean tracking · DRC→China, Chile→China, AUS→China routes",
    authType: "Enterprise subscription ($10K+/mo)",
    notes: "Critical gap — vessels transiting open ocean are invisible on free feeds.",
  },
  // Corporate Registries
  {
    id: "edgar",
    name: "SEC EDGAR",
    category: "Corporate Registries",
    endpoint: "data.sec.gov / efts.sec.gov",
    rateLimit: "10 req/sec (User-Agent required)",
    lastRefresh: "2026-03-28 08:30",
    latency: "67ms",
    status: "active",
    coverage: "All U.S. public companies · XBRL financials · Full-text since 2001",
    authType: "None (public)",
    notes: "Use edgartools library. XBRL facts: /api/xbrl/companyfacts/CIK{10-digit}.json",
    recordsIngested: "12.4K",
  },
  {
    id: "companies-house",
    name: "UK Companies House",
    category: "Corporate Registries",
    endpoint: "api.company-information.service.gov.uk/",
    rateLimit: "600 req/5-min (free)",
    lastRefresh: "2026-03-28 07:00",
    latency: "190ms",
    status: "active",
    coverage: "~5M UK companies · PSC beneficial ownership data · Real-time",
    authType: "API Key (free, HTTP Basic Auth)",
    notes: "Uniquely valuable for free beneficial ownership data via PSC endpoint.",
    recordsIngested: "3.1K",
  },
  {
    id: "opensanctions",
    name: "OpenSanctions",
    category: "Sanctions & Screening",
    endpoint: "data.opensanctions.org/datasets/latest/",
    rateLimit: "Bulk download (free non-commercial)",
    lastRefresh: "2026-03-28 05:00",
    latency: "—",
    status: "active",
    coverage: "325+ sources: OFAC SDN, BIS Entity List, UFLPA, EU sanctions, World Bank",
    authType: "None (public data)",
    notes: "Deploy yente Docker server for fuzzy entity matching API. Updated daily.",
    recordsIngested: "8.9K",
  },
  {
    id: "csl",
    name: "Consolidated Screening List (trade.gov)",
    category: "Sanctions & Screening",
    endpoint: "api.trade.gov/consolidated_screening_list/search",
    rateLimit: "No limit (free, no key)",
    lastRefresh: "2026-03-28 05:00",
    latency: "55ms",
    status: "active",
    coverage: "11 U.S. government lists · OFAC SDN · BIS Entity List · UFLPA",
    authType: "None",
    notes: "Updated daily at 5 AM EST. JSON API.",
    recordsIngested: "6.2K",
  },
  // Satellite & Geospatial
  {
    id: "sentinel2",
    name: "Sentinel-2 (Copernicus)",
    category: "Satellite Imagery",
    endpoint: "catalogue.dataspace.copernicus.eu/stac/",
    rateLimit: "12 TB/month egress (free)",
    lastRefresh: "2026-03-27 22:00",
    latency: "310ms",
    status: "active",
    coverage: "10m optical · 5-day revisit · NDVI change detection · Mine expansion",
    authType: "OAuth2 (free registration)",
    notes: "Old Copernicus Hub retired Oct 2023. Use pystac-client + stackstac.",
    recordsIngested: "892 scenes",
  },
  {
    id: "sentinel1",
    name: "Sentinel-1 SAR (Copernicus)",
    category: "Satellite Imagery",
    endpoint: "catalogue.dataspace.copernicus.eu/stac/",
    rateLimit: "12 TB/month egress (free)",
    lastRefresh: "2026-03-27 18:00",
    latency: "310ms",
    status: "active",
    coverage: "All-weather SAR · 6-day revisit (1C+1D) · InSAR subsidence · DRC/Indonesia",
    authType: "OAuth2 (free registration)",
    notes: "Sentinel-1D launched Nov 2025, restoring 6-day revisit. SAR coherence for construction.",
    recordsIngested: "244 scenes",
  },
  {
    id: "firms",
    name: "NASA FIRMS (Thermal Anomalies)",
    category: "Satellite Imagery",
    endpoint: "firms.modaps.eosdis.nasa.gov/api/",
    rateLimit: "5,000 tx/10-min (free MAP_KEY)",
    lastRefresh: "2026-03-28 09:00",
    latency: "88ms",
    status: "active",
    coverage: "375m VIIRS · 3hr latency · Static Thermal Anomalies (smelters, refineries)",
    authType: "MAP_KEY (free)",
    notes: "Persistent thermal signatures identify industrial heat sources. Cessation = shutdown.",
    recordsIngested: "1.4K anomalies",
  },
  {
    id: "nightlights",
    name: "NASA Black Marble (Nighttime Lights)",
    category: "Satellite Imagery",
    endpoint: "blackmarble.gsfc.nasa.gov/",
    rateLimit: "Bulk download (free)",
    lastRefresh: "2026-03-25",
    latency: "—",
    status: "active",
    coverage: "500m daily nighttime radiance · Facility operational status · Construction",
    authType: "Earthdata login (free)",
    notes: "Use blackmarblepy library. NOAA/EOG annual composites at eogdata.mines.edu.",
    recordsIngested: "Monthly composite",
  },
  // Regulatory & Permits
  {
    id: "fed-register",
    name: "Federal Register API",
    category: "Regulatory",
    endpoint: "federalregister.gov/api/v1/documents.json",
    rateLimit: "No limit (no auth)",
    lastRefresh: "2026-03-28 09:00",
    latency: "42ms",
    status: "active",
    coverage: "Rules, notices, executive orders · All agencies · 1994–present · Daily",
    authType: "None",
    notes: "Best free regulatory monitoring tool. Filter by agency + type + keyword.",
    recordsIngested: "2.1K",
  },
  {
    id: "epa-echo",
    name: "EPA ECHO",
    category: "Regulatory",
    endpoint: "echodata.epa.gov/echo/echo_rest_services",
    rateLimit: "No auth required",
    lastRefresh: "2026-03-27 20:00",
    latency: "134ms",
    status: "active",
    coverage: "1M+ regulated facilities · Compliance, inspections, violations, enforcement",
    authType: "None",
    notes: "Facility Registry Service links facilities across all EPA programs.",
    recordsIngested: "4.8K",
  },
  {
    id: "msha",
    name: "MSHA Mine Safety Data",
    category: "Regulatory",
    endpoint: "arlweb.msha.gov/OpenGovernmentData/ogimsha.asp",
    rateLimit: "Bulk download (weekly)",
    lastRefresh: "2026-03-28 00:00",
    latency: "—",
    status: "active",
    coverage: "All U.S. mines · Location, status, operator, commodity, production, violations",
    authType: "None (public)",
    notes: "Best single source for U.S. mine inventory. Weekly pipe-delimited flat files.",
    recordsIngested: "18.2K mines",
  },
  // Energy Infrastructure
  {
    id: "eia",
    name: "EIA API v2",
    category: "Energy Infrastructure",
    endpoint: "api.eia.gov/v2/",
    rateLimit: "≤5 req/sec · ~9,000/hr",
    lastRefresh: "2026-03-28 06:00",
    latency: "78ms",
    status: "active",
    coverage: "Form 860 generator inventory · Form 923 fuel use · RTO real-time data",
    authType: "API Key (free at eia.gov/opendata/register.php)",
    notes: "Max 5,000 rows/response — paginate with offset+length.",
    recordsIngested: "22.1K",
  },
  {
    id: "gridstatus",
    name: "gridstatus.io (ISO/RTO Queues)",
    category: "Energy Infrastructure",
    endpoint: "api.gridstatus.io/v1/",
    rateLimit: "1M rows/month (free tier)",
    lastRefresh: "2026-03-28 09:00",
    latency: "91ms",
    status: "active",
    coverage: "PJM, CAISO, ERCOT, MISO, SPP, NYISO, ISO-NE · Interconnection queues · LMP",
    authType: "API Key (free tier)",
    notes: "pip install gridstatus. iso.get_interconnection_queue(). No key for most ISOs.",
    recordsIngested: "8.9K",
  },
  // Commodity Pricing
  {
    id: "lme",
    name: "LME Official Prices",
    category: "Commodity Pricing",
    endpoint: "lme.com/Market-data",
    rateLimit: "EOD delayed (free web)",
    lastRefresh: "2026-03-28 18:00",
    latency: "—",
    status: "limited",
    coverage: "Base metals only: copper, nickel, cobalt, tin, zinc · No Li/REE/Ga/Ge",
    authType: "None (EOD delayed) / LMElive (4-week trial)",
    notes: "Critical gap — no free real-time pricing for lithium, rare earths, gallium, germanium.",
  },
  {
    id: "usgs-mcs",
    name: "USGS Mineral Commodity Summaries",
    category: "Commodity Pricing",
    endpoint: "usgs.gov/centers/national-minerals-information-center/",
    rateLimit: "Bulk download (annual)",
    lastRefresh: "2026-01-01",
    latency: "—",
    status: "active",
    coverage: "90+ nonfuel minerals · Production, trade, price, reserves · Annual · MCS 2026 available",
    authType: "None (public)",
    notes: "Most authoritative free source but annual only. Quarterly surveys supplement.",
    recordsIngested: "MCS 2026",
  },
  {
    id: "bmi",
    name: "Benchmark Mineral Intelligence",
    category: "Commodity Pricing",
    endpoint: "source.benchmarkminerals.com",
    rateLimit: "Enterprise",
    lastRefresh: "—",
    latency: "—",
    status: "gap",
    coverage: "Battery materials pricing (IOSCO-assured) · Li, Co, Ni, graphite, REE",
    authType: "Subscription ($15K–50K+/yr)",
    notes: "Gold standard for battery materials. Free account: basic charts + 3 articles/month.",
  },
  // News & Signals
  {
    id: "gdelt",
    name: "GDELT Project",
    category: "News & Signals",
    endpoint: "api.gdeltproject.org/api/v2/doc/doc",
    rateLimit: "No limit (free)",
    lastRefresh: "Real-time (15-min updates)",
    latency: "200ms",
    status: "active",
    coverage: "Global news monitoring · 310M+ events · 100+ languages",
    authType: "None",
    notes: "BigQuery access: first 1TB/month free. Use gdelt (gdeltPyR) library.",
    recordsIngested: "Live",
  },
  {
    id: "congress",
    name: "Congress.gov API",
    category: "News & Signals",
    endpoint: "api.congress.gov/v3/",
    rateLimit: "5,000 req/hr (free key)",
    lastRefresh: "2026-03-28 08:00",
    latency: "110ms",
    status: "active",
    coverage: "Bill text, hearing data, committee reports · No full-text keyword search",
    authType: "API Key (free)",
    notes: "Combine website search to ID bill numbers + API for detail pulls.",
    recordsIngested: "1.2K",
  },
];

const CATEGORIES = [...new Set(SOURCES.map((s) => s.category))];
const STATUS_META: Record<SourceStatus, { label: string; color: string; dot: string }> = {
  active:  { label: "Active",   color: "text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/20",  dot: "bg-[var(--color-secondary)]" },
  limited: { label: "Limited",  color: "text-[var(--color-tertiary)] bg-[var(--color-tertiary)]/10 border-[var(--color-tertiary)]/20", dot: "bg-[var(--color-tertiary)]" },
  pending: { label: "Pending",  color: "text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20",   dot: "bg-[var(--color-primary)]" },
  gap:     { label: "Gap",      color: "text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20",          dot: "bg-[var(--color-error)]" },
};

const CATEGORY_ICONS: Record<string, string> = {
  "Trade & Customs":      "receipt_long",
  "Vessel Tracking":      "directions_boat",
  "Corporate Registries": "business",
  "Satellite Imagery":    "satellite_alt",
  "Regulatory":           "article",
  "Energy Infrastructure":"bolt",
  "Commodity Pricing":    "trending_up",
  "News & Signals":       "rss_feed",
  "Sanctions & Screening":"shield",
};

const HTS_CODES = [
  { mineral: "Lithium", codes: ["2836.91 (lithium carbonate)", "2825.20 (lithium hydroxide)"] },
  { mineral: "Rare Earths", codes: ["2846.10 (cerium compounds)", "2846.90 (other REE oxides)", "2805.30 (REE metals)"] },
  { mineral: "Cobalt", codes: ["2605.00 (ores)", "2822.00 (oxides)", "8105.20 (unwrought)"] },
  { mineral: "Nickel", codes: ["2604.00 (ores)", "7501.10 (mattes)", "7502.10 (unwrought refined)"] },
  { mineral: "Graphite", codes: ["2504.10 (natural powder/flake)", "2504.90 (other natural)", "3801.10 (synthetic)"] },
  { mineral: "Copper", codes: ["2603.00 (ores)", "7403.11 (refined cathodes)"] },
  { mineral: "GOES Steel", codes: ["7225.11 (grain-oriented flat-rolled)", "7226.11 (other GOES)"] },
  { mineral: "Gallium", codes: ["8112.92 (unwrought/powders)", "3818.00 (GaAs wafers)"] },
  { mineral: "Germanium", codes: ["8112.99 (unwrought/powders)", "2825.60 (oxides)"] },
  { mineral: "Antimony", codes: ["2617.10 (ores)", "8110.10 (unwrought metal)"] },
  { mineral: "Tungsten", codes: ["2611.00 (ores)", "8101.10 (powders)"] },
];

export default function SourcesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [showHts, setShowHts] = useState(false);

  const displayed = activeCategory === "All"
    ? SOURCES
    : SOURCES.filter((s) => s.category === activeCategory);

  const statusCounts = {
    active: SOURCES.filter((s) => s.status === "active").length,
    limited: SOURCES.filter((s) => s.status === "limited").length,
    gap: SOURCES.filter((s) => s.status === "gap").length,
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-[var(--font-headline)] font-extrabold tracking-tight text-foreground">
            Intelligence Sources
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
            Data collector registry — APIs, feeds, and open data sources powering MINERAL_SENTINEL.
          </p>
        </div>
        <button
          onClick={() => setShowHts((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${
            showHts
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20"
              : "bg-[var(--color-surface-container-low)] text-[var(--color-muted-foreground)] border-transparent hover:bg-[var(--color-surface-container)]"
          }`}
        >
          <span className="material-symbols-outlined text-sm">tag</span>
          HTS Code Reference
        </button>
      </div>

      {/* HTS reference panel */}
      {showHts && (
        <div className="bg-[var(--color-surface-container-low)] rounded-xl p-5 border border-[var(--color-outline-variant)]/10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4">
            Critical Minerals — HS / HTS Code Reference
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {HTS_CODES.map((row) => (
              <div key={row.mineral} className="bg-[var(--color-surface-container)] rounded-lg p-3">
                <p className="text-[11px] font-bold text-foreground mb-2">{row.mineral}</p>
                {row.codes.map((code) => (
                  <p key={code} className="text-[10px] font-mono text-[var(--color-muted-foreground)] leading-relaxed">{code}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Sources", value: SOURCES.length, color: "var(--color-primary)", accent: "var(--color-primary)" },
          { label: "Active Feeds", value: statusCounts.active, color: "var(--color-secondary)", accent: "var(--color-secondary)" },
          { label: "Limited / Delayed", value: statusCounts.limited, color: "var(--color-tertiary)", accent: "var(--color-tertiary)" },
          { label: "Coverage Gaps", value: statusCounts.gap, color: "var(--color-error)", accent: "var(--color-error)" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[var(--color-surface-container-low)] rounded-xl p-4 border-b-[3px]" style={{ borderColor: kpi.accent }}>
            <p className="text-[10px] text-[var(--color-outline)] uppercase tracking-widest font-bold">{kpi.label}</p>
            <span className="text-2xl font-[var(--font-headline)] font-extrabold" style={{ color: kpi.color }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Coverage gap callout */}
      <div className="bg-[var(--color-error)]/5 border border-[var(--color-error)]/15 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-[var(--color-error)] text-xl shrink-0 mt-0.5">warning</span>
        <div>
          <p className="text-sm font-bold text-foreground mb-1">Three critical coverage gaps identified</p>
          <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
            <strong className="text-foreground">Real-time specialty mineral pricing</strong> (lithium, REEs, Ga, Ge) — Benchmark Minerals and Fastmarkets charge $15K–50K+/yr; prototype uses USGS annual + LME delayed.{" "}
            <strong className="text-foreground">Open-ocean vessel tracking</strong> (DRC→China, Chile→China, AUS→China routes) — terrestrial AIS loses vessels in transit; satellite AIS costs $10K+/mo.{" "}
            <strong className="text-foreground">Chinese domestic market intelligence</strong> — MOFCOM has no API; SMM/Fastmarkets China feeds require subscription.
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              activeCategory === cat
                ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] font-bold"
                : "text-[var(--color-outline)] hover:text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-container)]"
            }`}
          >
            {cat !== "All" && (
              <span className="material-symbols-outlined text-xs">{CATEGORY_ICONS[cat] ?? "circle"}</span>
            )}
            {cat}
          </button>
        ))}
      </div>

      {/* Source cards */}
      {(activeCategory === "All" ? CATEGORIES : [activeCategory]).map((cat) => {
        const catSources = displayed.filter((s) => s.category === cat);
        if (catSources.length === 0) return null;
        return (
          <div key={cat}>
            <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-3">
              <span className="material-symbols-outlined text-sm">{CATEGORY_ICONS[cat] ?? "circle"}</span>
              {cat}
            </h3>
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {catSources.map((src) => {
                const st = STATUS_META[src.status];
                return (
                  <div
                    key={src.id}
                    className={`bg-[var(--color-surface-container-low)] rounded-xl p-4 border ${
                      src.status === "gap"
                        ? "border-[var(--color-error)]/15"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-foreground">{src.name}</p>
                          <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm border uppercase tracking-widest shrink-0 ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-[var(--color-outline)] truncate">{src.endpoint}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 my-3">
                      {[
                        { label: "Rate Limit", value: src.rateLimit },
                        { label: "Auth", value: src.authType },
                        { label: "Last Refresh", value: src.lastRefresh },
                        { label: "Latency", value: src.latency },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[9px] text-[var(--color-outline)] uppercase tracking-widest">{label}</p>
                          <p className="text-[10px] text-foreground font-medium">{value}</p>
                        </div>
                      ))}
                    </div>

                    {src.recordsIngested && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot} shrink-0`} />
                        <span className="text-[10px] text-[var(--color-muted-foreground)]">
                          {src.recordsIngested} records ingested
                        </span>
                      </div>
                    )}

                    <div className="bg-[var(--color-surface-container)] rounded-lg p-2.5">
                      <p className="text-[9px] text-[var(--color-outline)] uppercase tracking-widest mb-1">Coverage</p>
                      <p className="text-[10px] text-[var(--color-muted-foreground)] leading-relaxed">{src.coverage}</p>
                    </div>

                    <p className="text-[10px] text-[var(--color-outline)] mt-2 italic leading-relaxed">{src.notes}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
