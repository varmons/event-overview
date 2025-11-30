"use client";

import { useTranslations } from "next-intl";

/** Site footer with copyright information */
export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <p className="text-sm text-gray-600">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
