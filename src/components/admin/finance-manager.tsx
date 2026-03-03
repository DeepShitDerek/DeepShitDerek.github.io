// src/components/admin/finance-manager.tsx
"use client";
import React, { useState, useMemo, FormEvent } from "react";
import type { FinancialGoal, RecurringTransaction, Transaction } from "@/types";
import { DateRange } from "react-day-picker";
import {
  addDays,
  format,
  startOfMonth,
  isBefore,
  isAfter,
  isSameDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionForm from "@/components/admin/transaction-form";
import RecurringTransactionForm from "@/components/admin/recurring-transaction-form";
import FinancialGoalForm from "@/components/admin/financial-goal-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartContainer } from "@/components/ui/chart";
import {
  Cell,
  ResponsiveContainer,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  RadialBar,
  RadialBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Search,
  TrendingUp,
  TrendingDown,
  Plus,
  Repeat,
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  Clock,
  ArrowRightLeft,
  Wallet,
  Home,
  LayoutDashboard,
  Menu,
  Target,
  X,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { cn, parseLocalDate } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  useGetFinancialDataQuery,
  useDeleteTransactionMutation,
  useDeleteRecurringMutation,
  useDeleteGoalMutation,
  useAddFundsToGoalMutation,
  useSaveTransactionMutation,
  useSaveRecurringMutation,
} from "@/store/api/adminApi";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { ManagerWrapper, PageHeader } from "./shared";
import {
  StatCard,
  GoalCard,
  ForecastTooltip,
  UpcomingRecurringList,
  AnalyticsTab,
} from "./finance";
import { getFirstOccurrence, getNextOccurrence } from "@/lib/finance-utils";

const Calendar = dynamic(
  () => import("@/components/ui/calendar").then((mod) => mod.Calendar),
  { ssr: false },
);

type DialogState = {
  type: "transaction" | "recurring" | "goal" | "addFunds" | null;
  data?: any;
};

const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object") {
    if ("message" in err && typeof err.message === "string") return err.message;
    if (
      "data" in err &&
      err.data &&
      typeof err.data === "object" &&
      "message" in err.data
    ) {
      return String(err.data.message);
    }
  }
  return "An unexpected error occurred";
};

