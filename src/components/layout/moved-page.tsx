"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Band } from "@/components/layout/band";

/**
 * A page that has moved. GitHub Pages serves no redirects, so an old URL gets
 * this instead: an HTTP-equivalent refresh for browsers and crawlers that
 * don't run JavaScript, a client-side replace for those that do (so Back
 * doesn't bounce the visitor straight here again), and a plain link if both
 * fail. Pair it with `robots: noindex` and a canonical in the route metadata.
 */
export function MovedPage({ to, label }: { to: string; label: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return (
    <Band weight="content">
      {/* React hoists nothing here; browsers honour a refresh in <body>. */}
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <h1 className="t-title">This page has moved</h1>
      <p className="t-lead mt-4">
        It&apos;s now part of{" "}
        <Link href={to} className="text-primary underline underline-offset-4">
          {label}
        </Link>
        .
      </p>
    </Band>
  );
}
