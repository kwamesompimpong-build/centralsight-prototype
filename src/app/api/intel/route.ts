import { NextResponse } from "next/server";
import { fetchJSON, cachedFetch, buildURL } from "@/lib/api-client";

/**
 * Unified Intelligence Feed — Aggregates multiple free OSINT sources
 * into a single normalized alert stream for the dashboard.
 *
 * Sources:
 *  1. Federal Register (regulatory signals)
 *  2. GDELT (news monitoring)
 *  3. SEC EDGAR (corporate filings)
 *
 * GET /api/intel?limit=20
 */

interface IntelAlert {
  id: string;
  timestamp: string;
  type: "regulatory" | "news" | "filing" | "sanctions" | "satellite" | "trade-anomaly" | "ownership-change";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  source: string;
  sourceUrl: string | null;
  entities: string[];
  tags: string[];
}

// Keywords to search across all sources
const CRITICAL_MINERALS_QUERIES = [
  '"critical minerals"',
  '"rare earth"',
  '"lithium" "supply chain"',
  '"cobalt" mining',
  '"FEOC" minerals',
  '"UFLPA" solar',
];

// Entity names we're tracking — used to tag alerts
const TRACKED_ENTITIES = [
  "Ganfeng", "CATL", "Gotion", "Albemarle", "MP Materials",
  "Syrah Resources", "Jinko Solar", "Hyundai Steel", "Umicore", "Baotou",
];

function matchEntities(text: string): string[] {
  return TRACKED_ENTITIES.filter((name) => text.toLowerCase().includes(name.toLowerCase()));
}

function classifySeverity(text: string): "critical" | "high" | "medium" | "low" {
  const lower = text.toLowerCase();
  if (lower.includes("sanction") || lower.includes("enforcement") || lower.includes("ban") || lower.includes("prohibit")) return "critical";
  if (lower.includes("investigation") || lower.includes("violation") || lower.includes("penalty") || lower.includes("restriction")) return "high";
  if (lower.includes("proposed") || lower.includes("review") || lower.includes("assess") || lower.includes("monitor")) return "medium";
  return "low";
}

async function fetchFederalRegisterAlerts(): Promise<IntelAlert[]> {
  try {
    const url = buildURL("https://www.federalregister.gov/api/v1/documents.json", {
      "conditions[term]": '"critical minerals" OR "rare earth" OR "FEOC" OR "UFLPA"',
      per_page: "10",
      order: "newest",
    });
    const data = await fetchJSON<{
      results: Array<{
        title: string;
        abstract?: string;
        document_number: string;
        html_url: string;
        publication_date: string;
        type: string;
        agencies: Array<{ name: string }>;
      }>;
    }>(url);

    return data.results.map((doc) => ({
      id: `fr-${doc.document_number}`,
      timestamp: new Date(doc.publication_date).toISOString(),
      type: "regulatory" as const,
      severity: classifySeverity(`${doc.title} ${doc.abstract || ""}`),
      title: doc.title,
      description: doc.abstract || `${doc.type} published by ${doc.agencies.map((a) => a.name).join(", ")}`,
      source: `Federal Register (${doc.agencies[0]?.name || "Federal"})`,
      sourceUrl: doc.html_url,
      entities: matchEntities(`${doc.title} ${doc.abstract || ""}`),
      tags: [doc.type.toLowerCase(), ...doc.agencies.map((a) => a.name)],
    }));
  } catch {
    return [];
  }
}