const BottomNavButton = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: any;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
    )}
  >
    <Icon className="size-5" />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default function FinanceManager() {
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [sheetState, setSheetState] = useState<DialogState>({ type: null });
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const { data: financialData, isLoading, error } = useGetFinancialDataQuery();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [deleteRecurring] = useDeleteRecurringMutation();
  const [deleteGoal] = useDeleteGoalMutation();
  const [addFundsToGoal] = useAddFundsToGoalMutation();
  const [saveTransaction] = useSaveTransactionMutation();
  const [saveRecurring] = useSaveRecurringMutation();

  const { transactions = [], goals = [], recurring = [] } = financialData || {};

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionDate = parseLocalDate(t.date);
      const descriptionMatch = t.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!date?.from) return descriptionMatch;
      const toDate = date.to ? addDays(date.to, 1) : new Date(8640000000000000);
      const dateMatch =
        transactionDate >= date.from && transactionDate < toDate;
      return descriptionMatch && dateMatch;
    });
  }, [transactions, searchTerm, date]);

  const { totalEarnings, totalExpenses, netIncome, expenseByCategory } =
    useMemo(() => {
      let earnings = 0,
        expenses = 0;
      const categoryMap: Record<string, number> = {};
      for (const t of filteredTransactions) {
        if (t.type === "earning") earnings += t.amount;
        else {
          expenses += t.amount;
          const category = t.category || "Uncategorized";
          categoryMap[category] = (categoryMap[category] || 0) + t.amount;
        }
      }
      const expenseData = Object.entries(categoryMap)
        .map(([name, value], index) => ({
          name,
          value,
          fill: CHART_COLORS[Math.floor(index % CHART_COLORS.length)],
        }))
        .sort((a, b) => b.value - a.value);
      return {
        totalEarnings: earnings,
        totalExpenses: expenses,
        netIncome: earnings - expenses,
        expenseByCategory: expenseData,
      };
    }, [filteredTransactions]);

  const allCategories = useMemo(() => {
    return Array.from(
      new Set(
        transactions
          .filter((t) => t.type === "expense" && t.category)
          .map((t) => t.category!),
      ),
    ).sort();
  }, [transactions]);

  const allYearsWithData = useMemo(() => {
    const years = new Set(
      transactions.map((t) => parseLocalDate(t.date).getFullYear()),
    );
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const forecastData = useMemo(() => {
    const today = new Date();
    const forecastDays = 30;
    const endDate = addDays(today, forecastDays);
    const dailyChanges: Record<string, { change: number; events: string[] }> =
      {};

    recurring.forEach((rule) => {
      let nextDate = rule.last_processed_date
        ? getNextOccurrence(parseLocalDate(rule.last_processed_date), rule)
        : parseLocalDate(rule.start_date);
      while (isBefore(nextDate, today) && !isSameDay(nextDate, today)) {
        nextDate = getNextOccurrence(nextDate, rule);
      }

      while (isBefore(nextDate, endDate)) {
        const ruleEndDate = rule.end_date
          ? parseLocalDate(rule.end_date)
          : null;
        if (ruleEndDate && isAfter(nextDate, ruleEndDate)) break;
        if (isAfter(nextDate, today) || isSameDay(nextDate, today)) {
          const dayStr = format(nextDate, "yyyy-MM-dd");
          if (!dailyChanges[dayStr]) {
            dailyChanges[dayStr] = { change: 0, events: [] };
          }
          const amount = rule.type === "earning" ? rule.amount : -rule.amount;
          dailyChanges[dayStr].change += amount;
          dailyChanges[dayStr].events.push(
            `${rule.type === "earning" ? "+" : "-"}$${rule.amount.toFixed(2)}: ${rule.description}`,
          );
        }
        nextDate = getNextOccurrence(nextDate, rule);
      }
    });

    let cumulativeBalance = 0;
    return Array.from({ length: forecastDays + 1 }, (_, i) => {
      const currentDate = addDays(today, i);
      const dayStr = format(currentDate, "yyyy-MM-dd");
      cumulativeBalance += dailyChanges[dayStr]?.change || 0;
      return {
        date: format(currentDate, "MMM d"),
        balance: cumulativeBalance,
        events: dailyChanges[dayStr]?.events || [],
      };
    });
  }, [recurring]);

  const handleOpenSheet = (
    type: NonNullable<DialogState["type"]>,
    data?: any,
  ) => {
    setSheetState({ type, data });
    setIsAddDrawerOpen(false);
  };
  const handleCloseSheet = () => setSheetState({ type: null });

  const handleDelete = async (
    type: "transactions" | "recurring_transactions" | "financial_goals",
    id: string,
    message: string,
  ) => {
    const ok = await confirm({
      title: "Confirm Deletion",
      description: message,
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const mutation =
        type === "transactions"
          ? deleteTransaction
          : type === "recurring_transactions"
            ? deleteRecurring
            : deleteGoal;
      await mutation(id).unwrap();
      toast.success("Item deleted.");
    } catch (err: unknown) {
      toast.error(`Failed to delete: ${getErrorMessage(err)}`);
    }
  };

  const handleAddFunds = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get("amount") as string);
    const goal = sheetState.data as FinancialGoal;
    if (!amount || amount <= 0 || !goal) {
      toast.error("Invalid amount.");
      return;
    }
    try {
      await addFundsToGoal({ goal, amount }).unwrap();
      toast.success(`$${amount.toFixed(2)} added.`);
      handleCloseSheet();
    } catch (err: unknown) {
      toast.error("Failed to add funds", { description: getErrorMessage(err) });
    }
  };

  const handleConfirmRecurring = async (
    rule: RecurringTransaction,
    date: Date,
  ) => {
    try {
      await saveTransaction({
        date: format(date, "yyyy-MM-dd"),
        description: rule.description,
        amount: rule.amount,
        type: rule.type,
        category: rule.category,
        recurring_transaction_id: rule.id,
      }).unwrap();
      await saveRecurring({
        id: rule.id,
        last_processed_date: format(date, "yyyy-MM-dd"),
      }).unwrap();
      toast.success("Transaction logged.");
    } catch (err: unknown) {
      toast.error("Failed to log", { description: getErrorMessage(err) });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p>Error loading data.</p>;

  return (
    <ManagerWrapper className="pb-20 md:pb-4">
      <PageHeader
        sticky
        title="Finance"
        description={
          date?.from
            ? date.to
              ? `${format(date.from, "MMM d")} - ${format(date.to, "MMM d, yyyy")}`
              : format(date.from, "MMMM d, yyyy")
            : "Select a date range"
        }
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Filter..."
        filters={
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <CalendarIcon className="mr-2 size-4" /> Date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        }
        actions={
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-9">
                  <Plus className="mr-2 size-4" /> Add New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => handleOpenSheet("transaction")}
                >
                  <ArrowRightLeft className="mr-2 size-4" /> Transaction
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleOpenSheet("recurring")}>
                  <Repeat className="mr-2 size-4" /> Recurring Rule
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleOpenSheet("goal")}>
                  <Target className="mr-2 size-4" /> Goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6 mt-6"
      >
        {/* Desktop Tabs List (Hidden on Mobile) */}
        <div className="hidden md:block">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile Bottom Navigation Bar (Visible on Mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur border-t grid grid-cols-5 items-center px-1 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <BottomNavButton
            icon={Home}
            label="Home"
            isActive={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <BottomNavButton
            icon={ArrowRightLeft}
            label="Trans."
            isActive={activeTab === "transactions"}
            onClick={() => setActiveTab("transactions")}
          />
          <div className="relative -top-5 flex justify-center">
            <Button
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 border-4 border-background"
              onClick={() => setIsAddDrawerOpen(true)}
            >
              <Plus className="size-6 text-primary-foreground" />
            </Button>
          </div>
          <BottomNavButton
            icon={Repeat}
            label="Recurring"
            isActive={activeTab === "recurring"}
            onClick={() => setActiveTab("recurring")}
          />
          <BottomNavButton
            icon={Menu}
            label="More"
            isActive={activeTab === "goals" || activeTab === "analytics"}
            onClick={() => setIsMoreDrawerOpen(true)}
          />
        </div>

        {/* TAB CONTENT */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Net Income"
              value={`${netIncome >= 0 ? "+" : "-"}$${Math.abs(netIncome).toFixed(2)}`}
              icon={<Wallet className="size-4" />}
              trend={netIncome >= 0 ? "up" : "down"}
              className={netIncome < 0 ? "border-red-500/20" : ""}
            />
            <StatCard
              title="Earnings"
              value={`$${totalEarnings.toFixed(2)}`}
              icon={<ArrowUp className="size-4" />}
              trend="up"
            />
            <StatCard
              title="Expenses"
              value={`$${totalExpenses.toFixed(2)}`}
              icon={<ArrowDown className="size-4" />}
              trend="down"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">30-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-48 w-full">
                  <ResponsiveContainer>
                    <LineChart
                      data={forecastData}
                      margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border)/0.5)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 10,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => `$${v}`}
                        tick={{
                          fontSize: 10,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip content={<ForecastTooltip />} />
                      <ReferenceLine
                        y={0}
                        stroke="hsl(var(--border))"
                        strokeDasharray="3 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="size-4 text-primary" /> Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[250px] overflow-y-auto pr-1">
                <UpcomingRecurringList
                  recurring={recurring}
                  onConfirm={handleConfirmRecurring}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(parseLocalDate(t.date), "MMM dd")}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <span className="truncate max-w-[140px] sm:max-w-xs">
                              {t.description}
                            </span>
                            <Badge
                              variant="secondary"
                              className="md:hidden w-fit text-[10px]"
                            >
                              {t.category || "General"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline">{t.category || "–"}</Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold font-mono whitespace-nowrap",
                            t.type === "earning"
                              ? "text-green-500"
                              : "text-red-500",
                          )}
                        >
                          {t.type === "earning" ? "+" : "-"}$
                          {t.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleOpenSheet("transaction", t)
                                }
                              >
                                <Edit className="mr-2 size-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() =>
                                  handleDelete(
                                    "transactions",
                                    t.id,
                                    `Delete transaction "${t.description}"?`,
                                  )
                                }
                              >
                                <Trash2 className="mr-2 size-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="recurring">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Schedule
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurring.map((r) => {
                    let nextDueDate = "N/A";
                    try {
                      let next: Date;
                      if (r.last_processed_date) {
                        next = getNextOccurrence(
                          parseLocalDate(r.last_processed_date),
                          r,
                        );
                      } else {
                        next = getFirstOccurrence(
                          parseLocalDate(r.start_date),
                          r,
                        );
                      }
                      nextDueDate = format(next, "MMM d, yyyy");
                    } catch (e) {}
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          <p className="truncate max-w-[150px]">
                            {r.description}
                          </p>
                          <p className="md:hidden text-xs text-muted-foreground capitalize">
                            {r.frequency} ({nextDueDate.split(",")[0]})
                          </p>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "font-mono",
                            r.type === "earning"
                              ? "text-green-500"
                              : "text-red-500",
                          )}
                        >
                          ${r.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell capitalize">
                          {r.frequency}{" "}
                          <span className="text-xs text-muted-foreground">
                            (Next: {nextDueDate})
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => handleOpenSheet("recurring", r)}
                              >
                                <Edit className="mr-2 size-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() =>
                                  handleDelete(
                                    "recurring_transactions",
                                    r.id,
                                    "Delete rule?",
                                  )
                                }
                              >
                                <Trash2 className="mr-2 size-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAddFunds={() => handleOpenSheet("addFunds", goal)}
                onEdit={() => handleOpenSheet("goal", goal)}
                onDelete={() =>
                  handleDelete("financial_goals", goal.id, `Delete goal?`)
                }
              />
            ))}
            {goals.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                No goals yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab
            transactions={transactions}
            allYears={allYearsWithData}
            allCategories={allCategories}
            recurring={recurring}
          />
        </TabsContent>
      </Tabs>

      {/* --- DRAWERS & SHEETS (SHARED) --- */}

      <Drawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add New</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start h-12 text-base"
              onClick={() => handleOpenSheet("transaction")}
            >
              <ArrowRightLeft className="mr-3 size-5 text-primary" />{" "}
              Transaction
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12 text-base"
              onClick={() => handleOpenSheet("recurring")}
            >
              <Repeat className="mr-3 size-5 text-blue-500" /> Recurring Rule
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12 text-base"
              onClick={() => handleOpenSheet("goal")}
            >
              <Target className="mr-3 size-5 text-orange-500" /> Goal
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={isMoreDrawerOpen} onOpenChange={setIsMoreDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8 space-y-2">
            <Button
              variant={activeTab === "goals" ? "secondary" : "ghost"}
              className="w-full justify-start h-12"
              onClick={() => {
                setActiveTab("goals");
                setIsMoreDrawerOpen(false);
              }}
            >
              <Target className="mr-3 size-5" /> Goals
            </Button>
            <Button
              variant={activeTab === "analytics" ? "secondary" : "ghost"}
              className="w-full justify-start h-12"
              onClick={() => {
                setActiveTab("analytics");
                setIsMoreDrawerOpen(false);
              }}
            >
              <LayoutDashboard className="mr-3 size-5" /> Analytics
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Sheet
        open={!!sheetState.type}
        onOpenChange={(open) => !open && handleCloseSheet()}
      >
        <SheetContent className="sm:max-w-lg w-full flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center shrink-0">
            <SheetHeader>
              <SheetTitle className="capitalize">
                {sheetState.type === "addFunds"
                  ? "Add Funds"
                  : `${sheetState.data ? "Edit" : "New"} ${sheetState.type}`}
              </SheetTitle>
            </SheetHeader>
            <SheetClose asChild>
              <Button type="button" variant="ghost" size="icon">
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>
          <div className="mt-4 flex-1 overflow-y-auto pr-6">
            {sheetState.type === "transaction" && (
              <TransactionForm
                transaction={sheetState.data}
                onSuccess={handleCloseSheet}
                categories={allCategories}
              />
            )}
            {sheetState.type === "recurring" && (
              <RecurringTransactionForm
                recurringTransaction={sheetState.data}
                onSuccess={handleCloseSheet}
              />
            )}
            {sheetState.type === "goal" && (
              <FinancialGoalForm
                goal={sheetState.data}
                onSuccess={handleCloseSheet}
              />
            )}
            {sheetState.type === "addFunds" && (
              <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                  <Label htmlFor="add-funds-amount">Amount</Label>
                  <Input
                    id="add-funds-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    autoFocus
                    className="text-lg"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCloseSheet}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Confirm</Button>
                </div>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </ManagerWrapper>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}
