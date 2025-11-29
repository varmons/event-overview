import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Wire up next-intl so server helpers like getMessages can locate the i18n config
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
    /* config options here */
    // Disable React Compiler for stability with React 19
    reactCompiler: false,
    // Updated serverExternalPackages for Next.js 16
    serverExternalPackages: [],

    // Performance optimizations
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
};

export default withNextIntl(nextConfig);
