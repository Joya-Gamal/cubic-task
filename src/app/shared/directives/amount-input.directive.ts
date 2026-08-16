import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

@Directive({
  selector: '[appAmountInput]',
  standalone: true
})
export class AmountInputDirective {
  private el = inject(ElementRef<HTMLInputElement>);

  maxDecimals = input<number>(2);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];

    if (
      allowedKeys.includes(event.key) ||
      (event.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) ||
      (event.metaKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase()))
    ) {
      return;
    }

    const input = this.el.nativeElement;
    const currentValue = input.value;
    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? 0;


    if (event.key === '.') {
      if (currentValue.includes('.')) {
        event.preventDefault();
      }
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }


    const futureValue =
      currentValue.substring(0, selectionStart) +
      event.key +
      currentValue.substring(selectionEnd);

    const parts = futureValue.split('.');
    if (parts.length === 2 && parts[1].length > this.maxDecimals()) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedText = clipboardData.getData('text');
    if (!/^\d+(\.\d{1,2})?$/.test(pastedText)) {
      event.preventDefault();
    }
  }
}
