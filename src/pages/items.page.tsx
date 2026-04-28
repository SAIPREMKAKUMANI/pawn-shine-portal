import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DateDisplay } from "@/components/shared/date-display";
import { StatusBadge } from "@/components/shared/status-badge";
import { useItemsByStatus } from "@/hooks/use-items.hook";
import { useRecordInterest, useInterestHistory } from "@/hooks/use-interest.hook";
import { interestRecordSchema, type InterestRecordFormValues } from "@/validators/interest.schema";
import { ItemStatus } from "@/types/enums";
import type { ItemDto } from "@/types/api.types";
import { Package, Search, Calculator, Loader2, ArrowRight } from "lucide-react";

function RecordInterestDialog({ open, onOpenChange, item }: { open: boolean, onOpenChange: (open: boolean) => void, item: ItemDto }) {
  const recordMutation = useRecordInterest();
  const form = useForm<InterestRecordFormValues>({
    resolver: zodResolver(interestRecordSchema),
    defaultValues: { item_id: item.id, interest_amount: 0 },
  });

  function onSubmit(values: InterestRecordFormValues) {
    recordMutation.mutate(values, {
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
          <DialogTitle>Record Interest</DialogTitle>
        </DialogHeader>
        <div className="bg-muted/30 p-3 rounded-lg mb-4 space-y-1 text-sm">
          <p><span className="text-muted-foreground">Item:</span> {item.description}</p>
          <p><span className="text-muted-foreground">Principal:</span> <CurrencyDisplay amount={item.amount_lended} /></p>
          <p><span className="text-muted-foreground">Current Interest:</span> <CurrencyDisplay amount={item.compound_interest} /></p>
          <p><span className="text-muted-foreground">Total Due:</span> <CurrencyDisplay amount={item.outstanding_balance} className="font-semibold text-primary" /></p>
        </div>
        <div className="mb-4 border-t pt-4">
          <h4 className="font-semibold text-sm mb-2">Interest History</h4>
          <ItemInterestHistory itemId={item.id} />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="interest_amount" render={({ field }) => (
              <FormItem><FormLabel>Interest Amount to Add (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={recordMutation.isPending}>
              {recordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Record Interest
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ItemInterestHistory({ itemId }: { itemId: number }) {
  const { data: history, isLoading } = useInterestHistory(itemId);
  
  if (isLoading) return <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;
  if (!history?.length) return <div className="p-4 text-center text-sm text-muted-foreground">No interest recorded yet.</div>;

  return (
    <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto">
      {history.map(record => (
        <div key={record.id} className="flex justify-between items-center p-2 border-b last:border-0 text-sm">
          <div>
            <p className="font-medium"><DateDisplay dateString={record.ledger_date} /></p>
            <p className="text-xs text-muted-foreground">+ <CurrencyDisplay amount={record.interest_amount} /></p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-primary"><CurrencyDisplay amount={record.cumulative_interest} /></p>
            <p className="text-xs text-muted-foreground">Bal: <CurrencyDisplay amount={record.outstanding_balance} /></p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ItemsList({ status }: { status: ItemStatus }) {
  const { data: page, isLoading } = useItemsByStatus(status);
  const [searchQuery, setSearchQuery] = useState("");
  const [interestDialogOpen, setInterestDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemDto | null>(null);

  if (isLoading) return <LoadingSpinner message={`Loading ${status.toLowerCase()} items...`} />;
  const items = page?.content ?? [];
  const filteredItems = items.filter(i => 
    i.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 mt-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by item description or customer..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {!filteredItems.length ? (
        <EmptyState icon={Package} title={`No ${status.toLowerCase()} items found`} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => (
            <Card key={item.id} className="flex flex-col">
              <CardContent className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-muted-foreground">ID: {item.id}</span>
                </div>
                <h3 className="font-bold text-lg leading-tight mb-1">{item.description}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.customer_name} • {item.weight_net}g</p>
                
                <div className="space-y-1 text-sm bg-muted/20 p-3 rounded-lg">
                  <div className="flex justify-between"><span className="text-muted-foreground">Principal:</span> <span><CurrencyDisplay amount={item.amount_lended} /></span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Interest:</span> <span><CurrencyDisplay amount={item.compound_interest} /></span></div>
                  <div className="flex justify-between font-semibold pt-1 border-t"><span className="text-muted-foreground">Total Due:</span> <CurrencyDisplay amount={item.outstanding_balance} className="text-primary" /></div>
                </div>

                <div className="mt-4 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Pledged:</span> <DateDisplay dateString={item.pledge_date} /></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Due:</span> <span className={new Date(item.due_date) < new Date() ? "text-red-500 font-medium" : ""}><DateDisplay dateString={item.due_date} /></span></div>
                </div>
              </CardContent>
              <div className="p-3 border-t bg-muted/10">
                {(status === ItemStatus.ACTIVE || status === ItemStatus.HOLD) && (
                  <Button variant="outline" className="w-full gap-2" onClick={() => { setSelectedItem(item); setInterestDialogOpen(true); }}>
                    <Calculator className="h-4 w-4" /> Record Interest
                  </Button>
                )}
                {status === ItemStatus.DEFAULTED && (
                  <Button variant="destructive" className="w-full gap-2">Go to Auction <ArrowRight className="h-4 w-4" /></Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedItem && (
        <RecordInterestDialog open={interestDialogOpen} onOpenChange={setInterestDialogOpen} item={selectedItem} />
      )}
    </div>
  );
}

export default function ItemsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Items Management</h1>
        <p className="text-muted-foreground">Manage pledged collateral and record interest</p>
      </div>

      <Tabs defaultValue={ItemStatus.ACTIVE}>
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full max-w-3xl h-auto">
          <TabsTrigger value={ItemStatus.ACTIVE} className="py-2">Active</TabsTrigger>
          <TabsTrigger value={ItemStatus.HOLD} className="py-2">On Hold</TabsTrigger>
          <TabsTrigger value={ItemStatus.DEFAULTED} className="py-2">Defaulted</TabsTrigger>
          <TabsTrigger value={ItemStatus.REDEEMED} className="py-2">Redeemed</TabsTrigger>
          <TabsTrigger value={ItemStatus.AUCTIONED} className="py-2">Auctioned</TabsTrigger>
        </TabsList>
        <TabsContent value={ItemStatus.ACTIVE}><ItemsList status={ItemStatus.ACTIVE} /></TabsContent>
        <TabsContent value={ItemStatus.HOLD}><ItemsList status={ItemStatus.HOLD} /></TabsContent>
        <TabsContent value={ItemStatus.DEFAULTED}><ItemsList status={ItemStatus.DEFAULTED} /></TabsContent>
        <TabsContent value={ItemStatus.REDEEMED}><ItemsList status={ItemStatus.REDEEMED} /></TabsContent>
        <TabsContent value={ItemStatus.AUCTIONED}><ItemsList status={ItemStatus.AUCTIONED} /></TabsContent>
      </Tabs>
    </div>
  );
}
