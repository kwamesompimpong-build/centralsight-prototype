import { NextResponse } from "next/server";
import { apiFetch, cachedFetch, buildURL } from "@/lib/api-client";

/**
 * NASA FIRMS (Fire Information for Resource Management System)
 * Free MAP_KEY from https://firms.modaps.eosdis.nasa.gov/api/
 * Falls back to DEMO_KEY when FIRMS_MAP_KEY is not configured.
 * Rate limit: 5,000 transactions per 10 minutes.
 * Returns thermal anomalies (fires, industrial heat) at 375m resolution (VIIRS).
 *
 * GET /api/firms?lat=28.68&lng=115.89&radius=25&days=10
 *
 * Use for detecting:
 *  - Smelter/refinery operational status (persistent thermal signatures)
 *  - Mine expansion (ground clearing fires)
 *  - Facility shutdowns (absence of expected thermal signatures)
 */

interface FIRMSRecord {
    latitude: number;
    longitude: number;
    brightness: number;
    scan: number;
    track: number;
      acq_date: string;
        acq_time: string;
    satellite: string;
    instrument: string;
    confidence: string;
    version: string;
    bright_ti4: number;
    bright_ti5: number;
    frp: number;
    daynight: string;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat") || "28.68";
    const lng = searchParams.get("lng") || "115.89";
    const radius = searchParams.get("radius") || "25"; // km
  const days = searchParams.get("days") || "10";

  // Use configured key, fall back to DEMO_KEY for basic access
  const mapKey = process.env.FIRMS_MAP_KEY || "DEMO_KEY";

  try {
        const data = await cachedFetch(
                `firms:${lat}:${lng}:${radius}:${days}`,
                async () => {
                          const url = buildURL(
                                      `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/${lat},${lng},${radius}/${days}`,
                            {},
                                    );

                  const response = await apiFetch(url.replace("?", ""), { timeout: 20000 });
                          const text = await response.text();

                  // Parse CSV response
                  const lines = text.trim().split("\n");
                          if (lines.length < 2) return [];

                  const headers = lines[0].split(",");
                          return lines.slice(1).map((line) => {
                                      const values = line.split(",");
                                      const record: Record<string, string> = {};
                                      headers.forEach((h, i) => {
                                                    record[h.trim()] = values[i]?.trim() || "";
                                      });
                                      return record as unknown as FIRMSRecord;
                          });
                },
                15 * 60 * 1000, // Cache 15 minutes
                                                          );

      return NextResponse.json({
              source: "NASA FIRMS (VIIRS SNPP)",
              configured: true,
                                                                    center: { lat: parseFloat(lat), lng: parseFloat(lng) },
                                  radiusKm: parseInt(radius),
              days: parseInt(days),
              total: data.length,
              results: data.map((r) => ({
                        lat: r.latitude,
                        lng: r.longitude,
                        brightness: r.bright_ti4 || r.brightness,
                        confidence: r.confidence,
                          date: r.acq_date,
                        time: r.acq_time,
                        satellite: r.satellite,
                        frp: r.frp, // Fire Radiative Power (MW)
                        daynight: r.daynight,
              })),
      });
                                     } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json(
          { error: `Failed to query NASA FIRMS: ${message}`, results: [] },
          { status: 502 },
              );
  }
}
