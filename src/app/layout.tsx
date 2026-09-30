import "@/styles/globals.css";
import "@/styles/themes.css";
import "@/styles/typography.css";
import "prism-themes/themes/prism-one-dark.css";
import type { Metadata, Viewport } from "next";
import { config as appConfig } from "@/lib/config";
import {
  fetchNavLinks,
  fetchSiteIdentity,
  orUndefined,
} from "@/lib/public-data";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: appConfig.site.title,
    template: `%s | ${appConfig.site.author}`,
  },
  description: appConfig.site.description,
  metadataBase: new URL(appConfig.site.url),
};

export const viewport: Viewport = {
  // The default preset's ground; applyTheme retints it for the active theme.
  themeColor: "#f9f8f5",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Site-wide data, read once at build and rendered into every page's HTML
  // (ADR-004). The browser revalidates it after hydration.
  const [siteIdentity, navLinks] = await Promise.all([
    orUndefined(fetchSiteIdentity()),
    orUndefined(fetchNavLinks()),
  ]);

  // No `scroll-smooth` class on <html>: globals.css applies smooth scrolling
  // only without prefers-reduced-motion (V2-060), and the class overrode that
  // for everyone.
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Without JavaScript nothing ever animates the prerendered
            `opacity: 0` of Reveal / StaggerItem (motion.tsx) away. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>[data-motion]{opacity:1!important;transform:none!important}</style>",
          }}
        />
      </head>
      <body>
        <Providers preload={{ siteIdentity, navLinks }}>{children}</Providers>
      </body>
    </html>
  );
}
