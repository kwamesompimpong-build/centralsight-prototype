import { NextResponse } from "next/server";
import { fetchJSON, cachedFetch } from "@/lib/api-client";

/**
 * USASpending.gov API v2
 * No API key required. Daily updates.
 *
 * The spending_by_award endpoint requires award_type_codes from ONE group only.
 * Groups: contracts (A,B,C,D), grants (02,03,04,05,06), direct_payments (10),
 *         loans (07,08), idvs (IDV_A,IDV_B,...), other (11).
 *
 * Use `group` param to pick: "contracts" (default), "grants", "direct_payments",
 * "loans", "idvs", "other", or "all" to query contracts+grants in parallel.
 *
 * GET /api/spending?keyword=critical minerals&agency=8900&naics=212299&limit=25&group=all
 */

interface USASpendingResponse {
          page_metadata: {
                      page: number;
                      total: number;
                      limit: number;
                      next: number | null;
                      previous: number | null;
                      hasNext: boolean;
                      hasPrevious: boolean;
          };
          results: Array<Record<string, unknown>>;
}

const AWARD_TYPE_GROUPS: Record<string, string[]> = {
          contracts: ["A", "B", "C", "D"],
          grants: ["02", "03", "04", "05", "06"],
          direct_payments: ["10"],
          loans: ["07", "08"],
          idvs: ["IDV_A", "IDV_B", "IDV_B_A", "IDV_B_B", "IDV_B_C", "IDV_C", "IDV_D", "IDV_E"],
          other: ["11"],
};

async function fetchAwards(
          keyword: string,
          awardTypeCodes: string[],
          agency: string,
          naics: string,
          limit: number,
          page: number,
        ): Promise<USASpendingResponse> {
          const filters: Record<string, unknown> = {
                      keywords: [keyword],
                      time_period: [
                              {
                                              start_date: "2020-01-01",
                                              end_date: new Date().toISOString().split("T")[0],
                              },
                                  ],
                      award_type_codes: awardTypeCodes,
          };

  if (agency) {
              filters.agencies = [
                      {
                                      type: "funding",
                                      tier: "toptier",
                                      toptier_agency_identifier: agency,
                      },
                          ];
  }

  if (naics) {
              filters.naics_codes = { require: [naics] };
  }

  return fetchJSON<USASpendingResponse>(
              "https://api.usaspending.gov/api/v2/search/spending_by_award/",
          {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                                        filters,
                                        fields: [
                                                          "Award ID",
                                                          "Recipient Name",
                                                          "Action Date",
                                                          "Award Amount",
                                                          "Awarding Agency",
                                                          "Awarding Sub Agency",
                                                          "Award Type",
                                                          "Description",
                                                          "Start Date",
                                                          "End Date",
                                                        ],
                                        limit,
                                        page,
                                        sort: "Award Amount",
                                        order: "desc",
                                        subawards: false,
                        }),
                        timeout: 30000,
          },
            );
}

export async function GET(request: Request) {
          const { searchParams } = new URL(request.url);
          const keyword = searchParams.get("keyword") || "critical minerals";
          const agency = searchParams.get("agency") || "";
          const naics = searchParams.get("naics") || "";
          const limit = parseInt(searchParams.get("limit") || "25");
          const page = parseInt(searchParams.get("page") || "1");
          const group = searchParams.get("group") || "contracts";

  try {
              if (group === "all") {
                            // Query contracts and grants in parallel, merge results
                const data = await cachedFetch(
                                `usaspending:all:${keyword}:${agency}:${naics}:${page}`,
                                async () => {
                                                  const [contracts, grants] = await Promise.allSettled([
                                                                      fetchAwards(keyword, AWARD_TYPE_GROUPS.contracts, agency, naics, limit, page),
                                                                      fetchAwards(keyword, AWARD_TYPE_GROUPS.grants, agency, naics, limit, page),
                                                                    ]);

                                  const contractResults =
                                                      contracts.status === "fulfilled" ? contracts.value.results : [];
                                                  const grantResults =
                                                                      grants.status === "fulfilled" ? grants.value.results : [];
                                                  const contractTotal =
                                                                      contracts.status === "fulfilled" ? contracts.value.page_metadata.total : 0;
                                                  const grantTotal =
                                                                      grants.status === "fulfilled" ? grants.value.page_metadata.total : 0;

                                  return {
                                                      page_metadata: {
                                                                            page,
                                                                            total: contractTotal + grantTotal,
                                                                            limit,
                                                                            next: null,
                                                                            previous: null,
                                                                            hasNext: false,
                                                                            hasPrevious: page > 1,
                                                      },
                                                      results: [...contractResults, ...grantResults].slice(0, limit),
                                  } as USASpendingResponse;
                                },
                                15 * 60 * 1000,
                              );

                return NextResponse.json({
                                source: "USASpending.gov",
                                keyword,
                                group: "all (contracts + grants)",
                                total: data.page_metadata.total,
                                page: data.page_metadata.page,
                                hasNext: data.page_metadata.hasNext,
                                results: formatResults(data.results),
                });
              }

            // Single group query
            const codes = AWARD_TYPE_GROUPS[group] || AWARD_TYPE_GROUPS.contracts;

            const data = await cachedFetch(
                          `usaspending:${group}:${keyword}:${agency}:${naics}:${page}`,
                          async () => fetchAwards(keyword, codes, agency, naics, limit, page),
                          15 * 60 * 1000,
                        );

            return NextResponse.json({
                          source: "USASpending.gov",
                          keyword,
                          group,
                          total: data.page_metadata.total,
                          page: data.page_metadata.page,
                          hasNext: data.page_metadata.hasNext,
                          results: formatResults(data.results),
            });
  } catch (err) {
              const message = err instanceof Error ? err.message : "Unknown error";
              return NextResponse.json(
                      { error: `Failed to query USASpending: ${message}`, results: [] },
                      { status: 502 },
                          );
  }
}

function formatResults(results: Array<Record<string, unknown>>) {
          return results.map((r) => ({
                      awardId: r["Award ID"] || null,
                      recipient: r["Recipient Name"] || "Unknown",
                      actionDate: r["Action Date"] || null,
                      amount: r["Award Amount"] || 0,
                      agency: r["Awarding Agency"] || null,
                      subAgency: r["Awarding Sub Agency"] || null,
                      type: r["Award Type"] || null,
                      description: r["Description"] || null,
                      startDate: r["Start Date"] || null,
                      endDate: r["End Date"] || null,
          }));
}
