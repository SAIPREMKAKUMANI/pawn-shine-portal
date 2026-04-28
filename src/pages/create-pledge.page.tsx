import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useCustomersList } from "@/hooks/use-customers.hook";
import { useOrnamentsList } from "@/hooks/use-ornaments.hook";
import { useAccountsList } from "@/hooks/use-accounts.hook";
import { useCreatePledgeBill } from "@/hooks/use-bills.hook";
import { pledgeBillSchema, type PledgeBillFormValues } from "@/validators/pledge-bill.schema";
import { formatDateForApi } from "@/utils/format-date";
import { Plus, Trash2, Loader2, IndianRupee, Check, ChevronsUpDown } from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function CreatePledgePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get("customerId");
  const initialCustomerId = urlCustomerId ? parseInt(urlCustomerId, 10) : 0;

  const { data: customers } = useCustomersList();
  const { data: ornaments } = useOrnamentsList();
  const { data: accounts } = useAccountsList();
  const pledgeMutation = useCreatePledgeBill();

  const [openCustomer, setOpenCustomer] = useState(false);

  const activeAccounts = accounts?.filter(a => a.is_active) ?? [];

  const form = useForm<PledgeBillFormValues>({
    resolver: zodResolver(pledgeBillSchema),
    defaultValues: {
      cust_id: initialCustomerId,
      notes: "",
      bill_date: formatDateForApi(new Date()),
      items: [{ ornament_id: 0, description: "", weight_gross: 0, weight_net: 0, amount: 0, interest_rate: 0, location: "", due_date: "", grace_period_days: 30 }],
      accounts: [{ account_id: 0, amount: 0 }],
    },
  });

  const itemFields = useFieldArray({ control: form.control, name: "items" });
  const accountFields = useFieldArray({ control: form.control, name: "accounts" });

  const watchItems = form.watch("items");
  const watchAccounts = form.watch("accounts");

  const totalItemsAmount = useMemo(() => watchItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [watchItems]);
  const totalAccountsAmount = useMemo(() => watchAccounts.reduce((sum, acc) => sum + (Number(acc.amount) || 0), 0), [watchAccounts]);
  const amountDiff = totalItemsAmount - totalAccountsAmount;

  function onSubmit(values: PledgeBillFormValues) {
    if (values.cust_id === 0) {
      form.setError("cust_id", { message: "Select a customer" });
      return;
    }
    if (values.items.some(i => i.ornament_id === 0)) {
      form.setError("items.0.ornament_id", { message: "Select ornament type" });
      return;
    }
    if (values.accounts.some(a => a.account_id === 0)) {
      form.setError("accounts.0.account_id", { message: "Select an account" });
      return;
    }
    pledgeMutation.mutate(values, {
      onSuccess: () => navigate("/bills"),
    });
  }

  // Handle ornament selection to auto-fill interest rate
  function handleOrnamentChange(index: number, ornamentIdStr: string) {
    const id = parseInt(ornamentIdStr);
    const ornament = ornaments?.find(o => o.id === id);
    if (ornament) {
      form.setValue(`items.${index}.ornament_id`, id);
      form.setValue(`items.${index}.interest_rate`, ornament.default_interest_rate);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">New Pledge Bill</h1>
        <p className="text-muted-foreground">Lend money against collateral</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Bill Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="cust_id" render={({ field }) => (
                <FormItem className="flex flex-col mt-2">
                  <FormLabel>Customer</FormLabel>
                  <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCustomer}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value && customers
                            ? (() => {
                                const c = customers.find((c) => c.cust_id === field.value);
                                return c ? `${c.name} (ID: ${c.cust_id})` : "Select a customer";
                              })()
                            : "Select a customer"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search customer by name or ID..." />
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup>
                            {customers?.map((c) => (
                              <CommandItem
                                value={`${c.cust_id} ${c.name}`}
                                key={c.cust_id}
                                onSelect={() => {
                                  field.onChange(c.cust_id);
                                  setOpenCustomer(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    c.cust_id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {c.name} (ID: {c.cust_id})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bill_date" render={({ field }) => (
                <FormItem><FormLabel>Bill Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem className="sm:col-span-2"><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="e.g. Needs money for wedding" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Collateral Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => itemFields.append({ ornament_id: 0, description: "", weight_gross: 0, weight_net: 0, amount: 0, interest_rate: 0, location: "", due_date: "", grace_period_days: 30 })}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {itemFields.fields.map((itemField, index) => (
                <div key={itemField.id} className="p-4 border rounded-lg relative space-y-4">
                  {index > 0 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => itemFields.remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField control={form.control} name={`items.${index}.ornament_id`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ornament Type</FormLabel>
                        <Select onValueChange={(val) => handleOrnamentChange(index, val)} value={field.value ? field.value.toString() : ""}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {ornaments?.map(o => <SelectItem key={o.id} value={o.id.toString()}>{o.type}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                      <FormItem className="lg:col-span-3"><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g. 22K Gold Chain" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <FormField control={form.control} name={`items.${index}.weight_gross`} render={({ field }) => (
                      <FormItem><FormLabel>Gross Wt (g)</FormLabel><FormControl><Input type="number" step="0.001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.weight_net`} render={({ field }) => (
                      <FormItem><FormLabel>Net Wt (g)</FormLabel><FormControl><Input type="number" step="0.001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.amount`} render={({ field }) => (
                      <FormItem><FormLabel>Lend Amount (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.interest_rate`} render={({ field }) => (
                      <FormItem><FormLabel>Interest %/mo</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField control={form.control} name={`items.${index}.location`} render={({ field }) => (
                      <FormItem><FormLabel>Storage Location</FormLabel><FormControl><Input placeholder="e.g. Locker A3" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.due_date`} render={({ field }) => (
                      <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.grace_period_days`} render={({ field }) => (
                      <FormItem><FormLabel>Grace Period (Days)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>
              ))}
              <div className="flex justify-end p-2 bg-muted/30 rounded-lg font-semibold">
                <span>Total Lending Amount: {formatCurrency(totalItemsAmount)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Funding Accounts</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => accountFields.append({ account_id: 0, amount: 0 })}>
                <Plus className="h-4 w-4 mr-1" /> Add Account
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {accountFields.fields.map((accField, index) => (
                <div key={accField.id} className="flex gap-4 items-end">
                  <FormField control={form.control} name={`accounts.${index}.account_id`} render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Account</FormLabel>
                      <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {activeAccounts.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.bank_name} (Bal: {formatCurrency(a.balance)})</SelectItem>)}
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
              <div className={`flex justify-end p-2 rounded-lg font-semibold ${amountDiff !== 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <span>Total from Accounts: {formatCurrency(totalAccountsAmount)}</span>
                <span className="mx-2">|</span>
                <span>Diff: {formatCurrency(Math.abs(amountDiff))}</span>
              </div>
              {amountDiff !== 0 && <p className="text-sm text-red-500 text-right">Warning: Funding accounts total must equal collateral lending total.</p>}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 text-lg" disabled={pledgeMutation.isPending}>
            {pledgeMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            <IndianRupee className="mr-2 h-5 w-5" /> Issue Pledge Bill
          </Button>
        </form>
      </Form>
    </div>
  );
}
