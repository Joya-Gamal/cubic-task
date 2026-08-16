import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function maxDecimalsValidator(maxDecimals = 2): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    const valueStr = control.value.toString().trim();
    if (!/^-?\d+(\.\d+)?$/.test(valueStr)) {
      return null; 
    }

    const parts = valueStr.split('.');
    if (parts.length === 2 && parts[1].length > maxDecimals) {
      return {
        maxDecimals: {
          max: maxDecimals,
          actual: parts[1].length,
          message: `Maximum ${maxDecimals} decimal places allowed`
        }
      };
    }

    return null;
  };
}
