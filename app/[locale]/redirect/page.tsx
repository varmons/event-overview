import { Suspense } from "react";
import { RedirectClient } from "./RedirectClient";

export const dynamic = "force-dynamic";

interface RedirectPageProps {
  // In Next 15+/16, searchParams is passed as a Promise
  searchParams: Promise<{ target?: string | string[] }>;
}

export default async function RedirectPage({
  searchParams,
}: RedirectPageProps) {
  const params = await searchParams;
  const target = Array.isArray(params?.target)
    ? params.target[0]
    : params?.target;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <RedirectClient target={target ?? undefined} />
    </Suspense>
  );
}
