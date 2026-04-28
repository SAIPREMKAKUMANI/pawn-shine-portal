import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateDisplay } from "@/components/shared/date-display";
import { useDashboardStats } from "@/hooks/use-items.hook";
import { useAccountsList } from "@/hooks/use-accounts.hook";
import { useBillsList } from "@/hooks/use-bills.hook";
import { useCustomerCount } from "@/hooks/use-customers.hook";
import { formatCurrency } from "@/utils/format-currency";
import {
  IndianRupee,
  Package,
  AlertTriangle,
  Clock,
  Users,
  Wallet,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: customerCount } = useCustomerCount();

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;
  if (!stats) return null;

  const cards = [
    { title: "Total Outstanding", value: formatCurrency(stats.total_outstanding), icon: IndianRupee, color: "text-primary" },
    { title: "Active Pledges", value: stats.active_count, icon: Package, color: "text-emerald-600" },
    { title: "Defaulted", value: stats.defaulted_count, icon: AlertTriangle, color: "text-red-600" },
    { title: "On Hold", value: stats.hold_count, icon: Clock, color: "text-amber-600" },
    { title: "Total Customers", value: customerCount ?? "—", icon: Users, color: "text-blue-600" },
    { title: "Total Lended (Active)", value: formatCurrency(stats.total_lended_active), icon: Wallet, color: "text-primary" },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title} className="shadow-sm hover:shadow-[var(--shadow-gold)] transition-all duration-300 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AccountBalances() {
  const { data: accounts, isLoading } = useAccountsList();

  if (isLoading) return null;
  if (!accounts?.length) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Account Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium text-sm">{account.bank_name}</p>
                <p className="text-xs text-muted-foreground">{account.account_number}</p>
              </div>
              <CurrencyDisplay amount={account.balance} className={`font-semibold ${account.balance < 0 ? "text-red-600" : "text-primary"}`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentBills() {
  const { data: billsPage, isLoading } = useBillsList(0, 5);

  if (isLoading) return null;
  const bills = billsPage?.content ?? [];
  if (!bills.length) return <EmptyState icon={FileText} title="No bills yet" description="Create your first pledge bill to get started" />;

  return (
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Recent Bills</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-1">
                <p className="font-medium text-sm">{bill.customer_name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{bill.bill_id}</span>
                  <StatusBadge status={bill.bill_type === "CREDIT" ? "PLEDGE" : "REDEEM"} />
                </div>
              </div>
              <div className="text-right">
                <CurrencyDisplay amount={bill.total_amount_lended} className="font-semibold text-sm" />
                <p className="text-xs text-muted-foreground"><DateDisplay dateString={bill.bill_date} /></p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardChart() {
  const { data: stats } = useDashboardStats();
  if (!stats) return null;

  const chartData = [
    { name: "Outstanding", value: stats.total_outstanding },
    { name: "Active Lended", value: stats.total_lended_active },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader><CardTitle>Portfolio Overview</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(value: number) => formatCurrency(value)} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="value" fill="hsl(43, 74%, 49%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your pawn broking management system</p>
      </div>
      <StatsCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <AccountBalances />
        <DashboardChart />
      </div>
      <RecentBills />
    </div>
  );
}
