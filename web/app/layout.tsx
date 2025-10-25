import "@/module-base/styles/fonts.css";
import "@/module-base/styles/globals.css";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load messages for the default locale
  const locale = "en";
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html suppressHydrationWarning lang={locale}>
      <head />
      <body
      // className={clsx(
      //   // "text-foreground bg-background font-sans antialiased",
      //   fontSans.variable,
      //   fontNotoSansSC.variable
      // )}
      >
        <Providers
          themeProps={{ attribute: "class", defaultTheme: "light" }}
          locale={locale}
          messages={messages}
        >
          <div className="relative flex flex-col h-screen">
            {/* <Navbar /> */}
            <main
              className="container mx-auto p-0  my-1 flex-1"
              style={{ maxWidth: "1920px" }}
            >
              {children}
            </main>
          </div>
          {/* <ScrollbarReveal /> */}
        </Providers>
      </body>
    </html>
  );
}
