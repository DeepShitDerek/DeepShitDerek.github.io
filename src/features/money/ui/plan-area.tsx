"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetsPanel } from "./budgets-panel";
import { ForecastPanel } from "./forecast-panel";
import { GoalsPanel } from "./goals-panel";
import { UpcomingPanel } from "./upcoming-panel";

/** Planning (V2-080): what is due, what the month is allowed, what you are saving for, and where it is all heading. */
export function PlanArea() {
  return (
    <Tabs defaultValue="upcoming" className="space-y-5">
      <TabsList>
        <TabsTrigger value="upcoming">Bills & pay</TabsTrigger>
        <TabsTrigger value="budgets">Budgets</TabsTrigger>
        <TabsTrigger value="goals">Goals</TabsTrigger>
        <TabsTrigger value="forecast">Forecast</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming"><UpcomingPanel /></TabsContent>
      <TabsContent value="budgets"><BudgetsPanel /></TabsContent>
      <TabsContent value="goals"><GoalsPanel /></TabsContent>
      <TabsContent value="forecast"><ForecastPanel /></TabsContent>
    </Tabs>
  );
}
