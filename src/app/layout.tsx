import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Toaster as AppToaster } from "@/src/ui/toaster";
import "../../styles/globals.css";
import QueryProvider from "../provider/QueryProvider";
import { fetchers } from "@/src/lib/fetchers";

export const revalidate = 3600;

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const result = await fetchers.publicSettings();
    const settings = result?.data;
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : undefined) ||
      "https://next-crm-momemtums.vercel.app/";
    const faviconUrl = settings?.favicon
      ? `${siteUrl}${settings.favicon}?v=${settings.updatedAt}`
      : undefined;
    return {
      title: settings?.siteTagline
        ? `${settings.siteName} – ${settings.siteTagline}`
        : settings?.siteName || "My Website",
      description: settings?.siteTagline || "Modern CMS Website",
      icons: faviconUrl ? { icon: faviconUrl, apple: faviconUrl } : undefined,
    };
  } catch {
    return {
      title: "My Website",
      description: "Modern CMS Website",
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={spaceMono.variable}>
        <QueryProvider>
          
            {children}
            <AppToaster />
        </QueryProvider>
      </body>
    </html>
  );
}
