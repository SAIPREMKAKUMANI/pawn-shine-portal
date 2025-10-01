import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

const DayBook = () => {
  const { getTodayTransactions } = useData();
  const todayTransactions = getTodayTransactions();

  const totalIn = todayTransactions
    .filter(t => ['interest_paid', 'extra_amount'].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = todayTransactions
    .filter(t => ['bill_created'].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bill_created':
        return 'bg-primary/10 text-primary';
      case 'interest_paid':
        return 'bg-accent/10 text-accent';
      case 'bill_released':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Day Book</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

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
              From {todayTransactions.filter(t => ['interest_paid', 'extra_amount'].includes(t.type)).length} transactions
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
              From {todayTransactions.filter(t => t.type === 'bill_created').length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {todayTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{transaction.customerName}</p>
                      <Badge className={getTypeColor(transaction.type)}>
                        {getTypeLabel(transaction.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bill #{transaction.billId}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-lg text-primary">
                      ₹{transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DayBook;
