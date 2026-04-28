import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { redeemBillSchema, type RedeemBillFormValues } from "@/validators/redeem-bill.schema";
import { formatDateForApi } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-currency";
import { Plus, Trash2, Loader2, IndianRupee } from "lucide-react";

export default function RedeemItemsPage() {
  const navigate = useNavigate();
  const { data: customers } = useCustomersList();
  const { data: accounts } = useAccountsList();
  const redeemMutation = useRedeemBill();

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { data: activeItems, isLoading: isLoadingItems } = useActiveCustomerItems(selectedCustomerId);

  const activeAccounts = accounts?.filter(a => a.is_active) ?? [];

  const form = useForm<RedeemBillFormValues>({
    resolver: zodResolver(redeemBillSchema),
    defaultValues: {
      cust_id: 0,
      notes: "",
      bill_date: formatDateForApi(new Date()),
      item_ids: [],
      accounts: [{ account_id: 0, amount: 0 }],
    },
  });

  const accountFields = useFieldArray({ control: form.control, name: "accounts" });
  
  const watchItemIds = form.watch("item_ids");
  const watchAccounts = form.watch("accounts");

  const totalOutstandingToPay = useMemo(() => {
    if (!activeItems) return 0;
    return watchItemIds.reduce((sum, itemId) => {
      const item = activeItems.find(i => i.id === itemId);
      return sum + (item?.outstanding_balance || 0);
    }, 0);
  }, [watchItemIds, activeItems]);

  const totalAccountsAmount = useMemo(() => watchAccounts.reduce((sum, acc) => sum + (Number(acc.amount) || 0), 0), [watchAccounts]);
  const amountDiff = totalOutstandingToPay - totalAccountsAmount;

  function handleCustomerSelect(custIdStr: string) {
    const custId = parseInt(custIdStr);
    setSelectedCustomerId(custId);
    form.setValue("cust_id", custId);
    form.setValue("item_ids", []); // Reset items when customer changes
  }

  function handleItemToggle(itemId: number, checked: boolean) {
    const current = form.getValues("item_ids");
    if (checked) {
      form.setValue("item_ids", [...current, itemId], { shouldValidate: true });
    } else {
      form.setValue("item_ids", current.filter(id => id !== itemId), { shouldValidate: true });
    }
  }

  function onSubmit(values: RedeemBillFormValues) {
    if (values.cust_id === 0) {
      form.setError("cust_id", { message: "Select a customer" });
      return;
    }
    if (values.accounts.some(a => a.account_id === 0)) {
      form.setError("accounts.0.account_id", { message: "Select an account" });
      return;
    }
    redeemMutation.mutate(values, {
      onSuccess: () => navigate("/bills"),
    });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Redeem Items</h1>
        <p className="text-muted-foreground">Process customer payments and release collateral</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>1. Select Customer</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="cust_id" render={({ field }) => (
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
              <FormField control={form.control} name="bill_date" render={({ field }) => (
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
                    <FormField control={form.control} name="item_ids" render={() => (
                      <FormItem>
                        <div className="mb-4"><FormLabel className="text-base">Pledged Items</FormLabel><FormMessage /></div>
                        {activeItems.map(item => (
                          <div key={item.id} className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <Checkbox 
                              checked={watchItemIds.includes(item.id)} 
                              onCheckedChange={(checked) => handleItemToggle(item.id, checked as boolean)} 
                            />
                            <div className="flex-1 flex justify-between items-center">
                              <div>
                                <p className="font-medium leading-none">{item.description}</p>
                                <p className="text-sm text-muted-foreground mt-1">Lended: {formatCurrency(item.amount_lended)} • Int: {formatCurrency(item.compound_interest)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total Due</p>
                                <p className="font-bold text-primary">{formatCurrency(item.outstanding_balance)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
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
                <CardTitle>3. Receive Payment</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => accountFields.append({ account_id: 0, amount: 0 })}>
                  <Plus className="h-4 w-4 mr-1" /> Add Account
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {accountFields.fields.map((accField, index) => (
                  <div key={accField.id} className="flex gap-4 items-end">
                    <FormField control={form.control} name={`accounts.${index}.account_id`} render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Deposit To</FormLabel>
                        <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {activeAccounts.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.bank_name}</SelectItem>)}
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
                
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem className="mt-4"><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="e.g. Paid in full via cash" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className={`flex justify-end p-2 rounded-lg font-semibold ${amountDiff !== 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <span>Collected: {formatCurrency(totalAccountsAmount)}</span>
                  <span className="mx-2">|</span>
                  <span>Diff: {formatCurrency(Math.abs(amountDiff))}</span>
                </div>
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
