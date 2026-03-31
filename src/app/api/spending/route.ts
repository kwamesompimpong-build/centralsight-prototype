import { NextResponse } from "next/server";
import { fetchJSON, cachedFetch } from "@/lib/api-client";

/**
 * USASpending.gov API v2
 * No API key required. Daily updates.
 *
 * GET /api/spending?keyword=critical minerals&agency=8900&naics=212299&limit=25
 *
 * Key agency codes:
 *  - 8900: Department of Energy
 *  - 9700: Department of Defense
 *  - 1400: Department of Interior
 *
 * Key NAICS codes for critical minerals:
 *  - 212299: Other Metal Ore Mining (rare earths, lithium, cobalt, antimony, tungsten)
 *  - 212230: Copper, Nickel, Lead, and Zinc Mining
 *  - 331410: Nonferrous Metal Smelting and Refining
 *  - 325180: Basic Inorganic Chemical Manufacturing
 *  - 335911: Storage Battery Manufacturing
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
  results: Array<{
    internal_id: number;
    Award_ID?: string;
    generated_internal_id: string;
    Recipient_Name?: string;
    recipient_name?: string;
    Action_Date?: string;
    action_date?: string;
    Award_Amount?: number;
    award_amount?: number;
    Total_Outlays?: number;
    Awarding_Agency?: string;
    awarding_agency?: string;
    Awarding_Sub_Agency?: string;
    Award_Type?: string;
    award_type?: string;
    Description?: string;
    description?: string;
    def_codes?: string[];
    COVID_IIJA_Spending?: string;
    Last_Date_to_Order?: string;
    Start_Date?: string;
    End_Date?: string;
  }>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "critical minerals";
  const agency = searchParams.get("agency") || "";
  const naics = searchParams.get("naics") || "";
  const limit = parseInt(searchParams.get("limit") || "25");
  const page = parseInt(searchParams.get("page") || "1");
  const awardType = searchParams.get("award_type") || ""; // contracts, grants, loans, etc.

  try {
    const data = await cachedFetch(
      `usaspending:${keyword}:${agency}:${naics}:${page}:${awardType}`,
      async () => {
        const filters: Record<string, unknown> = {
          keywords: [keyword],
        };
        if (agency) {
          filters.agencies = [{
            type: "funding",
            tier: "toptier",
            toptier_agency_identifier: agency,
          }];
        }
        if (naics) {
          filters.naics_codes = { require: [naics] };
        }
        if (awardType) {
          filters.award_type_codes = awardType.split(",");
        }

        return fetchJSON<USASpendingResponse>(
          "https://api.usaspending.gov/api/v2/search/spending_by_award/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filters,
              fields: [
                "Award_ID", "Recipient_Name", "Action_Date",
                "Award_Amount", "Awarding_Agency", "Awarding_Sub_Agency",
                "Award_Type", "Description", "Start_Date", "End_Date",
              ],
              limit,
              page,
              sort: "Award_Amount",
              order: "desc",
              subawards: false,
            }),
            timeout: 30000,
          },
        );
      },
      15 * 60 * 1000,
    );

    return NextResponse.json({
      source: "USASpending.gov",
      keyword,
      total: data.page_metadata.total,
      page: data.page_metadata.page,
      hasNext: data.page_metadata.hasNext,
      results: data.results.map((r) => ({
        awardId: r.Award_ID || r.generated_internal_id,
        recipient: r.Recipient_Name || r.recipient_name || "Unknown",
        actionDate: r.Action_Date || r.action_date || null,
        amount: r.Award_Amount || r.award_amount || 0,
        agency: r.Awarding_Agency || r.awarding_agency || null,
        subAgency: r.Awarding_Sub_Agency || null,
        type: r.Award_Type || r.award_type || null,
        description: r.Description || r.description || null,
        startDate: r.Start_Date || null,
        endDate: r.End_Date || null,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to query USASpending: ${message}`, results: [] },
      { status: 502 },
    );
  }
}
