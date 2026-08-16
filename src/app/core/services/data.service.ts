import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, of } from 'rxjs';
import { Customer } from '../models/customer.model';
import { Account } from '../models/account.model';
import { Transaction, TransactionType, TransactionTypeOption } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);

  private customersCache$?: Observable<Customer[]>;
  private accountsCache$?: Observable<Account[]>;
  private transactionsCache$?: Observable<Transaction[]>;
  private typesCache$?: Observable<TransactionTypeOption[]>;
  private categoriesCache$?: Observable<string[]>;

  private basePath = 'assets/mock';


  getCustomers(): Observable<Customer[]> {
    if (!this.customersCache$) {
      this.customersCache$ = this.http.get<Customer[]>(`${this.basePath}/customers.json`).pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(this.handleError<Customer[]>('getCustomers', []))
      );
    }
    return this.customersCache$;
  }

  getAccounts(): Observable<Account[]> {
    if (!this.accountsCache$) {
      this.accountsCache$ = this.http.get<Account[]>(`${this.basePath}/accounts.json`).pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(this.handleError<Account[]>('getAccounts', []))
      );
    }
    return this.accountsCache$;
  }

  getTransactions(): Observable<Transaction[]> {
    if (!this.transactionsCache$) {
      this.transactionsCache$ = this.http.get<Transaction[]>(`${this.basePath}/transactions.json`).pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(this.handleError<Transaction[]>('getTransactions', []))
      );
    }
    return this.transactionsCache$;
  }

  getTransactionTypes(): Observable<TransactionTypeOption[]> {
    if (!this.typesCache$) {
      const defaultTypes: TransactionTypeOption[] = [
        { code: 'Debit' as TransactionType, label: 'Debit' },
        { code: 'Credit' as TransactionType, label: 'Credit' }
      ];

      this.typesCache$ = this.http.get<TransactionTypeOption[]>(`${this.basePath}/transaction-types.json`).pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(this.handleError<TransactionTypeOption[]>('getTransactionTypes', defaultTypes))
      );
    }
    return this.typesCache$;
  }


  getTransactionCategories(): Observable<string[]> {
    if (!this.categoriesCache$) {
      const defaultCategories: string[] = [
        'Groceries', 'Bills', 'Shopping', 'Transfer', 'Income', 'Fees', 'Entertainment'
      ];

      this.categoriesCache$ = this.http.get<string[]>(`${this.basePath}/transaction-categories.json`).pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(this.handleError<string[]>('getTransactionCategories', defaultCategories))
      );
    }
    return this.categoriesCache$;
  }


  clearCache(): void {
    this.customersCache$ = undefined;
    this.accountsCache$ = undefined;
    this.transactionsCache$ = undefined;
    this.typesCache$ = undefined;
    this.categoriesCache$ = undefined;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`DataService [${operation}] failed:`, error);
      return of(result as T);
    };
  }
}
