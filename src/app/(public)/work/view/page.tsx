import type { Metadata } from "next";
import { Suspense } from "react";
import { CaseStudyPageFromQuery } from "@/features/work/case-study-page";

export const metadata: Metadata = {
  title: "Case study",
};

export default function Page() {
  // Slug arrives as ?slug= (static-export-friendly); useSearchParams requires
  // a Suspense boundary.
  return (
    <Suspense>
      <CaseStudyPageFromQuery />
    </Suspense>
  );
}
