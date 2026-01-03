import { Input } from '@angular/core';
import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appAlphabetOnly]',
})
export class AlphabetOnlyDirective {
  @Input() appAlphabetOnly: boolean = true;

  lastKey: string | undefined;

  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    if (this.appAlphabetOnly) {
      const allowedKeys = ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'Period'];
      if (!allowedKeys.includes(event.key) && !/^[a-zA-Z. ]*$/.test(event.key)) {
        event.preventDefault();
      } else if (event.key === ' ' && this.lastKey === ' ') {
        event.preventDefault(); // Prevent input of consecutive spaces
      }
      this.lastKey = event.key;
    }
  }
}
