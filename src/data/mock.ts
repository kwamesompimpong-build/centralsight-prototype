// MineralScope Energy Extension — Mock OSINT Data
// Models the critical mineral supply chain intelligence layer

export type RiskLevel = "critical" | "high" | "medium" | "low";
export type VerificationStatus = "verified" | "unverified" | "monitoring" | "flagged";
export type ComplianceStatus = "compliant" | "non-compliant" | "under-review" | "exempt";
export type MineralCategory = "lithium" | "cobalt" | "rare-earth" | "graphite" | "nickel" | "manganese" | "silicon" | "transformer-steel";

export interface Entity {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  type: "manufacturer" | "processor" | "mining" | "trader" | "assembler";
  riskLevel: RiskLevel;
  feocStatus: ComplianceStatus;
  pfeDesignation: boolean;
  verificationStatus: VerificationStatus;
  minerals: MineralCategory[];
  tier: number; // supply chain tier (1-5)
  ownershipChain: string[];
  lastSatelliteVerification: string;
  latitude: number;
  longitude: number;
  notes: string;
}

export interface SupplyChainLink {
  from: string; // entity id
  to: string;
  mineral: MineralCategory;
  volume: string;
  route: string;
  riskFlags: string[];
}

export interface Alert {
  id: string;
  timestamp: string;
  type: "ownership-change" | "sanctions" | "satellite" | "regulatory" | "trade-anomaly";
  severity: RiskLevel;
  entityId: string;
  entityName: string;
  title: string;
  description: string;
  source: string;
}

export interface ComplianceThreshold {
  mineral: MineralCategory;
  macrThreshold: number; // percentage
  currentCompliance: number;
  deadline: string;
  regulation: string;
}

