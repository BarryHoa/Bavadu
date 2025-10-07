import "@/styles/globals.css";
import "@/styles/fonts.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { Providers } from "../providers";

import { siteConfig } from "@/config/site";
import { fontSans, fontNotoSansSC } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import ScrollbarReveal from "@/components/scrollbar-reveal";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning lang={locale}>
      <head />
      <body
        className={clsx(
          "h-screen overflow-hidden text-foreground bg-background font-sans antialiased",
          fontSans.variable,
          fontNotoSansSC.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
            <div className="relative flex flex-col h-screen">
              {/* <Navbar /> */}
              <main className="container mx-auto p-0  my-1 flex-1">
                {children}
              </main>
            </div>
            {/* <ScrollbarReveal /> */}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
