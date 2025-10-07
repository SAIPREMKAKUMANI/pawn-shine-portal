import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BillCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BillCreationDialog = ({ open, onOpenChange }: BillCreationDialogProps) => {
  const { customers, addBill, addOrnaments, transactions } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerTransactions, setCustomerTransactions] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [billData, setBillData] = useState({
    billId: '',
    amount: '',
    interestRate: '',
  });
  const [ornaments, setOrnaments] = useState<any[]>([
    { name: '', type: 'gold', grossWeight: '', netWeight: '', interest: '', image: '' }
  ]);

  useEffect(() => {
    if (selectedCustomer) {
      const customerTxns = transactions.filter(t => t.customerId === selectedCustomer);
      setCustomerTransactions(customerTxns);
      setShowHistory(customerTxns.length > 0);
    } else {
      setCustomerTransactions([]);
      setShowHistory(false);
    }
  }, [selectedCustomer, transactions]);

  const addOrnamentRow = () => {
    setOrnaments([...ornaments, { name: '', type: 'gold', grossWeight: '', netWeight: '', interest: '', image: '' }]);
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
      type: o.type as 'gold' | 'silver',
      grossWeight: parseFloat(o.grossWeight),
      netWeight: parseFloat(o.netWeight),
      interest: parseFloat(o.interest),
      image: o.image,
    })));

    toast.success('Bill created successfully!');
    
    setBillData({ billId: '', amount: '', interestRate: '' });
    setOrnaments([{ name: '', type: 'gold', grossWeight: '', netWeight: '', interest: '', image: '' }]);
    setSelectedCustomer('');
    setCustomerTransactions([]);
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
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {selectedCustomer
                      ? customers.find((c) => c.id === selectedCustomer)?.name + ' - ' + customers.find((c) => c.id === selectedCustomer)?.village
                      : "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={`${customer.name} ${customer.village}`}
                            onSelect={() => {
                              setSelectedCustomer(customer.id);
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCustomer === customer.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {customer.name} - {customer.village}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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

          {showHistory && customerTransactions.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Customer Transaction History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                {customerTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(txn => (
                  <div key={txn.id} className="flex justify-between items-center text-sm p-2 bg-background rounded">
                    <div className="flex-1">
                      <span className="font-medium">{txn.type.replace(/_/g, ' ').toUpperCase()}</span>
                      <p className="text-xs text-muted-foreground">{txn.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-primary">₹{txn.amount.toLocaleString()}</span>
                      <p className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleDateString()}</p>
                    </div>
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
                      <Label>Metal Type</Label>
                      <Select value={ornament.type} onValueChange={(value) => updateOrnament(index, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                        </SelectContent>
                      </Select>
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
