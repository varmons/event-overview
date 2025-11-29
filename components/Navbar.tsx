"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Calendar } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
    const t = useTranslations('nav');
    const locale = useLocale();

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link
                        href={`/${locale}`}
                        className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <span translate="no" suppressHydrationWarning>{t('title')}</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href={`/${locale}/submit`}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                        >
                            {t('submit')}
                        </Link>
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </nav>
    );
}
