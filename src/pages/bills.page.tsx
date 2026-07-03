import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DateDisplay } from "@/components/shared/date-display";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { useBillsList, useBillsByType, useBillDetail } from "@/hooks/use-bills.hook";
import { BillType, PaymentDirection } from "@/types/enums";
import { FileText, Search, Printer, ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

function BillDetailDialog({ open, onOpenChange, billId }: { open: boolean, onOpenChange: (open: boolean) => void, billId: number | null }) {
  const { data: bill, isLoading } = useBillDetail(billId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Bill Details</DialogTitle>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 print:hidden"><Printer className="h-4 w-4" /> Print</Button>
        </DialogHeader>

        {isLoading ? <LoadingSpinner message="Loading bill details..." /> : !bill ? <EmptyState title="Bill not found" /> : (
          <div className="space-y-6 print:p-6 print:bg-white print:text-black">
            <div className="text-center pb-4 border-b">
              <h2 className="text-2xl font-bold uppercase tracking-wider">Gold Pawn Broking</h2>
              <p className="text-sm text-muted-foreground">Original Receipt</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Bill No:</p>
                <p className="font-semibold">{bill.bill_id}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Date:</p>
                <p className="font-semibold"><DateDisplay dateString={bill.bill_date} /></p>
              </div>
              <div>
                <p className="text-muted-foreground">Customer:</p>
                <p className="font-semibold">{bill.customer_name}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Type:</p>
                <p className="font-semibold">{bill.bill_type}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold border-b pb-2 mb-3">Items</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-muted-foreground text-left"><th className="pb-2">Item ID</th><th className="pb-2">Action</th><th className="pb-2 text-right">Amount</th></tr></thead>
                <tbody>
                  {bill.items.map((item, i) => (
                    <tr key={i} className="border-b last:border-0"><td className="py-2">{item.item_id}</td><td className="py-2"><StatusBadge status={item.action} /></td><td className="py-2 text-right"><CurrencyDisplay amount={item.amount} /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Wallet Usage Breakdown */}
            {bill.wallet_allocations && bill.wallet_allocations.length > 0 && (
              <div>
                <h3 className="font-semibold border-b pb-2 mb-3 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                  Wallet Usage Breakdown
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-left">
                      <th className="pb-2">Deposit Date</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2 text-right">Amount Used</th>
                      <th className="pb-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.wallet_allocations.map((alloc, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2"><DateDisplay dateString={alloc.deposit_date} /></td>
                        <td className="py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${alloc.allocation_type === 'PRINCIPAL'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}>
                            {alloc.allocation_type}
                          </span>
                        </td>
                        <td className="py-2 text-right"><CurrencyDisplay amount={alloc.amount_used} /></td>
                        <td className="py-2 text-muted-foreground text-xs">{alloc.deposit_notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mt-2 text-sm">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Total from Wallet: <CurrencyDisplay amount={bill.wallet_amount_used ?? 0} />
                  </span>
                </div>
              </div>
            )}

            {/* Payment Accounts */}
            {bill.accounts && bill.accounts.length > 0 && (
              <div>
                <h3 className="font-semibold border-b pb-2 mb-3">Payment Accounts</h3>
                <table className="w-full text-sm">
                  <thead><tr className="text-muted-foreground text-left"><th className="pb-2">Account ID</th><th className="pb-2">Direction</th><th className="pb-2 text-right">Amount</th></tr></thead>
                  <tbody>
                    {bill.accounts.map((acc, i) => (
                      <tr key={i} className="border-b last:border-0"><td className="py-2">{acc.account_id}</td><td className="py-2">{acc.direction === PaymentDirection.IN ? <span className="text-emerald-600 flex items-center gap-1"><ArrowDownRight className="h-3 w-3" /> IN</span> : <span className="text-red-600 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> OUT</span>}</td><td className="py-2 text-right"><CurrencyDisplay amount={acc.amount} /></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-muted/30 p-4 rounded-lg flex justify-between items-center mt-6">
              <span className="font-semibold">Total Amount {bill.bill_type === BillType.REDEEM ? "Paid" : "Lended"}:</span>
              <CurrencyDisplay amount={bill.bill_type === BillType.REDEEM ? bill.amount_paid : bill.total_amount_lended} className="text-xl font-bold text-primary" />
            </div>

            {bill.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Notes:</p>
                <p className="italic bg-muted/10 p-2 rounded">{bill.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BillsTable({ bills }: { bills: NonNullable<ReturnType<typeof useBillsList>["data"]>["content"] }) {
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);

  if (!bills?.length) return <EmptyState icon={FileText} title="No bills found" />;

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="p-3 font-medium">Bill No</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelectedBillId(bill.id)}>
                <td className="p-3 font-medium">{bill.bill_id}</td>
                <td className="p-3"><DateDisplay dateString={bill.bill_date} /></td>
                <td className="p-3">{bill.customer_name}</td>
                <td className="p-3"><StatusBadge status={bill.bill_type} /></td>
                <td className="p-3 text-right font-semibold"><CurrencyDisplay amount={bill.bill_type === BillType.REDEEM ? bill.amount_paid : bill.total_amount_lended} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BillDetailDialog open={selectedBillId !== null} onOpenChange={(open) => !open && setSelectedBillId(null)} billId={selectedBillId} />
    </>
  );
}

function AllBills() {
  const { data: page, isLoading } = useBillsList(0, 50);
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) return <LoadingSpinner message="Loading bills..." />;

  const bills = page?.content ?? [];
  const filtered = bills.filter(b => b.bill_id.toLowerCase().includes(searchQuery.toLowerCase()) || b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-4 mt-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by bill number or customer..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <BillsTable bills={filtered} />
    </div>
  );
}

function TypedBills({ type }: { type: BillType }) {
  const { data: page, isLoading } = useBillsByType(type, 0, 10);
  if (isLoading) return <LoadingSpinner message="Loading bills..." />;
  return <div className="mt-4"><BillsTable bills={page?.content ?? []} /></div>;
}

export default function BillsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bills & Ledger" />

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="ALL">
            <TabsList className="mb-4">
              <TabsTrigger value="ALL">All Bills</TabsTrigger>
              <TabsTrigger value={BillType.PLEDGE}>Pledges</TabsTrigger>
              <TabsTrigger value={BillType.REDEEM}>Redemptions</TabsTrigger>
            </TabsList>
            <TabsContent value="ALL"><AllBills /></TabsContent>
            <TabsContent value={BillType.PLEDGE}><TypedBills type={BillType.PLEDGE} /></TabsContent>
            <TabsContent value={BillType.REDEEM}><TypedBills type={BillType.REDEEM} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