// ── ENTITIES ──────────────────────────────────────────────
export const entities: Entity[] = [
  {
    id: "e1",
    name: "Ganfeng Lithium Co.",
    country: "China",
    countryCode: "CN",
    type: "processor",
    riskLevel: "critical",
    feocStatus: "non-compliant",
    pfeDesignation: true,
    verificationStatus: "flagged",
    minerals: ["lithium"],
    tier: 2,
    ownershipChain: ["Ganfeng Lithium Group Co. Ltd", "State-Owned Assets Supervision (Jiangxi)"],
    lastSatelliteVerification: "2026-03-15",
    latitude: 28.68,
    longitude: 115.89,
    notes: "Major lithium hydroxide processor. PFE-designated due to SASAC indirect ownership. Supplies multiple US battery cell manufacturers.",
  },
  {
    id: "e2",
    name: "CATL (Fujian)",
    country: "China",
    countryCode: "CN",
    type: "manufacturer",
    riskLevel: "critical",
    feocStatus: "non-compliant",
    pfeDesignation: true,
    verificationStatus: "monitoring",
    minerals: ["lithium", "cobalt", "nickel", "manganese"],
    tier: 1,
    ownershipChain: ["Contemporary Amperex Technology Co.", "Ningde Municipal Government (indirect)"],
    lastSatelliteVerification: "2026-03-20",
    latitude: 26.67,
    longitude: 119.55,
    notes: "World's largest battery manufacturer. Ford $900M licensing exposure. Sec 45X disqualified.",
  },
  {
    id: "e3",
    name: "Gotion High-Tech (Virginia)",
    country: "United States",
    countryCode: "US",
    type: "manufacturer",
    riskLevel: "high",
    feocStatus: "under-review",
    pfeDesignation: false,
    verificationStatus: "monitoring",
    minerals: ["lithium", "graphite"],
    tier: 1,
    ownershipChain: ["Gotion Inc.", "Gotion High-Tech Co. Ltd (Hefei)", "Volkswagen AG (26%)"],
    lastSatelliteVerification: "2026-03-22",
    latitude: 37.27,
    longitude: -79.94,
    notes: "$2.36B plant at risk. FEOC review pending — beneficial ownership traces to entities with PRC government connections.",
  },
  {
    id: "e4",
    name: "Albemarle (Kings Mountain)",
    country: "United States",
    countryCode: "US",
    type: "mining",
    riskLevel: "low",
    feocStatus: "compliant",
    pfeDesignation: false,
    verificationStatus: "verified",
    minerals: ["lithium"],
    tier: 3,
    ownershipChain: ["Albemarle Corporation (NYSE: ALB)"],
    lastSatelliteVerification: "2026-03-18",
    latitude: 35.24,
    longitude: -81.34,
    notes: "Domestic lithium mine. Fully FEOC compliant. MACR-qualifying domestic source.",
  },
  {
    id: "e5",
    name: "MP Materials (Mountain Pass)",
    country: "United States",
    countryCode: "US",
    type: "mining",
    riskLevel: "medium",
    feocStatus: "compliant",
    pfeDesignation: false,
    verificationStatus: "verified",
    minerals: ["rare-earth"],
    tier: 3,
    ownershipChain: ["MP Materials Corp (NYSE: MP)"],
    lastSatelliteVerification: "2026-03-25",
    latitude: 35.47,
    longitude: -115.53,
    notes: "Only integrated rare earth mining and processing in the Western Hemisphere. Processing still partially dependent on China for downstream separation.",
  },
  {
    id: "e6",
    name: "Syrah Resources (Vidalia)",
    country: "United States",
    countryCode: "US",
    type: "processor",
    riskLevel: "low",
    feocStatus: "compliant",
    pfeDesignation: false,
    verificationStatus: "verified",
    minerals: ["graphite"],
    tier: 2,
    ownershipChain: ["Syrah Resources Ltd (ASX: SYR)"],
    lastSatelliteVerification: "2026-03-19",
    latitude: 32.17,
    longitude: -82.41,
    notes: "Active anode material facility. DOE LPO loan recipient. Key graphite processor for IRA compliance.",
  },
  {
    id: "e7",
    name: "Jinko Solar (Shangrao)",
    country: "China",
    countryCode: "CN",
    type: "manufacturer",
    riskLevel: "high",
    feocStatus: "under-review",
    pfeDesignation: false,
    verificationStatus: "monitoring",
    minerals: ["silicon"],
    tier: 1,
    ownershipChain: ["JinkoSolar Holding Co. Ltd", "Zhejiang Provincial Government (indirect minority)"],
    lastSatelliteVerification: "2026-03-14",
    latitude: 28.45,
    longitude: 117.97,
    notes: "Major solar module manufacturer. Polysilicon sourcing under UFLPA scrutiny. Xinjiang supply chain allegations.",
  },
  {
    id: "e8",
    name: "Hyundai Steel (Dangjin)",
    country: "South Korea",
    countryCode: "KR",
    type: "manufacturer",
    riskLevel: "low",
    feocStatus: "compliant",
    pfeDesignation: false,
    verificationStatus: "verified",
    minerals: ["transformer-steel"],
    tier: 2,
    ownershipChain: ["Hyundai Motor Group"],
    lastSatelliteVerification: "2026-03-21",
    latitude: 36.89,
    longitude: 126.63,
    notes: "Grain-oriented electrical steel (GOES) producer. Key transformer steel supply for US grid buildout.",
  },
  {
    id: "e9",
    name: "Umicore (Kokkola)",
    country: "Finland",
    countryCode: "FI",
    type: "processor",
    riskLevel: "low",
    feocStatus: "compliant",
    pfeDesignation: false,
    verificationStatus: "verified",
    minerals: ["cobalt", "nickel"],
    tier: 2,
    ownershipChain: ["Umicore SA (EBR: UMI)"],
    lastSatelliteVerification: "2026-03-17",
    latitude: 63.84,
    longitude: 23.13,
    notes: "European cobalt refinery. FEOC-compliant alternative to Chinese processors. FTA-qualifying source.",
  },
  {
    id: "e10",
    name: "Baotou Steel Rare Earth",
    country: "China",
    countryCode: "CN",
    type: "processor",
    riskLevel: "critical",
    feocStatus: "non-compliant",
    pfeDesignation: true,
    verificationStatus: "flagged",
    minerals: ["rare-earth"],
    tier: 2,
    ownershipChain: ["China Northern Rare Earth Group", "Inner Mongolia SASAC", "State Council"],
    lastSatelliteVerification: "2026-03-10",
    latitude: 40.66,
    longitude: 109.84,
    notes: "World's largest rare earth processor. Directly state-owned. Controls ~60% of global heavy rare earth separation capacity.",
  },
];

