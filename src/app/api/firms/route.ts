import { NextResponse } from "next/server";
import { apiFetch, cachedFetch, buildURL } from "@/lib/api-client";

/**
 * NASA FIRMS (Fire Information for Resource Management System)
 * Free MAP_KEY from https://firms.modaps.eosdis.nasa.gov/api/
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
  frp: number; // Fire Radiative Power (MW)
  daynight: string;
  type: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") || "25"; // km
  const days = searchParams.get("days") || "10";
  const source = searchParams.get("source") || "VIIRS_SNPP_NRT";

  const mapKey = process.env.FIRMS_MAP_KEY;

  if (!mapKey) {
    return NextResponse.json({
      source: "NASA FIRMS",
      note: "FIRMS_MAP_KEY not configured. Register free at https://firms.modaps.eosdis.nasa.gov/api/",
      configured: false,
      results: [],
    });
  }

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Query parameters 'lat' and 'lng' are required" },
      { status: 400 },
    );
  }

  try {
    const records = await cachedFetch(
      `firms:${lat}:${lng}:${radius}:${days}:${source}`,
      async () => {
        // FIRMS area endpoint: returns CSV data for a circular area
        const url = buildURL(
          `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/${source}/${lng},${lat},${radius}/${days}`,
          {},
        );

        const response = await apiFetch(url.replace(/\?$/, ""), { timeout: 20000 });
        const csvText = await response.text();

        // Parse CSV
        const lines = csvText.trim().split("\n");
        if (lines.length < 2) return [];

        const headers = lines[0].split(",");
        return lines.slice(1).map((line) => {
          const values = line.split(",");
          const record: Record<string, string> = {};
          headers.forEach((h, i) => {
            record[h.trim()] = values[i]?.trim() || "";
          });
          return {
            latitude: parseFloat(record.latitude),
            longitude: parseFloat(record.longitude),
            brightness: parseFloat(record.bright_ti4 || record.brightness || "0"),
            acq_date: record.acq_date,
            acq_time: record.acq_time,
            satellite: record.satellite,
            confidence: record.confidence,
            frp: parseFloat(record.frp || "0"),
            daynight: record.daynight,
            type: parseInt(record.type || "0"),
          } as FIRMSRecord;
        });
      },
      30 * 60 * 1000, // Cache 30 minutes
    );

    // Analyze thermal patterns
    const highConfidence = records.filter(
      (r) => r.confidence === "high" || r.confidence === "h" || parseFloat(r.confidence) >= 80,
    );
    const avgFRP = records.length > 0
      ? records.reduce((sum, r) => sum + r.frp, 0) / records.length
      : 0;

    return NextResponse.json({
      source: "NASA FIRMS (VIIRS)",
      configured: true,
      location: { lat: parseFloat(lat), lng: parseFloat(lng), radiusKm: parseInt(radius) },
      period: `${days} days`,
      total: records.length,
      highConfidence: highConfidence.length,
      averageFRP: Math.round(avgFRP * 100) / 100,
      thermalStatus: records.length > 5 ? "active" : records.length > 0 ? "low-activity" : "no-detections",
      results: records.slice(0, 100), // Cap at 100 for response size
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to query NASA FIRMS: ${message}`, results: [] },
      { status: 502 },
    );
  }
}
