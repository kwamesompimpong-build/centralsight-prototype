import { NextResponse } from "next/server";
import { fetchJSON, cachedFetch, buildURL } from "@/lib/api-client";

/**
 * Consolidated Screening List — trade.gov
 * No API key required. Updated daily at 5 AM EST.
 * Consolidates 11 U.S. government lists: OFAC SDN, BIS Entity List,
 * BIS Denied Persons, UFLPA, and more.
 *
 * GET /api/sanctions?q=Ganfeng&sources=SDN,Entity List
 */

interface CSLResult {
  total: number;
  results: Array<{
    source: string;
    entity_number?: string;
    type: string;
    name: string;
    addresses?: Array<{ country: string; city?: string }>;
    alt_names?: string[];
    ids?: Array<{ type: string; number: string }>;
    programs?: string[];
    remarks?: string;
    start_date?: string;
    end_date?: string;
    source_list_url?: string;
    source_information_url?: string;
  }>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const sources = searchParams.get("sources") || "";

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    const data = await cachedFetch(
      `csl:${query}:${sources}`,
      async () => {
        const url = buildURL("https://api.trade.gov/consolidated_screening_list/v1/search", {
          q: query,
          sources: sources || undefined,
          limit: 50,
        });
        return fetchJSON<CSLResult>(url);
      },
      10 * 60 * 1000, // Cache 10 minutes
    );

    return NextResponse.json({
      source: "Consolidated Screening List (trade.gov)",
      updated: new Date().toISOString(),
      total: data.total,
      results: data.results.map((r) => ({
        source: r.source,
        name: r.name,
        type: r.type,
        country: r.addresses?.[0]?.country || "Unknown",
        programs: r.programs || [],
        altNames: r.alt_names || [],
        remarks: r.remarks || "",
        startDate: r.start_date || null,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to query Consolidated Screening List: ${message}`, results: [] },
      { status: 502 },
    );
  }
}
