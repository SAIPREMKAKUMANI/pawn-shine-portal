import { z } from "zod";
import { Gender, MaritalStatus } from "@/types/enums";

const contactSchema = z.object({
  contact_id: z.number().optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  secondary_phone: z.string().optional(),
  whatsapp_phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

const addressSchema = z.object({
  address_id: z.number().optional(),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

const idProofSchema = z.object({
  id_proof_id: z.number().optional(),
  id_type: z.string().min(1, "ID type is required"),
  id_number: z.string().min(1, "ID number is required"),
  image: z.any().optional(),
});

const relativeSchema = z.object({
  relative_id: z.number().optional(),
  name: z.string().min(1, "Relative name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  contact_number: z.string().min(10, "Contact number is required"),
  image: z.any().optional(),
});

export const customerOnboardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.nativeEnum(Gender, { required_error: "Gender is required" }),
  marital_status: z.nativeEnum(MaritalStatus, {
    required_error: "Marital status is required",
  }),
  occupation: z.string().min(1, "Occupation is required"),
  image: z.any().optional(),
  contacts: z.array(contactSchema).min(1, "At least one contact required"),
  addresses: z.array(addressSchema).min(1, "At least one address required"),
  id_proofs: z.array(idProofSchema).min(1, "At least one ID proof required"),
  relatives: z.array(relativeSchema).min(1, "At least one relative required"),
});

export type CustomerOnboardFormValues = z.infer<typeof customerOnboardSchema>;
