import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useOnboardCustomer, useUpdateCustomer, useCustomerDetail } from "@/hooks/use-customers.hook";
import { PageHeader } from "@/components/shared/page-header";
import { customerOnboardSchema, type CustomerOnboardFormValues } from "@/validators/customer.schema";
import { Gender, MaritalStatus } from "@/types/enums";
import { Plus, Trash2, Loader2, Image as ImageIcon, Check, UploadCloud, X } from "lucide-react";
import { useAuthImage } from "@/hooks/use-auth-image.hook";

// ─── Custom Hooks & Previews ────────────────────────────────

/**
 * Custom hook to safely generate and revoke Object URLs for file previews.
 * Prevents browser memory leaks in single-page apps.
 */
function useFilePreview(file: File | string | undefined) {
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const authPreview = useAuthImage(preview);

  useEffect(() => {
    if (!file) {
      setPreview(undefined);
      return;
    }
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setPreview(file);
  }, [file]);

  return authPreview;
}

// ─── Reusable Drag & Drop Image Dropzone ─────────────────────

interface ImageUploadDropzoneProps {
  value: File | string | undefined;
  onChange: (file: File | undefined) => void;
  placeholderText?: string;
  className?: string;
  previewVariant?: "circle" | "rect";
}

function ImageUploadDropzone({
  value,
  onChange,
  placeholderText = "photo",
  className = "",
  previewVariant = "rect",
}: ImageUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const authPreviewUrl = useFilePreview(value);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onChange(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative w-full border-2 border-dashed rounded-xl transition-all duration-200 overflow-hidden flex flex-col items-center justify-center bg-muted/5 ${isDragActive
          ? "border-primary bg-primary/5 shadow-inner"
          : "border-muted-foreground/30 hover:border-primary/50"
        } ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {authPreviewUrl ? (
        <div className="relative w-full h-full min-h-[160px] flex items-center justify-center group p-3">
          <img
            src={authPreviewUrl}
            alt="Preview"
            className={`max-h-[220px] max-w-full object-cover shadow-sm ${previewVariant === "circle" ? "h-32 w-32 rounded-full border-2 border-primary/20" : "rounded-lg"
              }`}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleBrowseClick}
              className="font-medium"
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleBrowseClick}
          className="w-full h-full min-h-[150px] py-8 flex flex-col items-center justify-center gap-3 cursor-pointer select-none"
        >
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-colors group-hover:text-primary">
            <UploadCloud className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <p className="text-sm text-center text-muted-foreground px-4">
            Drag & drop your {placeholderText} here, or{" "}
            <span className="text-primary font-semibold underline decoration-solid hover:opacity-85">
              browse
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Step 1: Personal Info Section ───────────────────────────

function PersonalInfoSection({ form }: { form: ReturnType<typeof useForm<CustomerOnboardFormValues>> }) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Full Name</FormLabel>
            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="date_of_birth" render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Birth</FormLabel>
            <FormControl><Input type="date" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="occupation" render={({ field }) => (
          <FormItem>
            <FormLabel>Occupation</FormLabel>
            <FormControl><Input placeholder="e.g. Business / Farmer" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="gender" render={({ field }) => (
          <FormItem>
            <FormLabel>Gender</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.values(Gender).map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="marital_status" render={({ field }) => (
          <FormItem>
            <FormLabel>Marital Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.values(MaritalStatus).map((ms) => (
                  <SelectItem key={ms} value={ms}>{ms}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="image" render={({ field }) => (
          <FormItem className="sm:col-span-2 border-t pt-4 mt-2">
            <FormLabel>Profile Photo</FormLabel>
            <FormControl>
              <ImageUploadDropzone
                value={field.value}
                onChange={field.onChange}
                placeholderText="profile photo"
                previewVariant="circle"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </CardContent>
    </Card>
  );
}

// ─── Step 2: Contact & Address Section ──────────────────────

function ContactAndAddressSection({ form }: { form: ReturnType<typeof useForm<CustomerOnboardFormValues>> }) {
  const contactFields = useFieldArray({ control: form.control, name: "contacts" });
  const addressFields = useFieldArray({ control: form.control, name: "addresses" });

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Contact & Address Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Contact Information */}
        <div className="space-y-4">
          <FormField control={form.control} name="contacts.0.phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl><Input placeholder="+1 555-0123" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="contacts.0.email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl><Input placeholder="john.doe@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Secondary Contacts */}
          {contactFields.fields.slice(1).map((item, index) => {
            const actualIndex = index + 1;
            return (
              <div key={item.id} className="relative p-4 border rounded-lg space-y-4 pt-10 mt-4 animate-in fade-in-30">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => contactFields.remove(actualIndex)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <FormField control={form.control} name={`contacts.${actualIndex}.phone`} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Phone {actualIndex}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`contacts.${actualIndex}.email`} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Email {actualIndex}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            );
          })}

          <Button type="button" variant="outline" size="sm" className="mt-2 w-full sm:w-auto" onClick={() => contactFields.append({ phone: "", secondary_phone: "", whatsapp_phone: "", email: "" })}>
            <Plus className="h-4 w-4 mr-1" /> Add Alternate Contact
          </Button>
        </div>

        {/* Right Column: Address Details */}
        <div className="space-y-4">
          <FormField control={form.control} name="addresses.0.street" render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl><Input placeholder="123 Main St, Apt 4B" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="addresses.0.city" render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl><Input placeholder="New York" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="addresses.0.state" render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl><Input placeholder="NY" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="addresses.0.postal_code" render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl><Input placeholder="10001" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="addresses.0.country" render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl><Input placeholder="United States" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Secondary Addresses */}
          {addressFields.fields.slice(1).map((item, index) => {
            const actualIndex = index + 1;
            return (
              <div key={item.id} className="relative p-4 border rounded-lg space-y-4 pt-10 mt-4 animate-in fade-in-30">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => addressFields.remove(actualIndex)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <FormField control={form.control} name={`addresses.${actualIndex}.street`} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Street {actualIndex}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`addresses.${actualIndex}.city`} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt City {actualIndex}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name={`addresses.${actualIndex}.state`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt State {actualIndex}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`addresses.${actualIndex}.postal_code`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Postal Code {actualIndex}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name={`addresses.${actualIndex}.country`} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Country {actualIndex}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            );
          })}

          <Button type="button" variant="outline" size="sm" className="mt-2 w-full sm:w-auto" onClick={() => addressFields.append({ street: "", city: "", state: "", postal_code: "", country: "India" })}>
            <Plus className="h-4 w-4 mr-1" /> Add Alternate Address
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Step 3: ID Proof & Relatives Section ───────────────────

function IdProofFieldItem({
  form,
  index,
  onRemove,
  showRemove,
}: {
  form: ReturnType<typeof useForm<CustomerOnboardFormValues>>;
  index: number;
  onRemove: () => void;
  showRemove: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 p-4 border rounded-lg relative hover:shadow-sm transition-shadow animate-in fade-in-30">
      {showRemove && (
        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <FormField control={form.control} name={`id_proofs.${index}.id_type`} render={({ field }) => (
        <FormItem>
          <FormLabel>ID Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select ID Type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="AADHAR">Aadhar</SelectItem>
              <SelectItem value="PAN">PAN</SelectItem>
              <SelectItem value="PASSPORT">Passport</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name={`id_proofs.${index}.id_number`} render={({ field }) => (
        <FormItem>
          <FormLabel>ID Number</FormLabel>
          <FormControl><Input placeholder="ID document number" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name={`id_proofs.${index}.image`} render={({ field }) => (
        <FormItem className="sm:col-span-2 border-t pt-4 mt-2">
          <FormLabel>Document Photo / Scan</FormLabel>
          <FormControl>
            <ImageUploadDropzone
              value={field.value}
              onChange={field.onChange}
              placeholderText="ID photo"
              previewVariant="rect"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );
}

function IdProofsSection({ form }: { form: ReturnType<typeof useForm<CustomerOnboardFormValues>> }) {
  const idProofFields = useFieldArray({ control: form.control, name: "id_proofs" });

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>ID Proof Documents</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => idProofFields.append({ id_type: "AADHAR", id_number: "" })}>
          <Plus className="h-4 w-4 mr-1" /> Add ID
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {idProofFields.fields.map((item, index) => (
          <IdProofFieldItem
            key={item.id}
            form={form}
            index={index}
            showRemove={index > 0}
            onRemove={() => idProofFields.remove(index)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function RelativeFieldItem({
  form,
  index,
  onRemove,
  showRemove,
}: {
  form: ReturnType<typeof useForm<CustomerOnboardFormValues>>;
  index: number;
  onRemove: () => void;
  showRemove: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 p-4 border rounded-lg relative hover:shadow-sm transition-shadow animate-in fade-in-30">
      {showRemove && (
        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <FormField control={form.control} name={`relatives.${index}.name`} render={({ field }) => (
        <FormItem>
          <FormLabel>Full Name</FormLabel>
          <FormControl><Input placeholder="Guarantor name" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name={`relatives.${index}.relationship`} render={({ field }) => (
        <FormItem>
          <FormLabel>Relationship</FormLabel>
          <FormControl><Input placeholder="e.g. Spouse / Brother" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name={`relatives.${index}.contact_number`} render={({ field }) => (
        <FormItem>
          <FormLabel>Phone Number</FormLabel>
          <FormControl><Input placeholder="Phone number" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name={`relatives.${index}.image`} render={({ field }) => (
        <FormItem className="sm:col-span-3 border-t pt-4 mt-2">
          <FormLabel>Photo (Optional)</FormLabel>
          <FormControl>
            <ImageUploadDropzone
              value={field.value}
              onChange={field.onChange}
              placeholderText="relative's photo"
              previewVariant="circle"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );
}

function RelativesSection({ form }: { form: ReturnType<typeof useForm<CustomerOnboardFormValues>> }) {
  const relativeFields = useFieldArray({ control: form.control, name: "relatives" });

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Relatives & Guarantors</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => relativeFields.append({ name: "", relationship: "", contact_number: "" })}>
          <Plus className="h-4 w-4 mr-1" /> Add Relative
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {relativeFields.fields.map((item, index) => (
          <RelativeFieldItem
            key={item.id}
            form={form}
            index={index}
            showRemove={index > 0}
            onRemove={() => relativeFields.remove(index)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Main Onboarding Component ───────────────────────────────

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
    { id: 1, title: "Personal Information" },
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title={isEditMode ? "Edit Customer" : "Customer Onboarding"}
        description={isEditMode ? `Updating details for ${customerData?.name || "..."}` : "Register a new customer"}
        backTo={isEditMode ? `/customers/${customerId}` : "/customers"}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">

        {/* ── Desktop Sidebar Stepper (Left) ────────────────── */}
        <div className="hidden lg:flex flex-col gap-12 py-8 relative col-span-1 min-h-[400px] border-r pr-6">
          {/* Central connecting line */}
          <div className="absolute left-[20px] top-12 bottom-12 w-0.5 bg-muted-foreground/20 -z-10" />

          {steps.map((s) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;

            return (
              <div key={s.id} className="flex items-center gap-4 group">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 shrink-0 ${isActive
                    ? "bg-gradient-to-br from-primary to-yellow-500 border-transparent text-primary-foreground shadow-[var(--shadow-gold)] scale-110"
                    : isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-muted-foreground/30 text-muted-foreground"
                  }`}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <span className="font-semibold">{s.id}</span>}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold transition-colors duration-300 ${isActive ? "text-primary text-base" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    }`}>
                    {s.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Mobile/Tablet Tracker (Top) ──────────────────── */}
        <div className="lg:hidden flex items-center justify-between relative px-2 mb-2">
          {/* Connecting line */}
          <div className="absolute left-0 top-5 -translate-y-1/2 w-full px-5 -z-10">
            <div className="h-0.5 bg-muted-foreground/20 w-full rounded-full" />
          </div>
          {steps.map((s) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;

            return (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                    ? "bg-gradient-to-br from-primary to-yellow-500 border-transparent text-primary-foreground shadow-[var(--shadow-gold)] scale-105"
                    : isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-muted-foreground/30 text-muted-foreground"
                  }`}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <span className="font-semibold">{s.id}</span>}
                </div>
                <span className={`text-xs font-semibold ${isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.title.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Form Container (Right) ────────────────────────── */}
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">

              <div className="min-h-[300px]">
                {step === 1 && (
                  <div className="animate-in fade-in duration-300">
                    <PersonalInfoSection form={form} />
                  </div>
                )}
                {step === 2 && (
                  <div className="animate-in fade-in duration-300">
                    <ContactAndAddressSection form={form} />
                  </div>
                )}
                {step === 3 && (
                  <div className="animate-in fade-in duration-300 space-y-6">
                    <IdProofsSection form={form} />
                    <RelativesSection form={form} />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={(e) => validateStep(e)}
                    className="w-full bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/95 hover:to-yellow-500/95 text-primary-foreground font-semibold py-6 shadow-[var(--shadow-gold)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    Save & Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={onboardMutation.isPending || updateMutation.isPending}
                    className="w-full bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/95 hover:to-yellow-500/95 text-primary-foreground font-semibold py-6 shadow-[var(--shadow-gold)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    {(onboardMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Save Changes" : "Submit Registration"}
                  </Button>
                )}

                {step > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep(step - 1);
                      window.scrollTo(0, 0);
                    }}
                    className="w-full text-muted-foreground hover:text-foreground py-4"
                  >
                    Back
                  </Button>
                )}
              </div>

            </form>
          </Form>
        </div>

      </div>
    </div>
  );
}
