import type { Metadata } from "next";
import { config as appConfig } from "@/lib/config";
import {
  fetchCaseStudyBySlug,
  fetchCaseStudySlugs,
  orUndefined,
} from "@/lib/public-data";
import { safeImageUrl } from "@/lib/safe-url";
import { plainPreview } from "@/lib/text-preview";
import { socialMetadata } from "@/lib/og/metadata";
import { CaseStudyPage } from "@/features/work/case-study-page";
import { PublicPreload } from "@/store/public-preload";

/*
  One prerendered page per case study published at build time (V2-042), the
  same way /blog/<slug>/ works (ADR-004). Newer ones are served by /work/view
  until the next build (see caseStudyHref).
*/

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = (await orUndefined(fetchCaseStudySlugs())) ?? [];
  // 'view' is refused by the database; the filter is belt and braces.
  const params = slugs
    .filter((slug) => slug !== "view")
    .map((slug) => ({ slug }));
  // `output: export` rejects an empty list; one unlinked sentinel renders
  // the not-found view.
  return params.length > 0 ? params : [{ slug: "_" }];
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const study = await orUndefined(fetchCaseStudyBySlug(params.slug));
  if (!study)
    return { title: "Case study not found", robots: { index: false } };

  const path = `/work/${encodeURIComponent(study.slug)}/`;
  const description =
    (study.description && plainPreview(study.description)) ||
    study.subtitle ||
    appConfig.site.description;

  return {
    title: study.title,
    description,
    alternates: { canonical: path },
    ...socialMetadata({
      title: study.title,
      description,
      path,
      image:
        safeImageUrl(study.image_url) ??
        `/og/work/${encodeURIComponent(study.slug)}/image.png`,
      type: "article",
    }),
  };
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const study = await orUndefined(fetchCaseStudyBySlug(params.slug));
  return (
    <PublicPreload
      data={study ? { caseStudiesBySlug: { [params.slug]: study } } : undefined}
    >
      <CaseStudyPage slug={params.slug} />
    </PublicPreload>
  );
}
