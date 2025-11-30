import { redirect } from "next/navigation";

/**
 * Root page - redirects to the default locale
 * The actual home page is at /[locale]/page.tsx
 */
export default function RootPage() {
  redirect("/en");
}
