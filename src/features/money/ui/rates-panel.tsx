"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getErrorMessage } from "@/lib/utils";
import { addDays, isIsoDate } from "../domain/dates";
import { quoteAge } from "../domain/fx";
import { fetchLatest, fetchSeries, hasPublishedRate } from "../data/rate-source";
import { useSaveRatesMutation } from "../data/money-api";
import { ALL_CURRENCIES } from "./labels";
import { useMoney } from "./money-context";

/**
 * Exchange rates (V2-080): fetched from the ECB's published reference rates
 * for every currency the owner's accounts use, or typed in for the ones the
 * ECB does not publish.
 */
export function RatesPanel() {
  const { settings, accounts, rateTable, today, transactions } = useMoney();
  const [saveRates, saving] = useSaveRatesMutation();
  const [busy, setBusy] = useState(false);

  const used = useMemo(
    () =>
      [...new Set([settings.homeCurrency, ...accounts.map((a) => a.currency)])].filter((c) => c !== settings.baseCurrency).sort(),
    [accounts, settings],
  );
  const earliest = transactions.length ? transactions[transactions.length - 1].date : today;

  const refresh = async (history: boolean) => {
    setBusy(true);
    try {
      const published = used.filter(hasPublishedRate);
      const rows = history
        ? await fetchSeries(settings.baseCurrency, published, earliest < addDays(today, -7) ? earliest : addDays(today, -7))
        : await fetchLatest(settings.baseCurrency, published);
      await saveRates(rows.map((r) => ({ ...r, source: "ecb" }))).unwrap();
      toast.success(rows.length ? `Saved ${rows.length} rate${rows.length === 1 ? "" : "s"}` : "No new rates published");
    } catch (error) {
      toast.error("Couldn't fetch rates", { description: getErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="rates-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="rates-heading" className="font-heading text-lg font-semibold">Exchange rates</h2>
          <p className="text-sm text-muted-foreground">
            European Central Bank reference rates — the mid-market, not what a bank gives you. Each transaction keeps
            the rate from its own day.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refresh(false)} disabled={busy || saving.isLoading}>
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />} Latest
          </Button>
          <Button variant="outline" onClick={() => refresh(true)} disabled={busy || saving.isLoading}>
            History since {earliest}
          </Button>
        </div>
      </div>

      {used.length === 0 ? (
        <p className="text-sm text-muted-foreground">All your accounts are in {settings.baseCurrency}; no rates needed.</p>
      ) : (
        <ul className="divide-y rounded-surface border bg-card text-sm">
          {used.map((currency) => {
            const quote = rateTable.quote(currency, settings.baseCurrency, today);
            const inverse = rateTable.quote(settings.baseCurrency, currency, today);
            return (
              <li key={currency} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                <span className="w-12 font-medium">{currency}</span>
                <span className="flex-1 text-muted-foreground">
                  {quote && inverse
                    ? `1 ${settings.baseCurrency} = ${inverse.rate.toFixed(4)} ${currency} · as of ${quote.asOf}${quoteAge(quote, today) > 4 ? " (stale)" : ""}`
                    : hasPublishedRate(currency)
                      ? "No rate yet — fetch the latest."
                      : "Not published by the ECB — enter it below."}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <ManualRate currencies={used} />
    </section>
  );
}

function ManualRate({ currencies }: { currencies: string[] }) {
  const { settings, today } = useMoney();
  const [saveRates, saving] = useSaveRatesMutation();
  const [quote, setQuote] = useState(currencies[0] ?? "INR");
  const [date, setDate] = useState(today);
  const [rate, setRate] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = Number(rate);
    if (!isIsoDate(date) || !Number.isFinite(value) || value <= 0 || quote === settings.baseCurrency) {
      toast.error("Enter a date and a positive rate.");
      return;
    }
    try {
      await saveRates([{ base: settings.baseCurrency, quote, asOf: date, rate: value, source: "manual" }]).unwrap();
      toast.success("Rate saved");
      setRate("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-surface border bg-card p-4" noValidate>
      <p className="w-full text-sm font-medium">Enter a rate by hand</p>
      <div className="space-y-1">
        <Label htmlFor="rate-quote" className="text-xs">Currency</Label>
        <Select value={quote} onValueChange={setQuote}>
          <SelectTrigger id="rate-quote" className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ALL_CURRENCIES.filter((c) => c !== settings.baseCurrency).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="rate-date" className="text-xs">Date</Label>
        <Input id="rate-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="rate-value" className="text-xs">{quote} per 1 {settings.baseCurrency}</Label>
        <Input id="rate-value" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className="w-32" />
      </div>
      <Button type="submit" variant="outline" disabled={saving.isLoading}>Save rate</Button>
    </form>
  );
}
