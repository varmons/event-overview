/**
 * @fileoverview Web Vitals performance monitoring component.
 * Reports Core Web Vitals metrics for performance analysis.
 */

"use client";

import { useEffect } from "react";

// =============================================================================
// Types
// =============================================================================

interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  entries: PerformanceEntry[];
  navigationType: string;
}

type ReportHandler = (metric: WebVitalsMetric) => void;

// =============================================================================
// Configuration
// =============================================================================

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Default handler that logs metrics to console in development
 */
const defaultReportHandler: ReportHandler = (metric) => {
  if (isDevelopment) {
    const color =
      metric.rating === "good"
        ? "green"
        : metric.rating === "needs-improvement"
          ? "orange"
          : "red";
    console.log(
      `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }
};

// =============================================================================
// Component
// =============================================================================

interface WebVitalsProps {
  /** Custom handler for reporting metrics */
  onReport?: ReportHandler;
  /** Enable/disable reporting */
  enabled?: boolean;
}

/**
 * Web Vitals monitoring component
 * @description Automatically tracks CLS, FID, FCP, LCP, and TTFB
 */
export function WebVitals({
  onReport = defaultReportHandler,
  enabled = true,
}: WebVitalsProps) {
  useEffect(() => {
    if (!enabled) return;

    const reportWebVitals = async () => {
      try {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import(
          "web-vitals"
        );

        // Core Web Vitals (CLS, INP, LCP) + supplemental (FCP, TTFB)
        // Note: INP replaced FID as a Core Web Vital in March 2024
        onCLS(onReport);
        onINP(onReport);
        onFCP(onReport);
        onLCP(onReport);
        onTTFB(onReport);
      } catch (error) {
        // web-vitals not available
        if (isDevelopment) {
          console.warn("[Web Vitals] Failed to load web-vitals library:", error);
        }
      }
    };

    reportWebVitals();
  }, [enabled, onReport]);

  return null;
}

// =============================================================================
// Analytics Integration Helper
// =============================================================================

/**
 * Send Web Vitals to an analytics endpoint
 * @param metric - The web vital metric to send
 * @param endpoint - The analytics endpoint URL
 */
export async function sendToAnalytics(
  metric: WebVitalsMetric,
  endpoint: string
): Promise<void> {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
  });

  // Use `navigator.sendBeacon()` if available
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, body);
  } else {
    await fetch(endpoint, {
      body,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  }
}
