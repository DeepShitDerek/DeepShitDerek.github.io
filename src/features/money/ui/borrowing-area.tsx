"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationsPanel } from "./applications-panel";
import { CreditPanel } from "./credit-panel";
import { IncomePanel } from "./income-panel";
import { LoansPanel } from "./loans-panel";
import { PayoffPanel } from "./payoff-panel";

/** Borrowing (V2-080): loans, paying debt down, credit, and applying for more. */
export function BorrowingArea() {
  return (
    <Tabs defaultValue="loans" className="space-y-5">
      <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TabsList>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="payoff">Pay down</TabsTrigger>
          <TabsTrigger value="credit">Credit</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="loans"><LoansPanel /></TabsContent>
      <TabsContent value="payoff"><PayoffPanel /></TabsContent>
      <TabsContent value="credit"><CreditPanel /></TabsContent>
      <TabsContent value="income"><IncomePanel /></TabsContent>
      <TabsContent value="applications"><ApplicationsPanel /></TabsContent>
    </Tabs>
  );
}
