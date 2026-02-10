import "@base/client/styles/fonts.css";
import "@base/client/styles/globals.css";
import { Metadata, Viewport } from "next";

import ModuleI18nProvider from "@base/client/contexts/i18n";
import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load messages for the default locale
  const locale = "en";

  // Load common messages for root layout
  const commonMessages = await import(`@base/client/messages/${locale}.json`)
    .then((module) => module.default)
    .catch(() => ({}));

  const initialMessages = {
    common: commonMessages,
  };

  return (
    <html
      suppressHydrationWarning
      className={`light ${fontSans.variable}`}
      lang={locale}
    >
      <head />
      <body className="font-sans">
        <Providers>
          <ModuleI18nProvider initialMessages={initialMessages} locale={locale}>
            <div className="relative flex flex-col h-screen">
              {/* <Navbar /> */}
              <main
                className="container mx-auto p-0 flex-1"
                style={{ maxWidth: "1920px" }}
              >
                {children}
              </main>
            </div>
            {/* <ScrollbarReveal /> */}
          </ModuleI18nProvider>
        </Providers>
      </body>
    </html>
  );
}
