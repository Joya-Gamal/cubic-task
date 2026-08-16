import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'egpCurrency',
  standalone: true
})
export class EgpCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showSymbol = true): string {
    if (value === null || value === undefined || value === '') {
      return showSymbol ? 'EGP 0.00' : '0.00';
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) {
      return showSymbol ? 'EGP 0.00' : '0.00';
    }

    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return showSymbol ? `EGP ${formatted}` : formatted;
  }
}
