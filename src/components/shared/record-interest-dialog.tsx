import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DateDisplay } from "@/components/shared/date-display";
import { useRecordInterest, useInterestHistory } from "@/hooks/use-interest.hook";
import { interestRecordSchema, type InterestRecordFormValues } from "@/validators/interest.schema";
import type { ItemDto } from "@/types/api.types";
import { Loader2 } from "lucide-react";

export function ItemInterestHistory({ itemId }: { itemId: number }) {
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

export interface RecordInterestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemDto;
}

export function RecordInterestDialog({ open, onOpenChange, item }: RecordInterestDialogProps) {
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Record Interest</DialogTitle>
        </DialogHeader>
        <div className="bg-muted/30 p-3 rounded-lg mb-2 space-y-1 text-sm">
          <p><span className="text-muted-foreground">Item:</span> <span className="font-medium">{item.description}</span></p>
          <p><span className="text-muted-foreground">Principal:</span> <CurrencyDisplay amount={item.amount_lended} /></p>
          <p><span className="text-muted-foreground">Current Interest:</span> <CurrencyDisplay amount={item.compound_interest} /></p>
          <p><span className="text-muted-foreground">Total Due:</span> <CurrencyDisplay amount={item.outstanding_balance} className="font-semibold text-primary" /></p>
        </div>
        <div className="mb-2 border-t pt-3">
          <h4 className="font-semibold text-sm mb-1">Interest History</h4>
          <ItemInterestHistory itemId={item.id} />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border-t pt-3">
            <FormField control={form.control} name="interest_amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Amount to Add (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
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
