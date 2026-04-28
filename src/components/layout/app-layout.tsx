import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Sparkles,
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  Gem,
  LogOut,
  Package,
  PlusCircle,
  ArrowLeftRight,
  BarChart3,
  Menu,
} from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const NAVIGATION_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/items", label: "Items", icon: Package },
  { path: "/create-pledge", label: "New Pledge", icon: PlusCircle },
  { path: "/redeem", label: "Redeem", icon: ArrowLeftRight },
  { path: "/bills", label: "Bills", icon: FileText },
  { path: "/accounts", label: "Accounts", icon: Wallet },
  { path: "/ornaments", label: "Ornaments", icon: Gem },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

function NavItems({ onNavigate }: { onNavigate: (path: string) => void }) {
  const location = useLocation();

  return (
    <>
      {NAVIGATION_ITEMS.map((navItem) => {
        const Icon = navItem.icon;
        const isActive = location.pathname === navItem.path;
        return (
          <Button
            key={navItem.path}
            variant={isActive ? "default" : "ghost"}
            onClick={() => onNavigate(navItem.path)}
            className="gap-2 justify-start"
            size="sm"
          >
            <Icon className="h-4 w-4" />
            {navItem.label}
          </Button>
        );
      })}
    </>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const username = useAuthStore((state) => state.username);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    navigate("/");
  }

  function handleNavigate(path: string) {
    navigate(path);
    setMobileNavOpen(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-yellow-400 flex items-center justify-center shadow-[var(--shadow-gold)]">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-bold text-lg leading-tight">
                    Gold Pawn Broking
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Management System
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-1">
                <NavItems onNavigate={handleNavigate} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {username}
              </span>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
                size="sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 pt-12">
                  <div className="flex flex-col gap-1">
                    <NavItems onNavigate={handleNavigate} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
