/**
 * @fileoverview Language switcher dropdown component.
 */

"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { locales } from "@/i18n/config";

// =============================================================================
// Constants
// =============================================================================

/** Display names for supported locales */
const languageNames: Record<string, string> = {
  en: "English",
  zh: "中文",
  ja: "日本語",
};

const languages = locales.map((code) => ({
  code,
  name: languageNames[code] ?? code.toUpperCase(),
}));

// =============================================================================
// Component
// =============================================================================

/** Dropdown for switching between supported languages */
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find((lang) => lang.code === locale);

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    startTransition(() => {
      const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
      router.push(`/${newLocale}${pathWithoutLocale}`);
      setIsOpen(false);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLang?.name}</span>
        <span className="sr-only sm:hidden">{currentLang?.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                disabled={isPending}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  lang.code === locale
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                } ${isPending ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
