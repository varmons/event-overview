import { Suspense } from "react";
import { RedirectClient } from "./RedirectClient";

export const dynamic = "force-dynamic";

interface RedirectPageProps {
    searchParams: { target?: string };
}

export default function RedirectPage({ searchParams }: RedirectPageProps) {
    const { target } = searchParams;

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
