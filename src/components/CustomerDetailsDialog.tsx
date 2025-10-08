import { useState, useMemo } from 'react';
import { useData, Customer } from '@/context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Phone, MapPin, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--gold-light))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

const CustomerDetailsDialog = ({ customer, open, onOpenChange }: CustomerDetailsDialogProps) => {
  const { transactions, bills, ornaments } = useData();
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [ornamentTypeFilter, setOrnamentTypeFilter] = useState<string>('all');
  const [metalTypeFilter, setMetalTypeFilter] = useState<string>('all');
  const [billIdFilter, setBillIdFilter] = useState<string>('all');
  const [billTypeFilter, setBillTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'amount' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const customerTransactions = useMemo(() => {
    if (!customer) return [];
    return transactions
      .filter(t => t.customerId === customer.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [customer, transactions]);

  const customerBills = useMemo(() => {
    if (!customer) return [];
    let filtered = bills.filter(b => b.customerId === customer.id);
    
    if (billIdFilter !== 'all') {
      filtered = filtered.filter(b => b.billId === billIdFilter);
    }
    
    if (billTypeFilter !== 'all') {
      filtered = filtered.filter(b => b.status === billTypeFilter);
    }
    
    // Sort bills
    filtered.sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      } else {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
    
    return filtered;
  }, [customer, bills, billIdFilter, billTypeFilter, sortBy, sortOrder]);

  const customerOrnaments = useMemo(() => {
    if (!customer) return [];
    const billIds = customerBills.map(b => b.billId);
    return ornaments.filter(o => billIds.includes(o.billId));
  }, [customerBills, ornaments]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...customerTransactions];

    if (yearFilter !== 'all') {
      filtered = filtered.filter(t => new Date(t.date).getFullYear().toString() === yearFilter);
    }

    if (monthFilter !== 'all') {
      filtered = filtered.filter(t => (new Date(t.date).getMonth() + 1).toString() === monthFilter);
    }

    if (ornamentTypeFilter !== 'all') {
      const relevantBills = customerBills.filter(b => {
        const billOrnaments = ornaments.filter(o => o.billId === b.billId);
        return billOrnaments.some(o => o.name.toLowerCase().includes(ornamentTypeFilter.toLowerCase()));
      });
      const relevantBillIds = relevantBills.map(b => b.billId);
      filtered = filtered.filter(t => relevantBillIds.includes(t.billId));
    }

    if (metalTypeFilter !== 'all') {
      const relevantBills = customerBills.filter(b => {
        const billOrnaments = ornaments.filter(o => o.billId === b.billId);
        return billOrnaments.some(o => o.type === metalTypeFilter);
      });
      const relevantBillIds = relevantBills.map(b => b.billId);
      filtered = filtered.filter(t => relevantBillIds.includes(t.billId));
    }

    return filtered;
  }, [customerTransactions, yearFilter, monthFilter, ornamentTypeFilter, metalTypeFilter, customerBills, ornaments]);

  const availableYears = useMemo(() => {
    const years = new Set(customerTransactions.map(t => new Date(t.date).getFullYear().toString()));
    return Array.from(years).sort().reverse();
  }, [customerTransactions]);

  const ornamentTypeData = useMemo(() => {
    const types: { [key: string]: number } = {};
    customerOrnaments.forEach(o => {
      types[o.name] = (types[o.name] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [customerOrnaments]);

  const metalTypeData = useMemo(() => {
    const types: { gold: number; silver: number } = { gold: 0, silver: 0 };
    customerOrnaments.forEach(o => {
      if (o.type) types[o.type]++;
    });
    return [
      { name: 'Gold', value: types.gold },
      { name: 'Silver', value: types.silver }
    ].filter(item => item.value > 0);
  }, [customerOrnaments]);

  const timelineData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    filteredTransactions.forEach(t => {
      const monthYear = format(new Date(t.date), 'MMM yyyy');
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + t.amount;
    });
    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .reverse()
      .slice(0, 12);
  }, [filteredTransactions]);

  const totalAmount = useMemo(() => {
    return customerBills.reduce((sum, b) => sum + b.amount, 0);
  }, [customerBills]);

  const activeLoans = useMemo(() => {
    return customerBills.filter(b => b.status === 'active').length;
  }, [customerBills]);

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={customer.image} alt={customer.name} />
                  <AvatarFallback className="text-2xl">{customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold">{customer.name}</h2>
                    <p className="text-muted-foreground">S/O {customer.fatherHusbandName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.village}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.fatherHusbandVillage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(customer.createdAt), 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                  {customer.description && (
                    <p className="text-sm text-muted-foreground">{customer.description}</p>
                  )}
                  <div className="flex gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{customerBills.length}</div>
                      <div className="text-xs text-muted-foreground">Total Bills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{activeLoans}</div>
                      <div className="text-xs text-muted-foreground">Active Loans</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="bills" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bills">Bills</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="charts">Analytics</TabsTrigger>
              <TabsTrigger value="ornaments">Ornaments</TabsTrigger>
            </TabsList>

            <TabsContent value="bills" className="space-y-4">
              {/* Bill Filters */}
              <div className="grid grid-cols-5 gap-4">
                <Select value={billIdFilter} onValueChange={setBillIdFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bill ID" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bills</SelectItem>
                    {Array.from(new Set(bills.filter(b => b.customerId === customer?.id).map(b => b.billId))).map(id => (
                      <SelectItem key={id} value={id}>{id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={billTypeFilter} onValueChange={setBillTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="released">Released</SelectItem>
                    <SelectItem value="cleared">Cleared</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'amount' | 'date')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bills List */}
              <div className="grid gap-4">
                {customerBills.map((bill) => (
                  <Card key={bill.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Bill #{bill.billId}</h3>
                            <Badge variant={bill.status === 'active' ? 'default' : bill.status === 'released' ? 'secondary' : 'outline'}>
                              {bill.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Created: {format(new Date(bill.createdAt), 'dd MMM yyyy')}</div>
                            {bill.releasedAt && <div>Released: {format(new Date(bill.releasedAt), 'dd MMM yyyy')}</div>}
                            {bill.clearedAt && <div>Cleared: {format(new Date(bill.clearedAt), 'dd MMM yyyy')}</div>}
                            <div>Interest Rate: {bill.interestRate}%</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">₹{bill.amount.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            Interest Paid: ₹{bill.totalInterestPaid.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {customerBills.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No bills found
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-4 gap-4">
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {format(new Date(2024, i, 1), 'MMMM')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={metalTypeFilter} onValueChange={setMetalTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Metal Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Metals</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ornamentTypeFilter} onValueChange={setOrnamentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ornament" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ornaments</SelectItem>
                    <SelectItem value="ring">Ring</SelectItem>
                    <SelectItem value="chain">Chain</SelectItem>
                    <SelectItem value="bangle">Bangle</SelectItem>
                    <SelectItem value="necklace">Necklace</SelectItem>
                    <SelectItem value="earring">Earring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transactions Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Bill ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{format(new Date(transaction.date), 'dd MMM yyyy')}</TableCell>
                          <TableCell>{transaction.billId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.type.replace(/_/g, ' ')}</Badge>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className="text-right font-medium">₹{transaction.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ornament Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={ornamentTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {ornamentTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gold vs Silver</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={metalTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Transaction Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} name="Amount" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ornaments" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customerOrnaments.map((ornament) => (
                  <Card key={ornament.id}>
                    <CardContent className="p-4">
                      {ornament.image && (
                        <img
                          src={ornament.image}
                          alt={ornament.name}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                      )}
                      <h3 className="font-semibold mb-2">{ornament.name}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <Badge variant="outline">{ornament.type || 'N/A'}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Gross Weight:</span>
                          <span>{ornament.grossWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Net Weight:</span>
                          <span>{ornament.netWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interest:</span>
                          <span>{ornament.interest}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bill ID:</span>
                          <span className="font-medium">{ornament.billId}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {customerOrnaments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No ornaments found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;
