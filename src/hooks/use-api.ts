"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic hook for fetching data from our API routes.
 * Handles loading, error states, and optional polling.
 */
interface UseApiOptions {
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean;
  /** Polling interval in ms (0 = no polling, default: 0) */
  pollInterval?: number;
  /** Cache key prefix for deduplication */
  cacheKey?: string;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useApi<T>(url: string, options: UseApiOptions = {}): UseApiResult<T> {
  const { autoFetch = true, pollInterval = 0 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      if (!controller.signal.aborted) {
        setData(json);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    if (autoFetch) fetchData();
    return () => abortRef.current?.abort();
  }, [autoFetch, fetchData]);

  useEffect(() => {
    if (pollInterval <= 0) return;
    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, fetchData]);

  return { data, loading, error, refetch: fetchData, lastUpdated };
}

// ── Typed hooks for specific API routes ──────────────────────

export interface IntelAlert {
  id: string;
  timestamp: string;
  type: "regulatory" | "news" | "filing" | "sanctions" | "satellite" | "trade-anomaly" | "ownership-change";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  source: string;
  sourceUrl: string | null;
  entities: string[];
  tags: string[];
}

export interface IntelFeedResponse {
  source: string;
  sources: string[];
  sourceCounts: { regulatory: number; news: number; filings: number };
  total: number;
  results: IntelAlert[];
  error?: string;
}

export function useIntelFeed(limit = 30) {
  return useApi<IntelFeedResponse>(`/api/intel?limit=${limit}`, {
    pollInterval: 3 * 60 * 1000, // Poll every 3 minutes
  });
}

export interface SanctionsResult {
  source: string;
  name: string;
  type: string;
  country: string;
  programs: string[];
  altNames: string[];
  remarks: string;
  startDate: string | null;
}

export interface SanctionsResponse {
  source: string;
  total: number;
  results: SanctionsResult[];
  error?: string;
}

export function useSanctionsSearch(query: string) {
  return useApi<SanctionsResponse>(
    `/api/sanctions?q=${encodeURIComponent(query)}`,
    { autoFetch: query.length > 0 },
  );
}

export interface RegulatoryDoc {
  title: string;
  type: string;
  abstract: string | null;
  documentNumber: string;
  url: string;
  pdfUrl: string | null;
  publicationDate: string;
  agencies: string[];
  action: string | null;
  significant: boolean;
  docketIds: string[];
}

export interface RegulatoryResponse {
  source: string;
  query: string;
  total: number;
  page: number;
  totalPages: number;
  results: RegulatoryDoc[];
  error?: string;
}

export function useRegulatoryFeed(query = "critical minerals") {
  return useApi<RegulatoryResponse>(
    `/api/regulatory?q=${encodeURIComponent(query)}&per_page=20`,
    { pollInterval: 15 * 60 * 1000 },
  );
}

export interface FilingResult {
  id: string;
  score: number;
  entityName: string;
  filingType: string;
  fileDate: string;
  periodOfReport: string | null;
  fileNumbers: string[];
  description: string | null;
  location: string | null;
  entityId: string;
  url: string;
}

export interface FilingsResponse {
  source: string;
  query: string;
  total: number;
  results: FilingResult[];
  error?: string;
}

export function useFilingsSearch(query = '"critical minerals"') {
  return useApi<FilingsResponse>(
    `/api/filings?q=${encodeURIComponent(query)}`,
  );
}

export interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  domain: string;
  language: string;
  sourceCountry: string;
  image: string | null;
}

export interface NewsResponse {
  source: string;
  query: string;
  total: number;
  results: NewsArticle[];
  error?: string;
}

export function useNewsFeed(query = '"critical minerals" "supply chain"') {
  return useApi<NewsResponse>(
    `/api/news?q=${encodeURIComponent(query)}&timespan=7d`,
    { pollInterval: 5 * 60 * 1000 },
  );
}

export interface TradeRecord {
  reporter: string;
  reporterCode: number;
  partner: string;
  partnerCode: number;
  commodity: string;
  hsCode: string;
  period: number;
  value: number;
  netWeight: number | null;
  quantity: number | null;
  quantityUnit: string | null;
  flow: string;
}

export interface TradeResponse {
  source: string;
  configured: boolean;
  period: string;
  flow: string;
  hsCodes: string[];
  total: number;
  results: TradeRecord[];
  note?: string;
  error?: string;
}

export function useTradeData(mineral: string, reporter = "842", period = "2024") {
  return useApi<TradeResponse>(
    `/api/trade?mineral=${encodeURIComponent(mineral)}&reporter=${reporter}&period=${period}`,
  );
}

export interface FIRMSResult {
  latitude: number;
  longitude: number;
  brightness: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: string;
  frp: number;
  daynight: string;
  type: number;
}

export interface FIRMSResponse {
  source: string;
  configured: boolean;
  location: { lat: number; lng: number; radiusKm: number };
  period: string;
  total: number;
  highConfidence: number;
  averageFRP: number;
  thermalStatus: string;
  results: FIRMSResult[];
  note?: string;
  error?: string;
}

export function useFIRMS(lat: number, lng: number, radiusKm = 25, days = 10) {
  return useApi<FIRMSResponse>(
    `/api/firms?lat=${lat}&lng=${lng}&radius=${radiusKm}&days=${days}`,
  );
}

export interface SpendingResult {
  awardId: string;
  recipient: string;
  actionDate: string | null;
  amount: number;
  agency: string | null;
  subAgency: string | null;
  type: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface SpendingResponse {
  source: string;
  keyword: string;
  total: number;
  page: number;
  hasNext: boolean;
  results: SpendingResult[];
  error?: string;
}

export function useSpending(keyword = "critical minerals") {
  return useApi<SpendingResponse>(
    `/api/spending?keyword=${encodeURIComponent(keyword)}`,
  );
}
