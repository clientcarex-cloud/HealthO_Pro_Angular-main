import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import * as Util from '@sharedcommon/base/utils';

@Directive({
    selector: '[allowNumbersOnly]'
})

export class AllowNumbersOnlyDirective {
    @Input() enableAllowNumbersOnly: boolean = false;

    constructor(private el: ElementRef) {
    }

    @HostListener('input', ['$event']) onInputChange(event: any) {
        if (!this.enableAllowNumbersOnly) {
            return;
        }

        const initalValue = this.el.nativeElement.value;
        if (initalValue) {
            this.el.nativeElement.value = Util.keepOnlyNumbers(initalValue);
        }

        if (initalValue !== this.el.nativeElement.value) {
            event.stopPropagation();
        }
    }
}