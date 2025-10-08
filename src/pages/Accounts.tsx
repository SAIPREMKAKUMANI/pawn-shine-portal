import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Accounts = () => {
  const { accounts, addAccount, transactions, getTransactionsByDateRange } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'cash' | 'bank'>('cash');
  const [dateRange, setDateRange] = useState<'today' | 'month' | 'year' | 'custom'>('today');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date(now.setHours(23, 59, 59, 999)) };
      case 'month':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999) };
      case 'year':
        return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999) };
      case 'custom':
        return { start: new Date(startDate.setHours(0, 0, 0, 0)), end: new Date(endDate.setHours(23, 59, 59, 999)) };
    }
  };

  const { start, end } = getDateRange();
  const filteredTransactions = getTransactionsByDateRange(start, end).filter(t => t.accountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount({ name: accountName, type: accountType });
    toast.success('Account created successfully');
    setAccountName('');
    setAccountType('cash');
    setIsDialogOpen(false);
  };

  const totalCollected = filteredTransactions
    .filter(t => t.type === 'bill_released')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDisbursed = filteredTransactions
    .filter(t => ['interest_paid', 'extra_amount'].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || 'Unknown Account';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Accounts</h1>
          <p className="text-muted-foreground">Manage your cash and bank accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  placeholder="e.g., Main Cash Box, SBI Savings"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <select
                  id="accountType"
                  className="w-full p-2 border rounded-md"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as 'cash' | 'bank')}
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Add Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {account.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant={account.type === 'cash' ? 'default' : 'secondary'}>
                  {account.type}
                </Badge>
                <div className="text-3xl font-bold text-primary">
                  ₹{account.balance.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  Created {format(new Date(account.createdAt), 'dd MMM yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {accounts.length === 0 && (
          <Card className="col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No accounts created yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Date Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={dateRange === 'today' ? 'default' : 'outline'}
                onClick={() => setDateRange('today')}
              >
                Today
              </Button>
              <Button
                variant={dateRange === 'month' ? 'default' : 'outline'}
                onClick={() => setDateRange('month')}
              >
                This Month
              </Button>
              <Button
                variant={dateRange === 'year' ? 'default' : 'outline'}
                onClick={() => setDateRange('year')}
              >
                This Year
              </Button>
              <Button
                variant={dateRange === 'custom' ? 'default' : 'outline'}
                onClick={() => setDateRange('custom')}
              >
                Custom Range
              </Button>
            </div>

            {dateRange === 'custom' && (
              <div className="flex gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹{totalCollected.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-2">
              From {filteredTransactions.filter(t => t.type === 'bill_released').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <TrendingDown className="h-5 w-5" />
              Total Disbursed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹{totalDisbursed.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-2">
              From {filteredTransactions.filter(t => ['interest_paid', 'extra_amount'].includes(t.type)).length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Account Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions in this period</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Customer</TableHead>
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
                    <TableCell>
                      <Badge variant="outline">{getAccountName(transaction.accountId!)}</Badge>
                    </TableCell>
                    <TableCell>{transaction.customerName}</TableCell>
                    <TableCell>{transaction.billId}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'bill_released' ? 'default' : 'secondary'}>
                        {transaction.type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{transaction.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={transaction.type === 'bill_released' ? 'text-primary' : 'text-accent'}>
                        ₹{transaction.amount.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Accounts;
