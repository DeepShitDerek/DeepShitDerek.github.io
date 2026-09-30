"use client";

import { type ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { skipToken } from "@reduxjs/toolkit/query";
import { ArrowLeft, Check, Link2, Linkedin, Twitter } from "lucide-react";
import { toast } from "sonner";
import {
  useGetBlogPostBySlugQuery,
  useGetSiteIdentityQuery,
  useIncrementPostViewMutation,
} from "@/store/api/publicApi";
import { isSupabaseConfigured } from "@/lib/config";
import { safeImageUrl } from "@/lib/safe-url";
import { sizedImageUrl } from "@/lib/image-size";
import { Band } from "@/components/layout/band";
import { Reveal } from "@/components/layout/motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { useDisplayTimeZone } from "@/hooks/use-hydrated";
import { readTime } from "./post-meta";
import { contentHash } from "./content-hash";
import { loadPostContent } from "./post-content-loader";
import { ReadingProgress } from "./reading-progress";
import { TableOfContents, useHeadings } from "./table-of-contents";

const VIEW_COUNT_DELAY_MS = 5000;
const ARTICLE_ID = "post-article";

// The markdown pipeline (raw → sanitize → prism/refractor → slug) is by far the
// heaviest thing on this route, and nothing above the article body needs it.
// Splitting it lets the title and cover paint on the light chunk.
//
// Rendered at build, not only in the browser (V2-025): a prerendered post's
// body is in its HTML — the part of a blog search engines and link previews
// actually read. The chunk is still split; first-load JS is unchanged.
const PostContent = dynamic(
  () => loadPostContent().then((mod) => mod.PostContent),
  {
    loading: () => (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    ),
  },
);

const ICON_BUTTON =
  "flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors duration-base hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** "status: 404 — post not found" was the v2 terminal voice. */
function PostNotFound() {
  return (
    <Band weight="feature">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="t-eyebrow">Post not found</p>
        <h1 className="t-title mt-4 text-balance">
          This post doesn&apos;t exist.
        </h1>
        <p className="t-lead mt-4 text-pretty">
          It may have been unpublished, or the link may be mistyped.
        </p>
        <Button asChild size="lg" className="mt-10 rounded-full px-7">
          <Link href="/blog">
            <ArrowLeft className="mr-2 size-4" aria-hidden />
            All posts
          </Link>
        </Button>
      </div>
    </Band>
  );
}

/**
 * /blog/view/?slug= — posts published since the last build (see postHref).
 * Reading the query string opts this route out of prerendering, which is why
 * built posts get their own /blog/<slug>/ page instead.
 */
export function PostPageFromQuery() {
  const searchParams = useSearchParams();
  return <PostPage slug={searchParams?.get("slug") ?? ""} />;
}

/**
 * The body as rendered at build time, and a fingerprint of the markdown it
 * was rendered from (V2-043). While the fetched post's body matches, the page
 * shows that HTML and never downloads the markdown pipeline.
 */
export interface PrerenderedBody {
  contentHash: string;
  body: ReactNode;
}

export function PostPage({ slug, prerendered }: { slug: string; prerendered?: PrerenderedBody }) {
  const {
    data: post,
    isLoading,
    isError,
  } = useGetBlogPostBySlugQuery(slug || skipToken);
  const { data: identity } = useGetSiteIdentityQuery();
  const [incrementView] = useIncrementPostViewMutation();
  const [copied, setCopied] = useState(false);
  // Prerendered: UTC until hydrated, so the build and the browser agree.
  const timeZone = useDisplayTimeZone();

  // Owned by the page, not the rail: the layout has to know whether a table of
  // contents will render before it decides how wide the article is.
  const { headings, activeId } = useHeadings(ARTICLE_ID);

  // Warm the markdown chunk alongside the post query, when it will be needed:
  // no build-time body (/blog/view), or the post has changed since the build.
  const builtIsCurrent =
    !!prerendered && !!post && contentHash(post.content ?? "") === prerendered.contentHash;
  const needsPipeline = !prerendered || (!!post && !builtIsCurrent);
  useEffect(() => {
    if (needsPipeline) void loadPostContent();
  }, [needsPipeline]);

  // Static-export limitation: the document title is set client-side.
  useEffect(() => {
    if (post) document.title = post.title;
  }, [post]);

  useEffect(() => {
    if (!post || process.env.NODE_ENV !== "production" || !isSupabaseConfigured)
      return;
    // Not a reader: an automated browser (the build's own checks).
    if (navigator.webdriver) return;
    const timer = setTimeout(() => incrementView(post.id), VIEW_COUNT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [post, incrementView]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!slug || isError) return <PostNotFound />;

  if (isLoading || !post) {
    return (
      <Band weight="content" width="prose" aria-busy>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-8 h-14 w-3/4" />
        <Skeleton className="mt-6 h-5 w-56" />
        <Skeleton className="mt-10 h-72 w-full rounded-surface" />
      </Band>
    );
  }

  const author = identity?.profile_data;
  const avatar = author?.show_profile_picture
    ? safeImageUrl(author.profile_picture_url)
    : null;
  const cover = safeImageUrl(post.cover_image_url);
  const published = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone,
      })
    : "";
  const hasToc = post.show_toc !== false && headings.length > 0;
  const tags = (post.tags ?? []).filter((tag) => tag.trim());

  const share = (network: "x" | "linkedin") => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    window.open(
      network === "x"
        ? `https://twitter.com/intent/tweet?url=${url}&text=${text}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <>
      <ReadingProgress />
      <Band weight="content" width="wide">
        {/*
          Keyed on whether a table of contents will actually render, not on the
          `show_toc` flag alone — a rail that returns null must not reserve a
          column the article then never widens into.
        */}
        <div
          className={
            hasToc
              ? "grid gap-12 lg:grid-cols-[minmax(0,1fr)_14rem]"
              : "mx-auto max-w-3xl"
          }
        >
          <article id={ARTICLE_ID} className="min-w-0">
            <header>
              <Reveal>
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ArrowLeft
                    className="size-4 transition-transform duration-base ease-enter group-hover:-translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden
                  />
                  All posts
                </Link>
              </Reveal>

              <Reveal delay={0.05}>
                {tags[0] && <p className="t-eyebrow mt-10">{tags[0]}</p>}
                <h1
                  className={cn(
                    "t-title text-balance [overflow-wrap:anywhere]",
                    tags[0] ? "mt-3" : "mt-10",
                  )}
                >
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="t-lead mt-5 text-pretty">{post.excerpt}</p>
                )}
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-8 flex items-center gap-3">
                  {avatar && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sizedImageUrl(avatar, 40)}
                      alt=""
                      width={40}
                      height={40}
                      decoding="async"
                      className="size-10 rounded-full object-cover shadow-e1"
                    />
                  )}
                  <div className="min-w-0 text-sm">
                    {author?.name && (
                      <p className="font-semibold">{author.name}</p>
                    )}
                    <p className="text-muted-foreground">
                      {published && (
                        <time dateTime={post.published_at ?? undefined}>
                          {published}
                        </time>
                      )}
                      {published && " · "}
                      {readTime(post)} min read
                    </p>
                  </div>
                </div>
              </Reveal>

              {cover && (
                <Reveal delay={0.15}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt=""
                    // Usually the largest thing above the fold (the LCP).
                    fetchPriority="high"
                    className="mt-10 w-full rounded-surface object-cover shadow-e2"
                  />
                </Reveal>
              )}
            </header>

            <div className="mt-12">
              {builtIsCurrent ? (
                prerendered?.body
              ) : (
                <PostContent content={post.content ?? ""} />
              )}
            </div>

            <footer className="mt-16">
              <div className="flex flex-wrap items-center justify-between gap-6 border-t border-border/60 pt-8">
                {tags.length > 0 ? (
                  <ul className="flex flex-wrap gap-2" aria-label="Topics">
                    {tags.map((tag) => (
                      <li key={tag}>
                        <Link
                          href={`/blog?tag=${encodeURIComponent(tag)}`}
                          className="inline-flex rounded-full bg-secondary px-3.5 py-1.5 text-sm font-medium text-secondary-foreground transition-colors duration-base hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  <span className="mr-1 text-sm text-muted-foreground">
                    Share
                  </span>
                  <button
                    type="button"
                    onClick={() => share("x")}
                    aria-label="Share on X"
                    title="Share on X"
                    className={ICON_BUTTON}
                  >
                    <Twitter className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => share("linkedin")}
                    aria-label="Share on LinkedIn"
                    title="Share on LinkedIn"
                    className={ICON_BUTTON}
                  >
                    <Linkedin className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={copyLink}
                    aria-label={copied ? "Link copied" : "Copy link"}
                    title={copied ? "Link copied" : "Copy link"}
                    className={ICON_BUTTON}
                  >
                    {copied ? (
                      <Check className="size-4" aria-hidden />
                    ) : (
                      <Link2 className="size-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>
            </footer>
          </article>

          {hasToc && (
            <TableOfContents headings={headings} activeId={activeId} />
          )}
        </div>
      </Band>
    </>
  );
}
