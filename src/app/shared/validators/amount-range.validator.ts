import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function amountRangeValidator(min = 0.01, max = 100000): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    const val = Number(control.value);
    if (isNaN(val)) {
      return { invalidNumber: true };
    }

    if (val <= 0) {
      return {
        minAmount: {
          min: min,
          actual: val,
          message: 'Amount must be greater than 0'
        }
      };
    }

    if (val > max) {
      return {
        maxAmount: {
          max: max,
          actual: val,
          message: `Amount cannot exceed ${max.toLocaleString()} EGP`
        }
      };
    }

    return null;
  };
}
