import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { EventProvider } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { locales } from '@/i18n/config';
import '../globals.css';

// Disable static generation to avoid prerendering issues
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    
    // Set the locale for this request
    setRequestLocale(locale);
    
    const messages = await getMessages() as any;

    return {
        title: messages?.nav?.title || 'Event Overview',
        description: 'Aggregating the best tech events, hackathons, and meetups.',
    };
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    
    // Validate locale
    if (!locales.includes(locale as any)) {
        notFound();
    }

    // Set the locale for this request
    setRequestLocale(locale);

    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider messages={messages}>
                    <EventProvider>
                        <div className="flex flex-col min-h-screen">
                            <Navbar />
                            <main className="flex-grow">{children}</main>
                            <Footer />
                        </div>
                    </EventProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
