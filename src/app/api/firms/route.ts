import { NextResponse } from "next/server";
import { apiFetch, cachedFetch } from "@/lib/api-client";

/**
 * NASA FIRMS (Fire Information for Resource Management System)
 * Free MAP_KEY from https://firms.modaps.eosdis.nasa.gov/api/
 * FIRMS does NOT support DEMO_KEY — a real MAP_KEY is required.
 * Rate limit: 5,000 transactions per 10 minutes.
 * Returns thermal anomalies (fires, industrial heat) at 375m resolution (VIIRS).
 *
 * The Area API expects a bounding box [west,south,east,north] and max 5 days.
 * We convert lat/lng/radius to a bounding box automatically.
 *
 * GET /api/firms?lat=28.68&lng=115.89&radius=25&days=5
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

/**
 * Convert center lat/lng + radius (km) to a bounding box [west, south, east, north].
 */
function toBoundingBox(lat: number, lng: number, radiusKm: number) {
        const R = 6371; // Earth radius in km
    const dLat = (radiusKm / R) * (180 / Math.PI);
        const dLng = dLat / Math.cos((lat * Math.PI) / 180);
        return {
                    west: (lng - dLng).toFixed(4),
                    south: (lat - dLat).toFixed(4),
                    east: (lng + dLng).toFixed(4),
                    north: (lat + dLat).toFixed(4),
        };
}

export async function GET(request: Request) {
        const { searchParams } = new URL(request.url);
        const lat = searchParams.get("lat") || "28.68";
        const lng = searchParams.get("lng") || "115.89";
        const radius = searchParams.get("radius") || "25"; // km
    const days = searchParams.get("days") || "5";

    // Clamp days to FIRMS maximum of 5
    const clampedDays = Math.min(Math.max(parseInt(days) || 1, 1), 5);

    const mapKey = process.env.FIRMS_MAP_KEY || "";

    if (!mapKey) {
                return NextResponse.json({
                                source: "NASA FIRMS (VIIRS SNPP)",
                                configured: false,
                                error: "FIRMS_MAP_KEY environment variable is not set. Get a free key at https://firms.modaps.eosdis.nasa.gov/api/",
                                center: { lat: parseFloat(lat), lng: parseFloat(lng) },
                                radiusKm: parseInt(radius),
                                days: clampedDays,
                                total: 0,
                                results: [],
                });
    }

    try {
                const bbox = toBoundingBox(parseFloat(lat), parseFloat(lng), parseFloat(radius));

            const data = await cachedFetch<FIRMSRecord[]>(
                            `firms:${lat}:${lng}:${radius}:${clampedDays}`,
                            async () => {
                                                // FIRMS Area API: /api/area/csv/{MAP_KEY}/{SOURCE}/{west},{south},{east},{north}/{DAY_RANGE}
                                const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/${bbox.west},${bbox.south},${bbox.east},${bbox.north}/${clampedDays}`;

                                const response = await apiFetch(url, { timeout: 20000 });
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
                            days: clampedDays,
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
