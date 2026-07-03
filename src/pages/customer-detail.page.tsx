import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DateDisplay } from "@/components/shared/date-display";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/utils/format-currency";
import { useCustomerDetail } from "@/hooks/use-customers.hook";
import { useCustomerItems } from "@/hooks/use-items.hook";
import { useCustomerBills } from "@/hooks/use-bills.hook";
import { User, Phone, MapPin, FileText, Package, CreditCard, Users as UsersIcon, Calendar, Edit, Briefcase, Heart, Wallet, ArrowDownRight, ArrowUpRight, Plus, Loader2 } from "lucide-react";

import { useCustomerWallet, useWalletTransactions, useDepositToWallet } from "@/hooks/use-wallet.hook";
import { useAccountsList } from "@/hooks/use-accounts.hook";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useAuthImage } from "@/hooks/use-auth-image.hook";

function AuthImage({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  const authSrc = useAuthImage(src);
  if (!authSrc) return null;
  return <img src={authSrc} alt={alt} className={className} />;
}

function AuthAvatarImage({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  const authSrc = useAuthImage(src);
  if (!authSrc) return null;
  return <AvatarImage src={authSrc} alt={alt} className={className} />;
}

function PersonalInfoTab({ customer }: { customer: NonNullable<ReturnType<typeof useCustomerDetail>["data"]> }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-1">
        <p className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Full Name</p>
        <p className="font-semibold text-lg">{customer.name}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Date of Birth</p>
        <p className="font-semibold text-lg"><DateDisplay dateString={customer.date_of_birth} /></p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Gender</p>
        <p className="font-semibold text-lg">{customer.gender}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Heart className="h-4 w-4" /> Marital Status</p>
        <p className="font-semibold text-lg">{customer.marital_status}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" /> Occupation</p>
        <p className="font-semibold text-lg">{customer.occupation || "—"}</p>
      </div>
    </div>
  );
}

function ContactsTab({ contacts }: { contacts: NonNullable<ReturnType<typeof useCustomerDetail>["data"]>["contacts"] }) {
  if (!contacts?.length) return <EmptyState icon={Phone} title="No contacts" />;
  return (
    <div className="space-y-3">
      {contacts.map((contact, index) => (
        <Card key={index}>
          <CardContent className="p-4 grid gap-2 sm:grid-cols-2">
            <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{contact.phone}</p></div>
            {contact.secondary_phone && <div><p className="text-xs text-muted-foreground">Secondary</p><p>{contact.secondary_phone}</p></div>}
            {contact.whatsapp_phone && <div><p className="text-xs text-muted-foreground">WhatsApp</p><p>{contact.whatsapp_phone}</p></div>}
            {contact.email && <div><p className="text-xs text-muted-foreground">Email</p><p>{contact.email}</p></div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AddressesTab({ addresses }: { addresses: NonNullable<ReturnType<typeof useCustomerDetail>["data"]>["addresses"] }) {
  if (!addresses?.length) return <EmptyState icon={MapPin} title="No addresses" />;
  return (
    <div className="space-y-3">
      {addresses.map((address, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <p className="font-medium">{address.street}</p>
            <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.postal_code}</p>
            <p className="text-sm text-muted-foreground">{address.country}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ItemsSection({ customerId }: { customerId: number }) {
  const { data: items, isLoading } = useCustomerItems(customerId);
  if (isLoading) return <LoadingSpinner message="Loading items..." />;
  if (!items?.length) return <EmptyState icon={Package} title="No pledged items" />;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium">{item.description}</p>
                <p className="text-xs text-muted-foreground">{item.ornament_type} • {item.weight_net}g net</p>
              </div>
              <div className="text-right space-y-1">
                <CurrencyDisplay amount={item.outstanding_balance} className="font-semibold" />
                <div><StatusBadge status={item.status} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BillsSection({ customerId }: { customerId: number }) {
  const { data: billsPage, isLoading } = useCustomerBills(customerId);
  if (isLoading) return <LoadingSpinner message="Loading bills..." />;
  const bills = billsPage?.content ?? [];
  if (!bills.length) return <EmptyState icon={FileText} title="No bills" />;

  return (
    <div className="space-y-3">
      {bills.map((bill) => {
        const isRedeemBill = bill.bill_type === "REDEEM";
        const hasPartialPayment = isRedeemBill && bill.amount_paid > 0;
        const totalDue = bill.total_amount_lended + bill.interest_accumulated;
        const paidPct = totalDue > 0 ? Math.min(100, (bill.amount_paid / totalDue) * 100) : 0;

        return (
          <Card
            key={bill.id}
            className={`hover:shadow-sm transition-shadow ${hasPartialPayment ? "border-emerald-300/50 dark:border-emerald-700/50" : ""
              }`}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{bill.bill_id}</p>
                    {isRedeemBill && <StatusBadge status={bill.status} />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isRedeemBill ? "Pledge" : "Redemption"} • <DateDisplay dateString={bill.bill_date} />
                  </p>
                </div>
                <div className="text-right">
                  <CurrencyDisplay amount={bill.total_amount_lended} className="font-semibold" />
                  {hasPartialPayment && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Paid: <CurrencyDisplay amount={bill.amount_paid} className="inline" />
                    </p>
                  )}
                </div>
              </div>
              {/* Payment progress bar for partially-paid bills */}
              {hasPartialPayment && (
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${paidPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {paidPct.toFixed(0)}% paid • Remaining: <CurrencyDisplay amount={totalDue - bill.amount_paid} className="inline text-xs" />
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
function RelativesTab({ customerId, relatives }: { customerId: number, relatives: NonNullable<ReturnType<typeof useCustomerDetail>["data"]>["relatives"] }) {
  if (!relatives?.length) return <EmptyState icon={UsersIcon} title="No relatives/guarantors" />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {relatives.map((relative, index) => (
        <Card key={index} className="overflow-hidden border-border/50">
          <CardContent className="p-0">
            {relative.image_url && (
              <div className="aspect-video w-full bg-muted overflow-hidden relative">
                <AuthImage src={`/api/images/${customerId}/RELATIVE.${relative.image_url.split('.').pop()}`} alt={relative.name} className="object-cover w-full h-full" />
              </div>
            )}
            <div className="p-4 space-y-2">
              <p className="font-semibold text-lg">{relative.name}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Relationship</span>
                <span className="font-medium">{relative.relationship}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Contact</span>
                <span className="font-medium">{relative.contact_number}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WalletSection({ customerId }: { customerId: number }) {
  const { data: wallet, isLoading: isLoadingWallet } = useCustomerWallet(customerId);
  const { data: transactions, isLoading: isLoadingTx } = useWalletTransactions(customerId);
  const { data: accounts } = useAccountsList();
  const depositMutation = useDepositToWallet();

  const [depositOpen, setDepositOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [notes, setNotes] = useState("");

  const activeAccounts = accounts?.filter(a => a.is_active) || [];

  const handleDeposit = () => {
    if (!amount || !accountId) return;
    depositMutation.mutate(
      {
        custId: customerId,
        request: {
          amount: Number(amount),
          notes: notes,
          accounts: [{ account_id: Number(accountId), amount: Number(amount) }]
        }
      },
      {
        onSuccess: () => {
          setDepositOpen(false);
          setAmount("");
          setAccountId("");
          setNotes("");
        }
      }
    );
  };

  if (isLoadingWallet || isLoadingTx) return <LoadingSpinner message="Loading wallet..." />;

  const balance = wallet?.balance || 0;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Available Wallet Balance
              </p>
              <h3 className="text-4xl font-bold mt-2 text-foreground"><CurrencyDisplay amount={balance} /></h3>
              <p className="text-xs text-muted-foreground mt-2">Funds available for partial payments and redemptions.</p>
            </div>

            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="h-5 w-5 mr-2" /> Deposit Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Deposit to Wallet</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deposit To Account</label>
                    <Select value={accountId} onValueChange={setAccountId}>
                      <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                      <SelectContent>
                        {activeAccounts.map(a => {
                          const absBalance = formatCurrency(Math.abs(a.balance));
                          const suffix = a.balance < 0 ? "Lent" : "In Hand";
                          return (
                            <SelectItem key={a.id} value={a.id.toString()}>
                              {a.bank_name} (Bal: {absBalance} {suffix})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes (Optional)</label>
                    <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. advance interest payment" />
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleDeposit} disabled={depositMutation.isPending || !amount || !accountId}>
                    {depositMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Deposit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div>
        <h4 className="text-lg font-semibold mb-3">Transaction Ledger</h4>
        {!transactions?.length ? (
          <EmptyState icon={Wallet} title="No wallet transactions" />
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => (
              <Card key={tx.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                      {tx.type === 'DEPOSIT' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}</p>
                      <p className="text-xs text-muted-foreground"><DateDisplay dateString={tx.transaction_date} /> {tx.notes ? `• ${tx.notes}` : ''}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${tx.type === 'DEPOSIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                    {tx.type === 'DEPOSIT' ? '+' : '-'}<CurrencyDisplay amount={tx.amount} className="inline" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const parsedId = customerId ? Number(customerId) : null;
  const { data: customer, isLoading } = useCustomerDetail(parsedId);

  if (isLoading) return <LoadingSpinner message="Loading customer..." />;
  if (!customer) return <EmptyState icon={User} title="Customer not found" />;

  const initials = customer.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Customer Profile"
        backTo="/customers"
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[350px_1fr]">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden sticky top-24">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent w-full absolute top-0 left-0 -z-10" />
            <CardContent className="pt-10 pb-6 flex flex-col items-center text-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                {customer.image_url && (
                  <AuthAvatarImage src={`/api/images/${customer.cust_id}/PROFILE.${customer.image_url.split('.').pop()}`} className="object-cover" />
                )}
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <p className="text-sm text-muted-foreground font-mono">ID: {customer.cust_id}</p>
                <div className="pt-2"><StatusBadge status={customer.status} /></div>
              </div>

              <Separator className="w-full my-4" />

              <div className="w-full space-y-2">
                <Button
                  className="w-full gap-2"
                  variant="default"
                  onClick={() => navigate(`/create-pledge?customerId=${customer.cust_id}`)}
                >
                  <Package className="h-4 w-4" /> New Pledge
                </Button>
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={() => navigate(`/customers/edit/${customer.cust_id}`)}
                >
                  <Edit className="h-4 w-4" /> Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="w-full min-w-0">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden border-b rounded-none bg-transparent h-auto p-0 space-x-6 pb-px">
              <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"><User className="h-4 w-4 mr-2" /> Overview</TabsTrigger>
              <TabsTrigger value="contacts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"><Phone className="h-4 w-4 mr-2" /> Contacts</TabsTrigger>
              <TabsTrigger value="addresses" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"><MapPin className="h-4 w-4 mr-2" /> Addresses</TabsTrigger>
              <TabsTrigger value="idproofs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"><CreditCard className="h-4 w-4 mr-2" /> ID Proofs</TabsTrigger>
              <TabsTrigger value="relatives" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"><UsersIcon className="h-4 w-4 mr-2" /> Relatives</TabsTrigger>
              <TabsTrigger value="items" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"><Package className="h-4 w-4 mr-2" /> Items</TabsTrigger>
              <TabsTrigger value="bills" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"><FileText className="h-4 w-4 mr-2" /> Bills</TabsTrigger>
              <TabsTrigger value="wallet" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent px-2 py-3"><Wallet className="h-4 w-4 mr-2" /> Wallet</TabsTrigger>
            </TabsList>

            <div className="pt-6">
              <TabsContent value="info" className="m-0 focus-visible:outline-none">
                <Card className="border-border/50 shadow-sm"><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent><PersonalInfoTab customer={customer} /></CardContent></Card>
              </TabsContent>
              <TabsContent value="contacts" className="m-0 focus-visible:outline-none"><ContactsTab contacts={customer.contacts} /></TabsContent>
              <TabsContent value="addresses" className="m-0 focus-visible:outline-none"><AddressesTab addresses={customer.addresses} /></TabsContent>
              <TabsContent value="idproofs" className="m-0 focus-visible:outline-none">
                {customer.id_proofs?.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {customer.id_proofs.map((proof, index) => (
                      <Card key={index} className="overflow-hidden border-border/50">
                        <CardContent className="p-0">
                          {proof.image_url && (
                            <div className="aspect-video w-full bg-muted overflow-hidden relative">
                              <AuthImage src={`/api/images/${customer.cust_id}/${proof.id_type}.${proof.image_url.split('.').pop()}`} alt={proof.id_type} className="object-cover w-full h-full" />
                            </div>
                          )}
                          <div className="p-4 space-y-1">
                            <p className="font-semibold text-lg">{proof.id_type}</p>
                            <p className="text-muted-foreground font-mono">{proof.id_number}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : <EmptyState icon={CreditCard} title="No ID proofs" />}
              </TabsContent>
              <TabsContent value="relatives" className="m-0 focus-visible:outline-none"><RelativesTab customerId={customer.cust_id} relatives={customer.relatives} /></TabsContent>
              <TabsContent value="items" className="m-0 focus-visible:outline-none"><ItemsSection customerId={customer.cust_id} /></TabsContent>
              <TabsContent value="bills" className="m-0 focus-visible:outline-none"><BillsSection customerId={customer.cust_id} /></TabsContent>
              <TabsContent value="wallet" className="m-0 focus-visible:outline-none"><WalletSection customerId={customer.cust_id} /></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
