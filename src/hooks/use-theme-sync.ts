import { useEffect } from "react";
import type { SiteContent } from "@/types";
import { applySiteTheme, resolveThemeClass } from "@/lib/themes";

/**
 * Keeps the <html> theme/typography classes in sync with the site identity
 * stored in the database (or mock data in static mode), with a visitor's
 * light/dark choice applied on top (`applySiteTheme`). Returns the owner's
 * resolved theme class for consumers that need it.
 */
export function useThemeSync(siteIdentity: SiteContent | undefined): string {
  const themeClass = resolveThemeClass(
    siteIdentity?.profile_data?.default_theme,
  );
  const typographyPreset =
    siteIdentity?.profile_data?.typography_preset || "typo-default";
  const customColors = siteIdentity?.profile_data?.custom_theme_colors;

  useEffect(() => {
    if (typeof window === "undefined" || !siteIdentity) return;
    applySiteTheme(themeClass, typographyPreset, customColors);
  }, [siteIdentity, themeClass, typographyPreset, customColors]);

  return themeClass;
}
