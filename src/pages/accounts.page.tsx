import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DateDisplay } from "@/components/shared/date-display";
import { PageHeader } from "@/components/shared/page-header";
import { useAccountsList, useAccountTransactions, useCreateAccount } from "@/hooks/use-accounts.hook";
import { createAccountSchema, type CreateAccountFormValues } from "@/validators/account.schema";
import { AccountType } from "@/types/enums";

import {
  Wallet,
  Plus,
  ArrowRight,
  Loader2,
  Building,
  Banknote,
  TrendingUp,
  TrendingDown,
  Scale,
} from "lucide-react";

// ─── Utilities ───────────────────────────────────────────────

/**
 * Converts underscore-separated enum values to readable title case.
 * e.g. "CASH_COUNTER" → "Cash Counter", "PRIMARY_ACCOUNT" → "Primary Account"
 */
function humanizeLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// ─── Create Account Dialog ──────────────────────────────────

function CreateAccountDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createMutation = useCreateAccount();
  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { account_number: "", bank_name: "", account_type: AccountType.BANK },
  });

  function onSubmit(values: CreateAccountFormValues) {
    createMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>Create a new cash or bank account for tracking funds.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="bank_name" render={({ field }) => (
              <FormItem><FormLabel>Account/Bank Name</FormLabel><FormControl><Input placeholder="e.g. Cash Drawer or SBI" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="account_number" render={({ field }) => (
              <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Enter account number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="account_type" render={({ field }) => (
              <FormItem><FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value={AccountType.CASH}>Cash</SelectItem>
                    <SelectItem value={AccountType.BANK}>Bank</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Account
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Zone 4: Transaction History ────────────────────────────

function AccountTransactions({ accountId }: { accountId: number }) {
  const { data: page, isLoading } = useAccountTransactions(accountId);

  if (isLoading) return <LoadingSpinner message="Loading transactions..." />;
  const transactions = page?.content ?? [];

  if (!transactions.length) return <EmptyState icon={ArrowRight} title="No transactions yet" />;

  return (
    <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
      {transactions.map((t) => {
        const isCredit = t.transaction_type === "CREDIT";
        const absBalanceAfter = Math.abs(t.balance_after);
        const balanceLabel = t.balance_after < 0 ? "Lent" : "In Hand";

        return (
          <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div>
              <p className="font-medium text-sm">{t.description}</p>
              <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                <span>{t.reference_id}</span> • <DateDisplay dateString={t.transaction_date} />
              </div>
            </div>
            <div className="text-right">
              <span className={`font-semibold text-sm ${isCredit ? "text-emerald-600" : "text-red-600"}`}>
                {isCredit ? "+" : "-"}
                <CurrencyDisplay amount={t.amount} />
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Bal: <CurrencyDisplay amount={absBalanceAfter} /> <span className="opacity-70">({balanceLabel})</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccountsList();
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (isLoading) return <LoadingSpinner message="Loading accounts..." />;
  const activeAccounts = accounts ?? [];

  // Derive all totals from the accounts array — no extra API calls
  const totalDisbursed = activeAccounts.reduce((s, a) => s + a.disbursed_amount, 0);
  const totalRepaid = activeAccounts.reduce((s, a) => s + a.repaid_amount, 0);
  const totalBalance = activeAccounts.reduce((s, a) => s + a.balance, 0);
  const netLabel = totalBalance < 0 ? "Net Lent" : "Net Inflow";

  return (
    <div className="space-y-4">

      {/* ── Zone 1: Boxed Header ─────────────────────────────── */}
      <PageHeader
        title="Accounts"
        badge={
          <Badge variant="default" className="text-xs">
            {activeAccounts.length} {activeAccounts.length === 1 ? "Account" : "Accounts"}
          </Badge>
        }
        action={
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Account
          </Button>
        }
      />

      {/* ── Zone 2: Capital Flow Overview ────────────────────── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {/* Total Capital Disbursed */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Disbursed</p>
              <CurrencyDisplay amount={totalDisbursed} className="text-xl font-bold text-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Total Capital Repaid */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <TrendingDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Repaid</p>
              <CurrencyDisplay amount={totalRepaid} className="text-xl font-bold text-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Net Cash Position */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Net Cash Position</p>
              <div className="flex items-center gap-2">
                <CurrencyDisplay amount={Math.abs(totalBalance)} className="text-xl font-bold text-foreground" />
                <Badge variant={totalBalance < 0 ? "warning" : "success"} className="text-[10px]">
                  {netLabel}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Zone 3 & 4: Accounts Grid + Transaction History ── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Zone 3: Your Accounts */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">Your Accounts</h2>
          {!activeAccounts.length ? (
            <EmptyState icon={Wallet} title="No accounts found" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {activeAccounts.map((account) => {
                const absBalance = Math.abs(account.balance);
                const isLent = account.balance < 0;
                const directionLabel = isLent ? "Net Lent" : "Net Inflow";

                return (
                  <Card
                    key={account.id}
                    className={`cursor-pointer transition-all ${
                      selectedAccountId === account.id
                        ? "ring-2 ring-primary shadow-md border-primary/50"
                        : "hover:shadow-[var(--shadow-gold)]"
                    }`}
                    onClick={() => setSelectedAccountId(account.id)}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Top row: icon + name + balance */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {account.account_type === AccountType.CASH ? (
                              <Banknote className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <Building className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold leading-none">{account.bank_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {humanizeLabel(account.account_number)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <CurrencyDisplay amount={absBalance} className="font-bold" />
                          <Badge
                            variant={isLent ? "warning" : "success"}
                            className="text-[10px] mt-1 block w-fit ml-auto"
                          >
                            {directionLabel}
                          </Badge>
                        </div>
                      </div>

                      {/* Bottom row: disbursed / repaid metrics */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                        <span>
                          Disbursed: <CurrencyDisplay amount={account.disbursed_amount} className="font-medium text-foreground" />
                        </span>
                        <span>
                          Repaid: <CurrencyDisplay amount={account.repaid_amount} className="font-medium text-foreground" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Zone 4: Transaction History */}
        <Card className="h-fit">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAccountId ? (
              <AccountTransactions accountId={selectedAccountId} />
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <ArrowRight className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p>Select an account to view its transactions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateAccountDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
