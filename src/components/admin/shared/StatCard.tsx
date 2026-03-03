// src/components/admin/shared/StatCard.tsx
// Unified statistic display card for all admin modules

import { ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  /** Card title displayed at the top */
  title: string;
  /** Main value to display (e.g., "$1,234" or "42") */
  value: string | number;
  /** Icon component to display */
  icon?: LucideIcon;
  /** Pre-rendered icon node (alternative to icon prop) */
  iconNode?: ReactNode;
  /** Optional help text or sub-value displayed below the main value */
  helpText?: string;
  /** Trend direction for styling */
  trend?: "up" | "down" | "neutral";
  /** Highlight the card with primary color gradient */
  highlight?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Card size variant */
  size?: "default" | "compact";
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconNode,
  helpText,
  trend,
  highlight = false,
  className,
  size = "default",
}: StatCardProps) {
  const renderIcon = () => {
    if (iconNode) return iconNode;
    if (!Icon) return null;

    return (
      <div
        className={cn(
          "p-2 rounded-full",
          trend === "up"
            ? "text-green-600 bg-green-500/10"
            : trend === "down"
              ? "text-red-500 bg-red-500/10"
              : highlight
                ? "text-primary bg-primary/10"
                : "text-muted-foreground bg-muted"
        )}
      >
        <Icon className="size-4" />
      </div>
    );
  };

  const renderTrendIndicator = () => {
    if (!helpText) return null;

    return (
      <p
        className={cn(
          "text-xs mt-1 flex items-center gap-1",
          trend === "up"
            ? "text-green-600"
            : trend === "down"
              ? "text-red-500"
              : "text-muted-foreground"
        )}
      >
        {trend === "up" && <TrendingUp className="size-3" />}
        {trend === "down" && <TrendingDown className="size-3" />}
        {helpText}
      </p>
    );
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        highlight && "bg-gradient-to-br from-primary/5 to-transparent border-primary/20",
        className
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0",
          size === "compact" ? "pb-1 pt-3 px-4" : "pb-2"
        )}
      >
        <CardTitle
          className={cn(
            "font-medium",
            size === "compact" ? "text-xs" : "text-sm",
            highlight ? "text-primary" : "text-muted-foreground"
          )}
        >
          {title}
        </CardTitle>
        {renderIcon()}
      </CardHeader>
      <CardContent className={cn(size === "compact" && "pb-3 px-4")}>
        <div
          className={cn(
            "font-bold",
            size === "compact" ? "text-xl" : "text-2xl"
          )}
        >
          {value}
        </div>
        {renderTrendIndicator()}
      </CardContent>
    </Card>
  );
}
