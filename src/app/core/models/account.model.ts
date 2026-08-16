export type AccountType = 'Current' | 'Savings' | 'Fixed Deposit' | 'Loan';
export type AccountStatus = 'Active' | 'Dormant' | 'Suspended' | 'Closed';

export interface Account {
  id: string;
  customerId: string;
  type: AccountType;
  currency: string;
  balance: number;
  iban: string;
  status: AccountStatus;
}
