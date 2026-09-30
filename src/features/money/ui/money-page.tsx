"use client";

import { useCreateIntent } from "@/features/admin-shell/create-intent";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarRange,
  HandCoins,
  LineChart,
  PieChart,
  BookOpenCheck,
  Landmark,
  LayoutDashboard,
  Plus,
  Receipt,
  Settings2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState, ManagerWrapper, PageHeader } from "@/components/admin/shared";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/utils";
import { AccountsArea } from "./accounts-area";
import { BorrowingArea } from "./borrowing-area";
import { ImportArea } from "./import-area";
import { InvestArea } from "./invest-area";
import { MoneyProvider, useMoneyState } from "./money-context";
import { type AreaId, OverviewArea } from "./overview-area";
import { PlanArea } from "./plan-area";
import { ReportsArea } from "./reports-area";
import { RulesArea } from "./rules-area";
import { SettingsArea } from "./settings-area";
import { TransactionSheet } from "./transaction-sheet";
import { TransactionsArea } from "./transactions-area";

const AREAS: { id: AreaId; label: string; icon: LucideIcon; question: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, question: "Where do I stand?" },
  { id: "accounts", label: "Accounts", icon: Landmark, question: "What does each account hold?" },
  { id: "transactions", label: "Transactions", icon: Receipt, question: "Where did the money go?" },
  { id: "plan", label: "Plan", icon: CalendarRange, question: "What's due, what's budgeted, what you're saving for." },
  { id: "investing", label: "Investing", icon: LineChart, question: "What your investments are worth, and the room left to add." },
  { id: "borrowing", label: "Borrowing", icon: HandCoins, question: "Loans, credit, and applying for more." },
  { id: "reports", label: "Reports", icon: PieChart, question: "How the months went, net worth over time, the cost of sending money, the tax year." },
  { id: "import", label: "Import", icon: Upload, question: "Bring in a bank statement." },
  { id: "rules", label: "Rules", icon: BookOpenCheck, question: "Sort transactions automatically." },
  { id: "settings", label: "Settings", icon: Settings2, question: "Currencies, categories and rates." },
];

const isArea = (value: string | null): value is AreaId => AREAS.some((a) => a.id === value);

/**
 * /admin/finance — the money module (V2-080). The area and the account the
 * register is focused on live in the URL, so Back works and a view can be
 * reloaded or bookmarked.
 */
export default function MoneyPage({ basePath = "/admin/finance/" }: { basePath?: string }) {
  return (
    <MoneyProvider>
      <MoneyShell basePath={basePath} />
    </MoneyProvider>
  );
}

function MoneyShell({ basePath }: { basePath: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { data, isLoading, error, refetch } = useMoneyState();
  const [adding, setAdding] = useState(false);
  useCreateIntent("transaction", () => setAdding(true), !!data && data.openAccounts.length > 0);

  const area: AreaId = isArea(params?.get("area") ?? null) ? (params!.get("area") as AreaId) : "overview";
  const accountId = params?.get("account") ?? null;
  const go = (next: AreaId, account: string | null = null) => {
    const query = new URLSearchParams();
    if (next !== "overview") query.set("area", next);
    if (account) query.set("account", account);
    const suffix = query.toString();
    router.push(`${basePath}${suffix ? `?${suffix}` : ""}`, { scroll: false });
  };
  const current = AREAS.find((a) => a.id === area)!;

  return (
    <ManagerWrapper>
      <PageHeader
        title="Money"
        description={current.question}
        actions={
          data && data.openAccounts.length > 0 ? (
            <Button onClick={() => setAdding(true)}>
              <Plus className="mr-2 size-4" /> Transaction
            </Button>
          ) : undefined
        }
      />

      <nav aria-label="Money sections" className="-mx-1 mb-6 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex min-w-max gap-1 px-1">
          {AREAS.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => go(a.id)}
                aria-current={a.id === area ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-control px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  a.id === area ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <a.icon aria-hidden className="size-4" />
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {error ? (
        <div role="alert" className="rounded-surface border border-destructive/40 bg-destructive/5 p-5 text-sm">
          <p className="font-medium text-destructive">The money data couldn&apos;t be loaded.</p>
          <p className="mt-1 text-muted-foreground">{getErrorMessage(error)}</p>
          <p className="mt-1 text-muted-foreground">
            If this is the first time, the database may not have the money tables yet — re-run db/schema.sql.
          </p>
          <Button variant="outline" className="mt-3" onClick={refetch}>Try again</Button>
        </div>
      ) : isLoading || !data ? (
        <LoadingState />
      ) : (
        <>
          {area === "overview" && <OverviewArea onGo={(next) => go(next)} />}
          {area === "accounts" && <AccountsArea onOpenRegister={(id) => go("transactions", id)} />}
          {area === "transactions" && <TransactionsArea accountId={accountId} onAccountChange={(id) => go("transactions", id)} />}
          {area === "plan" && <PlanArea />}
          {area === "investing" && <InvestArea />}
          {area === "borrowing" && <BorrowingArea />}
          {area === "reports" && <ReportsArea />}
          {area === "import" && <ImportArea />}
          {area === "rules" && <RulesArea />}
          {area === "settings" && <SettingsArea />}
          <TransactionSheet open={adding} onOpenChange={setAdding} defaultAccountId={accountId ?? undefined} />
        </>
      )}
    </ManagerWrapper>
  );
}
