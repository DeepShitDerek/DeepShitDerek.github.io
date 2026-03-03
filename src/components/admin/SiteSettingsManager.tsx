// src/components/admin/SiteSettingsManager.tsx
"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from "@/store/api/adminApi";
import {
  siteSettingsSchema,
  siteSettingsDefaultValues,
  type SiteSettingsFormValues,
} from "@/lib/schemas";

// Extracted section components
import {
  SettingsSkeleton,
  BrandIdentitySection,
  HeroAboutSection,
  GitHubSection,
  ThemeSection,
  SocialLinksSection,
  StatusPanelSection,
  LayoutSection,
  FooterSection,
} from "./settings";

export default function SiteSettingsManager() {
  const { data: settingsData, isLoading: isLoadingSettings } =
    useGetSiteSettingsQuery();
  const [updateSiteSettings, { isLoading: isSubmitting }] =
    useUpdateSiteSettingsMutation();

  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: siteSettingsDefaultValues,
  });

  useEffect(() => {
    if (settingsData) {
      // Helper to convert nulls to empty strings for form compatibility
      const nullsToStrings = (obj: any): any => {
        if (obj === null || obj === undefined) return "";
        if (typeof obj !== "object") return obj;
        if (Array.isArray(obj)) return obj.map(nullsToStrings);
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key,
            nullsToStrings(value),
          ])
        );
      };
      const cleanIdentity = nullsToStrings(settingsData);

      const fetchedSocials = (cleanIdentity.social_links as any[]) || [];
      const mergedSocials = (siteSettingsDefaultValues.social_links || []).map(
        (def) => {
          const fetched = fetchedSocials.find((f) => f.id === def.id);
          return fetched ? { ...def, ...fetched } : def;
        }
      );

      const fetchedColors =
        cleanIdentity.profile_data.custom_theme_colors || {};
      const defaultColors =
        siteSettingsDefaultValues.profile_data.custom_theme_colors!;
      const mergedColors = {
        background: fetchedColors.background || defaultColors.background,
        foreground: fetchedColors.foreground || defaultColors.foreground,
        primary: fetchedColors.primary || defaultColors.primary,
        secondary: fetchedColors.secondary || defaultColors.secondary,
        accent: fetchedColors.accent || defaultColors.accent,
        card: fetchedColors.card || defaultColors.card,
      };

      const mergedProfileData = {
        ...siteSettingsDefaultValues.profile_data,
        ...cleanIdentity.profile_data,
        custom_theme_colors: mergedColors,
        logo: {
          ...siteSettingsDefaultValues.profile_data.logo,
          ...(cleanIdentity.profile_data.logo || {}),
        },
        status_panel: {
          ...siteSettingsDefaultValues.profile_data.status_panel,
          ...(cleanIdentity.profile_data.status_panel || {}),
          show: cleanIdentity.profile_data.status_panel?.show ?? true,
          currently_exploring: {
            ...siteSettingsDefaultValues.profile_data.status_panel
              .currently_exploring,
            ...(cleanIdentity.profile_data.status_panel?.currently_exploring ||
              {}),
            items: cleanIdentity.profile_data.status_panel?.currently_exploring
              ?.items?.length
              ? cleanIdentity.profile_data.status_panel.currently_exploring
                  .items
              : [""],
          },
          latestProject: {
            ...siteSettingsDefaultValues.profile_data.status_panel
              .latestProject,
            ...(cleanIdentity.profile_data.status_panel?.latestProject || {}),
          },
        },
        github_projects_config: {
          ...siteSettingsDefaultValues.profile_data.github_projects_config,
          ...(cleanIdentity.profile_data.github_projects_config || {}),
        },
        bio: cleanIdentity.profile_data.bio?.length
          ? cleanIdentity.profile_data.bio
          : [""],
      };

      form.reset({
        portfolio_mode: settingsData.portfolio_mode || "multi-page",
        profile_data: mergedProfileData,
        social_links: mergedSocials,
        footer_data:
          cleanIdentity.footer_data || siteSettingsDefaultValues.footer_data,
      });
    }
  }, [settingsData, form]);

  const onSubmit = async (values: SiteSettingsFormValues) => {
    try {
      await updateSiteSettings(values).unwrap();
      toast.success("Site settings updated successfully!");
    } catch (err: any) {
      toast.error("Failed to save settings", { description: err.message });
    }
  };

  if (isLoadingSettings) return <SettingsSkeleton />;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-sm -mx-4 md:-mx-8 px-4 md:px-8 py-4 -mt-4 mb-2 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Site Settings</h2>
          <p className="text-muted-foreground text-sm hidden sm:block">
            Manage global settings for your portfolio's identity and layout.
          </p>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full sm:w-auto shadow-md"
        >
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}{" "}
          Save Changes
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-1"
        >
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <BrandIdentitySection form={form} />
            <HeroAboutSection form={form} />
            <GitHubSection form={form} />
          </div>

          {/* Right Column - Secondary Settings */}
          <div className="lg:col-span-1 space-y-6">
            <ThemeSection form={form} />
            <SocialLinksSection form={form} />
            <StatusPanelSection form={form} />
            <LayoutSection form={form} />
            <FooterSection form={form} />
          </div>
        </form>
      </Form>
    </div>
  );
}
