export type TransactionType = 'Debit' | 'Credit';

export interface TransactionTypeOption {
  code: TransactionType;
  label: string;
}

export type TransactionCategory =
  | 'Groceries'
  | 'Bills'
  | 'Shopping'
  | 'Transfer'
  | 'Income'
  | 'Fees'
  | 'Entertainment'
  | string;

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  type: TransactionType;
  amount: number;
  merchant: string;
  category: TransactionCategory;
  description?: string;
  balanceAfter?: number;
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  type?: 'All' | 'Debit' | 'Credit' | '';
  category?: string;
  searchTerm?: string;
}

export interface TransactionSort {
  field: 'date' | 'amount' | 'merchant' | 'category';
  direction: 'asc' | 'desc';
}
