"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useGetPublishedBlogPostsQuery } from "@/store/api/publicApi";
import { Band, BandHeading } from "@/components/layout/band";
import { Stagger, StaggerItem } from "@/components/layout/motion";
import { useDisplayTimeZone } from "@/hooks/use-hydrated";
import { formatPostDate, readTime } from "@/features/blog/post-meta";
import { postHref } from "@/features/blog/post-href";
import { CARD, CARD_INTERACTIVE } from "@/features/sections/shared";
import { cn } from "@/lib/cn";

const SHOWN = 3;

/**
 * The three newest posts (V2-041). Writing is the part of the site that shows
 * how someone thinks, which a list of past roles can't. Renders nothing until
 * there is something published.
 */
export function LatestWriting({
  builtSlugs,
}: {
  /** Slugs prerendered at the last build; see postHref. */
  builtSlugs?: readonly string[];
}) {
  const { data: posts } = useGetPublishedBlogPostsQuery();
  // Prerendered: UTC until hydrated, so the build and the browser agree.
  const timeZone = useDisplayTimeZone();
  const latest = (posts ?? []).slice(0, SHOWN);

  if (latest.length === 0) return null;

  return (
    <Band weight="content" aria-labelledby="latest-writing-heading">
      <BandHeading
        id="latest-writing-heading"
        eyebrow="Writing"
        title="Latest notes"
        actions={
          <Link
            href="/blog/"
            className="group inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            All writing
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-base ease-enter group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        }
      />
      <Stagger as="ul" className="mt-10 grid gap-6 md:grid-cols-3">
        {latest.map((post) => (
          <StaggerItem as="li" key={post.id} className="min-w-0">
            <Link
              href={postHref(post.slug, builtSlugs)}
              className={cn(
                CARD,
                CARD_INTERACTIVE,
                "group flex h-full flex-col p-5 sm:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <p className="text-xs text-muted-foreground">
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {formatPostDate(post.published_at, timeZone)}
                  </time>
                )}
                {post.published_at && <span aria-hidden> · </span>}
                {readTime(post)} min read
              </p>
              <h3 className="mt-3 font-heading text-lg font-semibold leading-snug [overflow-wrap:anywhere] transition-colors group-hover:text-primary">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              )}
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Band>
  );
}
