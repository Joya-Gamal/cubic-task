import { Component, inject, input, output, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BankingService } from '../../../core/services/banking.service';
import { Account } from '../../../core/models/account.model';
import { TransactionType } from '../../../core/models/transaction.model';
import { noFutureDateValidator } from '../../../shared/validators/no-future-date.validator';
import { maxDecimalsValidator } from '../../../shared/validators/max-decimals.validator';
import { amountRangeValidator } from '../../../shared/validators/amount-range.validator';
import { debitBalanceValidator } from '../../../shared/validators/debit-balance.validator';
import { EgpCurrencyPipe } from '../../../shared/pipes/egp-currency.pipe';
import { AmountInputDirective } from '../../../shared/directives/amount-input.directive';
import { AutoFocusDirective } from '../../../shared/directives/auto-focus.directive';

@Component({
  selector: 'app-transaction-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EgpCurrencyPipe,
    AmountInputDirective,
    AutoFocusDirective
  ],
  templateUrl: './transaction-create.component.html',
  styleUrl: './transaction-create.component.scss'
})
export class TransactionCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  bankingService = inject(BankingService);

  account = input<Account | undefined>(undefined);
  close = output<void>();
  created = output<void>();

  isSubmitting = signal<boolean>(false);
  todayString = new Date().toISOString().split('T')[0];

  form!: FormGroup;

  constructor() {
    effect(() => {
      const acc = this.account();
      if (acc && this.form) {
        this.form.setValidators([debitBalanceValidator(() => acc.balance)]);
        this.form.updateValueAndValidity();
      }
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    const currentBalance = this.account()?.balance ?? 0;

    this.form = this.fb.group(
      {
        type: ['Debit' as TransactionType, [Validators.required]],
        amount: [
          '',
          [
            Validators.required,
            amountRangeValidator(0.01, 100000),
            maxDecimalsValidator(2)
          ]
        ],
        date: [this.todayString, [Validators.required, noFutureDateValidator()]],
        merchant: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50)
          ]
        ],
        category: ['Groceries', [Validators.required]],
        description: ['']
      },
      {
        validators: [debitBalanceValidator(() => this.account()?.balance ?? 0)]
      }
    );
  }

  get projectedBalance(): number {
    const acc = this.account();
    if (!acc) return 0;
    const type = this.form?.get('type')?.value;
    const amountVal = Number(this.form?.get('amount')?.value);

    if (isNaN(amountVal) || amountVal <= 0) {
      return acc.balance;
    }

    if (type === 'Debit') {
      return Number((acc.balance - amountVal).toFixed(2));
    } else {
      return Number((acc.balance + amountVal).toFixed(2));
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form?.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onSubmit(): void {
    const acc = this.account();
    if (this.form.invalid || !acc) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.form.value;

    const result = this.bankingService.createTransaction({
      accountId: acc.id,
      type: formVal.type,
      amount: Number(formVal.amount),
      date: formVal.date,
      merchant: formVal.merchant,
      category: formVal.category,
      description: formVal.description
    });

    this.isSubmitting.set(false);

    if (result.success) {
      this.created.emit();
      this.close.emit();
    }
  }
}
