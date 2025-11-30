"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle, ExternalLink, ArrowLeft } from "lucide-react";

interface RedirectClientProps {
  target?: string;
}

export function RedirectClient({ target }: RedirectClientProps) {
  const t = useTranslations("redirect");
  const locale = useLocale();
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined") {
      const { history, location, document } = window;
      const referrer = document.referrer;

      // If we have real history, try a native back first
      if (history.length > 1) {
        router.back();
        return;
      }

      // If opened in a new tab (no history) but referrer is same-origin, push back to it
      if (referrer) {
        try {
          const refUrl = new URL(referrer);
          if (refUrl.origin === location.origin) {
            router.push(refUrl.pathname + refUrl.search + refUrl.hash);
            return;
          }
        } catch {
          // ignore parsing issues and fall back to home
        }
      }
    }

    // Fallback: send user to the locale home
    router.push(`/${locale}`);
  };

  const { isValid, hostname } = useMemo(() => {
    if (!target) return { isValid: false, hostname: "" };
    try {
      const url = new URL(target);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return { isValid: true, hostname: url.hostname };
      }
    } catch {
      // ignore invalid urls
    }
    return { isValid: false, hostname: "" };
  }, [target]);

  const handleContinue = () => {
    if (target && isValid) {
      window.location.href = target;
    }
  };

  if (!target || !isValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {t("invalid.title")}
          </h1>
          <p className="text-gray-600">{t("invalid.description")}</p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 w-full"
          >
            {t("invalid.returnHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
          <ExternalLink className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {t("leaving")}
          </h1>
          <p className="text-gray-600">{t("description")}</p>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 break-all">
            <p className="font-mono text-sm text-blue-600 font-medium">
              {hostname}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleContinue}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {t("continue")}
          </button>
          <button
            onClick={handleGoBack}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("goBack")}
          </button>
        </div>
        <p className="text-xs text-gray-400">{t("warning")}</p>
      </div>
    </div>
  );
}
