import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { AppLayout } from "@/components/layout/app-layout";

// Pages
import LoginPage from "@/pages/login.page";
import DashboardPage from "@/pages/dashboard.page";
import CustomersListPage from "@/pages/customers-list.page";
import CustomerOnboardPage from "@/pages/customer-onboard.page";
import CustomerDetailPage from "@/pages/customer-detail.page";
import ItemsPage from "@/pages/items.page";
import CreatePledgePage from "@/pages/create-pledge.page";
import RedeemItemsPage from "@/pages/redeem-items.page";
import BillsPage from "@/pages/bills.page";
import AccountsPage from "@/pages/accounts.page";
import OrnamentsPage from "@/pages/ornaments.page";
import ReportsPage from "@/pages/reports.page";
import NotFoundPage from "@/pages/not-found.page";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <AppLayout>{children}</AppLayout> : <Navigate to="/" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><CustomersListPage /></ProtectedRoute>} />
          <Route path="/customers/new" element={<ProtectedRoute><CustomerOnboardPage /></ProtectedRoute>} />
          <Route path="/customers/edit/:customerId" element={<ProtectedRoute><CustomerOnboardPage /></ProtectedRoute>} />
          <Route path="/customers/:customerId" element={<ProtectedRoute><CustomerDetailPage /></ProtectedRoute>} />
          <Route path="/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
          <Route path="/create-pledge" element={<ProtectedRoute><CreatePledgePage /></ProtectedRoute>} />
          <Route path="/redeem" element={<ProtectedRoute><RedeemItemsPage /></ProtectedRoute>} />
          <Route path="/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
          <Route path="/ornaments" element={<ProtectedRoute><OrnamentsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

