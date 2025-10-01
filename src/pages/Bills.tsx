import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import BillCreationDialog from '@/components/BillCreationDialog';
import BillDetailsDialog from '@/components/BillDetailsDialog';

const Bills = () => {
  const { bills } = useData();
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);

  const activeBills = bills.filter(b => b.status === 'active');
  const releasedBills = bills.filter(b => b.status === 'released');
  const clearedBills = bills.filter(b => b.status === 'cleared');

  const BillCard = ({ bill }: { bill: any }) => (
    <Card
      className="hover:shadow-[var(--shadow-gold)] transition-shadow cursor-pointer"
      onClick={() => setSelectedBill(bill.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{bill.customerName}</CardTitle>
            <p className="text-sm text-muted-foreground">Bill #{bill.billId}</p>
          </div>
          <Badge variant={bill.status === 'active' ? 'default' : bill.status === 'released' ? 'secondary' : 'outline'}>
            {bill.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-semibold text-primary">₹{bill.amount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Interest Rate:</span>
          <span>{bill.interestRate}%</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(bill.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Bills</h1>
          <p className="text-muted-foreground">Manage your pawn bills and transactions</p>
        </div>
        <Button onClick={() => setIsCreationDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Bill
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeBills.length})</TabsTrigger>
          <TabsTrigger value="released">Released ({releasedBills.length})</TabsTrigger>
          <TabsTrigger value="cleared">Cleared ({clearedBills.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeBills.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active bills</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeBills.map(bill => <BillCard key={bill.id} bill={bill} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="released" className="space-y-4 mt-6">
          {releasedBills.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No released bills</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {releasedBills.map(bill => <BillCard key={bill.id} bill={bill} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cleared" className="space-y-4 mt-6">
          {clearedBills.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No cleared bills</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clearedBills.map(bill => <BillCard key={bill.id} bill={bill} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BillCreationDialog open={isCreationDialogOpen} onOpenChange={setIsCreationDialogOpen} />
      {selectedBill && (
        <BillDetailsDialog
          billId={selectedBill}
          open={!!selectedBill}
          onOpenChange={(open) => !open && setSelectedBill(null)}
        />
      )}
    </div>
  );
};

export default Bills;
