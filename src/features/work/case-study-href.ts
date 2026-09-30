/**
 * Where a case study lives (V2-042), mirroring `postHref`.
 *
 * Case studies published at build time have their own prerendered page;
 * anything newer is served by /work/view/?slug= until the next build.
 * `built` is the build's list (see `useBuiltCaseStudySlugs`).
 */
export function caseStudyHref(
  slug: string,
  built: readonly string[] | undefined,
): string {
  const encoded = encodeURIComponent(slug);
  return built?.includes(slug)
    ? `/work/${encoded}/`
    : `/work/view/?slug=${encoded}`;
}
