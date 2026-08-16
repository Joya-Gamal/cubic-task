import { Injectable, inject } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private messageService = inject(MessageService);


  exportTransactionsToCSV(transactions: Transaction[], filenamePrefix = 'transactions'): void {
    if (!transactions || transactions.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Export Warning', detail: 'No transactions to export.' });
      return;
    }

    const headers = [
      'Transaction ID',
      'Account ID',
      'Date',
      'Type',
      'Amount (EGP)',
      'Merchant',
      'Category',
      'Description',
      'Balance After (EGP)'
    ];

    const rows = transactions.map(t => [
      t.id,
      t.accountId,
      t.date,
      t.type,
      t.amount.toFixed(2),
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.balanceAfter !== undefined ? t.balanceAfter.toFixed(2) : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${filenamePrefix}_${timestamp}.csv`;

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.setAttribute('download', fileName);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Export Complete',
      detail: `Successfully exported ${transactions.length} transactions to ${fileName}`
    });
  }
}