async function fetchGDELTAlerts(): Promise<IntelAlert[]> {
  try {
    const url = buildURL("https://api.gdeltproject.org/api/v2/doc/doc", {
      query: '"critical minerals" OR "rare earth supply" OR "lithium supply chain" OR "cobalt mining" OR "FEOC" OR "UFLPA"',
      mode: "artlist",
      format: "json",
      maxrecords: "15",
      timespan: "3d",
      sort: "DateDesc",
    });
    const data = await fetchJSON<{
      articles?: Array<{
        title: string;
        url: string;
        seendate: string;
        domain: string;
        sourcecountry: string;
      }>;
    }>(url, { timeout: 20000 });

    return (data.articles || []).map((article, i) => ({
      id: `gdelt-${i}-${article.seendate}`,
      timestamp: parseGDELTDate(article.seendate),
      type: "news" as const,
      severity: classifySeverity(article.title),
      title: article.title,
      description: `Source: ${article.domain} (${article.sourcecountry})`,
      source: `GDELT / ${article.domain}`,
      sourceUrl: article.url,
      entities: matchEntities(article.title),
      tags: ["news", article.sourcecountry],
    }));
  } catch {
    return [];
  }
}

async function fetchEDGARAlerts(): Promise<IntelAlert[]> {
  try {
    const url = buildURL("https://efts.sec.gov/LATEST/search-index", {
      q: '"critical minerals" OR "rare earth" OR "FEOC" OR "lithium supply"',
      forms: "10-K,10-Q,8-K",
      from: "0",
    });
    const data = await fetchJSON<{
      hits: {
        hits: Array<{
          _id: string;
          _source: {
            entity_name: string;
            file_type: string;
            display_date_filed: string;
            file_description?: string;
            entity_id: string;
          };
        }>;
      };
    }>(url, {
      headers: {
        "User-Agent": "MineralScope/1.0 (critical-minerals-osint; admin@mineralscope.dev)",
      },
    });

    return data.hits.hits.slice(0, 10).map((hit) => ({
      id: `edgar-${hit._id}`,
      timestamp: new Date(hit._source.display_date_filed).toISOString(),
      type: "filing" as const,
      severity: "medium" as const,
      title: `${hit._source.entity_name} — ${hit._source.file_type} Filing`,
      description: hit._source.file_description || `${hit._source.file_type} filing mentioning critical minerals`,
      source: "SEC EDGAR",
      sourceUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${hit._source.entity_id}&type=${hit._source.file_type}`,
      entities: matchEntities(hit._source.entity_name),
      tags: ["filing", hit._source.file_type],
    }));
  } catch {
    return [];
  }
}

function parseGDELTDate(seendate: string): string {
  // GDELT format: "20260327T143000Z"
  try {
    const year = seendate.substring(0, 4);
    const month = seendate.substring(4, 6);
    const day = seendate.substring(6, 8);
    const hour = seendate.substring(9, 11);
    const min = seendate.substring(11, 13);
    return new Date(`${year}-${month}-${day}T${hour}:${min}:00Z`).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "30");

  try {
    const allAlerts = await cachedFetch<IntelAlert[]>(
      "intel-feed",
      async () => {
        // Fetch all sources in parallel
        const [regulatory, news, filings] = await Promise.allSettled([
          fetchFederalRegisterAlerts(),
          fetchGDELTAlerts(),
          fetchEDGARAlerts(),
        ]);

        const alerts: IntelAlert[] = [
          ...(regulatory.status === "fulfilled" ? regulatory.value : []),
          ...(news.status === "fulfilled" ? news.value : []),
          ...(filings.status === "fulfilled" ? filings.value : []),
        ];

        // Sort by timestamp (newest first)
        alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return alerts;
      },
      3 * 60 * 1000, // Cache 3 minutes
    );

    const sourceCounts = {
      regulatory: allAlerts.filter((a) => a.type === "regulatory").length,
      news: allAlerts.filter((a) => a.type === "news").length,
      filings: allAlerts.filter((a) => a.type === "filing").length,
    };

    return NextResponse.json({
      source: "MineralScope Intelligence Aggregator",
      sources: ["Federal Register", "GDELT Project", "SEC EDGAR"],
      sourceCounts,
      total: allAlerts.length,
      results: allAlerts.slice(0, limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Intelligence feed error: ${message}`, results: [] },
      { status: 502 },
    );
  }
}
