import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { forkJoin, tap } from 'rxjs';
import { DataService } from './data.service';
import { MessageService } from 'primeng/api';
import { Customer } from '../models/customer.model';
import { Account } from '../models/account.model';
import {
  Transaction,
  TransactionType,
  TransactionTypeOption,
  TransactionFilter,
  TransactionSort
} from '../models/transaction.model';

const STORAGE_KEYS = {
  TRANSACTIONS: 'bank_transactions_v1',
  ACCOUNTS: 'bank_accounts_v1',
  SELECTED_CUSTOMER: 'bank_selected_cif',
  SELECTED_ACCOUNT: 'bank_selected_acc'
};

export interface MonthlyInsightData {
  month: string;
  totalDebit: number;
  totalCredit: number;
  netFlow: number;
  highestSpendingCategory: string;
  highestSpendingAmount: number;
  categoryBreakdown: { category: string; amount: number; percentage: number; count: number }[];
  transactionCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class BankingService {
  private dataService = inject(DataService);
  private messageService = inject(MessageService);

  readonly customers = signal<Customer[]>([]);
  readonly accounts = signal<Account[]>([]);
  readonly transactions = signal<Transaction[]>([]);
  readonly transactionTypes = signal<TransactionTypeOption[]>([]);
  readonly categories = signal<string[]>([]);

  readonly selectedCustomerId = signal<string | null>(this.getStoredValue(STORAGE_KEYS.SELECTED_CUSTOMER, 'C001'));
  readonly selectedAccountId = signal<string | null>(this.getStoredValue(STORAGE_KEYS.SELECTED_ACCOUNT, 'A1001'));

  readonly isLoading = signal<boolean>(false);
  readonly isInitialized = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly selectedCustomer = computed(() => {
    const cif = this.selectedCustomerId();
    return this.customers().find(c => c.CIF === cif) ?? this.customers()[0] ?? null;
  });

  readonly selectedCustomerAccounts = computed(() => {
    const cust = this.selectedCustomer();
    if (!cust) return [];
    return this.accounts().filter(a => a.customerId === cust.CIF);
  });

  readonly selectedAccount = computed(() => {
    const accId = this.selectedAccountId();
    const accounts = this.accounts();
    if (accId) {
      const found = accounts.find(a => a.id === accId);
      if (found) return found;
    }

    const custAccounts = this.selectedCustomerAccounts();
    return custAccounts[0] ?? accounts[0] ?? null;
  });

  readonly selectedAccountTransactions = computed(() => {
    const acc = this.selectedAccount();
    if (!acc) return [];
    return this.transactions()
      .filter(t => t.accountId === acc.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  readonly totalPortfolioBalance = computed(() => {
    return this.accounts().reduce((sum, acc) => sum + (acc.balance || 0), 0);
  });

  readonly customerPortfolioBalance = computed(() => {
    return this.selectedCustomerAccounts().reduce((sum, acc) => sum + (acc.balance || 0), 0);
  });

  constructor() {
    this.initData();

    effect(() => {
      const cif = this.selectedCustomerId();
      if (cif) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_CUSTOMER, cif);
      }
    });

    effect(() => {
      const accId = this.selectedAccountId();
      if (accId) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_ACCOUNT, accId);
      }
    });
  }

  initData(): void {
    if (this.isInitialized()) return;
    this.isLoading.set(true);

    forkJoin({
      customers: this.dataService.getCustomers(),
      accounts: this.dataService.getAccounts(),
      transactions: this.dataService.getTransactions(),
      types: this.dataService.getTransactionTypes(),
      categories: this.dataService.getTransactionCategories()
    }).subscribe({
      next: data => {
        this.customers.set(data.customers);
        this.transactionTypes.set(data.types);
        this.categories.set(data.categories);

        const storedAccounts = this.getStoredJson<Account[]>(STORAGE_KEYS.ACCOUNTS);
        if (storedAccounts && storedAccounts.length > 0) {
          this.accounts.set(storedAccounts);
        } else {
          this.accounts.set(data.accounts);
        }

        const storedTransactions = this.getStoredJson<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
        if (storedTransactions && storedTransactions.length > 0) {
          this.transactions.set(storedTransactions);
        } else {
          this.transactions.set(data.transactions);
        }

        if (!this.selectedCustomerId() && data.customers.length > 0) {
          this.selectedCustomerId.set(data.customers[0].CIF);
        }

        const validAccounts = this.selectedCustomerAccounts();
        if (!this.selectedAccountId() && validAccounts.length > 0) {
          this.selectedAccountId.set(validAccounts[0].id);
        }

        this.isLoading.set(false);
        this.isInitialized.set(true);
      },
      error: err => {
        console.error('Failed to initialize banking portal data', err);
        this.error.set('Failed to load banking data. Please reload.');
        this.isLoading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Data Loading Error', detail: 'Could not load banking records.' });
      }
    });
  }

  selectCustomer(cif: string): void {
    this.selectedCustomerId.set(cif);
    const custAccounts = this.accounts().filter(a => a.customerId === cif);
    if (custAccounts.length > 0) {
      this.selectedAccountId.set(custAccounts[0].id);
    }
  }

  selectAccount(accountId: string): void {
    const acc = this.accounts().find(a => a.id === accountId);
    if (acc) {
      this.selectedAccountId.set(accountId);
      this.selectedCustomerId.set(acc.customerId);
    }
  }

