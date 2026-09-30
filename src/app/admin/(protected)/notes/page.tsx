"use client";

import { Suspense } from "react";
import NotesPage from "@/features/notes/notes-page";

// The open item lives in the query string (ADM-004); useSearchParams needs a
// Suspense boundary under static export.
export default function Page() {
  return (
    <Suspense>
      <NotesPage />
    </Suspense>
  );
}
