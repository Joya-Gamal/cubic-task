import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ibanFormat',
  standalone: true
})
export class IbanFormatPipe implements PipeTransform {
  transform(iban: string | null | undefined, mask = false): string {
    if (!iban) return '';
    const cleaned = iban.replace(/\s+/g, '');

    if (mask && cleaned.length >= 10) {
      const visibleStart = cleaned.substring(0, 4);
      const visibleEnd = cleaned.substring(cleaned.length - 4);
      const maskedLength = cleaned.length - 8;
      const maskedPart = '•'.repeat(maskedLength);
      const fullMasked = `${visibleStart}${maskedPart}${visibleEnd}`;
      return fullMasked.match(/.{1,4}/g)?.join(' ') || fullMasked;
    }

    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  }
}
