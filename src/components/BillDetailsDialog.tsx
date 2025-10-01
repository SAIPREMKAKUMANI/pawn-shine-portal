import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BillDetailsDialogProps {
  billId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BillDetailsDialog = ({ billId, open, onOpenChange }: BillDetailsDialogProps) => {
  const { bills, updateBill, getBillOrnaments, addTransaction, customers } = useData();
  const bill = bills.find(b => b.id === billId);
  const ornaments = getBillOrnaments(bill?.billId || '');
  
  const [interestPaid, setInterestPaid] = useState('');
  const [extraAmount, setExtraAmount] = useState('');
  const [releaseImage, setReleaseImage] = useState('');
  const [transferCustomerId, setTransferCustomerId] = useState('');

  if (!bill) return null;

  const handleInterestPayment = () => {
    const amount = parseFloat(interestPaid);
    if (amount > 0) {
      updateBill(bill.id, {
        totalInterestPaid: bill.totalInterestPaid + amount,
      });
      addTransaction({
        billId: bill.billId,
        customerId: bill.customerId,
        customerName: bill.customerName,
        type: 'interest_paid',
        amount,
        description: `Interest payment for Bill #${bill.billId}`,
      });
      toast.success('Interest payment recorded');
      setInterestPaid('');
    }
  };

  const handleExtraPayment = () => {
    const amount = parseFloat(extraAmount);
    if (amount > 0) {
      updateBill(bill.id, {
        extraAmountPaid: bill.extraAmountPaid + amount,
      });
      addTransaction({
        billId: bill.billId,
        customerId: bill.customerId,
        customerName: bill.customerName,
        type: 'extra_amount',
        amount,
        description: `Extra amount payment for Bill #${bill.billId}`,
      });
      toast.success('Extra payment recorded');
      setExtraAmount('');
    }
  };

  const handleRelease = () => {
    updateBill(bill.id, {
      status: 'released',
      releasedAt: new Date().toISOString(),
      releaseImage,
    });
    addTransaction({
      billId: bill.billId,
      customerId: bill.customerId,
      customerName: bill.customerName,
      type: 'bill_released',
      amount: bill.amount,
      description: `Bill #${bill.billId} released`,
    });
    toast.success('Bill released successfully');
    onOpenChange(false);
  };

  const handleClear = () => {
    updateBill(bill.id, {
      status: 'cleared',
    });
    addTransaction({
      billId: bill.billId,
      customerId: bill.customerId,
      customerName: bill.customerName,
      type: 'bill_cleared',
      amount: bill.amount,
      description: `Bill #${bill.billId} cleared`,
    });
    toast.success('Bill cleared successfully');
    onOpenChange(false);
  };

  const totalDue = bill.amount + bill.totalInterestPaid - bill.extraAmountPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Bill #{bill.billId}</DialogTitle>
              <p className="text-sm text-muted-foreground">{bill.customerName}</p>
            </div>
            <Badge variant={bill.status === 'active' ? 'default' : bill.status === 'released' ? 'secondary' : 'outline'}>
              {bill.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="ornaments">Ornaments</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Principal Amount:</span>
                  <span className="font-semibold">₹{bill.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate:</span>
                  <span>{bill.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Interest Paid:</span>
                  <span className="text-primary">₹{bill.totalInterestPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extra Amount Paid:</span>
                  <span className="text-primary">₹{bill.extraAmountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-semibold">Total Due:</span>
                  <span className="font-semibold text-xl text-primary">₹{totalDue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-sm">{new Date(bill.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ornaments" className="space-y-4">
            {ornaments.map((ornament, index) => (
              <Card key={ornament.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">{ornament.name}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gross Weight:</span>
                          <span>{ornament.grossWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Net Weight:</span>
                          <span>{ornament.netWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest:</span>
                          <span>{ornament.interest}%</span>
                        </div>
                      </div>
                    </div>
                    {ornament.image && (
                      <div>
                        <img src={ornament.image} alt={ornament.name} className="w-full h-32 object-cover rounded" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {bill.status === 'active' && (
              <>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label>Record Interest Payment</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={interestPaid}
                          onChange={(e) => setInterestPaid(e.target.value)}
                        />
                        <Button onClick={handleInterestPayment}>Record</Button>
                      </div>
                    </div>
                    <div>
                      <Label>Record Extra Payment</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={extraAmount}
                          onChange={(e) => setExtraAmount(e.target.value)}
                        />
                        <Button onClick={handleExtraPayment}>Record</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label>Release Ornament</Label>
                      <div className="space-y-2 mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setReleaseImage(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <Button onClick={handleRelease} className="w-full" disabled={!releaseImage}>
                          Release Ornament
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {bill.status === 'released' && (
              <Card>
                <CardContent className="pt-6">
                  <Button onClick={handleClear} className="w-full">
                    Mark as Cleared
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BillDetailsDialog;
