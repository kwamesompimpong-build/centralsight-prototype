import { NextResponse } from "next/server";
import { fetchJSON, cachedFetch, buildURL } from "@/lib/api-client";

/**
 * Global Fishing Watch API — gateway.api.globalfishingwatch.org
 * Free tier: 50,000 requests/day.
 * Covers all vessel types including bulk carriers.
 * Data from 2012 to ~96 hours ago.
 *
 * GET /api/vessels?q=bulk carrier&limit=20
 * GET /api/vessels?mmsi=123456789
 */

interface GFWVessel {
  id: string;
  name?: string;
  mmsi?: string;
  imo?: string;
  callsign?: string;
  flag?: string;
  shipType?: string;
  length?: number;
  tonnage?: number;
}

interface GFWSearchResponse {
  entries: GFWVessel[];
  total: number;
  limit: number;
  offset: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const mmsi = searchParams.get("mmsi") || "";
  const limit = searchParams.get("limit") || "20";

  const token = process.env.GFW_API_TOKEN;

  if (!token) {
    return NextResponse.json({
      source: "Global Fishing Watch API",
      note: "GFW_API_TOKEN not configured. Register free at https://globalfishingwatch.org/our-apis/",
      configured: false,
      results: [],
    });
  }

  if (!query && !mmsi) {
    return NextResponse.json(
      { error: "Query parameter 'q' or 'mmsi' is required" },
      { status: 400 },
    );
  }

  try {
    const data = await cachedFetch(
      `gfw:${query}:${mmsi}:${limit}`,
      async () => {
        const searchQuery = mmsi ? `mmsi:${mmsi}` : query;
        const url = buildURL("https://gateway.api.globalfishingwatch.org/v3/vessels/search", {
          query: searchQuery,
          limit: limit,
          datasets: "public-global-vessel-identity:latest",
        });

        return fetchJSON<GFWSearchResponse>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 20000,
        });
      },
      15 * 60 * 1000,
    );

    return NextResponse.json({
      source: "Global Fishing Watch API",
      configured: true,
      total: data.total,
      results: data.entries.map((v) => ({
        id: v.id,
        name: v.name || "Unknown",
        mmsi: v.mmsi || null,
        imo: v.imo || null,
        callsign: v.callsign || null,
        flag: v.flag || null,
        type: v.shipType || null,
        length: v.length || null,
        tonnage: v.tonnage || null,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to query Global Fishing Watch: ${message}`, results: [] },
      { status: 502 },
    );
  }
}
