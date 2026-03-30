import { NextResponse } from "next/server";
import { fetchJSON, cachedFetch, buildURL } from "@/lib/api-client";

/**
 * Federal Register API — federalregister.gov
 * No API key required. JSON output. Daily updates.
 *
 * GET /api/regulatory?q=critical minerals&agencies=interior-department&type=RULE
 */

interface FRDocument {
  title: string;
  type: string;
  abstract?: string;
  document_number: string;
  html_url: string;
  pdf_url?: string;
  publication_date: string;
  agencies: Array<{ name: string; raw_name: string; id: number }>;
  action?: string;
  dates?: string;
  docket_ids?: string[];
  regulation_id_numbers?: Array<{ regulation_id_number: string }>;
  significant?: boolean;
  subtype?: string;
  raw_text_url?: string;
}

interface FRResponse {
  count: number;
  total_pages: number;
  results: FRDocument[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "critical minerals";
  const agencies = searchParams.get("agencies") || "";
  const docType = searchParams.get("type") || "";
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "20";

  try {
    const data = await cachedFetch(
      `fr:${query}:${agencies}:${docType}:${page}`,
      async () => {
        const params: Record<string, string | undefined> = {
          "conditions[term]": query,
          "per_page": perPage,
          "page": page,
          "order": "newest",
        };
        if (agencies) params["conditions[agencies][]"] = agencies;
        if (docType) params["conditions[type][]"] = docType;

        const url = buildURL("https://www.federalregister.gov/api/v1/documents.json", params);
        return fetchJSON<FRResponse>(url);
      },
      15 * 60 * 1000, // Cache 15 minutes
    );

    return NextResponse.json({
      source: "Federal Register API",
      query,
      total: data.count,
      page: Number(page),
      totalPages: data.total_pages,
      results: data.results.map((doc) => ({
        title: doc.title,
        type: doc.type,
        abstract: doc.abstract || null,
        documentNumber: doc.document_number,
        url: doc.html_url,
        pdfUrl: doc.pdf_url || null,
        publicationDate: doc.publication_date,
        agencies: doc.agencies.map((a) => a.name),
        action: doc.action || null,
        significant: doc.significant || false,
        docketIds: doc.docket_ids || [],
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to query Federal Register: ${message}`, results: [] },
      { status: 502 },
    );
  }
}
