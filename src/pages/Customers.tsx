import { useState } from 'react';
import { useData, Customer } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Phone, MapPin, User, Upload } from 'lucide-react';
import { toast } from 'sonner';
import CustomerDetailsDialog from '@/components/CustomerDetailsDialog';

const Customers = () => {
  const { customers, addCustomer } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    village: '',
    phoneNumber: '',
    fatherHusbandName: '',
    fatherHusbandVillage: '',
    image: '',
    description: '',
    email: '',
    idProofType: '',
    idProofNum: '',
    idProofImage: '',
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm) ||
      c.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdProofImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, idProofImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer(formData);
    toast.success('Customer added successfully!');
    setFormData({
      name: '',
      village: '',
      phoneNumber: '',
      fatherHusbandName: '',
      fatherHusbandVillage: '',
      image: '',
      description: '',
      email: '',
      idProofType: '',
      idProofNum: '',
      idProofImage: '',
    });
    setShowDropdown(false);
    setIsDialogOpen(false);
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Customer Image</Label>
                  <div className="flex items-center gap-4">
                    {formData.image && (
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={formData.image} />
                        <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 relative">
                    <Label htmlFor="name">Customer Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      required
                    />
                    {showDropdown && formData.name && filteredCustomers.length > 0 && (
                      <Card className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto">
                        <CardContent className="p-2">
                          {filteredCustomers.slice(0, 5).map((customer) => (
                            <div
                              key={customer.id}
                              className="p-2 hover:bg-muted rounded cursor-pointer text-sm"
                              onClick={() => {
                                setFormData({
                                  name: customer.name,
                                  village: customer.village,
                                  phoneNumber: customer.phoneNumber,
                                  fatherHusbandName: customer.fatherHusbandName,
                                  fatherHusbandVillage: customer.fatherHusbandVillage,
                                  image: customer.image || '',
                                  description: customer.description || '',
                                  email: customer.email || '',
                                  idProofType: customer.idProofType || '',
                                  idProofNum: customer.idProofNum || '',
                                  idProofImage: customer.idProofImage || '',
                                });
                                setShowDropdown(false);
                              }}
                            >
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-muted-foreground">{customer.phoneNumber} - {customer.village}</div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="village">Village</Label>
                    <Input
                      id="village"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherHusbandName">Father/Husband Name</Label>
                    <Input
                      id="fatherHusbandName"
                      value={formData.fatherHusbandName}
                      onChange={(e) => setFormData({ ...formData, fatherHusbandName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherHusbandVillage">Father/Husband Village</Label>
                    <Input
                      id="fatherHusbandVillage"
                      value={formData.fatherHusbandVillage}
                      onChange={(e) => setFormData({ ...formData, fatherHusbandVillage: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idProofType">ID Proof Type</Label>
                    <Input
                      id="idProofType"
                      value={formData.idProofType}
                      onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })}
                      placeholder="e.g. Aadhar, PAN, Passport"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idProofNum">ID Proof Number</Label>
                    <Input
                      id="idProofNum"
                      value={formData.idProofNum}
                      onChange={(e) => setFormData({ ...formData, idProofNum: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idProofImage">ID Proof Image (Optional)</Label>
                  <Input
                    id="idProofImage"
                    type="file"
                    accept="image/*"
                    onChange={handleIdProofImageUpload}
                    className="cursor-pointer"
                  />
                  {formData.idProofImage && (
                    <div className="mt-2">
                      <img src={formData.idProofImage} alt="ID Proof" className="h-32 w-auto rounded border" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add any additional notes about the customer..."
                    rows={3}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Add Customer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers by name, phone, or village..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <Card 
            key={customer.id} 
            className="hover:shadow-[var(--shadow-gold)] transition-shadow cursor-pointer"
            onClick={() => handleCustomerClick(customer)}
          >
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={customer.image} alt={customer.name} />
                    <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">S/O {customer.fatherHusbandName}</p>
                  </div>
                </div>
                {customer.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{customer.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{customer.village}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{customer.fatherHusbandVillage}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CustomerDetailsDialog
        customer={selectedCustomer}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No customers found</p>
        </div>
      )}
    </div>
  );
};

export default Customers;
