import type { Metadata } from "next";
import { socialMetadata } from "@/lib/og/metadata";
import { ogPageImage } from "@/lib/og/pages";
import { siteContent } from "@/lib/site-content";
import { ContactPage } from "@/features/contact/contact-page";
import { pagePreload } from "@/lib/public-preload-server";
import { PublicPreload } from "@/store/public-preload";

export const metadata: Metadata = {
  title: siteContent.pages.contact.title,
  description: siteContent.pages.contact.description,
  ...socialMetadata({
    title: siteContent.pages.contact.title,
    description: siteContent.pages.contact.description,
    path: "/contact/",
    image: ogPageImage("contact"),
  }),
};

export default async function Page() {
  const data = await pagePreload({ sections: ["/contact"] });
  return (
    <PublicPreload data={data}>
      <ContactPage />
    </PublicPreload>
  );
}
