import type { Metadata } from "next";
import { socialMetadata } from "@/lib/og/metadata";
import { ogPageImage } from "@/lib/og/pages";
import { siteContent } from "@/lib/site-content";
import { Band } from "@/components/layout/band";
import { PageHeader } from "@/components/layout/page-header";
import { DynamicPageContent } from "@/features/sections/dynamic-page-content";
import { RepoGrid } from "@/features/github/repo-grid";
import { pagePreload } from "@/lib/public-preload-server";
import { PublicPreload } from "@/store/public-preload";

export const metadata: Metadata = {
  title: siteContent.pages.work.title,
  description: siteContent.pages.work.description,
  ...socialMetadata({
    title: siteContent.pages.work.title,
    description: siteContent.pages.work.description,
    path: "/work/",
    image: ogPageImage("work"),
  }),
};

/**
 * /work — one answer to "what have you built?" (V2-040a).
 *
 * Replaces /showcase and /projects, which split that answer in two. It reads
 * their CMS sections where they already are, so no content has to move:
 * case studies first (the /showcase sections), then featured projects (the
 * /projects sections), then open source. Both old URLs redirect here.
 */
export default async function Page() {
  const data = await pagePreload({ sections: ["/showcase", "/projects"] });
  return (
    <PublicPreload data={data}>
      <Band weight="content">
        <PageHeader
          kicker="Portfolio"
          title={siteContent.pages.work.heading}
          subheading={siteContent.pages.work.subheading}
        />
        <DynamicPageContent pagePath="/showcase" />
        <DynamicPageContent pagePath="/projects" />
      </Band>
      <Band weight="content" aria-labelledby="repos-heading">
        <h2 id="repos-heading" className="t-heading">
          Open source &amp; experiments
        </h2>
        <div className="mt-8">
          <RepoGrid />
        </div>
      </Band>
    </PublicPreload>
  );
}