// ── SUPPLY CHAIN LINKS ───────────────────────────────────
export const supplyChainLinks: SupplyChainLink[] = [
  { from: "e1", to: "e2", mineral: "lithium", volume: "15,000 MT/yr", route: "Jiangxi → Fujian (road)", riskFlags: ["PFE-to-PFE transfer"] },
  { from: "e2", to: "e3", mineral: "lithium", volume: "8,000 MT/yr", route: "Fujian → Shanghai (road) → Norfolk (sea)", riskFlags: ["PFE source", "FEOC disqualifying"] },
  { from: "e4", to: "e3", mineral: "lithium", volume: "3,000 MT/yr", route: "Kings Mountain → Virginia (road)", riskFlags: [] },
  { from: "e10", to: "e7", mineral: "rare-earth", volume: "5,200 MT/yr", route: "Baotou → Shangrao (rail)", riskFlags: ["PFE source", "UFLPA concern"] },
  { from: "e5", to: "e8", mineral: "rare-earth", volume: "1,800 MT/yr", route: "Mountain Pass → Long Beach (road) → Busan (sea)", riskFlags: [] },
  { from: "e9", to: "e3", mineral: "cobalt", volume: "2,400 MT/yr", route: "Kokkola → Rotterdam (rail) → Norfolk (sea)", riskFlags: [] },
  { from: "e6", to: "e3", mineral: "graphite", volume: "6,000 MT/yr", route: "Vidalia → Virginia (road)", riskFlags: [] },
  { from: "e8", to: "e3", mineral: "transformer-steel", volume: "12,000 MT/yr", route: "Dangjin → Busan (road) → Houston (sea)", riskFlags: [] },
];

// ── ALERTS ───────────────────────────────────────────────
export const alerts: Alert[] = [
  {
    id: "a1",
    timestamp: "2026-03-27T08:15:00Z",
    type: "ownership-change",
    severity: "critical",
    entityId: "e3",
    entityName: "Gotion High-Tech (Virginia)",
    title: "Beneficial ownership restructuring detected",
    description: "SEC filing indicates Hefei Municipal Government increased indirect stake through newly formed holding entity. May trigger PFE reclassification.",
    source: "SEC EDGAR (efts.sec.gov) / UK Companies House PSC",
  },
  {
    id: "a2",
    timestamp: "2026-03-26T14:30:00Z",
    type: "satellite",
    severity: "high",
    entityId: "e1",
    entityName: "Ganfeng Lithium Co.",
    title: "Facility expansion detected via satellite imagery",
    description: "New construction activity at Xinyu processing complex. Estimated 40% capacity expansion. Imagery shows 3 new evaporation ponds under construction.",
    source: "Sentinel-2 / Copernicus Data Space (STAC API) · FIRMS Thermal Anomaly",
  },
  {
    id: "a3",
    timestamp: "2026-03-26T09:00:00Z",
    type: "regulatory",
    severity: "high",
    entityId: "e2",
    entityName: "CATL (Fujian)",
    title: "IRS Notice 2026-15 MACR thresholds published",
    description: "New Material Assistance Cost Ratios require 50% domestic content for battery components by 2027. CATL supply chain routes disqualified.",
    source: "Federal Register API (federalregister.gov/api/v1) / IRS Notice 2026-15",
  },
  {
    id: "a4",
    timestamp: "2026-03-25T16:45:00Z",
    type: "trade-anomaly",
    severity: "medium",
    entityId: "e10",
    entityName: "Baotou Steel Rare Earth",
    title: "Export volume spike to Vietnam transshipment hub",
    description: "Customs data shows 340% increase in rare earth oxide exports to Ho Chi Minh City. Pattern consistent with origin obfuscation ahead of Section 232 enforcement.",
    source: "UN Comtrade API (comtradeapi.un.org) / Global Fishing Watch Vessel Presence",
  },
  {
    id: "a5",
    timestamp: "2026-03-25T11:20:00Z",
    type: "sanctions",
    severity: "critical",
    entityId: "e7",
    entityName: "Jinko Solar (Shangrao)",
    title: "UFLPA enforcement action — WRO issued",
    description: "CBP issued Withhold Release Order on polysilicon-containing modules from Shangrao facility. Connected to Xinjiang polysilicon supply chain.",
    source: "OpenSanctions UFLPA Mirror (data.opensanctions.org) / CBP UFLPA Dashboard",
  },
  {
    id: "a6",
    timestamp: "2026-03-24T13:00:00Z",
    type: "satellite",
    severity: "low",
    entityId: "e4",
    entityName: "Albemarle (Kings Mountain)",
    title: "Facility operational — normal activity confirmed",
    description: "Routine satellite pass confirms active mining operations, vehicle movement, and processing facility thermal signatures consistent with expected output.",
    source: "Sentinel-2 STAC (earth-search.aws.element84.com/v1) / MSHA Weekly Data",
  },
  {
    id: "a7",
    timestamp: "2026-03-24T08:30:00Z",
    type: "regulatory",
    severity: "medium",
    entityId: "e5",
    entityName: "MP Materials (Mountain Pass)",
    title: "DOE Critical Materials Assessment — transformer minerals added",
    description: "2026 Energy CMA adds grain-oriented electrical steel (GOES) and large power transformer components to critical materials list.",
    source: "DOE OSTI API (osti.gov/api/v1) / Federal Register API / EIA Form 860",
  },
  {
    id: "a8",
    timestamp: "2026-03-23T15:00:00Z",
    type: "ownership-change",
    severity: "high",
    entityId: "e10",
    entityName: "Baotou Steel Rare Earth",
    title: "State Council directive — consolidation order",
    description: "PRC State Council issued directive merging three northern rare earth processors under China Northern Rare Earth umbrella. Concentration increases PFE risk.",
    source: "GDELT Project API / MOFCOM (scraped) / OpenCorporates",
  },
];

