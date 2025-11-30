import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Overview",
  description: "A multilingual event discovery dashboard for community events",
};

/**
 * Root layout - minimal wrapper for locale-based layouts
 * @see app/[locale]/layout.tsx for the full layout with providers
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
