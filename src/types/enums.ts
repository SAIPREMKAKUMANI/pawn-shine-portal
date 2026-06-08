export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
  SEPARATED = "SEPARATED",
}

export enum MediaType {
  PROFILE = "PROFILE",
  ID_PROOF = "ID_PROOF",
  RELATIVE = "RELATIVE",
  AADHAR = "AADHAR",
  PAN = "PAN",
  PASSPORT = "PASSPORT",
  VOTER_ID = "VOTER_ID",
  DRIVING_LICENSE = "DRIVING_LICENSE",
}

export enum AccountType {
  CASH = "CASH",
  BANK = "BANK",
}

export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum WalletTransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
}

export enum ItemStatus {
  ACTIVE = "ACTIVE",
  REDEEMED = "REDEEMED",
  DEFAULTED = "DEFAULTED",
  HOLD = "HOLD",
  AUCTIONED = "AUCTIONED",
}

export enum BillType {
  PLEDGE = "PLEDGE",
  REDEEM = "REDEEM",
}

export enum BillStatus {
  ACTIVE = "ACTIVE",
  PARTIALLY_REDEEMED = "PARTIALLY_REDEEMED",
  REDEEMED = "REDEEMED",
}

export enum BillItemAction {
  KEPT = "KEPT",
  RELEASED = "RELEASED",
  AUCTIONED = "AUCTIONED",
}

export enum PaymentDirection {
  IN = "IN",
  OUT = "OUT",
}
