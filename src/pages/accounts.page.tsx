import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DateDisplay } from "@/components/shared/date-display";
import { useAccountsList, useAccountTransactions, useCreateAccount } from "@/hooks/use-accounts.hook";
import { createAccountSchema, type CreateAccountFormValues } from "@/validators/account.schema";
import { AccountType } from "@/types/enums";

import { Wallet, Plus, ArrowRight, Loader2, Building, Banknote } from "lucide-react";

function CreateAccountDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
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

function AccountTransactions({ accountId }: { accountId: number }) {
  const { data: page, isLoading } = useAccountTransactions(accountId);

  if (isLoading) return <LoadingSpinner message="Loading transactions..." />;
  const transactions = page?.content ?? [];

  if (!transactions.length) return <EmptyState icon={ArrowRight} title="No transactions yet" />;

  return (
    <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
      {transactions.map(t => (
        <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
          <div>
            <p className="font-medium text-sm">{t.description}</p>
            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
              <span>{t.reference_id}</span> • <DateDisplay dateString={t.transaction_date} />
            </div>
          </div>
          <div className="text-right">
            <CurrencyDisplay amount={t.amount} className={`font-semibold text-sm ${t.transaction_type === "CREDIT" ? "text-emerald-600" : "text-red-600"}`} />
            <p className="text-xs text-muted-foreground mt-1">Bal: <CurrencyDisplay amount={t.balance_after} /></p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccountsList();
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (isLoading) return <LoadingSpinner message="Loading accounts..." />;
  const activeAccounts = accounts ?? [];

  const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage shop bank and cash accounts</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Account
        </Button>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Balance Across All Accounts</p>
              <CurrencyDisplay amount={totalBalance} className="text-3xl font-bold text-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">Your Accounts</h2>
          {!activeAccounts.length ? (
            <EmptyState icon={Wallet} title="No accounts found" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {activeAccounts.map((account) => (
                <Card 
                  key={account.id} 
                  className={`cursor-pointer transition-all ${selectedAccountId === account.id ? "ring-2 ring-primary shadow-md" : "hover:shadow-[var(--shadow-gold)]"}`}
                  onClick={() => setSelectedAccountId(account.id)}
                >
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {account.account_type === AccountType.CASH ? <Banknote className="h-5 w-5 text-emerald-600" /> : <Building className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-semibold leading-none">{account.bank_name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{account.account_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <CurrencyDisplay amount={account.balance} className={`font-bold ${account.balance < 0 ? "text-red-600" : ""}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
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
