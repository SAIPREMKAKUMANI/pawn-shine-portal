import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { useDashboardStats } from "@/hooks/use-items.hook";
import { useAllTransactions } from "@/hooks/use-accounts.hook";
import { useBillsList } from "@/hooks/use-bills.hook";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/utils/format-currency";
import { formatDisplayDate } from "@/utils/format-date";

export default function ReportsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: transactionsPage, isLoading: transLoading } = useAllTransactions(0, 100);
  const { data: billsPage, isLoading: billsLoading } = useBillsList(0, 100);

  if (statsLoading || transLoading || billsLoading) return <LoadingSpinner message="Generating reports..." />;

  const transactions = transactionsPage?.content ?? [];
  const bills = billsPage?.content ?? [];

  // Data processing for charts
  const creditTotal = transactions.filter(t => t.transaction_type === "CREDIT").reduce((sum, t) => sum + t.amount, 0);
  const debitTotal = transactions.filter(t => t.transaction_type === "DEBIT").reduce((sum, t) => sum + t.amount, 0);

  const cashFlowData = [
    { name: "Money In (Received)", value: creditTotal, color: "hsl(142, 71%, 45%)" }, // Emerald
    { name: "Money Out (Lended)", value: debitTotal, color: "hsl(0, 84%, 60%)" } // Red
  ];

  const recentDays = bills.reduce((acc, bill) => {
    const date = formatDisplayDate(bill.bill_date);
    if (!acc[date]) acc[date] = { date, lended: 0, received: 0 };
    if (bill.bill_type === "CREDIT") acc[date].lended += bill.total_amount_lended;
    else acc[date].received += bill.amount_paid;
    return acc;
  }, {} as Record<string, { date: string, lended: number, received: number }>);

  const trendData = Object.values(recentDays).slice(0, 7).reverse(); // Last 7 active days

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground">Financial overview and business health</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio</CardTitle></CardHeader>
          <CardContent><CurrencyDisplay amount={stats?.total_outstanding ?? 0} className="text-2xl font-bold" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Capital</CardTitle></CardHeader>
          <CardContent><CurrencyDisplay amount={stats?.total_lended_active ?? 0} className="text-2xl font-bold text-primary" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-emerald-600">Total Money Received</CardTitle></CardHeader>
          <CardContent><CurrencyDisplay amount={creditTotal} className="text-2xl font-bold" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600">Total Money Lended</CardTitle></CardHeader>
          <CardContent><CurrencyDisplay amount={debitTotal} className="text-2xl font-bold" /></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cash Flow Summary</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cashFlowData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {cashFlowData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Activity Trend</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={value => `₹${value/1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="lended" name="Lended" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" name="Received" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
