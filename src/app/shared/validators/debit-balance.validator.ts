import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function debitBalanceValidator(getBalance: () => number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const typeControl = control.get('type');
    const amountControl = control.get('amount');

    if (!typeControl || !amountControl) {
      return null;
    }

    const type = typeControl.value;
    const amount = Number(amountControl.value);
    const balance = getBalance();

    if (type === 'Debit' && !isNaN(amount) && amount > 0 && amount > balance) {
      const error = {
        debitExceedsBalance: {
          currentBalance: balance,
          attemptedAmount: amount,
          excess: Number((amount - balance).toFixed(2)),
          message: `Debit amount (${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} EGP) exceeds available balance (${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} EGP)`
        }
      };

      const currentControlErrors = amountControl.errors;
      if (!currentControlErrors?.['debitExceedsBalance']) {
        amountControl.setErrors({
          ...currentControlErrors,
          ...error
        });
      }

      return error;
    } else {
      if (amountControl.errors && amountControl.errors['debitExceedsBalance']) {
        const { debitExceedsBalance, ...remainingErrors } = amountControl.errors;
        amountControl.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
      }
    }

    return null;
  };
}
