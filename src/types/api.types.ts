import {
  AccountType,
  BillItemAction,
  BillStatus,
  BillType,
  Gender,
  ItemStatus,
  MaritalStatus,
  PaymentDirection,
  TransactionType,
  WalletTransactionType,
} from "./enums";

// --- Auth ---
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string | null;
}

export interface WebAuthnOptionsRequest {
  username: string;
}

// --- Customer ---
export interface CustomerBase {
  cust_id: number;
  name: string;
  date_of_birth: string;
  gender: Gender;
  status: string;
  image_url: string | null;
}

export interface CustomerListResponse {
  customers: CustomerBase[];
}

export interface ContactDto {
  contact_id?: number;
  phone: string;
  secondary_phone?: string;
  whatsapp_phone?: string;
  email?: string;
}

export interface AddressDto {
  address_id?: number;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface IdProofDto {
  id_proof_id?: number;
  id_type: string;
  id_number: string;
  image_url?: string;
}

export interface RelativeDto {
  relative_id?: number;
  name: string;
  relationship: string;
  contact_number: string;
  image_url?: string;
}

export interface OccupationDto {
  id?: number;
  occupation: string;
}

export interface CustomerDetail {
  cust_id: number;
  name: string;
  date_of_birth: string;
  gender: Gender;
  marital_status: MaritalStatus;
  status: string;
  image_url: string | null;
  occupation: string;
  contacts: ContactDto[];
  addresses: AddressDto[];
  id_proofs: IdProofDto[];
  relatives: RelativeDto[];
}

export interface CustomerOnboardRequest {
  name: string;
  date_of_birth: string;
  gender: Gender;
  marital_status: MaritalStatus;
  occupation: string;
  contacts: Omit<ContactDto, "contact_id">[];
  addresses: Omit<AddressDto, "address_id">[];
  id_proofs: Omit<IdProofDto, "id_proof_id" | "image_url">[];
  relatives: Omit<RelativeDto, "relative_id" | "image_url">[];
}

export interface CustomerOnboardResponse {
  customer_id: number;
  status: string;
  message: string;
}

// --- Account ---
export interface AccountDto {
  id: number;
  account_number: string;
  bank_name: string;
  account_type: AccountType;
  balance: number;
  is_active: boolean;
  disbursed_amount: number;
  repaid_amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAccountRequest {
  account_number: string;
  bank_name: string;
  account_type: AccountType;
}

export interface TransactionDto {
  id: number;
  account_id: number;
  account_number: string;
  bill_id: number;
  transaction_type: TransactionType;
  amount: number;
  balance_after: number;
  transaction_date: string;
  description: string;
  reference_id: string;
}

// --- Wallet ---
export interface CustomerWalletDto {
  id: number;
  cust_id: number;
  balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface WalletTransactionDto {
  id: number;
  wallet_id: number;
  amount: number;
  type: WalletTransactionType;
  transaction_date: string;
  notes?: string;
  created_at?: string;
}

export interface WalletAccountRequest {
  account_id: number;
  amount: number;
}

export interface WalletDepositRequest {
  amount: number;
  notes?: string;
  accounts: WalletAccountRequest[];
}

export interface WalletAllocationDto {
  id: number;
  deposit_transaction_id: number;
  amount_used: number;
  allocation_type: 'PRINCIPAL' | 'INTEREST';
  deposit_date: string;
  deposit_notes: string | null;
}

// --- Ornament ---
export interface OrnamentDto {
  id: number;
  type: string;
  description: string;
  default_interest_rate: number;
  default_amount_rate: number;
  is_active?: boolean;
}

export interface CreateOrnamentRequest {
  type: string;
  description: string;
  default_interest_rate: number;
  default_amount_rate: number;
}

// --- Item ---
export interface ItemDto {
  id: number;
  ornament_id: number;
  ornament_type: string;
  cust_id: number;
  customer_name: string;
  description: string;
  weight_gross: number;
  weight_net: number;
  amount_lended: number;
  interest_rate: number;
  paid_amount: number;
  compound_interest: number;
  outstanding_balance: number;
  status: ItemStatus;
  location: string;
  pledge_date: string;
  due_date: string;
  grace_period_days: number;
  redeemed_date: string | null;
  defaulted_date: string | null;
  auctioned_date: string | null;
  auction_amount: number | null;
}

export interface DashboardStats {
  total_outstanding: number;
  active_count: number;
  defaulted_count: number;
  hold_count: number;
  total_lended_active: number;
}

// --- Bill ---
export interface BillItemDto {
  item_id: number;
  action: BillItemAction;
  amount: number;
}

export interface BillAccountDto {
  account_id: number;
  amount: number;
  direction: PaymentDirection;
}

export interface BillDto {
  id: number;
  bill_id: string;
  cust_id: number;
  customer_name: string;
  bill_type: BillType;
  total_amount_lended: number;
  amount_paid: number;
  interest_accumulated: number;
  bill_date: string;
  notes: string;
  status: BillStatus;
  created_by: string;
  created_at: string;
  items: BillItemDto[];
  accounts: BillAccountDto[];
  wallet_allocations?: WalletAllocationDto[];
  wallet_amount_used?: number;
}

export interface PledgeItemRequest {
  ornamentId: number;
  description: string;
  weightGross: number;
  weightNet: number;
  amount: number;
  interestRate: number;
  location: string;
  dueDate: string;
  gracePeriodDays: number;
}

export interface PledgeAccountRequest {
  accountId: number;
  amount: number;
}

export interface PledgeBillRequest {
  custId: number;
  notes: string;
  billDate: string;
  items: PledgeItemRequest[];
  accounts: PledgeAccountRequest[];
}

export interface RedeemBillRequest {
  custId: number;
  itemIds: number[];
  notes: string;
  billDate: string;
  walletAmountUsed?: number;
  accounts: PledgeAccountRequest[];
}

// --- Interest ---
export interface InterestRecordRequest {
  item_id: number;
  interest_amount: number;
}

export interface InterestLedgerDto {
  id: number;
  item_id: number;
  ledger_date: string;
  principal: number;
  interest_amount: number;
  cumulative_interest: number;
  outstanding_balance: number;
}

// --- Pagination ---
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// --- Error ---
export interface ApiErrorResponse {
  error: string;
  message: string;
}
