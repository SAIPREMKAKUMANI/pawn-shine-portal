import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { useOrnamentsList, useCreateOrnament, useUpdateOrnament } from "@/hooks/use-ornaments.hook";
import { Gem, Plus, Loader2, Edit } from "lucide-react";
import type { OrnamentDto } from "@/types/api.types";

const ornamentSchema = z.object({
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  default_interest_rate: z.number().min(0, "Interest rate must be ≥ 0"),
  default_amount_rate: z.number().min(0, "Amount rate must be ≥ 0"),
});

type OrnamentFormValues = z.infer<typeof ornamentSchema>;

function OrnamentDialog({
  open,
  onOpenChange,
  ornamentToEdit
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  ornamentToEdit: OrnamentDto | null
}) {
  const createMutation = useCreateOrnament();
  const updateMutation = useUpdateOrnament();

  const form = useForm<OrnamentFormValues>({
    resolver: zodResolver(ornamentSchema),
    defaultValues: { 
      type: ornamentToEdit?.type ?? "", 
      description: ornamentToEdit?.description ?? "", 
      default_interest_rate: ornamentToEdit?.default_interest_rate ?? 1.5,
      default_amount_rate: ornamentToEdit?.default_amount_rate ?? 0
    },
  });

  // Reset form when editing a different ornament
  useState(() => {
    if (open) {
      form.reset({
        type: ornamentToEdit?.type ?? "", 
        description: ornamentToEdit?.description ?? "", 
        default_interest_rate: ornamentToEdit?.default_interest_rate ?? 1.5,
        default_amount_rate: ornamentToEdit?.default_amount_rate ?? 0
      });
    }
  });

  function onSubmit(values: OrnamentFormValues) {
    if (ornamentToEdit) {
      updateMutation.mutate({ ornamentId: ornamentToEdit.id, request: values }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: () => onOpenChange(false),
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ornamentToEdit ? "Edit Ornament" : "Add New Ornament"}</DialogTitle>
          <DialogDescription>Define standard rates for jewelry types to speed up bill creation.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem><FormLabel>Type (e.g. GOLD, SILVER)</FormLabel><FormControl><Input placeholder="GOLD" {...field} disabled={!!ornamentToEdit} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Standard 22K Gold" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="default_interest_rate" render={({ field }) => (
                <FormItem><FormLabel>Default Interest %/mo</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="default_amount_rate" render={({ field }) => (
                <FormItem><FormLabel>Default Rate per Gram (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Ornament
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function OrnamentsPage() {
  const { data: ornaments, isLoading } = useOrnamentsList();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrnament, setEditingOrnament] = useState<OrnamentDto | null>(null);

  if (isLoading) return <LoadingSpinner message="Loading catalog..." />;
  const catalog = ornaments ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ornaments Catalog"
        description="Manage jewelry types and their standard rates"
        action={
          <Button onClick={() => { setEditingOrnament(null); setDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Ornament Type
          </Button>
        }
      />

      {!catalog.length ? (
        <EmptyState icon={Gem} title="No ornaments in catalog" description="Add ornament types to use them in pledge bills." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catalog.map((ornament) => (
            <Card key={ornament.id} className="hover:shadow-[var(--shadow-gold)] transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gem className="h-5 w-5 text-primary" />
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setEditingOrnament(ornament); setDialogOpen(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-bold text-lg">{ornament.type}</h3>
                <p className="text-sm text-muted-foreground mb-4">{ornament.description}</p>
                <div className="space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Default Interest</span>
                    <span className="font-semibold">{ornament.default_interest_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate per Gram</span>
                    <CurrencyDisplay amount={ornament.default_amount_rate} className="font-semibold text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Conditionally render dialog to force re-mount when editingOrnament changes */}
      {dialogOpen && <OrnamentDialog open={dialogOpen} onOpenChange={setDialogOpen} ornamentToEdit={editingOrnament} />}
    </div>
  );
}
