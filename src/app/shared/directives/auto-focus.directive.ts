import { Directive, ElementRef, inject, afterNextRender, input, booleanAttribute } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective {
  private el = inject(ElementRef<HTMLElement>);

  appAutoFocus = input(true, { transform: booleanAttribute });

  constructor() {
    afterNextRender(() => {
      if (this.appAutoFocus()) {
        setTimeout(() => {
          this.el.nativeElement.focus();
        }, 50);
      }
    });
  }
}
