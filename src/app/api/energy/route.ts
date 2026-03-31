import { NextResponse } from "next/server";
import { fetchJSON, cachedFetch, buildURL } from "@/lib/api-client";

/**
 * EIA API v2 — api.eia.gov
 * API key is REQUIRED. Register for free at https://www.eia.gov/opendata/register.php
 * Rate limit: ~5 req/sec, ~9,000/hour.
 *
 * GET /api/energy?route=electricity/operating-generator-capacity&frequency=monthly&limit=100
 */

interface EIAResponse {
        response: {
                    total: number;
                    data: Array<Record<string, string | number | null>>;
                    dateFormat: string;
                    frequency: string;
                    description?: string;
        };
}

export async function GET(request: Request) {
        const { searchParams } = new URL(request.url);
        const route = searchParams.get("route") || "electricity/operating-generator-capacity";
        const frequency = searchParams.get("frequency") || "monthly";
        const limit = searchParams.get("limit") || "100";
        const offset = searchParams.get("offset") || "0";
        const sort = searchParams.get("sort") || "";
        const filters = searchParams.get("filters") || "";

    const apiKey = process.env.EIA_API_KEY || "";

    if (!apiKey) {
                return NextResponse.json({
                                source: "EIA API v2",
                                configured: false,
                                error: "EIA_API_KEY environment variable is not set. Get a free key at https://www.eia.gov/opendata/register.php",
                                route,
                                frequency,
                                total: 0,
                                results: [],
                });
    }

    try {
                const data = await cachedFetch(
                                `eia:${route}:${frequency}:${limit}:${offset}:${filters}`,
                                async () => {
                                                    const params: Record<string, string | number | boolean | undefined | null> = {
                                                                            api_key: apiKey,
                                                                            frequency,
                                                                            "data[0]": "value",
                                                                            length: limit,
                                                                            offset,
                                                                            sort: sort ? `[{"column":"period","direction":"${sort}"}]` : undefined,
                                                    };

                                    if (filters) {
                                                            for (const f of filters.split(",")) {
                                                                                        const [key, value] = f.split(":");
                                                                                        if (key && value) {
                                                                                                                        params[`facets[${key}][]`] = value;
                                                                                            }
                                                            }
                                    }

                                    const url = buildURL(`https://api.eia.gov/v2/${route}/data`, params);
                                                    return fetchJSON<EIAResponse>(url, { timeout: 20000 });
                                },
                                30 * 60 * 1000,
                            );

            return NextResponse.json({
                            source: "EIA API v2",
                            configured: true,
                            route,
                            frequency: data.response.frequency,
                            total: data.response.total,
                            description: data.response.description || null,
                            results: data.response.data.slice(0, parseInt(limit)).map((d) => ({
                                                ...d,
                            })),
            });
    } catch (err) {
                const message = err instanceof Error ? err.message : "Unknown error";
                return NextResponse.json(
                    { error: `Failed to query EIA: ${message}`, results: [] },
                    { status: 502 },
                            );
    }
}
