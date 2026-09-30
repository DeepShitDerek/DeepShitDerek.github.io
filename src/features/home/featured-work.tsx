"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useGetSectionsByPathQuery } from "@/store/api/publicApi";
import { Band, BandHeading } from "@/components/layout/band";
import { Stagger, StaggerItem } from "@/components/layout/motion";
import {
  CARD,
  CARD_INTERACTIVE,
  ItemImage,
  ItemTags,
  sortedItems,
} from "@/features/sections/shared";
import { plainPreview } from "@/lib/text-preview";
import { cn } from "@/lib/cn";
import { useBuiltCaseStudySlugs } from "@/store/public-preload";
import { caseStudyHref } from "@/features/work/case-study-href";

const SHOWN = 3;

/**
 * The first three pieces of work, as a teaser for /work (V2-041).
 *
 * Reads the /showcase sections — where the case studies already live in the
 * CMS — so the home page shows proof without the owner curating a second copy
 * of it. A card goes to its case study when one is written (V2-042), and to
 * /work otherwise. Renders nothing
 * when there is no work to show, rather than an empty band.
 */
export function FeaturedWork() {
  const { data: sections } = useGetSectionsByPathQuery("/showcase");
  const built = useBuiltCaseStudySlugs();
  const items = (sections ?? [])
    .flatMap((section) => sortedItems(section.portfolio_items))
    .slice(0, SHOWN);

  if (items.length === 0) return null;

  return (
    <Band weight="content" aria-labelledby="featured-work-heading">
      <BandHeading
        id="featured-work-heading"
        eyebrow="Selected work"
        title="Systems that shipped"
        actions={
          <Link
            href="/work/"
            className="group inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            All work
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-base ease-enter group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        }
      />
      <Stagger as="ul" className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <StaggerItem as="li" key={item.id} className="min-w-0">
            <Link
              href={
                item.has_case_study && item.slug
                  ? caseStudyHref(item.slug, built)
                  : "/work/"
              }
              className={cn(
                CARD,
                CARD_INTERACTIVE,
                "group flex h-full flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <ItemImage
                src={item.image_url}
                alt=""
                fallbackLabel={item.title}
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                <h3 className="font-heading text-lg font-semibold leading-snug [overflow-wrap:anywhere] transition-colors group-hover:text-primary">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.subtitle}
                  </p>
                )}
                {item.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                    {plainPreview(item.description)}
                  </p>
                )}
                <ItemTags tags={item.tags} max={3} className="mt-auto pt-5" />
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Band>
  );
}
