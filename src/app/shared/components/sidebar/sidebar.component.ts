import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BankingService } from '../../../core/services/banking.service';
import { EgpCurrencyPipe } from '../../pipes/egp-currency.pipe';
import { IbanFormatPipe } from '../../pipes/iban-formatter.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  bankingService = inject(BankingService);


  isOpen = input<boolean>(false);
}
