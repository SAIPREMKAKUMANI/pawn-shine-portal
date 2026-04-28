import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { useCustomersPage, useCustomerCount } from "@/hooks/use-customers.hook";
import { Search, UserPlus, Users } from "lucide-react";
import type { CustomerBase } from "@/types/api.types";

function CustomerCard({ customer }: { customer: CustomerBase }) {
  const navigate = useNavigate();
  const initials = customer.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card
      className="cursor-pointer hover:shadow-[var(--shadow-gold)] transition-all duration-300 hover:-translate-y-1"
      onClick={() => navigate(`/customers/${customer.cust_id}`)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 bg-primary/10">
          {customer.image_url ? (
            <AvatarImage src={`http://localhost:8080/api/images/${customer.cust_id}/PROFILE.${customer.image_url.split('.').pop()}`} alt={customer.name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{customer.name}</p>
          <p className="text-xs text-muted-foreground">
            ID: {customer.cust_id} • {customer.gender}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CustomersListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const size = 12;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const { data: pagedData, isLoading } = useCustomersPage(page, size, debouncedSearch);
  const { data: customerCount } = useCustomerCount();
  const navigate = useNavigate();

  const customers = pagedData?.content ?? [];
  const totalPages = pagedData?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            {customerCount !== undefined ? `${customerCount} registered customers` : "Loading..."}
          </p>
        </div>
        <Button onClick={() => navigate("/customers/new")} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers by name..."
          className="pl-10"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>
      {isLoading && <LoadingSpinner message="Loading customers..." />}
      {!isLoading && customers.length === 0 && (
        <EmptyState icon={Users} title="No customers found" description={searchQuery ? "Try a different search term" : "Add your first customer to get started"} />
      )}
      {!isLoading && customers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {customers.map((customer) => (
            <CustomerCard key={customer.cust_id} customer={customer} />
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
