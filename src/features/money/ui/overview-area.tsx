"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import { categoryLabel } from "../domain/categories";
import { endOfMonth, startOfMonth } from "../domain/dates";
import { periodFlows } from "../domain/flows";
import { convert, money } from "../domain/money";
import { creditUtilisation, valuation } from "../domain/ledger";
import { hasPublishedRate } from "../data/rate-source";
import { Amount } from "./amount";
import { countryLabel } from "./labels";
import { InsightsPanel } from "./insights-panel";
import { useMoney } from "./money-context";
import { UpcomingPanel } from "./upcoming-panel";

export type AreaId = "overview" | "accounts" | "transactions" | "plan" | "investing" | "borrowing" | "reports" | "import" | "rules" | "settings";

/**
 * Where you stand (V2-080): what you own and owe, split between Canada and
 * India, what is spendable now, and this month so far.
 */
export function OverviewArea({ onGo }: { onGo: (area: AreaId) => void }) {
  const data = useMoney();
  const { settings, accounts, openAccounts, balanceByAccount, worthByAccount, rateTable, today, transactions, categories, categoryById, accountById } = data;
  const base = settings.baseCurrency;

  const worth = valuation(accounts, worthByAccount, base, today, rateTable);
  const liquid = openAccounts
    .filter((a) => a.isLiquid)
    .reduce((total, a) => {
      const quote = rateTable.quote(a.currency, base, today);
      const balance = worthByAccount.get(a.id)?.balanceMinor ?? 0;
      return quote ? total + convert(money(balance, a.currency), quote.rate, base).minor : total;
    }, 0);
  const month = periodFlows(transactions, startOfMonth(today), endOfMonth(today));
  const util = creditUtilisation(accounts, balanceByAccount);
  const homeQuote = rateTable.quote(base, settings.homeCurrency, today);

  const foreign = [...new Set(accounts.map((a) => a.currency))].filter((c) => c !== base);
  const steps = [
    { done: settings.saved, label: "Tell it your currencies and province", area: "settings" as const },
    { done: categories.length > 0, label: "Pick categories (a starter set is ready)", area: "settings" as const },
    { done: accounts.length > 0, label: "Add your accounts in Canada and India", area: "accounts" as const },
    {
      done: foreign.every((c) => !hasPublishedRate(c) || rateTable.quote(c, base, today)),
      label: "Fetch exchange rates",
      area: "settings" as const,
    },
    { done: transactions.length > 0, label: "Import a statement or add a transaction", area: "import" as const },
  ];
  const setupDone = steps.every((s) => s.done);

  return (
    <div className="space-y-8">
      {!setupDone && (
        <section aria-labelledby="setup-heading" className="rounded-surface border bg-card p-5">
          <h2 id="setup-heading" className="font-heading text-base font-semibold">Getting set up</h2>
          <ol className="mt-3 space-y-2">
            {steps.map((step) => (
              <li key={step.label}>
                <button type="button" onClick={() => onGo(step.area)} className="flex items-center gap-2 text-left text-sm hover:underline">
                  {step.done ? (
                    <Check aria-label="Done" className="size-4 text-emerald-600" />
                  ) : (
                    <Circle aria-label="To do" className="size-4 text-muted-foreground" />
                  )}
                  <span className={cn(step.done && "text-muted-foreground line-through")}>{step.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      <InsightsPanel onGo={onGo} />

      <section aria-labelledby="worth-heading" className="grid gap-4 md:grid-cols-3">
        <div className="rounded-surface border bg-card p-5 md:col-span-2">
          <h2 id="worth-heading" className="text-sm text-muted-foreground">Net worth</h2>
          <p className="mt-1 font-heading text-3xl font-semibold">
            <Amount minor={worth.total.minor} currency={base} tone="balance" />
          </p>
          {homeQuote && (
            <p className="text-sm text-muted-foreground">
              ≈ <Amount minor={convert(worth.total, homeQuote.rate, settings.homeCurrency).minor} currency={settings.homeCurrency} />
            </p>
          )}
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">You own</dt>
              <dd><Amount minor={worth.assets.minor} currency={base} /></dd>
            </div>
            <div>
              <dt className="text-muted-foreground">You owe</dt>
              <dd><Amount minor={-worth.liabilities.minor} currency={base} /></dd>
            </div>
            {[...worth.byCountry].map(([country, amount]) => (
              <div key={country}>
                <dt className="text-muted-foreground">In {countryLabel(country)}</dt>
                <dd><Amount minor={amount.minor} currency={base} tone="balance" /></dd>
              </div>
            ))}
          </dl>
          {worth.unpriced.length > 0 && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
              Not included for want of an exchange rate:{" "}
              {worth.unpriced.map((m, i) => (
                <span key={m.currency}>
                  {i > 0 && ", "}
                  <Amount minor={m.minor} currency={m.currency} />
                </span>
              ))}
              .
            </p>
          )}
        </div>
        <div className="rounded-surface border bg-card p-5">
          <h2 className="text-sm text-muted-foreground">Cash on hand</h2>
          <p className="mt-1 font-heading text-2xl font-semibold">
            <Amount minor={liquid} currency={base} tone="balance" />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Accounts marked spendable, cards netted against it.</p>
          {util.overallRatio !== null && (
            <p className={cn("mt-3 text-sm", util.overallRatio > 0.3 && "text-amber-700 dark:text-amber-400")}>
              Cards: {Math.round(util.overallRatio * 100)}% of limits used
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="month-heading" className="rounded-surface border bg-card p-5">
        <h2 id="month-heading" className="text-sm text-muted-foreground">This month so far</h2>
        <dl className="mt-2 grid grid-cols-3 gap-4">
          <div>
            <dt className="text-xs text-muted-foreground">In</dt>
            <dd className="text-lg font-semibold"><Amount minor={month.incomeMinor} currency={base} /></dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Out</dt>
            <dd className="text-lg font-semibold"><Amount minor={month.spendingMinor} currency={base} /></dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Kept</dt>
            <dd className="text-lg font-semibold">
              <Amount minor={month.netMinor} currency={base} tone="balance" />
              {/* A rate past −100% (spent over twice what came in) says nothing a reader can use. */}
              {month.savingsRate !== null && month.savingsRate >= -1 && <span className="ml-2 text-sm font-normal text-muted-foreground">{Math.round(month.savingsRate * 100)}%</span>}
            </dd>
          </div>
        </dl>
        {month.unpriced > 0 && (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            {month.unpriced} amount{month.unpriced === 1 ? "" : "s"} in another currency had no exchange rate for their day and are not counted.
          </p>
        )}
      </section>

      {data.schedules.length > 0 && (
        <section aria-labelledby="coming-heading" className="space-y-2">
          <div className="flex items-baseline justify-between">
            <h2 id="coming-heading" className="sr-only">Due soon</h2>
            <span />
            <button type="button" className="text-sm text-primary hover:underline" onClick={() => onGo("plan")}>All bills & pay</button>
          </div>
          <UpcomingPanel compact />
        </section>
      )}

      {transactions.length > 0 && (
        <section aria-labelledby="recent-heading">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 id="recent-heading" className="font-heading text-base font-semibold">Recent</h2>
            <button type="button" className="text-sm text-primary hover:underline" onClick={() => onGo("transactions")}>All transactions</button>
          </div>
          <ul className="divide-y rounded-surface border bg-card text-sm">
            {transactions.slice(0, 6).map((txn) => {
              const first = txn.postings[0];
              const account = first ? accountById.get(first.accountId) : undefined;
              return (
                <li key={txn.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-20 shrink-0 text-xs tabular-nums text-muted-foreground">{txn.date}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {txn.description}
                    <span className="block text-xs text-muted-foreground">
                      {txn.kind === "transfer" ? "Transfer" : categoryLabel(first?.categoryId ?? null, categoryById)}
                    </span>
                  </span>
                  {account && first && (
                    <Amount
                      minor={txn.postings.filter((p) => p.accountId === account.id).reduce((s, p) => s + p.amountMinor, 0)}
                      currency={account.currency}
                      tone="flow"
                      signed
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
