import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Clock } from 'lucide-react';

const Dashboard = () => {
  const { customers, bills, transactions, getTodayTransactions } = useData();
  
  const activeBills = bills.filter(b => b.status === 'active').length;
  const todayTransactions = getTodayTransactions();
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    {
      title: 'Total Customers',
      value: customers.length,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Active Bills',
      value: activeBills,
      icon: FileText,
      color: 'text-accent',
    },
    {
      title: "Today's Revenue",
      value: `₹${todayRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-primary',
    },
    {
      title: "Today's Transactions",
      value: todayTransactions.length,
      icon: Clock,
      color: 'text-accent',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your gold pawn broking management system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm hover:shadow-[var(--shadow-gold)] transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {todayTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No transactions today</p>
          ) : (
            <div className="space-y-4">
              {todayTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{transaction.customerName}</p>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">₹{transaction.amount.toLocaleString()}</p>
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

export default Dashboard;
