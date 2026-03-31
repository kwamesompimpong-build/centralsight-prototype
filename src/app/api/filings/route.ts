import { NextResponse } from "next/server";
import { fetchJSON, cachedFetch, buildURL } from "@/lib/api-client";

/**
 * SEC EDGAR Full-Text Search — efts.sec.gov
 * No API key required. Rate limit: 10 req/sec.
 * Requires User-Agent header.
 *
 * GET /api/filings?q=critical minerals&forms=10-K,10-Q&dateRange=2024-01-01,2026-12-31
 */

interface EDGARHit {
  _id: string;
  _source: {
    file_date: string;
    period_of_report?: string;
    entity_name: string;
    file_num: string[];
    file_type: string;
    file_description?: string;
    display_date_filed: string;
    entity_id: string;
    biz_locations?: string;
    biz_phone?: string;
    inc_states?: string;
  };
  _score: number;
}

interface EDGARResponse {
  hits: {
    hits: EDGARHit[];
    total: { value: number };
  };
  query: { q: string; forms: string };
}
import { NextResponse } from "next/server";
import { fetchJSON, cachedFetch, buildURL } from "@/lib/api-client";

/**
 * SEC EDGAR Full-Text Search — efts.sec.gov
 * No API key required. Rate limit: 10 req/sec.
 * Requires User-Agent header.
 *
 * GET /api/filings?q=critical minerals&forms=10-K,10-Q&dateRange=2024-01-01,2026-12-31
 */

interface EDGARHit {
  _id: string;
  _source: {
    file_date: string;
    period_of_report?: string;
    entity_name: string;
    file_num: string[];
    file_type: string;
    file_description?: string;
    display_date_filed: string;
    entity_id: string;
    biz_locations?: string;
    biz_phone?: string;
    inc_states?: string;
  };
  _score: number;
}

interface EDGARResponse {
  hits: {
    hits: EDGARHit[];
    total: { value: number };
  };
  query: { q: string; forms: string };
}

/**
 * Build a proper EDGAR filing URL from the hit _id and entity_id.
 * _id format: "0001213900-26-024933:ea028050001ex99-2.htm"
 * entity_id is the CIK number (e.g., "1234567")
 *
 * The correct URL format is:
 * https://www.sec.gov/Archives/edgar/data/{CIK}/{accession-no-dashes}/{filename}
 */
function buildEdgarUrl(hit: EDGARHit): string {
  const id = hit._id;
  const entityId = hit._source.entity_id;

  // Split _id into accession number and filename
  const colonIdx = id.indexOf(":");
  if (colonIdx === -1) {
    // Fallback: link to EDGAR search for this entity
    return `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${entityId}&type=${hit._source.file_type}&dateb=&owner=include&count=40`;
  }

  const accessionNumber = id.substring(0, colonIdx);
  const filename = id.substring(colonIdx + 1);
  const accessionNoDashes = accessionNumber.replace(/-/g, "");

  if (entityId) {
    return `https://www.sec.gov/Archives/edgar/data/${entityId}/${accessionNoDashes}/${filename}`;
  }

  // If no entity_id, link to the filing index page
  return `https://www.sec.gov/Archives/edgar/data/${accessionNoDashes}/${filename}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || '"critical minerals"';
  const forms = searchParams.get("forms") || "10-K,10-Q,8-K";
  const dateRange = searchParams.get("dateRange") || "";
  const start = searchParams.get("start") || "0";

  try {
    const data = await cachedFetch(
      `edgar:${query}:${forms}:${dateRange}:${start}`,
      async () => {
        const params: Record<string, string | undefined> = {
          q: query,
          forms: forms,
          from: start,
        };

        if (dateRange) {
          const [startDate, endDate] = dateRange.split(",");
          params["startdt"] = startDate;
          params["enddt"] = endDate;
        }

        const url = buildURL("https://efts.sec.gov/LATEST/search-index", params);

        return fetchJSON<EDGARResponse>(url, {
          headers: {
            "User-Agent":
              "MineralScope/1.0 (critical-minerals-osint; admin@mineralscope.dev)",
            Accept: "application/json",
          },
        });
      },
      10 * 60 * 1000,
    );

    return NextResponse.json({
      source: "SEC EDGAR Full-Text Search",
      query,
      total: data.hits.total.value,
      results: data.hits.hits.map((hit) => ({
        id: hit._id,
        score: hit._score,
        entityName: hit._source.entity_name,
        filingType: hit._source.file_type,
        fileDate: hit._source.display_date_filed || hit._source.file_date,
        periodOfReport: hit._source.period_of_report || null,
        fileNumbers: hit._source.file_num,
        description: hit._source.file_description || null,
        location: hit._source.biz_locations || null,
        entityId: hit._source.entity_id,
        url: buildEdgarUrl(hit),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to query SEC EDGAR: ${message}`, results: [] },
      { status: 502 },
    );
  }
}
