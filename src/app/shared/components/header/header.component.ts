import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BankingService } from '../../../core/services/banking.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthService);
  bankingService = inject(BankingService);


  toggleSidebar = output<void>();

  onCustomerChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.bankingService.selectCustomer(target.value);
    }
  }
}
