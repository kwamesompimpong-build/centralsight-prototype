—import { NextResponse } from "next/server";
import { fetchJSON, cachedFetch, buildURL } from "@/lib/api-client";

/**
 * UN Comtrade API — comtradeapi.un.org
 * Free tier: 500 calls/day, 100K records/call.
 * Requires subscription key from https://comtradedeveloper.un.org/
 *
 * GET /api/trade?hs=2836.91&reporter=842&partner=156&period=2024&flow=M
 *
 * Key HS codes for critical minerals:
 *  - 283691: Lithium carbonate
 *  - 282520: Lithium hydroxide
 *  - 284610: Cerium compounds
 *  - 260500: Cobalt ores
 *  - 250410: Natural graphite powder
 *  - 260400: Nickel ores
 *  - 811292: Gallium unwrought
 */

// Comtrade HS code mappings for critical minerals
export const MINERAL_HS_CODES: Record<string, { codes: string[]; label: string }> = {
  lithium: { codes: ["283691", "282520"], label: "Lithium (carbonate + hydroxide)" },
  "rare-earth": { codes: ["284610", "284690", "280530"], label: "Rare Earth Elements" },
  cobalt: { codes: ["260500", "282200", "810520"], label: "Cobalt (ores + oxides + unwrought)" },
  nickel: { codes: ["260400", "750110", "750210"], label: "Nickel (ores + mattes + refined)" },
  graphite: { codes: ["250410", "250490", "380110"], label: "Graphite (natural + synthetic)" },
  copper: { codes: ["260300", "740311"], label: "Copper (ores + refined cathodes)" },
  tungsten: { codes: ["261100", "810110"], label: "Tungsten (ores + powders)" },
  antimony: { codes: ["261710", "811010"], label: "Antimony (ores + unwrought)" },
  gallium: { codes: ["811292", "381800"], label: "Gallium (unwrought + GaAs wafers)" },
  germanium: { codes: ["811299", "282560"], label: "Germanium (unwrought + oxides)" },
};

interface ComtradeRecord {
  reporterCode: number;
  reporterDesc: string;
  partnerCode: number;
  partnerDesc: string;
  cmdCode: string;
  cmdDesc: string;
  flowCode: string;
  flowDesc: string;
  period: number;
  primaryValue: number;
  netWgt?: number;
  qty?: number;
  qtyUnitAbbr?: string;
  isOriginalClassification: boolean;
}

interface ComtradeResponse {
  elapsedTime: string;
  count: number;
  data: ComtradeRecord[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hs = searchParams.get("hs") || "283691"; // Default: lithium carbonate
  const reporter = searchParams.get("reporter") || "842"; // Default: USA (842)
  const partner = searchParams.get("partner") || ""; // All partners if empty
  const period = searchParams.get("period") || "2024";
  const flow = searchParams.get("flow") || "M"; // M=imports, X=exports
  const mineral = searchParams.get("mineral") || ""; // Shortcut to use mineral name

  const apiKey = process.env.COMTRADE_API_KEY;

  // If mineral name provided, look up HS codes
  let hsCodes = hs;
  if (mineral && MINERAL_HS_CODES[mineral]) {
    hsCodes = MINERAL_HS_CODES[mineral].codes.join(",");
  }

  if (!apiKey) {
    // Return sample structure without real data
    return NextResponse.json({
      source: "UN Comtrade API",
      note: "COMTRADE_API_KEY not configured. Register free at https://comtradedeveloper.un.org/",
      configured: false,
      hsCodes: hsCodes.split(","),
      results: [],
    });
  }

  try {
    const data = await cachedFetch(
      `comtrade:${hsCodes}:${reporter}:${partner}:${period}:${flow}`,
      async () => {
        const url = buildURL("https://comtrade.un.org/api/get", {
          type: "C", // Commodity
          freq: "A", // Annual
          px: "HS",
          ps: period,
          r: reporter,
          p: partner || "all",
          cc: hsCodes,
          rg: flow === "M" ? "1" : "2", // 1=imports, 2=exports
          max: 500,
          fmt: "json",
        });

        return fetchJSON<ComtradeResponse>(url, {
          headers: {
            "Ocp-Apim-Subscription-Key": apiKey,
          },
          timeout: 30000,
        });
      },
      60 * 60 * 1000, // Cache 1 hour (trade data is monthly at best)
    );

    return NextResponse.json({
      source: "UN Comtrade API",
      configured: true,
      period,
      flow: flow === "M" ? "imports" : "exports",
      hsCodes: hsCodes.split(","),
      total: data.count,
      results: data.data.map((r) => ({
        reporter: r.reporterDesc,
        reporterCode: r.reporterCode,
        partner: r.partnerDesc,
        partnerCode: r.partnerCode,
        commodity: r.cmdDesc,
        hsCode: r.cmdCode,
        period: r.period,
        value: r.primaryValue,
        netWeight: r.netWgt || null,
        quantity: r.qty || null,
        quantityUnit: r.qtyUnitAbbr || null,
        flow: r.flowDesc,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to query UN Comtrade: ${message}`, results: [] },
      { status: 502 },
    );
  }
}
