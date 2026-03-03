// src/components/admin/finance/stat-card.tsx
// Reusable statistic display card with trend indicators

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  /** Card title displayed at the top */
  title: string;
  /** Main value to display (e.g., "$1,234" or "42") */
  value: string | number;
  /** Optional icon displayed in the top-right corner */
  icon?: React.ReactNode;
  /** Optional help text displayed below the value */
  helpText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Trend direction for styling the icon container */
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({
  title,
  value,
  icon,
  helpText,
  className,
  trend,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div
              className={cn(
                "p-2 rounded-full bg-background/50 border",
                trend === "up"
                  ? "text-green-500 border-green-500/20 bg-green-500/10"
                  : trend === "down"
                    ? "text-red-500 border-red-500/20 bg-red-500/10"
                    : "text-muted-foreground"
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {helpText && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
      </CardContent>
    </Card>
  );
}
