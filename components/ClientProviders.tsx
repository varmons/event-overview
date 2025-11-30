/**
 * @fileoverview Client-side providers wrapper component.
 * Wraps the application with error boundary and performance monitoring.
 */

"use client";

import { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { WebVitals } from "./WebVitals";

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * Client-side providers that wrap the application
 * @description Includes error boundary and web vitals monitoring
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <WebVitals enabled={process.env.NODE_ENV === "production"} />
      {children}
    </ErrorBoundary>
  );
}
