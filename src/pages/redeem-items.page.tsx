import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCustomersList } from "@/hooks/use-customers.hook";
import { useActiveCustomerItems } from "@/hooks/use-items.hook";
import { useAccountsList } from "@/hooks/use-accounts.hook";
import { useRedeemBill } from "@/hooks/use-bills.hook";
import { PageHeader } from "@/components/shared/page-header";
import { redeemBillSchema, type RedeemBillFormValues } from "@/validators/redeem-bill.schema";
import { formatDateForApi } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-currency";
import { Plus, Trash2, Loader2, IndianRupee, CheckCircle2, Wallet, ArrowDownRight, ShieldCheck } from "lucide-react";
import { useCustomerWallet, useWalletTransactions } from "@/hooks/use-wallet.hook";
import { DateDisplay } from "@/components/shared/date-display";

export default function RedeemItemsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: customers } = useCustomersList();
  const { data: accounts } = useAccountsList();
  const redeemMutation = useRedeemBill();

  // Read query params for auto-selection
  const preselectedCustomerId = searchParams.get("customerId") ? parseInt(searchParams.get("customerId")!) : null;
  const preselectedItemId = searchParams.get("itemId") ? parseInt(searchParams.get("itemId")!) : null;

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(preselectedCustomerId);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const { data: activeItems, isLoading: isLoadingItems } = useActiveCustomerItems(selectedCustomerId);
  
  const { data: wallet } = useCustomerWallet(selectedCustomerId);
  const { data: walletTx } = useWalletTransactions(selectedCustomerId);
  const depositTransactions = useMemo(() => walletTx?.filter(tx => tx.type === 'DEPOSIT') ?? [], [walletTx]);

  const activeAccounts = accounts?.filter(a => a.is_active) ?? [];

  const form = useForm<RedeemBillFormValues>({
    resolver: zodResolver(redeemBillSchema),
    defaultValues: {
      custId: preselectedCustomerId ?? 0,
      notes: "",
      billDate: formatDateForApi(new Date()),
      itemIds: [],
      walletAmountUsed: 0,
      accounts: [{ accountId: 0, amount: 0 }],
    },
  });

  const accountFields = useFieldArray({ control: form.control, name: "accounts" });
  
  const watchItemIds = form.watch("itemIds");
  const watchAccounts = form.watch("accounts");

  // Auto-select customer from URL params
  useEffect(() => {
    if (preselectedCustomerId && !hasAutoSelected) {
      setSelectedCustomerId(preselectedCustomerId);
      form.setValue("custId", preselectedCustomerId);
    }
  }, [preselectedCustomerId, hasAutoSelected, form]);

  // Auto-select item from URL params once items are loaded
  useEffect(() => {
    if (preselectedItemId && activeItems && !hasAutoSelected) {
      const itemExists = activeItems.some(i => i.id === preselectedItemId);
      if (itemExists) {
        form.setValue("itemIds", [preselectedItemId], { shouldValidate: true });
        setHasAutoSelected(true);
      }
    }
  }, [preselectedItemId, activeItems, hasAutoSelected, form]);

  // --- Auto-calculate wallet allocation ---
  const selectedItems = useMemo(() => {
    if (!activeItems) return [];
    return watchItemIds.map(id => activeItems.find(i => i.id === id)).filter(Boolean) as NonNullable<typeof activeItems>[number][];
  }, [watchItemIds, activeItems]);

  const totalPrincipal = useMemo(() => selectedItems.reduce((sum, item) => sum + item.amount_lended, 0), [selectedItems]);
  const totalInterest = useMemo(() => selectedItems.reduce((sum, item) => sum + item.compound_interest, 0), [selectedItems]);
  const totalOutstandingToPay = totalPrincipal + totalInterest;

  const walletBalance = wallet?.balance ?? 0;

  // Wallet covers principal first, then interest
  const walletForPrincipal = Math.min(walletBalance, totalPrincipal);
  const walletForInterest = Math.min(walletBalance - walletForPrincipal, totalInterest);
  const totalWalletUsed = walletForPrincipal + walletForInterest;
  const remainingToPay = Math.max(0, totalOutstandingToPay - totalWalletUsed);
  const walletCoversAll = remainingToPay <= 0 && totalOutstandingToPay > 0;

  // Auto-set walletAmountUsed on the form whenever selection changes
  useEffect(() => {
    form.setValue("walletAmountUsed", totalWalletUsed);
  }, [totalWalletUsed, form]);

  const totalAccountsAmount = useMemo(() => watchAccounts.reduce((sum, acc) => sum + (Number(acc.amount) || 0), 0), [watchAccounts]);
  const amountDiff = remainingToPay - totalAccountsAmount;

  function handleCustomerSelect(custIdStr: string) {
    const custId = parseInt(custIdStr);
    setSelectedCustomerId(custId);
    form.setValue("custId", custId);
    form.setValue("itemIds", []); // Reset items when customer changes
    setHasAutoSelected(false);
  }

  function handleItemToggle(itemId: number, checked: boolean) {
    const current = form.getValues("itemIds");
    if (checked) {
      form.setValue("itemIds", [...current, itemId], { shouldValidate: true });
    } else {
      form.setValue("itemIds", current.filter(id => id !== itemId), { shouldValidate: true });
    }
  }

  function onSubmit(values: RedeemBillFormValues) {
    if (values.custId === 0) {
      form.setError("custId", { message: "Select a customer" });
      return;
    }
    
    // Filter out accounts with 0 amount to avoid backend errors
    const validAccounts = values.accounts.filter(a => a.amount > 0 && a.accountId > 0);
    
    if (!walletCoversAll && validAccounts.some(a => a.accountId === 0)) {
      form.setError("accounts.0.accountId", { message: "Select an account" });
      return;
    }

    const formData = new FormData();
    formData.append("custId", values.custId.toString());
    formData.append("billDate", values.billDate);
    formData.append("notes", values.notes || "");

    values.itemIds.forEach((itemId) => {
      formData.append("itemIds", itemId.toString());
    });

    if (totalWalletUsed > 0) {
      formData.append("walletAmountUsed", totalWalletUsed.toString());
    }

    if (!walletCoversAll) {
      validAccounts.forEach((acc, index) => {
        formData.append(`accounts[${index}].accountId`, acc.accountId.toString());
        formData.append(`accounts[${index}].amount`, acc.amount.toString());
      });
    }

    redeemMutation.mutate(formData, {
      onSuccess: () => navigate("/bills"),
    });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Redeem Items"
        description="Process customer payments and release collateral"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>1. Select Customer</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="custId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={handleCustomerSelect} value={field.value ? field.value.toString() : ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {customers?.map(c => <SelectItem key={c.cust_id} value={c.cust_id.toString()}>{c.name} (ID: {c.cust_id})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="billDate" render={({ field }) => (
                <FormItem><FormLabel>Redemption Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          {selectedCustomerId !== null && (
            <Card>
              <CardHeader><CardTitle>2. Select Items to Redeem</CardTitle></CardHeader>
              <CardContent>
                {isLoadingItems ? (
                  <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : !activeItems?.length ? (
                  <div className="py-8 text-center text-muted-foreground">This customer has no active pledged items.</div>
                ) : (
                  <div className="space-y-4">
                    <FormField control={form.control} name="itemIds" render={() => (
                      <FormItem>
                        <div className="mb-4"><FormLabel className="text-base">Pledged Items</FormLabel><FormMessage /></div>
                        {activeItems.map(item => {
                          const isSelected = watchItemIds.includes(item.id);
                          const hasPaidAmount = item.paid_amount > 0;
                          const paidPercentage = item.paid_amount > 0 
                            ? Math.min(100, (item.paid_amount / (item.amount_lended + item.compound_interest)) * 100) 
                            : 0;

                          return (
                            <div 
                              key={item.id} 
                              className={`relative overflow-hidden p-4 border rounded-lg transition-all duration-200 ${
                                isSelected 
                                  ? "border-primary bg-primary/5 shadow-sm" 
                                  : hasPaidAmount 
                                    ? "border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/20" 
                                    : "hover:bg-muted/30"
                              }`}
                            >
                              {/* Paid progress bar at bottom */}
                              {hasPaidAmount && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30">
                                  <div 
                                    className="h-full bg-emerald-500 transition-all duration-500" 
                                    style={{ width: `${paidPercentage}%` }} 
                                  />
                                </div>
                              )}

                              <div className="flex items-center space-x-3">
                                <Checkbox 
                                  checked={isSelected} 
                                  onCheckedChange={(checked) => handleItemToggle(item.id, checked as boolean)} 
                                />
                                <div className="flex-1 flex justify-between items-center">
                                  <div>
                                    <p className="font-medium leading-none">{item.description}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Lended: {formatCurrency(item.amount_lended)} • Int: {formatCurrency(item.compound_interest)}
                                    </p>
                                    {hasPaidAmount && (
                                      <p className="text-sm mt-1 flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                          Paid: {formatCurrency(item.paid_amount)}
                                        </span>
                                        <span className="text-muted-foreground">
                                          ({paidPercentage.toFixed(0)}%)
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">
                                      {hasPaidAmount ? "Remaining Due" : "Total Due"}
                                    </p>
                                    <p className="font-bold text-primary text-lg">{formatCurrency(item.outstanding_balance)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </FormItem>
                    )} />
                    <div className="flex justify-end p-3 bg-muted/50 rounded-lg">
                      <span className="font-bold text-lg">Total to Collect: {formatCurrency(totalOutstandingToPay)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {watchItemIds.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>3. Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Wallet Coverage Section */}
                {walletBalance > 0 && (
                  <div className={`rounded-lg p-4 space-y-3 border ${
                    walletCoversAll 
                      ? "bg-emerald-500/10 border-emerald-500/30" 
                      : "bg-emerald-500/5 border-emerald-500/20"
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-medium">
                        <Wallet className="h-5 w-5" />
                        Wallet Balance: {formatCurrency(walletBalance)}
                      </div>
                      {walletCoversAll && (
                        <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Fully Covered
                        </div>
                      )}
                    </div>
                    
                    {/* Wallet allocation breakdown */}
                    {totalWalletUsed > 0 && (
                      <div className="bg-white/50 dark:bg-black/20 rounded-md p-3 space-y-2">
                        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Wallet Auto-Allocation</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Principal Coverage</span>
                            <span className="font-medium">
                              {formatCurrency(walletForPrincipal)} <span className="text-xs text-muted-foreground">/ {formatCurrency(totalPrincipal)}</span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${totalPrincipal > 0 ? (walletForPrincipal / totalPrincipal) * 100 : 0}%` }}
                            />
                          </div>
                          
                          {totalInterest > 0 && (
                            <>
                              <div className="flex justify-between items-center text-sm mt-1">
                                <span className="text-muted-foreground">Interest Coverage</span>
                                <span className="font-medium">
                                  {formatCurrency(walletForInterest)} <span className="text-xs text-muted-foreground">/ {formatCurrency(totalInterest)}</span>
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                  style={{ width: `${totalInterest > 0 ? (walletForInterest / totalInterest) * 100 : 0}%` }}
                                />
                              </div>
                            </>
                          )}
                          
                          <div className="flex justify-between items-center text-sm font-semibold pt-2 border-t border-emerald-500/20 mt-2">
                            <span>Total from Wallet</span>
                            <span className="text-emerald-700 dark:text-emerald-300">{formatCurrency(totalWalletUsed)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Deposit history for reference */}
                    {depositTransactions.length > 0 && (
                      <div className="bg-white/50 dark:bg-black/20 rounded-md p-3">
                        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-2">Deposit History (For Interest Calculation)</p>
                        <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-2">
                          {depositTransactions.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center text-xs">
                              <span className="flex items-center gap-1.5">
                                <ArrowDownRight className="h-3 w-3 text-emerald-500" />
                                <DateDisplay dateString={tx.transaction_date} />
                              </span>
                              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                {formatCurrency(tx.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Remaining amount notice */}
                {remainingToPay > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Remaining to pay via Cash/Bank: {formatCurrency(remainingToPay)}
                    </p>
                  </div>
                )}

                {/* Cash/Bank Accounts Section — only shown when wallet doesn't cover everything */}
                {!walletCoversAll && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">Cash/Bank Payments</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => accountFields.append({ accountId: 0, amount: 0 })}>
                        <Plus className="h-4 w-4 mr-1" /> Add Account
                      </Button>
                    </div>
                    {accountFields.fields.map((accField, index) => (
                      <div key={accField.id} className="flex gap-4 items-end">
                      <FormField control={form.control} name={`accounts.${index}.accountId`} render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Deposit To</FormLabel>
                          <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {activeAccounts.map(a => {
                                const absBalance = formatCurrency(Math.abs(a.balance));
                                const suffix = a.balance < 0 ? "Lent" : "In Hand";
                                return (
                                  <SelectItem key={a.id} value={a.id.toString()}>
                                    {a.bank_name} (Bal: {absBalance} {suffix})
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`accounts.${index}.amount`} render={({ field }) => (
                        <FormItem className="flex-1"><FormLabel>Amount (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                      {index > 0 && <Button type="button" variant="ghost" size="icon" className="mb-2" onClick={() => accountFields.remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                    </div>
                  ))}
                  </div>
                )}

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem className="mt-4"><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="e.g. Paid in full via cash" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                {/* Payment summary */}
                {walletCoversAll ? (
                  <div className="flex justify-end p-3 rounded-lg font-semibold text-lg items-center gap-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <div className="flex flex-col text-right text-sm font-normal">
                      <span>From Wallet: {formatCurrency(totalWalletUsed)}</span>
                    </div>
                    <div className="h-8 w-px bg-current opacity-20 mx-1"></div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-5 w-5" />
                      <span>Fully Covered</span>
                    </div>
                  </div>
                ) : (
                  <div className={`flex justify-end p-3 rounded-lg font-semibold text-lg items-center gap-4 ${amountDiff !== 0 ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'}`}>
                    <div className="flex flex-col text-right text-sm font-normal">
                      {totalWalletUsed > 0 && <span>From Wallet: {formatCurrency(totalWalletUsed)}</span>}
                      <span>From Accounts: {formatCurrency(totalAccountsAmount)}</span>
                    </div>
                    <div className="h-8 w-px bg-current opacity-20 mx-1"></div>
                    <div className="text-right">
                      <span>Diff: {formatCurrency(Math.abs(amountDiff))}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Button type="submit" className="w-full h-12 text-lg" disabled={redeemMutation.isPending || watchItemIds.length === 0}>
            {redeemMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            <IndianRupee className="mr-2 h-5 w-5" /> Confirm Redemption
          </Button>
        </form>
      </Form>
    </div>
  );
}
