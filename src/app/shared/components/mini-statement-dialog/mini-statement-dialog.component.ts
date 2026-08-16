import { Component, input, output, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Account } from '../../../core/models/account.model';
import { BankingService } from '../../../core/services/banking.service';
import { ExportService } from '../../../core/services/export.service';
import { EgpCurrencyPipe } from '../../pipes/egp-currency.pipe';
import { IbanFormatPipe } from '../../pipes/iban-formatter.pipe';

@Component({
  selector: 'app-mini-statement-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, EgpCurrencyPipe, IbanFormatPipe],
  templateUrl: './mini-statement-dialog.component.html',
  styleUrl: './mini-statement-dialog.component.scss'
})
export class MiniStatementDialogComponent {
  bankingService = inject(BankingService);
  private exportService = inject(ExportService);


  account = input<Account | undefined>(undefined);
  close = output<void>();

  itemCount = signal<number>(5);

  customerName = computed(() => {
    return this.bankingService.selectedCustomer()?.name || 'Customer';
  });

  statementTransactions = computed(() => {
    const acc = this.account();
    if (!acc) return [];
    return this.bankingService.getMiniStatement(acc.id, this.itemCount());
  });

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  exportStatement(): void {
    const acc = this.account();
    if (acc) {
      this.exportService.exportTransactionsToCSV(
        this.statementTransactions(),
        `mini_statement_${acc.id}`
      );
    }
  }
}
