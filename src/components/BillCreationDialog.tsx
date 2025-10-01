import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BillCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BillCreationDialog = ({ open, onOpenChange }: BillCreationDialogProps) => {
  const { customers, addBill, addOrnaments, getCustomerBills } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerHistory, setCustomerHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [billData, setBillData] = useState({
    billId: '',
    amount: '',
    interestRate: '',
  });
  const [ornaments, setOrnaments] = useState<any[]>([
    { name: '', grossWeight: '', netWeight: '', interest: '', image: '' }
  ]);

  useEffect(() => {
    if (selectedCustomer) {
      const history = getCustomerBills(selectedCustomer);
      setCustomerHistory(history);
      setShowHistory(history.length > 0);
    }
  }, [selectedCustomer]);

  const addOrnamentRow = () => {
    setOrnaments([...ornaments, { name: '', grossWeight: '', netWeight: '', interest: '', image: '' }]);
  };

  const removeOrnamentRow = (index: number) => {
    setOrnaments(ornaments.filter((_, i) => i !== index));
  };

  const updateOrnament = (index: number, field: string, value: string) => {
    const updated = [...ornaments];
    updated[index] = { ...updated[index], [field]: value };
    setOrnaments(updated);
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateOrnament(index, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    const billId = addBill({
      billId: billData.billId,
      customerId: customer.id,
      customerName: customer.name,
      amount: parseFloat(billData.amount),
      interestRate: parseFloat(billData.interestRate),
      status: 'active',
    });

    addOrnaments(ornaments.map(o => ({
      billId: billData.billId,
      name: o.name,
      grossWeight: parseFloat(o.grossWeight),
      netWeight: parseFloat(o.netWeight),
      interest: parseFloat(o.interest),
      image: o.image,
    })));

    toast.success('Bill created successfully!');
    
    setBillData({ billId: '', amount: '', interestRate: '' });
    setOrnaments([{ name: '', grossWeight: '', netWeight: '', interest: '', image: '' }]);
    setSelectedCustomer('');
    setShowHistory(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Bill</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} - {c.village}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billId">Bill ID</Label>
              <Input
                id="billId"
                value={billData.billId}
                onChange={(e) => setBillData({ ...billData, billId: e.target.value })}
                placeholder="Enter unique bill ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={billData.amount}
                onChange={(e) => setBillData({ ...billData, amount: e.target.value })}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={billData.interestRate}
                onChange={(e) => setBillData({ ...billData, interestRate: e.target.value })}
                placeholder="Enter interest rate"
                required
              />
            </div>
          </div>

          {showHistory && customerHistory.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Customer Transaction History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {customerHistory.map(bill => (
                  <div key={bill.id} className="flex justify-between text-sm p-2 bg-background rounded">
                    <span>Bill #{bill.billId}</span>
                    <span className="text-muted-foreground">₹{bill.amount.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">{new Date(bill.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Ornament Details</Label>
              <Button type="button" onClick={addOrnamentRow} size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Ornament
              </Button>
            </div>

            {ornaments.map((ornament, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ornament Name</Label>
                      <Input
                        value={ornament.name}
                        onChange={(e) => updateOrnament(index, 'name', e.target.value)}
                        placeholder="e.g., Gold Chain"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gross Weight (g)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ornament.grossWeight}
                        onChange={(e) => updateOrnament(index, 'grossWeight', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Net Weight (g)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ornament.netWeight}
                        onChange={(e) => updateOrnament(index, 'netWeight', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Interest (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={ornament.interest}
                        onChange={(e) => updateOrnament(index, 'interest', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Ornament Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                      />
                    </div>
                    {ornaments.length > 1 && (
                      <div className="col-span-2">
                        <Button
                          type="button"
                          onClick={() => removeOrnamentRow(index)}
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Create Bill
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillCreationDialog;
