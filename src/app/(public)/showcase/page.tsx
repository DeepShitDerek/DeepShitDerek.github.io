import type { Metadata } from "next";
import { config as appConfig } from "@/lib/config";
import { MovedPage } from "@/components/layout/moved-page";

/** Merged into /work (V2-040a). Kept so old links and search results land. */
export const metadata: Metadata = {
  title: "Moved to Work",
  robots: { index: false, follow: true },
  alternates: { canonical: `${appConfig.site.url}/work/` },
};

export default function Page() {
  return <MovedPage to="/work/" label="Work" />;
}
