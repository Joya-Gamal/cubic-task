import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BankingService } from '../../../core/services/banking.service';
import { ExportService } from '../../../core/services/export.service';
import {
  Transaction,
  TransactionFilter,
  TransactionSort
} from '../../../core/models/transaction.model';
import { EgpCurrencyPipe } from '../../../shared/pipes/egp-currency.pipe';
import { IbanFormatPipe } from '../../../shared/pipes/iban-formatter.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TransactionCreateComponent } from '../transaction-create/transaction-create.component';
import { MiniStatementDialogComponent } from '../../../shared/components/mini-statement-dialog/mini-statement-dialog.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EgpCurrencyPipe,
    IbanFormatPipe,
    EmptyStateComponent,
    TransactionCreateComponent,
    MiniStatementDialogComponent
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss'
})
export class TransactionListComponent implements OnInit {
  bankingService = inject(BankingService);
  private exportService = inject(ExportService);
  private route = inject(ActivatedRoute);

  showCreateModal = signal<boolean>(false);
  showMiniStatementModal = signal<boolean>(false);

  searchTerm = signal<string>('');
  selectedType = signal<string>('All');
  selectedCategory = signal<string>('All');
  startDate = signal<string>('');
  endDate = signal<string>('');


  sortField = signal<'date' | 'amount' | 'merchant' | 'category'>('date');
  sortDirection = signal<'asc' | 'desc'>('desc');


  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  constructor() {

    effect(() => {
      this.searchTerm();
      this.selectedType();
      this.selectedCategory();
      this.startDate();
      this.endDate();
      this.sortField();
      this.sortDirection();
      this.currentPage.set(1);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const accId = params.get('id');
      if (accId) {
        this.bankingService.selectAccount(accId);
      }
    });

    this.route.queryParams.subscribe(qp => {
      if (qp['new'] === 'true') {
        this.showCreateModal.set(true);
      }
    });
  }


  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  selectAccount(accId: string): void {
    this.bankingService.selectAccount(accId);
    this.currentPage.set(1);
  }

  processedTransactions = computed(() => {
    const rawTxs = this.bankingService.selectedAccountTransactions();
    const filter: TransactionFilter = {
      searchTerm: this.searchTerm(),
      type: this.selectedType() as any,
      category: this.selectedCategory(),
      startDate: this.startDate(),
      endDate: this.endDate()
    };
    const sort: TransactionSort = {
      field: this.sortField(),
      direction: this.sortDirection()
    };

    return this.bankingService.filterAndSortTransactions(rawTxs, filter, sort);
  });

  totalPages = computed(() => {
    const total = this.processedTransactions().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  paginatedTransactions = computed(() => {
    const txs = this.processedTransactions();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return txs.slice(start, start + size);
  });

  setSort(field: 'date' | 'amount' | 'merchant' | 'category'): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  toggleSortDirection(): void {
    this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
  }

  getSortIcon(field: string): string {
    if (this.sortField() !== field) return 'pi-sort';
    return this.sortDirection() === 'asc' ? 'pi-sort-up-fill' : 'pi-sort-down-fill';
  }

  hasActiveFilters = computed(() => {
    return !!(
      this.searchTerm() ||
      (this.selectedType() && this.selectedType() !== 'All') ||
      (this.selectedCategory() && this.selectedCategory() !== 'All') ||
      this.startDate() ||
      this.endDate()
    );
  });

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set('All');
    this.selectedCategory.set('All');
    this.startDate.set('');
    this.endDate.set('');
    this.currentPage.set(1);
  }

  exportToCSV(): void {
    const acc = this.bankingService.selectedAccount();
    const txs = this.processedTransactions();
    this.exportService.exportTransactionsToCSV(txs, `transactions_${acc?.id || 'all'}`);
  }

  onTransactionCreated(): void {
    this.currentPage.set(1);
  }

  getTxBalanceAfter(tx: Transaction): number {
    if (tx.balanceAfter !== undefined) {
      return tx.balanceAfter;
    }
    return this.bankingService.selectedAccount()?.balance || 0;
  }
}
