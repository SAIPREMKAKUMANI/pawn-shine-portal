import { useEffect, useMemo, useState, useRef } from "react";
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
import { PageHeader } from "@/components/shared/page-header";
import { useCreatePledgeBill } from "@/hooks/use-bills.hook";
import { pledgeBillSchema, type PledgeBillFormValues } from "@/validators/pledge-bill.schema";
import { formatDateForApi } from "@/utils/format-date";
import { Plus, Trash2, Loader2, IndianRupee, Check, ChevronsUpDown, X } from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// ─── Custom Hooks & Components for Image Uploading ──────────────────────────

function useFilePreview(file: File | string | undefined) {
  const [preview, setPreview] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setPreview(undefined);
      return;
    }
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setPreview(file);
  }, [file]);

  return preview;
}

interface ItemImageUploaderProps {
  primaryValue: File | undefined;
  secondaryValues: (File | undefined)[];
  onChangePrimary: (file: File | undefined) => void;
  onChangeSecondary: (index: number, file: File | undefined) => void;
}

function ItemImageUploader({
  primaryValue,
  secondaryValues,
  onChangePrimary,
  onChangeSecondary,
}: ItemImageUploaderProps) {
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const secondaryRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const primaryPreview = useFilePreview(primaryValue);
  const secondaryPreviews = [
    useFilePreview(secondaryValues[0]),
    useFilePreview(secondaryValues[1]),
    useFilePreview(secondaryValues[2]),
  ];

  return (
    <div className="w-full md:w-[240px] shrink-0 flex flex-col gap-3">
      {/* Primary Image Upload Box */}
      <input
        ref={primaryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onChangePrimary(e.target.files[0]);
          }
        }}
      />
      {primaryPreview ? (
        <div className="relative w-full aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden group bg-muted/5 flex items-center justify-center">
          <img
            src={primaryPreview}
            alt="Primary Collateral"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => primaryInputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                onChangePrimary(undefined);
                if (primaryInputRef.current) primaryInputRef.current.value = "";
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => primaryInputRef.current?.click()}
          className="w-full aspect-square border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-muted/5 select-none transition-colors"
        >
          <Plus className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <span className="text-sm font-semibold text-foreground">Upload Primary Image</span>
          <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
        </div>
      )}

      {/* Secondary Image Boxes */}
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((idx) => {
          const preview = secondaryPreviews[idx];
          return (
            <div key={idx} className="relative aspect-square">
              <input
                ref={secondaryRefs[idx]}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onChangeSecondary(idx, e.target.files[0]);
                  }
                }}
              />
              {preview ? (
                <div className="relative w-full h-full border-2 border-dashed border-muted-foreground/20 rounded-lg overflow-hidden group bg-muted/5 flex items-center justify-center">
                  <img
                    src={preview}
                    alt={`Secondary ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      onClick={() => {
                        onChangeSecondary(idx, undefined);
                        if (secondaryRefs[idx].current) {
                          secondaryRefs[idx].current.value = "";
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => secondaryRefs[idx].current?.click()}
                  className="w-full h-full border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/5 transition-colors"
                >
                  <Plus className="h-5 w-5 text-muted-foreground/50" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

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
      custId: initialCustomerId,
      notes: "",
      billDate: formatDateForApi(new Date()),
      items: [{
        ornamentId: 0,
        description: "",
        weightGross: 0,
        weightNet: 0,
        amount: 0,
        interestRate: 0,
        location: "",
        dueDate: "",
        gracePeriodDays: 30,
        primaryImage: undefined,
        secondaryImages: [undefined, undefined, undefined]
      }],
      accounts: [{ accountId: 0, amount: 0 }],
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
    if (values.custId === 0) {
      form.setError("custId", { message: "Select a customer" });
      return;
    }
    if (values.items.some(i => i.ornamentId === 0)) {
      form.setError("items.0.ornamentId", { message: "Select ornament type" });
      return;
    }
    if (values.accounts.some(a => a.accountId === 0)) {
      form.setError("accounts.0.accountId", { message: "Select an account" });
      return;
    }

    const formData = new FormData();
    formData.append("custId", values.custId.toString());
    formData.append("billDate", values.billDate);
    formData.append("notes", values.notes);

    values.items.forEach((item, index) => {
      formData.append(`items[${index}].ornamentId`, item.ornamentId.toString());
      formData.append(`items[${index}].description`, item.description);
      formData.append(`items[${index}].weightGross`, item.weightGross.toString());
      formData.append(`items[${index}].weightNet`, item.weightNet.toString());
      formData.append(`items[${index}].amount`, item.amount.toString());
      formData.append(`items[${index}].interestRate`, item.interestRate.toString());
      formData.append(`items[${index}].location`, item.location);
      formData.append(`items[${index}].dueDate`, item.dueDate);
      formData.append(`items[${index}].gracePeriodDays`, item.gracePeriodDays.toString());
      
      if (item.primaryImage instanceof File) {
        formData.append(`items[${index}].itemImage`, item.primaryImage);
      }
      if (item.secondaryImages) {
        item.secondaryImages.forEach((img) => {
          if (img instanceof File) {
            formData.append(`items[${index}].itemImage`, img);
          }
        });
      }
    });

    values.accounts.forEach((acc, index) => {
      formData.append(`accounts[${index}].accountId`, acc.accountId.toString());
      formData.append(`accounts[${index}].amount`, acc.amount.toString());
    });

    pledgeMutation.mutate(formData, {
      onSuccess: () => navigate("/bills"),
    });
  }

  // Handle ornament selection to auto-fill interest rate
  function handleOrnamentChange(index: number, ornamentIdStr: string) {
    const id = parseInt(ornamentIdStr);
    const ornament = ornaments?.find(o => o.id === id);
    if (ornament) {
      form.setValue(`items.${index}.ornamentId`, id);
      form.setValue(`items.${index}.interestRate`, ornament.default_interest_rate);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="New Pledge Bill"
        description="Lend money against collateral"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Bill Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="custId" render={({ field }) => (
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
              <FormField control={form.control} name="billDate" render={({ field }) => (
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => itemFields.append({
                  ornamentId: 0,
                  description: "",
                  weightGross: 0,
                  weightNet: 0,
                  amount: 0,
                  interestRate: 0,
                  location: "",
                  dueDate: "",
                  gracePeriodDays: 30,
                  primaryImage: undefined,
                  secondaryImages: [undefined, undefined, undefined]
                })}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {itemFields.fields.map((itemField, index) => (
                <div key={itemField.id} className="p-4 border rounded-lg relative flex flex-col md:flex-row gap-6">
                  {index > 0 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={() => itemFields.remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}

                  {/* LEFT SIDE: Image Upload Option */}
                  <FormField
                    control={form.control}
                    name={`items.${index}`}
                    render={({ field }) => (
                      <ItemImageUploader
                        primaryValue={field.value.primaryImage}
                        secondaryValues={field.value.secondaryImages || [undefined, undefined, undefined]}
                        onChangePrimary={(file) => {
                          form.setValue(`items.${index}.primaryImage`, file);
                        }}
                        onChangeSecondary={(subIdx, file) => {
                          const currentSec = [...(form.getValues(`items.${index}.secondaryImages`) || [undefined, undefined, undefined])];
                          currentSec[subIdx] = file;
                          form.setValue(`items.${index}.secondaryImages`, currentSec);
                        }}
                      />
                    )}
                  />

                  {/* RIGHT SIDE: Form Input Fields */}
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <FormField control={form.control} name={`items.${index}.ornamentId`} render={({ field }) => (
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
                      <FormField control={form.control} name={`items.${index}.weightGross`} render={({ field }) => (
                        <FormItem><FormLabel>Gross Wt (g)</FormLabel><FormControl><Input type="number" step="0.001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`items.${index}.weightNet`} render={({ field }) => (
                        <FormItem><FormLabel>Net Wt (g)</FormLabel><FormControl><Input type="number" step="0.001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`items.${index}.amount`} render={({ field }) => (
                        <FormItem><FormLabel>Lend Amount (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`items.${index}.interestRate`} render={({ field }) => (
                        <FormItem><FormLabel>Interest %/mo</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <FormField control={form.control} name={`items.${index}.location`} render={({ field }) => (
                        <FormItem><FormLabel>Storage Location</FormLabel><FormControl><Input placeholder="e.g. Locker A3" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`items.${index}.dueDate`} render={({ field }) => (
                        <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`items.${index}.gracePeriodDays`} render={({ field }) => (
                        <FormItem><FormLabel>Grace Period (Days)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
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
              <Button type="button" variant="outline" size="sm" onClick={() => accountFields.append({ accountId: 0, amount: 0 })}>
                <Plus className="h-4 w-4 mr-1" /> Add Account
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {accountFields.fields.map((accField, index) => (
                <div key={accField.id} className="flex gap-4 items-end">
                  <FormField control={form.control} name={`accounts.${index}.accountId`} render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Account</FormLabel>
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
