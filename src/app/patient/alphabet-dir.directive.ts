import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appAlphabetDir]',
  standalone: true
})
export class AlphabetDirDirective {



  lastKey: string | undefined;

  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    const allowedKeys = ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'Period'];
    if (!allowedKeys.includes(event.key) && !/^[a-zA-Z. ]*$/.test(event.key)) {
      event.preventDefault();
    } else if (event.key === ' ' && this.lastKey === ' ') {
      event.preventDefault(); // Prevent input of consecutive spaces
    }
    this.lastKey = event.key;
  }

}
