import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../../core/services/banking.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EgpCurrencyPipe } from '../../shared/pipes/egp-currency.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCardComponent, EgpCurrencyPipe, EmptyStateComponent],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss'
})
export class InsightsComponent {
  bankingService = inject(BankingService);

  selectedAccountFilter = signal<string>('ALL');
  selectedUser = signal<string>(
    localStorage.getItem('bank_selected_cif') ?? ''
  );
  selectedMonth = signal<string>('2025-12');

  availableMonths = signal([
    { value: '2025-12', label: 'December 2025' },
    { value: '2026-01', label: 'January 2026' },
    { value: '2026-02', label: 'February 2026' }
  ]);

  insightsData = computed(() => {
    const accFilter = this.selectedAccountFilter();
    const targetAcc = accFilter === 'ALL' ? undefined : accFilter;
    return this.bankingService.getMonthlyInsights(targetAcc, this.selectedMonth());
  });

  getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      Groceries: '#10b981',
      Bills: '#f59e0b',
      Shopping: '#3b82f6',
      Transfer: '#8b5cf6',
      Entertainment: '#ec4899',
      Fees: '#ef4444',
      Income: '#059669'
    };
    return colorMap[category] || '#64748b';
  }
}
