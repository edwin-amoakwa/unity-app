export enum ApplicationType {
  SMS = 'SMS'
}

export enum FormOfPayment {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  MOBILE_MONEY = 'MOBILE_MONEY'
}

export enum PaymentInitiator {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN'
}

export enum UserAccountCategory {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  ENTERPRISE = 'ENTERPRISE'
}

export enum ActiveInactiveStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum UserCategory {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MERCHANT = 'MERCHANT'
}

export interface User {
  id?: string;
  accountName: string;
  emailAddress: string;
  phoneNo: string;
  accountCategory: UserAccountCategory;
  merchantName: string;
  merchantId: string;
  accountStatus: ActiveInactiveStatus;
  userCategory: UserCategory;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id?: string;
  amount: number;
  paid?: boolean;
  paymentRefNo: string;
  paymentNotes: string;
  processingNo?: string;
  formOfPayment: FormOfPayment;
  formOfPaymentName?: string;
  initiationSource: PaymentInitiator;
  initiationSourceName?: string;
  initiatedById?: string;
  initiatedByName?: string;
  verifiedById?: string;
  verifiedByName?: string;
  valueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

