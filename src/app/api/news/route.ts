import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/api-client";

/**
 * GDELT Project DOC API — api.gdeltproject.org
 * No API key required. Near real-time (15-minute updates).
 *
 * Uses native fetch with longer timeout for Vercel serverless compatibility.
 * GDELT can be slow to respond; we use generous timeouts and caching.
 *
 * GET /api/news?q=critical minerals supply chain&maxrecords=50&timespan=7d
 */

interface GDELTArticle {
  url: string;
  url_mobile?: string;
  title: string;
  seendate: string;
  socialimage?: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

interface GDELTResponse {
  articles?: GDELTArticle[];
}

export const maxDuration = 30; // Vercel serverless max duration

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "critical minerals supply chain";
  const maxRecords = searchParams.get("maxrecords") || "50";
  const timespan = searchParams.get("timespan") || "7d";

  try {
    const data = await cachedFetch<GDELTResponse>(
      `gdelt:${query}:${timespan}`,
      async () => {
        const params = new URLSearchParams({
          query,
          mode: "artlist",
          format: "json",
          maxrecords: maxRecords,
          timespan,
          sort: "DateDesc",
        });

        const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;

        // Use native fetch with AbortSignal.timeout for better serverless compat
        const response = await fetch(url, {
          headers: {
            "User-Agent": "MineralScope/1.0 (critical-minerals-osint-prototype)",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(25000),
        });

        if (!response.ok) {
          throw new Error(`GDELT HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();

        // GDELT sometimes returns empty or HTML error pages
        if (!text || text.startsWith("<!") || text.startsWith("<html")) {
          return { articles: [] } as GDELTResponse;
        }

        try {
          return JSON.parse(text) as GDELTResponse;
        } catch {
          return { articles: [] } as GDELTResponse;
        }
      },
      5 * 60 * 1000, // Cache 5 minutes
    );

    const articles = data.articles || [];

    return NextResponse.json({
      source: "GDELT Project",
      query,
      timespan,
      total: articles.length,
      results: articles.map((a) => ({
        title: a.title,
        url: a.url,
        publishedAt: a.seendate,
        domain: a.domain,
        language: a.language,
        sourceCountry: a.sourcecountry,
        image: a.socialimage || null,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to query GDELT: ${message}`, results: [] },
      { status: 502 },
    );
  }
}
