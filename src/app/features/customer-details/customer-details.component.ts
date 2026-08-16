import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { BankingService } from '../../core/services/banking.service';
import { MessageService } from 'primeng/api';
import { EgpCurrencyPipe } from '../../shared/pipes/egp-currency.pipe';
import { IbanFormatPipe } from '../../shared/pipes/iban-formatter.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, RouterModule, EgpCurrencyPipe, IbanFormatPipe, EmptyStateComponent],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})
export class CustomerDetailsComponent implements OnInit {
  bankingService = inject(BankingService);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private messageService = inject(MessageService);

  customer = this.bankingService.selectedCustomer;
  accounts = this.bankingService.selectedCustomerAccounts;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const cif = params.get('cif');
      if (cif) {
        this.bankingService.selectCustomer(cif);
      }
    });
  }



  goToTransactions(accountId: string): void {
    this.bankingService.selectAccount(accountId);
    this.router.navigate(['/accounts', accountId, 'transactions']);
  }

  createNewTransaction(accountId: string): void {
    this.bankingService.selectAccount(accountId);
    this.router.navigate(['/accounts', accountId, 'transactions'], {
      queryParams: { new: 'true' }
    });
  }
}
