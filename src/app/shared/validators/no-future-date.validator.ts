import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);
    if (isNaN(inputDate.getTime())) {
      return { invalidDate: true };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (inputDate.getTime() > today.getTime()) {
      return {
        futureDate: {
          value: control.value,
          message: 'Transaction date cannot be in the future'
        }
      };
    }

    return null;
  };
}
