import type { Metadata } from "next";
import { socialMetadata } from "@/lib/og/metadata";
import { ogPageImage } from "@/lib/og/pages";
import { UpdatesPage } from "@/features/updates/updates-page";
import { pagePreload } from "@/lib/public-preload-server";
import { PublicPreload } from "@/store/public-preload";

const DESCRIPTION =
  "Milestones, experiments, and current activity — a living feed of what I'm working on.";

export const metadata: Metadata = {
  title: "Updates",
  description: DESCRIPTION,
  ...socialMetadata({
    title: "Updates",
    description: DESCRIPTION,
    path: "/updates/",
    image: ogPageImage("updates"),
  }),
};

export default async function Page() {
  const data = await pagePreload({ sections: ["/updates"], lifeUpdates: true });
  return (
    <PublicPreload data={data}>
      <UpdatesPage />
    </PublicPreload>
  );
}
