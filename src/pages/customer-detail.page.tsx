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
import { useCustomerDetail } from "@/hooks/use-customers.hook";
import { useCustomerItems } from "@/hooks/use-items.hook";
import { useCustomerBills } from "@/hooks/use-bills.hook";
import { ArrowLeft, User, Phone, MapPin, FileText, Package, CreditCard, Users as UsersIcon, Calendar, Edit, Briefcase, Heart } from "lucide-react";

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
      {bills.map((bill) => (
        <Card key={bill.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-medium text-sm">{bill.bill_id}</p>
              <p className="text-xs text-muted-foreground">{bill.bill_type === "CREDIT" ? "Pledge" : "Redemption"} • <DateDisplay dateString={bill.bill_date} /></p>
            </div>
            <CurrencyDisplay amount={bill.total_amount_lended} className="font-semibold" />
          </CardContent>
        </Card>
      ))}
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
                <img src={`http://localhost:8080/api/images/${customerId}/RELATIVE.${relative.image_url.split('.').pop()}`} alt={relative.name} className="object-cover w-full h-full" />
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
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/customers")} className="rounded-full shadow-sm hover:shadow-md transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Customer Profile</h1>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[350px_1fr]">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden sticky top-24">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent w-full absolute top-0 left-0 -z-10" />
            <CardContent className="pt-10 pb-6 flex flex-col items-center text-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                {customer.image_url && (
                  <AvatarImage src={`http://localhost:8080/api/images/${customer.cust_id}/PROFILE.${customer.image_url.split('.').pop()}`} className="object-cover" />
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
                              <img src={`http://localhost:8080/api/images/${customer.cust_id}/${proof.id_type}.${proof.image_url.split('.').pop()}`} alt={proof.id_type} className="object-cover w-full h-full" />
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
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
