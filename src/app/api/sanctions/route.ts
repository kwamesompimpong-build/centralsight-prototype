import { NextResponse } from "next/server";
import { fetchJSON, cachedFetch, buildURL } from "@/lib/api-client";

/**
 * Consolidated Screening List -- data.trade.gov
 * Requires a subscription key from https://developer.trade.gov/
 * Set CSL_API_KEY env var with your subscription key.
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
            }>;
}

export async function GET(request: Request) {
            const { searchParams } = new URL(request.url);
            const query = searchParams.get("q") || "";
            const sources = searchParams.get("sources") || "";

    if (!query) {
                    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    const apiKey = process.env.CSL_API_KEY || "";

    if (!apiKey) {
                    return NextResponse.json({
                                        source: "Consolidated Screening List (trade.gov)",
                                        configured: false,
                                        error: "CSL_API_KEY not set. Get a key at https://developer.trade.gov/",
                                        total: 0,
                                        results: [],
                    });
    }

    try {
                    const data = await cachedFetch(
                                        `csl:${query}:${sources}`,
                                        async () => {
                                                                const url = buildURL("https://data.trade.gov/consolidated_screening_list/v1/search", {
                                                                                            name: query,
                                                                                            fuzzy_name: "true",
                                                                                            sources: sources || undefined,
                                                                                            size: 50,
                                                                });
                                                                return fetchJSON<CSLResult>(url, {
                                                                                            headers: { "Ocp-Apim-Subscription-Key": apiKey },
                                                                });
                                        },
                                        10 * 60 * 1000,
                                    );

                return NextResponse.json({
                                    source: "Consolidated Screening List (trade.gov)",
                                    configured: true,
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
                            { error: `Failed to query CSL: ${message}`, results: [] },
                            { status: 502 },
                                    );
    }
}
