"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useState, useTransition } from "react";

const languages = [
    { code: "en", name: "English" },
    { code: "zh", name: "中文" },
    { code: "ja", name: "日本語" },
];

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
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Change language"
            >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLang?.name}</span>
                <span className="sm:hidden sr-only">{currentLang?.name}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => switchLanguage(lang.code)}
                                disabled={isPending}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                    lang.code === locale
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
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