  createTransaction(input: {
    accountId: string;
    type: TransactionType;
    amount: number;
    date: string;
    merchant: string;
    category: string;
    description?: string;
  }): { success: boolean; transaction?: Transaction; error?: string } {
    const account = this.accounts().find(a => a.id === input.accountId);
    if (!account) {
      this.messageService.add({ severity: 'error', summary: 'Account Not Found', detail: `Account ${input.accountId} could not be located.` });
      return { success: false, error: 'Account not found' };
    }

    const amountNum = Number(input.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }

    if (input.type === 'Debit' && amountNum > account.balance) {
      const errorMsg = `Debit amount (EGP ${amountNum.toFixed(2)}) exceeds current account balance (EGP ${account.balance.toFixed(2)})`;
      this.messageService.add({ severity: 'error', summary: 'Insufficient Funds', detail: errorMsg });
      return { success: false, error: errorMsg };
    }

 
    let newBalance = account.balance;
    if (input.type === 'Debit') {
      newBalance = Number((account.balance - amountNum).toFixed(2));
    } else {
      newBalance = Number((account.balance + amountNum).toFixed(2));
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `T${Date.now().toString().slice(-4)}${randomSuffix.toString().slice(-2)}`;

    const newTransaction: Transaction = {
      id: newId,
      accountId: input.accountId,
      date: input.date,
      type: input.type,
      amount: amountNum,
      merchant: input.merchant.trim(),
      category: input.category,
      description: input.description?.trim(),
      balanceAfter: newBalance
    };

    const updatedAccounts = this.accounts().map(acc => {
      if (acc.id === input.accountId) {
        return { ...acc, balance: newBalance };
      }
      return acc;
    });


    const updatedTransactions = [newTransaction, ...this.transactions()];

    this.accounts.set(updatedAccounts);
    this.transactions.set(updatedTransactions);


    this.saveState(updatedAccounts, updatedTransactions);

    this.messageService.add({
      severity: 'success',
      summary: 'Transaction Recorded',
      detail: `Successfully processed ${input.type} of EGP ${amountNum.toLocaleString(undefined, { minimumFractionDigits: 2 })} for ${input.merchant}.`
    });

    return { success: true, transaction: newTransaction };
  }


  getMiniStatement(accountId: string, count = 5): Transaction[] {
    return this.transactions()
      .filter(t => t.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
  }


  getMonthlyInsights(accountId?: string, selectedMonth?: string): MonthlyInsightData {
    let txs = this.transactions();
    if (accountId) {
      txs = txs.filter(t => t.accountId === accountId);
    }


    let targetMonth = selectedMonth;
    if (!targetMonth) {
      if (txs.length > 0) {
        const sorted = [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        targetMonth = sorted[0].date.substring(0, 7); 
      } else {
        const now = new Date();
        targetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }
    }

    const monthTxs = txs.filter(t => t.date.startsWith(targetMonth!));

    let totalDebit = 0;
    let totalCredit = 0;
    const categoryDebits = new Map<string, { amount: number; count: number }>();

    for (const t of monthTxs) {
      if (t.type === 'Debit') {
        totalDebit += t.amount;
        const current = categoryDebits.get(t.category) || { amount: 0, count: 0 };
        categoryDebits.set(t.category, {
          amount: current.amount + t.amount,
          count: current.count + 1
        });
      } else if (t.type === 'Credit') {
        totalCredit += t.amount;
      }
    }

    totalDebit = Number(totalDebit.toFixed(2));
    totalCredit = Number(totalCredit.toFixed(2));
    const netFlow = Number((totalCredit - totalDebit).toFixed(2));


    const categoryBreakdown = Array.from(categoryDebits.entries())
      .map(([cat, data]) => ({
        category: cat,
        amount: Number(data.amount.toFixed(2)),
        percentage: totalDebit > 0 ? Number(((data.amount / totalDebit) * 100).toFixed(1)) : 0,
        count: data.count
      }))
      .sort((a, b) => b.amount - a.amount);

    const highest = categoryBreakdown[0];

    return {
      month: targetMonth,
      totalDebit,
      totalCredit,
      netFlow,
      highestSpendingCategory: highest ? highest.category : 'None',
      highestSpendingAmount: highest ? highest.amount : 0,
      categoryBreakdown,
      transactionCount: monthTxs.length
    };
  }

  filterAndSortTransactions(
    transactions: Transaction[],
    filter: TransactionFilter,
    sort: TransactionSort
  ): Transaction[] {
    let result = [...transactions];

    if (filter.type && filter.type !== 'All') {
      result = result.filter(t => t.type.toLowerCase() === filter.type!.toLowerCase());
    }


    if (filter.category && filter.category !== 'All' && filter.category !== '') {
      result = result.filter(t => t.category.toLowerCase() === filter.category!.toLowerCase());
    }


    if (filter.startDate) {
      const start = new Date(filter.startDate).getTime();
      result = result.filter(t => new Date(t.date).getTime() >= start);
    }

    if (filter.endDate) {
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(t => new Date(t.date).getTime() <= end.getTime());
    }


    if (filter.searchTerm && filter.searchTerm.trim()) {
      const term = filter.searchTerm.toLowerCase().trim();
      result = result.filter(
        t =>
          t.merchant.toLowerCase().includes(term) ||
          t.id.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term)
      );
    }


    result.sort((a, b) => {
      let comparison = 0;
      if (sort.field === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sort.field === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sort.field === 'merchant') {
        comparison = a.merchant.localeCompare(b.merchant);
      } else if (sort.field === 'category') {
        comparison = a.category.localeCompare(b.category);
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }


  resetToFactoryData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    this.dataService.clearCache();
    this.isInitialized.set(false);
    this.initData();
    this.messageService.add({ severity: 'info', summary: 'Mock Data Reset', detail: 'Portal state has been restored to factory mock data.' });
  }

  private saveState(accounts: Account[], transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Unable to persist banking state to localStorage', e);
    }
  }

  private getStoredValue(key: string, fallback: string): string {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  private getStoredJson<T>(key: string): T | null {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }
}
