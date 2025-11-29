"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Home } from "lucide-react";

export default function NotFound() {
    const t = useTranslations('notFound');
    const locale = useLocale();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    {t('title')}
                </h2>
                <p className="text-gray-600 mb-8 max-w-md">
                    {t('description')}
                </p>
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                    <Home className="w-4 h-4" />
                    {t('returnHome')}
                </Link>
            </div>
        </div>
    );
}
