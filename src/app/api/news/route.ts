import { NextResponse } from "next/server";
import { apiFetch, cachedFetch } from "@/lib/api-client";

/**
 * GDELT Project DOC API — api.gdeltproject.org
 * No API key required. Near real-time (15-minute updates).
 * Increased timeout and retries for serverless reliability.
 *
 * GET /api/news?q=critical minerals supply chain&mode=artlist&maxrecords=50
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

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q") || "critical minerals supply chain";
      const mode = searchParams.get("mode") || "artlist";
      const maxRecords = searchParams.get("maxrecords") || "50";
      const timespan = searchParams.get("timespan") || "7d";

    try {
              const data = await cachedFetch<GDELTResponse>(
                            `gdelt:${query}:${mode}:${timespan}`,
                            async () => {
                                              const params = new URLSearchParams({
                                                                    query,
                                                                    mode,
                                                                    format: "json",
                                                                    maxrecords: maxRecords,
                                                                    timespan,
                                                                    sort: "DateDesc",
                                              });
                                              const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;

                                const response = await apiFetch(url, {
                                                      timeout: 25000,
                                                      retries: 2,
                                });
                                              return response.json() as Promise<GDELTResponse>;
                            },
                            5 * 60 * 1000,
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
