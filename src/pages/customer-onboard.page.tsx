import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useOnboardCustomer, useUpdateCustomer, useCustomerDetail } from "@/hooks/use-customers.hook";
import { customerOnboardSchema, type CustomerOnboardFormValues } from "@/validators/customer.schema";
import { Gender, MaritalStatus } from "@/types/enums";
import { ArrowLeft, Plus, Trash2, Loader2, Image as ImageIcon, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useAuthImage } from "@/hooks/use-auth-image.hook";

function AuthImage({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  const authSrc = useAuthImage(src);
  if (!authSrc) return null;
  return <img src={authSrc} alt={alt} className={className} />;
}

function PersonalInfoSection({ form }: { form: ReturnType<typeof useForm<CustomerOnboardFormValues>> }) {
  const profileImage = form.watch("image");
  const profileImageUrl = profileImage instanceof File ? URL.createObjectURL(profileImage) : profileImage;
  const authProfileImageUrl = useAuthImage(profileImageUrl);
  return (
    <Card>
      <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="date_of_birth" render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="occupation" render={({ field }) => (<FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.values(Gender).map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="marital_status" render={({ field }) => (<FormItem><FormLabel>Marital Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.values(MaritalStatus).map((ms) => <SelectItem key={ms} value={ms}>{ms}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="image" render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Profile Photo</FormLabel>
            <div className="flex items-center gap-4">
              {profileImageUrl && authProfileImageUrl ? (
                <img src={authProfileImageUrl} alt="Preview" className="h-16 w-16 rounded-full object-cover border" />
              ) : (
                <div className="h-16 w-16 rounded-full border border-dashed flex items-center justify-center bg-muted/50"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
              )}
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )} />
      </CardContent>
    </Card>
  );
}

function ContactsSection({ form }: { form: ReturnType<typeof useForm<CustomerOnboardFormValues>> }) {
  const contactFields = useFieldArray({ control: form.control, name: "contacts" });
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contact Information</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => contactFields.append({ phone: "", secondary_phone: "", whatsapp_phone: "", email: "" })}><Plus className="h-4 w-4 mr-1" />Add</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {contactFields.fields.map((contactField, index) => (
          <div key={contactField.id} className="grid gap-3 sm:grid-cols-2 p-4 border rounded-lg relative">
            {index > 0 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => contactFields.remove(index)}><Trash2 className="h-3 w-3" /></Button>}
            <FormField control={form.control} name={`contacts.${index}.phone`} render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name={`contacts.${index}.email`} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AddressSection({ form }: { form: ReturnType<typeof useForm<CustomerOnboardFormValues>> }) {
  const addressFields = useFieldArray({ control: form.control, name: "addresses" });
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Address</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => addressFields.append({ street: "", city: "", state: "", postal_code: "", country: "India" })}><Plus className="h-4 w-4 mr-1" />Add</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {addressFields.fields.map((addressField, index) => (
          <div key={addressField.id} className="grid gap-3 sm:grid-cols-2 p-4 border rounded-lg relative">
            {index > 0 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => addressFields.remove(index)}><Trash2 className="h-3 w-3" /></Button>}
            <FormField control={form.control} name={`addresses.${index}.street`} render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name={`addresses.${index}.city`} render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name={`addresses.${index}.state`} render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name={`addresses.${index}.postal_code`} render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name={`addresses.${index}.country`} render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function IdProofsSection({ form }: { form: ReturnType<typeof useForm<CustomerOnboardFormValues>> }) {
  const idProofFields = useFieldArray({ control: form.control, name: "id_proofs" });
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>ID Proofs</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => idProofFields.append({ id_type: "AADHAR", id_number: "" })}><Plus className="h-4 w-4 mr-1" />Add</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {idProofFields.fields.map((idField, index) => {
          const idImage = form.watch(`id_proofs.${index}.image`);
          const idImageUrl = idImage instanceof File ? URL.createObjectURL(idImage) : idImage;
          return (
            <div key={idField.id} className="grid gap-3 sm:grid-cols-2 p-4 border rounded-lg relative">
              {index > 0 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => idProofFields.remove(index)}><Trash2 className="h-3 w-3" /></Button>}
              <FormField control={form.control} name={`id_proofs.${index}.id_type`} render={({ field }) => (<FormItem><FormLabel>ID Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="AADHAR">Aadhar</SelectItem><SelectItem value="PAN">PAN</SelectItem><SelectItem value="PASSPORT">Passport</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name={`id_proofs.${index}.id_number`} render={({ field }) => (<FormItem><FormLabel>ID Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name={`id_proofs.${index}.image`} render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>ID Photo</FormLabel>
                  <div className="flex items-center gap-4">
                    {idImageUrl && <AuthImage src={idImageUrl} alt="ID Preview" className="h-12 w-20 rounded object-cover border" />}
                    <FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RelativesSection({ form }: { form: ReturnType<typeof useForm<CustomerOnboardFormValues>> }) {
  const relativeFields = useFieldArray({ control: form.control, name: "relatives" });
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Relatives / Guarantors</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => relativeFields.append({ name: "", relationship: "", contact_number: "" })}><Plus className="h-4 w-4 mr-1" />Add</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {relativeFields.fields.map((relField, index) => {
          const relImage = form.watch(`relatives.${index}.image`);
          const relImageUrl = relImage instanceof File ? URL.createObjectURL(relImage) : relImage;
          return (
            <div key={relField.id} className="grid gap-3 sm:grid-cols-3 p-4 border rounded-lg relative">
              {index > 0 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => relativeFields.remove(index)}><Trash2 className="h-3 w-3" /></Button>}
              <FormField control={form.control} name={`relatives.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name={`relatives.${index}.relationship`} render={({ field }) => (<FormItem><FormLabel>Relationship</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name={`relatives.${index}.contact_number`} render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name={`relatives.${index}.image`} render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Relative Photo</FormLabel>
                  <div className="flex items-center gap-4">
                    {relImageUrl && <AuthImage src={relImageUrl} alt="Relative Preview" className="h-12 w-12 rounded-full object-cover border" />}
                    <FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function CustomerOnboardPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const onboardMutation = useOnboardCustomer();
  const updateMutation = useUpdateCustomer();
  const [step, setStep] = useState(1);

  const isEditMode = !!customerId;
  const parsedId = customerId ? parseInt(customerId) : null;
  const { data: customerData, isLoading: isLoadingCustomer } = useCustomerDetail(parsedId);

  const form = useForm<CustomerOnboardFormValues>({
    resolver: zodResolver(customerOnboardSchema),
    defaultValues: {
      name: "", date_of_birth: "", gender: Gender.MALE, marital_status: MaritalStatus.SINGLE, occupation: "",
      contacts: [{ phone: "", secondary_phone: "", whatsapp_phone: "", email: "" }],
      addresses: [{ street: "", city: "", state: "", postal_code: "", country: "India" }],
      id_proofs: [{ id_type: "AADHAR", id_number: "" }],
      relatives: [{ name: "", relationship: "", contact_number: "" }],
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (customerData) {
      form.reset({
        name: customerData.name || "",
        date_of_birth: customerData.date_of_birth || "",
        gender: customerData.gender,
        marital_status: customerData.marital_status,
        occupation: customerData.occupation || "",
        image: customerData.image_url ? `/api/images/${customerData.cust_id}/PROFILE.${customerData.image_url.split('.').pop()}` : undefined,
        contacts: customerData.contacts.map(c => ({
          contact_id: c.contact_id,
          phone: c.phone || "",
          secondary_phone: c.secondary_phone || "",
          whatsapp_phone: c.whatsapp_phone || "",
          email: c.email || ""
        })),
        addresses: customerData.addresses.map(a => ({
          address_id: a.address_id,
          street: a.street || "",
          city: a.city || "",
          state: a.state || "",
          postal_code: a.postal_code || "",
          country: a.country || ""
        })),
        id_proofs: customerData.id_proofs.map(ip => ({
          id_proof_id: ip.id_proof_id,
          id_type: ip.id_type || "",
          id_number: ip.id_number || "",
          image: ip.image_url ? `/api/images/${customerData.cust_id}/${ip.id_type}.${ip.image_url.split('.').pop()}` : undefined
        })),
        relatives: customerData.relatives.map(r => ({
          relative_id: r.relative_id,
          name: r.name || "",
          relationship: r.relationship || "",
          contact_number: r.contact_number || "",
          image: r.image_url ? `/api/images/${customerData.cust_id}/RELATIVE.${r.image_url.split('.').pop()}` : undefined
        })),
      });
    }
  }, [customerData, form]);

  const validateStep = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["name", "date_of_birth", "gender", "marital_status", "occupation", "image"]);
    } else if (step === 2) {
      isValid = await form.trigger(["contacts", "addresses"]);
    } else if (step === 3) {
      isValid = await form.trigger(["id_proofs", "relatives"]);
    }
    if (isValid && step < 3) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  function handleSubmitForm(values: CustomerOnboardFormValues) {
    if (step !== 3) return;
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("dateOfBirth", values.date_of_birth);
    formData.append("gender", values.gender);
    formData.append("maritalStatus", values.marital_status);
    formData.append("occupation", values.occupation);

    if (values.image instanceof File) {
      formData.append("image", values.image);
    }

    values.contacts.forEach((contact, index) => {
      if (contact.contact_id) formData.append(`contacts[${index}].contactId`, contact.contact_id.toString());
      formData.append(`contacts[${index}].phone`, contact.phone);
      if (contact.secondary_phone) formData.append(`contacts[${index}].secondaryPhone`, contact.secondary_phone);
      if (contact.whatsapp_phone) formData.append(`contacts[${index}].whatsappPhone`, contact.whatsapp_phone);
      if (contact.email) formData.append(`contacts[${index}].email`, contact.email);
    });

    values.addresses.forEach((address, index) => {
      if (address.address_id) formData.append(`addresses[${index}].addressId`, address.address_id.toString());
      formData.append(`addresses[${index}].street`, address.street);
      formData.append(`addresses[${index}].city`, address.city);
      formData.append(`addresses[${index}].state`, address.state);
      formData.append(`addresses[${index}].postalCode`, address.postal_code);
      formData.append(`addresses[${index}].country`, address.country);
    });

    values.id_proofs.forEach((idProof, index) => {
      if (idProof.id_proof_id) formData.append(`idProofs[${index}].idProofId`, idProof.id_proof_id.toString());
      formData.append(`idProofs[${index}].idType`, idProof.id_type);
      formData.append(`idProofs[${index}].idNumber`, idProof.id_number);
      if (idProof.image instanceof File) {
        formData.append(`idProofs[${index}].image`, idProof.image);
      }
    });

    values.relatives.forEach((relative, index) => {
      if (relative.relative_id) formData.append(`relatives[${index}].relativeId`, relative.relative_id.toString());
      formData.append(`relatives[${index}].name`, relative.name);
      formData.append(`relatives[${index}].relationship`, relative.relationship);
      formData.append(`relatives[${index}].contactNumber`, relative.contact_number);
      if (relative.image instanceof File) {
        formData.append(`relatives[${index}].image`, relative.image);
      }
    });

    if (isEditMode && parsedId) {
      updateMutation.mutate({ customerId: parsedId, formData }, { onSuccess: () => navigate(`/customers/${parsedId}`) });
    } else {
      onboardMutation.mutate(formData, { onSuccess: () => navigate("/customers") });
    }
  }

  const steps = [
    { id: 1, title: "Personal Info" },
    { id: 2, title: "Contact & Address" },
    { id: 3, title: "ID & Relatives" }
  ];

  if (isEditMode && isLoadingCustomer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading customer details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(isEditMode ? `/customers/${customerId}` : "/customers")}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-3xl font-bold">{isEditMode ? "Edit Customer" : "New Customer"}</h1><p className="text-muted-foreground">{isEditMode ? `Updating details for ${customerData?.name || "..."}` : "Register a new customer"}</p></div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-5 -translate-y-1/2 w-full px-5 -z-10">
          <div className="h-1 bg-muted w-full rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${step > s.id ? "bg-primary border-primary text-primary-foreground" : step === s.id ? "bg-background border-primary text-primary" : "bg-background border-muted-foreground text-muted-foreground"}`}>
              {step > s.id ? <Check className="h-5 w-5" /> : <span className="font-semibold">{s.id}</span>}
            </div>
            <span className={`text-sm font-medium ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>{s.title}</span>
          </div>
        ))}
      </div>

  <Form {...form}>
    <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
      <div className="min-h-[400px]">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <PersonalInfoSection form={form} />
          </div>
        )}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <ContactsSection form={form} />
            <AddressSection form={form} />
          </div>
        )}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <IdProofsSection form={form} />
            <RelativesSection form={form} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          disabled={step === 1}
          onClick={() => { setStep(step - 1); window.scrollTo(0, 0); }}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        {step < 3 ? (
          <Button type="button" onClick={(e) => validateStep(e)} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={onboardMutation.isPending || updateMutation.isPending} className="gap-2">
            {(onboardMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditMode ? "Save Changes" : "Submit Registration"}
          </Button>
        )}
      </div>
    </form>
  </Form>
    </div >
  );
}
