import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import BillDetailsDialog from '@/components/BillDetailsDialog';

const DayBook = () => {
  const { getTransactionsByDateRange, bills } = useData();
  const [dateRange, setDateRange] = useState<'today' | 'month' | 'year' | 'custom'>('today');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
  const transactions = getTransactionsByDateRange(start, end);

  // Group transactions by bill to show only latest status
  const billTransactions = new Map();
  transactions.forEach(t => {
    if (!billTransactions.has(t.billId) || new Date(t.date) > new Date(billTransactions.get(t.billId).date)) {
      billTransactions.set(t.billId, t);
    }
  });
  const displayTransactions = Array.from(billTransactions.values());

  const totalIn = transactions
    .filter(t => ['interest_paid', 'extra_amount'].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = transactions
    .filter(t => ['bill_created'].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const getBillStatus = (billId: string) => {
    const bill = bills.find(b => b.billId === billId);
    return bill?.status || 'active';
  };

  const getBillDate = (billId: string) => {
    const bill = bills.find(b => b.billId === billId);
    if (!bill) return '';
    if (bill.status === 'cleared' && bill.clearedAt) {
      return `Cleared: ${new Date(bill.clearedAt).toLocaleDateString()}`;
    }
    if (bill.status === 'released' && bill.releasedAt) {
      return `Released: ${new Date(bill.releasedAt).toLocaleDateString()}`;
    }
    return `Created: ${new Date(bill.createdAt).toLocaleDateString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/10 text-primary';
      case 'released':
        return 'bg-accent/10 text-accent';
      case 'cleared':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleTransactionClick = (transaction: any) => {
    const bill = bills.find(b => b.billId === transaction.billId);
    if (bill) {
      setSelectedBillId(bill.id);
      setIsDetailsOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Day Book</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {format(start, 'PPP')} {dateRange === 'custom' && `- ${format(end, 'PPP')}`}
        </p>
      </div>

      <Card className="shadow-sm">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              Total In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹{totalIn.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-2">
              From {transactions.filter(t => ['interest_paid', 'extra_amount'].includes(t.type)).length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <TrendingDown className="h-5 w-5" />
              Total Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹{totalOut.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-2">
              From {transactions.filter(t => t.type === 'bill_created').length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Bill History</CardTitle>
        </CardHeader>
        <CardContent>
          {displayTransactions.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions in this period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayTransactions.map((transaction) => {
                const status = getBillStatus(transaction.billId);
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{transaction.customerName}</p>
                        <Badge className={getStatusColor(status)}>
                          {status.charAt(0).toUpperCase() + status.slice(1)} Bill
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{getBillDate(transaction.billId)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Bill #{transaction.billId}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-lg text-primary">
                        ₹{transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBillId && (
        <BillDetailsDialog
          billId={selectedBillId}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      )}
    </div>
  );
};

export default DayBook;