// ── COMPLIANCE THRESHOLDS ────────────────────────────────
export const complianceThresholds: ComplianceThreshold[] = [
  { mineral: "lithium", macrThreshold: 50, currentCompliance: 28, deadline: "2027-01-01", regulation: "IRS Notice 2026-15 (Sec 45X)" },
  { mineral: "cobalt", macrThreshold: 50, currentCompliance: 45, deadline: "2027-01-01", regulation: "IRS Notice 2026-15 (Sec 45X)" },
  { mineral: "graphite", macrThreshold: 50, currentCompliance: 52, deadline: "2027-01-01", regulation: "IRS Notice 2026-15 (Sec 45X)" },
  { mineral: "rare-earth", macrThreshold: 40, currentCompliance: 15, deadline: "2027-01-01", regulation: "IRS Notice 2026-15 (Sec 48E)" },
  { mineral: "nickel", macrThreshold: 50, currentCompliance: 61, deadline: "2027-01-01", regulation: "IRS Notice 2026-15 (Sec 45X)" },
  { mineral: "manganese", macrThreshold: 50, currentCompliance: 38, deadline: "2027-01-01", regulation: "IRS Notice 2026-15 (Sec 45X)" },
  { mineral: "silicon", macrThreshold: 40, currentCompliance: 22, deadline: "2027-06-01", regulation: "UFLPA / Sec 48E" },
  { mineral: "transformer-steel", macrThreshold: 55, currentCompliance: 43, deadline: "2028-01-01", regulation: "OBBBA Sec 40101 / DOE CMA" },
];

// ── DASHBOARD KPIs ───────────────────────────────────────
export const kpis = {
  entitiesTracked: entities.length,
  pfeDesignated: entities.filter((e) => e.pfeDesignation).length,
  criticalAlerts: alerts.filter((a) => a.severity === "critical").length,
  avgCompliance: Math.round(complianceThresholds.reduce((acc, t) => acc + t.currentCompliance, 0) / complianceThresholds.length),
  mineralsMonitored: complianceThresholds.length,
  satelliteVerifications: entities.filter((e) => e.verificationStatus === "verified").length,
  supplyChainLinks: supplyChainLinks.length,
  flaggedRoutes: supplyChainLinks.filter((l) => l.riskFlags.length > 0).length,
};

// ── HELPERS ──────────────────────────────────────────────
export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case "critical": return "text-red-400 bg-red-400/10 border-red-400/20";
    case "high": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
    case "medium": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    case "low": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  }
}

export function getRiskDot(risk: RiskLevel): string {
  switch (risk) {
    case "critical": return "bg-red-400";
    case "high": return "bg-orange-400";
    case "medium": return "bg-yellow-400";
    case "low": return "bg-emerald-400";
  }
}

export function getComplianceColor(status: ComplianceStatus): string {
  switch (status) {
    case "compliant": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "non-compliant": return "text-red-400 bg-red-400/10 border-red-400/20";
    case "under-review": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    case "exempt": return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
  }
}

export function getVerificationIcon(status: VerificationStatus): string {
  switch (status) {
    case "verified": return "✓";
    case "unverified": return "?";
    case "monitoring": return "◉";
    case "flagged": return "⚠";
  }
}

export function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "< 1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
