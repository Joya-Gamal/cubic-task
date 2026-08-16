import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BankingService } from '../../core/services/banking.service';
import { Customer } from '../../core/models/customer.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { EgpCurrencyPipe } from '../../shared/pipes/egp-currency.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  bankingService = inject(BankingService);
  private router = inject(Router);

  // Modern Signal State
  searchQuery = signal<string>('');

  filteredCustomers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list: Customer[] = this.bankingService.customers();
    if (!q) return list;

    return list.filter(
      (c: Customer) =>
        c.name.toLowerCase().includes(q) ||
        c.CIF.toLowerCase().includes(q) ||
        c.nationalId.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.segment.toLowerCase().includes(q)
    );
  });

  getCustomerAccountsCount(cif: string): number {
    return this.bankingService.accounts().filter(a => a.customerId === cif).length;
  }

  viewCustomerDetails(cif: string): void {
    this.bankingService.selectCustomer(cif);
    this.router.navigate(['/customers', cif]);
  }
}
