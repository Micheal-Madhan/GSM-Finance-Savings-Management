
export type UserRole = 'Admin' | 'Basic';

export type SchemeType = 'KHSS' | 'DSS' | 'Finance';

export interface LoginUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  email?: string;
  phone: string;
  address: string;
  role: UserRole;
  createdAt: string;
}

export interface SchemeSettings {
  KHSS: number;
  DSS: number;
  Finance: number;
}

export interface SchemeUser {
  id: string; // e.g., GSM-KHSS-001
  name: string;
  phone: string;
  address: string;
  totalAmount: number;
  paidAmount: number;
  numSchemes: number;
  schemeType: SchemeType;
  selectedItem?: string; // For DSS
  paymentHistory: PaymentRecord[];
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
}

export type Language = 'en' | 'ta';

export interface Translation {
  [key: string]: {
    en: string;
    ta: string;
  };
}
