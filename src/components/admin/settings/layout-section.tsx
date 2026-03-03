import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { LayoutDashboard } from "lucide-react";
import type { SiteSettingsFormValues } from "@/lib/schemas";

export interface LayoutSectionProps {
  form: UseFormReturn<SiteSettingsFormValues>;
}

export default function LayoutSection({ form }: LayoutSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutDashboard className="size-5 text-primary" /> Global Layout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="portfolio_mode"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col gap-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0 border rounded-md p-2 hover:bg-secondary/10 cursor-pointer">
                    <FormControl>
                      <RadioGroupItem value="multi-page" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer flex-1">
                      Multi-Page
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 border rounded-md p-2 hover:bg-secondary/10 cursor-pointer">
                    <FormControl>
                      <RadioGroupItem value="single-page" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer flex-1">
                      Single-Page
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
